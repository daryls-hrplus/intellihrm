import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Check, X, UserCheck } from "lucide-react";

interface BenefitEnrollment {
  id: string;
  employee_id: string;
  plan_id: string;
  enrollment_date: string;
  effective_date: string;
  termination_date: string | null;
  status: string;
  enrollment_source: string;
  coverage_level: string;
  employee_contribution: number | null;
  employer_contribution: number | null;
  notes: string | null;
  profiles?: { full_name: string; email: string };
  benefit_plans?: { name: string; plan_type: string };
}

interface BenefitPlan {
  id: string;
  name: string;
  plan_type: string;
  employee_contribution: number;
  employer_contribution: number;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface Company {
  id: string;
  name: string;
}

const STATUS_OPTIONS = ['pending', 'active', 'terminated', 'cancelled', 'waived'];
const COVERAGE_LEVELS = ['employee', 'employee+spouse', 'employee+children', 'family'];
const ENROLLMENT_SOURCES = ['open', 'auto', 'life_event', 'new_hire'];

export default function BenefitEnrollmentsPage() {
  const { isAdmin, hasRole, user } = useAuth();
  const canManage = isAdmin || hasRole('hr_manager');
  
  const [enrollments, setEnrollments] = useState<BenefitEnrollment[]>([]);
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<BenefitEnrollment | null>(null);
  
  const [formData, setFormData] = useState({
    employee_id: "",
    plan_id: "",
    enrollment_date: new Date().toISOString().split('T')[0],
    effective_date: new Date().toISOString().split('T')[0],
    termination_date: "",
    status: "pending",
    enrollment_source: "open",
    coverage_level: "employee",
    employee_contribution: 0,
    employer_contribution: 0,
    notes: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchEnrollments();
      fetchPlans();
      fetchEmployees();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('id, name').eq('is_active', true).order('name');
    if (data) {
      setCompanies(data);
      if (data.length > 0) setSelectedCompanyId(data[0].id);
    }
  };

  const fetchPlans = async () => {
    const { data } = await supabase.from('benefit_plans')
      .select('id, name, plan_type, employee_contribution, employer_contribution')
      .eq('company_id', selectedCompanyId)
      .eq('is_active', true);
    setPlans(data || []);
  };

  const fetchEmployees = async () => {
    const { data } = await supabase.from('profiles')
      .select('id, full_name, email')
      .eq('company_id', selectedCompanyId)
      .order('full_name');
    setEmployees(data || []);
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    let query = supabase
      .from('benefit_enrollments')
      .select(`
        *,
        profiles!benefit_enrollments_employee_id_fkey(full_name, email),
        benefit_plans(name, plan_type, company_id)
      `)
      .order('created_at', { ascending: false });

    if (!canManage) {
      query = query.eq('employee_id', user?.id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      toast.error("Failed to load enrollments");
    } else {
      // Filter by company via plan's company_id
      const filtered = (data || []).filter(e => e.benefit_plans?.company_id === selectedCompanyId);
      setEnrollments(filtered);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.plan_id) {
      toast.error("Please fill required fields");
      return;
    }

    const payload = {
      ...formData,
      termination_date: formData.termination_date || null,
      created_by: user?.id,
    };

    if (editingEnrollment) {
      const { error } = await supabase.from('benefit_enrollments').update(payload).eq('id', editingEnrollment.id);
      if (error) {
        toast.error("Failed to update enrollment");
      } else {
        toast.success("Enrollment updated");
        fetchEnrollments();
      }
    } else {
      const { error } = await supabase.from('benefit_enrollments').insert(payload);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Enrollment created");
        fetchEnrollments();
      }
    }
    closeDialog();
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('benefit_enrollments').update({
      status: 'active',
      approved_by: user?.id,
      approved_at: new Date().toISOString()
    }).eq('id', id);
    
    if (error) {
      toast.error("Failed to approve");
    } else {
      toast.success("Enrollment approved");
      fetchEnrollments();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('benefit_enrollments').update({
      status: 'cancelled'
    }).eq('id', id);
    
    if (error) {
      toast.error("Failed to reject");
    } else {
      toast.success("Enrollment rejected");
      fetchEnrollments();
    }
  };

  const openCreate = () => {
    setEditingEnrollment(null);
    const defaultPlan = plans[0];
    setFormData({
      employee_id: employees[0]?.id || "",
      plan_id: defaultPlan?.id || "",
      enrollment_date: new Date().toISOString().split('T')[0],
      effective_date: new Date().toISOString().split('T')[0],
      termination_date: "",
      status: "pending",
      enrollment_source: "open",
      coverage_level: "employee",
      employee_contribution: defaultPlan?.employee_contribution || 0,
      employer_contribution: defaultPlan?.employer_contribution || 0,
      notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (enr: BenefitEnrollment) => {
    setEditingEnrollment(enr);
    setFormData({
      employee_id: enr.employee_id,
      plan_id: enr.plan_id,
      enrollment_date: enr.enrollment_date,
      effective_date: enr.effective_date,
      termination_date: enr.termination_date || "",
      status: enr.status,
      enrollment_source: enr.enrollment_source,
      coverage_level: enr.coverage_level,
      employee_contribution: enr.employee_contribution || 0,
      employer_contribution: enr.employer_contribution || 0,
      notes: enr.notes || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingEnrollment(null);
  };

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    setFormData({
      ...formData,
      plan_id: planId,
      employee_contribution: plan?.employee_contribution || 0,
      employer_contribution: plan?.employer_contribution || 0,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      terminated: "destructive",
      cancelled: "destructive",
      waived: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Benefit Enrollments</h1>
              <p className="text-muted-foreground">Manage employee benefit enrollments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canManage && (
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {canManage && (
              <Button onClick={openCreate} disabled={plans.length === 0}>
                <Plus className="h-4 w-4 mr-2" /> Add Enrollment
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : enrollments.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No enrollments found</TableCell></TableRow>
              ) : enrollments.map(enr => (
                <TableRow key={enr.id}>
                  <TableCell className="font-medium">{enr.profiles?.full_name}</TableCell>
                  <TableCell>{enr.benefit_plans?.name}</TableCell>
                  <TableCell className="capitalize">{enr.coverage_level?.replace('+', ' + ')}</TableCell>
                  <TableCell>{enr.effective_date}</TableCell>
                  <TableCell>{getStatusBadge(enr.status)}</TableCell>
                  <TableCell className="capitalize">{enr.enrollment_source?.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {canManage && enr.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(enr.id)} title="Approve">
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleReject(enr.id)} title="Reject">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {canManage && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(enr)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEnrollment ? "Edit Enrollment" : "New Enrollment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={formData.employee_id} onValueChange={v => setFormData({...formData, employee_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Benefit Plan *</Label>
                <Select value={formData.plan_id} onValueChange={handlePlanChange}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Coverage Level</Label>
                <Select value={formData.coverage_level} onValueChange={v => setFormData({...formData, coverage_level: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COVERAGE_LEVELS.map(l => <SelectItem key={l} value={l} className="capitalize">{l.replace('+', ' + ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enrollment Source</Label>
                <Select value={formData.enrollment_source} onValueChange={v => setFormData({...formData, enrollment_source: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENROLLMENT_SOURCES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Enrollment Date</Label>
                <Input type="date" value={formData.enrollment_date} onChange={e => setFormData({...formData, enrollment_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Effective Date *</Label>
                <Input type="date" value={formData.effective_date} onChange={e => setFormData({...formData, effective_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Termination Date</Label>
                <Input type="date" value={formData.termination_date} onChange={e => setFormData({...formData, termination_date: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee Contribution</Label>
                <Input type="number" value={formData.employee_contribution} onChange={e => setFormData({...formData, employee_contribution: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Employer Contribution</Label>
                <Input type="number" value={formData.employer_contribution} onChange={e => setFormData({...formData, employer_contribution: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingEnrollment ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
