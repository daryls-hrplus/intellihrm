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
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Capability } from "@/hooks/useCapabilities";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { JobLinkDialog, LinkedJobConfig } from "./JobLinkDialog";
import { ProficiencyLevelBadge } from "./ProficiencyLevelPicker";

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
  const [companyName, setCompanyName] = useState<string | null>(null);
  
  // Step-specific state
  const [behavioralIndicators, setBehavioralIndicators] = useState<string[]>([]);
  const [newIndicator, setNewIndicator] = useState("");
  const [canBeInferred, setCanBeInferred] = useState(false);
  const [inferenceKeywords, setInferenceKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  
  // Rich job linking state
  const [linkedJobs, setLinkedJobs] = useState<LinkedJobConfig[]>([]);
  const [availableJobs, setAvailableJobs] = useState<{ id: string; name: string; job_level?: string | null }[]>([]);
  const [jobLinkDialogOpen, setJobLinkDialogOpen] = useState(false);
  const [editingJobLink, setEditingJobLink] = useState<LinkedJobConfig | null>(null);
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
      setCurrentStep(0); // Reset to first step when opening
      loadExistingData();
      loadAvailableData();
      loadCompanyName();
    }
  }, [open, capability?.id]);

  const loadCompanyName = async () => {
    if (!capability?.company_id) {
      setCompanyName(null);
      return;
    }
    try {
      const { data } = await supabase
        .from("companies")
        .select("name")
        .eq("id", capability.company_id)
        .single();
      setCompanyName(data?.name || null);
    } catch (err) {
      console.error("Error loading company:", err);
    }
  };

  const loadExistingData = async () => {
    if (!capability) return;
    setLoading(true);
    try {
      // Fetch fresh capability data from DB to get latest proficiency_indicators
      const { data: freshCapability } = await supabase
        .from("skills_competencies")
        .select("proficiency_indicators")
        .eq("id", capability.id)
        .single();

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
        
        // Use proficiency_indicators from fresh DB data
        if (freshCapability?.proficiency_indicators) {
          const indicators = Object.values(freshCapability.proficiency_indicators as Record<string, any>)
            .map((ind: any) => ind.description || ind)
            .filter(Boolean);
          setBehavioralIndicators(indicators);
        }
      } else {
        // For competencies, also check proficiency_indicators first (AI saves here)
        if (freshCapability?.proficiency_indicators) {
          const indicators = Object.values(freshCapability.proficiency_indicators as Record<string, any>)
            .map((ind: any) => ind.description || ind)
            .filter(Boolean);
          setBehavioralIndicators(indicators);
        } else {
          // Fallback to competency_attributes
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
      }

      // Load linked jobs with full configuration
      const { data: jobLinks } = await supabase
        .from("job_capability_requirements")
        .select(`
          job_id,
          required_proficiency_level,
          weighting,
          is_required,
          is_preferred,
          start_date,
          end_date,
          notes,
          jobs(id, name)
        `)
        .eq("capability_id", capability.id);
      
      if (jobLinks) {
        setLinkedJobs(jobLinks.map((j: any) => ({
          job_id: j.job_id,
          job_name: j.jobs?.name || "",
          required_proficiency_level: j.required_proficiency_level || 3,
          weighting: j.weighting || 10,
          is_required: j.is_required ?? true,
          is_preferred: j.is_preferred ?? false,
          start_date: j.start_date || new Date().toISOString().split("T")[0],
          end_date: j.end_date || null,
          notes: j.notes || null,
        })));
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
    if (!capability) return;
    
    try {
      // Load available jobs - filter by company if capability has company_id
      let jobsQuery = supabase
        .from("jobs")
        .select("id, name, job_level")
        .eq("is_active", true)
        .order("name")
        .limit(100);
      
      if (capability.company_id) {
        jobsQuery = jobsQuery.eq("company_id", capability.company_id);
      }
      
      const { data: jobs } = await jobsQuery;
      
      if (jobs) {
        setAvailableJobs(jobs.map((j: any) => ({ id: j.id, name: j.name, job_level: j.job_level })));
      }

      // Load available skills (for competency mapping) - filter by company_id to avoid duplicates
      if (!isSkill) {
        let skillsQuery = supabase
          .from("skills_competencies")
          .select("id, name")
          .eq("type", "SKILL")
          .eq("status", "active")
          .order("name")
          .limit(100);
        
        // Only load skills from same company to avoid duplicates
        if (capability.company_id) {
          skillsQuery = skillsQuery.eq("company_id", capability.company_id);
        } else {
          skillsQuery = skillsQuery.is("company_id", null);
        }
        
        const { data: skills } = await skillsQuery;
        
        if (skills) {
          // Remove duplicates by name
          const uniqueSkills = skills.filter((skill, index, self) => 
            index === self.findIndex((s) => s.name === skill.name)
          );
          setAvailableSkills(uniqueSkills);
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
      } else if (data?.saved) {
        // Indicators were saved to DB, reload from DB
        toast.success("Indicators generated and saved!");
        await loadExistingData();
      } else {
        toast.error("No indicators returned from AI");
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

  const handleAddJobLink = (config: LinkedJobConfig) => {
    setLinkedJobs([...linkedJobs, config]);
    setEditingJobLink(null);
  };

  const handleUpdateJobLink = (config: LinkedJobConfig) => {
    setLinkedJobs(linkedJobs.map(j => 
      j.job_id === config.job_id ? config : j
    ));
    setEditingJobLink(null);
  };

  const handleRemoveJobLink = (jobId: string) => {
    setLinkedJobs(linkedJobs.filter(j => j.job_id !== jobId));
  };

  const handleEditJobLink = (link: LinkedJobConfig) => {
    setEditingJobLink(link);
    setJobLinkDialogOpen(true);
  };

  const handleOpenJobLinkDialog = () => {
    setEditingJobLink(null);
    setJobLinkDialogOpen(true);
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
          // Remove existing links and add new ones with full configuration
          await supabase
            .from("job_capability_requirements")
            .delete()
            .eq("capability_id", capability.id);
          
          if (linkedJobs.length > 0) {
            await supabase
              .from("job_capability_requirements")
              .insert(
                linkedJobs.map(link => ({
                  job_id: link.job_id,
                  capability_id: capability.id,
                  required_proficiency_level: link.required_proficiency_level,
                  weighting: link.weighting,
                  is_required: link.is_required,
                  is_preferred: link.is_preferred,
                  start_date: link.start_date,
                  end_date: link.end_date,
                  notes: link.notes,
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

  const isCurrentStepValid = (): boolean => {
    const step = steps[currentStep];
    switch (step.id) {
      case "behavioral":
        return behavioralIndicators.length > 0;
      case "ai":
        // AI config is optional - valid if inference is disabled or has keywords
        return !canBeInferred || inferenceKeywords.length > 0;
      case "jobs":
        // Jobs linking is optional
        return true;
      case "skills":
        // Skills mapping is optional
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!isCurrentStepValid()) {
      toast.error("Please complete this step before continuing");
      return;
    }
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
            <div className="flex items-center justify-between">
              <div>
                <Label>Linked Jobs</Label>
                <p className="text-sm text-muted-foreground">
                  Configure how this {isSkill ? "skill" : "competency"} applies to each job
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleOpenJobLinkDialog}
                disabled={availableJobs.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Link Job
              </Button>
            </div>
            
            <ScrollArea className="h-[280px] border rounded-lg">
              {linkedJobs.length > 0 ? (
                <div className="divide-y">
                  {linkedJobs.map((link) => (
                    <div
                      key={link.job_id}
                      className="p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-sm">{link.job_name}</span>
                            <ProficiencyLevelBadge level={link.required_proficiency_level} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {link.weighting}% weight
                            </Badge>
                            <Badge 
                              variant={link.is_required ? "default" : link.is_preferred ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {link.is_required ? "Required" : link.is_preferred ? "Preferred" : "Optional"}
                            </Badge>
                            <span>From: {link.start_date}</span>
                            {link.end_date && <span>To: {link.end_date}</span>}
                          </div>
                          {link.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {link.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditJobLink(link)}
                            className="h-7 w-7 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveJobLink(link.job_id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                  <Briefcase className="h-10 w-10 mb-3" />
                  <p className="text-sm font-medium">No jobs linked</p>
                  <p className="text-xs mt-1">Click "Link Job" to associate this {isSkill ? "skill" : "competency"} with jobs</p>
                </div>
              )}
            </ScrollArea>

            <p className="text-xs text-muted-foreground">
              {linkedJobs.length} job(s) linked
            </p>

            <JobLinkDialog
              open={jobLinkDialogOpen}
              onOpenChange={setJobLinkDialogOpen}
              availableJobs={availableJobs}
              existingJobIds={linkedJobs.map(j => j.job_id)}
              editingLink={editingJobLink}
              onSave={editingJobLink ? handleUpdateJobLink : handleAddJobLink}
              isSkill={isSkill}
            />
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

        {/* Capability Context Info */}
        {capability && (
          <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {capability.category}
                </Badge>
                {capability.company_id ? (
                  <Badge variant="secondary">
                    {companyName || "Company"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    Global
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {capability.code}
              </span>
            </div>
            {capability.description && (
              <p className="text-sm text-muted-foreground">
                {capability.description}
              </p>
            )}
          </div>
        )}

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

        {/* Validation warning */}
        {steps[currentStep]?.id === "behavioral" && behavioralIndicators.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm">
              Please add at least one {isSkill ? "proficiency indicator" : "behavioral indicator"} to continue.
              Use AI Generate or add manually.
            </p>
          </div>
        )}

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
              disabled={loading || (steps[currentStep]?.id === "behavioral" && behavioralIndicators.length === 0)}
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
