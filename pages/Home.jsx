import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ThreeFrontDoors from "../components/landing/ThreeFrontDoors";
import DigitalTwinPreview from "../components/landing/DigitalTwinPreview";
import AnomalyIntelPreview from "../components/landing/AnomalyIntelPreview";
import HowItWorks from "../components/landing/HowItWorks";
import ValueLayers from "../components/landing/ValueLayers";
import PersonaJourneys from "../components/landing/PersonaJourneys";
import SecurityTrustSection from "../components/landing/SecurityTrustSection";
import ArchitectureLayers from "../components/landing/ArchitectureLayers";
import SectorsSection from "../components/landing/SectorsSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    document.title = "TraceSafe AI";
  }, []);

  useEffect(() => {
    if (location.hash !== "#security-trust-heading") return;
    const id = "security-trust-heading";
    const run = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [location.hash, location.pathname]);

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
        <PersonaJourneys />
        <SecurityTrustSection />
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