import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight } from "lucide-react";

interface PersonalizationModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (answers: Record<string, unknown>) => void;
}

const roleOptions = [
  { value: "hr_leader", label: "HR Director / CHRO" },
  { value: "hr_manager", label: "HR Manager / Business Partner" },
  { value: "payroll", label: "Payroll / Finance" },
  { value: "it", label: "IT / Systems Administrator" },
  { value: "executive", label: "Executive / C-Suite" },
  { value: "other", label: "Other" },
];

const companySizeOptions = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1,000 employees" },
  { value: "1001+", label: "1,000+ employees" },
];

const priorityOptions = [
  { value: "compliance", label: "Compliance & regulations" },
  { value: "payroll", label: "Payroll & compensation" },
  { value: "talent", label: "Talent & performance" },
  { value: "analytics", label: "Reporting & analytics" },
  { value: "all", label: "Full platform overview" },
];

export function PersonalizationModal({ open, onClose, onComplete }: PersonalizationModalProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(answers);
      // Reset for next time
      setStep(1);
      setAnswers({});
    }
  };

  const handleSkip = () => {
    onClose();
    setStep(1);
    setAnswers({});
  };

  const canProceed = () => {
    if (step === 1) return !!answers.role;
    if (step === 2) return !!answers.company_size;
    if (step === 3) return !!answers.priority;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={() => handleSkip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalize Your Tour</DialogTitle>
          <DialogDescription>
            Help us tailor the demo to your needs. Step {step} of 3
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">What's your role?</Label>
              <RadioGroup
                value={answers.role || ""}
                onValueChange={(value) => handleAnswer("role", value)}
                className="grid gap-2"
              >
                {roleOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAnswer("role", option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">How large is your organization?</Label>
              <RadioGroup
                value={answers.company_size || ""}
                onValueChange={(value) => handleAnswer("company_size", value)}
                className="grid gap-2"
              >
                {companySizeOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAnswer("company_size", option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">What's your top priority?</Label>
              <RadioGroup
                value={answers.priority || ""}
                onValueChange={(value) => handleAnswer("priority", value)}
                className="grid gap-2"
              >
                {priorityOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAnswer("priority", option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {step === 3 ? "Start Tour" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
