import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calculator, FileText, Download, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MexicanAnnualISRProps {
  companyId: string;
}

// 2024 Annual ISR Tax Brackets
const ANNUAL_ISR_BRACKETS = [
  { lowerLimit: 0.01, upperLimit: 8952.49, fixedFee: 0, rate: 0.0192 },
  { lowerLimit: 8952.50, upperLimit: 75984.55, fixedFee: 171.88, rate: 0.0640 },
  { lowerLimit: 75984.56, upperLimit: 133536.07, fixedFee: 4461.94, rate: 0.1088 },
  { lowerLimit: 133536.08, upperLimit: 155229.80, fixedFee: 10723.55, rate: 0.16 },
  { lowerLimit: 155229.81, upperLimit: 185852.57, fixedFee: 14194.54, rate: 0.1792 },
  { lowerLimit: 185852.58, upperLimit: 374837.88, fixedFee: 19682.13, rate: 0.2136 },
  { lowerLimit: 374837.89, upperLimit: 590795.99, fixedFee: 60049.40, rate: 0.2352 },
  { lowerLimit: 590796.00, upperLimit: 1127926.84, fixedFee: 110842.74, rate: 0.30 },
  { lowerLimit: 1127926.85, upperLimit: 1503902.46, fixedFee: 271981.99, rate: 0.32 },
  { lowerLimit: 1503902.47, upperLimit: 4511707.37, fixedFee: 392294.17, rate: 0.34 },
  { lowerLimit: 4511707.38, upperLimit: Infinity, fixedFee: 1414947.85, rate: 0.35 },
];

interface EmployeeAnnualData {
  id: string;
  employee_id: string;
  full_name: string;
  rfc: string;
  annual_income: number;
  annual_exempt: number;
  annual_taxable: number;
  annual_isr_calculated: number;
  annual_isr_withheld: number;
  annual_subsidy: number;
  difference: number;
  status: "favor" | "cargo" | "balanced";
}

