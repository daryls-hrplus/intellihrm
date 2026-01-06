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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  PuzzleIcon, Search, FileText, CheckCircle, XCircle, Clock, 
  AlertTriangle, Filter, Download, Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ExtensionRequest {
  id: string;
  company_id: string;
  agreement_id: string | null;
  request_type: string;
  suggested_value: string;
  original_document_excerpt: string | null;
  ai_analysis: string | null;
  priority: string;
  status: string;
  impact_description: string | null;
  workaround_applied: string | null;
  created_by: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  implementation_notes: string | null;
  agreement?: { agreement_name: string } | null;
}

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "CBA Extensions" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "in_development", label: "In Development" },
  { value: "implemented", label: "Implemented" },
  { value: "rejected", label: "Rejected" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function CBAExtensionsPage() {
  const { company, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ExtensionRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    implementation_notes: ""
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["cba-extension-requests", company?.id, statusFilter, priorityFilter],
    queryFn: async () => {
      let query = supabase
        .from("cba_extension_requests")
        .select(`
          *,
          agreement:cba_agreements(agreement_name)
        `)
        .eq("company_id", company?.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (priorityFilter !== "all") {
        query = query.eq("priority", priorityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ExtensionRequest[];
    },
    enabled: !!company?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRequest) throw new Error("No request selected");
      
      const { error } = await supabase
        .from("cba_extension_requests")
        .update({
          status: updateForm.status,
          implementation_notes: updateForm.implementation_notes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", selectedRequest.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request updated successfully");
      setShowUpdateDialog(false);
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ["cba-extension-requests"] });
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });

  const filteredRequests = requests.filter(r =>
    r.suggested_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.ai_analysis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "in_development":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200"><PuzzleIcon className="h-3 w-3 mr-1" />In Dev</Badge>;
      case "implemented":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Implemented</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const openDetail = (request: ExtensionRequest) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const openUpdate = (request: ExtensionRequest) => {
    setSelectedRequest(request);
    setUpdateForm({
      status: request.status,
      implementation_notes: request.implementation_notes || ""
    });
    setShowUpdateDialog(true);
  };

  const exportRequests = () => {
    const csv = [
      ["ID", "Type", "Value", "Priority", "Status", "Created", "Agreement", "AI Analysis"].join(","),
      ...filteredRequests.map(r => [
        r.id,
        r.request_type,
        `"${r.suggested_value}"`,
        r.priority,
        r.status,
        format(new Date(r.created_at), "yyyy-MM-dd"),
        r.agreement?.agreement_name || "",
        `"${(r.ai_analysis || "").replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cba-extension-requests-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    implemented: requests.filter(r => r.status === "implemented").length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CBA Extension Requests</h1>
            <p className="text-muted-foreground">
              Track and manage requests for Time & Attendance module extensions
            </p>
          </div>
          <Button variant="outline" onClick={exportRequests} disabled={filteredRequests.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.implemented}</p>
              <p className="text-sm text-muted-foreground">Implemented</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search requests..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PuzzleIcon className="h-5 w-5" />
              Extension Requests
            </CardTitle>
            <CardDescription>
              {filteredRequests.length} request(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No extension requests found</p>
                <p className="text-sm">Requests are created when AI extraction finds unsupported rules</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Suggested Value</TableHead>
                      <TableHead>Agreement</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Badge variant="outline">{request.request_type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{request.suggested_value}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {request.agreement?.agreement_name || "—"}
                        </TableCell>
                        <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openDetail(request)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openUpdate(request)}>
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Extension Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Request Type</Label>
                    <p className="font-medium">{selectedRequest.request_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Suggested Value</Label>
                    <p className="font-medium">{selectedRequest.suggested_value}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
                
                {selectedRequest.original_document_excerpt && (
                  <div>
                    <Label className="text-muted-foreground">Original Document Excerpt</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                      {selectedRequest.original_document_excerpt}
                    </div>
                  </div>
                )}
                
                {selectedRequest.ai_analysis && (
                  <div>
                    <Label className="text-muted-foreground">AI Analysis</Label>
                    <div className="mt-1 p-3 bg-primary/5 rounded-lg text-sm">
                      {selectedRequest.ai_analysis}
                    </div>
                  </div>
                )}
                
                {selectedRequest.impact_description && (
                  <div>
                    <Label className="text-muted-foreground">Impact Description</Label>
                    <p className="text-sm mt-1">{selectedRequest.impact_description}</p>
                  </div>
                )}
                
                {selectedRequest.implementation_notes && (
                  <div>
                    <Label className="text-muted-foreground">Implementation Notes</Label>
                    <p className="text-sm mt-1">{selectedRequest.implementation_notes}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Created: {format(new Date(selectedRequest.created_at), "PPpp")}</div>
                  {selectedRequest.reviewed_at && (
                    <div>Reviewed: {format(new Date(selectedRequest.reviewed_at), "PPpp")}</div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
              <Button onClick={() => { setShowDetailDialog(false); openUpdate(selectedRequest!); }}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Request Status</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedRequest.suggested_value}</p>
                  <p className="text-xs text-muted-foreground">{selectedRequest.request_type}</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={updateForm.status} onValueChange={(v) => setUpdateForm({ ...updateForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_development">In Development</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Implementation Notes</Label>
                  <Textarea 
                    value={updateForm.implementation_notes} 
                    onChange={(e) => setUpdateForm({ ...updateForm, implementation_notes: e.target.value })}
                    placeholder="Add notes about the implementation or decision..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>Cancel</Button>
              <Button onClick={() => updateStatusMutation.mutate()} disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
