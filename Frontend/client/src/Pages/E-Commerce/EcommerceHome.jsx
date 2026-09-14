import React from "react";
import NavbarEcommerce from "./NavbarEcommerce";
import HeroSection from "./HeroSection";
import SeamlessBooking from "./SeamlessBooking";
import PowerfulFeatures from "./PowerfulFeatures";
import ContactUs from "./ContactUs";
import FooterBanner from "./FooterBanner";
import ProblemSolution from "./ProblemSolution";
import OrderManagement from "./OrderManagement";
import BusinessBenefits from "./BusinessBenefits";
import SellingComparison from "./SellingComparison";

const EcommerceHome = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white overflow-hidden">

      {/* <NavbarEcommerce /> */}

      <section id="home">
        <HeroSection />
      </section>    

      <ProblemSolution />

      <OrderManagement />  

      <section id="why-us">
        <BusinessBenefits />
      </section>    

      <SeamlessBooking />

      <section id="how-it-works">
        <SellingComparison />
      </section>

      <section id="features">
        <PowerfulFeatures />
      </section>

      <section id="contact">
       <ContactUs />
      </section>

      <FooterBanner />
    </div>
  );
};

export default EcommerceHome;