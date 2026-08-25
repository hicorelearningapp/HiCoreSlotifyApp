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

        {/* 2-Column Split Content: 30% Left, 70% Right */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[20%_80%] gap-8 lg:gap-[40px] items-stretch">
          
          {/* Left Side: Sequence of Icons with Pure CSS Dashed Line & Arrowhead */}
          <div className="hidden lg:flex flex-col items-center justify-around w-full py-4">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex justify-center items-center w-full my-2">
                  <img
                    src={step.icon}
                    alt={`Step ${index + 1} Icon`}
                    className="w-[170px] sm:w-[170px] h-[90px] sm:h-[150px]"
                  />
                </div>
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center justify-center my-1 relative h-[42px]">
                    {/* Pure CSS Dashed Vertical Line */}
                    <div className="w-[2px] h-[32px] border-r-2 border-dashed border-[#346739]"></div>
                    {/* Pure CSS Down Arrowhead */}
                    <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-[#346739] transform rotate-45 -mt-[5px]"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right Side: Step Cards List */}
          <div className="flex flex-col gap-4 sm:gap-5 w-full justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className="w-full bg-white border border-[#F1DEC4] rounded-[20px] p-5 sm:p-6 relative flex flex-col justify-center items-start shadow-sm overflow-visible"
              >
                {/* Step Pill / Badge */}
                <div 
                  className="w-[119px] h-[44px] flex items-center justify-center gap-[5px] pt-[4px] pr-[36px] pb-[4px] pl-[36px] rounded-r-[100px] border-l-0 text-[#BD4444] font-bold text-[13px] tracking-wide mb-3 -ml-5 sm:-ml-6 relative z-10 cursor-pointer bg-[#F1DEC440] shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:z-20 hover:shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25),0px_6px_12px_0px_rgba(128,128,128,0.45)]"
                >
                  {step.stepNumber}
                </div>

                {/* Step Content */}
                <h3 className="text-[17px] sm:text-[18px] mt-1 font-semibold text-[#346739] mb-3">
                  {step.title}
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#555555] font-normal leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default SeamlessBooking;