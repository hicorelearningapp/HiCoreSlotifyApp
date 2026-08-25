import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/logo.png';
import whiteArrow from '../../assets/LandingPage/whiteArrow.png';
import greenArrow from '../../assets/LandingPage/greenArrow.png';

const NavbarDoctor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const token =
      localStorage.getItem('doctorToken') ||
      localStorage.getItem('token');

    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuthStatus();

    const handleAuthChange = () => {
      checkAuthStatus();
    };

    const handleStorageChange = (e) => {
      if (
        e.key === 'doctorToken' ||
        e.key === 'token' ||
        e.key === null
      ) {
        checkAuthStatus();
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const navLinks = [
    { label: 'HOME', id: 'home' },
    { label: 'WHY US', id: 'why-us' },
    { label: 'HOW IT WORKS', id: 'how-it-works' },
    { label: 'FEATURES', id: 'powerful-features' },
    { label: 'CONTACT', id: 'contact' },
  ];

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setIsOpen(false);

    // HOME → Landing page "/"
    if (id === 'home') {
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
    navigate('/login');
  };

  const handleRegisterClick = () => {
    setIsOpen(false);
    navigate('/register');
  };

  const handleDashboardClick = () => {
    setIsOpen(false);
    navigate('/doctor-dashboard');
  };

  return (
    <nav className="w-full h-[72px] bg-white flex items-center justify-between px-4 lg:px-8 relative z-50">

      {/* Logo Section */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img
          src={logo}
          alt="HiCoreSlotify Logo"
          className="w-[48px] h-[48px] object-cover"
        />

        <div className="flex flex-col justify-center">
          <h1 className="font-['Poppins'] font-semibold text-[18px] leading-[28px] text-[#346739]">
            HiCoreSlotify
          </h1>

          <span className="font-['Roboto'] font-normal text-[10px] leading-[16px] text-[#BD4444]">
            YOUR TIME, YOUR SLOT
          </span>
        </div>
      </div>

      {/* Desktop Navigation Links Section */}
      <div className="hidden lg:flex items-center gap-[12px]">
        {navLinks.map((link, index) => (
          <a
            key={index}
            href={`#${link.id}`}
            onClick={(e) => handleLinkClick(e, link.id)}
            className="flex items-center justify-center min-w-[80px] h-[36px] px-[20px] py-[4px] rounded-[16px] bg-[#FFFFFF] border border-transparent hover:border-[#346739] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] transition-all duration-200 cursor-pointer"
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
            className="group flex items-center justify-center gap-[8px] h-[36px] px-[20px] py-[4px] rounded-[16px] bg-[#346739] hover:bg-[#FFFFFF] border border-transparent hover:border-[#346739] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-all duration-300 cursor-pointer"
          >
            <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-white group-hover:text-[#346739]">
              Dashboard
            </span>

            <img
              src={whiteArrow}
              alt="Right Arrow"
              className="block group-hover:hidden w-[20px] h-[20px] object-contain"
            />

            <img
              src={greenArrow}
              alt="Right Arrow Hover"
              className="hidden group-hover:block w-[20px] h-[20px] object-contain"
            />
          </button>
        ) : (
          <>
            <button
              onClick={handleLoginClick}
              className="flex items-center justify-center w-[96px] h-[36px] px-[16px] py-[4px] rounded-[16px] bg-[#FFFFFF] hover:bg-[#346739]/10 border border-[#346739] transition-all duration-300 cursor-pointer"
            >
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]">
                Login
              </span>
            </button>

            <button
              onClick={handleRegisterClick}
              className="group flex items-center justify-center gap-[8px] w-[112px] h-[36px] px-[16px] py-[4px] rounded-[16px] bg-[#346739] hover:bg-[#FFFFFF] border border-transparent hover:border-[#346739] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-all duration-300 cursor-pointer"
            >
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-white group-hover:text-[#346739]">
                Register
              </span>

              <img
                src={whiteArrow}
                alt="Right Arrow"
                className="block group-hover:hidden w-[20px] h-[20px] object-contain"
              />

              <img
                src={greenArrow}
                alt="Right Arrow Hover"
                className="hidden group-hover:block w-[20px] h-[20px] object-contain"
              />
            </button>
          </>
        )}
      </div>

      {/* Mobile Hamburger Menu Toggle Button */}
      <button
        className="lg:hidden flex items-center justify-center p-2 text-[#346739] focus:outline-none cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-white shadow-[0px_4px_4px_0px_#00000040] flex flex-col items-center py-6 gap-4 lg:hidden">

          {navLinks.map((link, index) => (
            <a
              key={index}
              href={`#${link.id}`}
              onClick={(e) => handleLinkClick(e, link.id)}
              className="flex items-center justify-center min-w-[80px] h-[36px] px-[20px] py-[4px] rounded-[16px] bg-[#FFFFFF] border border-transparent hover:border-[#346739] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] transition-all duration-200 cursor-pointer"
            >
              {link.label}
            </a>
          ))}

          {isLoggedIn ? (
            <button
              onClick={handleDashboardClick}
              className="group flex items-center justify-center gap-[8px] h-[36px] px-[20px] py-[4px] rounded-[16px] bg-[#346739] hover:bg-[#FFFFFF] border border-transparent hover:border-[#346739] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-all duration-300 mt-2 cursor-pointer"
            >
              <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-white group-hover:text-[#346739]">
                Dashboard
              </span>

              <img
                src={whiteArrow}
                alt="Right Arrow"
                className="block group-hover:hidden w-[20px] h-[20px] object-contain"
              />

              <img
                src={greenArrow}
                alt="Right Arrow Hover"
                className="hidden group-hover:block w-[20px] h-[20px] object-contain"
              />
            </button>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="flex items-center justify-center w-[96px] h-[36px] px-[16px] py-[4px] rounded-[16px] bg-[#FFFFFF] hover:bg-[#346739]/10 border border-[#346739] transition-all duration-300 mt-2 cursor-pointer"
              >
                <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]">
                  Login
                </span>
              </button>

              <button
                onClick={handleRegisterClick}
                className="group flex items-center justify-center gap-[8px] w-[112px] h-[36px] px-[16px] py-[4px] rounded-[16px] bg-[#346739] hover:bg-[#FFFFFF] border border-transparent hover:border-[#346739] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-all duration-300 mt-2 cursor-pointer"
              >
                <span className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-white group-hover:text-[#346739]">
                  Register
                </span>

                <img
                  src={whiteArrow}
                  alt="Right Arrow"
                  className="block group-hover:hidden w-[20px] h-[20px] object-contain"
                />

                <img
                  src={greenArrow}
                  alt="Right Arrow Hover"
                  className="hidden group-hover:block w-[20px] h-[20px] object-contain"
                />
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavbarDoctor;