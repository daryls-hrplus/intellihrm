import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X,
  Wand2
} from "lucide-react";

// Import wizard step components
import { WizardStepWelcome } from "./wizard/WizardStepWelcome";
import { WizardStepCompensationModel, CompensationModel, getRequiredImportsForModel } from "./wizard/WizardStepCompensationModel";
import { WizardStepSelectType } from "./wizard/WizardStepSelectType";
import { WizardStepTemplate } from "./wizard/WizardStepTemplate";
import { WizardStepUpload } from "./wizard/WizardStepUpload";
import { WizardStepReview } from "./wizard/WizardStepReview";
import { WizardStepCommit } from "./wizard/WizardStepCommit";

export interface WizardState {
  importType: string | null;
  companyId: string | null;
  compensationModel: CompensationModel | null;
  file: File | null;
  parsedData: any[] | null;
  validationResult: any | null;
  batchId: string | null;
  isValidating: boolean;
  isCommitting: boolean;
  committedCount: number;
}

interface ImportWizardProps {
  companyId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

// All possible wizard steps
const ALL_WIZARD_STEPS = [
  { title: "Welcome", description: "Overview" },
  { title: "Select Type", description: "Choose data" },
  { title: "Compensation", description: "Pay model" },
  { title: "Template", description: "Download" },
  { title: "Upload", description: "Validate" },
  { title: "Review", description: "Preview" },
  { title: "Commit", description: "Import" },
];

// Only positions require compensation model selection
const requiresCompensationStep = (importType: string | null): boolean => {
  return importType === "positions";
};

export function ImportWizard({ companyId, onComplete, onCancel }: ImportWizardProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    importType: null,
    companyId: companyId || null,
    compensationModel: null,
    file: null,
    parsedData: null,
    validationResult: null,
    batchId: null,
    isValidating: false,
    isCommitting: false,
    committedCount: 0,
  });

  // Dynamic steps based on selected import type
  const activeSteps = useMemo(() => {
    if (requiresCompensationStep(state.importType)) {
      return ALL_WIZARD_STEPS; // All 7 steps including compensation
    }
    // Remove compensation step (index 2) for non-positions imports
    return ALL_WIZARD_STEPS.filter((_, index) => index !== 2);
  }, [state.importType]);

  const totalSteps = activeSteps.length;

  // Reset state when import type changes
  useEffect(() => {
    if (state.importType) {
      setState((prev) => ({
        ...prev,
        file: null,
        parsedData: null,
        validationResult: null,
        batchId: null,
        // Clear compensation model if not importing positions
        compensationModel: prev.importType === "positions" ? prev.compensationModel : null,
      }));
    }
  }, [state.importType]);

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    const needsCompensation = requiresCompensationStep(state.importType);

    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Select Type
        return !!state.importType;
      case 2: // Compensation (if positions) or Template (if not)
        if (needsCompensation) {
          return !!state.compensationModel;
        }
        return true; // Template step - always can proceed
      case 3: // Template (if positions) or Upload (if not)
        if (needsCompensation) return true;
        return !!state.validationResult && !state.isValidating;
      case 4: // Upload (if positions) or Review (if not)
        if (needsCompensation) {
          return !!state.validationResult && !state.isValidating;
        }
        return !!state.validationResult && 
          (state.validationResult.errorCount === 0 || state.validationResult.validRows > 0);
      case 5: // Review (if positions) or Commit (if not)
        if (needsCompensation) {
          return !!state.validationResult && 
            (state.validationResult.errorCount === 0 || state.validationResult.validRows > 0);
        }
        return state.committedCount > 0;
      case 6: // Commit (only for positions flow)
        return state.committedCount > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    // Only allow going back
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel the import? All progress will be lost.")) {
      onCancel?.();
    }
  };

  const handleComplete = () => {
    toast.success(`Successfully imported ${state.committedCount} records`);
    onComplete?.();
  };

  const renderStep = () => {
    const needsCompensation = requiresCompensationStep(state.importType);

    switch (currentStep) {
      case 0:
        return <WizardStepWelcome />;
      case 1:
        return (
          <WizardStepSelectType
            selectedType={state.importType}
            onSelectType={(type) => updateState({ importType: type })}
            companyId={state.companyId}
            compensationModel={state.compensationModel}
          />
        );
      case 2:
        if (needsCompensation) {
          return (
            <WizardStepCompensationModel
              selectedModel={state.compensationModel}
              onSelectModel={(model) => updateState({ compensationModel: model })}
            />
          );
        }
        return (
          <WizardStepTemplate
            importType={state.importType!}
            compensationModel={state.compensationModel}
          />
        );
      case 3:
        if (needsCompensation) {
          return (
            <WizardStepTemplate
              importType={state.importType!}
              compensationModel={state.compensationModel}
            />
          );
        }
        return (
          <WizardStepUpload
            importType={state.importType!}
            companyId={state.companyId}
            file={state.file}
            validationResult={state.validationResult}
            isValidating={state.isValidating}
            onFileChange={(file) => updateState({ file })}
            onValidationComplete={(result, parsedData) => 
              updateState({ validationResult: result, parsedData, isValidating: false })
            }
            onValidationStart={() => updateState({ isValidating: true })}
          />
        );
      case 4:
        if (needsCompensation) {
          return (
            <WizardStepUpload
              importType={state.importType!}
              companyId={state.companyId}
              file={state.file}
              validationResult={state.validationResult}
              isValidating={state.isValidating}
              onFileChange={(file) => updateState({ file })}
              onValidationComplete={(result, parsedData) => 
                updateState({ validationResult: result, parsedData, isValidating: false })
              }
              onValidationStart={() => updateState({ isValidating: true })}
            />
          );
        }
        return (
          <WizardStepReview
            importType={state.importType!}
            parsedData={state.parsedData}
            validationResult={state.validationResult}
            onDataChange={(data) => updateState({ parsedData: data })}
          />
        );
      case 5:
        if (needsCompensation) {
          return (
            <WizardStepReview
              importType={state.importType!}
              parsedData={state.parsedData}
              validationResult={state.validationResult}
              onDataChange={(data) => updateState({ parsedData: data })}
            />
          );
        }
        return (
          <WizardStepCommit
            importType={state.importType!}
            companyId={state.companyId}
            parsedData={state.parsedData}
            validationResult={state.validationResult}
            batchId={state.batchId}
            isCommitting={state.isCommitting}
            committedCount={state.committedCount}
            compensationModel={state.compensationModel}
            onBatchCreated={(batchId) => updateState({ batchId })}
            onCommitStart={() => updateState({ isCommitting: true })}
            onCommitComplete={(count) => updateState({ isCommitting: false, committedCount: count })}
          />
        );
      case 6:
        return (
          <WizardStepCommit
            importType={state.importType!}
            companyId={state.companyId}
            parsedData={state.parsedData}
            validationResult={state.validationResult}
            batchId={state.batchId}
            isCommitting={state.isCommitting}
            committedCount={state.committedCount}
            compensationModel={state.compensationModel}
            onBatchCreated={(batchId) => updateState({ batchId })}
            onCommitStart={() => updateState({ isCommitting: true })}
            onCommitComplete={(count) => updateState({ isCommitting: false, committedCount: count })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Import Wizard
            </CardTitle>
            <CardDescription>
              Follow the guided steps to import your data safely
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stepper */}
        <Stepper
          steps={activeSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          className="mb-8"
        />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {currentStep === totalSteps - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={state.committedCount === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Complete Import
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
