import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Download,
  ArrowUpDown
} from "lucide-react";

interface MultiPeriodComparisonProps {
  companyId: string;
}

interface PeriodData {
  period: string;
  employees: number;
  gross_pay: number;
  net_pay: number;
  isr: number;
  imss_employer: number;
  imss_employee: number;
  infonavit: number;
  total_deductions: number;
  overtime: number;
  bonuses: number;
}

export function MultiPeriodComparison({ companyId }: MultiPeriodComparisonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [period1, setPeriod1] = useState("2024-01");
  const [period2, setPeriod2] = useState("2024-02");
  const [periodData, setPeriodData] = useState<PeriodData[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);

  useEffect(() => {
    generateMockData();
  }, []);

  useEffect(() => {
    if (period1 && period2) {
      calculateComparison();
    }
  }, [period1, period2, periodData]);

  const generateMockData = () => {
    const data: PeriodData[] = [];
    const baseEmployees = 120;
    const baseGross = 2500000;

    for (let i = 0; i < 12; i++) {
      const month = String(i + 1).padStart(2, "0");
      const variation = 1 + (Math.random() - 0.5) * 0.1;
      const grossPay = baseGross * variation;
      const isr = grossPay * 0.15;
      const imssEmployee = grossPay * 0.03;
      const imssEmployer = grossPay * 0.08;
      const infonavit = grossPay * 0.05;

      data.push({
        period: `2024-${month}`,
        employees: Math.floor(baseEmployees + (Math.random() - 0.5) * 10),
        gross_pay: grossPay,
        net_pay: grossPay - isr - imssEmployee,
        isr,
        imss_employer: imssEmployer,
        imss_employee: imssEmployee,
        infonavit,
        total_deductions: isr + imssEmployee + infonavit,
        overtime: grossPay * 0.05 * Math.random(),
        bonuses: grossPay * 0.03 * Math.random(),
      });
    }

    setPeriodData(data);
  };

  const calculateComparison = () => {
    const p1 = periodData.find(p => p.period === period1);
    const p2 = periodData.find(p => p.period === period2);

    if (!p1 || !p2) return;

    const comparison = {
      employees: {
        period1: p1.employees,
        period2: p2.employees,
        change: p2.employees - p1.employees,
        percentChange: ((p2.employees - p1.employees) / p1.employees) * 100,
      },
      gross_pay: {
        period1: p1.gross_pay,
        period2: p2.gross_pay,
        change: p2.gross_pay - p1.gross_pay,
        percentChange: ((p2.gross_pay - p1.gross_pay) / p1.gross_pay) * 100,
      },
      net_pay: {
        period1: p1.net_pay,
        period2: p2.net_pay,
        change: p2.net_pay - p1.net_pay,
        percentChange: ((p2.net_pay - p1.net_pay) / p1.net_pay) * 100,
      },
      isr: {
        period1: p1.isr,
        period2: p2.isr,
        change: p2.isr - p1.isr,
        percentChange: ((p2.isr - p1.isr) / p1.isr) * 100,
      },
      imss_employer: {
        period1: p1.imss_employer,
        period2: p2.imss_employer,
        change: p2.imss_employer - p1.imss_employer,
        percentChange: ((p2.imss_employer - p1.imss_employer) / p1.imss_employer) * 100,
      },
      overtime: {
        period1: p1.overtime,
        period2: p2.overtime,
        change: p2.overtime - p1.overtime,
        percentChange: p1.overtime > 0 ? ((p2.overtime - p1.overtime) / p1.overtime) * 100 : 0,
      },
    };

    setComparisonData(comparison);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const getTrendIcon = (percentChange: number) => {
    if (percentChange > 1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentChange < -1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendBadge = (percentChange: number) => {
    const formatted = `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(1)}%`;
    if (percentChange > 1) return <Badge className="bg-green-500">{formatted}</Badge>;
    if (percentChange < -1) return <Badge variant="destructive">{formatted}</Badge>;
    return <Badge variant="secondary">{formatted}</Badge>;
  };

  const chartData = periodData.map(p => ({
    period: p.period.substring(5),
    "Nómina Bruta": p.gross_pay,
    "Nómina Neta": p.net_pay,
    "ISR": p.isr,
    "IMSS Patrón": p.imss_employer,
  }));

  const periods = periodData.map(p => p.period);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Comparación Multi-Período
        </CardTitle>
        <CardDescription>
          Compare métricas de nómina entre diferentes períodos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selectors */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>Período Base</Label>
            <Select value={period1} onValueChange={setPeriod1}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label>Período Comparación</Label>
            <Select value={period2} onValueChange={setPeriod2}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Comparison Table */}
        {comparisonData && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">{period1}</TableHead>
                <TableHead className="text-right">{period2}</TableHead>
                <TableHead className="text-right">Diferencia</TableHead>
                <TableHead className="text-right">Variación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Empleados</TableCell>
                <TableCell className="text-right">{comparisonData.employees.period1}</TableCell>
                <TableCell className="text-right">{comparisonData.employees.period2}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-1">
                  {getTrendIcon(comparisonData.employees.percentChange)}
                  {comparisonData.employees.change > 0 ? "+" : ""}{comparisonData.employees.change}
                </TableCell>
                <TableCell className="text-right">
                  {getTrendBadge(comparisonData.employees.percentChange)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Nómina Bruta</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.gross_pay.period1)}</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.gross_pay.period2)}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-1">
                  {getTrendIcon(comparisonData.gross_pay.percentChange)}
                  {formatCurrency(comparisonData.gross_pay.change)}
                </TableCell>
                <TableCell className="text-right">
                  {getTrendBadge(comparisonData.gross_pay.percentChange)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Nómina Neta</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.net_pay.period1)}</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.net_pay.period2)}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-1">
                  {getTrendIcon(comparisonData.net_pay.percentChange)}
                  {formatCurrency(comparisonData.net_pay.change)}
                </TableCell>
                <TableCell className="text-right">
                  {getTrendBadge(comparisonData.net_pay.percentChange)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ISR Retenido</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.isr.period1)}</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.isr.period2)}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-1">
                  {getTrendIcon(comparisonData.isr.percentChange)}
                  {formatCurrency(comparisonData.isr.change)}
                </TableCell>
                <TableCell className="text-right">
                  {getTrendBadge(comparisonData.isr.percentChange)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">IMSS Patronal</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.imss_employer.period1)}</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.imss_employer.period2)}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-1">
                  {getTrendIcon(comparisonData.imss_employer.percentChange)}
                  {formatCurrency(comparisonData.imss_employer.change)}
                </TableCell>
                <TableCell className="text-right">
                  {getTrendBadge(comparisonData.imss_employer.percentChange)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Horas Extra</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.overtime.period1)}</TableCell>
                <TableCell className="text-right">{formatCurrency(comparisonData.overtime.period2)}</TableCell>
                <TableCell className="text-right flex items-center justify-end gap-1">
                  {getTrendIcon(comparisonData.overtime.percentChange)}
                  {formatCurrency(comparisonData.overtime.change)}
                </TableCell>
                <TableCell className="text-right">
                  {getTrendBadge(comparisonData.overtime.percentChange)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencia Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="Nómina Bruta" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="Nómina Neta" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="ISR" stroke="#ff7c43" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparación Visual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: period1, ...periodData.find(p => p.period === period1) },
                  { name: period2, ...periodData.find(p => p.period === period2) },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="gross_pay" name="Bruto" fill="#8884d8" />
                <Bar dataKey="net_pay" name="Neto" fill="#82ca9d" />
                <Bar dataKey="isr" name="ISR" fill="#ff7c43" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
