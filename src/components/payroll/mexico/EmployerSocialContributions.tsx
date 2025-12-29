import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  BarChart3,
  PieChart
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

interface ContributionSummary {
  period: string;
  imssEmployer: number;
  imssEmployee: number;
  infonavitEmployer: number;
  rcv: number;
  isn: number;
  total: number;
}

const monthlyData: ContributionSummary[] = [
  { period: "Jul 2024", imssEmployer: 125000, imssEmployee: 45000, infonavitEmployer: 25000, rcv: 35000, isn: 15000, total: 245000 },
  { period: "Aug 2024", imssEmployer: 128000, imssEmployee: 46200, infonavitEmployer: 25600, rcv: 35700, isn: 15300, total: 250800 },
  { period: "Sep 2024", imssEmployer: 130000, imssEmployee: 47000, infonavitEmployer: 26000, rcv: 36400, isn: 15600, total: 255000 },
  { period: "Oct 2024", imssEmployer: 135000, imssEmployee: 48500, infonavitEmployer: 27000, rcv: 37800, isn: 16200, total: 264500 },
  { period: "Nov 2024", imssEmployer: 138000, imssEmployee: 49700, infonavitEmployer: 27600, rcv: 38500, isn: 16500, total: 270300 },
  { period: "Dec 2024", imssEmployer: 145000, imssEmployee: 52200, infonavitEmployer: 29000, rcv: 40600, isn: 17400, total: 284200 },
];

const imssBreakdown = [
  { name: "Enfermedades y Maternidad", value: 45000, color: "#3b82f6" },
  { name: "Invalidez y Vida", value: 18000, color: "#8b5cf6" },
  { name: "Cesantía Edad Avanzada", value: 25000, color: "#06b6d4" },
  { name: "Riesgos de Trabajo", value: 12000, color: "#f59e0b" },
  { name: "Guarderías", value: 8000, color: "#10b981" },
  { name: "Retiro", value: 15000, color: "#ef4444" },
];

const stateISN = [
  { state: "CDMX", employees: 45, taxablePayroll: 890000, rate: 3.0, amount: 26700 },
  { state: "Estado de México", employees: 28, taxablePayroll: 520000, rate: 3.0, amount: 15600 },
  { state: "Jalisco", employees: 15, taxablePayroll: 280000, rate: 2.5, amount: 7000 },
  { state: "Nuevo León", employees: 12, taxablePayroll: 240000, rate: 3.0, amount: 7200 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];

export function EmployerSocialContributions() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-12");
  const [selectedState, setSelectedState] = useState("all");

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  
  const totalChange = ((currentMonth.total - previousMonth.total) / previousMonth.total * 100).toFixed(1);
  const isIncrease = Number(totalChange) > 0;

  const totalIMSS = currentMonth.imssEmployer + currentMonth.imssEmployee;
  const totalContributions = currentMonth.total;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employer Social Contributions</h2>
          <p className="text-muted-foreground">
            IMSS, INFONAVIT, RCV, and ISN contribution analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-12">Dec 2024</SelectItem>
              <SelectItem value="2024-11">Nov 2024</SelectItem>
              <SelectItem value="2024-10">Oct 2024</SelectItem>
              <SelectItem value="2024-09">Sep 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contributions</p>
                <p className="text-2xl font-bold">${totalContributions.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm">
                  {isIncrease ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="text-red-500">+{totalChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">{totalChange}%</span>
                    </>
                  )}
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">IMSS Total</p>
                <p className="text-2xl font-bold">${totalIMSS.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  Patron: ${currentMonth.imssEmployer.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">INFONAVIT</p>
                <p className="text-2xl font-bold">${currentMonth.infonavitEmployer.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">5% of SBC</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Building2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ISN (All States)</p>
                <p className="text-2xl font-bold">${currentMonth.isn.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">4 states</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="imss">IMSS Breakdown</TabsTrigger>
          <TabsTrigger value="isn">ISN by State</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Contributions</CardTitle>
                <CardDescription>Last 6 months contribution breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="imssEmployer" name="IMSS Patrón" fill="#3b82f6" stackId="a" />
                    <Bar dataKey="imssEmployee" name="IMSS Trabajador" fill="#60a5fa" stackId="a" />
                    <Bar dataKey="infonavitEmployer" name="INFONAVIT" fill="#10b981" stackId="a" />
                    <Bar dataKey="rcv" name="RCV" fill="#8b5cf6" stackId="a" />
                    <Bar dataKey="isn" name="ISN" fill="#f59e0b" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contribution Distribution</CardTitle>
                <CardDescription>Current month breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: "IMSS Patrón", value: currentMonth.imssEmployer },
                        { name: "IMSS Trabajador", value: currentMonth.imssEmployee },
                        { name: "INFONAVIT", value: currentMonth.infonavitEmployer },
                        { name: "RCV", value: currentMonth.rcv },
                        { name: "ISN", value: currentMonth.isn },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="imss">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>IMSS Branch Breakdown</CardTitle>
                <CardDescription>Employer contributions by IMSS branch</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={imssBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {imssBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IMSS Contribution Details</CardTitle>
                <CardDescription>Breakdown by branch and rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imssBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="font-medium">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between font-medium">
                      <span>Total IMSS Patrón</span>
                      <span>${imssBreakdown.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="isn">
          <Card>
            <CardHeader>
              <CardTitle>ISN by State</CardTitle>
              <CardDescription>State payroll tax (Impuesto Sobre Nóminas) breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">State</th>
                      <th className="text-right py-3 px-4">Employees</th>
                      <th className="text-right py-3 px-4">Taxable Payroll</th>
                      <th className="text-right py-3 px-4">Rate</th>
                      <th className="text-right py-3 px-4">ISN Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateISN.map((state) => (
                      <tr key={state.state} className="border-b">
                        <td className="py-3 px-4 font-medium">{state.state}</td>
                        <td className="text-right py-3 px-4">{state.employees}</td>
                        <td className="text-right py-3 px-4">${state.taxablePayroll.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{state.rate}%</td>
                        <td className="text-right py-3 px-4 font-medium">${state.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50">
                      <td className="py-3 px-4 font-bold">Total</td>
                      <td className="text-right py-3 px-4 font-bold">
                        {stateISN.reduce((sum, s) => sum + s.employees, 0)}
                      </td>
                      <td className="text-right py-3 px-4 font-bold">
                        ${stateISN.reduce((sum, s) => sum + s.taxablePayroll, 0).toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4">-</td>
                      <td className="text-right py-3 px-4 font-bold">
                        ${stateISN.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Trends</CardTitle>
              <CardDescription>6-month contribution growth analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="Total" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
