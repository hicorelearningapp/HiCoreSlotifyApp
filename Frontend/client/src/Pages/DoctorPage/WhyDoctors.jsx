import React from 'react';

// Import icons from your assets folder (adjust file extensions/paths as needed)
import saveTimeIcon from '../../assets/why/Time.png';
import calendarIcon from '../../assets/why/Calendar.png';
import whatsappBookingIcon from '../../assets/why/Message.png';
import aiAssistantIcon from '../../assets/why/AI.png';
import remindersIcon from '../../assets/why/reminders.png';
import patientExperienceIcon from '../../assets/why/Experience.png';
import increaseAppointmentsIcon from '../../assets/why/growth.png';
import insightsIcon from '../../assets/why/Practice.png';

const cardsData = [
  {
    icon: saveTimeIcon,
    title: 'Save valuable consultation time',
    description: 'Spend more time with patients and less time answering appointment calls.',
  },
  {
    icon: calendarIcon,
    title: 'Organized appointment calendar',
    description: 'View all your appointments in one intelligent calendar with real-time availability.',
  },
  {
    icon: whatsappBookingIcon,
    title: 'WhatsApp appointment booking',
    description: 'Patients can book appointments directly through WhatsApp in just a few simple steps.',
  },
  {
    icon: aiAssistantIcon,
    title: 'AI booking assistant',
    description: 'Your virtual receptionist works 24x7, even when you\'re unavailable.',
  },
  {
    icon: remindersIcon,
    title: 'Automatic reminders',
    description: 'Automatic reminders help patients remember their appointments.',
  },
  {
    icon: patientExperienceIcon,
    title: 'Better patient experience',
    description: 'Quick booking, instant confirmation, and hassle-free scheduling improve patient satisfaction.',
  },
  {
    icon: increaseAppointmentsIcon,
    title: 'Increase daily appointments',
    description: 'Fill available time slots efficiently and reduce scheduling gaps.',
  },
  {
    icon: insightsIcon,
    title: 'Practice insights',
    description: 'Track appointments, cancellations, consultation trends, and patient activity in one dashboard.',
  },
];

const WhyDoctors = () => {
  return (
    <section className="w-full mx-auto px-4 md:px-[64px] pt-[64px] pb-[164px] bg-white flex flex-col items-center">
      
      {/* Title Section */}
      <div className="text-center mb-16 w-full flex flex-col items-center">
        <h2 className="font-['Poppins',_sans-serif] font-semibold text-[28px] leading-[48px] text-[#346739]">
          <span className="uppercase">WHY DOCTORS CHOOSE</span> HiCoreSlotify?
        </h2>
        {/* Accent underline: 540px max width with dots on ends */}
        <div className="flex items-center justify-center w-full max-w-[540px] mt-1">
          <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
          <div className="flex-1 h-[1px] bg-[#346739]"></div>
          <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
        </div>
      </div>

      {/* Cards Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px] w-full max-w-[1280px] justify-items-center">
        {cardsData.map((card, index) => (
          <div
            key={index}
            className="
              w-full flex flex-col items-center text-center 
              px-[20px] py-[24px] rounded-[16px] border border-[#66BB6A] bg-[#FFFFFF]
              transition-all duration-300 cursor-pointer group h-full
              hover:bg-[#346739] hover:border-[#66BB6A]
              hover:shadow-[inset_8px_8px_4px_0px_rgba(0,0,0,0.25)]
            "
          >
            {/* Icon Container */}
            <div 
              className="
                w-[64px] h-[64px] mb-[12px] flex items-center justify-center rounded-full
                transition-all duration-300 
                group-hover:shadow-[4px_4px_4px_0px_rgba(0,0,0,0.25)]
              "
            >
              <img
                src={card.icon}
                alt={card.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Title */}
            <h3 
              className="
                font-['Roboto',_sans-serif] font-semibold text-[16px] leading-[36px] text-[#346739] 
                group-hover:text-white mb-[4px]
              "
            >
              {card.title}
            </h3>
            
            {/* Description */}
            <p 
              className="
                font-['Roboto',_sans-serif] font-normal text-[14px] leading-[28px] text-[#828282] 
                group-hover:text-white
              "
            >
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyDoctors;