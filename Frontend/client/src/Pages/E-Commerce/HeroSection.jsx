import React from "react";
import whiteArrow from "../../assets/E-com/Home/whiteArrow.png";
import greenArrow from "../../assets/E-com/Home/greenArrow.png";
import heroBanner from "../../assets/E-com/Home/banner-image.png";

const HeroSection = () => {
  const handleRegisterClick = () => {
    window.location.href = "/ecommerce-login";
  };

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    // Use smooth scrolling if the element exists on the page
    const section = document.getElementById("how-it-works");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      // Fallback to standard hash navigation
      window.location.href = "#how-it-works";
    }
  };

  return (
    <section className="w-full overflow-hidden bg-white px-2 py-4 sm:px-4 sm:py-5 md:px-6 md:py-7 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-row items-center gap-2 sm:gap-3 md:gap-5 lg:gap-6">
        {/* Left content */}
        <div className="flex w-[52%] min-w-0 flex-col items-start justify-center sm:w-[48%] lg:w-[40%]">
          {/* Heading */}
          <h1 className="m-0 font-['Poppins'] text-[16px] font-semibold leading-[1.3] min-[400px]:text-[18px] sm:text-[22px] md:text-[28px] lg:text-[36px] lg:leading-[1.4]">
            <span className="text-[#C93C3C]">
              No Workflows, No Nodes,
            </span>
            <br />
            <span className="text-[#C93C3C]">
              No Automation.{" "}
            </span>
            <span className="text-[#346739]">
              Just Login,
            </span>
            <br />
            <span className="text-[#346739]">
              Add Product, Link Reel and
            </span>
            <br />
            <span className="text-[#346739] italic">
              Get Sales!
            </span>
          </h1>

          {/* First description */}
          <p className="mt-2 hidden max-w-[570px] font-['Poppins'] text-[10px] font-normal leading-[17px] text-[#333333] min-[430px]:block sm:mt-3 sm:text-[12px] sm:leading-[21px] md:mt-4 md:text-[14px] md:leading-[27px] lg:mt-5 lg:text-[16px] lg:leading-[34px]">
            Customers discover your products on Instagram, ask questions in DMs,
            and often disappear before completing the purchase.
          </p>

          {/* Second description */}
          <p className="mt-1 hidden max-w-[570px] font-['Poppins'] text-[10px] font-normal leading-[17px] text-[#333333] sm:block sm:text-[12px] sm:leading-[21px] md:text-[14px] md:leading-[27px] lg:text-[16px] lg:leading-[34px]">
            HiCoreSlotify answers inquiries, recommends products, guides
            customers to WhatsApp, collects order details – and{" "}
            <span className="text-[#C93C3C]">
              turns conversations into confirmed orders, 24x7.
            </span>
          </p>

          {/* Buttons */}
          <div className="mt-3 flex w-full flex-col items-stretch gap-2 sm:mt-4 md:mt-5 md:flex-row md:gap-3 lg:mt-7">
            {/* Start Selling Smarter */}
            <div className="group flex h-[36px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#346739] p-[3px] sm:h-[40px] md:h-[46px] md:max-w-[220px] md:rounded-[14px] lg:h-[52px] lg:max-w-[262px] lg:rounded-[16px] lg:p-1">
              <button
                type="button"
                onClick={handleRegisterClick}
                className="flex h-full w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#346739] shadow-[inset_0_4px_4px_0px_#00000040] transition-colors duration-300 group-hover:bg-white sm:gap-2 md:rounded-[10px] lg:gap-3 lg:rounded-[12px]"
              >
                <span className="truncate font-['Poppins'] text-[9px] font-semibold text-white transition-colors duration-300 group-hover:text-[#346739] min-[400px]:text-[10px] sm:text-[11px] md:text-[13px] lg:text-[16px]">
                  Start Selling Smarter
                </span>

                <img
                  src={whiteArrow}
                  alt=""
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 object-contain group-hover:hidden sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                />

                <img
                  src={greenArrow}
                  alt=""
                  aria-hidden="true"
                  className="hidden h-3 w-3 shrink-0 object-contain group-hover:block sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                />
              </button>
            </div>

            {/* See How It Works */}
            <div className="group flex h-[36px] w-full cursor-pointer items-center justify-center rounded-[10px] sm:h-[40px] md:h-[46px] md:max-w-[220px] md:rounded-[14px] lg:h-[52px] lg:max-w-[262px] lg:rounded-[16px]">
              <button
                type="button"
                onClick={handleHowItWorksClick}
                className="flex h-full w-full cursor-pointer items-center justify-center gap-1 rounded-[10px] border border-[#346739] bg-white transition-colors duration-300 group-hover:bg-[#346739] sm:gap-2 md:rounded-[14px] lg:gap-3 lg:rounded-[16px]"
              >
                <span className="truncate font-['Poppins'] text-[9px] font-semibold text-[#346739] transition-colors duration-300 group-hover:text-white min-[400px]:text-[10px] sm:text-[11px] md:text-[13px] lg:text-[16px]">
                  See How It Works
                </span>

                <img
                  src={greenArrow}
                  alt=""
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 object-contain group-hover:hidden sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                />

                <img
                  src={whiteArrow}
                  alt=""
                  aria-hidden="true"
                  className="hidden h-3 w-3 shrink-0 object-contain group-hover:block sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right banner */}
        <div className="flex w-[48%] min-w-0 items-center justify-center overflow-hidden sm:w-[52%] lg:w-[60%]">
          <img
            src={heroBanner}
            alt="Instagram conversations into orders"
            className="block h-auto max-h-[300px] w-full object-contain sm:max-h-[380px] md:max-h-[480px] lg:h-[638px] lg:max-h-none"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;