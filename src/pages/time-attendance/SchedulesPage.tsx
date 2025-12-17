import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { 
  Calendar, 
  Plus,
  Clock,
  Users,
  Edit,
  Trash2,
  Settings
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  schedule_type: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  work_days: string[];
  is_overnight: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

interface EmployeeSchedule {
  id: string;
  employee_id: string;
  schedule_id: string;
  start_date: string;
  end_date: string | null;
  is_primary: boolean;
  notes: string | null;
  profile?: { full_name: string } | null;
  schedule?: { name: string; code: string } | null;
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SchedulesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [employeeSchedules, setEmployeeSchedules] = useState<EmployeeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    code: "",
    description: "",
    schedule_type: "fixed",
    start_time: "09:00",
    end_time: "17:00",
    break_duration_minutes: 60,
    work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    is_overnight: false,
    start_date: getTodayString()
  });

  const [newAssignment, setNewAssignment] = useState({
    employee_id: "",
    schedule_id: "",
    start_date: getTodayString(),
    is_primary: true,
    notes: ""
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadSchedules();
      loadEmployeeSchedules();
      loadEmployees();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const loadSchedules = async () => {
    const { data, error } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('company_id', selectedCompany)
      .order('name');
    
    if (error) {
      console.error("Failed to load schedules:", error);
      return;
    }
    setSchedules((data || []).map(s => ({
      ...s,
      work_days: Array.isArray(s.work_days) ? s.work_days : JSON.parse(s.work_days as string || '[]')
    })));
  };

  const loadEmployeeSchedules = async () => {
    const { data, error } = await supabase
      .from('employee_schedules')
      .select(`
        *,
        profile:profiles!employee_schedules_employee_id_fkey(full_name),
        schedule:work_schedules!employee_schedules_schedule_id_fkey(name, code)
      `)
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error("Failed to load employee schedules:", error);
      return;
    }
    setEmployeeSchedules(data || []);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .order('full_name');
    setEmployees(data || []);
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.name || !newSchedule.code) {
      toast.error(t("common.fillRequired"));
      return;
    }

    const { error } = await supabase
      .from('work_schedules')
      .insert({
        company_id: selectedCompany,
        ...newSchedule,
        work_days: newSchedule.work_days
      });

    if (error) {
      toast.error(t("common.error"));
      console.error(error);
    } else {
      toast.success(t("timeAttendance.schedules.scheduleCreated"));
      setScheduleDialogOpen(false);
      setNewSchedule({
        name: "",
        code: "",
        description: "",
        schedule_type: "fixed",
        start_time: "09:00",
        end_time: "17:00",
        break_duration_minutes: 60,
        work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        is_overnight: false,
        start_date: getTodayString()
      });
      loadSchedules();
    }
  };

  const handleAssignSchedule = async () => {
    if (!newAssignment.employee_id || !newAssignment.schedule_id) {
      toast.error(t("common.fillRequired"));
      return;
    }

    const { error } = await supabase
      .from('employee_schedules')
      .insert(newAssignment);

    if (error) {
      toast.error(t("common.error"));
      console.error(error);
    } else {
      toast.success(t("timeAttendance.schedules.scheduleAssigned"));
      setAssignDialogOpen(false);
      setNewAssignment({
        employee_id: "",
        schedule_id: "",
        start_date: getTodayString(),
        is_primary: true,
        notes: ""
      });
      loadEmployeeSchedules();
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    const { error } = await supabase
      .from('work_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("timeAttendance.schedules.scheduleDeleted"));
      loadSchedules();
    }
  };

  const toggleDaySelection = (day: string) => {
    setNewSchedule(prev => ({
      ...prev,
      work_days: prev.work_days.includes(day)
        ? prev.work_days.filter(d => d !== day)
        : [...prev.work_days, day]
    }));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs 
          items={[
            { label: t("timeAttendance.title"), href: "/time-attendance" },
            { label: t("timeAttendance.schedules.title") }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("timeAttendance.schedules.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("timeAttendance.schedules.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("common.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedules" className="gap-2">
              <Settings className="h-4 w-4" />
              {t("timeAttendance.schedules.templates")}
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <Users className="h-4 w-4" />
              {t("timeAttendance.schedules.assignments")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("timeAttendance.schedules.createSchedule")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{t("timeAttendance.schedules.createSchedule")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.schedules.name")} *</Label>
                        <Input
                          value={newSchedule.name}
                          onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                          placeholder="Standard Shift"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.schedules.code")} *</Label>
                        <Input
                          value={newSchedule.code}
                          onChange={(e) => setNewSchedule({...newSchedule, code: e.target.value})}
                          placeholder="STD-SHIFT"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.description")}</Label>
                      <Textarea
                        value={newSchedule.description}
                        onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                        placeholder="Schedule description..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.scheduleType")}</Label>
                      <Select 
                        value={newSchedule.schedule_type} 
                        onValueChange={(v) => setNewSchedule({...newSchedule, schedule_type: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">{t("timeAttendance.schedules.fixed")}</SelectItem>
                          <SelectItem value="rotating">{t("timeAttendance.schedules.rotating")}</SelectItem>
                          <SelectItem value="flexible">{t("timeAttendance.schedules.flexible")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.schedules.startTime")}</Label>
                        <Input
                          type="time"
                          value={newSchedule.start_time}
                          onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("timeAttendance.schedules.endTime")}</Label>
                        <Input
                          type="time"
                          value={newSchedule.end_time}
                          onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.breakDuration")}</Label>
                      <Input
                        type="number"
                        value={newSchedule.break_duration_minutes}
                        onChange={(e) => setNewSchedule({...newSchedule, break_duration_minutes: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.workDays")}</Label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <Button
                            key={day}
                            type="button"
                            variant={newSchedule.work_days.includes(day) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleDaySelection(day)}
                            className="capitalize"
                          >
                            {day.slice(0, 3)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newSchedule.is_overnight}
                        onCheckedChange={(checked) => setNewSchedule({...newSchedule, is_overnight: checked})}
                      />
                      <Label>{t("timeAttendance.schedules.overnightShift")}</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.startDate")}</Label>
                      <Input
                        type="date"
                        value={newSchedule.start_date}
                        onChange={(e) => setNewSchedule({...newSchedule, start_date: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleCreateSchedule} className="w-full">
                      {t("timeAttendance.schedules.createSchedule")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t("timeAttendance.schedules.templates")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("timeAttendance.schedules.name")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.code")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.type")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.hours")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.break")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.workDays")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          {t("timeAttendance.schedules.noSchedules")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{schedule.code}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{schedule.schedule_type}</TableCell>
                          <TableCell>
                            {schedule.start_time} - {schedule.end_time}
                            {schedule.is_overnight && <Badge className="ml-2 bg-indigo-500/20 text-indigo-600">Night</Badge>}
                          </TableCell>
                          <TableCell>{schedule.break_duration_minutes} min</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {schedule.work_days.map((day: string) => (
                                <Badge key={day} variant="secondary" className="text-xs capitalize">
                                  {day.slice(0, 2)}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {schedule.is_active ? (
                              <Badge className="bg-success/20 text-success">{t("common.active")}</Badge>
                            ) : (
                              <Badge variant="outline">{t("common.inactive")}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("timeAttendance.schedules.assignSchedule")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("timeAttendance.schedules.assignSchedule")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t("common.employee")} *</Label>
                      <Select 
                        value={newAssignment.employee_id} 
                        onValueChange={(v) => setNewAssignment({...newAssignment, employee_id: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.selectEmployee")} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.schedule")} *</Label>
                      <Select 
                        value={newAssignment.schedule_id} 
                        onValueChange={(v) => setNewAssignment({...newAssignment, schedule_id: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.selectSchedule")} />
                        </SelectTrigger>
                        <SelectContent>
                          {schedules.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.start_time} - {s.end_time})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.schedules.startDate")}</Label>
                      <Input 
                        type="date"
                        value={newAssignment.start_date}
                        onChange={(e) => setNewAssignment({...newAssignment, start_date: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newAssignment.is_primary}
                        onCheckedChange={(checked) => setNewAssignment({...newAssignment, is_primary: checked})}
                      />
                      <Label>{t("timeAttendance.schedules.primary")}</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.notes")}</Label>
                      <Textarea 
                        value={newAssignment.notes}
                        onChange={(e) => setNewAssignment({...newAssignment, notes: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleAssignSchedule} className="w-full">
                      {t("timeAttendance.schedules.assignSchedule")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("timeAttendance.schedules.assignments")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.employee")}</TableHead>
                      <TableHead>{t("common.schedule")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.startDate")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.endDate")}</TableHead>
                      <TableHead>{t("timeAttendance.schedules.primary")}</TableHead>
                      <TableHead>{t("common.notes")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeSchedules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {t("timeAttendance.schedules.noAssignments")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      employeeSchedules.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.profile?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {assignment.schedule?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateForDisplay(assignment.start_date, 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {assignment.end_date 
                              ? formatDateForDisplay(assignment.end_date, 'MMM d, yyyy')
                              : <span className="text-muted-foreground">Ongoing</span>
                            }
                          </TableCell>
                          <TableCell>
                            {assignment.is_primary ? (
                              <Badge className="bg-primary/20 text-primary">Primary</Badge>
                            ) : (
                              <Badge variant="outline">Secondary</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {assignment.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
