import React from "react";
import HeroSection from "./HeroSection";
import WhyDoctors from "./WhyDoctors";
import SeamlessBooking from "./SeamlessBooking";
import ContactUs from "./ContactUs";
import FooterBanner from "./FooterBanner";
import PowerfulFeatures from "./PowerfulFeatures";
import ADayWithHiCore from "./ADayWithHiCore";
import NavbarDoctor from "./NavbarDoctor";
import SeeHowDoctors from "./SeeHowDoctors";

const DoctorHome = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white overflow-hidden">

      <NavbarDoctor />

      <section id="home">
        <HeroSection />
      </section>
      <SeeHowDoctors />

      <section id="why-us">
        <WhyDoctors />
      </section>

      <section id="how-it-works">
        <SeamlessBooking />
      </section>

      <section id="powerful-features">
        <PowerfulFeatures />
      </section>

      <ADayWithHiCore />

      <section id="contact">
        <ContactUs />
      </section>

      <FooterBanner />
      
    </div>
  );
};

export default DoctorHome;