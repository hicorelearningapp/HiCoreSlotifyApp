import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FiGrid,
  FiInbox,
  FiBox,
  FiShoppingBag,
  FiInstagram,
  FiMessageCircle,
  FiUsers,
  FiBarChart2,
  FiCreditCard,
  FiSettings,
  FiChevronDown,
  FiMenu,
  FiHelpCircle,
  FiBell,
  FiChevronUp,
  FiLogOut,
  FiX,
} from 'react-icons/fi';

import { BiStore } from 'react-icons/bi';

import AddProduct from './AddProduct';
import AllProducts from './AllProducts';
import Categories from './Categories';
import Inventory from './Inventory';
import EcomDashboard from './EcomDashboard';
import Inbox from './Inbox';
import Orders from './Orders';
import Instragram from './Instragram';
import Whatsapp from './Whatsapp';
import Customers from './Customers';
import Reports from './Reports';
import Payments from './Payments';
import Settings from './Settings';
import ContactSupport from './ContactSupport';


// =========================================================
// FALLBACK
// =========================================================

const ComingSoon = ({ pageName }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 w-full min-h-[500px]">
    <h2 className="text-3xl font-bold text-gray-800 mb-3">
      {pageName}
    </h2>
    <p className="text-lg">
      This page is coming soon.
    </p>
  </div>
);


// =========================================================
// LAYOUT
// =========================================================

