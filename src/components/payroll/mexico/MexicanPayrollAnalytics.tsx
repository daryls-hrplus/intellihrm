import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  AlertTriangle,
  Building2,
  Percent,
} from "lucide-react";

interface MexicanPayrollAnalyticsProps {
  companyId: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function MexicanPayrollAnalytics({ companyId }: MexicanPayrollAnalyticsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for analytics
  const monthlyPayrollData = [
    { month: "Ene", grossPay: 2500000, isr: 375000, imss: 125000, netPay: 2000000 },
    { month: "Feb", grossPay: 2520000, isr: 378000, imss: 126000, netPay: 2016000 },
    { month: "Mar", grossPay: 2550000, isr: 382500, imss: 127500, netPay: 2040000 },
    { month: "Abr", grossPay: 2580000, isr: 387000, imss: 129000, netPay: 2064000 },
    { month: "May", grossPay: 2600000, isr: 390000, imss: 130000, netPay: 2080000 },
    { month: "Jun", grossPay: 2650000, isr: 397500, imss: 132500, netPay: 2120000 },
    { month: "Jul", grossPay: 2700000, isr: 405000, imss: 135000, netPay: 2160000 },
    { month: "Ago", grossPay: 2750000, isr: 412500, imss: 137500, netPay: 2200000 },
    { month: "Sep", grossPay: 2800000, isr: 420000, imss: 140000, netPay: 2240000 },
    { month: "Oct", grossPay: 2850000, isr: 427500, imss: 142500, netPay: 2280000 },
    { month: "Nov", grossPay: 2900000, isr: 435000, imss: 145000, netPay: 2320000 },
    { month: "Dic", grossPay: 3500000, isr: 525000, imss: 175000, netPay: 2800000 },
  ];

  const taxDistributionData = [
    { name: "ISR", value: 4935000, color: "#FF6B6B" },
    { name: "IMSS Patrón", value: 1645000, color: "#4ECDC4" },
    { name: "IMSS Trabajador", value: 823000, color: "#45B7D1" },
    { name: "INFONAVIT", value: 987000, color: "#96CEB4" },
    { name: "SAR", value: 658000, color: "#FFEAA7" },
  ];

  const employeeDistributionData = [
    { name: "Operativos", value: 45, color: "#0088FE" },
    { name: "Administrativos", value: 25, color: "#00C49F" },
    { name: "Gerentes", value: 15, color: "#FFBB28" },
    { name: "Directivos", value: 10, color: "#FF8042" },
    { name: "Otros", value: 5, color: "#8884d8" },
  ];

  const cfdiStatusData = [
    { month: "Ene", timbrados: 120, cancelados: 2, pendientes: 0 },
    { month: "Feb", timbrados: 122, cancelados: 1, pendientes: 0 },
    { month: "Mar", timbrados: 125, cancelados: 3, pendientes: 1 },
    { month: "Abr", timbrados: 128, cancelados: 2, pendientes: 0 },
    { month: "May", timbrados: 130, cancelados: 1, pendientes: 2 },
    { month: "Jun", timbrados: 132, cancelados: 4, pendientes: 0 },
  ];

  const complianceData = [
    { name: "CFDIs Timbrados", status: "success", value: 98.5 },
    { name: "Declaraciones IMSS", status: "success", value: 100 },
    { name: "Pagos ISR", status: "success", value: 100 },
    { name: "SUA Presentado", status: "warning", value: 92 },
    { name: "Constancias Entregadas", status: "error", value: 75 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const totalGrossPay = monthlyPayrollData.reduce((sum, m) => sum + m.grossPay, 0);
  const totalISR = monthlyPayrollData.reduce((sum, m) => sum + m.isr, 0);
  const totalIMSS = monthlyPayrollData.reduce((sum, m) => sum + m.imss, 0);
  const avgEmployees = 125;
  const avgSalary = totalGrossPay / 12 / avgEmployees;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analítica de Nómina Mexicana
        </CardTitle>
        <CardDescription>
          Dashboard de métricas, cumplimiento fiscal y tendencias de nómina
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Selector */}
        <div className="flex gap-4 items-center">
          <Label>Año:</Label>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2022, 2023, 2024].map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Nómina Anual
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalGrossPay)}</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8.5% vs año anterior
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Percent className="h-4 w-4" />
              ISR Retenido
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalISR)}</div>
            <div className="text-xs text-muted-foreground">
              {((totalISR / totalGrossPay) * 100).toFixed(1)}% de nómina
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Empleados Promedio
            </div>
            <div className="text-2xl font-bold">{avgEmployees}</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12 nuevas contrataciones
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Costo Patronal IMSS
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalIMSS * 2.5)}</div>
            <div className="text-xs text-amber-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +5.2% por incremento UMA
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="taxes">Impuestos</TabsTrigger>
            <TabsTrigger value="cfdi">CFDI</TabsTrigger>
            <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evolución Mensual de Nómina</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyPayrollData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="grossPay"
                      name="Nómina Bruta"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="netPay"
                      name="Nómina Neta"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribución por Tipo de Empleado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={employeeDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {employeeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Carga Fiscal Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyPayrollData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="isr" name="ISR" fill="#FF6B6B" />
                      <Bar dataKey="imss" name="IMSS" fill="#4ECDC4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribución de Impuestos y Cuotas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taxDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {taxDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Desglose Anual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {taxDistributionData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-4 flex justify-between font-bold">
                      <span>Total Carga Fiscal</span>
                      <span>
                        {formatCurrency(taxDistributionData.reduce((sum, t) => sum + t.value, 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CFDI Tab */}
          <TabsContent value="cfdi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado de CFDIs por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cfdiStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="timbrados" name="Timbrados" fill="#00C49F" />
                    <Bar dataKey="cancelados" name="Cancelados" fill="#FF8042" />
                    <Bar dataKey="pendientes" name="Pendientes" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">757</div>
                <div className="text-sm text-muted-foreground">CFDIs Timbrados</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-600">13</div>
                <div className="text-sm text-muted-foreground">Cancelados</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-red-600">3</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Indicadores de Cumplimiento</CardTitle>
                <CardDescription>Estado de obligaciones fiscales y laborales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {item.status === "success" && (
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                          {item.status === "warning" && (
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                          )}
                          {item.status === "error" && (
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                          {item.name}
                        </span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "success"
                              ? "bg-green-500"
                              : item.status === "warning"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Alertas de Cumplimiento
              </div>
              <ul className="mt-2 space-y-1 text-sm text-amber-600 dark:text-amber-400">
                <li>• 25% de constancias de retenciones pendientes de entregar</li>
                <li>• Archivo SUA del mes anterior pendiente de validación</li>
                <li>• Próximo vencimiento: Declaración IMSS - 17 de este mes</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
