import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  FileDown, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  Globe,
  Layers
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export function MultiCompanyConsolidation() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01");
  const [isLoading, setIsLoading] = useState(false);

  const companies = [
    { id: "1", name: "Intelli México", code: "MX-001", country: "Mexico", currency: "MXN", employees: 156 },
    { id: "2", name: "Intelli Jamaica", code: "JM-001", country: "Jamaica", currency: "JMD", employees: 89 },
    { id: "3", name: "Intelli Ghana", code: "GH-001", country: "Ghana", currency: "GHS", employees: 124 },
    { id: "4", name: "Intelli Nigeria", code: "NG-001", country: "Nigeria", currency: "NGN", employees: 210 },
    { id: "5", name: "Intelli Trinidad", code: "TT-001", country: "Trinidad", currency: "TTD", employees: 67 },
  ];

  const consolidatedData = [
    { company: "México", grossPay: 4500000, deductions: 1125000, netPay: 3375000, headcount: 156 },
    { company: "Jamaica", grossPay: 2800000, deductions: 560000, netPay: 2240000, headcount: 89 },
    { company: "Ghana", grossPay: 1850000, deductions: 370000, netPay: 1480000, headcount: 124 },
    { company: "Nigeria", grossPay: 3200000, deductions: 640000, netPay: 2560000, headcount: 210 },
    { company: "Trinidad", grossPay: 1200000, deductions: 240000, netPay: 960000, headcount: 67 },
  ];

  const costByCategory = [
    { name: "Salaries", value: 9500000, color: "hsl(var(--primary))" },
    { name: "Social Security", value: 1450000, color: "hsl(var(--chart-2))" },
    { name: "Benefits", value: 850000, color: "hsl(var(--chart-3))" },
    { name: "Taxes", value: 1135000, color: "hsl(var(--chart-4))" },
  ];

  const toggleCompany = (id: string) => {
    setSelectedCompanies(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(companies.map(c => c.id));
    }
  };

  const runConsolidation = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const totals = consolidatedData.reduce((acc, row) => ({
    grossPay: acc.grossPay + row.grossPay,
    deductions: acc.deductions + row.deductions,
    netPay: acc.netPay + row.netPay,
    headcount: acc.headcount + row.headcount
  }), { grossPay: 0, deductions: 0, netPay: 0, headcount: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Multi-Company Consolidation</h2>
          <p className="text-sm text-muted-foreground">
            Consolidated payroll reporting across all entities
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{companies.length}</p>
                <p className="text-xs text-muted-foreground">Legal Entities</p>
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
                <p className="text-2xl font-bold">{totals.headcount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Employees</p>
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
                <p className="text-2xl font-bold">${(totals.grossPay / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Total Gross Pay (USD)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="by-company">By Company</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
          <TabsTrigger value="selection">Entity Selection</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consolidated Payroll by Entity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consolidatedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="company" />
                    <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="grossPay" name="Gross Pay" fill="hsl(var(--primary))" />
                    <Bar dataKey="netPay" name="Net Pay" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Breakdown by Company</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Headcount</TableHead>
                    <TableHead className="text-right">Gross Pay (USD)</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead className="text-right">Avg. Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedData.map((row) => (
                    <TableRow key={row.company}>
                      <TableCell className="font-medium">{row.company}</TableCell>
                      <TableCell className="text-right">{row.headcount}</TableCell>
                      <TableCell className="text-right">${row.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${row.deductions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${row.netPay.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        ${Math.round(row.grossPay / row.headcount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{totals.headcount}</TableCell>
                    <TableCell className="text-right">${totals.grossPay.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${totals.deductions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${totals.netPay.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      ${Math.round(totals.grossPay / totals.headcount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-category" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {costByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costByCategory.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className="font-bold">${cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="selection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Select Entities for Consolidation
              </CardTitle>
              <CardDescription>
                Choose which legal entities to include in the consolidated report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox 
                    checked={selectedCompanies.length === companies.length}
                    onCheckedChange={selectAll}
                  />
                  <span className="font-medium">Select All</span>
                </div>

                <div className="grid gap-3">
                  {companies.map((company) => (
                    <div 
                      key={company.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCompanies.includes(company.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleCompany(company.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedCompanies.includes(company.id)} />
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {company.code} • {company.country}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{company.currency}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {company.employees} employees
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  onClick={runConsolidation}
                  disabled={selectedCompanies.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Consolidated Report ({selectedCompanies.length} entities)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}