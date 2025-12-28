import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Users, Building2, DollarSign, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface PositionBudgetAIWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  scenarioId: string;
  onComplete: () => void;
}

interface PositionWithCompensation {
  id: string;
  title: string;
  code: string;
  department: { id: string; name: string } | null;
  authorized_headcount: number;
  filledHeadcount: number;
  compensation: {
    base_salary: number;
    bonus: number;
    benefits: number;
    allowances: number;
    total: number;
  };
  isSelected: boolean;
}

export function PositionBudgetAIWizard({
  open,
  onOpenChange,
  companyId,
  scenarioId,
  onComplete,
}: PositionBudgetAIWizardProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"select" | "preview" | "importing">("select");
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
  const [importProgress, setImportProgress] = useState(0);
  const [overheadPercentage, setOverheadPercentage] = useState(15);
  const [employerTaxPercentage, setEmployerTaxPercentage] = useState(12);

  // Fetch all positions for the company with their compensation from employee_compensation
  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["positions-with-employee-compensation", companyId],
    queryFn: async () => {
      // Get all active positions for the company through departments
      const { data: companyDepts } = await supabase
        .from("departments")
        .select("id")
        .eq("company_id", companyId);

      const companyDeptIds = companyDepts?.map(d => d.id) || [];
      
      if (companyDeptIds.length === 0) return [];

      const { data: positionData, error: posError } = await supabase
        .from("positions")
        .select(`
          id,
          title,
          code,
          authorized_headcount,
          department:departments(id, name)
        `)
        .in("department_id", companyDeptIds)
        .eq("is_active", true)
        .order("title");

      if (posError) throw posError;

      // Get employee compensation aggregated by position
      const { data: employeeCompData } = await supabase
        .from("employee_compensation")
        .select(`
          position_id,
          amount,
          pay_element:pay_elements(code, name)
        `)
        .eq("company_id", companyId)
        .eq("is_active", true)
        .not("position_id", "is", null);

      // Group compensation by position
      const positionCompMap = new Map<string, {
        base_salary: number;
        bonus: number;
        benefits: number;
        allowances: number;
        employeeCount: number;
      }>();

      // Track unique employees per position for headcount
      const positionEmployees = new Map<string, Set<string>>();

      (employeeCompData || []).forEach((comp: any) => {
        if (!comp.position_id) return;
        
        const existing = positionCompMap.get(comp.position_id) || {
          base_salary: 0,
          bonus: 0,
          benefits: 0,
          allowances: 0,
          employeeCount: 0,
        };

        const code = comp.pay_element?.code?.toLowerCase() || "";
        const amount = comp.amount || 0;
        
        if (code.includes("base") || code.includes("salary") || code === "basic") {
          existing.base_salary += amount;
        } else if (code.includes("bonus") || code.includes("incentive")) {
          existing.bonus += amount;
        } else if (code.includes("benefit") || code.includes("insurance") || code.includes("medical")) {
          existing.benefits += amount;
        } else if (code.includes("allowance") || code.includes("housing") || code.includes("transport")) {
          existing.allowances += amount;
        } else {
          existing.base_salary += amount;
        }

        positionCompMap.set(comp.position_id, existing);
      });

      // Get actual filled headcount per position from employee_positions
      const { data: employeePositions } = await supabase
        .from("employee_positions")
        .select("position_id, employee_id")
        .eq("is_active", true);

      (employeePositions || []).forEach((ep: any) => {
        if (!positionEmployees.has(ep.position_id)) {
          positionEmployees.set(ep.position_id, new Set());
        }
        positionEmployees.get(ep.position_id)?.add(ep.employee_id);
      });

      // Build positions with compensation
      const positionsWithComp: PositionWithCompensation[] = (positionData || []).map((pos: any) => {
        const comp = positionCompMap.get(pos.id) || {
          base_salary: 0,
          bonus: 0,
          benefits: 0,
          allowances: 0,
        };
        const filledCount = positionEmployees.get(pos.id)?.size || 0;

        return {
          id: pos.id,
          title: pos.title,
          code: pos.code || "",
          department: pos.department,
          authorized_headcount: pos.authorized_headcount || 1,
          filledHeadcount: filledCount,
          compensation: {
            base_salary: comp.base_salary,
            bonus: comp.bonus,
            benefits: comp.benefits,
            allowances: comp.allowances,
            total: comp.base_salary + comp.bonus + comp.benefits + comp.allowances,
          },
          isSelected: false,
        };
      });

      return positionsWithComp;
    },
    enabled: open && !!companyId,
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const selectedItems = positions.filter(p => selectedPositions.has(p.id));
      const total = selectedItems.length;
      let imported = 0;

      for (const pos of selectedItems) {
        const baseSalary = pos.compensation.base_salary || 0;
        const overhead = baseSalary * (overheadPercentage / 100);
        const employerTax = baseSalary * (employerTaxPercentage / 100);

        const { error } = await supabase
          .from("position_budget_items")
          .insert({
            scenario_id: scenarioId,
            position_id: pos.id,
            position_title: pos.title,
            department_id: pos.department?.id || null,
            base_salary: pos.compensation.base_salary,
            bonus_amount: pos.compensation.bonus,
            benefits_amount: pos.compensation.benefits,
            allowances_amount: pos.compensation.allowances,
            overhead_amount: overhead,
            employer_taxes_amount: employerTax,
            headcount: pos.authorized_headcount,
            fte: 1.0,
            is_new_position: false,
            is_vacant: false,
            // Note: total_compensation, fully_loaded_cost, and annual_cost are generated columns
          });

        if (error) {
          console.error("Error importing position:", error);
          throw error;
        }

        imported++;
        setImportProgress(Math.round((imported / total) * 100));
      }

      return imported;
    },
    onSuccess: (count) => {
      toast.success(`Successfully imported ${count} positions into budget`);
      queryClient.invalidateQueries({ queryKey: ["position-budget-plan"] });
      onComplete();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to import positions");
      setStep("preview");
    },
  });

  const handleSelectAll = () => {
    if (selectedPositions.size === positions.length) {
      setSelectedPositions(new Set());
    } else {
      setSelectedPositions(new Set(positions.map(p => p.id)));
    }
  };

  const togglePosition = (id: string) => {
    const newSet = new Set(selectedPositions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPositions(newSet);
  };

  const handleClose = () => {
    setStep("select");
    setSelectedPositions(new Set());
    setImportProgress(0);
    onOpenChange(false);
  };

  const handleImport = () => {
    setStep("importing");
    importMutation.mutate();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const selectedItems = positions.filter(p => selectedPositions.has(p.id));
  const totalBudget = selectedItems.reduce((sum, p) => {
    const overhead = p.compensation.base_salary * (overheadPercentage / 100);
    const tax = p.compensation.base_salary * (employerTaxPercentage / 100);
    return sum + (p.compensation.total + overhead + tax) * p.authorized_headcount;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>AI Position Budget Wizard</DialogTitle>
              <DialogDescription>
                Automatically load existing positions with their compensation data
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No positions found for this company</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedPositions.size === positions.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="font-medium">
                      Select All ({positions.length} positions)
                    </Label>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {selectedPositions.size} selected
                    </span>
                    <Badge variant="secondary">
                      {formatCurrency(totalBudget)} total budget
                    </Badge>
                  </div>
                </div>

                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-2">
                    {positions.map((pos) => (
                      <div
                        key={pos.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPositions.has(pos.id)
                            ? "bg-primary/5 border-primary/30"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => togglePosition(pos.id)}
                      >
                        <Checkbox
                          checked={selectedPositions.has(pos.id)}
                          onCheckedChange={() => togglePosition(pos.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{pos.title}</p>
                            {pos.code && (
                              <Badge variant="outline" className="text-xs">
                                {pos.code}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            {pos.department && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {pos.department.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {pos.filledHeadcount}/{pos.authorized_headcount} filled
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">
                            {formatCurrency(pos.compensation.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Base: {formatCurrency(pos.compensation.base_salary)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-medium">Cost Assumptions</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Overhead %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={overheadPercentage}
                        onChange={(e) => setOverheadPercentage(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Employer Tax %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={employerTaxPercentage}
                        onChange={(e) => setEmployerTaxPercentage(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setStep("preview")}
                    disabled={selectedPositions.size === 0}
                  >
                    Preview Import ({selectedPositions.size})
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{selectedItems.length}</p>
                <p className="text-xs text-muted-foreground">Positions</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {selectedItems.reduce((sum, p) => sum + p.authorized_headcount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Headcount</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalBudget)}
                </p>
                <p className="text-xs text-muted-foreground">Total Budget</p>
              </div>
            </div>

            <ScrollArea className="h-[250px] pr-4">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2">Position</th>
                    <th className="text-right py-2">Base</th>
                    <th className="text-right py-2">Benefits</th>
                    <th className="text-right py-2">Overhead</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((pos) => {
                    const overhead = pos.compensation.base_salary * (overheadPercentage / 100);
                    const tax = pos.compensation.base_salary * (employerTaxPercentage / 100);
                    const total = (pos.compensation.total + overhead + tax) * pos.authorized_headcount;
                    return (
                      <tr key={pos.id} className="border-b">
                        <td className="py-2">
                          <div className="font-medium">{pos.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {pos.authorized_headcount} HC
                          </div>
                        </td>
                        <td className="text-right">{formatCurrency(pos.compensation.base_salary)}</td>
                        <td className="text-right">{formatCurrency(pos.compensation.benefits + pos.compensation.allowances)}</td>
                        <td className="text-right">{formatCurrency(overhead + tax)}</td>
                        <td className="text-right font-medium">{formatCurrency(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button onClick={handleImport}>
                <Sparkles className="mr-2 h-4 w-4" />
                Import {selectedItems.length} Positions
              </Button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="font-medium">Importing positions into budget...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we create budget items
              </p>
            </div>
            <Progress value={importProgress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {importProgress}% complete
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
