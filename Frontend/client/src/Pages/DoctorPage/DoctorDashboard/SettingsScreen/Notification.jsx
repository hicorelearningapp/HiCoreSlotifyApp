import React, { useState } from "react";
import { Search } from "lucide-react";
import UnreadNotifications from "../NotificationScreen/UnreadNotifications";
import AppointmentNotifications from "../NotificationScreen/AppointmentNotifications";
import PatientNotifications from "../NotificationScreen/PatientNotifications";
import PaymentNotifications from "../NotificationScreen/PaymentNotifications";
import FollowupNotifications from "../NotificationScreen/FollowupNotifications";
import AllNotifications from "../NotificationScreen/AllNotifications";

const tabs = [
  "All",
  "Unread",
  "Appointments",
  "Patients",
  "Payments",
  "Follow-ups",
];

const Notification = () => {
  const [selectedTab, setSelectedTab] = useState("All");

  const renderContent = () => {
    switch (selectedTab) {
      case "Unread":
        return <UnreadNotifications />;

      case "Appointments":
        return <AppointmentNotifications />;

      case "Patients":
        return <PatientNotifications />;

      case "Payments":
        return <PaymentNotifications />;

      case "Follow-ups":
        return <FollowupNotifications />;

      default:
        return <AllNotifications />;
    }
  };

  return (
    <div className="w-full bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-bold uppercase text-[#4E6F4E]">
          Notifications
        </h2>

        <div className="relative w-[270px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by Patient Name"
            className="w-full h-[34px] rounded-md border border-gray-300 pl-9 pr-3 text-sm outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-5 h-[30px] rounded-full text-[12px] font-medium transition-all ${
              selectedTab === tab
                ? "bg-[#EBF0EB] text-[#4E6F4E] border border-[#626262]"
                : "bg-white text-[#9A9A9A] border border-[#D1D5DB]"
            }`}
            style={{
              boxShadow:
                selectedTab === tab
                  ? "inset 4px 4px 4px 0px #00000040, 0px 4px 4px 0px #00000040"
                  : "0px 2px 4px rgba(0,0,0,.08)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="mt-6 border border-[#D6D6D6] rounded-xl bg-white min-h-[500px] p-5 shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
};

export default Notification;