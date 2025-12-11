import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Briefcase, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  ChevronDown,
  ChevronRight,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Position {
  id: string;
  department_id: string;
  title: string;
  code: string;
  description: string | null;
  reports_to_position_id: string | null;
  is_active: boolean;
  authorized_headcount: number;
  start_date: string;
  end_date: string | null;
  department?: {
    name: string;
    code: string;
  };
  reports_to?: {
    title: string;
    code: string;
  } | null;
}

interface EmployeePosition {
  id: string;
  employee_id: string;
  position_id: string;
  start_date: string;
  end_date: string | null;
  is_primary: boolean;
  compensation_amount: number | null;
  compensation_currency: string;
  compensation_frequency: string;
  benefits_profile: any;
  is_active: boolean;
  employee?: {
    full_name: string;
    email: string;
  };
  position?: {
    title: string;
    code: string;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface PositionsManagementProps {
  companyId: string;
}

export function PositionsManagement({ companyId }: PositionsManagementProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [employeePositions, setEmployeePositions] = useState<EmployeePosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  // Position dialog state
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Position form state
  const [formTitle, setFormTitle] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDepartmentId, setFormDepartmentId] = useState("");
  const [formReportsTo, setFormReportsTo] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formAuthorizedHeadcount, setFormAuthorizedHeadcount] = useState("1");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState("");

  // Assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<EmployeePosition | null>(null);
  const [assignPositionId, setAssignPositionId] = useState("");

