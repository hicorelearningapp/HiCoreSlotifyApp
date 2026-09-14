import React from "react";

// Local asset imports
import manualDmsIcon from "../../assets/SellingComparison/manual-dms.png";
import repeatedQuestionsIcon from "../../assets/SellingComparison/repeated-questions.png";
import scatteredChatsIcon from "../../assets/SellingComparison/scattered-chats.png";
import productSharingIcon from "../../assets/SellingComparison/product-sharing.png";
import followUpsIcon from "../../assets/SellingComparison/follow-ups.png";
import instagramWhatsappIcon from "../../assets/SellingComparison/instagram-whatsapp.png";
import paymentTrackingIcon from "../../assets/SellingComparison/payment-tracking.png";
import orderTrackingIcon from "../../assets/SellingComparison/order-tracking.png";
import analyticsIcon from "../../assets/SellingComparison/analytics.png";

const comparisons = [
  {
    manualTitle: "Manually check DMs",
    manualDescription:
      "Check Instagram messages one by one and risk missing potential buyers.",
    solutionTitle: "AI responds automatically",
    solutionDescription:
      "AI responds to customer inquiries instantly, even when you're busy.",
    icon: manualDmsIcon,
  },
  {
    manualTitle: "Repeated questions",
    manualDescription:
      "Spend time repeatedly answering price, size, colour and availability questions.",
    solutionTitle: "AI answers instantly",
    solutionDescription:
      "AI understands common questions and provides relevant product information instantly.",
    icon: repeatedQuestionsIcon,
  },
  {
    manualTitle: "Orders through scattered chats",
    manualDescription:
      "Customer details and orders get buried across multiple conversations.",
    solutionTitle: "One order dashboard",
    solutionDescription:
      "Manage conversations, customers, orders and payments from one place.",
    icon: scatteredChatsIcon,
  },
  {
    manualTitle: "Manual product sharing",
    manualDescription:
      "Search for product images and details every time a customer asks.",
    solutionTitle: "Smart product information",
    solutionDescription:
      "AI automatically shares the right product, price, variants and availability.",
    icon: productSharingIcon,
  },
  {
    manualTitle: "Manual follow-ups",
    manualDescription:
      "Remembering to follow up with every interested customer is difficult.",
    solutionTitle: "Automated conversations",
    solutionDescription:
      "Keep customers engaged with timely, automated follow-ups.",
    icon: followUpsIcon,
  },
  {
    manualTitle: "Separate Instagram & WhatsApp",
    manualDescription:
      "Customer conversations are split between different platforms.",
    solutionTitle: "Connected customer journey",
    solutionDescription:
      "Move seamlessly from Instagram discovery to WhatsApp purchase.",
    icon: instagramWhatsappIcon,
  },
  {
    manualTitle: "Manual payment tracking",
    manualDescription:
      "Check chats and payment records separately to verify transactions.",
    solutionTitle: "Organized payment records",
    solutionDescription:
      "Keep payment status and transaction information connected to each order.",
    icon: paymentTrackingIcon,
  },
  {
    manualTitle: "Manual order tracking",
    manualDescription:
      "Manage order status through messages, spreadsheets or separate tools.",
    solutionTitle: "Centralized order management",
    solutionDescription:
      "Track every order from confirmation to shipping and delivery.",
    icon: orderTrackingIcon,
  },
  {
    manualTitle: "Limited business insights",
    manualDescription:
      "It's difficult to know which products, customers and channels are driving sales.",
    solutionTitle: "Real-time analytics",
    solutionDescription:
      "Track sales, products, customers, conversions and business growth in real time.",
    icon: analyticsIcon,
  },
];

const SectionHeading = () => {
  return (
    <div className="flex w-full max-w-[650px] flex-col items-center">
      <h2 className="m-0 text-center text-[18px] font-semibold uppercase leading-[29px] text-[#346739] sm:text-[20px] sm:leading-8 md:text-[23px] md:leading-[39px] lg:text-[28px] lg:leading-12">
        SELLING MANUALLY{" "}
        <span className="normal-case">vs HiCoreSlotify</span>
      </h2>

      {/* Heading underline */}
      <div className="mt-1 flex w-full max-w-[430px] items-center md:max-w-none">
        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#346739]" />

        <span className="h-[2px] flex-1 bg-[#346739]" />

        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#346739]" />
      </div>
    </div>
  );
};

