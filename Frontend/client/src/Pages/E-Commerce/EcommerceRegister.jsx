import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EcommerceRegister = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents page reload and URL parameter appending
    setShowPopup(true); // Show success popup
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans py-8 px-4 sm:px-8 lg:px-16 2xl:px-32 flex flex-col items-center">
      
      {/* Top Header Section */}
      <div className="w-full mb-10 flex items-center justify-between relative">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-purple-700 font-semibold transition-colors z-10"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2 w-full text-center pointer-events-none">
          Register Your Store
        </h1>
      </div>

      {/* Main Form Container */}
      <div className="w-full">
        <form className="w-full pb-20" onSubmit={handleSubmit}>
          
          {/* ================= SECTION 1 ================= */}
          <div className="flex flex-col md:flex-row gap-6 lg:gap-12 mb-10 w-full relative">
            
            {/* Connecting Line from Step 1 to Step 2 (Desktop Only) */}
            <div className="absolute left-[15px] top-[32px] w-[2px] h-[calc(100%+2.5rem)] bg-gray-200 hidden md:block z-0"></div>

            {/* Left Step Indicator aligned with Section 1 */}
            <div 
              className="w-full md:w-[280px] flex-shrink-0 flex items-start z-10 md:pt-8 cursor-pointer relative"
              onClick={() => setActiveStep(1)}
            >
              <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-2 bg-white z-10 ${activeStep >= 1 ? 'border-purple-700 text-purple-700' : 'border-gray-300 text-gray-300'}`}>
                {activeStep > 1 ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-purple-700"></span>
                )}
              </div>
              <span className={`ml-4 text-sm font-semibold mt-1.5 ${activeStep === 1 ? 'bg-purple-700 text-white px-4 py-2 rounded-full shadow-sm -mt-1' : 'text-gray-500 hover:text-gray-700'}`}>
                1. Personal Details
              </span>
            </div>

            {/* Right Card - Section 1 */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 md:p-10 shadow-sm z-10">
              <p className="text-purple-500 text-xs font-semibold uppercase tracking-wider mb-2">Section 01</p>
              <h2 className="text-xl font-bold text-purple-800 mb-1 tracking-tight">PERSONAL DETAILS</h2>
              <p className="text-sm text-gray-500 mb-8">Enter the store owner's primary contact and account information.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input type="text" placeholder="Create a username" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input type="password" placeholder="Create a password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6"></div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Full Name</label>
                  <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input type="email" placeholder="Enter email address" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Phone Number</label>
                  <input type="tel" placeholder="Enter primary phone" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                  <input type="tel" placeholder="Enter WhatsApp number" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business Number</label>
                  <input type="tel" placeholder="Enter business number" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2 ================= */}
          <div className="flex flex-col md:flex-row gap-6 lg:gap-12 mb-10 w-full relative">
            
            {/* Connecting Line from Step 2 to Step 3 (Desktop Only) */}
            <div className="absolute left-[15px] top-[32px] w-[2px] h-[calc(100%+2.5rem)] bg-gray-200 hidden md:block z-0"></div>

            {/* Left Step Indicator aligned with Section 2 */}
            <div 
              className="w-full md:w-[280px] flex-shrink-0 flex items-start z-10 md:pt-8 cursor-pointer relative"
              onClick={() => setActiveStep(2)}
            >
              <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-2 bg-white z-10 ${activeStep >= 2 ? 'border-purple-700 text-purple-700' : 'border-gray-300 text-gray-300'}`}>
                {activeStep > 2 ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                ) : (
                  <span className={`w-2 h-2 rounded-full ${activeStep === 2 ? 'bg-purple-700' : 'bg-transparent'}`}></span>
                )}
              </div>
              <span className={`ml-4 text-sm font-semibold mt-1.5 ${activeStep === 2 ? 'bg-purple-700 text-white px-4 py-2 rounded-full shadow-sm -mt-1' : 'text-gray-500 hover:text-gray-700'}`}>
                2. Store Information
              </span>
            </div>

            {/* Right Card - Section 2 */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 md:p-10 shadow-sm z-10">
              <p className="text-purple-500 text-xs font-semibold uppercase tracking-wider mb-2">Section 02</p>
              <h2 className="text-xl font-bold text-purple-800 mb-1 tracking-tight">STORE INFORMATION</h2>
              <p className="text-sm text-gray-500 mb-8">Help customers find your e-commerce store and upload your branding.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                  <input type="text" placeholder="Enter Store Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Store Address</label>
                  <textarea rows="3" placeholder="Enter Complete Address" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input type="text" placeholder="Enter City Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                  <input type="text" placeholder="Enter Pincode" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-700 bg-white">
                    <option value="" disabled>Select State</option>
                    <option value="tn">Tamil Nadu</option>
                    <option value="ka">Karnataka</option>
                    <option value="mh">Maharashtra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-700 bg-white">
                    <option value="india">India</option>
                  </select>
                </div>

                {/* Store Pictures Upload */}
                <div className="col-span-1 md:col-span-2 mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Store Pictures / Logo</label>
                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${selectedFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50 hover:border-purple-500'}`}>
                    <div className="space-y-2 text-center">
                      
                      {selectedFile ? (
                        <div className="flex flex-col items-center">
                          <svg className="mx-auto h-12 w-12 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-semibold text-purple-700">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Click below to change file</p>
                        </div>
                      ) : (
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}

                      <div className="flex text-sm text-gray-600 justify-center mt-2">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-purple-700 hover:text-purple-800 focus-within:outline-none">
                          <span>{selectedFile ? 'Upload a different file' : 'Upload a file'}</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept="image/*" 
                            onChange={handleFileChange}
                          />
                        </label>
                        {!selectedFile && <p className="pl-1">or drag and drop</p>}
                      </div>
                      
                      {!selectedFile && (
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ================= SECTION 3 ================= */}
          <div className="flex flex-col md:flex-row gap-6 lg:gap-12 w-full relative">
            
            {/* Left Step Indicator aligned with Section 3 (NO LINE BELOW THIS) */}
            <div 
              className="w-full md:w-[280px] flex-shrink-0 flex items-start z-10 md:pt-8 cursor-pointer relative"
              onClick={() => setActiveStep(3)}
            >
              <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-2 bg-white z-10 ${activeStep >= 3 ? 'border-purple-700 text-purple-700' : 'border-gray-300 text-gray-300'}`}>
                 <span className={`w-2 h-2 rounded-full ${activeStep === 3 ? 'bg-purple-700' : 'bg-transparent'}`}></span>
              </div>
              <span className={`ml-4 text-sm font-semibold mt-1.5 ${activeStep === 3 ? 'bg-purple-700 text-white px-4 py-2 rounded-full shadow-sm -mt-1' : 'text-gray-500 hover:text-gray-700'}`}>
                3. Business Details
              </span>
            </div>

            {/* Right Card - Section 3 */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 md:p-10 shadow-sm z-10">
              <p className="text-purple-500 text-xs font-semibold uppercase tracking-wider mb-2">Section 03</p>
              <h2 className="text-xl font-bold text-purple-800 mb-1 tracking-tight">BUSINESS DETAILS</h2>
              <p className="text-sm text-gray-500 mb-8">Configure your compliance and tax preferences.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number</label>
                  <input type="text" placeholder="Enter 15-digit GSTIN" className="w-full md:w-1/2 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 uppercase" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= Form Actions ================= */}
          <div className="flex justify-end mt-10">
            <button 
              type="submit"
              className="px-10 py-4 rounded-xl bg-purple-700 text-white font-bold tracking-wide hover:bg-purple-800 shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              Register
            </button>
          </div>

        </form>
      </div>

      {/* ================= SUCCESS POPUP MODAL ================= */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-grey bg-opacity-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 md:p-10 max-w-md w-full text-center shadow-2xl transform transition-all animate-fade-in-up">
            
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Registered Successfully!
            </h3>
            
            <p className="text-gray-500 mb-8 text-sm md:text-base">
              Your e-commerce store has been registered and is now under review. We will notify you once approved.
            </p>
            
            <button 
              onClick={() => {
                setShowPopup(false);
                navigate('/ecommerce-dashboard'); // Navigate user after successful registration
              }}
              className="w-full bg-purple-700 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-purple-800 transition-colors shadow-sm hover:shadow-md"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EcommerceRegister;