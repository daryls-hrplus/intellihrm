import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe } from "lucide-react";
import { usePayrollRunExchangeRates } from "@/hooks/useMultiCurrencyPayroll";
import { useCurrencies } from "@/hooks/useCurrencies";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface PayrollCurrencyRatesCardProps {
  payrollRunId: string;
}

export function PayrollCurrencyRatesCard({ payrollRunId }: PayrollCurrencyRatesCardProps) {
  const { data: exchangeRates, isLoading: ratesLoading } = usePayrollRunExchangeRates(payrollRunId);
  const { currencies, isLoading: currenciesLoading } = useCurrencies();

  const isLoading = ratesLoading || currenciesLoading;

  const getCurrencyCode = (currencyId: string) => {
    const currency = currencies?.find(c => c.id === currencyId);
    return currency?.code || currencyId;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Payroll Currency Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exchangeRates || exchangeRates.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Payroll Currency Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No exchange rates configured for this payroll run
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4" />
          Payroll Currency Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exchangeRates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell className="font-medium">
                  {getCurrencyCode(rate.from_currency_id)}
                </TableCell>
                <TableCell className="font-medium">
                  {getCurrencyCode(rate.to_currency_id)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {rate.exchange_rate.toFixed(6)}
                </TableCell>
                <TableCell>
                  {rate.rate_date ? format(new Date(rate.rate_date), "yyyy-MM-dd") : "-"}
                </TableCell>
                <TableCell className="capitalize">
                  {rate.source || "Manual"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
