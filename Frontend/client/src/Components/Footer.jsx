import React, { useState } from "react";
import FooterBanner from "../assets/footer-image.png";

const Footer = () => {
  // State to track which modal is open ('terms', 'privacy', or null)
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="w-full bg-[#346739] flex flex-col items-center overflow-hidden">
        {/* Banner Section with Padding and Rounded Corners */}
        <div className="w-full flex items-center justify-center p-6 sm:p-10">
          <img
            src={FooterBanner}
            alt="Footer Banner"
            className="w-full max-w-5xl mx-auto h-auto object-contain object-center rounded-2xl"
          />
        </div>

        {/* Copyright, Terms & Privacy Section */}
        <div className="w-full flex flex-col items-center justify-center text-center pb-8 px-4 text-white text-sm sm:text-base">
          <p>
            © 2026 HiCoreSlotify All rights reserved.
          </p>
          <p className="mt-1">
            <button 
              onClick={() => setActiveModal('terms')}
              className="hover:underline bg-transparent border-none cursor-pointer"
            >
              Terms and Conditions
            </button>{" "}
            |{" "}
            <button 
              onClick={() => setActiveModal('privacy')}
              className="hover:underline bg-transparent border-none cursor-pointer"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </footer>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-grey bg-opacity-50 backdrop-blur-sm p-4 transition-opacity">
          {/* Modal Container */}
          <div className="bg-white text-grey p-6 sm:p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col relative shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-[#346739]">
                {activeModal === 'terms' ? "Terms and Conditions" : "Privacy Policy"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-500 text-3xl leading-none transition-colors"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Content (Scrollable) */}
            <div className="text-sm text-gray-700 overflow-y-auto pr-2 space-y-4">
              {activeModal === 'terms' ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">1. Acceptance of Terms</h3>
                  <p>
                    By accessing and using HiCoreSlotify, you accept and agree to be bound by the terms and provisions of this agreement. Furthermore, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                  </p>
                  
                  <h3 className="font-semibold text-lg text-gray-900">2. Service Description</h3>
                  <p>
                    HiCoreSlotify provides users with an automated booking and scheduling platform. We reserve the right to modify, suspend, or discontinue the service at any time with or without notice to you.
                  </p>

                  <h3 className="font-semibold text-lg text-gray-900">3. User Responsibilities</h3>
                  <p>
                    You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                  </p>
                  
                  <h3 className="font-semibold text-lg text-gray-900">4. Limitation of Liability</h3>
                  <p>
                    HiCoreSlotify shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">1. Information Collection</h3>
                  <p>
                    We collect information from you when you register on our platform, book an appointment, or fill out a form. The collected information may include your name, phone number, and booking details necessary to provide our services.
                  </p>
                  
                  <h3 className="font-semibold text-lg text-gray-900">2. How We Use Your Information</h3>
                  <p>
                    Any of the information we collect from you may be used to personalize your experience, improve our platform, process transactions, and send periodic notifications regarding your bookings or updates to our services.
                  </p>

                  <h3 className="font-semibold text-lg text-gray-900">3. Data Security</h3>
                  <p>
                    We implement a variety of security measures to maintain the safety of your personal information. We utilize industry-standard encryption to protect sensitive data transmitted online and maintain secure servers.
                  </p>

                  <h3 className="font-semibold text-lg text-gray-900">4. Third-Party Disclosure</h3>
                  <p>
                    We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                  </p>
                </div>
              )}
            </div>
            
            {/* Modal Footer / Close Button */}
            <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
              <button 
                onClick={closeModal}
                className="bg-[#346739] text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium"
              >
                Close
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;