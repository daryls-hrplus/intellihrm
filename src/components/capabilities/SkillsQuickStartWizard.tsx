import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  WizardStepper,
  WizardStepWelcome,
  WizardStepCompany,
  WizardStepIndustry,
  WizardStepOccupations,
  WizardStepSkillsPreview,
  WizardStepCompetenciesPreview,
  WizardStepReview,
  WizardStepImporting,
  WizardStepComplete,
  WizardStep,
  MasterSkill,
  MasterCompetency,
  ImportProgress,
  WIZARD_STEPS,
} from "./wizard";

interface SkillsQuickStartWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onComplete: () => void;
}

export function SkillsQuickStartWizard({
  open,
  onOpenChange,
  companyId,
  onComplete,
}: SkillsQuickStartWizardProps) {
  const { user } = useAuth();
  
  // Wizard step state
  const [currentStep, setCurrentStep] = useState<WizardStep>("welcome");
  
  // Selection state - start empty so user must actively select a company
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isGlobal, setIsGlobal] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSubIndustries, setSelectedSubIndustries] = useState<string[]>([]);
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);
  const [occupationLabels, setOccupationLabels] = useState<Record<string, string>>({});
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedCompetencies, setSelectedCompetencies] = useState<Set<string>>(new Set());
  const [proficiencyLevels, setProficiencyLevels] = useState<Record<string, string>>({});
  
  // Data state
  const [allSkills, setAllSkills] = useState<MasterSkill[]>([]);
  const [allCompetencies, setAllCompetencies] = useState<MasterCompetency[]>([]);
  
  // Import state
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  // Navigation helpers
  const getStepIndex = (step: WizardStep) => WIZARD_STEPS.findIndex(s => s.step === step);
  
  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case "welcome":
        return true;
      case "company":
        return isGlobal || selectedCompanies.length > 0;
      case "industry":
        return selectedIndustries.length > 0;
      case "occupations":
        return selectedOccupations.length > 0;
      case "skills-preview":
        return selectedSkills.size > 0 || allSkills.filter(s => !s.alreadyExists).length === 0;
      case "competencies-preview":
        return true; // Competencies are optional
      case "review":
        return selectedSkills.size > 0 || selectedCompetencies.size > 0;
      default:
        return false;
    }
  }, [currentStep, selectedCompanies, isGlobal, selectedIndustries, selectedOccupations, selectedSkills, selectedCompetencies, allSkills]);

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const currentIndex = getStepIndex(currentStep);
    const nextStep = WIZARD_STEPS[currentIndex + 1];
    if (nextStep && nextStep.step !== "importing" && nextStep.step !== "complete") {
      setCurrentStep(nextStep.step);
    } else if (currentStep === "review") {
      handleStartImport();
    }
  };

  const goBack = () => {
    const currentIndex = getStepIndex(currentStep);
    const prevStep = WIZARD_STEPS[currentIndex - 1];
    if (prevStep && prevStep.step !== "importing" && prevStep.step !== "complete") {
      setCurrentStep(prevStep.step);
    }
  };

  // Company selection handlers
  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleGlobalToggle = (global: boolean) => {
    setIsGlobal(global);
    if (global) {
      setSelectedCompanies([]);
    }
  };

  // Handlers
  const handleIndustryToggle = (industryCode: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industryCode)
        ? prev.filter(c => c !== industryCode)
        : [...prev, industryCode]
    );
    // Clear downstream selections when industry changes
    setSelectedSubIndustries([]);
    setSelectedOccupations([]);
    setOccupationLabels({});
    setSelectedSkills(new Set());
    setSelectedCompetencies(new Set());
  };

  const handleSubIndustryToggle = (subIndustryCode: string) => {
    setSelectedSubIndustries(prev =>
      prev.includes(subIndustryCode)
        ? prev.filter(c => c !== subIndustryCode)
        : [...prev, subIndustryCode]
    );
    // Clear downstream selections when sub-industry changes
    setSelectedOccupations([]);
    setOccupationLabels({});
    setSelectedSkills(new Set());
    setSelectedCompetencies(new Set());
  };

  const handleOccupationToggle = (occupationId: string, occupationLabel: string) => {
    setSelectedOccupations(prev =>
      prev.includes(occupationId)
        ? prev.filter(id => id !== occupationId)
        : [...prev, occupationId]
    );
    setOccupationLabels(prev => ({ ...prev, [occupationId]: occupationLabel }));
  };

  const handleSelectAllOccupations = (occupations: { id: string; name: string }[]) => {
    setSelectedOccupations(occupations.map(o => o.id));
    const labels: Record<string, string> = {};
    occupations.forEach(o => { labels[o.id] = o.name; });
    setOccupationLabels(prev => ({ ...prev, ...labels }));
  };

  const handleDeselectAllOccupations = () => {
    setSelectedOccupations([]);
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  const handleSelectAllSkills = () => {
    const nonDuplicateSkills = allSkills.filter(s => !s.alreadyExists);
    setSelectedSkills(new Set(nonDuplicateSkills.map(s => s.id)));
  };

  const handleDeselectAllSkills = () => {
    setSelectedSkills(new Set());
  };

  const handleCompetencyToggle = (competencyId: string) => {
    setSelectedCompetencies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(competencyId)) {
        newSet.delete(competencyId);
      } else {
        newSet.add(competencyId);
      }
      return newSet;
    });
  };

  const handleSelectAllCompetencies = () => {
    const nonDuplicateComps = allCompetencies.filter(c => !c.alreadyExists);
    setSelectedCompetencies(new Set(nonDuplicateComps.map(c => c.id)));
  };

  const handleDeselectAllCompetencies = () => {
    setSelectedCompetencies(new Set());
  };

  const handleProficiencyChange = (itemId: string, level: string) => {
    setProficiencyLevels(prev => ({ ...prev, [itemId]: level }));
  };

  const handleSkillsLoaded = (skills: MasterSkill[]) => {
    setAllSkills(skills);
    // Auto-select all non-duplicate skills
    const nonDuplicates = skills.filter(s => !s.alreadyExists);
    setSelectedSkills(new Set(nonDuplicates.map(s => s.id)));
  };

  const handleCompetenciesLoaded = (competencies: MasterCompetency[]) => {
    setAllCompetencies(competencies);
    // Auto-select all non-duplicate competencies
    const nonDuplicates = competencies.filter(c => !c.alreadyExists);
    setSelectedCompetencies(new Set(nonDuplicates.map(c => c.id)));
  };

  // Helper to map categories
  const mapCategory = (category: string): string => {
    const mapping: Record<string, string> = {
      'Technical': 'technical',
      'Functional': 'functional',
      'Behavioral': 'behavioral',
      'Leadership': 'leadership',
      'Compliance': 'core',
    };
    return mapping[category] || 'functional';
  };

  // Import logic
  const handleStartImport = async () => {
    if (!user) {
      toast.error("Please ensure you're logged in");
      return;
    }

    // Determine the primary company for skills_competencies.company_id
    // If global, set company_id to null; otherwise use first selected company
    // IMPORTANT: selectedCompanies MUST have at least one company if not global
    const primaryCompanyId = isGlobal ? null : selectedCompanies[0];
    
    if (!isGlobal && !primaryCompanyId) {
      toast.error("Please select at least one company");
      return;
    }

    const skillsToImport = allSkills.filter(s => selectedSkills.has(s.id) && !s.alreadyExists);
    const competenciesToImport = allCompetencies.filter(c => selectedCompetencies.has(c.id) && !c.alreadyExists);
    
    const totalItems = skillsToImport.length + competenciesToImport.length;
    
    if (totalItems === 0) {
      toast.info("No new items to import");
      setCurrentStep("complete");
      setProgress({
        current: 0,
        total: 0,
        currentItem: "",
        importedSkills: 0,
        importedCompetencies: 0,
        skipped: allSkills.filter(s => s.alreadyExists).length + allCompetencies.filter(c => c.alreadyExists).length,
        errors: [],
      });
      return;
    }

    setCurrentStep("importing");
    setProgress({
      current: 0,
      total: totalItems,
      currentItem: "",
      importedSkills: 0,
      importedCompetencies: 0,
      skipped: 0,
      errors: [],
    });

    let importedSkills = 0;
    let importedCompetencies = 0;
    let skipped = 0;
    const errors: string[] = [];
    let currentCount = 0;

    // Helper function to create company_capabilities entries
    const createCompanyCapabilities = async (capabilityId: string) => {
      if (isGlobal) {
        // For global capabilities, we don't need company_capabilities entries
        // as they're accessible to all via is_global flag
        return;
      }
      
      // Create entries for each selected company
      for (const compId of selectedCompanies) {
        await supabase
          .from('company_capabilities')
          .insert({
            company_id: compId,
            capability_id: capabilityId,
            created_by: user.id,
          })
          .single();
      }
    };

    // Import skills
    for (const skill of skillsToImport) {
      currentCount++;
      setProgress(prev => prev ? {
        ...prev,
        current: currentCount,
        currentItem: skill.skill_name,
      } : null);

      try {
        const profLevel = proficiencyLevels[skill.id] || skill.proficiency_level || 'proficient';
        
        const { data: insertedSkill, error: insertError } = await supabase
          .from('skills_competencies')
          .insert([{
            company_id: primaryCompanyId,
            is_global: isGlobal,
            type: 'SKILL' as const,
            name: skill.skill_name,
            code: skill.skill_name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20),
            description: skill.description,
            category: mapCategory(skill.category || '') as 'technical' | 'leadership' | 'functional' | 'behavioral' | 'core',
            status: 'active' as const,
            version: 1,
            effective_from: new Date().toISOString().split('T')[0],
            created_by: user.id,
            metadata: {
            source: 'Intelli HRM Quick Start Wizard',
              master_skill_id: skill.id,
              original_source: skill.source,
              proficiency_level: profLevel,
            }
          }])
          .select('id')
          .single();

        if (insertError) {
          if (insertError.code === '23505') { // Duplicate
            skipped++;
          } else {
            errors.push(`Skill "${skill.skill_name}": ${insertError.message}`);
          }
        } else if (insertedSkill) {
          importedSkills++;
          // Create company_capabilities entries for multi-company support
          await createCompanyCapabilities(insertedSkill.id);
        }
      } catch (err) {
        errors.push(`Skill "${skill.skill_name}": ${err instanceof Error ? err.message : String(err)}`);
      }

      setProgress(prev => prev ? {
        ...prev,
        importedSkills,
        skipped,
        errors,
      } : null);

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Import competencies
    for (const comp of competenciesToImport) {
      currentCount++;
      setProgress(prev => prev ? {
        ...prev,
        current: currentCount,
        currentItem: comp.competency_name,
      } : null);

      try {
        const profLevel = proficiencyLevels[comp.id] || comp.proficiency_level || 'proficient';
        
        const { data: insertedComp, error: insertError } = await supabase
          .from('skills_competencies')
          .insert([{
            company_id: primaryCompanyId,
            is_global: isGlobal,
            type: 'COMPETENCY' as const,
            name: comp.competency_name,
            code: comp.competency_name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20),
            description: comp.description,
            category: mapCategory(comp.category || '') as 'technical' | 'leadership' | 'functional' | 'behavioral' | 'core',
            status: 'active' as const,
            version: 1,
            effective_from: new Date().toISOString().split('T')[0],
            created_by: user.id,
            metadata: {
              source: 'Intelli HRM Quick Start Wizard',
              master_competency_id: comp.id,
              original_source: comp.source,
              proficiency_level: profLevel,
            }
          }])
          .select('id')
          .single();

        if (insertError) {
          if (insertError.code === '23505') { // Duplicate
            skipped++;
          } else {
            errors.push(`Competency "${comp.competency_name}": ${insertError.message}`);
          }
        } else if (insertedComp) {
          importedCompetencies++;
          // Create company_capabilities entries for multi-company support
          await createCompanyCapabilities(insertedComp.id);
        }
      } catch (err) {
        errors.push(`Competency "${comp.competency_name}": ${err instanceof Error ? err.message : String(err)}`);
      }

      setProgress(prev => prev ? {
        ...prev,
        importedCompetencies,
        skipped,
        errors,
      } : null);

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setProgress(prev => prev ? {
      ...prev,
      current: totalItems,
      currentItem: "",
      importedSkills,
      importedCompetencies,
      skipped,
      errors,
    } : null);

    setCurrentStep("complete");
    toast.success(`Imported ${importedSkills} skills and ${importedCompetencies} competencies`);
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep("welcome");
    setSelectedCompanies([]);
    setIsGlobal(false);
    setSelectedIndustries([]);
    setSelectedSubIndustries([]);
    setSelectedOccupations([]);
    setOccupationLabels({});
    setSelectedSkills(new Set());
    setSelectedCompetencies(new Set());
    setProficiencyLevels({});
    setAllSkills([]);
    setAllCompetencies([]);
    setProgress(null);
    
    onOpenChange(false);
    if (currentStep === "complete") {
      onComplete();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <WizardStepWelcome
            onNext={goNext}
            onCancel={handleClose}
          />
        );
      
      case "company":
        return (
          <WizardStepCompany
            selectedCompanies={selectedCompanies}
            isGlobal={isGlobal}
            onCompanyToggle={handleCompanyToggle}
            onGlobalToggle={handleGlobalToggle}
          />
        );
      
      case "industry":
        return (
          <WizardStepIndustry
            selectedIndustries={selectedIndustries}
            selectedSubIndustries={selectedSubIndustries}
            onIndustryToggle={handleIndustryToggle}
            onSubIndustryToggle={handleSubIndustryToggle}
          />
        );
      
      case "occupations":
        return (
          <WizardStepOccupations
            selectedIndustries={selectedIndustries}
            selectedSubIndustries={selectedSubIndustries}
            selectedOccupations={selectedOccupations}
            occupationLabels={occupationLabels}
            onOccupationToggle={handleOccupationToggle}
            onSelectAll={handleSelectAllOccupations}
            onDeselectAll={handleDeselectAllOccupations}
          />
        );
      
      case "skills-preview":
        return (
          <WizardStepSkillsPreview
            selectedOccupations={selectedOccupations}
            selectedSkills={selectedSkills}
            proficiencyLevels={proficiencyLevels}
            companyId={companyId}
            onSkillToggle={handleSkillToggle}
            onSelectAll={handleSelectAllSkills}
            onDeselectAll={handleDeselectAllSkills}
            onProficiencyChange={handleProficiencyChange}
            onSkillsLoaded={handleSkillsLoaded}
          />
        );
      
      case "competencies-preview":
        return (
          <WizardStepCompetenciesPreview
            selectedOccupations={selectedOccupations}
            selectedCompetencies={selectedCompetencies}
            proficiencyLevels={proficiencyLevels}
            companyId={companyId}
            onCompetencyToggle={handleCompetencyToggle}
            onSelectAll={handleSelectAllCompetencies}
            onDeselectAll={handleDeselectAllCompetencies}
            onProficiencyChange={handleProficiencyChange}
            onCompetenciesLoaded={handleCompetenciesLoaded}
          />
        );
      
      case "review":
        return (
          <WizardStepReview
            selectedIndustries={selectedIndustries}
            selectedOccupations={selectedOccupations}
            occupationLabels={occupationLabels}
            selectedSkills={selectedSkills}
            selectedCompetencies={selectedCompetencies}
            allSkills={allSkills}
            allCompetencies={allCompetencies}
          />
        );
      
      case "importing":
        return progress ? <WizardStepImporting progress={progress} /> : null;
      
      case "complete":
        return progress ? (
          <WizardStepComplete progress={progress} onClose={handleClose} />
        ) : null;
      
      default:
        return null;
    }
  };

  const showNavigation = !["welcome", "importing", "complete"].includes(currentStep);
  const showStepper = !["welcome"].includes(currentStep);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Capability Library Import Wizard
          </DialogTitle>
          <DialogDescription>
            Import skills and competencies from the Intelli HRM library
          </DialogDescription>
        </DialogHeader>

        {showStepper && (
          <div className="py-4 border-b">
            <WizardStepper
              currentStep={currentStep}
              onStepClick={(step) => {
                const targetIndex = getStepIndex(step);
                const currentIndex = getStepIndex(currentStep);
                if (targetIndex < currentIndex) {
                  goToStep(step);
                }
              }}
            />
          </div>
        )}

        <ScrollArea className="flex-1 overflow-auto">
          <div className="py-4 px-1">
            {renderStep()}
          </div>
        </ScrollArea>

        {showNavigation && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={goNext}
              disabled={!canGoNext()}
            >
              {currentStep === "review" ? (
                <>
                  Start Import
                  <Loader2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
