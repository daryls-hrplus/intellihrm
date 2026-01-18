import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  GitBranch, 
  Loader2, 
  Users, 
  Building2, 
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  User,
  Network,
  UserCog
} from "lucide-react";
import { useAppraisalRoleSegments } from "@/hooks/useAppraisalRoleSegments";
import { useConcurrentPositionDetection, ConcurrentPosition } from "@/hooks/useConcurrentPositionDetection";
import { MultiPositionEnrollmentDialog, MultiPositionHandlingMode } from "./MultiPositionEnrollmentDialog";
import { ParticipantRoleQuickView } from "./ParticipantRoleQuickView";

interface AppraisalCycle {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  multi_position_mode?: string;
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
  has_multi_position?: boolean;
}

interface Employee {
  id: string;
  full_name: string;
}

interface Department {
  id: string;
  name: string;
}

interface EnrollmentPreviewItem {
  employeeId: string;
  employeeName: string;
  evaluatorId: string | null;
  evaluatorName: string | null;
  evaluatorSource: "direct_supervisor" | "matrix_supervisor" | "delegate" | "none";
  warnings: string[];
  selected: boolean;
}

interface AppraisalParticipantsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: AppraisalCycle;
  companyId: string;
  companyName: string;
  onSuccess: () => void;
}

type EnrollmentMode = "single" | "department" | "all";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  submitted: "bg-warning/10 text-warning",
  reviewed: "bg-success/10 text-success",
  finalized: "bg-success/10 text-success",
};

const evaluatorSourceLabels: Record<string, { label: string; icon: any }> = {
  direct_supervisor: { label: "Direct Supervisor", icon: UserCheck },
  matrix_supervisor: { label: "Matrix Supervisor", icon: Network },
  delegate: { label: "Delegate", icon: UserCog },
  none: { label: "No Evaluator", icon: AlertTriangle },
};

