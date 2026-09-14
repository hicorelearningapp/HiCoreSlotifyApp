import React, { useState } from 'react';
import emailIcon from '../../assets/E-com/LandingPage/emailIcon.png';
import websiteIcon from '../../assets/E-com/LandingPage/websiteIcon.png';

const ContactUs = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <section className="w-full bg-white flex justify-center items-center py-16">
        {/* Outer Container */}
        <div className="w-full px-4 sm:px-8 md:px-[64px] pb-[30px] lg:pb-[50px] flex flex-col items-center gap-[40px] lg:gap-[64px] max-w-[1440px]">
          
          {/* Section Title Header */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-semibold text-[#346739] tracking-wider uppercase text-center font-['Poppins'] leading-[48px]">
              CONTACT US
            </h2>
            <div className="flex items-center mb-6 justify-center w-full max-w-[182px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
              <span className="h-[1px] w-full bg-[#346739] flex-1"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
            </div>
          </div>

          {/* Content Layout: Left Text/Button, Right Two Contact Cards */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[40px] items-center">
            
            {/* Left Side: Text and Button */}
            <div className="flex flex-col items-start gap-4 w-full">
              <h3 className="font-['Roboto'] font-semibold text-[20px] leading-[40px] text-[#BD4444]">
                Ready to Turn Conversations Into Orders?
              </h3>
              <p className="font-['Roboto'] font-normal text-[16px] leading-[36px] text-[#346739]">
                Your next customer is already scrolling.
              </p>
              <p className="font-['Roboto'] font-normal text-[16px] leading-[36px] text-[#346739]">
                Let HiCoreSlotify’s AI engage your customers, answer their questions, and help turn Instagram & WhatsApp conversations into sales — 24×7.
              </p>

              {/* Contact Us Button */}
              <div className="w-full max-w-[624px] p-[4px] rounded-[16px] bg-[#346739] mt-2">
                <button 
                  onClick={() => setIsPopupOpen(true)}
                  className="w-full h-[44px] px-[16px] py-[4px] rounded-[12px] bg-[#346739] shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white group"
                >
                  <span className="font-['Poppins'] font-semibold text-[18px] leading-[36px] text-white group-hover:text-[#346739] transition-colors duration-300">
                    Contact Us
                  </span>
                  <span className="w-[20px] h-[20px] flex items-center justify-center text-white group-hover:text-[#346739] transition-colors duration-300">
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Right Side: Two Contact Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
              
              {/* Email Card */}
              <div className="w-full max-w-[302px] min-h-[222px] p-6 rounded-[16px] bg-[#F1DEC426] border border-[#346739] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-[inset_4px_4px_10px_0px_rgba(0,0,0,0.25)]">
                <div className="w-[64px] h-[64px] flex items-center justify-center mb-2">
                  <img src={emailIcon} alt="Email" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]">
                    Email
                  </p>
                  <h4 className="font-['Roboto'] font-semibold text-[18px] leading-[38px] text-[#346739] break-all">
                    info@hicoresoft.com
                  </h4>
                </div>
              </div>

              {/* Website Card */}
              <div className="w-full max-w-[302px] min-h-[222px] p-6 rounded-[16px] bg-[#F1DEC426] border border-[#346739] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-[inset_4px_4px_10px_0px_rgba(0,0,0,0.25)]">
                <div className="w-[64px] h-[64px] flex items-center justify-center mb-2">
                  <img src={websiteIcon} alt="Website" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739]">
                    Website
                  </p>
                  <h4 className="font-['Roboto'] font-semibold text-[18px] leading-[38px] text-[#346739] break-all">
                    www.hicoreslotify.com
                  </h4>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-all duration-300">
          <div className="relative flex w-full max-w-[400px] flex-col items-center gap-4 rounded-[20px] bg-white p-8 shadow-2xl">
            {/* Close Button */}
            <button 
              onClick={() => setIsPopupOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#346739] transition-colors hover:bg-[#F1DEC440] hover:text-[#BD4444]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="mb-2 flex h-[72px] w-[72px] items-center justify-center">
              <img src={emailIcon} alt="Email" className="h-full w-full object-contain" />
            </div>
            <h3 className="text-center font-['Poppins'] text-[22px] font-semibold text-[#346739]">
              Reach Out To Us
            </h3>
            <p className="text-center font-['Roboto'] text-[15px] text-[#555555]">
              We'd love to hear from you! Click the email below to send us a message.
            </p>
            <a 
              href="mailto:info@hicoresoft.com" 
              className="mt-2 rounded-lg bg-[#F1DEC426] px-6 py-3 font-['Roboto'] text-[18px] font-bold text-[#BD4444] transition-colors hover:bg-[#F1DEC470] hover:text-[#346739] break-all"
            >
              info@hicoresoft.com
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactUs;