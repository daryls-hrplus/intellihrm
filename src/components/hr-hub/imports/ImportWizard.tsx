import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X,
  Wand2,
  RotateCcw
} from "lucide-react";

// Import wizard step components
import { WizardStepWelcome } from "./wizard/WizardStepWelcome";
import { WizardStepCompanySelection, CompanyStructure } from "./wizard/WizardStepCompanySelection";
import { WizardStepCompensationModel, CompensationModel, getRequiredImportsForModel } from "./wizard/WizardStepCompensationModel";
import { WizardStepSelectType } from "./wizard/WizardStepSelectType";
import { WizardStepTemplate } from "./wizard/WizardStepTemplate";
import { WizardStepUpload } from "./wizard/WizardStepUpload";
import { WizardStepReview } from "./wizard/WizardStepReview";
import { WizardStepCommit } from "./wizard/WizardStepCommit";
import { WizardStepPrerequisiteCheck } from "./wizard/WizardStepPrerequisiteCheck";

export interface WizardState {
  importType: string | null;
  companyId: string | null;
  companyCode: string | null;
  companyStructure: CompanyStructure | null;
  compensationModel: CompensationModel | null;
  file: File | null;
  parsedData: any[] | null;
  validationResult: any | null;
  batchId: string | null;
  isValidating: boolean;
  isCommitting: boolean;
  committedCount: number;
  // Track completed imports in this session
  completedImports: string[];
  // Track if we're in a prerequisite import flow
  pendingImportType: string | null;
  // Track if prerequisites have been checked/passed
  prerequisitesChecked: boolean;
  // Default password for employee imports
  defaultPassword: string | null;
}

