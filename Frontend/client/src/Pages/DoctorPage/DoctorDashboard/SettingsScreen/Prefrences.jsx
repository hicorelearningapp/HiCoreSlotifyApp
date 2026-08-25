import React, { useState } from 'react';

const Preferences = () => {
  // State for form selections based on the image
  const [preferences, setPreferences] = useState({
    timeZone: '',
    language: '',
    dateFormat: '',
    currency: '',
    defaultCalendarView: '',
  });

  const handleChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50  font-sans">
      <div 
        className="w-full bg-white border border-[#D9D9D9] rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-6 md:p-8 pb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#2A723D] mb-1">
            Preferences
          </h1>
          <p className="text-sm text-gray-500">
            Personalize the dashboard and booking experience to match your practice.
          </p>
        </div>

        <hr className="border-t border-[#D9D9D9] w-full" />

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col" style={{ gap: '20px' }}>
          
          {/* Row 1: Time zone & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time zone */}
            <div className="border border-[#D9D9D9] rounded-xl p-4 bg-white">
              <label className="block text-sm fond-semibold tracking-wider text-gray-700 mb-3">
                Time zone
              </label>
              <div className="relative">
                <select
                  value={preferences.timeZone}
                  onChange={(e) => handleChange('timeZone', e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderColor: '#D9D9D9',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                  }}
                  className="text-sm focus:outline-none focus:border-[#2A723D] bg-white appearance-none text-gray-700 cursor-pointer"
                >
                  <option value="" disabled>Select Time zone</option>
                  <option value="IST">India Standard Time (IST)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="border border-[#D9D9D9] rounded-xl p-4 bg-white">
              <label className="block text-sm fond-semibold tracking-wider text-gray-700 mb-3">
                Language
              </label>
              <div className="relative">
                <select
                  value={preferences.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderColor: '#D9D9D9',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                  }}
                  className="text-sm focus:outline-none focus:border-[#2A723D] bg-white appearance-none text-gray-700 cursor-pointer"
                >
                  <option value="" disabled>Select Language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Date format & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date format */}
            <div className="border border-[#D9D9D9] rounded-xl p-4 bg-white">
              <label className="block text-sm fond-semibold tracking-wider text-gray-700 mb-3">
                Date format
              </label>
              <div className="relative">
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderColor: '#D9D9D9',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                  }}
                  className="text-sm focus:outline-none focus:border-[#2A723D] bg-white appearance-none text-gray-700 cursor-pointer"
                >
                  <option value="" disabled>Select Date format</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Currency */}
            <div className="border border-[#D9D9D9] rounded-xl p-4 bg-white">
              <label className="block text-sm fond-semibold tracking-wider text-gray-700 mb-3">
                Currency
              </label>
              <div className="relative">
                <select
                  value={preferences.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderColor: '#D9D9D9',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                  }}
                  className="text-sm focus:outline-none focus:border-[#2A723D] bg-white appearance-none text-gray-700 cursor-pointer"
                >
                  <option value="" disabled>Select Currency</option>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Default calendar view (Full width) */}
          <div className="border border-[#D9D9D9] rounded-xl p-4 bg-white">
            <label className="block text-sm fond-semibold tracking-wider text-gray-700 mb-3">
              Default calendar view
            </label>
            <div className="relative">
              <select
                value={preferences.defaultCalendarView}
                onChange={(e) => handleChange('defaultCalendarView', e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor: '#D9D9D9',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                }}
                className="text-sm focus:outline-none focus:border-[#2A723D] bg-white appearance-none text-gray-700 cursor-pointer"
              >
                <option value="" disabled>Select Default calendar view</option>
                <option value="Day">Day View</option>
                <option value="Week">Week View</option>
                <option value="Month">Month View</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
              Customize Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Preferences;