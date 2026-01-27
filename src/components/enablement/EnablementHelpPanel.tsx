import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HelpCircle,
  Sparkles,
  Rocket,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

interface EnablementHelpPanelProps {
  trigger?: React.ReactNode;
}

export function EnablementHelpPanel({ trigger }: EnablementHelpPanelProps) {
  const [open, setOpen] = useState(false);
  const { navigateToList } = useWorkspaceNavigation();

  const phases = [
    {
      number: 1,
      title: "Create",
      icon: Sparkles,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Generate documentation with AI assistance",
      destination: "/enablement/create",
      items: [
        "AI Generator - Quick content generation from topics",
        "Documentation Agent - Schema-aware generation",
        "Templates - Pre-built documentation structures",
        "AI Tools - 11 automation tools for bulk operations",
      ],
    },
    {
      number: 2,
      title: "Manage & Release",
      icon: Rocket,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Track coverage, workflow, and publish content",
      destination: "/enablement/release-center",
      items: [
        "Coverage - Track documentation completion",
        "Workflow - Kanban board for content pipeline",
        "Publishing - Publish manuals to Help Center",
        "Milestones - Release timeline tracking",
        "AI Assistant - Intelligent release guidance",
      ],
    },
    {
      number: 3,
      title: "Reference Library",
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Access completed documentation",
      destination: "/enablement/manuals",
      items: [
        "Administrator Manuals - 10 comprehensive guides",
        "Quick Start Guides - 10-30 minute setup guides",
        "Implementation Checklists - Go-live readiness",
        "Enablement Artifacts - Single source of truth",
      ],
    },
  ];

  const tips = [
    "Start with the Documentation Agent to auto-discover undocumented features",
    "Use AI Tools for bulk operations like gap analysis",
    "Check Coverage tab before each release to ensure completeness",
    "Publish to Help Center through the Release Command Center",
  ];

  const handleNavigate = (route: string, title: string) => {
    setOpen(false);
    navigateToList({
      route,
      title,
      moduleCode: "enablement",
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Workflow Guide
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Enablement Hub Workflow
          </SheetTitle>
          <SheetDescription>
            Follow the 3-phase workflow to create, manage, and publish documentation
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Phases */}
            {phases.map((phase) => {
              const Icon = phase.icon;
              return (
                <div key={phase.number} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${phase.bgColor}`}>
                      <span className={`font-bold ${phase.color}`}>{phase.number}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${phase.color}`} />
                        {phase.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    </div>
                  </div>
                  
                  <div className="ml-11 space-y-1.5">
                    {phase.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-11"
                    onClick={() => handleNavigate(phase.destination, phase.title)}
                  >
                    Go to {phase.title}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              );
            })}

            {/* Tips Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Pro Tips
              </h3>
              <div className="space-y-3">
                {tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleNavigate("/enablement/guide", "User Guide")}
                >
                  Full User Guide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleNavigate("/enablement/standards", "Platform Standards")}
                >
                  Platform Standards
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
