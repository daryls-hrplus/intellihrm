import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Link2, Building2, Globe, Sparkles, Brain, Clock, Info, ShieldAlert, GitBranch, BarChart3, Heart, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompetencySkillLinker } from "./CompetencySkillLinker";
import {
  Capability,
  CapabilityType,
  CapabilityCategory,
  CapabilityStatus,
  CreateCapabilityInput,
  ProficiencyScale,
} from "@/hooks/useCapabilities";
import { EnhancedJobApplicabilitySelect } from "./EnhancedJobApplicabilitySelect";
import { useCapabilityJobApplicability, JobRequirementInput } from "@/hooks/useCapabilityJobApplicability";
import { CompetencyBehavioralLevelsEditor, ProficiencyIndicators } from "./CompetencyBehavioralLevelsEditor";
import { useCompetencyUsageCheck } from "@/hooks/capabilities/useCompetencyUsageCheck";
import { VersionImpactReport } from "./VersionImpactReport";

interface CapabilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capability?: Capability | null;
  scales: ProficiencyScale[];
  companies: { id: string; name: string }[];
  onSave: (data: CreateCapabilityInput) => Promise<void>;
  defaultType?: CapabilityType;
  defaultCompanyId?: string | null;
}

const categoryOptions: { value: CapabilityCategory; label: string }[] = [
  { value: "technical", label: "Technical" },
  { value: "functional", label: "Functional" },
  { value: "behavioral", label: "Behavioral" },
  { value: "leadership", label: "Leadership" },
  { value: "core", label: "Core" },
];

const statusOptions: { value: CapabilityStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "active", label: "Active" },
  { value: "deprecated", label: "Deprecated" },
];

