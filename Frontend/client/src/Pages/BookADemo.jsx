import React, { useState } from 'react';
import axios from 'axios';
import mainBannerImage from '../assets/BookADemo/book-demo-banner.png';

// Industry Icons imports
import hspIcon from '../assets/WeServe/Hospitals.png';
import diagnosticIcon from '../assets/WeServe/diagnostic.png';
import eventIcon from '../assets/WeServe/EventService.png';
import beautyIcon from '../assets/WeServe/BeautySaloon.png';
import autoIcon from '../assets/WeServe/Automobile.png';
import clinicIcon from '../assets/WeServe/Clinics.png';
import fitnessIcon from '../assets/WeServe/Fitness.png';
import restaurantIcon from '../assets/WeServe/Restaurants.png';
import legalIcon from '../assets/WeServe/LegalServices.png';
import petIcon from '../assets/WeServe/PetCare.png';
import corporateIcon from '../assets/WeServe/Corporate.png';
import educationIcon from '../assets/WeServe/Education.png';
import realEstateIcon from '../assets/WeServe/RealEstate.png';
import travelIcon from '../assets/WeServe/Travel.png';
import governmentIcon from '../assets/WeServe/GovernmentService.png';
import homeServicesIcon from '../assets/WeServe/HomeService.png';
import businessConsultingIcon from '../assets/WeServe/BusinessConsulting.png';
import financialIcon from '../assets/WeServe/Financial.png';
import wellnessIcon from '../assets/WeServe/Wellness.png';
import hospitalityIcon from '../assets/WeServe/Hospitality.png';
import repairIcon from '../assets/WeServe/Repair.png';

const industries = [
  { id: 'hospitals', name: 'Hospitals', icon: hspIcon },
  { id: 'diagnostic', name: 'Diagnostic Centers', icon: diagnosticIcon },
  { id: 'events', name: 'Event Services', icon: eventIcon },
  { id: 'beauty', name: 'Beauty & Salon', icon: beautyIcon },
  { id: 'automobile', name: 'Automobile', icon: autoIcon },
  { id: 'clinics', name: 'Clinics', icon: clinicIcon },
  { id: 'fitness', name: 'Fitness', icon: fitnessIcon },
  { id: 'restaurants', name: 'Restaurants', icon: restaurantIcon },
  { id: 'legal', name: 'Legal Services', icon: legalIcon },
  { id: 'pet', name: 'Pet Care', icon: petIcon },
  { id: 'corporate', name: 'Corporate Offices', icon: corporateIcon },
  { id: 'education', name: 'Education', icon: educationIcon },
  { id: 'real-estate', name: 'Real Estate', icon: realEstateIcon },
  { id: 'travel', name: 'Travel Agencies', icon: travelIcon },
  { id: 'government', name: 'Government Services', icon: governmentIcon },
  { id: 'home-services', name: 'Home Services', icon: homeServicesIcon },
  {
    id: 'business-consulting',
    name: 'Business Consulting',
    icon: businessConsultingIcon,
  },
  { id: 'financial', name: 'Financial Services', icon: financialIcon },
  { id: 'wellness', name: 'Wellness', icon: wellnessIcon },
  { id: 'hospitality', name: 'Hospitality', icon: hospitalityIcon },
  { id: 'repair', name: 'Repair Services', icon: repairIcon },
];

