import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart as PieChartIcon, 
  Calculator,
  Download,
  CheckCircle2,
  Users,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface AdvancedPTUDistributionProps {
  companyId: string;
}

export function AdvancedPTUDistribution({ companyId }: AdvancedPTUDistributionProps) {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [isCalculating, setIsCalculating] = useState(false);

  const ptuSummary = {
    fiscalProfit: 12500000,
    ptuPool: 1250000, // 10% of fiscal profit
    totalEmployees: 156,
    eligibleEmployees: 148,
    avgPerEmployee: 8445.95,
    byDays: 625000, // 50%
    bySalary: 625000, // 50%
    status: "calculated"
  };

  const employeeDistribution = [
    { id: "1", name: "Juan García López", daysWorked: 365, dailySalary: 850, daysPortion: 4219.45, salaryPortion: 4875.00, total: 9094.45 },
    { id: "2", name: "María Fernández Ruiz", daysWorked: 365, dailySalary: 720, daysPortion: 4219.45, salaryPortion: 4125.50, total: 8344.95 },
    { id: "3", name: "Carlos Mendoza Sánchez", daysWorked: 280, dailySalary: 650, daysPortion: 3237.67, salaryPortion: 3725.00, total: 6962.67 },
    { id: "4", name: "Ana Torres Vargas", daysWorked: 365, dailySalary: 780, daysPortion: 4219.45, salaryPortion: 4469.25, total: 8688.70 },
    { id: "5", name: "Pedro Ramírez Ortiz", daysWorked: 180, dailySalary: 550, daysPortion: 2081.10, salaryPortion: 3150.75, total: 5231.85 },
  ];

  const distributionBreakdown = [
    { name: "Por Días Trabajados", value: 50, amount: 625000, color: "hsl(var(--primary))" },
    { name: "Por Salarios", value: 50, amount: 625000, color: "hsl(var(--chart-2))" },
  ];

  const topearData = [
    { category: "Sin Topear", employees: 142, amount: 1180000 },
    { category: "Topeados (3 meses)", employees: 6, amount: 70000 },
  ];

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <PieChartIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Advanced PTU Distribution</h2>
            <p className="text-sm text-muted-foreground">
              Profit sharing calculation and distribution management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCalculate} disabled={isCalculating}>
            {isCalculating ? (
              <><Calculator className="h-4 w-4 mr-2 animate-pulse" />Calculando...</>
            ) : (
              <><Calculator className="h-4 w-4 mr-2" />Calcular PTU</>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">${(ptuSummary.fiscalProfit / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Utilidad Fiscal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">${(ptuSummary.ptuPool / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">PTU a Repartir (10%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{ptuSummary.eligibleEmployees}</p>
                <p className="text-xs text-muted-foreground">Empleados Elegibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold">${ptuSummary.avgPerEmployee.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Promedio por Empleado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold">30 May</p>
                <p className="text-xs text-muted-foreground">Fecha Límite Pago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="employees">Por Empleado</TabsTrigger>
          <TabsTrigger value="topear">Tope Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución 50/50</CardTitle>
                <CardDescription>División legal del PTU</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {distributionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desglose de Montos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Por Días Trabajados</span>
                    <span className="font-bold">${ptuSummary.byDays.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se divide entre todos los días trabajados por empleados elegibles
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Por Salarios Devengados</span>
                    <span className="font-bold">${ptuSummary.bySalary.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Proporcional al salario diario de cada trabajador
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total a Repartir</span>
                    <span className="font-bold text-green-600">${ptuSummary.ptuPool.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topearData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value: number, name: string) => [
                      name === 'amount' ? `$${value.toLocaleString()}` : value,
                      name === 'amount' ? 'Monto' : 'Empleados'
                    ]} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="amount" name="Monto" fill="hsl(var(--primary))" />
                    <Bar yAxisId="right" dataKey="employees" name="Empleados" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PTU por Empleado</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead className="text-right">Días Trabajados</TableHead>
                    <TableHead className="text-right">Salario Diario</TableHead>
                    <TableHead className="text-right">Porción Días</TableHead>
                    <TableHead className="text-right">Porción Salario</TableHead>
                    <TableHead className="text-right">Total PTU</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeDistribution.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell className="text-right">{emp.daysWorked}</TableCell>
                      <TableCell className="text-right">${emp.dailySalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${emp.daysPortion.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${emp.salaryPortion.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">${emp.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topear" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Tope Legal de PTU
              </CardTitle>
              <CardDescription>
                Aplicación del tope de 3 meses de salario o promedio de últimos 3 años
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <strong>Artículo 127 LFT:</strong> El PTU de cada trabajador no puede exceder el equivalente 
                  a 3 meses de salario o el promedio de PTU recibido en los últimos 3 años, lo que sea más favorable.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Sin Tope Aplicado</span>
                  </div>
                  <p className="text-2xl font-bold">142 empleados</p>
                  <p className="text-sm text-muted-foreground">PTU dentro del límite legal</p>
                </div>
                <div className="p-4 border rounded-lg border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Tope Aplicado</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">6 empleados</p>
                  <p className="text-sm text-muted-foreground">PTU limitado por tope legal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Cálculo
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Generar Recibos PTU
          </Button>
          <Button>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Aplicar a Nómina
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
