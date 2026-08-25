import React from 'react';

import beforeImage from '../../assets/DayWith/before-hicore.png';
import afterImage from '../../assets/DayWith/after-hicore.png';

const beforeData = [
  'Endless phone calls',
  'Interrupted consultations',
  'Missed appointments',
  'Manual appointment registers',
  'Scheduling confusion',
  'Long patient waiting times',
];

const afterData = [
  'Patients book through WhatsApp',
  'Organized appointment calendar',
  'Automated reminders',
  'Fewer no-shows',
  'More productive consultations',
  'Happier patients',
];

const ADayWithHiCore = () => {
  return (
    <section className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pb-[80px] lg:pb-[164px] bg-white flex flex-col items-center overflow-hidden">

      {/* Title Section */}
      <div className="text-center mb-10 sm:mb-14 lg:mb-16 w-full flex flex-col items-center">
        <h2 className="font-['Poppins',_sans-serif] font-semibold text-[22px] sm:text-[26px] md:text-[28px] leading-[36px] sm:leading-[48px] text-[#346739] uppercase">
          A DAY WITH HiCoreSlotify
        </h2>

        <div className="flex items-center justify-center w-full max-w-[385px] mt-1">
          <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>

          <div className="flex-1 h-[1px] bg-[#346739]"></div>

          <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1500px] flex flex-col xl:flex-row items-center justify-center gap-10 lg:gap-12 xl:gap-8">

        {/* ================= LEFT SIDE ================= */}
        <div className="w-full max-w-[700px] flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8">

          {/* Before Image */}
          <div className="w-full md:w-[48%] max-w-[344.5px] h-[300px] sm:h-[340px] md:h-[376.15px] flex-shrink-0 relative z-20">
            <img
              src={beforeImage}
              alt="Doctor overwhelmed with paperwork"
              className="w-full h-full object-cover rounded-[16px]"
            />
          </div>

          {/* Before Box */}
          <div className="relative w-full md:w-[48%] max-w-[310px] h-[382px] bg-[#BD4444] rounded-[16px] p-[20px] flex flex-col flex-shrink-0 overflow-visible z-10">

            {/* ================= RED CENTER BRIDGE ================= */}
            <div
              className="
                hidden md:block
                absolute
                left-[-38px]
                top-1/2
                -translate-y-1/2
                w-[38px]
                h-[110px]
                bg-[#BD4444]
                z-[-1]
              "
            >

              {/* Top white curved cut */}
              <div
                className="
                  absolute
                  left-0
                  top-0
                  w-[38px]
                  h-[40px]
                  bg-white
                  rounded-br-[40px]
                "
              />

              {/* Bottom white curved cut */}
              <div
                className="
                  absolute
                  left-0
                  bottom-0
                  w-[38px]
                  h-[40px]
                  bg-white
                  rounded-tr-[40px]
                "
              />

            </div>

            {/* Header */}
            <h3 className="font-['Roboto',_sans-serif] font-semibold text-[18px] leading-[38px] text-white mb-2 ml-2 flex-shrink-0 relative z-10">
              Before HiCoreSlotify
            </h3>

            {/* Inner White Box */}
            <div className="w-full h-[288px] flex-shrink-0 bg-white rounded-[16px] p-[16px] flex flex-col justify-center overflow-hidden relative z-10">

              <ul className="flex flex-col justify-center gap-1">
                {beforeData.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-[8px] font-['Roboto',_sans-serif] font-normal text-[14px] sm:text-[16px] leading-[28px] sm:leading-[36px] text-[#BD4444]"
                  >
                    <span className="text-[#BD4444] text-[20px] leading-none mt-[4px] flex-shrink-0">
                      •
                    </span>

                    <span>{item}</span>
                  </li>
                ))}
              </ul>

            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="w-full max-w-[700px] flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8">

          {/* After Box */}
          <div className="relative w-full md:w-[48%] max-w-[331px] h-[382px] bg-[#346739] rounded-[16px] p-[20px] flex flex-col flex-shrink-0 overflow-visible z-10">

            {/* ================= GREEN CENTER BRIDGE ================= */}
            <div
              className="
                hidden md:block
                absolute
                right-[-38px]
                top-1/2
                -translate-y-1/2
                w-[38px]
                h-[110px]
                bg-[#346739]
                z-[-1]
              "
            >

              {/* Top white curved cut */}
              <div
                className="
                  absolute
                  right-0
                  top-0
                  w-[38px]
                  h-[40px]
                  bg-white
                  rounded-bl-[40px]
                "
              />

              {/* Bottom white curved cut */}
              <div
                className="
                  absolute
                  right-0
                  bottom-0
                  w-[38px]
                  h-[40px]
                  bg-white
                  rounded-tl-[40px]
                "
              />

            </div>

            {/* Header */}
            <h3 className="font-['Roboto',_sans-serif] font-semibold text-[18px] leading-[38px] text-white mb-2 ml-2 flex-shrink-0 relative z-10">
              After HiCoreSlotify
            </h3>

            {/* Inner White Box */}
            <div className="w-full h-[288px] flex-shrink-0 bg-white rounded-[16px] p-[16px] flex flex-col justify-center overflow-hidden relative z-10">

              <ul className="flex flex-col justify-center gap-1">
                {afterData.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-[8px] font-['Roboto',_sans-serif] font-normal text-[14px] sm:text-[16px] leading-[28px] sm:leading-[36px] text-[#346739]"
                  >
                    <span className="text-[#346739] text-[20px] leading-none mt-[4px] flex-shrink-0">
                      •
                    </span>

                    <span>{item}</span>
                  </li>
                ))}
              </ul>

            </div>
          </div>

          {/* After Image */}
          <div className="w-full md:w-[48%] max-w-[344.5px] h-[300px] sm:h-[340px] md:h-[376.15px] flex-shrink-0 relative z-20">
            <img
              src={afterImage}
              alt="Doctor happy using digital system"
              className="w-full h-full object-cover rounded-[16px]"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

export default ADayWithHiCore;