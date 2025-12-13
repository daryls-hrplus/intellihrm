import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayroll, PayPeriodSchedule, PayPeriod } from "@/hooks/usePayroll";
import { useLeaveCompanyFilter, LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Plus, Edit, Trash2, Calendar, RefreshCw, Clock } from "lucide-react";
import { format } from "date-fns";

export default function PayPeriodsPage() {
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const {
    isLoading,
    fetchPayPeriodSchedules,
    createPayPeriodSchedule,
    updatePayPeriodSchedule,
    deletePayPeriodSchedule,
    fetchPayPeriods,
    createPayPeriod,
    generatePayPeriods,
  } = usePayroll();

  const [schedules, setSchedules] = useState<PayPeriodSchedule[]>([]);
  const [periods, setPeriods] = useState<PayPeriod[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PayPeriodSchedule | null>(null);
  const [activeTab, setActiveTab] = useState("schedules");

  const [scheduleForm, setScheduleForm] = useState({
    code: "",
    name: "",
    description: "",
    frequency: "monthly" as PayPeriodSchedule['frequency'],
    pay_day_of_week: null as number | null,
    pay_day_of_month: 25,
    second_pay_day_of_month: null as number | null,
    cutoff_days_before_pay: 3,
    is_active: true,
  });

  const [generateForm, setGenerateForm] = useState({
    schedule_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
  });

  useEffect(() => {
    if (selectedCompanyId) {
      loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    if (!selectedCompanyId) return;
    const [scheduleData, periodData] = await Promise.all([
      fetchPayPeriodSchedules(selectedCompanyId),
      fetchPayPeriods(selectedCompanyId),
    ]);
    setSchedules(scheduleData);
    setPeriods(periodData);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedCompanyId) return;

    const data = {
      ...scheduleForm,
      company_id: selectedCompanyId,
    };

    let success;
    if (editingSchedule) {
      success = await updatePayPeriodSchedule(editingSchedule.id, data);
    } else {
      success = await createPayPeriodSchedule(data);
    }

    if (success) {
      setScheduleDialogOpen(false);
      resetScheduleForm();
      loadData();
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      const success = await deletePayPeriodSchedule(id);
      if (success) loadData();
    }
  };

  const handleGeneratePeriods = async () => {
    if (!selectedCompanyId || !generateForm.schedule_id) return;

    const success = await generatePayPeriods(
      generateForm.schedule_id,
      selectedCompanyId,
      generateForm.start_date,
      generateForm.end_date
    );

    if (success) {
      setGenerateDialogOpen(false);
      loadData();
    }
  };

  const resetScheduleForm = () => {
    setEditingSchedule(null);
    setScheduleForm({
      code: "",
      name: "",
      description: "",
      frequency: "monthly",
      pay_day_of_week: null,
      pay_day_of_month: 25,
      second_pay_day_of_month: null,
      cutoff_days_before_pay: 3,
      is_active: true,
    });
  };

  const openEditSchedule = (schedule: PayPeriodSchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      code: schedule.code,
      name: schedule.name,
      description: schedule.description || "",
      frequency: schedule.frequency,
      pay_day_of_week: schedule.pay_day_of_week,
      pay_day_of_month: schedule.pay_day_of_month || 25,
      second_pay_day_of_month: schedule.second_pay_day_of_month,
      cutoff_days_before_pay: schedule.cutoff_days_before_pay,
      is_active: schedule.is_active,
    });
    setScheduleDialogOpen(true);
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: "Weekly",
      bi_weekly: "Bi-Weekly",
      semi_monthly: "Semi-Monthly",
      monthly: "Monthly",
    };
    return labels[freq] || freq;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-success/10 text-success",
      processing: "bg-warning/10 text-warning",
      approved: "bg-primary/10 text-primary",
      paid: "bg-muted text-muted-foreground",
      closed: "bg-secondary text-secondary-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  if (!selectedCompanyId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please select a company to manage pay periods.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Pay Periods" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pay Periods</h1>
              <p className="text-muted-foreground">Configure pay schedules and periods</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="periods">Pay Periods</TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { resetScheduleForm(); setScheduleDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Pay Day</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.code}</TableCell>
                        <TableCell>{schedule.name}</TableCell>
                        <TableCell>{getFrequencyLabel(schedule.frequency)}</TableCell>
                        <TableCell>
                          {schedule.frequency === "weekly" || schedule.frequency === "bi_weekly"
                            ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][schedule.pay_day_of_week || 0]
                            : `Day ${schedule.pay_day_of_month}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditSchedule(schedule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {schedules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No pay period schedules configured
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="periods" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Periods
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Pay Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periods.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">{period.period_number}</TableCell>
                        <TableCell>{period.schedule?.name}</TableCell>
                        <TableCell>{format(new Date(period.period_start), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(period.period_end), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(period.pay_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(period.status)}>
                            {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {periods.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No pay periods found. Generate periods from a schedule.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSchedule ? "Edit Schedule" : "Add Pay Period Schedule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={scheduleForm.code}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, code: e.target.value })}
                    placeholder="e.g., MONTHLY-25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                    placeholder="e.g., Monthly Payroll"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={scheduleForm.frequency}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, frequency: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(scheduleForm.frequency === "weekly" || scheduleForm.frequency === "bi_weekly") && (
                <div className="space-y-2">
                  <Label>Pay Day of Week</Label>
                  <Select
                    value={String(scheduleForm.pay_day_of_week || 5)}
                    onValueChange={(value) => setScheduleForm({ ...scheduleForm, pay_day_of_week: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(scheduleForm.frequency === "monthly" || scheduleForm.frequency === "semi_monthly") && (
                <div className="space-y-2">
                  <Label>Pay Day of Month</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={scheduleForm.pay_day_of_month}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, pay_day_of_month: parseInt(e.target.value) })}
                  />
                </div>
              )}

              {scheduleForm.frequency === "semi_monthly" && (
                <div className="space-y-2">
                  <Label>Second Pay Day of Month</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={scheduleForm.second_pay_day_of_month || ""}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, second_pay_day_of_month: parseInt(e.target.value) || null })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Cutoff Days Before Pay</Label>
                <Input
                  type="number"
                  min={0}
                  max={14}
                  value={scheduleForm.cutoff_days_before_pay}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, cutoff_days_before_pay: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleScheduleSubmit} disabled={isLoading}>
                {editingSchedule ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generate Periods Dialog */}
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Pay Periods</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Select
                  value={generateForm.schedule_id}
                  onValueChange={(value) => setGenerateForm({ ...generateForm, schedule_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.filter(s => s.is_active).map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {schedule.name} ({getFrequencyLabel(schedule.frequency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={generateForm.start_date}
                    onChange={(e) => setGenerateForm({ ...generateForm, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={generateForm.end_date}
                    onChange={(e) => setGenerateForm({ ...generateForm, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGeneratePeriods} disabled={isLoading || !generateForm.schedule_id}>
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
