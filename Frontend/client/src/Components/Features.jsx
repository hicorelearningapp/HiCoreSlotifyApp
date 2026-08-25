import React from 'react';

// Import feature images from your assets folder
import feature1Img from '../assets/Features/image-1.png';
import feature2Img from '../assets/Features/image-2.png';
import feature3Img from '../assets/Features/image-3.png';
import feature4Img from '../assets/Features/image-4.png';
import feature5Img from '../assets/Features/image-5.png';
import feature6Img from '../assets/Features/image-6.png';
import feature7Img from '../assets/Features/image-7.png';
import feature8Img from '../assets/Features/image-8.png';

const featuresData = [
  {
    image: feature1Img,
    title: 'AI Booking Assistant',
    description:
      'Provide instant responses, guide customers through bookings, and automate appointments 24x7 with an intelligent AI assistant.',
  },
  {
    image: feature2Img,
    title: 'WhatsApp Booking',
    description:
      'No app downloads or phone calls—customers can schedule services with a simple chat.',
  },
  {
    image: feature3Img,
    title: 'Smart Scheduling',
    description:
      'Prevent double bookings, optimize availability, and manage schedules effortlessly.',
  },
  {
    image: feature4Img,
    title: 'Secure Payments',
    description:
      'Accept deposits or full payments using secure payment gateways before confirming appointments.',
  },
  {
    image: feature5Img,
    title: 'Automated Reminders',
    description:
      'Send booking confirmations, reminders, cancellations, and follow-up messages without manual effort.',
  },
  {
    image: feature6Img,
    title: 'Reports & Analytics',
    description:
      'Monitor bookings, revenue, customer trends, staff performance, and business growth in real time.',
  },
  {
    image: feature7Img,
    title: 'Staff Management',
    description:
      'Let customers choose their preferred professional, trainer, consultant, or service expert.',
  },
  {
    image: feature8Img,
    title: 'Multi-Industry Support',
    description:
      'Built for healthcare, salons, hospitality, education, finance, professional services, home services, and more.',
  },
];

const Features = () => {
  return (
    <section className="w-full mb-16 px-4 md:px-14 bg-white flex flex-col items-center">
      {/* Title Header */}
      <div className="text-center mb-12">
        <h2 className="font-['Poppins',_sans-serif] font-semibold text-[28px] leading-[48px] text-[#346739]">
          <span className="uppercase">POWERFUL FEATURES OF</span> HiCoreSlotify
        </h2>
        {/* Decorative line with endpoints */}
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E5A35]"></span>
          <div className="w-full h-[2px] bg-[#2E5A35]"></div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E5A35]"></span>
        </div>
      </div>

      {/* Grid Layout (Added max-w-[1280px] mx-auto to fix spacing) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1280px] mx-auto justify-items-center">
        {featuresData.map((feature, index) => (
          <div
            key={index}
            className="
              w-full max-w-[638px] 
              flex flex-col lg:flex-row 
              h-auto lg:h-[188px] 
              bg-white rounded-[16px] border border-[#66BB6A] 
              overflow-hidden transition-all duration-300 cursor-pointer 
              shadow-[0px_0px_0px_0px_rgba(0,0,0,0)] 
              hover:border-[#346739] 
              hover:shadow-[4px_4px_4px_0px_rgba(0,0,0,0.25),_inset_0px_4px_4px_0px_rgba(0,0,0,0.25)]
            "
          >
            {/* Top Image (Mobile) / Left Image (Desktop) */}
            <div className="w-full h-[180px] lg:w-1/2 lg:h-full flex-shrink-0">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover rounded-t-[15px] lg:rounded-t-none lg:rounded-l-[15px]"
              />
            </div>

            {/* Bottom Text Content (Mobile) / Right Text Content (Desktop) */}
            <div className="w-full lg:w-1/2 h-full p-6 flex flex-col justify-center items-center text-center">
              <h3 className="text-[16px] md:text-[18px] font-bold text-[#346739] mb-2">
                {feature.title}
              </h3>
              <p className="text-[12px] md:text-[14px] text-[#346739] leading-[22px] md:leading-[28px]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;