import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, TrendingUp, Building2, Calendar, Loader2, Download,
  PieChart, BarChart3, RefreshCw
} from "lucide-react";
import { useLeaveLiability, LeaveLiabilitySnapshot } from "@/hooks/useLeaveEnhancements";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function LeaveLiabilityPage() {
  const { t } = useLanguage();
  const { company } = useAuth();
  const { liabilitySnapshots, isLoading, generateSnapshot } = useLeaveLiability(company?.id);
  
  const [snapshotDate, setSnapshotDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  // Get latest snapshot for each leave type
  const latestSnapshots = liabilitySnapshots.reduce((acc, snapshot) => {
    const key = snapshot.leave_type_id || 'total';
    if (!acc[key] || new Date(snapshot.snapshot_date) > new Date(acc[key].snapshot_date)) {
      acc[key] = snapshot;
    }
    return acc;
  }, {} as Record<string, LeaveLiabilitySnapshot>);

  const latestSnapshotList = Object.values(latestSnapshots);
  const totalLiability = latestSnapshotList.reduce((sum, s) => sum + (s.total_liability_amount || 0), 0);
  const totalDays = latestSnapshotList.reduce((sum, s) => sum + s.total_days_balance, 0);
  const totalEmployees = Math.max(...latestSnapshotList.map(s => s.total_employees), 0);

  const handleGenerateSnapshot = async () => {
    await generateSnapshot.mutateAsync({
      snapshot_date: snapshotDate,
      notes: notes.trim() || undefined,
    });
    setNotes("");
  };

  // Prepare chart data
  const pieData = latestSnapshotList.map(s => ({
    name: s.leave_type?.name || 'Unknown',
    value: s.total_days_balance,
  }));

  const barData = latestSnapshotList.map(s => ({
    name: s.leave_type?.name || 'Unknown',
    accrued: s.total_days_accrued,
    used: s.total_days_used,
    balance: s.total_days_balance,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.leave"), href: "/leave" },
          { label: "Leave Liability" }
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Leave Liability Report
            </h1>
            <p className="text-muted-foreground">Track financial liability for accrued leave balances</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${totalLiability.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Outstanding balance value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Days Accrued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDays.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Across all leave types</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">With leave balances</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg per Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalEmployees > 0 ? (totalLiability / totalEmployees).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Leave liability value</p>
            </CardContent>
          </Card>
        </div>

        {/* Generate Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generate Liability Snapshot</CardTitle>
            <CardDescription>Create a point-in-time snapshot of leave liabilities for reporting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label>Snapshot Date</Label>
                <Input
                  type="date"
                  value={snapshotDate}
                  onChange={(e) => setSnapshotDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label>Notes (optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Q4 2024 Financial Close"
                />
              </div>
              <Button onClick={handleGenerateSnapshot} disabled={generateSnapshot.isPending}>
                {generateSnapshot.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Generate Snapshot
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Balance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Accrued vs Used by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accrued" fill="hsl(var(--chart-1))" name="Accrued" />
                    <Bar dataKey="used" fill="hsl(var(--chart-2))" name="Used" />
                    <Bar dataKey="balance" fill="hsl(var(--chart-3))" name="Balance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Snapshots Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Snapshot History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : liabilitySnapshots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No liability snapshots generated yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Days Accrued</TableHead>
                    <TableHead>Days Used</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Avg Rate</TableHead>
                    <TableHead>Total Liability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liabilitySnapshots.slice(0, 20).map(snapshot => (
                    <TableRow key={snapshot.id}>
                      <TableCell>{formatDateForDisplay(snapshot.snapshot_date)}</TableCell>
                      <TableCell>{snapshot.leave_type?.name || 'All Types'}</TableCell>
                      <TableCell>{snapshot.total_employees}</TableCell>
                      <TableCell>{snapshot.total_days_accrued.toFixed(1)}</TableCell>
                      <TableCell>{snapshot.total_days_used.toFixed(1)}</TableCell>
                      <TableCell className="font-medium">{snapshot.total_days_balance.toFixed(1)}</TableCell>
                      <TableCell>
                        {snapshot.avg_daily_rate ? `$${snapshot.avg_daily_rate.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {snapshot.total_liability_amount ? `$${snapshot.total_liability_amount.toFixed(2)}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
