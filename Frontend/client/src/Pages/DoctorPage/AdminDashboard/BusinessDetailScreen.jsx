import React, { useState } from 'react';

const BusinessDetailScreen = ({
  business,
  onBack,
  onApprove,
  onReject,
}) => {
  // ============================================================
  // POPUP STATE
  // ============================================================
  const [popupType, setPopupType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!business) return null;


  // ============================================================
  // REQUEST INFORMATION
  // ============================================================
  const handleRequestInfoClick = () => {
    setPopupType('request');
  };


  // ============================================================
  // REJECT BUTTON
  // ============================================================
  const handleRejectClick = () => {
    if (!business?.Id) {
      alert('Invalid doctor ID.');
      return;
    }

    console.log(
      '[Business Detail] Reject clicked:',
      business.Id
    );

    // Show confirmation popup first
    setPopupType('reject');
  };


  // ============================================================
  // APPROVE BUTTON
  // ============================================================
  const handleApproveClick = () => {
    if (!business?.Id) {
      alert('Invalid doctor ID.');
      return;
    }

    console.log(
      '[Business Detail] Approve clicked:',
      business.Id
    );

    // Show confirmation popup first
    setPopupType('approve');
  };


  // ============================================================
  // CONFIRM APPROVE
  // ============================================================
  const handleConfirmApprove = async () => {
    if (isSubmitting) return;

    console.log(
      '[Business Detail] Confirm approve:',
      business.Id
    );

    if (!onApprove) {
      console.error(
        '[Business Detail] onApprove function was not provided.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Close the Business Detail confirmation popup first.
      // AdminDashboard will then close the detail screen and show
      // its success popup after the API call succeeds.
      setPopupType(null);

      await onApprove(business);
    } catch (error) {
      console.error(
        '[Business Detail] Approve action failed:',
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  // ============================================================
  // CONFIRM REJECT
  // ============================================================
  const handleConfirmReject = async () => {
    if (isSubmitting) return;

    console.log(
      '[Business Detail] Confirm reject:',
      business.Id
    );

    if (!onReject) {
      console.error(
        '[Business Detail] onReject function was not provided.'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Close the Business Detail confirmation popup first.
      // AdminDashboard will then close the detail screen and show
      // its rejection-success popup after the API call succeeds.
      setPopupType(null);

      await onReject(business);
    } catch (error) {
      console.error(
        '[Business Detail] Reject action failed:',
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  // ============================================================
  // CLOSE POPUP
  // ============================================================
  const handleClosePopup = () => {
    setPopupType(null);
  };


  // ============================================================
  // POPUP CONTENT
  // ============================================================
  const getPopupContent = () => {
    switch (popupType) {
      case 'request':
        return {
          title: 'Information Request Sent',
          message:
            'Your request has been sent successfully. The applicant has been notified and can update their registration with the requested information.',
          type: 'request',
        };

      case 'reject':
        return {
          title: 'Reject Application?',
          message:
            'Are you sure you want to reject this application? This action will reject the doctor registration request.',
          type: 'reject',
        };

      case 'approve':
        return {
          title: 'Approve Business?',
          message:
            'Are you sure you want to approve this business registration? The doctor will be approved and can access their dashboard.',
          type: 'approve',
        };

      default:
        return {
          title: '',
          message: '',
          type: null,
        };
    }
  };


  const popupContent = getPopupContent();


  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto bg-white border border-[#E0E0E0] rounded-[16px] p-6 md:p-8 shadow-sm relative">

      {/* ========================================================
          HEADER
      ======================================================== */}
      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[#346739] hover:opacity-80 transition-opacity cursor-pointer font-['Poppins'] font-medium text-[16px]"
        >
          <span>&lt;&lt;</span>
          Back
        </button>

      </div>


      {/* ========================================================
          TOP BANNER
      ======================================================== */}
      <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-2">

        <h3 className="font-['Poppins'] font-bold text-[18px] text-[#346739]">
          {business.name}
        </h3>

        <p className="font-['Roboto'] text-[14px] text-[#555555]">
          {business.doctor}
          &nbsp;|&nbsp;
          {business.category}
          &nbsp;|&nbsp;
          Registered on {business.date}
        </p>

      </div>


      {/* ========================================================
          MAIN GRID
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ======================================================
            PERSONAL INFORMATION
        ====================================================== */}
        <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-6">

          <h3 className="font-['Poppins'] font-bold text-[16px] text-[#BD4444] tracking-wide">
            PERSONAL INFORMATION
          </h3>


          <div className="flex flex-col md:flex-row gap-6">

            <div className="w-[140px] h-[160px] bg-[#EAEAEA] rounded-[12px] flex-shrink-0"></div>


            <div className="flex flex-col gap-4 flex-grow">

              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Full Name
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  {business.doctor}
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Qualification
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  MBBS, BDS
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Gender
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  Male
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Date of Birth
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  17/9/1987
                </span>
              </div>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Specialization
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                Dentistry
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                WhatsApp Business Number
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                +91 8945671234
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Mobile Number
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                +91 8945671234
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Email Address
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                rajesh@gmail.com
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Years of Experience
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                10
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Password
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                ********
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Medical Registration Number
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                BRN549468
              </span>
            </div>


            <div className="flex items-end">

              <span className="font-['Roboto'] font-medium text-[14px] text-[#346739] cursor-pointer hover:underline">
                Registration document
              </span>

            </div>

          </div>

        </div>


        {/* ======================================================
            RIGHT COLUMN
        ====================================================== */}
        <div className="flex flex-col gap-6">

          {/* Consultation Details */}
          <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-6">

            <h3 className="font-['Poppins'] font-bold text-[16px] text-[#BD4444] tracking-wide">
              CONSULTATION DETAILS
            </h3>


            <div className="grid grid-cols-2 gap-6">

              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Clinic Consultation Fee (₹)
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  500
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Video Consultation Fee (₹)
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  500
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Second Opinion Fee (₹)
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  350
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Consultation Duration
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  20 Minutes
                </span>
              </div>


              <div className="col-span-2">

                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Maximum Patients Per Day
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  50
                </span>

              </div>

            </div>

          </div>


          {/* Clinic Information */}
          <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-6">

            <h3 className="font-['Poppins'] font-bold text-[16px] text-[#BD4444] tracking-wide">
              CLINIC INFORMATION
            </h3>


            <div className="grid grid-cols-2 gap-6">

              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Clinic Name
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  {business.name}
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Address
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  Main Raod, 10th lane
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  City
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  Chennai
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Pincode
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  534872
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  State
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  {business.name}
                </span>
              </div>


              <div>
                <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                  Country
                </span>

                <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                  India
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ========================================================
          BOTTOM GRID
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Working Hours */}
        <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-6">

          <h3 className="font-['Poppins'] font-bold text-[16px] text-[#BD4444] tracking-wide">
            WORKING HOURS
          </h3>


          <div className="grid grid-cols-2 gap-y-6 gap-x-4">

            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Monday
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                9 AM to 1 PM, 3 PM to 9 PM
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Tuesday
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                9 AM to 1 PM, 3 PM to 9 PM
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Wednesday
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                9 AM to 1 PM, 3 PM to 9 PM
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Thursday
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                9 AM to 1 PM, 3 PM to 9 PM
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Friday
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                9 AM to 1 PM, 3 PM to 9 PM
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Saturday
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                9 AM to 1 PM, 3 PM to 5 PM
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Sunday
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                OFF
              </span>
            </div>

          </div>

        </div>


        {/* Payment Information */}
        <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-6">

          <h3 className="font-['Poppins'] font-bold text-[16px] text-[#BD4444] tracking-wide">
            PAYMENT INFORMATION
          </h3>


          <div className="grid grid-cols-2 gap-y-6 gap-x-4">

            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                UPI ID (optional)
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                -
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Account Number
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                54216875421
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Bank Name
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                HDFC
              </span>
            </div>


            <div>
              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                IFSC Code
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                32541687453
              </span>
            </div>


            <div className="col-span-2">

              <span className="font-['Roboto'] text-[12px] text-[#666666] block">
                Account Holder Name
              </span>

              <span className="font-['Roboto'] font-semibold text-[14px] text-[#222222]">
                -
              </span>

            </div>

          </div>

        </div>


        {/* Verification Checklist */}
        <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-6">

          <h3 className="font-['Poppins'] font-bold text-[16px] text-[#BD4444] tracking-wide">
            VERIFICATION CHECKLIST
          </h3>


          <div className="flex flex-col gap-4">

            {[
              'Mobile Verified',
              'Email Verified',
              'Business Documents Verified',
              'Identity Verified',
              'Industry Information Verified',
              'Terms Accepted',
            ].map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 cursor-pointer"
              >

                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#D9D9D9] accent-[#346739]"
                />

                <span className="font-['Roboto'] font-medium text-[14px] text-[#222222]">
                  {item}
                </span>

              </label>
            ))}

          </div>

        </div>


        {/* Approval / Rejection Notes */}
        <div className="border border-[#D9D9D9] rounded-[16px] p-6 bg-white flex flex-col gap-6">

          <h3 className="font-['Poppins'] font-bold text-[16px] text-[#BD4444] tracking-wide">
            APPROVAL/REJECTION NOTES
          </h3>


          <textarea
            rows="5"
            placeholder="Add a note for this business..."
            className="w-full border border-[#D9D9D9] rounded-[12px] p-4 font-['Roboto'] text-[14px] text-[#222222] focus:outline-none focus:border-[#346739] resize-none"
          />

        </div>

      </div>


      {/* ========================================================
          ACTION BUTTONS
      ======================================================== */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">

        {/* Request More Information */}
        <button
          type="button"
          onClick={handleRequestInfoClick}
          className="px-5 py-2.5 rounded-[8px] border border-[#2B73F8] text-[#2B73F8] bg-white font-['Roboto'] font-medium text-[14px] hover:bg-blue-50 transition-colors cursor-pointer"
        >
          Request More Information
        </button>


        {/* Reject */}
        <button
          type="button"
          onClick={handleRejectClick}
          className="px-5 py-2.5 rounded-[8px] bg-[#C94A4A] text-white font-['Roboto'] font-medium text-[14px] hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          Reject Application
        </button>


        {/* Approve */}
        <button
          type="button"
          onClick={handleApproveClick}
          className="px-5 py-2.5 rounded-[8px] bg-[#008000] text-white font-['Roboto'] font-medium text-[14px] hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          Approve Business
        </button>

      </div>


      {/* ========================================================
          FRONT CONFIRMATION POPUP
      ======================================================== */}
      {popupType && (

        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClosePopup}
        >

          <div
            className="relative w-full max-w-[480px] bg-white rounded-[16px] shadow-2xl p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close */}
            <button
              type="button"
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#346739] text-[#346739] flex items-center justify-center hover:bg-[#346739] hover:text-white transition-colors"
            >
              ✕
            </button>


            {/* Request Information */}
            {popupType === 'request' && (

              <div className="flex flex-col items-center text-center gap-5 pt-3">

                <div className="w-16 h-16 rounded-full bg-[#2E9938] flex items-center justify-center text-white text-3xl">
                  ✓
                </div>


                <h3 className="font-['Poppins'] font-bold text-[20px] text-[#2E9938]">
                  {popupContent.title}
                </h3>


                <p className="font-['Roboto'] text-[14px] text-[#444444] leading-relaxed">
                  {popupContent.message}
                </p>


                <button
                  type="button"
                  onClick={handleClosePopup}
                  className="w-full h-[44px] rounded-[8px] bg-[#346739] text-white font-['Roboto'] font-medium hover:bg-[#2C5730]"
                >
                  OK
                </button>

              </div>

            )}


            {/* ==================================================
                REJECT CONFIRMATION
            ================================================== */}
            {popupType === 'reject' && (

              <div className="flex flex-col items-center text-center gap-5 pt-3">

                <div className="w-16 h-16 rounded-full bg-[#C94A4A] flex items-center justify-center text-white text-3xl">
                  !
                </div>


                <h3 className="font-['Poppins'] font-bold text-[20px] text-[#C94A4A]">
                  Reject Application?
                </h3>


                <p className="font-['Roboto'] text-[14px] text-[#444444] leading-relaxed">
                  Are you sure you want to reject this application?
                  <br />
                  <span className="font-semibold">
                    {business.doctor}
                  </span>
                </p>


                <div className="flex w-full gap-3 pt-2">

                  <button
                    type="button"
                    onClick={handleClosePopup}
                    className="flex-1 h-[44px] rounded-[8px] border border-[#D9D9D9] bg-white text-[#444444] font-['Roboto'] font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="flex-1 h-[44px] rounded-[8px] bg-[#C94A4A] text-white font-['Roboto'] font-medium hover:bg-[#B83E3E]"
                  >
                    Yes, Reject
                  </button>

                </div>

              </div>

            )}


            {/* ==================================================
                APPROVE CONFIRMATION
            ================================================== */}
            {popupType === 'approve' && (

              <div className="flex flex-col items-center text-center gap-5 pt-3">

                <div className="w-16 h-16 rounded-full bg-[#008000] flex items-center justify-center text-white text-3xl">
                  ✓
                </div>


                <h3 className="font-['Poppins'] font-bold text-[20px] text-[#008000]">
                  Approve Business?
                </h3>


                <p className="font-['Roboto'] text-[14px] text-[#444444] leading-relaxed">
                  Are you sure you want to approve this business?
                  <br />
                  <span className="font-semibold">
                    {business.doctor}
                  </span>
                </p>


                <div className="flex w-full gap-3 pt-2">

                  <button
                    type="button"
                    onClick={handleClosePopup}
                    className="flex-1 h-[44px] rounded-[8px] border border-[#D9D9D9] bg-white text-[#444444] font-['Roboto'] font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    onClick={handleConfirmApprove}
                    className="flex-1 h-[44px] rounded-[8px] bg-[#008000] text-white font-['Roboto'] font-medium hover:bg-[#006B00]"
                  >
                    Yes, Approve
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default BusinessDetailScreen;