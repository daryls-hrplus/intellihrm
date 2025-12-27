import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
  Users,
  ArrowLeftRight,
  Megaphone,
  Copy,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  Gavel,
  Calendar,
  Sparkles
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
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
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
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(t("timeAttendance.shifts.assignmentCreated"));
    setAssignmentDialogOpen(false);
    resetAssignmentForm();
    loadAssignments();
  };

  const handleDeleteAssignment = async (id: string) => {
    const { error } = await supabase.from('employee_shift_assignments').delete().eq('id', id);
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("timeAttendance.shifts.assignmentDeleted"));
    loadAssignments();
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      employee_id: "",
      shift_id: "",
      effective_date: getTodayString(),
      end_date: "",
      is_primary: true,
      rotation_pattern: "",
      notes: ""
    });
  };

  const breadcrumbItems = [
    { label: t("nav.timeAttendance"), href: "/time-attendance" },
    { label: t("timeAttendance.modules.shifts.title") }
  ];

  // Navigation cards for sub-pages - First 4 are Shifts, Rounding Rules, Payment Rules, Shift Assignments
  const navigationCards = [
    { title: t("timeAttendance.shifts.shiftsTab"), description: t("timeAttendance.shifts.shiftsTabDescription") || "Manage shift definitions", href: "/time-attendance/shifts/list", icon: Clock, color: "bg-primary/20 text-primary" },
    { title: t("timeAttendance.shifts.roundingRules"), description: t("timeAttendance.shifts.roundingRulesDescription") || "Configure time rounding", href: "/time-attendance/shifts/rounding-rules", icon: Timer, color: "bg-secondary/20 text-secondary" },
    { title: t("timeAttendance.shifts.paymentRules"), description: t("timeAttendance.shifts.paymentRulesDescription") || "Define payment calculations", href: "/time-attendance/shifts/payment-rules", icon: DollarSign, color: "bg-success/20 text-success" },
    { title: t("timeAttendance.shifts.assignments"), description: t("timeAttendance.shifts.assignmentsDescription") || "Assign employees to shifts", href: "/time-attendance/shifts/assignments", icon: Users, color: "bg-warning/20 text-warning" },
    { title: t("timeAttendance.shifts.calendar"), description: t("timeAttendance.shifts.calendarDescription"), href: "/time-attendance/shifts/calendar", icon: Calendar, color: "bg-blue-500/20 text-blue-600" },
    { title: t("timeAttendance.shifts.swapRequests"), description: t("timeAttendance.shifts.swapRequestsDescription"), href: "/time-attendance/shifts/swap-requests", icon: ArrowLeftRight, color: "bg-purple-500/20 text-purple-600" },
    { title: t("timeAttendance.shifts.openShifts"), description: t("timeAttendance.shifts.openShiftsDescription"), href: "/time-attendance/shifts/open-shifts", icon: Megaphone, color: "bg-pink-500/20 text-pink-600" },
    { title: t("timeAttendance.shifts.templates"), description: t("timeAttendance.shifts.templatesDescription"), href: "/time-attendance/shifts/templates", icon: Copy, color: "bg-cyan-500/20 text-cyan-600" },
    { title: t("timeAttendance.shifts.rotations"), description: t("timeAttendance.shifts.rotationsDescription"), href: "/time-attendance/shifts/rotations", icon: RotateCcw, color: "bg-indigo-500/20 text-indigo-600" },
    { title: t("timeAttendance.shifts.fatigue"), description: t("timeAttendance.shifts.fatigueDescription"), href: "/time-attendance/shifts/fatigue", icon: AlertTriangle, color: "bg-red-500/20 text-red-600" },
    { title: t("timeAttendance.shifts.coverage"), description: t("timeAttendance.shifts.coverageDescription"), href: "/time-attendance/shifts/coverage", icon: BarChart3, color: "bg-teal-500/20 text-teal-600" },
    { title: t("timeAttendance.shifts.bidding"), description: t("timeAttendance.shifts.biddingDescription"), href: "/time-attendance/shifts/bidding", icon: Gavel, color: "bg-amber-500/20 text-amber-600" },
    { title: t("timeAttendance.shifts.aiScheduler"), description: t("timeAttendance.shifts.aiSchedulerDescription"), href: "/time-attendance/shifts/ai-scheduler", icon: Sparkles, color: "bg-violet-500/20 text-violet-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("timeAttendance.modules.shifts.title")}</h1>
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

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("timeAttendance.shifts.activeShifts")}</p>
                <p className="text-xl font-semibold">{shifts.filter(s => s.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                <Timer className="h-5 w-5 text-secondary" />
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

        {/* Navigation Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {navigationCards.map((card) => (
            <Link key={card.href} to={card.href}>
              <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{card.title}</p>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Shifts Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle>{t("timeAttendance.shifts.shiftsTab")}</CardTitle>
            </div>
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

        {/* Rounding Rules Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-orange-600" />
              <CardTitle>{t("timeAttendance.shifts.roundingRules")}</CardTitle>
            </div>
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

        {/* Payment Rules Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle>{t("timeAttendance.shifts.paymentRules")}</CardTitle>
            </div>
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPaymentForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("timeAttendance.shifts.createPaymentRule")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
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
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="per_hour">Per Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.amount")}</Label>
                      <Input 
                        type="number"
                        step="0.01"
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
                          <SelectItem value="overtime_only">Overtime Only</SelectItem>
                          <SelectItem value="night_shift">Night Shift</SelectItem>
                          <SelectItem value="weekend">Weekend</SelectItem>
                          <SelectItem value="holiday">Holiday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.priority")}</Label>
                      <Input 
                        type="number"
                        value={paymentForm.priority} 
                        onChange={(e) => setPaymentForm({...paymentForm, priority: parseInt(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t("timeAttendance.shifts.isTaxable")}</Label>
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.code")}</TableHead>
                  <TableHead>{t("timeAttendance.shifts.paymentType")}</TableHead>
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
                    <TableCell>{rule.code}</TableCell>
                    <TableCell className="capitalize">{rule.payment_type.replace('_', ' ')}</TableCell>
                    <TableCell>
                      {rule.payment_type === 'percentage' ? `${rule.amount}%` : `$${rule.amount.toFixed(2)}`}
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

        {/* Assignments Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-yellow-600" />
              <CardTitle>{t("timeAttendance.shifts.assignments")}</CardTitle>
            </div>
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
      </div>
    </AppLayout>
  );
}
