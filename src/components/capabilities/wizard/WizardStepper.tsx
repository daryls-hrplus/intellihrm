import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardStep, WIZARD_STEPS } from "./types";

interface WizardStepperProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

export function WizardStepper({ currentStep, onStepClick }: WizardStepperProps) {
  const currentIndex = WIZARD_STEPS.findIndex(s => s.step === currentStep);
  
  // Only show navigation steps (exclude importing/complete as they're automatic)
  const navSteps = WIZARD_STEPS.filter(s => 
    !["importing", "complete"].includes(s.step)
  );

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {navSteps.map((stepInfo, index) => {
          const stepIndex = WIZARD_STEPS.findIndex(s => s.step === stepInfo.step);
          const isCompleted = currentIndex > stepIndex;
          const isCurrent = currentIndex === stepIndex;
          const canClick = isCompleted && onStepClick;

          return (
            <div key={stepInfo.step} className="flex items-center flex-1 last:flex-initial">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!canClick}
                  onClick={() => canClick && onStepClick(stepInfo.step)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isCompleted && "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                    canClick && "cursor-pointer"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
                <div className="mt-1 text-center">
                  <p className={cn(
                    "text-xs font-medium",
                    (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {stepInfo.title}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < navSteps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  currentIndex > stepIndex ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
