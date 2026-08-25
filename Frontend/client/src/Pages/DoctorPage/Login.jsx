import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import assets from your assets folder
import laptopImage from '../../assets/DoctorDashboard/laptop.png';
import mobileImage from '../../assets/DoctorDashboard/phone.png';
import appointmentIcon from '../../assets/DoctorDashboard/Appointement-blue.png';
import patientIcon from '../../assets/DoctorDashboard/Patients.png';
import prescriptionIcon from '../../assets/DoctorDashboard/Prescription.png';
import whatsappIcon from '../../assets/DoctorDashboard/whatsapp.png';
import analyticsIcon from '../../assets/DoctorDashboard/Analytics.png';
import secureIcon from '../../assets/DoctorDashboard/security.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const apiBase =
        import.meta.env.VITE_API_BASE || '/api';

      const response = await fetch(
        `${apiBase}/doctors/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            UserName: username,
            Password: password,
          }),
        }
      );

      // =====================================================
      // SAFE RESPONSE PARSING
      // =====================================================

      const contentType =
        response.headers.get('content-type');

      let data = {};

      if (
        contentType &&
        contentType.includes('application/json')
      ) {
        const text = await response.text();

        data = text
          ? JSON.parse(text)
          : {};
      }

      console.log(
        'Login API status:',
        response.status
      );

      console.log(
        'Login API response:',
        data
      );

      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      if (response.ok) {
        console.log(
          'Login successful - Raw API Response Data:',
          data
        );

        // ===================================================
        // 1. SAVE TOKEN
        // ===================================================

        const token =
          data.token ||
          data.accessToken ||
          'mock-doctor-token';

        localStorage.setItem(
          'doctorToken',
          token
        );

        console.log(
          'Saved doctorToken:',
          localStorage.getItem(
            'doctorToken'
          )
        );

        // ===================================================
        // 2. SAVE DOCTOR ID
        // ===================================================

        if (data.Id) {
          localStorage.setItem(
            'doctorId',
            data.Id
          );

          console.log(
            'Saved doctorId:',
            localStorage.getItem(
              'doctorId'
            )
          );
        } else {
          console.warn(
            'Warning: "Id" was not found in the response data object.'
          );
        }

        // ===================================================
        // 3. SAVE COMPLETE DOCTOR PROFILE
        // ===================================================

        localStorage.setItem(
          'doctorProfile',
          JSON.stringify(data)
        );

        console.log(
          'Saved doctorProfile:',
          localStorage.getItem(
            'doctorProfile'
          )
        );

        // ===================================================
        // 4. AUTH CHANGE EVENT
        // ===================================================

        window.dispatchEvent(
          new Event('authChange')
        );

        // ===================================================
        // 5. REDIRECT TO DASHBOARD
        // ===================================================

        navigate('/doctor-dashboard');

      } else {

        // ===================================================
        // LOGIN FAILED
        // ===================================================

        alert(
          data.message ||
            data.detail ||
            'Login failed. Please check your credentials.'
        );
      }

    } catch (error) {

      console.error(
        'API Error:',
        error
      );

      alert(
        'An error occurred while connecting to the server. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // TERMS & PRIVACY CONTENT
  // =========================================================

  const legalContent = {
    terms: {
      title: 'Terms of Service',
      sections: [
        [
          '1. About HiCoreSlotify',
          'HiCoreSlotify is a digital platform designed to help doctors and healthcare professionals manage their practice and patient appointments through an online system.'
        ],
        [
          '2. Appointment Services',
          'Doctors can create and manage patient appointments directly through HiCoreSlotify. Appointment information may include patient details, date, time, consultation type, fee, reason, and appointment status.'
        ],
        [
          '3. Doctor Responsibility',
          'Doctors are responsible for the accuracy of information entered into the platform and for the medical care, diagnosis, treatment, prescriptions, and decisions provided to patients. HiCoreSlotify provides software and appointment-management services and does not replace professional medical judgment.'
        ],
        [
          '4. Patient Information',
          'Doctors may enter patient information into the platform for legitimate healthcare and appointment-management purposes and should handle such information responsibly.'
        ],
        [
          '5. Account Security',
          'Doctors are responsible for keeping their username, password, and other account credentials secure and should not share them with unauthorized persons.'
        ],
        [
          '6. Prescriptions',
          'The platform may provide digital prescription functionality. Doctors remain responsible for reviewing all medical information and prescriptions before providing them to patients.'
        ],
        [
          '7. Prohibited Use',
          'Users must not use HiCoreSlotify for unlawful activities, unauthorized access, fraudulent appointments, or activities that could compromise the platform.'
        ],
        [
          '8. Platform Availability',
          'Temporary interruptions may occur because of maintenance, technical problems, network issues, or circumstances outside our control.'
        ],
        [
          '9. Changes to These Terms',
          'These Terms of Service may be updated from time to time. Continued use of HiCoreSlotify after changes are published indicates acceptance of the updated terms.'
        ],
        [
          '10. Contact',
          'If you have questions about these Terms of Service, please contact the HiCoreSlotify support team.'
        ]
      ]
    },

    privacy: {
      title: 'Privacy Policy',
      sections: [
        [
          '1. Introduction',
          'HiCoreSlotify respects the privacy of doctors and patients whose information is entered into or processed through the platform.'
        ],
        [
          '2. Information We Collect',
          'Information may include doctor account information, doctor profile information, patient name and contact information, appointment date and time, consultation type, appointment status, payment information, prescription-related information, and other information entered by doctors for patient management.'
        ],
        [
          '3. How Information Is Used',
          'Information may be used to provide doctor account functionality, schedule and manage patient appointments, maintain records, support digital prescriptions, manage consultation and payment information, improve the platform, provide technical support, and maintain security.'
        ],
        [
          '4. Patient Information',
          'HiCoreSlotify may process patient information entered by doctors for appointment and healthcare-management purposes. Doctors are responsible for ensuring they have the appropriate authorization or legal basis to collect and use patient information.'
        ],
        [
          '5. Protection of Information',
          'We take reasonable technical and organizational measures to protect information against unauthorized access, alteration, disclosure, or destruction. No internet-based service can guarantee absolute security.'
        ],
        [
          '6. Account Information',
          'Doctors should keep their account credentials confidential and are responsible for unauthorized access resulting from credentials being shared.'
        ],
        [
          '7. Data Retention',
          'Information may be retained as necessary to provide services, maintain records, meet legal obligations, resolve disputes, and enforce applicable agreements.'
        ],
        [
          '8. Sharing of Information',
          'Information may be shared with service providers or technical partners when necessary to operate, maintain, secure, or improve the platform, subject to appropriate safeguards, or when required by law.'
        ],
        [
          '9. Your Responsibilities',
          'Doctors should ensure patient information entered into the platform is accurate, relevant, and handled in accordance with applicable healthcare, privacy, and data-protection requirements.'
        ],
        [
          '10. Changes to This Privacy Policy',
          'This Privacy Policy may be updated from time to time. Updated versions will be made available through the platform.'
        ],
        [
          '11. Contact',
          'If you have questions or concerns regarding this Privacy Policy, please contact the HiCoreSlotify support team.'
        ]
      ]
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex flex-col xl:flex-row items-center justify-center xl:justify-between px-4 sm:px-8 xl:px-[64px] py-8 xl:py-[36px] box-border overflow-x-hidden relative">

      {/* =====================================================
          TERMS / PRIVACY POPUP
      ===================================================== */}

      {legalModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="w-full max-w-[850px] max-h-[85vh] bg-white rounded-[12px] shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#D9D9D9] shrink-0">

              <h2 className="font-['Poppins'] font-semibold text-[20px] sm:text-[24px] text-[#346739]">
                {legalContent[legalModal].title}
              </h2>

              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="w-[36px] h-[36px] flex items-center justify-center rounded-full text-[#666666] hover:bg-[#F3F3F3] hover:text-[#346739] text-[24px] leading-none cursor-pointer transition-colors"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <div className="overflow-y-auto scrollbar-hide px-6 sm:px-8 py-6">

              <p className="font-['Roboto'] text-[12px] text-[#888888] mb-6">
                Last updated: August 19, 2026
              </p>

              <div className="space-y-6">

                {legalContent[legalModal].sections.map(
                  ([heading, content]) => (
                    <section key={heading}>

                      <h3 className="font-['Poppins'] font-semibold text-[16px] sm:text-[18px] text-[#346739] mb-2">
                        {heading}
                      </h3>

                      <p className="font-['Roboto'] text-[14px] sm:text-[15px] leading-[26px] text-[#444444]">
                        {content}
                      </p>

                    </section>
                  )
                )}

              </div>

            </div>

            <div className="px-6 sm:px-8 py-4 border-t border-[#D9D9D9] flex justify-end shrink-0">

              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="w-[110px] h-[40px] rounded-[8px] bg-[#346739] text-white font-['Roboto'] font-medium text-[14px] hover:bg-[#2c5730] transition-colors cursor-pointer"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}


      {/* =====================================================
          TOP LEFT BACK BUTTON
      ===================================================== */}

      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 sm:left-[64px] flex items-center gap-2 text-[#346739] hover:text-[#2c5730] font-['Roboto'] font-medium text-[15px] transition-all duration-200 cursor-pointer z-20 bg-transparent border-none p-0"
      >
        <span>&larr;</span>
        <span>Back</span>
      </button>


      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="w-full xl:w-[1104px] h-auto xl:h-[872px] flex flex-col justify-between py-2 mb-8 xl:mb-0 mt-8 xl:mt-0">

        {/* HEADER */}

        <div className="text-center mb-6 xl:mb-0">

          <h2 className="font-['Poppins'] font-semibold text-[26px] sm:text-[32px] text-[#346739] mb-1">
            Run Your Practice Smarter
          </h2>

          <p className="font-['Roboto'] font-normal text-[14px] sm:text-[16px] text-[#666666]">
            All the tools you need to manage your clinic from anywhere, anytime.
          </p>

        </div>


        {/* MOCKUPS */}

        <div className="relative flex justify-center items-center w-full my-4 xl:my-2">

          <img
            src={laptopImage}
            alt="Dashboard Laptop Mockup"
            className="w-full max-w-[522px] h-auto object-contain drop-shadow-md"
            onError={(e) => {
              e.target.src =
                'https://via.placeholder.com/492x300?text=Laptop+Mockup';
            }}
          />

          <img
            src={mobileImage}
            alt="Mobile WhatsApp Assistant Mockup"
            className="hidden xl:block absolute xl:left-[100px] xl:bottom-[-300px] xl:w-[180.58px] xl:h-[400px] object-contain rounded-[16px] drop-shadow-2xl z-10"
            onError={(e) => {
              e.target.src =
                'https://via.placeholder.com/180x300?text=Mobile+Mockup';
            }}
          />

        </div>


        {/* FEATURES */}

        <div className="grid grid-cols-2 gap-y-6 sm:gap-y-12 w-full max-w-[540px] xl:pl-[125px] mx-auto px-4 mt-6 xl:mt-0">

          {/* FEATURE 1 */}

          <div className="flex flex-col items-center text-center">

            <div className="w-[52px] h-[52px] rounded-[8px] bg-[#FFFFFF] border border-[#1C71DA] flex items-center justify-center mb-1">

              <img
                src={appointmentIcon}
                alt="Smart Appointment"
                className="w-[24px] h-[24px] object-contain"
              />

            </div>

            <span className="font-['Roboto'] font-medium text-[12px] sm:text-[13px] text-[#2563EB]">
              Smart Appointment Management
            </span>

          </div>


          {/* FEATURE 2 */}

          <div className="flex flex-col items-center text-center">

            <div className="w-[52px] h-[52px] rounded-[16px] bg-[#FFFFFF] border border-[#DEB821] flex items-center justify-center mb-1">

              <img
                src={patientIcon}
                alt="Patient Management"
                className="w-[24px] h-[24px] object-contain"
              />

            </div>

            <span className="font-['Roboto'] font-medium text-[12px] sm:text-[13px] text-[#DEB821]">
              Patient Management
            </span>

          </div>


          {/* FEATURE 3 */}

          <div className="flex flex-col items-center text-center">

            <div className="w-[52px] h-[52px] rounded-[16px] bg-[#FFFFFF] border border-[#9747FF] flex items-center justify-center mb-1">

              <img
                src={prescriptionIcon}
                alt="Digital Prescriptions"
                className="w-[24px] h-[24px] object-contain"
              />

            </div>

            <span className="font-['Roboto'] font-medium text-[12px] sm:text-[13px] text-[#7C3AED]">
              Digital Prescriptions
            </span>

          </div>


          {/* FEATURE 4 */}

          <div className="flex flex-col items-center text-center">

            <div className="w-[52px] h-[52px] rounded-[16px] bg-[#FFFFFF] border border-[#008000] flex items-center justify-center mb-1">

              <img
                src={whatsappIcon}
                alt="WhatsApp Assistant"
                className="w-[24px] h-[24px] object-contain"
              />

            </div>

            <span className="font-['Roboto'] font-medium text-[12px] sm:text-[13px] text-[#008000]">
              WhatsApp Booking Assistant
            </span>

          </div>


          {/* FEATURE 5 */}

          <div className="flex flex-col items-center text-center">

            <div className="w-[52px] h-[52px] rounded-[16px] bg-[#FFFFFF] border border-[#FF6C04] flex items-center justify-center mb-1">

              <img
                src={analyticsIcon}
                alt="Growth Analytics"
                className="w-[24px] h-[24px] object-contain"
              />

            </div>

            <span className="font-['Roboto'] font-medium text-[12px] sm:text-[13px] text-[#FF6C04]">
              Growth Analytics
            </span>

          </div>


          {/* FEATURE 6 */}

          <div className="flex flex-col items-center text-center">

            <div className="w-[52px] h-[52px] rounded-[16px] bg-[#FFFFFF] border border-[#BD4444] flex items-center justify-center mb-1">

              <img
                src={secureIcon}
                alt="Secure & Reliable"
                className="w-[24px] h-[24px] object-contain"
              />

            </div>

            <span className="font-['Roboto'] font-medium text-[12px] sm:text-[13px] text-[#BD4444]">
              Secure & Reliable
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE LOGIN
      ===================================================== */}

      <div className="w-full max-w-[518px] xl:w-[518px] h-auto xl:h-[872px] bg-[#FFFFFF] border border-[#D9D9D9] shadow-[2px_2px_4px_6px_#00000040] rounded-[8px] p-6 sm:p-[36px] flex flex-col justify-between box-border">

        <div>

          {/* HEADING */}

          <div className="text-center mb-4">

            <h2 className="font-['Poppins'] font-bold text-[22px] sm:text-[24px] text-[#346739]">
              Welcome Back, Doctor!
            </h2>

            <p className="font-['Roboto'] font-normal text-[14px] sm:text-[14px] p-10 pt-4 leading-[32px] text-[#666666]">
              Sign in to manage your appointments, patients, and grow your practice.
            </p>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <div className="border border-[#346739] rounded-[16px] p-8 mb-6 bg-[#FFFFFF]">

            <form onSubmit={handleLogin}>

              {/* USERNAME */}

              <div className="mb-4">

                <label className="block font-['Roboto'] font-medium text-[14px] text-[#333333] mb-2">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter Username"
                  className="w-full h-[44px] px-3 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] font-['Roboto'] text-[15px] text-[#333333] focus:outline-none focus:border-[#346739]"
                />

              </div>


              {/* PASSWORD */}

              <div className="mb-4">

                <label className="block font-['Roboto'] font-medium text-[14px] text-[#333333] mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter Password"
                    className="w-full h-[44px] pl-3 pr-11 bg-[#FFFFFF] border border-[#D9D9D9] rounded-[10px] font-['Roboto'] text-[15px] text-[#333333] focus:outline-none focus:border-[#346739]"
                  />

                  {/* EYE BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#346739] transition-colors cursor-pointer"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >

                    {showPassword ? (

                      /* EYE OFF */

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />

                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />

                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />

                        <line
                          x1="2"
                          y1="2"
                          x2="22"
                          y2="22"
                        />
                      </svg>

                    ) : (

                      /* EYE */

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />

                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>

                    )}

                  </button>

                </div>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[44px] mt-2 bg-[#346739] hover:bg-[#2c5730] text-white font-['Roboto'] font-medium text-[14px] rounded-[12px] transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? 'Logging in...'
                  : 'Login'}
              </button>

            </form>

          </div>


          {/* =================================================
              CREATE DOCTOR ACCOUNT
          ================================================= */}

          <div className="border border-[#1C71DA] rounded-[16px] p-8 text-center mb-6 bg-[#FFFFFF]">

            <h3 className="font-['Poppins'] font-semibold text-[16px] text-[#2563EB] mb-4">
              New to HiCoreSlotify?
            </h3>

            <p className="font-['Roboto'] font-normal text-[14px] leading-[32px] text-[#666666] mb-6">
              Create your doctor account and start accepting appointments online.
            </p>

            <button
              onClick={() =>
                navigate('/register')
              }
              className="w-full h-[38px] bg-[#FFFFFF] hover:bg-[#2563EB]/5 border border-[#1C71DA] text-[#2563EB] font-['Roboto'] font-medium text-[13px] rounded-[12px] transition-all duration-200 cursor-pointer"
            >
              Create Doctor Account
            </button>

          </div>

        </div>


        {/* =================================================
            FOOTER TERMS
        ================================================= */}

        <div className="text-center mt-4 xl:mt-0">

          <p className="font-['Roboto'] font-normal text-[11px] text-[#888888]">

            By continuing, you agree to HiCoreSlotify{' '}

            <span
              className="text-[#2563EB] cursor-pointer underline"
              onClick={() =>
                setLegalModal('terms')
              }
            >
              Terms of Service
            </span>

            {' '}and{' '}

            <span
              className="text-[#2563EB] cursor-pointer underline"
              onClick={() =>
                setLegalModal('privacy')
              }
            >
              Privacy Policy
            </span>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;