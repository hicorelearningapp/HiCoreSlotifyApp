import React from 'react';

// Replace with your actual image paths from your assets folder
import whatsappImg from '../../assets/Features/whatsapp-booking.png';
import aiAssistantImg from '../../assets/Features/ai-booking.png';
import calendarImg from '../../assets/Features/smart-calendar.png';
import doctorAvailabilityImg from '../../assets/Features/doctor-availability.png';
import realTimeSlotImg from '../../assets/Features/real-time-slot.png';
import onlinePaymentsImg from '../../assets/Features/online-payments.png';
import automatedNotificationsImg from '../../assets/Features/automated-notifications.png';
import patientManagementImg from '../../assets/Features/patient-management.png';
import reportsAnalyticsImg from '../../assets/Features/reports-analytics.png';
import enterpriseSecurityImg from '../../assets/Features/enterprise-security.png';

const featuresData = [
  {
    image: whatsappImg,
    title: 'WhatsApp Booking',
    description: 'Patients can schedule appointments without downloading another application.',
  },
  {
    image: aiAssistantImg,
    title: 'AI Booking Assistant',
    description: 'Automatically handles appointment requests and patient inquiries around the clock.',
  },
  {
    image: calendarImg,
    title: 'Smart Appointment Calendar',
    description: 'View daily, weekly, and monthly schedules with intelligent slot management.',
  },
  {
    image: doctorAvailabilityImg,
    title: 'Doctor Availability Management',
    description: 'Set consultation timings, holidays, breaks, and available slots with ease.',
  },
  {
    image: realTimeSlotImg,
    title: 'Real-Time Slot Availability',
    description: 'Patients only see available time slots, eliminating booking conflicts.',
  },
  {
    image: onlinePaymentsImg,
    title: 'Online Consultation Payments',
    description: 'Collect consultation fees securely before appointments, if required.',
  },
  {
    image: automatedNotificationsImg,
    title: 'Automated Notifications',
    description: 'Instant confirmations, reminders, reschedules, and cancellations sent automatically.',
  },
  {
    image: patientManagementImg,
    title: 'Patient Management',
    description: 'Maintain patient profiles, appointment history, and visit records in one place.',
  },
  {
    image: reportsAnalyticsImg,
    title: 'Reports & Analytics',
    description: 'Gain insights into appointments, patient trends, revenue, and consultation performance.',
  },
  {
    image: enterpriseSecurityImg,
    title: 'Enterprise-Grade Security',
    description: 'Protect patient information with secure and encrypted data management.',
  },
];

const PowerfulFeatures = () => {
  return (
    <section className="w-full mx-auto px-4 md:px-[64px] pb-[100px] lg:pb-[164px] bg-white flex flex-col items-center">
      
      {/* Title Section */}
      <div className="text-center mb-10 sm:mb-16 w-full flex flex-col items-center">
        <h2 className="font-['Poppins',_sans-serif] font-semibold text-[24px] sm:text-[28px] leading-[36px] sm:leading-[48px] text-[#346739]">
          <span className="uppercase">POWERFUL FEATURES OF</span> HiCoreSlotify
        </h2>
        {/* Accent underline: 524px width with dots on ends */}
        <div className="flex items-center justify-center w-full max-w-[524px] mt-1">
          <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
          <div className="flex-1 h-[1px] bg-[#346739]"></div>
          <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
        </div>
      </div>

      {/* Cards Grid: 2 cols on mobile, 3 on tablet, 5 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[12px] sm:gap-[24px] w-full max-w-[1280px] mx-auto justify-items-center">
        {featuresData.map((card, index) => (
          <div
            key={index}
            className="
              w-full max-w-[233.6px] h-full 
              rounded-[16px] border border-[#66BB6A] bg-[#FFFFFF]
              flex flex-col items-center overflow-hidden
              transition-all duration-300 cursor-pointer
              hover:border-[#346739] hover:shadow-[-4px_-4px_4px_0px_#00000040,inset_-6px_-6px_4px_0px_#00000040]
            "
          >
            {/* Top Image Container */}
            <div className="w-full h-[120px] sm:h-[164px] flex-shrink-0">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text Content Container */}
            <div className="w-full flex-1 flex flex-col items-center text-center px-[8px] sm:px-[12px] pt-[12px] pb-[16px]">
              
              {/* Title */}
              <h3 
                className="
                  font-['Roboto',_sans-serif] font-semibold text-[14px] sm:text-[16px] leading-[20px] sm:leading-[24px] md:leading-[36px] text-[#346739] mb-1 sm:mb-2
                "
              >
                {card.title}
              </h3>
              
              {/* Description */}
              <p 
                className="
                  font-['Roboto',_sans-serif] font-normal text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] md:leading-[28px] text-[#346739]
                "
              >
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PowerfulFeatures;