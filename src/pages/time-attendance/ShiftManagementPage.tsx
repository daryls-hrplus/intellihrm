import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  Sun,
  Moon,
  Timer,
  DollarSign,
  Settings,
  Users
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  start_time: string;
  end_time: string;
  crosses_midnight: boolean;
  break_duration_minutes: number;
  minimum_hours: number;
  is_overnight: boolean;
  color: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

interface RoundingRule {
  id: string;
  company_id: string;
  shift_id: string | null;
  name: string;
  description: string | null;
  rule_type: string;
  rounding_interval: number;
  rounding_direction: string;
  grace_period_minutes: number;
  grace_period_direction: string | null;
  apply_to_overtime: boolean;
  is_active: boolean;
  shift?: { name: string } | null;
}

interface PaymentRule {
  id: string;
  company_id: string;
  shift_id: string | null;
  name: string;
  code: string;
  description: string | null;
  payment_type: string;
  amount: number;
  applies_to: string;
  day_of_week: number[] | null;
  start_time: string | null;
  end_time: string | null;
  minimum_hours_threshold: number | null;
  is_taxable: boolean;
  is_active: boolean;
  priority: number;
  shift?: { name: string } | null;
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

export default function ShiftManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("shifts");
  
  // Shifts
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftForm, setShiftForm] = useState({
    name: "",
    code: "",
    description: "",
    start_time: "09:00",
    end_time: "17:00",
    crosses_midnight: false,
    break_duration_minutes: 60,
    minimum_hours: 8,
    is_overnight: false,
    color: "#3b82f6",
    is_active: true,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: ""
  });
  
  // Rounding Rules
  const [roundingRules, setRoundingRules] = useState<RoundingRule[]>([]);
  const [roundingDialogOpen, setRoundingDialogOpen] = useState(false);
  const [editingRounding, setEditingRounding] = useState<RoundingRule | null>(null);
  const [roundingForm, setRoundingForm] = useState({
    name: "",
    description: "",
    shift_id: "",
    rule_type: "both",
    rounding_interval: 15,
    rounding_direction: "nearest",
    grace_period_minutes: 5,
    grace_period_direction: "both",
    apply_to_overtime: true,
    is_active: true
  });
  
  // Payment Rules
  const [paymentRules, setPaymentRules] = useState<PaymentRule[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRule | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    code: "",
    description: "",
    shift_id: "",
    payment_type: "percentage",
    amount: 0,
    applies_to: "all_hours",
    day_of_week: [] as number[],
    start_time: "",
    end_time: "",
    minimum_hours_threshold: "",
    is_taxable: true,
    is_active: true,
    priority: 0
  });
  
  // Assignments
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [assignmentForm, setAssignmentForm] = useState({
    employee_id: "",
    shift_id: "",
    effective_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: "",
    is_primary: true,
    rotation_pattern: "",
    notes: ""
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadAllData();
    }
  }, [selectedCompany]);

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
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const loadAllData = async () => {
    await Promise.all([
      loadShifts(),
      loadRoundingRules(),
      loadPaymentRules(),
      loadAssignments(),
      loadEmployees()
    ]);
  };

  const loadShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('company_id', selectedCompany)
      .order('name');
    
    if (error) {
      console.error("Failed to load shifts:", error);
      return;
    }
    setShifts(data || []);
  };

  const loadRoundingRules = async () => {
    const { data, error } = await supabase
      .from('shift_rounding_rules')
      .select('*, shift:shifts(name)')
      .eq('company_id', selectedCompany)
      .order('name');
    
    if (error) {
      console.error("Failed to load rounding rules:", error);
      return;
    }
    setRoundingRules(data || []);
  };

  const loadPaymentRules = async () => {
    const { data, error } = await supabase
      .from('shift_payment_rules')
      .select('*, shift:shifts(name)')
      .eq('company_id', selectedCompany)
      .order('priority', { ascending: false });
    
    if (error) {
      console.error("Failed to load payment rules:", error);
      return;
    }
    setPaymentRules(data || []);
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

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .order('full_name');
    setEmployees(data || []);
  };

  // Shift CRUD
  const handleSaveShift = async () => {
    if (!shiftForm.name || !shiftForm.code) {
      toast.error("Name and code are required");
      return;
    }

    const payload = {
      company_id: selectedCompany,
      name: shiftForm.name,
      code: shiftForm.code,
      description: shiftForm.description || null,
      start_time: shiftForm.start_time,
      end_time: shiftForm.end_time,
      crosses_midnight: shiftForm.crosses_midnight,
      break_duration_minutes: shiftForm.break_duration_minutes,
      minimum_hours: shiftForm.minimum_hours,
      is_overnight: shiftForm.is_overnight,
      color: shiftForm.color,
      is_active: shiftForm.is_active,
      start_date: shiftForm.start_date,
      end_date: shiftForm.end_date || null
    };

    let error;
    if (editingShift) {
      ({ error } = await supabase.from('shifts').update(payload).eq('id', editingShift.id));
    } else {
      ({ error } = await supabase.from('shifts').insert(payload));
    }

    if (error) {
      toast.error("Failed to save shift");
      console.error(error);
      return;
    }

    toast.success(editingShift ? "Shift updated" : "Shift created");
    setShiftDialogOpen(false);
    resetShiftForm();
    loadShifts();
  };

  const handleDeleteShift = async (id: string) => {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete shift");
      return;
    }
    toast.success("Shift deleted");
    loadShifts();
  };

  const resetShiftForm = () => {
    setEditingShift(null);
    setShiftForm({
      name: "",
      code: "",
      description: "",
      start_time: "09:00",
      end_time: "17:00",
      crosses_midnight: false,
      break_duration_minutes: 60,
      minimum_hours: 8,
      is_overnight: false,
      color: "#3b82f6",
      is_active: true,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: ""
    });
  };

  const openEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      code: shift.code,
      description: shift.description || "",
      start_time: shift.start_time,
      end_time: shift.end_time,
      crosses_midnight: shift.crosses_midnight,
      break_duration_minutes: shift.break_duration_minutes,
      minimum_hours: shift.minimum_hours,
      is_overnight: shift.is_overnight,
      color: shift.color,
      is_active: shift.is_active,
      start_date: shift.start_date,
      end_date: shift.end_date || ""
    });
    setShiftDialogOpen(true);
  };

  // Rounding Rule CRUD
  const handleSaveRounding = async () => {
    if (!roundingForm.name) {
      toast.error("Name is required");
      return;
    }

    const payload = {
      company_id: selectedCompany,
      name: roundingForm.name,
      description: roundingForm.description || null,
      shift_id: roundingForm.shift_id || null,
      rule_type: roundingForm.rule_type,
      rounding_interval: roundingForm.rounding_interval,
      rounding_direction: roundingForm.rounding_direction,
      grace_period_minutes: roundingForm.grace_period_minutes,
      grace_period_direction: roundingForm.grace_period_direction || null,
      apply_to_overtime: roundingForm.apply_to_overtime,
      is_active: roundingForm.is_active
    };

    let error;
    if (editingRounding) {
      ({ error } = await supabase.from('shift_rounding_rules').update(payload).eq('id', editingRounding.id));
    } else {
      ({ error } = await supabase.from('shift_rounding_rules').insert(payload));
    }

    if (error) {
      toast.error("Failed to save rounding rule");
      console.error(error);
      return;
    }

    toast.success(editingRounding ? "Rounding rule updated" : "Rounding rule created");
    setRoundingDialogOpen(false);
    resetRoundingForm();
    loadRoundingRules();
  };

  const handleDeleteRounding = async (id: string) => {
    const { error } = await supabase.from('shift_rounding_rules').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete rounding rule");
      return;
    }
    toast.success("Rounding rule deleted");
    loadRoundingRules();
  };

  const resetRoundingForm = () => {
    setEditingRounding(null);
    setRoundingForm({
      name: "",
      description: "",
      shift_id: "",
      rule_type: "both",
      rounding_interval: 15,
      rounding_direction: "nearest",
      grace_period_minutes: 5,
      grace_period_direction: "both",
      apply_to_overtime: true,
      is_active: true
    });
  };

  const openEditRounding = (rule: RoundingRule) => {
    setEditingRounding(rule);
    setRoundingForm({
      name: rule.name,
      description: rule.description || "",
      shift_id: rule.shift_id || "",
      rule_type: rule.rule_type,
      rounding_interval: rule.rounding_interval,
      rounding_direction: rule.rounding_direction,
      grace_period_minutes: rule.grace_period_minutes,
      grace_period_direction: rule.grace_period_direction || "both",
      apply_to_overtime: rule.apply_to_overtime,
      is_active: rule.is_active
    });
    setRoundingDialogOpen(true);
  };

  // Payment Rule CRUD
  const handleSavePayment = async () => {
    if (!paymentForm.name || !paymentForm.code) {
      toast.error("Name and code are required");
      return;
    }

    const payload = {
      company_id: selectedCompany,
      name: paymentForm.name,
      code: paymentForm.code,
      description: paymentForm.description || null,
      shift_id: paymentForm.shift_id || null,
      payment_type: paymentForm.payment_type,
      amount: paymentForm.amount,
      applies_to: paymentForm.applies_to,
      day_of_week: paymentForm.day_of_week.length > 0 ? paymentForm.day_of_week : null,
      start_time: paymentForm.start_time || null,
      end_time: paymentForm.end_time || null,
      minimum_hours_threshold: paymentForm.minimum_hours_threshold ? parseFloat(paymentForm.minimum_hours_threshold) : null,
      is_taxable: paymentForm.is_taxable,
      is_active: paymentForm.is_active,
      priority: paymentForm.priority
    };

    let error;
    if (editingPayment) {
      ({ error } = await supabase.from('shift_payment_rules').update(payload).eq('id', editingPayment.id));
    } else {
      ({ error } = await supabase.from('shift_payment_rules').insert(payload));
    }

    if (error) {
      toast.error("Failed to save payment rule");
      console.error(error);
      return;
    }

    toast.success(editingPayment ? "Payment rule updated" : "Payment rule created");
    setPaymentDialogOpen(false);
    resetPaymentForm();
    loadPaymentRules();
  };

  const handleDeletePayment = async (id: string) => {
    const { error } = await supabase.from('shift_payment_rules').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete payment rule");
      return;
    }
    toast.success("Payment rule deleted");
    loadPaymentRules();
  };

  const resetPaymentForm = () => {
    setEditingPayment(null);
    setPaymentForm({
      name: "",
      code: "",
      description: "",
      shift_id: "",
      payment_type: "percentage",
      amount: 0,
      applies_to: "all_hours",
      day_of_week: [],
      start_time: "",
      end_time: "",
      minimum_hours_threshold: "",
      is_taxable: true,
      is_active: true,
      priority: 0
    });
  };

  const openEditPayment = (rule: PaymentRule) => {
    setEditingPayment(rule);
    setPaymentForm({
      name: rule.name,
      code: rule.code,
      description: rule.description || "",
      shift_id: rule.shift_id || "",
      payment_type: rule.payment_type,
      amount: rule.amount,
      applies_to: rule.applies_to,
      day_of_week: rule.day_of_week || [],
      start_time: rule.start_time || "",
      end_time: rule.end_time || "",
      minimum_hours_threshold: rule.minimum_hours_threshold?.toString() || "",
      is_taxable: rule.is_taxable,
      is_active: rule.is_active,
      priority: rule.priority
    });
    setPaymentDialogOpen(true);
  };

  // Assignment CRUD
  const handleSaveAssignment = async () => {
    if (!assignmentForm.employee_id || !assignmentForm.shift_id) {
      toast.error("Employee and shift are required");
      return;
    }

    const payload = {
      company_id: selectedCompany,
      employee_id: assignmentForm.employee_id,
      shift_id: assignmentForm.shift_id,
      effective_date: assignmentForm.effective_date,
      end_date: assignmentForm.end_date || null,
      is_primary: assignmentForm.is_primary,
      rotation_pattern: assignmentForm.rotation_pattern || null,
      notes: assignmentForm.notes || null
    };

    const { error } = await supabase.from('employee_shift_assignments').insert(payload);

    if (error) {
      toast.error("Failed to assign shift");
      console.error(error);
      return;
    }

    toast.success("Shift assigned");
    setAssignmentDialogOpen(false);
    setAssignmentForm({
      employee_id: "",
      shift_id: "",
      effective_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: "",
      is_primary: true,
      rotation_pattern: "",
      notes: ""
    });
    loadAssignments();
  };

  const handleDeleteAssignment = async (id: string) => {
    const { error } = await supabase.from('employee_shift_assignments').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete assignment");
      return;
    }
    toast.success("Assignment deleted");
    loadAssignments();
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
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
        <Breadcrumbs 
          items={[
            { label: "Time & Attendance", href: "/time-attendance" },
            { label: "Shift Management" }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Shift Management
              </h1>
              <p className="text-muted-foreground">
                Configure shifts, rounding rules, and payment differentials
              </p>
            </div>
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shifts" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Shifts
            </TabsTrigger>
            <TabsTrigger value="rounding" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Rounding Rules
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Rules
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assignments
            </TabsTrigger>
          </TabsList>

          {/* Shifts Tab */}
          <TabsContent value="shifts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Work Shifts</CardTitle>
                  <CardDescription>Define shift schedules and timings</CardDescription>
                </div>
                <Dialog open={shiftDialogOpen} onOpenChange={(open) => { setShiftDialogOpen(open); if (!open) resetShiftForm(); }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Shift
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingShift ? "Edit Shift" : "Add Shift"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input 
                            value={shiftForm.name}
                            onChange={(e) => setShiftForm({...shiftForm, name: e.target.value})}
                            placeholder="Day Shift"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Code *</Label>
                          <Input 
                            value={shiftForm.code}
                            onChange={(e) => setShiftForm({...shiftForm, code: e.target.value})}
                            placeholder="DAY"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={shiftForm.description}
                          onChange={(e) => setShiftForm({...shiftForm, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input 
                            type="time"
                            value={shiftForm.start_time}
                            onChange={(e) => setShiftForm({...shiftForm, start_time: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input 
                            type="time"
                            value={shiftForm.end_time}
                            onChange={(e) => setShiftForm({...shiftForm, end_time: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Break Duration (min)</Label>
                          <Input 
                            type="number"
                            value={shiftForm.break_duration_minutes}
                            onChange={(e) => setShiftForm({...shiftForm, break_duration_minutes: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Minimum Hours</Label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={shiftForm.minimum_hours}
                            onChange={(e) => setShiftForm({...shiftForm, minimum_hours: parseFloat(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Input 
                            type="color"
                            value={shiftForm.color}
                            onChange={(e) => setShiftForm({...shiftForm, color: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input 
                            type="date"
                            value={shiftForm.start_date}
                            onChange={(e) => setShiftForm({...shiftForm, start_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={shiftForm.crosses_midnight}
                            onCheckedChange={(c) => setShiftForm({...shiftForm, crosses_midnight: c})}
                          />
                          <Label>Crosses Midnight</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={shiftForm.is_overnight}
                            onCheckedChange={(c) => setShiftForm({...shiftForm, is_overnight: c})}
                          />
                          <Label>Overnight Shift</Label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={shiftForm.is_active}
                          onCheckedChange={(c) => setShiftForm({...shiftForm, is_active: c})}
                        />
                        <Label>Active</Label>
                      </div>
                      <Button onClick={handleSaveShift} className="w-full">
                        {editingShift ? "Update Shift" : "Create Shift"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shift</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Break</TableHead>
                      <TableHead>Min Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No shifts defined
                        </TableCell>
                      </TableRow>
                    ) : (
                      shifts.map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: shift.color }}
                              />
                              <span className="font-medium">{shift.name}</span>
                              {shift.is_overnight && <Moon className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </TableCell>
                          <TableCell>{shift.code}</TableCell>
                          <TableCell>
                            {shift.start_time} - {shift.end_time}
                            {shift.crosses_midnight && <span className="text-xs text-muted-foreground ml-1">(+1)</span>}
                          </TableCell>
                          <TableCell>{shift.break_duration_minutes} min</TableCell>
                          <TableCell>{shift.minimum_hours}h</TableCell>
                          <TableCell>
                            <Badge className={shift.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                              {shift.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditShift(shift)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rounding Rules Tab */}
          <TabsContent value="rounding">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Rounding Rules</CardTitle>
                  <CardDescription>Configure how clock times are rounded</CardDescription>
                </div>
                <Dialog open={roundingDialogOpen} onOpenChange={(open) => { setRoundingDialogOpen(open); if (!open) resetRoundingForm(); }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingRounding ? "Edit Rounding Rule" : "Add Rounding Rule"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input 
                          value={roundingForm.name}
                          onChange={(e) => setRoundingForm({...roundingForm, name: e.target.value})}
                          placeholder="15 Minute Rounding"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={roundingForm.description}
                          onChange={(e) => setRoundingForm({...roundingForm, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Apply to Shift (optional)</Label>
                        <Select 
                          value={roundingForm.shift_id || "__all__"} 
                          onValueChange={(v) => setRoundingForm({...roundingForm, shift_id: v === "__all__" ? "" : v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All shifts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">All shifts</SelectItem>
                            {shifts.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Applies To</Label>
                          <Select 
                            value={roundingForm.rule_type} 
                            onValueChange={(v) => setRoundingForm({...roundingForm, rule_type: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="both">Clock In & Out</SelectItem>
                              <SelectItem value="clock_in">Clock In Only</SelectItem>
                              <SelectItem value="clock_out">Clock Out Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Interval (minutes)</Label>
                          <Select 
                            value={roundingForm.rounding_interval.toString()} 
                            onValueChange={(v) => setRoundingForm({...roundingForm, rounding_interval: parseInt(v)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="6">6 minutes</SelectItem>
                              <SelectItem value="10">10 minutes</SelectItem>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Rounding Direction</Label>
                          <Select 
                            value={roundingForm.rounding_direction} 
                            onValueChange={(v) => setRoundingForm({...roundingForm, rounding_direction: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nearest">Nearest</SelectItem>
                              <SelectItem value="up">Always Up</SelectItem>
                              <SelectItem value="down">Always Down</SelectItem>
                              <SelectItem value="employer_favor">Employer Favorable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Grace Period (minutes)</Label>
                          <Input 
                            type="number"
                            value={roundingForm.grace_period_minutes}
                            onChange={(e) => setRoundingForm({...roundingForm, grace_period_minutes: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={roundingForm.apply_to_overtime}
                            onCheckedChange={(c) => setRoundingForm({...roundingForm, apply_to_overtime: c})}
                          />
                          <Label>Apply to Overtime</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={roundingForm.is_active}
                            onCheckedChange={(c) => setRoundingForm({...roundingForm, is_active: c})}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                      <Button onClick={handleSaveRounding} className="w-full">
                        {editingRounding ? "Update Rule" : "Create Rule"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Applies To</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Grace</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roundingRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No rounding rules defined
                        </TableCell>
                      </TableRow>
                    ) : (
                      roundingRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>{rule.shift?.name || "All shifts"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {rule.rule_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{rule.rounding_interval} min</TableCell>
                          <TableCell className="capitalize">{rule.rounding_direction.replace('_', ' ')}</TableCell>
                          <TableCell>{rule.grace_period_minutes} min</TableCell>
                          <TableCell>
                            <Badge className={rule.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                              {rule.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditRounding(rule)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteRounding(rule.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Rules Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment Rules</CardTitle>
                  <CardDescription>Configure shift differentials and premiums</CardDescription>
                </div>
                <Dialog open={paymentDialogOpen} onOpenChange={(open) => { setPaymentDialogOpen(open); if (!open) resetPaymentForm(); }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingPayment ? "Edit Payment Rule" : "Add Payment Rule"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input 
                            value={paymentForm.name}
                            onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})}
                            placeholder="Night Shift Premium"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Code *</Label>
                          <Input 
                            value={paymentForm.code}
                            onChange={(e) => setPaymentForm({...paymentForm, code: e.target.value})}
                            placeholder="NIGHT_PREM"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={paymentForm.description}
                          onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Apply to Shift (optional)</Label>
                        <Select 
                          value={paymentForm.shift_id || "__all__"} 
                          onValueChange={(v) => setPaymentForm({...paymentForm, shift_id: v === "__all__" ? "" : v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All shifts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">All shifts</SelectItem>
                            {shifts.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Payment Type</Label>
                          <Select 
                            value={paymentForm.payment_type} 
                            onValueChange={(v) => setPaymentForm({...paymentForm, payment_type: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage of Base</SelectItem>
                              <SelectItem value="fixed_hourly">Fixed Hourly Amount</SelectItem>
                              <SelectItem value="fixed_daily">Fixed Daily Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Amount {paymentForm.payment_type === 'percentage' ? '(%)' : '($)'}</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Applies To</Label>
                          <Select 
                            value={paymentForm.applies_to} 
                            onValueChange={(v) => setPaymentForm({...paymentForm, applies_to: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_hours">All Hours</SelectItem>
                              <SelectItem value="regular_only">Regular Hours Only</SelectItem>
                              <SelectItem value="overtime_only">Overtime Only</SelectItem>
                              <SelectItem value="weekend">Weekend Hours</SelectItem>
                              <SelectItem value="holiday">Holiday Hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Input 
                            type="number"
                            value={paymentForm.priority}
                            onChange={(e) => setPaymentForm({...paymentForm, priority: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Apply on Days</Label>
                        <div className="flex gap-2 flex-wrap">
                          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                            <Button
                              key={day}
                              type="button"
                              variant={paymentForm.day_of_week.includes(day) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newDays = paymentForm.day_of_week.includes(day)
                                  ? paymentForm.day_of_week.filter(d => d !== day)
                                  : [...paymentForm.day_of_week, day];
                                setPaymentForm({...paymentForm, day_of_week: newDays});
                              }}
                            >
                              {getDayName(day)}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Leave empty for all days</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Time Range Start</Label>
                          <Input 
                            type="time"
                            value={paymentForm.start_time}
                            onChange={(e) => setPaymentForm({...paymentForm, start_time: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Time Range End</Label>
                          <Input 
                            type="time"
                            value={paymentForm.end_time}
                            onChange={(e) => setPaymentForm({...paymentForm, end_time: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={paymentForm.is_taxable}
                            onCheckedChange={(c) => setPaymentForm({...paymentForm, is_taxable: c})}
                          />
                          <Label>Taxable</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={paymentForm.is_active}
                            onCheckedChange={(c) => setPaymentForm({...paymentForm, is_active: c})}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                      <Button onClick={handleSavePayment} className="w-full">
                        {editingPayment ? "Update Rule" : "Create Rule"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Applies To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No payment rules defined
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>{rule.code}</TableCell>
                          <TableCell>{rule.shift?.name || "All shifts"}</TableCell>
                          <TableCell className="capitalize">{rule.payment_type.replace('_', ' ')}</TableCell>
                          <TableCell>
                            {rule.payment_type === 'percentage' ? `${rule.amount}%` : `$${rule.amount}`}
                          </TableCell>
                          <TableCell className="capitalize">{rule.applies_to.replace('_', ' ')}</TableCell>
                          <TableCell>
                            <Badge className={rule.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                              {rule.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditPayment(rule)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(rule.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Employee Shift Assignments</CardTitle>
                  <CardDescription>Assign employees to shifts</CardDescription>
                </div>
                <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Shift
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Shift to Employee</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Employee *</Label>
                        <Select 
                          value={assignmentForm.employee_id} 
                          onValueChange={(v) => setAssignmentForm({...assignmentForm, employee_id: v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((e) => (
                              <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Shift *</Label>
                        <Select 
                          value={assignmentForm.shift_id} 
                          onValueChange={(v) => setAssignmentForm({...assignmentForm, shift_id: v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {shifts.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Effective Date</Label>
                          <Input 
                            type="date"
                            value={assignmentForm.effective_date}
                            onChange={(e) => setAssignmentForm({...assignmentForm, effective_date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input 
                            type="date"
                            value={assignmentForm.end_date}
                            onChange={(e) => setAssignmentForm({...assignmentForm, end_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Rotation Pattern</Label>
                        <Select 
                          value={assignmentForm.rotation_pattern || "__none__"} 
                          onValueChange={(v) => setAssignmentForm({...assignmentForm, rotation_pattern: v === "__none__" ? "" : v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No rotation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No rotation</SelectItem>
                            <SelectItem value="4on-3off">4 on / 3 off</SelectItem>
                            <SelectItem value="5on-2off">5 on / 2 off</SelectItem>
                            <SelectItem value="weekly-rotate">Weekly Rotation</SelectItem>
                            <SelectItem value="bi-weekly-rotate">Bi-weekly Rotation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={assignmentForm.is_primary}
                          onCheckedChange={(c) => setAssignmentForm({...assignmentForm, is_primary: c})}
                        />
                        <Label>Primary Shift</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea 
                          value={assignmentForm.notes}
                          onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleSaveAssignment} className="w-full">
                        Assign Shift
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Rotation</TableHead>
                      <TableHead>Primary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No shift assignments
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.profile?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {assignment.shift?.name} ({assignment.shift?.code})
                          </TableCell>
                          <TableCell>{format(new Date(assignment.effective_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {assignment.end_date ? format(new Date(assignment.end_date), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell>{assignment.rotation_pattern || '-'}</TableCell>
                          <TableCell>
                            {assignment.is_primary && <Badge className="bg-primary/20 text-primary">Primary</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assignment.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}