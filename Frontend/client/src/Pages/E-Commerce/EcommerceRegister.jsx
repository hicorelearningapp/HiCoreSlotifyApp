import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuX } from "react-icons/lu";

// ============================================================
// EXTRACTED COMPONENTS (Fixes the input focus loss issue)
// ============================================================

const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

const inputClass =
  "w-full h-[40px] md:h-[44px] px-4 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#2A723D] focus:border-transparent transition-all";

const textareaClass =
  "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#2A723D] focus:border-transparent transition-all resize-none";

const errorInputClass =
  "w-full h-[40px] md:h-[44px] px-4 rounded-xl border border-red-400 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";

const Field = ({ label, name, type = "text", value, onChange, hasError, placeholder = "", required = false, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
      {required && <RequiredMark />}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={hasError ? errorInputClass : inputClass}
      {...props}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, hasError, options, required = false, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
      {required && <RequiredMark />}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={hasError ? `${errorInputClass} text-gray-900` : `${inputClass} text-gray-900`}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({ label, name, value, onChange, hasError, placeholder = "", required = false, rows = 4, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
      {required && <RequiredMark />}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className={hasError ? `${textareaClass} border-red-500` : textareaClass}
    />
  </div>
);

const StepSidebar = ({ sections, activeStep, scrollToSection }) => (
  <div className="w-full lg:w-[250px] shrink-0 lg:sticky lg:top-8">
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-3 shadow-sm overflow-hidden">
      <div className="relative">
        <div className="absolute left-[20px] top-5 bottom-5 w-[2px] bg-gray-200 z-0" />
        <div className="flex flex-col">
          {sections.map((section) => {
            const isActive = activeStep === section.id;
            const isCompleted = activeStep > section.id;
            return (
              <div key={section.id} className="relative z-10 flex items-start min-h-[92px] pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`absolute left-[13px] top-[20px] w-[15px] h-[15px] rounded-full border-2 z-20 transition-all ${
                    isActive || isCompleted ? "bg-[#128807] border-[#128807]" : "bg-white border-gray-300"
                  }`}
                  aria-label={`Go to ${section.stepLabel}`}
                />
                <button
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left pl-9 pr-2 py-2.5 rounded-xl text-[13px] md:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#128807] text-white shadow-md font-semibold"
                      : isCompleted
                      ? "text-[#2A723D] bg-transparent"
                      : "text-gray-500 hover:text-gray-800 bg-transparent"
                  }`}
                >
                  {section.stepLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const SectionCard = ({ id, tag, title, subtitle, children, className = "", registerRef }) => (
  <div
    id={`section-${id}`}
    ref={registerRef}
    className={`w-full bg-white border border-gray-200 rounded-2xl shadow-sm scroll-mt-8 overflow-hidden flex flex-col ${className}`}
  >
    <div className="px-5 pt-5 sm:px-6 sm:pt-6 shrink-0">
      <span className="text-xs font-bold uppercase tracking-wider text-[#E26A6A]">{tag}</span>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 mb-1">{title}</h2>
      <p className="text-sm mt-2 mb-6 text-gray-500">{subtitle}</p>
    </div>
    <div className="px-5 pb-5 sm:px-6 sm:pb-6 overflow-y-auto scrollbar-hide">{children}</div>
  </div>
);


const EcommerceRegister = () => {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [activeStep, setActiveStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Popup States
  const [showPopup, setShowPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: "" });
  const [validationErrors, setValidationErrors] = useState({});

  const sectionRefs = useRef({});
  const profileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // 1. COMMON INFORMATION (Top Level API Fields)
    StoreName: "",
    FullName: "",
    Username: "",
    EmailAddress: "",
    MobileNumber: "",
    WhatsAppNumber: "", // Maps to BusinessPhoneNumber
    Password: "",
    ConfirmPassword: "",
    StoreAddress: "",
    City: "",
    Pincode: "",
    State: "",
    Country: "India",

    // 2. BUSINESS INFORMATION (Dynamic JSON Data)
    BusinessType: "",
    BusinessCategory: "",
    BusinessDescription: "",
    GSTNumber: "",
    PANNumber: "",

    // 3. PRODUCTS & OPERATIONS (Dynamic JSON Data)
    ProductType: "",
    ProductSource: "",
    InventoryType: "",
    WorkingDays: "",

    // 4. PAYMENT & DELIVERY (Dynamic JSON Data)
    PaymentMethods: "",
    DeliveryMethod: "",
    DeliveryAreas: "",
    ReturnPolicy: "",
    BankName: "",
    AccountNumber: "",
    IFSCCode: "",
    UPIId: "",
  });

  const [consents, setConsents] = useState({
    accurate: false,
    terms: false,
    notifications: false,
  });

  // ============================================================
  // SECTION DEFINITIONS
  // ============================================================

  const sections = [
    {
      id: 1,
      stepLabel: "1. General Information",
      tag: "SECTION 01",
      title: "GENERAL INFORMATION",
      subtitle: "Enter your basic account, contact, and store address details.",
    },
    {
      id: 2,
      stepLabel: "2. Business Details",
      tag: "SECTION 02",
      title: "E-COMMERCE BUSINESS DETAILS",
      subtitle: "Provide the required business, category and compliance information for your online business.",
    },
    {
      id: 3,
      stepLabel: "3. Products & Operations",
      tag: "SECTION 03",
      title: "PRODUCTS & OPERATIONS",
      subtitle: "Tell us about the products you sell and how your e-commerce business operates.",
    },
    {
      id: 4,
      stepLabel: "4. Payment & Delivery",
      tag: "SECTION 04",
      title: "PAYMENT & DELIVERY",
      subtitle: "Configure your payment, delivery and customer order fulfilment details.",
    },
    {
      id: 5,
      stepLabel: "5. Verification & Consent",
      tag: "SECTION 05",
      title: "VERIFICATION & CONSENT",
      subtitle: "Review your information and confirm the required declarations before registration.",
    },
  ];

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    if (["MobileNumber", "WhatsAppNumber", "Pincode", "AccountNumber"].includes(name)) {
      updatedValue = value.replace(/\D/g, "");
    }

    if (name === "GSTNumber" || name === "PANNumber" || name === "IFSCCode") {
      updatedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // ============================================================
  // CONSENT CHANGE
  // ============================================================

  const handleConsentChange = (name, value) => {
    setConsents((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // ============================================================
  // FILE CHANGE
  // ============================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      setErrorPopup({ show: true, message: "Please upload only JPG, PNG, or GIF images." });
      if (profileInputRef.current) profileInputRef.current.value = "";
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearProfilePhoto = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
  };

  // ============================================================
  // SCROLL TO SECTION
  // ============================================================

  const scrollToSection = (id) => {
    setActiveStep(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ============================================================
  // ACTIVE SECTION ON SCROLL
  // ============================================================

  useEffect(() => {
    const handleScroll = () => {
      let currentStep = 1;
      sections.forEach((section) => {
        const element = document.getElementById(`section-${section.id}`);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.top <= 220) {
          currentStep = section.id;
        }
      });
      setActiveStep(currentStep);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // ============================================================
  // VALIDATION & SUBMIT API CALL
  // ============================================================

  const validateForm = () => {
    const errors = {};

    const requiredFields = {
      StoreName: "Store Name",
      FullName: "Full Name",
      Username: "Username",
      EmailAddress: "Email Address",
      MobileNumber: "Mobile Number",
      Password: "Password",
      ConfirmPassword: "Confirm Password",
      StoreAddress: "Store Address",
      City: "City",
      Pincode: "Pincode",
      State: "State",
      Country: "Country",
      BusinessType: "Business Type",
      BusinessCategory: "Business Category",
      BusinessDescription: "Business Description",
      ProductType: "Product Type",
      PaymentMethods: "Payment Methods",
      DeliveryMethod: "Delivery Method",
      ReturnPolicy: "Return Policy",
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!String(formData[field] || "").trim()) {
        errors[field] = `${label} is required.`;
      }
    });

    if (formData.EmailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.EmailAddress)) {
      errors.EmailAddress = "Please enter a valid email address.";
    }

    if (formData.MobileNumber && formData.MobileNumber.replace(/\D/g, "").length !== 10) {
      errors.MobileNumber = "Mobile Number must contain 10 digits.";
    }

    if (formData.Password && formData.ConfirmPassword && formData.Password !== formData.ConfirmPassword) {
      errors.ConfirmPassword = "Passwords do not match.";
    }

    if (formData.Pincode && !/^\d{6}$/.test(formData.Pincode)) {
      errors.Pincode = "Pincode must contain 6 digits.";
    }

    if (formData.GSTNumber && !/^[0-9A-Z]{15}$/.test(formData.GSTNumber.trim().toUpperCase())) {
      errors.GSTNumber = "Please enter a valid 15-character GSTIN.";
    }

    if (!consents.accurate) {
      errors.accurate = "Please confirm that the information provided is accurate.";
    }

    if (!consents.terms) {
      errors.terms = "Please agree to the Terms & Conditions and Privacy Policy.";
    }

    if (!consents.notifications) {
      errors.notifications = "Please provide consent for WhatsApp and Email notifications.";
    }

    setValidationErrors(errors);
    return errors;
  };

  const findFirstErrorSection = (errors) => {
    const sectionOneFields = ["StoreName", "FullName", "Username", "EmailAddress", "MobileNumber", "WhatsAppNumber", "Password", "ConfirmPassword", "StoreAddress", "City", "Pincode", "State", "Country"];
    const sectionTwoFields = ["BusinessType", "BusinessCategory", "BusinessDescription", "GSTNumber", "PANNumber"];
    const sectionThreeFields = ["ProductType", "ProductSource", "InventoryType", "WorkingDays"];
    const sectionFourFields = ["PaymentMethods", "DeliveryMethod", "DeliveryAreas", "ReturnPolicy", "BankName", "AccountNumber", "IFSCCode", "UPIId"];

    if (Object.keys(errors).some((key) => sectionOneFields.includes(key))) return 1;
    if (Object.keys(errors).some((key) => sectionTwoFields.includes(key))) return 2;
    if (Object.keys(errors).some((key) => sectionThreeFields.includes(key))) return 3;
    if (Object.keys(errors).some((key) => sectionFourFields.includes(key))) return 4;
    return 5;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    // The browser's native HTML5 validation (tooltips) will trigger first.
    // If it reaches here, all native "required" text/select inputs are filled correctly.

    // 1. Check Profile Image (since the native input is hidden, we must handle this manually)
    if (!selectedFile) {
      setErrorPopup({ show: true, message: "Profile Image is required. Please upload an image." });
      scrollToSection(1);
      return;
    }

    // 2. Custom Password Match Check
    if (formData.Password !== formData.ConfirmPassword) {
      setErrorPopup({ show: true, message: "Passwords do not match." });
      scrollToSection(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Top Box: Common Industry Standards mapped directly
      submitData.append("BusinessName", formData.StoreName || "");
      submitData.append("IndustryType", "Ecommerce"); 
      submitData.append("FullName", formData.FullName || "");
      submitData.append("EmailAddress", formData.EmailAddress || "");
      submitData.append("MobileNumber", `+91${formData.MobileNumber}`);
      submitData.append("BusinessPhoneNumber", formData.WhatsAppNumber || "");
      submitData.append("Address", formData.StoreAddress || "");
      submitData.append("City", formData.City || "");
      submitData.append("State", formData.State || "");
      submitData.append("Pincode", formData.Pincode || "");
      submitData.append("Country", formData.Country || "");
      submitData.append("UserName", formData.Username || "");
      submitData.append("Password", formData.Password || "");

      if (selectedFile) {
        submitData.append("ProfilePic", selectedFile);
      }

      // Bottom Boxes: Dynamic Data Payload customized for Ecommerce
      const businessData = {
        BusinessType: formData.BusinessType,
        BusinessCategory: formData.BusinessCategory,
        BusinessDescription: formData.BusinessDescription,
        GSTNumber: formData.GSTNumber,
        PANNumber: formData.PANNumber,
        ProductType: formData.ProductType,
        ProductSource: formData.ProductSource,
        InventoryType: formData.InventoryType,
        WorkingDays: formData.WorkingDays,
        PaymentMethods: formData.PaymentMethods,
        DeliveryMethod: formData.DeliveryMethod,
        DeliveryAreas: formData.DeliveryAreas,
        ReturnPolicy: formData.ReturnPolicy,
        BankName: formData.BankName,
        AccountNumber: formData.AccountNumber,
        IFSCCode: formData.IFSCCode,
        UPIId: formData.UPIId,
      };

      submitData.append("BusinessData", JSON.stringify(businessData));

      const apiBase = import.meta.env.VITE_API_BASE || "/api";
      const response = await fetch(`${apiBase}/businesses/register`, {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        setShowPopup(true);
      } else {
        const errorData = await response.json().catch(() => null);
        setErrorPopup({ show: true, message: errorData?.detail || errorData?.message || "Registration Failed. Please check the fields and try again." });
      }
    } catch (error) {
      console.error("API Error:", error);
      setErrorPopup({ show: true, message: "An error occurred while connecting to the server. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#333333] font-sans">
      
      {/* ERROR POPUP */}
      {errorPopup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 md:p-10 max-w-md w-full text-center shadow-2xl">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Notice</h3>
            <p className="text-gray-500 mb-8 text-sm md:text-base">{errorPopup.message}</p>
            <button
              type="button"
              onClick={() => setErrorPopup({ show: false, message: "" })}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FULL HEIGHT LEFT RAIL */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] bg-[#2A723D] border-r border-[#1e4e2a] z-50 items-center justify-center">
        <div className="h-full w-full flex flex-col items-center justify-between py-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <div className="mt-6 h-16 w-px bg-white/25" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE FULL PAGE */}
      <div className="lg:ml-[72px] min-h-screen">
        {/* HEADER */}
        <div className="w-full px-4 sm:px-6 md:px-8 pt-6 md:pt-8 mb-8">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center text-gray-500 text-sm font-medium mb-4 hover:text-[#2A723D] transition"
          >
            <span className="mr-1 text-lg">&laquo;</span>
            Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Register Your Store
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-xl mx-auto">
              Complete the sections below to set up your e-commerce store and start selling online.
            </p>
          </div>
        </div>

        {/* FORM */}
        <form className="w-full pb-20" onSubmit={handleSubmit}>
          <div className="w-full max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-5 xl:gap-6 items-start px-4 sm:px-6 md:px-8 lg:px-0">
            
            <StepSidebar sections={sections} activeStep={activeStep} scrollToSection={scrollToSection} />

            <div className="flex-1 min-w-0 w-full flex flex-col gap-9">
              {/* SECTION 1 - GENERAL INFORMATION */}
              <SectionCard id={1} tag="SECTION 01" title="GENERAL INFORMATION" subtitle="Enter your basic account, contact, and store address details." registerRef={(el) => (sectionRefs.current[1] = el)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                  <div className="md:col-span-2">
                    <h3 className="text-[15px] font-bold text-[#2A723D] uppercase tracking-wide">Store Details</h3>
                    <div className="mt-2 h-[1px] bg-gray-200" />
                  </div>
                  
                  {/* Store Name and Profile Image side-by-side in columns */}
                  <Field label="Store Name" name="StoreName" value={formData.StoreName} onChange={handleInputChange} placeholder="Enter Store Name" required className="md:col-span-1" />
                  
                  <div className="relative md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profile Image <RequiredMark />
                    </label>
                    <input id="file-upload" type="file" ref={profileInputRef} className="hidden" accept="image/jpeg,image/png,image/gif" onChange={handleFileChange} />
                    <div 
                      onClick={() => !selectedFile && profileInputRef.current?.click()}
                      className="w-full h-[40px] md:h-[44px] rounded-xl border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-[#F2F7F4] transition bg-white relative px-4"
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-semibold text-[#2A723D] truncate pr-4">{selectedFile.name}</span>
                          <button
                            type="button"
                            onClick={clearProfilePhoto}
                            className="text-red-600 hover:text-red-800 transition p-1"
                            title="Remove Image"
                          >
                            <LuX size={18} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">Click to upload image</span>
                      )}
                    </div>
                  </div>

                  <TextAreaField label="Store Address" name="StoreAddress" value={formData.StoreAddress} onChange={handleInputChange} placeholder="Enter complete store address" required rows={3} className="md:col-span-2 mt-2" />
                  <Field label="City" name="City" value={formData.City} onChange={handleInputChange} placeholder="Enter city" required />
                  <Field label="Pincode" name="Pincode" value={formData.Pincode} onChange={handleInputChange} type="text" minLength={6} maxLength={6} placeholder="Enter 6-digit pincode" required />
                  <SelectField
                    label="State"
                    name="State"
                    value={formData.State}
                    onChange={handleInputChange}
                    required
                    options={["Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh", "Telangana", "Maharashtra", "Delhi", "Gujarat", "West Bengal", "Other"]}
                  />
                  <SelectField
                    label="Country"
                    name="Country"
                    value={formData.Country}
                    onChange={handleInputChange}
                    required
                    options={["India", "United States", "United Kingdom", "United Arab Emirates", "Singapore", "Other"]}
                  />

                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-[15px] font-bold text-[#2A723D] uppercase tracking-wide">Owner / Contact Details</h3>
                    <div className="mt-2 h-[1px] bg-gray-200" />
                  </div>
                  <Field label="Full Name" name="FullName" value={formData.FullName} onChange={handleInputChange} placeholder="Enter full name" required />
                  <Field label="Email Address" name="EmailAddress" value={formData.EmailAddress} onChange={handleInputChange} type="email" placeholder="Enter email address" required />
                  <Field label="Mobile Number" name="MobileNumber" value={formData.MobileNumber} onChange={handleInputChange} type="tel" minLength={10} maxLength={10} placeholder="Enter 10-digit mobile number" required />
                  <Field label="Business WhatsApp Number" name="WhatsAppNumber" value={formData.WhatsAppNumber} onChange={handleInputChange} type="tel" minLength={10} maxLength={10} placeholder="Enter WhatsApp number" />

                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-[15px] font-bold text-[#2A723D] uppercase tracking-wide">User Account Details</h3>
                    <div className="mt-2 h-[1px] bg-gray-200" />
                  </div>
                  <Field label="Username" name="Username" value={formData.Username} onChange={handleInputChange} placeholder="Create a username" required className="md:col-span-2" />
                  <Field label="Password" name="Password" value={formData.Password} onChange={handleInputChange} type="password" placeholder="Create a password" required />
                  <Field label="Confirm Password" name="ConfirmPassword" value={formData.ConfirmPassword} onChange={handleInputChange} type="password" placeholder="Confirm your password" required />
                </div>
              </SectionCard>

              {/* SECTION 2 - BUSINESS DETAILS */}
              <SectionCard id={2} tag="SECTION 02" title="E-COMMERCE BUSINESS DETAILS" subtitle="Provide the required business, category and compliance information for your online business." registerRef={(el) => (sectionRefs.current[2] = el)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                  <SelectField
                    label="Business Type"
                    name="BusinessType"
                    value={formData.BusinessType}
                    onChange={handleInputChange}
                    required
                    options={["Individual / Sole Proprietor", "Partnership", "Private Limited", "Public Limited", "LLP", "Other"]}
                  />
                  <SelectField
                    label="Business Category"
                    name="BusinessCategory"
                    value={formData.BusinessCategory}
                    onChange={handleInputChange}
                    required
                    options={["Fashion & Apparel", "Electronics", "Beauty & Personal Care", "Home & Living", "Food & Grocery", "Health & Wellness", "Jewellery", "Books & Education", "Sports & Fitness", "Other"]}
                  />
                  <TextAreaField label="Business Description" name="BusinessDescription" value={formData.BusinessDescription} onChange={handleInputChange} placeholder="Describe your e-commerce business" required rows={4} className="md:col-span-2" />
                  <Field label="GST Number" name="GSTNumber" value={formData.GSTNumber} onChange={handleInputChange} maxLength={15} placeholder="Enter GSTIN" />
                  <Field label="PAN Number" name="PANNumber" value={formData.PANNumber} onChange={handleInputChange} maxLength={10} placeholder="Enter PAN number" />
                </div>
              </SectionCard>

              {/* SECTION 3 - PRODUCTS & OPERATIONS */}
              <SectionCard id={3} tag="SECTION 03" title="PRODUCTS & OPERATIONS" subtitle="Tell us about the products you sell and how your e-commerce business operates." registerRef={(el) => (sectionRefs.current[3] = el)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                  <SelectField
                    label="Product Type"
                    name="ProductType"
                    value={formData.ProductType}
                    onChange={handleInputChange}
                    required
                    options={["Physical Products", "Digital Products", "Services", "Physical & Digital"]}
                  />
                  <SelectField
                    label="Product Source"
                    name="ProductSource"
                    value={formData.ProductSource}
                    onChange={handleInputChange}
                    options={["Own Manufacturing", "Wholesale", "Dropshipping", "Third Party Supplier", "Mixed"]}
                  />
                  <SelectField
                    label="Inventory Type"
                    name="InventoryType"
                    value={formData.InventoryType}
                    onChange={handleInputChange}
                    options={["Own Inventory", "Supplier Inventory", "Dropshipping", "Mixed"]}
                  />
                  <Field label="Working Days" name="WorkingDays" value={formData.WorkingDays} onChange={handleInputChange} placeholder="e.g. Monday - Saturday" />
                </div>
              </SectionCard>

              {/* SECTION 4 - PAYMENT & DELIVERY */}
              <SectionCard id={4} tag="SECTION 04" title="PAYMENT & DELIVERY" subtitle="Configure your payment, delivery and customer order fulfilment details." registerRef={(el) => (sectionRefs.current[4] = el)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                  <SelectField
                    label="Payment Methods"
                    name="PaymentMethods"
                    value={formData.PaymentMethods}
                    onChange={handleInputChange}
                    required
                    options={["UPI", "Credit / Debit Card", "Net Banking", "Cash on Delivery", "UPI & Cards", "Multiple Payment Methods"]}
                  />
                  <SelectField
                    label="Delivery Method"
                    name="DeliveryMethod"
                    value={formData.DeliveryMethod}
                    onChange={handleInputChange}
                    required
                    options={["Standard Delivery", "Express Delivery", "Same Day Delivery", "Pickup", "Multiple Delivery Options"]}
                  />
                  <Field label="Delivery Areas" name="DeliveryAreas" value={formData.DeliveryAreas} onChange={handleInputChange} placeholder="e.g. Pan India" />
                  <SelectField
                    label="Return Policy"
                    name="ReturnPolicy"
                    value={formData.ReturnPolicy}
                    onChange={handleInputChange}
                    required
                    options={["7 Days Return", "14 Days Return", "30 Days Return", "No Return", "Product Dependent"]}
                  />

                  <div className="md:col-span-2 pt-3">
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-base font-bold text-[#2A723D] mb-5">BANK / PAYMENT INFORMATION</h3>
                    </div>
                  </div>

                  <Field label="Bank Name" name="BankName" value={formData.BankName} onChange={handleInputChange} placeholder="Enter bank name" />
                  <Field label="Bank Account Number" name="AccountNumber" value={formData.AccountNumber} onChange={handleInputChange} placeholder="Enter account number" />
                  <Field label="IFSC Code" name="IFSCCode" value={formData.IFSCCode} onChange={handleInputChange} placeholder="Enter IFSC code" />
                  <Field label="UPI ID" name="UPIId" value={formData.UPIId} onChange={handleInputChange} placeholder="example@upi" />
                </div>
              </SectionCard>

              {/* SECTION 5 - VERIFICATION & CONSENT */}
              <SectionCard id={5} tag="SECTION 05" title="VERIFICATION & CONSENT" subtitle="Review your information and confirm the required declarations before registration." registerRef={(el) => (sectionRefs.current[5] = el)}>
                <div className="space-y-5">
                  <div>
                    <label className="flex items-start gap-3 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={consents.accurate}
                        onChange={(e) => handleConsentChange("accurate", e.target.checked)}
                        className="mt-0.5 w-[18px] h-[18px] rounded border-gray-300 accent-[#2A723D] cursor-pointer"
                      />
                      <span>I confirm that all information provided in this registration form is accurate and complete. <RequiredMark /></span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-start gap-3 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={consents.terms}
                        onChange={(e) => handleConsentChange("terms", e.target.checked)}
                        className="mt-0.5 w-[18px] h-[18px] rounded border-gray-300 accent-[#2A723D] cursor-pointer"
                      />
                      <span>I agree to the Terms & Conditions and Privacy Policy. <RequiredMark /></span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-start gap-3 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={consents.notifications}
                        onChange={(e) => handleConsentChange("notifications", e.target.checked)}
                        className="mt-0.5 w-[18px] h-[18px] rounded border-gray-300 accent-[#2A723D] cursor-pointer"
                      />
                      <span>I consent to receive order, account and business notifications through WhatsApp and Email. <RequiredMark /></span>
                    </label>
                  </div>

                  <div className="border-t border-gray-200 pt-5 mt-4">
                    <p className="text-xs text-gray-500">
                      <span className="text-red-500">*</span> Required fields must be completed before registration.
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* REGISTER BUTTON */}
              <div className="w-full pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-[220px] h-[50px] rounded-xl text-white text-base font-bold shadow-md transition-all flex items-center justify-center ${
                    isSubmitting ? "bg-[#a0c4a8] cursor-not-allowed" : "bg-[#2A723D] hover:bg-[#235d32]"
                  }`}
                >
                  {isSubmitting ? "Registering..." : "Register Store"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-8 md:p-10 max-w-md w-full text-center shadow-2xl">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Registration Successful!</h3>
            <p className="text-gray-500 mb-8 text-sm md:text-base">
              Your store registration has been completed successfully. You can now login to your dashboard.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowPopup(false);
                navigate('/ecommerce-login');
              }}
              className="w-full bg-[#2A723D] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#235d32] transition-colors shadow-sm"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcommerceRegister;