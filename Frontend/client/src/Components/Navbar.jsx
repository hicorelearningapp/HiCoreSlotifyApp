import React, { useState, useEffect } from "react";

// Local asset imports
import logo from "../assets/logo.png";
import appointmentIcon from "../assets/appointment-icon.png";
import ecommerceIcon from "../assets/ecommerce-icon.png";
import ecommerceBackground from "../assets/ecommerce-background.jpg";

// Navigation items for E-Commerce selection
const ecommerceNavItems = [
  { label: "HOME", href: "#home" },
  { label: "WHY US", href: "#why-us" },
  { label: "HOW IT WORKS", href: "#how-it-works" },
  { label: "FEATURES", href: "#features" },
  { label: "CONTACT", href: "#contact" },
];

// Navigation items for Appointments selection
const appointmentsNavItems = [
  { label: "HOME", href: "#home" },
  { label: "INDUSTRIES", href: "#industries" },
  { label: "HOW IT WORKS", href: "#how-it-works" },
  { label: "BENEFITS", href: "#benefits" },
  { label: "FEATURES", href: "#features" },
  { label: "CONTACT", href: "#contact" },
];

const Brand = () => {
  return (
    <a
      href="#home"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="flex shrink-0 items-center gap-2 no-underline"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden sm:h-[72px] sm:w-[72px]">
        <img
          src={logo}
          alt="HiCoreSlotify logo"
          className="block h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-col items-start justify-center gap-0.5">
        <p className="m-0 whitespace-nowrap font-['Poppins'] text-[16px] font-bold leading-tight text-[#346739] md:text-[20px]">
          HiCoreSlotify
        </p>

        <p className="m-0 whitespace-nowrap font-['Poppins'] text-[13px] font-bold leading-tight text-[#BD4444] md:text-[14px]">
          YOUR TIME, YOUR SLOT
        </p>
      </div>
    </a>
  );
};

