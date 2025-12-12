import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JobResponsibility {
  id: string;
  job_id: string;
  responsibility_id: string;
  weighting: number;
  notes: string | null;
  responsibility_name?: string;
}

interface Responsibility {
  id: string;
  name: string;
  code: string;
}

interface JobResponsibilitiesManagerProps {
  jobId: string;
  companyId: string;
}

export function JobResponsibilitiesManager({ jobId, companyId }: JobResponsibilitiesManagerProps) {
  const [jobResponsibilities, setJobResponsibilities] = useState<JobResponsibility[]>([]);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    responsibility_id: "",
    weighting: 0,
    notes: "",
  });

  const totalWeight = jobResponsibilities.reduce((sum, jr) => sum + Number(jr.weighting), 0);
  const remainingWeight = 100 - totalWeight;

  useEffect(() => {
    fetchJobResponsibilities();
    fetchResponsibilities();
  }, [jobId, companyId]);

  const fetchJobResponsibilities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_responsibilities")
      .select(`
        id,
        job_id,
        responsibility_id,
        weighting,
        notes,
        responsibilities (name)
      `)
      .eq("job_id", jobId);

    if (error) {
      console.error("Error fetching job responsibilities:", error);
      toast.error("Failed to load job responsibilities");
    } else {
      const mapped = (data || []).map((jr: any) => ({
        ...jr,
        responsibility_name: jr.responsibilities?.name,
      }));
      setJobResponsibilities(mapped);
    }
    setLoading(false);
  };

  const fetchResponsibilities = async () => {
    const { data, error } = await supabase
      .from("responsibilities")
      .select("id, name, code")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching responsibilities:", error);
    } else {
      setResponsibilities(data || []);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ responsibility_id: "", weighting: 0, notes: "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.responsibility_id) {
      toast.error("Please select a responsibility");
      return;
    }

    if (formData.weighting <= 0) {
      toast.error("Weight must be greater than 0");
      return;
    }

    if (formData.weighting > remainingWeight) {
      toast.error(`Weight cannot exceed ${remainingWeight}% (remaining available)`);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("job_responsibilities")
      .insert({
        job_id: jobId,
        responsibility_id: formData.responsibility_id,
        weighting: formData.weighting,
        notes: formData.notes || null,
      });

    if (error) {
      if (error.code === "23505") {
        toast.error("This responsibility is already assigned to this job");
      } else {
        console.error("Error saving job responsibility:", error);
        toast.error("Failed to add responsibility");
      }
    } else {
      toast.success("Responsibility added to job");
      setDialogOpen(false);
      fetchJobResponsibilities();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("job_responsibilities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting job responsibility:", error);
      toast.error("Failed to remove responsibility");
    } else {
      toast.success("Responsibility removed from job");
      fetchJobResponsibilities();
    }
  };

  const availableResponsibilities = responsibilities.filter(
    (r) => !jobResponsibilities.some((jr) => jr.responsibility_id === r.id)
  );

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading responsibilities...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Job Responsibilities</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total Weight: {totalWeight}%</span>
            <span>Remaining: {remainingWeight}%</span>
          </div>
        </div>
        <Button size="sm" onClick={handleOpenDialog} disabled={remainingWeight <= 0}>
          <Plus className="h-4 w-4 mr-1" />
          Add Responsibility
        </Button>
      </div>

      {totalWeight > 100 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Total weight exceeds 100%. Please adjust the weights.
          </AlertDescription>
        </Alert>
      )}

      {jobResponsibilities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No responsibilities assigned to this job yet.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Responsibility</TableHead>
              <TableHead className="w-24">Weight %</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobResponsibilities.map((jr) => (
              <TableRow key={jr.id}>
                <TableCell className="font-medium">{jr.responsibility_name}</TableCell>
                <TableCell>{jr.weighting}%</TableCell>
                <TableCell className="text-muted-foreground">{jr.notes || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(jr.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Responsibility to Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Responsibility *</Label>
              <Select
                value={formData.responsibility_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, responsibility_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  {availableResponsibilities.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Weight % * (max {remainingWeight}%)</Label>
              <Input
                type="number"
                min={1}
                max={remainingWeight}
                value={formData.weighting}
                onChange={(e) =>
                  setFormData({ ...formData, weighting: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