export function CapabilityFormDialog({
  open,
  onOpenChange,
  capability,
  scales,
  companies,
  onSave,
  defaultType = "SKILL",
  defaultCompanyId = null,
}: CapabilityFormDialogProps) {
  const isEditing = !!capability;

  const [formData, setFormData] = useState<CreateCapabilityInput>({
    company_id: null,
    type: defaultType,
    name: "",
    code: "",
    description: "",
    category: "technical",
    proficiency_scale_id: undefined,
    status: "draft",
    effective_from: new Date().toISOString().split("T")[0],
    owner_role: "HR",
    skill_attributes: {
      synonyms: [],
      typical_acquisition_modes: [],
      can_be_inferred: true,
      inference_keywords: [],
    },
    competency_attributes: {
      behavioral_indicators: [],
      role_applicability: [],
      can_be_inferred: false,
    },
  });

  const [newSynonym, setNewSynonym] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedJobRequirements, setSelectedJobRequirements] = useState<JobRequirementInput[]>([]);
  const [proficiencyIndicators, setProficiencyIndicators] = useState<ProficiencyIndicators>({});
  const [showVersionReport, setShowVersionReport] = useState(false);

  const { requirements, fetchApplicability, bulkSetApplicability } = useCapabilityJobApplicability();
  const { loading: usageLoading, usage, checkUsage, clearUsage } = useCompetencyUsageCheck();

  useEffect(() => {
    if (capability) {
      // Parse proficiency_indicators from capability metadata if it exists
      const existingIndicators = (capability as any).proficiency_indicators || {};
      setProficiencyIndicators(existingIndicators);
      
      setFormData({
        company_id: capability.company_id,
        type: capability.type,
        name: capability.name,
        code: capability.code,
        description: capability.description || "",
        category: capability.category,
        proficiency_scale_id: capability.proficiency_scale_id || undefined,
        status: capability.status,
        effective_from: capability.effective_from,
        effective_to: capability.effective_to || undefined,
        owner_role: capability.owner_role || "HR",
        external_id: capability.external_id || undefined,
        skill_attributes: capability.skill_attributes || {
          synonyms: [],
          typical_acquisition_modes: [],
          can_be_inferred: true,
          inference_keywords: [],
        },
        competency_attributes: capability.competency_attributes || {
          behavioral_indicators: [],
          role_applicability: [],
          can_be_inferred: false,
        },
      });
      
      // Fetch job applicability for existing competencies
      if (capability.type === "COMPETENCY") {
        fetchApplicability(capability.id).then((apps) => {
          const reqs: JobRequirementInput[] = (apps || []).map((a: any) => ({
            job_id: a.job_id,
            required_proficiency_level: a.required_proficiency_level ?? 3,
            weighting: a.weighting ?? 10,
            is_required: a.is_required ?? true,
            is_preferred: a.is_preferred ?? false,
          }));
          setSelectedJobRequirements(reqs);
        });
        
        // Check if competency is in use in active cycles
        checkUsage(capability.id);
      }
    } else {
      clearUsage();
      setProficiencyIndicators({});
      setFormData({
        company_id: defaultCompanyId,
        type: defaultType,
        name: "",
        code: "",
        description: "",
        category: "technical",
        proficiency_scale_id: undefined,
        status: "draft",
        effective_from: new Date().toISOString().split("T")[0],
        owner_role: "HR",
        skill_attributes: {
          synonyms: [],
          typical_acquisition_modes: [],
          can_be_inferred: true,
          inference_keywords: [],
        },
        competency_attributes: {
          behavioral_indicators: [],
          role_applicability: [],
          can_be_inferred: false,
        },
      });
      setSelectedJobRequirements([]);
    }
  }, [capability, defaultType, defaultCompanyId, open, fetchApplicability]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.code || !formData.category) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      
      // If editing a competency and we have job selections, update job applicability
      if (capability && formData.type === "COMPETENCY") {
        await bulkSetApplicability(capability.id, selectedJobRequirements);
      }
      
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const generateCode = () => {
    const prefix = formData.type === "SKILL" ? "SKL" : formData.type === "VALUE" ? "VAL" : "CMP";
    const nameCode = formData.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .substring(0, 20);
    setFormData((prev) => ({ ...prev, code: `${prefix}_${nameCode}` }));
  };

  const addSynonym = () => {
    if (newSynonym.trim() && formData.skill_attributes) {
      setFormData((prev) => ({
        ...prev,
        skill_attributes: {
          ...prev.skill_attributes!,
          synonyms: [...(prev.skill_attributes?.synonyms || []), newSynonym.trim()],
        },
      }));
      setNewSynonym("");
    }
  };

  const removeSynonym = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skill_attributes: {
        ...prev.skill_attributes!,
        synonyms: prev.skill_attributes?.synonyms?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && formData.skill_attributes) {
      setFormData((prev) => ({
        ...prev,
        skill_attributes: {
          ...prev.skill_attributes!,
          inference_keywords: [...(prev.skill_attributes?.inference_keywords || []), newKeyword.trim()],
        },
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skill_attributes: {
        ...prev.skill_attributes!,
        inference_keywords: prev.skill_attributes?.inference_keywords?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const addRole = () => {
    if (newRole.trim() && formData.competency_attributes) {
      setFormData((prev) => ({
        ...prev,
        competency_attributes: {
          ...prev.competency_attributes!,
          role_applicability: [...(prev.competency_attributes?.role_applicability || []), newRole.trim()],
        },
      }));
      setNewRole("");
    }
  };

  const removeRole = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      competency_attributes: {
        ...prev.competency_attributes!,
        role_applicability: prev.competency_attributes?.role_applicability?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle>
            {isEditing ? "Edit" : "Create"} {formData.type === "SKILL" ? "Skill" : formData.type === "VALUE" ? "Value" : "Competency"}
          </DialogTitle>
          
          {/* Company Context Indicator - Always visible in header */}
          <div className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-lg border",
            formData.company_id 
              ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" 
              : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
          )}>
            {formData.company_id ? (
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            ) : (
              <Globe className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span className="text-sm text-muted-foreground shrink-0">
              {formData.company_id ? "Company-specific:" : "Global capability:"}
            </span>
            <Select
              value={formData.company_id || "global"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  company_id: value === "global" ? null : value,
                }))
              }
            >
              <SelectTrigger className="h-7 w-auto gap-2 border-none bg-transparent p-0 font-medium text-sm hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Global (All Companies)</span>
                  </div>
                </SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{company.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isEditing && formData.name && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">{formData.type === "COMPETENCY" ? "🎯" : formData.type === "VALUE" ? "💜" : "🔧"}</span>
              <span className="font-semibold text-foreground">{formData.name}</span>
              <Badge variant="outline" className="text-xs capitalize">{formData.category}</Badge>
              <Badge 
                variant={formData.status === "active" ? "default" : "secondary"} 
                className="text-xs capitalize"
              >
                {formData.status.replace("_", " ")}
              </Badge>
              {capability && formData.type === "COMPETENCY" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs ml-auto"
                  onClick={() => setShowVersionReport(true)}
                >
                  <GitBranch className="h-3 w-3" />
                  v{(capability as any).version || 1}
                </Button>
              )}
            </div>
          )}

          {/* Active Cycle Warning for edits */}
          {isEditing && usage?.isBlockedFromMajorEdits && (
            <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Limited Editing Mode
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      This competency is being used in {usage.activeAppraisalCycles.length} active appraisal cycle(s).
                      Major changes (name, code, behavioral indicators) are restricted until cycles close.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className={`grid w-full ${formData.type === "COMPETENCY" ? "grid-cols-5" : formData.type === "VALUE" ? "grid-cols-4" : "grid-cols-4"}`}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            {(formData.type === "COMPETENCY" || formData.type === "VALUE") && (
              <TabsTrigger value="behaviors">Behavioral Levels</TabsTrigger>
            )}
            {formData.type === "COMPETENCY" && (
              <TabsTrigger value="skills" className="gap-1">
                <Link2 className="h-3.5 w-3.5" />
                Skills
              </TabsTrigger>
            )}
            {formData.type === "VALUE" && (
              <TabsTrigger value="value-settings" className="gap-1">
                <Award className="h-3.5 w-3.5" />
                Value Settings
              </TabsTrigger>
            )}
            <TabsTrigger value="attributes">
              {formData.type === "SKILL" ? "Attributes" : formData.type === "VALUE" ? "Usage" : "Job Assignment"}
            </TabsTrigger>
            {formData.type === "SKILL" && (
              <TabsTrigger value="jobs">Job Assignment</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            {!isEditing && (
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: CapabilityType) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SKILL">Skill</SelectItem>
                    <SelectItem value="COMPETENCY">Competency</SelectItem>
                    <SelectItem value="VALUE">Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="Enter code"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateCode}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: CapabilityCategory) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proficiency Scale</Label>
                <Select
                  value={formData.proficiency_scale_id || "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      proficiency_scale_id: value === "none" ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {scales.map((scale) => (
                      <SelectItem key={scale.id} value={scale.id}>
                        {scale.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: CapabilityStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Owner Role</Label>
                <Select
                  value={formData.owner_role || "HR"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, owner_role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="COE">COE</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, effective_from: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Effective To (optional)</Label>
                <Input
                  type="date"
                  value={formData.effective_to || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      effective_to: e.target.value || undefined,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>External ID (ESCO/O*NET)</Label>
              <Input
                value={formData.external_id || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, external_id: e.target.value }))
                }
                placeholder="e.g., ESCO:1234 or O*NET:15-1252.00"
              />
            </div>
          </TabsContent>

          {/* Behavioral Levels Tab - For Competencies and Values */}
          {(formData.type === "COMPETENCY" || formData.type === "VALUE") && (
            <TabsContent value="behaviors" className="space-y-4 mt-4">
              {/* Context reminder */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
                <span>Defining behaviors for:</span>
                <span className="font-medium text-foreground">{formData.name || (formData.type === "VALUE" ? "New Value" : "New Competency")}</span>
              </div>
              <CompetencyBehavioralLevelsEditor
                competencyName={formData.name}
                competencyDescription={formData.description || undefined}
                competencyCategory={formData.category}
                competencyId={capability?.id}
                indicators={proficiencyIndicators}
                onIndicatorsChange={setProficiencyIndicators}
              />
            </TabsContent>
          )}

          {/* Value Settings Tab - Only for Values */}
          {formData.type === "VALUE" && (
            <TabsContent value="value-settings" className="space-y-4 mt-4">
              {/* Context reminder */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Settings for:</span>
                <span className="font-medium text-foreground">{formData.name || "New Value"}</span>
              </div>

              {/* Promotion Factor */}
              <div className="rounded-lg border bg-card">
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-600" />
                    <h4 className="font-medium">Promotion Factor</h4>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Required for Promotion</Label>
                      <p className="text-sm text-muted-foreground">
                        Employees must meet the threshold rating on this value to be considered for promotion
                      </p>
                    </div>
                    <Switch
                      checked={(formData as any).is_promotion_factor ?? false}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_promotion_factor: checked,
                        } as any))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Weight in Appraisals */}
              <div className="rounded-lg border bg-card">
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Weighting</h4>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Weight in Assessments (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={(formData as any).weight ?? 0}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          weight: parseFloat(e.target.value) || 0,
                        } as any))
                      }
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Relative weight when calculating overall values assessment score
                    </p>
                  </div>
                </div>
              </div>

              {/* Assessment Mode */}
              <div className="rounded-lg border bg-card">
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-info" />
                    <h4 className="font-medium">Assessment Mode</h4>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>How should this value be assessed?</Label>
                    <Select
                      value={(formData as any).assessment_mode ?? "rated"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          assessment_mode: value,
                        } as any))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rated">Rated (1-5 Scale)</SelectItem>
                        <SelectItem value="qualitative">Qualitative (Evidence-based)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Rated: Numeric rating with behavioral indicators. Qualitative: Free-text evidence collection.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Skills Linking Tab - only for competencies */}
          {formData.type === "COMPETENCY" && (
            <TabsContent value="skills" className="space-y-4 mt-4">
              {/* Context reminder */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
                <span>Linking skills to:</span>
                <span className="font-medium text-foreground">{formData.name || "New Competency"}</span>
              </div>
              <CompetencySkillLinker
                competencyId={capability?.id}
                competencyName={formData.name}
                competencyDescription={formData.description}
                competencyCategory={formData.category}
                companyId={formData.company_id}
                isEditing={isEditing}
              />
            </TabsContent>
          )}

          <TabsContent value="attributes" className="space-y-4 mt-4">
            {formData.type === "SKILL" ? (
              <>
                {/* AI Intelligence Info Card */}
                <div className="rounded-lg border p-4 bg-primary/5 border-primary/20">
                  <div className="flex gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        AI-Powered Skill Intelligence
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure how AI recognizes and validates this skill. Good synonyms and keywords improve matching accuracy across resumes, projects, and learning completions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 1: AI Inference Settings */}
                <div className="rounded-lg border bg-card">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">AI Inference</h4>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base">Enable AI Detection</Label>
                        <p className="text-sm text-muted-foreground">
                          AI can automatically detect this skill from resumes, project descriptions, and learning completions
                        </p>
                      </div>
                      <Switch
                        checked={formData.skill_attributes?.can_be_inferred ?? true}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            skill_attributes: {
                              ...prev.skill_attributes!,
                              can_be_inferred: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    {/* Conditional AI Matching Configuration */}
                    {formData.skill_attributes?.can_be_inferred && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Synonyms</Label>
                            <span className="text-xs text-muted-foreground">
                              {formData.skill_attributes?.synonyms?.length || 0} added
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Alternative names users might use (e.g., "JavaScript" → "JS", "ECMAScript")
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={newSynonym}
                              onChange={(e) => setNewSynonym(e.target.value)}
                              placeholder="e.g., JS, ECMAScript, ES6"
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSynonym())}
                            />
                            <Button type="button" size="icon" onClick={addSynonym}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skill_attributes?.synonyms?.map((syn, idx) => (
                              <Badge key={idx} variant="secondary" className="gap-1">
                                {syn}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  onClick={() => removeSynonym(idx)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Inference Keywords</Label>
                            <span className="text-xs text-muted-foreground">
                              {formData.skill_attributes?.inference_keywords?.length || 0} added
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Phrases that indicate this skill (e.g., "React" → "frontend development", "component-based UI")
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={newKeyword}
                              onChange={(e) => setNewKeyword(e.target.value)}
                              placeholder="e.g., data science, machine learning"
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                            />
                            <Button type="button" size="icon" onClick={addKeyword}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skill_attributes?.inference_keywords?.map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="gap-1">
                                {kw}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  onClick={() => removeKeyword(idx)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Skill Validity & Compliance */}
                <div className="rounded-lg border bg-card">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">Skill Validity</h4>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base">Skill Expires</Label>
                        <p className="text-sm text-muted-foreground">
                          Skills like certifications often require periodic re-assessment
                        </p>
                      </div>
                      <Switch
                        checked={!!formData.skill_attributes?.expiry_months}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            skill_attributes: {
                              ...prev.skill_attributes!,
                              expiry_months: checked ? 12 : null,
                            },
                          }))
                        }
                      />
                    </div>

                    {formData.skill_attributes?.expiry_months && (
                      <div className="space-y-2 pt-2">
                        <Label>Reassess After</Label>
                        <Select
                          value={String(formData.skill_attributes.expiry_months)}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              skill_attributes: {
                                ...prev.skill_attributes!,
                                expiry_months: parseInt(value),
                              },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="12">12 months</SelectItem>
                            <SelectItem value="24">24 months</SelectItem>
                            <SelectItem value="36">36 months</SelectItem>
                            <SelectItem value="48">48 months</SelectItem>
                            <SelectItem value="60">60 months</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Employees will receive reminders to update their proficiency before expiry
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Context reminder */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
                  <span>Assigning to job profiles:</span>
                  <span className="font-medium text-foreground">{formData.name || "New Competency"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Requires Human Validation</Label>
                    <p className="text-sm text-muted-foreground">
                      Competencies cannot be AI-inferred directly
                    </p>
                  </div>
                  <Switch checked disabled />
                </div>

                {/* Enhanced Job Applicability Multi-Select */}
                <EnhancedJobApplicabilitySelect
                  selectedRequirements={selectedJobRequirements}
                  onSelectionChange={setSelectedJobRequirements}
                  companyId={formData.company_id}
                  existingRequirements={requirements.map(r => ({
                    job_id: r.job_id,
                    required_proficiency_level: r.required_proficiency_level,
                    weighting: r.weighting,
                    is_required: r.is_required,
                  }))}
                />

                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    💡 Use the <strong>Behavioral Levels</strong> tab to define proficiency indicators and the <strong>Skills</strong> tab to link supporting skills for learning path alignment.
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          {/* Job Assignment tab for Skills */}
          {formData.type === "SKILL" && (
            <TabsContent value="jobs" className="space-y-4 mt-4">
              {/* Context reminder */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
                <span>Assigning skill to job profiles:</span>
                <span className="font-medium text-foreground">{formData.name || "New Skill"}</span>
              </div>

              {/* Enhanced Job Applicability Multi-Select for Skills */}
              <EnhancedJobApplicabilitySelect
                selectedRequirements={selectedJobRequirements}
                onSelectionChange={setSelectedJobRequirements}
                companyId={formData.company_id}
                existingRequirements={requirements.map(r => ({
                  job_id: r.job_id,
                  required_proficiency_level: r.required_proficiency_level,
                  weighting: r.weighting,
                  is_required: r.is_required,
                }))}
              />

              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  💡 Skills assigned to jobs will appear in employee skill gap analysis and learning recommendations.
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Version Impact Report Dialog */}
      {capability && (
        <VersionImpactReport
          open={showVersionReport}
          onOpenChange={setShowVersionReport}
          competencyId={capability.id}
          competencyName={capability.name}
          currentVersion={(capability as any).version || 1}
        />
      )}
    </Dialog>
  );
}
