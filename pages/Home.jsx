import React, { useEffect } from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ThreeFrontDoors from "../components/landing/ThreeFrontDoors";
import DigitalTwinPreview from "../components/landing/DigitalTwinPreview";
import AnomalyIntelPreview from "../components/landing/AnomalyIntelPreview";
import HowItWorks from "../components/landing/HowItWorks";
import ValueLayers from "../components/landing/ValueLayers";
import ArchitectureLayers from "../components/landing/ArchitectureLayers";
import SectorsSection from "../components/landing/SectorsSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function Home() {
  useEffect(() => {
    document.title = "TraceSafe AI";
  }, []);

  return (
    <div className="min-h-screen bg-[#060B18]">
      <header role="banner">
        <Navbar />
      </header>
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <ThreeFrontDoors />
        <DigitalTwinPreview />
        <AnomalyIntelPreview />
        <HowItWorks />
        <ValueLayers />
        <ArchitectureLayers />
        <SectorsSection />
        <CTASection />
      </main>
      <footer role="contentinfo">
        <Footer />
      </footer>
    </div>
  );
}