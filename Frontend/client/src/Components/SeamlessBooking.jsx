import React from 'react';
// Import your step icons from the assets folder (downArrow asset removed)
import step1Icon from '../assets/LandingPage/step1Icon.png';
import step2Icon from '../assets/LandingPage/step2Icon.png';
import step3Icon from '../assets/LandingPage/step3Icon.png';
import step4Icon from '../assets/LandingPage/step4Icon.png';
import step5Icon from '../assets/LandingPage/step5Icon.png';
import step6Icon from '../assets/LandingPage/step6Icon.png';

const SeamlessBooking = () => {
  const steps = [
    {
      stepNumber: 'STEP 1',
      title: "Send 'Hi' on WhatsApp",
      description: 'Start your booking with a simple WhatsApp message.',
      icon: step1Icon,
    },
    {
      stepNumber: 'STEP 2',
      title: 'Greeting Message',
      description: 'Receive an instant greeting from our AI Assistant.',
      icon: step2Icon,
    },
    {
      stepNumber: 'STEP 3',
      title: 'Main Menu',
      description: 'Select exactly what you need in just a few taps.',
      icon: step3Icon,
    },
    {
      stepNumber: 'STEP 4',
      title: 'Select Professional, Date & Time',
      description: 'Choose your service, professional, date, and time.',
      icon: step4Icon,
    },
    {
      stepNumber: 'STEP 5',
      title: 'Confirmation Message',
      description: 'Review your details and confirm in seconds.',
      icon: step5Icon,
    },
    {
      stepNumber: 'STEP 6',
      title: 'Booking Successful',
      description: 'Get instant confirmation and automated reminders on WhatsApp.',
      icon: step6Icon,
    },
  ];

  return (
    <section className="w-full bg-white flex justify-center items-center py-16">
      {/* Outer Container */}
      <div className="w-full px-4 sm:px-8 md:px-[64px] pb-[30px] lg:pb-[50px] flex flex-col items-center gap-[40px] lg:gap-[64px] max-w-[1440px]">
        
        {/* Section Title Header */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#346739] tracking-wider uppercase text-center">
            ONE SEAMLESS BOOKING EXPERIENCE, START TO FINISH
          </h2>
          <div className="flex items-center mb-6 justify-center gap-1 mt-2 w-full ">
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
            <span className="h-[1px] w-full bg-[#346739] flex-1"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
          </div>
        </div>

        {/* Responsive Grid Layout for Steps (One line on extra large screens) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-4 gap-y-10 lg:gap-y-12 items-stretch mt-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col w-full h-full">
              
              {/* Icon Container above the card */}
              <div className="flex justify-center items-center h-[90px] sm:h-[110px] mb-4 sm:mb-6">
                <img
                  src={step.icon}
                  alt={`Step ${index + 1} Icon`}
                  className="max-h-full max-w-[130px] object-contain"
                />
              </div>

              {/* Card Container (Original Design Maintained) */}
              <div
                className="w-full h-full bg-white border border-[#F1DEC4] rounded-[20px] p-5 sm:p-6 relative flex flex-col justify-start items-start shadow-sm overflow-visible transition-all duration-300 hover:shadow-md hover:border-[#346739]/40 hover:-translate-y-1"
              >
                {/* Step Pill / Badge */}
                <div 
                  className="w-[119px] h-[44px] flex items-center justify-center gap-[5px] pt-[4px] pr-[36px] pb-[4px] pl-[36px] rounded-r-[100px] border-l-0 text-[#BD4444] font-bold text-[13px] tracking-wide mb-3 -ml-5 sm:-ml-6 relative z-10 cursor-pointer bg-[#F1DEC440] shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:z-20 hover:shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25),0px_6px_12px_0px_rgba(128,128,128,0.45)] whitespace-nowrap"
                >
                  {step.stepNumber}
                </div>

                {/* Step Content */}
                <h3 className="text-[17px] sm:text-[18px] mt-1 font-semibold text-[#346739] mb-3 leading-tight">
                  {step.title}
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#555555] font-normal leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SeamlessBooking;