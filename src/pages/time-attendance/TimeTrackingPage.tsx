import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, differenceInMinutes } from "date-fns";
import { 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  MapPin,
  Timer,
  Calendar,
  User,
  Plus,
  History,
  Sun,
  Moon,
  DollarSign
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  color: string;
  is_overnight: boolean;
  break_duration_minutes: number;
}

interface RoundingRule {
  id: string;
  name: string;
  rule_type: string;
  rounding_interval: number;
  rounding_direction: string;
  grace_period_minutes: number;
}

interface TimeEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  rounded_clock_in: string | null;
  rounded_clock_out: string | null;
  clock_in_location: string | null;
  clock_out_location: string | null;
  clock_in_method: string;
  clock_out_method: string | null;
  break_start: string | null;
  break_end: string | null;
  break_duration_minutes: number;
  total_hours: number | null;
  shift_differential: number | null;
  status: string;
  notes: string | null;
  shift_id: string | null;
  profile?: { full_name: string } | null;
  shift?: { name: string; code: string; color: string } | null;
}

interface ActiveSession {
  id: string;
  clock_in: string;
  break_start: string | null;
  status: string;
  shift_id: string | null;
}

interface EmployeeShiftAssignment {
  id: string;
  shift_id: string;
  shift: Shift;
}

