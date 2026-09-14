import React from 'react';
import feature1 from '../../assets/E-com/LandingPage/feature1.png';
import feature2 from '../../assets/E-com/LandingPage/feature2.png';
import feature3 from '../../assets/E-com/LandingPage/feature3.png';
import feature4 from '../../assets/E-com/LandingPage/feature4.png';
import feature5 from '../../assets/E-com/LandingPage/feature5.png';
import feature6 from '../../assets/E-com/LandingPage/feature6.png';
import feature7 from '../../assets/E-com/LandingPage/feature7.png';
import feature8 from '../../assets/E-com/LandingPage/feature8.png';
import feature9 from '../../assets/E-com/LandingPage/feature9.png';

const PowerfulFeatures = () => {
  const features = [
    {
      title: 'AI Sales Assistant',
      description: 'Answer customer inquiries automatically and keep conversations moving.',
      image: feature1,
    },
    {
      title: 'Instagram DM Automation',
      description: 'Respond to product inquiries without manually monitoring every message.',
      image: feature2,
    },
    {
      title: 'WhatsApp Commerce',
      description: 'Continue conversations and complete purchases through WhatsApp.',
      image: feature3,
    },
    {
      title: 'Payment Management',
      description: 'Guide customers through payment and keep transaction information organized.',
      image: feature4,
    },
    {
      title: 'Smart Product Catalogue',
      description: 'Manage products, prices, images, variants and availability in one place.',
      image: feature5,
    },
    {
      title: 'Product Recommendations',
      description: 'Help customers discover the right product based on their questions.',
      image: feature6,
    },
    {
      title: 'Order Management',
      description: 'Create, track and manage every order from one dashboard.',
      image: feature7,
    },
    {
      title: 'Shipping Management',
      description: 'Manage shipping details and keep customers updated about their orders.',
      image: feature8,
    },
    {
      title: 'Customer Management',
      description: 'Keep customer profiles, conversations and purchase history together.',
      image: feature9,
    },
  ];

  return (
    <section className="w-full bg-white flex justify-center items-center py-16">
      {/* Outer Container */}
      <div className="w-full px-4 sm:px-8 md:px-[64px] pb-[30px] lg:pb-[50px] flex flex-col items-center gap-[40px] lg:gap-[64px] max-w-[1440px]">
        
        {/* Section Title Header */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#346739] tracking-wider uppercase text-center font-['Poppins'] leading-[48px]">
            POWERFUL FEATURES OF HiCoreSlotify
          </h2>
          <div className="flex items-center mb-6 justify-center gap-1 mt-2 w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
            <span className="h-[1px] w-full bg-[#346739] flex-1"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
          </div>
        </div>

        {/* 3-Column Grid for 9 Features */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {features.map((feature, index) => (
            <div
              key={index}
              className="w-full bg-white border border-[#66BB6A] rounded-[16px] overflow-hidden flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              {/* Inner Box Upper Image - flush with top, left, and right */}
              <div className="w-full h-[164px] rounded-[16px] bg-gray-50 flex items-center justify-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover rounded-[16px]"
                />
              </div>

              {/* Below Image Topic & Description with padding */}
              <div className="flex flex-col items-center text-center p-4 sm:p-5 mt-2">
                <h3 className="font-['Roboto'] font-semibold text-[16px] leading-[36px] text-[#346739] mb-1">
                  {feature.title}
                </h3>
                <p className="font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#555555]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PowerfulFeatures;