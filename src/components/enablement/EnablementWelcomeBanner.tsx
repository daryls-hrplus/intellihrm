import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, FileText, Kanban, Upload, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnablementWelcomeBannerProps {
  onDismiss?: () => void;
}

export function EnablementWelcomeBanner({ onDismiss }: EnablementWelcomeBannerProps) {
  const navigate = useNavigate();

  const steps = [
    {
      step: 1,
      title: "Generate Documentation",
      description: "Use AI to create training guides, SOPs, and KB articles from your feature catalog",
      icon: Sparkles,
      action: () => navigate("/enablement/docs-generator"),
      cta: "Start Generating",
    },
    {
      step: 2,
      title: "Review in Workflow",
      description: "Track content through development stages from draft to ready",
      icon: Kanban,
      action: () => navigate("/enablement?tab=workflow"),
      cta: "View Workflow",
    },
    {
      step: 3,
      title: "Publish to Help Center",
      description: "Use AI-enhanced publishing with version control and approvals",
      icon: Upload,
      action: () => navigate("/enablement/manuals/publishing"),
      cta: "Publish Content",
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Welcome to the Enablement Content Hub
              </h2>
              <p className="text-muted-foreground">
                Create, manage, and publish documentation with AI assistance. Follow these steps to get started.
              </p>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground">
                Dismiss
              </Button>
            )}
          </div>

          {/* Steps */}
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="relative flex flex-col gap-3 p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
              >
                {/* Step Number */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.step}
                  </div>
                  <step.icon className="h-5 w-5 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {/* Action */}
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  className="w-full mt-2"
                  onClick={step.action}
                >
                  {step.cta}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>

                {/* Connector Arrow (not on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="flex justify-center pt-2">
            <Button size="lg" onClick={() => navigate("/enablement/docs-generator")} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Create Your First Content
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
