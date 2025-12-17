import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  UserCog,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  Search,
  Download,
  Filter,
  Upload,
  History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import { BulkAssignmentUpload } from "@/components/workforce/BulkAssignmentUpload";
import { AssignmentHistoryDialog } from "@/components/workforce/AssignmentHistoryDialog";
import { useTranslation } from "react-i18next";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  company_id: string;
}

interface Position {
  id: string;
  title: string;
  code: string;
  department_id: string;
  is_active: boolean;
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
  company_id: string | null;
}

interface EmployeeAssignment {
  id: string;
  employee_id: string;
  position_id: string;
  start_date: string;
  end_date: string | null;
  is_primary: boolean;
  compensation_amount: number | null;
  compensation_currency: string | null;
  compensation_frequency: string | null;
  is_active: boolean;
  employee: {
    full_name: string | null;
    email: string;
  };
  position: {
    title: string;
    code: string;
    department: {
      name: string;
      code: string;
      company: {
        name: string;
        code: string;
      };
    };
  };
}

export default function EmployeeAssignmentsPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEmployee, setHistoryEmployee] = useState<{ id: string; name: string } | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<EmployeeAssignment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formPositionId, setFormPositionId] = useState("");
  const [formStartDate, setFormStartDate] = useState(getTodayString());
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsPrimary, setFormIsPrimary] = useState(false);
  const [formCompAmount, setFormCompAmount] = useState("");
  const [formCompCurrency, setFormCompCurrency] = useState("USD");
  const [formCompFrequency, setFormCompFrequency] = useState("monthly");
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [selectedCompanyId, selectedDepartmentId, selectedStatus]);

  const fetchInitialData = async () => {
    try {
      const [companiesRes, deptsRes, positionsRes, employeesRes] = await Promise.all([
        supabase.from("companies").select("id, name, code").eq("is_active", true).order("name"),
        supabase.from("departments").select("id, name, code, company_id").eq("is_active", true).order("name"),
        supabase.from("positions").select("id, title, code, department_id, is_active").eq("is_active", true).order("title"),
        supabase.from("profiles").select("id, full_name, email, company_id").order("full_name"),
      ]);

      setCompanies(companiesRes.data || []);
      setDepartments(deptsRes.data || []);
      setPositions(positionsRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load data");
    }
  };

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("employee_positions")
        .select(`
          *,
          employee:profiles(full_name, email),
          position:positions(
            title, 
            code,
            department:departments(
              name, 
              code,
              company:companies(name, code)
            )
          )
        `)
        .order("start_date", { ascending: false });

      if (selectedStatus === "active") {
        query = query.eq("is_active", true);
      } else if (selectedStatus === "inactive") {
        query = query.eq("is_active", false);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Filter by company
      if (selectedCompanyId !== "all") {
        filteredData = filteredData.filter(
          (a) => a.position?.department?.company?.code === companies.find(c => c.id === selectedCompanyId)?.code
        );
      }

      // Filter by department
      if (selectedDepartmentId !== "all") {
        filteredData = filteredData.filter(
          (a) => a.position?.department?.code === departments.find(d => d.id === selectedDepartmentId)?.code
        );
      }

      setAssignments(filteredData as EmployeeAssignment[]);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingAssignment(null);
    setFormEmployeeId("");
    setFormPositionId("");
    setFormStartDate(getTodayString());
    setFormEndDate("");
    setFormIsPrimary(false);
    setFormCompAmount("");
    setFormCompCurrency("USD");
    setFormCompFrequency("monthly");
    setFormIsActive(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (assignment: EmployeeAssignment) => {
    setEditingAssignment(assignment);
    setFormEmployeeId(assignment.employee_id);
    setFormPositionId(assignment.position_id);
    setFormStartDate(assignment.start_date);
    setFormEndDate(assignment.end_date || "");
    setFormIsPrimary(assignment.is_primary);
    setFormCompAmount(assignment.compensation_amount?.toString() || "");
    setFormCompCurrency(assignment.compensation_currency || "USD");
    setFormCompFrequency(assignment.compensation_frequency || "monthly");
    setFormIsActive(assignment.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formEmployeeId || !formPositionId || !formStartDate) {
      toast.error(t("workforce.employeePositionRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        employee_id: formEmployeeId,
        position_id: formPositionId,
        start_date: formStartDate,
        end_date: formEndDate || null,
        is_primary: formIsPrimary,
        compensation_amount: formCompAmount ? parseFloat(formCompAmount) : null,
        compensation_currency: formCompCurrency,
        compensation_frequency: formCompFrequency,
        is_active: formIsActive,
      };

      if (editingAssignment) {
        const { error } = await supabase
          .from("employee_positions")
          .update(data)
          .eq("id", editingAssignment.id);

        if (error) throw error;
        toast.success(t("workforce.assignmentUpdated"));
      } else {
        const { error } = await supabase
          .from("employee_positions")
          .insert(data);

        if (error) throw error;
        toast.success(t("workforce.assignmentCreated"));
      }

      setDialogOpen(false);
      resetForm();
      fetchAssignments();
    } catch (error: any) {
      console.error("Error saving assignment:", error);
      toast.error(error.message || t("common.error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("employee_positions")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast.success(t("workforce.assignmentDeleted"));
      setDeleteId(null);
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error(t("common.error"));
    }
  };

  const exportCSV = () => {
    const headers = ["Employee", "Email", "Position", "Department", "Company", "Start Date", "End Date", "Primary", "Status", "Compensation"];
    const rows = filteredAssignments.map(a => [
      a.employee?.full_name || "N/A",
      a.employee?.email || "N/A",
      a.position?.title || "N/A",
      a.position?.department?.name || "N/A",
      a.position?.department?.company?.name || "N/A",
      a.start_date,
      a.end_date || "",
      a.is_primary ? "Yes" : "No",
      a.is_active ? "Active" : "Inactive",
      a.compensation_amount ? `${a.compensation_amount} ${a.compensation_currency}/${a.compensation_frequency}` : ""
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employee-assignments-${getTodayString()}.csv`;
    link.click();
    toast.success(t("workforce.csvExported"));
  };

  const filteredDepartments = selectedCompanyId !== "all"
    ? departments.filter(d => d.company_id === selectedCompanyId)
    : departments;

  const filteredPositionsForForm = formEmployeeId
    ? positions
    : positions;

  const filteredAssignments = assignments.filter(a => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.employee?.full_name?.toLowerCase().includes(query) ||
      a.employee?.email?.toLowerCase().includes(query) ||
      a.position?.title?.toLowerCase().includes(query) ||
      a.position?.department?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.workforce"), href: "/workforce" },
          { label: t("workforce.employeeAssignments") }
        ]} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <UserCog className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("workforce.employeeAssignments")}
              </h1>
              <p className="text-muted-foreground">
                {t("workforce.viewManageAssignments")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setHistoryEmployee(null); setHistoryOpen(true); }}>
              <History className="h-4 w-4 mr-2" />
              {t("workforce.allHistory")}
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              {t("common.export")}
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t("workforce.bulkUpload")}
                </Button>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("workforce.newAssignment")}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>{t("workforce.company")}</Label>
                <Select value={selectedCompanyId} onValueChange={(v) => { setSelectedCompanyId(v); setSelectedDepartmentId("all"); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("workforce.allCompanies")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("workforce.allCompanies")}</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.department")}</Label>
                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("workforce.allDepartments")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("workforce.allDepartments")}</SelectItem>
                    {filteredDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("workforce.status")}</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("workforce.all")}</SelectItem>
                    <SelectItem value="active">{t("workforce.active")}</SelectItem>
                    <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 min-w-[200px]">
                <Label>{t("common.search")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("workforce.searchAssignments")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("workforce.assignmentsCount")} ({filteredAssignments.length})</CardTitle>
            <CardDescription>
              {t("workforce.allAssignmentsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("workforce.noAssignmentsFound")}
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("workforce.employee")}</TableHead>
                      <TableHead>{t("workforce.position")}</TableHead>
                      <TableHead>{t("workforce.department")}</TableHead>
                      <TableHead>{t("workforce.company")}</TableHead>
                      <TableHead>{t("common.startDate")}</TableHead>
                      <TableHead>{t("common.endDate")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("workforce.primaryAssignment")}</TableHead>
                      {isAdmin && <TableHead className="text-right">{t("common.actions")}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.employee?.full_name || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">{assignment.employee?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.position?.title}</p>
                            <p className="text-xs text-muted-foreground">{assignment.position?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.position?.department?.name}</TableCell>
                        <TableCell>{assignment.position?.department?.company?.name}</TableCell>
                        <TableCell>{formatDateForDisplay(assignment.start_date, "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {assignment.end_date ? formatDateForDisplay(assignment.end_date, "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.is_active ? "default" : "secondary"}>
                            {assignment.is_active ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.is_primary && (
                            <Badge variant="outline" className="bg-primary/10">{t("workforce.primaryAssignment")}</Badge>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t("workforce.viewHistory")}
                                onClick={() => {
                                  setHistoryEmployee({
                                    id: assignment.employee_id,
                                    name: assignment.employee?.full_name || assignment.employee?.email || "Unknown"
                                  });
                                  setHistoryOpen(true);
                                }}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(assignment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(assignment.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAssignment ? t("workforce.editAssignment") : t("workforce.newAssignment")}</DialogTitle>
              <DialogDescription>
                {editingAssignment ? t("workforce.updateAssignment") : t("workforce.assignToPosition")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employee">{t("workforce.employee")} *</Label>
                <Select value={formEmployeeId} onValueChange={setFormEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.selectEmployee")} />
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

              <div className="space-y-2">
                <Label htmlFor="position">{t("workforce.position")} *</Label>
                <Select value={formPositionId} onValueChange={setFormPositionId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.selectPosition")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPositionsForForm.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.title} ({pos.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t("common.startDate")} *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("common.endDate")}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="compAmount">{t("workforce.compensationAmount")}</Label>
                  <Input
                    id="compAmount"
                    type="number"
                    placeholder={t("common.amount")}
                    value={formCompAmount}
                    onChange={(e) => setFormCompAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compCurrency">{t("workforce.currency")}</Label>
                  <Select value={formCompCurrency} onValueChange={setFormCompCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compFrequency">{t("workforce.frequency")}</Label>
                  <Select value={formCompFrequency} onValueChange={setFormCompFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">{t("workforce.hourly")}</SelectItem>
                      <SelectItem value="daily">{t("workforce.daily")}</SelectItem>
                      <SelectItem value="weekly">{t("workforce.weekly")}</SelectItem>
                      <SelectItem value="monthly">{t("workforce.monthly")}</SelectItem>
                      <SelectItem value="yearly">{t("workforce.yearly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPrimary"
                    checked={formIsPrimary}
                    onCheckedChange={setFormIsPrimary}
                  />
                  <Label htmlFor="isPrimary">{t("workforce.primaryPosition")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formIsActive}
                    onCheckedChange={setFormIsActive}
                  />
                  <Label htmlFor="isActive">{t("common.active")}</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingAssignment ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("workforce.deleteAssignment")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("workforce.deleteAssignmentConfirm")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Upload Dialog */}
        <BulkAssignmentUpload
          open={bulkUploadOpen}
          onOpenChange={setBulkUploadOpen}
          employees={employees}
          positions={positions}
          onSuccess={fetchAssignments}
        />

        {/* History Dialog */}
        <AssignmentHistoryDialog
          open={historyOpen}
          onOpenChange={(open) => {
            setHistoryOpen(open);
            if (!open) setHistoryEmployee(null);
          }}
          employeeId={historyEmployee?.id}
          employeeName={historyEmployee?.name}
        />
      </div>
    </AppLayout>
  );
}
