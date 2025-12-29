import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, UserPlus, GitBranch, Loader2 } from "lucide-react";
import { useAppraisalRoleSegments } from "@/hooks/useAppraisalRoleSegments";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AppraisalCycle {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
}

interface Participant {
  id: string;
  employee_id: string;
  employee_name: string;
  evaluator_id: string | null;
  evaluator_name: string | null;
  status: string;
  overall_score: number | null;
  has_role_change?: boolean;
}

interface Employee {
  id: string;
  full_name: string;
}

interface AppraisalParticipantsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: AppraisalCycle;
  onSuccess: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  submitted: "bg-warning/10 text-warning",
  reviewed: "bg-success/10 text-success",
  finalized: "bg-success/10 text-success",
};

export function AppraisalParticipantsManager({
  open,
  onOpenChange,
  cycle,
  onSuccess,
}: AppraisalParticipantsManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>("");

  const { createRoleSegments, isLoading: segmentsLoading } = useAppraisalRoleSegments();

  useEffect(() => {
    if (open && cycle.id) {
      fetchData();
    }
  }, [open, cycle.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchParticipants(), fetchEmployees()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from("appraisal_participants")
      .select(`
        id,
        employee_id,
        evaluator_id,
        status,
        overall_score,
        has_role_change,
        employee:profiles!appraisal_participants_employee_id_fkey (full_name),
        evaluator:profiles!appraisal_participants_evaluator_id_fkey (full_name)
      `)
      .eq("cycle_id", cycle.id);

    if (error) {
      console.error("Error fetching participants:", error);
      return;
    }

    const formatted = (data || []).map((item: any) => ({
      id: item.id,
      employee_id: item.employee_id,
      employee_name: item.employee?.full_name || "Unknown",
      evaluator_id: item.evaluator_id,
      evaluator_name: item.evaluator?.full_name || null,
      status: item.status,
      overall_score: item.overall_score,
      has_role_change: item.has_role_change || false,
    }));

    setParticipants(formatted);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .order("full_name");

    if (error) {
      console.error("Error fetching employees:", error);
      return;
    }

    setEmployees(data || []);
  };

  const handleAddParticipant = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    // Check if already added
    if (participants.some((p) => p.employee_id === selectedEmployee)) {
      toast.error("Employee is already a participant");
      return;
    }

    setAddingParticipant(true);
    try {
      // Insert participant
      const { data: newParticipant, error } = await supabase
        .from("appraisal_participants")
        .insert({
          cycle_id: cycle.id,
          employee_id: selectedEmployee,
          evaluator_id: selectedEvaluator || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Detect and create role segments if cycle has start/end dates
      if (cycle.start_date && cycle.end_date && newParticipant) {
        const hasRoleChange = await createRoleSegments(
          newParticipant.id,
          selectedEmployee,
          cycle.start_date,
          cycle.end_date
        );
        if (hasRoleChange) {
          toast.info("Role changes detected - segments created for weighted scoring");
        }
      }

      toast.success("Participant added successfully");
      setSelectedEmployee("");
      setSelectedEvaluator("");
      fetchParticipants();
      onSuccess();
    } catch (error: any) {
      console.error("Error adding participant:", error);
      toast.error(error.message || "Failed to add participant");
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleUpdateEvaluator = async (participantId: string, evaluatorId: string | null) => {
    try {
      const { error } = await supabase
        .from("appraisal_participants")
        .update({ evaluator_id: evaluatorId })
        .eq("id", participantId);

      if (error) throw error;

      toast.success("Evaluator updated");
      fetchParticipants();
    } catch (error: any) {
      console.error("Error updating evaluator:", error);
      toast.error(error.message || "Failed to update evaluator");
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from("appraisal_participants")
        .delete()
        .eq("id", participantId);

      if (error) throw error;

      toast.success("Participant removed");
      fetchParticipants();
      onSuccess();
    } catch (error: any) {
      console.error("Error removing participant:", error);
      toast.error(error.message || "Failed to remove participant");
    }
  };

  const availableEmployees = employees.filter(
    (e) => !participants.some((p) => p.employee_id === e.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Participants - {cycle.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Participant Section */}
          <div className="flex gap-4 items-end p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Evaluator (Optional)</label>
              <Select 
                value={selectedEvaluator || "none"} 
                onValueChange={(v) => setSelectedEvaluator(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select evaluator..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No evaluator</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAddParticipant} 
              disabled={!selectedEmployee || addingParticipant || segmentsLoading}
            >
              {addingParticipant || segmentsLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {addingParticipant ? "Adding..." : "Add"}
            </Button>
          </div>

          {/* Participants Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Evaluator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No participants added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {participant.employee_name}
                          {participant.has_role_change && (
                            <Tooltip>
                              <TooltipTrigger>
                                <GitBranch className="h-4 w-4 text-info" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Role changed during cycle - weighted scoring applies
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={participant.evaluator_id || "none"}
                          onValueChange={(value) =>
                            handleUpdateEvaluator(participant.id, value === "none" ? null : value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Assign evaluator..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No evaluator</SelectItem>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[participant.status]}>
                          {participant.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {participant.overall_score !== null
                          ? `${participant.overall_score.toFixed(1)}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