const Layout = () => {
  const navigate = useNavigate();
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [activePage, setActivePage] = useState('Dashboard');
  
  // Dynamic Profile State (Removed hardcoded values)
  const [storeName, setStoreName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [fullStoreId, setFullStoreId] = useState('');
  const [showIdPopup, setShowIdPopup] = useState(false);

  // Load Profile from LocalStorage & Auth Check
  useEffect(() => {
    const checkAuthAndLoadProfile = () => {
      const token = localStorage.getItem('sellerToken');
      
      // Redirect to login if token is missing
      if (!token) {
        navigate('/ecommerce-login');
        return;
      }

      const profileStr = localStorage.getItem('sellerProfile');
      const savedSellerId = localStorage.getItem('sellerId');
      
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.BusinessName) {
            setStoreName(profile.BusinessName);
          } else if (profile.FullName) {
            setStoreName(profile.FullName);
          } else if (profile.UserName) {
            setStoreName(profile.UserName);
          }
        } catch (e) {
          console.error("Failed to parse profile", e);
        }
      }
      
      if (savedSellerId) {
        setFullStoreId(savedSellerId);
        setStoreId(`ID: ${savedSellerId.substring(0, 8).toUpperCase()}`);
      }
    };

    checkAuthAndLoadProfile();
    window.addEventListener('authChange', checkAuthAndLoadProfile);
    return () => window.removeEventListener('authChange', checkAuthAndLoadProfile);
  }, [navigate]);

  // =======================================================
  // LOGOUT HANDLER
  // =======================================================
  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('sellerId');
    localStorage.removeItem('sellerProfile');
    navigate('/ecommerce-login');
  };

  // =======================================================
  // RENDER PAGE
  // =======================================================

  const renderContent = () => {
    if (activePage === 'Dashboard') return <EcomDashboard setActivePage={setActivePage} />;
    if (activePage === 'Inbox') return <Inbox setActivePage={setActivePage} />;
    if (activePage === 'Orders') return <Orders setActivePage={setActivePage} />;
    if (activePage === 'All Products') return <AllProducts setActivePage={setActivePage} />;
    if (activePage === 'Add Product') return <AddProduct setActivePage={setActivePage} />;
    if (activePage === 'Categories') return <Categories setActivePage={setActivePage} />;
    if (activePage === 'Inventory') return <Inventory setActivePage={setActivePage} />;
    if (activePage === 'Instagram') return <Instragram setActivePage={setActivePage} />;
    if (activePage === 'WhatsApp') return <Whatsapp setActivePage={setActivePage} />;
    if (activePage === 'Customers') return <Customers setActivePage={setActivePage} />;
    if (activePage === 'Reports') return <Reports setActivePage={setActivePage} />;
    if (activePage === 'Payments') return <Payments setActivePage={setActivePage} />;
    if (activePage === 'Settings') return <Settings setActivePage={setActivePage} />;
    if (activePage === 'Contact Support') return <ContactSupport setActivePage={setActivePage} />;

    return <ComingSoon pageName={activePage} />;
  };


  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans text-gray-800 overflow-hidden relative">

      {/* =====================================================
          STORE ID POPUP MODAL
      ===================================================== */}
      {showIdPopup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button 
              onClick={() => setShowIdPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 text-[#2A723D]">
              <BiStore size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">Store Details</h3>
            <p className="text-gray-600 font-medium mb-5">{storeName || 'Store'}</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Seller ID</p>
              <p className="text-sm font-mono text-gray-800 break-all select-all">{fullStoreId || 'No ID available'}</p>
            </div>
            
            <button
              type="button"
              onClick={() => setShowIdPopup(false)}
              className="w-full py-3 bg-[#2A723D] hover:bg-[#235d32] text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}
      <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">

        {/* =================================================
            LOGO
        ================================================= */}
        <div className="flex items-center gap-3 px-6 py-5 flex-shrink-0">
          <div className="bg-[#F2F7F4] p-2 rounded-lg text-[#2A723D]">
            <FiShoppingBag size={24} />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            Slotify
          </span>
        </div>


        {/* =================================================
            STORE INFO (DYNAMIC)
        ================================================= */}
        <div className="px-4 mb-4 flex-shrink-0">
          <div 
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowIdPopup(true)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-md">
                <BiStore size={20} className="text-gray-600" />
              </div>
              <div className="flex flex-col overflow-hidden max-w-[110px]">
                <span className="text-sm font-semibold text-gray-900 truncate" title={storeName || 'Store'}>
                  {storeName || 'Store'}
                </span>
                <span className="text-xs text-gray-500">
                  {storeId || 'Loading ID...'}
                </span>
              </div>
            </div>
            <FiChevronDown className="text-gray-400" />
          </div>
        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <NavItem icon={<FiGrid />} label="Dashboard" active={activePage === 'Dashboard'} onClick={() => setActivePage('Dashboard')} />
          {/* <NavItem icon={<FiInbox />} label="Inbox" active={activePage === 'Inbox'} onClick={() => setActivePage('Inbox')} /> */}
          <NavItem icon={<FiBox />} label="Orders" active={activePage === 'Orders'} onClick={() => setActivePage('Orders')} />

          {/* PRODUCTS SECTION */}
          <div>
            <div
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isProductsOpen || ['All Products', 'Add Product', 'Categories', 'Inventory'].includes(activePage)
                    ? 'text-[#2A723D] bg-[#F2F7F4]' : 'text-gray-600 hover:bg-gray-50'
                }`}
              onClick={() => setIsProductsOpen(!isProductsOpen)}
            >
              <div className="flex items-center gap-3">
                <FiShoppingBag size={18} />
                <span className="font-medium text-sm">Products</span>
              </div>
              {isProductsOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>

            {isProductsOpen && (
              <div className="ml-9 mt-1 space-y-1">
                <SubNavItem label="All Products" active={activePage === 'All Products'} onClick={() => setActivePage('All Products')} />
                <SubNavItem label="Add Product" active={activePage === 'Add Product'} onClick={() => setActivePage('Add Product')} />
                {/* <SubNavItem label="Categories" active={activePage === 'Categories'} onClick={() => setActivePage('Categories')} /> */}
                <SubNavItem label="Inventory" active={activePage === 'Inventory'} onClick={() => setActivePage('Inventory')} />
              </div>
            )}
          </div>

          {/* <NavItem icon={<FiInstagram />} label="Instagram" active={activePage === 'Instagram'} onClick={() => setActivePage('Instagram')} /> */}
          {/* <NavItem icon={<FiMessageCircle />} label="WhatsApp" active={activePage === 'WhatsApp'} onClick={() => setActivePage('WhatsApp')} /> */}
          {/* <NavItem icon={<FiUsers />} label="Customers" active={activePage === 'Customers'} onClick={() => setActivePage('Customers')} /> */}
          <NavItem icon={<FiBarChart2 />} label="Reports" active={activePage === 'Reports'} onClick={() => setActivePage('Reports')} />
          {/* <NavItem icon={<FiCreditCard />} label="Payments" active={activePage === 'Payments'} onClick={() => setActivePage('Payments')} /> */}
          <NavItem icon={<FiSettings />} label="Settings" active={activePage === 'Settings'} onClick={() => setActivePage('Settings')} />
          
          <div className="pt-2 mt-2 border-t border-gray-100">
            <NavItem icon={<FiLogOut />} label="Logout" onClick={handleLogout} />
          </div>
        </nav>

        {/* =================================================
            SUPPORT
        ================================================= */}
        <div className="p-4 mt-auto flex-shrink-0 border-t border-gray-100">
          <div className="bg-[#F2F7F4] rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white shadow-sm rounded-full mb-3 flex items-center justify-center text-[#2A723D]">
              <FiHelpCircle size={24} />
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Need Help?</h4>
            <p className="text-xs text-gray-500 mb-4">Chat with our support team</p>
            <button
              type="button"
              onClick={() => setActivePage('Contact Support')}
              className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-[#2A723D] hover:text-[#2A723D] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      {/* =================================================
          MAIN AREA
      ================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center">
            <button type="button" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
              <FiMenu size={20} />
            </button>
            <FiMenu size={20} className="text-gray-500 hidden lg:block cursor-pointer hover:text-gray-700" />
          </div>
          <div className="flex items-center gap-5">
            <FiHelpCircle size={20} className="text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setActivePage('Contact Support')} />
            <FiBell size={20} className="text-gray-500 cursor-pointer hover:text-gray-700" />
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                {storeName ? storeName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="hidden md:flex flex-col max-w-[100px]">
                <span className="text-sm font-semibold text-gray-900 truncate" title={storeName || 'Store'}>{storeName || 'Store'}</span>
                <span className="text-xs text-gray-500">Seller</span>
              </div>
              <FiChevronDown className="text-gray-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};


// =========================================================
// NAV ITEM
// =========================================================

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
      active ? 'bg-[#F2F7F4] text-[#2A723D]' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className="text-lg">{icon}</div>
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const SubNavItem = ({ label, active, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors group">
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#2A723D]' : 'bg-transparent group-hover:bg-gray-300'}`} />
    <span className={`text-sm ${active ? 'text-[#2A723D] font-semibold bg-[#F2F7F4] px-2 py-1.5 rounded-md w-full' : 'text-gray-500 hover:text-gray-800'}`}>
      {label}
    </span>
  </div>
);

export default Layout;