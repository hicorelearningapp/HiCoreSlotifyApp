import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

// Import each icon separately as an image file
import AddIcon from '../../../assets/DoctorDashboard/AddIcon.png';
import SearchIcon from '../../../assets/DoctorDashboard/SearchIcon.png';
import CalendarCheckIcon from '../../../assets/DoctorDashboard/CalendarCheckIcon.png';
import CompletedIcon from '../../../assets/DoctorDashboard/CompletedIcon.png';
import WaitingIcon from '../../../assets/DoctorDashboard/WaitingIcon.png';
import CancelledIcon from '../../../assets/DoctorDashboard/CancelledIcon.png';
import ChevronDownIcon from '../../../assets/DoctorDashboard/ChevronDownIcon.png';
import FilterCalendarIcon from '../../../assets/DoctorDashboard/FilterCalendarIcon.png';
// import editIcon from '../../../assets/DoctorDashboard/prescriptions.png';
// import viewIcon from '../../../assets/DoctorDashboard/View.png';

// ✅ Declare only once
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// ✅ Single source of truth for the doctor reference used across every API call.
// Only doctorId is used to identify the request — no auth token is sent.
const getDoctorId = () => {
  const doctorId = localStorage.getItem("doctorId");
  console.log("[Auth] doctorId from localStorage:", doctorId);
  return doctorId;
};

// Converts a backend date value into the format required by <input type="date">.
// This helper is used by the prescription modal when it is opened from an appointment.
const toInputDate = (value) => {
  if (!value || value === '-') return '';

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Maps the UI's Today/Weekly/Monthly toggle to the backend's filter_type
// query param values ('today' | 'weekly' | 'monthly').
const mapFilterType = (uiFilter) => {
  switch (uiFilter) {
    case 'Today':
      return 'today';
    case 'Weekly':
      return 'weekly';
    case 'Monthly':
      return 'monthly';
    default:
      return null;
  }
};

// Maps the UI's status dropdown values to the backend's status enum
// (Booked, Confirmed, Completed, Cancelled, Rescheduled, NoShow).
// The UI shows "No Show" with a space — the backend expects "NoShow".
// Shared by the top filter bar AND the expanded-row Save Changes PATCH,
// so both stay consistent with the same enum values.
const mapStatusToBackend = (uiStatus) => {
  if (!uiStatus || uiStatus === 'Select Status') return null;
  if (uiStatus === 'No Show') return 'NoShow';
  return uiStatus;
};

// Consultation type names can be returned by the backend with or without spaces
// (for example, "VideoConsultation" vs "Video Consultation"). This helper keeps
// the client-side type filter working with either representation.
const normalizeConsultationType = (value) =>
  String(value || '')
    .replace(/\s+/g, '')
    .toLowerCase();

// Keep the existing UI labels while storing the exact backend Name values.
const formatStatusLabel = (value) => {
  if (value === 'NoShow') return 'No Show';
  if (value === 'NotAvailable') return 'Not Available';
  return value;
};

const formatConsultationTypeLabel = (value) => {
  if (value === 'VideoConsultation') return 'Video Consultation';
  if (value === 'SecondOpinion') return 'Second Opinion';
  return value;
};

// API list responses can be either a bare array or wrapped in a data/property.
const extractLookupItems = (data, possibleKeys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of possibleKeys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

// ✅ Shared mapper so the list view (GET /appointments?doctor_id=...) and the
// single-record view (GET /appointments/{appointment_id}) always produce the
// exact same shape for the rest of the UI to consume.
const formatAppointment = (item) => {
  const patientObj = item.patient || {};
  const paymentObj = Array.isArray(item.payments) && item.payments.length > 0 ? item.payments[0] : {};

  return {
    // IMPORTANT: this is the APPOINTMENT ID, not the Doctor ID.
    // It must come from the appointment record returned by the backend.
    id: item.Id,
    doctorId: item.DoctorId || item.doctorId || item.Doctor?.Id || item.doctor?.Id || null,
    date: item.Date || '-',
    startTime: item.SlotStartTime || '-',
    endTime: item.SlotEndTime || '-',
    name: item.PatientName || patientObj.PatientName || patientObj.Name || 'Unknown',
    phone: patientObj.PhoneNumber ? `+${patientObj.PhoneNumber}` : (item.PhoneNumber ? `+${item.PhoneNumber}` : '-'),
    // Patient details are kept here so the prescription form can be opened
    // directly from the appointment table without changing the backend.
    patientId: item.PatientId || patientObj.PatientId || patientObj.Id || patientObj.id || '',
    age: patientObj.Age ?? item.Age ?? '',
    bloodGroup: patientObj.BloodGroup || item.BloodGroup || '',
    gender: patientObj.Gender || item.Gender || '',
    height: patientObj.Height || item.Height || '',
    weight: patientObj.Weight || item.Weight || '',
    email: patientObj.EmailAddress || patientObj.Email || item.MailId || item.EmailAddress || item.Email || '',
    dateOfBirth: patientObj.DateOfBirth || item.DateOfBirth || '',
    // Aliases used by the prescription form.
    mobile: patientObj.PhoneNumber ? `+${patientObj.PhoneNumber}` : (item.PhoneNumber ? `+${item.PhoneNumber}` : ''),
    nextReview: item.NextFollowUpDate || item.NextReview || patientObj.NextFollowUpDate || patientObj.NextReview || '',
    status: item.Status || 'Booked',
    statusColor:
      (item.Status === 'Completed') ? 'text-[#008000]' :
      (item.Status === 'Cancelled') ? 'text-[#FF0000]' :
      (item.Status === 'Waiting') ? 'text-[#DEB821]' : 'text-[#1C71DA]',
    type: item.ConsultationType,
    // Payment ID comes from the nested payments[] object.
    // This ID is required by PATCH /payments/{payment_id}/status.
    paymentId: paymentObj.Id || paymentObj.id || null,
    paymentStatus: paymentObj.Status || 'Pending',
    fee: paymentObj.Payment ?? item.doctor?.ClinicConsultationFee ?? '300',
    reason: item.ReMarks,
    upiRef: item.MeetingLink || '-'
  };
};

// --- SUB-COMPONENT FOR THE EXPANDED DETAILS BOX ---
const ExpandedDetails = ({ appointment, onUpdateSuccess, onPrescription, onViewPatient }) => {
  const [innerStatusOpen, setInnerStatusOpen] = useState(false);
  const [innerTypeOpen, setInnerTypeOpen] = useState(false);
  const [innerPaymentStatusOpen, setInnerPaymentStatusOpen] = useState(false);

  const [selectedInnerStatus, setSelectedInnerStatus] = useState(
    appointment.status || "Select Status"
  );
  const [selectedInnerType, setSelectedInnerType] = useState(
    appointment.type || "Select Type"
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    appointment.paymentStatus || "Pending"
  );
  const [reason, setReason] = useState(appointment.reason || "");
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    "Available",
    "Booked",
    "Completed",
    "Confirmed",
    "Cancelled",
    "No Show",
  ];

  const typeOptions = [
    "Clinic",
    "Video Consultation",
    "Second Opinion",
  ];

  // Backend payment status accepts only these two values.
  const paymentStatusOptions = [
    "Paid",
    "Pending",
  ];

  // Save appointment status/reason through:
  // PATCH /appointments/{appointment_id}/status
  //
  // Save payment status through:
  // PATCH /payments/{payment_id}/status
  //
  // payment_id is taken from appointment.payments[0].Id returned by
  // GET /appointments?doctor_id=... or GET /appointments/{appointment_id}.
  const handleSaveChanges = async () => {
    setUpdating(true);

    try {
      const doctorId = getDoctorId();
      const appointmentId = appointment?.id;
      const paymentId = appointment?.paymentId;
      const currentPaymentStatus = appointment?.paymentStatus || "Pending";

      console.log("[handleSaveChanges] Logged-in Doctor ID:", doctorId);
      console.log("[handleSaveChanges] Appointment ID:", appointmentId);
      console.log("[handleSaveChanges] Payment ID:", paymentId);
      console.log(
        "[handleSaveChanges] Current Payment Status:",
        currentPaymentStatus
      );
      console.log(
        "[handleSaveChanges] Selected Payment Status:",
        selectedPaymentStatus
      );

      if (!doctorId) {
        alert("Doctor not logged in. Please log in again.");
        return;
      }

      if (!appointmentId) {
        console.error(
          "This row has no valid backend appointment ID:",
          appointment
        );
        alert("This appointment has no valid backend ID.");
        return;
      }

      // ---------------------------------------------------------
      // 1. UPDATE APPOINTMENT STATUS + REASON
      // ---------------------------------------------------------
      const appointmentUrl =
        `${API_BASE}/appointments/${encodeURIComponent(appointmentId)}/status`;

      const backendStatus =
        mapStatusToBackend(selectedInnerStatus) || selectedInnerStatus;

      const appointmentRequestBody = {
        Status: backendStatus,
        ReMarks: reason,
      };

      console.log(
        "[handleSaveChanges] Appointment PATCH URL:",
        appointmentUrl
      );
      console.log(
        "[handleSaveChanges] Appointment PATCH Body:",
        appointmentRequestBody
      );

      const appointmentResponse = await fetch(appointmentUrl, {
        method: "PATCH",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(appointmentRequestBody),
      });

      console.log(
        "[handleSaveChanges] Appointment PATCH status:",
        appointmentResponse.status
      );

      const appointmentResult = await appointmentResponse
        .json()
        .catch(() => ({}));

      if (!appointmentResponse.ok) {
        console.error(
          "[handleSaveChanges] Appointment status update failed:",
          appointmentResult
        );

        alert(
          appointmentResult.message ||
            appointmentResult.detail ||
            "Failed to update appointment status."
        );
        return;
      }

      // Extra safety: if the backend returns DoctorId, verify ownership.
      const returnedDoctorId =
        appointmentResult.DoctorId ||
        appointmentResult.doctorId ||
        appointmentResult.Doctor?.Id ||
        appointmentResult.doctor?.Id ||
        null;

      if (
        returnedDoctorId &&
        String(returnedDoctorId) !== String(doctorId)
      ) {
        console.error("[handleSaveChanges] Doctor ownership mismatch:", {
          loggedInDoctorId: doctorId,
          returnedDoctorId,
          appointmentId,
        });

        alert("This appointment does not belong to the logged-in doctor.");
        return;
      }

      // ---------------------------------------------------------
      // 2. UPDATE PAYMENT STATUS ONLY IF IT WAS CHANGED
      // ---------------------------------------------------------
      const paymentStatusChanged =
        selectedPaymentStatus !== currentPaymentStatus;

      if (paymentStatusChanged) {
        if (!paymentId) {
          console.error(
            "[handleSaveChanges] Payment status changed, but no payment ID was returned:",
            appointment
          );

          alert(
            "Payment status cannot be updated because this appointment has no payment ID."
          );
          return;
        }

        const paymentUrl =
          `${API_BASE}/payments/${encodeURIComponent(paymentId)}/status`;

        const paymentRequestBody = {
          Status: selectedPaymentStatus,
        };

        console.log(
          "[handleSaveChanges] Payment PATCH URL:",
          paymentUrl
        );
        console.log(
          "[handleSaveChanges] Payment PATCH Body:",
          paymentRequestBody
        );

        const paymentResponse = await fetch(paymentUrl, {
          method: "PATCH",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(paymentRequestBody),
        });

        console.log(
          "[handleSaveChanges] Payment PATCH status:",
          paymentResponse.status
        );

        const paymentResult = await paymentResponse
          .json()
          .catch(() => ({}));

        if (!paymentResponse.ok) {
          console.error(
            "[handleSaveChanges] Payment status update failed:",
            paymentResult
          );

          alert(
            paymentResult.message ||
              paymentResult.detail ||
              "Appointment status was updated, but payment status update failed."
          );
          return;
        }

        console.log(
          "[handleSaveChanges] Payment status updated successfully:",
          paymentResult
        );
      }

      alert(
        paymentStatusChanged
          ? "Appointment and payment status updated successfully!"
          : "Appointment status updated successfully!"
      );

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      console.error(
        "[handleSaveChanges] Update error:",
        error
      );
      alert("An error occurred while updating the appointment.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full bg-[#FBFBFB] border border-[#D9D9D9] border-t-0 rounded-b-[8px] p-[16px] lg:p-[24px] flex flex-col lg:flex-row gap-[20px]">
      
      {/* Left Side Box (Summary) */}
      <div className="w-full lg:w-[220px] h-auto lg:min-h-[320px] flex flex-col justify-between rounded-[8px] p-[16px] border border-[#1C71DA] bg-[#1C71DA0D] shrink-0 gap-[12px]">
        <div className="flex flex-col">
          <span className="font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#1A202C]">Date:</span>
          <span className="font-['Roboto'] font-semibold text-[16px] leading-[28px] text-[#1C71DA]">{appointment.date}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#1A202C]">Payment Amount:</span>
          <span className="font-['Roboto'] font-semibold text-[16px] leading-[28px] text-[#1C71DA]">₹{appointment.fee || '0'}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#1A202C]">Payment Status:</span>
          <span className="font-['Roboto'] font-semibold text-[16px] leading-[28px] text-[#1C71DA]">{appointment.paymentStatus || 'Pending'}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#1A202C]">UPI Reference Number:</span>
          <span className="font-['Roboto'] font-semibold text-[16px] leading-[28px] text-[#1C71DA]">{appointment.upiRef || '-'}</span>
        </div>
      </div>

      {/* Right Side Box (Form) */}
      <div className="flex-1 h-auto lg:min-h-[320px] rounded-[8px] border border-[#D9D9D9] p-[16px] flex flex-col justify-between gap-[16px]">
        
        {/* Top controls: Status + Payment Status use 70%, Prescription + View use 30% */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-y-[16px] w-full">
          {/* Left 70% - Status + Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[24px] gap-y-[16px] w-full lg:pr-[24px]">
            {/* Inner Status Dropdown */}
            <div className="flex flex-col gap-[4px] w-full relative z-20">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                Status
              </span>
              <div
                onClick={() => {
                  setInnerStatusOpen(!innerStatusOpen);
                  setInnerTypeOpen(false);
                  setInnerPaymentStatusOpen(false);
                }}
                className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${innerStatusOpen ? 'border-[#346739]' : 'border-[#A3A3A3]'}`}
              >
                <span className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${selectedInnerStatus !== 'Select Status' ? 'text-[#346739]' : 'text-[#A3A3A3]'}`}>
                  {selectedInnerStatus}
                </span>
                <img
                  src={ChevronDownIcon}
                  alt="Down"
                  className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${innerStatusOpen ? 'rotate-180' : ''}`}
                />
              </div>
              {innerStatusOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">
                  {statusOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedInnerStatus(opt);
                        setInnerStatusOpen(false);
                      }}
                      className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Status Dropdown */}
            <div className="flex flex-col gap-[4px] w-full relative z-10">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                Payment Status
              </span>
              <div
                onClick={() => {
                  setInnerPaymentStatusOpen(!innerPaymentStatusOpen);
                  setInnerStatusOpen(false);
                  setInnerTypeOpen(false);
                }}
                className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${innerPaymentStatusOpen ? 'border-[#346739]' : 'border-[#A3A3A3]'}`}
              >
                <span className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${selectedPaymentStatus ? 'text-[#346739]' : 'text-[#A3A3A3]'}`}>
                  {selectedPaymentStatus}
                </span>
                <img
                  src={ChevronDownIcon}
                  alt="Down"
                  className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${innerPaymentStatusOpen ? 'rotate-180' : ''}`}
                />
              </div>
              {innerPaymentStatusOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">
                  {paymentStatusOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedPaymentStatus(opt);
                        setInnerPaymentStatusOpen(false);
                      }}
                      className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 30% - Prescription + View */}
          {/* Right 30% - Prescription + View */}
<div className="grid grid-cols-2 gap-x-[16px] w-full lg:pl-[24px]">

  {/* Prescription Button */}
  <div className="flex flex-col gap-[4px] w-full">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPrescription?.();
      }}
      className="group w-full h-[44px] mt-8 flex items-center justify-center rounded-[8px] bg-[#346739] border border-[#346739] text-white hover:bg-white hover:text-[#346739] transition-colors cursor-pointer"
    >
      <span className="font-['Roboto'] font-medium text-[14px] leading-[28px] text-current">
        Prescription
      </span>
    </button>
  </div>

  {/* View Details Button */}
  <div className="flex flex-col gap-[4px] w-full">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onViewPatient?.(appointment);
      }}
      className="group w-full h-[44px] mt-8 flex items-center justify-center rounded-[8px] bg-[#1C71DA] border border-[#1C71DA] text-white hover:bg-white hover:text-[#1C71DA] transition-colors cursor-pointer"
    >
      <span className="font-['Roboto'] font-medium text-[14px] leading-[28px] text-current">
        View Details
      </span>
    </button>
  </div>

