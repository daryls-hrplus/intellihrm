import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { 
  ClipboardList, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  UserCheck,
  UserX,
  Clock,
  AlertCircle
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  work_date: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_clock_in: string | null;
  actual_clock_out: string | null;
  status: string;
  late_minutes: number;
  early_departure_minutes: number;
  total_work_hours: number;
  overtime_hours: number;
  notes: string | null;
  profile?: { full_name: string } | null;
}

export default function AttendanceRecordsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadRecords();
    }
  }, [selectedCompany, dateRange, statusFilter]);

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

  const loadRecords = async () => {
    let query = supabase
      .from('attendance_summary')
      .select(`
        *,
        profile:profiles!attendance_summary_employee_id_fkey(full_name)
      `)
      .eq('company_id', selectedCompany)
      .gte('work_date', format(dateRange.from, 'yyyy-MM-dd'))
      .lte('work_date', format(dateRange.to, 'yyyy-MM-dd'))
      .order('work_date', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Failed to load records:", error);
      return;
    }
    
    setRecords(data || []);
    
    // Calculate stats
    const present = data?.filter(r => r.status === 'present').length || 0;
    const absent = data?.filter(r => r.status === 'absent').length || 0;
    const late = data?.filter(r => r.status === 'late').length || 0;
    const onLeave = data?.filter(r => r.status === 'leave').length || 0;
    
    setStats({ present, absent, late, onLeave });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-success/20 text-success">Present</Badge>;
      case 'absent':
        return <Badge className="bg-destructive/20 text-destructive">Absent</Badge>;
      case 'late':
        return <Badge className="bg-warning/20 text-warning">Late</Badge>;
      case 'early_departure':
        return <Badge className="bg-orange-500/20 text-orange-600">Early Departure</Badge>;
      case 'half_day':
        return <Badge className="bg-blue-500/20 text-blue-600">Half Day</Badge>;
      case 'leave':
        return <Badge className="bg-purple-500/20 text-purple-600">On Leave</Badge>;
      case 'holiday':
        return <Badge className="bg-cyan-500/20 text-cyan-600">Holiday</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Employee', 'Date', 'Status', 'Clock In', 'Clock Out', 'Work Hours', 'Overtime', 'Late Minutes'];
    const rows = records.map(r => [
      r.profile?.full_name || 'Unknown',
      r.work_date,
      r.status,
      r.actual_clock_in ? format(new Date(r.actual_clock_in), 'HH:mm') : '-',
      r.actual_clock_out ? format(new Date(r.actual_clock_out), 'HH:mm') : '-',
      r.total_work_hours?.toFixed(2) || '0',
      r.overtime_hours?.toFixed(2) || '0',
      r.late_minutes || '0'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
    a.click();
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
            { label: "Attendance Records" }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <ClipboardList className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Attendance Records
              </h1>
              <p className="text-muted-foreground">
                View and manage employee attendance history
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
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-xl font-semibold">{stats.present}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
                <UserX className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-xl font-semibold">{stats.absent}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-xl font-semibold">{stats.late}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-xl font-semibold">{stats.onLeave}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.from, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange({...dateRange, from: date})}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.to, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange({...dateRange, to: date})}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="early_departure">Early Departure</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                    <SelectItem value="leave">On Leave</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Actual In/Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Late</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.profile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(record.work_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {record.scheduled_start && record.scheduled_end ? (
                          <span className="text-sm">
                            {record.scheduled_start} - {record.scheduled_end}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.actual_clock_in ? (
                          <span className="text-sm">
                            {format(new Date(record.actual_clock_in), 'HH:mm')}
                            {record.actual_clock_out && ` - ${format(new Date(record.actual_clock_out), 'HH:mm')}`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <span className="font-mono">{record.total_work_hours?.toFixed(2) || 0}h</span>
                      </TableCell>
                      <TableCell>
                        {record.overtime_hours > 0 ? (
                          <Badge className="bg-primary/20 text-primary">
                            +{record.overtime_hours.toFixed(2)}h
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.late_minutes > 0 ? (
                          <Badge className="bg-warning/20 text-warning">
                            {record.late_minutes} min
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
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