const ServiceButton = ({
  icon,
  label,
  selected = false,
  backgroundImage,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-[52px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-[#EBC5C5] px-4 transition-all duration-300 sm:px-6 lg:gap-4 lg:px-9 ${
        selected
          ? "shadow-[0_4px_6px_rgba(0,0,0,0.28)]"
          : "bg-white hover:shadow-[0_4px_6px_rgba(0,0,0,0.22)]"
      }`}
    >
      {/* Button background image - ONLY shows when selected */}
      {selected && backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-70"
          />
          {/* Soft white layer */}
          <span className="absolute inset-0 bg-white/25 transition-colors duration-300 group-hover:bg-white/10" />
        </>
      ) : (
        /* Normal background when not selected or no background image provided */
        <span
          className={`absolute inset-0 transition-colors duration-300 ${
            selected
              ? "bg-[#fff7f7]"
              : "bg-white group-hover:bg-[#fff7f7]"
          }`}
        />
      )}

      {/* Button icon */}
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="relative z-10 h-8 w-8 shrink-0 object-contain transition-transform duration-300 group-hover:scale-110"
      />

      {/* Button label */}
      <span className="relative z-10 whitespace-nowrap font-['Poppins'] text-[13px] font-semibold leading-7 text-[#346739] md:text-[14px]">
        {label}
      </span>
    </button>
  );
};

const AuthButtons = ({ activeService, isAuth }) => {
  const loginUrl = activeService === "ecommerce" ? "/ecommerce-login" : "/login";
  const registerUrl = activeService === "ecommerce" ? "/ecommerce-register" : "/register";
  const dashboardUrl = activeService === "ecommerce" ? "/ecommerce-dashboard" : "/doctor-dashboard";

  return (
    <div className="flex items-center gap-3">
      {isAuth ? (
        /* Dashboard Button (Shown when logged in) */
        <a
          href={dashboardUrl}
          className="group flex h-[36px] min-w-[120px] cursor-pointer items-center justify-center rounded-[10px] bg-[#346739] p-[3px] md:h-[42px] md:min-w-[140px] no-underline"
        >
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#346739] px-4 shadow-[inset_0_4px_4px_0px_#00000040] transition-colors duration-300 group-hover:bg-white">
            <span className="font-['Poppins'] text-[13px] font-semibold text-white transition-colors duration-300 group-hover:text-[#346739] md:text-[14px]">
              Dashboard
            </span>
          </div>
        </a>
      ) : (
        <>
          {/* Login Button */}
          <a
            href={loginUrl}
            className="group flex h-[36px] min-w-[100px] cursor-pointer items-center justify-center rounded-[10px] bg-[#346739] p-[3px] md:h-[42px] md:min-w-[120px] no-underline"
          >
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#346739] px-4 shadow-[inset_0_4px_4px_0px_#00000040] transition-colors duration-300 group-hover:bg-white">
              <span className="font-['Poppins'] text-[13px] font-semibold text-white transition-colors duration-300 group-hover:text-[#346739] md:text-[14px]">
                Login
              </span>
            </div>
          </a>

          {/* Register Button */}
          <a
            href={registerUrl}
            className="group flex h-[36px] min-w-[100px] cursor-pointer items-center justify-center rounded-[10px] md:h-[42px] md:min-w-[120px] no-underline"
          >
            <div className="flex h-full w-full items-center justify-center rounded-[10px] border border-[#346739] bg-white px-4 transition-colors duration-300 group-hover:bg-[#346739] group-hover:shadow-[inset_0_4px_4px_0px_#00000040]">
              <span className="font-['Poppins'] text-[13px] font-semibold text-[#346739] transition-colors duration-300 group-hover:text-white md:text-[14px]">
                Register
              </span>
            </div>
          </a>
        </>
      )}
    </div>
  );
};

const DesktopNavigation = ({ items }) => {
  const handleNavClick = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault(); // Prevents the URL path/hash from changing
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (targetId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" }); // Fallback for home
      }
    }
  };

  return (
    <nav className="hidden items-center justify-center gap-2 md:flex lg:gap-4">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          className="shrink-0 rounded-lg bg-white px-3 py-1 font-['Poppins'] text-[13px] font-semibold leading-7 text-[#346739] no-underline transition-all duration-300 hover:bg-[#346739] hover:text-white hover:shadow-[inset_0_4px_4px_0px_#00000040] md:text-[14px] lg:px-5"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};

const MobileNavigation = ({ items, closeMenu, activeService, isAuth }) => {
  const loginUrl = activeService === "ecommerce" ? "/ecommerce-login" : "/login";
  const registerUrl = activeService === "ecommerce" ? "/ecommerce-register" : "/register";
  const dashboardUrl = activeService === "ecommerce" ? "/ecommerce-dashboard" : "/doctor-dashboard";

  const handleNavClick = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault(); // Prevents the URL path/hash from changing
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (targetId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" }); // Fallback for home
      }
      closeMenu(); // Close mobile menu after smooth scrolling
    } else {
      closeMenu(); // Normal navigation, just close menu
    }
  };

  return (
    <nav className="absolute left-0 top-full z-50 flex w-full flex-col border-t border-[#D9D9D9] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.12)] md:hidden">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          className="rounded-lg px-4 py-3 text-center font-['Poppins'] text-[14px] font-semibold text-[#346739] no-underline transition-all duration-300 hover:bg-[#346739] hover:text-white hover:shadow-[inset_0_4px_4px_0px_#00000040]"
        >
          {item.label}
        </a>
      ))}
      <div className="mt-2 flex flex-col gap-3 border-t border-[#D9D9D9] pt-4">
        {isAuth ? (
          /* Mobile Dashboard Button */
          <a
            href={dashboardUrl}
            onClick={closeMenu}
            className="group flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#346739] p-[3px] no-underline"
          >
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#346739] shadow-[inset_0_4px_4px_0px_#00000040] transition-colors duration-300 group-hover:bg-white">
              <span className="font-['Poppins'] text-[14px] font-semibold text-white transition-colors duration-300 group-hover:text-[#346739]">
                Dashboard
              </span>
            </div>
          </a>
        ) : (
          <>
            {/* Mobile Login Button */}
            <a
              href={loginUrl}
              onClick={closeMenu}
              className="group flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#346739] p-[3px] no-underline"
            >
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#346739] shadow-[inset_0_4px_4px_0px_#00000040] transition-colors duration-300 group-hover:bg-white">
                <span className="font-['Poppins'] text-[14px] font-semibold text-white transition-colors duration-300 group-hover:text-[#346739]">
                  Login
                </span>
              </div>
            </a>

            {/* Mobile Register Button */}
            <a
              href={registerUrl}
              onClick={closeMenu}
              className="group flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] no-underline"
            >
              <div className="flex h-full w-full items-center justify-center rounded-[10px] border border-[#346739] bg-white transition-colors duration-300 group-hover:bg-[#346739] group-hover:shadow-[inset_0_4px_4px_0px_#00000040]">
                <span className="font-['Poppins'] text-[14px] font-semibold text-[#346739] transition-colors duration-300 group-hover:text-white">
                  Register
                </span>
              </div>
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ecommerceAuth, setEcommerceAuth] = useState(false);
  const [appointmentAuth, setAppointmentAuth] = useState(false);
  
  // Track which service is selected based on the current URL path so it persists on reload
  const [activeService, setActiveService] = useState(() => {
    if (typeof window !== "undefined" && window.location.pathname.includes("/appointment")) {
      return "appointments";
    }
    return "ecommerce";
  });

  const closeMenu = () => setMenuOpen(false);

  // Check auth state on mount and when 'authChange' event is triggered
  useEffect(() => {
    const checkAuthStatus = () => {
      setEcommerceAuth(!!localStorage.getItem('sellerToken'));
      setAppointmentAuth(!!localStorage.getItem('doctorToken')); // Updated to properly check doctor token
    };

    checkAuthStatus();
    window.addEventListener('authChange', checkAuthStatus);
    
    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  // Determine which navigation items to show based on the active service
  const currentNavItems = activeService === "ecommerce" ? ecommerceNavItems : appointmentsNavItems;
  
  // Check if user is logged into the currently viewed service tab
  const isAuth = activeService === "ecommerce" ? ecommerceAuth : appointmentAuth;

  return (
    <header className="relative z-50 w-full border-b-2 border-[#D9D9D9] bg-white">
      {/* Main unified Desktop & Tablet header container */}
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 md:px-9 lg:px-12 md:py-4">
        
        {/* Left Side: Brand vertically centered */}
        <div className="flex flex-1 items-center justify-start">
          <Brand />
        </div>

        {/* Center: Tablet and Desktop Service Buttons & Navigation vertically stacked */}
        <div className="hidden shrink-0 sm:flex flex-col items-center justify-center gap-3 md:gap-4">
          
          {/* Top: Service Buttons */}
          <div className="flex items-center justify-center gap-4">
            <ServiceButton
              icon={ecommerceIcon}
              label="E - Commerce"
              selected={activeService === "ecommerce"}
              onClick={() => {
                setActiveService("ecommerce");
                window.location.href = "/";
              }}
              backgroundImage={ecommerceBackground}
            />
            <ServiceButton
              icon={appointmentIcon}
              label="Appointments"
              selected={activeService === "appointments"}
              onClick={() => {
                setActiveService("appointments");
                window.location.href = "/appointment";
              }}
              backgroundImage={ecommerceBackground}
            />
          </div>

          {/* Bottom: Desktop Navigation links */}
          <DesktopNavigation items={currentNavItems} />
          
        </div>

        {/* Right Side / Auth Buttons / Mobile menu toggle vertically centered */}
        <div className="flex flex-1 items-center justify-end">
          
          {/* Auth Buttons */}
          <div className="hidden md:flex">
            <AuthButtons activeService={activeService} isAuth={isAuth} />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
            className="flex h-10 w-10 shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-lg border border-[#346739] bg-white md:hidden"
          >
            <span
              className={`h-0.5 w-5 bg-[#346739] transition-transform duration-300 ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-[#346739] transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-[#346739] transition-transform duration-300 ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>

      </div>

      {/* Mobile-only service buttons (Below header content) */}
      <div className="grid w-full grid-cols-2 gap-2 px-4 pb-3 sm:hidden">
        <ServiceButton
          icon={ecommerceIcon}
          label="E-Commerce"
          selected={activeService === "ecommerce"}
          onClick={() => {
            setActiveService("ecommerce");
            window.location.href = "/";
          }}
          backgroundImage={ecommerceBackground}
        />
        <ServiceButton
          icon={appointmentIcon}
          label="Appointments"
          selected={activeService === "appointments"}
          onClick={() => {
            setActiveService("appointments");
            window.location.href = "/appointment";
          }}
          backgroundImage={ecommerceBackground}
        />
      </div>

      {/* Mobile Navigation Panel */}
      {menuOpen && (
        <MobileNavigation 
          items={currentNavItems} 
          closeMenu={closeMenu} 
          activeService={activeService} 
          isAuth={isAuth}
        />
      )}
    </header>
  );
};

export default NavBar;