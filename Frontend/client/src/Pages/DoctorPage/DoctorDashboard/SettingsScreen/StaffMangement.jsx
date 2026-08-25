import React, { useState } from 'react';

const StaffMangement = () => {
  // State for existing staff members
  const [staffList, setStaffList] = useState([
    {
      id: 1,
      name: 'Priya Menon',
      role: 'Receptionist · role-based permissions',
    },
    {
      id: 2,
      name: 'Rahul Nair',
      role: 'Nurse · role-based permissions',
    },
  ]);

  // State for form inputs
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffMemberName, setStaffMemberName] = useState('');

  // Handle delete staff card
  const handleDelete = (id) => {
    setStaffList((prev) => prev.filter((staff) => staff.id !== id));
  };

  // Handle add staff action
  const handleAddStaff = () => {
    if (staffMemberName.trim() === '') return;
    
    const newStaff = {
      id: Date.now(),
      name: staffMemberName,
      role: `${selectedStaff || 'Staff'} · role-based permissions`,
    };

    setStaffList((prev) => [...prev, newStaff]);
    setStaffMemberName('');
    setSelectedStaff('');
  };

  return (
    <div className="min-h-screen bg-gray-50  font-sans">
      <div 
        className="w-full bg-white border border-[#D9D9D9] rounded-2xl shadow-sm flex flex-col overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-6 md:p-8 pb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#2A723D] mb-1">
            Staff Management
          </h1>
          <p className="text-sm text-gray-500">
            Invite your receptionist or assistants and assign role-based permissions.
          </p>
        </div>

        <hr className="border-t border-[#D9D9D9] w-full" />

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col" style={{ gap: '20px' }}>
          
          {/* Dynamically Rendered Staff Cards */}
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="border border-[#D9D9D9] rounded-xl p-4 md:p-5 flex items-center justify-between bg-white"
            >
              <div>
                <h3 className="text-[17px] text-gray-800 mb-2">{staff.name}</h3>
                <p className="text-sm text-gray-500">{staff.role}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(staff.id)}
                className="text-red-500 hover:text-red-700 transition cursor-pointer p-2"
                aria-label="Delete staff"
              >
                {/* Trash Icon SVG */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-7 h-7" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            </div>
          ))}

          {/* Add Staff Form Card */}
          <div className="border border-[#D9D9D9] rounded-xl p-4 md:p-5 bg-white grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            {/* Staff Dropdown Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Staff
              </label>
              <div className="relative">
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
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
                  <option value="" disabled>Select Staff Member</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Assistant">Assistant</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Staff Member Name Input & Add Button Container */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Staff Member Name
                </label>
                <input
                  type="text"
                  value={staffMemberName}
                  onChange={(e) => setStaffMemberName(e.target.value)}
                  placeholder="Enter Staff Member Name"
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

              {/* Add Staff Button */}
              <button
                type="button"
                onClick={handleAddStaff}
                style={{
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: '#2563EB',
                }}
                className="px-5 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition flex items-center justify-center cursor-pointer shrink-0"
              >
                + Add Staff
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffMangement;