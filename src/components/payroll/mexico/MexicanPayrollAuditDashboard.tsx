import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileSearch,
  Download,
  Clock,
  Eye,
  FileText,
  Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

interface MexicanPayrollAuditDashboardProps {
  companyId: string;
}

export function MexicanPayrollAuditDashboard({ companyId }: MexicanPayrollAuditDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");

  const auditScore = {
    overall: 94,
    cfdi: 98,
    imss: 92,
    isr: 96,
    infonavit: 91
  };

  const auditFindings = [
    {
      id: "1",
      severity: "high",
      category: "IMSS",
      finding: "Diferencia en cuotas patronales",
      amount: 12450.00,
      period: "Octubre 2024",
      status: "open"
    },
    {
      id: "2",
      severity: "medium",
      category: "CFDI",
      finding: "CFDI cancelados sin sustitución",
      amount: 0,
      period: "Septiembre 2024",
      status: "resolved"
    },
    {
      id: "3",
      severity: "low",
      category: "ISR",
      finding: "Subsidio mal calculado",
      amount: 850.00,
      period: "Noviembre 2024",
      status: "in_review"
    },
    {
      id: "4",
      severity: "medium",
      category: "INFONAVIT",
      finding: "Créditos no aplicados a tiempo",
      amount: 5200.00,
      period: "Diciembre 2024",
      status: "open"
    },
  ];

  const complianceHistory = [
    { month: "Jul", score: 88 },
    { month: "Ago", score: 90 },
    { month: "Sep", score: 91 },
    { month: "Oct", score: 89 },
    { month: "Nov", score: 92 },
    { month: "Dic", score: 94 },
    { month: "Ene", score: 94 },
  ];

  const auditAreas = [
    { area: "Timbrado CFDI", checks: 156, passed: 154, failed: 2 },
    { area: "Cálculo ISR", checks: 156, passed: 151, failed: 5 },
    { area: "Cuotas IMSS", checks: 156, passed: 148, failed: 8 },
    { area: "Descuentos INFONAVIT", checks: 45, passed: 43, failed: 2 },
    { area: "Retenciones FONACOT", checks: 28, passed: 28, failed: 0 },
    { area: "Cálculo Vacaciones", checks: 156, passed: 156, failed: 0 },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Alta</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><AlertTriangle className="h-3 w-3 mr-1" />Media</Badge>;
      case "low":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200"><FileSearch className="h-3 w-3 mr-1" />Baja</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Resuelto</Badge>;
      case "open":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Abierto</Badge>;
      case "in_review":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><Clock className="h-3 w-3 mr-1" />En Revisión</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Mexican Payroll Audit Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Compliance monitoring and audit findings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Score Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="col-span-1 border-2 border-primary">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{auditScore.overall}%</p>
              <p className="text-sm text-muted-foreground">Score General</p>
              <Progress value={auditScore.overall} className="mt-3 h-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{auditScore.cfdi}%</p>
                <p className="text-xs text-muted-foreground">CFDI</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{auditScore.imss}%</p>
                <p className="text-xs text-muted-foreground">IMSS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{auditScore.isr}%</p>
                <p className="text-xs text-muted-foreground">ISR</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{auditScore.infonavit}%</p>
                <p className="text-xs text-muted-foreground">INFONAVIT</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="findings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="findings">Audit Findings</TabsTrigger>
          <TabsTrigger value="checks">Compliance Checks</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Audit Findings</CardTitle>
              <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Finding</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditFindings.map((finding) => (
                    <TableRow key={finding.id}>
                      <TableCell>{getSeverityBadge(finding.severity)}</TableCell>
                      <TableCell className="font-medium">{finding.category}</TableCell>
                      <TableCell>{finding.finding}</TableCell>
                      <TableCell className="text-right">
                        {finding.amount > 0 ? `$${finding.amount.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>{finding.period}</TableCell>
                      <TableCell>{getStatusBadge(finding.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Check Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditAreas.map((area) => (
                  <div key={area.area} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{area.area}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-green-600">{area.passed} passed</span>
                        {area.failed > 0 && (
                          <span className="text-sm text-red-600">{area.failed} failed</span>
                        )}
                        <span className="font-bold w-16 text-right">
                          {Math.round((area.passed / area.checks) * 100)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={(area.passed / area.checks) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Score']} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
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
