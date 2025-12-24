import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
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
  amount: number;
  currency: string;
  frequency: string;
  is_active: boolean;
}

interface TransactionCompensationDrilldownProps {
  employeeId: string;
  positionId: string;
  effectiveDate: string;
}

/**
 * Displays compensation records tied to a specific transaction,
 * filtered by matching start_date with the transaction's effective_date.
 */
export function TransactionCompensationDrilldown({
  employeeId,
  positionId,
  effectiveDate,
}: TransactionCompensationDrilldownProps) {
  const [compensationItems, setCompensationItems] = useState<CompensationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompensationData();
  }, [employeeId, positionId, effectiveDate]);

  const fetchCompensationData = async () => {
    setIsLoading(true);
    try {
      // Fetch employee compensation for this employee/position where start_date matches transaction effective_date
      const { data: employeeComp, error } = await supabase
        .from("employee_compensation")
        .select(`
          id,
          pay_element_id,
          amount,
          currency,
          frequency,
          is_active,
          pay_element:pay_elements!employee_compensation_pay_element_id_fkey(id, code, name)
        `)
        .eq("employee_id", employeeId)
        .eq("position_id", positionId)
        .eq("start_date", effectiveDate);

      if (error) throw error;

      const items: CompensationItem[] = (employeeComp || []).map((ec: any) => ({
        id: ec.id,
        pay_element_id: ec.pay_element_id,
        pay_element_code: ec.pay_element?.code || "-",
        pay_element_name: ec.pay_element?.name || "-",
        amount: ec.amount,
        currency: ec.currency,
        frequency: ec.frequency,
        is_active: ec.is_active,
      }));

      setCompensationItems(items);
    } catch (error) {
      console.error("Error fetching compensation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount);
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
        No compensation records linked to this transaction.
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-md p-3">
      <h5 className="text-sm font-medium mb-2 text-muted-foreground">
        Transaction Compensation
      </h5>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Pay Element</TableHead>
            <TableHead className="text-xs">Frequency</TableHead>
            <TableHead className="text-xs text-right">Amount</TableHead>
            <TableHead className="text-xs text-center">Status</TableHead>
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
                {formatCurrency(item.amount, item.currency)}
              </TableCell>
              <TableCell className="py-2 text-center">
                <Badge variant={item.is_active ? "default" : "outline"} className="text-xs">
                  {item.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
