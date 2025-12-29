import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign,
  Play,
  Save,
  FileDown,
  RefreshCw,
  ArrowUpRight
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface PayrollSimulationsProps {
  companyId?: string;
}

export function PayrollSimulations({ companyId }: PayrollSimulationsProps) {
  const [simulationType, setSimulationType] = useState("salary");
  const [isRunning, setIsRunning] = useState(false);

  const [salarySimulation, setSalarySimulation] = useState({
    currentSalary: 50000,
    proposedSalary: 55000,
    effectiveDate: "2025-02-01",
    employeeCount: 1,
    currency: "USD"
  });

  const [budgetForecast] = useState([
    { month: "Jan", current: 2500000, projected: 2650000 },
    { month: "Feb", current: 2500000, projected: 2680000 },
    { month: "Mar", current: 2520000, projected: 2700000 },
    { month: "Apr", current: 2520000, projected: 2720000 },
    { month: "May", current: 2540000, projected: 2750000 },
    { month: "Jun", current: 2540000, projected: 2780000 }
  ]);

  const [simulationResults, setSimulationResults] = useState<any>(null);

  const runSalarySimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const increase = salarySimulation.proposedSalary - salarySimulation.currentSalary;
      const percentIncrease = ((increase / salarySimulation.currentSalary) * 100).toFixed(2);
      
      // Generic tax calculations (can be customized per country)
      const currentTax = salarySimulation.currentSalary * 0.22;
      const proposedTax = salarySimulation.proposedSalary * 0.24;
      const currentBenefits = salarySimulation.currentSalary * 0.15;
      const proposedBenefits = salarySimulation.proposedSalary * 0.15;
      
      setSimulationResults({
        salaryIncrease: increase,
        percentIncrease,
        currentGross: salarySimulation.currentSalary,
        proposedGross: salarySimulation.proposedSalary,
        currentTax,
        proposedTax,
        taxDifference: proposedTax - currentTax,
        currentBenefits,
        proposedBenefits,
        currentNet: salarySimulation.currentSalary - currentTax - currentBenefits,
        proposedNet: salarySimulation.proposedSalary - proposedTax - proposedBenefits,
        annualCostImpact: increase * 12 * 1.35 * salarySimulation.employeeCount
      });
      setIsRunning(false);
    }, 1500);
  };

  const scenarioComparison = [
    { scenario: "Current", employees: 150, monthlyCost: 2500000, avgSalary: 16667, benefits: 312500 },
    { scenario: "+5% Across Board", employees: 150, monthlyCost: 2625000, avgSalary: 17500, benefits: 328125 },
    { scenario: "+10% Across Board", employees: 150, monthlyCost: 2750000, avgSalary: 18333, benefits: 343750 },
    { scenario: "+5 New Hires", employees: 155, monthlyCost: 2583333, avgSalary: 16667, benefits: 322917 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payroll Simulations</h2>
          <p className="text-sm text-muted-foreground">
            What-if scenarios and budget forecasting for payroll planning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Scenario
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={simulationType} onValueChange={setSimulationType}>
        <TabsList>
          <TabsTrigger value="salary">Salary Change</TabsTrigger>
          <TabsTrigger value="hiring">New Hires</TabsTrigger>
          <TabsTrigger value="forecast">Budget Forecast</TabsTrigger>
          <TabsTrigger value="scenarios">Compare Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="salary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Simulation Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Current Salary</Label>
                    <Input
                      type="number"
                      value={salarySimulation.currentSalary}
                      onChange={(e) => setSalarySimulation({
                        ...salarySimulation,
                        currentSalary: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proposed Salary</Label>
                    <Input
                      type="number"
                      value={salarySimulation.proposedSalary}
                      onChange={(e) => setSalarySimulation({
                        ...salarySimulation,
                        proposedSalary: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Effective Date</Label>
                    <Input
                      type="date"
                      value={salarySimulation.effectiveDate}
                      onChange={(e) => setSalarySimulation({
                        ...salarySimulation,
                        effectiveDate: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employees Affected</Label>
                    <Input
                      type="number"
                      value={salarySimulation.employeeCount}
                      onChange={(e) => setSalarySimulation({
                        ...salarySimulation,
                        employeeCount: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={runSalarySimulation}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {simulationResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Salary Increase</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          +{simulationResults.percentIncrease}%
                        </Badge>
                        <span className="font-medium">
                          ${simulationResults.salaryIncrease.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Current Tax</p>
                        <p className="font-medium">${simulationResults.currentTax.toLocaleString()}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Proposed Tax</p>
                        <p className="font-medium">${simulationResults.proposedTax.toLocaleString()}</p>
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +${simulationResults.taxDifference.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Current Net</p>
                        <p className="font-medium">${simulationResults.currentNet.toLocaleString()}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Proposed Net</p>
                        <p className="font-medium text-green-600">
                          ${simulationResults.proposedNet.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium">Annual Total Cost Impact</p>
                      <p className="text-2xl font-bold text-primary">
                        ${simulationResults.annualCostImpact.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Includes salary, taxes, and benefits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hiring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hiring Simulation
              </CardTitle>
              <CardDescription>
                Calculate the budget impact of new hires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Positions to Fill</Label>
                  <Input type="number" defaultValue={5} />
                </div>
                <div className="space-y-2">
                  <Label>Average Salary</Label>
                  <Input type="number" defaultValue={60000} />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" defaultValue="2025-03-01" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select defaultValue="tech">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="ops">Operations</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Impact
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                6-Month Budget Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={budgetForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke="hsl(var(--muted-foreground))" 
                      name="Current"
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projected" 
                      stroke="hsl(var(--primary))" 
                      name="Projected"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scenario Comparison</CardTitle>
              <CardDescription>
                Compare different payroll scenarios side by side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scenario</TableHead>
                    <TableHead className="text-right">Employees</TableHead>
                    <TableHead className="text-right">Monthly Cost</TableHead>
                    <TableHead className="text-right">Avg Salary</TableHead>
                    <TableHead className="text-right">Benefits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarioComparison.map((scenario, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {idx === 0 ? (
                          <Badge variant="outline">{scenario.scenario}</Badge>
                        ) : (
                          scenario.scenario
                        )}
                      </TableCell>
                      <TableCell className="text-right">{scenario.employees}</TableCell>
                      <TableCell className="text-right">
                        ${scenario.monthlyCost.toLocaleString()}
                        {idx > 0 && (
                          <span className="text-xs text-destructive ml-1">
                            +{((scenario.monthlyCost - scenarioComparison[0].monthlyCost) / scenarioComparison[0].monthlyCost * 100).toFixed(1)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">${scenario.avgSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${scenario.benefits.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparison Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Bar dataKey="monthlyCost" fill="hsl(var(--primary))" name="Monthly Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
