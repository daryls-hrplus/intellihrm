import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "./FeatureCard";
import {
  Users,
  DollarSign,
  Target,
  Clock,
  GraduationCap,
  Sparkles,
  Building2,
  UserCheck,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Core HR & Workforce",
    description:
      "Centralized employee data, organizational hierarchy, and workforce analytics with multi-entity support.",
  },
  {
    icon: DollarSign,
    title: "Payroll Management",
    description:
      "Multi-country payroll processing with deep Caribbean and African tax compliance built-in.",
  },
  {
    icon: Target,
    title: "Performance & Talent",
    description:
      "Goal management, continuous feedback, 360° reviews, and AI-powered talent insights.",
  },
  {
    icon: Clock,
    title: "Time & Attendance",
    description:
      "Flexible scheduling, time tracking, leave management, and overtime compliance monitoring.",
  },
  {
    icon: GraduationCap,
    title: "Learning Management",
    description:
      "Role-based learning paths, compliance training, and AI-generated course recommendations.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description:
      "Predictive analytics, attrition risk scoring, and intelligent recommendations across all modules.",
  },
  {
    icon: Building2,
    title: "Recruitment",
    description:
      "End-to-end hiring workflow with job posting, candidate tracking, and bias-aware AI matching.",
  },
  {
    icon: UserCheck,
    title: "Onboarding",
    description:
      "Streamlined new hire experience with automated workflows and guided task completion.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Manage Your Workforce
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete HRMS platform with intelligent features designed for regional compliance and global scale.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/features">
              Explore All Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
