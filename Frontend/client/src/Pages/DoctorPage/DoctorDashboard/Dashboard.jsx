import React, { useState, useEffect } from 'react';

// Import each dashboard icon separately as an image file
import AddIcon from '../../../assets/DoctorDashboard/AddIcon.png';
import CalendarCheckIcon from '../../../assets/DoctorDashboard/CalendarCheckIcon.png';
import CompletedIcon from '../../../assets/DoctorDashboard/CompletedIcon.png';
import WaitingIcon from '../../../assets/DoctorDashboard/WaitingIcon.png';
import CancelledIcon from '../../../assets/DoctorDashboard/CancelledIcon.png';
import VideoIcon from '../../../assets/DoctorDashboard/VideoIcon.png';
import InPersonIcon from '../../../assets/DoctorDashboard/InPersonIcon.png';
import ChatIcon from '../../../assets/DoctorDashboard/ChatIcon.png';
import ArrowUpIcon from '../../../assets/DoctorDashboard/ArrowUpIcon.png';
import ViewAllIcon from '../../../assets/DoctorDashboard/ViewAllIcon.png';
import ChevronDownIcon from '../../../assets/DoctorDashboard/ChevronDownIcon.png';

// ✅ API Base URL and doctorId helpers
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const getDoctorId = () => {
  const doctorId = localStorage.getItem("doctorId");
  console.log("[Auth] doctorId from localStorage:", doctorId);
  return doctorId;
};

