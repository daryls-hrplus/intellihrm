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
import { Clock, Search, CheckCircle, XCircle, AlertCircle, FileEdit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RegularizationRequest {
  id: string;
  employee_id: string;
  request_date: string;
  regularization_type: string;
  original_clock_in: string | null;
  original_clock_out: string | null;
  requested_clock_in: string | null;
  requested_clock_out: string | null;
  reason: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "Attendance Regularization" },
];

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600", icon: <AlertCircle className="h-4 w-4" /> },
  approved: { color: "bg-green-500/10 text-green-600", icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { color: "bg-red-500/10 text-red-600", icon: <XCircle className="h-4 w-4" /> },
};

export default function AttendanceRegularizationPage() {
  const { company, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<RegularizationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["regularization-requests", company?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("attendance_regularization_requests")
        .select(`*, profiles!attendance_regularization_requests_employee_id_fkey(full_name, email)`)
        .eq("company_id", company?.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as RegularizationRequest[];
    },
    enabled: !!company?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const { error } = await supabase
        .from("attendance_regularization_requests")
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
        })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(`Request ${status}`);
      setSelectedRequest(null);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ["regularization-requests"] });
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const filteredRequests = requests.filter(r =>
    r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Regularization</h1>
            <p className="text-muted-foreground">
              Review and approve attendance correction requests
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
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
            <CardTitle>Regularization Requests</CardTitle>
            <CardDescription>Employees can request corrections to their attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Original Time</TableHead>
                    <TableHead>Requested Time</TableHead>
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
                        No regularization requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((req) => {
                      const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                      return (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{req.profiles?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(req.request_date), "PP")}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{req.regularization_type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {req.original_clock_in && format(new Date(req.original_clock_in), "p")}
                            {req.original_clock_out && ` - ${format(new Date(req.original_clock_out), "p")}`}
                            {!req.original_clock_in && !req.original_clock_out && "—"}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {req.requested_clock_in && format(new Date(req.requested_clock_in), "p")}
                            {req.requested_clock_out && ` - ${format(new Date(req.requested_clock_out), "p")}`}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig.color}>
                              <span className="flex items-center gap-1">
                                {statusConfig.icon}
                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRequest(req)}
                            >
                              <FileEdit className="h-4 w-4 mr-1" />
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
              <DialogTitle>Review Regularization Request</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Employee</Label>
                    <p className="font-medium">{selectedRequest.profiles?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Request Date</Label>
                    <p className="font-medium">{format(new Date(selectedRequest.request_date), "PP")}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <p className="bg-muted p-3 rounded-lg text-sm">{selectedRequest.reason}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Original Time</Label>
                    <p className="font-medium">
                      {selectedRequest.original_clock_in && format(new Date(selectedRequest.original_clock_in), "p")}
                      {selectedRequest.original_clock_out && ` - ${format(new Date(selectedRequest.original_clock_out), "p")}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Requested Time</Label>
                    <p className="font-medium text-primary">
                      {selectedRequest.requested_clock_in && format(new Date(selectedRequest.requested_clock_in), "p")}
                      {selectedRequest.requested_clock_out && ` - ${format(new Date(selectedRequest.requested_clock_out), "p")}`}
                    </p>
                  </div>
                </div>
                {selectedRequest.status === "pending" && (
                  <div className="space-y-2">
                    <Label>Review Notes</Label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes for your decision..."
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedRequest?.status === "pending" ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => reviewMutation.mutate({ requestId: selectedRequest.id, status: "rejected" })}
                    disabled={reviewMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => reviewMutation.mutate({ requestId: selectedRequest.id, status: "approved" })}
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
