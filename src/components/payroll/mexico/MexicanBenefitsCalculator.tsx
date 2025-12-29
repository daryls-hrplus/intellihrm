import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, differenceInYears, addYears } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Calculator, Gift, Palmtree, Users, Briefcase, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface MexicanBenefitsCalculatorProps {
  companyId: string;
  employeeId?: string;
}

interface VacationTable {
  years: number;
  days: number;
}

const VACATION_TABLE: VacationTable[] = [
  { years: 1, days: 12 },
  { years: 2, days: 14 },
  { years: 3, days: 16 },
  { years: 4, days: 18 },
  { years: 5, days: 20 },
  { years: 6, days: 22 },
  { years: 7, days: 22 },
  { years: 8, days: 22 },
  { years: 9, days: 22 },
  { years: 10, days: 22 },
  { years: 11, days: 24 },
  { years: 16, days: 26 },
  { years: 21, days: 28 },
  { years: 26, days: 30 },
  { years: 31, days: 32 },
];

const VACATION_PREMIUM_RATE = 0.25; // 25%
const AGUINALDO_DAYS = 15; // Minimum by law
const UMA_DAILY_2024 = 108.57; // UMA daily value 2024

interface CalculationResult {
  concept: string;
  days: number;
  dailyRate: number;
  amount: number;
  taxable: boolean;
  exempt: number;
  taxableAmount: number;
}

interface FiniquitoResult {
  concept: string;
  amount: number;
  isDeduction: boolean;
}

