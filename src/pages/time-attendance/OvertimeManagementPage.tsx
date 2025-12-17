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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, differenceInHours } from "date-fns";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { 
  Clock, 
  Plus,
  Check,
  X,
  Timer,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface OvertimeRequest {
  id: string;
  employee_id: string;
  request_date: string;
  planned_start: string;
  planned_end: string;
  planned_hours: number;
  actual_hours: number | null;
  overtime_type: string;
  reason: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  profile?: { full_name: string } | null;
  approver?: { full_name: string } | null;
}

export default function OvertimeManagementPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState("");
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const [newRequest, setNewRequest] = useState({
    employee_id: "",
    request_date: getTodayString(),
    planned_start: "",
    planned_end: "",
    overtime_type: "regular",
    reason: ""
  });

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    totalHours: 0
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadRequests();
      loadEmployees();
    }
  }, [selectedCompany, statusFilter]);

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

  const loadRequests = async () => {
    let query = supabase
      .from('overtime_requests')
      .select(`
        *,
        profile:profiles!overtime_requests_employee_id_fkey(full_name),
        approver:profiles!overtime_requests_approved_by_fkey(full_name)
      `)
      .eq('company_id', selectedCompany)
      .order('request_date', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Failed to load requests:", error);
      return;
    }
    
    setRequests(data || []);
    
    const pending = data?.filter(r => r.status === 'pending').length || 0;
    const approved = data?.filter(r => r.status === 'approved' || r.status === 'completed').length || 0;
    const totalHours = data?.reduce((sum, r) => sum + (r.actual_hours || r.planned_hours || 0), 0) || 0;
    
    setStats({ pending, approved, totalHours });
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .order('full_name');
    setEmployees(data || []);
  };

  const handleCreateRequest = async () => {
    if (!newRequest.employee_id || !newRequest.planned_start || !newRequest.planned_end || !newRequest.reason) {
      toast.error(t("common.fillRequired"));
      return;
    }

    const plannedStart = new Date(newRequest.planned_start);
    const plannedEnd = new Date(newRequest.planned_end);
    const plannedHours = differenceInHours(plannedEnd, plannedStart);

    if (plannedHours <= 0) {
      toast.error(t("common.error"));
      return;
    }

    const { error } = await supabase
      .from('overtime_requests')
      .insert({
        company_id: selectedCompany,
        employee_id: newRequest.employee_id,
        request_date: newRequest.request_date,
        planned_start: plannedStart.toISOString(),
        planned_end: plannedEnd.toISOString(),
        planned_hours: plannedHours,
        overtime_type: newRequest.overtime_type,
        reason: newRequest.reason,
        status: 'pending'
      });

    if (error) {
      toast.error(t("common.error"));
      console.error(error);
    } else {
      toast.success(t("timeAttendance.overtime.requestSubmitted"));
      setCreateDialogOpen(false);
      setNewRequest({
        employee_id: "",
        request_date: getTodayString(),
        planned_start: "",
        planned_end: "",
        overtime_type: "regular",
        reason: ""
      });
      loadRequests();
    }
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    const { data: user } = await supabase.auth.getUser();

    if (actionType === 'approve') {
      const { error } = await supabase
        .from('overtime_requests')
        .update({
          status: 'approved',
          approved_by: user.user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) {
        toast.error(t("common.error"));
      } else {
        toast.success(t("timeAttendance.overtime.requestApproved"));
      }
    } else {
      if (!rejectionReason) {
        toast.error(t("common.fillRequired"));
        return;
      }

      const { error } = await supabase
        .from('overtime_requests')
        .update({
          status: 'rejected',
          approved_by: user.user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', selectedRequest.id);

      if (error) {
        toast.error(t("common.error"));
      } else {
        toast.success(t("timeAttendance.overtime.requestRejected"));
      }
    }

    setActionDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason("");
    loadRequests();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning/20 text-warning">{t("timeAttendance.overtime.pending")}</Badge>;
      case 'approved':
        return <Badge className="bg-success/20 text-success">{t("timeAttendance.overtime.approved")}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive">{t("timeAttendance.overtime.rejected")}</Badge>;
      case 'completed':
        return <Badge className="bg-primary/20 text-primary">{t("timeAttendance.overtime.completed")}</Badge>;
      case 'cancelled':
        return <Badge variant="outline">{t("timeAttendance.overtime.cancelled")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'regular':
        return <Badge variant="outline">{t("timeAttendance.overtime.regular")}</Badge>;
      case 'weekend':
        return <Badge className="bg-blue-500/20 text-blue-600">{t("timeAttendance.overtime.weekend")}</Badge>;
      case 'holiday':
        return <Badge className="bg-purple-500/20 text-purple-600">{t("timeAttendance.overtime.holiday")}</Badge>;
      case 'emergency':
        return <Badge className="bg-destructive/20 text-destructive">{t("timeAttendance.overtime.emergency")}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const openActionDialog = (request: OvertimeRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionDialogOpen(true);
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
            { label: t("timeAttendance.overtime.title") }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <Clock className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("timeAttendance.overtime.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("timeAttendance.overtime.subtitle")}
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
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("timeAttendance.overtime.newRequest")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("timeAttendance.overtime.submitRequest")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("common.employee")} *</Label>
                    <Select 
                      value={newRequest.employee_id} 
                      onValueChange={(v) => setNewRequest({...newRequest, employee_id: v})}
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
                    <Label>{t("common.date")}</Label>
                    <Input 
                      type="date"
                      value={newRequest.request_date}
                      onChange={(e) => setNewRequest({...newRequest, request_date: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.overtime.plannedStart")} *</Label>
                      <Input 
                        type="datetime-local"
                        value={newRequest.planned_start}
                        onChange={(e) => setNewRequest({...newRequest, planned_start: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.overtime.plannedEnd")} *</Label>
                      <Input 
                        type="datetime-local"
                        value={newRequest.planned_end}
                        onChange={(e) => setNewRequest({...newRequest, planned_end: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("timeAttendance.overtime.overtimeType")}</Label>
                    <Select 
                      value={newRequest.overtime_type} 
                      onValueChange={(v) => setNewRequest({...newRequest, overtime_type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">{t("timeAttendance.overtime.regular")}</SelectItem>
                        <SelectItem value="weekend">{t("timeAttendance.overtime.weekend")}</SelectItem>
                        <SelectItem value="holiday">{t("timeAttendance.overtime.holiday")}</SelectItem>
                        <SelectItem value="emergency">{t("timeAttendance.overtime.emergency")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("timeAttendance.overtime.reason")} *</Label>
                    <Textarea 
                      value={newRequest.reason}
                      onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleCreateRequest} className="w-full">
                    {t("common.submit")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("timeAttendance.overtime.pending")}</p>
                <p className="text-xl font-semibold">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("timeAttendance.overtime.approved")}</p>
                <p className="text-xl font-semibold">{stats.approved}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("timeAttendance.overtime.totalOTHours")}</p>
                <p className="text-xl font-semibold">{stats.totalHours.toFixed(1)}h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("timeAttendance.overtime.allStatuses")}</SelectItem>
              <SelectItem value="pending">{t("timeAttendance.overtime.pending")}</SelectItem>
              <SelectItem value="approved">{t("timeAttendance.overtime.approved")}</SelectItem>
              <SelectItem value="rejected">{t("timeAttendance.overtime.rejected")}</SelectItem>
              <SelectItem value="completed">{t("timeAttendance.overtime.completed")}</SelectItem>
              <SelectItem value="cancelled">{t("timeAttendance.overtime.cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              {t("timeAttendance.overtime.overtimeRequests")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("timeAttendance.overtime.employee")}</TableHead>
                  <TableHead>{t("timeAttendance.overtime.date")}</TableHead>
                  <TableHead>{t("timeAttendance.overtime.time")}</TableHead>
                  <TableHead>{t("timeAttendance.overtime.hours")}</TableHead>
                  <TableHead>{t("timeAttendance.overtime.type")}</TableHead>
                  <TableHead>{t("timeAttendance.overtime.reason")}</TableHead>
                  <TableHead>{t("timeAttendance.overtime.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {t("timeAttendance.overtime.noRequests")}
                    </TableCell>
                  </TableRow>
                ) : requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.profile?.full_name}</TableCell>
                    <TableCell>{formatDateForDisplay(request.request_date, 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {format(parseISO(request.planned_start), 'HH:mm')} - {format(parseISO(request.planned_end), 'HH:mm')}
                    </TableCell>
                    <TableCell>{request.planned_hours}h</TableCell>
                    <TableCell>{getTypeBadge(request.overtime_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openActionDialog(request, 'approve')}>
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openActionDialog(request, 'reject')}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? t("timeAttendance.overtime.approve") : t("timeAttendance.overtime.reject")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {actionType === 'reject' && (
                <div className="space-y-2">
                  <Label>{t("timeAttendance.overtime.rejectionReason")} *</Label>
                  <Textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
              <Button onClick={handleAction} className="w-full">
                {actionType === 'approve' ? t("timeAttendance.overtime.approve") : t("timeAttendance.overtime.reject")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}