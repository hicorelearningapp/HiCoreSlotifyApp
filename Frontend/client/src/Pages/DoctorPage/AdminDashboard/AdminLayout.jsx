import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminDashboard from './AdminDashboard';
import Businesses from './Businesses';
import Logo from '../../../assets/DoctorDashboard/logo.png';

// Admin/Dashboard icons
import DashboardIcon from '../../../assets/DoctorDashboard/DashboardIcon.png';
import PatientsIcon from '../../../assets/DoctorDashboard/PatientsIcon.png';
import LogoutIcon from '../../../assets/DoctorDashboard/LogoutIcon.png';

// Admin Profile Image
import AdminProfileImg from '../../../assets/DoctorDashboard/admin-profile.jpg';
import DemoNotificatin from './DemoNotificatin';


const AdminLayout = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [adminName, setAdminName] = useState('Admin');

  const navigate = useNavigate();


  useEffect(() => {
    const adminLoggedIn =
      localStorage.getItem('adminLoggedIn');

    const adminToken =
      localStorage.getItem('adminToken');

    const storedAdminName =
      localStorage.getItem('adminName');


    console.log(
      '[Admin Auth] adminLoggedIn:',
      adminLoggedIn
    );

    console.log(
      '[Admin Auth] adminToken present:',
      !!adminToken
    );

    console.log(
      '[Admin Auth] adminName:',
      storedAdminName
    );


    // ============================================================
    // AUTH CHECK
    // ============================================================
    // Admin must have BOTH:
    // 1. adminLoggedIn = "true"
    // 2. adminToken
    //
    // Otherwise redirect to home page.
    // ============================================================

    if (
      adminLoggedIn !== 'true' ||
      !adminToken
    ) {

      console.log(
        '[Admin Auth] Admin is not authenticated. Redirecting to /'
      );

      navigate('/', {
        replace: true
      });

      return;
    }


    // ============================================================
    // SET ADMIN NAME
    // ============================================================

    setAdminName(
      storedAdminName || 'Admin'
    );


    // Authentication is valid
    setIsCheckingAuth(false);

  }, [navigate]);


  // ============================================================
  // MENU ITEMS
  // ============================================================
  const menuItems = [
    {
      name: 'Dashboard',
      icon: DashboardIcon
    },
    {
      name: 'Businesses',
      icon: PatientsIcon
    },
    {
      name: 'Demo Notify',
      icon: PatientsIcon
    },
  ];


  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = () => {

    // Remove admin authentication
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminProfile');

    // Remove any old authentication values
    localStorage.removeItem('token');
    localStorage.removeItem('user');


    console.log(
      '[Admin Auth] Admin logged out.'
    );


    // Redirect to home page
    navigate('/', {
      replace: true
    });
  };


  // ============================================================
  // PREVENT ADMIN PAGE FROM FLASHING BEFORE AUTH CHECK
  // ============================================================
  if (isCheckingAuth) {
    return null;
  }


  return (
    <div className="h-screen bg-white font-['Roboto'] flex flex-col w-full overflow-hidden">

      {/* --- TOP NAVBAR --- */}
      <nav className="w-full h-[88px] shrink-0 border-b border-[#D9D9D9] py-[20px] px-[24px] md:px-[36px] flex items-center justify-between bg-white z-50 relative">

        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer"
        >

          <img
            src={Logo}
            alt="HiCoreSlotify"
            className="w-[48px] h-[48px] object-cover"
          />

          <div className="flex flex-col">

            <h1 className="font-['Poppins'] font-semibold text-[18px] leading-[28px] text-[#346739] m-0">
              HiCoreSlotify
            </h1>

            <span className="font-['Roboto'] font-normal text-[10px] leading-[16px] text-[#BD4444]">
              YOUR TIME, YOUR SLOT
            </span>

          </div>

        </div>


        {/* Top Right Admin Profile Section */}
        <div className="hidden md:flex items-center gap-3">

          <div className="flex flex-col text-right">

            {/* ADMIN NAME FROM LOCAL STORAGE */}
            <span className="font-['Poppins'] font-semibold text-[14px] text-[#222222]">
              {adminName}
            </span>

            <span className="font-['Roboto'] font-normal text-[12px] text-[#346739]">
              Admin
            </span>

          </div>

          <img
            src={AdminProfileImg}
            alt={`${adminName} Admin`}
            className="w-[44px] h-[44px] rounded-full object-cover border border-[#D9D9D9]"
          />

        </div>


        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-md text-[#346739] hover:bg-gray-100 transition-colors"
          onClick={() =>
            setIsMobileMenuOpen(
              !isMobileMenuOpen
            )
          }
        >

          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />

          </svg>

        </button>

      </nav>


      {/* Container takes remaining height after navbar */}
      <div className="flex flex-1 w-full overflow-hidden relative">

        {/* Mobile Overlay Background */}
        {isMobileMenuOpen && (

          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden top-[88px]"
            onClick={() =>
              setIsMobileMenuOpen(false)
            }
          />

        )}


        {/* --- SIDEBAR --- */}
        <aside
          className={`fixed md:relative top-[88px] md:top-0 left-0 h-[calc(100vh-88px)] md:h-full w-[236px] flex-shrink-0 border-r border-[#D9D9D9] py-[32px] px-[24px] flex flex-col justify-between bg-white z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }`}
        >

          <div className="flex flex-col gap-[16px]">

            {menuItems.map((item) => {

              const isActive =
                activeMenu === item.name;

              return (

                <button
                  key={item.name}
                  onClick={() => {

                    setActiveMenu(
                      item.name
                    );

                    setIsMobileMenuOpen(
                      false
                    );

                  }}
                  className={`w-full max-w-[148px] h-[44px] flex items-center gap-[8px] px-[16px] py-[8px] rounded-[16px] transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#346739] text-white'
                      : 'bg-white text-[#346739] hover:bg-gray-50'
                  }`}
                >

                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`w-[20px] h-[20px] transition-all object-contain ${
                      isActive
                        ? 'brightness-0 invert'
                        : ''
                    }`}
                  />

                  <span className="font-normal text-[14px] leading-[28px]">
                    {item.name}
                  </span>

                </button>

              );

            })}

          </div>


          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full max-w-[148px] h-[44px] flex items-center gap-[8px] px-[16px] py-[8px] rounded-[16px] bg-white text-[#BD4444] hover:bg-red-50 transition-colors duration-200"
          >

            <img
              src={LogoutIcon}
              alt="Logout"
              className="w-[20px] h-[20px] object-contain"
            />

            <span className="font-normal text-[14px] leading-[28px]">
              Logout
            </span>

          </button>

        </aside>


        {/* --- MAIN CENTER CONTENT WRAPPER --- */}
        <main className="flex-1 h-full w-full p-[16px] sm:p-[20px] md:p-[32px] overflow-y-auto overflow-x-hidden  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

          {activeMenu === 'Dashboard' && (
            <AdminDashboard />
          )}

          {activeMenu === 'Businesses' && (
            <Businesses />
          )}

          {activeMenu === 'Demo Notify' && (
            <DemoNotificatin />
          )}

        </main>

      </div>

    </div>
  );
};


export default AdminLayout;