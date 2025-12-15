import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, Briefcase, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SalarySummarySectionProps {
  companyId: string;
  employeeId: string;
}

interface PositionData {
  position_title: string;
  compensation_amount: number;
  compensation_currency: string;
  compensation_frequency: string;
}

interface CompensationItem {
  id: string;
  amount: number;
  currency: string;
  frequency: string;
  pay_element_name: string;
  pay_element_code: string;
}

export function SalarySummarySection({ companyId, employeeId }: SalarySummarySectionProps) {
  const { t } = useTranslation();
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const [compensationItems, setCompensationItems] = useState<CompensationItem[]>([]);
  const [employeeName, setEmployeeName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      loadSalaryData();
    }
  }, [employeeId]);

  const loadSalaryData = async () => {
    setIsLoading(true);
    try {
      // Load employee position with salary
      const { data: posData, error: posError } = await supabase
        .from('employee_positions')
        .select(`
          compensation_amount,
          compensation_currency,
          compensation_frequency,
          positions (title)
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .eq('is_primary', true)
        .maybeSingle();

      if (posError) throw posError;

      if (posData) {
        setPositionData({
          position_title: (posData.positions as any)?.title || 'N/A',
          compensation_amount: posData.compensation_amount || 0,
          compensation_currency: posData.compensation_currency || 'USD',
          compensation_frequency: posData.compensation_frequency || 'monthly'
        });
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
          pay_element_code: (item.pay_elements as any)?.code || ''
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

  const totalMonthlyComp = compensationItems.reduce((sum, item) => {
    // Convert to monthly for comparison
    let monthlyAmount = item.amount;
    if (item.frequency === 'annual') monthlyAmount = item.amount / 12;
    if (item.frequency === 'weekly') monthlyAmount = item.amount * 4.33;
    if (item.frequency === 'biweekly') monthlyAmount = item.amount * 2.17;
    return sum + monthlyAmount;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t("payroll.salaryOvertime.salarySummary", "Salary Summary")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee & Position Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("payroll.salaryOvertime.employee")}</p>
              <p className="font-medium">{employeeName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("payroll.salaryOvertime.position", "Position")}</p>
              <p className="font-medium">{positionData?.position_title || 'N/A'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Position Salary */}
        {positionData && positionData.compensation_amount > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("payroll.salaryOvertime.positionSalary", "Position Base Salary")}
            </h4>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div>
                <p className="font-medium">{t("payroll.salaryOvertime.baseSalary", "Base Salary")}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFrequency(positionData.compensation_frequency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(positionData.compensation_amount, positionData.compensation_currency)}
                </p>
                <Badge variant="outline">{positionData.compensation_currency}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Additional Compensation Items */}
        {compensationItems.length > 0 && (
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
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.amount, item.currency)}
                    </p>
                    <Badge variant="secondary" className="text-xs">{item.currency}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Summary */}
        {(positionData?.compensation_amount || compensationItems.length > 0) && (
          <>
            <Separator />
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <div>
                <p className="font-semibold">{t("payroll.salaryOvertime.totalCompensation", "Total Compensation")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("payroll.salaryOvertime.monthlyEquivalent", "Monthly equivalent")}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(
                  (positionData?.compensation_amount || 0) + totalMonthlyComp,
                  positionData?.compensation_currency || 'USD'
                )}
              </p>
            </div>
          </>
        )}

        {!positionData?.compensation_amount && compensationItems.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            {t("payroll.salaryOvertime.noSalaryConfigured", "No salary configured for this employee")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
