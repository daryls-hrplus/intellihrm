import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, Briefcase, User, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

interface SalarySummarySectionProps {
  companyId: string;
  employeeId: string;
  payGroupId?: string;
}

interface PositionData {
  id: string;
  position_id: string;
  position_title: string;
  compensation_amount: number;
  compensation_currency: string;
  compensation_frequency: string;
  is_primary: boolean;
  start_date: string | null;
  end_date: string | null;
}

interface CompensationItem {
  id: string;
  amount: number;
  currency: string;
  frequency: string;
  pay_element_name: string;
  pay_element_code: string;
  start_date: string | null;
  end_date: string | null;
}

export function SalarySummarySection({ companyId, employeeId, payGroupId }: SalarySummarySectionProps) {
  const { t } = useTranslation();
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [compensationItems, setCompensationItems] = useState<CompensationItem[]>([]);
  const [employeeName, setEmployeeName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      loadSalaryData();
    }
  }, [employeeId, payGroupId]);

  const loadSalaryData = async () => {
    setIsLoading(true);
    try {
      // Load all active positions for this employee in the specified pay group
      let posQuery = supabase
        .from('employee_positions')
        .select(`
          id,
          position_id,
          compensation_amount,
          compensation_currency,
          compensation_frequency,
          is_primary,
          start_date,
          end_date,
          positions (title)
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);
      
      // If payGroupId is provided, filter by it
      if (payGroupId) {
        posQuery = posQuery.eq('pay_group_id', payGroupId);
      }

      const { data: posData, error: posError } = await posQuery.order('is_primary', { ascending: false });

      if (posError) throw posError;

      if (posData && posData.length > 0) {
        setPositions(posData.map(pos => ({
          id: pos.id,
          position_id: pos.position_id,
          position_title: (pos.positions as any)?.title || 'N/A',
          compensation_amount: pos.compensation_amount || 0,
          compensation_currency: pos.compensation_currency || 'USD',
          compensation_frequency: pos.compensation_frequency || 'monthly',
          is_primary: pos.is_primary,
          start_date: pos.start_date,
          end_date: pos.end_date
        })));
      } else {
        setPositions([]);
      }

      // Load employee name
      const { data: empData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', employeeId)
        .single();

      if (empData) {
        setEmployeeName(empData.full_name || 'N/A');
      }

      // Load additional compensation items
      const { data: compData, error: compError } = await supabase
        .from('employee_compensation')
        .select(`
          id,
          amount,
          currency,
          frequency,
          start_date,
          end_date,
          pay_elements (name, code)
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (compError) throw compError;

      if (compData) {
        setCompensationItems(compData.map(item => ({
          id: item.id,
          amount: item.amount || 0,
          currency: item.currency || 'USD',
          frequency: item.frequency || 'monthly',
          pay_element_name: (item.pay_elements as any)?.name || 'N/A',
          pay_element_code: (item.pay_elements as any)?.code || '',
          start_date: item.start_date,
          end_date: item.end_date
        })));
      }
    } catch (error) {
      console.error('Error loading salary data:', error);
      toast.error(t("payroll.salaryOvertime.failedToLoadSalary"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatFrequency = (freq: string) => {
    const frequencies: Record<string, string> = {
      monthly: t("compensation.frequencies.monthly", "Monthly"),
      biweekly: t("compensation.frequencies.biweekly", "Bi-weekly"),
      weekly: t("compensation.frequencies.weekly", "Weekly"),
      annual: t("compensation.frequencies.annual", "Annual")
    };
    return frequencies[freq] || freq;
  };

  const convertToMonthly = (amount: number, frequency: string): number => {
    switch (frequency) {
      case 'annual': return amount / 12;
      case 'weekly': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      default: return amount;
    }
  };

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return null;
    const start = startDate ? format(parseISO(startDate), 'MMM d, yyyy') : 'N/A';
    const end = endDate ? format(parseISO(endDate), 'MMM d, yyyy') : 'Ongoing';
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals from positions
  const totalPositionMonthlyComp = positions.reduce((sum, pos) => {
    return sum + convertToMonthly(pos.compensation_amount, pos.compensation_frequency);
  }, 0);

  // Calculate totals from additional compensation items
  const totalCompItemsMonthlyComp = compensationItems.reduce((sum, item) => {
    return sum + convertToMonthly(item.amount, item.frequency);
  }, 0);

  const totalMonthlyComp = totalPositionMonthlyComp + totalCompItemsMonthlyComp;
  const primaryCurrency = positions.length > 0 
    ? positions[0].compensation_currency 
    : (compensationItems.length > 0 ? compensationItems[0].currency : 'USD');

  const hasMultiplePositions = positions.length > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t("payroll.salaryOvertime.salarySummary", "Salary Summary")}
          {hasMultiplePositions && (
            <Badge variant="secondary" className="ml-2">
              {positions.length} Positions
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">{t("payroll.salaryOvertime.employee")}</p>
            <p className="font-medium">{employeeName}</p>
          </div>
        </div>

        <Separator />

        {/* Positions with Compensation */}
        {positions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {hasMultiplePositions 
                ? t("payroll.salaryOvertime.positionsInPayGroup", "Positions in Pay Group")
                : t("payroll.salaryOvertime.position", "Position")
              }
            </h4>
            <div className="space-y-2">
              {positions.map((pos) => (
                <div 
                  key={pos.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{pos.position_title}</p>
                        {pos.is_primary && (
                          <Badge variant="outline" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatFrequency(pos.compensation_frequency)}
                      </p>
                      {formatDateRange(pos.start_date, pos.end_date) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateRange(pos.start_date, pos.end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(pos.compensation_amount, pos.compensation_currency)}
                    </p>
                    <Badge variant="outline">{pos.compensation_currency}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Compensation Items */}
        {compensationItems.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                {t("payroll.salaryOvertime.additionalCompensation", "Additional Compensation")}
              </h4>
              <div className="space-y-2">
                {compensationItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <p className="font-medium">{item.pay_element_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.pay_element_code} • {formatFrequency(item.frequency)}
                      </p>
                      {formatDateRange(item.start_date, item.end_date) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateRange(item.start_date, item.end_date)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(item.amount, item.currency)}
                      </p>
                      <Badge variant="outline">{item.currency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Total Summary */}
        {(positions.length > 0 || compensationItems.length > 0) && (
          <>
            <Separator />
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <div>
                <p className="font-semibold">{t("payroll.salaryOvertime.totalCompensation", "Total Compensation")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("payroll.salaryOvertime.monthlyEquivalent", "Monthly equivalent")}
                  {hasMultiplePositions && ` • ${positions.length} positions combined`}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalMonthlyComp, primaryCurrency)}
              </p>
            </div>
          </>
        )}

        {positions.length === 0 && compensationItems.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            {t("payroll.salaryOvertime.noSalaryConfigured", "No salary configured for this employee")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}