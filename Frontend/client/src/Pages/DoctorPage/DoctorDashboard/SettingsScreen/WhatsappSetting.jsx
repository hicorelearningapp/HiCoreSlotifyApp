import React, { useState } from 'react';

const WhatsappSetting = () => {
  // State for toggles based on the image
  const [settings, setSettings] = useState({
    businessWhatsApp: true,
    bookingConfirmation: true,
    appointmentReminder: true,
    medicineReminder: true,
    followUpReminder: true,
    reviewReminder: true,
  });

  const [whatsappNumber, setWhatsappNumber] = useState('');

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Data configuration for dynamic card rendering
  const reminderCards = [
    {
      key: 'businessWhatsApp',
      title: 'Business WhatsApp',
      description: 'Use WhatsApp Business API for patient messaging',
    },
    {
      key: 'bookingConfirmation',
      title: 'Booking confirmation',
      description: 'Send a message when a patient books an appointment',
    },
    {
      key: 'appointmentReminder',
      title: 'Appointment reminder',
      description: 'Remind patients ahead of their scheduled visit',
    },
    {
      key: 'medicineReminder',
      title: 'Medicine reminder',
      description: 'Send scheduled medicine reminders to patients',
    },
    {
      key: 'followUpReminder',
      title: 'Follow-up reminder',
      description: 'Nudge patients to book a follow-up visit',
    },
    {
      key: 'reviewReminder',
      title: 'Review reminder',
      description: 'Ask patients to leave a review after their visit',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div 
        className="w-full bg-white border border-[#D9D9D9] rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-6 md:p-8 pb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#2A723D] mb-1">
            WhatsApp Settings
          </h1>
          <p className="text-sm text-gray-500">
            Automate WhatsApp messages and reminders for your patients.
          </p>
        </div>

        <hr className="border-t border-[#D9D9D9] w-full" />

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col" style={{ gap: '24px' }}>
          {/* WhatsApp Business Number Input */}
          <div>
            <label className="block text-[18px] font-bold  tracking-wider text-gray-700 mb-2">
              WhatsApp Business Number
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+91 98450 12345"
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                borderWidth: '1px',
                borderColor: '#D9D9D9',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
              className="text-sm focus:outline-none focus:border-[#2A723D] placeholder-gray-300 bg-white"
            />
          </div>

          {/* Toggles Grid (2 Columns - Dynamically Rendered) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminderCards.map((card) => {
              const isActive = settings[card.key];
              return (
                <div
                  key={card.key}
                  className="border border-[#D9D9D9] rounded-xl p-4 flex items-center justify-between bg-white"
                >
                  <div className="pr-4">
                    <h3 className="text-[16px] text-gray-800 mb-3">{card.title}</h3>
                    <p className="text-sm text-gray-500">{card.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(card.key)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                      isActive ? 'bg-[#2563EB]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        isActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              style={{
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#008000',
              }}
              className="px-6 text-white text-sm font-bold shadow-md hover:bg-[#006600] transition flex items-center justify-center cursor-pointer"
            >
              Configure WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsappSetting;