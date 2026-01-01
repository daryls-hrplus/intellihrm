import { Helmet } from "react-helmet";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { CTASection } from "@/components/marketing/CTASection";

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>intellihrm | AI-Powered HRMS for Caribbean & Africa</title>
        <meta
          name="description"
          content="Enterprise-grade Human Resource Management System built for the Caribbean, Africa, and global expansion. Deep regional compliance, embedded AI intelligence, and seamless cross-module orchestration."
        />
        <meta property="og:title" content="intellihrm | AI-Powered HRMS for Caribbean & Africa" />
        <meta
          property="og:description"
          content="Enterprise-grade HRMS with deep regional compliance and AI-powered insights."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://intellihrm.net" />
      </Helmet>

      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
    </>
  );
}
