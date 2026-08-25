import React from 'react';
import { useNavigate } from "react-router-dom";
import whiteArrow from '../../assets/LandingPage/whiteArrow.png';
import greenArrow from '../../assets/LandingPage/greenArrow.png';
import heroBg from '../../assets/LandingPage/heroBg.png';

const HeroSection = () => {
  const handleScrollToFeatures = () => {
    const featuresSection = document.getElementById('powerful-features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    const token = localStorage.getItem('doctorToken');

    if (token) {
      navigate('/doctor-dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <section
      className="w-full flex flex-col justify-center py-12 px-12 overflow-hidden bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundPosition: 'center 20%'
      }}
    >

      {/* Container to restrict max width and align left content */}
      <div className="w-full mx-auto flex flex-col items-start justify-center">

        {/* Left Column: Headings & Buttons */}
        <div className="flex flex-col w-full lg:w-[55%] xl:w-[50%] items-center lg:items-start text-center lg:text-left z-10">

          {/* Main Heading */}
          <h1 className="w-full h-auto font-['Poppins'] font-semibold text-[36px] leading-[1.3] lg:leading-[1.5] mb-4 sm:mb-6">
            <span className="text-[#346739]">Focus on your patients.</span>
            <br className="hidden lg:block" />
            <span className="text-[#346739]">We'll </span>
            <span className="text-[#BD4444]">handle your</span>
            <br className="hidden lg:block" />
            <span className="text-[#BD4444]">appointments.</span>
          </h1>

          {/* Description */}
          <p className="w-full md:max-w-[520px] h-auto font-['Roboto'] font-normal text-[16px] sm:text-[18px] lg:leading-[36px] text-[#333333] mb-12 lg:mb-16">
            Whether you're a General Physician, Dentist, Pediatrician, Dermatologist, Orthopedic Surgeon, Cardiologist, Gynecologist, Physiotherapist, or any healthcare specialist - <span className="text-[#BD4444] font-semibold">HiCoreSlotify</span> helps you organize appointments, reduce no-shows, automate patient communication, and manage your practice effortlessly.
          </p>

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-[16px] w-full lg:w-auto justify-center lg:justify-start">

            {/* Book a Demo Button */}
            <div className="w-full sm:w-[262px] h-[52px] bg-[#346739] rounded-[16px] p-[4px] flex items-center justify-center cursor-pointer group">
              <button
                onClick={handleRegisterClick}
                className="w-full sm:w-[254px] h-[44px] bg-[#346739] rounded-[12px] flex items-center justify-center gap-[12px] shadow-[inset_0px_4px_4px_0px_#00000040] group-hover:bg-[#FFFFFF] transition-colors duration-300 cursor-pointer"
              >
                <span className="font-['Poppins'] font-semibold text-[16px] leading-[36px] text-white group-hover:text-[#346739] transition-colors duration-300">
                  Register Now
                </span>

                <img
                  src={whiteArrow}
                  alt="Right Arrow"
                  className="block group-hover:hidden w-[20px] h-[20px] object-contain"
                />

                <img
                  src={greenArrow}
                  alt="Right Arrow Hover"
                  className="hidden group-hover:block w-[20px] h-[20px] object-contain"
                />
              </button>
            </div>

            {/* Explore Features Button with Smooth Scroll */}
            <button
              onClick={handleScrollToFeatures}
              className="w-full sm:w-[262px] h-[52px] bg-[#FFFFFF] border border-[#346739] rounded-[16px] px-[16px] py-[8px] flex items-center justify-center gap-[12px] hover:bg-[#EBF0EB] hover:shadow-[inset_0px_4px_4px_0px_#00000040] transition-all duration-300 cursor-pointer"
            >
              <span className="font-['Poppins'] font-semibold text-[16px] leading-[36px] text-[#346739]">
                Explore Features
              </span>

              <img
                src={greenArrow}
                alt="Right Arrow"
                className="w-[20px] h-[20px] object-contain"
              />
            </button>

          </div>
        </div>

      </div>

    </section>
  );
};

export default HeroSection;