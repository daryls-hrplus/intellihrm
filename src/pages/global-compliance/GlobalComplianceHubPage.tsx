import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Globe2,
  Receipt,
  Scale,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  MapPin,
} from "lucide-react";

const modules = [
  {
    title: "Multi-Country Rules",
    description: "Country-specific rule configuration and profiles",
    icon: Globe2,
    href: "/multi-country-rules",
    countries: 8,
  },
  {
    title: "Tax Configuration",
    description: "Tax tables, deduction rules, thresholds, and reporting",
    icon: Receipt,
    href: "/tax-config",
    countries: 8,
  },
  {
    title: "Labor Law Compliance",
    description: "Leave policies, working hours, overtime rules, and holidays by region",
    icon: Scale,
    href: "/labor-law",
    countries: 8,
  },
  {
    title: "Statutory Reporting",
    description: "Government report templates, filing schedules, and submission tracking",
    icon: FileCheck,
    href: "/statutory-reporting",
    countries: 8,
  },
];

const regions = [
  { name: "Caribbean", countries: ["Jamaica", "Trinidad", "Barbados", "Bahamas"], status: "compliant" },
  { name: "Africa", countries: ["Ghana", "Nigeria", "Kenya"], status: "review" },
  { name: "Dominican Republic", countries: ["Dominican Republic"], status: "compliant" },
];

const upcomingDeadlines = [
  { name: "PAYE Monthly Return", country: "Jamaica", due: "Dec 15, 2024", status: "pending" },
  { name: "NIS Contributions", country: "Trinidad", due: "Dec 20, 2024", status: "pending" },
  { name: "SSNIT Report", country: "Ghana", due: "Dec 31, 2024", status: "draft" },
  { name: "Annual Tax Return", country: "Barbados", due: "Jan 15, 2025", status: "not_started" },
];

export default function GlobalComplianceHubPage() {
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: "Global/Regional Compliance" }];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              Global/Regional Compliance
            </h1>
            <p className="text-muted-foreground">
              Multi-country payroll rules, tax configurations, and labor law compliance
            </p>
          </div>
        </div>

        {/* Compliance Status by Region */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Regional Compliance Status
            </CardTitle>
            <CardDescription>Overview of compliance across all regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {regions.map((region, index) => (
                <div key={index} className="p-4 rounded-lg bg-background border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{region.name}</h4>
                    {region.status === "compliant" ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Compliant
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Review
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {region.countries.map((country, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded bg-muted">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <Card
              key={module.title}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(module.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <module.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{module.countries} Countries</Badge>
                </div>
                <CardTitle className="text-lg mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Statutory filing deadlines across all countries</CardDescription>
              </div>
              <button
                onClick={() => navigate("/statutory-reporting")}
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{deadline.name}</p>
                      <p className="text-xs text-muted-foreground">{deadline.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{deadline.due}</span>
                    <Badge
                      variant={
                        deadline.status === "pending"
                          ? "default"
                          : deadline.status === "draft"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {deadline.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/multi-country-rules")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Globe2 className="h-4 w-4" />
                Configure Country
              </button>
              <button
                onClick={() => navigate("/tax-config")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <Receipt className="h-4 w-4" />
                Tax Setup
              </button>
              <button
                onClick={() => navigate("/labor-law")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <Scale className="h-4 w-4" />
                Labor Laws
              </button>
              <button
                onClick={() => navigate("/statutory-reporting")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <FileCheck className="h-4 w-4" />
                File Report
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