  // Assignment form state
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");
  const [assignIsPrimary, setAssignIsPrimary] = useState(false);
  const [assignCompAmount, setAssignCompAmount] = useState("");
  const [assignCompCurrency, setAssignCompCurrency] = useState("USD");
  const [assignCompFrequency, setAssignCompFrequency] = useState("monthly");
  const [assignIsActive, setAssignIsActive] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch departments for this company
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id, name, code")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");

      if (deptError) throw deptError;
      setDepartments(deptData || []);

      const deptIds = (deptData || []).map(d => d.id);

      if (deptIds.length > 0) {
        // Fetch positions for these departments
        const { data: posData, error: posError } = await supabase
          .from("positions")
          .select(`
            *,
            department:departments(name, code)
          `)
          .in("department_id", deptIds)
          .order("title");

        if (posError) throw posError;
        
        // Map positions with reports_to info
        const positionsWithReportsTo = (posData || []).map(pos => {
          const reportsToPos = posData?.find(p => p.id === pos.reports_to_position_id);
          return {
            ...pos,
            reports_to: reportsToPos ? { title: reportsToPos.title, code: reportsToPos.code } : null
          };
        });
        setPositions(positionsWithReportsTo);

        // Fetch employee positions
        const posIds = (posData || []).map(p => p.id);
        if (posIds.length > 0) {
          const { data: epData, error: epError } = await supabase
            .from("employee_positions")
            .select(`
              *,
              employee:profiles(full_name, email),
              position:positions(title, code)
            `)
            .in("position_id", posIds)
            .order("start_date", { ascending: false });

          if (epError) throw epError;
          setEmployeePositions(epData || []);
        }
      }

      // Fetch employees for assignment
      const { data: empData, error: empError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (empError) throw empError;
      setEmployees(empData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load positions data");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDept = (id: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getPositionsForDept = (deptId: string) => 
    positions.filter(p => p.department_id === deptId);

  const getAssignmentsForPosition = (posId: string) =>
    employeePositions.filter(ep => ep.position_id === posId);

  // Position CRUD
  const openCreatePosition = (deptId?: string) => {
    setEditingPosition(null);
    setFormTitle("");
    setFormCode("");
    setFormDescription("");
    setFormDepartmentId(deptId || "");
    setFormReportsTo("");
    setFormIsActive(true);
    setFormAuthorizedHeadcount("1");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setPositionDialogOpen(true);
  };

  const openEditPosition = (position: Position) => {
    setEditingPosition(position);
    setFormTitle(position.title);
    setFormCode(position.code);
    setFormDescription(position.description || "");
    setFormDepartmentId(position.department_id);
    setFormReportsTo(position.reports_to_position_id || "");
    setFormIsActive(position.is_active);
    setFormAuthorizedHeadcount(position.authorized_headcount?.toString() || "1");
    setFormStartDate(position.start_date);
    setFormEndDate(position.end_date || "");
    setPositionDialogOpen(true);
  };

  const handleSavePosition = async () => {
    if (!formTitle.trim() || !formCode.trim() || !formDepartmentId) {
      toast.error("Title, code, and department are required");
      return;
    }

    setIsProcessing(true);
    try {
      const data = {
        department_id: formDepartmentId,
        title: formTitle.trim(),
        code: formCode.trim(),
        description: formDescription.trim() || null,
        reports_to_position_id: formReportsTo || null,
        is_active: formIsActive,
        authorized_headcount: parseInt(formAuthorizedHeadcount) || 1,
        start_date: formStartDate,
        end_date: formEndDate || null,
      };

      if (editingPosition) {
        const { error } = await supabase
          .from("positions")
          .update(data)
          .eq("id", editingPosition.id);
        if (error) throw error;
        toast.success("Position updated");
      } else {
        const { error } = await supabase
          .from("positions")
          .insert(data);
        if (error) throw error;
        toast.success("Position created");
      }

      setPositionDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save position");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (!confirm("Are you sure? This will remove all employee assignments to this position.")) return;

    try {
      const { error } = await supabase.from("positions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Position deleted");
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete position");
    }
  };

  // Assignment CRUD
  const openAssignEmployee = (positionId: string) => {
    setEditingAssignment(null);
    setAssignPositionId(positionId);
    setAssignEmployeeId("");
    setAssignStartDate(new Date().toISOString().split("T")[0]);
    setAssignEndDate("");
    setAssignIsPrimary(false);
    setAssignCompAmount("");
    setAssignCompCurrency("USD");
    setAssignCompFrequency("monthly");
    setAssignIsActive(true);
    setAssignDialogOpen(true);
  };

  const openEditAssignment = (assignment: EmployeePosition) => {
    setEditingAssignment(assignment);
    setAssignPositionId(assignment.position_id);
    setAssignEmployeeId(assignment.employee_id);
    setAssignStartDate(assignment.start_date);
    setAssignEndDate(assignment.end_date || "");
    setAssignIsPrimary(assignment.is_primary);
    setAssignCompAmount(assignment.compensation_amount?.toString() || "");
    setAssignCompCurrency(assignment.compensation_currency);
    setAssignCompFrequency(assignment.compensation_frequency);
    setAssignIsActive(assignment.is_active);
    setAssignDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!assignEmployeeId || !assignPositionId || !assignStartDate) {
      toast.error("Employee, position, and start date are required");
      return;
    }

    setIsProcessing(true);
    try {
      const data = {
        employee_id: assignEmployeeId,
        position_id: assignPositionId,
        start_date: assignStartDate,
        end_date: assignEndDate || null,
        is_primary: assignIsPrimary,
        compensation_amount: assignCompAmount ? parseFloat(assignCompAmount) : null,
        compensation_currency: assignCompCurrency,
        compensation_frequency: assignCompFrequency,
        benefits_profile: {},
        is_active: assignIsActive,
      };

      if (editingAssignment) {
        const { error } = await supabase
          .from("employee_positions")
          .update(data)
          .eq("id", editingAssignment.id);
        if (error) throw error;
        toast.success("Assignment updated");
      } else {
        const { error } = await supabase
          .from("employee_positions")
          .insert(data);
        if (error) throw error;
        toast.success("Employee assigned to position");
      }

      setAssignDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save assignment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return;

    try {
      const { error } = await supabase.from("employee_positions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Assignment removed");
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to remove assignment");
    }
  };

  const getSupervisorForPosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position?.reports_to_position_id) return null;
    
    const supervisorAssignment = employeePositions.find(
      ep => ep.position_id === position.reports_to_position_id && ep.is_active
    );
    return supervisorAssignment;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Positions & Assignments
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage positions within departments and assign employees
          </p>
        </div>
        <Button onClick={() => openCreatePosition()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No departments found. Create departments first to add positions.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {departments.map((dept) => {
            const deptPositions = getPositionsForDept(dept.id);
            const isExpanded = expandedDepts.has(dept.id);

            return (
              <Card key={dept.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleDept(dept.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <CardTitle className="text-base">{dept.name}</CardTitle>
                          <Badge variant="outline">{dept.code}</Badge>
                          <Badge variant="secondary">{deptPositions.length} positions</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreatePosition(dept.id);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Position
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {deptPositions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No positions in this department
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {deptPositions.map((position) => {
                            const assignments = getAssignmentsForPosition(position.id);
                            const supervisor = getSupervisorForPosition(position.id);

                            return (
                              <div key={position.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{position.title}</h4>
                                      <Badge variant="outline" className="text-xs">{position.code}</Badge>
                                      {!position.is_active && (
                                        <Badge variant="secondary">Inactive</Badge>
                                      )}
                                    </div>
                                    {/* Headcount info */}
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge 
                                        variant={assignments.length < position.authorized_headcount ? "outline" : "default"}
                                        className={assignments.length < position.authorized_headcount ? "text-amber-600 border-amber-600" : ""}
                                      >
                                        {assignments.length} / {position.authorized_headcount} filled
                                      </Badge>
                                      {assignments.length < position.authorized_headcount && (
                                        <span className="text-xs text-amber-600">
                                          {position.authorized_headcount - assignments.length} vacant
                                        </span>
                                      )}
                                      {assignments.length > position.authorized_headcount && (
                                        <span className="text-xs text-red-600">
                                          +{assignments.length - position.authorized_headcount} over
                                        </span>
                                      )}
                                    </div>
                                    {position.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{position.description}</p>
                                    )}
                                    {position.reports_to && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                        <ArrowUpRight className="h-3 w-3" />
                                        Reports to: {position.reports_to.title}
                                        {supervisor?.employee && (
                                          <span className="text-foreground">
                                            ({supervisor.employee.full_name})
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openAssignEmployee(position.id)}
                                    >
                                      <Users className="h-4 w-4 mr-1" />
                                      Assign
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => openEditPosition(position)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() => handleDeletePosition(position.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {assignments.length > 0 && (
                                  <div className="mt-3 border-t pt-3">
                                    <p className="text-sm font-medium mb-2">Assigned Employees:</p>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Employee</TableHead>
                                          <TableHead>Start Date</TableHead>
                                          <TableHead>Compensation</TableHead>
                                          <TableHead>Primary</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {assignments.map((assignment) => (
                                          <TableRow key={assignment.id}>
                                            <TableCell>
                                              <div>
                                                <p className="font-medium">{assignment.employee?.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{assignment.employee?.email}</p>
                                              </div>
                                            </TableCell>
                                            <TableCell>{assignment.start_date}</TableCell>
                                            <TableCell>
                                              {assignment.compensation_amount 
                                                ? `${assignment.compensation_currency} ${assignment.compensation_amount.toLocaleString()} / ${assignment.compensation_frequency}`
                                                : "-"
                                              }
                                            </TableCell>
                                            <TableCell>
                                              {assignment.is_primary && <Badge>Primary</Badge>}
                                            </TableCell>
                                            <TableCell>
                                              <Badge variant={assignment.is_active ? "default" : "secondary"}>
                                                {assignment.is_active ? "Active" : "Inactive"}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-1">
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-7 w-7"
                                                  onClick={() => openEditAssignment(assignment)}
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-7 w-7 text-destructive"
                                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Position Dialog */}
      <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPosition ? "Edit Position" : "Add Position"}</DialogTitle>
            <DialogDescription>
              {editingPosition ? "Update position details" : "Create a new position in a department"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={formDepartmentId} onValueChange={setFormDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Senior Developer"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g., SR-DEV"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Position description..."
              />
            </div>
            <div className="space-y-2">
              <Label>Reports To Position</Label>
              <Select value={formReportsTo} onValueChange={setFormReportsTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor position (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {positions
                    .filter(p => p.id !== editingPosition?.id)
                    .map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.title} ({pos.department?.name})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Authorized Headcount</Label>
              <Input
                type="number"
                min="1"
                value={formAuthorizedHeadcount}
                onChange={(e) => setFormAuthorizedHeadcount(e.target.value)}
                placeholder="Number of positions"
              />
              <p className="text-xs text-muted-foreground">
                How many employees can fill this position
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  placeholder="Leave empty for ongoing"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPositionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePosition} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPosition ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? "Edit Assignment" : "Assign Employee to Position"}</DialogTitle>
            <DialogDescription>
              {editingAssignment ? "Update employee assignment and compensation" : "Hire an employee into this position"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={assignEmployeeId} onValueChange={setAssignEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name || emp.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={assignStartDate}
                  onChange={(e) => setAssignStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={assignEndDate}
                  onChange={(e) => setAssignEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Compensation</Label>
                <Input
                  type="number"
                  value={assignCompAmount}
                  onChange={(e) => setAssignCompAmount(e.target.value)}
                  placeholder="Amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={assignCompCurrency} onValueChange={setAssignCompCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={assignCompFrequency} onValueChange={setAssignCompFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={assignIsPrimary} onCheckedChange={setAssignIsPrimary} />
                <Label>Primary Position</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={assignIsActive} onCheckedChange={setAssignIsActive} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignment} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAssignment ? "Update" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
