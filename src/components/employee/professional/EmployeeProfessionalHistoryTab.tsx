import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Archive, Briefcase, Building2, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useAuth } from "@/contexts/AuthContext";

interface EmployeeProfessionalHistoryTabProps {
  employeeId: string;
  isEssView?: boolean;
}

interface WorkHistoryFormData {
  employer_name: string;
  job_title: string;
  department: string;
  industry: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  employment_type: string;
  reason_for_leaving: string;
  responsibilities: string;
  achievements: string;
  supervisor_name: string;
  supervisor_contact: string;
  can_contact_employer: boolean;
  notes: string;
}

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
  { value: "seasonal", label: "Seasonal" },
];

const getInitialFormData = (): WorkHistoryFormData => ({
  employer_name: "",
  job_title: "",
  department: "",
  industry: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  employment_type: "full_time",
  reason_for_leaving: "",
  responsibilities: "",
  achievements: "",
  supervisor_name: "",
  supervisor_contact: "",
  can_contact_employer: true,
  notes: "",
});

export function EmployeeProfessionalHistoryTab({ employeeId, isEssView = false }: EmployeeProfessionalHistoryTabProps) {
  const queryClient = useQueryClient();
  const { user, roles } = useAuth();
  const { hasActionAccess } = useGranularPermissions();
  const { logAction } = useAuditLog();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkHistoryFormData>(getInitialFormData());

  // Determine permissions based on ESS vs Workforce view
  const moduleCode = isEssView ? "ess" : "workforce";
  const tabCode = isEssView ? "ess_professional_history" : "professional_history";
  
  const isAdmin = roles.includes("admin");
  const canCreate = isAdmin || hasActionAccess(moduleCode, "create", tabCode);
  const canEdit = isAdmin || hasActionAccess(moduleCode, "edit", tabCode);
  const canDelete = isAdmin || hasActionAccess(moduleCode, "delete", tabCode);

  // Fetch work history
  const { data: workHistory, isLoading } = useQuery({
    queryKey: ["employee-work-history", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_work_history")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("is_archived", false)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: WorkHistoryFormData) => {
      const { data: result, error } = await supabase
        .from("employee_work_history")
        .insert({
          employee_id: employeeId,
          employer_name: data.employer_name,
          job_title: data.job_title,
          department: data.department || null,
          industry: data.industry || null,
          location: data.location || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
          is_current: data.is_current,
          employment_type: data.employment_type,
          reason_for_leaving: data.reason_for_leaving || null,
          responsibilities: data.responsibilities || null,
          achievements: data.achievements || null,
          supervisor_name: data.supervisor_name || null,
          supervisor_contact: data.supervisor_contact || null,
          can_contact_employer: data.can_contact_employer,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      await logAction({
        action: "CREATE",
        entity_type: "employee_work_history",
        entity_id: result.id,
        entity_name: `${result.job_title} at ${result.employer_name}`,
        new_values: result,
      });
      queryClient.invalidateQueries({ queryKey: ["employee-work-history", employeeId] });
      toast.success("Work history added successfully");
      closeDialog();
    },
    onError: (error) => {
      console.error("Error creating work history:", error);
      toast.error("Failed to add work history");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkHistoryFormData }) => {
      const { data: result, error } = await supabase
        .from("employee_work_history")
        .update({
          employer_name: data.employer_name,
          job_title: data.job_title,
          department: data.department || null,
          industry: data.industry || null,
          location: data.location || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
          is_current: data.is_current,
          employment_type: data.employment_type,
          reason_for_leaving: data.reason_for_leaving || null,
          responsibilities: data.responsibilities || null,
          achievements: data.achievements || null,
          supervisor_name: data.supervisor_name || null,
          supervisor_contact: data.supervisor_contact || null,
          can_contact_employer: data.can_contact_employer,
          notes: data.notes || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      await logAction({
        action: "UPDATE",
        entity_type: "employee_work_history",
        entity_id: result.id,
        entity_name: `${result.job_title} at ${result.employer_name}`,
        new_values: result,
      });
      queryClient.invalidateQueries({ queryKey: ["employee-work-history", employeeId] });
      toast.success("Work history updated successfully");
      closeDialog();
    },
    onError: (error) => {
      console.error("Error updating work history:", error);
      toast.error("Failed to update work history");
    },
  });

  // Archive mutation (soft delete)
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("employee_work_history")
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      await logAction({
        action: "DELETE",
        entity_type: "employee_work_history",
        entity_id: result.id,
        entity_name: `${result.job_title} at ${result.employer_name}`,
        old_values: { archived: true },
      });
      queryClient.invalidateQueries({ queryKey: ["employee-work-history", employeeId] });
      toast.success("Work history archived successfully");
    },
    onError: (error) => {
      console.error("Error archiving work history:", error);
      toast.error("Failed to archive work history");
    },
  });
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(getInitialFormData());
  };

  const handleEdit = (history: any) => {
    setEditingId(history.id);
    setFormData({
      employer_name: history.employer_name,
      job_title: history.job_title,
      department: history.department || "",
      industry: history.industry || "",
      location: history.location || "",
      start_date: history.start_date,
      end_date: history.end_date || "",
      is_current: history.is_current,
      employment_type: history.employment_type,
      reason_for_leaving: history.reason_for_leaving || "",
      responsibilities: history.responsibilities || "",
      achievements: history.achievements || "",
      supervisor_name: history.supervisor_name || "",
      supervisor_contact: history.supervisor_contact || "",
      can_contact_employer: history.can_contact_employer,
      notes: history.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.employer_name || !formData.job_title || !formData.start_date) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getEmploymentTypeBadge = (type: string) => {
    const typeInfo = EMPLOYMENT_TYPES.find(t => t.value === type);
    return <Badge variant="secondary">{typeInfo?.label || type}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional History
          </CardTitle>
          <CardDescription>
            {isEssView 
              ? "Your prior employment history and work experience"
              : "Prior employment history and work experience"
            }
          </CardDescription>
        </div>
        {canCreate && (
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Employment
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {workHistory && workHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employer</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                {!isEssView && <TableHead>Verified</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {history.employer_name}
                    </div>
                    {history.location && (
                      <span className="text-sm text-muted-foreground">{history.location}</span>
                    )}
                  </TableCell>
                  <TableCell>{history.job_title}</TableCell>
                  <TableCell>{getEmploymentTypeBadge(history.employment_type)}</TableCell>
                  <TableCell>
                    {formatDateForDisplay(history.start_date)} - {history.is_current ? "Present" : formatDateForDisplay(history.end_date)}
                  </TableCell>
                  {!isEssView && (
                    <TableCell>
                      {history.verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(history)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => archiveMutation.mutate(history.id)}
                          disabled={archiveMutation.isPending}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No work history on file. Add prior employment records and experience.
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employment" : "Add Prior Employment"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Employer Name *</Label>
              <Input 
                value={formData.employer_name} 
                onChange={(e) => setFormData(prev => ({ ...prev, employer_name: e.target.value }))} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Job Title *</Label>
              <Input 
                value={formData.job_title} 
                onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Department</Label>
                <Input 
                  value={formData.department} 
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Industry</Label>
                <Input 
                  value={formData.industry} 
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))} 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input 
                value={formData.location} 
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
              />
            </div>
            <div className="grid gap-2">
              <Label>Employment Type</Label>
              <Select value={formData.employment_type} onValueChange={(v) => setFormData(prev => ({ ...prev, employment_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input 
                  type="date" 
                  value={formData.start_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={formData.end_date} 
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  disabled={formData.is_current}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_current" 
                checked={formData.is_current}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  is_current: checked === true,
                  end_date: checked === true ? "" : prev.end_date
                }))}
              />
              <Label htmlFor="is_current">Currently employed here</Label>
            </div>
            {!formData.is_current && (
              <div className="grid gap-2">
                <Label>Reason for Leaving</Label>
                <Input 
                  value={formData.reason_for_leaving} 
                  onChange={(e) => setFormData(prev => ({ ...prev, reason_for_leaving: e.target.value }))} 
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Key Responsibilities</Label>
              <Textarea 
                value={formData.responsibilities} 
                onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))} 
                rows={3}
                placeholder="Describe main duties and responsibilities..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Key Achievements</Label>
              <Textarea 
                value={formData.achievements} 
                onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))} 
                rows={2}
                placeholder="Notable accomplishments..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Supervisor Name</Label>
                <Input 
                  value={formData.supervisor_name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, supervisor_name: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Supervisor Contact</Label>
                <Input 
                  value={formData.supervisor_contact} 
                  onChange={(e) => setFormData(prev => ({ ...prev, supervisor_contact: e.target.value }))} 
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="can_contact" 
                checked={formData.can_contact_employer}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_contact_employer: checked === true }))}
              />
              <Label htmlFor="can_contact">May contact this employer</Label>
            </div>
            <div className="grid gap-2">
              <Label>Additional Notes</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
