import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Banknote, Clock, CheckCircle, XCircle, Loader2, DollarSign, 
  TrendingUp, Calendar, Download
} from "lucide-react";
import { useLeaveEncashment, LeaveEncashmentRequest } from "@/hooks/useLeaveEnhancements";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useLanguage } from "@/hooks/useLanguage";

export default function LeaveEncashmentPage() {
  const { t } = useLanguage();
  const { company, isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const { encashmentRequests, isLoading, reviewEncashment } = useLeaveEncashment(company?.id);
  
  const [selectedRequest, setSelectedRequest] = useState<LeaveEncashmentRequest | null>(null);
  const [ratePerDay, setRatePerDay] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingRequests = encashmentRequests.filter(r => r.status === 'pending');
  const approvedRequests = encashmentRequests.filter(r => r.status === 'approved');
  const paidRequests = encashmentRequests.filter(r => r.status === 'paid');

  const totalPending = pendingRequests.reduce((sum, r) => sum + r.days_requested, 0);
  const totalApproved = approvedRequests.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const totalPaid = paidRequests.reduce((sum, r) => sum + (r.total_amount || 0), 0);

  const handleApprove = async (request: LeaveEncashmentRequest) => {
    await reviewEncashment.mutateAsync({
      id: request.id,
      status: 'approved',
      rate_per_day: parseFloat(ratePerDay) || request.rate_per_day || undefined,
    });
    setSelectedRequest(null);
    setRatePerDay("");
  };

  const handleReject = async (request: LeaveEncashmentRequest) => {
    await reviewEncashment.mutateAsync({
      id: request.id,
      status: 'rejected',
      rejection_reason: rejectionReason,
    });
    setSelectedRequest(null);
    setRejectionReason("");
  };

  const handleMarkPaid = async (request: LeaveEncashmentRequest) => {
    await reviewEncashment.mutateAsync({
      id: request.id,
      status: 'paid',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'paid': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><DollarSign className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.leave"), href: "/leave" },
          { label: "Leave Encashment" }
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Banknote className="h-6 w-6" />
              Leave Encashment
            </h1>
            <p className="text-muted-foreground">Manage leave balance encashment requests</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">{totalPending} days total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved (Unpaid)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{approvedRequests.length}</div>
              <p className="text-xs text-muted-foreground">${totalApproved.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid This Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{paidRequests.length} requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{encashmentRequests.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending
                  {pendingRequests.length > 0 && (
                    <Badge className="ml-2" variant="secondary">{pendingRequests.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              {['pending', 'approved', 'paid', 'all'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Days</TableHead>
                          <TableHead>Rate/Day</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          {isAdminOrHR && <TableHead>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(tab === 'pending' ? pendingRequests :
                          tab === 'approved' ? approvedRequests :
                          tab === 'paid' ? paidRequests : encashmentRequests
                        ).map(request => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.employee?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{request.employee?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{request.leave_type?.name}</TableCell>
                            <TableCell>{request.days_requested}</TableCell>
                            <TableCell>
                              {request.rate_per_day ? `$${request.rate_per_day.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {request.total_amount ? `$${request.total_amount.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>{formatDateForDisplay(request.created_at)}</TableCell>
                            {isAdminOrHR && (
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {request.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedRequest(request);
                                          setRatePerDay(request.rate_per_day?.toString() || "");
                                        }}
                                      >
                                        Review
                                      </Button>
                                    </>
                                  )}
                                  {request.status === 'approved' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleMarkPaid(request)}
                                      disabled={reviewEncashment.isPending}
                                    >
                                      Mark Paid
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Review Encashment Request</CardTitle>
              <CardDescription>
                {selectedRequest.employee?.full_name} - {selectedRequest.days_requested} days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rate per Day ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={ratePerDay}
                  onChange={(e) => setRatePerDay(e.target.value)}
                  placeholder="Enter rate per day"
                />
                {ratePerDay && (
                  <p className="text-sm text-muted-foreground">
                    Total: ${(parseFloat(ratePerDay) * selectedRequest.days_requested).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Rejection Reason (if rejecting)</Label>
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedRequest(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedRequest)}
                  disabled={!rejectionReason || reviewEncashment.isPending}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={!ratePerDay || reviewEncashment.isPending}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
