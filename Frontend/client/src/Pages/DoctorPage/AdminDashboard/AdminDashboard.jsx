import React, { useEffect, useState } from 'react';

// Import all icons directly from your assets folder as requested
import CalendarIcon from '../../../assets/DoctorDashboard/CalendarCheckIcon.png';
import CheckCircleIcon from '../../../assets/DoctorDashboard/CompletedIcon.png';
import PendingIcon from '../../../assets/DoctorDashboard/WaitingIcon.png';
import CancelIcon from '../../../assets/DoctorDashboard/Reject.png';
import AcceptIcon from '../../../assets/DoctorDashboard/Accept.png';

// =========================================================================
// BUSINESS DETAIL SCREEN COMPONENT (Dynamic Rendering)
// =========================================================================
const BusinessDetailScreen = ({
  business,
  onBack,
  onApprove,
  onReject,
}) => {
  const [popupType, setPopupType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!business) return null;

  // ============================================================
  // REJECT & APPROVE BUTTONS
  // ============================================================
  const handleRejectClick = () => {
    if (!business?.Id) {
      alert('Invalid business ID.');
      return;
    }
    setPopupType('reject');
  };

  const handleApproveClick = () => {
    if (!business?.Id) {
      alert('Invalid business ID.');
      return;
    }
    setPopupType('approve');
  };

  // ============================================================
  // CONFIRM ACTIONS
  // ============================================================
  const handleConfirmApprove = async () => {
    if (isSubmitting || !onApprove) return;
    try {
      setIsSubmitting(true);
      setPopupType(null);
      await onApprove(business);
    } catch (error) {
      console.error('[Business Detail] Approve action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (isSubmitting || !onReject) return;
    try {
      setIsSubmitting(true);
      setPopupType(null);
      await onReject(business);
    } catch (error) {
      console.error('[Business Detail] Reject action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = () => setPopupType(null);

  // Helper to format camelCase/PascalCase keys to standard labels
  const formatLabel = (key) => {
    const result = key.replace(/([A-Z])/g, ' $1').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  // Helper to render complex JSON objects neatly if nested
  const renderValue = (val) => {
    if (typeof val === 'object' && val !== null) {
      return (
        <div className="flex flex-col gap-1 mt-1">
          {Object.entries(val).map(([k, v]) => (
            <span key={k} className="text-[13px] text-[#222222]">
              <span className="text-[#666666] font-normal">{formatLabel(k)}:</span> {String(v || '-')}
            </span>
          ))}
        </div>
      );
    }
    return String(val || '-');
  };

  const getPopupContent = () => {
    switch (popupType) {
      case 'reject':
        return {
          title: 'Reject Application?',
          message: 'Are you sure you want to reject this application? This action will reject the business registration request.',
          type: 'reject',
        };
      case 'approve':
        return {
          title: 'Approve Business?',
          message: 'Are you sure you want to approve this business registration? The business will be approved and can access their dashboard.',
          type: 'approve',
        };
      default:
        return { title: '', message: '', type: null };
    }
  };

  const popupContent = getPopupContent();

  const businessDataFields = business.BusinessData || {};
  const hasDynamicData = Object.keys(businessDataFields).length > 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto bg-white border border-[#E0E0E0] rounded-[16px] p-6 md:p-8 shadow-sm relative">
      
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[#346739] hover:opacity-80 transition-opacity cursor-pointer font-['Poppins'] font-medium text-[16px]"
        >
          <span>&lt;&lt;</span> Back
        </button>
      </div>

      {/* TOP BANNER */}
      <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-2">
        <div className="flex items-center gap-4">
          {/* Show Profile Image if exists */}
          {business.ProfilePic ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#D9D9D9] flex-shrink-0">
              <img 
                src={`${import.meta.env.VITE_API_BASE || ""}${business.ProfilePic}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#EAEAEA] flex items-center justify-center font-bold text-xl text-[#346739] flex-shrink-0">
              {(business.BusinessName || business.FullName || 'B').charAt(0).toUpperCase()}
            </div>
          )}
          
          <div>
            <h3 className="font-['Poppins'] font-bold text-[18px] text-[#346739]">
              {business.BusinessName || 'Unknown Business'}
            </h3>
            <p className="font-['Roboto'] text-[14px] text-[#555555]">
              {business.FullName || business.UserName} &nbsp;|&nbsp; {business.IndustryType || 'General'} &nbsp;|&nbsp; Registered on {business.date}
            </p>
          </div>
        </div>
      </div>

      {/* DYNAMIC SECTIONS GRID */}
      <div className="flex flex-col gap-6">

        {/* GENERAL INFORMATION BOX */}
        <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-6">
          <h3 className="font-['Poppins'] font-bold text-[16px] text-[#BD4444] tracking-wide uppercase">
            General Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">Full Name</span>
              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">{business.FullName || '-'}</span>
            </div>
            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">Email Address</span>
              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">{business.EmailAddress || '-'}</span>
            </div>
            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">Mobile Number</span>
              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">{business.MobileNumber || '-'}</span>
            </div>
            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">WhatsApp Number</span>
              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">{business.BusinessPhoneNumber || '-'}</span>
            </div>
            <div className="lg:col-span-2">
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">Address</span>
              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                {[business.Address, business.City, business.State, business.Pincode, business.Country].filter(Boolean).join(', ') || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* DYNAMIC BUSINESS DATA BOX */}
        <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-[#FAFAFA] flex flex-col gap-6">
          <h3 className="font-['Poppins'] font-bold text-[16px] text-[#346739] tracking-wide uppercase">
            Business Specifics
          </h3>
          {hasDynamicData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(businessDataFields).map(([key, value]) => (
                <div key={key} className={typeof value === 'object' && value !== null ? "col-span-1 sm:col-span-2 lg:col-span-3" : ""}>
                  <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                    {formatLabel(key)}
                  </span>
                  <div className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                    {renderValue(value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No additional business data provided.</p>
          )}
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={handleRejectClick}
          className="px-6 py-2.5 rounded-[8px] bg-[#C94A4A] text-white font-['Roboto'] font-medium text-[14px] hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          Reject Application
        </button>
        <button
          type="button"
          onClick={handleApproveClick}
          className="px-6 py-2.5 rounded-[8px] bg-[#008000] text-white font-['Roboto'] font-medium text-[14px] hover:bg-opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          Approve Business
        </button>
      </div>

      {/* CONFIRMATION POPUP */}
      {popupType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleClosePopup}>
          <div className="relative w-full max-w-[480px] bg-white rounded-[16px] shadow-2xl p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            
            <button
              type="button"
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>

            {popupType === 'reject' && (
              <div className="flex flex-col items-center text-center gap-5 pt-3">
                <div className="w-16 h-16 rounded-full bg-[#C94A4A] flex items-center justify-center text-white text-3xl font-bold">!</div>
                <h3 className="font-['Poppins'] font-bold text-[20px] text-[#C94A4A]">{popupContent.title}</h3>
                <p className="font-['Roboto'] text-[14px] text-[#444444] leading-relaxed">
                  {popupContent.message}<br />
                  <span className="font-semibold">{business.BusinessName}</span>
                </p>
                <div className="flex w-full gap-3 pt-2">
                  <button type="button" onClick={handleClosePopup} className="flex-1 h-[44px] rounded-[8px] border border-[#D9D9D9] bg-white text-[#444444] font-['Roboto'] font-medium hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={handleConfirmReject} className="flex-1 h-[44px] rounded-[8px] bg-[#C94A4A] text-white font-['Roboto'] font-medium hover:bg-[#B83E3E]">Yes, Reject</button>
                </div>
              </div>
            )}

            {popupType === 'approve' && (
              <div className="flex flex-col items-center text-center gap-5 pt-3">
                <div className="w-16 h-16 rounded-full bg-[#008000] flex items-center justify-center text-white text-3xl font-bold">✓</div>
                <h3 className="font-['Poppins'] font-bold text-[20px] text-[#008000]">{popupContent.title}</h3>
                <p className="font-['Roboto'] text-[14px] text-[#444444] leading-relaxed">
                  {popupContent.message}<br />
                  <span className="font-semibold">{business.BusinessName}</span>
                </p>
                <div className="flex w-full gap-3 pt-2">
                  <button type="button" onClick={handleClosePopup} className="flex-1 h-[44px] rounded-[8px] border border-[#D9D9D9] bg-white text-[#444444] font-['Roboto'] font-medium hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={handleConfirmApprove} className="flex-1 h-[44px] rounded-[8px] bg-[#008000] text-white font-['Roboto'] font-medium hover:bg-[#006B00]">Yes, Approve</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};


// =========================================================================
// MAIN ADMIN DASHBOARD COMPONENT
// =========================================================================
const AdminDashboard = () => {
  // Modal States
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  // Approve Business Confirmation Modal States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedBusinessToApprove, setSelectedBusinessToApprove] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');

  // Reject Business Confirmation Modal States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedBusinessToReject, setSelectedBusinessToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Reject Success Popup
  const [isRejectSuccessModalOpen, setIsRejectSuccessModalOpen] = useState(false);

  // Selected Business Detail Modal State
  const [selectedBusinessDetail, setSelectedBusinessDetail] = useState(null);

  // Admin dashboard API data
  const [dashboardStats, setDashboardStats] = useState({
    Total: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    ByIndustry: {}, // Added ByIndustry object to state
  });

  const [todayApprovals, setTodayApprovals] = useState([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || '/api';
  const adminName = localStorage.getItem('adminName') || 'Admin';

  const getAdminHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString('en-IN');
  };

  // Fetch dashboard statistics and pending requests
  const fetchAdminDashboard = async () => {
    setIsLoadingApprovals(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('[Admin Dashboard] adminToken is missing.');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/dashboard`, {
        method: 'GET',
        cache: 'no-store',
        headers: getAdminHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      
      // Update Dashboard Stats mappings to align with API
      setDashboardStats({
        Total: Number(data.Total) || 0,
        Pending: Number(data.Pending) || 0,
        Approved: Number(data.Approved) || 0,
        Rejected: Number(data.Rejected) || 0,
        ByIndustry: data.ByIndustry || {}, // Mapping ByIndustry
      });

      const pendingRequests = Array.isArray(data.PendingRequests) ? data.PendingRequests : [];

      // Map to UI friendly object, keeping raw data accessible
      const formattedRequests = pendingRequests.map((item) => ({
        ...item,
        id: item.Id,
        name: item.BusinessName || 'Unknown Business',
        owner: item.FullName || item.UserName || '-',
        industry: item.IndustryType || '-',
        date: formatDate(item.CreatedAt),
      }));

      setTodayApprovals(formattedRequests);
    } catch (error) {
      console.error('[Admin Dashboard] Fetch error:', error);
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  // Open the approval popup modal
  const handleOpenApproveModal = (item) => {
    setSelectedBusinessToApprove(item);
    setApprovalReason('');
    setIsApproveModalOpen(true);
  };

  // Confirm approval through the real backend API
  const handleConfirmApproval = async () => {
    if (!selectedBusinessToApprove?.Id) return;
    setActionLoading(true);
    try {
      const businessId = selectedBusinessToApprove.Id;
      const response = await fetch(`${API_BASE}/admin/businesses/${businessId}/approve`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.detail || data.message || 'Failed to approve business request.');
        return;
      }

      setIsApproveModalOpen(false);
      setSelectedBusinessToApprove(null);
      setApprovalReason('');
      setIsSuccessModalOpen(true);
      await fetchAdminDashboard();
    } catch (error) {
      console.error('[Admin Dashboard] Approve API error:', error);
      alert('Unable to connect to the approve API. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open the rejection popup modal
  const handleOpenRejectModal = (item) => {
    setSelectedBusinessToReject(item);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmRejection = async () => {
    if (!selectedBusinessToReject?.Id) return;
    setActionLoading(true);
    try {
      const businessId = selectedBusinessToReject.Id;
      const response = await fetch(`${API_BASE}/admin/businesses/${businessId}/reject`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.detail || data.message || 'Failed to reject business request.');
        return;
      }

      setIsRejectModalOpen(false);
      setSelectedBusinessToReject(null);
      setRejectionReason('');
      setIsRejectSuccessModalOpen(true);
      await fetchAdminDashboard();
    } catch (error) {
      console.error('[Admin Dashboard] Reject API error:', error);
      alert('Unable to connect to the reject API. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Detail Screen Actions
  const handleConfirmApprovalFromDetail = async (business) => {
    if (!business?.Id) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/businesses/${business.Id}/approve`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.detail || data.message || 'Failed to approve business request.');
        return;
      }

      setSelectedBusinessDetail(null);
      setIsSuccessModalOpen(true);
      await fetchAdminDashboard();
    } catch (error) {
      alert('Unable to connect to the approve API.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRejectionFromDetail = async (business) => {
    if (!business?.Id) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/businesses/${business.Id}/reject`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.detail || data.message || 'Failed to reject business request.');
        return;
      }

      setSelectedBusinessDetail(null);
      setIsRejectSuccessModalOpen(true);
      await fetchAdminDashboard();
    } catch (error) {
      alert('Unable to connect to the reject API.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-['Poppins'] font-bold text-[22px] md:text-[24px] text-[#346739]">
          WELCOME BACK, {adminName.toUpperCase()}
        </h1>
      </div>

      {/* Subtitle Message */}
      <p className="font-['Roboto'] text-[16px] text-[#BD4444]">
        Today you have {dashboardStats.Pending} registrations to review and approve. <span className="text-[#888888] text-[14px]">(Updates every day)</span>
      </p>

      {/* 5 Cards Grid Section (Added Industry Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Approvals */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">{dashboardStats.Total}</span>
            <img src={CalendarIcon} alt="Calendar Check" className="w-[30px] h-[30px] object-contain" />
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">TOTAL BUSINESSES</span>
        </div>

        {/* Card 2: Approved Approvals */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">{dashboardStats.Approved}</span>
            <img src={CheckCircleIcon} alt="Approved" className="w-[30px] h-[30px] object-contain" />
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">APPROVED</span>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">{dashboardStats.Pending}</span>
            <img src={PendingIcon} alt="Pending" className="w-[30px] h-[30px] object-contain" />
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">PENDING</span>
        </div>

        {/* Card 4: Rejected Approvals */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">{dashboardStats.Rejected}</span>
            <img src={CancelIcon} alt="Rejected" className="w-[30px] h-[30px] object-contain" />
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">REJECTED</span>
        </div>

        {/* Card 5: By Industry */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 max-h-[80px] overflow-y-auto scrollbar-hide pr-1 w-full">
              {Object.keys(dashboardStats.ByIndustry || {}).length > 0 ? (
                Object.entries(dashboardStats.ByIndustry).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center w-full">
                    <span className="font-['Poppins'] font-semibold text-[13px] text-[#346739] leading-tight truncate pr-2">
                      {key}
                    </span>
                    <span className="font-['Poppins'] font-bold text-[14px] text-[#346739] leading-tight">
                      {val}
                    </span>
                  </div>
                ))
              ) : (
                <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">0</span>
              )}
            </div>
            
            <div className="w-[30px] h-[30px] flex items-center justify-center bg-[#EAEAEA] rounded-full text-[#346739] flex-shrink-0 ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739] mt-2">BY INDUSTRY</span>
        </div>

      </div>

      {/* Two Columns Section: Today's Approvals & WhatsApp Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Left Column: Today's Approvals List */}
        <div className="bg-white border border-[#E0E0E0] rounded-[16px] p-[24px] flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-['Poppins'] font-bold text-[16px] text-[#346739]">
              PENDING APPROVALS
            </h3>
            <span className="font-['Roboto'] text-[14px] text-[#BD4444] font-medium">
              {dashboardStats.Pending} pending
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {isLoadingApprovals ? (
              <div className="py-8 text-center font-['Roboto'] text-[14px] text-[#666666]">
                Loading pending registrations...
              </div>
            ) : todayApprovals.length === 0 ? (
              <div className="py-8 text-center font-['Roboto'] text-[14px] text-[#666666]">
                No pending registrations found.
              </div>
            ) : (
              todayApprovals.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedBusinessDetail(item)}
                  className="bg-[#F9F9F9] border border-[#D9D9D9] rounded-[14px] px-[20px] py-[16px] flex items-center justify-between hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none cursor-pointer"
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="font-['Poppins'] font-semibold text-[15px] text-[#222222]">
                      {item.name}
                    </span>
                    <span className="font-['Roboto'] text-[13px] text-[#666666] mt-2">
                      {item.industry} | {item.owner} | {item.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenRejectModal(item)}
                      disabled={actionLoading}
                      className="w-[30px] h-[30px] flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      <img src={CancelIcon} alt="Reject" className="w-[25px] h-[25px] object-contain" />
                    </button>

                    <button
                      onClick={() => handleOpenApproveModal(item)}
                      disabled={actionLoading}
                      className="w-[30px] h-[30px] flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      <img src={AcceptIcon} alt="Approve" className="w-[25px] h-[25px] object-contain" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: WhatsApp Connection Status */}
        <div className="bg-white border border-[#E0E0E0] rounded-[16px] p-[24px] flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-['Poppins'] font-bold text-[16px] text-[#346739]">
              WHATSAPP CONNECTION STATUS
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {todayApprovals.length === 0 ? (
              <div className="py-8 text-center font-['Roboto'] text-[14px] text-[#666666]">
                No pending registrations available.
              </div>
            ) : (
              todayApprovals.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F9F9F9] border border-[#D9D9D9] rounded-[14px] px-[20px] py-[20px] flex items-center justify-between hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none"
                >
                  <span className="font-['Poppins'] font-medium text-[15px] text-[#222222]">
                    {item.name}
                  </span>
                  <span className="font-['Roboto'] font-semibold text-[14px] text-[#BD4444]">
                    Disconnected
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Approve Business Confirmation Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[700px] p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative">
            
            <h2 className="font-['Poppins'] font-bold text-[20px] text-[#346739]">
              APPROVE BUSINESS
            </h2>

            <div className="border border-[#D9D9D9] rounded-[16px] p-6 flex flex-col gap-4 bg-white">
              <div className="flex flex-col gap-1">
                <h4 className="font-['Poppins'] font-semibold text-[16px] text-[#BD4444]">
                  Approve Business Registration?
                </h4>
                <p className="font-['Roboto'] text-[14px] text-[#666666]">
                  This business will be approved and granted access to the platform. They will be notified and can continue with the remaining setup.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">
                  Reason (Optional)
                </label>
                <textarea 
                  rows="4"
                  placeholder="Enter the reason here..."
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="border border-[#D9D9D9] rounded-[12px] p-3 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
              <button 
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="w-1/2 bg-white border border-[#346739] text-[#346739] hover:bg-gray-50 font-['Poppins'] font-medium text-[15px] py-3 rounded-[12px] transition-colors"
              >
                Go Back
              </button>
              <button 
                type="button"
                onClick={handleConfirmApproval}
                disabled={actionLoading}
                className="w-1/2 bg-[#008000] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#006400] text-white font-['Poppins'] font-medium text-[15px] py-3 rounded-[12px] shadow-sm transition-colors"
              >
                {actionLoading ? 'Approving...' : 'Approve Business'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Business Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[700px] p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative">
            
            <h2 className="font-['Poppins'] font-bold text-[20px] text-[#346739]">
              REJECT BUSINESS
            </h2>

            <div className="border border-[#D9D9D9] rounded-[16px] p-6 flex flex-col gap-4 bg-white">
              <div className="flex flex-col gap-1">
                <h4 className="font-['Poppins'] font-semibold text-[16px] text-[#BD4444]">
                  Reject Business Registration?
                </h4>
                <p className="font-['Roboto'] text-[14px] text-[#666666]">
                  This registration will be rejected and the applicant will be notified.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">
                  Reason (Optional)
                </label>
                <textarea 
                  rows="4"
                  placeholder="Enter the reason here..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="border border-[#D9D9D9] rounded-[12px] p-3 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
              <button 
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="w-1/2 bg-white border border-[#346739] text-[#346739] hover:bg-gray-50 font-['Poppins'] font-medium text-[15px] py-3 rounded-[12px] transition-colors"
              >
                Go Back
              </button>
              <button 
                type="button"
                onClick={handleConfirmRejection}
                disabled={actionLoading}
                className="w-1/2 bg-[#BD4444] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a53b3b] text-white font-['Poppins'] font-medium text-[15px] py-3 rounded-[12px] shadow-sm transition-colors"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Business'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal for Approval */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[550px] p-6 md:p-8 shadow-2xl relative flex flex-col items-center">
            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-3 right-5 w-8 h-8 rounded-full border border-[#346739] flex items-center justify-center text-[#346739] hover:bg-[#346739] hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="w-full border border-[#E0E0E0] rounded-[20px] p-6 md:p-8 flex flex-col items-center text-center mt-4">
              <div className="w-[60px] h-[60px] bg-[#346739] rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-['Poppins'] font-bold text-[20px] md:text-[22px] text-[#346739] mb-4">
                Business Approved Successfully
              </h3>
              <p className="font-['Roboto'] text-[14px] md:text-[15px] text-[#444444] leading-relaxed max-w-[420px]">
                The registration has been approved successfully and the applicant has been notified.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Success Popup */}
      {isRejectSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[550px] p-6 md:p-8 shadow-2xl relative flex flex-col items-center">
            <button 
              onClick={() => setIsRejectSuccessModalOpen(false)}
              className="absolute top-4 right-5 w-8 h-8 rounded-full border border-[#346739] flex items-center justify-center text-[#346739] hover:bg-[#346739] hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="w-full border border-[#E0E0E0] rounded-[20px] p-6 md:p-8 flex flex-col items-center text-center mt-4">
              <div className="w-[60px] h-[60px] bg-[#346739] rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-['Poppins'] font-bold text-[20px] md:text-[22px] text-[#346739] mb-4">
                Registration Rejected
              </h3>
              <p className="font-['Roboto'] text-[14px] md:text-[15px] text-[#444444] leading-relaxed max-w-[420px]">
                The application has been rejected successfully and the applicant has been notified.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Business Detail Screen Modal Popup */}
      {selectedBusinessDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
          <div className="bg-black/70 min-h-screen h-full w-full p-4 md:p-10 overflow-y-auto relative">
            <BusinessDetailScreen
              business={selectedBusinessDetail}
              onBack={() => setSelectedBusinessDetail(null)}
              onApprove={handleConfirmApprovalFromDetail}
              onReject={handleConfirmRejectionFromDetail}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export { BusinessDetailScreen, AdminDashboard as default };