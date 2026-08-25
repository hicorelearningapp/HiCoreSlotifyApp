import React, { useState, useEffect, useMemo, useRef } from 'react';

// Import icons as requested
import SearchIcon from '../../../assets/DoctorDashboard/SearchIcon.png';
import LeftArrowIcon from '../../../assets/DoctorDashboard/LeftArrowIcon.png';
import RightArrowIcon from '../../../assets/DoctorDashboard/RightArrowIcon.png';
import ChevronDownIcon from '../../../assets/DoctorDashboard/ChevronDownIcon.png';
import FilterCalendarIcon from '../../../assets/DoctorDashboard/FilterCalendarIcon.png';

// ============================================================
// API
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// ============================================================
// DOCTOR ID
// ============================================================

const getDoctorId = () => {
  const doctorId = localStorage.getItem("doctorId");

  console.log("[Auth] doctorId from localStorage:", doctorId);

  return doctorId;
};

// ============================================================
// FILTER TYPE
// ============================================================

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

// ============================================================
// STATUS MAPPER
// ============================================================

const mapStatusToBackend = (uiStatus) => {
  if (!uiStatus || uiStatus === 'Select Status') {
    return null;
  }

  if (uiStatus === 'No Show') {
    return 'NoShow';
  }

  if (uiStatus === 'Not Available') {
    return 'NotAvailable';
  }

  if (uiStatus === 'No Show') {
    return 'NoShow';
  }

  return uiStatus;
};

// ============================================================
// DATE HELPERS
// ============================================================

const formatDateKey = (dateObj) => {
  if (!dateObj) return '';

  return `${dateObj.getFullYear()}-${String(
    dateObj.getMonth() + 1
  ).padStart(2, '0')}-${String(
    dateObj.getDate()
  ).padStart(2, '0')}`;
};

const getTodayDateKey = () => {
  return formatDateKey(new Date());
};

const isTodayOrFuture = (dateObj) => {
  if (!dateObj) return false;

  return formatDateKey(dateObj) >= getTodayDateKey();
};

// ============================================================
// EXPANDED APPOINTMENT DETAILS
// ============================================================

