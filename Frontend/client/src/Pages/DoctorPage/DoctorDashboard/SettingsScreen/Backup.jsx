import React, { useState } from 'react';

const Backup = () => {
  // State for automatic backup toggle
  const [automaticBackup, setAutomaticBackup] = useState(true);

  // Data configuration for export/backup items
  const backupItems = [
    {
      id: 'exportPatientData',
      title: 'Export Patient Data',
      description: 'Generates a downloadable file (demo)',
      type: 'export',
    },
    {
      id: 'exportAppointments',
      title: 'Export Appointments',
      description: 'Generates a downloadable file (demo)',
      type: 'export',
    },
    {
      id: 'exportRevenueReports',
      title: 'Export Revenue Reports',
      description: 'Generates a downloadable file (demo)',
      type: 'export',
    },
    {
      id: 'automaticBackup',
      title: 'Automatic backup',
      description: 'Back up your practice data every night at 2:00 AM',
      type: 'toggle',
    },
  ];

  const handleExport = (title) => {
    alert(`Starting demo export for: ${title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div 
        className="w-full bg-white border border-[#D9D9D9] rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-6 md:p-8 pb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#2A723D] mb-2">
            Backup & Data Export
          </h1>
          <p className="text-sm text-gray-500">
            Export reports and maintain secure backups of your practice information
          </p>
        </div>

        <hr className="border-t border-[#D9D9D9] w-full" />

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col" style={{ gap: '16px' }}>
          {/* Dynamically Rendered Backup Cards */}
          {backupItems.map((item) => {
            if (item.type === 'export') {
              return (
                <div
                  key={item.id}
                  className="border border-[#D9D9D9] rounded-xl p-4 md:p-5 flex items-center justify-between bg-white"
                >
                  <div className="pr-4">
                    <h3 className="text-[17px]  text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExport(item.title)}
                    style={{
                      height: '40px',
                      borderRadius: '12px',
                    }}
                    className="px-5 bg-[#2563EB] text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition flex items-center justify-center cursor-pointer shrink-0"
                  >
                    Export
                  </button>
                </div>
              );
            }

            if (item.type === 'toggle') {
              return (
                <div
                  key={item.id}
                  className="border border-[#D9D9D9] rounded-xl p-4 md:p-5 flex items-center justify-between bg-white"
                >
                  <div className="pr-4">
                    <h3 className="text-[17px] text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutomaticBackup((prev) => !prev)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer shrink-0 ${
                      automaticBackup ? 'bg-[#2563EB]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        automaticBackup ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            }

            return null;
          })}

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
              Save Backup Setting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;