export function MexicanBenefitsCalculator({ companyId, employeeId }: MexicanBenefitsCalculatorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("aguinaldo");
  const [loading, setLoading] = useState(false);
  
  // Common inputs
  const [dailySalary, setDailySalary] = useState<number>(0);
  const [hireDate, setHireDate] = useState<Date>();
  const [terminationDate, setTerminationDate] = useState<Date>();
  const [calculationYear, setCalculationYear] = useState(new Date().getFullYear());
  
  // Aguinaldo results
  const [aguinaldoResult, setAguinaldoResult] = useState<CalculationResult | null>(null);
  
  // Vacation results
  const [vacationResult, setVacationResult] = useState<CalculationResult[]>([]);
  
  // PTU inputs
  const [ptuPool, setPtuPool] = useState<number>(0);
  const [daysWorked, setDaysWorked] = useState<number>(365);
  const [totalCompanyDays, setTotalCompanyDays] = useState<number>(0);
  const [totalCompanySalaries, setTotalCompanySalaries] = useState<number>(0);
  const [employeeAnnualSalary, setEmployeeAnnualSalary] = useState<number>(0);
  const [ptuResult, setPtuResult] = useState<{ daysFactor: number; salaryFactor: number; total: number } | null>(null);
  
  // Finiquito results
  const [finiquitoResults, setFiniquitoResults] = useState<FiniquitoResult[]>([]);
  const [terminationType, setTerminationType] = useState<"voluntary" | "justified" | "unjustified">("voluntary");

  const getVacationDays = (yearsWorked: number): number => {
    // 2023 reform: increased vacation days
    const entry = VACATION_TABLE.filter(v => v.years <= yearsWorked).pop();
    return entry?.days || 12;
  };

  const calculateAguinaldo = () => {
    if (!hireDate || dailySalary <= 0) {
      toast({ title: "Error", description: "Ingrese fecha de contratación y salario diario", variant: "destructive" });
      return;
    }

    const yearStart = new Date(calculationYear, 0, 1);
    const yearEnd = new Date(calculationYear, 11, 31);
    
    // Calculate days worked in the year
    const effectiveStart = hireDate > yearStart ? hireDate : yearStart;
    const effectiveEnd = terminationDate && terminationDate < yearEnd ? terminationDate : yearEnd;
    const daysInYear = differenceInDays(effectiveEnd, effectiveStart) + 1;
    
    // Proportional aguinaldo
    const proportionalDays = (AGUINALDO_DAYS * daysInYear) / 365;
    const grossAmount = proportionalDays * dailySalary;
    
    // Exempt amount: 30 UMAs or proportional
    const exemptLimit = 30 * UMA_DAILY_2024;
    const exemptAmount = Math.min(grossAmount, exemptLimit);
    const taxableAmount = Math.max(0, grossAmount - exemptAmount);

    setAguinaldoResult({
      concept: "Aguinaldo",
      days: proportionalDays,
      dailyRate: dailySalary,
      amount: grossAmount,
      taxable: taxableAmount > 0,
      exempt: exemptAmount,
      taxableAmount: taxableAmount,
    });
  };

  const calculateVacation = () => {
    if (!hireDate || dailySalary <= 0) {
      toast({ title: "Error", description: "Ingrese fecha de contratación y salario diario", variant: "destructive" });
      return;
    }

    const yearsWorked = differenceInYears(new Date(), hireDate);
    const vacationDays = getVacationDays(yearsWorked);
    
    // Vacation pay
    const vacationPay = vacationDays * dailySalary;
    
    // Vacation premium (25%)
    const premiumAmount = vacationPay * VACATION_PREMIUM_RATE;
    
    // Exempt: 15 UMAs for premium
    const premiumExempt = Math.min(premiumAmount, 15 * UMA_DAILY_2024);
    const premiumTaxable = Math.max(0, premiumAmount - premiumExempt);

    setVacationResult([
      {
        concept: "Días de Vacaciones",
        days: vacationDays,
        dailyRate: dailySalary,
        amount: vacationPay,
        taxable: true,
        exempt: 0,
        taxableAmount: vacationPay,
      },
      {
        concept: "Prima Vacacional (25%)",
        days: vacationDays,
        dailyRate: dailySalary * VACATION_PREMIUM_RATE,
        amount: premiumAmount,
        taxable: premiumTaxable > 0,
        exempt: premiumExempt,
        taxableAmount: premiumTaxable,
      },
    ]);
  };

  const calculatePTU = () => {
    if (ptuPool <= 0 || totalCompanyDays <= 0 || totalCompanySalaries <= 0) {
      toast({ title: "Error", description: "Ingrese todos los datos de PTU", variant: "destructive" });
      return;
    }

    // PTU is split 50% by days worked, 50% by salaries
    const daysPortion = ptuPool * 0.5;
    const salaryPortion = ptuPool * 0.5;
    
    // Employee's share
    const daysFactor = (daysWorked / totalCompanyDays) * daysPortion;
    const salaryFactor = (employeeAnnualSalary / totalCompanySalaries) * salaryPortion;
    const totalPTU = daysFactor + salaryFactor;

    setPtuResult({
      daysFactor,
      salaryFactor,
      total: totalPTU,
    });
  };

  const calculateFiniquito = () => {
    if (!hireDate || !terminationDate || dailySalary <= 0) {
      toast({ title: "Error", description: "Ingrese todos los datos requeridos", variant: "destructive" });
      return;
    }

    const results: FiniquitoResult[] = [];
    const yearsWorked = differenceInYears(terminationDate, hireDate);
    const monthsInYear = terminationDate.getMonth() + 1;
    
    // 1. Proportional Aguinaldo
    const aguinaldoDays = (AGUINALDO_DAYS * monthsInYear) / 12;
    results.push({
      concept: `Aguinaldo Proporcional (${aguinaldoDays.toFixed(2)} días)`,
      amount: aguinaldoDays * dailySalary,
      isDeduction: false,
    });
    
    // 2. Proportional Vacation
    const vacationDays = getVacationDays(yearsWorked + 1);
    const proportionalVacation = (vacationDays * monthsInYear) / 12;
    results.push({
      concept: `Vacaciones Proporcionales (${proportionalVacation.toFixed(2)} días)`,
      amount: proportionalVacation * dailySalary,
      isDeduction: false,
    });
    
    // 3. Vacation Premium
    const vacationPremium = proportionalVacation * dailySalary * VACATION_PREMIUM_RATE;
    results.push({
      concept: "Prima Vacacional (25%)",
      amount: vacationPremium,
      isDeduction: false,
    });
    
    // 4. Pending salary (assume last day worked)
    const pendingDays = terminationDate.getDate();
    results.push({
      concept: `Salario Pendiente (${pendingDays} días)`,
      amount: pendingDays * dailySalary,
      isDeduction: false,
    });

    // 5. Seniority Premium (prima de antigüedad) - only if 15+ years or unjustified dismissal
    if (yearsWorked >= 15 || terminationType === "unjustified") {
      const seniorityDays = Math.min(yearsWorked * 12, yearsWorked * 12); // 12 days per year
      const seniorityDailyRate = Math.min(dailySalary, 2 * UMA_DAILY_2024); // Capped at 2 UMAs
      results.push({
        concept: `Prima de Antigüedad (${seniorityDays} días)`,
        amount: seniorityDays * seniorityDailyRate,
        isDeduction: false,
      });
    }

    // 6. Indemnification (only for unjustified dismissal)
    if (terminationType === "unjustified") {
      // 3 months constitutional indemnification
      results.push({
        concept: "Indemnización Constitucional (3 meses)",
        amount: 90 * dailySalary,
        isDeduction: false,
      });
      
      // 20 days per year worked
      const twentyDaysPerYear = yearsWorked * 20 * dailySalary;
      results.push({
        concept: `20 días por año (${yearsWorked} años)`,
        amount: twentyDaysPerYear,
        isDeduction: false,
      });
    }

    setFiniquitoResults(results);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora de Prestaciones Mexicanas
        </CardTitle>
        <CardDescription>
          Calcule aguinaldo, vacaciones, PTU y finiquito conforme a la LFT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="aguinaldo" className="flex items-center gap-1">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Aguinaldo</span>
            </TabsTrigger>
            <TabsTrigger value="vacaciones" className="flex items-center gap-1">
              <Palmtree className="h-4 w-4" />
              <span className="hidden sm:inline">Vacaciones</span>
            </TabsTrigger>
            <TabsTrigger value="ptu" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">PTU</span>
            </TabsTrigger>
            <TabsTrigger value="finiquito" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Finiquito</span>
            </TabsTrigger>
          </TabsList>

          {/* Common Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label>Salario Diario (MXN)</Label>
              <Input
                type="number"
                value={dailySalary || ""}
                onChange={(e) => setDailySalary(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Contratación</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !hireDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {hireDate ? format(hireDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={hireDate} onSelect={setHireDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Año de Cálculo</Label>
              <Select value={calculationYear.toString()} onValueChange={(v) => setCalculationYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2022, 2023, 2024, 2025].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Aguinaldo Tab */}
          <TabsContent value="aguinaldo" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Cálculo de Aguinaldo</h3>
                <p className="text-sm text-muted-foreground">
                  Mínimo 15 días de salario (Art. 87 LFT)
                </p>
              </div>
              <Button onClick={calculateAguinaldo}>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
            </div>

            {aguinaldoResult && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Días</TableHead>
                    <TableHead className="text-right">Cuota Diaria</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="text-right">Exento</TableHead>
                    <TableHead className="text-right">Gravado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{aguinaldoResult.concept}</TableCell>
                    <TableCell className="text-right">{aguinaldoResult.days.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(aguinaldoResult.dailyRate)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(aguinaldoResult.amount)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(aguinaldoResult.exempt)}</TableCell>
                    <TableCell className="text-right text-amber-600">{formatCurrency(aguinaldoResult.taxableAmount)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
              <strong>Nota:</strong> El aguinaldo exento es hasta 30 UMAs ({formatCurrency(30 * UMA_DAILY_2024)}).
              El excedente se considera ingreso gravable para ISR.
            </div>
          </TabsContent>

          {/* Vacaciones Tab */}
          <TabsContent value="vacaciones" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Cálculo de Vacaciones y Prima Vacacional</h3>
                <p className="text-sm text-muted-foreground">
                  Conforme a reforma 2023 (Art. 76 y 80 LFT)
                </p>
              </div>
              <Button onClick={calculateVacation}>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
            </div>

            {/* Vacation days table reference */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Tabla de Días de Vacaciones (Reforma 2023)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {VACATION_TABLE.slice(0, 8).map((v) => (
                    <div key={v.years} className="flex justify-between">
                      <span>{v.years} año{v.years > 1 ? "s" : ""}:</span>
                      <span className="font-medium">{v.days} días</span>
                    </div>
                  ))}
                </div>
              </Card>

              {vacationResult.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Resultado del Cálculo</h4>
                  <Table>
                    <TableBody>
                      {vacationResult.map((result, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{result.concept}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(result.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(vacationResult.reduce((sum, r) => sum + r.amount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* PTU Tab */}
          <TabsContent value="ptu" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Participación de los Trabajadores en las Utilidades</h3>
                <p className="text-sm text-muted-foreground">
                  10% de utilidades (Art. 117-131 LFT)
                </p>
              </div>
              <Button onClick={calculatePTU}>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Monto Total de PTU a Repartir (MXN)</Label>
                  <Input
                    type="number"
                    value={ptuPool || ""}
                    onChange={(e) => setPtuPool(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Días Trabajados por el Empleado</Label>
                  <Input
                    type="number"
                    value={daysWorked}
                    onChange={(e) => setDaysWorked(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salario Anual del Empleado (MXN)</Label>
                  <Input
                    type="number"
                    value={employeeAnnualSalary || ""}
                    onChange={(e) => setEmployeeAnnualSalary(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Total Días Trabajados (Empresa)</Label>
                  <Input
                    type="number"
                    value={totalCompanyDays || ""}
                    onChange={(e) => setTotalCompanyDays(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Salarios Anuales (Empresa)</Label>
                  <Input
                    type="number"
                    value={totalCompanySalaries || ""}
                    onChange={(e) => setTotalCompanySalaries(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {ptuResult && (
              <Card className="p-4 bg-primary/5">
                <h4 className="font-medium mb-3">Resultado PTU</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Factor Días (50%)</p>
                    <p className="text-lg font-bold">{formatCurrency(ptuResult.daysFactor)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Factor Salarios (50%)</p>
                    <p className="text-lg font-bold">{formatCurrency(ptuResult.salaryFactor)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total PTU</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(ptuResult.total)}</p>
                  </div>
                </div>
              </Card>
            )}

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
              <strong>Nota:</strong> El PTU tiene un tope de 3 meses de salario o el promedio de los últimos 3 años,
              lo que resulte más favorable al trabajador (reforma 2021).
            </div>
          </TabsContent>

          {/* Finiquito Tab */}
          <TabsContent value="finiquito" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Cálculo de Finiquito / Liquidación</h3>
                <p className="text-sm text-muted-foreground">
                  Prestaciones por terminación laboral
                </p>
              </div>
              <Button onClick={calculateFiniquito}>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Terminación</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !terminationDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {terminationDate ? format(terminationDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={terminationDate} onSelect={setTerminationDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Terminación</Label>
                <Select value={terminationType} onValueChange={(v: any) => setTerminationType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntary">Renuncia Voluntaria</SelectItem>
                    <SelectItem value="justified">Despido Justificado</SelectItem>
                    <SelectItem value="unjustified">Despido Injustificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {finiquitoResults.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finiquitoResults.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {result.concept}
                        {result.isDeduction && <Badge variant="destructive" className="ml-2">Deducción</Badge>}
                      </TableCell>
                      <TableCell className={cn("text-right font-medium", result.isDeduction && "text-destructive")}>
                        {result.isDeduction ? "-" : ""}{formatCurrency(result.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted">
                    <TableCell>Total a Pagar</TableCell>
                    <TableCell className="text-right text-primary">
                      {formatCurrency(
                        finiquitoResults.reduce((sum, r) => sum + (r.isDeduction ? -r.amount : r.amount), 0)
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            <div className="flex gap-2">
              <Badge variant={terminationType === "voluntary" ? "default" : "outline"}>
                Renuncia: Finiquito básico
              </Badge>
              <Badge variant={terminationType === "unjustified" ? "destructive" : "outline"}>
                Despido Injustificado: + 3 meses + 20 días/año
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
