import React from 'react';
import footerBannerImg from '../../assets/E-com/LandingPage/footerBannerImg.png';

const FooterBanner = () => {
  return (
    <section className="w-full bg-white flex justify-center items-center py-0">
      {/* Outer Container stretching full width with no horizontal/vertical padding gaps */}
      <div className="w-full px-0">
        
        {/* Banner Container extending edge-to-edge, removing rounded corners and bottom spacing */}
        <div className="w-full relative overflow-hidden bg-[#F9F9F9] flex flex-col lg:flex-row items-center justify-between min-h-[502.61px]">
          
          {/* Background Image filling the container */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <img
              src={footerBannerImg}
              alt="Background Banner"
              className="w-full h-full object-cover opacity-90 lg:opacity-100"
            />
          </div>

          {/* Left Side: Text Content centered within its half column using flex column and items-center */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:pl-[120px] z-10 gap-[8px] my-auto text-center">
            <div className="flex flex-col items-center">
              <h2 className="font-['Poppins'] font-semibold text-[36px] leading-[56px] text-[#346739]">
                HiCoreSlotify
              </h2>
              <p className="font-['Roboto'] font-normal text-[18px] leading-[38px] text-[#BD4444]">
                Your Time. Your Slot.
              </p>
            </div>
            <div className="flex flex-col items-center gap-[8px] mt-[12px]">
              <p className="font-['Poppins'] font-semibold text-[20px] leading-[40px] text-[#346739]">
                Connect Instagram.
              </p>
              <p className="font-['Poppins'] font-semibold text-[20px] leading-[40px] text-[#346739]">
                Connect WhatsApp.
              </p>
              <p className="font-['Poppins'] font-semibold text-[20px] leading-[40px] text-[#346739]">
                Let AI Handle the Conversations.
              </p>
            </div>
          </div>

          {/* Right Side Spacer for Flex alignment over the background image */}
          <div className="w-full lg:w-1/2 h-full z-10 pointer-events-none"></div>

        </div>

      </div>
    </section>
  );
};

export default FooterBanner;