import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import whiteArrow from '../assets/LandingPage/whiteArrow.png';
import greenArrow from '../assets/LandingPage/greenArrow.png';
import mobilePic from '../assets/LandingPage/mobilePic.png';
import curvedArrow from '../assets/LandingPage/curvedArrow.png';
import tickIcon from '../assets/LandingPage/tickIcon.png';
import demoVideo from '../assets/LandingPage/book-demo-video.mp4';

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
    <section className="w-full min-h-screen bg-white flex flex-col items-center pt-12 md:pt-16 pb-24 px-4 sm:px-8 overflow-hidden">
      
      {/* Top Section: Text & Mobile Image */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1440px] mb-12 md:mb-16 gap-12 lg:gap-8">
        
        {/* Left Column: Headings & Buttons */}
        <div className="flex flex-col w-full max-w-[650px] items-center lg:items-start text-center lg:text-left z-10">
          
          {/* Main Heading */}
          <h1 className="w-full h-auto font-['Poppins'] font-semibold text-[36px] sm:text-[36px] lg:text-[36px] leading-[1.3] lg:leading-[68px] mb-6">
            <span className="text-[#BD4444]">AI Appointment Scheduling Software</span>{' '}
            <span className="text-[#346739]">for Service Businesses | HiCore Slotify</span>
          </h1>

          {/* Description */}
          <p className="w-full font-['Roboto'] font-normal text-[18px] sm:text-[18px] leading-[1.6] lg:leading-[38px] text-[#346739] mb-10">
            Whether it's appointments, reservations, consultations, or services, Slotify makes every booking effortless. Automate bookings, simplify scheduling, delight customers, and grow your business - all from{' '}
            <span className="text-[#BD4444]">one intelligent platform.</span>
          </p>

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-[16px] w-full lg:w-auto justify-center lg:justify-start">
            
            {/* Book a Demo Button */}
            <div 
              onClick={handleBookDemoClick}
              className="w-full sm:w-[262px] h-[52px] bg-[#346739] rounded-[16px] p-[4px] flex items-center justify-center cursor-pointer group"
            >
              <button className="w-full sm:w-[254px] h-[44px] bg-[#346739] rounded-[12px] flex items-center justify-center gap-[12px] shadow-[inset_0px_4px_4px_0px_#00000040] group-hover:bg-[#FFFFFF] transition-colors duration-300 cursor-pointer pointer-events-none">
                <span className="font-['Poppins'] font-semibold text-[16px] leading-[36px] text-white group-hover:text-[#346739] transition-colors duration-300">
                  Book a Demo
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

            {/* Explore Industries Button with Smooth Scroll */}
            <button 
              onClick={handleScrollToIndustries}
              className="w-full sm:w-[262px] h-[52px] bg-[#FFFFFF] border border-[#346739] rounded-[16px] px-[16px] py-[8px] flex items-center justify-center gap-[12px] hover:bg-[#EBF0EB] hover:shadow-[inset_0px_4px_4px_0px_#00000040] transition-all duration-300 cursor-pointer"
            >
              <span className="font-['Poppins'] font-semibold text-[16px] leading-[36px] text-[#346739]">
                Explore Industries
              </span>
              <img 
                src={greenArrow} 
                alt="Right Arrow" 
                className="w-[20px] h-[20px] object-contain" 
              />
            </button>
            
          </div>
        </div>

        {/* Right Column: Mobile Device & Floating Text */}
        <div className="relative w-full lg:w-auto flex items-center justify-center mt-4 lg:mt-0 lg:mr-[160px] xl:mr-[240px] mb-[-140px] sm:mb-[-100px] md:mb-[-60px] lg:mb-0">
          
          <div className="relative w-[300px] h-[320px] sm:h-[400px] md:h-[450px] lg:h-[550px] flex items-center justify-center scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top lg:origin-center">
            
            <img 
              src={mobilePic} 
              alt="HiCoreSlotify on WhatsApp" 
              className="w-[249.81px] h-[505px] rotate-[-8deg] object-contain relative z-10"
            />

            {/* Left Side Floating Text */}
            <div className="absolute left-[-140px] xl:left-[-120px] top-[150px] flex flex-col items-center font-['Shantell_Sans'] text-[16px] leading-[36px] z-20">
              <span className="font-bold text-[#346739]">HiCoreSlotify</span>
              <span className="font-normal text-[#66BB6A]">runs your</span>
              <span className="font-normal text-[#66BB6A]">entire</span>
              <span className="font-normal text-[#66BB6A]">booking flow</span>
              <span className="font-normal text-[#66BB6A]">over</span>
              <span className="font-bold text-[#346739]">WHATSAPP</span>
            </div>

            {/* Top Left Curved Arrow */}
            <img 
              src={curvedArrow} 
              alt="Curved Arrow" 
              className="absolute left-[-90px] top-[70px] w-[100px] h-[100px] object-contain z-20 drop-shadow-sm"
            />

            {/* Right Side Floating Text */}
            <div className="absolute right-[-200px] xl:right-[-220px] top-[100px] flex flex-col gap-[24px] font-['Sour_Gummy'] font-bold text-[16px] leading-[38px] text-[#BD4444] z-20">
              <span className="whitespace-nowrap">NO new application</span>
              <span className="whitespace-nowrap">NO complicated software</span>
            </div>

          </div>
        </div>
      </div>

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

        {/* Video Container - Mobile Only Height Changed */}
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

          {/* Custom Video Controls Bar (Appears on Hover or When Paused) */}
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

      {/* Bottom Section: 4 Feature Boxes */}
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
  );
};

export default HeroSection;