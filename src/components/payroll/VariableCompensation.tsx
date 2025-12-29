import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  DollarSign, 
  TrendingUp,
  Target,
  Award,
  Calculator,
  FileDown,
  Users
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { toast } from "sonner";

export function VariableCompensation() {
  const [activeTab, setActiveTab] = useState("commissions");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Commission data
  const commissions = [
    { id: "1", employee: "María García", department: "Sales", baseSales: 500000, commissionRate: 5, earned: 25000, status: "pending" },
    { id: "2", employee: "Juan Hernández", department: "Sales", baseSales: 380000, commissionRate: 5, earned: 19000, status: "approved" },
    { id: "3", employee: "Ana Martínez", department: "Sales", baseSales: 620000, commissionRate: 6, earned: 37200, status: "approved" },
    { id: "4", employee: "Carlos López", department: "Business Dev", baseSales: 280000, commissionRate: 4, earned: 11200, status: "pending" },
  ];

  // Bonus data
  const bonuses = [
    { id: "1", employee: "Pedro Jiménez", type: "Performance Bonus", amount: 15000, period: "Q4 2024", status: "paid" },
    { id: "2", employee: "Laura Rodríguez", type: "Signing Bonus", amount: 30000, period: "Jan 2025", status: "approved" },
    { id: "3", employee: "Team Alpha", type: "Team Bonus", amount: 50000, period: "Q4 2024", status: "paid" },
    { id: "4", employee: "María García", type: "Retention Bonus", amount: 25000, period: "Feb 2025", status: "pending" },
  ];

  // Incentive programs
  const incentivePrograms = [
    { id: "1", name: "Q1 Sales Sprint", type: "Sales", target: 2000000, achieved: 1850000, participants: 12, status: "active" },
    { id: "2", name: "Customer Satisfaction", type: "Service", target: 95, achieved: 92.5, participants: 25, status: "active" },
    { id: "3", name: "Cost Reduction Initiative", type: "Operations", target: 500000, achieved: 520000, participants: 8, status: "completed" },
  ];

  const monthlyTrend = [
    { month: "Aug", commissions: 85000, bonuses: 45000 },
    { month: "Sep", commissions: 92000, bonuses: 30000 },
    { month: "Oct", commissions: 78000, bonuses: 60000 },
    { month: "Nov", commissions: 105000, bonuses: 35000 },
    { month: "Dec", commissions: 120000, bonuses: 80000 },
    { month: "Jan", commissions: 92400, bonuses: 50000 },
  ];

  const totalCommissions = commissions.reduce((sum, c) => sum + c.earned, 0);
  const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Variable Compensation</h2>
          <p className="text-sm text-muted-foreground">
            Manage commissions, bonuses, and incentive programs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Variable Compensation</DialogTitle>
                <DialogDescription>
                  Add a new commission, bonus, or incentive entry
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commission">Commission</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="incentive">Incentive Payout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">María García López</SelectItem>
                      <SelectItem value="2">Juan Hernández Pérez</SelectItem>
                      <SelectItem value="3">Ana Martínez Ruiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Input type="month" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input placeholder="Optional description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success("Entry added successfully");
                  setIsAddOpen(false);
                }}>
                  Add Entry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalCommissions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Commissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalBonuses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Bonuses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{incentivePrograms.filter(p => p.status === "active").length}</p>
                <p className="text-xs text-muted-foreground">Active Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{commissions.length + bonuses.length}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variable Compensation Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${(v/1000)}K`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="commissions" name="Commissions" fill="hsl(var(--primary))" />
                <Bar dataKey="bonuses" name="Bonuses" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
          <TabsTrigger value="incentives">Incentive Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell className="font-medium">{comm.employee}</TableCell>
                      <TableCell>{comm.department}</TableCell>
                      <TableCell className="text-right">${comm.baseSales.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{comm.commissionRate}%</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${comm.earned.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={comm.status === "approved" ? "default" : "outline"}>
                          {comm.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonuses">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Bonus Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee/Team</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell className="font-medium">{bonus.employee}</TableCell>
                      <TableCell>{bonus.type}</TableCell>
                      <TableCell>{bonus.period}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        ${bonus.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={bonus.status === "paid" ? "default" : bonus.status === "approved" ? "secondary" : "outline"}
                        >
                          {bonus.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incentives">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Incentive Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {incentivePrograms.map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{program.name}</h4>
                        <p className="text-sm text-muted-foreground">{program.type}</p>
                      </div>
                      <Badge variant={program.status === "active" ? "default" : "secondary"}>
                        {program.status}
                      </Badge>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="font-medium">
                          {typeof program.target === "number" && program.target > 1000 
                            ? `$${program.target.toLocaleString()}`
                            : `${program.target}%`
                          }
                        </p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Achieved</p>
                        <p className="font-medium text-green-600">
                          {typeof program.achieved === "number" && program.achieved > 1000 
                            ? `$${program.achieved.toLocaleString()}`
                            : `${program.achieved}%`
                          }
                        </p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Participants</p>
                        <p className="font-medium">{program.participants}</p>
                      </div>
                    </div>
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