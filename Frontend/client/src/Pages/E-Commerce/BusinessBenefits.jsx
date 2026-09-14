import React from "react";

// Local asset imports
import sellIcon from "../../assets/BusinessBenefits/sell.png";
import respondIcon from "../../assets/BusinessBenefits/respond.png";
import recoverIcon from "../../assets/BusinessBenefits/recover.png";
import saveTimeIcon from "../../assets/BusinessBenefits/save-time.png";
import centralizeIcon from "../../assets/BusinessBenefits/centralize.png";
import conversionsIcon from "../../assets/BusinessBenefits/conversions.png";
import scaleIcon from "../../assets/BusinessBenefits/scale.png";
import growthIcon from "../../assets/BusinessBenefits/growth.png";

const benefits = [
  {
    title: "Sell 24×7",
    description: "Your AI sales assistant never sleeps.",
    icon: sellIcon,
  },
  {
    title: "Respond instantly",
    description: "Give customers answers when they're ready to buy.",
    icon: respondIcon,
  },
  {
    title: "Recover lost sales",
    description: "Don't let unanswered DMs become lost customers.",
    icon: recoverIcon,
  },
  {
    title: "Save time",
    description: "Stop answering the same questions repeatedly.",
    icon: saveTimeIcon,
  },
  {
    title: "Centralize your business",
    description:
      "Conversations, products, orders and payments in one place.",
    icon: centralizeIcon,
  },
  {
    title: "Increase conversions",
    description: "Move customers smoothly from inquiry to purchase.",
    icon: conversionsIcon,
  },
  {
    title: "Scale without more staff",
    description:
      "Handle more conversations without manually responding to every one.",
    icon: scaleIcon,
  },
  {
    title: "Understand your growth",
    description: "Use real-time analytics to make better decisions.",
    icon: growthIcon,
  },
];

const SectionHeading = () => {
  return (
    <div className="flex w-full max-w-[750px] flex-col items-center justify-center">
      <h2 className="m-0 text-center text-[18px] font-semibold uppercase leading-[29px] text-[#346739] sm:text-[20px] sm:leading-8 md:text-[24px] md:leading-10 lg:text-[28px] lg:leading-12">
        WHY BUSINESSES CHOOSE{" "}
        <span className="normal-case">HiCoreSlotify?</span>
      </h2>

      {/* Underline with dots */}
      <div className="mt-1 flex w-full max-w-[440px] items-center md:max-w-[600px] lg:max-w-none">
        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#346739]" />

        <span className="h-[2px] flex-1 bg-[#346739]" />

        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#346739]" />
      </div>
    </div>
  );
};

const BenefitCard = ({ benefit }) => {
  return (
    <article className="group flex min-h-[180px] min-w-0 cursor-pointer flex-col items-center gap-2 rounded-[16px] border border-[#66bb6a] bg-white px-[18px] py-[22px] text-center transition-all duration-300 hover:-translate-y-[5px] hover:border-[#346739] hover:bg-[#346739] hover:shadow-[0_10px_24px_rgba(52,103,57,0.25)] sm:min-h-[190px] sm:px-5 sm:py-6 md:min-h-[200px] lg:min-h-[220px] xl:min-h-[204px]">
      {/* Benefit icon */}
      <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16">
        <img
          src={benefit.icon}
          alt=""
          aria-hidden="true"
          className="block h-full w-full object-contain"
        />
      </div>

      {/* Benefit title */}
      <h3 className="m-0 w-full text-[16px] font-semibold leading-[30px] text-[#346739] transition-colors duration-300 group-hover:text-white sm:leading-9">
        {benefit.title}
      </h3>

      {/* Benefit description */}
      <p className="m-0 w-full text-[14px] font-normal leading-[25px] text-[#828282] transition-colors duration-300 group-hover:text-white sm:leading-7">
        {benefit.description}
      </p>
    </article>
  );
};

const BusinessBenefits = () => {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 px-3 pb-16 sm:px-4 md:gap-[42px] md:px-8 md:pb-[90px] lg:gap-[52px] lg:px-12 lg:pb-[120px] xl:gap-16 xl:px-16 xl:pb-[164px]">
        {/* Section heading */}
        <SectionHeading />

        {/* Benefits grid */}
        <div className="grid w-full grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-9">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessBenefits;