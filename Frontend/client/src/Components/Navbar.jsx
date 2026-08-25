import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Make sure to adjust these paths based on your actual project structure
import logo from '../assets/logo.png';
import whiteArrow from '../assets/LandingPage/whiteArrow.png'; // Update path if needed
import greenArrow from '../assets/LandingPage/greenArrow.png'; // Update path if needed

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'HOME', id: 'home' },
    { label: 'INDUSTRIES', id: 'industries' },
    { label: 'HOW IT WORKS', id: 'how-it-works' },
    { label: 'BENEFITS', id: 'benefits' },
    { label: 'FEATURES', id: 'features' },
    { label: 'CONTACT', id: 'contact' },
  ];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setIsOpen(false);

    if (id === 'home') {
      // If Home is clicked, navigate to root "/"
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If we are not on the home page, go to "/" first, then scroll, or just scroll if already there
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <nav className="w-full h-[72px] bg-white flex items-center justify-between px-4 lg:px-8 relative z-50">
      
      {/* Logo Section */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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

      {/* Desktop Navigation Links Section (Centered) */}
      <div className="hidden lg:flex items-center justify-center flex-1 mx-8 gap-[12px]">
        {navLinks.map((link, index) => (
          <a
            key={index}
            href={`#${link.id}`}
            onClick={(e) => handleNavClick(e, link.id)}
            className="flex items-center justify-center min-w-[80px] h-[36px] px-[20px] py-[4px] rounded-[16px] bg-[#FFFFFF] border border-transparent hover:border-[#346739] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] transition-all duration-200 cursor-pointer"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Desktop Book a Demo Button */}
      <div className="hidden lg:flex items-center justify-end">
        {/* Optional Button placeholder */}
      </div>

      {/* Mobile Hamburger Menu Toggle Button */}
      <button 
        className="lg:hidden flex items-center justify-center p-2 text-[#346739] focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
              onClick={(e) => handleNavClick(e, link.id)}
              className="flex items-center justify-center min-w-[80px] h-[36px] px-[20px] py-[4px] rounded-[16px] bg-[#FFFFFF] border border-transparent hover:border-[#346739] font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] transition-all duration-200 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
      
    </nav>
  );
};

export default Navbar;