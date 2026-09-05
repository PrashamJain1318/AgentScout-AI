import React from "react";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import CareerValueStrip from "../components/landing/CareerValueStrip";
import ProblemSolution from "../components/landing/ProblemSolution";
import HowItWorks from "../components/landing/HowItWorks";
import FeatureShowcase from "../components/landing/FeatureShowcase";
import CareerAgentSpotlight from "../components/landing/CareerAgentSpotlight";
import ProductPreview from "../components/landing/ProductPreview";
import CareerTransformation from "../components/landing/CareerTransformation";
import PlatformCapabilities from "../components/landing/PlatformCapabilities";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";

const LandingPage = () => {
  return (
    <div className="landing-page-shell">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar />

      {/* Main Landing Sections */}
      <main className="landing-main-content">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Value & Trust Strip */}
        <CareerValueStrip />

        {/* 4. The Career Problem & Comparison */}
        <ProblemSolution />

        {/* 5. How AgentScout Works Timeline */}
        <HowItWorks />

        {/* 6. Feature Showcase Suite */}
        <FeatureShowcase />

        {/* 7. AI Career Agent Spotlight */}
        <CareerAgentSpotlight />

        {/* 8. Interactive Dashboard Mock Preview */}
        <ProductPreview />

        {/* 9. Career Journey Transformation */}
        <CareerTransformation />

        {/* 10. Platform Capability Matrix */}
        <PlatformCapabilities />

        {/* 11. Final High-Impact CTA */}
        <FinalCTA />
      </main>

      {/* 12. Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