export default function TimeTrackingPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    employee_id: "",
    shift_id: "",
    clock_in: "",
    clock_out: "",
    notes: ""
  });
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employeeShift, setEmployeeShift] = useState<Shift | null>(null);
  const [roundingRules, setRoundingRules] = useState<RoundingRule[]>([]);

  useEffect(() => {
    loadCompanies();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadTimeEntries();
      loadEmployees();
      loadShifts();
      loadRoundingRules();
      loadEmployeeShift();
      checkActiveSession();
    }
  }, [selectedCompany]);

  const loadShifts = async () => {
    const { data } = await supabase
      .from('shifts')
      .select('id, name, code, start_time, end_time, color, is_overnight, break_duration_minutes')
      .eq('company_id', selectedCompany)
      .eq('is_active', true)
      .order('name');
    setShifts(data || []);
  };

  const loadRoundingRules = async () => {
    const { data } = await supabase
      .from('shift_rounding_rules')
      .select('id, name, rule_type, rounding_interval, rounding_direction, grace_period_minutes')
      .eq('company_id', selectedCompany)
      .eq('is_active', true);
    setRoundingRules(data || []);
  };

  const loadEmployeeShift = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    
    const { data } = await supabase
      .from('employee_shift_assignments')
      .select('shift_id, shift:shifts(*)')
      .eq('employee_id', user.user.id)
      .eq('company_id', selectedCompany)
      .eq('is_primary', true)
      .lte('effective_date', format(new Date(), 'yyyy-MM-dd'))
      .or('end_date.is.null,end_date.gte.' + format(new Date(), 'yyyy-MM-dd'))
      .single();
    
    if (data?.shift) {
      setEmployeeShift(data.shift as unknown as Shift);
    } else {
      setEmployeeShift(null);
    }
  };

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error("Failed to load companies");
      return;
    }
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .order('full_name');
    setEmployees(data || []);
  };

  const loadTimeEntries = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('time_clock_entries')
      .select(`
        *,
        profile:profiles!time_clock_entries_employee_id_fkey(full_name),
        shift:shifts(name, code, color)
      `)
      .eq('company_id', selectedCompany)
      .gte('clock_in', `${today}T00:00:00`)
      .order('clock_in', { ascending: false });
    
    if (error) {
      console.error("Failed to load time entries:", error);
      return;
    }
    setTimeEntries(data || []);
  };

  // Apply rounding to a time based on rules
  const applyRounding = (time: Date, ruleType: 'clock_in' | 'clock_out'): Date => {
    const rule = roundingRules.find(r => r.rule_type === ruleType || r.rule_type === 'both');
    if (!rule) return time;
    
    const minutes = time.getHours() * 60 + time.getMinutes();
    const interval = rule.rounding_interval;
    const remainder = minutes % interval;
    
    let roundedMinutes = minutes;
    
    // Apply grace period
    if (remainder <= rule.grace_period_minutes) {
      roundedMinutes = minutes - remainder;
    } else if (remainder >= (interval - rule.grace_period_minutes)) {
      roundedMinutes = minutes + (interval - remainder);
    } else {
      // Apply rounding direction
      switch (rule.rounding_direction) {
        case 'nearest':
          roundedMinutes = remainder < interval / 2 
            ? minutes - remainder 
            : minutes + (interval - remainder);
          break;
        case 'up':
          roundedMinutes = remainder > 0 ? minutes + (interval - remainder) : minutes;
          break;
        case 'down':
          roundedMinutes = minutes - remainder;
          break;
        case 'employer_favor':
          // Clock in rounds up, clock out rounds down
          if (ruleType === 'clock_in') {
            roundedMinutes = remainder > 0 ? minutes + (interval - remainder) : minutes;
          } else {
            roundedMinutes = minutes - remainder;
          }
          break;
      }
    }
    
    const result = new Date(time);
    result.setHours(Math.floor(roundedMinutes / 60), roundedMinutes % 60, 0, 0);
    return result;
  };

  const checkActiveSession = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data } = await supabase
      .from('time_clock_entries')
      .select('id, clock_in, break_start, status, shift_id')
      .eq('employee_id', user.user.id)
      .eq('company_id', selectedCompany)
      .eq('status', 'active')
      .is('clock_out', null)
      .single();
    
    setActiveSession(data as ActiveSession | null);
  };

  const handleClockIn = async () => {
    setClockingIn(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error("You must be logged in");
      setClockingIn(false);
      return;
    }

    const clockInTime = new Date();
    const roundedClockIn = applyRounding(clockInTime, 'clock_in');

    const { error } = await supabase
      .from('time_clock_entries')
      .insert({
        company_id: selectedCompany,
        employee_id: user.user.id,
        clock_in: clockInTime.toISOString(),
        rounded_clock_in: roundedClockIn.toISOString(),
        clock_in_method: 'web',
        clock_in_location: 'Office',
        shift_id: employeeShift?.id || null,
        status: 'active'
      });

    if (error) {
      toast.error("Failed to clock in");
      console.error(error);
    } else {
      toast.success("Clocked in successfully");
      loadTimeEntries();
      checkActiveSession();
    }
    setClockingIn(false);
  };

  const handleClockOut = async () => {
    if (!activeSession) return;
    
    const clockOut = new Date();
    const clockIn = new Date(activeSession.clock_in);
    const totalMinutes = differenceInMinutes(clockOut, clockIn);
    const breakMinutes = activeSession.break_start ? 0 : 0; // Calculate if break was taken
    const workMinutes = totalMinutes - breakMinutes;
    const totalHours = workMinutes / 60;
    const regularHours = Math.min(totalHours, 8);
    const overtimeHours = Math.max(0, totalHours - 8);

    // Apply rounding to clock out
    const roundedClockOut = applyRounding(clockOut, 'clock_out');
    const roundedClockIn = applyRounding(clockIn, 'clock_in');
    
    const roundedTotalMinutes = differenceInMinutes(roundedClockOut, roundedClockIn);
    const roundedWorkMinutes = roundedTotalMinutes - breakMinutes;
    const roundedTotalHours = roundedWorkMinutes / 60;
    const roundedRegularHours = Math.min(roundedTotalHours, 8);
    const roundedOvertimeHours = Math.max(0, roundedTotalHours - 8);

    const { error } = await supabase
      .from('time_clock_entries')
      .update({
        clock_out: clockOut.toISOString(),
        rounded_clock_in: roundedClockIn.toISOString(),
        rounded_clock_out: roundedClockOut.toISOString(),
        clock_out_method: 'web',
        clock_out_location: 'Office',
        total_hours: Number(roundedTotalHours.toFixed(2)),
        regular_hours: Number(roundedRegularHours.toFixed(2)),
        overtime_hours: Number(roundedOvertimeHours.toFixed(2)),
        status: 'completed'
      })
      .eq('id', activeSession.id);

    if (error) {
      toast.error("Failed to clock out");
    } else {
      toast.success("Clocked out successfully");
      loadTimeEntries();
      setActiveSession(null);
    }
  };

  const handleStartBreak = async () => {
    if (!activeSession) return;

    const { error } = await supabase
      .from('time_clock_entries')
      .update({ break_start: new Date().toISOString() })
      .eq('id', activeSession.id);

    if (error) {
      toast.error("Failed to start break");
    } else {
      toast.success("Break started");
      checkActiveSession();
    }
  };

  const handleEndBreak = async () => {
    if (!activeSession || !activeSession.break_start) return;

    const breakEnd = new Date();
    const breakStart = new Date(activeSession.break_start);
    const breakMinutes = differenceInMinutes(breakEnd, breakStart);

    const { error } = await supabase
      .from('time_clock_entries')
      .update({ 
        break_end: breakEnd.toISOString(),
        break_duration_minutes: breakMinutes
      })
      .eq('id', activeSession.id);

    if (error) {
      toast.error("Failed to end break");
    } else {
      toast.success("Break ended");
      checkActiveSession();
    }
  };

  const handleManualEntry = async () => {
    if (!manualEntry.employee_id || !manualEntry.clock_in) {
      toast.error("Employee and clock in time are required");
      return;
    }

    const clockIn = new Date(manualEntry.clock_in);
    const clockOut = manualEntry.clock_out ? new Date(manualEntry.clock_out) : null;
    let totalHours = null;
    let regularHours = null;
    let overtimeHours = null;

    if (clockOut) {
      const minutes = differenceInMinutes(clockOut, clockIn);
      totalHours = Number((minutes / 60).toFixed(2));
      regularHours = Math.min(totalHours, 8);
      overtimeHours = Math.max(0, totalHours - 8);
    }

    // Apply rounding to manual entries
    const roundedClockIn = applyRounding(clockIn, 'clock_in');
    const roundedClockOut = clockOut ? applyRounding(clockOut, 'clock_out') : null;

    const { error } = await supabase
      .from('time_clock_entries')
      .insert({
        company_id: selectedCompany,
        employee_id: manualEntry.employee_id,
        shift_id: manualEntry.shift_id || null,
        clock_in: clockIn.toISOString(),
        rounded_clock_in: roundedClockIn.toISOString(),
        clock_out: clockOut?.toISOString() || null,
        rounded_clock_out: roundedClockOut?.toISOString() || null,
        clock_in_method: 'manual',
        clock_out_method: clockOut ? 'manual' : null,
        total_hours: totalHours,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        status: clockOut ? 'completed' : 'active',
        notes: manualEntry.notes || null
      });

    if (error) {
      toast.error("Failed to add entry");
      console.error(error);
    } else {
      toast.success("Entry added successfully");
      setManualEntryOpen(false);
      setManualEntry({ employee_id: "", shift_id: "", clock_in: "", clock_out: "", notes: "" });
      loadTimeEntries();
    }
  };

  const getElapsedTime = () => {
    if (!activeSession) return "00:00:00";
    const start = new Date(activeSession.clock_in);
    const elapsed = differenceInMinutes(currentTime, start);
    const hours = Math.floor(elapsed / 60);
    const mins = elapsed % 60;
    const secs = currentTime.getSeconds();
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success">Active</Badge>;
      case 'completed':
        return <Badge className="bg-primary/20 text-primary">Completed</Badge>;
      case 'adjusted':
        return <Badge className="bg-warning/20 text-warning">Adjusted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
            { label: "Time & Attendance", href: "/time-attendance" },
            { label: "Time Tracking" }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Time Tracking
              </h1>
              <p className="text-muted-foreground">
                Clock in/out and track your work hours
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Manual Time Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select 
                      value={manualEntry.employee_id} 
                      onValueChange={(v) => setManualEntry({...manualEntry, employee_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shift (optional)</Label>
                    <Select 
                      value={manualEntry.shift_id} 
                      onValueChange={(v) => setManualEntry({...manualEntry, shift_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No shift</SelectItem>
                        {shifts.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: s.color }}
                              />
                              {s.name} ({s.start_time} - {s.end_time})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Clock In</Label>
                    <Input 
                      type="datetime-local" 
                      value={manualEntry.clock_in}
                      onChange={(e) => setManualEntry({...manualEntry, clock_in: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Clock Out (optional)</Label>
                    <Input 
                      type="datetime-local" 
                      value={manualEntry.clock_out}
                      onChange={(e) => setManualEntry({...manualEntry, clock_out: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={manualEntry.notes}
                      onChange={(e) => setManualEntry({...manualEntry, notes: e.target.value})}
                      placeholder="Reason for manual entry..."
                    />
                  </div>
                  <Button onClick={handleManualEntry} className="w-full">
                    Add Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Clock Widget */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Clock
              </CardTitle>
              <CardDescription>
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold font-mono">
                    {format(currentTime, 'HH:mm:ss')}
                  </p>
                  {employeeShift && (
                    <div className="mt-2 flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: employeeShift.color }}
                      />
                      <span className="text-sm font-medium">{employeeShift.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({employeeShift.start_time} - {employeeShift.end_time})
                      </span>
                      {employeeShift.is_overnight && <Moon className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  )}
                  {activeSession && (
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      <span>Elapsed: {getElapsedTime()}</span>
                    </div>
                  )}
                  {roundingRules.length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Rounding: {roundingRules[0].rounding_interval} min ({roundingRules[0].rounding_direction})
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {!activeSession ? (
                    <Button 
                      size="lg" 
                      onClick={handleClockIn} 
                      disabled={clockingIn}
                      className="gap-2"
                    >
                      <Play className="h-5 w-5" />
                      Clock In
                    </Button>
                  ) : (
                    <>
                      {!activeSession.break_start ? (
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={handleStartBreak}
                          className="gap-2"
                        >
                          <Coffee className="h-5 w-5" />
                          Start Break
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={handleEndBreak}
                          className="gap-2"
                        >
                          <Coffee className="h-5 w-5" />
                          End Break
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="lg"
                        onClick={handleClockOut}
                        className="gap-2"
                      >
                        <Square className="h-5 w-5" />
                        Clock Out
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Entries</span>
                  <span className="font-semibold">{timeEntries.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-semibold text-success">
                    {timeEntries.filter(e => e.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold text-primary">
                    {timeEntries.filter(e => e.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Hours</span>
                  <span className="font-semibold">
                    {timeEntries.reduce((sum, e) => sum + (e.total_hours || 0), 0).toFixed(2)}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Today's Time Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Rounded</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No time entries for today
                    </TableCell>
                  </TableRow>
                ) : (
                  timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {entry.profile?.full_name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.shift ? (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: entry.shift.color }}
                            />
                            <span className="text-sm">{entry.shift.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No shift</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3 text-success" />
                            {format(new Date(entry.clock_in), 'HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.rounded_clock_in ? (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.rounded_clock_in), 'HH:mm')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.clock_out ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Square className="h-3 w-3 text-destructive" />
                              {format(new Date(entry.clock_out), 'HH:mm')}
                            </div>
                            {entry.rounded_clock_out && (
                              <span className="text-xs text-muted-foreground">
                                → {format(new Date(entry.rounded_clock_out), 'HH:mm')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.total_hours ? (
                          <div className="flex flex-col">
                            <span className="font-mono">{entry.total_hours.toFixed(2)}h</span>
                            {entry.shift_differential && entry.shift_differential > 0 && (
                              <span className="text-xs text-success">
                                +${entry.shift_differential.toFixed(2)} diff
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
