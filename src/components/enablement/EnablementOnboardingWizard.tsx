import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  ClipboardCheck, 
  Rocket, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  content: React.ReactNode;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "welcome",
    title: "Welcome to the Enablement Hub",
    description: "Your AI-powered documentation command center",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          The Enablement Hub helps you create, review, and publish documentation with AI assistance.
          Follow a simple 4-phase workflow:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Sparkles, label: "Create", desc: "AI-generate content" },
            { icon: ClipboardCheck, label: "Review", desc: "Edit & approve" },
            { icon: Rocket, label: "Release", desc: "Publish to Help Center" },
            { icon: BookOpen, label: "Library", desc: "Browse documentation" },
          ].map((phase) => (
            <div key={phase.label} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <phase.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{phase.label}</p>
                <p className="text-xs text-muted-foreground">{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "create",
    title: "Phase 1: Create Content",
    description: "Use AI to generate documentation instantly",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          The <strong>Content Creation Studio</strong> provides 11 AI-powered tools:
        </p>
        <ul className="space-y-2 text-sm">
          {[
            "Documentation Agent – Chat with AI to analyze and generate content",
            "KB Article Generator – Create help center articles",
            "Quick Start Guide Generator – Module setup guides",
            "SOP Generator – Standard operating procedures",
            "Training Content Generator – Learning materials",
          ].map((tool) => (
            <li key={tool} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{tool}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground italic">
          ...and 6 more specialized tools for videos, SCORM packages, and more.
        </p>
      </div>
    ),
  },
  {
    id: "review",
    title: "Phase 2: Review & Edit",
    description: "Quality control before publishing",
    icon: ClipboardCheck,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          AI-generated content flows to the <strong>Content Review Center</strong> where you can:
        </p>
        <ul className="space-y-2 text-sm">
          {[
            "See pending items in a clean queue view",
            "Compare proposed vs. current content side-by-side",
            "Edit content before approving",
            "Reject with feedback to regenerate",
            "Track review history and audit trail",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground italic">
          Only approved content can be published to end users.
        </p>
      </div>
    ),
  },
  {
    id: "release",
    title: "Phase 3: Manage & Release",
    description: "Publish to your Help Center",
    icon: Rocket,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          The <strong>Release Command Center</strong> is your publishing hub:
        </p>
        <ul className="space-y-2 text-sm">
          {[
            "Track documentation coverage across all modules",
            "Manage content workflow with Kanban boards",
            "Publish individual sections or entire manuals",
            "Set milestones and release schedules",
            "Use AI Release Manager for readiness assessments",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "ready",
    title: "You're Ready!",
    description: "Start creating your documentation",
    icon: CheckCircle2,
    content: (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <p className="text-muted-foreground">
          You're all set to start building your documentation library. The Enablement Hub will guide you through each phase with smart recommendations.
        </p>
        <p className="text-sm font-medium text-primary">
          Click "Get Started" to create your first content with AI!
        </p>
      </div>
    ),
  },
];

const STORAGE_KEY = "enablement-onboarding-complete";

interface EnablementOnboardingWizardProps {
  forceOpen?: boolean;
  onComplete?: () => void;
}

export function EnablementOnboardingWizard({ forceOpen, onComplete }: EnablementOnboardingWizardProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { navigateToList } = useWorkspaceNavigation();

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    
    // Check if onboarding was already completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed !== "true") {
      // Small delay to let page render first
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    onComplete?.();
    
    // Navigate to Content Creation Studio
    navigateToList({
      route: "/enablement/create",
      title: "Content Creation Studio",
      moduleCode: "enablement",
      icon: Sparkles,
    });
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    onComplete?.();
  };

  const step = WIZARD_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const progressValue = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isLastStep ? "bg-emerald-500/10" : "bg-primary/10"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                isLastStep ? "text-emerald-500" : "text-primary"
              )} />
            </div>
            <div>
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-1">
          <Progress value={progressValue} className="h-1" />
          <p className="text-xs text-muted-foreground text-right">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </p>
        </div>

        {/* Content */}
        <div className="py-4">{step.content}</div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip Tour
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            {isLastStep ? (
              <Button onClick={handleComplete}>
                Get Started
                <Sparkles className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => setCurrentStep((prev) => prev + 1)}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
