import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Zap, Target, Check, Layers } from "lucide-react";

interface WizardStepWelcomeProps {
  onNext: () => void;
  onCancel: () => void;
}

export function WizardStepWelcome({ onNext, onCancel }: WizardStepWelcomeProps) {
  return (
    <div className="py-8 text-center space-y-6">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Rocket className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          Capability Library Import Wizard
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Build your skills and competencies library in minutes by importing 
          pre-curated capabilities from the HRplus library, tailored for 
          Caribbean and African enterprises.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-lg bg-muted/50">
          <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">140+ Skills</p>
          <p className="text-xs text-muted-foreground">
            Industry relevant
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <Target className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">25+ Competencies</p>
          <p className="text-xs text-muted-foreground">Core behaviors</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <Layers className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Preview First</p>
          <p className="text-xs text-muted-foreground">Select what you need</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <Check className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Ready to Use</p>
          <p className="text-xs text-muted-foreground">
            No manual entry
          </p>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          This wizard will guide you through:
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="px-2 py-1 rounded bg-muted">Industry</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-muted">Occupations</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-muted">Skills Preview</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-muted">Competencies</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-muted">Import</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center pt-4">
        <Button variant="outline" onClick={onCancel}>
          I'll add manually
        </Button>
        <Button onClick={onNext}>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
