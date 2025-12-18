import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Repeat, Target, Calendar, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RegularDeductionsSectionProps {
  companyId: string;
  employeeId: string;
  payPeriodId: string;
  onApplyDeductions?: (deductionIds: string[]) => void;
}

interface RegularDeduction {
  id: string;
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
  institution_name: string | null;
  account_number: string | null;
  is_active: boolean;
}

export function RegularDeductionsSection({ 
  companyId, 
  employeeId, 
  payPeriodId,
  onApplyDeductions 
}: RegularDeductionsSectionProps) {
  const navigate = useNavigate();
  const [deductions, setDeductions] = useState<RegularDeduction[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadDeductions();
  }, [employeeId]);

  const loadDeductions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('employee_regular_deductions')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('is_active', true)
      .order('deduction_name');
    
    if (error) {
      toast.error("Failed to load regular deductions");
      setIsLoading(false);
      return;
    }
    setDeductions(data || []);
    // Pre-select all active deductions
    setSelectedIds((data || []).map(d => d.id));
    setIsLoading(false);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === deductions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deductions.map(d => d.id));
    }
  };

  const handleApplyDeductions = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one deduction to apply");
      return;
    }

    setIsApplying(true);
    const selectedDeductions = deductions.filter(d => selectedIds.includes(d.id));
    
    // Insert selected deductions into employee_period_deductions
    const inserts = selectedDeductions.map(d => ({
      company_id: companyId,
      employee_id: employeeId,
      pay_period_id: payPeriodId,
      deduction_name: d.deduction_name,
      deduction_code: d.deduction_code,
      deduction_type: d.deduction_type || 'other',
      amount: d.amount,
      currency: d.currency,
      is_pretax: d.is_pretax,
      institution_name: d.institution_name || null,
      account_number: d.account_number || null,
      notes: 'Regular deduction'
    }));

    const { error } = await supabase
      .from('employee_period_deductions')
      .insert(inserts);

    if (error) {
      console.error("Failed to apply deductions:", error);
      toast.error(`Failed to apply deductions: ${error.message}`);
      setIsApplying(false);
      return;
    }

    toast.success(`${selectedDeductions.length} deduction(s) applied to this pay period`);
    setIsApplying(false);
    onApplyDeductions?.(selectedIds);
  };

  const getProgress = (deduction: RegularDeduction) => {
    if (deduction.goal_amount) {
      const percent = Math.min((deduction.amount_deducted / deduction.goal_amount) * 100, 100);
      return (
        <div className="flex items-center gap-1 text-xs">
          <Target className="h-3 w-3" />
          <span>{percent.toFixed(0)}% of goal</span>
        </div>
      );
    }
    if (deduction.total_cycles) {
      return (
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          <span>{deduction.completed_cycles}/{deduction.total_cycles} cycles</span>
        </div>
      );
    }
    return <span className="text-xs text-muted-foreground">Ongoing</span>;
  };

  const totalSelected = deductions
    .filter(d => selectedIds.includes(d.id))
    .reduce((sum, d) => sum + d.amount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading regular deductions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Regular Deductions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Recurring deductions configured for this employee
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/payroll/regular-deductions')}
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Manage
        </Button>
      </CardHeader>
      <CardContent>
        {deductions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No active regular deductions for this employee
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedIds.length === deductions.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Deduction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Pre-tax</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductions.map((deduction) => (
                  <TableRow key={deduction.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(deduction.id)}
                        onCheckedChange={() => toggleSelection(deduction.id)}
                      />
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
                    </TableCell>
                    <TableCell>{getProgress(deduction)}</TableCell>
                    <TableCell>
                      <Badge variant={deduction.is_pretax ? "default" : "secondary"}>
                        {deduction.is_pretax ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Selected: </span>
                <span className="font-medium">{selectedIds.length} of {deductions.length}</span>
                <span className="mx-2">|</span>
                <span className="text-muted-foreground">Total: </span>
                <span className="font-medium">${totalSelected.toFixed(2)}</span>
              </div>
              <Button 
                onClick={handleApplyDeductions}
                disabled={selectedIds.length === 0 || isApplying}
              >
                {isApplying ? 'Applying...' : 'Apply to Pay Period'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
