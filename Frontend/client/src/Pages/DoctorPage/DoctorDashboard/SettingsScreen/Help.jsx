import React, { useState } from 'react';

// Import icons (adjust path as needed based on your folder structure)
import SearchIcon from '../../../../assets/DoctorDashboard/SearchIcon.png';
import ChevronDownIcon from '../../../../assets/DoctorDashboard/ChevronDownIcon.png';
import EmailIcon from '../../../../assets/DoctorDashboard/email.png';
import WebsiteIcon from '../../../../assets/DoctorDashboard/Browse.png';

const Help = () => {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null); // Track which FAQ accordion is open

  // Support Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Select option');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);

  const categoryOptions = ['Technical Issue', 'Billing & Payments', 'Appointment Booking', 'Account Settings', 'Other'];

  // --- MOCK FAQ DATA ---
  const faqList = [
    {
      question: "How do patients book appointments?",
      answer: "Patients can send a whatsApp message, select a consultation, choose a date and time, and recevie instant cinfirmation."
    },
    {
      question: "Can I reschedule appointments?",
      answer: "Yes, you can easily reschedule appointments by navigating to your Calendar, clicking on the specific appointment row to expand the details, and updating the schedule or status."
    },
    {
      question: "How do I send prescriptions?",
      answer: "You can create and send digital prescriptions directly from the patient's consultation history or prescription section after completing a session."
    },
    {
      question: "Can I set follow-up reminders?",
      answer: "Yes, follow-up reminders can be set while updating appointment notes or through the patient management dashboard."
    },
    {
      question: "Is patient data secure?",
      answer: "All patient data, medical records, and communications are fully encrypted and stored securely in compliance with standard healthcare data privacy regulations."
    }
  ];

  // Filter FAQs based on search input
  const filteredFaqs = faqList.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-[24px] w-full max-w-full pb-8">
      
      {/* --- HEADER ROW (TITLE & SEARCH) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <h2 className="font-['Roboto'] font-semibold text-[20px] leading-[40px] text-[#346739] m-0 uppercase">
          HELP
        </h2>
        
        {/* Search Box */}
        <div className="w-full md:w-[492px] h-[44px] flex items-center gap-[8px] px-[16px] py-[8px] border border-[#AEAEAE] rounded-[8px] bg-[#FFFFFF]">
          <img src={SearchIcon} alt="Search" className="w-[24px] h-[24px] object-contain shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 w-full bg-transparent outline-none font-['Roboto'] font-normal text-[14px] leading-[28px] text-[#346739] placeholder-[#AEAEAE]"
          />
        </div>
      </div>

      {/* --- MAIN FAQ CONTAINER BOX --- */}
      <div className="w-full border border-[#D9D9D9] rounded-[8px] bg-[#FFFFFF] p-[24px] lg:p-[32px] flex flex-col gap-[20px] shadow-sm">
        
        {/* Section Title */}
        <div className="flex flex-col gap-[4px]">
          <h3 className="font-['Roboto'] font-semibold text-[16px] leading-[28px] text-[#A63434] m-0">
            FREQUENTLY ASKED QUESTION
          </h3>
          <p className="font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#626262] m-0">
            Our support team is here to make sure you can focus on what matters: your patients.
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-[16px] mt-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div 
                  key={index}
                  className={`w-full border rounded-[8px] transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-[#346739] bg-[#FBFBFB]' : 'border-[#D9D9D9] bg-[#FFFFFF] hover:border-[#AEAEAE]'
                  }`}
                >
                  {/* Accordion Header */}
                  <div 
                    onClick={() => toggleAccordion(index)}
                    className="w-full min-h-[64px] px-[20px] py-[16px] flex items-center justify-between cursor-pointer select-none"
                  >
                    <span className="font-['Roboto'] font-normal text-[15px] leading-[24px] text-[#346739]">
                      {faq.question}
                    </span>
                    <img 
                      src={ChevronDownIcon} 
                      alt="Toggle" 
                      className={`w-[18px] h-[18px] object-contain transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>

                  {/* Accordion Content Body */}
                  {isOpen && (
                    <div className="px-[20px] pb-[20px] pt-[5px] border-t border-[#EFEFEF]">
                      <p className="font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#626262] m-0">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center font-['Roboto'] font-normal text-[14px] text-[#626262]">
              No matching questions found.
            </div>
          )}
        </div>

      </div>


      {/* --- NEED PERSONAL ASSISTANCE CONTAINER BOX --- */}
      <div className="w-full border border-[#D9D9D9] rounded-[8px] bg-[#FFFFFF] p-[24px] lg:p-[32px] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-[24px] shadow-sm">
        
        {/* Left Side: Title & Description */}
        <div className="flex flex-col gap-[4px] max-w-[400px]">
          <h3 className="font-['Roboto'] font-semibold text-[16px] leading-[28px] text-[#A63434] m-0 uppercase">
            NEED PERSONAL ASSISTANCE?
          </h3>
          <p className="font-['Roboto'] font-normal text-[14px] leading-[24px] text-[#626262] m-0">
            Our support team is here to make sure you can focus on what matters: your patients.
          </p>
        </div>

        {/* Right Side: Two Contact Cards */}
        <div className="flex flex-col sm:flex-row gap-[20px] w-full lg:w-auto">
          
          {/* Email Card */}
          <div className="w-full sm:w-[353px] h-[106px] p-[20px] rounded-[16px] border border-[#346739] bg-[#F1DEC426] flex items-center gap-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25),inset_4px_4px_10px_0px_rgba(0,0,0,0.25)]">
            <img src={EmailIcon} alt="Email" className="w-[48px] h-[48px] object-contain shrink-0" />
            <div className="flex flex-col gap-[2px] overflow-hidden">
              <span className="font-['Roboto'] font-normal text-[12px] leading-[18px] text-[#346739]">Email</span>
              <a href="mailto:info@hicoresoft.com" className="font-['Roboto'] font-semibold text-[14px] leading-[22px] text-[#346739] truncate hover:underline">
                info@hicoresoft.com
              </a>
            </div>
          </div>

          {/* Website Card */}
          <div className="w-full sm:w-[353px] h-[106px] p-[20px] rounded-[16px] border border-[#346739] bg-[#F1DEC426] flex items-center gap-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25),inset_4px_4px_10px_0px_rgba(0,0,0,0.25)]">
            <img src={WebsiteIcon} alt="Website" className="w-[48px] h-[48px] object-contain shrink-0" />
            <div className="flex flex-col gap-[2px] overflow-hidden">
              <span className="font-['Roboto'] font-normal text-[12px] leading-[18px] text-[#346739]">Website</span>
              <a href="https://www.hicoresoft.com" target="_blank" rel="noopener noreferrer" className="font-['Roboto'] font-semibold text-[14px] leading-[22px] text-[#346739] truncate hover:underline">
                www.hicoresoft.com
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Help;