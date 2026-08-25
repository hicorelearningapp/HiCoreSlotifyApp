import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2 } from 'react-icons/fi';

// Always use the Vercel same-origin proxy in production.
// Do NOT use http://151.185.41.194:8003 directly from an HTTPS page.
const API_BASE_URL = '/api';

const inputStyle = {
  width: '100%',
  height: '44px',
  borderRadius: '8px',
  borderWidth: '1px',
  borderColor: '#AEAEAE',
  paddingTop: '8px',
  paddingBottom: '8px',
  paddingLeft: '16px',
  paddingRight: '16px',
  gap: '8px',
};

const smallInputStyle = {
  width: '100%',
  height: '40px',
  borderRadius: '8px',
  borderWidth: '1px',
  borderColor: '#AEAEAE',
  paddingTop: '6px',
  paddingBottom: '6px',
  paddingLeft: '14px',
  paddingRight: '14px',
};

const emptyDoctorData = {
  FullName: '',
  Qualification: '',
  Specialization: '',
  MedicalRegistrationNumber: '',
  YearsOfExperience: '',
  DateOfBirth: '',
  Gender: '',
  ProfilePhoto: null,
  MobileNumber: '',
  WhatsAppNumber: '',
  BusinessPhoneNumber: '',
  WhatsAppBusinessStatus: 'Connected',
  EmailAddress: '',
  ClinicName: '',
  ClinicAddress: '',
  City: '',
  State: '',
  Pincode: '',
  Country: '',
  ClinicConsultationFee: '',
  VideoConsultationFee: '',
  SecondOpinionFee: '',
  ConsultationDuration: '',
  MaximumPatientsPerDay: '',
  Monday: '',
  Tuesday: '',
  Wednesday: '',
  Thursday: '',
  Friday: '',
  Saturday: '',
  Sunday: '',
  UpiId: '',
  AccountHolderName: '',
  BankName: '',
  IfscCode: '',
  AccountNumber: '',
  Id: '',
  Status: '',
  IsVerified: false,
  UserName: '',
  Password: '',
  CreatedAt: '',
  UpdatedAt: '',
};

// ---------------------------------------------------------
// Working-hours display / backend conversion
// Backend: 10:00-13:00;16:00-20:00
// UI:      10:00 AM to 1:00 PM, 4:00 PM to 8:00 PM
// ---------------------------------------------------------
const formatTime12Hour = (time) => {
  if (!time) return '';

  const match = String(time)
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return time;

  let hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
};

const formatWorkingHours = (value) => {
  if (!value) return '';

  const text = String(value).trim();

  if (text.toLowerCase() === 'closed') {
    return 'Closed';
  }

  return text
    .split(';')
    .map((range) => {
      const parts = range
        .trim()
        .split(/\s*(?:-|–|—|to)\s*/i);

      if (parts.length !== 2) return range.trim();

      return `${formatTime12Hour(parts[0])} to ${formatTime12Hour(
        parts[1]
      )}`;
    })
    .join(', ');
};

const convertTimeTo24Hour = (time) => {
  if (!time) return '';

  const text = String(time).trim().toUpperCase();

  const already24 = text.match(/^(\d{1,2}):(\d{2})$/);

  if (already24) {
    return `${String(Number(already24[1])).padStart(
      2,
      '0'
    )}:${already24[2]}`;
  }

  const match = text.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/
  );

  if (!match) return time.trim();

  let hour = Number(match[1]);
  const minute = match[2] || '00';
  const period = match[3];

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }

  return `${String(hour).padStart(2, '0')}:${minute}`;
};

const convertWorkingHoursToBackend = (value) => {
  if (!value || String(value).trim() === '') {
    return '';
  }

  const text = String(value).trim();

  if (text.toLowerCase() === 'closed') {
    return 'Closed';
  }

  return text
    .split(',')
    .map((range) => {
      const parts = range
        .trim()
        .split(/\s*(?:-|–|—|to)\s*/i);

      if (parts.length !== 2) {
        return range.trim();
      }

      return `${convertTimeTo24Hour(
        parts[0]
      )}-${convertTimeTo24Hour(parts[1])}`;
    })
    .join(';');
};

