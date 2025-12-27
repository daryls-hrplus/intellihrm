import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface CompensationItem {
  id: string;
  pay_element_id: string;
  pay_element_code: string;
  pay_element_name: string;
  employee_amount: number;
  currency: string;
  frequency: string;
  position_amount: number | null;
  variance: number | null;
  is_active: boolean;
  rate_type?: string | null;
}

interface PositionRateInfo {
  rate_type: string | null;
  hourly_rate: number | null;
  standard_hours_per_week: number | null;
  compensation_currency: string | null;
}

interface EmployeePositionCompensationDrilldownProps {
  employeeId: string;
  positionId: string;
}

export function EmployeePositionCompensationDrilldown({
  employeeId,
  positionId,
}: EmployeePositionCompensationDrilldownProps) {
  const [compensationItems, setCompensationItems] = useState<CompensationItem[]>([]);
  const [positionRateInfo, setPositionRateInfo] = useState<PositionRateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompensationData();
  }, [employeeId, positionId]);

  const fetchCompensationData = async () => {
    setIsLoading(true);
    try {
      // Fetch employee position details for rate type info
      const { data: positionData } = await supabase
        .from("employee_positions")
        .select("rate_type, hourly_rate, standard_hours_per_week, compensation_currency")
        .eq("employee_id", employeeId)
        .eq("position_id", positionId)
        .eq("is_active", true)
        .single();
      
      if (positionData) {
        setPositionRateInfo(positionData as PositionRateInfo);
      }

      // Fetch employee compensation for this employee AND position (assignment-specific)
      const { data: employeeComp, error: empError } = await supabase
        .from("employee_compensation")
        .select(`
          id,
          pay_element_id,
          amount,
          currency,
          frequency,
          is_active,
          rate_type,
          pay_element:pay_elements!employee_compensation_pay_element_id_fkey(id, code, name)
        `)
        .eq("employee_id", employeeId)
        .eq("position_id", positionId)
        .eq("is_active", true);

      if (empError) throw empError;

      // Fetch position compensation for this position
      const { data: positionComp, error: posError } = await supabase
        .from("position_compensation")
        .select(`
          id,
          pay_element_id,
          amount,
          currency,
          frequency_id,
          is_active,
          pay_element:pay_elements!position_compensation_pay_element_id_fkey(id, code, name),
          frequency:lookup_values!position_compensation_frequency_id_fkey(code, name)
        `)
        .eq("position_id", positionId)
        .eq("is_active", true);

      if (posError) throw posError;

      // Create a map of position compensation by pay_element_id
      const positionCompMap = new Map<string, { amount: number; currency: string; frequency: string }>();
      (positionComp || []).forEach((pc: any) => {
        positionCompMap.set(pc.pay_element_id, {
          amount: pc.amount,
          currency: pc.currency,
          frequency: pc.frequency?.code || "monthly",
        });
      });

      // Build comparison items
      const items: CompensationItem[] = (employeeComp || []).map((ec: any) => {
        const posComp = positionCompMap.get(ec.pay_element_id);
        const positionAmount = posComp ? posComp.amount : null;
        const variance = positionAmount !== null ? ec.amount - positionAmount : null;

        return {
          id: ec.id,
          pay_element_id: ec.pay_element_id,
          pay_element_code: ec.pay_element?.code || "-",
          pay_element_name: ec.pay_element?.name || "-",
          employee_amount: ec.amount,
          currency: ec.currency,
          frequency: ec.frequency,
          position_amount: positionAmount,
          variance,
          is_active: ec.is_active,
        };
      });

      setCompensationItems(items);
    } catch (error) {
      console.error("Error fetching compensation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getVarianceIcon = (variance: number | null) => {
    if (variance === null) return null;
    if (variance > 0) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    if (variance < 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getVarianceBadge = (variance: number | null, currency: string) => {
    if (variance === null) {
      return <Badge variant="outline" className="text-xs">N/A</Badge>;
    }
    
    const isPositive = variance > 0;
    const isNegative = variance < 0;
    
    return (
      <div className="flex items-center gap-1">
        {getVarianceIcon(variance)}
        <span className={`text-sm font-medium ${
          isPositive ? "text-emerald-600" : isNegative ? "text-destructive" : "text-muted-foreground"
        }`}>
          {isPositive ? "+" : ""}{formatCurrency(variance, currency)}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading compensation...</span>
      </div>
    );
  }

  if (compensationItems.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No compensation records found for this assignment.
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-md p-3">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-muted-foreground">
          Assignment Compensation (Employee vs Position)
        </h5>
        {positionRateInfo && (
          <Badge 
            variant="outline" 
            className={
              positionRateInfo.rate_type === "hourly" ? "bg-blue-500/10 text-blue-700 border-blue-200" :
              positionRateInfo.rate_type === "daily" ? "bg-amber-500/10 text-amber-700 border-amber-200" :
              "bg-green-500/10 text-green-700 border-green-200"
            }
          >
            {positionRateInfo.rate_type === "hourly" && positionRateInfo.hourly_rate 
              ? `Hourly: ${new Intl.NumberFormat("en-US", { style: "currency", currency: positionRateInfo.compensation_currency || "USD" }).format(positionRateInfo.hourly_rate)}/hr` 
              : positionRateInfo.rate_type === "daily" && positionRateInfo.hourly_rate
              ? `Daily: ${new Intl.NumberFormat("en-US", { style: "currency", currency: positionRateInfo.compensation_currency || "USD" }).format(positionRateInfo.hourly_rate)}/day`
              : "Salaried"}
          </Badge>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Pay Element</TableHead>
            <TableHead className="text-xs">Frequency</TableHead>
            <TableHead className="text-xs text-right">Employee Amount</TableHead>
            <TableHead className="text-xs text-right">Position Amount</TableHead>
            <TableHead className="text-xs text-right">Variance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {compensationItems.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell className="py-2">
                <div>
                  <span className="font-medium text-sm">{item.pay_element_name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{item.pay_element_code}</Badge>
                </div>
              </TableCell>
              <TableCell className="py-2 text-sm capitalize">{item.frequency}</TableCell>
              <TableCell className="py-2 text-sm text-right font-medium">
                {formatCurrency(item.employee_amount, item.currency)}
              </TableCell>
              <TableCell className="py-2 text-sm text-right">
                {item.position_amount !== null 
                  ? formatCurrency(item.position_amount, item.currency)
                  : <span className="text-muted-foreground">Not in position</span>
                }
              </TableCell>
              <TableCell className="py-2 text-right">
                {getVarianceBadge(item.variance, item.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
