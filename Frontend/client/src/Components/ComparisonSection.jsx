import React from 'react';

// Replace with your actual icon paths from your assets folder
import bookingIcon from '../assets/Comparison/booking.png';
import schedulingIcon from '../assets/Comparison/scheduling.png';
import staffIcon from '../assets/Comparison/staff.png';
import responseIcon from '../assets/Comparison/response.png';
import platformIcon from '../assets/Comparison/platform.png';
import followupIcon from '../assets/Comparison/followup.png';
import recordsIcon from '../assets/Comparison/records.png';
import analyticsIcon from '../assets/Comparison/analytics.png';

const comparisonData = [
  {
    icon: bookingIcon,
    leftTitle: 'Phone Calls',
    leftDesc: 'Patients wait on calls, and missed calls often lead to lost appointments.',
    rightTitle: 'AI Receptionist 24x7',
    rightDesc: 'AI answers instantly and books appointments anytime, day or night.',
  },
  {
    icon: schedulingIcon,
    leftTitle: 'Manual Scheduling',
    leftDesc: 'Appointments are managed manually, increasing the risk of errors and double bookings.',
    rightTitle: 'Automated Scheduling',
    rightDesc: 'Smart scheduling eliminates manual work and prevents double bookings.',
  },
  {
    icon: staffIcon,
    leftTitle: 'Receptionist Required',
    leftDesc: 'Booking depends on staff availability and working hours.',
    rightTitle: 'AI + Staff Together',
    rightDesc: 'AI assists your staff, making appointment management faster and easier.',
  },
  {
    icon: responseIcon,
    leftTitle: 'Missed Calls',
    leftDesc: 'Every missed call is a potential missed patient and lost revenue.',
    rightTitle: 'Instant Response',
    rightDesc: 'Every patient receives an immediate response without waiting.',
  },
  {
    icon: platformIcon,
    leftTitle: 'Multiple Apps',
    leftDesc: 'Managing appointments across different tools creates confusion and inefficiency.',
    rightTitle: 'One Unified Platform',
    rightDesc: 'Manage appointments, patients, prescriptions, and analytics in one place.',
  },
  {
    icon: followupIcon,
    leftTitle: 'Manual Follow-up',
    leftDesc: 'Staff must remember to call or message patients for reminders and reviews.',
    rightTitle: 'Automated Follow-up',
    rightDesc: 'Appointment, medicine, and review reminders are sent automatically.',
  },
  {
    icon: recordsIcon,
    leftTitle: 'Paper Register',
    leftDesc: 'Appointment records are difficult to organize, update, and access quickly.',
    rightTitle: 'Digital Dashboard',
    rightDesc: 'Access appointments, patient records, and schedules from one smart dashboard.',
  },
  {
    icon: analyticsIcon,
    leftTitle: 'No Analytics',
    leftDesc: 'Limited visibility into appointments, patient trends, and business performance.',
    rightTitle: 'Real-Time Insights',
    rightDesc: 'Monitor appointments, revenue, and practice growth with live analytics.',
  },
];

const ComparisonSection = () => {
  return (
    <section className="w-full mx-auto px-4 md:px-[64px] pb-[100px] lg:pb-[164px] bg-white flex flex-col items-center">
      
      {/* Title Section */}
      <div className="text-center mb-16 w-full flex flex-col items-center">
        <h2 className="font-['Poppins',_sans-serif] font-semibold text-[24px] sm:text-[28px] leading-[48px] text-[#346739]">
          TRADITIONAL METHOD vs HiCoreSlotify
        </h2>
        
        {/* Accent underline: 536px width with dots on ends */}
        <div className="flex items-center justify-center w-full max-w-[536px] mt-1">
          <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
          <div className="flex-1 h-[1px] bg-[#346739]"></div>
          <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
        </div>
      </div>

      {/* Comparison Grid 
          Removed lg:gap-x-[16px] so elements can overlap via negative margins */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_136px_1fr] gap-6 lg:gap-x-0 lg:gap-y-[16px] w-full max-w-[1400px] mx-auto items-center">
        
        {/* Center Spine Background (Desktop Only) - Adapts automatically to exact height */}
        <div 
          className="
            hidden lg:block absolute left-1/2 -translate-x-1/2 top-[-16px] bottom-[-16px] w-[136px] 
            bg-[#FFFFFF] rounded-[16px] 
            shadow-[4px_4px_10px_0px_rgba(0,0,0,0.25),-4px_-4px_10px_0px_rgba(0,0,0,0.25)] z-20
          "
        ></div>

        {/* Map through data rows */}
        {comparisonData.map((item, index) => (
          <React.Fragment key={index}>
            
            {/* Left Box */}
            <div 
              className="
                relative z-10 
                w-full lg:max-w-[615px] h-auto lg:min-h-[102px] 
                rounded-[16px] border border-[#D9D9D9] bg-[#FFFFFF] 
                p-[16px] flex flex-col justify-center items-center text-center gap-[4px]
                justify-self-end
                lg:-mr-[24px] lg:pr-[40px] /* Pulls under spine & offsets padding */
                xl:-mr-[32px] xl:pr-[48px]
              "
            >
              <h3 className="font-['Roboto',_sans-serif] font-semibold text-[16px] leading-[24px] sm:leading-[36px] text-[#BD4444] m-0">
                {item.leftTitle}
              </h3>
              <p className="font-['Roboto',_sans-serif] font-normal text-[14px] leading-[20px] sm:leading-[28px] text-[#828282] m-0">
                {item.leftDesc}
              </p>
            </div>

            {/* Center Icon */}
            <div className="flex justify-center items-center w-full lg:w-[136px] h-auto lg:h-[102px] relative z-30 my-2 lg:my-0">
              <img
                src={item.icon}
                alt={`${item.leftTitle} vs ${item.rightTitle}`}
                className="w-[74.45px] h-[100px] object-contain"
              />
            </div>

            {/* Right Box */}
            <div 
              className="
                relative z-10
                w-full lg:max-w-[615px] h-auto lg:min-h-[102px] 
                rounded-[16px] border border-[#D9D9D9] bg-[#FFFFFF] 
                p-[16px] flex flex-col justify-center items-center text-center gap-[4px]
                justify-self-start
                lg:-ml-[24px] lg:pl-[40px] /* Pulls under spine & offsets padding */
                xl:-ml-[32px] xl:pl-[48px]
              "
            >
              <h3 className="font-['Roboto',_sans-serif] font-semibold text-[16px] leading-[24px] sm:leading-[36px] text-[#346739] m-0">
                {item.rightTitle}
              </h3>
              <p className="font-['Roboto',_sans-serif] font-normal text-[14px] leading-[20px] sm:leading-[28px] text-[#828282] m-0">
                {item.rightDesc}
              </p>
            </div>

          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default ComparisonSection;