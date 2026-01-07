import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Info, Calendar, DollarSign, FileText, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePageAudit } from "@/hooks/usePageAudit";

interface SemiMonthlyRule {
  id?: string;
  pay_group_id: string;
  statutory_handling: "split" | "last_cycle" | "first_cycle";
  statutory_overrides: string[];
  deduction_handling: "split" | "last_cycle" | "first_cycle";
  deduction_overrides: string[];
  base_salary_handling: "split" | "last_cycle" | "first_cycle";
  other_earnings_handling: "split" | "last_cycle" | "first_cycle";
  other_earnings_overrides: string[];
  primary_cycle: "first" | "second";
  notes: string;
  is_active: boolean;
}

interface PayElement {
  id: string;
  code: string;
  name: string;
}

interface PayGroup {
  id: string;
  name: string;
  code: string;
  pay_frequency: string;
}

interface StatutoryType {
  id: string;
  code: string;
  name: string;
}

interface DeductionConfig {
  id: string;
  code: string;
  name: string;
}

export default function SemiMonthlyPayrollRulesPage() {
  usePageAudit('semi_monthly_payroll_rules', 'Payroll');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [selectedPayGroupId, setSelectedPayGroupId] = useState<string>("");
  const [formData, setFormData] = useState<SemiMonthlyRule>({
    pay_group_id: "",
    statutory_handling: "split",
    statutory_overrides: [],
    deduction_handling: "split",
    deduction_overrides: [],
    base_salary_handling: "split",
    other_earnings_handling: "split",
    other_earnings_overrides: [],
    primary_cycle: "second",
    notes: "",
    is_active: true,
  });

  // Fetch semi-monthly pay groups
  const { data: payGroups } = useQuery({
    queryKey: ["semimonthly-pay-groups", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("pay_groups")
        .select("id, name, code, pay_frequency")
        .eq("company_id", selectedCompanyId)
        .eq("pay_frequency", "semimonthly")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as PayGroup[];
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch existing rule for selected pay group
  const { data: existingRule, isLoading: ruleLoading } = useQuery({
    queryKey: ["semimonthly-rule", selectedPayGroupId],
    queryFn: async () => {
      if (!selectedPayGroupId) return null;
      const { data, error } = await supabase
        .from("semimonthly_payroll_rules")
        .select("*")
        .eq("pay_group_id", selectedPayGroupId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPayGroupId,
  });

  // Fetch statutory types for the company's country
  const { data: statutoryTypes } = useQuery({
    queryKey: ["statutory-types-for-rules", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      // Get company's country
      const { data: company } = await supabase
        .from("companies")
        .select("country")
        .eq("id", selectedCompanyId)
        .single();
      
      if (!company?.country) return [];

      const { data, error } = await supabase
        .from("statutory_deduction_types")
        .select("id, statutory_code, statutory_name")
        .eq("country", company.country)
        .eq("is_active", true)
        .order("statutory_name");
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        code: d.statutory_code,
        name: d.statutory_name,
      })) as StatutoryType[];
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch deduction configurations
  const { data: deductionConfigs } = useQuery({
    queryKey: ["deduction-configs-for-rules", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("payroll_deduction_config")
        .select("id, code, name")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as DeductionConfig[];
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch pay elements (earnings) for the company
  const { data: payElements } = useQuery({
    queryKey: ["pay-elements-for-rules", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("pay_elements")
        .select("id, code, name")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true);
      if (error) throw error;
      // Filter in JS to avoid complex type inference issues
      const filtered = (data || []).filter(
        (el: any) => ['earning', 'allowance'].includes(el.element_type) && el.code !== 'BASE_SALARY'
      );
      return filtered as PayElement[];
    },
    enabled: !!selectedCompanyId,
  });

  // Update form when existing rule loads
  useEffect(() => {
    if (existingRule) {
      setFormData({
        id: existingRule.id,
        pay_group_id: existingRule.pay_group_id,
        statutory_handling: existingRule.statutory_handling as "split" | "last_cycle" | "first_cycle",
        statutory_overrides: (existingRule.statutory_overrides as string[]) || [],
        deduction_handling: existingRule.deduction_handling as "split" | "last_cycle" | "first_cycle",
        deduction_overrides: (existingRule.deduction_overrides as string[]) || [],
        base_salary_handling: (existingRule.base_salary_handling as "split" | "last_cycle" | "first_cycle") || "split",
        other_earnings_handling: (existingRule.other_earnings_handling as "split" | "last_cycle" | "first_cycle") || "split",
        other_earnings_overrides: (existingRule.other_earnings_overrides as string[]) || [],
        primary_cycle: existingRule.primary_cycle as "first" | "second",
        notes: existingRule.notes || "",
        is_active: existingRule.is_active,
      });
    } else if (selectedPayGroupId) {
      setFormData({
        pay_group_id: selectedPayGroupId,
        statutory_handling: "split",
        statutory_overrides: [],
        deduction_handling: "split",
        deduction_overrides: [],
        base_salary_handling: "split",
        other_earnings_handling: "split",
        other_earnings_overrides: [],
        primary_cycle: "second",
        notes: "",
        is_active: true,
      });
    }
  }, [existingRule, selectedPayGroupId]);

  const saveMutation = useMutation({
    mutationFn: async (data: SemiMonthlyRule) => {
      const payload = {
        pay_group_id: data.pay_group_id,
        statutory_handling: data.statutory_handling,
        statutory_overrides: data.statutory_overrides,
        deduction_handling: data.deduction_handling,
        deduction_overrides: data.deduction_overrides,
        base_salary_handling: data.base_salary_handling,
        other_earnings_handling: data.other_earnings_handling,
        other_earnings_overrides: data.other_earnings_overrides,
        primary_cycle: data.primary_cycle,
        notes: data.notes || null,
        is_active: data.is_active,
      };

      if (data.id) {
        const { error } = await supabase
          .from("semimonthly_payroll_rules")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("semimonthly_payroll_rules")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semimonthly-rule"] });
      toast.success(formData.id ? "Rules updated successfully" : "Rules created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save rules");
    },
  });

  const toggleStatutoryOverride = (code: string) => {
    setFormData(prev => ({
      ...prev,
      statutory_overrides: prev.statutory_overrides.includes(code)
        ? prev.statutory_overrides.filter(c => c !== code)
        : [...prev.statutory_overrides, code],
    }));
  };

  const toggleDeductionOverride = (code: string) => {
    setFormData(prev => ({
      ...prev,
      deduction_overrides: prev.deduction_overrides.includes(code)
        ? prev.deduction_overrides.filter(c => c !== code)
        : [...prev.deduction_overrides, code],
    }));
  };

  const toggleEarningsOverride = (code: string) => {
    setFormData(prev => ({
      ...prev,
      other_earnings_overrides: prev.other_earnings_overrides.includes(code)
        ? prev.other_earnings_overrides.filter(c => c !== code)
        : [...prev.other_earnings_overrides, code],
    }));
  };

  const getHandlingDescription = (handling: string, isOverride: boolean = false) => {
    const descriptions: Record<string, string> = {
      split: "Split evenly across both pay cycles",
      last_cycle: "Take full amount on the last (2nd) cycle of the month",
      first_cycle: "Take full amount on the first cycle of the month",
    };
    if (isOverride) {
      return handling === "split" 
        ? "These items will be split even if main setting is different"
        : `These items will be taken on the ${handling === 'last_cycle' ? 'last' : 'first'} cycle`;
    }
    return descriptions[handling] || handling;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Semi-Monthly Payroll Rules</h1>
          <p className="text-muted-foreground">
            Configure how statutory deductions and other deductions are handled for semi-monthly pay groups
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <PayrollFilters
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={(id) => {
            setSelectedCompanyId(id);
            setSelectedPayGroupId("");
          }}
          showPayGroupFilter={false}
        />
        {selectedCompanyId && (
          <div className="flex items-center gap-2">
            <Label>Pay Group</Label>
            <Select
              value={selectedPayGroupId}
              onValueChange={setSelectedPayGroupId}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a semi-monthly pay group" />
              </SelectTrigger>
              <SelectContent>
                {payGroups?.map((pg) => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name} ({pg.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!selectedCompanyId ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Select a company to configure semi-monthly payroll rules
          </CardContent>
        </Card>
      ) : !payGroups?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No semi-monthly pay groups found</p>
            <p className="text-sm">Create a pay group with "Semi-Monthly" frequency first</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/payroll/pay-groups")}
            >
              Go to Pay Groups
            </Button>
          </CardContent>
        </Card>
      ) : !selectedPayGroupId ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Select a semi-monthly pay group to configure its rules
          </CardContent>
        </Card>
      ) : ruleLoading ? (
        <Card>
          <CardContent className="py-10 text-center">Loading...</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Main Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Statutory Deductions Handling
                  </CardTitle>
                  <CardDescription>
                    How statutory deductions (taxes, social security, etc.) should be calculated for semi-monthly payroll
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Choose "Last Cycle" to treat the second pay period as a monthly payroll for statutory calculations, which may be required for certain jurisdictions.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Default Statutory Handling</Label>
                <Select
                  value={formData.statutory_handling}
                  onValueChange={(value: "split" | "last_cycle" | "first_cycle") => 
                    setFormData(prev => ({ ...prev, statutory_handling: value }))
                  }
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">
                      <div className="flex flex-col">
                        <span>Split Evenly</span>
                        <span className="text-xs text-muted-foreground">Calculate and deduct 50% each cycle</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="last_cycle">
                      <div className="flex flex-col">
                        <span>Last Cycle Only (Monthly Treatment)</span>
                        <span className="text-xs text-muted-foreground">Take full monthly amount on 2nd cycle</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="first_cycle">
                      <div className="flex flex-col">
                        <span>First Cycle Only</span>
                        <span className="text-xs text-muted-foreground">Take full monthly amount on 1st cycle</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getHandlingDescription(formData.statutory_handling)}
                </p>
              </div>

              {statutoryTypes && statutoryTypes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Statutory Overrides</Label>
                      <Badge variant="outline">
                        {formData.statutory_overrides.length} selected
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select specific statutory types that should be handled differently from the default setting above
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {statutoryTypes.map((stat) => (
                        <div 
                          key={stat.id}
                          className="flex items-center space-x-2 p-2 rounded border"
                        >
                          <Checkbox
                            id={`stat-${stat.code}`}
                            checked={formData.statutory_overrides.includes(stat.code)}
                            onCheckedChange={() => toggleStatutoryOverride(stat.code)}
                          />
                          <label 
                            htmlFor={`stat-${stat.code}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {stat.name}
                            <span className="block text-xs text-muted-foreground">{stat.code}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.statutory_overrides.length > 0 && (
                      <p className="text-sm text-primary">
                        Selected items will use the <strong>opposite</strong> of the default handling
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Earnings Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Earnings Handling
                  </CardTitle>
                  <CardDescription>
                    How base salary and other regular earnings should be split across semi-monthly pay periods
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>By default, earnings are split 50/50 between pay cycles. You can configure other earnings to be paid fully on a specific cycle.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base Salary Handling */}
              <div className="grid gap-2">
                <Label>Base Salary Handling</Label>
                <Select
                  value={formData.base_salary_handling}
                  onValueChange={(value: "split" | "last_cycle" | "first_cycle") => 
                    setFormData(prev => ({ ...prev, base_salary_handling: value }))
                  }
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">
                      <div className="flex flex-col">
                        <span>Split Evenly (50/50)</span>
                        <span className="text-xs text-muted-foreground">Pay half the monthly salary each cycle</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="last_cycle">
                      <div className="flex flex-col">
                        <span>Last Cycle Only</span>
                        <span className="text-xs text-muted-foreground">Pay full monthly salary on 2nd cycle</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="first_cycle">
                      <div className="flex flex-col">
                        <span>First Cycle Only</span>
                        <span className="text-xs text-muted-foreground">Pay full monthly salary on 1st cycle</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.base_salary_handling === 'split' 
                    ? 'Base salary will be split evenly (50/50) across both pay cycles'
                    : `Base salary will be paid in full on the ${formData.base_salary_handling === 'last_cycle' ? 'second' : 'first'} pay cycle`}
                </p>
              </div>

              <Separator />

              {/* Other Regular Earnings Handling */}
              <div className="grid gap-2">
                <Label>Other Regular Earnings Handling</Label>
                <Select
                  value={formData.other_earnings_handling}
                  onValueChange={(value: "split" | "last_cycle" | "first_cycle") => 
                    setFormData(prev => ({ ...prev, other_earnings_handling: value }))
                  }
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">
                      <div className="flex flex-col">
                        <span>Split Evenly (50/50)</span>
                        <span className="text-xs text-muted-foreground">Pay half of each earning each cycle</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="last_cycle">
                      <div className="flex flex-col">
                        <span>Last Cycle Only (2nd Cycle)</span>
                        <span className="text-xs text-muted-foreground">Pay full amount on 2nd cycle only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="first_cycle">
                      <div className="flex flex-col">
                        <span>First Cycle Only</span>
                        <span className="text-xs text-muted-foreground">Pay full amount on 1st cycle only</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.other_earnings_handling === 'split' 
                    ? 'Regular earnings (excluding base salary) will be split evenly across both pay cycles'
                    : `Regular earnings will be paid in full on the ${formData.other_earnings_handling === 'last_cycle' ? 'second' : 'first'} pay cycle`}
                </p>
              </div>

              {payElements && payElements.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Earnings Overrides</Label>
                      <Badge variant="outline">
                        {formData.other_earnings_overrides.length} selected
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select specific earnings that should be handled differently from the default setting above
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {payElements.map((el) => (
                        <div 
                          key={el.id}
                          className="flex items-center space-x-2 p-2 rounded border"
                        >
                          <Checkbox
                            id={`earn-${el.code}`}
                            checked={formData.other_earnings_overrides.includes(el.code)}
                            onCheckedChange={() => toggleEarningsOverride(el.code)}
                          />
                          <label 
                            htmlFor={`earn-${el.code}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {el.name}
                            <span className="block text-xs text-muted-foreground">{el.code}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.other_earnings_overrides.length > 0 && (
                      <p className="text-sm text-primary">
                        Selected items will use the <strong>opposite</strong> of the default handling
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Deductions Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Regular Deductions Handling
              </CardTitle>
              <CardDescription>
                How regular deductions (loans, union dues, etc.) should be applied for semi-monthly payroll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Default Deduction Handling</Label>
                <Select
                  value={formData.deduction_handling}
                  onValueChange={(value: "split" | "last_cycle" | "first_cycle") => 
                    setFormData(prev => ({ ...prev, deduction_handling: value }))
                  }
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">Split Evenly Across Cycles</SelectItem>
                    <SelectItem value="last_cycle">Last Cycle Only</SelectItem>
                    <SelectItem value="first_cycle">First Cycle Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getHandlingDescription(formData.deduction_handling)}
                </p>
              </div>

              {deductionConfigs && deductionConfigs.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Deduction Overrides</Label>
                      <Badge variant="outline">
                        {formData.deduction_overrides.length} selected
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select specific deductions that should be handled differently
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {deductionConfigs.map((ded) => (
                        <div 
                          key={ded.id}
                          className="flex items-center space-x-2 p-2 rounded border"
                        >
                          <Checkbox
                            id={`ded-${ded.code}`}
                            checked={formData.deduction_overrides.includes(ded.code)}
                            onCheckedChange={() => toggleDeductionOverride(ded.code)}
                          />
                          <label 
                            htmlFor={`ded-${ded.code}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {ded.name}
                            <span className="block text-xs text-muted-foreground">{ded.code}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Primary Cycle for Monthly Calculations</Label>
                <Select
                  value={formData.primary_cycle}
                  onValueChange={(value: "first" | "second") => 
                    setFormData(prev => ({ ...prev, primary_cycle: value }))
                  }
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Cycle (1st-15th)</SelectItem>
                    <SelectItem value="second">Second Cycle (16th-End of Month)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This determines which cycle is used for monthly YTD calculations and reporting
                </p>
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this configuration..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Rule is Active</Label>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/payroll")}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {formData.id ? "Update Rules" : "Save Rules"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
