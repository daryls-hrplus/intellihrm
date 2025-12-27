import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
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
  Users,
  ArrowLeftRight,
  Megaphone,
  Copy,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  Gavel,
  Calendar
} from "lucide-react";
import { ShiftSwapRequestsTab } from "@/components/time-attendance/shifts/ShiftSwapRequestsTab";
import { OpenShiftBoardTab } from "@/components/time-attendance/shifts/OpenShiftBoardTab";
import { ShiftTemplatesTab } from "@/components/time-attendance/shifts/ShiftTemplatesTab";
import { RotationPatternsTab } from "@/components/time-attendance/shifts/RotationPatternsTab";
import { FatigueManagementTab } from "@/components/time-attendance/shifts/FatigueManagementTab";
import { ShiftCoverageTab } from "@/components/time-attendance/shifts/ShiftCoverageTab";
import { ShiftBiddingTab } from "@/components/time-attendance/shifts/ShiftBiddingTab";
import { ShiftCalendarTab } from "@/components/time-attendance/shifts/ShiftCalendarTab";

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
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("calendar");
  
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
    start_date: getTodayString(),
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
    effective_date: getTodayString(),
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
      toast.error(t("common.error"));
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
      toast.error(t("common.fillRequired"));
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
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(editingShift ? t("timeAttendance.shifts.shiftUpdated") : t("timeAttendance.shifts.shiftCreated"));
    setShiftDialogOpen(false);
    resetShiftForm();
    loadShifts();
  };

  const handleDeleteShift = async (id: string) => {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("timeAttendance.shifts.shiftDeleted"));
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
      start_date: getTodayString(),
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
      toast.error(t("common.fillRequired"));
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
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(editingRounding ? t("timeAttendance.shifts.roundingRuleUpdated") : t("timeAttendance.shifts.roundingRuleCreated"));
    setRoundingDialogOpen(false);
    resetRoundingForm();
    loadRoundingRules();
  };

  const handleDeleteRounding = async (id: string) => {
    const { error } = await supabase.from('shift_rounding_rules').delete().eq('id', id);
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("timeAttendance.shifts.roundingRuleDeleted"));
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
      toast.error(t("common.fillRequired"));
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
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(editingPayment ? t("timeAttendance.shifts.paymentRuleUpdated") : t("timeAttendance.shifts.paymentRuleCreated"));
    setPaymentDialogOpen(false);
    resetPaymentForm();
    loadPaymentRules();
  };

  const handleDeletePayment = async (id: string) => {
    const { error } = await supabase.from('shift_payment_rules').delete().eq('id', id);
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("timeAttendance.shifts.paymentRuleDeleted"));
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
      toast.error(t("common.fillRequired"));
      return;
    }

    const { error } = await supabase.from('employee_shift_assignments').insert({
      company_id: selectedCompany,
      employee_id: assignmentForm.employee_id,
      shift_id: assignmentForm.shift_id,
      effective_date: assignmentForm.effective_date,
      end_date: assignmentForm.end_date || null,
      is_primary: assignmentForm.is_primary,
      rotation_pattern: assignmentForm.rotation_pattern || null,
      notes: assignmentForm.notes || null
    });

    if (error) {
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(t("common.success"));
    setAssignmentDialogOpen(false);
    setAssignmentForm({
      employee_id: "",
      shift_id: "",
      effective_date: getTodayString(),
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
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("common.success"));
    loadAssignments();
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
            { label: t("timeAttendance.title"), href: "/time-attendance" },
            { label: t("timeAttendance.shifts.title") }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("timeAttendance.shifts.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("timeAttendance.shifts.subtitle")}
              </p>
            </div>
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("timeAttendance.shifts.shiftsTab")}</p>
                <p className="text-xl font-semibold">{shifts.filter(s => s.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                <Timer className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("timeAttendance.shifts.roundingRules")}</p>
                <p className="text-xl font-semibold">{roundingRules.filter(r => r.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("timeAttendance.shifts.paymentRules")}</p>
                <p className="text-xl font-semibold">{paymentRules.filter(r => r.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("timeAttendance.shifts.assignments")}</p>
                <p className="text-xl font-semibold">{assignments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("timeAttendance.shifts.calendar")}
            </TabsTrigger>
            <TabsTrigger value="shifts" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("timeAttendance.shifts.shiftsTab")}
            </TabsTrigger>
            <TabsTrigger value="rounding" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              {t("timeAttendance.shifts.roundingRules")}
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("timeAttendance.shifts.paymentRules")}
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("timeAttendance.shifts.assignments")}
            </TabsTrigger>
            <TabsTrigger value="swaps" className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              {t("timeAttendance.shifts.swapRequests")}
            </TabsTrigger>
            <TabsTrigger value="openShifts" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              {t("timeAttendance.shifts.openShifts")}
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              {t("timeAttendance.shifts.templates")}
            </TabsTrigger>
            <TabsTrigger value="rotations" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              {t("timeAttendance.shifts.rotations")}
            </TabsTrigger>
            <TabsTrigger value="fatigue" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t("timeAttendance.shifts.fatigue")}
            </TabsTrigger>
            <TabsTrigger value="coverage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("timeAttendance.shifts.coverage")}
            </TabsTrigger>
            <TabsTrigger value="bidding" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              {t("timeAttendance.shifts.bidding")}
            </TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <ShiftCalendarTab companyId={selectedCompany} />
          </TabsContent>

          {/* Shifts Tab */}
          <TabsContent value="shifts" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetShiftForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("timeAttendance.shifts.createShift")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingShift ? t("common.edit") : t("timeAttendance.shifts.createShift")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("common.name")} *</Label>
                        <Input 
                          value={shiftForm.name} 
                          onChange={(e) => setShiftForm({...shiftForm, name: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("common.code")} *</Label>
                        <Input 
                          value={shiftForm.code} 
                          onChange={(e) => setShiftForm({...shiftForm, code: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.description")}</Label>
                      <Textarea 
                        value={shiftForm.description} 
                        onChange={(e) => setShiftForm({...shiftForm, description: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.schedules.startTime")}</Label>
                        <Input 
                          type="time"
                          value={shiftForm.start_time} 
                          onChange={(e) => setShiftForm({...shiftForm, start_time: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.schedules.endTime")}</Label>
                        <Input 
                          type="time"
                          value={shiftForm.end_time} 
                          onChange={(e) => setShiftForm({...shiftForm, end_time: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.schedules.breakDuration")}</Label>
                        <Input 
                          type="number"
                          value={shiftForm.break_duration_minutes} 
                          onChange={(e) => setShiftForm({...shiftForm, break_duration_minutes: parseInt(e.target.value) || 0})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.minimumHours")}</Label>
                        <Input 
                          type="number"
                          value={shiftForm.minimum_hours} 
                          onChange={(e) => setShiftForm({...shiftForm, minimum_hours: parseInt(e.target.value) || 0})} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("common.startDate")}</Label>
                        <Input 
                          type="date"
                          value={shiftForm.start_date} 
                          onChange={(e) => setShiftForm({...shiftForm, start_date: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("common.endDate")}</Label>
                        <Input 
                          type="date"
                          value={shiftForm.end_date} 
                          onChange={(e) => setShiftForm({...shiftForm, end_date: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.color")}</Label>
                      <Input 
                        type="color"
                        value={shiftForm.color} 
                        onChange={(e) => setShiftForm({...shiftForm, color: e.target.value})} 
                        className="h-10"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <Label>{t("timeAttendance.shifts.crossesMidnight")}</Label>
                        <Switch 
                          checked={shiftForm.crosses_midnight} 
                          onCheckedChange={(v) => setShiftForm({...shiftForm, crosses_midnight: v})} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>{t("common.active")}</Label>
                        <Switch 
                          checked={shiftForm.is_active} 
                          onCheckedChange={(v) => setShiftForm({...shiftForm, is_active: v})} 
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveShift} className="w-full">{t("common.save")}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("timeAttendance.shifts.shiftsTab")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.code")}</TableHead>
                      <TableHead>{t("common.time")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.break")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {t("timeAttendance.shifts.noShifts")}
                        </TableCell>
                      </TableRow>
                    ) : shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: shift.color }}
                            />
                            <span className="font-medium">{shift.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{shift.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {shift.is_overnight ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                            {shift.start_time} - {shift.end_time}
                          </div>
                        </TableCell>
                        <TableCell>{shift.break_duration_minutes} min</TableCell>
                        <TableCell>
                          <Badge className={shift.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                            {shift.is_active ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditShift(shift)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)}>
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
          </TabsContent>

          {/* Rounding Rules Tab */}
          <TabsContent value="rounding" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={roundingDialogOpen} onOpenChange={setRoundingDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetRoundingForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("timeAttendance.shifts.createRoundingRule")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRounding ? t("common.edit") : t("timeAttendance.shifts.createRoundingRule")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t("common.name")} *</Label>
                      <Input 
                        value={roundingForm.name} 
                        onChange={(e) => setRoundingForm({...roundingForm, name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.description")}</Label>
                      <Textarea 
                        value={roundingForm.description} 
                        onChange={(e) => setRoundingForm({...roundingForm, description: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.timeTracking.shift")}</Label>
                      <Select value={roundingForm.shift_id} onValueChange={(v) => setRoundingForm({...roundingForm, shift_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.all")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t("common.all")}</SelectItem>
                          {shifts.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.ruleType")}</Label>
                        <Select value={roundingForm.rule_type} onValueChange={(v) => setRoundingForm({...roundingForm, rule_type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="both">Both</SelectItem>
                            <SelectItem value="clock_in">Clock In</SelectItem>
                            <SelectItem value="clock_out">Clock Out</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.roundingInterval")}</Label>
                        <Select 
                          value={roundingForm.rounding_interval.toString()} 
                          onValueChange={(v) => setRoundingForm({...roundingForm, rounding_interval: parseInt(v)})}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 min</SelectItem>
                            <SelectItem value="6">6 min</SelectItem>
                            <SelectItem value="10">10 min</SelectItem>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.roundingDirection")}</Label>
                        <Select value={roundingForm.rounding_direction} onValueChange={(v) => setRoundingForm({...roundingForm, rounding_direction: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nearest">Nearest</SelectItem>
                            <SelectItem value="up">Up</SelectItem>
                            <SelectItem value="down">Down</SelectItem>
                            <SelectItem value="employer_favor">Employer Favor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.gracePeriod")} (min)</Label>
                        <Input 
                          type="number"
                          value={roundingForm.grace_period_minutes} 
                          onChange={(e) => setRoundingForm({...roundingForm, grace_period_minutes: parseInt(e.target.value) || 0})} 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("timeAttendance.shifts.applyToOvertime")}</Label>
                      <Switch 
                        checked={roundingForm.apply_to_overtime} 
                        onCheckedChange={(v) => setRoundingForm({...roundingForm, apply_to_overtime: v})} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("common.active")}</Label>
                      <Switch 
                        checked={roundingForm.is_active} 
                        onCheckedChange={(v) => setRoundingForm({...roundingForm, is_active: v})} 
                      />
                    </div>
                    <Button onClick={handleSaveRounding} className="w-full">{t("common.save")}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("timeAttendance.shifts.roundingRules")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("timeAttendance.timeTracking.shift")}</TableHead>
                      <TableHead>{t("timeAttendance.shifts.ruleType")}</TableHead>
                      <TableHead>{t("timeAttendance.shifts.roundingInterval")}</TableHead>
                      <TableHead>{t("timeAttendance.shifts.roundingDirection")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roundingRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {t("timeAttendance.shifts.noRoundingRules")}
                        </TableCell>
                      </TableRow>
                    ) : roundingRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.shift?.name || t("common.all")}</TableCell>
                        <TableCell className="capitalize">{rule.rule_type.replace('_', ' ')}</TableCell>
                        <TableCell>{rule.rounding_interval} min</TableCell>
                        <TableCell className="capitalize">{rule.rounding_direction}</TableCell>
                        <TableCell>
                          <Badge className={rule.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                            {rule.is_active ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditRounding(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRounding(rule.id)}>
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
          </TabsContent>

          {/* Payment Rules Tab */}
          <TabsContent value="payment" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetPaymentForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("timeAttendance.shifts.createPaymentRule")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPayment ? t("common.edit") : t("timeAttendance.shifts.createPaymentRule")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("common.name")} *</Label>
                        <Input 
                          value={paymentForm.name} 
                          onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("common.code")} *</Label>
                        <Input 
                          value={paymentForm.code} 
                          onChange={(e) => setPaymentForm({...paymentForm, code: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.description")}</Label>
                      <Textarea 
                        value={paymentForm.description} 
                        onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.timeTracking.shift")}</Label>
                      <Select value={paymentForm.shift_id} onValueChange={(v) => setPaymentForm({...paymentForm, shift_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.all")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t("common.all")}</SelectItem>
                          {shifts.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.paymentType")}</Label>
                        <Select value={paymentForm.payment_type} onValueChange={(v) => setPaymentForm({...paymentForm, payment_type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">{t("common.percentage")}</SelectItem>
                            <SelectItem value="fixed">{t("common.amount")}</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.amount")}</Label>
                        <Input 
                          type="number"
                          value={paymentForm.amount} 
                          onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.appliesTo")}</Label>
                        <Select value={paymentForm.applies_to} onValueChange={(v) => setPaymentForm({...paymentForm, applies_to: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_hours">All Hours</SelectItem>
                            <SelectItem value="overtime">Overtime Only</SelectItem>
                            <SelectItem value="night">Night Hours</SelectItem>
                            <SelectItem value="weekend">Weekend</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.shifts.priority")}</Label>
                        <Input 
                          type="number"
                          value={paymentForm.priority} 
                          onChange={(e) => setPaymentForm({...paymentForm, priority: parseInt(e.target.value) || 0})} 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("timeAttendance.shifts.taxable")}</Label>
                      <Switch 
                        checked={paymentForm.is_taxable} 
                        onCheckedChange={(v) => setPaymentForm({...paymentForm, is_taxable: v})} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("common.active")}</Label>
                      <Switch 
                        checked={paymentForm.is_active} 
                        onCheckedChange={(v) => setPaymentForm({...paymentForm, is_active: v})} 
                      />
                    </div>
                    <Button onClick={handleSavePayment} className="w-full">{t("common.save")}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("timeAttendance.shifts.paymentRules")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("timeAttendance.timeTracking.shift")}</TableHead>
                      <TableHead>{t("common.type")}</TableHead>
                      <TableHead>{t("timeAttendance.shifts.amount")}</TableHead>
                      <TableHead>{t("timeAttendance.shifts.appliesTo")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {t("timeAttendance.shifts.noPaymentRules")}
                        </TableCell>
                      </TableRow>
                    ) : paymentRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.shift?.name || t("common.all")}</TableCell>
                        <TableCell className="capitalize">{rule.payment_type}</TableCell>
                        <TableCell>
                          {rule.payment_type === 'percentage' ? `${rule.amount}%` : `$${rule.amount}`}
                        </TableCell>
                        <TableCell className="capitalize">{rule.applies_to.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Badge className={rule.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                            {rule.is_active ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditPayment(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(rule.id)}>
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
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("timeAttendance.schedules.assignSchedule")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("timeAttendance.schedules.assignSchedule")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t("common.employee")} *</Label>
                      <Select value={assignmentForm.employee_id} onValueChange={(v) => setAssignmentForm({...assignmentForm, employee_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.selectEmployee")} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.timeTracking.shift")} *</Label>
                      <Select value={assignmentForm.shift_id} onValueChange={(v) => setAssignmentForm({...assignmentForm, shift_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("common.startDate")}</Label>
                        <Input 
                          type="date"
                          value={assignmentForm.effective_date} 
                          onChange={(e) => setAssignmentForm({...assignmentForm, effective_date: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("common.endDate")}</Label>
                        <Input 
                          type="date"
                          value={assignmentForm.end_date} 
                          onChange={(e) => setAssignmentForm({...assignmentForm, end_date: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("timeAttendance.schedules.primary")}</Label>
                      <Switch 
                        checked={assignmentForm.is_primary} 
                        onCheckedChange={(v) => setAssignmentForm({...assignmentForm, is_primary: v})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.notes")}</Label>
                      <Textarea 
                        value={assignmentForm.notes} 
                        onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})} 
                      />
                    </div>
                    <Button onClick={handleSaveAssignment} className="w-full">{t("common.save")}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("timeAttendance.shifts.assignments")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.employee")}</TableHead>
                      <TableHead>{t("timeAttendance.timeTracking.shift")}</TableHead>
                      <TableHead>{t("common.startDate")}</TableHead>
                      <TableHead>{t("common.endDate")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.primary")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {t("timeAttendance.schedules.noAssignments")}
                        </TableCell>
                      </TableRow>
                    ) : assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.profile?.full_name}</TableCell>
                        <TableCell>
                          {assignment.shift?.name} ({assignment.shift?.code})
                        </TableCell>
                        <TableCell>{formatDateForDisplay(assignment.effective_date, 'MMM d, yyyy')}</TableCell>
                        <TableCell>{assignment.end_date ? formatDateForDisplay(assignment.end_date, 'MMM d, yyyy') : '-'}</TableCell>
                        <TableCell>
                          {assignment.is_primary && (
                            <Badge className="bg-primary/20 text-primary">{t("timeAttendance.schedules.primary")}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assignment.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Swap Requests Tab */}
          <TabsContent value="swaps" className="space-y-4">
            <ShiftSwapRequestsTab companyId={selectedCompany} />
          </TabsContent>

          {/* Open Shifts Tab */}
          <TabsContent value="openShifts" className="space-y-4">
            <OpenShiftBoardTab companyId={selectedCompany} />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <ShiftTemplatesTab companyId={selectedCompany} />
          </TabsContent>

          {/* Rotation Patterns Tab */}
          <TabsContent value="rotations" className="space-y-4">
            <RotationPatternsTab companyId={selectedCompany} />
          </TabsContent>

          {/* Fatigue Management Tab */}
          <TabsContent value="fatigue" className="space-y-4">
            <FatigueManagementTab companyId={selectedCompany} />
          </TabsContent>

          {/* Coverage Analysis Tab */}
          <TabsContent value="coverage" className="space-y-4">
            <ShiftCoverageTab companyId={selectedCompany} />
          </TabsContent>

          {/* Bidding Tab */}
          <TabsContent value="bidding" className="space-y-4">
            <ShiftBiddingTab companyId={selectedCompany} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}