</div>
        </div>

        {/* Reason Textarea */}
        <div className="flex flex-col gap-[4px] w-full">
          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Reason</span>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Fever" 
            className="w-full h-[130px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] p-[12px] outline-none font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#346739] placeholder-[#A3A3A3] resize-none"
          ></textarea>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSaveChanges}
            disabled={updating}
            className="w-[129px] h-[36px] flex items-center justify-center rounded-[16px] bg-[#1C71DA] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#1C71DA] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] group disabled:opacity-50"
          >
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#FFFFFF] group-hover:text-[#1C71DA]">
              {updating ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

// --- CREATE APPOINTMENT POPUP MODAL ---
const CreateAppointmentPopup = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    mailId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Clinic',
    fee: '',
    reason: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available slots whenever date changes using:
  // GET /doctors/{doctor_id}/available-slots?target_date={date}
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      const doctorId = getDoctorId();

      if (!doctorId) {
        setAvailableSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        setSelectedSlot(null);

        const response = await fetch(
          `${API_BASE}/doctors/${encodeURIComponent(doctorId)}/available-slots?target_date=${encodeURIComponent(formData.date)}`
        );

        if (response.ok) {
          const data = await response.json();
          const slotsList = Array.isArray(data)
            ? data
            : (data.slots || data.AvailableSlots || []);

          setAvailableSlots(Array.isArray(slotsList) ? slotsList : []);
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error('Failed to fetch available slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.date]);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const doctorId = getDoctorId();

      if (!doctorId) {
        setErrorMessage('Doctor not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      if (!formData.patientName.trim()) {
        setErrorMessage('Please enter Patient Name.');
        setLoading(false);
        return;
      }

      if (!formData.phoneNumber.trim()) {
        setErrorMessage('Please enter Phone Number.');
        setLoading(false);
        return;
      }

      if (!formData.date) {
        setErrorMessage('Please select Date.');
        setLoading(false);
        return;
      }

      if (!selectedSlot) {
        setErrorMessage('Please select an available time slot.');
        setLoading(false);
        return;
      }

      if (!formData.type) {
        setErrorMessage('Please select Type.');
        setLoading(false);
        return;
      }

      const slotTimeValue =
        typeof selectedSlot === 'string'
          ? selectedSlot
          : (
              selectedSlot?.SlotTime ||
              selectedSlot?.slotTime ||
              selectedSlot?.time ||
              ''
            );

      if (!slotTimeValue) {
        setErrorMessage('Selected time slot is invalid.');
        setLoading(false);
        return;
      }

      const payload = {
        DoctorId: doctorId,
        PatientName: formData.patientName.trim(),
        PhoneNumber: formData.phoneNumber.trim(),
        Date: formData.date,
        Time: slotTimeValue,
        Type: formData.type,
        Fee: Number(formData.fee) || 0,
        Reason: formData.reason || '',
        MailId: formData.mailId.trim()
      };

      console.log('[CreateAppointmentPopup] POST /appointments/manual payload:', payload);

      const response = await fetch(`${API_BASE}/appointments/manual`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('[CreateAppointmentPopup] POST status:', response.status);

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccessMessage('Appointment created successfully!');

        setTimeout(() => {
          if (onCreated) {
            onCreated();
          }

          onClose();
        }, 1000);
      } else {
        console.error(
          '[CreateAppointmentPopup] Backend create appointment error:',
          responseData
        );

        setErrorMessage(
          responseData.detail ||
          responseData.message ||
          responseData.error ||
          'Failed to create appointment. Please check inputs.'
        );
      }
    } catch (error) {
      console.error('[CreateAppointmentPopup] Failed to create appointment:', error);
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[16px] overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={handleModalClick}
        className="w-full max-w-[719px] bg-[#FFFFFF] rounded-[8px] p-[24px] sm:p-[36px] flex flex-col gap-[20px] shadow-2xl relative my-auto"
      >
        <h2 className="font-['Roboto'] font-semibold text-[20px] leading-[40px] tracking-[0.01em] text-[#346739] m-0 uppercase">
          CREATE A NEW APPOINTMENT
        </h2>

        {successMessage && (
          <div className="w-full max-w-[647px] bg-[#EBF0EB] border border-[#346739] text-[#346739] rounded-[8px] p-[12px] text-center font-['Roboto'] font-medium text-[14px] mx-auto">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="w-full max-w-[647px] bg-[#FDF2F2] border border-[#BD4444] text-[#BD4444] rounded-[8px] p-[12px] text-center font-['Roboto'] font-medium text-[14px] mx-auto">
            {errorMessage}
          </div>
        )}

        <div className="w-full max-w-[647px] bg-transparent border border-[#D9D9D9] rounded-[16px] p-[16px] flex flex-col gap-[16px] mx-auto">

          {/* Patient Name */}
          <div className="flex flex-col gap-[4px] w-full">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
              Patient Name
            </span>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => handleChange('patientName', e.target.value)}
              placeholder="Enter Patient Name"
              className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
            />
          </div>

          {/* Phone Number + Mail ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] w-full">
            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                Phone Number
              </span>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="Enter Phone Number"
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
              />
            </div>

            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                Mail ID
              </span>
              <input
                type="email"
                value={formData.mailId}
                onChange={(e) => handleChange('mailId', e.target.value)}
                placeholder="Enter Email ID"
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
              />
            </div>
          </div>

          {/* Date + Available Time Slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] w-full">
            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                Date
              </span>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]"
              />
            </div>

            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                Available Time Slot
              </span>

              <div className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[12px] flex items-center relative">
                <select
                  value={selectedSlot || ''}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  disabled={loadingSlots || availableSlots.length === 0}
                  className="w-full h-full bg-transparent outline-none font-['Roboto'] font-normal text-[14px] text-[#346739] appearance-none cursor-pointer pr-[24px]"
                >
                  <option value="" disabled hidden>
                    {loadingSlots
                      ? 'Loading slots...'
                      : availableSlots.length === 0
                        ? 'No slots available'
                        : 'Select time slot'}
                  </option>

                  {availableSlots.map((slot, index) => {
                    const slotStr =
                      typeof slot === 'string'
                        ? slot
                        : (
                            slot?.SlotTime ||
                            slot?.slotTime ||
                            slot?.time ||
                            ''
                          );

                    const timeLabel = slotStr.includes('T')
                      ? slotStr.split('T')[1].slice(0, 5)
                      : slotStr.slice(0, 5);

                    return (
                      <option
                        key={index}
                        value={slotStr}
                        className="text-[#346739]"
                      >
                        {timeLabel || slotStr}
                      </option>
                    );
                  })}
                </select>

                <img
                  src={ChevronDownIcon}
                  alt="Down"
                  className="absolute right-[12px] top-[14px] w-[16px] h-[16px] object-contain pointer-events-none opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Type + Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] w-full">
            <div className="flex flex-col gap-[4px] w-full relative">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                Type
              </span>

              <div className="relative w-full">
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] appearance-none cursor-pointer"
                >
                  <option value="" disabled hidden>
                    Select option
                  </option>
                  <option value="Clinic" className="text-[#346739]">
                    Clinic (In-Person)
                  </option>
                  <option value="Video" className="text-[#346739]">
                    Video Consultation
                  </option>
                </select>

                <img
                  src={ChevronDownIcon}
                  alt="Down"
                  className="absolute right-[16px] top-[14px] w-[16px] h-[16px] object-contain pointer-events-none opacity-60"
                />
              </div>
            </div>

            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                Fee
              </span>

              <input
                type="text"
                value={formData.fee}
                onChange={(e) => handleChange('fee', e.target.value)}
                placeholder="e.g., 500"
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-[4px] w-full">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
              Reason
            </span>

            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="e.g., Fever"
              className="w-full h-[100px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3] resize-none"
            ></textarea>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-[16px] w-full mt-[4px] max-w-[647px] mx-auto">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-[44px] flex items-center justify-center rounded-[8px] bg-[#FFFFFF] border border-[#346739] transition-all duration-300 hover:bg-[#EBF0EB] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] disabled:opacity-50"
          >
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]">
              Cancel
            </span>
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="group flex-1 h-[44px] flex items-center justify-center rounded-[8px] bg-[#346739] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#346739] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] disabled:opacity-50"
          >
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#FFFFFF] group-hover:text-[#346739]">
              {loading ? 'Creating...' : 'Create'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN SCREEN COMPONENT ---
const Appointments = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState('Today');
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  // ============================================================
  // PRESCRIPTION MODAL
  // ============================================================

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] =
    useState(false);

  // View & Edit Patient modal (same patient-view flow used in Patients screen)
  const [isViewPatientModalOpen, setIsViewPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState({
    patientId: '',
    fullName: '',
    age: '',
    bloodGroup: '',
    gender: '',
    mobileNumber: '',
    height: '',
    weight: '',
    email: '',
    address: '',
  });

  const [prescriptionMedicines, setPrescriptionMedicines] = useState([
    {
      id: 1,
      name: '',
      duration: '5',
      morningTiming: 'Before Food',
      afternoonTiming: 'Before Food',
      nightTiming: 'Before Food',
      morning: false,
      afternoon: false,
      night: false,
    },
  ]);

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    fullName: '',
    age: '',
    bloodGroup: '',
    gender: '',
    mobileNumber: '',
    height: '',
    weight: '',
    bp: '',
    diagnosis: '',
    doctorsNote: '',
    reviewAfter: '',
  });

  const reviewDateInputRef = useRef(null);


  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend-computed summary counters, straight from the list response
  // (TotalAppointments / Completed / UpComming / Cancelled / NoShow).
  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    noShow: 0,
  });

  // Fresh single-record data fetched via GET /appointments/{appointment_id}
  // whenever a row is expanded — the details box never shows list-cache data.
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [expandedDetailsLoading, setExpandedDetailsLoading] = useState(false);
  const [expandedDetailsNotFound, setExpandedDetailsNotFound] = useState(false);

  // State to track checked rows
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkStatusUpdating, setBulkStatusUpdating] = useState(false);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Select Status');
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('Select Type');

  // Dropdown options are loaded from the backend reference APIs:
  // GET /status-types?skip=0&limit=100
  // GET /consultation-types?skip=0&limit=100
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [loadingStatusOptions, setLoadingStatusOptions] = useState(false);
  const [loadingTypeOptions, setLoadingTypeOptions] = useState(false);

  // ============================================================
  // PRESCRIPTION MODAL
  // ============================================================

  const handleOpenPrescriptionModal = (patient) => {
    setPrescriptionForm({
      patientId: patient?.patientId || '',
      fullName: patient?.name || '',
      age:
        patient?.age === '-'
          ? ''
          : patient?.age || '',
      bloodGroup: patient?.bloodGroup || '',
      gender: patient?.gender || '',
      mobileNumber: patient?.mobile || '',
      height: patient?.height || '',
      weight: patient?.weight || '',
      bp: '',
      diagnosis: '',
      doctorsNote: '',
      reviewAfter: toInputDate(patient?.nextReview),
    });

    // No hardcoded medicine
    setPrescriptionMedicines([
      {
        id: Date.now(),
        name: '',
        duration: '5',
        morningTiming: 'Before Food',
        afternoonTiming: 'Before Food',
        nightTiming: 'Before Food',
        morning: false,
        afternoon: false,
        night: false,
      },
    ]);

    setIsPrescriptionModalOpen(true);
  };

  // ============================================================
  // VIEW / EDIT PATIENT
  // Same View icon + View & Edit Patient screen used in Patients.
  // Appointment data is used as the patient source.
  // ============================================================

  const handleViewPatientInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenViewPatientModal = (appointment) => {
    const rawAge = appointment?.age
      ? String(appointment.age).includes('y/')
        ? String(appointment.age).split('y/')[0]
        : String(appointment.age)
      : '';

    const genderFromAge = String(appointment?.age || '').includes('y/')
      ? String(appointment.age).split('y/')[1]
      : '';

    setSelectedPatient({
      patientId: appointment?.patientId || '',
      fullName: appointment?.name || '',
      age: rawAge,
      bloodGroup: appointment?.bloodGroup || '',
      gender: appointment?.gender || genderFromAge || '',
      mobileNumber: appointment?.mobile || appointment?.phone || '',
      height: appointment?.height || '',
      weight: appointment?.weight || '',
      email: appointment?.email || '',
      address: appointment?.address || '',
    });

    setIsViewPatientModalOpen(true);
  };

  const handleSaveViewedPatient = (e) => {
    e.preventDefault();

    if (!selectedPatient.fullName.trim() || !selectedPatient.mobileNumber.trim()) {
      alert('Please fill out required fields (Name and Mobile Number).');
      return;
    }

    const updatedAge = selectedPatient.age
      ? `${selectedPatient.age}y/${selectedPatient.gender || 'Unknown'}`
      : '';

    // Keep the currently displayed appointment/patient data in sync.
    setAppointmentsList((prev) =>
      prev.map((apt) =>
        apt.patientId === selectedPatient.patientId
          ? {
              ...apt,
              name: selectedPatient.fullName,
              age: updatedAge,
              bloodGroup: selectedPatient.bloodGroup,
              gender: selectedPatient.gender,
              mobile: selectedPatient.mobileNumber,
              phone: selectedPatient.mobileNumber,
              height: selectedPatient.height,
              weight: selectedPatient.weight,
              email: selectedPatient.email,
              address: selectedPatient.address,
            }
          : apt
      )
    );

    setExpandedDetails((prev) => {
      if (!prev || prev.patientId !== selectedPatient.patientId) return prev;

      return {
        ...prev,
        name: selectedPatient.fullName,
        age: updatedAge,
        bloodGroup: selectedPatient.bloodGroup,
        gender: selectedPatient.gender,
        mobile: selectedPatient.mobileNumber,
        phone: selectedPatient.mobileNumber,
        height: selectedPatient.height,
        weight: selectedPatient.weight,
        email: selectedPatient.email,
        address: selectedPatient.address,
      };
    });

    setIsViewPatientModalOpen(false);
  };

  // ============================================================
  // MEDICINE
  // ============================================================

  const handleAddMedicineRow = () => {
    setPrescriptionMedicines((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        duration: '5',
        morningTiming: 'Before Food',
        afternoonTiming: 'Before Food',
        nightTiming: 'Before Food',
        morning: false,
        afternoon: false,
        night: false,
      },
    ]);
  };


  const handleMedicineChange = (
    id,
    field,
    value
  ) => {
    setPrescriptionMedicines((prev) =>
      prev.map((med) =>
        med.id === id
          ? {
              ...med,
              [field]: value,
            }
          : med
      )
    );
  };


  // ============================================================
  // PRESCRIPTION
  // ============================================================

  const handleOpenReviewCalendar = () => {
    const input = reviewDateInputRef.current;

    if (!input) return;

    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    } catch {
      input.focus();
      input.click();
    }
  };

  const handleSendPrescription = async (e) => {
    e.preventDefault();

    const doctorId = getDoctorId();

    if (!doctorId) {
      alert("Doctor ID not found. Please login again.");
      return;
    }

    if (!prescriptionForm.patientId) {
      alert("Patient ID is missing for this patient.");
      return;
    }

    if (!prescriptionForm.diagnosis.trim()) {
      alert("Please enter the diagnosis.");
      return;
    }

    // IMPORTANT:
    // Medicines must be sent as an ARRAY.
    // Do NOT use JSON.stringify() here because the backend
    // PrescriptionCreate model expects Medicines to be a list.
    const medicines = prescriptionMedicines
      .filter((med) => String(med.name || "").trim())
      .map((med) => ({
        Name: String(med.name || "").trim(),
        Duration: String(med.duration || ""),
        Morning: med.morning ? med.morningTiming : null,
        Afternoon: med.afternoon ? med.afternoonTiming : null,
        Night: med.night ? med.nightTiming : null,
      }));

    if (medicines.length === 0) {
      alert("Please add at least one medicine.");
      return;
    }

    // Backend PrescriptionCreate fields from the API response/schema:
    // DoctorId, PatientId, Diagnosis, Medicines, NextFollowUpDate,
    // BP, Height, Weight, Note, PrescriptionFile.
    const payload = {
      DoctorId: doctorId,
      PatientId: prescriptionForm.patientId,
      Diagnosis: prescriptionForm.diagnosis.trim(),
      Medicines: medicines,
      NextFollowUpDate:
        prescriptionForm.reviewAfter || null,
      BP: prescriptionForm.bp?.trim() || "",
      Height: prescriptionForm.height?.trim() || "",
      Weight: prescriptionForm.weight?.trim() || "",
      Note: prescriptionForm.doctorsNote?.trim() || "",
      PrescriptionFile: "",
    };

    console.log(
      "[Prescription] Request URL:",
      `${API_BASE}/prescriptions`
    );

    console.log(
      "[Prescription] Request body:",
      payload
    );

    try {
      const response = await fetch(
        `${API_BASE}/prescriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();

      console.log(
        "[Prescription] Response status:",
        response.status
      );

      console.log(
        "[Prescription] Response:",
        responseText
      );

      if (!response.ok) {
        let errorMessage =
          `Failed to send prescription (${response.status})`;

        try {
          const errorData =
            JSON.parse(responseText);

          // FastAPI/Pydantic validation errors
          if (Array.isArray(errorData?.detail)) {
            errorMessage = errorData.detail
              .map((item) => {
                const field =
                  Array.isArray(item?.loc)
                    ? item.loc.join(".")
                    : "Field";

                return `${field}: ${
                  item?.msg || "Invalid value"
                }`;
              })
              .join("\n");
          } else {
            errorMessage =
              errorData?.detail ||
              errorData?.message ||
              errorMessage;
          }
        } catch {
          if (responseText) {
            errorMessage = responseText;
          }
        }

        throw new Error(errorMessage);
      }

      // Prescription was created successfully.
      alert("Prescription sent successfully.");

      setIsPrescriptionModalOpen(false);

      // Reset prescription form after successful submission.
      setPrescriptionForm({
        patientId: "",
        fullName: "",
        age: "",
        bloodGroup: "",
        gender: "",
        mobileNumber: "",
        height: "",
        weight: "",
        bp: "",
        diagnosis: "",
        doctorsNote: "",
        reviewAfter: "",
      });

      setPrescriptionMedicines([
        {
          id: Date.now(),
          name: "",
          duration: "5",
          morningTiming: "Before Food",
          afternoonTiming: "Before Food",
          nightTiming: "Before Food",
          morning: false,
          afternoon: false,
          night: false,
        },
      ]);

    } catch (err) {
      console.error(
        "[Prescription] Send error:",
        err
      );

      alert(
        err?.message ||
        "Unable to send prescription."
      );
    }
  };


  // Fetch only the appointments for the currently logged-in doctor.
  // doctorId ALWAYS comes from localStorage. No hardcoded doctor ID is used.
  // Uses the query params the backend actually accepts:
  // doctor_id, patient_id, target_date, status, filter_type, skip, limit.
  const fetchAppointments = async () => {
    setLoading(true);

    // Always start from empty — nothing gets shown unless this call
    // succeeds and returns real, well-formed records from the backend.
    setAppointmentsList([]);

    const doctorId = getDoctorId();

    if (!doctorId) {
      console.error("Missing doctorId in localStorage. Aborting fetch — showing no data.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    params.set('doctor_id', doctorId);

    const filterType = mapFilterType(activeTimeFilter);
    if (filterType) params.set('filter_type', filterType);

    const backendStatus = mapStatusToBackend(selectedStatus);
    if (backendStatus) params.set('status', backendStatus);

    const requestUrl = `${API_BASE}/appointments?${params.toString()}`;

    console.log("[fetchAppointments] Request DoctorId:", doctorId);
    console.log("[fetchAppointments] Request URL:", requestUrl);

    const response = await fetch(requestUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    console.log("[fetchAppointments] Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        "[fetchAppointments] Backend returned an error:",
        response.status,
        errorData
      );
      setAppointmentsList([]);
      setLoading(false);
      return;
    }

    const data = await response.json().catch(() => ({}));

    console.log("========== BACKEND APPOINTMENTS ==========");
    console.log("Requested DoctorId:", doctorId);
    console.log("Backend Response:", data);

    // Backend wraps the list in { TotalAppointments, Completed, UpComming,
    // Cancelled, NoShow, Appointments: [...] } — fall back to a bare array
    // or other casings just in case.
    const items = Array.isArray(data)
      ? data
      : (data.Appointments || data.appointments || data.data || []);

    // Pull the backend-computed summary numbers straight from the response.
    setSummary({
      total: Number(data.TotalAppointments ?? items.length ?? 0),
      completed: Number(data.Completed ?? 0),
      upcoming: Number(data.UpComming ?? 0),
      cancelled: Number(data.Cancelled ?? 0),
      noShow: Number(data.NoShow ?? 0),
    });

    if (!Array.isArray(items) || items.length === 0) {
      console.log("[fetchAppointments] Backend returned no appointments for this doctor.");
      console.log("==========================================");
      setAppointmentsList([]);
      setLoading(false);
      return;
    }

    // Log every record so we can immediately detect whether the backend is
    // returning another doctor's appointment.
    items.forEach((item, index) => {
      const returnedDoctorId =
        item.DoctorId ||
        item.doctorId ||
        item.Doctor?.Id ||
        item.doctor?.Id ||
        null;

      console.log(`[fetchAppointments] Appointment ${index + 1}:`, {
        AppointmentId: item.Id,
        DoctorId: returnedDoctorId,
        PatientName: item.PatientName || item.patient?.PatientName,
        Status: item.Status,
      });
    });

    console.log("==========================================");

    // Keep only real persisted appointment records.
    const itemsWithId = items.filter((item) => !!item.Id);

    // Extra frontend safety: if the backend includes DoctorId in a record,
    // never show a record belonging to a different doctor.
    const doctorFilteredItems = itemsWithId.filter((item) => {
      const returnedDoctorId =
        item.DoctorId ||
        item.doctorId ||
        item.Doctor?.Id ||
        item.doctor?.Id ||
        null;

      // If DoctorId is present, it MUST match the logged-in doctor.
      if (returnedDoctorId) {
        const matches = String(returnedDoctorId) === String(doctorId);

        if (!matches) {
          console.warn(
            "[fetchAppointments] BLOCKED appointment belonging to another doctor:",
            {
              appointmentId: item.Id,
              returnedDoctorId,
              loggedInDoctorId: doctorId,
            }
          );
        }

        return matches;
      }

      // Do not display a record when the backend does not tell us which doctor
      // owns it. This prevents another doctor's data from being shown.
      console.warn(
        "[fetchAppointments] BLOCKED appointment because backend did not return DoctorId:",
        item.Id
      );

      return false;
    });

    if (doctorFilteredItems.length < itemsWithId.length) {
      console.warn(
        `[fetchAppointments] Removed ${itemsWithId.length - doctorFilteredItems.length} appointment(s) because their DoctorId did not match the logged-in doctor.`
      );
    }

    if (doctorFilteredItems.length < items.length) {
      console.warn(
        `[fetchAppointments] Ignored ${items.length - doctorFilteredItems.length} response row(s) that were missing a backend Id or belonged to another doctor.`
      );
    }

    const formatted = doctorFilteredItems.map(formatAppointment);

    setAppointmentsList(formatted);
    setLoading(false);
  };

  // Load Status and Consultation Type dropdown values from the backend.
  // The API responses supplied for these endpoints are arrays containing:
  // Name, Description, IsActive and Id.
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      setLoadingStatusOptions(true);
      setLoadingTypeOptions(true);

      try {
        const [statusResponse, typeResponse] = await Promise.all([
          fetch(`${API_BASE}/status-types?skip=0&limit=100`, {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }),
          fetch(`${API_BASE}/consultation-types?skip=0&limit=100`, {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

        console.log(
          "[Dropdown API] Status Types response status:",
          statusResponse.status
        );
        console.log(
          "[Dropdown API] Consultation Types response status:",
          typeResponse.status
        );

        const statusData = await statusResponse.json().catch(() => []);
        const typeData = await typeResponse.json().catch(() => []);

        if (!statusResponse.ok) {
          console.error(
            "[Dropdown API] Failed to fetch status types:",
            statusData
          );
          setStatusOptions([]);
        } else {
          const statusItems = extractLookupItems(statusData, [
            "StatusTypes",
            "statusTypes",
            "Status",
            "status",
          ]);

          const activeStatusNames = statusItems
            .filter(
              (item) =>
                item?.IsActive !== false &&
                item?.isActive !== false &&
                item?.Name
            )
            .map((item) => String(item.Name).trim())
            .filter(Boolean);

          setStatusOptions(activeStatusNames);
        }

        if (!typeResponse.ok) {
          console.error(
            "[Dropdown API] Failed to fetch consultation types:",
            typeData
          );
          setTypeOptions([]);
        } else {
          const typeItems = extractLookupItems(typeData, [
            "ConsultationTypes",
            "consultationTypes",
            "Types",
            "types",
          ]);

          const activeTypeNames = typeItems
            .filter(
              (item) =>
                item?.IsActive !== false &&
                item?.isActive !== false &&
                item?.Name
            )
            .map((item) => String(item.Name).trim())
            .filter(Boolean);

          setTypeOptions(activeTypeNames);
        }
      } catch (error) {
        console.error(
          "[Dropdown API] Failed to load status/consultation types:",
          error
        );
        setStatusOptions([]);
        setTypeOptions([]);
      } finally {
        setLoadingStatusOptions(false);
        setLoadingTypeOptions(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Refetch whenever the doctor changes the Today/Weekly/Monthly filter or
  // the Status dropdown, since those are now sent to the backend.
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimeFilter, selectedStatus]);

  // Filter appointments based on Search input and the Type filter.
  // ConsultationType is still filtered client-side because the appointments
  // list endpoint does not currently expose a consultation_type query param.
  const filteredAppointments = appointmentsList.filter(apt => {
    const matchesSearch = apt.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === 'Select Type' ||
      normalizeConsultationType(apt.type) === normalizeConsultationType(selectedType);

    return matchesSearch && matchesType;
  });

  // Stat cards now come straight from the backend's summary numbers.
  const topStats = [
    { value: String(summary.total), label: "TODAY'S APPOINTMENTS", icon: CalendarCheckIcon },
    { value: String(summary.completed), label: "APPOINTMENTS COMPLETED", icon: CompletedIcon },
    { value: String(summary.upcoming), label: "PATIENT'S WAITING", icon: WaitingIcon },
    { value: String(summary.cancelled), label: "APPOINTMENTS CANCELLED", icon: CancelledIcon },
  ];

  // Called when a row is clicked. Fetches that specific appointment fresh via
  // GET /appointments/{appointment_id} — no try/catch, no token. The details
  // box only renders if the backend actually confirms the record exists.
  const fetchSingleAppointment = async (appointmentId) => {
    const doctorId = getDoctorId();

    if (!doctorId) {
      console.error("[GET /appointments/:id] No logged-in doctorId found.");
      setExpandedDetails(null);
      setExpandedDetailsNotFound(true);
      return;
    }

    if (!appointmentId) {
      console.error("[GET /appointments/:id] No appointment ID — skipping GET.");
      setExpandedDetailsNotFound(true);
      return;
    }

    // IMPORTANT: appointmentId is the backend Appointment.Id.
    // Never replace this with doctorId.
    if (String(appointmentId) === String(doctorId)) {
      console.error(
        "[GET /appointments/:id] Appointment ID is the same as Doctor ID. This row is incorrectly mapped:",
        { appointmentId, doctorId }
      );
      setExpandedDetails(null);
      setExpandedDetailsNotFound(true);
      return;
    }

    setExpandedDetailsLoading(true);
    setExpandedDetailsNotFound(false);

    const requestUrl = `${API_BASE}/appointments/${encodeURIComponent(appointmentId)}`;

    console.log("[GET /appointments/:id] Doctor ID:", doctorId);
    console.log("[GET /appointments/:id] Appointment ID:", appointmentId);
    console.log("[GET /appointments/:id] Request URL:", requestUrl);

    try {
      const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      console.log(
        "[GET /appointments/:id] Status:",
        response.status
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(
          "[GET /appointments/:id] Backend error:",
          data
        );
        setExpandedDetails(null);
        setExpandedDetailsNotFound(true);
        return;
      }

      if (!data || !data.Id) {
        console.error("[GET /appointments/:id] No usable appointment record:", data);
        setExpandedDetails(null);
        setExpandedDetailsNotFound(true);
        return;
      }

      // Extra safety: never display another doctor's appointment.
      const returnedDoctorId =
        data.DoctorId ||
        data.doctorId ||
        data.Doctor?.Id ||
        data.doctor?.Id ||
        null;

      if (returnedDoctorId && String(returnedDoctorId) !== String(doctorId)) {
        console.error(
          "[GET /appointments/:id] Doctor ownership mismatch:",
          {
            appointmentId,
            loggedInDoctorId: doctorId,
            returnedDoctorId,
          }
        );
        setExpandedDetails(null);
        setExpandedDetailsNotFound(true);
        return;
      }

      console.log("[GET /appointments/:id] Appointment record:", data);
      setExpandedDetails(formatAppointment(data));
    } catch (error) {
      console.error("[GET /appointments/:id] Network error:", error);
      setExpandedDetails(null);
      setExpandedDetailsNotFound(true);
    } finally {
      setExpandedDetailsLoading(false);
    }
  };

  const handleRowClick = (apt, index) => {
    if (expandedRow === index) {
      setExpandedRow(null);
      setExpandedDetails(null);
      setExpandedDetailsNotFound(false);
      return;
    }

    setExpandedRow(index);
    setExpandedDetails(null);
    setExpandedDetailsNotFound(false);
    fetchSingleAppointment(apt.id);
  };

  // Handler for select-all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredAppointments.map((_, idx) => idx));
    } else {
      setSelectedRows([]);
    }
  };

  // Handler for individual row checkbox
  const handleRowCheckboxToggle = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  // Convert any backend error shape (string, object, validation array, etc.)
  // into readable text. This prevents alert() from showing "[object Object]".
  const getBackendErrorMessage = (responseData, fallback) => {
    const rawMessage =
      responseData?.detail ??
      responseData?.message ??
      responseData?.error ??
      responseData;

    if (typeof rawMessage === "string" && rawMessage.trim()) {
      return rawMessage;
    }

    if (Array.isArray(rawMessage)) {
      return rawMessage
        .map((item) => {
          if (typeof item === "string") return item;
          if (item?.msg) return item.msg;
          if (item?.message) return item.message;
          return JSON.stringify(item);
        })
        .join("\n");
    }

    if (rawMessage && typeof rawMessage === "object") {
      if (rawMessage.msg) return String(rawMessage.msg);
      if (rawMessage.message) return String(rawMessage.message);

      try {
        return JSON.stringify(rawMessage, null, 2);
      } catch {
        return fallback;
      }
    }

    return fallback;
  };

  // Update all selected appointments through:
  // PATCH /appointments/status/bulk
  // Body: { AppointmentIds: [...], Status: "...", ReMarks: "..." }
  const handleBulkStatusUpdate = async (status, remarks) => {
    if (selectedRows.length === 0) {
      alert("Please select at least one appointment.");
      return;
    }

    const selectedAppointmentIds = selectedRows
      .map((rowIndex) => filteredAppointments[rowIndex]?.id)
      .filter(Boolean);

    if (selectedAppointmentIds.length === 0) {
      alert("No valid appointment IDs were selected.");
      return;
    }

    const doctorId = getDoctorId();

    if (!doctorId) {
      alert("Doctor not logged in. Please log in again.");
      return;
    }

    try {
      setBulkStatusUpdating(true);

      const requestUrl = `${API_BASE}/appointments/status/bulk`;

      const requestBody = {
        AppointmentIds: selectedAppointmentIds,
        Status: status,
        ReMarks: remarks,
      };

      console.log("[Bulk Status] Doctor ID:", doctorId);
      console.log("[Bulk Status] Appointment IDs:", selectedAppointmentIds);
      console.log("[Bulk Status] Request URL:", requestUrl);
      console.log("[Bulk Status] Request Body:", requestBody);

      const response = await fetch(requestUrl, {
        method: "PATCH",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("[Bulk Status] Response status:", response.status);

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("[Bulk Status] Backend error:", responseData);

        const backendErrorMessage = getBackendErrorMessage(
          responseData,
          `Failed to update selected appointments. (${response.status})`
        );

        console.error("[Bulk Status] Readable error:", backendErrorMessage);
        alert(backendErrorMessage);
        return;
      }

      console.log("[Bulk Status] Success response:", responseData);

      alert("Selected appointments cancelled successfully!");

      setSelectedRows([]);

      // Refresh the list and backend summary counters.
      await fetchAppointments();

      // Refresh the expanded row if it was one of the selected appointments.
      if (expandedRow !== null) {
        const expandedAppointmentId = filteredAppointments[expandedRow]?.id;

        if (expandedAppointmentId) {
          await fetchSingleAppointment(expandedAppointmentId);
        }
      }
    } catch (error) {
      console.error("[Bulk Status] Network error:", error);
      alert("An error occurred while updating the selected appointments.");
    } finally {
      setBulkStatusUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-[20px] w-full max-w-full relative">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-['Roboto'] font-semibold text-[20px] leading-[40px] text-[#346739] m-0">
            APPOINTMENTS
          </h2>
          <p className="font-['Roboto'] font-normal text-[14px] sm:text-[16px] leading-[24px] sm:leading-[36px] m-0">
            <span className="text-[#BD4444]">You have {summary.total} appointments today — {summary.upcoming} patients currently waiting</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-[16px] w-full xl:w-auto">
          <div className="w-full sm:w-[328px] h-[44px] flex items-center gap-[8px] px-[16px] py-[8px] border border-[#AEAEAE] rounded-[8px] bg-[#FFFFFF]">
            <img src={SearchIcon} alt="Search" className="w-[24px] h-[24px] object-contain shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name" 
              className="flex-1 w-full bg-transparent outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#AEAEAE]"
            />
          </div>

          <button 
            onClick={() => setIsCreatePopupOpen(true)}
            className="group w-full sm:w-[213px] h-[44px] flex items-center justify-center gap-[8px] rounded-[8px] py-[8px] px-[16px] bg-[#346739] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#346739] shrink-0"
          >
            <img src={AddIcon} alt="Add" className="w-[20px] h-[20px] object-contain brightness-0 invert transition-all duration-300 group-hover:invert-0 group-hover:brightness-100" />
            <span className="font-['Roboto'] font-semibold text-[14px] leading-[28px] text-[#FFFFFF] group-hover:text-[#346739] text-center whitespace-nowrap">
              CREATE APPOINTMENT
            </span>
          </button>
        </div>
      </div>

      {/* --- 4 TOP STAT BOXES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[16px] w-full">
        {topStats.map((stat, idx) => (
          <div key={idx} className="w-full h-[140px] bg-[#FFFFFF] border border-[#D9D9D9] rounded-[8px] py-[16px] px-[20px] flex flex-col justify-between transition-all duration-300 hover:bg-[#F9F9F9]">
            <div className="flex justify-between items-start">
              <span className="font-['Poppins'] font-semibold text-[24px] leading-[44px] text-[#346739]">
                {stat.value}
              </span>
              <img src={stat.icon} alt={stat.label} className="w-[48px] h-[48px] object-contain" />
            </div>
            <span className="font-['Roboto'] font-normal text-[12px] sm:text-[14px] leading-[28px] text-[#346739]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* --- FILTER BAR --- */}
      <div className="w-full flex flex-col xl:flex-row justify-between items-start xl:items-center py-[16px] px-[16px] md:px-[28px] rounded-[8px] border border-[#1C71DA] bg-[#FBFBFB] gap-4 relative z-30">
        <div className="flex flex-col sm:flex-row items-center gap-[16px] md:gap-[24px] w-full xl:w-auto">
          <div className="flex items-center gap-[8px] w-full sm:w-auto">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1C71DA]">Status</span>
            <div className="relative w-full sm:w-[221px]">
              <div 
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsTypeOpen(false);
                }}
                className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${isStatusOpen ? 'border-[#346739]' : 'border-[#A3A3A3]'}`}
              >
                <span className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${selectedStatus !== 'Select Status' ? 'text-[#346739]' : 'text-[#A3A3A3]'}`}>
                  {formatStatusLabel(selectedStatus)}
                </span>
                <img src={ChevronDownIcon} alt="Down" className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} />
              </div>
              {isStatusOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">
                  <div onClick={() => { setSelectedStatus('Select Status'); setIsStatusOpen(false); }} className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors">
                    All Status
                  </div>
                  {loadingStatusOptions ? (
                    <div className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#A3A3A3]">
                      Loading...
                    </div>
                  ) : statusOptions.length === 0 ? (
                    <div className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#A3A3A3]">
                      No status types available
                    </div>
                  ) : (
                    statusOptions.map((opt) => (
                      <div key={opt} onClick={() => { setSelectedStatus(opt); setIsStatusOpen(false); }} className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors">
                        {formatStatusLabel(opt)}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-[8px] w-full sm:w-auto">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1C71DA]">Type</span>
            <div className="relative w-full sm:w-[221px]">
              <div 
                onClick={() => {
                  setIsTypeOpen(!isTypeOpen);
                  setIsStatusOpen(false);
                }}
                className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${isTypeOpen ? 'border-[#346739]' : 'border-[#A3A3A3]'}`}
              >
                <span className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${selectedType !== 'Select Type' ? 'text-[#346739]' : 'text-[#A3A3A3]'}`}>
                  {formatConsultationTypeLabel(selectedType)}
                </span>
                <img src={ChevronDownIcon} alt="Down" className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${isTypeOpen ? 'rotate-180' : ''}`} />
              </div>
              {isTypeOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">
                  <div onClick={() => { setSelectedType('Select Type'); setIsTypeOpen(false); }} className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors">
                    All Types
                  </div>
                  {loadingTypeOptions ? (
                    <div className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#A3A3A3]">
                      Loading...
                    </div>
                  ) : typeOptions.length === 0 ? (
                    <div className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#A3A3A3]">
                      No consultation types available
                    </div>
                  ) : (
                    typeOptions.map((opt) => (
                      <div key={opt} onClick={() => { setSelectedType(opt); setIsTypeOpen(false); }} className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors">
                        {formatConsultationTypeLabel(opt)}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Right Side: Toggle between Date Filters and Action Buttons */}
        {selectedRows.length > 0 ? (
          <div className="flex items-center gap-[12px] w-full xl:w-auto z-10">
            <button
              type="button"
              onClick={() =>
                handleBulkStatusUpdate(
                  "Cancelled",
                  "Cancelled by the doctor."
                )
              }
              disabled={bulkStatusUpdating}
              className="flex-1 sm:flex-none h-[44px] px-[20px] flex items-center justify-center gap-[8px] bg-[#C53030] hover:bg-[#9B2C2C] text-white rounded-[8px] font-['Roboto'] font-medium text-[14px] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg leading-none">×</span>
              {bulkStatusUpdating ? "UPDATING..." : "CANCEL"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-[8px] w-full xl:w-auto overflow-x-auto scrollbar-hide pb-2 xl:pb-0 z-10">
            {['Today', 'Weekly', 'Monthly'].map((filter) => (
              <button 
                key={filter}
                onClick={() => setActiveTimeFilter(filter)}
                className={`h-[44px] w-[78px] px-[12px] flex items-center justify-center rounded-[8px] border border-[#1C71DA] font-['Roboto'] font-normal text-[14px] transition-colors shrink-0 ${activeTimeFilter === filter ? 'bg-[#1C71DA0D] text-[#1C71DA]' : 'bg-[#FFFFFF] text-[#1C71DA]'}`}
              >
                {filter}
              </button>
            ))}
            <button className="w-[44px] h-[44px] flex items-center justify-center border border-[#1C71DA] bg-[#FFFFFF] rounded-[8px] shrink-0 hover:bg-[#1C71DA0D] transition-colors">
               <img src={FilterCalendarIcon} alt="Calendar" className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] object-contain" />
            </button>
          </div>
        )}
      </div>

      {/* --- TABLE AREA --- */}
      <div className="w-full border border-[#D9D9D9] rounded-[8px] bg-[#FFFFFF] overflow-hidden flex flex-col h-auto z-10 relative">
        <div className="w-full h-full">
          <div className="min-w-[1050px] flex flex-col">
            
            <div className="w-full h-[68px] bg-[#346739] grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_2fr_2fr_1.5fr_0.5fr] items-center px-[28px]">
              <div className="flex items-center justify-center">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedRows.length === filteredAppointments.length && filteredAppointments.length > 0}
                  className="w-[18px] h-[18px] accent-[#346739] cursor-pointer rounded-[4px] border border-[#D9D9D9]" 
                />
              </div>
              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">DATE</span>
              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">START TIME</span>
              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">END TIME</span>
              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">PATIENT NAME</span>
              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">PHONE NUMBER</span>
              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">STATUS</span>
              <span>{/* Empty spacer */}</span>
            </div>

            <div className="flex flex-col p-[16px] gap-[12px] ">
              {loading ? (
                <div className="text-center py-10 font-['Roboto'] text-[#666666]">Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-10 font-['Roboto'] text-[#666666]">No appointments found.</div>
              ) : (
                filteredAppointments.map((apt, index) => {
                  const isExpanded = expandedRow === index;
                  const isChecked = selectedRows.includes(index);
                  
                  return (  
                    <div key={apt.id || index} className="flex flex-col w-full">
                      <div 
                        onClick={() => handleRowClick(apt, index)}
                        className={`w-full h-[68px] grid grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_2fr_2fr_1.5fr_0.5fr] items-center px-[28px] transition-colors duration-200 cursor-pointer ${
                          isExpanded ? 'bg-[#FBFBFB] border border-[#D9D9D9] border-b-0 rounded-t-[8px]' : 'bg-[#FFFFFF] border border-[#F3F3F3] hover:bg-[#FBFBFB] rounded-[8px]'
                        }`}
                      >
                        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleRowCheckboxToggle(index)}
                            className="w-[18px] h-[18px] accent-[#346739] cursor-pointer rounded-[4px] border border-[#D9D9D9]" 
                          />
                        </div>
                        <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">{apt.date}</span>
                        <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">{apt.startTime}</span>
                        <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">{apt.endTime}</span>
                        <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">{apt.name}</span>
                        <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">{apt.phone}</span>
                        <span className={`font-['Roboto'] font-normal text-[14px] leading-[28px] text-center ${apt.statusColor}`}>
                          {apt.status}
                        </span>
                        <div className="flex items-center justify-end gap-[8px] pr-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(apt, index);
                            }}
                            className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] cursor-pointer"
                            title="Toggle Details"
                          >
                            <img 
                              src={ChevronDownIcon} 
                              alt="Toggle" 
                              className={`w-[24px] h-[24px] object-contain transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                            />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        expandedDetailsLoading ? (
                          <div className="w-full bg-[#FBFBFB] border border-[#D9D9D9] border-t-0 rounded-b-[8px] p-[24px] text-center font-['Roboto'] text-[#666666]">
                            Loading appointment details...
                          </div>
                        ) : expandedDetailsNotFound ? (
                          <div className="w-full bg-[#FBFBFB] border border-[#D9D9D9] border-t-0 rounded-b-[8px] p-[24px] text-center font-['Roboto'] text-[#BD4444]">
                            No backend record found for this appointment.
                          </div>
                        ) : expandedDetails ? (
                          <ExpandedDetails
                            appointment={expandedDetails}
                            onUpdateSuccess={() => {
                              fetchAppointments();               // refresh the list/stats
                              fetchSingleAppointment(apt.id);     // refresh this open row's fresh GET
                            }}
                            onPrescription={() => handleOpenPrescriptionModal(apt)}
                            onViewPatient={(patient) => handleOpenViewPatientModal(patient)}
                          />
                        ) : null
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>

      {isCreatePopupOpen && (
        <CreateAppointmentPopup 
          onClose={() => setIsCreatePopupOpen(false)} 
          onCreated={fetchAppointments}
        />
      )}

      {/* ======================================================
          VIEW & EDIT PATIENT MODAL
          Same View screen style and related fields as Patients.jsx.
      ======================================================= */}

      {isViewPatientModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden mt-80 my-8 relative">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 pt-6 pb-2">
              <h2 className="text-xl font-bold text-emerald-900">
                VIEW &amp; EDIT PATIENT
              </h2>

              <button
                type="button"
                onClick={() => setIsViewPatientModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 cursor-pointer text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form Content */}
            <form
              onSubmit={handleSaveViewedPatient}
              className="px-8 py-4 space-y-4"
            >
              <div className="border border-gray-200 p-5 rounded-xl">

                {/* Patient ID */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    name="patientId"
                    value={selectedPatient.patientId || 'Not available'}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Patient Full Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={selectedPatient.fullName}
                    onChange={handleViewPatientInputChange}
                    placeholder="Enter Patient Full Name"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    required
                  />
                </div>

                {/* Age & Blood Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Age
                    </label>
                    <input
                      type="text"
                      name="age"
                      value={selectedPatient.age}
                      onChange={handleViewPatientInputChange}
                      placeholder="e.g., 30"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Blood Group
                    </label>
                    <input
                      type="text"
                      name="bloodGroup"
                      value={selectedPatient.bloodGroup}
                      onChange={handleViewPatientInputChange}
                      placeholder="e.g., O+"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    />
                  </div>
                </div>

                {/* Gender & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={selectedPatient.gender}
                      onChange={handleViewPatientInputChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    >
                      <option value="">Select option</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={selectedPatient.mobileNumber}
                      onChange={handleViewPatientInputChange}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                      required
                    />
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      name="height"
                      value={selectedPatient.height}
                      onChange={handleViewPatientInputChange}
                      placeholder="e.g., 150cms"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      name="weight"
                      value={selectedPatient.weight}
                      onChange={handleViewPatientInputChange}
                      placeholder="e.g., 65kgs"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={selectedPatient.email}
                    onChange={handleViewPatientInputChange}
                    placeholder="name@email.com"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    rows="3"
                    value={selectedPatient.address}
                    onChange={handleViewPatientInputChange}
                    placeholder="Enter Full Address"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsViewPatientModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#31693E] hover:bg-[#275432] text-white rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          PRESCRIPTION MODAL
      ======================================================= */}

      {isPrescriptionModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4  overflow-y-auto">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mt-200 overflow-hidden my-8 relative">

            <div className="flex justify-between items-center px-8 pt-6 pb-2">

              <h2 className="text-xl font-bold text-[#31693E] tracking-wide">
                CREATE PRESCRIPTION
              </h2>

              <button
                onClick={() =>
                  setIsPrescriptionModalOpen(false)
                }
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 cursor-pointer text-lg font-semibold"
              >
                &times;
              </button>

            </div>


            <form
              onSubmit={handleSendPrescription}
              className="px-8 py-4 space-y-4"
            >

              <div className="border border-gray-200 p-5 rounded-xl space-y-4">

                {/* Upload Prescription */}

                <div className="flex justify-end">
                  <label
                    htmlFor="prescription-upload"
                    className="h-[52px] px-5 bg-[#2475D8] hover:bg-[#1F66BE] text-white rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v12" />
                      <path d="m17 8-5-5-5 5" />
                      <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
                    </svg>

                    Upload Prescription
                  </label>

                  <input
                    id="prescription-upload"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        console.log(
                          "[Prescription] Selected file:",
                          file.name
                        );

                        // File selection is ready here.
                        // Connect this file to your upload API when the
                        // backend endpoint is available.
                      }
                    }}
                  />
                </div>

                {/* Patient ID */}

                <div>

                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Patient ID
                  </label>

                  <input
                    type="text"
                    value={
                      prescriptionForm.patientId ||
                      "Not provided by API"
                    }
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500"
                  />

                </div>


                {/* Full Name */}

                <div>

                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Patient Full Name
                  </label>

                  <input
                    type="text"
                    value={
                      prescriptionForm.fullName
                    }
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        fullName:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                  />

                </div>


                {/* Age / Blood Group */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Age
                    </label>

                    <input
                      type="text"
                      value={
                        prescriptionForm.age
                      }
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          age: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Blood Group
                    </label>

                    <input
                      type="text"
                      value={
                        prescriptionForm.bloodGroup
                      }
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          bloodGroup:
                            e.target.value,
                        })
                      }
                      placeholder="Not provided"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />

                  </div>

                </div>


                {/* Gender / Mobile */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Gender
                    </label>

                    <select
                      value={
                        prescriptionForm.gender
                      }
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          gender:
                            e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    >

                      <option value="">
                        Select option
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Mobile Number
                    </label>

                    <input
                      type="text"
                      value={
                        prescriptionForm.mobileNumber
                      }
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          mobileNumber:
                            e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />

                  </div>

                </div>


                {/* Height / Weight */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Height
                    </label>

                    <input
                      type="text"
                      value={
                        prescriptionForm.height
                      }
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          height: e.target.value,
                        })
                      }
                      placeholder="Eg..180Cm."
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Weight
                    </label>

                    <input
                      type="text"
                      value={
                        prescriptionForm.weight
                      }
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          weight: e.target.value,
                        })
                      }
                      placeholder="Eg..45Kg"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
                    />

                  </div>

                </div>


                {/* BP / Diagnosis */}

                {/* BP / Diagnosis */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

  {/* BP */}
  <div>
    <label className="block text-sm font-medium text-emerald-900 mb-2">
      BP
    </label>

    <input
      type="text"
      value={prescriptionForm.bp}
      onChange={(e) =>
        setPrescriptionForm({
          ...prescriptionForm,
          bp: e.target.value,
        })
      }
      placeholder="120/80"
      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
    />
  </div>

  {/* Diagnosis */}
  <div>
    <label className="block text-sm font-medium text-emerald-900 mb-2">
      Diagnosis
    </label>

    <input
      type="text"
      value={prescriptionForm.diagnosis}
      onChange={(e) =>
        setPrescriptionForm({
          ...prescriptionForm,
          diagnosis: e.target.value,
        })
      }
      placeholder="Viral Fever"
      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800"
    />
  </div>

</div>

{/* Doctor's Note - Below BP & Diagnosis */}
<div className="mt-4">
  <label className="block text-sm font-medium text-emerald-900 mb-2">
    Doctor’s Note
  </label>

  <textarea
    value={prescriptionForm.doctorsNote || ''}
    onChange={(e) =>
      setPrescriptionForm({
        ...prescriptionForm,
        doctorsNote: e.target.value,
      })
    }
    placeholder="Write the advice or the precautions to be taken by the patient.."
    rows={4}
    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#31693E]"
  />
</div>


                {/* Medicines */}

                <div>

                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Medicines
                  </label>


                  {prescriptionMedicines.map(
                    (med) => (

                      <div
                        key={med.id}
                        className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white mb-3"
                      >

                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) =>
                            handleMedicineChange(
                              med.id,
                              'name',
                              e.target.value
                            )
                          }
                          placeholder="Medicine name"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#31693E]"
                        />

                        {/* Duration */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#31693E]">
                            Duration
                          </span>

                          <input
                            type="number"
                            min="1"
                            value={med.duration}
                            onChange={(e) =>
                              handleMedicineChange(
                                med.id,
                                'duration',
                                e.target.value
                              )
                            }
                            className="w-16 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 text-center"
                          />

                          <span className="text-sm text-[#31693E]">
                            days
                          </span>
                        </div>


                        {/* Morning */}

                        <div className="grid grid-cols-2 items-center gap-2 text-sm text-gray-700">

                          <div className="flex items-center gap-2">

                            <span
                              className={`text-xs ${
                                med.morningTiming ===
                                'Before Food'
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              Before Food
                            </span>


                            <div className="relative inline-block w-10 align-middle select-none">

                              <input
                                type="checkbox"
                                checked={
                                  med.morningTiming ===
                                  'After Food'
                                }
                                onChange={(e) =>
                                  handleMedicineChange(
                                    med.id,
                                    'morningTiming',
                                    e.target.checked
                                      ? 'After Food'
                                      : 'Before Food'
                                  )
                                }
                                className="peer sr-only"
                                id={`timing-morning-${med.id}`}
                              />

                              <label
                                htmlFor={`timing-morning-${med.id}`}
                                className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-[#31693E]"
                              />

                              <span className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />

                            </div>


                            <span
                              className={`text-xs ${
                                med.morningTiming ===
                                'After Food'
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              After Food
                            </span>

                          </div>


                          <label className="flex items-center gap-2 cursor-pointer justify-start">

                            <input
                              type="checkbox"
                              checked={
                                med.morning
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  med.id,
                                  'morning',
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-[#31693E] focus:ring-[#31693E] w-4 h-4"
                            />

                            <span className="text-xs text-gray-700">
                              Morning
                            </span>

                          </label>

                        </div>


                        {/* Afternoon */}

                        <div className="grid grid-cols-2 items-center gap-2 text-sm text-gray-700">

                          <div className="flex items-center gap-2">

                            <span
                              className={`text-xs ${
                                med.afternoonTiming ===
                                'Before Food'
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              Before Food
                            </span>


                            <div className="relative inline-block w-10 align-middle select-none">

                              <input
                                type="checkbox"
                                checked={
                                  med.afternoonTiming ===
                                  'After Food'
                                }
                                onChange={(e) =>
                                  handleMedicineChange(
                                    med.id,
                                    'afternoonTiming',
                                    e.target.checked
                                      ? 'After Food'
                                      : 'Before Food'
                                  )
                                }
                                className="peer sr-only"
                                id={`timing-afternoon-${med.id}`}
                              />

                              <label
                                htmlFor={`timing-afternoon-${med.id}`}
                                className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-[#31693E]"
                              />

                              <span className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />

                            </div>


                            <span
                              className={`text-xs ${
                                med.afternoonTiming ===
                                'After Food'
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              After Food
                            </span>

                          </div>


                          <label className="flex items-center gap-2 cursor-pointer justify-start">

                            <input
                              type="checkbox"
                              checked={
                                med.afternoon
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  med.id,
                                  'afternoon',
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-[#31693E] focus:ring-[#31693E] w-4 h-4"
                            />

                            <span className="text-xs text-gray-700">
                              Afternoon
                            </span>

                          </label>

                        </div>


                        {/* Night */}

                        <div className="grid grid-cols-2 items-center gap-2 text-sm text-gray-700">

                          <div className="flex items-center gap-2">

                            <span
                              className={`text-xs ${
                                med.nightTiming ===
                                'Before Food'
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              Before Food
                            </span>


                            <div className="relative inline-block w-10 align-middle select-none">

                              <input
                                type="checkbox"
                                checked={
                                  med.nightTiming ===
                                  'After Food'
                                }
                                onChange={(e) =>
                                  handleMedicineChange(
                                    med.id,
                                    'nightTiming',
                                    e.target.checked
                                      ? 'After Food'
                                      : 'Before Food'
                                  )
                                }
                                className="peer sr-only"
                                id={`timing-night-${med.id}`}
                              />

                              <label
                                htmlFor={`timing-night-${med.id}`}
                                className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-[#31693E]"
                              />

                              <span className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />

                            </div>


                            <span
                              className={`text-xs ${
                                med.nightTiming ===
                                'After Food'
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              After Food
                            </span>

                          </div>


                          <label className="flex items-center gap-2 cursor-pointer justify-start">

                            <input
                              type="checkbox"
                              checked={
                                med.night
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  med.id,
                                  'night',
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-[#31693E] focus:ring-[#31693E] w-4 h-4"
                            />

                            <span className="text-xs text-gray-700">
                              Night
                            </span>

                          </label>

                        </div>

                      </div>

                    )
                  )}

                </div>


                {/* Add Medicine */}

                <div>

                  <button
                    type="button"
                    onClick={
                      handleAddMedicineRow
                    }
                    className="text-[#31693E] text-sm font-semibold flex items-center gap-1 cursor-pointer"
                  >

                    <span className="text-lg">
                      +
                    </span>

                    Add Medicine

                  </button>

                </div>


                {/* Review After */}

                <div>

                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Review After
                  </label>

                  <div className="relative">

                    <input
                      ref={reviewDateInputRef}
                      type="date"
                      value={prescriptionForm.reviewAfter}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          reviewAfter: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 pr-12 cursor-pointer"
                    />

                    <button
                      type="button"
                      onClick={handleOpenReviewCalendar}
                      className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-[#31693E] hover:text-[#275432] cursor-pointer"
                      aria-label="Select review date"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>

                  </div>

                </div>

              </div>


              {/* Footer */}

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200 mt-6">

                <button
                  type="button"
                  onClick={() =>
                    setIsPrescriptionModalOpen(
                      false
                    )
                  }
                  className="px-8 py-2.5 border border-[#31693E] text-[#31693E] hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-8 py-2.5 bg-[#31693E] hover:bg-[#275432] text-white rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Send Prescription
                </button>

              </div>

            </form>

          </div>

        </div>

      )}



    </div>
  );
};

export default Appointments;
