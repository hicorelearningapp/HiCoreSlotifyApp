import React, { useState, useEffect, useRef } from 'react';
import {
  FiBriefcase,
  FiLock,
  FiChevronRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiSave,
  FiX,
  FiShield,
  FiCamera,
} from 'react-icons/fi';

const Settings = () => {
  // =========================================================
  // COLORS
  // =========================================================
  const COLORS = {
    primary: '#2A723D',
    primaryDark: '#235d32',
    primaryLight: '#F2F7F4',
    primarySoft: '#F9FCFA',
    heading: '#0F172A',
    text: '#334155',
    muted: '#64748B',
    placeholder: '#94A3B8',
    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    background: '#F8F9FA',
    success: '#16A34A',
    successBg: '#ECFDF5',
    blue: '#2563EB',
    blueBg: '#EFF6FF',
    orange: '#F59E0B',
    orangeBg: '#FFFBEB',
    red: '#DC2626',
    redBg: '#FEF2F2',
  };

  // =========================================================
  // STATE
  // =========================================================
  const [activeSection, setActiveSection] = useState('Business Profile');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });

  const [businessData, setBusinessData] = useState({
    BusinessName: '', FullName: '', EmailAddress: '', MobileNumber: '',
    BusinessPhoneNumber: '', Address: '', City: '', State: '', Pincode: '',
    Country: '', Id: '', Status: '', IsVerified: false, UserName: '',
  });

  const [dynamicData, setDynamicData] = useState({});
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [newProfilePicFile, setNewProfilePicFile] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fileInputRef = useRef(null);

  // =========================================================
  // FETCH DATA
  // =========================================================
  const fetchBusinessProfile = async () => {
    setLoading(true);
    try {
      const sellerId = localStorage.getItem('sellerId');
      if (!sellerId) return;

      const apiBase = import.meta.env.VITE_API_BASE || "/api";
      const response = await fetch(`${apiBase}/businesses/${sellerId}`);

      if (response.ok) {
        const data = await response.json();
        setBusinessData({
          BusinessName: data.BusinessName || '', FullName: data.FullName || '',
          EmailAddress: data.EmailAddress || '', MobileNumber: data.MobileNumber || '',
          BusinessPhoneNumber: data.BusinessPhoneNumber || '', Address: data.Address || '',
          City: data.City || '', State: data.State || '', Pincode: data.Pincode || '',
          Country: data.Country || '', Id: data.Id || '', Status: data.Status || 'Pending',
          IsVerified: data.IsVerified || false, UserName: data.UserName || '',
        });
        setDynamicData(data.BusinessData || {});
        setProfilePicUrl(data.ProfilePic || '');
      }
    } catch (error) {
      console.error("Error fetching business profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  // =========================================================
  // PROFILE IMAGE URL HELPER
  // =========================================================
  const getProfileImageUrl = () => {
    if (!profilePicUrl) return '';
    if (profilePicUrl.startsWith('blob:') || profilePicUrl.startsWith('http://') || profilePicUrl.startsWith('https://')) {
      return profilePicUrl;
    }
    const apiBase = import.meta.env.VITE_API_BASE || "/api";
    return `${apiBase.replace(/\/$/, '')}${profilePicUrl}`;
  };

  // =========================================================
  // SAVE DATA
  // =========================================================
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const sellerId = localStorage.getItem('sellerId');
      const apiBase = import.meta.env.VITE_API_BASE || "/api";
      const formData = new FormData();

      Object.keys(businessData).forEach(key => {
        if (key !== 'Id' && key !== 'Status' && key !== 'IsVerified' && key !== 'UserName') {
          formData.append(key, businessData[key]);
        }
      });

      formData.append('BusinessData', JSON.stringify(dynamicData));
      if (newProfilePicFile) formData.append('ProfilePic', newProfilePicFile);
      if (newPassword) formData.append('Password', newPassword);

      const response = await fetch(`${apiBase}/businesses/${sellerId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setSuccessPopup({ show: true, message: "Profile updated successfully!" });
        setNewPassword('');
        setShowPasswordModal(false);
        fetchBusinessProfile();
      } else {
        const err = await response.json().catch(() => null);
        setErrorPopup({ show: true, message: err?.detail || "Failed to update profile." });
      }
    } catch (error) {
      setErrorPopup({ show: true, message: "A server error occurred. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // FILE HANDLING
  // =========================================================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfilePicFile(file);
      setProfilePicUrl(URL.createObjectURL(file));
    }
  };

  // =========================================================
  // HELPERS & CONSTANTS
  // =========================================================
  const formatLabel = (key) => {
    const result = key.replace(/([A-Z])/g, ' $1').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const settingMenu = [
    { label: 'Business Profile', icon: <FiBriefcase size={18} /> },
    { label: 'Security', icon: <FiLock size={18} /> },
  ];

  // =========================================================
  // SUB-COMPONENTS
  // =========================================================
  const InputField = ({ label, value, onChange, placeholder = '', type = 'text', disabled = false }) => (
    <div>
      <label className="block text-xs font-semibold mb-2" style={{ color: COLORS.text }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F2F7F4] ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
        style={{ borderColor: COLORS.borderDark, color: disabled ? COLORS.muted : COLORS.heading }}
      />
    </div>
  );

  const SectionHeader = ({ title, description }) => (
    <div className="mb-6">
      <h2 className="text-xl font-bold" style={{ color: COLORS.heading }}>{title}</h2>
      <p className="text-sm mt-1" style={{ color: COLORS.muted }}>{description}</p>
    </div>
  );

  const SaveButton = () => (
    <button
      type="button" onClick={handleSaveProfile} disabled={isSaving}
      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      style={{ backgroundColor: COLORS.primary }}
    >
      <FiSave size={16} />
      {isSaving ? 'Saving...' : 'Save Changes'}
    </button>
  );

  // =========================================================
  // SECTIONS
  // =========================================================
  const renderBusinessProfile = () => (
    <>
      <SectionHeader title="Business Profile" description="Manage your standard business information." />

      <div className="border rounded-2xl p-5 mb-6" style={{ borderColor: COLORS.border }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            
            {/* FIXED: Profile Picture Container */}
            <div className="relative">
              {/* Click image to preview */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer"
                onClick={() => profilePicUrl && setShowProfilePreview(true)}
              >
                {profilePicUrl ? (
                  <img src={getProfileImageUrl()} alt="Profile" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <span className="text-xl font-bold" style={{ color: COLORS.primary }}>
                    {businessData.BusinessName?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                )}
              </div>
              
              {/* Click badge to upload */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute -bottom-2 -right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 text-gray-600 cursor-pointer"
              >
                <FiCamera size={12} />
              </button>
              
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div>
              <h3 className="text-lg font-bold" style={{ color: COLORS.heading }}>{businessData.BusinessName || "Your Business"}</h3>
              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>ID: {businessData.Id}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${businessData.Status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {businessData.Status}
                </span>
                {businessData.IsVerified && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">Verified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-5 lg:p-6 mb-6" style={{ borderColor: COLORS.border }}>
        <h3 className="text-base font-bold mb-5" style={{ color: COLORS.heading }}>General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="Username (Read Only)" value={businessData.UserName} disabled={true} />
          <InputField label="Business Name" value={businessData.BusinessName} onChange={(e) => setBusinessData({ ...businessData, BusinessName: e.target.value })} />
          <InputField label="Owner Name" value={businessData.FullName} onChange={(e) => setBusinessData({ ...businessData, FullName: e.target.value })} />
          <InputField label="Email Address" value={businessData.EmailAddress} onChange={(e) => setBusinessData({ ...businessData, EmailAddress: e.target.value })} />
          <InputField label="Mobile Number" value={businessData.MobileNumber} onChange={(e) => setBusinessData({ ...businessData, MobileNumber: e.target.value })} />
          <InputField label="WhatsApp Number" value={businessData.BusinessPhoneNumber} onChange={(e) => setBusinessData({ ...businessData, BusinessPhoneNumber: e.target.value })} />
          <InputField label="Address" value={businessData.Address} onChange={(e) => setBusinessData({ ...businessData, Address: e.target.value })} />
          <InputField label="City" value={businessData.City} onChange={(e) => setBusinessData({ ...businessData, City: e.target.value })} />
          <InputField label="State" value={businessData.State} onChange={(e) => setBusinessData({ ...businessData, State: e.target.value })} />
          <InputField label="Pincode" value={businessData.Pincode} onChange={(e) => setBusinessData({ ...businessData, Pincode: e.target.value })} />
          <InputField label="Country" value={businessData.Country} onChange={(e) => setBusinessData({ ...businessData, Country: e.target.value })} />
        </div>
      </div>

      <div className="border rounded-2xl p-5 lg:p-6 mb-6" style={{ borderColor: COLORS.border, backgroundColor: COLORS.primarySoft }}>
        <h3 className="text-base font-bold mb-1" style={{ color: COLORS.heading }}>Business Specifics</h3>
        <p className="text-xs mb-5" style={{ color: COLORS.muted }}>Industry and operational details.</p>
        {Object.keys(dynamicData).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(dynamicData).map(([key, value]) => (
              <InputField key={key} label={formatLabel(key)} value={value} onChange={(e) => setDynamicData({ ...dynamicData, [key]: e.target.value })} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No specific business data available.</p>
        )}
      </div>

      <div className="flex justify-end mt-5"><SaveButton /></div>
    </>
  );

  const renderSecurity = () => (
    <>
      <SectionHeader title="Security" description="Manage your password and account security." />
      <div className="border rounded-2xl p-5 mb-5" style={{ borderColor: COLORS.border }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
              <FiLock size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: COLORS.heading }}>Password</h3>
              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>Keep your account password secure.</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowPasswordModal(true)} className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: COLORS.primary }}>
            Update Password
          </button>
        </div>
      </div>

      <div className="border rounded-2xl p-5" style={{ borderColor: COLORS.border }}>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.successBg, color: COLORS.success }}>
            <FiShield size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: COLORS.heading }}>Account Security</h3>
            <p className="text-xs mt-1 leading-5" style={{ color: COLORS.muted }}>
              Your account is protected. Keep your password private and never share your login details.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <FiCheck size={14} style={{ color: COLORS.success }} />
              <span className="text-xs font-semibold" style={{ color: COLORS.success }}>Security status: Good</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // =========================================================
  // MAIN RENDER
  // =========================================================
  return (
    <>
      {/* SUCCESS POPUP */}
      {successPopup.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck size={32} className="text-[#2A723D]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-500 mb-6">{successPopup.message}</p>
            <button onClick={() => setSuccessPopup({ show: false, message: "" })} className="w-full h-[44px] bg-[#2A723D] hover:bg-[#235d32] text-white rounded-xl font-semibold transition">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ERROR POPUP */}
      {errorPopup.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX size={32} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Notice</h3>
            <p className="text-gray-500 mb-6">{errorPopup.message}</p>
            <button onClick={() => setErrorPopup({ show: false, message: "" })} className="w-full h-[44px] bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition">
              Close
            </button>
          </div>
        </div>
      )}

      {/* PROFILE IMAGE PREVIEW MODAL */}
      {showProfilePreview && profilePicUrl && (
        <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowProfilePreview(false)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setShowProfilePreview(false)} className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#334155]">
              <FiX size={20} />
            </button>
            <img src={getProfileImageUrl()} alt="Profile Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl bg-white" />
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.border }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: COLORS.heading }}>Update Password</h2>
                <p className="text-xs mt-1" style={{ color: COLORS.muted }}>Set a new password for your account</p>
              </div>
              <button type="button" onClick={() => setShowPasswordModal(false)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500">
                <FiX size={19} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: COLORS.text }}>New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-[#F2F7F4]" style={{ borderColor: COLORS.borderDark }}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-5 py-2.5 rounded-xl border text-xs font-semibold" style={{ borderColor: COLORS.borderDark, color: COLORS.text }}>
                  Cancel
                </button>
                <button type="button" onClick={handleSaveProfile} disabled={!newPassword || isSaving} className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition" style={{ backgroundColor: COLORS.primary }}>
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div className="min-h-full p-5 lg:p-8 pb-12" style={{ backgroundColor: COLORS.background }}>
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}>
              <FiBriefcase size={23} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: COLORS.heading }}>Settings</h1>
          </div>
          <p className="text-sm lg:text-base mt-2 lg:ml-[55px]" style={{ color: COLORS.muted }}>Manage your business profile and security.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500 font-medium">Loading profile...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5 items-start">
            {/* SIDEBAR */}
            <div className="bg-white border rounded-2xl p-2 lg:sticky lg:top-5" style={{ borderColor: COLORS.border }}>
              {settingMenu.map((item) => {
                const active = activeSection === item.label;
                return (
                  <button
                    key={item.label} type="button" onClick={() => setActiveSection(item.label)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left mb-1 last:mb-0 transition"
                    style={{ backgroundColor: active ? COLORS.primaryLight : 'transparent', color: active ? COLORS.primaryDark : COLORS.muted }}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                    <FiChevronRight size={15} style={{ opacity: active ? 1 : 0.4 }} />
                  </button>
                );
              })}
            </div>

            {/* CONTENT */}
            <div className="bg-white border rounded-2xl p-5 lg:p-6" style={{ borderColor: COLORS.border }}>
              {activeSection === 'Business Profile' ? renderBusinessProfile() : renderSecurity()}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;