const ExpandedDetails = ({
  appointment,
  onUpdateSuccess
}) => {
  const [innerStatusOpen, setInnerStatusOpen] = useState(false);
  const [innerTypeOpen, setInnerTypeOpen] = useState(false);

  const [selectedInnerStatus, setSelectedInnerStatus] =
    useState(
      appointment.status || 'Select Status'
    );

  const [selectedInnerType, setSelectedInnerType] =
    useState(
      appointment.type || 'Select Type'
    );

  const [reason, setReason] = useState(
    appointment.reason || ''
  );

  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    'Available',
    'Booked',
    'Completed',
    'Confirmed',
    'Cancelled',
    'No Show',
    'Not Available'
  ];

  const typeOptions = [
    'In-Person',
    'Video Consultation',
    'Second Opinion'
  ];

  // ==========================================================
  // SAVE APPOINTMENT STATUS
  // ==========================================================

  const handleSaveChanges = async () => {
    setUpdating(true);

    const doctorId = getDoctorId();
    const appointmentId = appointment?.id;

    console.log(
      '[ExpandedDetails] doctorId:',
      doctorId
    );

    console.log(
      '[ExpandedDetails] appointmentId:',
      appointmentId
    );

    if (!doctorId) {
      alert(
        'Doctor not logged in. Please log in again.'
      );

      setUpdating(false);
      return;
    }

    if (!appointmentId) {
      alert('Invalid appointment ID.');

      setUpdating(false);
      return;
    }

    // Never use doctor ID as appointment ID.
    if (
      String(appointmentId) ===
      String(doctorId)
    ) {
      console.error(
        '[ExpandedDetails] Invalid ID mapping',
        {
          doctorId,
          appointmentId
        }
      );

      alert(
        'Invalid appointment ID. The doctor ID was passed as the appointment ID.'
      );

      setUpdating(false);
      return;
    }

    try {
      const requestUrl =
        `${API_BASE}/appointments/${encodeURIComponent(
          appointmentId
        )}/status`;

      const backendStatus =
        mapStatusToBackend(
          selectedInnerStatus
        ) || selectedInnerStatus;

      const requestBody = {
        Status: backendStatus,
        ReMarks: reason
      };

      console.log(
        '[ExpandedDetails] PATCH URL:',
        requestUrl
      );

      console.log(
        '[ExpandedDetails] PATCH Body:',
        requestBody
      );

      const response = await fetch(
        requestUrl,
        {
          method: 'PATCH',
          cache: 'no-store',
          headers: {
            'Content-Type':
              'application/json',
            Accept:
              'application/json'
          },
          body: JSON.stringify(
            requestBody
          )
        }
      );

      console.log(
        '[ExpandedDetails] PATCH status:',
        response.status
      );

      const result =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        console.error(
          '[ExpandedDetails] PATCH failed:',
          {
            status:
              response.status,
            appointmentId,
            doctorId,
            response:
              result
          }
        );

        alert(
          result.detail ||
          result.message ||
          'Failed to update appointment status.'
        );

        setUpdating(false);
        return;
      }

      console.log(
        '[ExpandedDetails] Appointment status updated:',
        result
      );

      const returnedDoctorId =
        result.DoctorId ||
        result.doctorId ||
        null;

      if (
        returnedDoctorId &&
        String(returnedDoctorId) !==
          String(doctorId)
      ) {
        console.error(
          '[ExpandedDetails] Doctor mismatch:',
          {
            loggedInDoctorId:
              doctorId,
            appointmentDoctorId:
              returnedDoctorId,
            appointmentId
          }
        );

        alert(
          'This appointment does not belong to the logged-in doctor.'
        );

        setUpdating(false);
        return;
      }

      alert(
        'Appointment status updated successfully!'
      );

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      console.error(
        '[ExpandedDetails] PATCH error:',
        error
      );

      alert(
        'An error occurred while updating the appointment status.'
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full bg-[#FBFBFB] border border-[#D9D9D9] border-t-0 rounded-b-[8px] p-[16px] lg:p-[24px] flex flex-col lg:flex-row gap-[20px]">

      {/* LEFT SUMMARY */}
      <div className="w-full lg:w-[148px] h-auto lg:min-h-[266px] flex flex-row lg:flex-col justify-between items-start rounded-[8px] p-[16px] border border-[#1C71DA] bg-[#1C71DA0D] shrink-0 gap-[16px] flex-wrap">

        <div className="flex flex-col">
          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1A202C]">
            Date:
          </span>

          <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-[#1C71DA]">
            {appointment.date}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1A202C]">
            Payment Amount:
          </span>

          <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-[#1C71DA]">
            ₹{appointment.fee || '0'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1A202C]">
            Payment Status:
          </span>

          <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-[#1C71DA]">
            {appointment.paymentStatus || 'Pending'}
          </span>
        </div>

      </div>

      {/* RIGHT FORM */}
      <div className="flex-1 h-auto lg:min-h-[266px] rounded-[8px] border border-[#D9D9D9] p-[16px] flex flex-col gap-[20px]">

        <div className="flex flex-col md:flex-row gap-[20px] w-full">

          {/* STATUS */}
          <div className="flex flex-col gap-[4px] w-full flex-1 relative z-20">

            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
              Status
            </span>

            <div
              onClick={() => {
                setInnerStatusOpen(
                  !innerStatusOpen
                );

                setInnerTypeOpen(false);
              }}
              className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${
                innerStatusOpen
                  ? 'border-[#346739]'
                  : 'border-[#A3A3A3]'
              }`}
            >

              <span
                className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${
                  selectedInnerStatus !==
                  'Select Status'
                    ? 'text-[#346739]'
                    : 'text-[#A3A3A3]'
                }`}
              >
                {selectedInnerStatus}
              </span>

              <img
                src={ChevronDownIcon}
                alt="Down"
                className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${
                  innerStatusOpen
                    ? 'rotate-180'
                    : ''
                }`}
              />

            </div>

            {innerStatusOpen && (
              <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">

                {statusOptions.map(
                  (opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedInnerStatus(
                          opt
                        );

                        setInnerStatusOpen(
                          false
                        );
                      }}
                      className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
                    >
                      {opt}
                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* TYPE */}
          <div className="flex flex-col gap-[4px] w-full flex-1 relative z-10">

            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
              Type
            </span>

            <div
              onClick={() => {
                setInnerTypeOpen(
                  !innerTypeOpen
                );

                setInnerStatusOpen(false);
              }}
              className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${
                innerTypeOpen
                  ? 'border-[#346739]'
                  : 'border-[#A3A3A3]'
              }`}
            >

              <span
                className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${
                  selectedInnerType !==
                  'Select Type'
                    ? 'text-[#346739]'
                    : 'text-[#A3A3A3]'
                }`}
              >
                {selectedInnerType}
              </span>

              <img
                src={ChevronDownIcon}
                alt="Down"
                className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${
                  innerTypeOpen
                    ? 'rotate-180'
                    : ''
                }`}
              />

            </div>

            {innerTypeOpen && (
              <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">

                {typeOptions.map(
                  (opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedInnerType(
                          opt
                        );

                        setInnerTypeOpen(
                          false
                        );
                      }}
                      className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
                    >
                      {opt}
                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>

        {/* REASON */}
        <div className="flex flex-col gap-[4px] w-full">

          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#346739]">
            Reason
          </span>

          <input
            type="text"
            value={reason}
            onChange={(e) =>
              setReason(
                e.target.value
              )
            }
            placeholder="e.g., Fever"
            className="w-full h-[48px] bg-[#FFFFFF] border border-[#AEAEAE] rounded-[8px] px-[16px] outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#A3A3A3]"
          />

        </div>

        {/* SAVE */}
        <div className="flex justify-end mt-auto pt-[12px]">

          <button
            onClick={
              handleSaveChanges
            }
            disabled={updating}
            className="w-[129px] h-[36px] flex items-center justify-center rounded-[16px] bg-[#1C71DA] border border-transparent transition-all duration-300 hover:bg-[#FFFFFF] hover:border-[#1C71DA] hover:shadow-[0px_4px_4px_0px_#00000040,inset_4px_4px_4px_0px_#00000040] group disabled:opacity-50"
          >

            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#FFFFFF] group-hover:text-[#1C71DA]">
              {updating
                ? 'Saving...'
                : 'Save Changes'}
            </span>

          </button>

        </div>

      </div>

    </div>
  );
};

// ============================================================
// MAIN CALENDAR
// ============================================================

const Calendar = () => {

  // ==========================================================
  // STATE
  // ==========================================================

  const [activeView, setActiveView] =
    useState('Monthly');

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [expandedRow, setExpandedRow] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [
    appointmentsList,
    setAppointmentsList
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [todaySummary, setTodaySummary] =
    useState({
      total: 0,
      booked: 0,
      completed: 0
    });

  // Selected calendar date
  const [selectedDate, setSelectedDate] =
    useState(null);

  // Whether selected date was marked Not Available
  const [
    selectedDateNotAvailable,
    setSelectedDateNotAvailable
  ] = useState(false);

  // Not Available API loading
  const [
    notAvailableUpdating,
    setNotAvailableUpdating
  ] = useState(false);

  // Filter bar
  const [isStatusOpen, setIsStatusOpen] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState('Select Status');

  const [isTypeOpen, setIsTypeOpen] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState('Select Type');

  const filterDateInputRef =
    useRef(null);

  // ==========================================================
  // FILTER OPTIONS FROM BACKEND
  // ==========================================================

  const [statusOptions, setStatusOptions] =
    useState([]);

  const [typeOptions, setTypeOptions] =
    useState([]);

  const [filterOptionsLoading, setFilterOptionsLoading] =
    useState(true);

  const displayStatusName = (name) => {
    const value = String(name || '').trim();

    const labels = {
      NoShow: 'No Show',
      NotAvailable: 'Not Available'
    };

    return labels[value] || value;
  };

  const displayTypeName = (name) => {
    const value = String(name || '').trim();

    const labels = {
      VideoConsultation: 'Video Consultation',
      SecondOpinion: 'Second Opinion'
    };

    return labels[value] || value;
  };

  const fetchFilterOptions = async () => {
    try {
      setFilterOptionsLoading(true);

      const [statusResponse, typeResponse] =
        await Promise.all([
          fetch(
            `${API_BASE}/status-types?skip=0&limit=100`,
            {
              method: 'GET',
              cache: 'no-store',
              headers: {
                Accept: 'application/json'
              }
            }
          ),
          fetch(
            `${API_BASE}/consultation-types?skip=0&limit=100`,
            {
              method: 'GET',
              cache: 'no-store',
              headers: {
                Accept: 'application/json'
              }
            }
          )
        ]);

      const statusData =
        await statusResponse
          .json()
          .catch(() => []);

      const typeData =
        await typeResponse
          .json()
          .catch(() => []);

      if (!statusResponse.ok) {
        console.error(
          '[Calendar] Status types API failed:',
          statusResponse.status,
          statusData
        );
      }

      if (!typeResponse.ok) {
        console.error(
          '[Calendar] Consultation types API failed:',
          typeResponse.status,
          typeData
        );
      }

      const statusItems =
        Array.isArray(statusData)
          ? statusData
          : (
              statusData.data ||
              statusData.items ||
              statusData.StatusTypes ||
              statusData.statusTypes ||
              []
            );

      const typeItems =
        Array.isArray(typeData)
          ? typeData
          : (
              typeData.data ||
              typeData.items ||
              typeData.ConsultationTypes ||
              typeData.consultationTypes ||
              []
            );

      const activeStatus =
        statusItems
          .filter(
            (item) =>
              item &&
              item.IsActive !== false
          )
          .map(
            (item) =>
              displayStatusName(item.Name)
          )
          .filter(Boolean);

      const activeTypes =
        typeItems
          .filter(
            (item) =>
              item &&
              item.IsActive !== false
          )
          .map(
            (item) =>
              displayTypeName(item.Name)
          )
          .filter(Boolean);

      setStatusOptions(
        [...new Set(activeStatus)]
      );

      setTypeOptions(
        [...new Set(activeTypes)]
      );

      console.log(
        '[Calendar] Status types:',
        activeStatus
      );

      console.log(
        '[Calendar] Consultation types:',
        activeTypes
      );
    } catch (error) {
      console.error(
        '[Calendar] Failed to fetch filter options:',
        error
      );

      setStatusOptions([]);
      setTypeOptions([]);
    } finally {
      setFilterOptionsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // ==========================================================
  // TODAY SUMMARY
  // ==========================================================

  const fetchTodaySummary =
    async () => {

      const doctorId =
        getDoctorId();

      if (!doctorId) {
        setTodaySummary({
          total: 0,
          booked: 0,
          completed: 0
        });

        return;
      }

      try {

        const params =
          new URLSearchParams();

        params.set(
          'doctor_id',
          doctorId
        );

        params.set(
          'filter_type',
          'today'
        );

        const requestUrl =
          `${API_BASE}/appointments?${params.toString()}`;

        console.log(
          '[Calendar] Today summary request URL:',
          requestUrl
        );

        const response =
          await fetch(
            requestUrl,
            {
              method: 'GET',
              cache: 'no-store',
              headers: {
                Accept:
                  'application/json'
              }
            }
          );

        if (!response.ok) {

          console.error(
            '[Calendar] Today summary request failed:',
            response.status
          );

          setTodaySummary({
            total: 0,
            booked: 0,
            completed: 0
          });

          return;
        }

        const data =
          await response
            .json()
            .catch(() => ({}));

        const items =
          Array.isArray(data)
            ? data
            : (
                data.Appointments ||
                data.appointments ||
                data.data ||
                []
              );

        const validItems =
          Array.isArray(items)
            ? items.filter(
                (item) => {

                  const returnedDoctorId =
                    item.DoctorId ||
                    item.doctorId ||
                    item.Doctor?.Id ||
                    item.doctor?.Id ||
                    null;

                  if (
                    !item?.Id ||
                    !returnedDoctorId
                  ) {
                    return false;
                  }

                  if (
                    String(
                      returnedDoctorId
                    ) !==
                    String(doctorId)
                  ) {
                    return false;
                  }

                  if (
                    String(item.Id) ===
                    String(doctorId)
                  ) {
                    return false;
                  }

                  return true;
                }
              )
            : [];

        const booked =
          validItems.filter(
            (item) =>
              String(
                item.Status || ''
              )
                .trim()
                .toLowerCase() ===
              'booked'
          ).length;

        const completed =
          validItems.filter(
            (item) =>
              String(
                item.Status || ''
              )
                .trim()
                .toLowerCase() ===
              'completed'
          ).length;

        setTodaySummary({
          total:
            validItems.length,
          booked,
          completed
        });

      } catch (error) {

        console.error(
          '[Calendar] fetchTodaySummary error:',
          error
        );

        setTodaySummary({
          total: 0,
          booked: 0,
          completed: 0
        });
      }
    };

  // ==========================================================
  // FETCH APPOINTMENTS
  // ==========================================================

  const fetchAppointments =
    async () => {

      setLoading(true);

      // Prevent showing stale data
      setAppointmentsList([]);

      const doctorId =
        getDoctorId();

      if (!doctorId) {

        console.error(
          '[Calendar] Missing doctorId'
        );

        setLoading(false);

        return;
      }

      const params =
        new URLSearchParams();

      params.set(
        'doctor_id',
        doctorId
      );

      // Selected date has priority
      if (selectedDate) {

        params.set(
          'target_date',
          formatDateKey(
            selectedDate
          )
        );

      } else {

        const filterType =
          mapFilterType(
            activeView
          );

        if (filterType) {
          params.set(
            'filter_type',
            filterType
          );
        }
      }

      const backendStatus =
        mapStatusToBackend(
          selectedStatus
        );

      if (backendStatus) {

        params.set(
          'status',
          backendStatus
        );
      }

      const requestUrl =
        `${API_BASE}/appointments?${params.toString()}`;

      console.log(
        '[Calendar] Request DoctorId:',
        doctorId
      );

      console.log(
        '[Calendar] Request URL:',
        requestUrl
      );

      try {

        const response =
          await fetch(
            requestUrl,
            {
              method: 'GET',
              cache: 'no-store',
              headers: {
                Accept:
                  'application/json'
              }
            }
          );

        console.log(
          '[Calendar] fetchAppointments status:',
          response.status
        );

        if (!response.ok) {

          const errData =
            await response
              .json()
              .catch(() => ({}));

          console.error(
            '[Calendar] Backend error:',
            {
              status:
                response.status,
              doctorId,
              response:
                errData
            }
          );

          setLoading(false);

          return;
        }

        const data =
          await response
            .json()
            .catch(() => ({}));

        const items =
          Array.isArray(data)
            ? data
            : (
                data.Appointments ||
                data.appointments ||
                data.data ||
                []
              );

        console.log(
          '========== CALENDAR BACKEND APPOINTMENTS =========='
        );

        console.log(
          '[Calendar] Backend Response:',
          data
        );

        if (
          !Array.isArray(items) ||
          items.length === 0
        ) {

          console.log(
            '[Calendar] No appointments returned.'
          );

          setAppointmentsList([]);

          setLoading(false);

          return;
        }

        // ======================================================
        // VALIDATE APPOINTMENTS
        // ======================================================

        const validItems =
          items.filter(
            (item) => {

              const returnedDoctorId =
                item.DoctorId ||
                item.doctorId ||
                item.Doctor?.Id ||
                item.doctor?.Id ||
                null;

              if (!item?.Id) {

                console.warn(
                  '[Calendar] Missing Appointment ID:',
                  item
                );

                return false;
              }

              if (!returnedDoctorId) {

                console.warn(
                  '[Calendar] Missing DoctorId:',
                  item
                );

                return false;
              }

              if (
                String(
                  returnedDoctorId
                ) !==
                String(doctorId)
              ) {

                console.error(
                  '[Calendar] Blocked another doctor appointment:',
                  {
                    AppointmentId:
                      item.Id,
                    AppointmentDoctorId:
                      returnedDoctorId,
                    LoggedInDoctorId:
                      doctorId
                  }
                );

                return false;
              }

              if (
                String(item.Id) ===
                String(doctorId)
              ) {

                console.error(
                  '[Calendar] Appointment ID equals Doctor ID:',
                  {
                    AppointmentId:
                      item.Id,
                    DoctorId:
                      doctorId
                  }
                );

                return false;
              }

              return true;
            }
          );

        // ======================================================
        // FORMAT
        // ======================================================

        const formatted =
          validItems.map(
            (item) => {

              const patientObj =
                item.patient || {};

              const paymentObj =
                Array.isArray(
                  item.payments
                ) &&
                item.payments.length >
                  0
                  ? item.payments[0]
                  : {};

              const status =
                item.Status ||
                'Booked';

              let statusColor =
                'text-[#1C71DA]';

              if (
                status ===
                'Completed'
              ) {
                statusColor =
                  'text-[#008000]';

              } else if (
                status ===
                'Cancelled'
              ) {
                statusColor =
                  'text-[#FF0000]';

              } else if (
                status ===
                'Waiting'
              ) {
                statusColor =
                  'text-[#DEB821]';

              } else if (
                status ===
                  'Not Available' ||
                status ===
                  'NotAvailable'
              ) {
                statusColor =
                  'text-[#9747FF]';

              } else if (
                status ===
                  'No Show' ||
                status ===
                  'NoShow'
              ) {
                statusColor =
                  'text-[#626262]';
              }

              return {
                id: item.Id,

                doctorId:
                  item.DoctorId,

                date:
                  item.Date,

                startTime:
                  item.SlotStartTime ||
                  '-',

                endTime:
                  item.SlotEndTime ||
                  '-',

                name:
                  item.PatientName ||
                  patientObj.PatientName ||
                  'Unknown',

                phone:
                  patientObj.PhoneNumber
                    ? `+${patientObj.PhoneNumber}`
                    : '-',

                status,

                statusColor,

                type:
                  item.ConsultationType,

                paymentStatus:
                  paymentObj.Status ||
                  'Pending',

                fee:
                  paymentObj.Payment ||
                  item.doctor
                    ?.ClinicConsultationFee ||
                  '0',

                reason:
                  item.ReMarks
              };
            }
          );

        setAppointmentsList(
          formatted
        );

        // ======================================================
        // CHECK BACKEND NOT AVAILABLE STATUS
        // ======================================================

        if (selectedDate) {

          const hasNotAvailable =
            formatted.some(
              (apt) => {

                const status =
                  String(
                    apt.status || ''
                  )
                    .trim()
                    .toLowerCase();

                return (
                  status ===
                    'notavailable' ||
                  status ===
                    'not available'
                );
              }
            );

          setSelectedDateNotAvailable(
            hasNotAvailable
          );
        }

      } catch (error) {

        console.error(
          '[Calendar] fetchAppointments error:',
          error
        );

        setAppointmentsList([]);

      } finally {

        setLoading(false);
      }
    };

  // ==========================================================
  // FETCH WHEN FILTER CHANGES
  // ==========================================================

  useEffect(() => {

    fetchAppointments();

    if (
      activeView === 'Today' &&
      !selectedDate
    ) {
      fetchTodaySummary();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeView,
    selectedDate,
    selectedStatus
  ]);

  // ==========================================================
  // CALENDAR LOGIC
  // ==========================================================

  const getDaysInMonth =
    (year, month) =>
      new Date(
        year,
        month + 1,
        0
      ).getDate();

  const getFirstDayOfMonth =
    (year, month) =>
      new Date(
        year,
        month,
        1
      ).getDay();

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const daysInCurrentMonth =
    getDaysInMonth(
      year,
      month
    );

  const daysInPrevMonth =
    getDaysInMonth(
      year,
      month - 1
    );

  const firstDayIndex =
    getFirstDayOfMonth(
      year,
      month
    );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const daysOfWeek = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT"
  ];

  // ==========================================================
  // APPOINTMENTS BY DATE
  // ==========================================================

  const appointmentsByDate =
    useMemo(() => {

      const map = {};

      appointmentsList.forEach(
        (apt) => {

          if (!apt.date) {
            return;
          }

          const key =
            String(
              apt.date
            ).slice(0, 10);

          if (!map[key]) {
            map[key] = [];
          }

          map[key].push(apt);
        }
      );

      return map;

    }, [
      appointmentsList
    ]);

  // ==========================================================
  // CALENDAR DAYS
  // ==========================================================

  const calendarDays = [];

  for (
    let i = firstDayIndex;
    i > 0;
    i--
  ) {

    calendarDays.push({
      day:
        daysInPrevMonth -
        i +
        1,

      isCurrentMonth:
        false,

      dateObj:
        new Date(
          year,
          month - 1,
          daysInPrevMonth -
            i +
            1
        )
    });
  }

  for (
    let i = 1;
    i <= daysInCurrentMonth;
    i++
  ) {

    calendarDays.push({
      day: i,

      isCurrentMonth:
        true,

      dateObj:
        new Date(
          year,
          month,
          i
        )
    });
  }

  const remainingDays =
    42 -
    calendarDays.length;

  for (
    let i = 1;
    i <= remainingDays;
    i++
  ) {

    calendarDays.push({
      day: i,

      isCurrentMonth:
        false,

      dateObj:
        new Date(
          year,
          month + 1,
          i
        )
    });
  }

  let displayedDays =
    calendarDays;

  if (
    activeView ===
    'Weekly'
  ) {

    let currentIndex =
      calendarDays.findIndex(
        (item) =>
          item.dateObj
            .getFullYear() ===
            currentDate
              .getFullYear() &&
          item.dateObj
            .getMonth() ===
            currentDate
              .getMonth() &&
          item.dateObj
            .getDate() ===
            currentDate
              .getDate()
      );

    if (
      currentIndex === -1
    ) {
      currentIndex = 0;
    }

    const weekStart =
      Math.floor(
        currentIndex / 7
      ) * 7;

    displayedDays =
      calendarDays.slice(
        weekStart,
        weekStart + 7
      );
  }

  // ==========================================================
  // TABLE FILTER
  // ==========================================================

  const filteredAppointments =
    appointmentsList.filter(
      (apt) => {

        const matchesSearch =
          (apt.name || '')
            .toLowerCase()
            .includes(
              searchQuery
                .toLowerCase()
            );

        const matchesType =
          selectedType ===
            'Select Type' ||
          displayTypeName(apt.type) ===
            selectedType;

        return (
          matchesSearch &&
          matchesType
        );
      }
    );

  const totalCount =
    filteredAppointments.length;

  const selectedDateKey =
    selectedDate
      ? formatDateKey(
          selectedDate
        )
      : null;

  // ==========================================================
  // MONTH HANDLERS
  // ==========================================================

  const handlePrevMonth =
    () => {

      setCurrentDate(
        new Date(
          year,
          month - 1,
          1
        )
      );
    };

  const handleNextMonth =
    () => {

      setCurrentDate(
        new Date(
          year,
          month + 1,
          1
        )
      );
    };

  // ==========================================================
  // TODAY
  // ==========================================================

  const handleToday =
    () => {

      setCurrentDate(
        new Date()
      );

      setSelectedDate(
        null
      );

      setSelectedDateNotAvailable(
        false
      );

      setActiveView(
        'Today'
      );
    };

  // ==========================================================
  // DATE CLICK
  // ==========================================================

  const handleDateClick =
    (dateObj) => {

      setSelectedDate(
        dateObj
      );

      setExpandedRow(
        null
      );

      const dateKey =
        formatDateKey(
          dateObj
        );

      // Check current loaded records first.
      const existing =
        appointmentsList.filter(
          (apt) =>
            String(
              apt.date || ''
            ).slice(0, 10) ===
            dateKey
        );

      const hasNotAvailable =
        existing.some(
          (apt) => {

            const status =
              String(
                apt.status || ''
              )
                .trim()
                .toLowerCase();

            return (
              status ===
                'notavailable' ||
              status ===
                'not available'
            );
          }
        );

      setSelectedDateNotAvailable(
        hasNotAvailable
      );
    };

  // ==========================================================
  // CLEAR DATE
  // ==========================================================

  const handleClearDateFilter =
    () => {

      setSelectedDate(
        null
      );

      setSelectedDateNotAvailable(
        false
      );
    };

  // ==========================================================
  // DATE PICKER
  // ==========================================================

  const handleOpenDatePicker =
    () => {

      if (
        !filterDateInputRef.current
      ) {
        return;
      }

      if (
        typeof filterDateInputRef
          .current
          .showPicker ===
        'function'
      ) {

        filterDateInputRef
          .current
          .showPicker();

      } else {

        filterDateInputRef
          .current
          .click();
      }
    };

  // ==========================================================
  // DATE PICKER CHANGE
  // ==========================================================

  const handleFilterDateChange =
    (event) => {

      const value =
        event.target.value;

      if (!value) {
        return;
      }

      const [
        selectedYear,
        selectedMonth,
        selectedDay
      ] =
        value
          .split('-')
          .map(Number);

      const pickedDate =
        new Date(
          selectedYear,
          selectedMonth - 1,
          selectedDay
        );

      setCurrentDate(
        new Date(
          selectedYear,
          selectedMonth - 1,
          1
        )
      );

      setSelectedDate(
        pickedDate
      );

      setSelectedDateNotAvailable(
        false
      );

      setExpandedRow(
        null
      );
    };

  // ==========================================================
  // NOT AVAILABLE API
  // ==========================================================
  //
  // Same API used by the existing Appointments screen:
  //
  // PATCH /appointments/status/bulk
  //
  // {
  //   AppointmentIds: [...],
  //   Status: "NotAvailable",
  //   ReMarks: "Marked as not available by the doctor."
  // }
  //
  // ==========================================================

  const handleMarkDateNotAvailable =
    async () => {

      if (!selectedDate) {

        alert(
          'Please select a date first.'
        );

        return;
      }

      // IMPORTANT:
      // Past dates cannot be marked Not Available.
      if (
        !isTodayOrFuture(
          selectedDate
        )
      ) {

        alert(
          'Not Available can only be applied to today or a future date.'
        );

        return;
      }

      if (
        selectedDateNotAvailable
      ) {
        return;
      }

      const doctorId =
        getDoctorId();

      if (!doctorId) {

        alert(
          'Doctor not logged in. Please log in again.'
        );

        return;
      }

      const dateKey =
        formatDateKey(
          selectedDate
        );

      // ======================================================
      // GET APPOINTMENTS FOR SELECTED DATE
      // ======================================================

      const appointmentIds =
        appointmentsList
          .filter(
            (apt) =>
              String(
                apt.date || ''
              ).slice(0, 10) ===
              dateKey
          )
          .map(
            (apt) =>
              apt.id
          )
          .filter(Boolean)
          .filter(
            (id) =>
              String(id) !==
              String(doctorId)
          );

      console.log(
        '[Calendar Not Available] Selected Date:',
        dateKey
      );

      console.log(
        '[Calendar Not Available] Appointment IDs:',
        appointmentIds
      );

      // ======================================================
      // EXISTING API REQUIRES APPOINTMENT IDS
      // ======================================================

      if (
        appointmentIds.length ===
        0
      ) {

        alert(
          'No appointments are available for the selected date. The current Not Available API requires Appointment IDs.'
        );

        return;
      }

      try {

        setNotAvailableUpdating(
          true
        );

        const requestUrl =
          `${API_BASE}/appointments/status/bulk`;

        const requestBody = {
          AppointmentIds:
            appointmentIds,

          Status:
            'NotAvailable',

          ReMarks:
            'Marked as not available by the doctor.'
        };

        console.log(
          '[Calendar Not Available] Request URL:',
          requestUrl
        );

        console.log(
          '[Calendar Not Available] Request Body:',
          requestBody
        );

        const response =
          await fetch(
            requestUrl,
            {
              method: 'PATCH',

              cache: 'no-store',

              headers: {
                'Content-Type':
                  'application/json',

                Accept:
                  'application/json'
              },

              body:
                JSON.stringify(
                  requestBody
                )
            }
          );

        const responseData =
          await response
            .json()
            .catch(() => ({}));

        console.log(
          '[Calendar Not Available] Response:',
          responseData
        );

        if (!response.ok) {

          console.error(
            '[Calendar Not Available] Backend error:',
            responseData
          );

          alert(
            responseData.detail ||
            responseData.message ||
            `Failed to mark ${dateKey} as not available.`
          );

          return;
        }

        // ====================================================
        // SUCCESS
        // ====================================================

        console.log(
          '[Calendar Not Available] Success'
        );

        // Show message inside selected date box.
        setSelectedDateNotAvailable(
          true
        );

        // Immediately update displayed appointment status.
        setAppointmentsList(
          (prev) =>
            prev.map(
              (apt) => {

                const aptDate =
                  String(
                    apt.date || ''
                  ).slice(
                    0,
                    10
                  );

                if (
                  aptDate !==
                  dateKey
                ) {
                  return apt;
                }

                return {
                  ...apt,

                  status:
                    'NotAvailable',

                  statusColor:
                    'text-[#9747FF]',

                  reason:
                    'Marked as not available by the doctor.'
                };
              }
            )
        );

        alert(
          `${dateKey} marked as not available successfully.`
        );

        // Refresh backend data.
        await fetchAppointments();

        if (
          activeView ===
            'Today' &&
          !selectedDate
        ) {
          await fetchTodaySummary();
        }

      } catch (error) {

        console.error(
          '[Calendar Not Available] Network error:',
          error
        );

        alert(
          'An error occurred while marking the selected date as not available.'
        );

      } finally {

        setNotAvailableUpdating(
          false
        );
      }
    };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="flex flex-col gap-[24px] w-full max-w-full pb-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">

        <div className="flex items-center gap-[12px] flex-wrap">

          <h2 className="font-['Roboto'] font-semibold text-[20px] leading-[40px] text-[#346739] m-0 uppercase">
            CALENDAR
          </h2>

          <span className="h-[28px] px-[12px] flex items-center justify-center rounded-[14px] bg-[#1C71DA0D] border border-[#1C71DA] font-['Roboto'] font-semibold text-[13px] text-[#1C71DA]">
            {loading
              ? '...'
              : totalCount}{' '}

            {selectedDate
              ? `on ${selectedDateKey}`
              : activeView ===
                'Today'
              ? 'today'
              : activeView ===
                'Weekly'
              ? 'this week'
              : 'this month'}
          </span>

          {/* TODAY SUMMARY */}

          {activeView ===
            'Today' &&
            !selectedDate && (
              <>
                <span className="h-[28px] px-[12px] flex items-center justify-center rounded-[14px] bg-[#1C71DA0D] border border-[#1C71DA] font-['Roboto'] font-semibold text-[13px] text-[#1C71DA]">
                  {loading
                    ? '...'
                    : todaySummary.booked}{' '}
                  Booked
                </span>

                <span className="h-[28px] px-[12px] flex items-center justify-center rounded-[14px] bg-[#0080000D] border border-[#008000] font-['Roboto'] font-semibold text-[13px] text-[#008000]">
                  {loading
                    ? '...'
                    : todaySummary.completed}{' '}
                  Completed
                </span>
              </>
            )}

          {/* CLEAR DATE */}

          {selectedDate && (
            <button
              onClick={
                handleClearDateFilter
              }
              className="h-[28px] px-[12px] flex items-center justify-center gap-[4px] rounded-[14px] bg-[#FBFBFB] border border-[#AEAEAE] font-['Roboto'] font-normal text-[13px] text-[#626262] hover:bg-[#F3F3F3] transition-colors"
            >
              × Clear date
            </button>
          )}

        </div>

        {/* SEARCH */}

        <div className="w-full md:w-[492px] h-[44px] flex items-center gap-[8px] px-[16px] py-[8px] border border-[#AEAEAE] rounded-[8px] bg-[#FFFFFF]">

          <img
            src={SearchIcon}
            alt="Search"
            className="w-[24px] h-[24px] object-contain shrink-0"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            placeholder="Search by Patient Name"
            className="flex-1 w-full bg-transparent outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#AEAEAE]"
          />

        </div>

      </div>

      {/* ======================================================
          MONTH NAVIGATION
      ====================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">

        <div className="flex items-center gap-[16px]">

          <button
            onClick={
              handlePrevMonth
            }
            className="hover:opacity-70 transition-opacity"
          >
            <img
              src={LeftArrowIcon}
              alt="Previous"
              className="w-[24px] h-[24px] object-contain cursor-pointer"
            />
          </button>

          <span className="font-['Roboto'] font-semibold text-[14px] leading-[28px] text-[#626262] w-[100px] text-center">
            {monthNames[month]}{' '}
            {year}
          </span>

          <button
            onClick={
              handleNextMonth
            }
            className="hover:opacity-70 transition-opacity"
          >
            <img
              src={RightArrowIcon}
              alt="Next"
              className="w-[24px] h-[24px] object-contain cursor-pointer"
            />
          </button>

        </div>

      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <div className="w-full flex flex-col xl:flex-row justify-between items-start xl:items-center py-[16px] px-[16px] md:px-[28px] rounded-[8px] border border-[#1C71DA] bg-[#FBFBFB] gap-4 relative z-30">

        <div className="flex flex-col sm:flex-row items-center gap-[16px] md:gap-[24px] w-full xl:w-auto">

          {/* STATUS */}

          <div className="flex items-center gap-[8px] w-full sm:w-auto">

            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1C71DA]">
              Status
            </span>

            <div className="relative w-full sm:w-[221px]">

              <div
                onClick={() => {

                  setIsStatusOpen(
                    !isStatusOpen
                  );

                  setIsTypeOpen(
                    false
                  );
                }}
                className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${
                  isStatusOpen
                    ? 'border-[#346739]'
                    : 'border-[#A3A3A3]'
                }`}
              >

                <span
                  className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${
                    selectedStatus !==
                    'Select Status'
                      ? 'text-[#346739]'
                      : 'text-[#A3A3A3]'
                  }`}
                >
                  {selectedStatus}
                </span>

                <img
                  src={
                    ChevronDownIcon
                  }
                  alt="Down"
                  className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${
                    isStatusOpen
                      ? 'rotate-180'
                      : ''
                  }`}
                />

              </div>

              {isStatusOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">

                  <div
                    onClick={() => {
                      setSelectedStatus(
                        'Select Status'
                      );

                      setIsStatusOpen(
                        false
                      );
                    }}
                    className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
                  >
                    All Status
                  </div>

                  {filterOptionsLoading ? (
                    <div className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#A3A3A3]">
                      Loading...
                    </div>
                  ) : (
                    statusOptions.map(
                      (opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setSelectedStatus(
                              opt
                            );

                            setIsStatusOpen(
                              false
                            );
                          }}
                          className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
                        >
                          {opt}
                        </div>
                      )
                    )
                  )}

                </div>
              )}

            </div>

          </div>

          {/* TYPE */}

          <div className="flex items-center gap-[8px] w-full sm:w-auto">

            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] tracking-[0.01em] text-[#1C71DA]">
              Type
            </span>

            <div className="relative w-full sm:w-[221px]">

              <div
                onClick={() => {

                  setIsTypeOpen(
                    !isTypeOpen
                  );

                  setIsStatusOpen(
                    false
                  );
                }}
                className={`w-full h-[44px] flex items-center justify-between px-[12px] bg-[#FFFFFF] border rounded-[8px] cursor-pointer transition-colors ${
                  isTypeOpen
                    ? 'border-[#346739]'
                    : 'border-[#A3A3A3]'
                }`}
              >

                <span
                  className={`font-['Roboto'] font-normal text-[14px] leading-[28px] ${
                    selectedType !==
                    'Select Type'
                      ? 'text-[#346739]'
                      : 'text-[#A3A3A3]'
                  }`}
                >
                  {selectedType}
                </span>

                <img
                  src={
                    ChevronDownIcon
                  }
                  alt="Down"
                  className={`w-[16px] h-[16px] object-contain transition-transform duration-300 ${
                    isTypeOpen
                      ? 'rotate-180'
                      : ''
                  }`}
                />

              </div>

              {isTypeOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-[#FFFFFF] border border-[#346739] rounded-[8px] py-[8px] shadow-lg z-50">

                  <div
                    onClick={() => {
                      setSelectedType(
                        'Select Type'
                      );

                      setIsTypeOpen(
                        false
                      );
                    }}
                    className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
                  >
                    All Types
                  </div>

                  {filterOptionsLoading ? (
                    <div className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#A3A3A3]">
                      Loading...
                    </div>
                  ) : (
                    typeOptions.map(
                      (opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setSelectedType(
                              opt
                            );

                            setIsTypeOpen(
                              false
                            );
                          }}
                          className="px-[16px] py-[8px] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] hover:bg-[#F3F3F3] cursor-pointer transition-colors"
                        >
                          {opt}
                        </div>
                      )
                    )
                  )}

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ====================================================
            VIEW BUTTONS + DATE + NOT AVAILABLE
        ==================================================== */}

        <div className="flex items-center gap-[8px] w-full xl:w-auto overflow-x-auto scrollbar-hide pb-2 xl:pb-0 z-10">

          {[
            'Today',
            'Weekly',
            'Monthly'
          ].map(
            (view) => (

              <button
                key={view}
                onClick={() => {

                  setActiveView(
                    view
                  );

                  setSelectedDate(
                    null
                  );

                  setSelectedDateNotAvailable(
                    false
                  );

                  if (
                    view ===
                    'Today'
                  ) {

                    setCurrentDate(
                      new Date()
                    );

                    fetchTodaySummary();

                  } else {

                    setTodaySummary({
                      total: 0,
                      booked: 0,
                      completed: 0
                    });
                  }
                }}
                className={`h-[44px] w-[78px] px-[12px] flex items-center justify-center rounded-[8px] border border-[#1C71DA] font-['Roboto'] font-normal text-[14px] transition-colors shrink-0 ${
                  activeView ===
                  view
                    ? 'bg-[#1C71DA0D] text-[#1C71DA]'
                    : 'bg-[#FFFFFF] text-[#1C71DA]'
                }`}
              >
                {view}
              </button>

            )
          )}

          {/* DATE PICKER */}

          <button
            type="button"
            onClick={
              handleOpenDatePicker
            }
            aria-label="Select calendar date"
            className="relative w-[44px] h-[44px] flex items-center justify-center border border-[#1C71DA] bg-[#FFFFFF] rounded-[8px] shrink-0 hover:bg-[#1C71DA0D] transition-colors"
          >

            <img
              src={
                FilterCalendarIcon
              }
              alt="Calendar"
              className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] object-contain"
            />

            <input
              ref={
                filterDateInputRef
              }
              type="date"
              value={
                selectedDate
                  ? formatDateKey(
                      selectedDate
                    )
                  : ''
              }
              onChange={
                handleFilterDateChange
              }
              tabIndex={-1}
              aria-label="Select date"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

          </button>

          {/* ==================================================
              NOT AVAILABLE BUTTON
              Only today + future
          ================================================== */}

          {selectedDate &&
            isTodayOrFuture(
              selectedDate
            ) && (

              <button
                type="button"
                onClick={
                  handleMarkDateNotAvailable
                }
                disabled={
                  notAvailableUpdating ||
                  selectedDateNotAvailable
                }
                className={`h-[44px] px-[20px] flex items-center justify-center gap-[8px] rounded-[8px] border font-['Roboto'] font-medium text-[14px] transition-colors shrink-0 ${
                  selectedDateNotAvailable
                    ? 'bg-[#9747FF] border-[#9747FF] text-white cursor-not-allowed'
                    : 'bg-[#D69E2E] border-[#D69E2E] text-white hover:bg-[#B7791F] hover:border-[#B7791F]'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >

                <span className="text-base leading-none">
                  🚫
                </span>

                {notAvailableUpdating
                  ? 'UPDATING...'
                  : 'NOT AVAILABLE'}

              </button>

            )}

        </div>

      </div>

      {/* ======================================================
          CALENDAR GRID
      ====================================================== */}

      {activeView !==
        'Today' && (

        <div className="w-full border border-[#D9D9D9] rounded-[8px] bg-[#FFFFFF] overflow-hidden flex flex-col">

          <div className="w-full overflow-x-auto scrollbar-hide">

            <div className="min-w-[800px] flex flex-col">

              {/* DAYS HEADER */}

              <div className="w-full h-[60px] bg-[#D9D9D9] grid grid-cols-7 items-center px-[8px] py-[16px]">

                {daysOfWeek.map(
                  (
                    dayName,
                    index
                  ) => (

                    <span
                      key={index}
                      className="font-['Roboto'] font-semibold text-[14px] leading-[28px] text-[#1A202C] text-center uppercase"
                    >
                      {dayName}
                    </span>

                  )
                )}

              </div>

              {/* CALENDAR CELLS */}

              <div className="p-[16px] grid grid-cols-7 gap-[8px] sm:gap-[12px] bg-[#FFFFFF]">

                {displayedDays.map(
                  (
                    item,
                    index
                  ) => {

                    const formattedDay =
                      item.day < 10
                        ? `0${item.day}`
                        : item.day;

                    const dateKey =
                      formatDateKey(
                        item.dateObj
                      );

                    const dayAppointments =
                      appointmentsByDate[
                        dateKey
                      ] || [];

                    const dayCount =
                      dayAppointments.length;

                    const visibleNames =
                      dayAppointments.slice(
                        0,
                        2
                      );

                    const extraCount =
                      dayCount -
                      visibleNames.length;

                    const isSelected =
                      item.isCurrentMonth &&
                      selectedDateKey ===
                        dateKey;

                    return (

                      <div
                        key={index}
                        onClick={() => {

                          if (
                            item.isCurrentMonth
                          ) {

                            handleDateClick(
                              item.dateObj
                            );
                          }

                        }}
                        className={`h-[90px] sm:h-[116px] border rounded-[8px] p-[8px] sm:p-[12px] flex flex-col overflow-hidden transition-colors duration-200 relative ${
                          item.isCurrentMonth
                            ? `cursor-pointer hover:border-[#D9D9D9] ${
                                isSelected
                                  ? 'bg-[#1C71DA0D] border-[#1C71DA]'
                                  : 'bg-[#FFFFFF] border-[#F3F3F3]'
                              }`
                            : 'bg-[#F9F9F9] border-[#F3F3F3] pointer-events-none'
                        }`}
                      >

                        {/* DATE */}

                        <div className="flex items-center justify-between">

                          <span
                            className={`font-['Roboto'] font-normal text-[14px] sm:text-[16px] leading-[24px] sm:leading-[36px] ${
                              item.isCurrentMonth
                                ? 'text-[#346739]'
                                : 'text-[#A3A3A3]'
                            }`}
                          >
                            {formattedDay}
                          </span>

                          {/* COUNT */}

                          {item.isCurrentMonth &&
                            dayCount >
                              0 && (

                              <span className="min-w-[18px] h-[18px] px-[4px] flex items-center justify-center rounded-full bg-[#346739] text-white font-['Roboto'] text-[10px] font-semibold">
                                {dayCount}
                              </span>

                            )}

                        </div>

                        {/* ==================================================
                            SELECTED DATE NOT AVAILABLE MESSAGE
                        ================================================== */}

                        {item.isCurrentMonth &&
                          isSelected &&
                          selectedDateNotAvailable && (

                            <div className="mt-auto flex items-center justify-center">

                              <span className="w-full px-[6px] py-[4px] rounded-[4px] bg-[#9747FF0D] border border-[#9747FF] text-[#9747FF] font-['Roboto'] font-semibold text-[9px] sm:text-[10px] leading-tight text-center truncate">
                                NOT AVAILABLE
                              </span>

                            </div>

                          )}

                        {/* ==================================================
                            APPOINTMENT NAMES
                        ================================================== */}

                        {item.isCurrentMonth &&
                          dayCount >
                            0 &&
                          !(
                            isSelected &&
                            selectedDateNotAvailable
                          ) && (

                            <div className="mt-auto flex flex-col gap-[2px]">

                              {visibleNames.map(
                                (
                                  apt,
                                  i
                                ) => (

                                  <span
                                    key={i}
                                    className={`font-['Roboto'] font-normal text-[10px] sm:text-[11px] leading-tight truncate ${apt.statusColor}`}
                                  >
                                    {apt.name}
                                  </span>

                                )
                              )}

                              {extraCount >
                                0 && (

                                <span className="font-['Roboto'] font-normal text-[10px] text-[#828282]">
                                  +{extraCount}
                                </span>

                              )}

                            </div>

                          )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="w-full border border-[#D9D9D9] rounded-[8px] bg-[#FFFFFF] overflow-hidden flex flex-col z-10 relative mt-2">

        <div className="w-full overflow-x-auto scrollbar-hide">

          <div className="min-w-[1050px] flex flex-col">

            {/* TABLE HEADER */}

            <div className="w-full h-[68px] bg-[#346739] grid grid-cols-[1.5fr_1.5fr_1.5fr_2fr_2fr_1.5fr_0.5fr] items-center px-[28px]">

              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">
                DATE
              </span>

              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">
                START TIME
              </span>

              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">
                END TIME
              </span>

              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">
                PATIENT NAME
              </span>

              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">
                PHONE NUMBER
              </span>

              <span className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-center text-[#FFFFFF]">
                STATUS
              </span>

              <span />

            </div>

            {/* TABLE ROWS */}

            <div className="flex flex-col p-[16px] gap-[12px] scrollbar-hide">

              {loading ? (

                <div className="text-center py-10 font-['Roboto'] text-[#666666]">
                  Loading appointments...
                </div>

              ) : filteredAppointments.length ===
                0 ? (

                <div className="text-center py-10 font-['Roboto'] text-[#666666]">
                  No appointments found.
                </div>

              ) : (

                filteredAppointments.map(
                  (
                    apt,
                    index
                  ) => {

                    const isExpanded =
                      expandedRow ===
                      index;

                    return (

                      <div
                        key={
                          apt.id ||
                          index
                        }
                        className="flex flex-col w-full"
                      >

                        <div
                          onClick={() => {

                            setExpandedRow(
                              isExpanded
                                ? null
                                : index
                            );

                          }}
                          className={`w-full h-[68px] grid grid-cols-[1.5fr_1.5fr_1.5fr_2fr_2fr_1.5fr_0.5fr] items-center px-[28px] transition-colors duration-200 cursor-pointer ${
                            isExpanded
                              ? 'bg-[#FBFBFB] border border-[#D9D9D9] border-b-0 rounded-t-[8px]'
                              : 'bg-[#FFFFFF] border border-[#F3F3F3] hover:bg-[#FBFBFB] rounded-[8px]'
                          }`}
                        >

                          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">
                            {apt.date}
                          </span>

                          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">
                            {apt.startTime}
                          </span>

                          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">
                            {apt.endTime}
                          </span>

                          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">
                            {apt.name}
                          </span>

                          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-center text-[#346739]">
                            {apt.phone}
                          </span>

                          <span
                            className={`font-['Roboto'] font-normal text-[14px] leading-[28px] text-center ${apt.statusColor}`}
                          >
                            {apt.status}
                          </span>

                          <div className="flex justify-end pr-2">

                            <img
                              src={
                                ChevronDownIcon
                              }
                              alt="Toggle"
                              className={`w-[24px] h-[24px] object-contain transition-transform duration-300 ${
                                isExpanded
                                  ? 'rotate-180'
                                  : ''
                              }`}
                            />

                          </div>

                        </div>

                        {isExpanded && (

                          <ExpandedDetails
                            appointment={
                              apt
                            }
                            onUpdateSuccess={
                              async () => {

                                await fetchAppointments();

                                if (
                                  activeView ===
                                    'Today' &&
                                  !selectedDate
                                ) {

                                  await fetchTodaySummary();
                                }
                              }
                            }
                          />

                        )}

                      </div>

                    );
                  }
                )

              )}

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          LEGEND
      ====================================================== */}

      <div className="flex flex-wrap items-center gap-x-[24px] gap-y-[12px] mt-2">

        <div className="flex items-center gap-[8px]">

          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#1A202C]">
            Booked
          </span>

          <div className="w-[12px] h-[12px] rounded-full bg-[#1C71DA]" />

        </div>

        <div className="flex items-center gap-[8px]">

          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#1A202C]">
            Cancelled
          </span>

          <div className="w-[12px] h-[12px] rounded-full bg-[#FF0000]" />

        </div>

        <div className="flex items-center gap-[8px]">

          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#1A202C]">
            Waiting
          </span>

          <div className="w-[12px] h-[12px] rounded-full bg-[#DEB821]" />

        </div>

        <div className="flex items-center gap-[8px]">

          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#1A202C]">
            Not Available
          </span>

          <div className="w-[12px] h-[12px] rounded-full bg-[#9747FF]" />

        </div>

        <div className="flex items-center gap-[8px]">

          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#1A202C]">
            Completed
          </span>

          <div className="w-[12px] h-[12px] rounded-full bg-[#008000]" />

        </div>

        <div className="flex items-center gap-[8px]">

          <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#1A202C]">
            No Show
          </span>

          <div className="w-[12px] h-[12px] rounded-full bg-[#626262]" />

        </div>

      </div>

    </div>
  );
};

export default Calendar;