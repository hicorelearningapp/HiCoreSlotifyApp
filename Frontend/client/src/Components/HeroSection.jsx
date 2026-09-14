import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Assets for the Hero Top Section (from AppointmentHero)
import heroImage from "../assets/LandingPage/appointment-hero.png";
import whiteArrow from "../assets/LandingPage/whiteArrow.png";
import greenArrow from "../assets/LandingPage/greenArrow.png";

// Assets for the Video & Features Section (from original HeroSection)
import tickIcon from '../assets/LandingPage/tickIcon.png';
import demoVideo from '../assets/LandingPage/book-demo-video.mp4';

const HeroButton = ({ children, onClick, variant }) => {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      className={`group flex h-[44px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[14px] border border-[#346739] px-3 no-underline transition-all duration-300 sm:h-[48px] sm:gap-3 sm:px-4 lg:h-[52px] lg:rounded-[16px] ${
        isPrimary
          ? "bg-[#346739] text-white shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)] hover:bg-white hover:text-[#346739]"
          : "bg-white text-[#346739] hover:bg-[#346739] hover:text-white"
      }`}
    >
      <span className="truncate text-[12px] font-semibold sm:text-[14px] lg:text-[16px]">
        {children}
      </span>

      <span className="relative h-4 w-4 shrink-0 sm:h-5 sm:w-5">
        {/* Default arrow */}
        <img
          src={isPrimary ? whiteArrow : greenArrow}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full object-contain opacity-100 transition-opacity duration-300 group-hover:opacity-0"
        />

        {/* Hover arrow */}
        <img
          src={isPrimary ? greenArrow : whiteArrow}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </span>
    </button>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  const handleScrollToIndustries = () => {
    const industriesSection = document.getElementById('industries');
    if (industriesSection) {
      industriesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookDemoClick = () => {
    navigate('/book-demo');
  };

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
    <div className="w-full bg-white flex flex-col items-center overflow-hidden">
      
      {/* Top Section: Appointment Hero */}
      <section
        id="home"
        className="relative min-h-[430px] w-full overflow-hidden bg-white sm:min-h-[480px] lg:min-h-[554px]"
      >
        {/* Hero background */}
        <img
          src={heroImage}
          alt="AI-powered WhatsApp appointment-booking platform"
          className="absolute inset-0 block h-full w-full object-cover object-center"
        />

        {/* Overlay for readability on narrow screens */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent sm:via-white/65 lg:via-white/30" />

        <div className="relative z-10 mx-auto flex min-h-[430px] w-full max-w-[1440px] items-center px-4 py-8 sm:min-h-[480px] sm:px-8 sm:py-10 lg:min-h-[554px] lg:px-16">
          {/* Content */}
          <div className="flex w-[62%] min-w-0 max-w-[518px] flex-col items-start sm:w-[54%] lg:w-[40%]">
            {/* Heading */}
            <h1 className="m-0 text-[18px] font-semibold leading-[1.5] text-[#346739] min-[400px]:text-[20px] sm:text-[24px] sm:leading-[1.6] lg:text-[28px] lg:leading-[48px]">
              Stop Managing Bookings.{" "}
              <span className="text-[#BD4444]">
                Start Growing Your Business
              </span>
              .
            </h1>

            {/* Description */}
            <div className="mt-2 text-[11px] font-normal leading-[20px] text-[#828282] min-[400px]:text-[12px] sm:text-[14px] sm:leading-7 lg:text-[18px] lg:leading-[38px]">
              <p className="m-0">
                AI-powered appointment booking that lets your customers book
                through WhatsApp, while you manage schedules, staff, payments and
                appointments effortlessly—
                <span className="text-[#BD4444]">
                  all from one platform
                </span>
                .
              </p>

              <p className="mb-0 mt-1 hidden min-[430px]:block">
                Automate appointment booking, reminders and customer communication
                with AI-powered WhatsApp scheduling.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex w-full flex-col gap-2 min-[430px]:flex-row sm:mt-6 sm:gap-3 lg:mt-7 lg:gap-4">
              <HeroButton onClick={handleBookDemoClick} variant="primary">
                Book a Demo
              </HeroButton>

              <HeroButton onClick={handleScrollToIndustries} variant="secondary">
                Explore Industries
              </HeroButton>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Video Demonstration & Features */}
      <section className="w-full max-w-[1440px] flex flex-col items-center pt-12 pb-24 px-4 sm:px-8 z-10">
        
        {/* Video Demonstration Section */}
        <div className="w-full p-2 flex flex-col items-center my-12 z-10">
          <div className="flex flex-col items-center mb-10">
            <h2 className="font-['Poppins'] font-semibold text-[24px] sm:text-[28px] text-[#346739] text-center mb-2">
              SEE HOW HiCoreSlotify WORKS
            </h2>
            <div className="flex items-center w-full">
              <span className="w-2 h-2 rounded-full bg-[#346739]"></span>
              <div className="flex-1 h-[2px] bg-[#346739]"></div>
              <span className="w-2 h-2 rounded-full bg-[#346739]"></span>
            </div>
          </div>

          {/* Video Container */}
          <div 
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            className="w-full h-[220px] sm:h-[670px] rounded-[8px] overflow-hidden relative cursor-pointer shadow-lg border border-[#D9D9D9] group"
          >
            <video 
              ref={videoRef}
              src={demoVideo}
              className="w-full h-full object-cover"
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
                <div className="w-[80px] h-[80px] rounded-full bg-[#346739] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-white text-[32px] ml-1">&#9658;</span>
                </div>
              </div>
            )}

            {/* Custom Video Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex items-center gap-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Play/Pause Button in Control Bar */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleVideoToggle(); }} 
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

        {/* 4 Feature Boxes */}
        <div className="w-full p-2 flex flex-wrap justify-center items-center gap-[25px] mt-4 lg:mt-12 z-10">
          {[
            '99.9% Platform Availability',
            '24x7 AI Receptionist',
            'Supports Multiple Industries',
            'Enterprise Ready'
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
    </div>
  );
};

export default HeroSection;