import React, { useEffect, useState } from 'react';
import totalPatientsIcon from '../../../../assets/DoctorDashboard/close.png';
import newPatientsIcon from '../../../../assets/DoctorDashboard/caution.png';
import returningIcon from '../../../../assets/DoctorDashboard/time.png';
import followUpIcon from '../../../../assets/DoctorDashboard/profile.png';
import azIcon from '../../../../assets/DoctorDashboard/A-Z.png';
import zaIcon from '../../../../assets/DoctorDashboard/Z-A.png';

// Action Icons
import viewIcon from '../../../../assets/DoctorDashboard/View.png';
import scheduleIcon from '../../../../assets/DoctorDashboard/Appointement.png';


// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Single source of truth for doctor ID
const getDoctorId = () => {
  const doctorId = localStorage.getItem("doctorId");

  console.log("[Auth] doctorId from localStorage:", doctorId);

  return doctorId;
};

const toInputDate = (dateValue) => {
  if (!dateValue || dateValue === "-") return "";

  // Already in the format required by <input type="date">
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue))) {
    return String(dateValue);
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  try {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateValue;
  }
};


// Format mobile number coming from backend.
// Example:
// 918270481285 -> +91 82704 81285
const formatMobileNumber = (mobile) => {
  if (!mobile) return "-";

  const value = String(mobile).replace(/\D/g, "");

  if (value.length === 12 && value.startsWith("91")) {
    const number = value.substring(2);

    return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
  }

  return mobile;
};


// Convert backend patient object into frontend table object
const normalizePatient = (patient, index) => {
  return {
    id: `${patient.Mobile || "patient"}-${index}`,

    name: patient.Name || "-",

    age:
      patient.Age === null ||
      patient.Age === undefined ||
      patient.Age === ""
        ? "-"
        : String(patient.Age),

    mobile: formatMobileNumber(patient.Mobile),

    lastVisit: formatDate(patient.LastVisit),

    nextReview: formatDate(patient.NextReview),

    status: patient.Status || "-",

    // PatientId is now provided by the backend.
    patientId: patient.PatientId || "",
    bloodGroup: patient.BloodGroup || "",
    gender: patient.Gender || "",
    height: patient.Height || "",
    weight: patient.Weight || "",
    email: patient.EmailAddress || patient.Email || "",
    address: patient.Address || "",
    dateOfBirth: patient.DateOfBirth || "",
    customerName: patient.CustomerName || "",
  };
};


