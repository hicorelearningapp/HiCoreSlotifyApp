import React from "react";
import HeadContent from "../Components/HeroSection";
import Footer from "../Components/Footer";
import ContactUs from "../Components/ContactUs";
import WeServe from "../Components/WeServe";
import SeamlessBooking from "../Components/SeamlessBooking";
import WhyBusiness from "../Components/WhyBusiness";
import Features from "../Components/Features";
import ComparisonSection from "../Components/ComparisonSection";

const Home = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white overflow-hidden">
      
      {/* ====== Hero Section ====== */}
      <section id="home">
        <HeadContent />
      </section>

      <section id="industries">
      <WeServe />
      </section>
      
      <section id="how-it-works">
      <SeamlessBooking />
      </section> 

      <ComparisonSection />

      <section id="benefits">
      <WhyBusiness />
      </section>

      <section id="features">
      <Features />
      </section>

        <section id="contact">
       <ContactUs />
       </section> 
       
      <Footer/>
     
    </div>
  );
};

export default Home;