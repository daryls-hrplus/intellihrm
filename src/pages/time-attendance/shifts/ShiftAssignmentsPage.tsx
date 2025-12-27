import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { Users, Plus, Edit, Trash2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  full_name: string;
}

interface ShiftAssignment {
  id: string;
  company_id: string;
  employee_id: string;
  shift_id: string;
  effective_date: string;
  end_date: string | null;
  is_primary: boolean;
  rotation_pattern: string | null;
  notes: string | null;
  profile?: { full_name: string } | null;
  shift?: { name: string; code: string } | null;
}

export default function ShiftAssignmentsPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftAssignment | null>(null);
  const [form, setForm] = useState({
    employee_id: "",
    shift_id: "",
    effective_date: getTodayString(),
    end_date: "",
    is_primary: true,
    rotation_pattern: "",
    notes: ""
  });

  const breadcrumbItems = [
    { label: t("timeAttendance.title"), href: "/time-attendance" },
    { label: t("timeAttendance.modules.shifts.title"), href: "/time-attendance/shifts" },
    { label: t("timeAttendance.shifts.assignments") }
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const loadData = async () => {
    await Promise.all([loadShifts(), loadEmployees(), loadAssignments()]);
  };

  const loadShifts = async () => {
    const { data } = await supabase
      .from('shifts')
      .select('id, name, code')
      .eq('company_id', selectedCompany)
      .eq('is_active', true)
      .order('name');
    setShifts(data || []);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .order('full_name');
    setEmployees(data || []);
  };

  const loadAssignments = async () => {
    const { data, error } = await supabase
      .from('employee_shift_assignments')
      .select('*, profile:profiles(full_name), shift:shifts(name, code)')
      .eq('company_id', selectedCompany)
      .order('effective_date', { ascending: false });
    
    if (error) {
      console.error("Failed to load assignments:", error);
      return;
    }
    setAssignments(data || []);
  };

  const handleSave = async () => {
    if (!form.employee_id || !form.shift_id) {
      toast.error(t("common.fillRequired"));
      return;
    }

    const payload = {
      company_id: selectedCompany,
      employee_id: form.employee_id,
      shift_id: form.shift_id,
      effective_date: form.effective_date,
      end_date: form.end_date || null,
      is_primary: form.is_primary,
      rotation_pattern: form.rotation_pattern || null,
      notes: form.notes || null
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from('employee_shift_assignments').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('employee_shift_assignments').insert(payload));
    }

    if (error) {
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(editing ? t("timeAttendance.shifts.assignmentUpdated") : t("timeAttendance.shifts.assignmentCreated"));
    setDialogOpen(false);
    resetForm();
    loadAssignments();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('employee_shift_assignments').delete().eq('id', id);
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("timeAttendance.shifts.assignmentDeleted"));
    loadAssignments();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      employee_id: "",
      shift_id: "",
      effective_date: getTodayString(),
      end_date: "",
      is_primary: true,
      rotation_pattern: "",
      notes: ""
    });
  };

  const openEdit = (assignment: ShiftAssignment) => {
    setEditing(assignment);
    setForm({
      employee_id: assignment.employee_id,
      shift_id: assignment.shift_id,
      effective_date: assignment.effective_date,
      end_date: assignment.end_date || "",
      is_primary: assignment.is_primary,
      rotation_pattern: assignment.rotation_pattern || "",
      notes: assignment.notes || ""
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("timeAttendance.shifts.assignments")}</h1>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-warning" />
              <CardTitle>{t("timeAttendance.shifts.assignments")}</CardTitle>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("timeAttendance.shifts.createAssignment")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editing ? t("common.edit") : t("timeAttendance.shifts.createAssignment")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("common.employee")} *</Label>
                    <Select value={form.employee_id} onValueChange={(v) => setForm({...form, employee_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.selectEmployee")} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("timeAttendance.shifts.shift")} *</Label>
                    <Select value={form.shift_id} onValueChange={(v) => setForm({...form, shift_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("timeAttendance.shifts.selectShift")} />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>{shift.name} ({shift.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("common.startDate")}</Label>
                      <Input 
                        type="date"
                        value={form.effective_date} 
                        onChange={(e) => setForm({...form, effective_date: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.endDate")}</Label>
                      <Input 
                        type="date"
                        value={form.end_date} 
                        onChange={(e) => setForm({...form, end_date: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("timeAttendance.shifts.rotationPattern")}</Label>
                    <Input 
                      value={form.rotation_pattern} 
                      onChange={(e) => setForm({...form, rotation_pattern: e.target.value})} 
                      placeholder="e.g., Week A, Week B"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.notes")}</Label>
                    <Textarea 
                      value={form.notes} 
                      onChange={(e) => setForm({...form, notes: e.target.value})} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t("timeAttendance.shifts.primaryShift")}</Label>
                    <Switch 
                      checked={form.is_primary} 
                      onCheckedChange={(v) => setForm({...form, is_primary: v})} 
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full">{t("common.save")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.employee")}</TableHead>
                  <TableHead>{t("timeAttendance.shifts.shift")}</TableHead>
                  <TableHead>{t("common.startDate")}</TableHead>
                  <TableHead>{t("common.endDate")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {t("timeAttendance.shifts.noAssignments")}
                    </TableCell>
                  </TableRow>
                ) : assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.profile?.full_name}</TableCell>
                    <TableCell>
                      {assignment.shift?.name} ({assignment.shift?.code})
                    </TableCell>
                    <TableCell>{formatDateForDisplay(assignment.effective_date)}</TableCell>
                    <TableCell>{assignment.end_date ? formatDateForDisplay(assignment.end_date) : '-'}</TableCell>
                    <TableCell>
                      <Badge className={assignment.is_primary ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                        {assignment.is_primary ? t("timeAttendance.shifts.primary") : t("timeAttendance.shifts.secondary")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(assignment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(assignment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
