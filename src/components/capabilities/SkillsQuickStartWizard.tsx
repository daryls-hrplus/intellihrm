import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Rocket,
  AlertCircle,
  Zap,
  Target,
  XCircle,
} from "lucide-react";
import { IndustrySelector } from "./IndustrySelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SkillsQuickStartWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onComplete: () => void;
}

type WizardStep = "welcome" | "industry" | "importing" | "complete";

interface ImportProgress {
  current: number;
  total: number;
  currentOccupation: string;
  importedSkills: number;
  importedCompetencies: number;
  skipped: number;
  errors: string[];
}

export function SkillsQuickStartWizard({
  open,
  onOpenChange,
  companyId,
  onComplete,
}: SkillsQuickStartWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);
  const [occupationLabels, setOccupationLabels] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const handleOccupationToggle = (occupationId: string, occupationLabel?: string) => {
    setSelectedOccupations((prev) =>
      prev.includes(occupationId)
        ? prev.filter((id) => id !== occupationId)
        : [...prev, occupationId]
    );
    if (occupationLabel) {
      setOccupationLabels((prev) => ({ ...prev, [occupationId]: occupationLabel }));
    }
  };

  const handleSelectAllOccupations = (occupations: { uri: string; label: string }[]) => {
    setSelectedOccupations(occupations.map(o => o.uri));
    const labels: Record<string, string> = {};
    occupations.forEach(o => { labels[o.uri] = o.label; });
    setOccupationLabels((prev) => ({ ...prev, ...labels }));
  };

  const handleStartImport = async () => {
    if (!user || selectedOccupations.length === 0 || !companyId) {
      toast.error("Please select a company and at least one occupation");
      return;
    }

    setStep("importing");
    setProgress({
      current: 0,
      total: selectedOccupations.length,
      currentOccupation: "",
      importedSkills: 0,
      importedCompetencies: 0,
      skipped: 0,
      errors: [],
    });

    let totalImportedSkills = 0;
    let totalImportedCompetencies = 0;
    let totalSkipped = 0;
    const allErrors: string[] = [];

    // Get the industry ID
    const { data: industryData } = await supabase
      .from('master_industries')
      .select('id')
      .eq('code', selectedIndustry)
      .single();

    const industryId = industryData?.id;

    for (let i = 0; i < selectedOccupations.length; i++) {
      const occupationId = selectedOccupations[i];
      const occupationLabel = occupationLabels[occupationId] || "Unknown";

      setProgress((prev) =>
        prev
          ? {
              ...prev,
              current: i + 1,
              currentOccupation: occupationLabel,
            }
          : null
      );

      try {
        // 1. Get skills for this occupation from master_occupation_skills
        const { data: occupationSkills, error: skillsError } = await supabase
          .from('master_occupation_skills')
          .select(`
            skill_id,
            proficiency_level,
            master_skills_library (
              id,
              skill_name,
              skill_type,
              category,
              description,
              source,
              reuse_level
            )
          `)
          .eq('occupation_id', occupationId);

        if (skillsError) throw skillsError;

        // 2. Get competencies for this occupation from master_occupation_competencies
        const { data: occupationCompetencies, error: compsError } = await supabase
          .from('master_occupation_competencies')
          .select(`
            competency_id,
            proficiency_level,
            master_competencies_library (
              id,
              competency_name,
              competency_type,
              category,
              description,
              source
            )
          `)
          .eq('occupation_id', occupationId);

        if (compsError) throw compsError;

        // 3. Also get skills associated with the industry
        let industrySkills: any[] = [];
        if (industryId) {
          const { data: indSkills } = await supabase
            .from('master_industry_skills')
            .select(`
              skill_id,
              relevance_score,
              master_skills_library (
                id,
                skill_name,
                skill_type,
                category,
                description,
                source,
                reuse_level
              )
            `)
            .eq('industry_id', industryId);
          industrySkills = indSkills || [];
        }

        // Combine skills from occupation and industry (deduplicate)
        const allSkills = new Map<string, any>();
        occupationSkills?.forEach((s: any) => {
          if (s.master_skills_library) {
            allSkills.set(s.skill_id, s.master_skills_library);
          }
        });
        industrySkills.forEach((s: any) => {
          if (s.master_skills_library && !allSkills.has(s.skill_id)) {
            allSkills.set(s.skill_id, s.master_skills_library);
          }
        });

        // 4. Import skills to company capabilities table
        for (const [skillId, skill] of allSkills) {
          // Check if already exists
          const { data: existing } = await supabase
            .from('skills_competencies')
            .select('id')
            .eq('company_id', companyId)
            .eq('name', skill.skill_name)
            .eq('type', 'SKILL')
            .maybeSingle();

          if (existing) {
            totalSkipped++;
            continue;
          }

          // Insert new skill
          const { error: insertError } = await supabase
            .from('skills_competencies')
            .insert([{
              company_id: companyId,
              type: 'SKILL' as const,
              name: skill.skill_name,
              code: skill.skill_name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20),
              description: skill.description,
              category: mapCategory(skill.category) as 'technical' | 'leadership' | 'functional' | 'behavioral' | 'core',
              status: 'active' as const,
              version: 1,
              effective_from: new Date().toISOString().split('T')[0],
              created_by: user.id,
              metadata: {
                source: 'HRplus Quick Start',
                master_skill_id: skillId,
                original_source: skill.source,
              }
            }]);

          if (insertError) {
            allErrors.push(`Skill "${skill.skill_name}": ${insertError.message}`);
          } else {
            totalImportedSkills++;
          }
        }

        // 5. Import competencies to company capabilities table
        for (const comp of (occupationCompetencies || [])) {
          if (!comp.master_competencies_library) continue;
          const competency = comp.master_competencies_library as any;

          // Check if already exists
          const { data: existing } = await supabase
            .from('skills_competencies')
            .select('id')
            .eq('company_id', companyId)
            .eq('name', competency.competency_name)
            .eq('type', 'COMPETENCY')
            .maybeSingle();

          if (existing) {
            totalSkipped++;
            continue;
          }

          // Insert new competency
          const { error: insertError } = await supabase
            .from('skills_competencies')
            .insert([{
              company_id: companyId,
              type: 'COMPETENCY' as const,
              name: competency.competency_name,
              code: competency.competency_name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20),
              description: competency.description,
              category: mapCategory(competency.category) as 'technical' | 'leadership' | 'functional' | 'behavioral' | 'core',
              status: 'active' as const,
              version: 1,
              effective_from: new Date().toISOString().split('T')[0],
              created_by: user.id,
              metadata: {
                source: 'HRplus Quick Start',
                master_competency_id: comp.competency_id,
                original_source: competency.source,
              }
            }]);

          if (insertError) {
            allErrors.push(`Competency "${competency.competency_name}": ${insertError.message}`);
          } else {
            totalImportedCompetencies++;
          }
        }

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        allErrors.push(`${occupationLabel}: ${msg}`);
      }

      setProgress((prev) =>
        prev
          ? {
              ...prev,
              importedSkills: totalImportedSkills,
              importedCompetencies: totalImportedCompetencies,
              skipped: totalSkipped,
              errors: allErrors,
            }
          : null
      );

      // Small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setStep("complete");
    toast.success(`Imported ${totalImportedSkills} skills and ${totalImportedCompetencies} competencies`);
  };

  const handleClose = () => {
    setStep("welcome");
    setSelectedIndustry(null);
    setSelectedOccupations([]);
    setProgress(null);
    onOpenChange(false);
    if (step === "complete") {
      onComplete();
    }
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Skills Quick Start Wizard
          </DialogTitle>
          <DialogDescription>
            Quickly populate your skills library with industry-standard skills from the HRplus library
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === "welcome" && (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Rocket className="h-10 w-10 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  Welcome to Skills Quick Start
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Get started in under 2 minutes by importing pre-curated skills
                  for your industry from the HRplus library, built for Caribbean
                  and African enterprises.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">90+ Skills</p>
                  <p className="text-xs text-muted-foreground">
                    Industry relevant
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">15 Competencies</p>
                  <p className="text-xs text-muted-foreground">Core behaviors</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Check className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Ready to Use</p>
                  <p className="text-xs text-muted-foreground">
                    No manual entry
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={handleClose}>
                  I'll add skills manually
                </Button>
                <Button onClick={() => setStep("industry")}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "industry" && (
            <div className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <IndustrySelector
                  selectedIndustry={selectedIndustry}
                  selectedOccupations={selectedOccupations}
                  onIndustrySelect={setSelectedIndustry}
                  onOccupationToggle={handleOccupationToggle}
                  onSelectAllOccupations={handleSelectAllOccupations}
                />
              </ScrollArea>

              {selectedOccupations.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{selectedOccupations.length}</strong> occupation(s)
                    selected - skills and competencies will be imported for your company.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStep("welcome")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleStartImport}
                  disabled={selectedOccupations.length === 0}
                >
                  Import Skills & Competencies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "importing" && progress && (
            <div className="py-8 space-y-6">
              <div className="text-center space-y-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-bold">Importing Skills & Competencies...</h2>
                <p className="text-muted-foreground">
                  Please wait while we import from the HRplus library
                </p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Occupation {progress.current} of {progress.total}
                    </span>
                    <span>
                      {Math.round((progress.current / progress.total) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(progress.current / progress.total) * 100}
                    className="h-2"
                  />
                </div>

                {progress.currentOccupation && (
                  <p className="text-sm text-center text-muted-foreground">
                    Processing: {progress.currentOccupation}
                  </p>
                )}

                <div className="flex justify-center gap-4 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {progress.importedSkills} skills
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Target className="h-3 w-3" />
                    {progress.importedCompetencies} competencies
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {progress.skipped} skipped
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {step === "complete" && progress && (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Import Complete!</h2>
                <p className="text-muted-foreground">
                  Your skills & competencies library is now ready to use
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {progress.importedSkills}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Skills
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {progress.importedCompetencies}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Competencies
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-2xl font-bold">{progress.skipped}</p>
                  <p className="text-sm text-muted-foreground">
                    Already Existed
                  </p>
                </div>
              </div>

              {progress.errors.length > 0 && (
                <Alert variant="destructive" className="max-w-md mx-auto text-left">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">Some errors occurred:</p>
                    <ul className="text-xs list-disc list-inside">
                      {progress.errors.slice(0, 3).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {progress.errors.length > 3 && (
                        <li>...and {progress.errors.length - 3} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleClose} size="lg">
                <Check className="mr-2 h-4 w-4" />
                View My Skills & Competencies
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
