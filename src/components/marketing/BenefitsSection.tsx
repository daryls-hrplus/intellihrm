import { Check } from "lucide-react";

const benefits = [
  {
    title: "Regional Compliance Expertise",
    description:
      "Purpose-built for Caribbean and African labor laws, tax regulations, and statutory requirements.",
    points: [
      "Multi-island payroll compliance",
      "Country-specific leave policies",
      "Statutory reporting automation",
      "Union agreement support",
    ],
  },
  {
    title: "AI at the Core",
    description:
      "Every module is powered by intelligent automation that reduces work and improves decisions.",
    points: [
      "Predictive workforce analytics",
      "Attrition risk detection",
      "AI-generated performance narratives",
      "Smart scheduling optimization",
    ],
  },
  {
    title: "Enterprise-Grade Security",
    description:
      "Bank-level security with role-based access, audit trails, and data residency compliance.",
    points: [
      "SOC 2 compliant infrastructure",
      "GDPR & regional data protection",
      "Full audit logging",
      "Granular permission controls",
    ],
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Organizations Choose HRplus
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built differently from the ground up to serve the unique needs of Caribbean and African enterprises.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl border border-border bg-card p-8"
            >
              <h3 className="text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-3 text-muted-foreground">{benefit.description}</p>
              <ul className="mt-6 space-y-3">
                {benefit.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
