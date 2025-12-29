import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  FileDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  User
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SeveranceCalculatorProps {
  companyId: string;
}

export function SeveranceCalculator({ companyId }: SeveranceCalculatorProps) {
  const [terminationType, setTerminationType] = useState<"finiquito" | "liquidacion">("finiquito");
  const [employeeData, setEmployeeData] = useState({
    name: "",
    hireDate: "",
    terminationDate: "",
    dailySalary: 0,
    monthlySalary: 0,
    vacationDaysRemaining: 0,
    aguinaldoDays: 15,
    terminationReason: "voluntary"
  });

  const [calculation, setCalculation] = useState<any>(null);

  const calculateYearsWorked = () => {
    if (!employeeData.hireDate || !employeeData.terminationDate) return 0;
    const hire = new Date(employeeData.hireDate);
    const term = new Date(employeeData.terminationDate);
    const diff = term.getTime() - hire.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  };

  const calculateSeverance = () => {
    const yearsWorked = calculateYearsWorked();
    const dailySalary = employeeData.dailySalary || employeeData.monthlySalary / 30;
    
    // Calculate worked days in current period
    const termDate = new Date(employeeData.terminationDate);
    const dayOfMonth = termDate.getDate();
    
    // Proportional vacation days
    const monthsWorked = termDate.getMonth() + 1;
    const proportionalVacation = (employeeData.vacationDaysRemaining / 12) * monthsWorked;
    
    // Aguinaldo proportional (Christmas bonus)
    const aguinaldoProportional = (employeeData.aguinaldoDays / 12) * monthsWorked * dailySalary;
    
    // Prima vacacional (25% of vacation days)
    const primaVacacional = proportionalVacation * dailySalary * 0.25;
    
    // Vacation pay
    const vacationPay = proportionalVacation * dailySalary;
    
    // Salary for worked days in current period
    const workedDaysSalary = dayOfMonth * dailySalary;

    let result: any = {
      dailySalary,
      yearsWorked,
      // Finiquito components (always paid)
      workedDaysSalary: Math.round(workedDaysSalary),
      aguinaldoProportional: Math.round(aguinaldoProportional),
      vacationPay: Math.round(vacationPay),
      primaVacacional: Math.round(primaVacacional),
      subtotalFiniquito: 0,
      // Liquidation components (only for unjustified dismissal)
      threeMonthsSalary: 0,
      twentyDaysPerYear: 0,
      seniorityPremium: 0,
      subtotalLiquidacion: 0,
      // Totals
      grandTotal: 0
    };

    result.subtotalFiniquito = result.workedDaysSalary + result.aguinaldoProportional + 
                               result.vacationPay + result.primaVacacional;

    if (terminationType === "liquidacion") {
      // 3 months salary (constitutional indemnity)
      result.threeMonthsSalary = Math.round(dailySalary * 90);
      
      // 20 days per year worked
      result.twentyDaysPerYear = Math.round(dailySalary * 20 * yearsWorked);
      
      // Seniority premium (12 days per year, capped at 2x minimum wage)
      const minWage = 248.93; // 2024 minimum wage
      const seniorityDailyCap = minWage * 2;
      const seniorityDaily = Math.min(dailySalary, seniorityDailyCap);
      result.seniorityPremium = Math.round(seniorityDaily * 12 * yearsWorked);
      
      result.subtotalLiquidacion = result.threeMonthsSalary + result.twentyDaysPerYear + result.seniorityPremium;
    }

    result.grandTotal = result.subtotalFiniquito + result.subtotalLiquidacion;
    
    setCalculation(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Calculadora de Finiquito / Liquidación</h2>
          <p className="text-sm text-muted-foreground">
            Cálculo conforme a la Ley Federal del Trabajo
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={!calculation}>
          <FileDown className="h-4 w-4 mr-2" />
          Exportar Cálculo
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Tipo de Terminación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={terminationType} 
                onValueChange={(v: "finiquito" | "liquidacion") => setTerminationType(v)}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${terminationType === 'finiquito' ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value="finiquito" id="finiquito" className="mt-1" />
                  <div>
                    <Label htmlFor="finiquito" className="font-medium cursor-pointer">
                      Finiquito
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Renuncia voluntaria, término de contrato temporal, o mutuo acuerdo
                    </p>
                  </div>
                </div>
                <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${terminationType === 'liquidacion' ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value="liquidacion" id="liquidacion" className="mt-1" />
                  <div>
                    <Label htmlFor="liquidacion" className="font-medium cursor-pointer">
                      Liquidación
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Despido injustificado o rescisión imputable al patrón
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datos del Empleado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Empleado</Label>
                <Input 
                  placeholder="Nombre completo"
                  value={employeeData.name}
                  onChange={(e) => setEmployeeData({...employeeData, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fecha de Ingreso</Label>
                  <Input 
                    type="date"
                    value={employeeData.hireDate}
                    onChange={(e) => setEmployeeData({...employeeData, hireDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Terminación</Label>
                  <Input 
                    type="date"
                    value={employeeData.terminationDate}
                    onChange={(e) => setEmployeeData({...employeeData, terminationDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Salario Diario Integrado (SDI)</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={employeeData.dailySalary || ""}
                    onChange={(e) => setEmployeeData({...employeeData, dailySalary: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salario Mensual</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={employeeData.monthlySalary || ""}
                    onChange={(e) => setEmployeeData({...employeeData, monthlySalary: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Días Vacaciones Pendientes</Label>
                  <Input 
                    type="number"
                    value={employeeData.vacationDaysRemaining}
                    onChange={(e) => setEmployeeData({...employeeData, vacationDaysRemaining: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Días Aguinaldo (anual)</Label>
                  <Input 
                    type="number"
                    value={employeeData.aguinaldoDays}
                    onChange={(e) => setEmployeeData({...employeeData, aguinaldoDays: Number(e.target.value)})}
                  />
                </div>
              </div>

              {terminationType === "liquidacion" && (
                <div className="space-y-2">
                  <Label>Motivo de Despido</Label>
                  <Select 
                    value={employeeData.terminationReason}
                    onValueChange={(v) => setEmployeeData({...employeeData, terminationReason: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unjustified">Despido Injustificado</SelectItem>
                      <SelectItem value="restructure">Reestructuración</SelectItem>
                      <SelectItem value="closure">Cierre de Empresa</SelectItem>
                      <SelectItem value="employer_fault">Rescisión Art. 51 (Culpa del Patrón)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={calculateSeverance} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calcular {terminationType === "finiquito" ? "Finiquito" : "Liquidación"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {calculation ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Resultado del Cálculo
                    </CardTitle>
                    <Badge variant={terminationType === "finiquito" ? "secondary" : "destructive"}>
                      {terminationType === "finiquito" ? "Finiquito" : "Liquidación"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {calculation.yearsWorked} años de antigüedad • Salario diario: ${calculation.dailySalary.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Finiquito Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Conceptos de Finiquito
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Salario días trabajados</span>
                        <span className="font-medium">${calculation.workedDaysSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Aguinaldo proporcional</span>
                        <span className="font-medium">${calculation.aguinaldoProportional.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Vacaciones proporcionales</span>
                        <span className="font-medium">${calculation.vacationPay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Prima vacacional (25%)</span>
                        <span className="font-medium">${calculation.primaVacacional.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between p-2 font-medium">
                        <span>Subtotal Finiquito</span>
                        <span className="text-primary">${calculation.subtotalFiniquito.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liquidation Section */}
                  {terminationType === "liquidacion" && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Indemnización por Despido
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>3 meses de salario (Art. 48)</span>
                          <span className="font-medium">${calculation.threeMonthsSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>20 días por año (Art. 50)</span>
                          <span className="font-medium">${calculation.twentyDaysPerYear.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Prima antigüedad (12 días/año)</span>
                          <span className="font-medium">${calculation.seniorityPremium.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between p-2 font-medium">
                          <span>Subtotal Indemnización</span>
                          <span className="text-orange-500">${calculation.subtotalLiquidacion.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Grand Total */}
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">TOTAL A PAGAR</span>
                      <span className="text-2xl font-bold text-primary">
                        ${calculation.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Nota Legal</AlertTitle>
                <AlertDescription className="text-xs">
                  Este cálculo es estimativo y puede variar según prestaciones adicionales, 
                  deducciones fiscales (ISR), y otros conceptos contractuales. Se recomienda 
                  validar con el área legal o un contador certificado.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Complete los datos del empleado y haga clic en calcular
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}