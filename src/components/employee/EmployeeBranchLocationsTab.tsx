import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDateForDisplay } from "@/utils/dateUtils";
import {
  Building,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface EmployeeBranchLocation {
  id: string;
  employee_id: string;
  branch_location_id: string;
  is_primary: boolean;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  branch_location?: {
    id: string;
    name: string;
    code: string;
    city: string | null;
    country: string | null;
    is_headquarters: boolean;
    company?: {
      id: string;
      name: string;
    };
  };
}

interface BranchLocation {
  id: string;
  name: string;
  code: string;
  city: string | null;
  country: string | null;
  is_headquarters: boolean;
  company_id: string;
  company?: {
    id: string;
    name: string;
  };
}

interface EmployeeBranchLocationsTabProps {
  employeeId: string;
}

const emptyFormData = {
  branch_location_id: "",
  is_primary: false,
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  notes: "",
};

export function EmployeeBranchLocationsTab({ employeeId }: EmployeeBranchLocationsTabProps) {
  const [assignments, setAssignments] = useState<EmployeeBranchLocation[]>([]);
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EmployeeBranchLocation | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch employee's branch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("employee_branch_locations")
        .select(`
          *,
          branch_location:branch_location_id (
            id,
            name,
            code,
            city,
            country,
            is_headquarters,
            company:company_id (
              id,
              name
            )
          )
        `)
        .eq("employee_id", employeeId)
        .order("start_date", { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      // Fetch all active branch locations for the dropdown
      const { data: branchesData, error: branchesError } = await supabase
        .from("company_branch_locations")
        .select(`
          id,
          name,
          code,
          city,
          country,
          is_headquarters,
          company_id,
          company:company_id (
            id,
            name
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (branchesError) throw branchesError;
      setBranches(branchesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load branch locations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (assignment?: EmployeeBranchLocation) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        branch_location_id: assignment.branch_location_id,
        is_primary: assignment.is_primary,
        start_date: assignment.start_date,
        end_date: assignment.end_date || "",
        notes: assignment.notes || "",
      });
    } else {
      setEditingAssignment(null);
      setFormData(emptyFormData);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.branch_location_id) {
      toast({
        title: "Validation Error",
        description: "Please select a branch location.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const assignmentData = {
        employee_id: employeeId,
        branch_location_id: formData.branch_location_id,
        is_primary: formData.is_primary,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
      };

      if (editingAssignment) {
        const { error } = await supabase
          .from("employee_branch_locations")
          .update(assignmentData)
          .eq("id", editingAssignment.id);

        if (error) throw error;
        toast({ title: "Branch assignment updated" });
      } else {
        const { error } = await supabase
          .from("employee_branch_locations")
          .insert(assignmentData);

        if (error) throw error;
        toast({ title: "Branch assignment created" });
      }

      handleCloseForm();
      fetchData();
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast({
        title: "Error",
        description: "Failed to save branch assignment.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (assignment: EmployeeBranchLocation) => {
    if (!confirm("Delete this branch assignment?")) return;

    try {
      const { error } = await supabase
        .from("employee_branch_locations")
        .delete()
        .eq("id", assignment.id);

      if (error) throw error;
      toast({ title: "Branch assignment deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment.",
        variant: "destructive",
      });
    }
  };

  const isActive = (assignment: EmployeeBranchLocation) => {
    const today = new Date().toISOString().split("T")[0];
    return assignment.start_date <= today && (!assignment.end_date || assignment.end_date >= today);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Branch Locations
        </CardTitle>
        <Button onClick={() => handleOpenForm()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Branch
        </Button>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No branch locations assigned.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-4 transition-colors",
                  isActive(assignment)
                    ? "border-border bg-card"
                    : "border-border/50 bg-muted/50 opacity-70"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                      assignment.branch_location?.is_headquarters
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {assignment.branch_location?.code?.slice(0, 2) || "BR"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-card-foreground">
                        {assignment.branch_location?.name || "Unknown Branch"}
                      </span>
                      {assignment.is_primary && (
                        <Badge variant="outline" className="text-xs">
                          Primary
                        </Badge>
                      )}
                      {assignment.branch_location?.is_headquarters && (
                        <Badge className="text-xs bg-primary/10 text-primary border-0">
                          HQ
                        </Badge>
                      )}
                      {!isActive(assignment) && (
                        <Badge variant="secondary" className="text-xs">
                          Ended
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {assignment.branch_location?.company && (
                        <span>{assignment.branch_location.company.name}</span>
                      )}
                      {(assignment.branch_location?.city || assignment.branch_location?.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[assignment.branch_location.city, assignment.branch_location.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDateForDisplay(assignment.start_date, "MMM d, yyyy")}
                      {assignment.end_date
                        ? ` - ${formatDateForDisplay(assignment.end_date, "MMM d, yyyy")}`
                        : " - Present"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenForm(assignment)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(assignment)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? "Edit Branch Assignment" : "Add Branch Assignment"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Branch Location *</Label>
              <Select
                value={formData.branch_location_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, branch_location_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      <div className="flex items-center gap-2">
                        <span>{branch.name}</span>
                        <span className="text-muted-foreground">
                          ({branch.company?.name})
                        </span>
                        {branch.is_headquarters && (
                          <Badge variant="outline" className="text-xs ml-1">
                            HQ
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional notes..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_primary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_primary: checked })
                }
              />
              <Label>Primary Location</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAssignment ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
