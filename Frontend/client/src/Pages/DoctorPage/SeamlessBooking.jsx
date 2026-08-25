import React, { useState, useRef } from 'react';
// Replace with your actual video path and thumbnail image path from the assets folder
import demoVideo from '../../assets/seamless-demo-video.mp4';
import videoThumbnail from '../../assets/seamless-image.png';

const SeamlessBooking = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const steps = [
    {
      stepNumber: 'STEP 1',
      title: 'Patient sends "Hi" on WhatsApp',
    },
    {
      stepNumber: 'STEP 2',
      title: 'Choose consultation',
    },
    {
      stepNumber: 'STEP 3',
      title: 'Select doctor',
    },
    {
      stepNumber: 'STEP 4',
      title: 'Choose preferred date',
    },
    {
      stepNumber: 'STEP 5',
      title: 'Select available time slot',
    },
    {
      stepNumber: 'STEP 6',
      title: 'Complete secure payment',
    },
    {
      stepNumber: 'STEP 7',
      title: 'Receive instant appointment confirmation',
    },
    {
      stepNumber: 'STEP 8',
      title: 'Automated reminder sent before the visit',
    },
  ];

  return (
    <section className="w-full bg-white flex justify-center items-center py-5">
      {/* Outer Container */}
      <div className="w-full px-4 sm:px-8 md:px-[64px] pb-[100px] lg:pb-[164px] flex flex-col items-center gap-[40px] lg:gap-[64px]">
        
        {/* Section Title Header */}
        <div className="flex flex-col items-center w-full">
          <h2 className="font-['Poppins',_sans-serif] font-semibold text-xl sm:text-2xl md:text-[28px] leading-tight md:leading-[48px] text-[#346739] tracking-wider uppercase text-center">
            ONE SEAMLESS BOOKING EXPERIENCE IN LESS THAN A MINUTE
          </h2>
          {/* Accent underline: 910px max width */}
          <div className="flex items-center justify-center gap-1 mt-1 w-full max-w-[910px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
            <div className="h-[1px] bg-[#346739] flex-1"></div>
            <span className="w-[6px] h-[6px] rounded-full bg-[#346739] flex-shrink-0"></span>
          </div>
        </div>

        {/* 2-Column Split Content */}
        <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[40px] xl:gap-[64px] items-center justify-items-center">
          
          {/* Left Side: Thumbnail Image & Video perfectly fitted to container */}
          <div 
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            className="flex justify-center items-center w-full lg:max-w-[616px] h-auto lg:h-[694px] relative cursor-pointer group bg-white"
          >
            {/* Thumbnail Image shown when video is not playing */}
            {!isPlaying && currentTime === 0 && (
              <div 
                onClick={handleVideoToggle}
                className="absolute inset-0 z-20 flex items-center justify-center bg-white"
              >
                <img 
                  src={videoThumbnail} 
                  alt="Video Thumbnail Preview" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-transparent flex items-center justify-center transition-opacity">
                  <div className="w-[80px] h-[80px] rounded-full bg-[#346739] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <span className="text-white text-[32px] ml-1">&#9658;</span>
                  </div>
                </div>
              </div>
            )}

            <video 
              ref={videoRef}
              src={demoVideo}
              className="w-full h-full object-contain bg-white"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={handleVideoToggle}
            />

            {/* Play/Pause Center Overlay Button when paused mid-way */}
            {!isPlaying && currentTime > 0 && (
              <div 
                onClick={handleVideoToggle}
                className="absolute inset-0 flex items-center justify-center transition-opacity z-20"
              >
                <div className="w-[80px] h-[80px] rounded-full bg-[#346739] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-white text-[32px] ml-1">&#9658;</span>
                </div>
              </div>
            )}

            {/* Custom Video Controls Bar (Appears on Hover or When Paused) */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 flex items-center gap-4 transition-opacity duration-300 z-30 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Play/Pause Button in Control Bar */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleVideoToggle(); }} 
                className="text-white bg-[#346739] hover:bg-[#2c5730] w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow transition-colors cursor-pointer"
              >
                {isPlaying ? '❚❚' : '▶'}
              </button>

              {/* Current Time */}
              <span className="text-[#346739] bg-white/80 px-2 py-0.5 rounded text-xs sm:text-sm font-['Roboto'] font-semibold min-w-[45px]">
                {formatTime(currentTime)}
              </span>

              {/* Seeking Slider */}
              <input 
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 accent-[#346739] cursor-pointer h-2 bg-gray-300 rounded-lg"
              />

              {/* Total Duration */}
              <span className="text-[#346739] bg-white/80 px-2 py-0.5 rounded text-xs sm:text-sm font-['Roboto'] font-semibold min-w-[45px]">
                {formatTime(duration)}
              </span>

            </div>
          </div>

          {/* Right Side: Step Cards List */}
          <div className="flex flex-col gap-[16px] w-full lg:max-w-[650px] lg:h-[784px] justify-center ml-2 sm:ml-4 lg:ml-0">
            {steps.map((step, index) => (
              <div
                key={index}
                className="
                  w-full max-w-[638px] h-[84px] 
                  bg-white rounded-[16px] 
                  py-[8px] relative flex items-center 
                  shadow-sm transition-all duration-300 
                  cursor-pointer group hover:shadow-md 
                "
              >
                {/* Step Pill / Badge (Hover triggered by parent 'group') */}
                <div 
                  className="
                    absolute left-0 w-[119px] h-[44px] 
                    flex items-center justify-center gap-[5px] 
                    px-[20px] sm:px-[36px] rounded-l-[16px] rounded-r-[100px] 
                    bg-[#F1DEC440] text-[#BD4444] font-bold text-[13px] tracking-wide 
                    shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25)] 
                    transition-all duration-300 z-10
                    group-hover:-translate-y-1 group-hover:scale-105 
                    group-hover:shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.25),0px_6px_12px_0px_rgba(128,128,128,0.45)]
                  "
                >
                  {step.stepNumber}
                </div>

                {/* Step Content */}
                <h3 className="font-['Roboto',_sans-serif] text-[15px] sm:text-[17px] font-semibold text-[#346739] pl-[130px] sm:pl-[140px] pr-4 w-full">
                  {step.title}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default SeamlessBooking;