export function MexicanAnnualISR({ companyId }: MexicanAnnualISRProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear() - 1);
  const [employees, setEmployees] = useState<EmployeeAnnualData[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId, fiscalYear]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, employee_id")
        .eq("company_id", companyId);

      if (error) throw error;

      // Initialize with empty annual data
      const annualData: EmployeeAnnualData[] = (data || []).map((emp: any) => ({
        id: emp.id,
        employee_id: emp.employee_id || "",
        full_name: emp.full_name || "Sin nombre",
        rfc: "",
        annual_income: 0,
        annual_exempt: 0,
        annual_taxable: 0,
        annual_isr_calculated: 0,
        annual_isr_withheld: 0,
        annual_subsidy: 0,
        difference: 0,
        status: "balanced" as const,
      }));

      setEmployees(annualData);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnnualISR = (taxableIncome: number): number => {
    const bracket = ANNUAL_ISR_BRACKETS.find(
      (b) => taxableIncome >= b.lowerLimit && taxableIncome <= b.upperLimit
    );

    if (!bracket) return 0;

    const excessOverLimit = taxableIncome - bracket.lowerLimit;
    return bracket.fixedFee + excessOverLimit * bracket.rate;
  };

  const runAnnualCalculation = async () => {
    setCalculating(true);
    setProgress(0);

    try {
      // Simulate fetching annual payroll data and calculating
      const updatedEmployees = [...employees];
      
      for (let i = 0; i < updatedEmployees.length; i++) {
        // Simulate random annual data for demonstration
        const annualIncome = Math.random() * 500000 + 100000;
        const exemptPercentage = Math.random() * 0.15;
        const annualExempt = annualIncome * exemptPercentage;
        const annualTaxable = annualIncome - annualExempt;
        const annualISRCalculated = calculateAnnualISR(annualTaxable);
        const annualISRWithheld = annualISRCalculated * (0.95 + Math.random() * 0.1);
        const annualSubsidy = Math.random() * 5000;
        const difference = annualISRCalculated - annualISRWithheld - annualSubsidy;

        updatedEmployees[i] = {
          ...updatedEmployees[i],
          rfc: `XXXX${Math.random().toString(36).substring(2, 8).toUpperCase()}XXX`,
          annual_income: annualIncome,
          annual_exempt: annualExempt,
          annual_taxable: annualTaxable,
          annual_isr_calculated: annualISRCalculated,
          annual_isr_withheld: annualISRWithheld,
          annual_subsidy: annualSubsidy,
          difference: difference,
          status: difference > 100 ? "cargo" : difference < -100 ? "favor" : "balanced",
        };

        setProgress(((i + 1) / updatedEmployees.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setEmployees(updatedEmployees);
      toast({
        title: "Cálculo Completado",
        description: `Se procesaron ${updatedEmployees.length} empleados para el año fiscal ${fiscalYear}`,
      });
    } catch (error: any) {
      console.error("Error calculating annual ISR:", error);
      toast({
        title: "Error",
        description: "Error al calcular el ISR anual",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const exportToExcel = () => {
    const headers = [
      "Empleado",
      "RFC",
      "Ingresos Anuales",
      "Exentos",
      "Gravados",
      "ISR Calculado",
      "ISR Retenido",
      "Subsidio",
      "Diferencia",
      "Estado",
    ];

    const rows = employees.map((emp) => [
      emp.full_name,
      emp.rfc,
      emp.annual_income.toFixed(2),
      emp.annual_exempt.toFixed(2),
      emp.annual_taxable.toFixed(2),
      emp.annual_isr_calculated.toFixed(2),
      emp.annual_isr_withheld.toFixed(2),
      emp.annual_subsidy.toFixed(2),
      emp.difference.toFixed(2),
      emp.status === "favor" ? "A Favor" : emp.status === "cargo" ? "A Cargo" : "Balanceado",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ISR_Anual_${fiscalYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "Archivo CSV descargado",
    });
  };

  const totalISRCalculated = employees.reduce((sum, e) => sum + e.annual_isr_calculated, 0);
  const totalISRWithheld = employees.reduce((sum, e) => sum + e.annual_isr_withheld, 0);
  const totalDifference = employees.reduce((sum, e) => sum + e.difference, 0);
  const employeesAFavor = employees.filter((e) => e.status === "favor").length;
  const employeesACargo = employees.filter((e) => e.status === "cargo").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Cálculo Anual de ISR
        </CardTitle>
        <CardDescription>
          Ajuste anual de Impuesto Sobre la Renta conforme al Art. 97 LISR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>Año Fiscal</Label>
            <Select value={fiscalYear.toString()} onValueChange={(v) => setFiscalYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2022, 2023, 2024].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={runAnnualCalculation} disabled={calculating || loading}>
            {calculating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Calcular ISR Anual
          </Button>
          <Button variant="outline" onClick={exportToExcel} disabled={employees.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Progress */}
        {calculating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Procesando empleados...</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Empleados</div>
            <div className="text-2xl font-bold">{employees.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">ISR Calculado</div>
            <div className="text-xl font-bold">{formatCurrency(totalISRCalculated)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">ISR Retenido</div>
            <div className="text-xl font-bold">{formatCurrency(totalISRWithheld)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              A Favor
            </div>
            <div className="text-2xl font-bold text-green-600">{employeesAFavor}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              A Cargo
            </div>
            <div className="text-2xl font-bold text-amber-600">{employeesACargo}</div>
          </Card>
        </div>

        {/* Results Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>RFC</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Gravados</TableHead>
                <TableHead className="text-right">ISR Calc.</TableHead>
                <TableHead className="text-right">ISR Ret.</TableHead>
                <TableHead className="text-right">Diferencia</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.slice(0, 20).map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="font-medium">{emp.full_name}</div>
                    <div className="text-xs text-muted-foreground">{emp.employee_id}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{emp.rfc || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.annual_income)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.annual_taxable)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.annual_isr_calculated)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.annual_isr_withheld)}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      emp.status === "favor"
                        ? "text-green-600"
                        : emp.status === "cargo"
                        ? "text-amber-600"
                        : ""
                    }`}
                  >
                    {formatCurrency(Math.abs(emp.difference))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        emp.status === "favor"
                          ? "default"
                          : emp.status === "cargo"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {emp.status === "favor" ? "A Favor" : emp.status === "cargo" ? "A Cargo" : "OK"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div className="font-medium">Notas del Cálculo Anual:</div>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>El ajuste anual es obligatorio para patrones con empleados que laboraron todo el año</li>
            <li>Empleados que trabajaron menos de 12 meses o tuvieron otros ingresos deben presentar declaración anual</li>
            <li>El saldo a favor se compensa en la nómina de diciembre o enero siguiente</li>
            <li>El saldo a cargo se retiene en pagos subsecuentes (máximo 3 meses)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
