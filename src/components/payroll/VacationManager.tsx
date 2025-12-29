import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Sun, 
  DollarSign,
  Calculator,
  FileDown,
  Users,
  TrendingUp,
  AlertCircle,
  Settings
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VacationManagerProps {
  companyId?: string;
}

export function VacationManager({ companyId }: VacationManagerProps) {
  const [activeTab, setActiveTab] = useState("balances");
  const [selectedYear, setSelectedYear] = useState("2025");

  const employeeVacations = [
    { 
      id: "1", 
      name: "Maria Garcia", 
      hireDate: "2020-03-15", 
      yearsWorked: 5, 
      daysEntitled: 25, 
      daysTaken: 10, 
      daysRemaining: 15,
      carryOver: 3,
      pendingRequests: 2
    },
    { 
      id: "2", 
      name: "John Smith", 
      hireDate: "2022-06-01", 
      yearsWorked: 3, 
      daysEntitled: 20, 
      daysTaken: 18, 
      daysRemaining: 2,
      carryOver: 0,
      pendingRequests: 0
    },
    { 
      id: "3", 
      name: "Ana Martinez", 
      hireDate: "2019-01-10", 
      yearsWorked: 6, 
      daysEntitled: 25, 
      daysTaken: 8, 
      daysRemaining: 17,
      carryOver: 5,
      pendingRequests: 0
    },
  ];

  const accrualHistory = [
    { period: "January 2025", accrued: 2.08, taken: 0, balance: 15.08 },
    { period: "February 2025", accrued: 2.08, taken: 3, balance: 14.16 },
    { period: "March 2025", accrued: 2.08, taken: 0, balance: 16.24 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Vacation Management</h2>
          <p className="text-sm text-muted-foreground">
            Track vacation balances, accruals, and requests
          </p>
        </div>
        <Button variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="balances" className="gap-1">
            <Sun className="h-4 w-4" />
            Balances
          </TabsTrigger>
          <TabsTrigger value="accrual" className="gap-1">
            <Calendar className="h-4 w-4" />
            Accrual
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-1">
            <Settings className="h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-muted-foreground">Active Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Sun className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2,840</p>
                    <p className="text-xs text-muted-foreground">Days Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,120</p>
                    <p className="text-xs text-muted-foreground">Days Taken YTD</p>
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
                    <p className="text-2xl font-bold">$485K</p>
                    <p className="text-xs text-muted-foreground">Accrued Liability</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vacation Balances by Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead className="text-center">Years</TableHead>
                    <TableHead className="text-center">Entitled</TableHead>
                    <TableHead className="text-center">Taken</TableHead>
                    <TableHead className="text-center">Carry Over</TableHead>
                    <TableHead className="text-center">Remaining</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeVacations.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.hireDate}</TableCell>
                      <TableCell className="text-center">{emp.yearsWorked}</TableCell>
                      <TableCell className="text-center">{emp.daysEntitled}</TableCell>
                      <TableCell className="text-center">{emp.daysTaken}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{emp.carryOver}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={emp.daysRemaining > 5 ? "default" : "destructive"}>
                          {emp.daysRemaining}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress 
                          value={(emp.daysTaken / emp.daysEntitled) * 100} 
                          className="h-2"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accrual" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vacation days accrue based on your company's policy. 
              Configure accrual rules in the Policies tab.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accrual Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Accrual Method</Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Base Days Per Year</Label>
                    <Input type="number" defaultValue="25" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Carry Over Days</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                </div>
                <Button>Save Configuration</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Accrual Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Accrued</TableHead>
                      <TableHead className="text-right">Taken</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accrualHistory.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.period}</TableCell>
                        <TableCell className="text-right text-green-600">+{row.accrued}</TableCell>
                        <TableCell className="text-right text-red-600">-{row.taken}</TableCell>
                        <TableCell className="text-right font-medium">{row.balance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vacation Policies</CardTitle>
              <CardDescription>
                Configure vacation entitlement based on tenure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Years of Service</TableHead>
                    <TableHead className="text-center">Days Entitled</TableHead>
                    <TableHead className="text-center">Max Carry Over</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>0-1 years</TableCell>
                    <TableCell className="text-center">15</TableCell>
                    <TableCell className="text-center">0</TableCell>
                    <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>1-3 years</TableCell>
                    <TableCell className="text-center">20</TableCell>
                    <TableCell className="text-center">5</TableCell>
                    <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3-5 years</TableCell>
                    <TableCell className="text-center">25</TableCell>
                    <TableCell className="text-center">5</TableCell>
                    <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>5+ years</TableCell>
                    <TableCell className="text-center">30</TableCell>
                    <TableCell className="text-center">10</TableCell>
                    <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average utilization</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <Progress value={68} />
                  <p className="text-xs text-muted-foreground">
                    Employees are using 68% of their vacation entitlement on average
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liability Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">$485K</p>
                      <p className="text-xs text-muted-foreground">Current Liability</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-500">$520K</p>
                      <p className="text-xs text-muted-foreground">Year-End Forecast</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
