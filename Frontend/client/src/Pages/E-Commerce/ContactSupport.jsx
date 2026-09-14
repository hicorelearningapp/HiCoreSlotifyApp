import React, { useState } from 'react';
import {
  FiHelpCircle,
  FiMessageCircle,
  FiMail,
  FiPhone,
  FiChevronDown,
  FiSend,
  FiSearch,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';

const ContactSupport = ({ setActivePage }) => {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'General Support',
    message: '',
  });

  const faqs = [
    {
      question: 'How do I add a new product?',
      answer: 'Go to Products → Add Product from the sidebar. Enter the product details, upload images, set pricing and inventory, then save the product.',
    },
    {
      question: 'How can I update an order status?',
      answer: 'Open Orders from the sidebar, select the required order and use the status action to update the order.',
    },
    {
      question: 'How do I connect WhatsApp?',
      answer: 'Go to WhatsApp or Settings → Connections and use the WhatsApp connection option to connect your business account.',
    },
    {
      question: 'How can I manage inventory?',
      answer: 'Go to Products → Inventory. You can view stock levels and update inventory information from there.',
    },
    {
      question: 'How do I update my business information?',
      answer: 'Open Settings → Business Profile and click Edit Profile to update your business details.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      alert('Please enter subject and message.');
      return;
    }

    alert('Your support request has been submitted successfully.');

    setFormData({
      subject: '',
      category: 'General Support',
      message: '',
    });
  };

  return (
    <div className="min-h-full bg-[#F8F9FA] p-5 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F2F7F4] text-[#2A723D] flex items-center justify-center">
            <FiHelpCircle size={23} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Contact Support
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Get help with your Slotify store
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          QUICK SUPPORT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* CHAT */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#2A723D] transition">
          <div className="w-11 h-11 rounded-xl bg-[#F2F7F4] text-[#2A723D] flex items-center justify-center mb-4">
            <FiMessageCircle size={21} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Live Chat</h3>
          <p className="text-xs text-gray-500 mt-1 leading-5">
            Chat with our support team for quick assistance.
          </p>
          <button type="button" className="mt-4 text-xs font-semibold text-[#2A723D] hover:text-[#235d32]">
            Start Chat →
          </button>
        </div>

        {/* EMAIL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#2A723D] transition">
          <div className="w-11 h-11 rounded-xl bg-[#F2F7F4] text-[#2A723D] flex items-center justify-center mb-4">
            <FiMail size={21} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Email Support</h3>
          <p className="text-xs text-gray-500 mt-1 leading-5">
            Send us an email and our team will get back to you.
          </p>
          <button type="button" className="mt-4 text-xs font-semibold text-[#2A723D] hover:text-[#235d32]">
            support@slotify.com →
          </button>
        </div>

        {/* PHONE */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#2A723D] transition">
          <div className="w-11 h-11 rounded-xl bg-[#F2F7F4] text-[#2A723D] flex items-center justify-center mb-4">
            <FiPhone size={21} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Phone Support</h3>
          <p className="text-xs text-gray-500 mt-1 leading-5">
            Talk directly with our support team.
          </p>
          <button type="button" className="mt-4 text-xs font-semibold text-[#2A723D] hover:text-[#235d32]">
            +91 1800 123 456 →
          </button>
        </div>

      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">

        {/* ===================================================
            LEFT - SUPPORT FORM
        =================================================== */}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Send us a message</h2>
            <p className="text-xs text-gray-500 mt-1">
              Tell us what you need help with and our support team will assist you.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* SUBJECT */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter your issue"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#2A723D] focus:ring-2 focus:ring-[#F2F7F4]"
              />
            </div>

            {/* CATEGORY */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white outline-none focus:border-[#2A723D] focus:ring-2 focus:ring-[#F2F7F4]"
              >
                <option>General Support</option>
                <option>Products</option>
                <option>Orders</option>
                <option>Payments</option>
                <option>Inventory</option>
                <option>WhatsApp</option>
                <option>Instagram</option>
                <option>Account & Security</option>
                <option>Technical Issue</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={7}
                placeholder="Describe your issue in detail..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none resize-none focus:border-[#2A723D] focus:ring-2 focus:ring-[#F2F7F4]"
              />
            </div>

            {/* SUBMIT */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2A723D] hover:bg-[#235d32] text-white text-sm font-semibold transition"
              >
                <FiSend size={16} />
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* ===================================================
            RIGHT - FAQ
        =================================================== */}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 h-fit">
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-1">
              <FiBookOpen size={19} className="text-[#2A723D]" />
              <h2 className="text-lg font-bold text-gray-900">Help Center</h2>
            </div>
            <p className="text-xs text-gray-500">Find quick answers to common questions.</p>
          </div>

          {/* SEARCH */}
          <div className="relative mb-5">
            <FiSearch size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#2A723D] focus:ring-2 focus:ring-[#F2F7F4]"
            />
          </div>

          {/* FAQ */}
          <div className="space-y-2">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No help articles found.
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50"
                    >
                      <span className="text-xs font-semibold text-gray-800">
                        {faq.question}
                      </span>
                      <FiChevronDown
                        size={16}
                        className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs leading-5 text-gray-500">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SUPPORT STATUS
      ===================================================== */}

      <div className="mt-5 bg-[#F2F7F4] border border-[#D4E3D9] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#2A723D] flex items-center justify-center">
              <FiClock size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Support Hours</h4>
              <p className="text-xs text-gray-500 mt-1">Monday - Saturday · 9:00 AM - 6:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle size={17} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">Support team is available</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ContactSupport;