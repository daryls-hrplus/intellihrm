import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, GraduationCap, Award, ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NavLink } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobQualificationsManagerProps {
  jobId: string;
  companyId: string;
}

interface JobQualificationRequirement {
  id: string;
  job_id: string;
  company_id: string;
  requirement_type: string;
  education_level_id: string | null;
  field_of_study_id: string | null;
  qualification_type_id: string | null;
  accrediting_body_id: string | null;
  is_mandatory: boolean | null;
  is_preferred: boolean | null;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  education_levels?: { id: string; name: string; display_order: number | null } | null;
  fields_of_study?: { id: string; name: string; code: string } | null;
  qualification_types?: { id: string; name: string; record_type: string } | null;
  accrediting_bodies?: { id: string; name: string; short_name: string | null } | null;
}

interface EducationLevel {
  id: string;
  name: string;
  display_order: number | null;
}

interface FieldOfStudy {
  id: string;
  name: string;
  code: string;
}

interface QualificationType {
  id: string;
  name: string;
  record_type: string;
}

interface AccreditingBody {
  id: string;
  name: string;
  short_name: string | null;
}

const NONE_VALUE = "__none__";

export function JobQualificationsManager({ jobId, companyId }: JobQualificationsManagerProps) {
  const [requirements, setRequirements] = useState<JobQualificationRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<JobQualificationRequirement | null>(null);
  
  // Reference data
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([]);
  const [qualificationTypes, setQualificationTypes] = useState<QualificationType[]>([]);
  const [accreditingBodies, setAccreditingBodies] = useState<AccreditingBody[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    requirement_type: "academic" as "academic" | "certification",
    education_level_id: "",
    field_of_study_id: "",
    qualification_type_id: "",
    accrediting_body_id: "",
    is_mandatory: true,
    notes: "",
  });

  useEffect(() => {
    fetchRequirements();
    fetchReferenceData();
  }, [jobId, companyId]);

  const fetchRequirements = async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from("job_qualification_requirements")
      .select(`
        *,
        education_levels(id, name, display_order),
        fields_of_study(id, name, code),
        qualification_types(id, name, record_type),
        accrediting_bodies(id, name, short_name)
      `)
      .eq("job_id", jobId)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order("is_mandatory", { ascending: false });

    if (error) {
      console.error("Error fetching job qualification requirements:", error);
      toast.error("Failed to load qualification requirements");
    } else {
      setRequirements((data || []) as JobQualificationRequirement[]);
    }
    setIsLoading(false);
  };

  const fetchReferenceData = async () => {
    const [
      { data: eduData },
      { data: fieldData },
      { data: qualData },
      { data: bodyData },
    ] = await Promise.all([
      supabase.from("education_levels").select("id, name, display_order").eq("is_active", true).order("display_order"),
      supabase.from("fields_of_study").select("id, name, code").eq("is_active", true).order("name"),
      supabase.from("qualification_types").select("id, name, record_type").eq("is_active", true).order("name"),
      supabase.from("accrediting_bodies").select("id, name, short_name").eq("is_active", true).order("name"),
    ]);

    setEducationLevels((eduData || []) as EducationLevel[]);
    setFieldsOfStudy((fieldData || []) as FieldOfStudy[]);
    setQualificationTypes((qualData || []) as QualificationType[]);
    setAccreditingBodies((bodyData || []) as AccreditingBody[]);
  };

  const handleOpenDialog = (requirement?: JobQualificationRequirement) => {
    if (requirement) {
      setSelectedRequirement(requirement);
      setFormData({
        requirement_type: requirement.requirement_type as "academic" | "certification",
        education_level_id: requirement.education_level_id || "",
        field_of_study_id: requirement.field_of_study_id || "",
        qualification_type_id: requirement.qualification_type_id || "",
        accrediting_body_id: requirement.accrediting_body_id || "",
        is_mandatory: requirement.is_mandatory ?? true,
        notes: requirement.notes || "",
      });
    } else {
      setSelectedRequirement(null);
      setFormData({
        requirement_type: "academic",
        education_level_id: "",
        field_of_study_id: "",
        qualification_type_id: "",
        accrediting_body_id: "",
        is_mandatory: true,
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (formData.requirement_type === "academic" && !formData.education_level_id) {
      toast.error("Please select an education level");
      return;
    }
    if (formData.requirement_type === "certification" && !formData.qualification_type_id) {
      toast.error("Please select a qualification type");
      return;
    }

    setIsSaving(true);
    const today = new Date().toISOString().split('T')[0];
    
    const payload = {
      job_id: jobId,
      company_id: companyId,
      requirement_type: formData.requirement_type,
      education_level_id: formData.requirement_type === "academic" ? formData.education_level_id || null : null,
      field_of_study_id: formData.requirement_type === "academic" ? formData.field_of_study_id || null : null,
      qualification_type_id: formData.requirement_type === "certification" ? formData.qualification_type_id || null : null,
      accrediting_body_id: formData.requirement_type === "certification" ? formData.accrediting_body_id || null : null,
      is_mandatory: formData.is_mandatory,
      is_preferred: !formData.is_mandatory,
      notes: formData.notes.trim() || null,
      start_date: today,
      end_date: null,
    };

    if (selectedRequirement) {
      const { error } = await supabase
        .from("job_qualification_requirements")
        .update(payload)
        .eq("id", selectedRequirement.id);

      if (error) {
        console.error("Error updating requirement:", error);
        toast.error("Failed to update requirement");
      } else {
        toast.success("Requirement updated successfully");
        fetchRequirements();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from("job_qualification_requirements")
        .insert([payload]);

      if (error) {
        console.error("Error creating requirement:", error);
        toast.error("Failed to create requirement");
      } else {
        toast.success("Requirement added successfully");
        fetchRequirements();
        setDialogOpen(false);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedRequirement) return;

    const { error } = await supabase
      .from("job_qualification_requirements")
      .delete()
      .eq("id", selectedRequirement.id);

    if (error) {
      console.error("Error deleting requirement:", error);
      toast.error("Failed to delete requirement");
    } else {
      toast.success("Requirement removed");
      fetchRequirements();
    }
    setDeleteDialogOpen(false);
  };

  const getRequirementDescription = (req: JobQualificationRequirement): string => {
    if (req.requirement_type === "academic") {
      const level = req.education_levels?.name || "Education";
      const field = req.fields_of_study?.name;
      return field ? `${level} in ${field}` : level;
    } else {
      const qual = req.qualification_types?.name || "Certification";
      const body = req.accrediting_bodies?.short_name || req.accrediting_bodies?.name;
      return body ? `${qual} (${body})` : qual;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Qualification Requirements</h4>
          <p className="text-sm text-muted-foreground">
            Define education and certification requirements for this job
          </p>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-1" />
          Add Requirement
        </Button>
      </div>

      {requirements.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
          <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-2">No qualification requirements defined</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add academic or certification requirements for this job
          </p>
          <Button variant="outline" size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            Add First Requirement
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Type</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requirements.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {req.requirement_type === "academic" ? (
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Award className="h-5 w-5 text-amber-600" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {req.requirement_type === "academic" ? "Academic" : "Certification"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{getRequirementDescription(req)}</span>
                  {req.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{req.notes}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={req.is_mandatory ? "default" : "secondary"}>
                    {req.is_mandatory ? "Mandatory" : "Preferred"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(req)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRequirement(req);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Link to Qualifications Setup */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
        <span>📋</span>
        <span>Setup qualification types, education levels, and accrediting bodies in the</span>
        <NavLink 
          to="/workforce/qualifications" 
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          Qualifications page
          <ExternalLink className="h-3 w-3" />
        </NavLink>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRequirement ? "Edit Requirement" : "Add Qualification Requirement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Requirement Type</Label>
              <Select
                value={formData.requirement_type}
                onValueChange={(value: "academic" | "certification") => 
                  setFormData({ ...formData, requirement_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Academic / Education
                    </div>
                  </SelectItem>
                  <SelectItem value="certification">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Certification / License
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.requirement_type === "academic" ? (
              <>
                <div className="space-y-2">
                  <Label>Education Level *</Label>
                  <Select
                    value={formData.education_level_id || NONE_VALUE}
                    onValueChange={(value) => setFormData({ ...formData, education_level_id: value === NONE_VALUE ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Select
                    value={formData.field_of_study_id || NONE_VALUE}
                    onValueChange={(value) => setFormData({ ...formData, field_of_study_id: value === NONE_VALUE ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any field (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Any field</SelectItem>
                      {fieldsOfStudy.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Qualification / Certification Type *</Label>
                  <Select
                    value={formData.qualification_type_id || NONE_VALUE}
                    onValueChange={(value) => setFormData({ ...formData, qualification_type_id: value === NONE_VALUE ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification type" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualificationTypes.map((qual) => (
                        <SelectItem key={qual.id} value={qual.id}>
                          {qual.name} ({qual.record_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Accrediting Body</Label>
                  <Select
                    value={formData.accrediting_body_id || NONE_VALUE}
                    onValueChange={(value) => setFormData({ ...formData, accrediting_body_id: value === NONE_VALUE ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any body (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>Any accrediting body</SelectItem>
                      {accreditingBodies.map((body) => (
                        <SelectItem key={body.id} value={body.id}>
                          {body.short_name || body.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Mandatory Requirement</Label>
                <p className="text-sm text-muted-foreground">
                  Required vs preferred qualification
                </p>
              </div>
              <Switch
                checked={formData.is_mandatory}
                onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedRequirement ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Requirement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this qualification requirement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
