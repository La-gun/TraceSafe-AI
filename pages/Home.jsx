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
    document.title = "TraceGuard";
  }, []);

  useEffect(() => {
    const id = (location.hash || "").replace(/^#/, "");
    if (!id) return;
    const run = () => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Offset for the fixed navbar so headings aren't hidden under it.
      window.scrollBy({ top: -80, left: 0, behavior: "smooth" });
    };
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