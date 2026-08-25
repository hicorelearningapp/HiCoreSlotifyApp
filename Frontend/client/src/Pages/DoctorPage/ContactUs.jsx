import React from 'react';
// Asset imports
import emailIcon from '../../assets/ContactUs/mail-icon.png';
import websiteIcon from '../../assets/ContactUs/browser-icon.png';
import whiteArrow from '../../assets/LandingPage/whiteArrow.png';
import greenArrow from '../../assets/LandingPage/greenArrow.png';

const ContactUs = () => {
  return (
    <section className="w-full flex flex-col items-center pb-10 md:pb-[164px] px-4 sm:px-8 overflow-hidden bg-white">
      
      {/* Outer Container matching top section (capped at 1440px) */}
      <div className="w-full max-w-[1440px] flex flex-col items-center">

        {/* Section Header */}
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <h2 className="font-['Poppins',_sans-serif] font-semibold text-[28px] leading-[48px] text-[#346739] uppercase text-center">
            CONTACT US
          </h2>

          {/* Accent underline: 182px total width */}
          <div className="flex items-center justify-center w-[182px] mt-1">
            <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
            <div className="flex-1 h-[1px] bg-[#346739]"></div>
            <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
          </div>
        </div>

        {/* Main Content Layout (50/50 Split on desktop) */}
        <div className="w-full max-w-[1280px] flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-[64px]">
          
          {/* Left Side: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left gap-[16px]">
            
            <h3 className="font-['Roboto',_sans-serif] font-semibold text-[20px] leading-[40px] text-[#BD4444]">
              Let's Build Better Booking Experiences Together
            </h3>
            
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Roboto',_sans-serif] font-normal text-[16px] leading-[36px] text-[#346739]">
                Your patients deserve a better booking experience. You deserve more time to care.
              </p>
              
              <p className="font-['Roboto',_sans-serif] font-normal text-[16px] leading-[36px] text-[#346739]">
                Let SLOTIFY automate your appointments while you focus on what matters most - providing exceptional medical care.
              </p>
            </div>
            
            {/* Layered Button - Opens Email */}
            <a
              href="mailto:info@hicoresoft.com"
              className="w-full max-w-[624px] h-[52px] bg-[#346739] rounded-[16px] p-[4px] mt-4 cursor-pointer group block"
            >
              <div 
                className="
                  w-full h-full bg-[#346739] rounded-[12px] 
                  flex items-center justify-center gap-[12px] 
                  px-[16px] py-[4px] 
                  shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)] 
                  transition-colors duration-300 
                  group-hover:bg-[#FFFFFF] 
                  group-hover:shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)]
                "
              >
                <span className="font-['Poppins',_sans-serif] font-semibold text-[18px] leading-[36px] text-[#FFFFFF] group-hover:text-[#346739] transition-colors duration-300">
                  Contact Us
                </span>
                
                {/* White Arrow (Default) */}
                <img 
                  src={whiteArrow} 
                  alt="Arrow Right" 
                  className="w-[20px] h-[20px] object-contain block group-hover:hidden" 
                />
                
                {/* Green Arrow (Hover) */}
                <img 
                  src={greenArrow} 
                  alt="Arrow Right" 
                  className="w-[20px] h-[20px] object-contain hidden group-hover:block" 
                />
              </div>
            </a>
          </div>

          {/* Right Side: Cards Container */}
          <div className="w-full lg:w-1/2 flex flex-col sm:flex-row gap-5 justify-center lg:justify-end items-center">
            
            {/* Card 1: Email */}
            <div 
              className="w-full sm:w-[280px] xl:w-[302px] min-h-[190px] p-5 gap-2.5 rounded-[16px] border border-[#346739] flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor: 'rgba(241, 222, 196, 0.15)',
                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 4px 4px 10px 0px rgba(0, 0, 0, 0.25)',
              }}
            >
              <img 
                src={emailIcon} 
                alt="Email Icon" 
                className="w-12 h-12 object-contain mb-1" 
              />

              <span className="text-[14px] text-[#346739] font-medium">
                Email
              </span>

              <a 
                href="mailto:info@hicoresoft.com" 
                className="font-['Roboto',_sans-serif] text-[16px] sm:text-[18px] font-bold text-[#346739] hover:underline break-all"
              >
                info@hicoresoft.com
              </a>
            </div>

            {/* Card 2: Website */}
            <div 
              className="w-full sm:w-[280px] xl:w-[302px] min-h-[190px] p-5 gap-2.5 rounded-[16px] border border-[#346739] flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor: 'rgba(241, 222, 196, 0.15)',
                boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25), inset 4px 4px 10px 0px rgba(0, 0, 0, 0.25)',
              }}
            >
              <img 
                src={websiteIcon} 
                alt="Website Icon" 
                className="w-12 h-12 object-contain mb-1" 
              />

              <span className="text-[14px] text-[#346739] font-medium">
                Website
              </span>

              <a 
                href="https://www.hicoresoft.com/"
                target="_blank"
                rel="noreferrer"
                className="font-['Roboto',_sans-serif] text-[16px] sm:text-[18px] font-bold text-[#346739] hover:underline break-all"
              >
                www.hicoresoft.com
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactUs;