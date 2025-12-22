import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getTodayString } from "@/utils/dateUtils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, Plus, Pencil, Trash2, Loader2, Search, AlertCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface PayElement {
  id: string;
  code: string;
  name: string;
  element_type?: { code: string; name: string };
}

interface Position {
  id: string;
  title: string;
  code: string;
}

interface SalaryGrade {
  id: string;
  name: string;
  code: string;
  min_salary: number;
  mid_salary: number;
  max_salary: number;
  currency: string;
}

interface SpinalPoint {
  id: string;
  point_number: number;
  annual_salary: number;
}

interface PaySpine {
  id: string;
  name: string;
  code: string;
  currency: string;
}

interface PositionWithCompensation {
  id: string;
  title: string;
  code: string;
  compensation_model: string | null;
  salary_grade_id: string | null;
  pay_spine_id: string | null;
  salary_grade?: SalaryGrade | null;
}

interface PositionCompensationItem {
  id: string;
  amount: number;
  currency: string;
  frequency_id?: string;
  pay_element?: { name: string };
}

interface LookupValue {
  id: string;
  code: string;
  name: string;
}

interface EmployeeCompensation {
  id: string;
  company_id: string;
  employee_id: string;
  pay_element_id: string;
  position_id: string | null;
  amount: number;
  currency: string;
  frequency: string;
  is_override: boolean;
  override_reason: string | null;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  employee?: Employee;
  pay_element?: PayElement;
  position?: Position;
}

