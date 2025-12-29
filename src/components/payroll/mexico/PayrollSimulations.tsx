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
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface PayrollSimulationsProps {
  companyId: string;
}

export function PayrollSimulations({ companyId }: PayrollSimulationsProps) {
  const [simulationType, setSimulationType] = useState("salary");
  const [isRunning, setIsRunning] = useState(false);

  // Mock simulation data
  const [salarySimulation, setSalarySimulation] = useState({
    currentSalary: 25000,
    proposedSalary: 28000,
    effectiveDate: "2025-02-01",
    employeeCount: 1
  });

  const [budgetForecast] = useState([
    { month: "Ene", current: 2500000, projected: 2650000 },
    { month: "Feb", current: 2500000, projected: 2680000 },
    { month: "Mar", current: 2520000, projected: 2700000 },
    { month: "Abr", current: 2520000, projected: 2720000 },
    { month: "May", current: 2540000, projected: 2750000 },
    { month: "Jun", current: 2540000, projected: 2780000 }
  ]);

  const [simulationResults, setSimulationResults] = useState<any>(null);

  const runSalarySimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const increase = salarySimulation.proposedSalary - salarySimulation.currentSalary;
      const percentIncrease = ((increase / salarySimulation.currentSalary) * 100).toFixed(2);
      
      // Calculate tax impacts
      const currentISR = salarySimulation.currentSalary * 0.25;
      const proposedISR = salarySimulation.proposedSalary * 0.28;
      const currentIMSS = salarySimulation.currentSalary * 0.0625;
      const proposedIMSS = salarySimulation.proposedSalary * 0.0625;
      
      setSimulationResults({
        salaryIncrease: increase,
        percentIncrease,
        currentGross: salarySimulation.currentSalary,
        proposedGross: salarySimulation.proposedSalary,
        currentISR,
        proposedISR,
        isrDifference: proposedISR - currentISR,
        currentIMSS,
        proposedIMSS,
        imssDifference: proposedIMSS - currentIMSS,
        currentNet: salarySimulation.currentSalary - currentISR - currentIMSS,
        proposedNet: salarySimulation.proposedSalary - proposedISR - proposedIMSS,
        annualCostImpact: increase * 12 * 1.35 * salarySimulation.employeeCount
      });
      setIsRunning(false);
    }, 1500);
  };

  const scenarioComparison = [
    { scenario: "Actual", employees: 150, monthlyCost: 2500000, avgSalary: 16667, imssContrib: 312500 },
    { scenario: "+5% General", employees: 150, monthlyCost: 2625000, avgSalary: 17500, imssContrib: 328125 },
    { scenario: "+10% General", employees: 150, monthlyCost: 2750000, avgSalary: 18333, imssContrib: 343750 },
    { scenario: "+5 Contrataciones", employees: 155, monthlyCost: 2583333, avgSalary: 16667, imssContrib: 322917 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Simulaciones de Nómina</h2>
          <p className="text-sm text-muted-foreground">
            Proyecciones y escenarios what-if para planificación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Guardar Escenario
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={simulationType} onValueChange={setSimulationType}>
        <TabsList>
          <TabsTrigger value="salary">Cambio Salarial</TabsTrigger>
          <TabsTrigger value="hiring">Contrataciones</TabsTrigger>
          <TabsTrigger value="forecast">Proyección Presupuesto</TabsTrigger>
          <TabsTrigger value="scenarios">Comparar Escenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="salary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Parámetros de Simulación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Salario Actual (MXN)</Label>
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
                    <Label>Salario Propuesto (MXN)</Label>
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
                    <Label>Fecha Efectiva</Label>
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
                    <Label>Empleados Afectados</Label>
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
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Ejecutar Simulación
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
                    Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Incremento Salarial</span>
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
                        <p className="text-xs text-muted-foreground">ISR Actual</p>
                        <p className="font-medium">${simulationResults.currentISR.toLocaleString()}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">ISR Propuesto</p>
                        <p className="font-medium">${simulationResults.proposedISR.toLocaleString()}</p>
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +${simulationResults.isrDifference.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Neto Actual</p>
                        <p className="font-medium">${simulationResults.currentNet.toLocaleString()}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Neto Propuesto</p>
                        <p className="font-medium text-green-600">
                          ${simulationResults.proposedNet.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium">Impacto Anual Total (Costo Empresa)</p>
                      <p className="text-2xl font-bold text-primary">
                        ${simulationResults.annualCostImpact.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Incluye salario, IMSS patronal y prestaciones
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
                Simulación de Contrataciones
              </CardTitle>
              <CardDescription>
                Calcule el impacto de nuevas contrataciones en su presupuesto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Posiciones a Contratar</Label>
                  <Input type="number" defaultValue={5} />
                </div>
                <div className="space-y-2">
                  <Label>Salario Promedio</Label>
                  <Input type="number" defaultValue={20000} />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Inicio</Label>
                  <Input type="date" defaultValue="2025-03-01" />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select defaultValue="tech">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Tecnología</SelectItem>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="ops">Operaciones</SelectItem>
                      <SelectItem value="admin">Administración</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Impacto
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Proyección de Presupuesto 6 Meses
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
                      name="Actual"
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projected" 
                      stroke="hsl(var(--primary))" 
                      name="Proyectado"
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
              <CardTitle className="text-lg">Comparación de Escenarios</CardTitle>
              <CardDescription>
                Compare diferentes escenarios de nómina lado a lado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Escenario</TableHead>
                    <TableHead className="text-right">Empleados</TableHead>
                    <TableHead className="text-right">Costo Mensual</TableHead>
                    <TableHead className="text-right">Salario Promedio</TableHead>
                    <TableHead className="text-right">IMSS Patronal</TableHead>
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
                          <span className="text-xs text-red-500 ml-1">
                            +{((scenario.monthlyCost - scenarioComparison[0].monthlyCost) / scenarioComparison[0].monthlyCost * 100).toFixed(1)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">${scenario.avgSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${scenario.imssContrib.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gráfico Comparativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Bar dataKey="monthlyCost" fill="hsl(var(--primary))" name="Costo Mensual" />
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