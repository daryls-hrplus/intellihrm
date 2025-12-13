import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, CheckCircle, XCircle, History, Timer, TrendingUp } from "lucide-react";
import { useCompensatoryTime } from "@/hooks/useCompensatoryTime";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CompTimeEarnDialog } from "@/components/leave/CompTimeEarnDialog";
import { CompTimeUseDialog } from "@/components/leave/CompTimeUseDialog";
import { CompTimeApprovalDialog } from "@/components/leave/CompTimeApprovalDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const breadcrumbItems = [
  { label: "Leave", href: "/leave" },
  { label: "Compensatory Time" },
];

export default function CompensatoryTimePage() {
  const { isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const {
    earnedRequests,
    usedRequests,
    myBalance,
    loadingEarned,
    loadingUsed,
  } = useCompensatoryTime();

  const [earnDialogOpen, setEarnDialogOpen] = useState(false);
  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalType, setApprovalType] = useState<'earned' | 'used'>('earned');

  const pendingEarnedCount = earnedRequests.filter(r => r.status === 'pending').length;
  const pendingUsedCount = usedRequests.filter(r => r.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-muted text-muted-foreground"><History className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getWorkTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      overtime: 'bg-primary/10 text-primary',
      holiday_work: 'bg-destructive/10 text-destructive',
      weekend_work: 'bg-warning/10 text-warning',
      other: 'bg-muted text-muted-foreground',
    };
    const labels: Record<string, string> = {
      overtime: 'Overtime',
      holiday_work: 'Holiday Work',
      weekend_work: 'Weekend Work',
      other: 'Other',
    };
    return <Badge variant="outline" className={colors[type] || colors.other}>{labels[type] || type}</Badge>;
  };

  const handleApprove = (request: any, type: 'earned' | 'used') => {
    setSelectedRequest(request);
    setApprovalType(type);
    setApprovalDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Compensatory Time Off</h1>
              <p className="text-muted-foreground">Manage earned and used comp time</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEarnDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Comp Time
            </Button>
            {myBalance && myBalance.current_balance > 0 && (
              <Button variant="outline" onClick={() => setUseDialogOpen(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Use Comp Time
              </Button>
            )}
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Balance</CardDescription>
              <CardTitle className="text-3xl text-primary">
                {myBalance ? myBalance.current_balance.toFixed(1) : '0.0'} hrs
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earned</CardDescription>
              <CardTitle className="text-3xl text-success">
                {myBalance ? myBalance.total_earned.toFixed(1) : '0.0'} hrs
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Used</CardDescription>
              <CardTitle className="text-3xl text-warning">
                {myBalance ? myBalance.total_used.toFixed(1) : '0.0'} hrs
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expired</CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">
                {myBalance ? myBalance.total_expired.toFixed(1) : '0.0'} hrs
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for Earned/Used */}
        <Tabs defaultValue="earned" className="space-y-4">
          <TabsList>
            <TabsTrigger value="earned" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Earned Requests
              {pendingEarnedCount > 0 && isAdminOrHR && (
                <Badge variant="destructive" className="ml-1">{pendingEarnedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="used" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Usage Requests
              {pendingUsedCount > 0 && isAdminOrHR && (
                <Badge variant="destructive" className="ml-1">{pendingUsedCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned">
            <Card>
              <CardHeader>
                <CardTitle>Comp Time Earned</CardTitle>
                <CardDescription>
                  Track overtime and holiday work converted to time off
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEarned ? (
                  <p className="text-muted-foreground text-center py-8">Loading...</p>
                ) : earnedRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No comp time requests yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {isAdminOrHR && <TableHead>Employee</TableHead>}
                        <TableHead>Work Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        {isAdminOrHR && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnedRequests.map((request) => (
                        <TableRow key={request.id}>
                          {isAdminOrHR && (
                            <TableCell className="font-medium">
                              {request.employee?.full_name || 'Unknown'}
                            </TableCell>
                          )}
                          <TableCell>{format(new Date(request.work_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{getWorkTypeBadge(request.work_type)}</TableCell>
                          <TableCell className="font-semibold">{request.hours_earned} hrs</TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.expires_at ? format(new Date(request.expires_at), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          {isAdminOrHR && (
                            <TableCell>
                              {request.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApprove(request, 'earned')}
                                >
                                  Review
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="used">
            <Card>
              <CardHeader>
                <CardTitle>Comp Time Used</CardTitle>
                <CardDescription>
                  Track when compensatory time has been taken
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsed ? (
                  <p className="text-muted-foreground text-center py-8">Loading...</p>
                ) : usedRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No usage requests yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {isAdminOrHR && <TableHead>Employee</TableHead>}
                        <TableHead>Use Date</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        {isAdminOrHR && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usedRequests.map((request) => (
                        <TableRow key={request.id}>
                          {isAdminOrHR && (
                            <TableCell className="font-medium">
                              {request.employee?.full_name || 'Unknown'}
                            </TableCell>
                          )}
                          <TableCell>{format(new Date(request.use_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell className="font-semibold">{request.hours_used} hrs</TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.reason || '-'}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          {isAdminOrHR && (
                            <TableCell>
                              {request.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApprove(request, 'used')}
                                >
                                  Review
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CompTimeEarnDialog 
        open={earnDialogOpen} 
        onOpenChange={setEarnDialogOpen} 
      />
      
      <CompTimeUseDialog 
        open={useDialogOpen} 
        onOpenChange={setUseDialogOpen}
        availableBalance={myBalance?.current_balance || 0}
      />
      
      <CompTimeApprovalDialog 
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        request={selectedRequest}
        type={approvalType}
      />
    </AppLayout>
  );
}
