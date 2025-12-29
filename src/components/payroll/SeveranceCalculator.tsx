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
  companyId?: string;
}

export function SeveranceCalculator({ companyId }: SeveranceCalculatorProps) {
  const [terminationType, setTerminationType] = useState<"voluntary" | "involuntary">("voluntary");
  const [employeeData, setEmployeeData] = useState({
    name: "",
    hireDate: "",
    terminationDate: "",
    annualSalary: 0,
    vacationDaysRemaining: 0,
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
    const monthlySalary = employeeData.annualSalary / 12;
    const dailySalary = employeeData.annualSalary / 260; // Working days
    
    const termDate = new Date(employeeData.terminationDate);
    const dayOfMonth = termDate.getDate();
    
    // Prorated salary for current period
    const proratedSalary = (dayOfMonth / 30) * monthlySalary;
    
    // Accrued vacation payout
    const vacationPayout = employeeData.vacationDaysRemaining * dailySalary;
    
    // Prorated bonus (if applicable, assuming annual bonus)
    const monthsWorkedThisYear = termDate.getMonth() + 1;
    const proratedBonus = (monthlySalary * monthsWorkedThisYear) / 12;

    let result: any = {
      yearsWorked,
      monthlySalary: Math.round(monthlySalary),
      dailySalary: Math.round(dailySalary),
      // Standard components (always paid)
      proratedSalary: Math.round(proratedSalary),
      vacationPayout: Math.round(vacationPayout),
      proratedBonus: Math.round(proratedBonus),
      subtotalStandard: 0,
      // Severance components (involuntary only)
      noticePay: 0,
      severanceWeeks: 0,
      severancePay: 0,
      subtotalSeverance: 0,
      // Totals
      grandTotal: 0
    };

    result.subtotalStandard = result.proratedSalary + result.vacationPayout + result.proratedBonus;

    if (terminationType === "involuntary") {
      // Notice period (typically 2-4 weeks based on tenure)
      const noticeWeeks = yearsWorked < 2 ? 2 : yearsWorked < 5 ? 3 : 4;
      result.noticePay = Math.round((monthlySalary / 4) * noticeWeeks);
      
      // Severance (typically 1-2 weeks per year of service)
      const weeksPerYear = yearsWorked < 5 ? 1 : 2;
      result.severanceWeeks = yearsWorked * weeksPerYear;
      result.severancePay = Math.round((monthlySalary / 4) * result.severanceWeeks);
      
      result.subtotalSeverance = result.noticePay + result.severancePay;
    }

    result.grandTotal = result.subtotalStandard + result.subtotalSeverance;
    
    setCalculation(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Severance Calculator</h2>
          <p className="text-sm text-muted-foreground">
            Calculate final pay and severance for terminating employees
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={!calculation}>
          <FileDown className="h-4 w-4 mr-2" />
          Export Calculation
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Termination Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={terminationType} 
                onValueChange={(v: "voluntary" | "involuntary") => setTerminationType(v)}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${terminationType === 'voluntary' ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value="voluntary" id="voluntary" className="mt-1" />
                  <div>
                    <Label htmlFor="voluntary" className="font-medium cursor-pointer">
                      Voluntary Resignation
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Employee-initiated departure, retirement, or mutual agreement
                    </p>
                  </div>
                </div>
                <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${terminationType === 'involuntary' ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value="involuntary" id="involuntary" className="mt-1" />
                  <div>
                    <Label htmlFor="involuntary" className="font-medium cursor-pointer">
                      Involuntary Termination
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Layoff, restructuring, or dismissal without cause
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
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Employee Name</Label>
                <Input 
                  placeholder="Full name"
                  value={employeeData.name}
                  onChange={(e) => setEmployeeData({...employeeData, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hire Date</Label>
                  <Input 
                    type="date"
                    value={employeeData.hireDate}
                    onChange={(e) => setEmployeeData({...employeeData, hireDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Termination Date</Label>
                  <Input 
                    type="date"
                    value={employeeData.terminationDate}
                    onChange={(e) => setEmployeeData({...employeeData, terminationDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Annual Salary</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={employeeData.annualSalary || ""}
                    onChange={(e) => setEmployeeData({...employeeData, annualSalary: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vacation Days Remaining</Label>
                  <Input 
                    type="number"
                    value={employeeData.vacationDaysRemaining}
                    onChange={(e) => setEmployeeData({...employeeData, vacationDaysRemaining: Number(e.target.value)})}
                  />
                </div>
              </div>

              {terminationType === "involuntary" && (
                <div className="space-y-2">
                  <Label>Reason for Termination</Label>
                  <Select 
                    value={employeeData.terminationReason}
                    onValueChange={(v) => setEmployeeData({...employeeData, terminationReason: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="layoff">Layoff / Reduction in Force</SelectItem>
                      <SelectItem value="restructure">Restructuring</SelectItem>
                      <SelectItem value="position_elimination">Position Elimination</SelectItem>
                      <SelectItem value="performance">Performance Related</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={calculateSeverance} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate {terminationType === "voluntary" ? "Final Pay" : "Severance Package"}
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
                      Calculation Results
                    </CardTitle>
                    <Badge variant={terminationType === "voluntary" ? "secondary" : "destructive"}>
                      {terminationType === "voluntary" ? "Voluntary" : "Involuntary"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {calculation.yearsWorked} years of service • Monthly: ${calculation.monthlySalary.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Standard Final Pay
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Prorated salary (current period)</span>
                        <span className="font-medium">${calculation.proratedSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Accrued vacation payout</span>
                        <span className="font-medium">${calculation.vacationPayout.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Prorated bonus</span>
                        <span className="font-medium">${calculation.proratedBonus.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between p-2 font-medium">
                        <span>Subtotal Final Pay</span>
                        <span className="text-primary">${calculation.subtotalStandard.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {terminationType === "involuntary" && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Severance Package
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Notice period pay</span>
                          <span className="font-medium">${calculation.noticePay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Severance ({calculation.severanceWeeks} weeks)</span>
                          <span className="font-medium">${calculation.severancePay.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between p-2 font-medium">
                          <span>Subtotal Severance</span>
                          <span className="text-orange-500">${calculation.subtotalSeverance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">TOTAL PAYOUT</span>
                      <span className="text-2xl font-bold text-primary">
                        ${calculation.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription className="text-xs">
                  This calculation is an estimate. Actual amounts may vary based on 
                  company policy, employment agreements, applicable taxes, and local 
                  regulations. Please consult with HR and Legal before finalizing.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Complete the employee information and click calculate
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
