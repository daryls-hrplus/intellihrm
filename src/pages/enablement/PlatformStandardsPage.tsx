import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  Monitor, 
  Palette, 
  ArrowRight, 
  BookOpen,
  Keyboard,
  Shield,
  Zap
} from "lucide-react";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

interface StandardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  category: "navigation" | "design" | "security" | "performance";
  status: "published" | "draft" | "coming-soon";
}

const platformStandards: StandardCard[] = [
  {
    id: "workspace-navigation",
    title: "Workspace Tab Navigation",
    description: "Enterprise multi-tab navigation system with state persistence, keyboard shortcuts, and session recovery. Based on Workday/SAP patterns.",
    icon: Monitor,
    href: "/enablement/standards/workspace-navigation",
    badge: "Core Pattern",
    category: "navigation",
    status: "published",
  },
  {
    id: "ui-color-semantics",
    title: "UI Color Semantics",
    description: "Enterprise-grade color usage rules for HRMS interfaces. Ensures consistent, accessible color patterns across all modules.",
    icon: Palette,
    href: "/enablement/ui-color-semantics",
    badge: "Governance",
    category: "design",
    status: "published",
  },
  {
    id: "keyboard-accessibility",
    title: "Keyboard & Accessibility",
    description: "WCAG 2.1 AA compliance patterns, keyboard navigation standards, and screen reader optimization guidelines.",
    icon: Keyboard,
    href: "/enablement/standards/accessibility",
    category: "design",
    status: "coming-soon",
  },
  {
    id: "security-patterns",
    title: "Security Patterns",
    description: "Role-based access control, RLS policy patterns, and data protection standards for Caribbean/Africa compliance.",
    icon: Shield,
    href: "/enablement/standards/security",
    category: "security",
    status: "coming-soon",
  },
  {
    id: "performance-optimization",
    title: "Performance Standards",
    description: "Code splitting, lazy loading, and caching patterns for enterprise-scale HRMS performance.",
    icon: Zap,
    href: "/enablement/standards/performance",
    category: "performance",
    status: "coming-soon",
  },
];

const categoryLabels = {
  navigation: { label: "Navigation", color: "bg-blue-500/10 text-blue-600" },
  design: { label: "Design System", color: "bg-purple-500/10 text-purple-600" },
  security: { label: "Security", color: "bg-red-500/10 text-red-600" },
  performance: { label: "Performance", color: "bg-green-500/10 text-green-600" },
};

const statusConfig = {
  published: { label: "Published", variant: "default" as const },
  draft: { label: "Draft", variant: "secondary" as const },
  "coming-soon": { label: "Coming Soon", variant: "outline" as const },
};

export default function PlatformStandardsPage() {
  const { t } = useTranslation();
  const { navigateToRecord } = useWorkspaceNavigation();

  const publishedStandards = platformStandards.filter(s => s.status === "published");
  const upcomingStandards = platformStandards.filter(s => s.status !== "published");

  const handleStandardClick = (standard: StandardCard) => {
    if (standard.status !== "published") return;
    navigateToRecord({
      route: standard.href,
      title: standard.title,
      subtitle: "Standard",
      moduleCode: "enablement",
      contextType: "standard",
      contextId: standard.id,
      icon: Layers,
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Platform Standards" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Layers className="h-8 w-8 text-primary" />
              Platform Standards
            </h1>
            <p className="text-muted-foreground mt-1">
              Enterprise patterns, design guidelines, and architectural standards for Intelli HRM
            </p>
          </div>
        </div>

        {/* Introduction Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">What are Platform Standards?</h3>
                <p className="text-muted-foreground mt-1">
                  Platform Standards define the architectural patterns, UX conventions, and technical 
                  guidelines that ensure consistency across all Intelli HRM modules. Following these standards 
                  enables enterprise-grade quality aligned with Workday, SAP SuccessFactors, and Oracle HCM.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Published Standards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Published Standards
            <Badge variant="secondary">{publishedStandards.length}</Badge>
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {publishedStandards.map((standard) => {
              const Icon = standard.icon;
              const category = categoryLabels[standard.category];
              
              return (
                <Card 
                  key={standard.id} 
                  className="group hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleStandardClick(standard)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-lg ${category.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex gap-2">
                        {standard.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {standard.badge}
                          </Badge>
                        )}
                        <Badge className={category.color}>
                          {category.label}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                      {standard.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {standard.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                      View Standard
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Upcoming Standards */}
        {upcomingStandards.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-muted-foreground">
              Upcoming Standards
              <Badge variant="outline">{upcomingStandards.length}</Badge>
            </h2>
            
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingStandards.map((standard) => {
                const Icon = standard.icon;
                const category = categoryLabels[standard.category];
                const status = statusConfig[standard.status];
                
                return (
                  <Card key={standard.id} className="opacity-60">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-2">
                        {standard.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {standard.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