// --- CREATE APPOINTMENT POPUP MODAL ---
const CreateAppointmentPopup = ({ onClose, onAppointmentCreated }) => {
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

  // Fetch available slots whenever date changes using GET /doctors/{doctor_id}/available-slots
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      const doctorId = getDoctorId();
      if (!doctorId) return;

      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        const response = await fetch(`${API_BASE}/doctors/${doctorId}/available-slots?target_date=${formData.date}`);
        if (response.ok) {
          const data = await response.json();
          const slotsList = Array.isArray(data) ? data : (data.slots || data.AvailableSlots || []);
          setAvailableSlots(slotsList);
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

    fetchAvailableSlots();
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
      const doctorId = getDoctorId();
      
      if (!selectedSlot) {
        setErrorMessage('Please select an available time slot.');
        setLoading(false);
        return;
      }

      const slotTimeValue = typeof selectedSlot === 'string' ? selectedSlot : (selectedSlot.SlotTime || selectedSlot.time || new Date().toISOString());

      const payload = {
        DoctorId: doctorId || "",
        PatientName: formData.patientName || "",
        PhoneNumber: formData.phoneNumber || "",
        Date: formData.date,
        Time: slotTimeValue,
        Type: formData.type || "Clinic",
        Fee: Number(formData.fee) || 0,
        Reason: formData.reason || "",
        MailId: formData.mailId || ""
      };

      const response = await fetch(`${API_BASE}/appointments/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        let newAptData = {};
        try {
          newAptData = await response.json();
        } catch (e) {}

        setSuccessMessage('Appointment created successfully!');

        const displayTime = slotTimeValue.includes('T') ? slotTimeValue.split('T')[1].slice(0, 5) : slotTimeValue.slice(0, 5);

        const formattedNewApt = {
          id: newAptData.AppointmentId || newAptData.id || Date.now(),
          time: displayTime || '10:00',
          name: newAptData.PatientName || formData.patientName || 'Patient',
          phoneNumber: newAptData.PhoneNumber || formData.phoneNumber || '',
          mailId: newAptData.MailId || formData.mailId || '',
          type: (formData.type === 'Clinic' || formData.type === 'in-person') ? 'In-Person' : 'Video Consultation',
          status: 'Booked',
          statusColor: 'text-[#1C71DA]',
          icon: (formData.type === 'Clinic' || formData.type === 'in-person') ? InPersonIcon : VideoIcon,
          date: newAptData.Date || formData.date,
          fee: newAptData.Fee ?? (formData.fee || '0'),
          paymentStatus: 'Pending',
          reason: newAptData.Reason || formData.reason || 'N/A'
        };

        setTimeout(() => {
          onAppointmentCreated(formattedNewApt);
          onClose();
        }, 1200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.detail || errorData.message || 'Failed to create appointment. Please check inputs.');
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
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
          <div className="flex flex-col gap-[4px] w-full">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Patient Name</span>
            <input 
              type="text" 
              value={formData.patientName}
              onChange={(e) => handleChange('patientName', e.target.value)}
              placeholder="Enter Patient Name" 
              className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] w-full">
            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Phone Number</span>
              <input 
                type="tel" 
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="Enter Phone Number" 
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
              />
            </div>

            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Mail ID</span>
              <input 
                type="email" 
                value={formData.mailId}
                onChange={(e) => handleChange('mailId', e.target.value)}
                placeholder="Enter Email ID" 
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] w-full">
            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Date</span>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]"
              />
            </div>

            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Available Time Slot</span>
              <div className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[12px] flex items-center relative">
                <select 
                  value={selectedSlot || ''}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  disabled={loadingSlots || availableSlots.length === 0}
                  className="w-full h-full bg-transparent outline-none font-['Roboto'] font-normal text-[14px] text-[#346739] appearance-none cursor-pointer pr-[24px]"
                >
                  <option value="" disabled hidden>
                    {loadingSlots ? 'Loading slots...' : availableSlots.length === 0 ? 'No slots available' : 'Select time slot'}
                  </option>
                  {availableSlots.map((slot, index) => {
                    const slotStr = typeof slot === 'string' ? slot : (slot.SlotTime || slot.time || '');
                    const timeLabel = slotStr.includes('T') ? slotStr.split('T')[1].slice(0, 5) : slotStr.slice(0, 5);
                    return (
                      <option key={index} value={slotStr} className="text-[#346739]">
                        {timeLabel || slotStr}
                      </option>
                    );
                  })}
                </select>
                <img src={ChevronDownIcon} alt="Down" className="absolute right-[12px] top-[14px] w-[16px] h-[16px] object-contain pointer-events-none opacity-60" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] w-full">
            <div className="flex flex-col gap-[4px] w-full relative">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Type</span>
              <div className="relative w-full">
                <select 
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] appearance-none cursor-pointer"
                >
                  <option value="" disabled hidden>Select option</option>
                  <option value="Clinic" className="text-[#346739]">Clinic (In-Person)</option>
                  <option value="Video" className="text-[#346739]">Video Consultation</option>
                </select>
                <img src={ChevronDownIcon} alt="Down" className="absolute right-[16px] top-[14px] w-[16px] h-[16px] object-contain pointer-events-none opacity-60" />
              </div>
            </div>
            <div className="flex flex-col gap-[4px] w-full">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Fee</span>
              <input 
                type="text" 
                value={formData.fee}
                onChange={(e) => handleChange('fee', e.target.value)}
                placeholder="e.g., 500" 
                className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[4px] w-full">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Reason</span>
            <textarea 
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="e.g., Fever" 
              className="w-full h-[100px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3] resize-none"
            ></textarea>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-[16px] w-full mt-[4px] max-w-[647px] mx-auto">
          <button 
            onClick={onClose} 
            className="flex-1 h-[44px] flex items-center justify-center rounded-[8px] bg-[#FFFFFF] border border-[#346739] transition-all duration-300 hover:bg-[#EBF0EB] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040]"
          >
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]">Cancel</span>
          </button>
          
          <button 
            onClick={handleCreate}
            disabled={loading}
            className="group flex-1 h-[44px] flex items-center justify-center rounded-[8px] bg-[#346739] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#346739] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040]"
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


// --- TAKE ACTION POPUP MODAL ---
const TakeActionPopup = ({ appointment, onClose, onActionSaved }) => {
  const [innerStatusOpen, setInnerStatusOpen] = useState(false);
  const [innerTypeOpen, setInnerTypeOpen] = useState(false);
  const [selectedInnerStatus, setSelectedInnerStatus] = useState(appointment?.status || 'Select Status');
  const [selectedInnerType, setSelectedInnerType] = useState(appointment?.type || 'Select Type');
  const [reason, setReason] = useState(appointment?.reason || '');
  const [loading, setLoading] = useState(false);

  const statusOptions = ['Available', 'Booked', 'Completed', 'Confirmed', 'Cancelled', 'No Show', 'Not Available'];
  const typeOptions = ['In-Person', 'Video Consultation', 'Second Opinion', 'Clinic'];

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        Status: selectedInnerStatus,
        ReMarks: reason
      };
      
      const response = await fetch(`${API_BASE}/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        let updatedData = {};
        try {
          updatedData = await response.json();
        } catch (e) {}

        const updatedApt = {
          ...appointment,
          status: selectedInnerStatus,
          statusColor: selectedInnerStatus === 'Completed' ? 'text-[#008000]' : selectedInnerStatus === 'Waiting' ? 'text-[#DEB821]' : 'text-[#1C71DA]',
          type: selectedInnerType,
          reason: reason
        };

        onActionSaved(updatedApt);
        onClose();
      } else {
        console.error('Failed to update appointment status via PATCH endpoint');
      }
    } catch (error) {
      console.error('Failed to update appointment action:', error);
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
        className="w-full max-w-[1122px] bg-[#FBFBFB] border border-[#D9D9D9] rounded-[8px] p-[16px] lg:p-[24px] flex flex-col lg:flex-row gap-[20px] shadow-2xl relative my-auto"
      >
        <div className="w-full lg:w-[148px] h-auto lg:min-h-[266px] flex flex-row lg:flex-col justify-between items-start rounded-[8px] p-[16px] border border-[#1C71DA] bg-[#1C71DA0D] shrink-0 gap-[16px] flex-wrap">
          <div className="flex flex-col">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1A202C]">Date:</span>
            <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-[#1C71DA]">
              {appointment.date || '2026-07-31'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1A202C]">Payment Amount:</span>
            <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-[#1C71DA]">₹{appointment.fee || '0'}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1A202C]">Payment Status:</span>
            <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-[#1C71DA]">{appointment.paymentStatus || 'Pending'}</span>
          </div>
        </div>

        <div className="flex-1 h-auto lg:min-h-[266px] rounded-[8px] border border-[#D9D9D9] p-[16px] flex flex-col gap-[20px] bg-[#FFFFFF]">
          <div className="flex flex-col md:flex-row gap-[20px] w-full">
            <div className="flex flex-col gap-[4px] w-full flex-1 relative z-20">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Status</span>
              <div 
                onClick={() => {
                  setInnerStatusOpen(!innerStatusOpen);
                  setInnerTypeOpen(false);
                }}
                className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${innerStatusOpen ? 'border-[#346739]' : 'border-[#A3A3A3]'}`}
              >
                <span className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${selectedInnerStatus !== 'Select Status' ? 'text-[#346739]' : 'text-[#A3A3A3]'}`}>
                  {selectedInnerStatus}
                </span>
                <img src={ChevronDownIcon} alt="Down" className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${innerStatusOpen ? 'rotate-180' : ''}`} />
              </div>
              {innerStatusOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">
                  {statusOptions.map((opt) => (
                    <div key={opt} onClick={() => { setSelectedInnerStatus(opt); setInnerStatusOpen(false); }} className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-[4px] w-full flex-1 relative z-10">
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Type</span>
              <div 
                onClick={() => {
                  setInnerTypeOpen(!innerTypeOpen);
                  setInnerStatusOpen(false);
                }}
                className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${innerTypeOpen ? 'border-[#346739]' : 'border-[#A3A3A3]'}`}
              >
                <span className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${selectedInnerType !== 'Select Type' ? 'text-[#346739]' : 'text-[#A3A3A3]'}`}>
                  {selectedInnerType}
                </span>
                <img src={ChevronDownIcon} alt="Down" className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${innerTypeOpen ? 'rotate-180' : ''}`} />
              </div>
              {innerTypeOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">
                  {typeOptions.map((opt) => (
                    <div key={opt} onClick={() => { setSelectedInnerType(opt); setInnerTypeOpen(false); }} className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[4px] w-full">
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">Reason</span>
            <input 
              type="text" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Fever" 
              className="w-full h-[48px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
            />
          </div>

          <div className="flex justify-end mt-auto pt-[12px]">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-[129px] h-[36px] flex items-center justify-center rounded-[16px] bg-[#1C71DA] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#1C71DA] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] group"
            >
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#FFFFFF] group-hover:text-[#1C71DA]">
                {loading ? 'Saving...' : 'Save Changes'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  const [graphView, setGraphView] = useState('Weekly');
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [activePopupApt, setActivePopupApt] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    doctorName: '',
    totalAppointmentsToday: '0',
    waitingPatients: '0',
    completedCount: '0',
    cancelledCount: '0'
  });

  const [appointments, setAppointments] = useState([]);

  const [analyticsBottom, setAnalyticsBottom] = useState([
    { value: '0', label: 'Total Appointments', growth: '0%' },
    { value: '0', label: 'Total Patients', growth: '0%' },
    { value: '0', label: 'Total Revenue', growth: '0%' },
  ]);

  const [weeklyGraphData, setWeeklyGraphData] = useState([]);
  const [monthlyGraphData, setMonthlyGraphData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const doctorId = getDoctorId();
      if (!doctorId) {
        console.warn("[Dashboard] No doctorId found in localStorage.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/doctors/${doctorId}/dashboard`);
        if (response.ok) {
          const data = await response.json();

          setDashboardData({
            doctorName: `Dr. ${data.DoctorName || ''}`.toUpperCase(),
            totalAppointmentsToday: String(data.TodayTotalAppointments ?? 0),
            waitingPatients: String(data.TodayPendingAppointments ?? 0),
            completedCount: String(data.TodayCompletedAppointments ?? 0),
            cancelledCount: String(data.TodayCancelledAppointments ?? 0)
          });

          if (data.TodayAppointmentsList && Array.isArray(data.TodayAppointmentsList)) {
            const mappedAppointments = data.TodayAppointmentsList.map((apt, index) => ({
              id: apt.AppointmentId || index + 1,
              time: apt.SlotTime ? apt.SlotTime.slice(0, 5) : '00:00',
              name: apt.PatientName || 'Unknown Patient',
              type: apt.ConsultationType === 'Clinic' ? 'In-Person' : (apt.ConsultationType || 'Video Consultation'),
              status: apt.Status || 'Booked',
              statusColor: apt.Status === 'Completed' ? 'text-[#008000]' : apt.Status === 'Waiting' ? 'text-[#DEB821]' : 'text-[#1C71DA]',
              icon: apt.ConsultationType === 'Clinic' ? InPersonIcon : VideoIcon,
              date: new Date().toISOString().split('T')[0],
              fee: '0',
              paymentStatus: 'Pending',
              reason: 'N/A'
            }));
            setAppointments(mappedAppointments);
          }

          setAnalyticsBottom([
            { value: String(data.TotalLifetimeAppointments ?? 0), label: 'Total Appointments', growth: '0%' },
            { value: String(data.TotalLifetimePatients ?? 0), label: 'Total Patients', growth: '0%' },
            { value: String(data.TotalLifetimeRevenue ?? 0), label: 'Total Revenue', growth: '0%' },
          ]);

          // Practice Analytics data comes directly from the backend
          // Backend format:
          // Weekly:  [{ Day: 'Mon', Count: 0 }, ...]
          // Monthly: [{ Month: 'Jan', Count: 0 }, ...]
          if (Array.isArray(data.Weekly)) {
            setWeeklyGraphData(
              data.Weekly.map((item) => ({
                label: item.Day,
                value: Number(item.Count) || 0,
              }))
            );
          } else {
            setWeeklyGraphData([]);
          }

          if (Array.isArray(data.Monthly)) {
            setMonthlyGraphData(
              data.Monthly.map((item) => ({
                label: item.Month,
                value: Number(item.Count) || 0,
              }))
            );
          } else {
            setMonthlyGraphData([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data from backend API:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const topStats = [
    { value: dashboardData.totalAppointmentsToday, label: "TODAY'S APPOINTMENTS", icon: CalendarCheckIcon },
    { value: dashboardData.completedCount, label: "APPOINTMENTS COMPLETED", icon: CompletedIcon },
    { value: dashboardData.waitingPatients, label: "PATIENT'S WAITING", icon: WaitingIcon },
    { value: dashboardData.cancelledCount, label: "APPOINTMENTS CANCELLED", icon: CancelledIcon },
  ];

  const activeGraphData = graphView === 'Weekly' ? weeklyGraphData : monthlyGraphData;

  return (
    <div className="flex flex-col gap-[20px] w-full max-w-full relative">
      
      <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4">
        <div className="w-full">
          <h2 className="font-['Roboto'] font-semibold text-[20px] leading-[30px] sm:leading-[40px] text-[#346739] m-0">
            GOOD MORNING, {dashboardData.doctorName}
          </h2>
          <p className="font-['Roboto'] font-normal text-[14px] sm:text-[16px] leading-[24px] sm:leading-[36px] m-0">
            <span className="text-[#BD4444]">You have {dashboardData.totalAppointmentsToday} appointments today — {dashboardData.waitingPatients} patients currently waiting </span>
            <span className="text-[#828282] block lg:inline">(Updates every day)</span>
          </p>
        </div>
        
        <button 
          onClick={() => setIsCreatePopupOpen(true)}
          className="group w-full sm:w-auto min-w-[fit-content] h-auto min-h-[44px] flex items-center justify-center gap-[8px] rounded-[16px] py-[8px] px-[20px] md:px-[36px] bg-[#346739] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#346739] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] shrink-0"
        >
          <img src={AddIcon} alt="Add" className="w-[20px] h-[20px] object-contain brightness-0 invert transition-all duration-300 group-hover:invert-0 group-hover:brightness-100" />
          <span className="font-['Roboto'] font-normal text-[12px] sm:text-[14px] leading-[20px] sm:leading-[28px] text-white group-hover:text-[#346739] text-center whitespace-normal sm:whitespace-nowrap">
            CREATE NEW APPOINTMENT
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[16px] w-full">
        {topStats.map((stat, idx) => (
          <div key={idx} className="w-full h-[140px] bg-[#FFFFFF] border border-[#D9D9D9] rounded-[8px] py-[16px] px-[20px] flex flex-col justify-between transition-all duration-300 hover:bg-[#F9F9F9] hover:border-[#D9D9D9] hover:shadow-[4px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040]">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px] mt-[12px] w-full">
        
        <div className="w-full bg-white border border-[#D9D9D9] rounded-[8px] p-[16px] md:p-[20px] flex flex-col gap-[20px] lg:h-[608px] overflow-y-auto scrollbar-hide">
          <div className="flex justify-between items-center">
            <h3 className="font-['Roboto'] font-semibold text-[14px] sm:text-[16px] leading-[36px] text-[#346739] m-0">
              TODAY'S APPOINTMENTS
            </h3>
            <button className="flex items-center gap-[4px] font-['Roboto'] font-normal text-[12px] sm:text-[14px] leading-[28px] text-[#66BB6A] hover:opacity-80 shrink-0">
              View All <img src={ViewAllIcon} alt="View All" className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px] object-contain" />
            </button>
          </div>

          <div className="flex flex-col gap-[16px]">
            {appointments.length === 0 ? (
              <p className="font-['Roboto'] font-normal text-[14px] text-[#626262] text-center py-6">No appointments found for today.</p>
            ) : (
              appointments.map((apt, idx) => (
                <div key={idx} className="flex flex-col lg:flex-row lg:items-center gap-[8px] lg:gap-[16px] w-full">
                  <span className="w-full lg:w-[69px] font-['Roboto'] font-normal text-[14px] sm:text-[16px] leading-[24px] lg:leading-[36px] text-[#626262]">
                    {apt.time}
                  </span>
                  
                  <div className="flex-1 w-full bg-white border border-[#D9D9D9] rounded-[16px] p-[12px] sm:p-[16px] flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
                    <div className="flex items-center gap-[12px] sm:gap-[16px]">
                      <div className="w-[48px] h-[48px] sm:w-[64px] sm:h-[64px] rounded-[4px] border-[#D9D9D9] p-[4px] flex items-center justify-center shrink-0">
                        <img src={apt.icon || VideoIcon} alt={apt.type} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-['Roboto'] font-semibold text-[14px] sm:text-[16px] leading-[24px] sm:leading-[36px] text-[#626262]">{apt.name}</span>
                        <span className="font-['Roboto'] font-normal text-[12px] sm:text-[14px] leading-[20px] sm:leading-[28px] text-[#626262]">
                          {apt.type} | <span className={apt.statusColor || 'text-[#1C71DA]'}>{apt.status}</span>
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActivePopupApt(apt)}
                      className="group w-full sm:w-auto min-w-[114px] h-[36px] px-[16px] sm:px-[20px] py-[4px] rounded-[16px] bg-[#008000] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#008000] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] shrink-0 flex items-center justify-center"
                    >
                       <span className="font-['Roboto'] font-normal text-[12px] sm:text-[14px] leading-[28px] text-[#FFFFFF] group-hover:text-[#626262] whitespace-nowrap">
                         Take Action
                       </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full bg-white border border-[#D9D9D9] rounded-[8px] p-[16px] md:p-[20px] flex flex-col gap-[20px] lg:h-[608px]">
          <div className="flex justify-between items-center">
            <h3 className="font-['Roboto'] font-semibold text-[14px] sm:text-[16px] leading-[36px] text-[#346739] m-0">
              PRACTICE ANALYTICS
            </h3>
            
            <div className="flex gap-[8px]">
              <button 
                onClick={() => setGraphView('Weekly')}
                className={`h-[32px] px-[12px] sm:px-[20px] py-[4px] rounded-[16px] border text-[10px] sm:text-[12px] flex items-center justify-center transition-all ${
                  graphView === 'Weekly' 
                    ? 'border-[#1C71DA] bg-[#1C71DA0D] text-[#1C71DA]' 
                    : 'border-transparent bg-white text-[#626262] hover:border-[#D9D9D9]'
                }`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setGraphView('Monthly')}
                className={`h-[32px] px-[12px] sm:px-[20px] py-[4px] rounded-[16px] border text-[10px] sm:text-[12px] flex items-center justify-center transition-all ${
                  graphView === 'Monthly' 
                    ? 'border-[#1C71DA] bg-[#1C71DA0D] text-[#1C71DA]' 
                    : 'border-transparent bg-white text-[#626262] hover:border-[#D9D9D9]'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="w-full h-[250px] sm:h-[366px] border border-[#B5CDBD] rounded-[8px] p-[16px] sm:p-[24px] flex flex-col bg-white">
            {(() => {
              // Keep the Practice Analytics Y-axis fixed at:
              // 1000, 750, 500, 250, 0
              // Backend values are still used for the bar heights.
              const chartMaxValue = 1000;

              const yAxisValues = [
                1000,
                750,
                500,
                250,
                0
              ];

              return (
                <div className="flex-1 relative w-full">
                  {/* Y Axis + Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pb-[24px] z-0">
                    {yAxisValues.map((value, i) => (
                      <div key={i} className="flex items-center w-full">
                        <span className="w-[30px] sm:w-[35px] text-right font-['Roboto'] font-normal text-[10px] sm:text-[12px] text-[#5A73D8] mr-[8px] shrink-0">
                          {value}
                        </span>

                        <div
                          className={`flex-1 border-b ${
                            i === yAxisValues.length - 1
                              ? 'border-transparent'
                              : 'border-[#E8E8E8]'
                          }`}
                        ></div>
                      </div>
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="absolute top-[8px] sm:top-[10px] bottom-[24px] left-[38px] sm:left-[43px] right-0 border-l border-b border-[#827DBC] z-10 flex justify-around items-end px-[2%] sm:px-[5%]">
                    {activeGraphData.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#827DBC]">
                        No graph data available
                      </div>
                    ) : (
                      activeGraphData.map((item, i) => {
                        const value = Number(item.value) || 0;

                        // Backend Count is plotted against the fixed 0-1000 scale.
                        // Zero values remain exactly on the bottom border.
                        const height =
                          value <= 0
                            ? 0
                            : Math.min((value / chartMaxValue) * 100, 100);

                        return (
                          <div
                            key={i}
                            className="w-[5%] sm:w-[5%] rounded-t-[8px] transition-all duration-500 ease-in-out"
                            style={{
                              height: `${height}%`,
                              background: 'linear-gradient(180deg, #115920 0%, #89D188 83.65%)'
                            }}
                            title={`${item.label}: ${value}`}
                          ></div>
                        );
                      })
                    )}
                  </div>

                  {/* X Axis Labels */}
                  <div className="absolute bottom-0 left-[38px] sm:left-[43px] right-0 h-[24px] flex justify-around items-center px-[2%] sm:px-[5%]">
                    {activeGraphData.map((item, i) => (
                      <span
                        key={i}
                        className="font-['Roboto'] font-normal text-[10px] sm:text-[12px] text-[#5A73D8] w-[10%] sm:w-[8%] text-center transition-all duration-300"
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] w-full mt-auto">
            {analyticsBottom.map((item, idx) => (
              <div key={idx} className="w-full h-auto min-h-[126px] bg-[#FFFFFF] border border-[#D9D9D9] rounded-[8px] py-[16px] px-[12px] md:px-[16px] flex flex-col justify-between gap-[8px]">
                <span className="font-['Roboto'] font-semibold text-[18px] sm:text-[20px] leading-[30px] sm:leading-[40px] text-[#008000]">
                  {item.value}
                </span>
                <span className="font-['Roboto'] font-normal text-[12px] sm:text-[14px] leading-[20px] text-[#626262] break-words">
                  {item.label}
                </span>
                <div className="flex items-center gap-[4px] text-[#008000] flex-wrap lg:flex-nowrap">
                  <img src={ArrowUpIcon} alt="Arrow Up" className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] object-contain shrink-0" />
                  <span className="font-['Roboto'] font-normal text-[10px] sm:text-[12px] leading-[20px] whitespace-nowrap">
                    {item.growth} vs last week
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {isCreatePopupOpen && (
        <CreateAppointmentPopup 
          onClose={() => setIsCreatePopupOpen(false)} 
          onAppointmentCreated={(newApt) => setAppointments(prev => [newApt, ...prev])}
        />
      )}

      {activePopupApt && (
        <TakeActionPopup 
          appointment={activePopupApt} 
          onClose={() => setActivePopupApt(null)} 
          onActionSaved={(updatedApt) => {
            setAppointments(prev => prev.map(apt => apt.id === updatedApt.id ? updatedApt : apt));
          }}
        />
      )}

    </div>
  );
};

export default Dashboard;