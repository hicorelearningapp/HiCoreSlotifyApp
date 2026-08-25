import React from "react";
import NavbarEcommerce from "./NavbarEcommerce";
import HeroSection from "./HeroSection";


const EcommerceHome = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white overflow-hidden">

      <NavbarEcommerce />

      <section id="ecommercehome">
        <HeroSection />
      </section>      
    </div>
  );
};

export default EcommerceHome;