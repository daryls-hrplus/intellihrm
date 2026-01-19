import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEssEntitlement, ESS_ELIGIBLE_MODULES } from "@/hooks/useEssEntitlement";
import { useESSApprovalPolicies } from "@/hooks/useESSApprovalPolicy";
import { 
  Wand2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  CheckCircle2 
} from "lucide-react";

interface ESSSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WIZARD_STEPS = [
  { id: 'modules', title: 'Select Modules', description: 'Choose which modules to enable for employees' },
  { id: 'policies', title: 'Approval Policies', description: 'Configure approval requirements' },
  { id: 'review', title: 'Review & Activate', description: 'Confirm your settings' },
];

export function ESSSetupWizard({ open, onOpenChange }: ESSSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isActivating, setIsActivating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { getModuleReadiness, bulkUpdateConfig } = useEssEntitlement();
  const { seedDefaultPolicies, hasNoPolicies } = useESSApprovalPolicies();

  // Group modules by category for selection
  const modulesByCategory = ESS_ELIGIBLE_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof ESS_ELIGIBLE_MODULES>);

  const licensedModules = ESS_ELIGIBLE_MODULES.filter(m => getModuleReadiness(m.code).isLicensed);

  const handleModuleToggle = (code: string) => {
    setSelectedModules(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code) 
        : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    const allLicensedCodes = licensedModules.map(m => m.code);
    setSelectedModules(allLicensedCodes);
  };

  const handleSelectNone = () => {
    setSelectedModules([]);
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      // Enable selected modules
      if (selectedModules.length > 0) {
        await bulkUpdateConfig({ module_codes: selectedModules, ess_enabled: true });
      }

      // Seed default policies if none exist
      if (hasNoPolicies) {
        await seedDefaultPolicies.mutateAsync();
      }

      setIsComplete(true);
    } catch (error) {
      console.error("Error activating ESS:", error);
    } finally {
      setIsActivating(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedModules([]);
    setIsComplete(false);
    onOpenChange(false);
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <DialogTitle>ESS Setup Wizard</DialogTitle>
          </div>
          <DialogDescription>
            Configure Employee Self-Service in a few simple steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            {WIZARD_STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-1 ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="py-4 min-h-[300px]">
          {isComplete ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ESS Setup Complete!</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Employee Self-Service has been configured. Employees can now access the enabled modules from their ESS portal.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-500/10">
                  {selectedModules.length} modules enabled
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10">
                  Default policies configured
                </Badge>
              </div>
            </div>
          ) : currentStep === 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Select the modules you want employees to access. Only licensed modules can be enabled.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All Licensed
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectNone}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {Object.entries(modulesByCategory).map(([category, modules]) => (
                  <Card key={category}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-2">
                        {modules.map(module => {
                          const readiness = getModuleReadiness(module.code);
                          const isDisabled = !readiness.isLicensed;
                          
                          return (
                            <div 
                              key={module.code}
                              className={`flex items-center space-x-2 p-2 rounded-md ${isDisabled ? 'opacity-50' : 'hover:bg-muted/50'}`}
                            >
                              <Checkbox
                                id={module.code}
                                checked={selectedModules.includes(module.code)}
                                onCheckedChange={() => handleModuleToggle(module.code)}
                                disabled={isDisabled}
                              />
                              <Label 
                                htmlFor={module.code} 
                                className={`text-sm ${isDisabled ? 'text-muted-foreground' : 'cursor-pointer'}`}
                              >
                                {module.name}
                                {!readiness.isLicensed && (
                                  <Badge variant="outline" className="ml-2 text-xs">Not Licensed</Badge>
                                )}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : currentStep === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We'll configure approval policies based on industry best practices. You can customize these later.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recommended Approval Policies
                  </CardTitle>
                  <CardDescription>These defaults follow SAP SuccessFactors patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Low Risk Changes</p>
                      <p className="text-xs text-muted-foreground">Emergency contact, Address, Medical info</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Auto-Approve</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Medium Risk Changes</p>
                      <p className="text-xs text-muted-foreground">Dependents, Qualifications, Government IDs</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">HR Review</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">High Risk Changes</p>
                      <p className="text-xs text-muted-foreground">Banking details</p>
                    </div>
                    <Badge className="bg-red-100 text-red-700">Workflow Approval</Badge>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground">
                You can modify these policies anytime from the Approval Policies tab after setup.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Review your configuration before activating ESS for employees.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Modules to Enable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedModules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No modules selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedModules.map(code => {
                        const module = ESS_ELIGIBLE_MODULES.find(m => m.code === code);
                        return (
                          <Badge key={code} variant="secondary">
                            {module?.name || code}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Approval Policies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {hasNoPolicies 
                      ? "Default approval policies will be created (10 policies covering all risk levels)"
                      : "Existing approval policies will be preserved"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          {isComplete ? (
            <Button onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              {currentStep < WIZARD_STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={currentStep === 0 && selectedModules.length === 0}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleActivate} disabled={isActivating || selectedModules.length === 0}>
                  {isActivating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Activate ESS
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
