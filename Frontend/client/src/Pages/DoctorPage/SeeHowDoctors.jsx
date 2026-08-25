import React, { useState, useRef } from 'react';
import tickIcon from '../../assets/LandingPage/tickIcon.png';
import demoVideo from '../../assets/LandingPage/doctor-page-video.mp4';

const SeeHowDoctors = () => {
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

  return (
    <section className="w-full min-h-screen bg-white flex flex-col items-center pt-12 md:pt-16 md:pb-24 px-10 overflow-hidden">
      
      {/* Video Demonstration Section */}
      <div className="w-full p-2 flex flex-col items-center my-12 z-10">
        <div className="flex flex-col items-center mb-10">
          <h2 className="font-['Poppins'] font-semibold text-[24px] sm:text-[28px] text-[#346739] text-center mb-2 uppercase">
            SEE HOW HiCoreSlotify SIMPLIFIES YOUR PRACTICE
          </h2>

          <div className="flex items-center w-full">
            <span className="w-2 h-2 rounded-full bg-[#346739]"></span>
            <div className="flex-1 h-[2px] bg-[#346739]"></div>
            <span className="w-2 h-2 rounded-full bg-[#346739]"></span>
          </div>
        </div>

        <div
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          className="w-full h-auto sm:h-[670px] rounded-[8px] mt-10 m-2 sm:m-0 overflow-hidden relative cursor-pointer shadow-lg border border-[#D9D9D9] group"
        >
          <video
            ref={videoRef}
            src={demoVideo}
            className="w-full h-auto sm:h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={handleVideoToggle}
          />

          {/* Play/Pause Center Overlay Button */}
          {!isPlaying && (
            <div
              onClick={handleVideoToggle}
              className="absolute inset-0 flex items-center justify-center transition-opacity"
            >
              <div className="w-[50px] h-[50px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#346739] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <span className="text-white text-[22px] sm:text-[32px] ml-1">
                  &#9658;
                </span>
              </div>
            </div>
          )}

          {/* Custom Video Controls Bar
              Hidden on mobile, unchanged on sm and above */}
          <div
            className={`hidden sm:flex absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 items-center gap-4 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            
            {/* Play/Pause Button in Control Bar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVideoToggle();
              }}
              className="text-white bg-[#346739] hover:bg-[#2c5730] w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow transition-colors cursor-pointer"
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>

            {/* Current Time */}
            <span className="text-white text-xs sm:text-sm font-['Roboto'] min-w-[45px]">
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
            <span className="text-white text-xs sm:text-sm font-['Roboto'] min-w-[45px]">
              {formatTime(duration)}
            </span>

          </div>
        </div>
      </div>

      {/* Bottom Section: 4 Feature Boxes */}
      <div className="w-full p-2 flex flex-wrap justify-center items-center gap-[25px] mt-4 lg:mt-12 z-10">
        {[
          'Grow Your Practice',
          '24x7 AI Receptionist',
          'Never Miss Any Patient',
          'Secure & Reliable'
        ].map((feature, index) => (
          <div
            key={index}
            className="
              w-full sm:w-[313px] h-[134px]
              rounded-[16px] border border-[#D9D9D9] bg-[#F8ECEC33]
              pt-[16px] pr-[8px] pb-[16px] pl-[8px]
              flex flex-col items-center justify-center gap-[16px]
              shadow-[inset_4px_4px_4px_0px_#00000040]
              transition-shadow
            "
          >
            <img
              src={tickIcon}
              alt="Tick Icon"
              className="w-[62px] h-[48px] object-contain"
            />

            <p className="font-['Roboto'] font-normal text-[16px] leading-[36px] text-center text-[#346739] m-0">
              {feature}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
};

export default SeeHowDoctors;