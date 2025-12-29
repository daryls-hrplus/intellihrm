import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Users,
  Timer,
  FileDown,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export function TimeAttendanceIntegration() {
  const [activeTab, setActiveTab] = useState("summary");
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const syncStatus = {
    lastSync: "2025-01-15 14:30:00",
    status: "success",
    recordsProcessed: 1245,
    errors: 3
  };

  const attendanceSummary = [
    { employee: "María García", regularHours: 176, overtime: 12, absences: 0, late: 1, status: "complete" },
    { employee: "Juan Hernández", regularHours: 168, overtime: 8, absences: 1, late: 0, status: "complete" },
    { employee: "Ana Martínez", regularHours: 176, overtime: 20, absences: 0, late: 2, status: "warning" },
    { employee: "Carlos López", regularHours: 160, overtime: 0, absences: 2, late: 3, status: "review" },
    { employee: "Laura Rodríguez", regularHours: 176, overtime: 4, absences: 0, late: 0, status: "complete" },
  ];

  const overtimeRecords = [
    { employee: "María García", date: "2025-01-10", hours: 4, type: "Regular OT", rate: 1.5, amount: 600 },
    { employee: "María García", date: "2025-01-12", hours: 8, type: "Weekend OT", rate: 2.0, amount: 1600 },
    { employee: "Juan Hernández", date: "2025-01-08", hours: 3, type: "Regular OT", rate: 1.5, amount: 375 },
    { employee: "Juan Hernández", date: "2025-01-14", hours: 5, type: "Holiday OT", rate: 2.5, amount: 1250 },
    { employee: "Ana Martínez", date: "2025-01-06", hours: 6, type: "Regular OT", rate: 1.5, amount: 900 },
    { employee: "Ana Martínez", date: "2025-01-13", hours: 8, type: "Weekend OT", rate: 2.0, amount: 1600 },
    { employee: "Ana Martínez", date: "2025-01-14", hours: 6, type: "Holiday OT", rate: 2.5, amount: 1500 },
  ];

  const absenceRecords = [
    { employee: "Juan Hernández", date: "2025-01-09", type: "Sick Leave", hours: 8, paid: true },
    { employee: "Carlos López", date: "2025-01-07", type: "Personal Leave", hours: 8, paid: true },
    { employee: "Carlos López", date: "2025-01-11", type: "Unpaid Leave", hours: 8, paid: false },
  ];

  const runSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Time & Attendance data synchronized successfully");
    }, 2000);
  };

  const totalOvertime = overtimeRecords.reduce((sum, r) => sum + r.hours, 0);
  const totalOvertimePay = overtimeRecords.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Time & Attendance Integration</h2>
          <p className="text-sm text-muted-foreground">
            Sync attendance data for payroll processing
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoSync} 
              onCheckedChange={setAutoSync}
              id="auto-sync"
            />
            <Label htmlFor="auto-sync" className="text-sm">Auto-sync</Label>
          </div>
          <Button onClick={runSync} disabled={isSyncing}>
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sync Status */}
      <Alert className={syncStatus.status === "success" ? "border-green-500" : "border-orange-500"}>
        <CheckCircle className={`h-4 w-4 ${syncStatus.status === "success" ? "text-green-500" : "text-orange-500"}`} />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              Last sync: <strong>{syncStatus.lastSync}</strong> • 
              {syncStatus.recordsProcessed} records processed
              {syncStatus.errors > 0 && (
                <span className="text-orange-500 ml-2">
                  ({syncStatus.errors} errors)
                </span>
              )}
            </span>
            <Badge variant={syncStatus.status === "success" ? "default" : "destructive"}>
              {syncStatus.status}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{attendanceSummary.length}</p>
                <p className="text-xs text-muted-foreground">Employees Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOvertime}h</p>
                <p className="text-xs text-muted-foreground">Total Overtime</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalOvertimePay.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Overtime Pay</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{absenceRecords.length}</p>
                <p className="text-xs text-muted-foreground">Absences</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Attendance Summary</TabsTrigger>
          <TabsTrigger value="overtime">Overtime</TabsTrigger>
          <TabsTrigger value="absences">Absences</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Period Attendance Summary</CardTitle>
              <CardDescription>January 2025 pay period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Regular Hours</TableHead>
                    <TableHead className="text-right">Overtime</TableHead>
                    <TableHead className="text-right">Absences</TableHead>
                    <TableHead className="text-right">Late Arrivals</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceSummary.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.employee}</TableCell>
                      <TableCell className="text-right">{row.regularHours}h</TableCell>
                      <TableCell className="text-right">
                        {row.overtime > 0 ? (
                          <span className="text-orange-500">+{row.overtime}h</span>
                        ) : (
                          "0h"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.absences > 0 ? (
                          <span className="text-red-500">{row.absences}</span>
                        ) : (
                          "0"
                        )}
                      </TableCell>
                      <TableCell className="text-right">{row.late}</TableCell>
                      <TableCell>
                        {row.status === "complete" && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                        {row.status === "warning" && (
                          <Badge variant="secondary" className="bg-orange-500 text-white">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Warning
                          </Badge>
                        )}
                        {row.status === "review" && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Review
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

        <TabsContent value="overtime">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Overtime Records</CardTitle>
                <Button variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overtimeRecords.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{record.employee}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{record.hours}h</TableCell>
                      <TableCell className="text-right">{record.rate}x</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${record.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={3}>TOTAL</TableCell>
                    <TableCell className="text-right">{totalOvertime}h</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">${totalOvertimePay.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="absences">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Absence Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead>Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absenceRecords.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{record.employee}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell className="text-right">{record.hours}h</TableCell>
                      <TableCell>
                        {record.paid ? (
                          <Badge variant="default" className="bg-green-500">Paid</Badge>
                        ) : (
                          <Badge variant="destructive">Unpaid</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Integration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sync Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Overtime Threshold (hours/week)</Label>
                  <Select defaultValue="40">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="40">40 hours</SelectItem>
                      <SelectItem value="44">44 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}