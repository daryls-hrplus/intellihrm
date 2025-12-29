import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  FileDown, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PieChart
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

export default function MssPayrollConsolidationPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01");
  const [selectedView, setSelectedView] = useState("overview");

  // Mock data for manager's team across entities
  const teamByEntity = [
    { 
      entity: "HRPlus México", 
      code: "MX-001",
      headcount: 24,
      grossPay: 485000,
      netPay: 364000,
      overtime: 12500,
      status: "processed",
      variance: 2.3
    },
    { 
      entity: "HRPlus Jamaica", 
      code: "JM-001",
      headcount: 12,
      grossPay: 180000,
      netPay: 144000,
      overtime: 4200,
      status: "processed",
      variance: -1.2
    },
    { 
      entity: "HRPlus Ghana", 
      code: "GH-001",
      headcount: 8,
      grossPay: 95000,
      netPay: 76000,
      overtime: 2100,
      status: "pending",
      variance: 0.8
    },
  ];

  const trendData = [
    { month: "Oct", mexico: 470000, jamaica: 175000, ghana: 92000 },
    { month: "Nov", mexico: 478000, jamaica: 178000, ghana: 94000 },
    { month: "Dec", mexico: 495000, jamaica: 182000, ghana: 93000 },
    { month: "Jan", mexico: 485000, jamaica: 180000, ghana: 95000 },
  ];

  const costBreakdown = [
    { category: "Base Salary", amount: 620000, percentage: 82 },
    { category: "Overtime", amount: 18800, percentage: 2.5 },
    { category: "Allowances", amount: 45000, percentage: 6 },
    { category: "Benefits", amount: 72000, percentage: 9.5 },
  ];

  const alerts = [
    { type: "warning", entity: "Ghana", message: "Payroll pending approval - due in 2 days" },
    { type: "info", entity: "México", message: "CFDI timbrado completed for all employees" },
    { type: "success", entity: "Jamaica", message: "Bank file submitted successfully" },
  ];

  const totals = teamByEntity.reduce((acc, row) => ({
    headcount: acc.headcount + row.headcount,
    grossPay: acc.grossPay + row.grossPay,
    netPay: acc.netPay + row.netPay,
    overtime: acc.overtime + row.overtime
  }), { headcount: 0, grossPay: 0, netPay: 0, overtime: 0 });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Processed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Payroll Consolidation</h1>
          <p className="text-muted-foreground">
            View payroll summary for your team across all entities
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">January 2025</SelectItem>
              <SelectItem value="2024-12">December 2024</SelectItem>
              <SelectItem value="2024-11">November 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map((alert, idx) => (
          <div 
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              alert.type === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20' :
              alert.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-950/20' :
              'bg-blue-50 border-blue-200 dark:bg-blue-950/20'
            }`}
          >
            {alert.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-600" />}
            {alert.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            {alert.type === 'info' && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
            <span className="font-medium">{alert.entity}:</span>
            <span className="text-sm">{alert.message}</span>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamByEntity.length}</p>
                <p className="text-xs text-muted-foreground">Entities</p>
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
                <p className="text-2xl font-bold">{totals.headcount}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
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
                <p className="text-2xl font-bold">${(totals.grossPay / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Total Gross Pay</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold">+1.8%</p>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">vs Last Period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="by-entity">By Entity</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Payroll by Entity</CardTitle>
              <CardDescription>Current period gross pay distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamByEntity} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="entity" width={120} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Bar dataKey="grossPay" name="Gross Pay" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-entity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Entity Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead className="text-right">Headcount</TableHead>
                    <TableHead className="text-right">Gross Pay</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead className="text-right">Overtime</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamByEntity.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{row.entity}</p>
                          <p className="text-xs text-muted-foreground">{row.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{row.headcount}</TableCell>
                      <TableCell className="text-right">${row.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${row.netPay.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${row.overtime.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`flex items-center justify-end gap-1 ${row.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.variance >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(row.variance)}%
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{totals.headcount}</TableCell>
                    <TableCell className="text-right">${totals.grossPay.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${totals.netPay.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${totals.overtime.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payroll Trends (Last 4 Periods)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="mexico" name="México" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="jamaica" name="Jamaica" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="ghana" name="Ghana" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Cost Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costBreakdown.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{item.percentage}%</span>
                        <span className="font-bold w-24 text-right">${item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
