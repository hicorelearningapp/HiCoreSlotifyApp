import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuCalendar, LuTrash2, LuX } from 'react-icons/lu';

const RequiredMark = () => (
  <span className="absolute right-3 bottom-[10px] z-10 text-[11px] font-semibold text-red-800 bg-white px-1 pointer-events-none whitespace-nowrap">
    *
  </span>
);

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required = true, maxLength, colSpan = false }) => (
  <div className={`relative ${colSpan ? 'md:col-span-2' : ''}`}>
    <label className="block text-[14px] font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      maxLength={maxLength}
      placeholder={placeholder}
      className="w-full h-[40px] md:h-[44px] rounded-lg border border-[#AEAEAE] px-3.5 md:px-4 text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, placeholder = 'Select Option', required = true }) => (
  <div className="relative">
    <label className="block text-[14px] font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-[40px] md:h-[44px] rounded-lg border border-[#AEAEAE] px-3.5 md:px-4 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#2A723D]"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const countryCodes = { India: '+91', UK: '+44', USA: '+1' };

const Register = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Popup States
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });

  const [formData, setFormData] = useState({
    FullName: '',
    UserName: '',
    Qualification: '',
    Specialization: '',
    MedicalRegistrationNumber: '',
    Gender: '',
    DateOfBirth: '',
    MobileNumber: '',
    EmailAddress: '',
    YearsOfExperience: '',
    Password: '',
    WhatsAppNumber: '',
    BusinessPhoneNumber: '',
    ClinicName: '',
    ClinicAddress: '',
    City: '',
    Pincode: '',
    State: '',
    Country: '',
    ClinicConsultationFee: '',
    VideoConsultationFee: '',
    SecondOpinionFee: '',
    ConsultationDuration: '',
    MaximumPatientsPerDay: '',
    UpiId: '',
    AccountNumber: '',
    BankName: '',
    IfscCode: '',
    AccountHolderName: ''
  });

  const [workingHours, setWorkingHours] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { slots: [{ from: '', to: '' }], isOff: false };
      return acc;
    }, {})
  );

  const [consents, setConsents] = useState({
    accurate: false,
    terms: false,
    notifications: false
  });

  const profileInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];
  const selectedCountryCode = countryCodes[formData.Country] || '+91';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValidationErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

    if (['MobileNumber', 'WhatsAppNumber', 'BusinessPhoneNumber'].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
    } else if (name === 'DateOfBirth') {
      if (value > today) {
        setErrorPopup({ show: true, message: 'Date of Birth cannot be a future date.' });
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleWorkingSlotChange = (day, slotIndex, field, value) => {
    setWorkingHours((prev) => {
      const updatedSlots = [...prev[day].slots];
      updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], [field]: value };
      return { ...prev, [day]: { ...prev[day], slots: updatedSlots } };
    });
  };

  const addWorkingSlot = (day) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], slots: [...prev[day].slots, { from: '', to: '' }] }
    }));
  };

  const deleteWorkingSlot = (day, slotIndex) => {
    setWorkingHours((prev) => {
      const currentSlots = prev[day].slots;
      if (currentSlots.length === 1) {
        return { ...prev, [day]: { ...prev[day], slots: [{ from: '', to: '' }] } };
      }
      return {
        ...prev,
        [day]: { ...prev[day], slots: currentSlots.filter((_, idx) => idx !== slotIndex) }
      };
    });
  };

  const handleConsentChange = (field, value) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setConsents((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrorPopup({ show: true, message: 'Please upload only JPG or PNG images.' });
      e.target.value = '';
      setProfilePhoto(null);
      setPreviewUrl(null);
      return;
    }

    setProfilePhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    
    setValidationErrors((prev) => {
      if (!prev.ProfilePhoto) return prev;
      const next = { ...prev };
      delete next.ProfilePhoto;
      return next;
    });
  };

  const clearProfilePhoto = (e) => {
    e.stopPropagation();
    setProfilePhoto(null);
    setPreviewUrl(null);
    if (profileInputRef.current) {
      profileInputRef.current.value = '';
    }
  };

  const convertTo24HourFormat = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.trim().replace(
      /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi,
      (match, hourStr, minStr, modifier) => {
        let hours = parseInt(hourStr, 10);
        const minutes = minStr || '00';
        const ampm = modifier.toLowerCase();
        if (ampm === 'pm' && hours < 12) hours += 12;
        else if (ampm === 'am' && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}:${minutes}`;
      }
    );
  };

  const handleSubmit = async () => {
    const errors = {};
    const requiredFields = {
      FullName: 'Full Name',
      UserName: 'User Name',
      Qualification: 'Qualification',
      Specialization: 'Specialization',
      MedicalRegistrationNumber: 'Medical Registration Number',
      Gender: 'Gender',
      DateOfBirth: 'Date of Birth',
      MobileNumber: 'Mobile Number',
      EmailAddress: 'Email Address',
      Password: 'Password',
      WhatsAppNumber: 'WhatsApp Business Number',
      BusinessPhoneNumber: 'Business Phone Number',
      ClinicName: 'Clinic Name',
      ClinicAddress: 'Clinic Address',
      City: 'City',
      Pincode: 'Pincode',
      State: 'State',
      Country: 'Country',
      ClinicConsultationFee: 'Clinic Consultation Fee',
      VideoConsultationFee: 'Video Consultation Fee',
      SecondOpinionFee: 'Second Opinion Fee',
      ConsultationDuration: 'Consultation Duration',
      MaximumPatientsPerDay: 'Maximum Patients Per Day'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!String(formData[field] ?? '').trim()) errors[field] = `${label} is required.`;
    });

    if (!consents.accurate) errors.accurate = 'Please confirm that the information provided is accurate.';
    if (!consents.terms) errors.terms = 'Please agree to the Terms & Conditions and Privacy Policy.';
    if (!consents.notifications) errors.notifications = 'Please provide consent for notifications.';
    if (formData.MobileNumber && formData.MobileNumber.length !== 10) errors.MobileNumber = 'Mobile Number must be exactly 10 digits.';
    if (formData.DateOfBirth && formData.DateOfBirth > today) errors.DateOfBirth = 'Date of Birth cannot be a future date.';

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const sec1 = ['ClinicName', 'FullName', 'UserName', 'EmailAddress', 'Password', 'MobileNumber', 'BusinessPhoneNumber', 'ClinicAddress', 'City', 'Pincode', 'State', 'Country'];
      const sec2 = ['Qualification', 'Specialization', 'MedicalRegistrationNumber', 'Gender', 'DateOfBirth', 'YearsOfExperience', 'WhatsAppNumber'];
      const sec3 = ['ClinicConsultationFee', 'VideoConsultationFee', 'SecondOpinionFee', 'ConsultationDuration', 'MaximumPatientsPerDay'];

      let targetSection = 1;
      if (Object.keys(errors).some((key) => sec3.includes(key))) targetSection = 3;
      if (Object.keys(errors).some((key) => sec2.includes(key))) targetSection = 2;
      if (Object.keys(errors).some((key) => sec1.includes(key))) targetSection = 1;

      setActiveSection(targetSection);
      setTimeout(() => {
        document.getElementById(`section-${targetSection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Top Box: Common Industry Standards mapped directly
      submitData.append('BusinessName', formData.ClinicName || '');
      submitData.append('IndustryType', 'HealthcareDoctorAppointment');
      submitData.append('FullName', formData.FullName || '');
      submitData.append('EmailAddress', formData.EmailAddress || '');
      submitData.append('MobileNumber', `${selectedCountryCode}${formData.MobileNumber}`);
      submitData.append('BusinessPhoneNumber', formData.BusinessPhoneNumber || '');
      submitData.append('Address', formData.ClinicAddress || '');
      submitData.append('City', formData.City || '');
      submitData.append('State', formData.State || '');
      submitData.append('Pincode', formData.Pincode || '');
      submitData.append('Country', formData.Country || '');
      submitData.append('UserName', formData.UserName || '');
      submitData.append('Password', formData.Password || '');

      if (profilePhoto) {
        submitData.append('ProfilePic', profilePhoto);
      }

      // Format working hours (flattened)
      const workingHoursMap = {};
      daysOfWeek.forEach((day) => {
        const val = workingHours[day].isOff
          ? 'Closed'
          : workingHours[day].slots
              .filter((s) => s.from || s.to)
              .map((s) => `${convertTo24HourFormat(s.from)}-${convertTo24HourFormat(s.to)}`)
              .filter(Boolean)
              .join(';');
        if (val) workingHoursMap[day] = val;
      });

      // Bottom Boxes: Dynamic Data Payload customized for business
      const businessData = {
        Qualification: formData.Qualification,
        Specialization: formData.Specialization,
        MedicalRegistrationNumber: formData.MedicalRegistrationNumber,
        Gender: formData.Gender,
        DateOfBirth: formData.DateOfBirth,
        YearsOfExperience: Number(formData.YearsOfExperience) || 0,
        WhatsAppNumber: formData.WhatsAppNumber,
        ClinicConsultationFee: Number(formData.ClinicConsultationFee) || 0,
        VideoConsultationFee: Number(formData.VideoConsultationFee) || 0,
        SecondOpinionFee: Number(formData.SecondOpinionFee) || 0,
        ConsultationDuration: formData.ConsultationDuration ? parseInt(formData.ConsultationDuration, 10) : 0,
        MaximumPatientsPerDay: Number(formData.MaximumPatientsPerDay) || 0,
        UpiId: formData.UpiId,
        AccountNumber: formData.AccountNumber,
        BankName: formData.BankName,
        IfscCode: formData.IfscCode,
        AccountHolderName: formData.AccountHolderName,
        ...workingHoursMap // Flattened directly into the JSON
      };

      // Appended as Stringified Dynamic JSON Payload
      submitData.append('BusinessData', JSON.stringify(businessData));

      const apiBase = import.meta.env.VITE_API_BASE || '/api';
      const response = await fetch(`${apiBase}/businesses/register`, {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        setShowSuccessPopup(true);
      } else {
        const errorData = await response.json().catch(() => null);
        setErrorPopup({ show: true, message: errorData?.detail || errorData?.message || 'Registration Failed. Please check the fields and try again.' });
      }
    } catch (error) {
      console.error('API Error:', error);
      setErrorPopup({ show: true, message: 'An error occurred while submitting the form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    {
      id: 1,
      stepLabel: '1. General Information',
      tag: 'SECTION 01',
      title: 'GENERAL INFORMATION',
      subtitle: 'Enter your basic and business details.',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <InputField label="Clinic / Business Name" name="ClinicName" value={formData.ClinicName} onChange={handleInputChange} placeholder="Enter Business Name" />
            <InputField label="Full Name" name="FullName" value={formData.FullName} onChange={handleInputChange} placeholder="Enter Your Full Name" />
            <InputField label="User Name" name="UserName" value={formData.UserName} onChange={handleInputChange} placeholder="Enter User Name" />
            <InputField label="Email Address" name="EmailAddress" type="email" value={formData.EmailAddress} onChange={handleInputChange} placeholder="Enter Professional Email" />
            
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center h-[40px] md:h-[44px] border border-[#AEAEAE] rounded-lg bg-white overflow-hidden">
                <span className="text-sm font-semibold text-gray-700 px-3 h-full flex items-center bg-[#F7F7F7] border-r border-[#AEAEAE]">
                  {selectedCountryCode}
                </span>
                <input
                  name="MobileNumber"
                  value={formData.MobileNumber}
                  onChange={handleInputChange}
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit Mobile Number"
                  className="w-full h-full px-3 text-sm focus:outline-none placeholder-gray-300 bg-white"
                />
              </div>
            </div>

            <InputField label="Business Phone Number (Hicore)" name="BusinessPhoneNumber" value={formData.BusinessPhoneNumber} onChange={handleInputChange} maxLength={10} placeholder="Enter Business Phone" />
            <InputField label="Password" name="Password" type="password" value={formData.Password} onChange={handleInputChange} placeholder="Create Password" />
            
            <div className="relative md:col-span-1">
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">Upload Profile Photo (optional)</label>
              <input type="file" ref={profileInputRef} onChange={handleProfileChange} accept="image/jpeg,image/png" className="hidden" />
              <div
                onClick={() => !previewUrl && profileInputRef.current?.click()}
                className={`w-full rounded-lg border border-dashed border-[#AEAEAE] flex flex-col items-center justify-center transition bg-white relative overflow-hidden ${
                  previewUrl ? 'h-[140px]' : 'h-[40px] md:h-[44px] cursor-pointer hover:bg-gray-50'
                }`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={clearProfilePhoto}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 p-1.5 rounded-full shadow transition"
                      title="Remove Image"
                    >
                      <LuX size={16} strokeWidth={3} />
                    </button>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-gray-600">Click to upload image</span>
                )}
              </div>
            </div>

            <div className="relative md:col-span-2">
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                Full Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="ClinicAddress"
                value={formData.ClinicAddress}
                onChange={handleInputChange}
                rows="2"
                placeholder="Enter Complete Address"
                className="w-full rounded-lg border border-[#AEAEAE] p-3 text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white resize-none"
              />
            </div>

            <InputField label="City" name="City" value={formData.City} onChange={handleInputChange} placeholder="Enter City Name" />
            <InputField label="Pincode" name="Pincode" value={formData.Pincode} onChange={handleInputChange} placeholder="Enter Pincode" />
            <SelectField
              label="State"
              name="State"
              value={formData.State}
              onChange={handleInputChange}
              options={['Andhra Pradesh', 'Tamil Nadu', 'Kerala', 'Maharastra', 'Karnataka', 'Delhi']}
            />
            <SelectField
              label="Country"
              name="Country"
              value={formData.Country}
              onChange={handleInputChange}
              options={['India', 'UK', 'USA']}
            />
          </div>
        </div>
      )
    },
    {
      id: 2,
      stepLabel: '2. Professional Details',
      tag: 'SECTION 02',
      title: 'PROFESSIONAL DETAILS',
      subtitle: 'Tell us about your medical background.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <InputField label="Qualification" name="Qualification" value={formData.Qualification} onChange={handleInputChange} placeholder="e.g., MBBS, MD" />
          <SelectField
            label="Specialization"
            name="Specialization"
            value={formData.Specialization}
            onChange={handleInputChange}
            options={['Dermatology', 'Psychiatry', 'Cardiology', 'Gynecology', 'Orthopedics', 'ENT', 'Dentistry', 'Other']}
          />
          <InputField label="Medical Registration Number" name="MedicalRegistrationNumber" value={formData.MedicalRegistrationNumber} onChange={handleInputChange} placeholder="Enter Registration Number" />
          <SelectField label="Gender" name="Gender" value={formData.Gender} onChange={handleInputChange} options={['Male', 'Female']} />
          
          <div className="relative">
            <label className="block text-[14px] font-semibold text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                ref={dateInputRef}
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleInputChange}
                type="date"
                max={today}
                className="w-full h-[40px] md:h-[44px] rounded-lg border border-[#AEAEAE] px-3.5 md:px-4 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#2A723D] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <LuCalendar className="absolute right-4 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          
          <InputField label="Years of Experience" name="YearsOfExperience" value={formData.YearsOfExperience} onChange={handleInputChange} placeholder="e.g., 10" required={false} />
          <InputField label="WhatsApp Business Number" name="WhatsAppNumber" value={formData.WhatsAppNumber} onChange={handleInputChange} maxLength={10} placeholder="Enter WhatsApp Number" />
        </div>
      )
    },
    {
      id: 3,
      stepLabel: '3. Consultation Details',
      tag: 'SECTION 03',
      title: 'CONSULTATION DETAILS',
      subtitle: 'Configure your consultation preferences.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <InputField label="Clinic Consultation Fee (₹)" name="ClinicConsultationFee" value={formData.ClinicConsultationFee} onChange={handleInputChange} placeholder="Enter Amount" />
          <InputField label="Video Consultation Fee (₹)" name="VideoConsultationFee" value={formData.VideoConsultationFee} onChange={handleInputChange} placeholder="Enter Amount" />
          <InputField label="Second Opinion Fee (₹)" name="SecondOpinionFee" value={formData.SecondOpinionFee} onChange={handleInputChange} placeholder="Enter Amount" />
          <SelectField
            label="Consultation Duration"
            name="ConsultationDuration"
            value={formData.ConsultationDuration}
            onChange={handleInputChange}
            options={['10 Minutes', '15 Minutes', '20 Minutes', '30 Minutes', '45 Minutes', '60 Minutes']}
          />
          <InputField label="Maximum Patients Per Day" name="MaximumPatientsPerDay" value={formData.MaximumPatientsPerDay} onChange={handleInputChange} placeholder="Enter Patients Limit" colSpan={true} />
        </div>
      )
    },
    {
      id: 4,
      stepLabel: '4. Working Hours',
      tag: 'SECTION 04',
      title: 'WORKING HOURS',
      subtitle: 'Set your weekly availability. Tick "Off" to close a day.',
      content: (
        <div className="border border-[#D9D9D9] rounded-xl p-4 md:p-5 bg-white space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-[#D9D9D9] text-sm font-bold text-[#2A723D] uppercase tracking-wider">
            <span className="w-1/4">Day</span>
            <span className="w-2/4 text-center">Working Hours</span>
            <span className="w-1/4 text-right pr-1">Off</span>
          </div>

          <div className="space-y-5">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-start justify-between text-sm font-semibold text-gray-700">
                <span className="w-1/4 pt-2 text-[14px]">{day}</span>
                <div className="w-full px-2 space-y-2">
                  {workingHours[day].slots.map((slot, slotIndex) => (
                    <div key={`${day}-${slotIndex}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="From (e.g. 09:00 AM)"
                        value={slot.from}
                        onChange={(e) => handleWorkingSlotChange(day, slotIndex, 'from', e.target.value)}
                        disabled={workingHours[day].isOff}
                        className={`w-full h-[38px] rounded-lg border border-[#AEAEAE] px-3 text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white ${
                          workingHours[day].isOff ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                        }`}
                      />
                      <span className="text-xs font-semibold text-gray-400">TO</span>
                      <input
                        type="text"
                        placeholder="To (e.g. 12:00 PM)"
                        value={slot.to}
                        onChange={(e) => handleWorkingSlotChange(day, slotIndex, 'to', e.target.value)}
                        disabled={workingHours[day].isOff}
                        className={`w-full h-[38px] rounded-lg border border-[#AEAEAE] px-3 text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white ${
                          workingHours[day].isOff ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => deleteWorkingSlot(day, slotIndex)}
                        disabled={workingHours[day].isOff}
                        className="shrink-0 w-8 h-8 rounded-lg border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 disabled:opacity-40"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addWorkingSlot(day)}
                    disabled={workingHours[day].isOff}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2A723D] hover:underline disabled:text-gray-300 cursor-pointer"
                  >
                    + Add Slot
                  </button>
                </div>
                <div className="w-1/4 flex justify-end pr-2 pt-2">
                  <input
                    type="checkbox"
                    checked={workingHours[day].isOff}
                    onChange={(e) => handleWorkingHoursChange(day, 'isOff', e.target.checked)}
                    className="w-[18px] h-[18px] rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 5,
      stepLabel: '5. Payment Information',
      tag: 'SECTION 05',
      title: 'PAYMENT INFORMATION',
      subtitle: 'Receive consultation payments securely.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <InputField label="UPI ID (optional)" name="UpiId" value={formData.UpiId} onChange={handleInputChange} placeholder="name@upi" required={false} />
          <InputField label="Account Number" name="AccountNumber" value={formData.AccountNumber} onChange={handleInputChange} placeholder="Enter Account Number" required={false} />
          <InputField label="Bank Name" name="BankName" value={formData.BankName} onChange={handleInputChange} placeholder="Enter Bank Name" required={false} />
          <InputField label="IFSC Code" name="IfscCode" value={formData.IfscCode} onChange={handleInputChange} placeholder="Enter IFSC Code" required={false} />
          <InputField label="Account Holder Name (optional)" name="AccountHolderName" value={formData.AccountHolderName} onChange={handleInputChange} placeholder="Enter Account Holder Name" required={false} colSpan={true} />
        </div>
      )
    },
    {
      id: 6,
      stepLabel: '6. Verification & Consent',
      tag: 'SECTION 06',
      title: 'ACCOUNT VERIFICATION & CONSENT',
      subtitle: 'Please review and confirm your details.',
      content: (
        <div className="space-y-3 pt-1">
          {[
            { key: 'accurate', text: 'I confirm that the information provided is accurate.' },
            { key: 'terms', text: 'I agree to the Terms & Conditions and Privacy Policy.' },
            { key: 'notifications', text: 'I consent to receive appointment notifications via WhatsApp and Email.' }
          ].map((item) => (
            <label key={item.key} className="flex items-center space-x-3 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={consents[item.key]}
                onChange={(e) => handleConsentChange(item.key, e.target.checked)}
                className="w-[18px] h-[18px] rounded border-[#AEAEAE] accent-[#2A723D]"
              />
              <span className="text-[14px]">{item.text}</span>
            </label>
          ))}
        </div>
      )
    }
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleScroll = () => {
      sections.forEach((sec) => {
        const el = document.getElementById(`section-${sec.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 250) setActiveSection(sec.id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#333333] font-sans p-6 md:p-8">
      
      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#2A723D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h3>
            <p className="text-gray-500 mb-6">Your profile has been created successfully.</p>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                navigate('/login');
              }}
              className="w-full h-[44px] bg-[#2A723D] hover:bg-[#235d32] text-white rounded-xl font-semibold transition"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}

      {/* Error Popup Modal */}
      {errorPopup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Notice</h3>
            <p className="text-gray-500 mb-6">{errorPopup.message}</p>
            <button
              onClick={() => setErrorPopup({ show: false, message: '' })}
              className="w-full h-[44px] bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="w-full mb-8">
        <a href="/doctor" className="flex items-center text-gray-500 text-sm font-medium mb-4 hover:text-gray-700 transition w-fit">
          <span className="mr-1">&laquo;</span> Back
        </a>
        <div className="text-center">
          <h1 className="text-[24px] font-semibold text-[#346739] tracking-wide uppercase">
            Create Your Doctor Profile
          </h1>
          <p className="text-[16px] text-[#626262] mt-2">
            Complete the sections below to start accepting appointments through WhatsApp and manage your practice effortlessly.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Vertical Stepper Sidebar */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-[#D9D9D9] p-4 shadow-sm sticky top-8 hidden lg:block">
          <div className="relative flex flex-col space-y-3">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left py-2.5 px-4 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  activeSection === sec.id
                    ? 'bg-[#128807] text-white shadow-md font-semibold'
                    : 'text-gray-500 hover:text-gray-800 bg-transparent'
                }`}
              >
                {sec.stepLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Right Form Cards Container */}
        <div className="flex-1 w-full flex flex-col gap-8">
          {Object.keys(validationErrors).length > 0 && (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <p className="font-semibold">Please complete all required fields.</p>
              <p className="mt-1 text-xs">Fields marked * are required. Working Hours, Payment Information, and Profile Photo are optional.</p>
            </div>
          )}

          {sections.map((sec) => (
            <div
              key={sec.id}
              id={`section-${sec.id}`}
              className="bg-white border border-[#D9D9D9] rounded-2xl p-6 shadow-sm scroll-mt-8 flex flex-col"
            >
              <div className="mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E26A6A]">{sec.tag}</span>
                <h2 className="text-xl font-bold text-[#2A723D] mt-2 mb-1">{sec.title}</h2>
                <p className="text-sm text-gray-500">{sec.subtitle}</p>
              </div>
              <div>{sec.content}</div>
            </div>
          ))}

          <div className="w-full pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-[220px] h-[50px] rounded-xl text-white text-base font-bold shadow-md transition flex items-center justify-center cursor-pointer ${
                isSubmitting ? 'bg-[#a0c4a8] cursor-not-allowed' : 'bg-[#2A723D] hover:bg-[#235d32]'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;