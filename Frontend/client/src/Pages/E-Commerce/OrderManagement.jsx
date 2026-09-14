import React from "react";

// Local asset imports
import orderManagementImage from "../../assets/OrderManagement/order-management.png";
import securityIcon from "../../assets/OrderManagement/security-icon.png";

const securityItems = [
  "Secure account access",
  "Protected customer information",
  "Secure payment processing",
  "Reliable notifications",
];

const SectionHeading = () => {
  return (
    <div className="flex w-full max-w-[950px] flex-col items-center justify-center">
      <h2 className="m-0 text-center text-[18px] font-semibold uppercase leading-[29px] text-[#346739] sm:text-[20px] sm:leading-[32px] md:text-[23px] md:leading-[38px] lg:text-[28px] lg:leading-[48px]">
        SEE HOW{" "}
        <span className="normal-case">
          HiCoreSlotify
        </span>{" "}
        SIMPLIFIES YOUR ORDER MANAGEMENT
      </h2>

      {/* Heading underline with dots */}
      <div className="mt-1 flex w-full max-w-[440px] items-center md:max-w-[720px] lg:max-w-none">
        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#346739]" />

        <span className="h-[2px] flex-1 bg-[#346739]" />

        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#346739]" />
      </div>
    </div>
  );
};

const SecurityCard = ({ item }) => {
  return (
    <article className="flex min-h-[115px] min-w-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-[16px] border border-[#d9d9d9] bg-[rgba(248,236,236,0.2)] px-2 py-3 shadow-[4px_4px_4px_rgba(0,0,0,0.25),inset_4px_4px_4px_rgba(0,0,0,0.25)] sm:min-h-[125px] sm:gap-3 sm:py-[14px] md:min-h-[135px] md:gap-4 md:py-4 lg:min-h-[145px]">
      <img
        src={securityIcon}
        alt=""
        aria-hidden="true"
        className="block h-[43px] w-[55px] shrink-0 object-contain sm:h-[48px] sm:w-[62px]"
      />

      <p className="m-0 w-full text-center text-[15px] font-normal leading-7 text-[#346739] sm:text-[16px] lg:leading-9">
        {item}
      </p>
    </article>
  );
};

const OrderManagement = () => {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-col items-center gap-8 px-3 pb-16 pt-12 sm:px-4 sm:pb-16 sm:pt-12 md:gap-[42px] md:px-8 md:pb-[90px] md:pt-16 lg:min-h-screen lg:gap-[52px] lg:px-12 lg:pb-[120px] lg:pt-20 xl:gap-16 xl:px-16 xl:pb-[164px] xl:pt-[100px]">
        {/* Section heading */}
        <SectionHeading />

        {/* Main order-management preview */}
        <div className="flex aspect-[1312/669] h-auto w-full items-center justify-center overflow-hidden rounded-md sm:rounded-lg">
          <img
            src={orderManagementImage}
            alt="HiCoreSlotify Instagram and WhatsApp order management workflow"
            className="block h-full w-full rounded-md object-contain sm:rounded-lg"
          />
        </div>

        {/* Security cards */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-[18px] xl:grid-cols-4 xl:gap-5">
          {securityItems.map((item) => (
            <SecurityCard key={item} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrderManagement;