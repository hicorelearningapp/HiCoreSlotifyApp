import React from 'react';
import Profile from './SettingsScreen/Profile';

const Settings = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-['Poppins'] font-bold text-[24px] leading-[32px] text-[#346739] m-0">
          SETTINGS
        </h2>
      </div>

      {/* Profile Screen Directly */}
      <div className="bg-white h-auto w-full">
        <Profile />
      </div>
    </div>
  );
};

export default Settings;