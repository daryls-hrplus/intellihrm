import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

interface AddCompensationHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess: () => void;
}

interface Department {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  full_name: string;
}

interface EmployeePosition {
  id: string;
  position_id: string;
  is_primary: boolean;
  compensation_amount: number | null;
  position: {
    id: string;
    title: string;
  };
}

export function AddCompensationHistoryDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: AddCompensationHistoryDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<EmployeePosition[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [formData, setFormData] = useState({
    employee_id: "",
    position_id: "",
    change_type: "",
    effective_date: "",
    previous_salary: "",
    new_salary: "",
    reason: "",
    notes: "",
    currency: "USD",
  });

  useEffect(() => {
    if (open && companyId) {
      loadDepartments();
      setSelectedDepartmentId("");
      setEmployees([]);
      setPositions([]);
      resetForm();
    }
  }, [open, companyId]);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadEmployeesByDepartment();
      setFormData(prev => ({ ...prev, employee_id: "", position_id: "" }));
      setPositions([]);
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (formData.employee_id) {
      loadPositions();
      setFormData(prev => ({ ...prev, position_id: "" }));
    }
  }, [formData.employee_id]);

  const loadDepartments = async () => {
    // @ts-ignore - Supabase type instantiation issue
    const { data, error } = await supabase
      .from("departments")
      .select("id, name")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");
    if (data && !error) setDepartments(data as Department[]);
  };

  const loadEmployeesByDepartment = async () => {
    // Get employees through their positions (department is on position, not profile)
    // @ts-ignore - Supabase type instantiation issue
    const { data, error } = await supabase
      .from("employee_positions")
      .select(`
        employee_id,
        employee:profiles!employee_positions_employee_id_fkey(id, full_name, is_active),
        position:positions!employee_positions_position_id_fkey(department_id)
      `)
      .eq("is_active", true)
      .eq("position.department_id", selectedDepartmentId);
    
    if (data && !error) {
      // Filter active employees and deduplicate
      const employeeMap = new Map<string, Employee>();
      data.forEach((ep: any) => {
        if (ep.employee && ep.employee.is_active && ep.position?.department_id === selectedDepartmentId) {
          employeeMap.set(ep.employee.id, {
            id: ep.employee.id,
            full_name: ep.employee.full_name,
          });
        }
      });
      setEmployees(Array.from(employeeMap.values()).sort((a, b) => a.full_name.localeCompare(b.full_name)));
    }
  };

  const loadPositions = async () => {
    // @ts-ignore - Supabase type instantiation issue
    const { data, error } = await supabase
      .from("employee_positions")
      .select(`
        id,
        position_id,
        is_primary,
        compensation_amount,
        position:positions(id, title)
      `)
      .eq("employee_id", formData.employee_id)
      .eq("is_active", true);
    
    if (data && !error) {
      const mappedPositions = data.map((ep: any) => ({
        id: ep.id,
        position_id: ep.position_id,
        is_primary: ep.is_primary,
        compensation_amount: ep.compensation_amount,
        position: ep.position,
      }));
      setPositions(mappedPositions);
      
      // Auto-fill previous salary if only one position
      if (mappedPositions.length === 1) {
        const singlePosition = mappedPositions[0];
        setFormData(prev => ({
          ...prev,
          position_id: singlePosition.position_id,
          previous_salary: singlePosition.compensation_amount?.toString() || "",
        }));
      }
    }
  };

  const handlePositionChange = (positionId: string) => {
    const selectedPosition = positions.find(p => p.position_id === positionId);
    setFormData(prev => ({
      ...prev,
      position_id: positionId,
      previous_salary: selectedPosition?.compensation_amount?.toString() || "",
    }));
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.change_type || !formData.effective_date || !formData.new_salary || !formData.position_id) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      const previousSalary = formData.previous_salary ? parseFloat(formData.previous_salary) : null;
      const newSalary = parseFloat(formData.new_salary);
      
      let changeAmount: number | null = null;
      let changePercentage: number | null = null;
      
      if (previousSalary !== null && previousSalary > 0) {
        changeAmount = newSalary - previousSalary;
        changePercentage = parseFloat(((changeAmount / previousSalary) * 100).toFixed(2));
      }

      // @ts-ignore - Supabase type instantiation issue
      const { error } = await supabase.from("compensation_history").insert({
        company_id: companyId,
        employee_id: formData.employee_id,
        position_id: formData.position_id,
        change_type: formData.change_type,
        effective_date: formData.effective_date,
        previous_salary: previousSalary,
        new_salary: newSalary,
        change_amount: changeAmount,
        change_percentage: changePercentage,
        reason: formData.reason || null,
        notes: formData.notes || null,
        currency: formData.currency,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success(t("compensation.history.recordAdded"));
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      position_id: "",
      change_type: "",
      effective_date: "",
      previous_salary: "",
      new_salary: "",
      reason: "",
      notes: "",
      currency: "USD",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("compensation.history.addRecord")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[75vh] overflow-y-auto px-1">
          {/* Employee Selection Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t("common.employee")} Selection
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.department")} *</Label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={setSelectedDepartmentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectDepartment")} />
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

              <div className="space-y-2">
                <Label htmlFor="employee">{t("compensation.history.employee")} *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                  disabled={!selectedDepartmentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedDepartmentId ? t("common.selectEmployee") : t("common.selectDepartmentFirst")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.position")} *</Label>
                <Select
                  value={formData.position_id}
                  onValueChange={handlePositionChange}
                  disabled={!formData.employee_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.employee_id ? t("common.selectPosition") : t("common.selectEmployeeFirst")} />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.position_id} value={pos.position_id}>
                        {pos.position?.title} {pos.is_primary && "(Primary)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="change_type">{t("compensation.history.type")} *</Label>
                <Select
                  value={formData.change_type}
                  onValueChange={(value) => setFormData({ ...formData, change_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("compensation.history.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hire">{t("compensation.history.changeTypes.hire")}</SelectItem>
                    <SelectItem value="promotion">{t("compensation.history.changeTypes.promotion")}</SelectItem>
                    <SelectItem value="merit">{t("compensation.history.changeTypes.merit")}</SelectItem>
                    <SelectItem value="adjustment">{t("compensation.history.changeTypes.adjustment")}</SelectItem>
                    <SelectItem value="market">{t("compensation.history.changeTypes.market")}</SelectItem>
                    <SelectItem value="demotion">{t("compensation.history.changeTypes.demotion")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Compensation Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Compensation Details
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effective_date">{t("compensation.history.effectiveDate")} *</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previous_salary">{t("compensation.history.previous")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="previous_salary"
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={formData.previous_salary}
                    onChange={(e) => setFormData({ ...formData, previous_salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_salary">{t("compensation.history.new")} *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="new_salary"
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={formData.new_salary}
                    onChange={(e) => setFormData({ ...formData, new_salary: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Change Preview */}
            {formData.previous_salary && formData.new_salary && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Change Amount</span>
                  <span className={`font-medium ${parseFloat(formData.new_salary) - parseFloat(formData.previous_salary) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {parseFloat(formData.new_salary) - parseFloat(formData.previous_salary) >= 0 ? '+' : ''}
                    ${(parseFloat(formData.new_salary) - parseFloat(formData.previous_salary)).toLocaleString()}
                    {parseFloat(formData.previous_salary) > 0 && (
                      <span className="ml-2 text-sm">
                        ({(((parseFloat(formData.new_salary) - parseFloat(formData.previous_salary)) / parseFloat(formData.previous_salary)) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Additional Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">{t("compensation.history.reason")}</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder={t("compensation.history.reasonPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t("common.notesPlaceholder")}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
