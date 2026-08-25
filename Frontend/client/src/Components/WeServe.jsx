import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { industriesData } from '../data/industriesData';

const WeServe = () => {
  const navigate = useNavigate();
  
  // Create a ref for the details section
  const detailsRef = useRef(null);

  const [selectedIndustry, setSelectedIndustry] = useState(industriesData[0]);
  const [showAll, setShowAll] = useState(false);

  const displayedIndustries = showAll ? industriesData : industriesData.slice(0, 10);

  const handleNavigate = () => {
    if (selectedIndustry?.path) {
      navigate(selectedIndustry.path);
    }
  };

  // Handle click and scroll
  const handleIndustryClick = (item) => {
    setSelectedIndustry(item);
    
    // Smoothly scroll to the details box
    if (detailsRef.current) {
      setTimeout(() => {
        detailsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' // 'center' keeps it nicely framed in the viewport
        });
      }, 100); // Small delay ensures UI updates before scrolling
    }
  };

  return (
    <section className="w-full flex flex-col items-center pt-10 pb-16 px-4 sm:px-8 overflow-hidden bg-white">
      <div className="w-full max-w-[1440px] flex flex-col items-center gap-8 md:gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-[#346739] uppercase text-center">
            INDUSTRIES WE SERVE
          </h2>
          <div className="flex items-center justify-center gap-1 mt-1 w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
            <span className="h-[1px] bg-[#346739] flex-1"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#346739]"></span>
          </div>
        </div>

        {/* Top Cards Section & View More Link */}
        <div className="w-full flex flex-col items-end gap-3">
          <div 
            className={`w-full gap-4 pb-2 pt-2 px-1 transition-all duration-300 ${
              showAll
                ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 justify-items-center'
                : 'flex items-center justify-start lg:grid lg:grid-cols-10 overflow-x-auto lg:overflow-x-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
            }`}
          >
            {displayedIndustries.map((item, index) => {
              const isSelected = selectedIndustry === item;

              return (
                <button
                  key={item.id ? `${item.id}-${index}` : index}
                  onClick={() => handleIndustryClick(item)} // Use new handler here
                  className={`flex-shrink-0 p-2 w-full max-w-[113.2px] bg-white h-[113.2px] rounded-[16px] overflow-hidden border transition-all duration-300 cursor-pointer mx-auto relative hover:-translate-y-1 hover:z-20 ${
                    isSelected
                      ? 'border-[#66BB6A] bg-white shadow-[4px_4px_4px_0px_rgba(52,103,57,0.5)] z-10'
                      : 'border-[#66BB6A] bg-white hover:border-[#66BB6A] hover:shadow-[4px_4px_4px_0px_rgba(52,103,57,0.5)]'
                  }`}
                >
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className="w-full h-full object-cover block" 
                  />
                </button>
              );
            })}
          </div>

          {/* View More / View Less Toggle Button */}
          {industriesData.length > 10 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1 text-[14px] font-medium text-[#66BB6A] hover:text-[#346739] transition-colors self-end pr-2 cursor-pointer"
            >
              {showAll ? 'View Less <<' : 'View More >>'}
            </button>
          )}
        </div>

        {/* --- DOUBLE-CONTAINER STRUCTURE WITH MATCHED ROUNDING & ALIGNED BADGE --- */}
        {/* Attach the ref here so the browser knows where to scroll */}
        <div ref={detailsRef} className="w-full relative pt-2">
          
          {/* 1. Green Outer Border Frame */}
          <div className="absolute inset-0 top-[80px] border-b-2 border-l-2 border-r-2 border-[#346739] rounded-b-[140px] pointer-events-none z-0" />

          {/* 2. Overlapping Green Badge */}
          <div 
            className="absolute left-0 top-[80px] z-20 text-white font-bold text-[16px] sm:text-[20px] tracking-wide px-8 sm:px-12 py-3.5 rounded-r-full border-l-4 border-[#28522d]"
            style={{
              backgroundColor: '#346739',
              boxShadow: 'inset 4px 4px 4px 0px #00000080, 10px 10px 10px 0px #00000040'
            }}
          >
            {selectedIndustry.title}
          </div>

          {/* 3. Inner White Content Box */}
          <div className="relative z-10 m-3 sm:m-6 bg-white rounded-t-[18px] rounded-b-[130px] border border-[#D9D9D9] shadow-[4px_4px_4px_0px_#00000040] overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[480px]">
            
            {/* Left Column: Text Content */}
            <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 pl-8 sm:pl-14 lg:pl-16 flex flex-col justify-center items-start gap-6 pt-24 lg:pt-16">
              
              <p 
                className="text-[15px] mt-8 sm:text-[17px] leading-[26px] sm:leading-[32px] text-[#346739] font-medium max-w-[480px]"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                {selectedIndustry.description}
              </p>

              <h4 className="text-[18px] sm:text-[20px] font-bold text-[#346739]">
                {selectedIndustry.bookingType}
              </h4>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-3">
                {selectedIndustry.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-5 py-2.5 rounded-full border border-[#BD4444] text-[#BD4444] text-[13px] sm:text-[14px] font-medium bg-[#F8ECEC40]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <div className="relative mt-2 w-auto lg:w-[70%] group">
                <button
                  onClick={() => {
                    if (selectedIndustry.status === "Ongoing") {
                      handleNavigate();
                    }
                  }}
                  disabled={selectedIndustry.status === "Pending"}
                  className={`w-full py-3.5 px-6 bg-[#346739] rounded-xl flex items-center justify-center gap-3 shadow-[0px_4px_4px_0px_#00000040] border-2 border-transparent group transition-all duration-300 ${
                    selectedIndustry.status === "Ongoing"
                      ? "hover:shadow-[0px_4px_4px_0px_#00000040,inset_0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-white hover:border-[#346739] cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`font-semibold text-[15px] sm:text-[16px] transition-colors duration-300 ${
                      selectedIndustry.status === "Ongoing"
                        ? "text-white group-hover:text-[#346739]"
                        : "text-white"
                    }`}
                  >
                    {selectedIndustry.ctaText}
                  </span>

                  {/* Arrows - Only for Ongoing */}
                  {selectedIndustry.status === "Ongoing" && (
                    <>
                      {/* White Arrows */}
                      <span className="block group-hover:hidden text-white font-bold transition-colors duration-300">
                        &gt;&gt;
                      </span>

                      {/* Green Arrows */}
                      <span className="hidden group-hover:block text-[#346739] font-bold transition-colors duration-300">
                        &gt;&gt;
                      </span>
                    </>
                  )}

                  {/* Coming Soon - Pending */}
                  {selectedIndustry.status === "Pending" && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#346739] text-white font-semibold text-[15px] sm:text-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      COMING SOON
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="w-full lg:w-1/2 min-h-[300px] sm:min-h-[400px] lg:min-h-full relative overflow-hidden">
              <img
                src={selectedIndustry.image}
                alt={selectedIndustry.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default WeServe;