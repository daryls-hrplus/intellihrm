import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  ArrowLeftRight, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  User,
  Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ShiftSwapRequest {
  id: string;
  requester_id: string;
  target_employee_id: string;
  requester_shift_date: string;
  target_shift_date: string;
  requester_shift_id: string | null;
  target_shift_id: string | null;
  reason: string | null;
  status: string;
  requester_confirmed: boolean;
  target_confirmed: boolean;
  manager_approved: boolean | null;
  approved_by: string | null;
  approved_at: string | null;
  manager_notes: string | null;
  created_at: string;
  requester?: { full_name: string; email: string };
  target?: { full_name: string; email: string };
  requester_shift?: { shift_name: string; start_time: string; end_time: string };
  target_shift?: { shift_name: string; start_time: string; end_time: string };
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  pending_target: { color: "bg-yellow-500/10 text-yellow-600", icon: <AlertCircle className="h-4 w-4" /> },
  pending_manager: { color: "bg-blue-500/10 text-blue-600", icon: <Clock className="h-4 w-4" /> },
  approved: { color: "bg-green-500/10 text-green-600", icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { color: "bg-red-500/10 text-red-600", icon: <XCircle className="h-4 w-4" /> },
  cancelled: { color: "bg-gray-500/10 text-gray-600", icon: <XCircle className="h-4 w-4" /> },
};

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "Shift Swaps" },
];

export default function ShiftSwapsPage() {
  const { company, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ShiftSwapRequest | null>(null);
  const [managerNotes, setManagerNotes] = useState("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["shift-swap-requests", company?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("shift_swap_requests")
        .select(`
          *,
          requester:profiles!shift_swap_requests_requester_id_fkey(full_name, email),
          target:profiles!shift_swap_requests_target_employee_id_fkey(full_name, email),
          requester_shift:shifts!shift_swap_requests_requester_shift_id_fkey(shift_name, start_time, end_time),
          target_shift:shifts!shift_swap_requests_target_shift_id_fkey(shift_name, start_time, end_time)
        `)
        .eq("company_id", company?.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ShiftSwapRequest[];
    },
    enabled: !!company?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ requestId, approved }: { requestId: string; approved: boolean }) => {
      const { error } = await supabase
        .from("shift_swap_requests")
        .update({
          status: approved ? "approved" : "rejected",
          manager_approved: approved,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          manager_notes: managerNotes,
        })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      toast.success(`Swap request ${approved ? "approved" : "rejected"}`);
      setSelectedRequest(null);
      setManagerNotes("");
      queryClient.invalidateQueries({ queryKey: ["shift-swap-requests"] });
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const filteredRequests = requests.filter(r =>
    r.requester?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.target?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: requests.filter(r => r.status === "pending_target" || r.status === "pending_manager").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const formatShiftTime = (time: string | undefined) => {
    if (!time) return "—";
    return time.slice(0, 5);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shift Swap Requests</h1>
            <p className="text-muted-foreground">
              Manage employee shift swap requests
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Swap Requests
            </CardTitle>
            <CardDescription>View and manage shift swap requests between employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_target">Pending Target</SelectItem>
                  <SelectItem value="pending_manager">Pending Manager</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Requester's Shift</TableHead>
                    <TableHead className="text-center">
                      <ArrowLeftRight className="h-4 w-4 mx-auto" />
                    </TableHead>
                    <TableHead>Target Employee</TableHead>
                    <TableHead>Target's Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No shift swap requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((req) => {
                      const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending_target;
                      return (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{req.requester?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{req.requester?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{format(new Date(req.requester_shift_date), "PP")}</p>
                              <p className="text-xs text-muted-foreground">
                                {req.requester_shift?.shift_name} ({formatShiftTime(req.requester_shift?.start_time)} - {formatShiftTime(req.requester_shift?.end_time)})
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <ArrowLeftRight className="h-4 w-4 mx-auto text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{req.target?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{req.target?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{format(new Date(req.target_shift_date), "PP")}</p>
                              <p className="text-xs text-muted-foreground">
                                {req.target_shift?.shift_name} ({formatShiftTime(req.target_shift?.start_time)} - {formatShiftTime(req.target_shift?.end_time)})
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig.color}>
                              <span className="flex items-center gap-1">
                                {statusConfig.icon}
                                {req.status.replace(/_/g, " ")}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRequest(req)}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Shift Swap Request</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Requester</p>
                    <p className="font-medium">{selectedRequest.requester?.full_name}</p>
                    <p className="text-sm">{format(new Date(selectedRequest.requester_shift_date), "PP")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedRequest.requester_shift?.shift_name}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Target</p>
                    <p className="font-medium">{selectedRequest.target?.full_name}</p>
                    <p className="text-sm">{format(new Date(selectedRequest.target_shift_date), "PP")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedRequest.target_shift?.shift_name}
                    </p>
                  </div>
                </div>

                {selectedRequest.reason && (
                  <div>
                    <Label className="text-muted-foreground">Reason</Label>
                    <p className="bg-muted p-3 rounded-lg text-sm mt-1">{selectedRequest.reason}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {selectedRequest.requester_confirmed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">Requester confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRequest.target_confirmed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">Target confirmed</span>
                  </div>
                </div>

                {selectedRequest.status === "pending_manager" && (
                  <div className="space-y-2">
                    <Label>Manager Notes</Label>
                    <Textarea
                      value={managerNotes}
                      onChange={(e) => setManagerNotes(e.target.value)}
                      placeholder="Add notes for your decision..."
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedRequest?.status === "pending_manager" ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => reviewMutation.mutate({ requestId: selectedRequest.id, approved: false })}
                    disabled={reviewMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => reviewMutation.mutate({ requestId: selectedRequest.id, approved: true })}
                    disabled={reviewMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