export default function EmployeeCompensationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [departments, setDepartments] = useState<{id: string; name: string; code: string}[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employeePositions, setEmployeePositions] = useState<{position_id: string; is_primary: boolean; position: PositionWithCompensation}[]>([]);
  const [compensationItems, setCompensationItems] = useState<EmployeeCompensation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeCompensation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Position compensation info for selected employee
  const [employeePrimaryPosition, setEmployeePrimaryPosition] = useState<PositionWithCompensation | null>(null);
  const [positionCompensationItems, setPositionCompensationItems] = useState<PositionCompensationItem[]>([]);
  const [paySpine, setPaySpine] = useState<PaySpine | null>(null);
  const [spinalPoints, setSpinalPoints] = useState<SpinalPoint[]>([]);
  
  // Pay elements linked to selected position in form
  const [formPositionPayElementIds, setFormPositionPayElementIds] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<LookupValue[]>([]);

  // Form state
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formPositionId, setFormPositionId] = useState("");
  const [formPayElementId, setFormPayElementId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formFrequency, setFormFrequency] = useState("monthly");
  const [formIsOverride, setFormIsOverride] = useState(false);
  const [formOverrideReason, setFormOverrideReason] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStartDate, setFormStartDate] = useState(getTodayString());
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadDepartments();
      loadPayElements();
      setSelectedDepartmentId("");
      setSelectedEmployeeId("");
      setEmployees([]);
      setEmployeePrimaryPosition(null);
      setPositionCompensationItems([]);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees();
      setSelectedEmployeeId("");
      setEmployeePrimaryPosition(null);
      setPositionCompensationItems([]);
    }
  }, [selectedCompanyId, selectedDepartmentId]);

  useEffect(() => {
    if (selectedCompanyId && selectedEmployeeId) {
      loadCompensationItems();
      loadEmployeePrimaryPosition();
    } else if (selectedCompanyId) {
      setCompensationItems([]);
      setEmployeePrimaryPosition(null);
      setPositionCompensationItems([]);
      setPaySpine(null);
      setSpinalPoints([]);
    }
  }, [selectedCompanyId, selectedEmployeeId]);

  const loadCompanies = async () => {
    // Load frequencies
    const { data: freqData } = await supabase
      .from("lookup_values")
      .select("id, code, name")
      .eq("category", "payment_frequency")
      .eq("is_active", true);
    setFrequencies(freqData || []);

    const { data } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");

    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadDepartments = async () => {
    const { data } = await supabase
      .from("departments")
      .select("id, name, code")
      .eq("company_id", selectedCompanyId)
      .eq("is_active", true)
      .order("name");

    if (data) {
      setDepartments(data);
    }
  };

  const loadEmployees = async () => {
    if (selectedDepartmentId) {
      // Filter by department through position assignments
      const { data } = await supabase
        .from("employee_positions")
        .select(`
          employee_id,
          profiles!inner(id, full_name, email, company_id),
          positions!inner(department_id)
        `)
        .eq("profiles.company_id", selectedCompanyId)
        .eq("positions.department_id", selectedDepartmentId)
        .eq("is_primary", true);

      if (data) {
        const employees = data.map(ep => ({
          id: (ep.profiles as any).id,
          full_name: (ep.profiles as any).full_name,
          email: (ep.profiles as any).email
        }));
        // Remove duplicates
        const uniqueEmployees = employees.filter((emp, index, self) =>
          index === self.findIndex(e => e.id === emp.id)
        );
        setEmployees(uniqueEmployees);
      }
    } else {
      // No department filter - get all employees for company
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("company_id", selectedCompanyId)
        .order("full_name");

      if (data) {
        setEmployees(data);
      }
    }
  };

  const loadPayElements = async () => {
    const { data } = await supabase
      .from("pay_elements")
      .select(`
        id, code, name,
        element_type:lookup_values!pay_elements_element_type_id_fkey(code, name)
      `)
      .eq("company_id", selectedCompanyId)
      .eq("is_active", true)
      .order("display_order");

    if (data) {
      setPayElements(data as PayElement[]);
    }
  };

  const loadCompensationItems = async () => {
    if (!selectedEmployeeId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_compensation")
      .select(`
        *,
        employee:profiles!employee_compensation_employee_id_fkey(id, full_name, email),
        pay_element:pay_elements!employee_compensation_pay_element_id_fkey(id, code, name),
        position:positions!employee_compensation_position_id_fkey(id, title, code)
      `)
      .eq("company_id", selectedCompanyId)
      .eq("employee_id", selectedEmployeeId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(t("common.error"));
    } else {
      setCompensationItems((data as EmployeeCompensation[]) || []);
    }
    setIsLoading(false);
  };

  const loadEmployeePrimaryPosition = async () => {
    if (!selectedEmployeeId) return;

    // Get ALL positions for the employee (not just primary)
    const { data: positionsData } = await supabase
      .from("employee_positions")
      .select(`
        position_id,
        is_primary,
        position:positions!employee_positions_position_id_fkey(
          id, title, code, compensation_model, salary_grade_id, pay_spine_id,
          salary_grade:salary_grades!positions_salary_grade_id_fkey(id, name, code, min_salary, mid_salary, max_salary, currency)
        )
      `)
      .eq("employee_id", selectedEmployeeId)
      .eq("is_active", true);

    if (positionsData && positionsData.length > 0) {
      // Store all positions for display with full compensation data
      const positions = positionsData.map(pd => ({
        position_id: pd.position_id,
        is_primary: pd.is_primary,
        position: pd.position as unknown as PositionWithCompensation
      }));
      setEmployeePositions(positions);

      // Find primary position for the summary card
      const primaryPosData = positionsData.find(p => p.is_primary);
      if (primaryPosData?.position) {
        const pos = primaryPosData.position as unknown as PositionWithCompensation;
        setEmployeePrimaryPosition(pos);

        // Load position compensation items for primary position
        const { data: compData } = await supabase
          .from("position_compensation")
          .select(`
            id, amount, currency, frequency_id,
            pay_element:pay_elements!position_compensation_pay_element_id_fkey(name)
          `)
          .eq("position_id", pos.id)
          .eq("is_active", true);

        setPositionCompensationItems((compData as unknown as PositionCompensationItem[]) || []);

        // Load pay spine and points if applicable
        if (pos.pay_spine_id && (pos.compensation_model === 'spinal_point' || pos.compensation_model === 'hybrid')) {
          const { data: spineData } = await supabase
            .from("pay_spines")
            .select("id, name, code, currency")
            .eq("id", pos.pay_spine_id)
            .single();

          if (spineData) {
            setPaySpine(spineData);
            const { data: pointsData } = await supabase
              .from("spinal_points")
              .select("id, point_number, annual_salary")
              .eq("pay_spine_id", spineData.id)
              .order("point_number");
            setSpinalPoints(pointsData || []);
          }
        } else {
          setPaySpine(null);
          setSpinalPoints([]);
        }
      } else {
        setEmployeePrimaryPosition(null);
        setPositionCompensationItems([]);
        setPaySpine(null);
        setSpinalPoints([]);
      }
    } else {
      setEmployeePositions([]);
      setEmployeePrimaryPosition(null);
      setPositionCompensationItems([]);
      setPaySpine(null);
      setSpinalPoints([]);
    }
  };

  const loadEmployeePositions = async (employeeId: string, setDefault: boolean = true) => {
    const { data } = await supabase
      .from("employee_positions")
      .select(`
        position_id,
        is_primary,
        position:positions!employee_positions_position_id_fkey(
          id, title, code, compensation_model, salary_grade_id, pay_spine_id,
          salary_grade:salary_grades!positions_salary_grade_id_fkey(id, name, code, min_salary, mid_salary, max_salary, currency)
        )
      `)
      .eq("employee_id", employeeId)
      .eq("is_active", true);
    
    if (data && data.length > 0) {
      const positions = data.map(d => ({
        position_id: d.position_id,
        is_primary: d.is_primary,
        position: d.position as unknown as PositionWithCompensation
      }));
      setEmployeePositions(positions);
      
      // Auto-select primary position as default
      if (setDefault) {
        const primaryPosition = positions.find(p => p.is_primary);
        if (primaryPosition) {
          setFormPositionId(primaryPosition.position_id);
        } else {
          setFormPositionId(positions[0].position_id);
        }
      }
    } else {
      setEmployeePositions([]);
      if (setDefault) {
        setFormPositionId("");
      }
    }
  };

  // Load positions when employee changes in form
  useEffect(() => {
    if (formEmployeeId && dialogOpen) {
      loadEmployeePositions(formEmployeeId);
    } else if (!formEmployeeId) {
      setEmployeePositions([]);
      setFormPositionId("");
      setFormPositionPayElementIds([]);
    }
  }, [formEmployeeId, dialogOpen]);

  // Load position pay elements when position changes in form
  useEffect(() => {
    const loadPositionPayElements = async () => {
      if (!formPositionId) {
        setFormPositionPayElementIds([]);
        setFormPayElementId("");
        return;
      }
      
      const { data } = await supabase
        .from("position_compensation")
        .select("pay_element_id")
        .eq("position_id", formPositionId)
        .eq("is_active", true);
      
      if (data && data.length > 0) {
        const payElementIds = data.map(pc => pc.pay_element_id);
        setFormPositionPayElementIds(payElementIds);
        // Reset pay element if current selection is not in the position's pay elements
        if (formPayElementId && !payElementIds.includes(formPayElementId)) {
          setFormPayElementId("");
        }
      } else {
        setFormPositionPayElementIds([]);
        setFormPayElementId("");
      }
    };
    
    if (dialogOpen) {
      loadPositionPayElements();
    }
  }, [formPositionId, dialogOpen]);

  const filteredItems = compensationItems.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const employeeName = item.employee?.full_name?.toLowerCase() || "";
    const employeeEmail = item.employee?.email?.toLowerCase() || "";
    const payElementName = item.pay_element?.name?.toLowerCase() || "";
    return employeeName.includes(search) || employeeEmail.includes(search) || payElementName.includes(search);
  });

  const openCreate = () => {
    setEditing(null);
    setFormEmployeeId("");
    setFormPositionId("");
    setFormPayElementId("");
    setFormAmount("");
    setFormCurrency("USD");
    setFormFrequency("monthly");
    setFormIsOverride(false);
    setFormOverrideReason("");
    setFormNotes("");
    setFormStartDate(getTodayString());
    setFormEndDate("");
    setFormIsActive(true);
    setEmployeePositions([]);
    setFormPositionPayElementIds([]);
    setDialogOpen(true);
  };

  const openEdit = async (item: EmployeeCompensation) => {
    setEditing(item);
    setFormEmployeeId(item.employee_id);
    await loadEmployeePositions(item.employee_id, false);
    setFormPositionId(item.position_id || "");
    setFormPayElementId(item.pay_element_id);
    setFormAmount(item.amount.toString());
    setFormCurrency(item.currency);
    setFormFrequency(item.frequency);
    setFormIsOverride(item.is_override);
    setFormOverrideReason(item.override_reason || "");
    setFormNotes(item.notes || "");
    setFormStartDate(item.start_date);
    setFormEndDate(item.end_date || "");
    setFormIsActive(item.is_active);
    setDialogOpen(true);
  };

  // Check if payroll payments exist for an employee + pay element + position within a date range
  const checkForPayrollPayments = async (
    employeeId: string,
    payElementId: string,
    positionId: string | null,
    startDate: string,
    endDate: string | null
  ): Promise<{ hasPaidPayroll: boolean; paidPeriods: { start: string; end: string; positionId: string | null }[] }> => {
    // Query for paid payroll line items that overlap with the compensation date range
    const { data, error } = await supabase
      .from("payroll_line_items")
      .select(`
        id,
        employee_payroll:employee_payroll_id (
          id,
          employee_id,
          employee_position_id,
          payroll_run:payroll_run_id (
            id,
            status,
            pay_period:pay_period_id (
              period_start,
              period_end
            )
          )
        )
      `)
      .eq("pay_element_id", payElementId);

    if (error || !data) {
      console.error("Error checking payroll payments:", error);
      return { hasPaidPayroll: false, paidPeriods: [] };
    }

    const paidPeriods: { start: string; end: string; positionId: string | null }[] = [];
    const compStart = new Date(startDate);
    const compEnd = endDate ? new Date(endDate) : null;

    for (const item of data) {
      const empPayroll = item.employee_payroll as any;
      if (!empPayroll || empPayroll.employee_id !== employeeId) continue;
      
      // If position_id is specified on compensation, only match that position's payroll
      if (positionId && empPayroll.employee_position_id !== positionId) continue;
      
      const payrollRun = empPayroll.payroll_run as any;
      if (!payrollRun || payrollRun.status !== "paid") continue;
      
      const payPeriod = payrollRun.pay_period as any;
      if (!payPeriod) continue;

      const periodStart = new Date(payPeriod.period_start);
      const periodEnd = new Date(payPeriod.period_end);

      // Check if pay period overlaps with compensation date range
      const overlaps = periodEnd >= compStart && (compEnd === null || periodStart <= compEnd);
      
      if (overlaps) {
        paidPeriods.push({
          start: payPeriod.period_start,
          end: payPeriod.period_end,
          positionId: empPayroll.employee_position_id
        });
      }
    }

    return { hasPaidPayroll: paidPeriods.length > 0, paidPeriods };
  };

  const handleSave = async () => {
    if (!formEmployeeId || !formPayElementId || !formAmount) {
      toast.error(t("compensation.employeeCompensation.validation.required"));
      return;
    }

    setIsProcessing(true);

    // If editing, check if date range changes would exclude paid periods
    if (editing) {
      const { hasPaidPayroll, paidPeriods } = await checkForPayrollPayments(
        editing.employee_id,
        editing.pay_element_id,
        editing.position_id,
        editing.start_date,
        editing.end_date
      );

      if (hasPaidPayroll) {
        // Check if the new date range would exclude any paid periods
        const newStart = new Date(formStartDate);
        const newEnd = formEndDate ? new Date(formEndDate) : null;

        for (const period of paidPeriods) {
          const periodStart = new Date(period.start);
          const periodEnd = new Date(period.end);

          // Check if the paid period is now outside the new date range
          const excludedByNewStart = periodEnd < newStart;
          const excludedByNewEnd = newEnd !== null && periodStart > newEnd;

          if (excludedByNewStart || excludedByNewEnd) {
            toast.error(
              t("compensation.employeeCompensation.cannotChangeDatesWithPayments", 
                "Cannot change dates to exclude periods with existing payroll payments. Paid period: {{start}} to {{end}}",
                { start: period.start, end: period.end }
              )
            );
            setIsProcessing(false);
            return;
          }
        }
      }
    }

    const data = {
      company_id: selectedCompanyId,
      employee_id: formEmployeeId,
      position_id: formPositionId || null,
      pay_element_id: formPayElementId,
      amount: parseFloat(formAmount),
      currency: formCurrency,
      frequency: formFrequency,
      is_override: formIsOverride,
      override_reason: formIsOverride ? formOverrideReason.trim() || null : null,
      notes: formNotes.trim() || null,
      start_date: formStartDate,
      end_date: formEndDate || null,
      is_active: formIsActive,
      updated_by: user?.id,
    };

    let error;
    if (editing) {
      const { error: updateError } = await supabase
        .from("employee_compensation")
        .update(data)
        .eq("id", editing.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("employee_compensation")
        .insert({ ...data, created_by: user?.id });
      error = insertError;
    }

    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(editing ? t("common.updated") : t("common.created"));
      setDialogOpen(false);
      loadCompensationItems();
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    // Find the compensation item to check for payments
    const item = compensationItems.find(c => c.id === id);
    if (!item) return;

    // Check for payroll payments before allowing deletion
    const { hasPaidPayroll, paidPeriods } = await checkForPayrollPayments(
      item.employee_id,
      item.pay_element_id,
      item.position_id,
      item.start_date,
      item.end_date
    );

    if (hasPaidPayroll) {
      toast.error(
        t("compensation.employeeCompensation.cannotDeleteWithPayments",
          "Cannot delete this compensation record. Payroll has been processed for this pay element. Paid periods: {{periods}}",
          { periods: paidPeriods.map(p => `${p.start} to ${p.end}`).join(", ") }
        )
      );
      return;
    }

    if (!confirm(t("compensation.employeeCompensation.deleteConfirm"))) return;
    
    const { error } = await supabase
      .from("employee_compensation")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("common.deleted"));
      loadCompensationItems();
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Get annualization multiplier based on frequency
  const getAnnualMultiplier = (frequencyId: string | null | undefined): number => {
    if (!frequencyId) return 1;
    const freq = frequencies.find((f) => f.id === frequencyId);
    if (!freq) return 1;
    
    const code = freq.code?.toLowerCase() || freq.name?.toLowerCase() || "";
    
    if (code.includes("annual") || code.includes("yearly")) return 1;
    if (code.includes("monthly")) return 12;
    if (code.includes("semi-monthly") || code.includes("semimonthly")) return 24;
    if (code.includes("bi-weekly") || code.includes("biweekly") || code.includes("fortnightly")) return 26;
    if (code.includes("weekly")) return 52;
    if (code.includes("daily")) return 260;
    if (code.includes("hourly")) return 2080;
    if (code.includes("quarterly")) return 4;
    
    return 1;
  };

  // Get annual multiplier based on frequency string (for employee compensation)
  const getAnnualMultiplierByFrequency = (frequency: string): number => {
    const code = frequency?.toLowerCase() || "";
    
    if (code.includes("annual") || code.includes("yearly")) return 1;
    if (code.includes("monthly")) return 12;
    if (code.includes("semi-monthly") || code.includes("semimonthly")) return 24;
    if (code.includes("bi-weekly") || code.includes("biweekly") || code.includes("fortnightly")) return 26;
    if (code.includes("weekly")) return 52;
    if (code.includes("daily")) return 260;
    if (code.includes("hourly")) return 2080;
    if (code.includes("quarterly")) return 4;
    if (code.includes("one-time")) return 1;
    
    return 1;
  };

  // Check if compensation amount is within position salary range (only for base salary types)
  const isAmountOutOfRange = (amount: number, frequency: string, payElementId: string): { outOfRange: boolean; message: string } => {
    if (!employeePrimaryPosition) {
      return { outOfRange: false, message: "" };
    }

    // Only check base salary elements against salary range
    const payElement = payElements.find(pe => pe.id === payElementId);
    const elementTypeCode = payElement?.element_type?.code?.toLowerCase() || "";
    const isBaseSalary = elementTypeCode.includes("base") || elementTypeCode.includes("basic") || elementTypeCode.includes("salary");
    
    if (!isBaseSalary) {
      return { outOfRange: false, message: "" };
    }

    // Convert amount to annual for comparison
    let annualAmount = amount;
    switch (frequency?.toLowerCase()) {
      case "monthly":
        annualAmount = amount * 12;
        break;
      case "weekly":
        annualAmount = amount * 52;
        break;
      case "bi-weekly":
        annualAmount = amount * 26;
        break;
      case "one-time":
        // One-time payments don't apply to salary range
        return { outOfRange: false, message: "" };
    }

    const model = employeePrimaryPosition.compensation_model;
    
    if (model === "salary_grade" && employeePrimaryPosition.salary_grade) {
      const { min_salary, max_salary } = employeePrimaryPosition.salary_grade;
      if (annualAmount < min_salary || annualAmount > max_salary) {
        return {
          outOfRange: true,
          message: t("compensation.employeeCompensation.outOfRange", {
            min: formatAmount(min_salary, employeePrimaryPosition.salary_grade.currency),
            max: formatAmount(max_salary, employeePrimaryPosition.salary_grade.currency)
          })
        };
      }
    }

    if (model === "spinal_point" && spinalPoints.length > 0 && paySpine) {
      const minSalary = spinalPoints[0].annual_salary;
      const maxSalary = spinalPoints[spinalPoints.length - 1].annual_salary;
      if (annualAmount < minSalary || annualAmount > maxSalary) {
        return {
          outOfRange: true,
          message: t("compensation.employeeCompensation.outOfRange", {
            min: formatAmount(minSalary, paySpine.currency),
            max: formatAmount(maxSalary, paySpine.currency)
          })
        };
      }
    }

    if (model === "hybrid") {
      // Check against salary grade if available
      if (employeePrimaryPosition.salary_grade) {
        const { min_salary, max_salary } = employeePrimaryPosition.salary_grade;
        if (annualAmount < min_salary || annualAmount > max_salary) {
          return {
            outOfRange: true,
            message: t("compensation.employeeCompensation.outOfRange", {
              min: formatAmount(min_salary, employeePrimaryPosition.salary_grade.currency),
              max: formatAmount(max_salary, employeePrimaryPosition.salary_grade.currency)
            })
          };
        }
      }
      // Also check against pay spine if available
      if (spinalPoints.length > 0 && paySpine) {
        const minSalary = spinalPoints[0].annual_salary;
        const maxSalary = spinalPoints[spinalPoints.length - 1].annual_salary;
        if (annualAmount < minSalary || annualAmount > maxSalary) {
          return {
            outOfRange: true,
            message: t("compensation.employeeCompensation.outOfRange", {
              min: formatAmount(minSalary, paySpine.currency),
              max: formatAmount(maxSalary, paySpine.currency)
            })
          };
        }
      }
    }

    return { outOfRange: false, message: "" };
  };

  const frequencyOptions = [
    { value: "monthly", label: t("compensation.employeeCompensation.frequency.monthly") },
    { value: "annual", label: t("compensation.employeeCompensation.frequency.annual") },
    { value: "weekly", label: t("compensation.employeeCompensation.frequency.weekly") },
    { value: "bi-weekly", label: t("compensation.employeeCompensation.frequency.biWeekly") },
    { value: "one-time", label: t("compensation.employeeCompensation.frequency.oneTime") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("compensation.title"), href: "/compensation" },
            { label: t("compensation.employeeCompensation.title") },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("compensation.employeeCompensation.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("compensation.employeeCompensation.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("common.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedDepartmentId || "all"} 
              onValueChange={(value) => setSelectedDepartmentId(value === "all" ? "" : value)}
              disabled={!selectedCompanyId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("common.allDepartments")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allDepartments")}</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedEmployeeId} 
              onValueChange={setSelectedEmployeeId}
              disabled={!selectedCompanyId}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={t("compensation.employeeCompensation.selectEmployee")} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openCreate} disabled={!selectedEmployeeId}>
              <Plus className="h-4 w-4 mr-2" />
              {t("compensation.employeeCompensation.add")}
            </Button>
          </div>
        </div>

        {/* Total Package Summary - All Positions */}
        {selectedEmployeeId && employeePositions.length > 0 && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("compensation.employeeCompensation.totalPackage", "Total Package")}</p>
                    <p className="text-xs text-muted-foreground">
                      {employeePositions.length} {employeePositions.length === 1 ? t("compensation.employeeCompensation.position", "position") : t("compensation.employeeCompensation.positions", "positions")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {(() => {
                    // Calculate total from all active compensation items across all positions
                    const totalMonthly = compensationItems
                      .filter(item => item.is_active)
                      .reduce((sum, item) => {
                        const multiplier = getAnnualMultiplierByFrequency(item.frequency);
                        return sum + (item.amount * multiplier / 12);
                      }, 0);
                    const totalAnnual = totalMonthly * 12;
                    
                    return (
                      <>
                        <p className="text-2xl font-bold">{formatAmount(totalAnnual, "USD")}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatAmount(totalMonthly, "USD")} / {t("compensation.employeeCompensation.monthly", "month")}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compensation by Position */}
        {!selectedEmployeeId ? (
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-12 text-muted-foreground">
                {t("compensation.employeeCompensation.selectEmployeeFirst")}
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        ) : employeePositions.length === 0 ? (
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-12 text-muted-foreground">
                {t("compensation.employeeCompensation.noPositionsAssigned", "No positions assigned to this employee")}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Search bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t("compensation.employeeCompensation.searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position cards with compensation */}
            {employeePositions.map((ep) => {
              const positionItems = filteredItems.filter(item => item.position_id === ep.position_id);
              const positionTotal = positionItems
                .filter(item => item.is_active)
                .reduce((sum, item) => {
                  const multiplier = getAnnualMultiplierByFrequency(item.frequency);
                  return sum + (item.amount * multiplier / 12); // Convert to monthly
                }, 0);
              
              return (
                <Card key={ep.position_id}>
                  <CardContent className="p-4">
                    {/* Position Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{ep.position.title}</h3>
                            <Badge variant="outline" className="text-xs">{ep.position.code}</Badge>
                            {ep.is_primary && (
                              <Badge variant="secondary" className="text-xs">
                                ★ {t("common.primary", "Primary")}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {ep.position.salary_grade && (
                              <Badge variant="outline" className="text-xs bg-muted">
                                {ep.position.salary_grade.name} ({ep.position.salary_grade.code})
                              </Badge>
                            )}
                            {ep.position.salary_grade && (
                              <span className="text-xs text-muted-foreground">
                                {t("compensation.employeeCompensation.range", "Range")}: {formatAmount(ep.position.salary_grade.min_salary, ep.position.salary_grade.currency)} - {formatAmount(ep.position.salary_grade.max_salary, ep.position.salary_grade.currency)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {positionItems.filter(i => i.is_active).length} {t("compensation.employeeCompensation.activeElements", "active compensation elements")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{t("compensation.employeeCompensation.monthlyTotal", "Monthly Total")}</div>
                        <div className="text-xl font-bold text-primary">
                          {formatAmount(positionTotal, positionItems[0]?.currency || "USD")}
                        </div>
                      </div>
                    </div>

                    {/* Compensation Table for this Position */}
                    {positionItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {t("compensation.employeeCompensation.noItemsForPosition", "No compensation records for this position")}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("compensation.employeeCompensation.payElement")}</TableHead>
                            <TableHead className="text-right">{t("compensation.employeeCompensation.amount")}</TableHead>
                            <TableHead>{t("compensation.employeeCompensation.frequencyLabel")}</TableHead>
                            <TableHead className="text-right">{t("compensation.employeeCompensation.monthlyEquivalent", "Monthly Equiv.")}</TableHead>
                            <TableHead>{t("compensation.employeeCompensation.effectiveDates")}</TableHead>
                            <TableHead>{t("common.status")}</TableHead>
                            <TableHead className="text-right">{t("common.actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {positionItems.map((item) => {
                            const monthlyAmount = item.amount * getAnnualMultiplierByFrequency(item.frequency) / 12;
                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>{item.pay_element?.name}</span>
                                    {item.is_override && (
                                      <Badge variant="outline" className="text-xs">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {t("compensation.employeeCompensation.override")}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {(() => {
                                    const rangeCheck = isAmountOutOfRange(item.amount, item.frequency, item.pay_element_id);
                                    return (
                                      <div className="flex items-center justify-end gap-2">
                                        {rangeCheck.outOfRange && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive/20 border-2 border-destructive cursor-help">
                                                <AlertCircle className="h-3 w-3 text-destructive" />
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{rangeCheck.message}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                        <span className={rangeCheck.outOfRange ? "text-destructive font-semibold" : ""}>
                                          {formatAmount(item.amount, item.currency)}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </TableCell>
                                <TableCell className="capitalize">{item.frequency}</TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">
                                  {formatAmount(monthlyAmount, item.currency)}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">
                                    {item.start_date} → {item.end_date || t("common.present")}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={item.is_active ? "default" : "secondary"}>
                                    {item.is_active ? t("common.active") : t("common.inactive")}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openEdit(item)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Total Compensation Summary */}
            {filteredItems.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{t("compensation.employeeCompensation.totalCompensation", "Total Compensation")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("compensation.employeeCompensation.acrossAllPositions", "Across all positions")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{t("compensation.employeeCompensation.monthlyTotal", "Monthly Total")}</div>
                      <div className="text-2xl font-bold text-primary">
                        {formatAmount(
                          filteredItems
                            .filter(item => item.is_active)
                            .reduce((sum, item) => {
                              const multiplier = getAnnualMultiplierByFrequency(item.frequency);
                              return sum + (item.amount * multiplier / 12);
                            }, 0),
                          filteredItems[0]?.currency || "USD"
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {t("compensation.employeeCompensation.annualEquivalent", "Annual")}: {formatAmount(
                          filteredItems
                            .filter(item => item.is_active)
                            .reduce((sum, item) => {
                              const multiplier = getAnnualMultiplierByFrequency(item.frequency);
                              return sum + (item.amount * multiplier);
                            }, 0),
                          filteredItems[0]?.currency || "USD"
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? t("compensation.employeeCompensation.dialog.editTitle")
                  : t("compensation.employeeCompensation.dialog.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("compensation.employeeCompensation.dialog.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("compensation.employeeCompensation.employee")} *</Label>
                <Select value={formEmployeeId} onValueChange={setFormEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("compensation.employeeCompensation.dialog.selectEmployee")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.full_name} ({e.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("compensation.employeeCompensation.position")}</Label>
                <Select 
                  value={formPositionId} 
                  onValueChange={setFormPositionId}
                  disabled={!formEmployeeId || employeePositions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formEmployeeId 
                        ? t("compensation.employeeCompensation.dialog.selectEmployeeFirst")
                        : employeePositions.length === 0 
                          ? t("compensation.employeeCompensation.dialog.noPositionsAssigned") 
                          : t("compensation.employeeCompensation.dialog.selectPosition")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {employeePositions.map((ep) => (
                      <SelectItem key={ep.position_id} value={ep.position_id}>
                        {ep.position?.title} ({ep.position?.code}) {ep.is_primary && "★"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("compensation.employeeCompensation.payElement")} *</Label>
                <Select 
                  value={formPayElementId} 
                  onValueChange={setFormPayElementId}
                  disabled={!formPositionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formPositionId 
                        ? t("compensation.employeeCompensation.dialog.selectPositionFirst", "Select a position first")
                        : t("compensation.employeeCompensation.dialog.selectPayElement")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {payElements.map((pe) => (
                      <SelectItem key={pe.id} value={pe.id}>
                        {pe.name} ({pe.code}) {formPositionPayElementIds.includes(pe.id) && "★"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formPositionPayElementIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ★ = {t("compensation.employeeCompensation.dialog.linkedToPosition", "Linked to position")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("compensation.employeeCompensation.amount")} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("compensation.employeeCompensation.currency")}</Label>
                  <Select value={formCurrency} onValueChange={setFormCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("compensation.employeeCompensation.frequencyLabel")}</Label>
                  <Select value={formFrequency} onValueChange={setFormFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex items-center gap-2">
                <Switch
                  id="isOverride"
                  checked={formIsOverride}
                  onCheckedChange={setFormIsOverride}
                />
                <Label htmlFor="isOverride">{t("compensation.employeeCompensation.dialog.isOverride")}</Label>
              </div>

              {formIsOverride && (
                <div className="space-y-2">
                  <Label htmlFor="overrideReason">{t("compensation.employeeCompensation.dialog.overrideReason")}</Label>
                  <Input
                    id="overrideReason"
                    value={formOverrideReason}
                    onChange={(e) => setFormOverrideReason(e.target.value)}
                    placeholder={t("compensation.employeeCompensation.dialog.overrideReasonPlaceholder")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Textarea
                  id="notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                />
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isProcessing}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
