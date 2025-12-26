import { useState, useEffect } from "react";
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

const WIZARD_STEPS = [
  { title: "Welcome", description: "Overview" },
  { title: "Compensation", description: "Pay model" },
  { title: "Select Type", description: "Choose data" },
  { title: "Template", description: "Download" },
  { title: "Upload", description: "Validate" },
  { title: "Review", description: "Preview" },
  { title: "Commit", description: "Import" },
];

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

  // Reset state when import type changes
  useEffect(() => {
    if (state.importType) {
      setState((prev) => ({
        ...prev,
        file: null,
        parsedData: null,
        validationResult: null,
        batchId: null,
      }));
    }
  }, [state.importType]);

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Compensation Model
        return !!state.compensationModel;
      case 2: // Select Type
        return !!state.importType;
      case 3: // Template
        return true;
      case 4: // Upload
        return !!state.validationResult && !state.isValidating;
      case 5: // Review
        return !!state.validationResult && 
          (state.validationResult.errorCount === 0 || state.validationResult.validRows > 0);
      case 6: // Commit
        return state.committedCount > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
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
    switch (currentStep) {
      case 0:
        return <WizardStepWelcome />;
      case 1:
        return (
          <WizardStepCompensationModel
            selectedModel={state.compensationModel}
            onSelectModel={(model) => updateState({ compensationModel: model })}
          />
        );
      case 2:
        return (
          <WizardStepSelectType
            selectedType={state.importType}
            onSelectType={(type) => updateState({ importType: type })}
            companyId={state.companyId}
            compensationModel={state.compensationModel}
          />
        );
      case 3:
        return (
          <WizardStepTemplate
            importType={state.importType!}
            compensationModel={state.compensationModel}
          />
        );
      case 4:
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
      case 5:
        return (
          <WizardStepReview
            importType={state.importType!}
            parsedData={state.parsedData}
            validationResult={state.validationResult}
            onDataChange={(data) => updateState({ parsedData: data })}
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
          steps={WIZARD_STEPS}
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
          {currentStep === WIZARD_STEPS.length - 1 ? (
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
