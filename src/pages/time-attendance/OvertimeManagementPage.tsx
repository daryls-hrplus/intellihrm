import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, differenceInHours } from "date-fns";
import { 
  Clock, 
  Plus,
  Check,
  X,
  Timer,
  TrendingUp,
  AlertCircle,
  CalendarDays
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
    request_date: format(new Date(), 'yyyy-MM-dd'),
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
      toast.error("Failed to load companies");
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
    
    // Calculate stats
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
      toast.error("Please fill in all required fields");
      return;
    }

    const plannedStart = new Date(newRequest.planned_start);
    const plannedEnd = new Date(newRequest.planned_end);
    const plannedHours = differenceInHours(plannedEnd, plannedStart);

    if (plannedHours <= 0) {
      toast.error("End time must be after start time");
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
      toast.error("Failed to create request");
      console.error(error);
    } else {
      toast.success("Overtime request submitted");
      setCreateDialogOpen(false);
      setNewRequest({
        employee_id: "",
        request_date: format(new Date(), 'yyyy-MM-dd'),
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
        toast.error("Failed to approve request");
      } else {
        toast.success("Request approved");
      }
    } else {
      if (!rejectionReason) {
        toast.error("Please provide a rejection reason");
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
        toast.error("Failed to reject request");
      } else {
        toast.success("Request rejected");
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
        return <Badge className="bg-warning/20 text-warning">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-success/20 text-success">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-primary/20 text-primary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'regular':
        return <Badge variant="outline">Regular</Badge>;
      case 'weekend':
        return <Badge className="bg-blue-500/20 text-blue-600">Weekend</Badge>;
      case 'holiday':
        return <Badge className="bg-purple-500/20 text-purple-600">Holiday</Badge>;
      case 'emergency':
        return <Badge className="bg-destructive/20 text-destructive">Emergency</Badge>;
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
            { label: "Time & Attendance", href: "/time-attendance" },
            { label: "Overtime Management" }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <Clock className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Overtime Management
              </h1>
              <p className="text-muted-foreground">
                Track and approve overtime requests
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
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Overtime Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Employee *</Label>
                    <Select 
                      value={newRequest.employee_id} 
                      onValueChange={(v) => setNewRequest({...newRequest, employee_id: v})}
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
                    <Label>Request Date</Label>
                    <Input 
                      type="date"
                      value={newRequest.request_date}
                      onChange={(e) => setNewRequest({...newRequest, request_date: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Planned Start *</Label>
                      <Input 
                        type="datetime-local"
                        value={newRequest.planned_start}
                        onChange={(e) => setNewRequest({...newRequest, planned_start: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Planned End *</Label>
                      <Input 
                        type="datetime-local"
                        value={newRequest.planned_end}
                        onChange={(e) => setNewRequest({...newRequest, planned_end: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Overtime Type</Label>
                    <Select 
                      value={newRequest.overtime_type} 
                      onValueChange={(v) => setNewRequest({...newRequest, overtime_type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="weekend">Weekend</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason *</Label>
                    <Textarea 
                      value={newRequest.reason}
                      onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                      placeholder="Explain the reason for overtime..."
                    />
                  </div>
                  <Button onClick={handleCreateRequest} className="w-full">
                    Submit Request
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
                <p className="text-sm text-muted-foreground">Pending</p>
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
                <p className="text-sm text-muted-foreground">Approved</p>
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
                <p className="text-sm text-muted-foreground">Total OT Hours</p>
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
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Overtime Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No overtime requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.profile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(request.request_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(request.planned_start), 'HH:mm')} - {format(new Date(request.planned_end), 'HH:mm')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {request.actual_hours || request.planned_hours}h
                        </span>
                      </TableCell>
                      <TableCell>{getTypeBadge(request.overtime_type)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {request.reason}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openActionDialog(request, 'approve')}
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openActionDialog(request, 'reject')}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                        {request.status !== 'pending' && request.approver && (
                          <span className="text-xs text-muted-foreground">
                            by {request.approver.full_name}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve Overtime Request' : 'Reject Overtime Request'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedRequest && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <p><strong>Employee:</strong> {selectedRequest.profile?.full_name}</p>
                  <p><strong>Date:</strong> {format(parseISO(selectedRequest.request_date), 'MMM d, yyyy')}</p>
                  <p><strong>Hours:</strong> {selectedRequest.planned_hours}h</p>
                  <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                </div>
              )}
              
              {actionType === 'reject' && (
                <div className="space-y-2">
                  <Label>Rejection Reason *</Label>
                  <Textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this request is being rejected..."
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActionDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAction}
                  className="flex-1"
                  variant={actionType === 'approve' ? 'default' : 'destructive'}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
