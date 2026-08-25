import React from 'react';
import { useNavigate } from "react-router-dom";
import whiteArrow from '../../assets/LandingPage/whiteArrow.png';
import themeArrow from '../../assets/LandingPage/greenArrow.png'; 
import heroBg from '../../assets/LandingPage/ecommerceImg.png';

const HeroSection = () => {
  const handleScrollToFeatures = () => {
    const featuresSection = document.getElementById('powerful-features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigate = useNavigate();

  // Removed the token check condition. Now it directly navigates to the register page.
  const handleRegisterClick = () => {
    navigate('/ecommerce-register');
  };

  return (
    <section
      className="w-full min-h-[85vh] flex flex-col justify-center py-16 px-6 lg:px-16 overflow-hidden bg-cover bg-no-repeat font-sans relative"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {/* Container aligned to push content to the far right on desktop */}
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center lg:items-end justify-center">

        {/* Content Box with a clear glassmorphic backdrop for 100% text readability */}
        <div className="flex flex-col w-full lg:w-[48%] xl:w-[45%] items-center lg:items-start text-center lg:text-left z-10 bg-white/85 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-white/60 shadow-xl">

          {/* Main E-commerce Heading */}
          <h1 className="w-full h-auto font-extrabold text-[32px] sm:text-[38px] leading-[1.25] mb-4 tracking-tight">
            <span className="text-gray-900">Focus on your products.</span>
            <br className="hidden lg:block" />
            <span className="text-gray-900">We'll </span>
            <span className="text-purple-700">handle your</span>
            <br className="hidden lg:block" />
            <span className="text-purple-700">storefront.</span>
          </h1>

          {/* E-commerce Description */}
          <p className="w-full h-auto font-medium text-[15px] sm:text-[17px] leading-[26px] sm:leading-[30px] text-gray-700 mb-8">
            Whether you're selling fashion, electronics, home goods, cosmetics, or digital products — <span className="text-purple-700 font-bold">HiCoreSlotify</span> helps you manage inventory, process orders, engage with customers, and scale your online business effortlessly.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">

            {/* Register Button */}
            <button
              onClick={handleRegisterClick}
              className="w-full sm:w-[200px] h-[48px] bg-purple-700 hover:bg-purple-800 rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-[15px] shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <span>Register Now</span>
              <img
                src={whiteArrow}
                alt="Right Arrow"
                className="w-[16px] h-[16px] object-contain"
              />
            </button>

            {/* Explore Features Button with Hover Effect */}
            <button
              onClick={handleScrollToFeatures}
              className="group w-full sm:w-[200px] h-[48px] bg-white hover:bg-red-50 border-2 border-purple-700 hover:border-red-600 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm"
            >
              {/* Default Text (Visible when not hovered) */}
              <div className="flex items-center gap-2 group-hover:hidden">
                <span className="text-purple-700 font-semibold text-[15px]">
                  Explore Features
                </span>
                <img
                  src={themeArrow}
                  alt="Right Arrow"
                  className="w-[16px] h-[16px] object-contain"
                />
              </div>

              {/* Hover Text (Visible only on hover) */}
              <span className="hidden group-hover:block text-red-600 font-bold text-[15px]">
                Coming soon
              </span>
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;