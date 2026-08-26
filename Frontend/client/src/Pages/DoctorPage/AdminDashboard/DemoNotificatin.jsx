import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DemoNotificatin = () => {
  const [demoRequests, setDemoRequests] = useState([]);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // =========================================================
  // FETCH DEMO REQUESTS
  // =========================================================
  const fetchDemoRequests = async () => {
    setIsLoading(true);
    setError('');

    try {
      // On HTTPS production, use same-origin Vercel proxy
      const isProductionHttps = window.location.protocol === 'https:';

      const apiBaseUrl = isProductionHttps
        ? '/api'
        : (import.meta.env.VITE_API_BASE || '/api');

      const response = await axios.get(`${apiBaseUrl}/demo`, {
        params: {
          skip: 0,
          limit: 100,
        },
      });

      console.log('Demo Requests API Response:', response.data);

      const responseData = response.data;

      let requests = [];

      if (Array.isArray(responseData)) {
        requests = responseData;
      } else if (Array.isArray(responseData?.data)) {
        requests = responseData.data;
      } else if (Array.isArray(responseData?.items)) {
        requests = responseData.items;
      } else if (Array.isArray(responseData?.results)) {
        requests = responseData.results;
      } else if (Array.isArray(responseData?.DemoRequests)) {
        requests = responseData.DemoRequests;
      } else if (Array.isArray(responseData?.demoRequests)) {
        requests = responseData.demoRequests;
      } else {
        requests = [];
      }

      setDemoRequests(requests);
    } catch (err) {
      console.error('GET Demo Requests Error:', err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to load demo requests. Please try again.';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoRequests();
  }, []);

  // =========================================================
  // COMMON VALUE HELPER
  // =========================================================
  const getValue = (demo, ...keys) => {
    for (const key of keys) {
      if (
        demo?.[key] !== undefined &&
        demo?.[key] !== null &&
        String(demo[key]).trim() !== ''
      ) {
        return demo[key];
      }
    }

    return '-';
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================
  const formatDate = (date) => {
    if (!date || date === '-') return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // =========================================================
  // FORMAT DATE TIME
  // =========================================================
  const formatDateTime = (date) => {
    if (!date || date === '-') return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================
  // DETAIL ITEM
  // =========================================================
  const DetailItem = ({ label, value }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-[#777777]">
        {label}
      </span>

      <span className="text-[14px] font-medium text-[#1A202C] break-words">
        {value || '-'}
      </span>
    </div>
  );

  // =========================================================
  // GETTERS
  // =========================================================
  const getBusinessName = (demo) =>
    getValue(demo, 'BusinessName', 'businessName');

  const getBusinessType = (demo) =>
    getValue(demo, 'BusinessType', 'businessType');

  const getLocations = (demo) =>
    getValue(demo, 'Locations', 'locations');

  const getIndustry = (demo) =>
    getValue(demo, 'SelectedIndustry', 'selectedIndustry');

  const getCity = (demo) =>
    getValue(demo, 'City', 'city');

  const getState = (demo) =>
    getValue(demo, 'State', 'state');

  const getCountry = (demo) =>
    getValue(demo, 'Country', 'country');

  const getFullName = (demo) =>
    getValue(demo, 'FullName', 'fullName');

  const getDesignation = (demo) =>
    getValue(demo, 'Designation', 'designation');

  const getWorkEmail = (demo) =>
    getValue(demo, 'WorkEmail', 'workEmail');

  const getMobileNumber = (demo) =>
    getValue(demo, 'MobileNumber', 'mobileNumber');

  const getWhatsappNumber = (demo) =>
    getValue(
      demo,
      'WhatsappNumber',
      'whatsappNumber',
      'WhatsAppNumber'
    );

  const getPreferredDate = (demo) =>
    getValue(demo, 'PreferredDate', 'preferredDate');

  const getPreferredTime = (demo) =>
    getValue(demo, 'PreferredTime', 'preferredTime');

  const getPreferredDemoMode = (demo) =>
    getValue(demo, 'PreferredDemoMode', 'preferredDemoMode');

  const getDemoRequirements = (demo) =>
    getValue(demo, 'DemoRequirements', 'demoRequirements');

  const getAgreeToContact = (demo) =>
    getValue(demo, 'AgreeToContact', 'agreeToContact');

  const getCreatedAt = (demo) =>
    getValue(
      demo,
      'CreatedAt',
      'createdAt',
      'CreatedDate',
      'createdDate',
      'SubmittedAt',
      'submittedAt'
    );

  // =========================================================
  // GET DEMO ID
  // =========================================================
  const getDemoId = (demo, index) => {
    const id = getValue(
      demo,
      'Id',
      'ID',
      'DemoId',
      'DemoID',
      'demoId',
      'id'
    );

    return id !== '-' ? id : index + 1;
  };

  // =========================================================
  // GET STATUS
  // =========================================================
  const getDemoStatus = (demo) => {
    return getValue(
      demo,
      'Status',
      'status'
    );
  };

  // =========================================================
  // STATUS BADGE STYLE
  // =========================================================
  const getStatusBadgeClass = (status) => {
    const normalizedStatus = String(status || '')
      .trim()
      .toLowerCase();

    if (normalizedStatus === 'completed') {
      return 'bg-[#EAF5EC] border-[#B9D9BE] text-[#346739]';
    }

    if (
      normalizedStatus === 'pending' ||
      normalizedStatus === 'in progress'
    ) {
      return 'bg-[#FFF7E6] border-[#F2D49B] text-[#A66A00]';
    }

    if (
      normalizedStatus === 'cancelled' ||
      normalizedStatus === 'canceled'
    ) {
      return 'bg-[#FDECEC] border-[#E5B8B8] text-[#B42318]';
    }

    return 'bg-[#EAF5EC] border-[#B9D9BE] text-[#346739]';
  };

  // =========================================================
  // STATUS DISPLAY TEXT
  // =========================================================
  const getStatusDisplayText = (status) => {
    const normalizedStatus = String(status || '')
      .trim()
      .toLowerCase();

    if (normalizedStatus === 'completed') {
      return 'Completed';
    }

    if (normalizedStatus === 'pending') {
      return 'Pending';
    }

    if (normalizedStatus === 'in progress') {
      return 'In Progress';
    }

    if (
      normalizedStatus === 'cancelled' ||
      normalizedStatus === 'canceled'
    ) {
      return 'Cancelled';
    }

    if (
      normalizedStatus === 'booked' ||
      normalizedStatus === 'demo booked'
    ) {
      return 'Demo Booked';
    }

    if (!status || status === '-') {
      return 'Demo Booked';
    }

    return status;
  };

  // =========================================================
  // UPDATE DEMO STATUS TO COMPLETED
  // =========================================================
  const updateDemoStatus = async () => {
    if (!selectedDemo) return;

    const demoId = getValue(
      selectedDemo,
      'Id',
      'ID',
      'DemoId',
      'DemoID',
      'demoId',
      'id'
    );

    if (demoId === '-') {
      setError(
        'Demo ID is not available. Unable to update the status.'
      );
      return;
    }

    setIsUpdatingStatus(true);
    setError('');

    try {
      const isProductionHttps =
        window.location.protocol === 'https:';

      const apiBaseUrl = isProductionHttps
        ? '/api'
        : (import.meta.env.VITE_API_BASE || '/api');

      // =====================================================
      // PATCH /demo/{demo_id}/status
      // =====================================================
      await axios.patch(
        `${apiBaseUrl}/demo/${encodeURIComponent(demoId)}/status`,
        {
          Status: 'Completed',
        }
      );

      console.log(
        'Demo status updated successfully:',
        demoId
      );

      // =====================================================
      // UPDATE LOCAL CARD STATUS
      // =====================================================
      setDemoRequests((prevRequests) =>
        prevRequests.map((demo) => {
          const currentId = getValue(
            demo,
            'Id',
            'ID',
            'DemoId',
            'DemoID',
            'demoId',
            'id'
          );

          if (String(currentId) === String(demoId)) {
            return {
              ...demo,
              Status: 'Completed',
              status: 'Completed',
            };
          }

          return demo;
        })
      );

      // =====================================================
      // CLOSE MODAL AFTER BACKEND SUCCESS
      // =====================================================
      setSelectedDemo(null);

    } catch (err) {
      console.error(
        'Update Demo Status Error:',
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to update demo status. Please try again.';

      setError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#F8FAF8]">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#346739] tracking-wide">
            BOOKED DEMO REQUESTS
          </h1>

          <p className="mt-1 text-[14px] text-[#777777]">
            View all demo requests submitted by businesses.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDemoRequests}
          disabled={isLoading}
          className="w-fit px-5 h-[40px] rounded-[10px] bg-[#346739] text-white text-[13px] font-medium hover:bg-[#28552D] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-[10px] border border-red-200 bg-red-50 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[250px]">

          <div className="flex flex-col items-center gap-3">

            <div className="w-8 h-8 border-4 border-[#D8E8DA] border-t-[#346739] rounded-full animate-spin" />

            <p className="text-[14px] text-[#777777]">
              Loading demo requests...
            </p>

          </div>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ====================================================== */}
      {!isLoading &&
        !error &&
        demoRequests.length === 0 && (
          <div className="bg-white border border-[#D9D9D9] rounded-[16px] p-10 text-center shadow-sm">

            <div className="w-14 h-14 mx-auto rounded-full bg-[#EAF5EC] flex items-center justify-center mb-4">
              <span className="text-[#346739] text-[24px]">
                ✓
              </span>
            </div>

            <h2 className="text-[18px] font-semibold text-[#1A202C]">
              No Demo Requests
            </h2>

            <p className="mt-2 text-[14px] text-[#777777]">
              No booked demo requests are available.
            </p>

          </div>
        )}

      {/* =====================================================
          DEMO CARDS
      ====================================================== */}
      {!isLoading && demoRequests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {demoRequests.map((demo, index) => {

            const status = getDemoStatus(demo);
            const statusText =
              getStatusDisplayText(status);

            return (
              <button
                key={String(getDemoId(demo, index))}
                type="button"
                onClick={() => setSelectedDemo(demo)}
                className="text-left bg-white border border-[#D9D9D9] rounded-[16px] overflow-hidden shadow-sm hover:shadow-md hover:border-[#346739] transition-all duration-200 cursor-pointer"
              >

                {/* CARD HEADER */}
                <div className="px-5 py-4 bg-[#F7FAF7] border-b border-[#E5E5E5]">

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <h2 className="text-[16px] font-semibold text-[#346739] truncate">
                        {getBusinessName(demo)}
                      </h2>

                      <p className="mt-1 text-[12px] text-[#777777] truncate">
                        {getIndustry(demo)}
                      </p>

                    </div>

                    {/* =================================================
                        DYNAMIC STATUS BADGE
                    ================================================== */}
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${getStatusBadgeClass(
                        status
                      )}`}
                    >
                      {statusText}
                    </span>

                  </div>
                </div>

                {/* ESSENTIAL DETAILS */}
                <div className="p-5 space-y-4">

                  <div className="grid grid-cols-2 gap-4">

                    <DetailItem
                      label="Contact Person"
                      value={getFullName(demo)}
                    />

                    <DetailItem
                      label="Designation"
                      value={getDesignation(demo)}
                    />

                    <DetailItem
                      label="Location"
                      value={`${getCity(demo)}, ${getState(
                        demo
                      )}`}
                    />

                    <DetailItem
                      label="Locations"
                      value={getLocations(demo)}
                    />

                  </div>

                  <div className="h-px bg-[#EEEEEE]" />

                  <div className="grid grid-cols-2 gap-4">

                    <DetailItem
                      label="Demo Date"
                      value={formatDate(
                        getPreferredDate(demo)
                      )}
                    />

                    <DetailItem
                      label="Demo Time"
                      value={getPreferredTime(demo)}
                    />

                  </div>

                  <div className="pt-1 flex items-center justify-between">

                    <span className="text-[12px] text-[#999999]">
                      Click to view full details
                    </span>

                    <span className="text-[13px] font-semibold text-[#346739]">
                      View →
                    </span>

                  </div>

                </div>

              </button>
            );
          })}

        </div>
      )}

      {/* =====================================================
          FULL DETAILS MODAL
      ====================================================== */}
      {selectedDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setSelectedDemo(null)}
        >

          <div
            className="relative w-full max-w-[950px] max-h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-[18px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 px-5 sm:px-7 py-5 bg-[#346739] text-white flex items-start justify-between gap-4">

              <div className="min-w-0">

                <h2 className="text-[20px] sm:text-[22px] font-bold truncate">
                  {getBusinessName(selectedDemo)}
                </h2>

                <p className="mt-1 text-[13px] text-[#E7F3E9]">
                  {getIndustry(selectedDemo)}
                </p>

              </div>

              <button
                type="button"
                onClick={() => setSelectedDemo(null)}
                disabled={isUpdatingStatus}
                className="shrink-0 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-[18px] transition-all disabled:opacity-60"
              >
                ✕
              </button>

            </div>

            <div className="p-5 sm:p-7">

              {/* =================================================
                  BUSINESS INFORMATION
              ================================================== */}
              <div className="border border-[#D9D9D9] rounded-[14px] overflow-hidden mb-5">

                <div className="px-5 py-4 bg-[#F7FAF7] border-b border-[#E5E5E5]">

                  <h3 className="text-[16px] font-semibold text-[#346739]">
                    Business Information
                  </h3>

                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">

                  <DetailItem
                    label="Business Name"
                    value={getBusinessName(
                      selectedDemo
                    )}
                  />

                  <DetailItem
                    label="Business Type"
                    value={getBusinessType(
                      selectedDemo
                    )}
                  />

                  <DetailItem
                    label="Industry"
                    value={getIndustry(selectedDemo)}
                  />

                  <DetailItem
                    label="Number of Locations"
                    value={getLocations(
                      selectedDemo
                    )}
                  />

                  <DetailItem
                    label="City"
                    value={getCity(selectedDemo)}
                  />

                  <DetailItem
                    label="State"
                    value={getState(selectedDemo)}
                  />

                  <DetailItem
                    label="Country"
                    value={getCountry(selectedDemo)}
                  />

                </div>
              </div>

              {/* =================================================
                  CONTACT PERSON
              ================================================== */}
              <div className="border border-[#D9D9D9] rounded-[14px] overflow-hidden mb-5">

                <div className="px-5 py-4 bg-[#F7FAF7] border-b border-[#E5E5E5]">

                  <h3 className="text-[16px] font-semibold text-[#346739]">
                    Contact Person
                  </h3>

                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">

                  <DetailItem
                    label="Full Name"
                    value={getFullName(
                      selectedDemo
                    )}
                  />

                  <DetailItem
                    label="Designation"
                    value={getDesignation(
                      selectedDemo
                    )}
                  />

                  <DetailItem
                    label="Work Email"
                    value={getWorkEmail(
                      selectedDemo
                    )}
                  />

                  <DetailItem
                    label="Mobile Number"
                    value={getMobileNumber(
                      selectedDemo
                    )}
                  />

                  <DetailItem
                    label="WhatsApp Number"
                    value={getWhatsappNumber(
                      selectedDemo
                    )}
                  />

                  <DetailItem
                    label="Contact Permission"
                    value={
                      String(
                        getAgreeToContact(
                          selectedDemo
                        )
                      ).toLowerCase() === 'true'
                        ? 'Agreed to be contacted'
                        : 'Not agreed'
                    }
                  />

                </div>
              </div>

              {/* =================================================
                  DEMO SCHEDULE
              ================================================== */}
              <div className="border border-[#D9D9D9] rounded-[14px] overflow-hidden mb-5">

                <div className="px-5 py-4 bg-[#F7FAF7] border-b border-[#E5E5E5]">

                  <h3 className="text-[16px] font-semibold text-[#346739]">
                    Demo Schedule
                  </h3>

                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <div className="rounded-[12px] bg-[#F3F8F3] border border-[#D8E8DA] p-4">

                    <span className="block text-[12px] text-[#777777] mb-1">
                      Preferred Date
                    </span>

                    <span className="text-[16px] font-semibold text-[#346739]">
                      {formatDate(
                        getPreferredDate(
                          selectedDemo
                        )
                      )}
                    </span>

                  </div>

                  <div className="rounded-[12px] bg-[#F3F8F3] border border-[#D8E8DA] p-4">

                    <span className="block text-[12px] text-[#777777] mb-1">
                      Preferred Time
                    </span>

                    <span className="text-[16px] font-semibold text-[#346739]">
                      {getPreferredTime(
                        selectedDemo
                      )}
                    </span>

                  </div>

                  <div className="rounded-[12px] bg-[#F3F8F3] border border-[#D8E8DA] p-4">

                    <span className="block text-[12px] text-[#777777] mb-1">
                      Demo Mode
                    </span>

                    <span className="text-[16px] font-semibold text-[#346739]">
                      {getPreferredDemoMode(
                        selectedDemo
                      )}
                    </span>

                  </div>

                </div>
              </div>

              {/* =================================================
                  DEMO REQUIREMENTS
              ================================================== */}
              <div className="border border-[#D9D9D9] rounded-[14px] overflow-hidden mb-5">

                <div className="px-5 py-4 bg-[#F7FAF7] border-b border-[#E5E5E5]">

                  <h3 className="text-[16px] font-semibold text-[#346739]">
                    Demo Requirements
                  </h3>

                </div>

                <div className="p-5">

                  <div className="w-full min-h-[110px] bg-[#FAFAFA] border border-[#E0E0E0] rounded-[10px] p-4">

                    <p className="text-[14px] leading-7 text-[#444444] whitespace-pre-wrap">
                      {getDemoRequirements(
                        selectedDemo
                      ) !== '-'
                        ? getDemoRequirements(
                            selectedDemo
                          )
                        : 'No requirements provided.'}
                    </p>

                  </div>

                </div>
              </div>

              {/* =================================================
                  ADDITIONAL INFORMATION
              ================================================== */}
              <div className="border border-[#D9D9D9] rounded-[14px] overflow-hidden">

                <div className="px-5 py-4 bg-[#F7FAF7] border-b border-[#E5E5E5]">

                  <h3 className="text-[16px] font-semibold text-[#346739]">
                    Additional Information
                  </h3>

                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">

                  <DetailItem
                    label="Request ID"
                    value={getDemoId(
                      selectedDemo,
                      0
                    )}
                  />

                  <DetailItem
                    label="Status"
                    value={getStatusDisplayText(
                      getDemoStatus(
                        selectedDemo
                      )
                    )}
                  />

                  <DetailItem
                    label="Submitted At"
                    value={formatDateTime(
                      getCreatedAt(
                        selectedDemo
                      )
                    )}
                  />

                </div>
              </div>

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================== */}
            <div className="sticky bottom-0 px-5 sm:px-7 py-4 bg-white border-t border-[#E5E5E5] flex flex-col sm:flex-row justify-end gap-3">

              {/* COMPLETED BUTTON */}
              <button
                type="button"
                onClick={updateDemoStatus}
                disabled={
                  isUpdatingStatus ||
                  String(
                    getDemoStatus(
                      selectedDemo
                    )
                  ).toLowerCase() ===
                    'completed'
                }
                className="w-full sm:w-[140px] h-[42px] rounded-[10px] bg-[#346739] text-white text-[13px] font-medium hover:bg-[#28552D] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isUpdatingStatus
                  ? 'Updating...'
                  : String(
                      getDemoStatus(
                        selectedDemo
                      )
                    ).toLowerCase() ===
                    'completed'
                  ? 'Completed'
                  : 'Completed'}
              </button>

              {/* CLOSE BUTTON */}
              <button
                type="button"
                onClick={() =>
                  setSelectedDemo(null)
                }
                disabled={isUpdatingStatus}
                className="w-full sm:w-[120px] h-[42px] rounded-[10px] bg-[#F3F4F3] border border-[#D9D9D9] text-[#346739] text-[13px] font-medium hover:bg-[#EAF5EC] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DemoNotificatin;