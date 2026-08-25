import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuCalendar, LuTrash2 } from 'react-icons/lu';

const RequiredMark = () => (
  <span
    className="absolute right-3 bottom-[10px] z-10 text-[11px] font-semibold text-red-800 bg-white px-1 pointer-events-none whitespace-nowrap"
  >
    *required
  </span>
);

const Register = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [profilePhoto, setProfilePhoto] = useState(null);

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

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const [workingHours, setWorkingHours] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = {
        slots: [{ from: '', to: '' }],
        isOff: false
      };
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

  const countryCodes = {
    India: '+91',
    UK: '+44',
    USA: '+1'
  };

  const today = new Date().toISOString().split('T')[0];

  const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;

  const selectedCountryCode =
    countryCodes[formData.Country] || '+91';

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setValidationErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

    if (
      [
        'MobileNumber',
        'WhatsAppNumber',
        'BusinessPhoneNumber'
      ].includes(name)
    ) {
      const digitsOnly = value
        .replace(/\D/g, '')
        .slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly
      }));
    } else if (name === 'DateOfBirth') {
      if (value > today) {
        alert(
          'Date of Birth cannot be a future date.'
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleWorkingHoursChange = (
    day,
    field,
    value
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleWorkingSlotChange = (
    day,
    slotIndex,
    field,
    value
  ) => {
    setWorkingHours((prev) => {
      const updatedSlots = [
        ...prev[day].slots
      ];

      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        [field]: value
      };

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots
        }
      };
    });
  };

  const addWorkingSlot = (day) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [
          ...prev[day].slots,
          {
            from: '',
            to: ''
          }
        ]
      }
    }));
  };

  const deleteWorkingSlot = (
    day,
    slotIndex
  ) => {
    setWorkingHours((prev) => {
      const currentSlots =
        prev[day].slots;

      if (currentSlots.length === 1) {
        return {
          ...prev,
          [day]: {
            ...prev[day],
            slots: [
              {
                from: '',
                to: ''
              }
            ]
          }
        };
      }

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: currentSlots.filter(
            (_, index) =>
              index !== slotIndex
          )
        }
      };
    });
  };

  const handleConsentChange = (
    field,
    value
  ) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

    setConsents((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        'Please upload only JPG or PNG images.'
      );

      e.target.value = '';
      setProfilePhoto(null);
      return;
    }

    if (
      file.size >
      MAX_PROFILE_PHOTO_SIZE
    ) {
      alert(
        'Profile photo must be 2 MB or smaller.'
      );

      e.target.value = '';
      setProfilePhoto(null);
      return;
    }

    setProfilePhoto(file);
    setValidationErrors((prev) => {
      if (!prev.ProfilePhoto) return prev;
      const next = { ...prev };
      delete next.ProfilePhoto;
      return next;
    });
  };

  const handleSubmit = async () => {
    const errors = {};

    // Required fields: all normal form fields except Working Hours, Payment Information, and Profile Photo.
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
      YearsOfExperience: 'Years of Experience',
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
      if (!String(formData[field] ?? '').trim()) {
        errors[field] = `${label} is required.`;
      }
    });

    // All consent checkboxes are required before registration.
    if (!consents.accurate) {
      errors.accurate = 'Please confirm that the information provided is accurate.';
    }

    if (!consents.terms) {
      errors.terms = 'Please agree to the Terms & Conditions and Privacy Policy.';
    }

    if (!consents.notifications) {
      errors.notifications = 'Please provide consent for WhatsApp and Email notifications.';
    }

    // Mobile number validation.
    if (formData.MobileNumber && formData.MobileNumber.length !== 10) {
      errors.MobileNumber = 'Mobile Number must be exactly 10 digits.';
    }

    // DOB can only be today or a past date.
    if (formData.DateOfBirth && formData.DateOfBirth > today) {
      errors.DateOfBirth = 'Date of Birth cannot be a future date.';
    }

    // Profile image validation.
    if (profilePhoto && profilePhoto.size > MAX_PROFILE_PHOTO_SIZE) {
      errors.ProfilePhoto = 'Profile Photo must be 2 MB or smaller.';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Move the user to the first section containing a validation error.
      const sectionOneFields = [
        'FullName', 'UserName', 'Qualification', 'Specialization',
        'MedicalRegistrationNumber', 'Gender', 'DateOfBirth',
        'MobileNumber', 'EmailAddress', 'YearsOfExperience', 'Password',
        'WhatsAppNumber', 'BusinessPhoneNumber',
        'accurate', 'terms', 'notifications'
      ];
      const sectionTwoFields = [
        'ClinicName', 'ClinicAddress', 'City', 'Pincode', 'State', 'Country'
      ];
      const sectionThreeFields = [
        'ClinicConsultationFee', 'ConsultationDuration', 'MaximumPatientsPerDay'
      ];

      let firstSection = 1;
      if (Object.keys(errors).some((key) => sectionTwoFields.includes(key))) {
        firstSection = 2;
      }
      if (Object.keys(errors).some((key) => sectionThreeFields.includes(key))) {
        firstSection = 3;
      }
      if (Object.keys(errors).some((key) => sectionOneFields.includes(key))) {
        firstSection = 1;
      }

      setActiveSection(firstSection);
      setTimeout(() => {
        document
          .getElementById(`section-${firstSection}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);

      return;
    }

    setIsSubmitting(true);

    const convertTo24HourFormat = (timeStr) => {
      if (!timeStr) return '';

      const trimmedTime = timeStr.trim();

      return trimmedTime.replace(
        /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi,
        (match, hourStr, minStr, modifier) => {
          let hours = parseInt(hourStr, 10);
          const minutes = minStr || '00';
          const ampm = modifier.toLowerCase();

          if (ampm === 'pm' && hours < 12) {
            hours += 12;
          } else if (ampm === 'am' && hours === 12) {
            hours = 0;
          }

          return `${String(hours).padStart(2, '0')}:${minutes}`;
        }
      );
    };

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          if (
            [
              'YearsOfExperience',
              'ClinicConsultationFee',
              'VideoConsultationFee',
              'SecondOpinionFee',
              'MaximumPatientsPerDay'
            ].includes(key)
          ) {
            submitData.append(key, Number(formData[key]));
          } else if (key === 'ConsultationDuration') {
            const durationInt = parseInt(
              formData[key].split(' ')[0],
              10
            );

            submitData.append(key, durationInt);
          } else if (key === 'MobileNumber') {
            submitData.append(
              key,
              `${selectedCountryCode}${formData[key]}`
            );
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      daysOfWeek.forEach((day) => {
        const value = workingHours[day].isOff
          ? 'Closed'
          : workingHours[day].slots
              .filter((slot) => slot.from || slot.to)
              .map((slot) => {
                const fromTime = convertTo24HourFormat(slot.from);
                const toTime = convertTo24HourFormat(slot.to);

                if (fromTime && toTime) {
                  return `${fromTime}-${toTime}`;
                }

                return fromTime || toTime;
              })
              .filter(Boolean)
              .join(';');

        if (value) {
          submitData.append(day, value);
        }
      });

      if (profilePhoto) {
        submitData.append('ProfilePhoto', profilePhoto);
      }

      const apiBase = import.meta.env.VITE_API_BASE || '';

      const response = await fetch(
        `${apiBase}/doctors/register`,
        {
          method: 'POST',
          body: submitData
        }
      );

      if (response.ok) {
        alert('Registration Successful!');
        navigate('/login');
      } else {
        let errorData = null;

        try {
          errorData = await response.json();
        } catch {
          errorData = null;
        }

        console.error('Validation Error:', errorData);

        const backendMessage =
          errorData?.detail ||
          errorData?.message ||
          'Registration Failed. Please check the fields and try again.';

        alert(
          typeof backendMessage === 'string'
            ? backendMessage
            : 'Registration Failed. Please check the fields and try again.'
        );
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    {
      id: 1,
      stepLabel:
        '1. Personal Information',
      tag: 'SECTION 01',
      title:
        'PERSONAL INFORMATION',
      subtitle:
        'Tell us about yourself.',
      height: '1120px',
      content: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Full Name
              </label>

              <input
                name="FullName"
                value={
                  formData.FullName
                }
                onChange={
                  handleInputChange
                }
                type="text"
                placeholder="Enter Your Full Name"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                User Name
              </label>

              <input
                name="UserName"
                value={
                  formData.UserName
                }
                onChange={
                  handleInputChange
                }
                type="text"
                placeholder="Enter User Name"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Qualification
              </label>

              <input
                name="Qualification"
                value={
                  formData.Qualification
                }
                onChange={
                  handleInputChange
                }
                type="text"
                placeholder="e.g., MBBS, MD - Pediatrics"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Specialization
              </label>

              <select
                name="Specialization"
                value={
                  formData.Specialization
                }
                onChange={
                  handleInputChange
                }
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm text-gray-500 bg-white focus:outline-none focus:border-[#2A723D]"
              >
                <option value="">
                  Select Specialization
                </option>

                <option value="Dermatology">
                  Dermatology
                </option>

                <option value="Psychiatry">
                  Psychiatry
                </option>

                <option value="Cardiology">
                  Cardiology
                </option>

                <option value="Gynecology">
                  Gynecology
                </option>

                <option value="Orthopedics">
                  Orthopedics
                </option>

                <option value="ENT">
                  ENT
                </option>

                <option value="Dentistry">
                  Dentistry
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Medical Registration Number
              </label>

              <input
                name="MedicalRegistrationNumber"
                value={
                  formData.MedicalRegistrationNumber
                }
                onChange={
                  handleInputChange
                }
                type="text"
                placeholder="Enter Registration Number"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Gender
              </label>

              <select
                name="Gender"
                value={
                  formData.Gender
                }
                onChange={
                  handleInputChange
                }
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm text-gray-800 bg-white focus:outline-none focus:border-[#2A723D]"
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
              <RequiredMark />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Date of Birth
              </label>

              <div className="relative flex items-center">
                <input
                  ref={
                    dateInputRef
                  }
                  name="DateOfBirth"
                  value={
                    formData.DateOfBirth
                  }
                  onChange={
                    handleInputChange
                  }
                  type="date"
                  max={today}
                  placeholder="YYYY-MM-DD"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderColor:
                      '#AEAEAE',
                    padding:
                      '8px 16px'
                  }}
                  className="text-sm focus:outline-none focus:border-[#2A723D] text-gray-700 bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              <RequiredMark />

                <LuCalendar
                  className="absolute right-4 text-gray-400 cursor-pointer pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Mobile Number
              </label>

              <div
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  display: 'flex',
                  alignItems:
                    'center',
                  backgroundColor:
                    '#FFFFFF',
                  overflow: 'hidden'
                }}
               className="relative">
                <span
                  className="text-sm font-semibold text-gray-700"
                  style={{
                    padding: '0 12px',
                    height: '100%',
                    display: 'flex',
                    alignItems:
                      'center',
                    backgroundColor:
                      '#F7F7F7',
                    borderRight:
                      '1px solid #AEAEAE',
                    whiteSpace:
                      'nowrap'
                  }}
                >
                  {
                    selectedCountryCode
                  }
                </span>

                <input
                  name="MobileNumber"
                  value={
                    formData.MobileNumber
                  }
                  onChange={
                    handleInputChange
                  }
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit Mobile Number"
                  style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    padding:
                      '8px 16px'
                  }}
                  className="text-sm focus:outline-none placeholder-gray-300 bg-white"
                />
              <RequiredMark />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Email Address
              </label>

              <input
                name="EmailAddress"
                value={
                  formData.EmailAddress
                }
                onChange={
                  handleInputChange
                }
                type="email"
                placeholder="Enter Professional Email Address"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Years of Experience
              </label>

              <input
                name="YearsOfExperience"
                value={
                  formData.YearsOfExperience
                }
                onChange={
                  handleInputChange
                }
                type="text"
                placeholder="e.g., 10"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Password
              </label>

              <input
                name="Password"
                value={
                  formData.Password
                }
                onChange={
                  handleInputChange
                }
                type="password"
                placeholder="Create Password"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                WhatsApp Business Number
              </label>

              <input
                name="WhatsAppNumber"
                value={
                  formData.WhatsAppNumber
                }
                onChange={
                  handleInputChange
                }
                type="text"
                maxLength={10}
                placeholder="Enter 10-digit WhatsApp Number"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Business Phone Number
              </label>

              <input
                name="BusinessPhoneNumber"
                value={
                  formData.BusinessPhoneNumber
                }
                onChange={
                  handleInputChange
                }
                type="text"
                maxLength={10}
                placeholder="Enter 10-digit Business Phone"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '8px 16px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-3 mt-5">
              Upload Profile Photo (optional)
            </label>

            <input
              type="file"
              ref={
                profileInputRef
              }
              onChange={
                handleProfileChange
              }
              accept="image/jpeg,image/png"
              className="hidden"
            />

            <div
              onClick={() =>
                profileInputRef.current?.click()
              }
              style={{
                width: '100%',
                height: '140px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                borderStyle:
                  'dashed',
                padding: '20px'
              }}
              className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition bg-white"
            >
              <span className="text-sm font-semibold text-gray-600">
                {profilePhoto
                  ? profilePhoto.name
                  : 'Click to upload the image'}
              </span>

              <span className="text-sm text-gray-400 mt-0.5">
                JPG, PNG - max 2MB
              </span>
            </div>
            
          </div>
        </>
      )
    },

    {
      id: 2,
      stepLabel:
        '2. Clinic Information',
      tag: 'SECTION 02',
      title:
        'CLINIC INFORMATION',
      subtitle:
        'Help patients find your clinic.',
      height: '555px',
      content: (
        <div className="space-y-4">

          <div className="relative">
            <label className="block text-[14px] font-semibold text-gray-700 mb-2">
              Clinic Name
            </label>

            <input
              name="ClinicName"
              value={
                formData.ClinicName
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter Clinic Name"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              <RequiredMark />
          </div>

          <div className="relative">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Clinic Address
            </label>

            <textarea
              name="ClinicAddress"
              value={
                formData.ClinicAddress
              }
              onChange={
                handleInputChange
              }
              rows="4"
              placeholder="Enter Complete Address"
              style={{
                width: '100%',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white resize-none"
            />
              <RequiredMark />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                City
              </label>

              <input
                name="City"
                value={
                  formData.City
                }
                onChange={
                  handleInputChange
                }
                type="text"
                placeholder="Enter City Name"
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '6px 14px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
                Pincode
              </label>

              <input
                name="Pincode"
                value={
                  formData.Pincode
                }
                onChange={
                  handleInputChange
                }
                type="text"
                placeholder="Enter Pincode"
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '6px 14px'
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              />
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                State
              </label>

              <select
                name="State"
                value={
                  formData.State
                }
                onChange={
                  handleInputChange
                }
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '6px 14px'
                }}
                className="text-sm text-gray-500 bg-white focus:outline-none focus:border-[#2A723D]"
              >
                <option value="">
                  Select State
                </option>

                <option value="Andhra Pradesh">
                  Andhra Pradesh
                </option>

                <option value="Tamil Nadu">
                  Tamil Nadu
                </option>

                <option value="Kerala">
                  Kerala
                </option>

                <option value="Maharastra">
                  Maharastra
                </option>

                <option value="Karnataka">
                  Karnataka
                </option>

                <option value="Delhi">
                  Delhi
                </option>
              </select>
              <RequiredMark />
            </div>

            <div className="relative">
              <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
                Country
              </label>

              <select
                name="Country"
                value={
                  formData.Country
                }
                onChange={
                  handleInputChange
                }
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor:
                    '#AEAEAE',
                  padding:
                    '6px 14px'
                }}
                className="text-sm text-gray-500 bg-white focus:outline-none focus:border-[#2A723D]"
              >
                <option value="">
                  Select Country
                </option>

                <option value="India">
                  India
                </option>

                <option value="UK">
                  UK
                </option>

                <option value="USA">
                  USA
                </option>
              </select>
              <RequiredMark />
            </div>
          </div>
        </div>
      )
    },

    {
      id: 3,
      stepLabel:
        '3. Consultation Details',
      tag: 'SECTION 03',
      title:
        'CONSULTATION DETAILS',
      subtitle:
        'Configure your consultation preferences.',
      height: '416px',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

          <div className="relative">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Clinic Consultation Fee (₹)
            </label>

            <input
              name="ClinicConsultationFee"
              value={
                formData.ClinicConsultationFee
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter Amount"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              <RequiredMark />
          </div>

          <div className="relative">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Video Consultation Fee (₹)
            </label>

            <input
              name="VideoConsultationFee"
              value={
                formData.VideoConsultationFee
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter Amount"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              <RequiredMark />
          </div>

          <div className="relative">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Second Opinion Fee (₹)
            </label>

            <input
              name="SecondOpinionFee"
              value={
                formData.SecondOpinionFee
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter Amount"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              <RequiredMark />
          </div>

          <div className="relative">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Consultation Duration
            </label>

            <select
              name="ConsultationDuration"
              value={
                formData.ConsultationDuration
              }
              onChange={
                handleInputChange
              }
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm text-gray-500 bg-white focus:outline-none focus:border-[#2A723D]"
            >
              <option value="">
                Select Duration
              </option>

              <option value="10 Minutes">
                10 Minutes
              </option>

              <option value="15 Minutes">
                15 Minutes
              </option>

              <option value="20 Minutes">
                20 Minutes
              </option>

              <option value="30 Minutes">
                30 Minutes
              </option>

              <option value="45 Minutes">
                45 Minutes
              </option>

              <option value="60 Minutes">
                60 Minutes
              </option>
            </select>
              <RequiredMark />
          </div>

          <div className="md:col-span-2 relative">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Maximum Patients Per Day
            </label>

            <input
              name="MaximumPatientsPerDay"
              value={
                formData.MaximumPatientsPerDay
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter Patients Limit"
              style={{
                width: '100%',
                maxWidth: '49%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              <RequiredMark />
          </div>
        </div>
      )
    },

    {
      id: 4,
      stepLabel:
        '4. Working Hours',
      tag: 'SECTION 04',
      title:
        'WORKING HOURS',
      subtitle:
        'Set your weekly availability. Tick "Off" to close a day.',
      height: '772px',
      content: (
        <div className="border border-[#D9D9D9] rounded-xl p-4 md:p-5 bg-white">

          <div className="flex justify-between items-center pb-3 mb-6 border-b border-[#D9D9D9] text-sm font-bold text-[#2A723D] uppercase tracking-wider">

            <span className="w-1/4">
              Day
            </span>

            <span className="w-2/4 text-center">
              Working Hours
            </span>

            <span className="w-1/4 text-right pr-1">
              Off
            </span>

          </div>

          <div className="space-y-7">

            {daysOfWeek.map(
              (day) => (
                <div
                  key={day}
                  className="flex items-start justify-between text-sm font-semibold text-gray-700"
                >

                  <div className="w-1/4 pt-2.5">
                    <span className="text-[14px]">
                      {day}
                    </span>
                  </div>

                  <div className="w-full px-2">

                    <div className="space-y-2.5">

                      {workingHours[
                        day
                      ].slots.map(
                        (
                          slot,
                          slotIndex
                        ) => (
                          <div
                            key={`${day}-${slotIndex}`}
                            className="flex items-center gap-2"
                          >

                            <input
                              type="text"
                              placeholder="From Time (e.g. 09:00 AM)"
                              value={
                                slot.from
                              }
                              onChange={(
                                e
                              ) =>
                                handleWorkingSlotChange(
                                  day,
                                  slotIndex,
                                  'from',
                                  e.target.value
                                )
                              }
                              disabled={
                                workingHours[
                                  day
                                ].isOff
                              }
                              style={{
                                width: '100%',
                                height:
                                  '40px',
                                borderRadius:
                                  '8px',
                                borderWidth:
                                  '1px',
                                borderColor:
                                  '#AEAEAE',
                                padding:
                                  '6px 12px'
                              }}
                              className={`text-sm font-normal focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white ${
                                workingHours[
                                  day
                                ].isOff
                                  ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                  : ''
                              }`}
                            />

                            <span className="shrink-0 text-xs font-semibold text-gray-400">
                              TO
                            </span>

                            <input
                              type="text"
                              placeholder="To Time (e.g. 12:00 PM)"
                              value={
                                slot.to
                              }
                              onChange={(
                                e
                              ) =>
                                handleWorkingSlotChange(
                                  day,
                                  slotIndex,
                                  'to',
                                  e.target.value
                                )
                              }
                              disabled={
                                workingHours[
                                  day
                                ].isOff
                              }
                              style={{
                                width: '100%',
                                height:
                                  '40px',
                                borderRadius:
                                  '8px',
                                borderWidth:
                                  '1px',
                                borderColor:
                                  '#AEAEAE',
                                padding:
                                  '6px 12px'
                              }}
                              className={`text-sm font-normal focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white ${
                                workingHours[
                                  day
                                ].isOff
                                  ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                  : ''
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                deleteWorkingSlot(
                                  day,
                                  slotIndex
                                )
                              }
                              disabled={
                                workingHours[
                                  day
                                ].isOff
                              }
                              title="Delete time slot"
                              aria-label={`Delete ${day} time slot ${
                                slotIndex + 1
                              }`}
                              className={`shrink-0 w-9 h-9 rounded-lg border border-red-200 text-red-500 flex items-center justify-center transition ${
                                workingHours[
                                  day
                                ].isOff
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-red-50 hover:border-red-300 cursor-pointer'
                              }`}
                            >
                              <LuTrash2
                                size={17}
                                strokeWidth={2}
                              />
                            </button>

                          </div>
                        )
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        addWorkingSlot(day)
                      }
                      disabled={
                        workingHours[
                          day
                        ].isOff
                      }
                      className={`mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold transition ${
                        workingHours[
                          day
                        ].isOff
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-[#2A723D] hover:text-[#235d32] cursor-pointer'
                      }`}
                    >
                      <span className="text-base leading-none">
                        +
                      </span>

                      Add Slot
                    </button>

                  </div>

                  <div className="w-1/4 flex justify-end pr-2 pt-2">

                    <input
                      type="checkbox"
                      checked={
                        workingHours[
                          day
                        ].isOff
                      }
                      onChange={(e) =>
                        handleWorkingHoursChange(
                          day,
                          'isOff',
                          e.target.checked
                        )
                      }
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius:
                          '4px',
                        borderColor:
                          '#AEAEAE'
                      }}
                      className="rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
                    />

                  </div>

                </div>
              )
            )}

          </div>
        </div>
      )
    },

    {
      id: 5,
      stepLabel:
        '5. Payment Information',
      tag: 'SECTION 05',
      title:
        'PAYMENT INFORMATION',
      subtitle:
        'Receive consultation payments securely.',
      height: '416px',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              UPI ID (optional)
            </label>

            <input
              name="UpiId"
              value={
                formData.UpiId
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="name@upi"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Account Number
            </label>

            <input
              name="AccountNumber"
              value={
                formData.AccountNumber
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter Account Number"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Bank Name
            </label>

            <input
              name="BankName"
              value={
                formData.BankName
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter Bank Name"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              IFSC Code
            </label>

            <input
              name="IfscCode"
              value={
                formData.IfscCode
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter IFSC Code"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              
          </div>

          <div className="md:col-span-2">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Account Holder Name (optional)
            </label>

            <input
              name="AccountHolderName"
              value={
                formData.AccountHolderName
              }
              onChange={
                handleInputChange
              }
              type="text"
              placeholder="Enter Account Holder Name"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor:
                  '#AEAEAE',
                padding:
                  '6px 14px'
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
              
          </div>

        </div>
      )
    },

    {
  id: 6,
  stepLabel: '6. Verification & Consent',
  tag: 'SECTION 06',
  title: 'ACCOUNT VERIFICATION & CONSENT',
  subtitle: 'Please review and confirm your details.',
  height: '250px',
  content: (
    <div className="space-y-4">

      <div className="space-y-2.5 pt-1">

        {/* Accurate Information */}
        <label className="flex items-center space-x-[12px] text-xs font-semibold text-gray-700 cursor-pointer">

          <input
            type="checkbox"
            checked={consents.accurate}
            onChange={(e) =>
              handleConsentChange(
                'accurate',
                e.target.checked
              )
            }
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              borderColor: '#AEAEAE'
            }}
            className="rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
          />

          <span className="text-[14px]">
            I confirm that the information provided is accurate.
          </span>

        </label>

        {/* Terms & Privacy */}
        <label className="flex items-center space-x-[12px] text-xs font-semibold text-gray-700 cursor-pointer">

          <input
            type="checkbox"
            checked={consents.terms}
            onChange={(e) =>
              handleConsentChange(
                'terms',
                e.target.checked
              )
            }
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              borderColor: '#AEAEAE'
            }}
            className="rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
          />

          <span className="text-[14px]">
            I agree to the Terms & Conditions and Privacy Policy.
          </span>

        </label>

        {/* WhatsApp & Email Notifications */}
        <label className="flex items-center space-x-[12px] text-xs font-semibold text-gray-700 cursor-pointer">

          <input
            type="checkbox"
            checked={consents.notifications}
            onChange={(e) =>
              handleConsentChange(
                'notifications',
                e.target.checked
              )
            }
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              borderColor: '#AEAEAE'
            }}
            className="rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
          />

          <span className="text-[14px]">
            I consent to receive appointment notifications via WhatsApp and Email.
          </span>

        </label>

      </div>

    </div>
  )
}
  ];

  const sidebarItemHeights = [
    '1120px',
    '591px',
    '452px',
    '808px',
    '452px',
    '250px'
  ];

  const scrollToSection = (
    id
  ) => {
    setActiveSection(id);

    const element =
      document.getElementById(
        `section-${id}`
      );

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      sections.forEach((sec) => {
        const element =
          document.getElementById(
            `section-${sec.id}`
          );

        if (element) {
          const rect =
            element.getBoundingClientRect();

          if (
            rect.top <= 250 &&
            rect.bottom >= 250
          ) {
            setActiveSection(
              sec.id
            );
          }
        }
      });
    };

    window.addEventListener(
      'scroll',
      handleScroll
    );

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      );
  }, [sections]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#333333] font-sans p-6 md:p-8">

      <div className="w-full mb-8">

        <a
          href="/doctor"
          className="flex items-center text-gray-500 text-sm font-medium mb-4 hover:text-gray-700 transition w-fit"
        >
          <span className="mr-1">
            &laquo;
          </span>

          Back
        </a>

        <div className="text-center">

          <h1
            style={{
              fontFamily:
                'Roboto, sans-serif',
              fontWeight: 600,
              fontStyle: 'normal',
              fontSize: '24px',
              lineHeight: '40px',
              letterSpacing: '0%',
              color: '#346739'
            }}
            className="tracking-wide uppercase"
          >
            Create Your Doctor Profile
          </h1>

          <p
            style={{
              fontFamily:
                'Roboto, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '16px',
              lineHeight: '28px',
              letterSpacing: '0%',
              color: '#626262'
            }}
            className="mt-2"
          >
            Complete the six sections below to start accepting appointments through WhatsApp and manage your practice effortlessly.
          </p>

        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        <div className="w-full lg:w-72 shrink-0 lg:top-8 bg-white rounded-2xl border border-[#D9D9D9] p-4 shadow-sm overflow-hidden hidden lg:block">

          <div className="relative">

            <div className="absolute left-[20px] top-4 bottom-4 w-[2px] bg-[#E5E7EB] z-0" />

            <div className="flex flex-col">

              {sections.map(
                (sec, index) => (
                  <div
                    key={sec.id}
                    style={{
                      height:
                        sidebarItemHeights[
                          index
                        ]
                    }}
                    className="relative z-10 flex items-start pt-2 transition-all duration-150"
                  >

                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 absolute left-[14px] top-[22px] z-20 transition-all ${
                        activeSection ===
                        sec.id
                          ? 'bg-[#128807] border-[#128807]'
                          : 'bg-white border-[#D9D9D9]'
                      }`}
                    />

                    <button
                      onClick={() =>
                        scrollToSection(
                          sec.id
                        )
                      }
                      className={`w-full text-left py-2.5 pl-9 pr-3 rounded-xl text-xs md:text-sm font-medium transition-all ${
                        activeSection ===
                        sec.id
                          ? 'bg-[#128807] text-white shadow-md font-semibold'
                          : 'text-gray-500 hover:text-gray-800 bg-transparent'
                      }`}
                    >
                      {
                        sec.stepLabel
                      }
                    </button>

                  </div>
                )
              )}

            </div>
          </div>
        </div>

        <div
          className="flex-1 w-full flex flex-col"
          style={{
            gap: '36px'
          }}
        >

          {Object.keys(validationErrors).length > 0 && (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <p className="font-semibold">Please complete all required fields.</p>
              <p className="mt-1 text-xs">Fields marked *required must be completed. Working Hours, Payment Information, and Profile Photo are optional.</p>
            </div>
          )}

          {sections.map(
            (sec) => (
              <div
                key={sec.id}
                id={`section-${sec.id}`}
                style={{
                  width: '100%',
                  height:
                    sec.height,
                  borderRadius:
                    '16px',
                  borderWidth:
                    '1px',
                  padding:
                    '20px',
                  opacity: 1
                }}
                className="bg-white border border-[#D9D9D9] shadow-sm scroll-mt-8 overflow-hidden flex flex-col"
              >

                <div className="mb-4 shrink-0">

                  <span className="text-xs font-semibold uppercase tracking-wider text-[#E26A6A]">
                    {sec.tag}
                  </span>

                  <h2 className="text-xl font-bold text-[#2A723D] mt-3 mb-1">
                    {
                      sec.title
                    }
                  </h2>

                  <p className="text-md mt-3 mb-1 text-gray-500">
                    {
                      sec.subtitle
                    }
                  </p>

                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  {
                    sec.content
                  }
                </div>

              </div>
            )
          )}

          <div className="w-full pt-2 flex justify-end">

            <button
              type="button"
              onClick={
                handleSubmit
              }
              disabled={
                isSubmitting
              }
              style={{
                width: '220px',
                height: '50px',
                borderRadius:
                  '12px',
                backgroundColor:
                  isSubmitting
                    ? '#a0c4a8'
                    : '#2A723D'
              }}
              className="text-white text-base font-bold shadow-md hover:bg-[#235d32] transition flex items-center justify-center cursor-pointer"
            >
              {isSubmitting
                ? 'Submitting...'
                : 'Submit Details'}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;