import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Target,
  Clock,
  GraduationCap,
  Sparkles,
  Building2,
  UserCheck,
  FileText,
  Shield,
  BarChart3,
  Briefcase,
  ArrowRight,
  Check,
} from "lucide-react";

const modules = [
  {
    icon: Users,
    title: "Core HR & Workforce Management",
    description:
      "Centralized employee master data with comprehensive organizational hierarchy, position management, and workforce analytics.",
    features: [
      "Employee lifecycle management",
      "Organizational structure & reporting lines",
      "Position management & budgeting",
      "Multi-entity & multi-country support",
      "Employee self-service portal",
      "Document management & e-signatures",
    ],
  },
  {
    icon: DollarSign,
    title: "Payroll Management",
    description:
      "Multi-country payroll processing with deep Caribbean and African compliance, automated tax calculations, and statutory reporting.",
    features: [
      "Multi-currency payroll processing",
      "Country-specific tax calculations",
      "Statutory deductions & contributions",
      "Payslip generation & distribution",
      "Bank file generation",
      "Year-end reporting & compliance",
    ],
  },
  {
    icon: Target,
    title: "Performance & Talent Management",
    description:
      "Continuous performance management with goal setting, feedback, calibration, and AI-powered talent insights.",
    features: [
      "Goal cascading & OKRs",
      "Continuous feedback & check-ins",
      "360-degree assessments",
      "Performance calibration",
      "9-Box talent grid",
      "Succession planning",
    ],
  },
  {
    icon: Clock,
    title: "Time & Attendance",
    description:
      "Flexible scheduling, time tracking, leave management, and overtime compliance with regional labor law support.",
    features: [
      "Shift scheduling & rostering",
      "Time clock & geofencing",
      "Leave management & accruals",
      "Overtime tracking & alerts",
      "Absence management",
      "Labor compliance monitoring",
    ],
  },
  {
    icon: GraduationCap,
    title: "Learning Management System",
    description:
      "Role-based learning paths, compliance training, course authoring, and AI-generated recommendations.",
    features: [
      "Course library & authoring",
      "Learning paths & certifications",
      "Compliance training tracking",
      "Skill gap analysis",
      "AI-powered recommendations",
      "Progress tracking & reporting",
    ],
  },
  {
    icon: Briefcase,
    title: "Recruitment & Onboarding",
    description:
      "End-to-end hiring workflow with job posting, candidate tracking, offer management, and streamlined onboarding.",
    features: [
      "Job requisition workflow",
      "Multi-channel job posting",
      "Applicant tracking system",
      "Interview scheduling",
      "Offer management",
      "Automated onboarding tasks",
    ],
  },
  {
    icon: BarChart3,
    title: "Compensation & Benefits",
    description:
      "Compensation planning, salary benchmarking, benefits administration, and total rewards statements.",
    features: [
      "Salary structure management",
      "Compensation planning cycles",
      "Market benchmarking",
      "Benefits enrollment",
      "Total rewards statements",
      "Budget modeling",
    ],
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description:
      "Predictive analytics, intelligent automation, and explainable AI across all HR functions.",
    features: [
      "Attrition risk prediction",
      "Workforce demand forecasting",
      "AI-generated narratives",
      "Bias detection & mitigation",
      "Smart scheduling optimization",
      "Recommendation engines",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Helmet>
        <title>Features | intellihrm - Complete HRMS Platform</title>
        <meta
          name="description"
          content="Explore intellihrm features: Core HR, Payroll, Performance Management, Time & Attendance, Learning, Recruitment, Compensation, and AI-powered insights."
        />
        <link rel="canonical" href="https://intellihrm.net/features" />
      </Helmet>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Everything You Need to Manage Your Workforce
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A complete, integrated HRMS platform with intelligent features designed for regional
              compliance and global scale. Every module works together seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="space-y-16">
            {modules.map((module, index) => (
              <div
                key={module.title}
                className={`flex flex-col lg:flex-row gap-8 lg:gap-16 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <module.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{module.title}</h2>
                  <p className="mt-3 text-muted-foreground">{module.description}</p>

                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {module.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Illustration Placeholder */}
                <div className="flex-1">
                  <div className="rounded-xl border border-border bg-muted/30 aspect-[4/3] flex items-center justify-center">
                    <module.icon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Ready to See intellihrm in Action?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Request a personalized demo and explore how intellihrm can transform your HR operations.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link to="/register-demo">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
