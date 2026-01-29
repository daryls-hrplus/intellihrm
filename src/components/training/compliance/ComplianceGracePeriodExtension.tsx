import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Calendar, Plus, CheckCircle, AlertTriangle, 
  CalendarPlus, History, User 
} from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { differenceInDays, addDays, format } from "date-fns";

interface Assignment {
  id: string;
  due_date: string;
  status: string;
  grace_period_extended: boolean | null;
  grace_period_end_date: string | null;
  grace_period_approved_by: string | null;
  exemption_notes: string | null;
  compliance: { name: string; grace_period_days: number } | null;
  employee: { id: string; full_name: string } | null;
}

interface ComplianceGracePeriodExtensionProps {
  companyId: string;
  isManager?: boolean;
}

export function ComplianceGracePeriodExtension({ companyId, isManager = false }: ComplianceGracePeriodExtensionProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [originalDueDate, setOriginalDueDate] = useState<string>("");

  const [formData, setFormData] = useState({
    extension_days: 7,
    reason: "",
  });

  useEffect(() => {
    if (companyId) loadAssignments();
  }, [companyId, user]);

  const loadAssignments = async () => {
    setLoading(true);

    // Load overdue or soon-due assignments eligible for extension
    // @ts-ignore - Supabase type instantiation issue
    let query = supabase
      .from("compliance_training_assignments")
      .select(`
        id, due_date, status, grace_period_extended, grace_period_end_date,
        grace_period_approved_by, exemption_notes,
        compliance:compliance_training(name, grace_period_days),
        employee:profiles!compliance_training_assignments_employee_id_fkey(id, full_name)
      `)
      .neq("status", "completed")
      .neq("status", "exempted")
      .order("due_date");

    // If not manager, only show user's own assignments
    if (!isManager && user) {
      query = query.eq("employee_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading assignments:", error);
    } else {
      // Filter to show only overdue or due within 14 days
      const now = new Date();
      const filtered = ((data as unknown as Assignment[]) || []).filter((a) => {
        const daysUntilDue = differenceInDays(new Date(a.due_date), now);
        return daysUntilDue <= 14; // Overdue or due within 2 weeks
      });
      setAssignments(filtered);
    }

    setLoading(false);
  };

  const openExtensionDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setOriginalDueDate(assignment.due_date);
    setFormData({
      extension_days: 7,
      reason: "",
    });
    setDialogOpen(true);
  };

  const submitExtension = async () => {
    if (!selectedAssignment || !formData.reason || !user) {
      toast.error("Please provide a reason for the extension");
      return;
    }

    const currentDueDate = new Date(selectedAssignment.due_date);
    const newDueDate = addDays(currentDueDate, formData.extension_days);

    // @ts-ignore - Supabase type instantiation issue
    const { error } = await supabase
      .from("compliance_training_assignments")
      .update({
        due_date: format(newDueDate, "yyyy-MM-dd"),
        grace_period_extended: true,
        grace_period_end_date: format(newDueDate, "yyyy-MM-dd"),
        grace_period_approved_by: user.id,
        exemption_notes: formData.reason,
        // Reset escalation when extension is granted
        escalation_level: 0,
        escalation_started_at: null,
      })
      .eq("id", selectedAssignment.id);

    if (error) {
      toast.error("Failed to extend grace period");
      console.error(error);
    } else {
      toast.success(`Grace period extended by ${formData.extension_days} days`);
      setDialogOpen(false);
      loadAssignments();
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const daysUntilDue = differenceInDays(new Date(assignment.due_date), new Date());

    if (daysUntilDue < 0) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {Math.abs(daysUntilDue)} days overdue
        </Badge>
      );
    }
    if (daysUntilDue <= 7) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Due in {daysUntilDue} days
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Calendar className="h-3 w-3 mr-1" />
        Due in {daysUntilDue} days
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Grace Period Extensions
          </CardTitle>
          <CardDescription>
            {isManager
              ? "Extend grace periods for team members with overdue or soon-due training"
              : "Request extensions for your overdue or soon-due training assignments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No assignments need attention at this time</p>
              <p className="text-sm">All training is on track or completed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isManager && <TableHead>Employee</TableHead>}
                  <TableHead>Training</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Extensions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    {isManager && <TableCell className="font-medium">{a.employee?.full_name}</TableCell>}
                    <TableCell>{a.compliance?.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{formatDateForDisplay(a.due_date, "MMM d, yyyy")}</p>
                        {a.grace_period_extended && a.grace_period_end_date && (
                          <p className="text-xs text-muted-foreground">
                            Extended to: {formatDateForDisplay(a.grace_period_end_date, "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(a)}</TableCell>
                    <TableCell>
                      {a.grace_period_extended ? (
                        <Badge variant="outline" className="bg-blue-50">
                          <History className="h-3 w-3 mr-1" />
                          Extended
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openExtensionDialog(a)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Extend
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Extension Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              Extend Grace Period
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedAssignment?.employee?.full_name}</span>
              </div>
              <p className="text-sm">{selectedAssignment?.compliance?.name}</p>
              <p className="text-sm text-muted-foreground">
                Current due: {selectedAssignment?.due_date && formatDateForDisplay(selectedAssignment.due_date, "MMM d, yyyy")}
              </p>
              {selectedAssignment?.grace_period_extended && (
                <Badge variant="secondary" className="mt-2">
                  Already extended
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>Extension Days</Label>
              <div className="flex gap-2">
                {[7, 14, 21, 30].map((days) => (
                  <Button
                    key={days}
                    size="sm"
                    variant={formData.extension_days === days ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, extension_days: days })}
                  >
                    {days} days
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>New due date:</strong>{" "}
                {selectedAssignment?.due_date &&
                  format(addDays(new Date(selectedAssignment.due_date), formData.extension_days), "MMMM d, yyyy")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Reason for Extension *</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Explain why an extension is needed..."
                rows={3}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p>Extensions reset the escalation level but are logged for audit purposes.</p>
                <p className="text-xs mt-1">
                  Max grace period: {selectedAssignment?.compliance?.grace_period_days || 30} days per training requirement.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitExtension} disabled={!formData.reason}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Grant Extension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
