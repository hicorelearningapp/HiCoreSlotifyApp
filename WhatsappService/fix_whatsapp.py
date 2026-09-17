import os
import re

directory = r"e:\Github\HiCoreSlotifyApp\WhatsappService\industries\healthcare\workflows"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    def replacer(match):
        full_match = match.group(0)
        if "business_phone_id=" in full_match:
            return full_match
        
        last_paren_index = full_match.rfind(')')
        if last_paren_index != -1:
            before = full_match[:last_paren_index]
            after = full_match[last_paren_index:]
            if not before.strip().endswith('(') and not before.strip().endswith(','):
                return before + ", business_phone_id=session.state.BusinessPhoneNumberId" + after
            else:
                return before + "business_phone_id=session.state.BusinessPhoneNumberId" + after
        return full_match

    # A regex to match WhatsAppService.send_[a-z_]+\( [^)]+ \)
    # We use a non-greedy match inside the parenthesis but it might fail on nested parenthesis.
    # Luckily there are no nested parenthesis in these calls except maybe .get() which is safe if we don't overcomplicate.
    # Actually `[^)]+` will fail on `doctor.get("MobileNumber")` because it contains `)`.
    # So we use a better regex: match until the last closing parenthesis that balances.
    
    # Let's just do it simpler: find WhatsAppService.send_ and replace.
    # It's easier to use a python script that does a simple string replace for the specific known lines.
    pass

# We will just write a simpler script that just patches the exact files
fixes = [
    (r"industries\healthcare\workflows\customer\confirm_booking_workflow.py",
     'WhatsAppService.send_text(doctor.get("MobileNumber"), doc_msg)',
     'WhatsAppService.send_text(doctor.get("MobileNumber"), doc_msg, business_phone_id=session.state.BusinessPhoneNumberId)'),
     
    (r"industries\healthcare\workflows\customer\main_menu_workflow.py",
     'WhatsAppService.send_interactive_buttons(\n            phone=session.PhoneNumber,\n            text=text,\n            buttons=buttons\n        )',
     'WhatsAppService.send_interactive_buttons(\n            phone=session.PhoneNumber,\n            text=text,\n            buttons=buttons,\n            business_phone_id=session.state.BusinessPhoneNumberId\n        )'),
     
    (r"industries\healthcare\workflows\customer\main_menu_workflow.py",
     'WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.")',
     'WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.", business_phone_id=session.state.BusinessPhoneNumberId)'),
     
    (r"industries\healthcare\workflows\customer\select_appointment_to_cancel_workflow.py",
     'WhatsAppService.send_text(session.PhoneNumber, "Please select an appointment from the list menu.")',
     'WhatsAppService.send_text(session.PhoneNumber, "Please select an appointment from the list menu.", business_phone_id=session.state.BusinessPhoneNumberId)'),
     
    (r"industries\healthcare\workflows\customer\select_consultation_workflow.py",
     'WhatsAppService.send_text(session.PhoneNumber, "Please select a valid consultation type.")',
     'WhatsAppService.send_text(session.PhoneNumber, "Please select a valid consultation type.", business_phone_id=session.state.BusinessPhoneNumberId)'),
     
    (r"industries\healthcare\workflows\customer\select_date_workflow.py",
     'WhatsAppService.send_text(\n                    session.PhoneNumber, "That date is in the past. Please select a future date (YYYY-MM-DD):"\n                )',
     'WhatsAppService.send_text(\n                    session.PhoneNumber, "That date is in the past. Please select a future date (YYYY-MM-DD):", business_phone_id=session.state.BusinessPhoneNumberId\n                )'),
     
    (r"industries\healthcare\workflows\customer\select_date_workflow.py",
     'WhatsAppService.send_text(\n                    session.PhoneNumber,\n                    f"No slots available for {target_date}. Please select another date (YYYY-MM-DD):",\n                )',
     'WhatsAppService.send_text(\n                    session.PhoneNumber,\n                    f"No slots available for {target_date}. Please select another date (YYYY-MM-DD):",\n                    business_phone_id=session.state.BusinessPhoneNumberId\n                )'),
     
    (r"industries\healthcare\workflows\customer\select_date_workflow.py",
     'WhatsAppService.send_text(\n                session.PhoneNumber, "Invalid date format. Please use YYYY-MM-DD."\n            )',
     'WhatsAppService.send_text(\n                session.PhoneNumber, "Invalid date format. Please use YYYY-MM-DD.", business_phone_id=session.state.BusinessPhoneNumberId\n            )'),
     
    (r"industries\healthcare\workflows\customer\select_patient_workflow.py",
     'WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.")',
     'WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.", business_phone_id=session.state.BusinessPhoneNumberId)'),
     
    (r"industries\healthcare\workflows\customer\select_time_slot_workflow.py",
     'WhatsAppService.send_text(session.PhoneNumber, "Invalid slot. Please select from the menu.")',
     'WhatsAppService.send_text(session.PhoneNumber, "Invalid slot. Please select from the menu.", business_phone_id=session.state.BusinessPhoneNumberId)'),
     
    (r"industries\healthcare\workflows\doctor\doctor_cancel_appointment_workflow.py",
     'WhatsAppService.send_text(appointment.get("patient", {}).get("PhoneNumber"), patient_msg)',
     'WhatsAppService.send_text(appointment.get("patient", {}).get("PhoneNumber"), patient_msg, business_phone_id=session.state.BusinessPhoneNumberId)'),
     
    (r"industries\healthcare\workflows\doctor\doctor_menu_workflow.py",
     'WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.")',
     'WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.", business_phone_id=session.state.BusinessPhoneNumberId)'),
     
    (r"industries\healthcare\workflows\doctor\doctor_refund_workflow.py",
     'WhatsAppService.send_text(patient_phone, patient_msg)',
     'WhatsAppService.send_text(patient_phone, patient_msg, business_phone_id=session.state.BusinessPhoneNumberId)')
]

base_dir = r"e:\Github\HiCoreSlotifyApp\WhatsappService"

for rel_path, old_str, new_str in fixes:
    full_path = os.path.join(base_dir, rel_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if old_str in content:
            content = content.replace(old_str, new_str)
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {rel_path}")
        else:
            print(f"Could not find exact string in {rel_path}")
    else:
        print(f"File not found: {rel_path}")