export function AppraisalParticipantsManager({
  open,
  onOpenChange,
  cycle,
  companyId,
  companyName,
  onSuccess,
}: AppraisalParticipantsManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingParticipant, setAddingParticipant] = useState(false);
  
  // Enrollment mode state
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>("single");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  
  // Valid evaluators for selected employee
  const [validEvaluators, setValidEvaluators] = useState<Employee[]>([]);
  const [loadingEvaluators, setLoadingEvaluators] = useState(false);
  
  // Enrollment preview state
  const [enrollmentPreview, setEnrollmentPreview] = useState<EnrollmentPreviewItem[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  
  // Multi-position enrollment state
  const [showMultiPositionDialog, setShowMultiPositionDialog] = useState(false);
  const [pendingEmployee, setPendingEmployee] = useState<{ id: string; name: string } | null>(null);
  const [detectedPositions, setDetectedPositions] = useState<ConcurrentPosition[]>([]);

  const { createRoleSegments, isLoading: segmentsLoading } = useAppraisalRoleSegments();
  const { detectConcurrentPositions, isLoading: detectingPositions } = useConcurrentPositionDetection();

  useEffect(() => {
    if (open && cycle.id && companyId) {
      fetchData();
    }
  }, [open, cycle.id, companyId]);

  // Load valid evaluators when employee is selected
  useEffect(() => {
    if (selectedEmployee && enrollmentMode === "single") {
      fetchValidEvaluatorsForEmployee(selectedEmployee);
    } else {
      setValidEvaluators([]);
      setSelectedEvaluator("");
    }
  }, [selectedEmployee, enrollmentMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchParticipants(), fetchEmployees(), fetchDepartments()]);
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
        has_role_change
      `)
      .eq("cycle_id", cycle.id);

    if (error) {
      console.error("Error fetching participants:", error);
      return;
    }

    // Check which participants have multiple positions
    const participantsWithPositions = await Promise.all(
      (data || []).map(async (item: any) => {
        const { data: employee } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", item.employee_id)
          .single();

        const { data: evaluator } = item.evaluator_id
          ? await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", item.evaluator_id)
              .single()
          : { data: null };

        // Check for position weights (indicates multi-position)
        const { count } = await supabase
          .from("appraisal_position_weights")
          .select("id", { count: "exact" })
          .eq("participant_id", item.id);

        return {
          id: item.id,
          employee_id: item.employee_id,
          employee_name: employee?.full_name || "Unknown",
          evaluator_id: item.evaluator_id,
          evaluator_name: evaluator?.full_name || null,
          status: item.status,
          overall_score: item.overall_score,
          has_role_change: item.has_role_change || false,
          has_multi_position: (count || 0) > 1,
        };
      })
    );

    setParticipants(participantsWithPositions);
  };

  const fetchEmployees = async () => {
    if (!companyId) return;
    
    // Get employees who have active positions in this company
    const { data: employeePositions, error: posError } = await supabase
      .from("employee_positions")
      .select(`
        employee_id,
        positions!inner (
          company_id
        )
      `)
      .eq("positions.company_id", companyId)
      .eq("is_active", true);

    if (posError) {
      console.error("Error fetching employee positions:", posError);
      return;
    }

    // Get unique employee IDs
    const employeeIds = [...new Set(employeePositions?.map(ep => ep.employee_id) || [])];
    
    if (employeeIds.length === 0) {
      setEmployees([]);
      return;
    }

    // Fetch employee profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", employeeIds)
      .order("full_name");

    if (error) {
      console.error("Error fetching employees:", error);
      return;
    }

    setEmployees(profiles || []);
  };

  const fetchDepartments = async () => {
    if (!companyId) return;
    
    const { data, error } = await supabase
      .from("departments")
      .select("id, name")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");
    
    if (error) {
      console.error("Error fetching departments:", error);
      return;
    }
    
    setDepartments(data || []);
  };

  const fetchValidEvaluatorsForEmployee = async (employeeId: string) => {
    setLoadingEvaluators(true);
    try {
      const evaluatorData = await getEvaluatorForEmployee(employeeId);
      
      // Build list of valid evaluators
      const validIds = new Set<string>();
      if (evaluatorData.supervisorId) validIds.add(evaluatorData.supervisorId);
      if (evaluatorData.matrixSupervisorId) validIds.add(evaluatorData.matrixSupervisorId);
      if (evaluatorData.delegateId) validIds.add(evaluatorData.delegateId);
      
      if (validIds.size === 0) {
        setValidEvaluators([]);
        return;
      }
      
      const { data: evaluatorProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", Array.from(validIds))
        .order("full_name");
      
      setValidEvaluators(evaluatorProfiles || []);
    } catch (error) {
      console.error("Error fetching valid evaluators:", error);
      setValidEvaluators([]);
    } finally {
      setLoadingEvaluators(false);
    }
  };

  const getEvaluatorForEmployee = useCallback(async (employeeId: string): Promise<{
    evaluatorId: string | null;
    evaluatorName: string | null;
    source: "direct_supervisor" | "matrix_supervisor" | "delegate" | "none";
    supervisorId: string | null;
    matrixSupervisorId: string | null;
    delegateId: string | null;
  }> => {
    try {
      // Step 1: Get employee's primary position
      const { data: empPositions } = await supabase
        .from("employee_positions")
        .select(`
          position_id,
          is_primary,
          positions!inner (
            id,
            reports_to_position_id,
            company_id
          )
        `)
        .eq("employee_id", employeeId)
        .eq("is_active", true)
        .eq("positions.company_id", companyId);

      if (!empPositions?.length) {
        return { evaluatorId: null, evaluatorName: null, source: "none", supervisorId: null, matrixSupervisorId: null, delegateId: null };
      }

      // Find primary position or use first one
      const primaryPosition = empPositions.find(p => p.is_primary) || empPositions[0];
      const positionData = primaryPosition.positions as any;
      
      let supervisorEmployeeId: string | null = null;
      let matrixSupervisorEmployeeId: string | null = null;
      let delegateEmployeeId: string | null = null;

      // Step 2: Get direct supervisor
      if (positionData?.reports_to_position_id) {
        const { data: supervisorEmployee } = await supabase
          .from("employee_positions")
          .select("employee_id")
          .eq("position_id", positionData.reports_to_position_id)
          .eq("is_active", true)
          .limit(1)
          .single();
        
        supervisorEmployeeId = supervisorEmployee?.employee_id || null;
      }

      // Step 3: Get matrix supervisor if no direct supervisor
      if (!supervisorEmployeeId) {
        const { data: matrixSup } = await supabase
          .from("position_matrix_supervisors")
          .select("matrix_supervisor_position_id")
          .eq("position_id", primaryPosition.position_id)
          .eq("is_active", true)
          .limit(1)
          .single();

        if (matrixSup?.matrix_supervisor_position_id) {
          const { data: matrixEmployee } = await supabase
            .from("employee_positions")
            .select("employee_id")
            .eq("position_id", matrixSup.matrix_supervisor_position_id)
            .eq("is_active", true)
            .limit(1)
            .single();
          
          matrixSupervisorEmployeeId = matrixEmployee?.employee_id || null;
        }
      }

      // Step 4: Check if supervisor/matrix supervisor has an active delegate
      const supervisorToCheck = supervisorEmployeeId || matrixSupervisorEmployeeId;
      if (supervisorToCheck) {
        const today = new Date().toISOString().split('T')[0];
        const { data: delegation } = await supabase
          .from("approval_delegations")
          .select("delegate_id")
          .eq("delegator_id", supervisorToCheck)
          .eq("company_id", companyId)
          .eq("is_active", true)
          .lte("start_date", today)
          .or(`end_date.is.null,end_date.gte.${today}`)
          .limit(1)
          .single();

        delegateEmployeeId = delegation?.delegate_id || null;
      }

      // Determine the final evaluator (priority: delegate > direct > matrix)
      let finalEvaluatorId: string | null = null;
      let source: "direct_supervisor" | "matrix_supervisor" | "delegate" | "none" = "none";
      
      if (delegateEmployeeId) {
        finalEvaluatorId = delegateEmployeeId;
        source = "delegate";
      } else if (supervisorEmployeeId) {
        finalEvaluatorId = supervisorEmployeeId;
        source = "direct_supervisor";
      } else if (matrixSupervisorEmployeeId) {
        finalEvaluatorId = matrixSupervisorEmployeeId;
        source = "matrix_supervisor";
      }

      // Get evaluator name
      let evaluatorName: string | null = null;
      if (finalEvaluatorId) {
        const { data: evaluatorProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", finalEvaluatorId)
          .single();
        evaluatorName = evaluatorProfile?.full_name || null;
      }

      return { 
        evaluatorId: finalEvaluatorId, 
        evaluatorName,
        source,
        supervisorId: supervisorEmployeeId,
        matrixSupervisorId: matrixSupervisorEmployeeId,
        delegateId: delegateEmployeeId
      };
    } catch (error) {
      console.error("Error getting evaluator for employee:", error);
      return { evaluatorId: null, evaluatorName: null, source: "none", supervisorId: null, matrixSupervisorId: null, delegateId: null };
    }
  }, [companyId]);

  const getEnrollmentPreview = useCallback(async (mode: EnrollmentMode, departmentId?: string) => {
    setLoadingPreview(true);
    try {
      let targetEmployeeIds: string[] = [];

      if (mode === "all") {
        // All employees in company not already participants
        targetEmployeeIds = employees.map(e => e.id);
      } else if (mode === "department" && departmentId) {
        // Get employees in the selected department
        const { data: deptPositions } = await supabase
          .from("positions")
          .select("id")
          .eq("department_id", departmentId)
          .eq("company_id", companyId)
          .eq("is_active", true);

        const positionIds = deptPositions?.map(p => p.id) || [];
        
        if (positionIds.length > 0) {
          const { data: empPositions } = await supabase
            .from("employee_positions")
            .select("employee_id")
            .in("position_id", positionIds)
            .eq("is_active", true);
          
          targetEmployeeIds = [...new Set(empPositions?.map(ep => ep.employee_id) || [])];
        }
      }

      // Filter out already enrolled participants
      const existingEmployeeIds = new Set(participants.map(p => p.employee_id));
      targetEmployeeIds = targetEmployeeIds.filter(id => !existingEmployeeIds.has(id));

      // Build preview with auto-assigned evaluators
      const previewItems: EnrollmentPreviewItem[] = await Promise.all(
        targetEmployeeIds.map(async (empId) => {
          const emp = employees.find(e => e.id === empId);
          const evaluatorData = await getEvaluatorForEmployee(empId);
          
          const warnings: string[] = [];
          if (evaluatorData.source === "none") {
            warnings.push("No supervisor configured");
          }

          return {
            employeeId: empId,
            employeeName: emp?.full_name || "Unknown",
            evaluatorId: evaluatorData.evaluatorId,
            evaluatorName: evaluatorData.evaluatorName,
            evaluatorSource: evaluatorData.source,
            warnings,
            selected: true,
          };
        })
      );

      setEnrollmentPreview(previewItems);
    } catch (error) {
      console.error("Error getting enrollment preview:", error);
      toast.error("Failed to generate enrollment preview");
    } finally {
      setLoadingPreview(false);
    }
  }, [employees, participants, companyId, getEvaluatorForEmployee]);

  // Load preview when mode or department changes
  useEffect(() => {
    if (enrollmentMode === "all") {
      getEnrollmentPreview("all");
    } else if (enrollmentMode === "department" && selectedDepartment) {
      getEnrollmentPreview("department", selectedDepartment);
    } else {
      setEnrollmentPreview([]);
    }
  }, [enrollmentMode, selectedDepartment, getEnrollmentPreview]);

  const togglePreviewSelection = (employeeId: string) => {
    setEnrollmentPreview(prev => 
      prev.map(item => 
        item.employeeId === employeeId 
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const selectAllPreview = (selected: boolean) => {
    setEnrollmentPreview(prev => 
      prev.map(item => ({ ...item, selected }))
    );
  };

  const handleAddSingleParticipant = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    // Check if already added
    if (participants.some((p) => p.employee_id === selectedEmployee)) {
      toast.error("Employee is already a participant");
      return;
    }

    // Detect concurrent positions
    const employeeInfo = employees.find(e => e.id === selectedEmployee);
    const result = await detectConcurrentPositions(selectedEmployee);

    if (result.hasMultiplePositions) {
      // Show multi-position enrollment dialog
      setPendingEmployee({ id: selectedEmployee, name: employeeInfo?.full_name || "Employee" });
      setDetectedPositions(result.positions);
      setShowMultiPositionDialog(true);
      return;
    }

    // Single position - proceed with normal enrollment
    await addParticipantWithSettings(selectedEmployee, selectedEvaluator || null, "aggregate", {});
  };

  const addParticipantWithSettings = async (
    employeeId: string,
    evaluatorId: string | null,
    mode: MultiPositionHandlingMode,
    weights: Record<string, number>
  ) => {
    setAddingParticipant(true);
    try {
      // Insert participant
      const { data: newParticipant, error } = await supabase
        .from("appraisal_participants")
        .insert({
          cycle_id: cycle.id,
          employee_id: employeeId,
          evaluator_id: evaluatorId,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Detect and create role segments if cycle has start/end dates
      if (cycle.start_date && cycle.end_date && newParticipant) {
        const hasRoleChange = await createRoleSegments(
          newParticipant.id,
          employeeId,
          cycle.start_date,
          cycle.end_date
        );
        if (hasRoleChange) {
          toast.info("Role changes detected - segments created for weighted scoring");
        }
      }

      // Create position weights if multiple positions with aggregate mode
      if (mode === "aggregate" && Object.keys(weights).length > 1 && newParticipant) {
        const weightsToCreate = Object.entries(weights).map(([positionId, weight]) => ({
          participant_id: newParticipant.id,
          position_id: positionId,
          job_id: detectedPositions.find(p => p.position_id === positionId)?.job_id || null,
          weight_percentage: weight,
          is_primary: detectedPositions.find(p => p.position_id === positionId)?.is_primary || false,
        }));

        await supabase
          .from("appraisal_position_weights")
          .insert(weightsToCreate);

        toast.info("Multi-position weights configured for weighted scoring");
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error adding participant:", error);
      return { success: false, error: error.message };
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleSingleEnrollmentComplete = async () => {
    const result = await handleAddSingleParticipant();
    if (result !== undefined) {
      toast.success("Participant added successfully");
      setSelectedEmployee("");
      setSelectedEvaluator("");
      fetchParticipants();
      onSuccess();
    }
  };

  const handleBulkEnrollment = async () => {
    const selectedItems = enrollmentPreview.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error("No employees selected for enrollment");
      return;
    }

    setEnrolling(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of selectedItems) {
      try {
        const { data: newParticipant, error } = await supabase
          .from("appraisal_participants")
          .insert({
            cycle_id: cycle.id,
            employee_id: item.employeeId,
            evaluator_id: item.evaluatorId,
          })
          .select("id")
          .single();

        if (error) throw error;

        // Create role segments if applicable
        if (newParticipant && cycle.start_date && cycle.end_date) {
          await createRoleSegments(
            newParticipant.id,
            item.employeeId,
            cycle.start_date,
            cycle.end_date
          );
        }

        successCount++;
      } catch (error: any) {
        console.error(`Error enrolling ${item.employeeName}:`, error);
        errorCount++;
      }
    }

    toast.success(
      `Enrolled ${successCount} participant${successCount !== 1 ? 's' : ''}${
        errorCount > 0 ? ` (${errorCount} failed)` : ''
      }`
    );

    fetchParticipants();
    onSuccess();
    setEnrollmentPreview([]);
    setEnrollmentMode("single");
    setEnrolling(false);
  };

  const handleMultiPositionConfirm = async (mode: MultiPositionHandlingMode, weights: Record<string, number>) => {
    setShowMultiPositionDialog(false);
    if (pendingEmployee) {
      const result = await addParticipantWithSettings(pendingEmployee.id, selectedEvaluator || null, mode, weights);
      if (result.success) {
        toast.success("Participant added successfully");
        setSelectedEmployee("");
        setSelectedEvaluator("");
        setPendingEmployee(null);
        setDetectedPositions([]);
        fetchParticipants();
        onSuccess();
      } else {
        toast.error(result.error || "Failed to add participant");
      }
    }
  };

  const handleMultiPositionCancel = () => {
    setShowMultiPositionDialog(false);
    setPendingEmployee(null);
    setDetectedPositions([]);
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

  const selectedPreviewCount = enrollmentPreview.filter(item => item.selected).length;
  const hasWarnings = enrollmentPreview.some(item => item.warnings.length > 0 && item.selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Participants - {cycle.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Enrollment Mode Tabs */}
          <Tabs value={enrollmentMode} onValueChange={(v) => setEnrollmentMode(v as EnrollmentMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single" className="gap-2">
                <User className="h-4 w-4" />
                Single Employee
              </TabsTrigger>
              <TabsTrigger value="department" className="gap-2">
                <Building2 className="h-4 w-4" />
                By Department
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Users className="h-4 w-4" />
                All Eligible
              </TabsTrigger>
            </TabsList>

            {/* Single Employee Enrollment */}
            <TabsContent value="single" className="space-y-4 mt-4">
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
                  <label className="text-sm font-medium mb-1 block">
                    Evaluator 
                    {loadingEvaluators && <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />}
                  </label>
                  <Select 
                    value={selectedEvaluator || "none"} 
                    onValueChange={(v) => setSelectedEvaluator(v === "none" ? "" : v)}
                    disabled={!selectedEmployee || loadingEvaluators}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedEmployee 
                          ? "Select employee first" 
                          : loadingEvaluators 
                            ? "Loading..." 
                            : "Select evaluator..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No evaluator</SelectItem>
                      {validEvaluators.map((evaluator) => (
                        <SelectItem key={evaluator.id} value={evaluator.id}>
                          {evaluator.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedEmployee && validEvaluators.length === 0 && !loadingEvaluators && (
                    <p className="text-xs text-warning mt-1">No supervisor configured for this employee</p>
                  )}
                </div>
                <Button 
                  onClick={handleSingleEnrollmentComplete} 
                  disabled={!selectedEmployee || addingParticipant || segmentsLoading || detectingPositions}
                >
                  {addingParticipant || segmentsLoading || detectingPositions ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {detectingPositions ? "Checking..." : addingParticipant ? "Adding..." : "Add"}
                </Button>
              </div>
            </TabsContent>

            {/* Department Enrollment */}
            <TabsContent value="department" className="space-y-4 mt-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Select Department</label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department..." />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loadingPreview && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!loadingPreview && enrollmentPreview.length > 0 && (
                  <EnrollmentPreviewTable
                    items={enrollmentPreview}
                    onToggle={togglePreviewSelection}
                    onSelectAll={selectAllPreview}
                  />
                )}

                {!loadingPreview && selectedDepartment && enrollmentPreview.length === 0 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      All employees in this department are already enrolled in this cycle.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {enrollmentPreview.length > 0 && (
                <div className="flex items-center justify-between">
                  {hasWarnings && (
                    <Alert variant="destructive" className="flex-1 mr-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Some employees have no supervisor configured. They will be enrolled without an evaluator.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    onClick={handleBulkEnrollment} 
                    disabled={selectedPreviewCount === 0 || enrolling}
                    className="ml-auto"
                  >
                    {enrolling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Enroll {selectedPreviewCount} Employee{selectedPreviewCount !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* All Eligible Enrollment */}
            <TabsContent value="all" className="space-y-4 mt-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                {loadingPreview && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!loadingPreview && enrollmentPreview.length > 0 && (
                  <EnrollmentPreviewTable
                    items={enrollmentPreview}
                    onToggle={togglePreviewSelection}
                    onSelectAll={selectAllPreview}
                  />
                )}

                {!loadingPreview && enrollmentPreview.length === 0 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      All eligible employees are already enrolled in this cycle.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {enrollmentPreview.length > 0 && (
                <div className="flex items-center justify-between">
                  {hasWarnings && (
                    <Alert variant="destructive" className="flex-1 mr-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Some employees have no supervisor configured. They will be enrolled without an evaluator.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    onClick={handleBulkEnrollment} 
                    disabled={selectedPreviewCount === 0 || enrolling}
                    className="ml-auto"
                  >
                    {enrolling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Enroll {selectedPreviewCount} Employee{selectedPreviewCount !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Current Participants Table */}
          <div className="border rounded-lg">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="font-medium">Current Participants ({participants.length})</h3>
            </div>
            <ScrollArea className="h-[300px]">
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
                          <ParticipantRoleQuickView
                            participantId={participant.id}
                            hasRoleChange={participant.has_role_change}
                            hasMultiPosition={participant.has_multi_position}
                          >
                            <div className="flex items-center gap-2">
                              {participant.employee_name}
                              {participant.has_role_change && (
                                <Badge variant="outline" className="text-xs border-info/50 text-info gap-1">
                                  <GitBranch className="h-3 w-3" />
                                  Mid-Cycle Change
                                </Badge>
                              )}
                              {participant.has_multi_position && (
                                <Badge variant="outline" className="text-xs border-primary/50 text-primary gap-1">
                                  <Users className="h-3 w-3" />
                                  Multi-Role
                                </Badge>
                              )}
                            </div>
                          </ParticipantRoleQuickView>
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
            </ScrollArea>
          </div>
        </div>
      </DialogContent>

      {/* Multi-Position Enrollment Dialog */}
      <MultiPositionEnrollmentDialog
        open={showMultiPositionDialog}
        onOpenChange={setShowMultiPositionDialog}
        employeeName={pendingEmployee?.name || ""}
        positions={detectedPositions}
        cycleMode={(cycle.multi_position_mode as "aggregate" | "separate") || "aggregate"}
        onConfirm={handleMultiPositionConfirm}
        onCancel={handleMultiPositionCancel}
      />
    </Dialog>
  );
}

// Enrollment Preview Table Component
function EnrollmentPreviewTable({
  items,
  onToggle,
  onSelectAll,
}: {
  items: EnrollmentPreviewItem[];
  onToggle: (employeeId: string) => void;
  onSelectAll: (selected: boolean) => void;
}) {
  const allSelected = items.every(item => item.selected);
  const someSelected = items.some(item => item.selected) && !allSelected;

  return (
    <div className="border rounded-lg">
      <ScrollArea className="h-[250px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
              </TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Evaluator</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Warnings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const SourceIcon = evaluatorSourceLabels[item.evaluatorSource]?.icon || AlertTriangle;
              return (
                <TableRow key={item.employeeId}>
                  <TableCell>
                    <Checkbox 
                      checked={item.selected}
                      onCheckedChange={() => onToggle(item.employeeId)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.employeeName}</TableCell>
                  <TableCell>{item.evaluatorName || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`gap-1 ${item.evaluatorSource === "none" ? "border-warning/50 text-warning" : ""}`}
                    >
                      <SourceIcon className="h-3 w-3" />
                      {evaluatorSourceLabels[item.evaluatorSource]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.warnings.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {item.warnings[0]}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