const BookADemo = () => {
  // State to manage current step ('step1', 'step2', 'step3', or 'step4')
  const [currentStep, setCurrentStep] = useState('step1');

  // State to track selected industry name for the confirmation modal
  const [selectedIndustry, setSelectedIndustry] = useState('Hospitals');

  // State to control confirmation popup modal visibility
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form states across steps
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    locations: '',
    city: '',
    state: '',
    country: 'India',
    fullName: '',
    designation: '',
    workEmail: '',
    mobileNumber: '',
    whatsappNumber: '',
    preferredDate: '2026-08-05',
    preferredTime: '3:00 PM',
    preferredDemoMode: 'Video Call',
    demoRequirements: '',
    agreeToContact: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleIndustrySelect = (industryName) => {
    setSelectedIndustry(industryName);
  };

  // Submit demo request to backend
  const handleSubmitDemo = async () => {
    setSubmitError('');

    if (!formData.businessName.trim()) {
      setSubmitError('Please enter your business / organization name.');
      return;
    }

    if (!formData.businessType) {
      setSubmitError('Please select your business type.');
      return;
    }

    if (!formData.locations) {
      setSubmitError('Please select the number of locations.');
      return;
    }

    if (!formData.city.trim()) {
      setSubmitError('Please enter your city.');
      return;
    }

    if (!formData.state) {
      setSubmitError('Please select your state.');
      return;
    }

    if (!formData.fullName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }

    if (!formData.workEmail.trim()) {
      setSubmitError('Please enter your work email.');
      return;
    }

    if (!formData.mobileNumber.trim()) {
      setSubmitError('Please enter your mobile number.');
      return;
    }

    if (!formData.preferredDate) {
      setSubmitError('Please select your preferred date.');
      return;
    }

    if (!formData.preferredTime.trim()) {
      setSubmitError('Please enter your preferred time.');
      return;
    }

    if (!formData.agreeToContact) {
      setSubmitError('Please agree to be contacted regarding the demo request.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      BusinessName: formData.businessName,
      BusinessType: formData.businessType,
      Locations: formData.locations,
      City: formData.city,
      State: formData.state,
      Country: formData.country,
      FullName: formData.fullName,
      Designation: formData.designation,
      WorkEmail: formData.workEmail,
      MobileNumber: formData.mobileNumber,
      WhatsappNumber: formData.whatsappNumber,
      PreferredDate: formData.preferredDate,
      PreferredTime: formData.preferredTime,
      PreferredDemoMode: formData.preferredDemoMode,
      DemoRequirements: formData.demoRequirements,
      AgreeToContact: formData.agreeToContact,
      SelectedIndustry: selectedIndustry,
    };

    console.log('Book Demo Payload:', payload);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE || '/api';

      const response = await axios.post(
        `${apiBaseUrl}/demo`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Book Demo API Response:', response.data);

      setShowConfirmationModal(true);
    } catch (error) {
      console.error('Book Demo API Error:', error);

      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error;

      setSubmitError(
        backendMessage ||
        'Unable to submit your demo request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToHome = () => {
    setShowConfirmationModal(false);
    setCurrentStep('step1');
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex flex-col xl:flex-row items-center justify-center xl:justify-between px-4 sm:px-8 xl:px-[64px] py-8 xl:py-[36px] box-border overflow-x-hidden relative">

      {/* Left Column - Promotional Banner Section */}
      <div className="w-full xl:w-[1104px] h-auto xl:h-[872px] flex flex-col justify-center py-2 mb-8 xl:mb-0 mt-8 xl:mt-0 pr-0 xl:pr-6">
        <div>
          <div className="text-center mb-6 xl:mb-0">
            <h2 className="font-['Roboto'] font-semibold text-[20px] sm:text-[20px] text-[#346739] mb-4">
              See How HiCoreSlotify Can Transform Your Business
            </h2>

            <p className="font-['Roboto'] font-normal text-[14px] sm:text-[14px] text-[#666666] leading-[32px] max-w-xl mx-auto">
              Discover how AI-powered WhatsApp booking, smart scheduling,
              automated reminders, payments, and analytics can simplify your
              day-to-day operations.
            </p>
          </div>

          <div className="relative w-full rounded-[16px] overflow-hidden my-10">
            <img
              src={mainBannerImage}
              alt="HiCore Slotify Banner"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right Side Container with fixed height matching xl:h-[872px] and overflow hidden */}
      <div className="w-full max-w-[518px] xl:w-[518px] h-auto xl:h-[872px] bg-[#FFFFFF] border border-[#D9D9D9] shadow-[2px_2px_4px_6px_#00000040] rounded-[8px] p-6 sm:p-[36px] flex flex-col justify-between box-border overflow-hidden">

        <div>
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="font-['Roboto'] font-semibold text-[20px] sm:text-[20px] text-[#346739]">
              Book a Demo
            </h3>

            <p className="font-['Roboto'] font-normal text-[14px] px-2 pt-2 leading-[32px] text-[#666666]">
              Get a personalized demo tailored to your industry and booking
              requirements.
            </p>
          </div>

          {/* Conditional Steps Rendering */}
          {currentStep === 'step1' ? (
            /* STEP 01 Container with fixed height 680px */
            <div className="border border-[#D9D9D9] rounded-[16px] p-6 mb-2 bg-[#FFFFFF] flex flex-col justify-between h-[680px]">
              <div>
                <div className="font-['Roboto'] leading-[32px] font-medium text-[13px] text-[#346739] mb-4">
                  <span className="text-[#346739] font-semibold">
                    STEP 01 of 06
                  </span>{' '}
                  - Select your industry so we can tailor the demo to how you
                  actually take bookings.
                </div>

                {/* Industry Grid with fixed height 480px */}
                <div className="grid grid-cols-4 gap-3 h-[480px] overflow-y-auto pr-1 mb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {industries.map((item) => {
                    const isSelected = selectedIndustry === item.name;
                    return (
                      <div key={item.id} className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => handleIndustrySelect(item.name)}
                          className={`
                            w-16 h-16
                            rounded-[16px]
                            bg-[#FFFFFF]
                            border transition-all duration-200
                            flex items-center justify-center
                            cursor-pointer
                            hover:bg-[#F5F5F5]
                            hover:border-[#346739]
                            hover:shadow-[0_4px_10px_rgba(0,0,0,0.20)]
                            ${isSelected ? 'border-[#346739] bg-[#F5F5F5] shadow-[0_4px_10px_rgba(0,0,0,0.15)] ring-2 ring-[#346739]/30' : 'border-[#66BB6A]'}
                          `}
                        >
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="w-13 h-13 object-contain"
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Button for Step 1 - Bottom Right */}
              <div className="flex justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setCurrentStep('step2')}
                  className="group flex items-center justify-center w-[180px] h-[44px] px-[16px] py-[4px] rounded-[12px] bg-[#346739] hover:bg-[#FFFFFF] border border-transparent hover:border-[#346739] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-all duration-300 cursor-pointer"
                >
                  <span className="font-['Roboto'] font-medium text-[14px] leading-[28px] text-white group-hover:text-[#346739]">
                    Continue
                  </span>
                </button>
              </div>
            </div>
          ) : currentStep === 'step2' ? (
            /* STEP 02 Container with fixed height 680px */
            <div className="border border-[#D9D9D9] rounded-[16px] p-6 mb-2 bg-[#FFFFFF] flex flex-col justify-between h-[680px]">
              <div>
                <div className="font-['Roboto'] font-medium text-[14px] text-[#346739] mb-4">
                  <span className="font-bold">STEP 02 of 06</span> - Tell us about your business
                </div>

                {/* Form Fields with fixed height 440px */}
                <div className="space-y-4 h-[440px] overflow-y-auto pr-1 mb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {/* Business / Organization Name */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] mt-3 font-medium text-[#1A202C] mb-2">
                      Business / Organization Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Enter your business name"
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] focus:outline-none focus:border-[#346739]"
                    />
                  </div>

                  {/* Business Type & Number of Locations */}
                  <div className="grid grid-cols-2 gap-3">
  {/* Business Type */}
  <div>
    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
      Business Type
    </label>

    <select
      name="businessType"
      value={formData.businessType}
      onChange={handleInputChange}
      className="w-full h-[42px] px-3 border border-[#346739] rounded-[8px] text-[13px] font-['Roboto'] bg-white focus:outline-none focus:border-[#346739] text-[#346739] cursor-pointer"
    >
      <option value="">Select business type</option>
      <option value="Sole Proprietorship">Sole Proprietorship</option>
      <option value="Partnership">Partnership</option>
      <option value="Private Limited Company">
        Private Limited Company
      </option>
      <option value="Other">Other</option>
      <option value="LLP">LLP</option>
      <option value="Franchise Outlet">Franchise Outlet</option>
    </select>
  </div>

  {/* Number of Locations */}
  <div>
    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
      Number of Locations
    </label>

    <select
      name="locations"
      value={formData.locations}
      onChange={handleInputChange}
      className="w-full h-[42px] px-3 border border-[#346739] rounded-[8px] text-[13px] font-['Roboto'] bg-white focus:outline-none focus:border-[#346739] text-[#346739] cursor-pointer"
    >
      <option value="">Select no. of locations</option>
      <option value="Single Location">Single Location</option>
      <option value="2 - 5 Locations">2 - 5 Locations</option>
      <option value="6 - 20 Locations">6 - 20 Locations</option>
      <option value="20+ Locations">20+ Locations</option>
    </select>
  </div>
</div>

{/* City */}
<div>
  <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
    City
  </label>

  <input
    type="text"
    name="city"
    value={formData.city}
    onChange={handleInputChange}
    placeholder="Enter your city"
    className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] focus:outline-none focus:border-[#346739]"
  />
</div>

{/* State */}
<div>
  <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
    State
  </label>

  <select
    name="state"
    value={formData.state}
    onChange={handleInputChange}
    className="w-full h-[42px] px-3 border border-[#346739] rounded-[8px] text-[13px] font-['Roboto'] bg-white focus:outline-none focus:border-[#346739] text-[#346739] cursor-pointer"
  >
    <option value="">Select your state</option>
    <option value="Andhra Pradesh">Andhra Pradesh</option>
    <option value="Tamilnadu">Tamilnadu</option>
    <option value="Telangana">Telangana</option>
    <option value="Karnataka">Karnataka</option>
    <option value="Kerala">Kerala</option>
    <option value="Maharashtra">Maharashtra</option>
    <option value="Delhi">Delhi</option>
  </select>
</div>

{/* Country */}
<div>
  <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
    Country
  </label>

  <input
    type="text"
    name="country"
    value={formData.country}
    onChange={handleInputChange}
    placeholder="Enter your country"
    className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] focus:outline-none focus:border-[#346739]"
  />
</div>
                </div>
              </div>

              {/* Action Buttons for Step 2 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('step1')}
                  className="w-[130px] h-[44px] flex items-center justify-center rounded-[12px] bg-white border border-[#346739] text-[#346739] font-['Roboto'] font-medium text-[14px] hover:bg-[#F5F5F5] transition-all duration-200 cursor-pointer"
                >
                  Back
                </button>

                <button 
                  type="button"
                  onClick={() => setCurrentStep('step3')}
                  className="group flex items-center justify-center w-[180px] h-[44px] px-[16px] py-[4px] rounded-[12px] bg-[#346739] hover:bg-[#FFFFFF] border border-transparent hover:border-[#346739] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-all duration-300 cursor-pointer"
                >
                  <span className="font-['Roboto'] font-medium text-[14px] leading-[28px] text-white group-hover:text-[#346739]">
                    Continue
                  </span>
                </button>
              </div>
            </div>
          ) : currentStep === 'step3' ? (
            /* STEP 03 Container */
            <div className="border border-[#D9D9D9] rounded-[16px] p-6 mb-2 bg-[#FFFFFF] flex flex-col justify-between h-[680px]">
              <div>
                <div className="font-['Roboto'] font-medium text-[14px] text-[#346739] mb-4 leading-[22px]">
                  <span className="font-bold">STEP 03 of 06</span> - Where should we send the confirmation and demo link.
                </div>

                {/* Form Fields with fixed height 440px */}
                <div className="space-y-4 h-[440px] overflow-y-auto pr-1 mb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {/* Full Name */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] mt-1 font-medium text-[#1A202C] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] text-[#333333] placeholder-[#A0AEC0] focus:outline-none focus:border-[#346739]"
                    />
                  </div>

                  {/* Designation / Role */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="Enter your designation / role"
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] text-[#333333] placeholder-[#A0AEC0] focus:outline-none focus:border-[#346739]"
                    />
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
                      Work Email
                    </label>
                    <input
                      type="email"
                      name="workEmail"
                      value={formData.workEmail}
                      onChange={handleInputChange}
                      placeholder="Enter your business email"
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] text-[#333333] placeholder-[#A0AEC0] focus:outline-none focus:border-[#346739]"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] text-[#333333] placeholder-[#A0AEC0] focus:outline-none focus:border-[#346739]"
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      placeholder="Enter WhatsApp number (if different)"
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] text-[#333333] placeholder-[#A0AEC0] focus:outline-none focus:border-[#346739]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons for Step 3 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('step2')}
                  className="w-[130px] h-[44px] flex items-center justify-center rounded-[12px] bg-white border border-[#346739] text-[#346739] font-['Roboto'] font-medium text-[14px] hover:bg-[#F5F5F5] transition-all duration-200 cursor-pointer"
                >
                  Back
                </button>

                <button 
                  type="button"
                  onClick={() => setCurrentStep('step4')}
                  className="group flex items-center justify-center w-[180px] h-[44px] px-[16px] py-[4px] rounded-[12px] bg-[#346739] hover:bg-[#FFFFFF] border border-transparent hover:border-[#346739] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-all duration-300 cursor-pointer"
                >
                  <span className="font-['Roboto'] font-medium text-[14px] leading-[28px] text-white group-hover:text-[#346739]">
                    Continue
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 04 Container */
            <div className="border border-[#D9D9D9] rounded-[16px] p-6 mb-2 bg-[#FFFFFF] flex flex-col justify-between h-[680px]">
              <div>
                <div className="font-['Roboto'] font-medium text-[14px] text-[#346739] mb-4 leading-[22px]">
                  <span className="font-bold">STEP 04 of 06</span> - Pick a date, time and format that works for your team.
                </div>

                {/* Form Fields with fixed height 440px */}
                <div className="space-y-4 h-[440px] overflow-y-auto pr-1 mb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {/* Preferred Date */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] mt-1 font-medium text-[#1A202C] mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] text-[#333333] focus:outline-none focus:border-[#346739] cursor-pointer"
                    />
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
                      Preferred Time
                    </label>
                    <input
                      type="text"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      placeholder="e.g., 2.30 PM"
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] text-[#333333] placeholder-[#A0AEC0] focus:outline-none focus:border-[#346739]"
                    />
                  </div>

                  {/* Preferred Demo Mode */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
                      Preferred Demo Mode
                    </label>
                    <select
                      name="preferredDemoMode"
                      value={formData.preferredDemoMode}
                      onChange={handleInputChange}
                      className="w-full h-[42px] px-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] bg-white focus:outline-none focus:border-[#346739] text-[#333333]"
                    >
                      <option value="">Select demo mode</option>
                      <option value="Video Call">Video Call</option>
                      <option value="Online / Video Call">Online / Video Call</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                  </div>

                  {/* What would you like to see in the demo? */}
                  <div>
                    <label className="block font-['Roboto'] text-[14px] font-medium text-[#1A202C] mb-2">
                      What would you like to see in the demo?
                    </label>
                    <textarea
                      name="demoRequirements"
                      value={formData.demoRequirements}
                      onChange={handleInputChange}
                      placeholder="Tell us about your current booking status or any specific requirements..."
                      rows={3}
                      className="w-full p-3 border border-[#D9D9D9] rounded-[8px] text-[13px] font-['Roboto'] text-[#333333] placeholder-[#A0AEC0] focus:outline-none focus:border-[#346739] resize-none"
                    />
                  </div>

                  {/* Checkbox agreement */}
                  <div className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="agreeToContact"
                      name="agreeToContact"
                      checked={formData.agreeToContact}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 accent-[#346739] border border-[#D9D9D9] rounded cursor-pointer"
                    />
                    <label
                      htmlFor="agreeToContact"
                      className="font-['Roboto'] font-normal text-[12px] leading-[18px] text-[#666666] cursor-pointer"
                    >
                      I agree to be contacted by the HiCore SLOTIFY team regarding this demo request.
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Step 4 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('step3')}
                  className="w-[130px] h-[44px] flex items-center justify-center rounded-[12px] bg-white border border-[#346739] text-[#346739] font-['Roboto'] font-medium text-[14px] hover:bg-[#F5F5F5] transition-all duration-200 cursor-pointer"
                >
                  Back
                </button>

                <button 
                  type="button"
                  onClick={handleSubmitDemo}
                  className="group flex items-center justify-center w-[180px] h-[44px] px-[16px] py-[4px] rounded-[12px] bg-[#346739] hover:bg-[#FFFFFF] border border-transparent hover:border-[#346739] hover:shadow-[inset_4px_4px_4px_0px_#00000040] transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  <span className="font-['Roboto'] font-medium text-[14px] leading-[28px] text-white group-hover:text-[#346739]">
                    {isSubmitting ? 'Submitting...' : 'Book My Demo'}
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Demo Confirmed Modal Popup */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-[440px] bg-white border border-[#D9D9D9] rounded-[16px] shadow-2xl p-6 sm:p-8 flex flex-col items-center">
            
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setShowConfirmationModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#D9D9D9] flex items-center justify-center text-[#666666] hover:bg-[#F5F5F5] transition-all cursor-pointer"
            >
              ✕
            </button>

            {/* Success Checkmark Icon */}
            <div className="w-14 h-14 bg-[#2E7D32] rounded-full flex items-center justify-center text-white mb-3 shadow-md">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            {/* Title */}
            <h3 className="font-['Roboto'] font-semibold text-[20px] text-[#2E7D32] mb-6">
              Demo Confirmed
            </h3>

            {/* Details Box */}
            <div className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] p-4 mb-6 space-y-3 font-['Roboto'] text-[14px]">
              <div className="flex justify-between items-center">
                <span className="text-[#666666]">Industry</span>
                <span className="font-semibold text-[#1A202C]">{selectedIndustry}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666666]">Date</span>
                <span className="font-semibold text-[#1A202C]">{formData.preferredDate || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666666]">Time</span>
                <span className="font-semibold text-[#1A202C]">{formData.preferredTime || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666666]">Mode</span>
                <span className="font-semibold text-[#1A202C]">{formData.preferredDemoMode || '-'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center justify-between gap-3">

              <button
                type="button"
                onClick={handleResetToHome}
                className="w-1/2 h-[44px] flex items-center justify-center rounded-[12px] bg-[#008000] text-white font-['Roboto'] font-medium text-[14px] hover:bg-[#006400] transition-all cursor-pointer shadow-md"
              >
                Back to Home
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BookADemo;