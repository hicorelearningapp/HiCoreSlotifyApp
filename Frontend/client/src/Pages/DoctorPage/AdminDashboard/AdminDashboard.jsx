import React, { useEffect, useState } from 'react';

// Import all icons directly from your assets folder as requested
import CalendarIcon from '../../../assets/DoctorDashboard/CalendarCheckIcon.png';
import CheckCircleIcon from '../../../assets/DoctorDashboard/CompletedIcon.png';
import PendingIcon from '../../../assets/DoctorDashboard/WaitingIcon.png';
import CancelIcon from '../../../assets/DoctorDashboard/Reject.png';
import AcceptIcon from '../../../assets/DoctorDashboard/Accept.png';

// Import the BusinessDetailScreen component
import BusinessDetailScreen from './BusinessDetailScreen'; // Update path if necessary

const AdminDashboard = () => {
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  // Approve Doctor Confirmation Modal States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedBusinessToApprove, setSelectedBusinessToApprove] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');

  // Reject Doctor Confirmation Modal States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedBusinessToReject, setSelectedBusinessToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // New State for Reject Success Popup
  const [isRejectSuccessModalOpen, setIsRejectSuccessModalOpen] = useState(false);

  // Selected Business Detail Modal State
  const [selectedBusinessDetail, setSelectedBusinessDetail] = useState(null);

  const [newBusinessData, setNewBusinessData] = useState({
    name: '',
    owner: '',
    mobile: '',
    city: '',
    industry: '',
    whatsappMobile: '',
  });

  // Admin dashboard API data
  const [dashboardStats, setDashboardStats] = useState({
    Total: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  });

  const [todayApprovals, setTodayApprovals] = useState([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || '/api';

  // Get the currently logged-in admin name from localStorage.
  // AdminLogin stores this value after successful login.
  const adminName = localStorage.getItem('adminName') || 'Admin';

  // Get the admin token created during Admin Login.
  const getAdminHeaders = () => {
    const token = localStorage.getItem('adminToken');

    return {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString('en-IN');
  };

  // Fetch dashboard statistics and pending doctor requests
  const fetchAdminDashboard = async () => {
    setIsLoadingApprovals(true);

    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        console.error('[Admin Dashboard] adminToken is missing.');
        setDashboardStats({
          Total: 0,
          Pending: 0,
          Approved: 0,
          Rejected: 0,
        });
        setTodayApprovals([]);
        return;
      }

      const response = await fetch(`${API_BASE}/admin/dashboard`, {
        method: 'GET',
        cache: 'no-store',
        headers: getAdminHeaders(),
      });

      console.log('[Admin Dashboard] GET /admin/dashboard status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        console.error('[Admin Dashboard] Dashboard API failed:', errorData);

        setDashboardStats({
          Total: 0,
          Pending: 0,
          Approved: 0,
          Rejected: 0,
        });
        setTodayApprovals([]);
        return;
      }

      const data = await response.json();

      console.log('[Admin Dashboard] API response:', data);

      setDashboardStats({
        Total: Number(data.Total) || 0,
        Pending: Number(data.Pending) || 0,
        Approved: Number(data.Approved) || 0,
        Rejected: Number(data.Rejected) || 0,
      });

      const pendingRequests = Array.isArray(data.PendingRequest)
        ? data.PendingRequest
        : [];

      // Keep the complete backend doctor object and also create the
      // display fields required by the existing design.
      const formattedRequests = pendingRequests
        .filter((item) => item && item.Id)
        .map((item) => ({
          ...item,
          id: item.Id,
          name: item.FullName || item.UserName || 'Unknown Doctor',
          doctor: item.ClinicName || item.FullName || '-',
          category: item.Specialization || item.Qualification || '-',
          date: formatDate(item.CreatedAt),
        }));

      setTodayApprovals(formattedRequests);
    } catch (error) {
      console.error('[Admin Dashboard] Fetch error:', error);
      setDashboardStats({
        Total: 0,
        Pending: 0,
        Approved: 0,
        Rejected: 0,
      });
      setTodayApprovals([]);
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  // WhatsApp status is kept for the existing design.
  // No fake dashboard/business data is inserted here.
  const whatsappStatus = [];

  const handleAddBusinessSubmit = (e) => {
    e.preventDefault();
    if (!newBusinessData.name || !newBusinessData.owner) return;

    const newEntry = {
      id: todayApprovals.length + 1,
      name: newBusinessData.name,
      doctor: newBusinessData.owner,
      category: newBusinessData.industry || 'General',
      date: '7/8/2026',
    };

    setTodayApprovals([newEntry, ...todayApprovals]);
    
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

  // Open the approval popup modal
  const handleOpenApproveModal = (item) => {
    setSelectedBusinessToApprove(item);
    setApprovalReason('');
    setIsApproveModalOpen(true);
  };

  // Confirm approval through the real backend API
  const handleConfirmApproval = async () => {
    if (!selectedBusinessToApprove?.Id) {
      alert('Invalid doctor ID.');
      return;
    }

    setActionLoading(true);

    try {
      const doctorId = selectedBusinessToApprove.Id;

      console.log('[Admin Dashboard] Approving doctor:', doctorId);

      const response = await fetch(
        `${API_BASE}/admin/doctors/${doctorId}/approve`,
        {
          method: 'POST',
          cache: 'no-store',
          headers: getAdminHeaders(),
        }
      );

      console.log(
        '[Admin Dashboard] Approve response status:',
        response.status
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('[Admin Dashboard] Approve failed:', data);

        alert(
          data.detail ||
          data.message ||
          'Failed to approve doctor request.'
        );

        return;
      }

      console.log('[Admin Dashboard] Doctor approved:', data);

      setIsApproveModalOpen(false);
      setSelectedBusinessToApprove(null);
      setApprovalReason('');
      setIsSuccessModalOpen(true);

      // Refresh real dashboard counts and pending list.
      await fetchAdminDashboard();
    } catch (error) {
      console.error('[Admin Dashboard] Approve API error:', error);
      alert('Unable to connect to the approve API. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open the rejection popup modal
  // Used when rejecting directly from the dashboard list.
  const handleOpenRejectModal = (item) => {
    setSelectedBusinessToReject(item);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  // Approve directly from BusinessDetailScreen.
  // BusinessDetailScreen already has its own confirmation popup,
  // so we do NOT open the AdminDashboard approve popup again.
  const handleConfirmApprovalFromDetail = async (business) => {
    if (!business?.Id) {
      alert('Invalid doctor ID.');
      return;
    }

    setActionLoading(true);

    try {
      const doctorId = business.Id;

      console.log(
        '[Admin Dashboard] Approving doctor from detail:',
        doctorId
      );

      const response = await fetch(
        `${API_BASE}/admin/doctors/${doctorId}/approve`,
        {
          method: 'POST',
          cache: 'no-store',
          headers: getAdminHeaders(),
        }
      );

      console.log(
        '[Admin Dashboard] Approve from detail response status:',
        response.status
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(
          '[Admin Dashboard] Approve from detail failed:',
          data
        );

        alert(
          data.detail ||
          data.message ||
          'Failed to approve doctor request.'
        );

        return;
      }

      console.log(
        '[Admin Dashboard] Doctor approved from detail:',
        data
      );

      // Close Business Detail Screen first.
      setSelectedBusinessDetail(null);

      // Show the existing success popup.
      setIsSuccessModalOpen(true);

      // Refresh dashboard counts and pending list.
      await fetchAdminDashboard();
    } catch (error) {
      console.error(
        '[Admin Dashboard] Approve from detail API error:',
        error
      );

      alert(
        'Unable to connect to the approve API. Please try again.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Reject directly from BusinessDetailScreen.
  // BusinessDetailScreen already has its own confirmation popup,
  // so we do NOT open the AdminDashboard reject popup again.
  const handleConfirmRejectionFromDetail = async (business) => {
    if (!business?.Id) {
      alert('Invalid doctor ID.');
      return;
    }

    setActionLoading(true);

    try {
      const doctorId = business.Id;

      console.log(
        '[Admin Dashboard] Rejecting doctor from detail:',
        doctorId
      );

      const response = await fetch(
        `${API_BASE}/admin/doctors/${doctorId}/reject`,
        {
          method: 'POST',
          cache: 'no-store',
          headers: getAdminHeaders(),
        }
      );

      console.log(
        '[Admin Dashboard] Reject from detail response status:',
        response.status
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(
          '[Admin Dashboard] Reject from detail failed:',
          data
        );

        alert(
          data.detail ||
          data.message ||
          'Failed to reject doctor request.'
        );

        return;
      }

      console.log(
        '[Admin Dashboard] Doctor rejected from detail:',
        data
      );

      // Close Business Detail Screen first.
      setSelectedBusinessDetail(null);

      // Show the existing rejection success popup.
      setIsRejectSuccessModalOpen(true);

      // Refresh dashboard counts and pending list.
      await fetchAdminDashboard();
    } catch (error) {
      console.error(
        '[Admin Dashboard] Reject from detail API error:',
        error
      );

      alert(
        'Unable to connect to the reject API. Please try again.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm rejection through the real backend API
  const handleConfirmRejection = async () => {
    if (!selectedBusinessToReject?.Id) {
      alert('Invalid doctor ID.');
      return;
    }

    setActionLoading(true);

    try {
      const doctorId = selectedBusinessToReject.Id;

      console.log('[Admin Dashboard] Rejecting doctor:', doctorId);

      const response = await fetch(
        `${API_BASE}/admin/doctors/${doctorId}/reject`,
        {
          method: 'POST',
          cache: 'no-store',
          headers: getAdminHeaders(),
        }
      );

      console.log(
        '[Admin Dashboard] Reject response status:',
        response.status
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('[Admin Dashboard] Reject failed:', data);

        alert(
          data.detail ||
          data.message ||
          'Failed to reject doctor request.'
        );

        return;
      }

      console.log('[Admin Dashboard] Doctor rejected:', data);

      setIsRejectModalOpen(false);
      setSelectedBusinessToReject(null);
      setRejectionReason('');
      setIsRejectSuccessModalOpen(true);

      // Refresh real dashboard counts and pending list.
      await fetchAdminDashboard();
    } catch (error) {
      console.error('[Admin Dashboard] Reject API error:', error);
      alert('Unable to connect to the reject API. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* Top Welcome Section & Add Business Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-['Poppins'] font-bold text-[22px] md:text-[24px] text-[#346739]">
          WELCOME BACK, {adminName.toUpperCase()}
        </h1>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#346739] hover:bg-white text-white hover:text-[#346739] border border-transparent hover:border-[#346739] font-['Poppins'] font-medium text-[14px] px-[20px] py-[12px] rounded-[12px] transition-all duration-200 shadow-sm hover:shadow-[inset_4px_4px_4px_0px_#00000040]"
        >
          <span className="text-[18px] leading-none">+</span> ADD NEW BUSINESS
        </button>
      </div>

      {/* Subtitle Message */}
      <p className="font-['Roboto'] text-[16px] text-[#BD4444]">
        Today you have {dashboardStats.Pending} registrations to review and approve. <span className="text-[#888888] text-[14px]">(Updates every day)</span>
      </p>

      {/* 4 Cards Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Approvals */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">
              {dashboardStats.Total}
            </span>
            <img src={CalendarIcon} alt="Calendar Check" className="w-[30px] h-[30px] object-contain" />
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">
            TOTAL APPROVALS
          </span>
        </div>

        {/* Card 2: Approved Approvals */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">
              {dashboardStats.Approved}
            </span>
            <img src={CheckCircleIcon} alt="Approved" className="w-[30px] h-[30px] object-contain" />
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">
            APPROVED
          </span>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">
              {dashboardStats.Pending}
            </span>
            <img src={PendingIcon} alt="Pending" className="w-[30px] h-[30px] object-contain" />
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">
            PENDING
          </span>
        </div>

        {/* Card 4: Rejected Approvals */}
        <div className="bg-[#F9F9F9] border-t border-[#D9D9D9] rounded-[16px] p-[20px] flex flex-col justify-between h-[150px] shadow-[4px_4px_4px_0px_#00000040] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-none relative">
          <div className="flex justify-between items-start">
            <span className="font-['Poppins'] font-semibold text-[32px] text-[#346739]">
              {dashboardStats.Rejected}
            </span>
            <img src={CancelIcon} alt="Rejected" className="w-[30px] h-[30px] object-contain" />
          </div>
          <span className="font-['Roboto'] text-[14px] tracking-wide text-[#346739]">
            REJECTED
          </span>
        </div>

      </div>

      {/* Two Columns Section: Today's Approvals & WhatsApp Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Left Column: Today's Approvals List */}
        <div className="bg-white border border-[#E0E0E0] rounded-[16px] p-[24px] flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-['Poppins'] font-bold text-[16px] text-[#346739]">
              TODAY’S APPROVALS
            </h3>
            <span className="font-['Roboto'] text-[14px] text-[#BD4444] font-medium">
              {dashboardStats.Pending} pending approvals
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
                      {item.category} | {item.doctor} | {item.date}
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
                    {item.ClinicName || item.FullName || item.name}
                  </span>

                  <span
  className={`font-['Roboto'] font-semibold text-[14px] ${
    item.WhatsAppBusinessStatus === 'Connected'
      ? 'text-[#346739]'
      : 'text-[#BD4444]'
  }`}
>
  {item.WhatsAppBusinessStatus || 'Disconnected'}
</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add New Business Input Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[700px] p-6 md:p-8 shadow-2xl flex flex-col gap-6">
            
            <h2 className="font-['Poppins'] font-bold text-[20px] text-[#346739]">
              ADD NEW BUSINESS
            </h2>

            <form onSubmit={handleAddBusinessSubmit} className="flex flex-col gap-6">
              <div className="border border-[#D9D9D9] rounded-[16px] p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white">
                
                {/* Business Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">Business Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Business Name"
                    value={newBusinessData.name}
                    onChange={(e) => setNewBusinessData({ ...newBusinessData, name: e.target.value })}
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                    required
                  />
                </div>

                {/* Owner Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">Owner Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter Owner Name"
                    value={newBusinessData.owner}
                    onChange={(e) => setNewBusinessData({ ...newBusinessData, owner: e.target.value })}
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter 10 digit mobile number"
                    value={newBusinessData.mobile}
                    onChange={(e) => setNewBusinessData({ ...newBusinessData, mobile: e.target.value })}
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">City</label>
                  <input 
                    type="text" 
                    placeholder="Enter City Name"
                    value={newBusinessData.city}
                    onChange={(e) => setNewBusinessData({ ...newBusinessData, city: e.target.value })}
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                  />
                </div>

                {/* Select Industry */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">Select Industry</label>
                  <select 
                    value={newBusinessData.industry}
                    onChange={(e) => setNewBusinessData({ ...newBusinessData, industry: e.target.value })}
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#777777] bg-white focus:outline-none focus:border-[#346739]"
                  >
                    <option value="">Select option</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Salon & Spa">Salon & Spa</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Legal">Legal</option>
                    <option value="Pet Care">Pet Care</option>
                  </select>
                </div>

                {/* WhatsApp Mobile Number */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Roboto'] font-medium text-[14px] text-[#346739]">WhatsApp Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter 10 digit WhatsApp mobile number"
                    value={newBusinessData.whatsappMobile}
                    onChange={(e) => setNewBusinessData({ ...newBusinessData, whatsappMobile: e.target.value })}
                    className="border border-[#D9D9D9] rounded-[10px] px-4 py-2.5 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739]"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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

      {/* Approve Doctor Confirmation Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[700px] p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative">
            
            <h2 className="font-['Poppins'] font-bold text-[20px] text-[#346739]">
              APPROVE DOCTOR
            </h2>

            <div className="border border-[#D9D9D9] rounded-[16px] p-6 flex flex-col gap-4 bg-white">
              
              <div className="flex flex-col gap-1">
                <h4 className="font-['Poppins'] font-semibold text-[16px] text-[#BD4444]">
                  Approve Doctor Registration?
                </h4>
                <p className="font-['Roboto'] text-[14px] text-[#666666]">
                  This doctor will be approved and granted access to the platform. The doctor will be notified and can continue with the remaining setup.
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

            {/* Modal Bottom Buttons */}
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
                {actionLoading ? 'Approving...' : 'Approve Doctor'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Reject Doctor Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[700px] p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative">
            
            <h2 className="font-['Poppins'] font-bold text-[20px] text-[#346739]">
              REJECT DOCTOR
            </h2>

            <div className="border border-[#D9D9D9] rounded-[16px] p-6 flex flex-col gap-4 bg-white">
              
              <div className="flex flex-col gap-1">
                <h4 className="font-['Poppins'] font-semibold text-[16px] text-[#BD4444]">
                  Reject Doctor Registration?
                </h4>
                <p className="font-['Roboto'] text-[14px] text-[#666666]">
                  This doctor registration will be rejected and the applicant will be notified.
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

            {/* Modal Bottom Buttons */}
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
                {actionLoading ? 'Rejecting...' : 'Reject Doctor'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Success Confirmation Modal for Approval */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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
                Doctor Approved Successfully
              </h3>

              <p className="font-['Roboto'] text-[14px] md:text-[15px] text-[#444444] leading-relaxed max-w-[420px]">
                The doctor registration has been approved successfully and the doctor has been notified.
              </p>

            </div>

          </div>
        </div>
      )}

      {/* Rejection Success Popup Matching Your Image */}
      {isRejectSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[550px] p-6 md:p-8 shadow-2xl relative flex flex-col items-center">
            
            {/* Close Button at Top Right */}
            <button 
              onClick={() => setIsRejectSuccessModalOpen(false)}
              className="absolute top-4 right-5 w-8 h-8 rounded-full border border-[#346739] flex items-center justify-center text-[#346739] hover:bg-[#346739] hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Inner Border Box matching the layout */}
            <div className="w-full border border-[#E0E0E0] rounded-[20px] p-6 md:p-8 flex flex-col items-center text-center mt-4">
              
              {/* Green Checkmark Icon */}
              <div className="w-[60px] h-[60px] bg-[#346739] rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="font-['Poppins'] font-bold text-[20px] md:text-[22px] text-[#346739] mb-4">
                Doctor Registration Rejected
              </h3>

              {/* Description message */}
              <p className="font-['Roboto'] text-[14px] md:text-[15px] text-[#444444] leading-relaxed max-w-[420px]">
                The doctor application has been rejected successfully and the applicant has been notified.
              </p>

            </div>

          </div>
        </div>
      )}

      {/* Business Detail Screen Modal Popup */}
      {selectedBusinessDetail && (
        <div className="fixed inset-0 z-50 flex items-center scrollbar-hide justify-center bg-black/50 overflow-y-auto">
          <div className="bg-black/70 h-full w-full scrollbar-hide p-10 overflow-y-auto shadow-2xl relative p-2">
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

export default AdminDashboard;