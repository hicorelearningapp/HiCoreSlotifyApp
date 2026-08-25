import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/logo.png';
import whiteArrow from '../../assets/LandingPage/whiteArrow.png';
// Note: You may want to rename 'greenArrow.png' to something matching the new purple theme in your assets folder
import themeArrow from '../../assets/LandingPage/greenArrow.png'; 

const NavbarEcommerce = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Hardcoded to false for dummy UI. 
  // You can change this to true if you want to test the Dashboard button appearance.
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const navigate = useNavigate();

  // Center navigation links: Kept only HOME as requested
  const navLinks = [
    { label: 'HOME', id: 'ecommercehome' }
  ];

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setIsOpen(false);

    if (id === 'ecommercehome' || id === 'home') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const handleLoginClick = () => {
    setIsOpen(false);
    navigate('/ecommerce-login');
  };

  const handleRegisterClick = () => {
    setIsOpen(false);
    navigate('/ecommerce-register');
  };

  const handleDashboardClick = () => {
    setIsOpen(false);
    navigate('/ecommerce-dashboard');
  };

  return (
    <nav className="w-full h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 relative z-50 font-sans">
      
      {/* Logo Section */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img
          src={logo}
          alt="HiCore E-commerce Logo"
          className="w-[48px] h-[48px] object-cover"
        />

        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">
            HiCoreSlotify
          </h1>
          <span className="text-xs font-medium text-gray-500 leading-none">
            YOUR STORE, YOUR WAY
          </span>
        </div>
      </div>

      {/* Desktop Navigation Links Section (Center - Only Home) */}
      <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
        {navLinks.map((link, index) => (
          <a
            key={index}
            href={`#${link.id}`}
            onClick={(e) => handleLinkClick(e, link.id)}
            className="flex items-center justify-center h-[36px] px-[20px] rounded-lg text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Desktop Action Buttons Section */}
      <div className="hidden lg:flex items-center gap-[12px]">
        {isLoggedIn ? (
          <button
            onClick={handleDashboardClick}
            className="group flex items-center justify-center gap-2 h-[36px] px-[20px] rounded-lg bg-purple-700 hover:bg-purple-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md text-white font-semibold text-sm"
          >
            <span>Dashboard</span>
            <img
              src={whiteArrow}
              alt="Right Arrow"
              className="block group-hover:hidden w-[16px] h-[16px] object-contain"
            />
            <img
              src={themeArrow}
              alt="Right Arrow Hover"
              className="hidden group-hover:block w-[16px] h-[16px] object-contain"
            />
          </button>
        ) : (
          <>
            <button
              onClick={handleLoginClick}
              className="flex items-center justify-center h-[36px] px-[20px] rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <span className="text-sm font-semibold text-gray-700">
                Login
              </span>
            </button>

            <button
              onClick={handleRegisterClick}
              className="group flex items-center justify-center gap-2 h-[36px] px-[20px] rounded-lg bg-purple-700 hover:bg-purple-800 transition-all duration-300 cursor-pointer shadow-sm text-white"
            >
              <span className="text-sm font-semibold">
                Register
              </span>
              <img
                src={whiteArrow}
                alt="Right Arrow"
                className="w-[16px] h-[16px] object-contain transition-transform group-hover:translate-x-1"
              />
            </button>
          </>
        )}
      </div>

      {/* Mobile Hamburger Menu Toggle Button */}
      <button
        className="lg:hidden flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-white shadow-md border-b border-gray-100 flex flex-col items-center py-6 gap-4 lg:hidden">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={`#${link.id}`}
              onClick={(e) => handleLinkClick(e, link.id)}
              className="flex items-center justify-center min-w-[120px] h-[40px] px-[20px] rounded-lg text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
            >
              {link.label}
            </a>
          ))}

          {isLoggedIn ? (
            <button
              onClick={handleDashboardClick}
              className="flex items-center justify-center gap-2 h-[40px] px-[24px] rounded-lg bg-purple-700 hover:bg-purple-800 text-white transition-all duration-300 mt-2 cursor-pointer shadow-sm text-sm font-semibold"
            >
              <span>Dashboard</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="flex items-center justify-center min-w-[120px] h-[40px] px-[20px] rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-300 mt-2 cursor-pointer"
              >
                <span className="text-sm font-semibold text-gray-700">
                  Login
                </span>
              </button>

              <button
                onClick={handleRegisterClick}
                className="flex items-center justify-center min-w-[120px] h-[40px] px-[20px] rounded-lg bg-purple-700 hover:bg-purple-800 transition-colors duration-300 mt-2 cursor-pointer shadow-sm"
              >
                <span className="text-sm font-semibold text-white">
                  Register
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavbarEcommerce;