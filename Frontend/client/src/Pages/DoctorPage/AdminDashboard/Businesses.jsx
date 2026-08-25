import React, { useEffect, useState } from 'react';

// Asset imports
import CalendarIcon from '../../../assets/DoctorDashboard/CalendarCheckIcon.png';
import CheckCircleIcon from '../../../assets/DoctorDashboard/CompletedIcon.png';
import PendingIcon from '../../../assets/DoctorDashboard/WaitingIcon.png';
import CancelIcon from '../../../assets/DoctorDashboard/Reject.png';
import AZIcon from '../../../assets/DoctorDashboard/A-Z.png';
import ZAIcon from '../../../assets/DoctorDashboard/Z-A.png';

/* =========================================================
   REUSABLE DETAIL COMPONENT
========================================================= */

const DetailItem = ({ label, value }) => {
  const displayValue =
    value === null ||
    value === undefined ||
    String(value).trim() === ''
      ? '-'
      : String(value);

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="font-['Roboto'] font-medium text-[12px] text-[#777777]">
        {label}
      </span>

      <span className="font-['Roboto'] text-[14px] text-[#222222] break-words">
        {displayValue}
      </span>
    </div>
  );
};

/* =========================================================
   WORKING DAY COMPONENT
========================================================= */

const WorkingDay = ({ day, value }) => {
  const displayValue =
    value === null ||
    value === undefined ||
    String(value).trim() === ''
      ? 'Closed'
      : String(value);

  return (
    <div className="border border-[#E5E5E5] rounded-[10px] p-3 bg-[#F9F9F9]">
      <div className="font-['Poppins'] font-semibold text-[13px] text-[#346739]">
        {day}
      </div>

      <div className="font-['Roboto'] text-[13px] text-[#555555] mt-1 break-words">
        {displayValue}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Businesses = () => {
  const [sortOrder, setSortOrder] = useState('az');

  const [filters, setFilters] = useState({
    all: true,
    pending: false,
    active: false,
    suspended: false,
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Existing modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Details popup states
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] =
    useState(false);

  // WhatsApp connection API state
  const [isConnectingWhatsApp, setIsConnectingWhatsApp] =
    useState(false);
  const [whatsappConnectionError, setWhatsappConnectionError] =
    useState('');

  const [newBusinessData, setNewBusinessData] = useState({
    name: '',
    owner: '',
    mobile: '',
    city: '',
    industry: '',
    whatsappMobile: '',
  });

  /* =========================================================
     API DATA
  ========================================================= */

  const [dashboardStats, setDashboardStats] = useState({
    Total: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  });

  const [businessesList, setBusinessesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE =
    import.meta.env.VITE_API_BASE || '/api';

  /* =========================================================
     ADMIN HEADERS
  ========================================================= */

  const getAdminHeaders = () => {
    const token = localStorage.getItem('adminToken');

    return {
      Accept: 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /* =========================================================
     FETCH ADMIN DOCTORS

     GET /admin/doctors?status=&skip=0&limit=100
  ========================================================= */

  const fetchBusinesses = async () => {
    setIsLoading(true);

    try {
      const token =
        localStorage.getItem('adminToken');

      if (!token) {
        console.error(
          '[Businesses] adminToken is missing.'
        );

        setDashboardStats({
          Total: 0,
          Pending: 0,
          Approved: 0,
          Rejected: 0,
        });

        setBusinessesList([]);

        return;
      }

      /* -------------------------------------------------------
         Fetch all doctors for the table.
         Do NOT send a status so all status are returned.
      ------------------------------------------------------- */

      const response = await fetch(
        `${API_BASE}/admin/doctors?skip=0&limit=100`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: getAdminHeaders(),
        }
      );

      console.log(
        '[Businesses] GET /admin/doctors status:',
        response.status
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        console.error(
          '[Businesses] Doctors API failed:',
          errorData
        );

        setDashboardStats({
          Total: 0,
          Pending: 0,
          Approved: 0,
          Rejected: 0,
        });

        setBusinessesList([]);

        return;
      }

      const data = await response.json();

      console.log(
        '[Businesses] GET /admin/doctors response:',
        data
      );

      /* -------------------------------------------------------
         Support different API response structures.
      ------------------------------------------------------- */

      const doctors = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.doctors)
        ? data.doctors
        : [];

      /* -------------------------------------------------------
         Calculate status counts.
      ------------------------------------------------------- */

      const total = doctors.length;

      const pending = doctors.filter(
        (doctor) =>
          String(
            doctor?.Status || ''
          ).toLowerCase() === 'pending'
      ).length;

      const approved = doctors.filter(
        (doctor) =>
          String(
            doctor?.Status || ''
          ).toLowerCase() === 'approved'
      ).length;

      const rejected = doctors.filter(
        (doctor) =>
          String(
            doctor?.Status || ''
          ).toLowerCase() === 'rejected'
      ).length;

      setDashboardStats({
        Total: total,
        Pending: pending,
        Approved: approved,
        Rejected: rejected,
      });

      /* -------------------------------------------------------
         Convert doctor API response to existing table format.

         IMPORTANT:
         ...item keeps the COMPLETE backend object.
      ------------------------------------------------------- */

      const formattedBusinesses = doctors
        .filter(
          (item) => item && item.Id
        )
        .map((item) => ({
          ...item,

          id: item.Id,

          // Doctor / clinic name
          name:
            item.ClinicName ||
            item.FullName ||
            item.UserName ||
            'Unknown Doctor',

          // Doctor name
          owner:
            item.FullName ||
            item.UserName ||
            '-',

          // Specialization
          industry:
            item.Specialization ||
            item.Qualification ||
            '-',

          // Mobile
          mobile:
            item.MobileNumber ||
            item.BusinessPhoneNumber ||
            '-',

          // WhatsApp Number
          WhatsAppNumber:
            item.WhatsAppNumber ||
            item.WhatsAppBusinessNumber ||
            '-',

          // City
          city:
            item.City ||
            '-',

          // Backend status
          status:
            item.Status ||
            'Pending',

          // WhatsApp status
          whatsappStatus:
            item.WhatsAppBusinessStatus ||
            'Disconnected',
        }));

      console.log(
        '[Businesses] Total doctors displayed:',
        formattedBusinesses.length
      );

      console.log(
        '[Businesses] Status breakdown:',
        formattedBusinesses.reduce(
          (acc, item) => {
            const status = String(
              item.status || 'Unknown'
            );

            acc[status] =
              (acc[status] || 0) + 1;

            return acc;
          },
          {}
        )
      );

      setBusinessesList(
        formattedBusinesses
      );
    } catch (error) {
      console.error(
        '[Businesses] Fetch error:',
        error
      );

      setDashboardStats({
        Total: 0,
        Pending: 0,
        Approved: 0,
        Rejected: 0,
      });

      setBusinessesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     FETCH ON PAGE LOAD
  ========================================================= */

  useEffect(() => {
    fetchBusinesses();
  }, []);

  /* =========================================================
     DETAILS POPUP
  ========================================================= */

  const handleBusinessClick = (item) => {
    setSelectedBusiness(item);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBusiness(null);
    setWhatsappConnectionError('');
  };

  /* =========================================================
     CONNECT WHATSAPP

     PATCH /doctors/{doctor_id}/whatsapp-status

     Request body:
     {
       "WhatsAppBusinessStatus": "Connected"
     }
  ========================================================= */

  const handleWhatsAppConnection = async () => {
    if (!selectedBusiness?.Id) {
      setWhatsappConnectionError('Doctor ID is missing.');
      return;
    }

    setIsConnectingWhatsApp(true);
    setWhatsappConnectionError('');

    try {
      const response = await fetch(
        `${API_BASE}/doctors/${encodeURIComponent(
          selectedBusiness.Id
        )}/whatsapp-status`,
        {
          method: 'PATCH',
          headers: {
            ...getAdminHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            WhatsAppBusinessStatus: 'Connected',
          }),
        }
      );

      const responseData = await response
        .json()
        .catch(() => ({}));

      console.log(
        '[Businesses] PATCH /doctors/{doctor_id}/whatsapp-status status:',
        response.status
      );

      console.log(
        '[Businesses] WhatsApp connection response:',
        responseData
      );

      if (!response.ok) {
        const errorMessage =
          responseData?.detail ||
          responseData?.message ||
          responseData?.error ||
          'Unable to connect WhatsApp. Please try again.';

        throw new Error(
          Array.isArray(errorMessage)
            ? errorMessage
                .map((item) =>
                  item?.msg || String(item)
                )
                .join(', ')
            : String(errorMessage)
        );
      }

      // Update the selected business immediately with the
      // status returned by the backend, or Connected as fallback.
      const updatedWhatsAppStatus =
        responseData?.WhatsAppBusinessStatus ||
        responseData?.data?.WhatsAppBusinessStatus ||
        'Connected';

      setSelectedBusiness((prev) =>
        prev
          ? {
              ...prev,
              WhatsAppBusinessStatus:
                updatedWhatsAppStatus,
              whatsappStatus:
                updatedWhatsAppStatus,
            }
          : prev
      );

      // Also update the table row without requiring a page refresh.
      setBusinessesList((prev) =>
        prev.map((business) =>
          business.id === selectedBusiness.id ||
          business.Id === selectedBusiness.Id
            ? {
                ...business,
                WhatsAppBusinessStatus:
                  updatedWhatsAppStatus,
                whatsappStatus:
                  updatedWhatsAppStatus,
              }
            : business
        )
      );
    } catch (error) {
      console.error(
        '[Businesses] WhatsApp connection failed:',
        error
      );

      setWhatsappConnectionError(
        error?.message ||
          'Unable to connect WhatsApp. Please try again.'
      );
    } finally {
      setIsConnectingWhatsApp(false);
    }
  };

  /* =========================================================
     FILTER HANDLING
  ========================================================= */

  const handleCheckboxChange = (key) => {
    if (key === 'all') {
      const newAllState = !filters.all;

      setFilters({
        all: newAllState,
        pending: false,
        active: false,
        suspended: false,
      });
    } else {
      setFilters((prev) => {
        const updated = {
          ...prev,
          all: false,
          [key]: !prev[key],
        };

        if (
          !updated.pending &&
          !updated.active &&
          !updated.suspended
        ) {
          updated.all = true;
        }

        return updated;
      });
    }
  };

  /* =========================================================
     FILTER + SEARCH + SORT
  ========================================================= */

  const filteredBusinesses =
    businessesList
      .filter((item) => {
        if (filters.all) {
          return true;
        }

        const status = String(
          item.status || ''
        ).toLowerCase();

        // Pending
        if (
          filters.pending &&
          status === 'pending'
        ) {
          return true;
        }

        // Active = Approved
        if (
          filters.active &&
          (status === 'active' ||
            status === 'approved')
        ) {
          return true;
        }

        // Suspended = Rejected
        if (
          filters.suspended &&
          (status === 'suspended' ||
            status === 'rejected')
        ) {
          return true;
        }

        return false;
      })
      .filter((item) => {
        const query =
          searchQuery
            .toLowerCase()
            .trim();

        if (!query) {
          return true;
        }

        return (
          String(item.name || '')
            .toLowerCase()
            .includes(query) ||

          String(item.owner || '')
            .toLowerCase()
            .includes(query) ||

          String(item.city || '')
            .toLowerCase()
            .includes(query) ||

          String(item.industry || '')
            .toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        if (sortOrder === 'az') {
          return String(
            a.name || ''
          ).localeCompare(
            String(b.name || '')
          );
        }

        return String(
          b.name || ''
        ).localeCompare(
          String(a.name || '')
        );
      });

  /* =========================================================
     ADD BUSINESS
  ========================================================= */

  const handleAddBusinessSubmit = (e) => {
    e.preventDefault();

    if (
      !newBusinessData.name ||
      !newBusinessData.owner
    ) {
      return;
    }

    const newEntry = {
      id: `local-${Date.now()}`,

      name: newBusinessData.name,

      owner: newBusinessData.owner,

      industry:
        newBusinessData.industry ||
        'General',

      mobile: newBusinessData.mobile
        ? `+91 ${newBusinessData.mobile}`
        : '+91 0000000000',

      WhatsAppNumber:
        newBusinessData.whatsappMobile
          ? `+91 ${newBusinessData.whatsappMobile}`
          : '-',

      city:
        newBusinessData.city ||
        'Unknown',

      status: 'Pending',

      whatsappStatus: 'Disconnected',
    };

    setBusinessesList((prev) => [
      newEntry,
      ...prev,
    ]);

    setIsModalOpen(false);
    setIsSuccessModalOpen(true);

    setNewBusinessData({
      name: '',
      owner: '',
      mobile: '',
      city: '',
      industry: '',
      whatsappMobile: '',
    });
  };

  /* =========================================================
     STATUS COLOR
  ========================================================= */

  const getStatusClass = (status) => {
    const normalizedStatus =
      String(status || '')
        .toLowerCase();

    if (
      normalizedStatus === 'active' ||
      normalizedStatus === 'approved'
    ) {
      return 'text-[#346739]';
    }

    if (
      normalizedStatus === 'pending'
    ) {
      return 'text-[#D4A017]';
    }

    return 'text-[#BD4444]';
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex flex-col gap-6 w-full pb-10 relative">

      {/* =====================================================
          HEADER SECTION
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <h1 className="font-['Poppins'] font-bold text-[22px] md:text-[24px] text-[#346739]">
          BUSINESSES
        </h1>

        <button
          onClick={() =>
            setIsModalOpen(true)
          }
          className="flex items-center justify-center gap-2 bg-[#346739] hover:bg-white text-white hover:text-[#346739] border border-transparent hover:border-[#346739] font-['Poppins'] font-medium text-[14px] px-[20px] py-[12px] rounded-[12px] transition-all duration-200 shadow-sm hover:shadow-[inset_4px_4px_4px_0px_#00000040]"
        >
          <span className="text-[18px] leading-none">
            +
          </span>

          ADD NEW BUSINESS
        </button>
      </div>

      {/* =====================================================
          4 CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* TOTAL BUSINESSES */}

        <div className="bg-[#F9F9F9] border border-[#D9D9D9] rounded-[16px] p-[25px] flex flex-col justify-between h-[150px] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">

          <div className="flex justify-between items-start">

            <span className="font-['Poppins'] font-semibold text-[25px] text-[#346739]">
              {isLoading
                ? '...'
                : dashboardStats.Total}
            </span>

            <img
              src={CalendarIcon}
              alt="Total Businesses"
              className="w-[30px] h-[30px] object-contain"
            />

          </div>

          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">
            TOTAL BUSINESSES
          </span>

        </div>

        {/* ACTIVE BUSINESSES */}

        <div className="bg-[#F9F9F9] border border-[#D9D9D9] rounded-[16px] p-[25px] flex flex-col justify-between h-[150px] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">

          <div className="flex justify-between items-start">

            <span className="font-['Poppins'] font-semibold text-[25px] text-[#346739]">
              {isLoading
                ? '...'
                : dashboardStats.Approved}
            </span>

            <img
              src={CheckCircleIcon}
              alt="Active Businesses"
              className="w-[30px] h-[30px] object-contain"
            />

          </div>

          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">
            ACTIVE BUSINESSES
          </span>

        </div>

        {/* PENDING BUSINESSES */}

        <div className="bg-[#F9F9F9] border border-[#D9D9D9] rounded-[16px] p-[25px] flex flex-col justify-between h-[150px] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">

          <div className="flex justify-between items-start">

            <span className="font-['Poppins'] font-semibold text-[25px] text-[#346739]">
              {isLoading
                ? '...'
                : dashboardStats.Pending}
            </span>

            <img
              src={PendingIcon}
              alt="Pending Businesses"
              className="w-[30px] h-[30px] object-contain"
            />

          </div>

          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">
            PENDING BUSINESSES
          </span>

        </div>

        {/* SUSPENDED BUSINESSES */}

        <div className="bg-[#F9F9F9] border border-[#D9D9D9] rounded-[16px] p-[25px] flex flex-col justify-between h-[150px] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">

          <div className="flex justify-between items-start">

            <span className="font-['Poppins'] font-semibold text-[25px] text-[#346739]">
              {isLoading
                ? '...'
                : dashboardStats.Rejected}
            </span>

            <img
              src={CancelIcon}
              alt="Suspended Businesses"
              className="w-[30px] h-[30px] object-contain"
            />

          </div>

          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">
            SUSPENDED BUSINESSES
          </span>

        </div>

      </div>

      {/* =====================================================
          FILTER + SEARCH
      ===================================================== */}

      <div className="border border-[#1C71DA] rounded-[16px] p-4 bg-[#1C71DA]/10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">

        {/* SORT */}

        <div className="flex items-center gap-3 border border-[#E0E0E0] rounded-[12px] px-3 py-2 bg-[#F9F9F9]">

          <img
            src={AZIcon}
            alt="A-Z"
            className="w-[20px] h-[20px] object-contain"
          />

          <button
            type="button"
            onClick={() =>
              setSortOrder(
                sortOrder === 'az'
                  ? 'za'
                  : 'az'
              )
            }
            className={`w-[44px] h-[24px] flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              sortOrder === 'za'
                ? 'bg-[#1C71DA]'
                : 'bg-[#D9D9D9]'
            }`}
          >

            <div
              className={`bg-white w-[16px] h-[16px] rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                sortOrder === 'za'
                  ? 'translate-x-[20px]'
                  : 'translate-x-0'
              }`}
            />

          </button>

          <img
            src={ZAIcon}
            alt="Z-A"
            className="w-[20px] h-[20px] object-contain"
          />

        </div>

        {/* FILTERS */}

        <div className="flex flex-wrap items-center gap-4 font-['Roboto'] text-[14px] text-[#346739]">

          <span className="font-medium">
            Filter by:
          </span>

          <label className="flex items-center gap-2 cursor-pointer">

            <input
              type="checkbox"
              checked={filters.all}
              onChange={() =>
                handleCheckboxChange(
                  'all'
                )
              }
              className="rounded border-[#D9D9D9] text-[#346739] focus:ring-[#346739] w-4 h-4 cursor-pointer"
            />

            <span>All</span>

          </label>

          <label className="flex items-center gap-2 cursor-pointer">

            <input
              type="checkbox"
              checked={filters.pending}
              onChange={() =>
                handleCheckboxChange(
                  'pending'
                )
              }
              className="rounded border-[#D9D9D9] text-[#346739] focus:ring-[#346739] w-4 h-4 cursor-pointer"
            />

            <span>Pending</span>

          </label>

          <label className="flex items-center gap-2 cursor-pointer">

            <input
              type="checkbox"
              checked={filters.active}
              onChange={() =>
                handleCheckboxChange(
                  'active'
                )
              }
              className="rounded border-[#D9D9D9] text-[#346739] focus:ring-[#346739] w-4 h-4 cursor-pointer"
            />

            <span>Active</span>

          </label>

          <label className="flex items-center gap-2 cursor-pointer">

            <input
              type="checkbox"
              checked={filters.suspended}
              onChange={() =>
                handleCheckboxChange(
                  'suspended'
                )
              }
              className="rounded border-[#D9D9D9] text-[#346739] focus:ring-[#346739] w-4 h-4 cursor-pointer"
            />

            <span>Suspended</span>

          </label>

        </div>

        {/* SEARCH */}

        <div className="relative w-full lg:w-[320px]">

          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">

            <svg
              className="w-4 h-4"
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
              setSearchQuery(
                e.target.value
              )
            }
            placeholder="Search by name, owner, city..."
            className="w-full pl-9 pr-4 py-2 border border-[#D9D9D9] rounded-[12px] bg-[#F9F9F9] font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
          />

        </div>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="w-full bg-white border border-[#E0E0E0] rounded-t-[16px] overflow-hidden shadow-sm flex flex-col">

        {/* TABLE HEADER */}

        <div className="bg-[#346739] text-white grid grid-cols-6 px-6 py-5 font-['Poppins'] font-semibold text-[14px] items-center">

          {/* BUSINESS - NO CHECKBOX */}
          <div>
            <span>
              BUSINESS
            </span>
          </div>

          <span>
            INDUSTRY
          </span>

          {/* CHANGED HEADER */}
          <span>
            WHATSAPP NUMBER
          </span>

          <span>
            CITY
          </span>

          <span>
            STATUS
          </span>

          <span>
            WHATSAPP
          </span>

        </div>

        {/* TABLE BODY */}

        <div className="flex flex-col">

          {isLoading ? (

            <div className="py-10 text-center font-['Roboto'] text-[15px] text-gray-500">
              Loading businesses...
            </div>

          ) : filteredBusinesses.length > 0 ? (

            filteredBusinesses.map(
              (item) => (

                <div
                  key={item.id}
                  onClick={() =>
                    handleBusinessClick(
                      item
                    )
                  }
                  className="grid grid-cols-6 px-6 py-4 items-center border border-[#D9D9D9] hover:shadow shadow-gray-300 transition-none m-1 rounded-md cursor-pointer"
                >

                  {/* BUSINESS - NO CHECKBOX */}

                  <div className="flex items-center">

                    <div className="flex flex-col">

                      <span className="font-['Poppins'] font-semibold text-[15px] text-[#346739]">
                        {item.name}
                      </span>

                      <span className="font-['Roboto'] text-[13px] text-[#666666]">
                        {item.owner}
                      </span>

                    </div>

                  </div>

                  {/* INDUSTRY */}

                  <span className="font-['Roboto'] text-[14px] text-[#346739]">
                    {item.industry}
                  </span>

                  {/* WHATSAPP NUMBER */}

                  <span className="font-['Roboto'] text-[14px] text-[#346739]">
                    {item.WhatsAppNumber ||
                      '-'}
                  </span>

                  {/* CITY */}

                  <span className="font-['Roboto'] text-[14px] text-[#346739]">
                    {item.city}
                  </span>

                  {/* STATUS */}

                  <span
                    className={`font-['Roboto'] font-semibold text-[14px] ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>

                  {/* WHATSAPP */}

                  <div>

                    <button
                      type="button"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                      className={`w-40 font-['Poppins'] font-medium text-[14px] px-5 py-2 rounded-[10px] shadow-sm ${
                        item.WhatsAppBusinessStatus ===
                        'Connected'
                          ? 'bg-white border border-[#D9D9D9] text-[#666666]'
                          : 'bg-[#008000] text-white'
                      }`}
                    >
                      {item.WhatsAppBusinessStatus ||
                        'Disconnected'}
                    </button>

                  </div>

                </div>

              )

            )

          ) : (

            <div className="py-10 text-center font-['Roboto'] text-[15px] text-gray-500">
              No businesses found matching your criteria.
            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          ADD NEW BUSINESS MODAL
      ===================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-[20px] w-full max-w-[700px] p-6 md:p-8 shadow-2xl flex flex-col gap-6 animate-fadeIn">

            <h2 className="font-['Poppins'] font-bold text-[20px] text-[#346739]">
              ADD NEW BUSINESS
            </h2>

            <form
              onSubmit={
                handleAddBusinessSubmit
              }
              className="flex flex-col gap-6"
            >

              <div className="border border-[#D9D9D9] rounded-[16px] p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white">

                {/* BUSINESS NAME */}

                <div className="flex flex-col gap-2">

                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">
                    Business Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter Business Name"
                    value={
                      newBusinessData.name
                    }
                    onChange={(e) =>
                      setNewBusinessData({
                        ...newBusinessData,
                        name: e.target.value,
                      })
                    }
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                    required
                  />

                </div>

                {/* OWNER */}

                <div className="flex flex-col gap-2">

                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">
                    Owner Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter Owner Name"
                    value={
                      newBusinessData.owner
                    }
                    onChange={(e) =>
                      setNewBusinessData({
                        ...newBusinessData,
                        owner: e.target.value,
                      })
                    }
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                    required
                  />

                </div>

                {/* MOBILE */}

                <div className="flex flex-col gap-2">

                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">
                    Mobile Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter 10 digit mobile number"
                    value={
                      newBusinessData.mobile
                    }
                    onChange={(e) =>
                      setNewBusinessData({
                        ...newBusinessData,
                        mobile:
                          e.target.value,
                      })
                    }
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                  />

                </div>

                {/* CITY */}

                <div className="flex flex-col gap-2">

                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">
                    City
                  </label>

                  <input
                    type="text"
                    placeholder="Enter City Name"
                    value={
                      newBusinessData.city
                    }
                    onChange={(e) =>
                      setNewBusinessData({
                        ...newBusinessData,
                        city:
                          e.target.value,
                      })
                    }
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                  />

                </div>

                {/* INDUSTRY */}

                <div className="flex flex-col gap-2">

                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">
                    Select Industry
                  </label>

                  <select
                    value={
                      newBusinessData.industry
                    }
                    onChange={(e) =>
                      setNewBusinessData({
                        ...newBusinessData,
                        industry:
                          e.target.value,
                      })
                    }
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#777777] bg-white focus:outline-none focus:border-[#346739]"
                  >

                    <option value="">
                      Select option
                    </option>

                    <option value="Healthcare">
                      Healthcare
                    </option>

                    <option value="Salon & Spa">
                      Salon & Spa
                    </option>

                    <option value="Fitness">
                      Fitness
                    </option>

                    <option value="Legal">
                      Legal
                    </option>

                    <option value="Technology">
                      Technology
                    </option>

                  </select>

                </div>

                {/* WHATSAPP MOBILE */}

                <div className="flex flex-col gap-2">

                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">
                    WhatsApp Mobile Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter 10 digit WhatsApp mobile number"
                    value={
                      newBusinessData.whatsappMobile
                    }
                    onChange={(e) =>
                      setNewBusinessData({
                        ...newBusinessData,
                        whatsappMobile:
                          e.target.value,
                      })
                    }
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                  />

                </div>

              </div>

              {/* ACTION BUTTONS */}

              <div className="flex items-center justify-between gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="w-1/2 bg-white border border-[#346739] text-[#346739] hover:bg-gray-50 font-['Poppins'] font-medium text-[15px] py-3 rounded-[12px] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-1/2 bg-[#346739] hover:bg-[#2b5530] text-white font-['Poppins'] font-medium text-[15px] py-3 rounded-[12px] shadow-sm transition-colors"
                >
                  Add Business
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}

      {isSuccessModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-[24px] w-full max-w-[550px] p-6 md:p-8 shadow-2xl relative flex flex-col items-center">

            <button
              onClick={() =>
                setIsSuccessModalOpen(false)
              }
              className="absolute top-3 right-6 w-8 h-8 rounded-full border border-[#346739] flex items-center justify-center text-[#346739] hover:bg-[#346739] hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="w-full border border-[#E0E0E0] rounded-[20px] p-6 md:p-8 flex flex-col items-center text-center mt-4">

              <div className="w-[60px] h-[60px] bg-[#346739] rounded-full flex items-center justify-center mb-6 shadow-md">

                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />

                </svg>

              </div>

              <h3 className="font-['Poppins'] font-bold text-[20px] md:text-[22px] text-[#346739] md:mb-4">
                Business Added Successfully
              </h3>

              <p className="font-['Roboto'] text-[14px] md:text-[15px] text-[#444444] leading-relaxed max-w-[420px]">
                The business has been approved and the owner has been notified. They can now access their dashboard and continue with the onboarding process.
              </p>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          BUSINESS DETAILS POPUP
      ===================================================== */}

      {isDetailsModalOpen &&
        selectedBusiness && (

          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onClick={closeDetailsModal}
          >

            <div
              className="bg-white rounded-[20px] w-full max-w-[1000px] max-h-[90vh] shadow-2xl overflow-hidden"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* POPUP HEADER */}

              <div className="bg-[#346739] px-6 md:px-8 py-5 flex items-center justify-between">

                <div>

                  <h2 className="font-['Poppins'] font-bold text-[20px] md:text-[23px] text-white">
                    BUSINESS DETAILS
                  </h2>

                  <p className="font-['Roboto'] text-[13px] text-white/80 mt-1">
                    Complete information from backend
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeDetailsModal
                  }
                  className="w-9 h-9 rounded-full border border-white/70 text-white flex items-center justify-center hover:bg-white hover:text-[#346739] transition-colors text-lg"
                >
                  ✕
                </button>

              </div>

              {/* POPUP CONTENT */}

              <div className="p-5 md:p-7 overflow-y-auto scrollbar-hide max-h-[calc(90vh-90px)]">

                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <div className="mb-6">

                  <h3 className="font-['Poppins'] font-semibold text-[17px] text-[#346739] mb-3">
                    Personal Information
                  </h3>

                  <div className="border border-[#D9D9D9] rounded-[14px] p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    <DetailItem
                      label="Full Name"
                      value={
                        selectedBusiness.FullName
                      }
                    />

                    <DetailItem
                      label="Username"
                      value={
                        selectedBusiness.UserName
                      }
                    />

                    <DetailItem
                      label="Gender"
                      value={
                        selectedBusiness.Gender
                      }
                    />

                    <DetailItem
                      label="Date of Birth"
                      value={
                        selectedBusiness.DateOfBirth
                      }
                    />

                    <DetailItem
                      label="Qualification"
                      value={
                        selectedBusiness.Qualification
                      }
                    />

                    <DetailItem
                      label="Specialization"
                      value={
                        selectedBusiness.Specialization
                      }
                    />

                    <DetailItem
                      label="Medical Registration Number"
                      value={
                        selectedBusiness.MedicalRegistrationNumber
                      }
                    />

                    <DetailItem
                      label="Years of Experience"
                      value={
                        selectedBusiness.YearsOfExperience !==
                          null &&
                        selectedBusiness.YearsOfExperience !==
                          undefined
                          ? `${selectedBusiness.YearsOfExperience} Years`
                          : null
                      }
                    />

                    <DetailItem
                      label="Email Address"
                      value={
                        selectedBusiness.EmailAddress
                      }
                    />

                    <DetailItem
                      label="Mobile Number"
                      value={
                        selectedBusiness.MobileNumber
                      }
                    />

                    <DetailItem
                      label="WhatsApp Number"
                      value={
                        selectedBusiness.WhatsAppNumber
                      }
                    />

                    <DetailItem
                      label="Business Phone"
                      value={
                        selectedBusiness.BusinessPhoneNumber
                      }
                    />

                  </div>

                </div>

                {/* =================================================
                    CLINIC INFORMATION
                ================================================= */}

                <div className="mb-6">

                  <h3 className="font-['Poppins'] font-semibold text-[17px] text-[#346739] mb-3">
                    Clinic Information
                  </h3>

                  <div className="border border-[#D9D9D9] rounded-[14px] p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    <DetailItem
                      label="Clinic Name"
                      value={
                        selectedBusiness.ClinicName
                      }
                    />

                    <DetailItem
                      label="Clinic Address"
                      value={
                        selectedBusiness.ClinicAddress
                      }
                    />

                    <DetailItem
                      label="City"
                      value={
                        selectedBusiness.City
                      }
                    />

                    <DetailItem
                      label="State"
                      value={
                        selectedBusiness.State
                      }
                    />

                    <DetailItem
                      label="Pincode"
                      value={
                        selectedBusiness.Pincode
                      }
                    />

                    <DetailItem
                      label="Country"
                      value={
                        selectedBusiness.Country
                      }
                    />

                  </div>

                </div>

                {/* =================================================
                    CONSULTATION INFORMATION
                ================================================= */}

                <div className="mb-6">

                  <h3 className="font-['Poppins'] font-semibold text-[17px] text-[#346739] mb-3">
                    Consultation Information
                  </h3>

                  <div className="border border-[#D9D9D9] rounded-[14px] p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                    <DetailItem
                      label="Clinic Consultation Fee"
                      value={
                        selectedBusiness.ClinicConsultationFee !==
                          null &&
                        selectedBusiness.ClinicConsultationFee !==
                          undefined
                          ? `₹ ${selectedBusiness.ClinicConsultationFee}`
                          : null
                      }
                    />

                    <DetailItem
                      label="Video Consultation Fee"
                      value={
                        selectedBusiness.VideoConsultationFee !==
                          null &&
                        selectedBusiness.VideoConsultationFee !==
                          undefined
                          ? `₹ ${selectedBusiness.VideoConsultationFee}`
                          : null
                      }
                    />

                    <DetailItem
                      label="Second Opinion Fee"
                      value={
                        selectedBusiness.SecondOpinionFee !==
                          null &&
                        selectedBusiness.SecondOpinionFee !==
                          undefined
                          ? `₹ ${selectedBusiness.SecondOpinionFee}`
                          : null
                      }
                    />

                    <DetailItem
                      label="Consultation Duration"
                      value={
                        selectedBusiness.ConsultationDuration !==
                          null &&
                        selectedBusiness.ConsultationDuration !==
                          undefined
                          ? `${selectedBusiness.ConsultationDuration} Minutes`
                          : null
                      }
                    />

                    <DetailItem
                      label="Maximum Patients Per Day"
                      value={
                        selectedBusiness.MaximumPatientsPerDay
                      }
                    />

                    <DetailItem
                      label="Status"
                      value={
                        selectedBusiness.Status
                      }
                    />

                    <DetailItem
                      label="Verified"
                      value={
                        selectedBusiness.IsVerified ===
                        true
                          ? 'Yes'
                          : selectedBusiness.IsVerified ===
                            false
                          ? 'No'
                          : null
                      }
                    />

                    <DetailItem
                      label="WhatsApp Business Status"
                      value={
                        selectedBusiness.WhatsAppBusinessStatus
                      }
                    />

                  </div>

                </div>

                {/* =================================================
                    WORKING HOURS
                ================================================= */}

                <div className="mb-6">

                  <h3 className="font-['Poppins'] font-semibold text-[17px] text-[#346739] mb-3">
                    Working Hours
                  </h3>

                  <div className="border border-[#D9D9D9] rounded-[14px] p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <WorkingDay
                      day="Monday"
                      value={
                        selectedBusiness.Monday
                      }
                    />

                    <WorkingDay
                      day="Tuesday"
                      value={
                        selectedBusiness.Tuesday
                      }
                    />

                    <WorkingDay
                      day="Wednesday"
                      value={
                        selectedBusiness.Wednesday
                      }
                    />

                    <WorkingDay
                      day="Thursday"
                      value={
                        selectedBusiness.Thursday
                      }
                    />

                    <WorkingDay
                      day="Friday"
                      value={
                        selectedBusiness.Friday
                      }
                    />

                    <WorkingDay
                      day="Saturday"
                      value={
                        selectedBusiness.Saturday
                      }
                    />

                    <WorkingDay
                      day="Sunday"
                      value={
                        selectedBusiness.Sunday
                      }
                    />

                  </div>

                </div>

                {/* =================================================
                    BANK INFORMATION
                ================================================= */}

                <div className="mb-6">

                  <h3 className="font-['Poppins'] font-semibold text-[17px] text-[#346739] mb-3">
                    Bank Information
                  </h3>

                  <div className="border border-[#D9D9D9] rounded-[14px] p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    <DetailItem
                      label="UPI ID"
                      value={
                        selectedBusiness.UpiId
                      }
                    />

                    <DetailItem
                      label="Account Holder Name"
                      value={
                        selectedBusiness.AccountHolderName
                      }
                    />

                    <DetailItem
                      label="Bank Name"
                      value={
                        selectedBusiness.BankName
                      }
                    />

                    <DetailItem
                      label="IFSC Code"
                      value={
                        selectedBusiness.IfscCode
                      }
                    />

                    <DetailItem
                      label="Account Number"
                      value={
                        selectedBusiness.AccountNumber
                      }
                    />

                  </div>

                </div>

                {/* =================================================
                    SYSTEM INFORMATION
                ================================================= */}

                <div className="mb-6">

                  <h3 className="font-['Poppins'] font-semibold text-[17px] text-[#346739] mb-3">
                    System Information
                  </h3>

                  <div className="border border-[#D9D9D9] rounded-[14px] p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    <DetailItem
                      label="Doctor ID"
                      value={
                        selectedBusiness.Id
                      }
                    />

                    <DetailItem
                      label="Created At"
                      value={
                        selectedBusiness.CreatedAt
                      }
                    />

                    <DetailItem
                      label="Updated At"
                      value={
                        selectedBusiness.UpdatedAt
                      }
                    />

                  </div>

                </div>

                {/* =================================================
                    PROFILE PHOTO
                ================================================= */}

                {selectedBusiness.ProfilePhoto && (
                  <div className="mb-6">

                    <h3 className="font-['Poppins'] font-semibold text-[17px] text-[#346739] mb-3">
                      Profile Photo
                    </h3>

                    <div className="border border-[#D9D9D9] rounded-[14px] p-5">

                      <img
                        src={
                          selectedBusiness.ProfilePhoto
                        }
                        alt={
                          selectedBusiness.FullName ||
                          'Profile'
                        }
                        className="w-[120px] h-[120px] rounded-full object-cover border-2 border-[#346739]"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            'none';
                        }}
                      />

                    </div>

                  </div>
                )}

                {/* ACTION BUTTONS */}

                <div className="flex flex-col items-stretch gap-3 mt-7">

                  {whatsappConnectionError && (
                    <div className="w-full rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-['Roboto'] text-red-600">
                      {whatsappConnectionError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-end gap-3">

                    {/* WHATSAPP CONNECTION BUTTON */}
                    <button
                      type="button"
                      onClick={handleWhatsAppConnection}
                      disabled={
                        isConnectingWhatsApp ||
                        selectedBusiness.WhatsAppBusinessStatus ===
                          'Connected'
                      }
                      className={`font-['Poppins'] font-medium text-[14px] px-6 py-3 rounded-[12px] transition-colors ${
                        selectedBusiness.WhatsAppBusinessStatus ===
                        'Connected'
                          ? 'bg-white border border-[#D9D9D9] text-[#666666] cursor-not-allowed'
                          : 'bg-[#008000] hover:bg-[#006b00] text-white'
                      } ${
                        isConnectingWhatsApp
                          ? 'opacity-70 cursor-wait'
                          : ''
                      }`}
                    >
                      {isConnectingWhatsApp
                        ? 'Connecting...'
                        : selectedBusiness.WhatsAppBusinessStatus ===
                          'Connected'
                        ? 'WhatsApp Connected'
                        : 'Connect WhatsApp'}
                    </button>

                    {/* CLOSE BUTTON */}
                    <button
                      type="button"
                      onClick={closeDetailsModal}
                      disabled={isConnectingWhatsApp}
                      className="bg-[#346739] hover:bg-[#2b5530] disabled:opacity-60 disabled:cursor-not-allowed text-white font-['Poppins'] font-medium text-[14px] px-8 py-3 rounded-[12px] transition-colors"
                    >
                      Close
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default Businesses;