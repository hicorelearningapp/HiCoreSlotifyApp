from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService
import io
from core.channels.whatsapp.services.whatsapp_service import whatsapp
from datetime import date, datetime, timedelta

class DoctorViewScheduleWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        reply = Reply(
            message_type="buttons",
            text="📅 Which day's schedule would you like to view?",
            options=[
                {"id": "SCHED_TODAY", "title": "Today"},
                {"id": "SCHED_TOMORROW", "title": "Tomorrow"},
                {"id": "SCHED_OTHER", "title": "Other Date"}
            ]
        )
        session.WorkflowData["sched_step"] = "select_day"
        return WorkflowResult.waiting(reply=reply)

    def Process(self, session: ConversationSession, message: Message):
        step = session.WorkflowData.get("sched_step")
        doctor_id = session.WorkflowData.get("doctor_id")
        appt_service = AppointmentService()

        # STEP 1: Handle Day Selection
        if step == "select_day":
            target_date = None
            if message.InteractiveId == "SCHED_TODAY":
                target_date = date.today()
            elif message.InteractiveId == "SCHED_TOMORROW":
                target_date = date.today() + timedelta(days=1)
            elif message.InteractiveId == "SCHED_OTHER":
                appointments = appt_service.list_appointments(doctor_id=doctor_id, limit=100)
                # Only show dates after tomorrow
                appointments = [a for a in appointments if a.Date > date.today() + timedelta(days=1)]
                
                unique_dates = sorted(list(set(appt.Date for appt in appointments)))
                
                if not unique_dates:
                    return WorkflowResult.finished(reply=Reply("text", "You have no upcoming appointments beyond tomorrow."))
                    
                rows = []
                for idx, dt in enumerate(unique_dates[:7]):
                    rows.append({
                        "id": f"SCHED_DATE_{dt.strftime('%Y-%m-%d')}",
                        "title": dt.strftime("%b %d, %Y"),
                        "description": ""
                    })
                    
                session.WorkflowData["sched_step"] = "awaiting_date"
                return WorkflowResult.waiting(
                    reply=Reply(
                        message_type="list",
                        text="Please select a date from your upcoming appointments:",
                        sections=[{"title": "Upcoming Dates", "rows": rows}]
                    )
                )
            
            if target_date:
                return self._show_schedule(session, doctor_id, target_date, appt_service)

        # STEP 2: Handle Date Selection from List
        elif step == "awaiting_date":
            if message.InteractiveId and message.InteractiveId.startswith("SCHED_DATE_"):
                date_str = message.InteractiveId.replace("SCHED_DATE_", "")
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                return self._show_schedule(session, doctor_id, target_date, appt_service)
            else:
                return WorkflowResult.waiting(reply=Reply("text", "Please select a date from the list menu."))

        # STEP 3: Handle Appointment Selection (for details)
        elif step == "viewing_list":
            if message.InteractiveId == "GET_EXCEL":
                return self._send_excel(session, doctor_id, appt_service)
            return WorkflowResult.finished(reply=Reply("text", "Exiting schedule view. Type 'hi' to start over."))

        return WorkflowResult.waiting()

    def _show_schedule(self, session, doctor_id, target_date, appt_service):
        appointments = appt_service.get_doctor_appointments_by_date(doctor_id, target_date)
        
        if not appointments:
            return WorkflowResult.finished(reply=Reply("text", f"You have no appointments scheduled for {target_date.strftime('%b %d, %Y')}. 🎉\n\nType 'hi' to return to menu."))

        msg = f"📅 *Schedule for {target_date.strftime('%b %d, %Y')}*\n\n"
        for idx, appt in enumerate(appointments, 1):
            cust_name = appt.patient.Name if appt.patient else "Unknown Patient"
            phone = appt.patient.PhoneNumber if appt.patient else "N/A"
            time_str = appt.SlotTime.strftime("%I:%M %p")
            type_str = "💻 Video" if appt.ConsultationType == "Video" else "🏥 Clinic"
            msg += f"*{idx}. {time_str}* - {cust_name} ({phone}) [{type_str}]\n"
            if appt.ConsultationType == "Video" and getattr(appt, 'MeetingLink', None):
                msg += f"  🔗 Link: {appt.MeetingLink}\n"
                if appt.doctor and getattr(appt.doctor, 'EmailAddress', None):
                    msg += f"  📧 *(Join using this email: {appt.doctor.EmailAddress})*\n"
            
        msg += "\nClick below to download this schedule as an Excel file, or type 'hi' to return to the main menu."
        
        session.WorkflowData["sched_step"] = "viewing_list"
        session.WorkflowData["target_date"] = target_date.isoformat()
        
        reply = Reply(
            message_type="buttons",
            text=msg,
            options=[{"id": "GET_EXCEL", "title": "📥 Get Excel"}]
        )
        return WorkflowResult.waiting(reply=reply)

    def _send_excel(self, session, doctor_id, appt_service):
        try:
            import openpyxl
        except ImportError:
            return WorkflowResult.finished(reply=Reply("text", "Excel export is not available (openpyxl is not installed)."))
            
        
        target_date_str = session.WorkflowData.get("target_date")
        if not target_date_str:
            return WorkflowResult.finished(reply=Reply("text", "Error: Date not found."))
            
        target_date = datetime.fromisoformat(target_date_str).date()
        appointments = appt_service.get_doctor_appointments_by_date(doctor_id, target_date)
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"Schedule {target_date.strftime('%b %d')}"
        
        ws.append(["Time", "Patient Name", "Phone Number", "Type"])
        
        for appt in appointments:
            cust_name = appt.patient.Name if appt.patient else "Unknown Patient"
            phone = appt.patient.PhoneNumber if appt.patient else "N/A"
            time_str = appt.SlotTime.strftime("%I:%M %p")
            type_str = appt.ConsultationType or "Clinic"
            ws.append([time_str, cust_name, phone, type_str])
            
        excel_buffer = io.BytesIO()
        wb.save(excel_buffer)
        excel_bytes = excel_buffer.getvalue()
        
        filename = f"Schedule_{target_date.strftime('%Y_%m_%d')}.xlsx"
        mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        
        media_id = whatsapp.upload_media(excel_bytes, filename, mime_type)
        if media_id:
            whatsapp.send_document(session.PhoneNumber, media_id=media_id, filename=filename, caption=f"Here is your schedule for {target_date.strftime('%b %d, %Y')}")
            return WorkflowResult.finished()
        else:
            return WorkflowResult.finished(reply=Reply("text", "Failed to generate Excel file (media upload error). Note: This only works with a live WhatsApp API connection."))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
