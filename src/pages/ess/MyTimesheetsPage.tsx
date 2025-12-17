import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { Plus, Clock, Send, FileText } from "lucide-react";

interface TimesheetEntry {
  id: string;
  entry_date: string;
  hours_worked: number;
  description: string | null;
  status: string;
  project?: { name: string } | null;
  task?: { name: string } | null;
}

interface Project {
  id: string;
  name: string;
}

export default function MyTimesheetsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    entry_date: getTodayString(),
    hours_worked: "",
    description: "",
    project_id: "",
  });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user || !profile?.company_id) return;
    setIsLoading(true);

    try {
      const [entriesRes, projectsRes] = await Promise.all([
        supabase
          .from("timesheet_entries")
          .select("*, project:projects(name), task:project_tasks(name)")
          .eq("employee_id", user.id)
          .gte("entry_date", weekStart.toISOString())
          .lte("entry_date", weekEnd.toISOString())
          .order("entry_date", { ascending: false }),
        supabase
          .from("projects")
          .select("id, name")
          .eq("company_id", profile.company_id)
          .eq("status", "active"),
      ]);

      setEntries((entriesRes.data || []) as TimesheetEntry[]);
      setProjects((projectsRes.data || []) as Project[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEntry = async () => {
    if (!user || !profile?.company_id) return;
    if (!formData.hours_worked || !formData.entry_date) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("timesheet_entries").insert({
        employee_id: user.id,
        company_id: profile.company_id,
        entry_date: formData.entry_date,
        hours_worked: parseFloat(formData.hours_worked),
        description: formData.description || null,
        project_id: formData.project_id || null,
        status: "draft",
      });

      if (error) throw error;

      toast({ title: "Success", description: "Time entry added" });
      setDialogOpen(false);
      setFormData({ entry_date: getTodayString(), hours_worked: "", description: "", project_id: "" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add time entry", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWeek = async () => {
    const draftEntries = entries.filter(e => e.status === "draft");
    if (draftEntries.length === 0) {
      toast({ title: "Info", description: "No draft entries to submit" });
      return;
    }

    try {
      const { error } = await supabase
        .from("timesheet_entries")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .in("id", draftEntries.map(e => e.id));

      if (error) throw error;

      toast({ title: "Success", description: "Timesheet submitted for approval" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit timesheet", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      submitted: "bg-yellow-500/20 text-yellow-700",
      approved: "bg-green-500/20 text-green-700",
      rejected: "bg-red-500/20 text-red-700",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status}</Badge>;
  };

  const totalHours = entries.reduce((sum, e) => sum + (e.hours_worked || 0), 0);
  const draftCount = entries.filter(e => e.status === "draft").length;

  const breadcrumbItems = [
    { label: "Employee Self-Service", href: "/ess" },
    { label: "My Timesheets" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Timesheets</h1>
            <p className="text-muted-foreground">
              Week of {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
            {draftCount > 0 && (
              <Button variant="default" onClick={handleSubmitWeek}>
                <Send className="h-4 w-4 mr-2" />
                Submit Week
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{totalHours.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{entries.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Draft Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{draftCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No time entries this week</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDateForDisplay(entry.entry_date, "EEE, MMM d")}</TableCell>
                      <TableCell className="font-medium">{entry.hours_worked}</TableCell>
                      <TableCell>{entry.project?.name || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description || "-"}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Hours Worked</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                  placeholder="8.0"
                />
              </div>
              <div>
                <Label>Project (Optional)</Label>
                <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What did you work on?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitEntry} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Entry"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