/* --- DESKTOP/LAPTOP COMPONENTS --- */
const ComparisonCard = ({ type, title, description }) => {
  const isManual = type === "manual";

  return (
    <article
      className={`flex h-[112px] min-w-0 flex-col items-center justify-center gap-1.5 border border-[#d9d9d9] bg-white px-2 py-3 text-center sm:h-[118px] sm:px-3 md:h-[122px] md:px-4 lg:h-[104px] lg:px-6 ${
        isManual
          ? "rounded-l-[12px] sm:rounded-l-[16px]"
          : "rounded-r-[12px] sm:rounded-r-[16px]"
      }`}
    >
      <h3
        className={`m-0 w-full text-center text-[11px] font-semibold leading-5 sm:text-[13px] sm:leading-6 md:text-[15px] md:leading-7 lg:text-[16px] lg:leading-9 ${
          isManual ? "text-[#bd4444]" : "text-[#346739]"
        }`}
      >
        {title}
      </h3>

      <p className="m-0 hidden w-full text-center text-[10px] font-normal leading-[17px] text-[#828282] min-[430px]:line-clamp-2 min-[430px]:block sm:text-[11px] sm:leading-5 md:text-[13px] md:leading-[23px] lg:text-[14px] lg:leading-7">
        {description}
      </p>
    </article>
  );
};

const ComparisonIcon = ({ icon }) => {
  return (
    <div className="flex h-[112px] w-full shrink-0 items-center justify-center p-1.5 sm:h-[118px] sm:p-2 md:h-[122px] lg:h-[104px]">
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="block h-[62px] w-[62px] object-contain sm:h-[68px] sm:w-[66px] lg:h-[78px] lg:w-[86px] xl:h-[88px] xl:w-[104px]"
      />
    </div>
  );
};

/* --- MOBILE COMPONENTS --- */
const MobileComparisonCard = ({ type, title, description }) => {
  const isManual = type === "manual";

  return (
    <article className="flex w-full flex-col items-center justify-center gap-1.5 rounded-[12px] border border-[#d9d9d9] bg-white px-4 py-5 text-center shadow-sm">
      <h3
        className={`m-0 w-full text-center text-[14px] font-semibold leading-5 ${
          isManual ? "text-[#bd4444]" : "text-[#346739]"
        }`}
      >
        {title}
      </h3>
      <p className="m-0 block w-full text-center text-[12px] font-normal leading-relaxed text-[#828282]">
        {description}
      </p>
    </article>
  );
};

const MobileComparisonIcon = ({ icon }) => {
  return (
    <div className="flex w-full items-center justify-center py-2">
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="block h-[56px] w-[56px] object-contain"
      />
    </div>
  );
};

const SellingComparison = () => {
  return (
    <section className="w-full overflow-hidden bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 px-4 pb-16 md:gap-[42px] md:px-6 md:pb-[90px] lg:gap-[52px] lg:px-12 lg:pb-[120px] xl:gap-16 xl:px-16 xl:pb-[164px]">
        
        {/* Section heading */}
        <SectionHeading />

        {/* --- DESKTOP/TABLET LAYOUT (Hidden on mobile) --- */}
        <div className="hidden sm:grid w-full grid-cols-[minmax(0,1fr)_70px_minmax(0,1fr)] items-start sm:grid-cols-[minmax(0,1fr)_82px_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_136px_minmax(0,1fr)]">
          {/* Left column: Manual process */}
          <div className="flex min-w-0 flex-col gap-2 sm:gap-3 lg:gap-4">
            {comparisons.map((comparison) => (
              <ComparisonCard
                key={comparison.manualTitle}
                type="manual"
                title={comparison.manualTitle}
                description={comparison.manualDescription}
              />
            ))}
          </div>

          {/* Center column: Icons */}
          <div className="relative z-20 -my-3 flex w-full flex-col gap-2 overflow-hidden rounded-[18px] bg-white py-3 shadow-[-3px_0_6px_rgba(0,0,0,0.18),3px_0_6px_rgba(0,0,0,0.18)] sm:-my-4 sm:gap-3 sm:py-4 lg:gap-4">
            {comparisons.map((comparison) => (
              <ComparisonIcon
                key={comparison.manualTitle}
                icon={comparison.icon}
              />
            ))}
          </div>

          {/* Right column: HiCoreSlotify solutions */}
          <div className="flex min-w-0 flex-col gap-2 sm:gap-3 lg:gap-4">
            {comparisons.map((comparison) => (
              <ComparisonCard
                key={comparison.solutionTitle}
                type="solution"
                title={comparison.solutionTitle}
                description={comparison.solutionDescription}
              />
            ))}
          </div>
        </div>

        {/* --- MOBILE LAYOUT (Stacked, hidden on desktop/tablet) --- */}
        <div className="flex w-full flex-col gap-6 sm:hidden">
          {comparisons.map((comparison) => (
            <div key={comparison.manualTitle} className="flex w-full flex-col items-center gap-1">
              <MobileComparisonCard
                type="manual"
                title={comparison.manualTitle}
                description={comparison.manualDescription}
              />
              <MobileComparisonIcon icon={comparison.icon} />
              <MobileComparisonCard
                type="solution"
                title={comparison.solutionTitle}
                description={comparison.solutionDescription}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SellingComparison;