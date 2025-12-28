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
import { X, Plus } from "lucide-react";
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

interface CapabilityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capability?: Capability | null;
  scales: ProficiencyScale[];
  companies: { id: string; name: string }[];
  onSave: (data: CreateCapabilityInput) => Promise<void>;
  defaultType?: CapabilityType;
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

  const { requirements, fetchApplicability, bulkSetApplicability } = useCapabilityJobApplicability();

  useEffect(() => {
    if (capability) {
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
      }
    } else {
      setFormData({
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
      setSelectedJobRequirements([]);
    }
  }, [capability, defaultType, open, fetchApplicability]);

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
    const prefix = formData.type === "SKILL" ? "SKL" : "CMP";
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
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit" : "Create"} {formData.type === "SKILL" ? "Skill" : "Competency"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="attributes">
              {formData.type === "SKILL" ? "Skill" : "Competency"} Attributes
            </TabsTrigger>
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
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Company (optional for global capabilities)</Label>
              <Select
                value={formData.company_id || "global"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    company_id: value === "global" ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (All Companies)</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

          <TabsContent value="attributes" className="space-y-4 mt-4">
            {formData.type === "SKILL" ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Can be AI-Inferred</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to suggest this skill based on text analysis
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

                <div className="space-y-2">
                  <Label>Expiry (months)</Label>
                  <Input
                    type="number"
                    value={formData.skill_attributes?.expiry_months || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        skill_attributes: {
                          ...prev.skill_attributes!,
                          expiry_months: e.target.value ? parseInt(e.target.value) : null,
                        },
                      }))
                    }
                    placeholder="Leave empty for no expiry"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Synonyms</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSynonym}
                      onChange={(e) => setNewSynonym(e.target.value)}
                      placeholder="Add synonym"
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
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSynonym(idx)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Inference Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add keyword for AI matching"
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
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeKeyword(idx)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
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
                    💡 Behavioral indicators and assessment rules can be configured after
                    creating the competency by linking skills to it.
                  </p>
                </div>
              </>
            )}
          </TabsContent>
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
    </Dialog>
  );
}
