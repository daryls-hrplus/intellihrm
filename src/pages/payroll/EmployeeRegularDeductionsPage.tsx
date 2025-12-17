import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Repeat, Search, Target, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";

interface Company {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  full_name: string;
}

interface RegularDeduction {
  id: string;
  employee_id: string;
  deduction_name: string;
  deduction_code: string | null;
  deduction_type: string;
  amount: number;
  currency: string;
  is_pretax: boolean;
  total_cycles: number | null;
  completed_cycles: number;
  goal_amount: number | null;
  amount_deducted: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  auto_stopped_at: string | null;
  stop_reason: string | null;
  reference_number: string | null;
  institution_name: string | null;
  notes: string | null;
  profiles?: { full_name: string };
}

export default function EmployeeRegularDeductionsPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deductions, setDeductions] = useState<RegularDeduction[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: '',
    deduction_name: '',
    deduction_code: '',
    deduction_type: 'voluntary',
    amount: '',
    currency: 'USD',
    is_pretax: false,
    total_cycles: '',
    goal_amount: '',
    frequency: 'monthly',
    start_date: getTodayString(),
    end_date: '',
    reference_number: '',
    institution_name: '',
    notes: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadEmployees();
      loadDeductions();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedCompany) {
      loadDeductions();
    }
  }, [selectedEmployee]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error("Failed to load companies");
      return;
    }
    setCompanies(data || []);
  };

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .order('full_name');
    
    if (error) {
      toast.error("Failed to load employees");
      return;
    }
    setEmployees(data || []);
  };

  const loadDeductions = async () => {
    setIsLoading(true);
    let query = supabase
      .from('employee_regular_deductions')
      .select('*, profiles!employee_regular_deductions_employee_id_fkey(full_name)')
      .eq('company_id', selectedCompany)
      .order('deduction_name');
    
    if (selectedEmployee) {
      query = query.eq('employee_id', selectedEmployee);
    }
    
    const { data, error } = await query;
    
    if (error) {
      toast.error("Failed to load deductions");
      setIsLoading(false);
      return;
    }
    setDeductions(data || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      employee_id: selectedEmployee || '',
      deduction_name: '',
      deduction_code: '',
      deduction_type: 'voluntary',
      amount: '',
      currency: 'USD',
      is_pretax: false,
      total_cycles: '',
      goal_amount: '',
      frequency: 'monthly',
      start_date: getTodayString(),
      end_date: '',
      reference_number: '',
      institution_name: '',
      notes: ''
    });
    setEditingId(null);
  };

  const handleEdit = (deduction: RegularDeduction) => {
    setFormData({
      employee_id: deduction.employee_id,
      deduction_name: deduction.deduction_name,
      deduction_code: deduction.deduction_code || '',
      deduction_type: deduction.deduction_type,
      amount: deduction.amount.toString(),
      currency: deduction.currency,
      is_pretax: deduction.is_pretax,
      total_cycles: deduction.total_cycles?.toString() || '',
      goal_amount: deduction.goal_amount?.toString() || '',
      frequency: deduction.frequency,
      start_date: deduction.start_date,
      end_date: deduction.end_date || '',
      reference_number: deduction.reference_number || '',
      institution_name: deduction.institution_name || '',
      notes: deduction.notes || ''
    });
    setEditingId(deduction.id);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.employee_id || !formData.deduction_name || !formData.amount) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      company_id: selectedCompany,
      employee_id: formData.employee_id,
      deduction_name: formData.deduction_name,
      deduction_code: formData.deduction_code || null,
      deduction_type: formData.deduction_type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      is_pretax: formData.is_pretax,
      total_cycles: formData.total_cycles ? parseInt(formData.total_cycles) : null,
      goal_amount: formData.goal_amount ? parseFloat(formData.goal_amount) : null,
      frequency: formData.frequency,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      reference_number: formData.reference_number || null,
      institution_name: formData.institution_name || null,
      notes: formData.notes || null
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from('employee_regular_deductions')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabase
        .from('employee_regular_deductions')
        .insert(payload));
    }

    if (error) {
      toast.error("Failed to save deduction");
      return;
    }

    toast.success(editingId ? "Deduction updated" : "Deduction added");
    setIsDialogOpen(false);
    resetForm();
    loadDeductions();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('employee_regular_deductions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete deduction");
      return;
    }

    toast.success("Deduction deleted");
    loadDeductions();
  };

  const handleToggleActive = async (deduction: RegularDeduction) => {
    const { error } = await supabase
      .from('employee_regular_deductions')
      .update({ 
        is_active: !deduction.is_active,
        stop_reason: !deduction.is_active ? null : 'manual'
      })
      .eq('id', deduction.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    toast.success(deduction.is_active ? "Deduction deactivated" : "Deduction activated");
    loadDeductions();
  };

  const filteredDeductions = deductions.filter(d => 
    d.deduction_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (deduction: RegularDeduction) => {
    if (!deduction.is_active) {
      if (deduction.stop_reason === 'goal_reached') {
        return <Badge variant="secondary">Goal Reached</Badge>;
      }
      if (deduction.stop_reason === 'cycles_completed') {
        return <Badge variant="secondary">Completed</Badge>;
      }
      return <Badge variant="outline">Inactive</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getProgress = (deduction: RegularDeduction) => {
    if (deduction.goal_amount) {
      const percent = Math.min((deduction.amount_deducted / deduction.goal_amount) * 100, 100);
      return `${deduction.currency} ${deduction.amount_deducted.toFixed(2)} / ${deduction.goal_amount.toFixed(2)} (${percent.toFixed(0)}%)`;
    }
    if (deduction.total_cycles) {
      return `${deduction.completed_cycles} / ${deduction.total_cycles} cycles`;
    }
    return 'Ongoing';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll"), href: "/payroll" },
            { label: "Employee Regular Deductions" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Repeat className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employee Regular Deductions</h1>
            <p className="text-muted-foreground">Manage recurring employee deductions like mortgages, loans, and savings</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Employee (Optional)</Label>
                <Select 
                  value={selectedEmployee || "all"} 
                  onValueChange={(v) => setSelectedEmployee(v === "all" ? "" : v)}
                  disabled={!selectedCompany}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search deductions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 flex items-end">
                <Button 
                  onClick={() => { resetForm(); setIsDialogOpen(true); }}
                  disabled={!selectedCompany}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Deduction
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : !selectedCompany ? (
              <p className="text-center text-muted-foreground py-8">Select a company to view deductions</p>
            ) : filteredDeductions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No regular deductions found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Deduction</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeductions.map((deduction) => (
                    <TableRow key={deduction.id}>
                      <TableCell className="font-medium">
                        {deduction.profiles?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {deduction.deduction_name}
                            <Badge variant="outline" className="text-xs capitalize">
                              {deduction.deduction_type}
                            </Badge>
                          </div>
                          {deduction.institution_name && (
                            <div className="text-xs text-muted-foreground">{deduction.institution_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {deduction.currency} {deduction.amount.toFixed(2)}
                        {deduction.is_pretax && (
                          <Badge variant="outline" className="ml-2 text-xs">Pre-tax</Badge>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{deduction.frequency}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {deduction.goal_amount && <Target className="h-4 w-4 text-muted-foreground" />}
                          {deduction.total_cycles && <Calendar className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-sm">{getProgress(deduction)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(deduction)}</TableCell>
                      <TableCell>{formatDateForDisplay(deduction.start_date, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(deduction)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleActive(deduction)}
                            title={deduction.is_active ? "Deactivate" : "Activate"}
                          >
                            <Repeat className={`h-4 w-4 ${deduction.is_active ? 'text-green-600' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(deduction.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Regular Deduction' : 'Add Regular Deduction'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select 
                  value={formData.employee_id} 
                  onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deduction Name *</Label>
                  <Input
                    value={formData.deduction_name}
                    onChange={(e) => setFormData({ ...formData, deduction_name: e.target.value })}
                    placeholder="e.g., Mortgage Payment"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={formData.deduction_code}
                    onChange={(e) => setFormData({ ...formData, deduction_code: e.target.value })}
                    placeholder="e.g., MORTGAGE"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deduction Type *</Label>
                <Select 
                  value={formData.deduction_type} 
                  onValueChange={(v) => setFormData({ ...formData, deduction_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loan">Loan (e.g., Mortgage, Car Loan)</SelectItem>
                    <SelectItem value="voluntary">Voluntary (e.g., Savings, Union Dues)</SelectItem>
                    <SelectItem value="garnishment">Garnishment (e.g., Court Order)</SelectItem>
                    <SelectItem value="statutory">Statutory (e.g., Legal Requirement)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Institution Name</Label>
                  <Input
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    placeholder="e.g., First National Bank"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    placeholder="e.g., Account #12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(v) => setFormData({ ...formData, currency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="TTD">TTD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(v) => setFormData({ ...formData, frequency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="per-pay-period">Per Pay Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="pretax"
                  checked={formData.is_pretax}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_pretax: !!checked })}
                />
                <Label htmlFor="pretax">Pre-tax Deduction</Label>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Cycle-Based Limit (Optional)
                </h4>
                <div className="space-y-2">
                  <Label>Total Number of Cycles</Label>
                  <Input
                    type="number"
                    value={formData.total_cycles}
                    onChange={(e) => setFormData({ ...formData, total_cycles: e.target.value })}
                    placeholder="Leave empty for indefinite"
                  />
                  <p className="text-xs text-muted-foreground">Deduction will auto-stop after this many pay cycles</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goal-Based Limit (Optional)
                </h4>
                <div className="space-y-2">
                  <Label>Goal Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                    placeholder="Leave empty for no goal"
                  />
                  <p className="text-xs text-muted-foreground">Deduction will auto-stop when total deducted reaches this amount</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