const Profile = () => {
  // State to hold uploaded files/images
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [medicalCert, setMedicalCert] = useState(null);
  const [govId, setGovId] = useState(null);

  // Doctor data
  const [formData, setFormData] = useState(emptyDoctorData);

  // Loading / saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // ---------------------------------------------------------
  // Username / Password update states
  // ---------------------------------------------------------
  const [usernameValue, setUsernameValue] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [credentialsEditing, setCredentialsEditing] = useState(false);

  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Hidden file input refs
  const profileInputRef = useRef(null);
  const medicalInputRef = useRef(null);
  const govIdInputRef = useRef(null);

  // ---------------------------------------------------------
  // Get Doctor ID from localStorage
  // ---------------------------------------------------------
  const getDoctorId = () => {
    return localStorage.getItem('doctorId');
  };

  // ---------------------------------------------------------
  // Handle normal input changes
  // ---------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // GET DOCTOR PROFILE
  // GET /doctors/{doctor_id}
  // ---------------------------------------------------------
  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const doctorId = getDoctorId();

      if (!doctorId) {
        setError('Doctor ID not found in localStorage.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/doctors/${doctorId}`
      );

      const data = response.data;

      setFormData({
        FullName: data.FullName ?? '',
        Qualification: data.Qualification ?? '',
        Specialization: data.Specialization ?? '',
        MedicalRegistrationNumber:
          data.MedicalRegistrationNumber ?? '',
        YearsOfExperience:
          data.YearsOfExperience ?? '',
        DateOfBirth: data.DateOfBirth
          ? String(data.DateOfBirth).substring(0, 10)
          : '',
        Gender: data.Gender ?? '',
        ProfilePhoto: data.ProfilePhoto ?? null,

        MobileNumber: data.MobileNumber ?? '',
        WhatsAppNumber: data.WhatsAppNumber ?? '',
        BusinessPhoneNumber:
          data.BusinessPhoneNumber ?? '',

        WhatsAppBusinessStatus:
          data.WhatsAppBusinessStatus ?? 'Connected',

        EmailAddress: data.EmailAddress ?? '',

        ClinicName: data.ClinicName ?? '',
        ClinicAddress: data.ClinicAddress ?? '',
        City: data.City ?? '',
        State: data.State ?? '',
        Pincode: data.Pincode ?? '',
        Country: data.Country ?? '',

        ClinicConsultationFee:
          data.ClinicConsultationFee ?? '',
        VideoConsultationFee:
          data.VideoConsultationFee ?? '',
        SecondOpinionFee:
          data.SecondOpinionFee ?? '',
        ConsultationDuration:
          data.ConsultationDuration ?? '',
        MaximumPatientsPerDay:
          data.MaximumPatientsPerDay ?? '',

        Monday: formatWorkingHours(data.Monday ?? ''),
        Tuesday: formatWorkingHours(data.Tuesday ?? ''),
        Wednesday: formatWorkingHours(
          data.Wednesday ?? ''
        ),
        Thursday: formatWorkingHours(
          data.Thursday ?? ''
        ),
        Friday: formatWorkingHours(data.Friday ?? ''),
        Saturday: formatWorkingHours(
          data.Saturday ?? ''
        ),
        Sunday: formatWorkingHours(data.Sunday ?? ''),

        UpiId: data.UpiId ?? '',
        AccountHolderName:
          data.AccountHolderName ?? '',
        BankName: data.BankName ?? '',
        IfscCode: data.IfscCode ?? '',
        AccountNumber: data.AccountNumber ?? '',

        Id: data.Id ?? doctorId,
        Status: data.Status ?? '',
        IsVerified: data.IsVerified ?? false,
        UserName: data.UserName ?? '',
        Password: data.Password ?? '',
        CreatedAt: data.CreatedAt ?? '',
        UpdatedAt: data.UpdatedAt ?? '',
      });

      // Keep username in the dedicated credential field.
      setUsernameValue(data.UserName ?? '');

      // Existing backend photo.
      // Do not treat backend photo URL as a File.
      if (data.ProfilePhoto) {
        setProfilePhoto(null);
      }

      // Keep latest profile in localStorage too
      localStorage.setItem(
        'doctorProfile',
        JSON.stringify(data)
      );
    } catch (err) {
      console.error(
        'GET Doctor Profile Error:',
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to load doctor profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // UPDATE DOCTOR PROFILE
  // PUT /doctors/{doctor_id}
  //
  // IMPORTANT:
  // Empty values are sent as "".
  //
  // Example:
  //
  // FullName: ""
  // Qualification: ""
  // YearsOfExperience: ""
  // MobileNumber: ""
  // ClinicConsultationFee: ""
  //
  // NOT:
  //
  // FullName: null
  // YearsOfExperience: 0
  //
  // ProfilePhoto is different because it is UploadFile.
  // If no new file is selected, it is NOT sent.
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const doctorId = getDoctorId();

      if (!doctorId) {
        setError('Doctor ID not found in localStorage.');
        return;
      }

      const formPayload = new FormData();

      // ---------------------------------------------------------
      // ALWAYS SEND TEXT VALUE
      // null / undefined => ""
      // ---------------------------------------------------------
      const appendText = (key, value) => {
        formPayload.append(
          key,
          value === null || value === undefined
            ? ''
            : String(value)
        );
      };

      // ---------------------------------------------------------
      // NUMBER VALUE
      //
      // Empty => ""
      // Valid number => number as string
      // Invalid => ""
      //
      // IMPORTANT:
      // We do NOT convert empty value to 0.
      // ---------------------------------------------------------
      const appendNumberOrEmpty = (key, value) => {
        if (
          value === null ||
          value === undefined ||
          String(value).trim() === ''
        ) {
          formPayload.append(key, '');
          return;
        }

        const numberValue = Number(value);

        if (Number.isFinite(numberValue)) {
          formPayload.append(
            key,
            String(numberValue)
          );
        } else {
          formPayload.append(key, '');
        }
      };

      // ---------------------------------------------------------
      // PERSONAL INFORMATION
      // ---------------------------------------------------------
      appendText(
        'FullName',
        formData.FullName
      );

      appendText(
        'Qualification',
        formData.Qualification
      );

      appendText(
        'Specialization',
        formData.Specialization
      );

      appendText(
        'MedicalRegistrationNumber',
        formData.MedicalRegistrationNumber
      );

      appendNumberOrEmpty(
        'YearsOfExperience',
        formData.YearsOfExperience
      );

      appendText(
        'DateOfBirth',
        formData.DateOfBirth
      );

      appendText(
        'Gender',
        formData.Gender
      );

      // ---------------------------------------------------------
      // PROFILE PHOTO
      //
      // Only send when user selected a real file.
      // Do NOT send:
      // null
      // "null"
      // ""
      //
      // FastAPI UploadFile expects an actual uploaded file.
      // ---------------------------------------------------------
      if (profilePhoto instanceof File) {
        formPayload.append(
          'ProfilePhoto',
          profilePhoto
        );
      }

      // ---------------------------------------------------------
      // CONTACT
      // ---------------------------------------------------------
      appendText(
        'MobileNumber',
        formData.MobileNumber
      );

      appendText(
        'WhatsAppNumber',
        formData.WhatsAppNumber
      );

      appendText(
        'BusinessPhoneNumber',
        formData.BusinessPhoneNumber
      );

      appendText(
        'EmailAddress',
        formData.EmailAddress
      );

      // ---------------------------------------------------------
      // CLINIC
      // ---------------------------------------------------------
      appendText(
        'ClinicName',
        formData.ClinicName
      );

      appendText(
        'ClinicAddress',
        formData.ClinicAddress
      );

      appendText(
        'City',
        formData.City
      );

      appendText(
        'State',
        formData.State
      );

      appendText(
        'Pincode',
        formData.Pincode
      );

      appendText(
        'Country',
        formData.Country
      );

      // ---------------------------------------------------------
      // FEES / CONSULTATION
      // ---------------------------------------------------------
      appendNumberOrEmpty(
        'ClinicConsultationFee',
        formData.ClinicConsultationFee
      );

      appendNumberOrEmpty(
        'VideoConsultationFee',
        formData.VideoConsultationFee
      );

      appendNumberOrEmpty(
        'SecondOpinionFee',
        formData.SecondOpinionFee
      );

      appendNumberOrEmpty(
        'ConsultationDuration',
        formData.ConsultationDuration
      );

      appendNumberOrEmpty(
        'MaximumPatientsPerDay',
        formData.MaximumPatientsPerDay
      );

      // ---------------------------------------------------------
      // WHATSAPP BUSINESS STATUS
      // ---------------------------------------------------------
      appendText(
        'WhatsAppBusinessStatus',
        formData.WhatsAppBusinessStatus
      );

      // ---------------------------------------------------------
      // WORKING HOURS
      //
      // UI:
      // 10:00 AM to 1:00 PM, 4:00 PM to 8:00 PM
      //
      // Backend:
      // 10:00-13:00;16:00-20:00
      //
      // Empty:
      // ""
      // ---------------------------------------------------------
      appendText(
        'Monday',
        convertWorkingHoursToBackend(
          formData.Monday
        )
      );

      appendText(
        'Tuesday',
        convertWorkingHoursToBackend(
          formData.Tuesday
        )
      );

      appendText(
        'Wednesday',
        convertWorkingHoursToBackend(
          formData.Wednesday
        )
      );

      appendText(
        'Thursday',
        convertWorkingHoursToBackend(
          formData.Thursday
        )
      );

      appendText(
        'Friday',
        convertWorkingHoursToBackend(
          formData.Friday
        )
      );

      appendText(
        'Saturday',
        convertWorkingHoursToBackend(
          formData.Saturday
        )
      );

      appendText(
        'Sunday',
        convertWorkingHoursToBackend(
          formData.Sunday
        )
      );

      // ---------------------------------------------------------
      // PAYMENT / BANKING
      // ---------------------------------------------------------
      appendText(
        'UpiId',
        formData.UpiId
      );

      appendText(
        'AccountHolderName',
        formData.AccountHolderName
      );

      appendText(
        'BankName',
        formData.BankName
      );

      appendText(
        'IfscCode',
        formData.IfscCode
      );

      appendText(
        'AccountNumber',
        formData.AccountNumber
      );

      // ---------------------------------------------------------
      // EXISTING SYSTEM FIELDS
      // ---------------------------------------------------------
      appendText(
        'Id',
        formData.Id || doctorId
      );

      appendText(
        'Status',
        formData.Status
      );

      appendText(
        'IsVerified',
        formData.IsVerified
          ? 'true'
          : 'false'
      );

      // Username and Password are intentionally NOT sent
      // through the main profile PUT request.
      // They are updated through their dedicated PATCH APIs above.

      appendText(
        'CreatedAt',
        formData.CreatedAt
      );

      appendText(
        'UpdatedAt',
        formData.UpdatedAt
      );

      // ---------------------------------------------------------
      // DEBUG PAYLOAD
      // ---------------------------------------------------------
      const debugPayload = {};

      formPayload.forEach(
        (value, key) => {
          debugPayload[key] =
            value instanceof File
              ? `[File: ${value.name}]`
              : value;
        }
      );

      console.log(
        'UPDATE Doctor FormData Payload:',
        debugPayload
      );

      // ---------------------------------------------------------
      // PUT REQUEST
      //
      // DO NOT manually set Content-Type.
      // Browser automatically creates multipart boundary.
      // ---------------------------------------------------------
      const response = await axios.put(
        `${API_BASE_URL}/doctors/${doctorId}`,
        formPayload
      );

      console.log(
        'UPDATE Doctor Response:',
        response.data
      );

      // ---------------------------------------------------------
      // UPDATE UI WITH BACKEND RESPONSE
      // ---------------------------------------------------------
      if (response.data) {
        const updatedData =
          response.data;

        setFormData((prev) => ({
          ...prev,
          ...updatedData,

          DateOfBirth:
            updatedData.DateOfBirth
              ? String(
                  updatedData.DateOfBirth
                ).substring(0, 10)
              : prev.DateOfBirth,

          Monday:
            updatedData.Monday !==
            undefined
              ? formatWorkingHours(
                  updatedData.Monday
                )
              : prev.Monday,

          Tuesday:
            updatedData.Tuesday !==
            undefined
              ? formatWorkingHours(
                  updatedData.Tuesday
                )
              : prev.Tuesday,

          Wednesday:
            updatedData.Wednesday !==
            undefined
              ? formatWorkingHours(
                  updatedData.Wednesday
                )
              : prev.Wednesday,

          Thursday:
            updatedData.Thursday !==
            undefined
              ? formatWorkingHours(
                  updatedData.Thursday
                )
              : prev.Thursday,

          Friday:
            updatedData.Friday !==
            undefined
              ? formatWorkingHours(
                  updatedData.Friday
                )
              : prev.Friday,

          Saturday:
            updatedData.Saturday !==
            undefined
              ? formatWorkingHours(
                  updatedData.Saturday
                )
              : prev.Saturday,

          Sunday:
            updatedData.Sunday !==
            undefined
              ? formatWorkingHours(
                  updatedData.Sunday
                )
              : prev.Sunday,
        }));

        localStorage.setItem(
          'doctorProfile',
          JSON.stringify(
            updatedData
          )
        );
      }

      setSuccess(
        'Profile updated successfully.'
      );

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error(
        'UPDATE Doctor Profile Error:',
        err
      );

      console.error(
        'UPDATE Doctor Profile Response:',
        err?.response?.data
      );

      const detail =
        err?.response?.data?.detail;

      let errorMessage =
        'Failed to update doctor profile.';

      if (Array.isArray(detail)) {
        errorMessage = detail
          .map((item) => {
            if (
              typeof item === 'string'
            ) {
              return item;
            }

            if (
              item &&
              typeof item ===
                'object'
            ) {
              const location =
                Array.isArray(
                  item.loc
                )
                  ? item.loc.join(
                      ' → '
                    )
                  : '';

              return location
                ? `${location}: ${
                    item.msg ||
                    'Invalid value'
                  }`
                : item.msg ||
                    'Invalid value';
            }

            return String(item);
          })
          .join('\n');
      } else if (
        typeof detail === 'string'
      ) {
        errorMessage = detail;
      } else if (
        typeof err?.response?.data
          ?.message === 'string'
      ) {
        errorMessage =
          err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // UPDATE USERNAME
  // PATCH /doctors/{doctor_id}/username
  //
  // Request body:
  // {
  //   "UserName": "new_username"
  // }
  // ---------------------------------------------------------
  const handleUsernameUpdate = async () => {
    try {
      setUsernameSaving(true);
      setError('');
      setSuccess('');

      const doctorId = getDoctorId();

      if (!doctorId) {
        setError('Doctor ID not found in localStorage.');
        return;
      }

      const value = usernameValue.trim();

      if (!value) {
        setError('Please enter a username.');
        return;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/doctors/${doctorId}/username`,
        {
          UserName: value,
        }
      );

      const updatedUsername =
        response?.data?.UserName ??
        response?.data?.username ??
        value;

      setUsernameValue(updatedUsername);

      setFormData((prev) => ({
        ...prev,
        UserName: updatedUsername,
      }));

      const storedProfile =
        JSON.parse(
          localStorage.getItem('doctorProfile') || '{}'
        );

      localStorage.setItem(
        'doctorProfile',
        JSON.stringify({
          ...storedProfile,
          UserName: updatedUsername,
        })
      );

      setSuccess('Username updated successfully.');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error(
        'UPDATE Username Error:',
        err
      );

      const detail =
        err?.response?.data?.detail;

      setError(
        Array.isArray(detail)
          ? detail
              .map((item) =>
                typeof item === 'string'
                  ? item
                  : item?.msg || 'Invalid username'
              )
              .join('\n')
          : detail ||
              err?.response?.data?.message ||
              'Failed to update username.'
      );
    } finally {
      setUsernameSaving(false);
    }
  };

  // ---------------------------------------------------------
  // UPDATE PASSWORD
  // PATCH /doctors/{doctor_id}/password
  //
  // Request body:
  // {
  //   "OldPassword": "old_password",
  //   "NewPassword": "new_password"
  // }
  // ---------------------------------------------------------
  const handlePasswordUpdate = async () => {
    try {
      setPasswordSaving(true);
      setError('');
      setSuccess('');

      const doctorId = getDoctorId();

      if (!doctorId) {
        setError('Doctor ID not found in localStorage.');
        return;
      }

      if (!oldPassword.trim()) {
        setError('Please enter your old password.');
        return;
      }

      if (!newPassword.trim()) {
        setError('Please enter your new password.');
        return;
      }

      if (oldPassword === newPassword) {
        setError(
          'New password must be different from the old password.'
        );
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/doctors/${doctorId}/password`,
        {
          OldPassword: oldPassword,
          NewPassword: newPassword,
        }
      );

      // Do not keep plain-text passwords in form state/localStorage.
      setOldPassword('');
      setNewPassword('');
      setShowOldPassword(false);
      setShowNewPassword(false);

      setSuccess('Password updated successfully.');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error(
        'UPDATE Password Error:',
        err
      );

      const detail =
        err?.response?.data?.detail;

      setError(
        Array.isArray(detail)
          ? detail
              .map((item) =>
                typeof item === 'string'
                  ? item
                  : item?.msg || 'Invalid password'
              )
              .join('\n')
          : detail ||
              err?.response?.data?.message ||
              'Failed to update password.'
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  // ---------------------------------------------------------
  // Load profile when component opens
  // ---------------------------------------------------------
  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  // ---------------------------------------------------------
  // File handlers
  // ---------------------------------------------------------
  const handleProfileChange = (e) => {
    if (
      e.target.files &&
      e.target.files[0]
    ) {
      setProfilePhoto(
        e.target.files[0]
      );
    }
  };

  const handleMedicalCertChange = (e) => {
    if (
      e.target.files &&
      e.target.files[0]
    ) {
      setMedicalCert(
        e.target.files[0]
      );
    }
  };

  const handleGovIdChange = (e) => {
    if (
      e.target.files &&
      e.target.files[0]
    ) {
      setGovId(
        e.target.files[0]
      );
    }
  };

  // ---------------------------------------------------------
  // Loading screen
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#D9D9D9] border-t-[#2A723D] rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-[#2A723D] font-semibold">
            Loading Doctor Profile...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Section configurations
  // ---------------------------------------------------------
  const sections = [
    {
      id: 1,
      tag: 'SECTION 01',
      title: 'PERSONAL INFORMATION',
      subtitle:
        'Tell us about yourself.',
      height: '1020px',

      content: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">

            {/* Full Name */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Full Name
              </label>

              <input
                type="text"
                name="FullName"
                value={formData.FullName}
                onChange={handleChange}
                placeholder="Enter Your Full Name"
                style={inputStyle}
                disabled={true}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Username
              </label>

              <input
                type="text"
                name="UserName"
                value={formData.UserName}
                onChange={handleChange}
                placeholder="Username"
                style={inputStyle}
                disabled={true}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Qualification
              </label>

              <input
                type="text"
                name="Qualification"
                value={formData.Qualification}
                onChange={handleChange}
                placeholder="e.g., MBBS, MD - Pediatrics"
                style={inputStyle}
                disabled={!isEditing}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Specialization
              </label>

              <select
                name="Specialization"
                value={formData.Specialization}
                onChange={handleChange}
                style={inputStyle}
                disabled={!isEditing}
                className="text-sm text-gray-800 bg-white focus:outline-none focus:border-[#2A723D] disabled:bg-gray-50 disabled:cursor-not-allowed"
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

                <option value="Pediatrician">
                  Pediatrician
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* Medical Registration Number */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Medical Registration Number
              </label>

              <input
                type="text"
                name="MedicalRegistrationNumber"
                value={
                  formData.MedicalRegistrationNumber
                }
                onChange={handleChange}
                placeholder="Enter Registration Number"
                style={inputStyle}
                disabled={!isEditing}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Gender
              </label>

              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleChange}
                style={inputStyle}
                disabled={!isEditing}
                className="text-sm text-gray-800 bg-white focus:outline-none focus:border-[#2A723D] disabled:bg-gray-50 disabled:cursor-not-allowed"
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
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Date of Birth
              </label>

              <div className="relative w-full">
                <input
                  type="date"
                  name="DateOfBirth"
                  value={formData.DateOfBirth}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={!isEditing}
                  className="text-sm focus:outline-none focus:border-[#2A723D] bg-white disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Mobile Number
              </label>

              <input
                type="text"
                name="MobileNumber"
                value={formData.MobileNumber}
                onChange={handleChange}
                placeholder="Enter 10 - digit Mobile Number"
                style={inputStyle}
                disabled={!isEditing}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Email Address
              </label>

              <input
                type="email"
                name="EmailAddress"
                value={formData.EmailAddress}
                onChange={handleChange}
                placeholder="Enter Professional Email Address"
                style={inputStyle}
                disabled={!isEditing}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                Years of Experience
              </label>

              <input
                type="number"
                name="YearsOfExperience"
                value={
                  formData.YearsOfExperience
                }
                onChange={handleChange}
                placeholder="e.g., 10"
                style={inputStyle}
                disabled={!isEditing}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* WhatsApp Business Number */}
            <div className="md:col-span-2">
              <label className="block text-[14px] font-semibold text-gray-700 mb-3">
                WhatsApp Business Number (optional)
              </label>

              <input
                type="text"
                name="WhatsAppNumber"
                value={formData.WhatsAppNumber}
                onChange={handleChange}
                placeholder="Enter WhatsApp Business Number"
                style={inputStyle}
                disabled={!isEditing}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-3 mt-5">
              Upload Profile Photo
            </label>

            <input
              type="file"
              ref={profileInputRef}
              onChange={handleProfileChange}
              accept="image/jpeg,image/png"
              disabled={!isEditing}
              className="hidden"
            />

            <div
              onClick={() => {
                if (isEditing) {
                  profileInputRef.current?.click();
                }
              }}
              style={{
                width: '100%',
                height: '140px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor: '#AEAEAE',
                borderStyle: 'dashed',
                padding: '20px',
                gap: '8px',
              }}
              className={`flex flex-col items-center justify-center transition bg-white ${
                isEditing
                  ? 'cursor-pointer hover:bg-gray-50'
                  : 'cursor-not-allowed opacity-70'
              }`}
            >
              <span className="text-sm font-semibold text-gray-600">
                {profilePhoto
                  ? profilePhoto.name
                  : formData.ProfilePhoto
                  ? 'Profile photo already uploaded'
                  : 'Click to upload the image'}
              </span>

              <span className="text-sm text-gray-400 mt-0.5">
                JPG, PNG - max 2MB
              </span>
            </div>
          </div>
        </>
      ),
    },

    // =========================================================
    // SECTION 02
    // =========================================================
    {
      id: 2,
      tag: 'SECTION 02',
      title: 'CLINIC INFORMATION',
      subtitle:
        'Help patients find your clinic.',
      height: '555px',

      content: (
        <div className="space-y-4">

          {/* Clinic Name */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-2">
              Clinic Name
            </label>

            <input
              type="text"
              name="ClinicName"
              value={formData.ClinicName}
              onChange={handleChange}
              placeholder="Enter Clinic Name"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

          {/* Clinic Address */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Clinic Address
            </label>

            <textarea
              name="ClinicAddress"
              value={formData.ClinicAddress}
              onChange={handleChange}
              rows="4"
              placeholder="Enter Complete Address"
              style={{
                width: '100%',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor: '#AEAEAE',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '14px',
                paddingRight: '14px',
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white resize-none"
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">

            {/* City */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                City
              </label>

              <input
                type="text"
                name="City"
                value={formData.City}
                onChange={handleChange}
                placeholder="Enter City Name"
                style={smallInputStyle}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
                disabled={!isEditing}
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
                Pincode
              </label>

              <input
                type="text"
                name="Pincode"
                value={formData.Pincode}
                onChange={handleChange}
                placeholder="Enter Pincode"
                style={smallInputStyle}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
                disabled={!isEditing}
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                State
              </label>

              <select
                name="State"
                value={formData.State}
                onChange={handleChange}
                style={smallInputStyle}
                className="text-sm text-gray-800 bg-white focus:outline-none focus:border-[#2A723D]"
                disabled={!isEditing}
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
            </div>

            {/* Country */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
                Country
              </label>

              <select
                name="Country"
                value={formData.Country}
                onChange={handleChange}
                style={smallInputStyle}
                className="text-sm text-gray-800 bg-white focus:outline-none focus:border-[#2A723D]"
                disabled={!isEditing}
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
            </div>

          </div>
        </div>
      ),
    },

    // =========================================================
    // SECTION 03
    // =========================================================
    {
      id: 3,
      tag: 'SECTION 03',
      title: 'CONSULTATION DETAILS',
      subtitle:
        'Configure your consultation preferences.',
      height: '416px',

      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

          {/* Clinic Consultation Fee */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Clinic Consultation Fee (₹)
            </label>

            <input
              type="number"
              name="ClinicConsultationFee"
              value={
                formData.ClinicConsultationFee
              }
              onChange={handleChange}
              placeholder="Enter Amount"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

          {/* Video Consultation Fee */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Video Consultation Fee (₹) (optional)
            </label>

            <input
              type="number"
              name="VideoConsultationFee"
              value={
                formData.VideoConsultationFee
              }
              onChange={handleChange}
              placeholder="Enter Amount"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

          {/* Second Opinion Fee */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Second Opinion Fee (₹) (optional)
            </label>

            <input
              type="number"
              name="SecondOpinionFee"
              value={
                formData.SecondOpinionFee
              }
              onChange={handleChange}
              placeholder="Enter Amount"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

          {/* Consultation Duration */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Consultation Duration
            </label>

            <select
              name="ConsultationDuration"
              value={
                formData.ConsultationDuration
              }
              onChange={handleChange}
              style={smallInputStyle}
              className="text-sm text-gray-800 bg-white focus:outline-none focus:border-[#2A723D]"
              disabled={!isEditing}
            >
              <option value="">
                Select Duration
              </option>

              <option value="10">
                10 Minutes
              </option>

              <option value="15">
                15 Minutes
              </option>

              <option value="20">
                20 Minutes
              </option>

              <option value="30">
                30 Minutes
              </option>

              <option value="45">
                45 Minutes
              </option>

              <option value="60">
                60 Minutes
              </option>
            </select>
          </div>

          {/* Maximum Patients */}
          <div className="md:col-span-2">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Maximum Patients Per Day
            </label>

            <input
              type="number"
              name="MaximumPatientsPerDay"
              value={
                formData.MaximumPatientsPerDay
              }
              onChange={handleChange}
              placeholder="Enter Patients Limit"
              style={{
                width: '100%',
                maxWidth: '49%',
                height: '40px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor: '#AEAEAE',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '14px',
                paddingRight: '14px',
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

        </div>
      ),
    },

    // =========================================================
    // SECTION 04
    // =========================================================
    {
      id: 4,
      tag: 'SECTION 04',
      title: 'WORKING HOURS',
      subtitle:
        'Set your weekly availability. Tick "Off" to close a day.',
      height: '772px',

      content: (
        <div className="border border-[#D9D9D9] rounded-xl p-3 sm:p-4 md:p-5 bg-white">

          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-5 sm:mb-6 border-b border-[#D9D9D9] text-[11px] sm:text-sm font-bold text-[#2A723D] uppercase tracking-wider">

            <span className="w-[20%] sm:w-1/4">
              Day
            </span>

            <span className="w-[62%] sm:w-2/4 text-center">
              Working Hours
            </span>

            <span className="w-[18%] sm:w-1/4 text-right pr-1">
              Off
            </span>
          </div>

          {/* Days */}
          <div className="space-y-5 sm:space-y-8">

            {[
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ].map((day) => (

              <div
                key={day}
                className="flex items-center justify-between text-sm font-semibold text-gray-700"
              >

                {/* Day */}
                <span className="w-[20%] sm:w-1/4 text-[12px] sm:text-[14px] leading-tight">
                  {day}
                </span>

                {/* Working Hours */}
                <div className="w-[62%] sm:w-full px-1 sm:px-2">

                  <input
                    type="text"
                    name={day}
                    value={formData[day] || ''}
                    onChange={handleChange}
                    placeholder="6 PM to 7 PM, 8 PM to 9 PM"
                    style={smallInputStyle}
                    className="text-[11px] sm:text-sm font-normal focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
                    disabled={!isEditing}
                  />

                </div>

                {/* Off Checkbox */}
                <div className="w-[18%] sm:w-1/4 flex justify-end pr-0 sm:pr-2">

                  <input
                    type="checkbox"
                    checked={!formData[day]}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          [day]: '',
                        }));
                      }
                    }}
                    disabled={!isEditing}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      borderColor: '#AEAEAE',
                    }}
                    className="rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
                  />

                </div>

              </div>

            ))}

          </div>
        </div>
      ),
    },

    // =========================================================
    // SECTION 05
    // =========================================================
    {
      id: 5,
      tag: 'SECTION 05',
      title: 'PAYMENT INFORMATION',
      subtitle:
        'Receive consultation payments securely.',
      height: '416px',

      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

          {/* UPI */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              UPI ID (optional)
            </label>

            <input
              type="text"
              name="UpiId"
              value={formData.UpiId}
              onChange={handleChange}
              placeholder="name@upi"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Account Number
            </label>

            <input
              type="text"
              name="AccountNumber"
              value={
                formData.AccountNumber
              }
              onChange={handleChange}
              placeholder="Enter Account Number"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Bank Name
            </label>

            <input
              type="text"
              name="BankName"
              value={formData.BankName}
              onChange={handleChange}
              placeholder="Enter Bank Name"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

          {/* IFSC */}
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              IFSC Code
            </label>

            <input
              type="text"
              name="IfscCode"
              value={formData.IfscCode}
              onChange={handleChange}
              placeholder="Enter IFSC Code"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

          {/* Account Holder */}
          <div className="md:col-span-2">
            <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
              Account Holder Name (optional)
            </label>

            <input
              type="text"
              name="AccountHolderName"
              value={
                formData.AccountHolderName
              }
              onChange={handleChange}
              placeholder="Enter Account Holder Name"
              style={smallInputStyle}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
              disabled={!isEditing}
            />
          </div>

        </div>
      ),
    },

    // =========================================================
    // SECTION 06
    // =========================================================
    {
      id: 6,
      tag: 'SECTION 06',
      title: 'ACCOUNT VERIFICATION & CONSENT',
      subtitle:
        'Verify your identity — all uploads in this section are optional.',
      height: '444px',

      content: (
        <div className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Medical Registration Certificate */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
                Medical Registration Certificate
              </label>

              <input
                type="file"
                ref={medicalInputRef}
                onChange={handleMedicalCertChange}
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                disabled={!isEditing}
              />

              <div
                onClick={() => {
                  if (isEditing) {
                    medicalInputRef.current?.click();
                  }
                }}
                style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor: '#AEAEAE',
                  borderStyle: 'dashed',
                  padding: '20px',
                }}
                className={`flex flex-col items-center justify-center transition bg-white ${
                  isEditing
                    ? 'cursor-pointer hover:bg-gray-50'
                    : 'cursor-not-allowed opacity-70'
                }`}
              >
                <span className="text-sm font-semibold text-gray-600">
                  {medicalCert
                    ? medicalCert.name
                    : 'Click to upload the image'}
                </span>

                <span className="text-sm text-gray-400 mt-0.5">
                  PDF, JPG, PNG - max 5MB
                </span>
              </div>
            </div>

            {/* Government ID */}
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-1.5">
                Government ID (optional)
              </label>

              <input
                type="file"
                ref={govIdInputRef}
                onChange={handleGovIdChange}
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                disabled={!isEditing}
              />

              <div
                onClick={() => {
                  if (isEditing) {
                    govIdInputRef.current?.click();
                  }
                }}
                style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor: '#AEAEAE',
                  borderStyle: 'dashed',
                  padding: '20px',
                }}
                className={`flex flex-col items-center justify-center transition bg-white ${
                  isEditing
                    ? 'cursor-pointer hover:bg-gray-50'
                    : 'cursor-not-allowed opacity-70'
                }`}
              >
                <span className="text-sm font-semibold text-gray-600">
                  {govId
                    ? govId.name
                    : 'Click to upload the image'}
                </span>

                <span className="text-sm text-gray-400 mt-0.5">
                  PDF, JPG, PNG - max 5MB
                </span>
              </div>
            </div>

          </div>

          {/* Consent */}
          <div className="space-y-2.5 pt-1">

            <label className="flex items-center space-x-[12px] text-xs font-semibold text-gray-700 cursor-pointer">

              <input
                type="checkbox"
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  borderColor: '#AEAEAE',
                }}
                className="rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
                disabled={!isEditing}
              />

              <span className="text-[14px]">
                I confirm that the information provided is accurate.
              </span>
            </label>

            <label className="flex items-center space-x-[12px] text-xs font-semibold text-gray-700 cursor-pointer">

              <input
                type="checkbox"
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  borderColor: '#AEAEAE',
                }}
                className="rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
                disabled={!isEditing}
              />

              <span className="text-[14px]">
                I agree to the Terms & Conditions and Privacy Policy.
              </span>
            </label>

            <label className="flex items-center space-x-[12px] text-xs font-semibold text-gray-700 cursor-pointer">

              <input
                type="checkbox"
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  borderColor: '#AEAEAE',
                }}
                className="rounded border-[#AEAEAE] accent-[#2A723D] cursor-pointer"
                disabled={!isEditing}
              />

              <span className="text-[14px]">
                I consent to receive appointment notifications via WhatsApp and Email.
              </span>
            </label>

          </div>
        </div>
      ),
    },
  ];

  // =========================================================
  // RETURN UI
  // =========================================================
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#333333] font-sans">

      {/* =========================================================
          EDIT OPTIONS
          User can choose either Profile editing OR
          Username / Password editing.
          ========================================================= */}
      <div className="w-full flex flex-wrap justify-end gap-3 px-5 pt-5 mb-4">

        {/* EDIT PROFILE */}
        <button
          type="button"
          onClick={() => {
            setIsEditing((prev) => !prev);
            setCredentialsEditing(false);
            setError('');
            setSuccess('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Roboto'] font-semibold text-sm transition-all cursor-pointer ${
            isEditing
              ? 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
              : 'bg-[#2A723D] text-white hover:bg-[#235d32]'
          }`}
        >
          <FiEdit2 size={17} />

          {isEditing
            ? 'Cancel Profile Edit'
            : 'Edit Profile'}
        </button>

        {/* EDIT USERNAME / PASSWORD */}
        <button
          type="button"
          onClick={() => {
            setCredentialsEditing((prev) => !prev);
            setIsEditing(false);
            setError('');
            setSuccess('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Roboto'] font-semibold text-sm transition-all cursor-pointer ${
            credentialsEditing
              ? 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
              : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
          }`}
        >
          <FiEdit2 size={17} />

          {credentialsEditing
            ? 'Cancel Username / Password'
            : 'Edit Username / Password'}
        </button>

      </div>

      {/* =========================================================
          ACCOUNT CREDENTIALS
          Username and password use their dedicated PATCH APIs.
          ========================================================= */}
      <div className="w-full  mb-5">
        <div className="w-full bg-white border border-[#D9D9D9] rounded-2xl shadow-sm p-5">
          <div className="mb-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E26A6A]">
              ACCOUNT SETTINGS
            </span>

            <h2 className="text-[20px] font-['Roboto'] font-bold text-[#2A723D] mt-2">
              UPDATE USERNAME & PASSWORD
            </h2>

            <p className="text-[14px] font-['Roboto'] mt-2 text-gray-500">
              Update your login credentials separately from your doctor profile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* =====================================================
                UPDATE USERNAME
                ===================================================== */}
            <div className="border border-[#E1E1E1] rounded-xl p-5">
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                Username
              </label>

              <input
                type="text"
                value={usernameValue}
                onChange={(e) =>
                  setUsernameValue(e.target.value)
                }
                placeholder="Enter new username"
                style={smallInputStyle}
                disabled={!credentialsEditing || usernameSaving}
                className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={handleUsernameUpdate}
                disabled={
                  !credentialsEditing ||
                  usernameSaving ||
                  !usernameValue.trim()
                }
                className="mt-3 w-full h-[42px] rounded-lg bg-[#2A723D] text-white text-sm font-semibold hover:bg-[#235d32] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {usernameSaving
                  ? 'Updating Username...'
                  : 'Update Username'}
              </button>
            </div>

            {/* =====================================================
                UPDATE PASSWORD
                ===================================================== */}
            <div className="border border-[#E1E1E1] rounded-xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    Old Password
                  </label>

                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) =>
                        setOldPassword(e.target.value)
                      }
                      placeholder="Enter old password"
                      style={{
                        ...smallInputStyle,
                        paddingRight: '44px',
                      }}
                      disabled={!credentialsEditing || passwordSaving}
                      autoComplete="current-password"
                      className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowOldPassword((prev) => !prev)
                      }
                      disabled={!credentialsEditing || passwordSaving}
                      aria-label={
                        showOldPassword
                          ? 'Hide old password'
                          : 'Show old password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2A723D] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {showOldPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Enter new password"
                      style={{
                        ...smallInputStyle,
                        paddingRight: '44px',
                      }}
                      disabled={!credentialsEditing || passwordSaving}
                      autoComplete="new-password"
                      className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword((prev) => !prev)
                      }
                      disabled={!credentialsEditing || passwordSaving}
                      aria-label={
                        showNewPassword
                          ? 'Hide new password'
                          : 'Show new password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2A723D] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {showNewPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <button
                type="button"
                onClick={handlePasswordUpdate}
                disabled={
                  !credentialsEditing ||
                  passwordSaving ||
                  !oldPassword.trim() ||
                  !newPassword.trim()
                }
                className="mt-3 w-full h-[42px] rounded-lg bg-[#2A723D] text-white text-sm font-semibold hover:bg-[#235d32] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {passwordSaving
                  ? 'Updating Password...'
                  : 'Update Password'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-red-50 border border-red-300 text-red-700 px-5 py-3 rounded-lg shadow-lg">
          <span className="whitespace-pre-line">
            {error}
          </span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-green-50 border border-green-300 text-[#2A723D] px-5 py-3 rounded-lg shadow-lg">
          {success}
        </div>
      )}

      {/* Main Content Layout */}
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto flex flex-col"
        style={{ gap: '36px' }}
      >

        {sections.map((sec) => (
          <div
            key={sec.id}
            id={`section-${sec.id}`}
            style={{
              width: '100%',
              height: sec.height,
              borderRadius: '16px',
              borderWidth: '1px',
              padding: '20px',
              opacity: 1,
            }}
            className="bg-white border border-[#D9D9D9] shadow-sm overflow-hidden flex flex-col"
          >

            <div className="mb-4 shrink-0">

              <span className="text-xs font-semibold uppercase tracking-wider text-[#E26A6A]">
                {sec.tag}
              </span>

              <h2 className="text-[20px] font-['Roboto'] font-bold text-[#2A723D] mt-3 mb-1">
                {sec.title}
              </h2>

              <p className="text-[14px] font-['Roboto'] mt-3 mb-1 text-gray-500">
                {sec.subtitle}
              </p>

            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
              {sec.content}
            </div>

          </div>
        ))}

        {/* Submit / Save Button Section */}
        <div className="w-full pt-2 flex justify-end">

          <button
            type="submit"
            disabled={
              saving || !isEditing
            }
            style={{
              width: '220px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#2A723D',
            }}
            className="text-white text-base font-bold shadow-md hover:bg-[#235d32] transition flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving
              ? 'Updating...'
              : 'Update Profile'}
          </button>

        </div>

      </form>
    </div>
  );
};

export default Profile;