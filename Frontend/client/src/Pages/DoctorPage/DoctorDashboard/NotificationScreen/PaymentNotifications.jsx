import React from "react";
import { ArrowUpRight } from "lucide-react";
// Import your payment icon from the assets folder
import paymentIcon from "../../../../assets/Notification/Payment.png"; 

const paymentNotificationsData = [
  {
    id: 5,
    type: "payment",
    title: "Payment Received",
    description: "Consultation fee of ₹700 received from Sneha Patel.",
    time: "45 minutes ago",
    actionText: "View Payment",
    borderColor: "border-[#9B7EDE]",
    hoverBg: "hover:bg-[#F5F2FB]",
  },
];

const PaymentNotifications = () => {
  return (
    <div className="flex flex-col gap-4">
      {paymentNotificationsData.map((item) => (
        <div
          key={item.id}
          className={`flex items-start justify-between p-4 rounded-xl border ${item.borderColor} ${item.hoverBg} transition-all duration-200 bg-white cursor-pointer shadow-sm hover:shadow-md`}
        >
          <div className="flex items-start gap-4">
            {/* Notification Icon Container */}
            <div className="w-[90px] h-[90px] rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0 p-2">
              <img
                src={paymentIcon}
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

export default PaymentNotifications;