import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Logo from '../../../assets/DoctorDashboard/logo.png';

// Import each icon separately as an image file
import DashboardIcon from '../../../assets/DoctorDashboard/DashboardIcon.png';
import AppointmentsIcon from '../../../assets/DoctorDashboard/AppointementIcon.png';
import CalendarIcon from '../../../assets/DoctorDashboard/CalendarIcon.png';
import PatientsIcon from '../../../assets/DoctorDashboard/PatientsIcon.png';
import AnalyticsIcon from '../../../assets/DoctorDashboard/AnalyticsIcon.png';
import NotificationsIcon from '../../../assets/DoctorDashboard/NotificationsIcon.png';
import SettingsIcon from '../../../assets/DoctorDashboard/SettingsIcon.png';
import HelpIcon from '../../../assets/DoctorDashboard/HelpIcon.png';
import LogoutIcon from '../../../assets/DoctorDashboard/LogoutIcon.png';

import Calendar from './Calendar.jsx';
import Analytics from './Analytics.jsx';
import Settings from './Settings.jsx';
import Patients from './SettingsScreen/Patients.jsx';
import Help from './SettingsScreen/Help.jsx';
import Notification from './SettingsScreen/Notification.jsx';
import Appointments from './Appointments.jsx';

const Layout = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication checking state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const navigate = useNavigate();

  // --------------------------------------------------
  // AUTHENTICATION CHECK
  // --------------------------------------------------
  useEffect(() => {
    const checkAuthentication = () => {
      const doctorToken = localStorage.getItem('doctorToken');
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      /*
       * User is considered logged in if any valid login
       * information exists in localStorage.
       */
      const loggedIn = Boolean(doctorToken || token || user);

      if (loggedIn) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);

        // User is not logged in -> Home page
        navigate('/', { replace: true });
      }

      setIsCheckingAuth(false);
    };

    checkAuthentication();

    // Listen for login/logout changes
    window.addEventListener('authChange', checkAuthentication);

    return () => {
      window.removeEventListener('authChange', checkAuthentication);
    };
  }, [navigate]);

  // --------------------------------------------------
  // MENU ITEMS
  // --------------------------------------------------
  const menuItems = [
    { name: 'Dashboard', icon: DashboardIcon },
    { name: 'Appointments', icon: AppointmentsIcon },
    { name: 'Calendar', icon: CalendarIcon },
    { name: 'Patients', icon: PatientsIcon },
    { name: 'Analytics', icon: AnalyticsIcon },
    // { name: 'Notifications', icon: NotificationsIcon },
    { name: 'Settings', icon: SettingsIcon },
    { name: 'Help', icon: HelpIcon },
  ];

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  const handleLogout = () => {
    // Clear all authentication information
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update authentication state immediately
    setIsAuthenticated(false);

    // Notify other components such as NavbarDoctor
    window.dispatchEvent(new Event('authChange'));

    // Redirect to Home page
    navigate('/', { replace: true });
  };

  // --------------------------------------------------
  // PREVENT DASHBOARD FLASH WHILE AUTH IS CHECKED
  // --------------------------------------------------
  if (isCheckingAuth) {
    return null;
  }

  // --------------------------------------------------
  // IF NOT AUTHENTICATED, DON'T RENDER DASHBOARD
  // --------------------------------------------------
  if (!isAuthenticated) {
    return null;
  }

  // --------------------------------------------------
  // DASHBOARD LAYOUT
  // --------------------------------------------------
  return (
    <div className="h-screen bg-white font-['Roboto'] flex flex-col w-full overflow-hidden">

      {/* --- TOP NAVBAR --- */}
      <nav className="w-full h-[88px] shrink-0 border-b border-[#D9D9D9] py-[20px] px-[24px] md:px-[36px] flex items-center justify-between bg-white z-50 relative">

        <div
          onClick={() => navigate('/doctor')}
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

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-md text-[#346739] hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            onClick={() => setIsMobileMenuOpen(false)}
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
              const isActive = activeMenu === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveMenu(item.name);
                    setIsMobileMenuOpen(false);
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
                      isActive ? 'brightness-0 invert' : ''
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
        <main className="flex-1 h-full w-full p-[16px] sm:p-[20px] md:p-[32px] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

          {activeMenu === 'Dashboard' && <Dashboard />}

          {activeMenu === 'Appointments' && <Appointments />}

          {activeMenu === 'Calendar' && <Calendar />}

          {activeMenu === 'Analytics' && <Analytics />}

          {activeMenu === 'Notifications' && <Notification />}

          {activeMenu === 'Settings' && <Settings />}

          {activeMenu === 'Patients' && <Patients />}

          {activeMenu === 'Help' && <Help />}

        </main>
      </div>
    </div>
  );
};

export default Layout;