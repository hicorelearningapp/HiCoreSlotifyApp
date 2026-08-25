import React from 'react';

// Asset imports
import emailIcon from '../assets/ContactUs/mail-icon.png';
import websiteIcon from '../assets/ContactUs/browser-icon.png';
import arrowIcon from '../assets/ContactUs/arrow.png';
import greenArrowIcon from '../assets/ContactUs/arrow.png';

const ContactUs = () => {
  return (
    <section className="w-full flex flex-col items-center pt-10 pb-16 md:pb-[164px] px-4 sm:px-8 overflow-hidden">
      
      {/* Outer Container matching top section (capped at 1440px) */}
      <div className="w-full max-w-[1440px] flex flex-col items-center">

        {/* Section Header */}
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-[#346739] uppercase text-center">
            CONTACT US
          </h2>

          <div className="flex items-center justify-center gap-1 mt-1 w-36 sm:w-48">
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
            <span className="h-[1px] bg-[#346739] flex-1"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
          </div>
        </div>

        {/* Main Content Layout (50/50 Split on desktop) */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-[64px]">
          
          {/* Left Side: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
            
            <h3 className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold text-[#BD4444] leading-snug">
              Let's Build Better Booking Experiences Together
            </h3>

            <p className="text-[#346739] text-[15px] sm:text-[16px] leading-[26px] sm:leading-[32px]">
              Whether you're looking for a live demo, have questions about our platform, or need help choosing the right solution, our team is here to help.
            </p>
            
            {/* Contact Button - Opens Email */}
            <a
              href="mailto:info@hicoresoft.com"
              className="mt-2 w-full py-3.5 px-6 bg-[#346739] rounded-xl flex items-center justify-center gap-3 shadow-[0px_4px_4px_0px_#00000040] hover:shadow-[0px_4px_4px_0px_#00000040,inset_0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-white border-2 border-transparent hover:border-[#346739] group transition-all duration-300 cursor-pointer"
            >
              <span className="font-semibold text-[15px] sm:text-[16px] text-white group-hover:text-[#346739] transition-colors duration-300">
                Contact Us
              </span>
              
              {/* White Arrows - Default */}
              <span className="block group-hover:hidden text-white font-bold transition-colors duration-300">
                &gt;&gt;
              </span>
              
              {/* Green Arrows - Hover */}
              <span className="hidden group-hover:block text-[#346739] font-bold transition-colors duration-300">
                &gt;&gt;
              </span>
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
                className="text-[16px] sm:text-[18px] font-bold text-[#346739] hover:underline break-all"
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
                href="https://www.hicoreslotify.com"
                target="_blank"
                rel="noreferrer"
                className="text-[16px] sm:text-[18px] font-bold text-[#346739] hover:underline break-all"
              >
                www.hicoreslotify.com
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactUs;