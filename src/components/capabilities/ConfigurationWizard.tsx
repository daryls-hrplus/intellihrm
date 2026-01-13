import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ListChecks,
  Briefcase,
  Zap,
  Brain,
  Loader2,
  AlertCircle,
  Target,
  Wand2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Capability } from "@/hooks/useCapabilities";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  isComplete: boolean;
  isSkill?: boolean;
  isCompetency?: boolean;
}

interface ConfigurationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capability: Capability | null;
  onComplete: () => void;
}

export function ConfigurationWizard({
  open,
  onOpenChange,
  capability,
  onComplete,
}: ConfigurationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Step-specific state
  const [behavioralIndicators, setBehavioralIndicators] = useState<string[]>([]);
  const [newIndicator, setNewIndicator] = useState("");
  const [canBeInferred, setCanBeInferred] = useState(false);
  const [inferenceKeywords, setInferenceKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [linkedJobs, setLinkedJobs] = useState<{ id: string; title: string }[]>([]);
  const [availableJobs, setAvailableJobs] = useState<{ id: string; title: string }[]>([]);
  const [linkedSkills, setLinkedSkills] = useState<{ id: string; name: string }[]>([]);
  const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string }[]>([]);

  const isSkill = capability?.type === "SKILL";

  // Define steps based on capability type
  const steps: WizardStep[] = [
    {
      id: "behavioral",
      title: isSkill ? "Proficiency Indicators" : "Behavioral Indicators",
      description: isSkill 
        ? "Define what proficiency looks like at each level"
        : "Define observable behaviors that demonstrate this competency",
      icon: ListChecks,
      isComplete: behavioralIndicators.length > 0,
    },
    ...(isSkill ? [{
      id: "ai",
      title: "AI Configuration",
      description: "Configure AI inference settings for automatic skill detection",
      icon: Brain,
      isComplete: canBeInferred && inferenceKeywords.length > 0,
      isSkill: true,
    }] : []),
    {
      id: "jobs",
      title: "Link to Jobs",
      description: "Associate this capability with relevant job profiles",
      icon: Briefcase,
      isComplete: linkedJobs.length > 0,
    },
    ...(!isSkill ? [{
      id: "skills",
      title: "Map Skills",
      description: "Link underlying skills to this competency",
      icon: Zap,
      isComplete: linkedSkills.length > 0,
      isCompetency: true,
    }] : []),
  ];

  useEffect(() => {
    if (open && capability) {
      loadExistingData();
      loadAvailableData();
    }
  }, [open, capability?.id]);

  const loadExistingData = async () => {
    if (!capability) return;
    setLoading(true);
    try {
      // Load behavioral indicators
      if (isSkill) {
        const { data: skillAttr } = await supabase
          .from("skill_attributes")
          .select("inference_keywords, can_be_inferred")
          .eq("capability_id", capability.id)
          .single();
        
        if (skillAttr) {
          setInferenceKeywords(skillAttr.inference_keywords || []);
          setCanBeInferred(skillAttr.can_be_inferred || false);
        }
        
        // Use proficiency_indicators from metadata if available
        const capWithIndicators = capability as any;
        if (capWithIndicators.proficiency_indicators) {
          const indicators = Object.values(capWithIndicators.proficiency_indicators as Record<string, any>)
            .map((ind: any) => ind.description || ind)
            .filter(Boolean);
          setBehavioralIndicators(indicators);
        }
      } else {
        const { data: compAttr } = await supabase
          .from("competency_attributes")
          .select("behavioral_indicators")
          .eq("capability_id", capability.id)
          .single();
        
        if (compAttr?.behavioral_indicators) {
          const indicators = (compAttr.behavioral_indicators as any[])
            .map((ind: any) => ind.description || ind.indicator || JSON.stringify(ind))
            .filter(Boolean);
          setBehavioralIndicators(indicators);
        }
      }

      // Load linked jobs
      const { data: jobLinks } = await supabase
        .from("job_capability_requirements")
        .select("jobs(id, title)")
        .eq("capability_id", capability.id);
      
      if (jobLinks) {
        setLinkedJobs(jobLinks.map((j: any) => ({ id: j.jobs.id, title: j.jobs.title })));
      }

      // Load linked skills (for competencies)
      if (!isSkill) {
        const { data: skillLinks } = await supabase
          .from("competency_skill_mappings")
          .select("skill:skills_competencies!skill_id(id, name)")
          .eq("competency_id", capability.id);
        
        if (skillLinks) {
          setLinkedSkills(skillLinks.map((s: any) => ({ id: s.skill.id, name: s.skill.name })));
        }
      }
    } catch (err) {
      console.error("Error loading existing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableData = async () => {
    try {
      // Load available jobs
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, job_title")
        .eq("is_active", true)
        .order("job_title")
        .limit(50);
      
      if (jobs) {
        setAvailableJobs(jobs.map((j: any) => ({ id: j.id, title: j.job_title })));
      }

      // Load available skills (for competency mapping)
      if (!isSkill) {
        const { data: skills } = await supabase
          .from("skills_competencies")
          .select("id, name")
          .eq("type", "SKILL")
          .eq("status", "active")
          .order("name")
          .limit(50);
        
        if (skills) {
          setAvailableSkills(skills);
        }
      }
    } catch (err) {
      console.error("Error loading available data:", err);
    }
  };

  const handleGenerateIndicators = async () => {
    if (!capability) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: {
          action: "generate_proficiency_indicators",
          capability: {
            id: capability.id,
            name: capability.name,
            type: capability.type,
            description: capability.description,
          },
        },
      });

      if (error) throw error;

      if (data?.indicators) {
        const indicators = Object.values(data.indicators)
          .map((ind: any) => ind.description || ind)
          .filter(Boolean);
        setBehavioralIndicators(indicators);
        toast.success("Indicators generated successfully!");
      }
    } catch (err) {
      console.error("Error generating indicators:", err);
      toast.error("Failed to generate indicators");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddIndicator = () => {
    if (newIndicator.trim()) {
      setBehavioralIndicators([...behavioralIndicators, newIndicator.trim()]);
      setNewIndicator("");
    }
  };

  const handleRemoveIndicator = (index: number) => {
    setBehavioralIndicators(behavioralIndicators.filter((_, i) => i !== index));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !inferenceKeywords.includes(newKeyword.trim())) {
      setInferenceKeywords([...inferenceKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setInferenceKeywords(inferenceKeywords.filter(k => k !== keyword));
  };

  const handleToggleJob = (job: { id: string; title: string }) => {
    if (linkedJobs.some(j => j.id === job.id)) {
      setLinkedJobs(linkedJobs.filter(j => j.id !== job.id));
    } else {
      setLinkedJobs([...linkedJobs, job]);
    }
  };

  const handleToggleSkill = (skill: { id: string; name: string }) => {
    if (linkedSkills.some(s => s.id === skill.id)) {
      setLinkedSkills(linkedSkills.filter(s => s.id !== skill.id));
    } else {
      setLinkedSkills([...linkedSkills, skill]);
    }
  };

  const handleSaveStep = async () => {
    if (!capability) return;
    setLoading(true);
    
    const step = steps[currentStep];
    
    try {
      switch (step.id) {
        case "behavioral":
          // Save behavioral/proficiency indicators
          if (isSkill) {
            // Update proficiency_indicators in main table
            const indicatorsObj: Record<string, any> = {};
            behavioralIndicators.forEach((ind, i) => {
              indicatorsObj[`level_${i + 1}`] = { level: i + 1, description: ind };
            });
            
            await supabase
              .from("skills_competencies")
              .update({ proficiency_indicators: indicatorsObj })
              .eq("id", capability.id);
          } else {
            // Update competency_attributes
            const indicators = behavioralIndicators.map((ind, i) => ({
              level: i + 1,
              description: ind,
            }));
            
            await supabase
              .from("competency_attributes")
              .upsert({
                capability_id: capability.id,
                behavioral_indicators: indicators,
              }, { onConflict: "capability_id" });
          }
          break;

        case "ai":
          // Save AI configuration for skills
          await supabase
            .from("skill_attributes")
            .upsert({
              capability_id: capability.id,
              can_be_inferred: canBeInferred,
              inference_keywords: inferenceKeywords,
            }, { onConflict: "capability_id" });
          break;

        case "jobs":
          // Remove existing links and add new ones
          await supabase
            .from("job_capability_requirements")
            .delete()
            .eq("capability_id", capability.id);
          
          if (linkedJobs.length > 0) {
            await supabase
              .from("job_capability_requirements")
              .insert(
                linkedJobs.map(job => ({
                  job_id: job.id,
                  capability_id: capability.id,
                  required_level: 3,
                  is_required: true,
                }))
              );
          }
          break;

        case "skills":
          // Save skill mappings for competencies
          await supabase
            .from("competency_skill_mappings")
            .delete()
            .eq("competency_id", capability.id);
          
          if (linkedSkills.length > 0) {
            await supabase
              .from("competency_skill_mappings")
              .insert(
                linkedSkills.map(skill => ({
                  competency_id: capability.id,
                  skill_id: skill.id,
                  weight: 1,
                  is_required: false,
                }))
              );
          }
          break;
      }

      toast.success(`${step.title} saved!`);
    } catch (err) {
      console.error("Error saving step:", err);
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    await handleSaveStep();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completedSteps = steps.filter(s => s.isComplete).length;
  const progress = (completedSteps / steps.length) * 100;

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case "behavioral":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>
                {isSkill ? "Proficiency Level Descriptions" : "Behavioral Indicators"}
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateIndicators}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                AI Generate
              </Button>
            </div>
            
            <div className="space-y-2">
              {behavioralIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <Badge variant="secondary" className="shrink-0">
                    L{index + 1}
                  </Badge>
                  <p className="text-sm flex-1">{indicator}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveIndicator(index)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={newIndicator}
                onChange={(e) => setNewIndicator(e.target.value)}
                placeholder="Add a new indicator..."
                className="min-h-[60px]"
              />
              <Button onClick={handleAddIndicator} disabled={!newIndicator.trim()}>
                Add
              </Button>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <Label htmlFor="can-infer">Enable AI Inference</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to suggest this skill from resume/text analysis
                </p>
              </div>
              <Switch
                id="can-infer"
                checked={canBeInferred}
                onCheckedChange={setCanBeInferred}
              />
            </div>

            {canBeInferred && (
              <div className="space-y-3">
                <Label>Inference Keywords</Label>
                <p className="text-xs text-muted-foreground">
                  Keywords that indicate this skill in text
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {inferenceKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveKeyword(keyword)}
                    >
                      {keyword}
                      <span className="ml-1 text-muted-foreground">×</span>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
                    onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                  />
                  <Button onClick={handleAddKeyword} disabled={!newKeyword.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case "jobs":
        return (
          <div className="space-y-4">
            <Label>Select Jobs</Label>
            <p className="text-sm text-muted-foreground">
              Link this {isSkill ? "skill" : "competency"} to relevant job profiles
            </p>
            
            <ScrollArea className="h-[250px] border rounded-lg p-2">
              <div className="space-y-1">
                {availableJobs.map((job) => {
                  const isLinked = linkedJobs.some(j => j.id === job.id);
                  return (
                    <button
                      key={job.id}
                      onClick={() => handleToggleJob(job)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors",
                        isLinked
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {isLinked ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm">{job.title}</span>
                    </button>
                  );
                })}
                {availableJobs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No jobs available</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <p className="text-xs text-muted-foreground">
              {linkedJobs.length} job(s) selected
            </p>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-4">
            <Label>Map Skills to Competency</Label>
            <p className="text-sm text-muted-foreground">
              Link underlying skills that contribute to this competency
            </p>
            
            <ScrollArea className="h-[250px] border rounded-lg p-2">
              <div className="space-y-1">
                {availableSkills.map((skill) => {
                  const isLinked = linkedSkills.some(s => s.id === skill.id);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => handleToggleSkill(skill)}
                      className={cn(
                        "w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors",
                        isLinked
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {isLinked ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <Zap className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="text-sm">{skill.name}</span>
                    </button>
                  );
                })}
                {availableSkills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No skills available</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <p className="text-xs text-muted-foreground">
              {linkedSkills.length} skill(s) selected
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSkill ? (
              <Zap className="h-5 w-5 text-blue-500" />
            ) : (
              <Target className="h-5 w-5 text-purple-500" />
            )}
            Configure {capability?.name}
          </DialogTitle>
          <DialogDescription>
            Complete these steps to fully configure your {isSkill ? "skill" : "competency"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-muted-foreground">
              {completedSteps}/{steps.length} complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = index === currentStep;
            const isPast = index < currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : step.isComplete
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {step.isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        <Separator />

        {/* Step content */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Save & Exit
            </Button>
            <Button
              onClick={handleNext}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {currentStep === steps.length - 1 ? "Complete" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
