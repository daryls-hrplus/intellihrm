import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExternalTrainingTabProps {
  companyId: string;
}

interface ExternalTraining {
  id: string;
  training_name: string;
  provider_name: string | null;
  training_type: string | null;
  start_date: string;
  end_date: string | null;
  duration_hours: number | null;
  actual_cost: number | null;
  currency: string;
  certificate_received: boolean;
  employee: { full_name: string } | null;
}

export function ExternalTrainingTab({ companyId }: ExternalTrainingTabProps) {
  const [records, setRecords] = useState<ExternalTraining[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    training_name: "",
    provider_name: "",
    training_type: "workshop",
    start_date: "",
    end_date: "",
    duration_hours: "",
    actual_cost: "",
    currency: "USD",
    location: "",
    certificate_received: false,
    skills_acquired: "",
    notes: "",
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const [recordsRes, employeesRes] = await Promise.all([
      supabase
        .from("external_training_records")
        .select("*, employee:profiles!external_training_records_employee_id_fkey(full_name)")
        .eq("company_id", companyId)
        .order("start_date", { ascending: false }) as any,
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("is_active", true),
    ]);

    if (recordsRes.data) setRecords(recordsRes.data);
    if (employeesRes.data) setEmployees(employeesRes.data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.training_name || !formData.start_date) {
      toast.error("Employee, training name, and start date are required");
      return;
    }

    const { error } = await supabase.from("external_training_records").insert({
      company_id: companyId,
      employee_id: formData.employee_id,
      training_name: formData.training_name,
      provider_name: formData.provider_name || null,
      training_type: formData.training_type,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null,
      actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
      currency: formData.currency,
      location: formData.location || null,
      certificate_received: formData.certificate_received,
      skills_acquired: formData.skills_acquired ? formData.skills_acquired.split(",").map((s) => s.trim()) : null,
      notes: formData.notes || null,
    });

    if (error) {
      toast.error("Failed to create record");
    } else {
      toast.success("External training recorded");
      setDialogOpen(false);
      resetForm();
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      training_name: "",
      provider_name: "",
      training_type: "workshop",
      start_date: "",
      end_date: "",
      duration_hours: "",
      actual_cost: "",
      currency: "USD",
      location: "",
      certificate_received: false,
      skills_acquired: "",
      notes: "",
    });
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>External Training Records</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Record</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record External Training</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Training Type</Label>
                <Select value={formData.training_type} onValueChange={(v) => setFormData({ ...formData, training_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="online_course">Online Course</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Training Name *</Label>
                <Input value={formData.training_name} onChange={(e) => setFormData({ ...formData, training_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input value={formData.provider_name} onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Duration (Hours)</Label>
                <Input type="number" value={formData.duration_hours} onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Actual Cost</Label>
                <Input type="number" value={formData.actual_cost} onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Skills Acquired (comma-separated)</Label>
                <Input value={formData.skills_acquired} onChange={(e) => setFormData({ ...formData, skills_acquired: e.target.value })} placeholder="e.g., Leadership, Communication, Project Management" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Training</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Certificate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell>{rec.employee?.full_name}</TableCell>
                <TableCell>{rec.training_name}</TableCell>
                <TableCell className="capitalize">{rec.training_type?.replace("_", " ")}</TableCell>
                <TableCell>{rec.provider_name || "-"}</TableCell>
                <TableCell>{format(new Date(rec.start_date), "MMM d, yyyy")}</TableCell>
                <TableCell>{rec.duration_hours || "-"}</TableCell>
                <TableCell>{rec.actual_cost ? `${rec.currency} ${rec.actual_cost.toLocaleString()}` : "-"}</TableCell>
                <TableCell>
                  {rec.certificate_received ? (
                    <Badge variant="default"><FileText className="h-3 w-3 mr-1" />Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">No external training records</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
