import React from "react";
import { ArrowUpRight } from "lucide-react";
// Import your icons from the assets folder
import appointmentIcon from "../../../../assets/Notification/Appointement.png"; 
import patientIcon from "../../../../assets/Notification/Patients.png";
import paymentIcon from "../../../../assets/Notification/Payment.png";

const notificationsData = [
  {
    id: 1,
    type: "appointment",
    title: "Appointment Cancelled",
    description: "Arun Kumar cancelled today's appointment.",
    time: "30 minutes ago",
    actionText: "View Appointment",
    borderColor: "border-[#6893D6]",
    hoverBg: "hover:bg-[#F0F4FA]",
  },
  {
    id: 2,
    type: "appointment",
    title: "New Appointment",
    description: "Rahul Sharma booked an appointment for Today at 10:30 AM.",
    time: "2 minutes ago",
    actionText: "Accept Appointment",
    borderColor: "border-[#6893D6]",
    hoverBg: "hover:bg-[#F0F4FA]",
  },
  {
    id: 3,
    type: "appointment",
    title: "Appointment Rescheduled",
    description: "Priya Menon rescheduled her consultation to Tomorrow, 4:00 PM.",
    time: "15 minutes ago",
    actionText: "Check Appointment",
    borderColor: "border-[#6893D6]",
    hoverBg: "hover:bg-[#F0F4FA]",
  },
  {
    id: 4,
    type: "patient",
    title: "Patient Checked In",
    description: "Meena Reddy has arrived at the clinic and is waiting.",
    time: "5 minutes ago",
    actionText: "Start Consultation",
    borderColor: "border-[#E5B84C]",
    hoverBg: "hover:bg-[#FCF9F0]",
  },
  {
    id: 5,
    type: "payment",
    title: "Payment Received",
    description: "Consultation fee of ₹700 received from Sneha Patel.",
    time: "45 minutes ago",
    actionText: "",
    borderColor: "border-[#9B7EDE]",
    hoverBg: "hover:bg-[#F5F2FB]",
  },
];

// Helper function to return the correct icon based on the type
const getIcon = (type) => {
  switch (type) {
    case "appointment":
      return appointmentIcon;
    case "patient":
      return patientIcon;
    case "payment":
      return paymentIcon;
    default:
      return appointmentIcon;
  }
};

const AllNotifications = () => {
  return (
    <div className="flex flex-col gap-4">
      {notificationsData.map((item) => (
        <div
          key={item.id}
          className={`flex items-start justify-between p-4 rounded-xl border ${item.borderColor} ${item.hoverBg} transition-all duration-200 bg-white cursor-pointer shadow-sm hover:shadow-md`}
        >
          <div className="flex items-start gap-4">
            {/* Notification Icon Container */}
            <div className="w-[90px] h-[90px] rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0 p-2">
              <img
                src={getIcon(item.type)}
                alt={item.title}
                className="w-20 h-20 object-contain"
              />
            </div>

            {/* Notification Content */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-gray-900">
                  {item.title}
                </h4>
                <p className="text-[13px] text-gray-600 mt-2">
                  {item.description}
                </p>
              </div>

              {item.actionText && (
                <div className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-[#66BB6A] hover:underline">
                  <span>{item.actionText}</span>
                  <ArrowUpRight size={14} />
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <span className="text-[12px] text-gray-400 whitespace-nowrap ml-4">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AllNotifications;