import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useHourlyPayrollCalculation, HourlyEmployeeData } from "@/hooks/useHourlyPayrollCalculation";
import { Clock, DollarSign, Timer } from "lucide-react";

interface HourlyPayrollPreviewProps {
  companyId: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
}

export function HourlyPayrollPreview({
  companyId,
  employeeId,
  periodStart,
  periodEnd
}: HourlyPayrollPreviewProps) {
  const [hourlyData, setHourlyData] = useState<HourlyEmployeeData | null>(null);
  const [isHourly, setIsHourly] = useState(false);
  
  const { 
    isCalculating, 
    calculateHourlyPay, 
    isHourlyEmployee 
  } = useHourlyPayrollCalculation();

  useEffect(() => {
    const loadData = async () => {
      // First check if employee is hourly-based
      const hourlyCheck = await isHourlyEmployee(employeeId);
      setIsHourly(hourlyCheck);
      
      if (!hourlyCheck) {
        setHourlyData(null);
        return;
      }

      // Calculate hourly pay
      const data = await calculateHourlyPay(employeeId, companyId, periodStart, periodEnd);
      setHourlyData(data);
    };

    if (employeeId && companyId && periodStart && periodEnd) {
      loadData();
    }
  }, [employeeId, companyId, periodStart, periodEnd, calculateHourlyPay, isHourlyEmployee]);

  // Don't show anything for non-hourly employees
  if (!isHourly) {
    return null;
  }

  if (isCalculating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hours-Based Pay Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hourlyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hours-Based Pay Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No work records found for this period. Import time data to calculate hours-based pay.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: hourlyData.currency || 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Hours-Based Pay Calculation
          <Badge variant="outline" className="ml-2">
            {hourlyData.rateType.charAt(0).toUpperCase() + hourlyData.rateType.slice(1)} Rate
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Base Rate Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Hourly Rate:</span>
              <span className="font-medium">{formatCurrency(hourlyData.baseRate)}/hr</span>
            </div>
          </div>

          {/* Hours & Pay Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Regular Hours</TableCell>
                <TableCell className="text-right">{hourlyData.regularHours.toFixed(2)}</TableCell>
                <TableCell className="text-right">{formatCurrency(hourlyData.baseRate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(hourlyData.regularPay)}</TableCell>
              </TableRow>
              {hourlyData.overtimeHours > 0 && (
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      Overtime Hours
                      <Badge variant="secondary" className="text-xs">1.5x</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{hourlyData.overtimeHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(hourlyData.baseRate * 1.5)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(hourlyData.overtimePay)}</TableCell>
                </TableRow>
              )}
              {hourlyData.holidayHours > 0 && (
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      Holiday Hours
                      <Badge variant="secondary" className="text-xs">2.5x</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{hourlyData.holidayHours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(hourlyData.baseRate * 2.5)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(hourlyData.holidayPay)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Total Hours:</span>
              <span className="font-medium">
                {(hourlyData.regularHours + hourlyData.overtimeHours + hourlyData.holidayHours).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hours-Based Earnings:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(hourlyData.totalHoursBasedPay)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
