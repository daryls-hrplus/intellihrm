import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Shield,
  Users,
  HelpCircle,
  Target,
  ArrowRight,
  FileText,
  ChevronRight,
} from "lucide-react";

const manuals = [
  {
    id: "admin-security",
    title: "Admin & Security Guide",
    description: "Complete guide to administration, security configuration, user management, and system settings",
    icon: Shield,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    badgeColor: "bg-red-500/10 text-red-700 border-red-500/30",
    sections: 55,
    href: "/enablement/manuals/admin-security",
    version: "2.4",
  },
  {
    id: "workforce",
    title: "Workforce Guide",
    description: "Comprehensive workforce management including org structure, positions, departments, and employee lifecycle",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/30",
    sections: 80,
    href: "/enablement/manuals/workforce",
    version: "2.4",
  },
  {
    id: "hr-hub",
    title: "HR Hub Guide",
    description: "HR Hub configuration including policies, documents, knowledge base, and employee communications",
    icon: HelpCircle,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    badgeColor: "bg-purple-500/10 text-purple-700 border-purple-500/30",
    sections: 32,
    href: "/enablement/manuals/hr-hub",
    version: "2.4",
  },
  {
    id: "appraisals",
    title: "Performance Appraisal Guide",
    description: "Performance appraisal configuration including cycles, templates, workflows, and calibration",
    icon: BookOpen,
    color: "bg-primary/10 text-primary border-primary/20",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    sections: 48,
    href: "/enablement/manuals/appraisals",
    version: "2.4",
  },
  {
    id: "goals",
    title: "Goals Manual",
    description: "Goals management configuration including goal frameworks, cascading, tracking, and alignment",
    icon: Target,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    badgeColor: "bg-green-500/10 text-green-700 border-green-500/30",
    sections: 24,
    href: "/enablement/manuals/goals",
    version: "2.4",
  },
  {
    id: "benefits",
    title: "Benefits Administrator Guide",
    description: "Complete benefits management including plans, enrollment, claims, life events, and analytics",
    icon: Target,
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    badgeColor: "bg-pink-500/10 text-pink-700 border-pink-500/30",
    sections: 45,
    href: "/enablement/manuals/benefits",
    version: "2.4",
  },
];

export default function ManualsIndexPage() {
  const navigate = useNavigate();
  
  const totalSections = manuals.reduce((acc, m) => acc + m.sections, 0);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Administrator Manuals" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Administrator Manuals
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive configuration guides for HRplus administrators
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{totalSections}</p>
              <p className="text-sm text-muted-foreground">Total Sections</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{manuals.length}</p>
              <p className="text-sm text-muted-foreground">Guides</p>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Complete Administrator Documentation</p>
                  <p className="text-sm text-muted-foreground">
                    {totalSections} sections covering all administrative functions across {manuals.length} comprehensive guides
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/enablement/manual-publishing")}
              >
                Publish to Help Center
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {manuals.map((manual) => {
            const IconComponent = manual.icon;
            return (
              <Card
                key={manual.id}
                className={`group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${manual.color} border`}
                onClick={() => navigate(manual.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${manual.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={manual.badgeColor}>
                      v{manual.version}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                    {manual.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {manual.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-medium">
                      {manual.sections} Sections
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary">
                      View Manual
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => navigate("/enablement/docs-generator")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Documentation
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => navigate("/enablement/manual-publishing")}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Publish to Help Center
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => navigate("/enablement")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Back to Content Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