interface ImportWizardProps {
  companyId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

// All possible wizard steps (now includes Company Selection and Prerequisites)
const ALL_WIZARD_STEPS = [
  { title: "Welcome", description: "Overview" },
  { title: "Company", description: "Select target" },
  { title: "Import Type", description: "Choose data" },
  { title: "Compensation", description: "Pay model" },
  { title: "Prerequisites", description: "Check data" },
  { title: "Template", description: "Download" },
  { title: "Upload", description: "Validate" },
  { title: "Review", description: "Preview" },
  { title: "Commit", description: "Import" },
];

// Only positions require compensation model selection
const requiresCompensationStep = (importType: string | null): boolean => {
  return importType === "positions";
};

// Check if compensation model needs prerequisites
const requiresPrerequisiteStep = (compensationModel: CompensationModel | null): boolean => {
  if (!compensationModel) return false;
  const requiredImports = getRequiredImportsForModel(compensationModel);
  return requiredImports.length > 0;
};

export function ImportWizard({ companyId, onComplete, onCancel }: ImportWizardProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    importType: null,
    companyId: companyId || null,
    companyCode: null,
    companyStructure: null,
    compensationModel: null,
    file: null,
    parsedData: null,
    validationResult: null,
    batchId: null,
    isValidating: false,
    isCommitting: false,
    committedCount: 0,
    completedImports: [],
    pendingImportType: null,
    prerequisitesChecked: false,
    defaultPassword: null,
  });

  // Dynamic steps based on selected import type and compensation model
  const activeSteps = useMemo(() => {
    // Start with all steps
    let steps = [...ALL_WIZARD_STEPS];
    
    const needsCompensation = requiresCompensationStep(state.importType);
    const needsPrerequisites = needsCompensation && requiresPrerequisiteStep(state.compensationModel);
    
    // Build list of indices to remove (remove from highest to lowest to avoid index shifting)
    const indicesToRemove: number[] = [];
    
    // Remove compensation step (index 3) and prerequisites step (index 4) for non-positions imports
    if (!needsCompensation) {
      indicesToRemove.push(3, 4); // Compensation and Prerequisites
    } else if (!needsPrerequisites) {
      indicesToRemove.push(4); // Only Prerequisites
    }
    
    // Filter out the indices
    steps = steps.filter((_, index) => !indicesToRemove.includes(index));
    
    return steps;
  }, [state.importType, state.compensationModel]);

  const totalSteps = activeSteps.length;

  // Safety guard: clamp currentStep if activeSteps shrinks
  useEffect(() => {
    if (currentStep >= activeSteps.length && activeSteps.length > 0) {
      setCurrentStep(activeSteps.length - 1);
    }
  }, [activeSteps.length, currentStep]);

  // Reset file/validation state when import type changes (but keep company selection)
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
    const needsPrerequisites = needsCompensation && requiresPrerequisiteStep(state.compensationModel);
    
    // Step indices vary based on flow:
    // Full positions flow (with prereqs): 0=Welcome, 1=Company, 2=Type, 3=Comp, 4=Prereq, 5=Template, 6=Upload, 7=Review, 8=Commit
    // Positions flow (no prereqs): 0=Welcome, 1=Company, 2=Type, 3=Comp, 4=Template, 5=Upload, 6=Review, 7=Commit
    // Non-positions: 0=Welcome, 1=Company, 2=Type, 3=Template, 4=Upload, 5=Review, 6=Commit

    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Company Selection
        return !!state.companyId;
      case 2: // Select Type
        return !!state.importType;
      case 3: // Compensation (if positions) or Template (if not)
        if (needsCompensation) {
          return !!state.compensationModel;
        }
        return true; // Template step - always can proceed
      case 4: // Prerequisites (if positions+prereqs) or Template (positions) or Upload (non-positions)
        if (needsCompensation && needsPrerequisites) {
          return state.prerequisitesChecked;
        }
        if (needsCompensation) return true; // Template
        return !!state.validationResult && !state.isValidating; // Upload
      case 5: // Template (if prereqs) or Upload (positions) or Review (non-positions)
        if (needsCompensation && needsPrerequisites) return true; // Template
        if (needsCompensation) {
          return !!state.validationResult && !state.isValidating;
        }
        return !!state.validationResult && 
          (state.validationResult.errorCount === 0 || state.validationResult.validRows > 0);
      case 6: // Upload (if prereqs) or Review (positions) or Commit (non-positions)
        if (needsCompensation && needsPrerequisites) {
          return !!state.validationResult && !state.isValidating;
        }
        if (needsCompensation) {
          return !!state.validationResult && 
            (state.validationResult.errorCount === 0 || state.validationResult.validRows > 0);
        }
        return state.committedCount > 0;
      case 7: // Review (if prereqs) or Commit (positions)
        if (needsCompensation && needsPrerequisites) {
          return !!state.validationResult && 
            (state.validationResult.errorCount === 0 || state.validationResult.validRows > 0);
        }
        return state.committedCount > 0;
      case 8: // Commit (only for prereqs flow)
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
    // Only allow going back to steps that are before current
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

  // Handle continuing with next import type after successful commit
  const handleContinueImporting = () => {
    // Add current import type to completed list
    const newCompleted = state.importType 
      ? [...state.completedImports, state.importType]
      : state.completedImports;
    
    // Reset for next import while keeping company selection
    setState((prev) => ({
      ...prev,
      importType: null,
      file: null,
      parsedData: null,
      validationResult: null,
      batchId: null,
      isCommitting: false,
      committedCount: 0,
      completedImports: newCompleted,
      // Keep company selection
      companyId: prev.companyId,
      companyCode: prev.companyCode,
      companyStructure: prev.companyStructure,
      compensationModel: null,
    }));
    
    // Go back to import type selection (step 2)
    setCurrentStep(2);
    
    toast.success("Ready for next import type");
  };

  // Handle switching company
  const handleSwitchCompany = () => {
    setState({
      importType: null,
      companyId: null,
      companyCode: null,
      companyStructure: null,
      compensationModel: null,
      file: null,
      parsedData: null,
      validationResult: null,
      batchId: null,
      isValidating: false,
      isCommitting: false,
      committedCount: 0,
      completedImports: [],
      pendingImportType: null,
      prerequisitesChecked: false,
      defaultPassword: null,
    });
    setCurrentStep(1); // Go to company selection
  };

  // Handle importing a prerequisite (e.g., salary grades)
  const handleImportPrerequisite = (prereqType: string) => {
    // Store current import type intention and switch to prerequisite import
    setState((prev) => ({
      ...prev,
      pendingImportType: prev.importType,
      importType: prereqType,
      prerequisitesChecked: false,
      // Reset file/validation state for the new import
      file: null,
      parsedData: null,
      validationResult: null,
      batchId: null,
      isCommitting: false,
      committedCount: 0,
    }));
    // Go directly to Template step (step 3 for non-positions imports like salary_grades)
    setCurrentStep(3);
  };

  // Handle resuming the pending import after completing a prerequisite import
  const handleResumePendingImport = () => {
    if (!state.pendingImportType) return;
    
    setState((prev) => ({
      ...prev,
      importType: prev.pendingImportType,
      pendingImportType: null,
      prerequisitesChecked: false,
      // Reset file/validation state for the resumed import
      file: null,
      parsedData: null,
      validationResult: null,
      batchId: null,
      isCommitting: false,
      committedCount: 0,
    }));
    // Go to compensation model step (step 3) - the model is already selected
    // The prerequisite step will auto-pass since we just imported the data
    setCurrentStep(3);
  };

  // Handle skipping prerequisites by switching to direct pay
  const handleSkipToDirectPay = () => {
    updateState({ 
      compensationModel: "direct_pay",
      prerequisitesChecked: true,
    });
    handleNext(); // Proceed to template step
  };

  // Handle prerequisites met
  const handlePrerequisitesMet = () => {
    updateState({ prerequisitesChecked: true });
    handleNext(); // Auto-proceed to template step
  };

  const renderStep = () => {
    const needsCompensation = requiresCompensationStep(state.importType);
    const needsPrerequisites = needsCompensation && requiresPrerequisiteStep(state.compensationModel);

    switch (currentStep) {
      case 0:
        return <WizardStepWelcome />;
      case 1:
        return (
          <WizardStepCompanySelection
            selectedCompanyId={state.companyId}
            onSelectCompany={(id, code, structure) => 
              updateState({ companyId: id, companyCode: code, companyStructure: structure })
            }
          />
        );
      case 2:
        return (
          <WizardStepSelectType
            selectedType={state.importType}
            onSelectType={(type) => updateState({ importType: type })}
            companyId={state.companyId}
            companyCode={state.companyCode}
            companyStructure={state.companyStructure}
            compensationModel={state.compensationModel}
            completedImports={state.completedImports}
          />
        );
      case 3:
        if (needsCompensation) {
          return (
            <WizardStepCompensationModel
              selectedModel={state.compensationModel}
              onSelectModel={(model) => updateState({ compensationModel: model, prerequisitesChecked: false })}
            />
          );
        }
        return (
          <WizardStepTemplate
            importType={state.importType!}
            compensationModel={state.compensationModel}
            companyStructure={state.companyStructure}
          />
        );
      case 4:
        if (needsCompensation && needsPrerequisites) {
          return (
            <WizardStepPrerequisiteCheck
              compensationModel={state.compensationModel}
              companyId={state.companyId}
              companyCode={state.companyCode}
              onPrerequisitesMet={handlePrerequisitesMet}
              onImportPrerequisite={handleImportPrerequisite}
              onSkipToDirectPay={handleSkipToDirectPay}
            />
          );
        }
        if (needsCompensation) {
          return (
            <WizardStepTemplate
              importType={state.importType!}
              compensationModel={state.compensationModel}
              companyStructure={state.companyStructure}
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
      case 5:
        // Template (if prereqs) or Upload (positions no prereqs) or Review (non-positions)
        if (needsCompensation && needsPrerequisites) {
          return (
            <WizardStepTemplate
              importType={state.importType!}
              compensationModel={state.compensationModel}
              companyStructure={state.companyStructure}
            />
          );
        }
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
      case 6:
        // Upload (if prereqs) or Review (positions no prereqs) or Commit (non-positions)
        if (needsCompensation && needsPrerequisites) {
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
            defaultPassword={state.defaultPassword}
            onDefaultPasswordChange={(password) => updateState({ defaultPassword: password })}
            onBatchCreated={(batchId) => updateState({ batchId })}
            onCommitStart={() => updateState({ isCommitting: true })}
            onCommitComplete={(count) => updateState({ isCommitting: false, committedCount: count })}
          />
        );
      case 7:
        // Review (if prereqs) or Commit (positions no prereqs)
        if (needsCompensation && needsPrerequisites) {
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
            defaultPassword={state.defaultPassword}
            onDefaultPasswordChange={(password) => updateState({ defaultPassword: password })}
            onBatchCreated={(batchId) => updateState({ batchId })}
            onCommitStart={() => updateState({ isCommitting: true })}
            onCommitComplete={(count) => updateState({ isCommitting: false, committedCount: count })}
          />
        );
      case 8:
        // Commit (only for prereqs flow)
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
            defaultPassword={state.defaultPassword}
            onDefaultPasswordChange={(password) => updateState({ defaultPassword: password })}
            onBatchCreated={(batchId) => updateState({ batchId })}
            onCommitStart={() => updateState({ isCommitting: true })}
            onCommitComplete={(count) => updateState({ isCommitting: false, committedCount: count })}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === totalSteps - 1;
  const showContinueOptions = isLastStep && state.committedCount > 0;

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Import Wizard
              {state.companyCode && (
                <span className="text-sm font-normal text-muted-foreground">
                  — {state.companyCode}
                </span>
              )}
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
          {showContinueOptions ? (
            <>
              {state.pendingImportType ? (
                <Button
                  onClick={handleResumePendingImport}
                  className="bg-primary hover:bg-primary/90"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue to {state.pendingImportType === "positions" ? "Positions" : state.pendingImportType} Import
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleContinueImporting}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Continue Importing
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Finish Session
                  </Button>
                </>
              )}
            </>
          ) : isLastStep ? (
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
