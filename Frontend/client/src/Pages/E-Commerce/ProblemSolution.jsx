import React from "react";

// Local asset imports
import problemImage from "../../assets/ProblemSolution/problem-image.png";
import solutionImage from "../../assets/ProblemSolution/solution-image.png";
import redArrow from "../../assets/ProblemSolution/red-arrow.png";

const problems = [
  "Missed DMs",
  "Slow responses",
  "Repeated questions",
  "Lost customers",
  "WhatsApp chaos",
  "Manual order management",
];

const SectionTitle = ({ title, color }) => {
  return (
    <div className="flex w-full flex-col items-center">
      <h2
        className="m-0 text-center text-[20px] font-bold uppercase sm:text-[22px] md:text-[24px]"
        style={{ color }}
      >
        {title}
      </h2>

      {/* Heading underline */}
      <div className="mt-1 flex w-[150px] items-center">
        <span
          className="h-[5px] w-[5px] shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />

        <span
          className="h-[2px] flex-1"
          style={{ backgroundColor: color }}
        />

        <span
          className="h-[5px] w-[5px] shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const ProblemSection = () => {
  return (
    <section className="w-full bg-white px-4 py-10 sm:px-6 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:px-16">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Problem heading */}
        <SectionTitle title="THE PROBLEM" color="#ff0000" />

        {/* Problem content */}
        <div className="mt-5 flex w-full flex-col items-center gap-6 md:flex-row md:gap-2 lg:mt-6">
          {/* Problem image */}
          <div className="w-full min-w-0 md:w-[72%]">
            <p className="mb-1 text-center text-[13px] font-medium text-[#346739] sm:text-[14px] md:pl-6 md:text-left lg:pl-12 lg:text-[15px]">
              Your customers are asking.
            </p>

            <div className="w-full overflow-hidden bg-white">
              <img
                src={problemImage}
                alt="Customer questions are delayed and the sale is lost"
                className="block h-auto w-full object-contain"
              />
            </div>
          </div>

          {/* Red arrow */}
          <div className="flex w-full shrink-0 items-center justify-center md:w-[38px] lg:w-[48px]">
            <img
              src={redArrow}
              alt=""
              aria-hidden="true"
              className="block h-auto w-[42px] rotate-90 object-contain md:w-[38px] md:rotate-0 lg:w-[48px]"
            />
          </div>

          {/* Problems list */}
          <div className="flex w-full flex-col items-center justify-center gap-4 rounded-[16px] bg-[#f7e6e6] px-4 py-5 sm:max-w-[420px] md:w-[21%] md:min-w-0 md:gap-4 lg:w-[19%] lg:gap-6 lg:px-4 lg:py-7">
            {problems.map((problem) => (
              <p
                key={problem}
                className="m-0 text-center text-[12px] font-medium text-[#ff0000] lg:text-[14px] xl:text-[15px]"
              >
                {problem}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const SolutionSection = () => {
  return (
    <section className="w-full bg-white px-4 pb-10 pt-6 sm:px-6 md:px-8 md:pb-12 md:pt-8 lg:px-12 lg:pb-14 xl:px-16">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">
        {/* Solution heading */}
        <SectionTitle title="OUR SOLUTION" color="#008b16" />

        {/* Solution content */}
        <div className="mt-6 flex w-full flex-col items-center gap-8 md:flex-row md:items-center md:gap-5 lg:mt-8 lg:gap-8 xl:gap-10">
          {/* Left text */}
          <div className="flex w-full flex-col items-center text-center md:w-[28%] md:items-start md:text-left">
            <h3 className="m-0 text-center text-[15px] font-semibold leading-6 text-[#346739] sm:text-[16px] md:text-left md:text-[14px] lg:text-[16px] xl:text-[17px]">
              Meet your AI sales assistant.
            </h3>

            <blockquote className="my-5 w-full max-w-[340px] text-center text-[20px] font-medium leading-[1.7] text-[#008b16] sm:text-[22px] md:max-w-none md:text-left md:text-[18px] md:leading-[1.8] lg:my-6 lg:text-[22px] xl:text-[25px]">
              "Your AI handles the conversation. You handle the business."
            </blockquote>

            <p className="m-0 w-full max-w-[380px] text-center text-[14px] font-normal leading-7 text-[#1f2937] sm:text-[15px] md:max-w-none md:text-left md:text-[12px] md:leading-6 lg:text-[14px] lg:leading-7 xl:text-[15px]">
              HiCoreSlotify connects your Instagram, 
              WhatsApp and product
              catalogue, and lets AI handle customer conversations from inquiry
              to order.
            </p>
          </div>

          {/* Right image */}
          <div className="flex w-full min-w-0 items-center justify-center overflow-hidden bg-white md:w-[72%]">
            <img
              src={solutionImage}
              alt="AI sales assistant handling customer conversations and orders"
              className="block h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const ProblemSolution = () => {
  return (
    <main className="w-full overflow-hidden bg-white font-sans">
      <ProblemSection />
      <SolutionSection />
    </main>
  );
};

export default ProblemSolution;