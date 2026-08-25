import React, { useState } from 'react';

const Integrations = () => {
  // State to manage integration connections dynamically
  const [integrations, setIntegrations] = useState([
    {
      id: 'googleCalendar',
      name: 'Google Calendar',
      status: 'Connected',
    },
    {
      id: 'outlookCalendar',
      name: 'Outlook Calendar',
      status: 'Not connected',
    },
    {
      id: 'whatsappBusiness',
      name: 'WhatsApp Business',
      status: 'Connected',
    },
    {
      id: 'paymentGateway',
      name: 'Payment Gateway',
      status: 'Connected',
    },
    {
      id: 'email',
      name: 'Email',
      status: 'Not connected',
    },
    {
      id: 'smsGateway',
      name: 'SMS Gateway',
      status: 'Not connected',
    },
  ]);

  // Toggle connection status between Connected and Not connected
  const handleToggleConnection = (id) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Connected' ? 'Not connected' : 'Connected',
            }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans ">
      <div 
        className="w-full bg-white border border-[#D9D9D9] rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-6 md:p-8 pb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#2A723D] mb-1">
            Integrations
          </h1>
          <p className="text-sm mt-2 text-gray-500">
            Integrate SLOTIFY with your everyday tools for a seamless workflow.
          </p>
        </div>

        <hr className="border-t border-[#D9D9D9] w-full" />

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col" style={{ gap: '16px' }}>
          {/* Dynamically Rendered Integration Cards */}
          {integrations.map((item) => {
            const isConnected = item.status === 'Connected';
            return (
              <div
                key={item.id}
                className="border border-[#D9D9D9] rounded-xl p-4 md:p-5 flex items-center justify-between bg-white"
              >
                <div>
                  <h3 className="text-[17px] text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.status}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleConnection(item.id)}
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                  }}
                  className={`px-5 text-sm font-semibold transition cursor-pointer flex items-center justify-center ${
                    isConnected
                      ? 'bg-white border border-[#D9D9D9] text-gray-700 hover:bg-gray-50 shadow-sm'
                      : 'bg-[#008000] text-white hover:bg-[#006600] shadow-sm'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Integrations;