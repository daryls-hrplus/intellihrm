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
  Calculator, 
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface ISRAnnualAdjustmentProps {
  companyId: string;
}

export function ISRAnnualAdjustment({ companyId }: ISRAnnualAdjustmentProps) {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [isCalculating, setIsCalculating] = useState(false);

  const adjustmentSummary = {
    totalEmployees: 156,
    calculated: 148,
    pending: 8,
    withRefund: 95,
    withBalance: 53,
    totalRefunds: 845620.50,
    totalBalance: 125480.00
  };

  const employeeAdjustments = [
    {
      id: "1",
      employeeNumber: "EMP-001",
      name: "Juan García López",
      annualIncome: 485000,
      isrRetained: 72500,
      isrCalculated: 68200,
      adjustment: -4300,
      status: "refund"
    },
    {
      id: "2",
      employeeNumber: "EMP-002",
      name: "María Fernández Ruiz",
      annualIncome: 620000,
      isrRetained: 98000,
      isrCalculated: 102500,
      adjustment: 4500,
      status: "balance"
    },
    {
      id: "3",
      employeeNumber: "EMP-003",
      name: "Carlos Mendoza Sánchez",
      annualIncome: 380000,
      isrRetained: 52000,
      isrCalculated: 48500,
      adjustment: -3500,
      status: "refund"
    },
    {
      id: "4",
      employeeNumber: "EMP-004",
      name: "Ana Torres Vargas",
      annualIncome: 425000,
      isrRetained: 62000,
      isrCalculated: 58800,
      adjustment: -3200,
      status: "refund"
    },
  ];

  const distributionData = [
    { name: "Con Devolución", value: 95, color: "hsl(var(--chart-2))" },
    { name: "Con Saldo a Cargo", value: 53, color: "hsl(var(--chart-4))" },
    { name: "Sin Ajuste", value: 8, color: "hsl(var(--muted))" },
  ];

  const monthlyComparison = [
    { month: "Ene", retained: 125000, calculated: 120000 },
    { month: "Feb", retained: 128000, calculated: 125000 },
    { month: "Mar", retained: 132000, calculated: 128000 },
    { month: "Abr", retained: 135000, calculated: 132000 },
    { month: "May", retained: 138000, calculated: 135000 },
    { month: "Jun", retained: 142000, calculated: 138000 },
    { month: "Jul", retained: 145000, calculated: 142000 },
    { month: "Ago", retained: 148000, calculated: 145000 },
    { month: "Sep", retained: 152000, calculated: 148000 },
    { month: "Oct", retained: 155000, calculated: 152000 },
    { month: "Nov", retained: 158000, calculated: 155000 },
    { month: "Dic", retained: 162000, calculated: 158000 },
  ];

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "refund":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><TrendingDown className="h-3 w-3 mr-1" />Devolución</Badge>;
      case "balance":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><TrendingUp className="h-3 w-3 mr-1" />Saldo a Cargo</Badge>;
      default:
        return <Badge variant="outline">Sin Ajuste</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Ajuste Anual de ISR</h2>
            <p className="text-sm text-muted-foreground">
              Cálculo del ajuste anual del Impuesto Sobre la Renta
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
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCalculate} disabled={isCalculating}>
            {isCalculating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Ajuste
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adjustmentSummary.calculated}/{adjustmentSummary.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Empleados Calculados</p>
              </div>
            </div>
            <Progress value={(adjustmentSummary.calculated / adjustmentSummary.totalEmployees) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adjustmentSummary.withRefund}</p>
                <p className="text-xs text-muted-foreground">Con Devolución</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adjustmentSummary.withBalance}</p>
                <p className="text-xs text-muted-foreground">Con Saldo a Cargo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">-${(adjustmentSummary.totalRefunds / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Total Devoluciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="employees">Por Empleado</TabsTrigger>
          <TabsTrigger value="comparison">Comparativo Mensual</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución de Ajustes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Montos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Total Devoluciones</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    -${adjustmentSummary.totalRefunds.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">Total Saldos a Cargo</span>
                  </div>
                  <span className="text-xl font-bold text-amber-600">
                    +${adjustmentSummary.totalBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Impacto Neto</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    -${(adjustmentSummary.totalRefunds - adjustmentSummary.totalBalance).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajuste Anual por Empleado</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Empleado</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right">Ingreso Anual</TableHead>
                    <TableHead className="text-right">ISR Retenido</TableHead>
                    <TableHead className="text-right">ISR Calculado</TableHead>
                    <TableHead className="text-right">Ajuste</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeAdjustments.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.employeeNumber}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell className="text-right">${emp.annualIncome.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${emp.isrRetained.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${emp.isrCalculated.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${emp.adjustment < 0 ? 'text-green-600' : 'text-amber-600'}`}>
                        {emp.adjustment < 0 ? '-' : '+'}${Math.abs(emp.adjustment).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(emp.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ISR Retenido vs Calculado por Mes</CardTitle>
              <CardDescription>Comparativo mensual del ejercicio fiscal {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="retained" name="ISR Retenido" fill="hsl(var(--primary))" />
                    <Bar dataKey="calculated" name="ISR Calculado" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Acciones
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generar Constancias
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
