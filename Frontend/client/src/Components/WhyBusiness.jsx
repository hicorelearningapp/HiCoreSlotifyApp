import React from 'react';

// Import icons from your assets folder (adjust file extensions as needed)
import saveHoursIcon from '../assets/why/Time.png';
import neverMissIcon from '../assets/why/Calendar.png';
import increaseRevenueIcon from '../assets/why/growth.png';
import delightCustomersIcon from '../assets/why/Experience.png';
import improveProductivityIcon from '../assets/why/Improve.png';
import aiAutomationIcon from '../assets/why/AI.png';
import whatsappIcon from '../assets/why/Message.png';
import enterpriseSecurityIcon from '../assets/why/Security.png';
import multiLocationIcon from '../assets/why/multi-location.png';
import businessInsightsIcon from '../assets/why/Practice.png';

const cardsData = [
  {
    icon: saveHoursIcon,
    title: 'Save Hours Every Day',
  },
  {
    icon: neverMissIcon,
    title: 'Never Miss a Booking',
  },
  {
    icon: increaseRevenueIcon,
    title: 'Increase Revenue',
  },
  {
    icon: delightCustomersIcon,
    title: 'Delight Your Customers',
  },
  {
    icon: improveProductivityIcon,
    title: 'Improve Team Productivity',
  },
  {
    icon: aiAutomationIcon,
    title: 'AI-Powered Automation',
  },
  {
    icon: whatsappIcon,
    title: 'Instant WhatsApp Communication',
  },
  {
    icon: enterpriseSecurityIcon,
    title: 'Enterprise-Grade Security',
  },
  {
    icon: multiLocationIcon,
    title: 'Multi-Location Support',
  },
  {
    icon: businessInsightsIcon,
    title: 'Real-Time Business Insights',
  },
];

const WhyBusiness = () => {
  return (
    <section className="w-full  mx-auto  pr-[64px] pb-[164px] pl-[64px] bg-white flex flex-col items-center">
      {/* Title Section */}
      <div className="text-center mb-16">
        <h2 className="font-['Poppins',_sans-serif] font-semibold text-[28px] leading-[48px] text-[#346739]">
          <span className="uppercase">WHY BUSINESSES LOVE</span> HiCoreSlotify?
        </h2>
        {/* Accent underline */}
        <div className="flex items-center justify-center  gap-1 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E5A35]"></span>
          <div className="w-full h-[2px] bg-[#2E5A35]"></div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E5A35]"></span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[16px] w-full max-w-[1280px] mx-auto justify-items-center">
        {cardsData.map((card, index) => (
          <div
            key={index}
            className="
              w-full max-w-[233.6px] h-[192px] 
              pt-[24px] pr-[20px] pb-[24px] pl-[20px] 
              rounded-[16px] border border-[#66BB6A] bg-white
              flex flex-col items-center mt-4 justify-center text-center gap-[8px]
              transition-all duration-300 cursor-pointer
              hover:bg-[#346739] hover:text-white
              hover:shadow-[inset_8px_8px_4px_0px_rgba(0,0,0,0.25)]
              group
            "
          >
            {/* Icon Container */}
            <div className="w-16 h-16 mb-1 flex items-center justify-center">
              <img
                src={card.icon}
                alt={card.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Title */}
            <p className="text-[15px] max-w-[120px] font-semibold text-[#346739] group-hover:text-white leading-[28px]">
              {card.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyBusiness;