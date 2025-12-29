import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  FileDown,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, ReferenceLine } from "recharts";

export function PayrollBudgeting() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [activeTab, setActiveTab] = useState("overview");

  const annualBudget = 180000000; // $180M
  const ytdSpend = 15200000; // January spend
  const projectedAnnual = ytdSpend * 12;
  const variance = annualBudget - projectedAnnual;
  const variancePercent = ((variance / annualBudget) * 100).toFixed(1);

  const monthlyBudget = [
    { month: "Jan", budget: 15000000, actual: 15200000, variance: -200000 },
    { month: "Feb", budget: 15000000, actual: null, variance: null },
    { month: "Mar", budget: 15000000, actual: null, variance: null },
    { month: "Apr", budget: 15000000, actual: null, variance: null },
    { month: "May", budget: 15000000, actual: null, variance: null },
    { month: "Jun", budget: 15000000, actual: null, variance: null },
    { month: "Jul", budget: 15000000, actual: null, variance: null },
    { month: "Aug", budget: 15000000, actual: null, variance: null },
    { month: "Sep", budget: 15000000, actual: null, variance: null },
    { month: "Oct", budget: 15000000, actual: null, variance: null },
    { month: "Nov", budget: 15000000, actual: null, variance: null },
    { month: "Dec", budget: 15000000, actual: null, variance: null },
  ];

  const departmentBudgets = [
    { department: "Sales", budget: 35000000, actual: 3100000, ytdBudget: 2917000, variance: -183000, headcount: 45 },
    { department: "Technology", budget: 48000000, actual: 4100000, ytdBudget: 4000000, variance: -100000, headcount: 60 },
    { department: "Operations", budget: 42000000, actual: 3400000, ytdBudget: 3500000, variance: 100000, headcount: 85 },
    { department: "HR", budget: 18000000, actual: 1500000, ytdBudget: 1500000, variance: 0, headcount: 20 },
    { department: "Finance", budget: 22000000, actual: 1850000, ytdBudget: 1833000, variance: -17000, headcount: 25 },
    { department: "Marketing", budget: 15000000, actual: 1250000, ytdBudget: 1250000, variance: 0, headcount: 15 },
  ];

  const costCategories = [
    { category: "Base Salaries", budget: 120000000, actual: 10200000, percent: 66.7 },
    { category: "Social Security", budget: 25000000, actual: 2100000, percent: 13.9 },
    { category: "Benefits", budget: 18000000, actual: 1500000, percent: 10.0 },
    { category: "Variable Comp", budget: 12000000, actual: 1000000, percent: 6.7 },
    { category: "Other", budget: 5000000, actual: 400000, percent: 2.7 },
  ];

  const historicalTrend = [
    { year: "2022", budget: 150000000, actual: 148500000 },
    { year: "2023", budget: 165000000, actual: 168200000 },
    { year: "2024", budget: 175000000, actual: 177500000 },
    { year: "2025", budget: 180000000, actual: projectedAnnual },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payroll Budgeting</h2>
          <p className="text-sm text-muted-foreground">
            Annual budget planning and variance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(annualBudget / 1000000).toFixed(0)}M</p>
                <p className="text-xs text-muted-foreground">Annual Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(ytdSpend / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">YTD Spend</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(projectedAnnual / 1000000).toFixed(0)}M</p>
                <p className="text-xs text-muted-foreground">Projected Annual</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                variance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {variance >= 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className={`text-2xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variance >= 0 ? '+' : ''}{variancePercent}%
                </p>
                <p className="text-xs text-muted-foreground">Variance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBudget}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: number) => value ? [`$${value.toLocaleString()}`, ''] : ['N/A', '']} />
                    <Legend />
                    <Bar dataKey="budget" name="Budget" fill="hsl(var(--muted-foreground))" opacity={0.5} />
                    <Bar dataKey="actual" name="Actual" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">YTD Budget Consumed</span>
                  <span className="font-medium">{((ytdSpend / annualBudget) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(ytdSpend / annualBudget) * 100} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>${(annualBudget / 1000000).toFixed(0)}M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Budget Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Annual Budget</TableHead>
                    <TableHead className="text-right">YTD Budget</TableHead>
                    <TableHead className="text-right">YTD Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentBudgets.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dept.department}</p>
                          <p className="text-xs text-muted-foreground">{dept.headcount} employees</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${(dept.budget / 1000000).toFixed(1)}M</TableCell>
                      <TableCell className="text-right">${dept.ytdBudget.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${dept.actual.toLocaleString()}</TableCell>
                      <TableCell className={`text-right ${dept.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dept.variance >= 0 ? '+' : ''}${dept.variance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {dept.variance >= 0 ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            On Track
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Over Budget
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costCategories.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-sm text-muted-foreground ml-2">({cat.percent}%)</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${cat.actual.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          of ${(cat.budget / 1000000).toFixed(0)}M budget
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={(cat.actual / (cat.budget / 12)) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historical Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="budget" 
                      name="Budget" 
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      name="Actual" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}