const Patients = () => {

  // ============================================================
  // SEARCH / SORT / FILTER
  // ============================================================

  const [searchQuery, setSearchQuery] = useState('');

  // false = A-Z
  // true = Z-A
  const [isZA, setIsZA] = useState(false);

  const [filters, setFilters] = useState({
    Active: false,
    ReviewDue: false,
    Missed: false,
  });


  // ============================================================
  // API STATES
  // ============================================================

  const [patientsList, setPatientsList] = useState([]);

  const [stats, setStats] = useState({
    TotalPatients: 0,
    NewPatients: 0,
    ReturningPatients: 0,
    FollowUpDue: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');


  // ============================================================
  // ADD PATIENT MODAL
  // ============================================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newPatientForm, setNewPatientForm] = useState({
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


  // ============================================================
  // VIEW / EDIT PATIENT MODAL
  // ============================================================

  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);

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


  // ============================================================
  // APPOINTMENT MODAL
  // ============================================================

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] =
    useState(false);

  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    phoneNumber: '',
    mailId: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Clinic',
    fee: '',
    reason: '',
  });

  const [availableAppointmentSlots, setAvailableAppointmentSlots] = useState([]);
  const [selectedAppointmentSlot, setSelectedAppointmentSlot] = useState('');
  const [appointmentSlotsLoading, setAppointmentSlotsLoading] = useState(false);
  const [appointmentCreating, setAppointmentCreating] = useState(false);
  const [appointmentError, setAppointmentError] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState('');


  // ============================================================
  // SUCCESS MODAL
  // ============================================================

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [addedPatientName, setAddedPatientName] = useState('');


  // ============================================================
  // GET DOCTOR PATIENTS
  // ============================================================

  const fetchPatients = async () => {
    const doctorId = getDoctorId();

    if (!doctorId) {
      console.error("[Patients] Doctor ID not found in localStorage");

      setError(
        "Doctor ID not found. Please login again."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError('');

      const url =
        `${API_BASE}/doctors/${encodeURIComponent(doctorId)}/patients`;

      console.log("[Patients] API URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(
        "[Patients] Response status:",
        response.status
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "[Patients] API Error:",
          errorText
        );

        throw new Error(
          `Failed to fetch patients (${response.status})`
        );
      }

      const data = await response.json();

      console.log(
        "[Patients] Backend response:",
        data
      );

      // -----------------------------------------
      // Stats from backend
      // -----------------------------------------

      setStats({
        TotalPatients: Number(data?.TotalPatients || 0),
        NewPatients: Number(data?.NewPatients || 0),
        ReturningPatients: Number(
          data?.ReturningPatients || 0
        ),
        FollowUpDue: Number(
          data?.FollowUpDue || 0
        ),
      });


      // -----------------------------------------
      // Patients from backend
      // -----------------------------------------

      const backendPatients = Array.isArray(
        data?.Patients
      )
        ? data.Patients
        : [];

      const normalizedPatients =
        backendPatients.map(
          normalizePatient
        );

      setPatientsList(normalizedPatients);

    } catch (err) {
      console.error(
        "[Patients] Fetch error:",
        err
      );

      setError(
        err?.message ||
        "Unable to load patients."
      );

      setPatientsList([]);

      setStats({
        TotalPatients: 0,
        NewPatients: 0,
        ReturningPatients: 0,
        FollowUpDue: 0,
      });

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // FETCH WHEN COMPONENT LOADS
  // ============================================================

  useEffect(() => {
    fetchPatients();
  }, []);


  // ============================================================
  // FILTER CHANGE
  // ============================================================

  const handleFilterChange = (filterName) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };


  // ============================================================
  // FORM INPUT
  // ============================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleViewEditInputChange = (e) => {
    const { name, value } = e.target;

    setSelectedPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ============================================================
  // VIEW PATIENT
  // ============================================================

  const handleOpenViewModal = (patient) => {
    setSelectedPatient({
      patientId: patient.patientId || '',
      fullName: patient.name || '',
      age: patient.age === '-' ? '' : patient.age,
      bloodGroup: patient.bloodGroup || '',
      gender: patient.gender || '',
      mobileNumber: patient.mobile || '',
      height: patient.height || '',
      weight: patient.weight || '',
      email: patient.email || '',
      address: patient.address || '',
      dateOfBirth: toInputDate(patient.dateOfBirth),
    });

    setIsViewEditModalOpen(true);
  };


  // ============================================================
  // APPOINTMENT MODAL
  // ============================================================

  const handleOpenAppointmentModal = (patient) => {
    const today = new Date().toISOString().split('T')[0];

    setAppointmentForm({
      patientName: patient?.name || '',
      phoneNumber: patient?.mobile || '',
      mailId: patient?.email || '',
      time: '',
      date: today,
      type: 'Clinic',
      fee: '',
      reason: '',
    });

    setSelectedAppointmentSlot('');
    setAvailableAppointmentSlots([]);
    setAppointmentError('');
    setAppointmentSuccess('');
    setIsAppointmentModalOpen(true);
  };

  // ============================================================
  // FETCH AVAILABLE APPOINTMENT SLOTS
  // ============================================================

  useEffect(() => {
    const fetchAppointmentSlots = async () => {
      if (!isAppointmentModalOpen || !appointmentForm.date) {
        return;
      }

      const doctorId = getDoctorId();

      if (!doctorId) {
        setAvailableAppointmentSlots([]);
        setAppointmentError('Doctor ID not found. Please login again.');
        return;
      }

      try {
        setAppointmentSlotsLoading(true);
        setSelectedAppointmentSlot('');
        setAppointmentError('');

        const url =
          `${API_BASE}/doctors/${encodeURIComponent(doctorId)}/available-slots?target_date=${encodeURIComponent(appointmentForm.date)}`;

        console.log('[Patients Appointment] Available slots URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        });

        const data = await response.json().catch(() => []);

        console.log('[Patients Appointment] Available slots response:', data);

        if (!response.ok) {
          setAvailableAppointmentSlots([]);
          setAppointmentError(
            data?.detail ||
            data?.message ||
            'Unable to load available appointment slots.'
          );
          return;
        }

        const slots = Array.isArray(data)
          ? data
          : data?.slots || data?.AvailableSlots || data?.availableSlots || [];

        setAvailableAppointmentSlots(
          Array.isArray(slots) ? slots : []
        );
      } catch (error) {
        console.error(
          '[Patients Appointment] Failed to fetch available slots:',
          error
        );

        setAvailableAppointmentSlots([]);
        setAppointmentError('Unable to load available appointment slots.');
      } finally {
        setAppointmentSlotsLoading(false);
      }
    };

    fetchAppointmentSlots();
  }, [isAppointmentModalOpen, appointmentForm.date]);

  const getAppointmentSlotValue = (slot) => {
    if (typeof slot === 'string') return slot;

    return (
      slot?.SlotTime ||
      slot?.slotTime ||
      slot?.Time ||
      slot?.time ||
      ''
    );
  };

  const getAppointmentSlotLabel = (slot) => {
    const value = getAppointmentSlotValue(slot);

    if (!value) return '';

    if (value.includes('T')) {
      return value.split('T')[1].slice(0, 5);
    }

    return String(value).slice(0, 5);
  };

  // ============================================================
  // CREATE APPOINTMENT FROM PATIENT SCHEDULE ICON
  // ============================================================

  const handleCreateAppointment = async (e) => {
    e.preventDefault();

    const doctorId = getDoctorId();

    setAppointmentError('');
    setAppointmentSuccess('');

    if (!doctorId) {
      setAppointmentError('Doctor ID not found. Please login again.');
      return;
    }

    if (!appointmentForm.patientName.trim()) {
      setAppointmentError('Please enter Patient Name.');
      return;
    }

    if (!appointmentForm.phoneNumber.trim()) {
      setAppointmentError('Please enter Phone Number.');
      return;
    }

    if (!appointmentForm.date) {
      setAppointmentError('Please select Date.');
      return;
    }

    if (!selectedAppointmentSlot) {
      setAppointmentError('Please select an available time slot.');
      return;
    }

    if (!appointmentForm.type) {
      setAppointmentError('Please select Type.');
      return;
    }

    const slotTimeValue = getAppointmentSlotValue(
      selectedAppointmentSlot
    );

    if (!slotTimeValue) {
      setAppointmentError('Selected time slot is invalid.');
      return;
    }

    const payload = {
      DoctorId: doctorId,
      PatientName: appointmentForm.patientName.trim(),
      PhoneNumber: appointmentForm.phoneNumber.trim(),
      Date: appointmentForm.date,
      Time: slotTimeValue,
      Type: appointmentForm.type,
      Fee: Number(appointmentForm.fee) || 0,
      Reason: appointmentForm.reason.trim(),
      MailId: appointmentForm.mailId.trim(),
    };

    console.log(
      '[Patients Appointment] POST /appointments/manual payload:',
      payload
    );

    try {
      setAppointmentCreating(true);

      const response = await fetch(
        `${API_BASE}/appointments/manual`,
        {
          method: 'POST',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response
        .json()
        .catch(() => ({}));

      console.log(
        '[Patients Appointment] Create response:',
        response.status,
        responseData
      );

      if (!response.ok) {
        setAppointmentError(
          responseData?.detail ||
          responseData?.message ||
          responseData?.error ||
          'Failed to create appointment. Please check the inputs.'
        );
        return;
      }

      setAppointmentSuccess('Appointment created successfully!');

      // Refresh the patient list so Last Visit / Next Review / Status
      // are updated from the backend when the modal closes.
      await fetchPatients();

      setTimeout(() => {
        setIsAppointmentModalOpen(false);
        setAppointmentSuccess('');
        setAppointmentError('');
      }, 700);
    } catch (error) {
      console.error(
        '[Patients Appointment] Create appointment error:',
        error
      );

      setAppointmentError(
        'Network error occurred. Please try again.'
      );
    } finally {
      setAppointmentCreating(false);
    }
  };


  // ============================================================
  // ADD PATIENT
  // ============================================================
  //
  // IMPORTANT:
  // The GET endpoint supplied by you only provides patient data.
  // No POST /patients endpoint was supplied.
  //
  // Therefore this does NOT fake a backend save.
  // It only closes the modal and shows the existing UI message.
  //
  // When your POST endpoint is available, connect it here.
  // ============================================================

  const handleSavePatient = (e) => {
    e.preventDefault();

    if (
      !newPatientForm.fullName ||
      !newPatientForm.mobileNumber
    ) {
      alert(
        'Please fill out required fields (Name and Mobile Number)'
      );

      return;
    }

    setAddedPatientName(
      newPatientForm.fullName
    );

    setIsModalOpen(false);

    setNewPatientForm({
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

    setIsSuccessModalOpen(true);
  };


  // ============================================================
  // UPDATE PATIENT
  // PUT /customers/{patient_id}
  // ============================================================

  const handleUpdatePatient = async (e) => {
    e.preventDefault();

    const patientId = selectedPatient.patientId;

    if (!patientId) {
      alert("Patient ID is missing. Unable to update patient.");
      return;
    }

    if (!selectedPatient.fullName.trim()) {
      alert("Please enter Patient Full Name.");
      return;
    }

    if (!selectedPatient.mobileNumber.trim()) {
      alert("Please enter Mobile Number.");
      return;
    }

    try {
      const url = `${API_BASE}/customers/${encodeURIComponent(patientId)}`;

      const payload = {
        CustomerName: selectedPatient.fullName.trim(),
        PatientName: selectedPatient.fullName.trim(),
        PhoneNumber: selectedPatient.mobileNumber.trim(),
        EmailAddress: selectedPatient.email.trim(),
        DateOfBirth: selectedPatient.dateOfBirth || null,
        BloodGroup: selectedPatient.bloodGroup.trim(),
        Gender: selectedPatient.gender,
        Address: selectedPatient.address.trim(),
      };

      console.log("[Patients] Update URL:", url);
      console.log("[Patients] Update payload:", payload);

      const response = await fetch(url, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Failed to update patient (${response.status})`;

        try {
          const errorData = responseText ? JSON.parse(responseText) : {};

          if (Array.isArray(errorData?.detail)) {
            errorMessage = errorData.detail.map((item) => {
              const field = Array.isArray(item?.loc) ? item.loc.join(".") : "Field";
              return `${field}: ${item?.msg || "Invalid value"}`;
            }).join("\n");
          } else {
            errorMessage = errorData?.detail || errorData?.message || errorData?.error || errorMessage;
          }
        } catch {
          if (responseText) errorMessage = responseText;
        }

        throw new Error(errorMessage);
      }

      alert("Patient updated successfully.");
      setIsViewEditModalOpen(false);
      await fetchPatients();
    } catch (error) {
      console.error("[Patients] Update patient error:", error);
      alert(error?.message || "Unable to update patient. Please try again.");
    }
  };


  // ============================================================
  // DELETE PATIENT
  // DELETE /customers/{patient_id}
  // ============================================================

  const handleDeletePatient = async () => {
    const patientId = selectedPatient.patientId;

    if (!patientId) {
      alert("Patient ID is missing. Unable to delete patient.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedPatient.fullName || "this patient"}?`
    );

    if (!confirmed) return;

    try {
      const url = `${API_BASE}/customers/${encodeURIComponent(patientId)}`;

      console.log("[Patients] Delete URL:", url);

      const response = await fetch(url, {
        method: "DELETE",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Failed to delete patient (${response.status})`;

        try {
          const errorData = responseText ? JSON.parse(responseText) : {};
          errorMessage = errorData?.detail || errorData?.message || errorData?.error || errorMessage;
        } catch {
          if (responseText) errorMessage = responseText;
        }

        throw new Error(errorMessage);
      }

      alert("Patient deleted successfully.");
      setIsViewEditModalOpen(false);
      await fetchPatients();
    } catch (error) {
      console.error("[Patients] Delete patient error:", error);
      alert(error?.message || "Unable to delete patient. Please try again.");
    }
  };


  // ============================================================
  // FILTER + SEARCH + SORT
  // ============================================================

  const filteredPatients = patientsList
    .filter((patient) => {

      const searchValue =
        searchQuery.toLowerCase().trim();

      const patientName =
        String(patient.name || '').toLowerCase();

      const patientMobile =
        String(patient.mobile || '').toLowerCase();

      const matchesSearch =
        patientName.includes(searchValue) ||
        patientMobile.includes(searchValue);


      const activeFiltersCount =
        Object.values(filters).filter(Boolean).length;


      if (activeFiltersCount === 0) {
        return matchesSearch;
      }


      // Backend returns "Booked" in your sample.
      // Treat Booked as the active patient status.
      const matchesActive =
        filters.Active &&
        patient.status === 'Booked';


      const matchesReviewDue =
        filters.ReviewDue &&
        patient.nextReview !== '-';


      const matchesMissed =
        filters.Missed &&
        patient.status === 'Missed';


      return (
        matchesSearch &&
        (
          matchesActive ||
          matchesReviewDue ||
          matchesMissed
        )
      );
    })
    .sort((a, b) => {

      const nameA =
        String(a.name || '');

      const nameB =
        String(b.name || '');

      if (isZA) {
        return nameB.localeCompare(nameA);
      }

      return nameA.localeCompare(nameB);
    });


  // ============================================================
  // STATS DATA
  // ============================================================

  const statsData = [
    {
      title: 'TOTAL PATIENTS',
      value: stats.TotalPatients,
      icon: totalPatientsIcon,
    },
    {
      title: 'NEW PATIENTS',
      value: stats.NewPatients,
      icon: newPatientsIcon,
    },
    {
      title: 'RETURNING PATIENTS',
      value: stats.ReturningPatients,
      icon: returningIcon,
    },
    {
      title: 'FOLLOW-UP DUE',
      value: stats.FollowUpDue,
      icon: followUpIcon,
    },
  ];


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className=" min-h-screen relative">

      {/* ======================================================
          TOP HEADER
      ======================================================= */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">

        <h1 className="text-xl font-bold text-emerald-900 tracking-wide">
          PATIENTS
        </h1>

        <div className="flex items-center gap-4 w-full md:w-auto">

          {/* Search */}

          <div className="relative flex-1 md:w-80">

            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">

              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search by Patient Name, Mobile Number..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />

          </div>


          {/* Add Patient */}

          <button
            onClick={() =>
              setIsModalOpen(true)
            }
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            <span className="text-lg font-bold">
              +
            </span>

            ADD NEW PATIENT
          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}

          <button
            onClick={fetchPatients}
            className="ml-4 font-semibold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}


      {/* ======================================================
          STATS
      ======================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {statsData.map((stat, index) => (

          <div
            key={index}
            style={{
              width: '100%',
              maxWidth: '276px',
              height: '140px',
              borderRadius: '8px',
            }}
            className="bg-white p-5 border border-gray-200 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040]"
          >

            <div className="flex justify-between items-center">

              <h3 className="text-[22px] font-bold text-emerald-900">
                {stat.value}
              </h3>

              <img
                src={stat.icon}
                alt={stat.title}
                className="w-10 h-10 object-contain"
              />

            </div>

            <div>

              <p className="text-sm text-emerald-700 tracking-wider">
                {stat.title}
              </p>

            </div>

          </div>

        ))}

      </div>


      {/* ======================================================
          FILTER + SORT
      ======================================================= */}

      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 mb-6">

        {/* Sorting */}

        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">

          <img
            src={azIcon}
            alt="A-Z Sort"
            className="w-5 h-5 object-contain"
          />

          <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">

            <input
              type="checkbox"
              name="toggle"
              id="toggle"
              checked={isZA}
              onChange={(e) =>
                setIsZA(e.target.checked)
              }
              className="peer sr-only"
            />

            <label
              htmlFor="toggle"
              className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-blue-600 transition-colors"
            />

            <span className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6 shadow-sm" />

          </div>

          <img
            src={zaIcon}
            alt="Z-A Sort"
            className="w-5 h-5 object-contain"
          />

        </div>


        {/* Filters */}

        <div className="flex items-center gap-6 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-xs w-full md:w-auto">

          <span className="text-sm text-emerald-900 font-medium">
            Filter by:
          </span>


          <label className="flex items-center gap-2 text-sm text-emerald-900 cursor-pointer">

            <input
              type="checkbox"
              checked={filters.Active}
              onChange={() =>
                handleFilterChange('Active')
              }
              className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 w-4 h-4"
            />

            Active

          </label>


          <label className="flex items-center gap-2 text-sm text-emerald-900 cursor-pointer">

            <input
              type="checkbox"
              checked={filters.ReviewDue}
              onChange={() =>
                handleFilterChange('ReviewDue')
              }
              className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 w-4 h-4"
            />

            Review Due

          </label>


          <label className="flex items-center gap-2 text-sm text-emerald-900 cursor-pointer">

            <input
              type="checkbox"
              checked={filters.Missed}
              onChange={() =>
                handleFilterChange('Missed')
              }
              className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-600 w-4 h-4"
            />

            Missed

          </label>

        </div>

      </div>


      {/* ======================================================
          PATIENT TABLE
      ======================================================= */}

      <div className="w-full bg-white border border-[#D9D9D9] rounded-[16px] overflow-hidden shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-[#346739] text-white text-[14px] font-['Poppins']">

                <th className="py-5 px-6 font-semibold text-center whitespace-nowrap">
                  NAME
                </th>

                <th className="py-5 px-6 font-semibold text-center whitespace-nowrap">
                  AGE
                </th>

                <th className="py-5 px-6 font-semibold text-center whitespace-nowrap">
                  MOBILE NUMBER
                </th>

                <th className="py-5 px-6 font-semibold text-center whitespace-nowrap">
                  LAST VISIT
                </th>

                <th className="py-5 px-6 font-semibold text-center whitespace-nowrap">
                  NEXT REVIEW
                </th>

                <th className="py-5 px-6 font-semibold text-center whitespace-nowrap">
                  ACTIONS
                </th>

              </tr>

            </thead>

            <tbody className="text-[14px] font-['Roboto']">

              {/* Loading */}

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="py-12 text-center text-gray-500"
                  >

                    <div className="flex flex-col items-center justify-center gap-3">

                      <div className="w-7 h-7 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />

                      <span>
                        Loading patients...
                      </span>

                    </div>

                  </td>

                </tr>

              ) : filteredPatients.length > 0 ? (

                filteredPatients.map(
                  (patient, index) => (

                    <tr
                      key={patient.id || index}
                      className="border-b border-[#D9D9D9] hover:bg-[#F9F9F9] transition-colors"
                    >

                      {/* NAME */}

                      <td className="py-5 px-6 font-medium text-[#346739] text-center whitespace-nowrap">
                        {patient.name}
                      </td>


                      {/* AGE */}

                      <td className="py-5 px-6 text-[#666666] text-center whitespace-nowrap">
                        {patient.age}
                      </td>


                      {/* MOBILE NUMBER */}

                      <td className="py-5 px-6 text-[#666666] text-center whitespace-nowrap">
                        {patient.mobile}
                      </td>


                      {/* LAST VISIT */}

                      <td className="py-5 px-6 text-[#666666] text-center whitespace-nowrap">
                        {patient.lastVisit}
                      </td>


                      {/* NEXT REVIEW */}

                      <td className="py-5 px-6 text-[#666666] text-center whitespace-nowrap">
                        {patient.nextReview}
                      </td>


                      {/* ACTIONS */}

                      <td className="py-5 px-6 text-center">

                        <div className="flex items-center justify-center gap-[8px]">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenViewModal(
                                patient
                              )
                            }
                            className="w-[36px] h-[36px] flex items-center justify-center border border-[#D9D9D9] rounded-[8px] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                            title="View"
                          >

                            <img
                              src={viewIcon}
                              alt="View"
                              className="w-[20px] h-[20px] object-contain"
                            />

                          </button>


                          {/* APPOINTMENT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenAppointmentModal(
                                patient
                              )
                            }
                            className="w-[36px] h-[36px] flex items-center justify-center border border-[#D9D9D9] rounded-[8px] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                            title="Schedule Appointment"
                          >

                            <img
                              src={scheduleIcon}
                              alt="Schedule"
                              className="w-[20px] h-[20px] object-contain"
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="py-10 text-center text-[#666666]"
                  >
                    No matching patients found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ======================================================
          ADD NEW PATIENT MODAL
      ======================================================= */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pt-40  overflow-y-auto">

          <div className="bg-white rounded-2xl mt-20 shadow-xl w-full max-w-2xl overflow-hidden my-8 flex flex-col">

            <div className="px-8 pt-6 pb-2 flex-shrink-0">

              <h2 className="text-xl font-bold text-emerald-900">
                ADD A NEW PATIENT
              </h2>

            </div>


            <form
              onSubmit={handleSavePatient}
              className="px-8 py-4 space-y-4 overflow-y-auto flex-1"
            >

              <div className="border border-gray-300 p-5 rounded-xl">


                {/* Full Name */}

                <div>

                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Patient Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={newPatientForm.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter Patient Full Name"
                    className="w-full px-4 py-2.5 mb-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 placeholder-gray-400"
                    required
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
                      name="age"
                      value={newPatientForm.age}
                      onChange={handleInputChange}
                      placeholder="e.g., 30"
                      className="w-full px-4 py-2.5 bg-white mb-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 placeholder-gray-400"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Blood Group
                    </label>

                    <input
                      type="text"
                      name="bloodGroup"
                      value={newPatientForm.bloodGroup}
                      onChange={handleInputChange}
                      placeholder="e.g., O+"
                      className="w-full px-4 py-2.5 bg-white mb-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 placeholder-gray-400"
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
                      name="gender"
                      value={newPatientForm.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white border mb-3 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
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
                      name="mobileNumber"
                      value={newPatientForm.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10 - digit mobile number"
                      className="w-full px-4 py-2.5 bg-white border mb-3 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 placeholder-gray-400"
                      required
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
                      name="height"
                      value={newPatientForm.height}
                      onChange={handleInputChange}
                      placeholder="e.g., 160cms"
                      className="w-full px-4 py-2.5 bg-white mb-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 placeholder-gray-400"
                    />

                  </div>


                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Weight
                    </label>

                    <input
                      type="text"
                      name="weight"
                      value={newPatientForm.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 65kgs"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 mb-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 placeholder-gray-400"
                    />

                  </div>

                </div>


                {/* Email */}

                <div>

                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={newPatientForm.email}
                    onChange={handleInputChange}
                    placeholder="name@email.com"
                    className="w-full px-4 py-2.5 bg-white border mb-3 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 placeholder-gray-400"
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
                    value={newPatientForm.address}
                    onChange={handleInputChange}
                    placeholder="Enter Full Address"
                    className="w-full px-4 py-2.5 bg-white border mb-3 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 placeholder-gray-400 resize-none"
                  />

                </div>

              </div>


              {/* Footer */}

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 mt-6 flex-shrink-0">

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="px-6 py-2.5 border border-emerald-800 text-emerald-900 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Save Patient
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          VIEW / EDIT PATIENT MODAL
      ======================================================= */}

      {isViewEditModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">

          <div className="bg-white rounded-2xl shadow-xl mt-80 w-full max-w-2xl overflow-hidden my-8 relative">

            <div className="flex justify-between items-center px-8 pt-6 pb-2">

              <h2 className="text-xl font-bold text-emerald-900">
                VIEW & EDIT PATIENT
              </h2>

              <button
                onClick={() =>
                  setIsViewEditModalOpen(false)
                }
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 cursor-pointer text-lg font-semibold"
              >
                &times;
              </button>

            </div>


            <form
              onSubmit={handleUpdatePatient}
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
                    value={
                      selectedPatient.patientId ||
                      "Not provided by API"
                    }
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />

                </div>


                {/* Date of Birth */}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={selectedPatient.dateOfBirth || ""}
                    onChange={handleViewEditInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                  />
                </div>


                {/* Full Name */}

                <div className="mb-4">

                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Patient Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={selectedPatient.fullName}
                    onChange={
                      handleViewEditInputChange
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    required
                  />

                </div>


                {/* Age / Blood */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Age
                    </label>

                    <input
                      type="text"
                      name="age"
                      value={selectedPatient.age}
                      onChange={
                        handleViewEditInputChange
                      }
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
                      value={
                        selectedPatient.bloodGroup
                      }
                      onChange={
                        handleViewEditInputChange
                      }
                      placeholder="Not provided"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    />

                  </div>

                </div>


                {/* Gender / Mobile */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={
                        selectedPatient.gender
                      }
                      onChange={
                        handleViewEditInputChange
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
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
                      name="mobileNumber"
                      value={
                        selectedPatient.mobileNumber
                      }
                      onChange={
                        handleViewEditInputChange
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                      required
                    />

                  </div>

                </div>


                {/* Height / Weight */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                  <div>

                    <label className="block text-sm font-medium text-emerald-900 mb-2">
                      Height
                    </label>

                    <input
                      type="text"
                      name="height"
                      value={
                        selectedPatient.height
                      }
                      onChange={
                        handleViewEditInputChange
                      }
                      placeholder="Not provided"
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
                      value={
                        selectedPatient.weight
                      }
                      onChange={
                        handleViewEditInputChange
                      }
                      placeholder="Not provided"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800"
                    />

                  </div>

                </div>


                {/* Email */}

                <div className="mb-4">

                  <label className="block text-sm font-medium text-emerald-900 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      selectedPatient.email
                    }
                    onChange={
                      handleViewEditInputChange
                    }
                    placeholder="Not provided"
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
                    value={
                      selectedPatient.address
                    }
                    onChange={
                      handleViewEditInputChange
                    }
                    placeholder="Not provided"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-800 resize-none"
                  />

                </div>

              </div>


              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200 mt-6">

                <button
                  type="button"
                  onClick={handleDeletePatient}
                  className="px-6 py-2.5 bg-[#C94A4A] hover:bg-[#b53f3f] text-white rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Delete Patient
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
          APPOINTMENT MODAL
      ======================================================= */}

      {isAppointmentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[16px] overflow-y-auto"
          onClick={() => {
            if (!appointmentCreating) {
              setIsAppointmentModalOpen(false);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[719px] bg-[#FFFFFF] rounded-[8px] p-[24px] sm:p-[36px] flex flex-col gap-[20px] shadow-2xl relative my-auto"
          >
            <h2 className="font-['Roboto'] font-semibold text-[20px] leading-[40px] tracking-[0.01em] text-[#346739] m-0 uppercase">
              CREATE A NEW APPOINTMENT
            </h2>

            {appointmentSuccess && (
              <div className="w-full bg-[#EBF0EB] border border-[#346739] text-[#346739] rounded-[8px] p-[12px] text-center font-['Roboto'] font-medium text-[14px]">
                {appointmentSuccess}
              </div>
            )}

            {appointmentError && (
              <div className="w-full bg-[#FDF2F2] border border-[#BD4444] text-[#BD4444] rounded-[8px] p-[12px] text-center font-['Roboto'] font-medium text-[14px] whitespace-pre-line">
                {appointmentError}
              </div>
            )}

            <form
              onSubmit={handleCreateAppointment}
              className="w-full flex flex-col gap-[16px]"
            >
              <div className="w-full bg-transparent border border-[#D9D9D9] rounded-[16px] p-[16px] flex flex-col gap-[16px]">

                {/* Patient Name */}
                <div className="flex flex-col gap-[4px] w-full">
                  <label className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={appointmentForm.patientName}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        patientName: e.target.value,
                      }))
                    }
                    placeholder="Enter Patient Name"
                    className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
                  />
                </div>

                {/* Phone / Mail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] w-full">
                  <div className="flex flex-col gap-[4px] w-full">
                    <label className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={appointmentForm.phoneNumber}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                      placeholder="Enter Phone Number"
                      className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
                    />
                  </div>

                  <div className="flex flex-col gap-[4px] w-full">
                    <label className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                      Mail ID
                    </label>
                    <input
                      type="email"
                      value={appointmentForm.mailId}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({
                          ...prev,
                          mailId: e.target.value,
                        }))
                      }
                      placeholder="Enter Email ID"
                      className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
                    />
                  </div>
                </div>

                {/* Date / Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] w-full">
                  <div className="flex flex-col gap-[4px] w-full">
                    <label className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                      Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={appointmentForm.date}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]"
                    />
                  </div>

                  <div className="flex flex-col gap-[4px] w-full">
                    <label className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                      Available Time Slot
                    </label>
                    <select
                      value={selectedAppointmentSlot}
                      onChange={(e) => {
                        setSelectedAppointmentSlot(e.target.value);
                        setAppointmentForm((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }));
                      }}
                      disabled={
                        appointmentSlotsLoading ||
                        availableAppointmentSlots.length === 0
                      }
                      className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] disabled:bg-[#F7F7F7] disabled:text-[#999999]"
                    >
                      <option value="">
                        {appointmentSlotsLoading
                          ? 'Loading slots...'
                          : availableAppointmentSlots.length === 0
                            ? 'No slots available'
                            : 'Select time slot'}
                      </option>

                      {availableAppointmentSlots.map((slot, index) => {
                        const value = getAppointmentSlotValue(slot);
                        const label = getAppointmentSlotLabel(slot);

                        return (
                          <option
                            key={`${value}-${index}`}
                            value={value}
                          >
                            {label || value}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Type / Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] w-full">
                  <div className="flex flex-col gap-[4px] w-full">
                    <label className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                      Type
                    </label>
                    <select
                      value={appointmentForm.type}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]"
                    >
                      <option value="Clinic">Clinic</option>
                      <option value="Video Consultation">Video Consultation</option>
                      <option value="Second Opinion">Second Opinion</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-[4px] w-full">
                    <label className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                      Fee
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={appointmentForm.fee}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({
                          ...prev,
                          fee: e.target.value,
                        }))
                      }
                      placeholder="e.g., 500"
                      className="w-full h-[44px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-[4px] w-full">
                  <label className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
                    Reason
                  </label>
                  <textarea
                    rows="4"
                    value={appointmentForm.reason}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    placeholder="e.g., Fever"
                    className="w-full h-[100px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] py-[8px] outline-none font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#346739] placeholder-[#A3A3A3] resize-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-[16px] w-full mt-[4px]">
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  disabled={appointmentCreating}
                  className="flex-1 h-[44px] flex items-center justify-center rounded-[8px] bg-[#FFFFFF] border border-[#346739] transition-all duration-300 hover:bg-[#EBF0EB] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] disabled:opacity-50"
                >
                  <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]">
                    Cancel
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={appointmentCreating || appointmentSlotsLoading}
                  className="group flex-1 h-[44px] flex items-center justify-center rounded-[8px] bg-[#346739] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#346739] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] disabled:opacity-50"
                >
                  <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#FFFFFF] group-hover:text-[#346739]">
                    {appointmentCreating ? 'Creating...' : 'Create'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ======================================================
          SUCCESS MODAL
      ======================================================= */}

      {isSuccessModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">

            <button
              onClick={() =>
                setIsSuccessModalOpen(false)
              }
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 cursor-pointer text-lg font-semibold"
            >
              &times;
            </button>


            <div className="border border-gray-300 rounded-xl p-8 text-center mt-8">

              <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-sm">
                &#10003;
              </div>


              <h3 className="text-xl font-bold text-emerald-600 mb-6">
                Successfully Added
              </h3>


              <p className="text-gray-700 text-sm">

                <span className="font-bold text-gray-900">
                  {addedPatientName || 'Patient'}
                </span>

                {' '}is added to your patient list.

              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Patients;