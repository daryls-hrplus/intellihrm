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
import { formatDateForDisplay } from "@/utils/dateUtils";
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
import { useLanguage } from "@/hooks/useLanguage";

export default function CompensatoryTimePage() {
  const { t } = useLanguage();
  const { isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const {
    earnedRequests,
    usedRequests,
    myBalance,
    loadingEarned,
    loadingUsed,
  } = useCompensatoryTime();

  const breadcrumbItems = [
    { label: t("leave.title"), href: "/leave" },
    { label: t("leave.compTime.title") },
  ];

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
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" />{t("leave.compTime.pending")}</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" />{t("leave.compTime.approved")}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />{t("leave.compTime.rejected")}</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-muted text-muted-foreground"><History className="h-3 w-3 mr-1" />{t("leave.compTime.expired")}</Badge>;
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
      overtime: t("leave.compTime.overtime"),
      holiday_work: t("leave.compTime.holidayWork"),
      weekend_work: t("leave.compTime.weekendWork"),
      other: t("leave.compTime.other"),
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
              <h1 className="text-2xl font-bold tracking-tight">{t("leave.compTime.title")}</h1>
              <p className="text-muted-foreground">{t("leave.compTime.subtitle")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEarnDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("leave.compTime.requestCompTime")}
            </Button>
            {myBalance && myBalance.current_balance > 0 && (
              <Button variant="outline" onClick={() => setUseDialogOpen(true)}>
                <Clock className="h-4 w-4 mr-2" />
                {t("leave.compTime.useCompTime")}
              </Button>
            )}
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("leave.compTime.currentBalance")}</CardDescription>
              <CardTitle className="text-3xl text-primary">
                {myBalance ? myBalance.current_balance.toFixed(1) : '0.0'} {t("leave.compTime.hrs")}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("leave.compTime.totalEarned")}</CardDescription>
              <CardTitle className="text-3xl text-success">
                {myBalance ? myBalance.total_earned.toFixed(1) : '0.0'} {t("leave.compTime.hrs")}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("leave.compTime.totalUsed")}</CardDescription>
              <CardTitle className="text-3xl text-warning">
                {myBalance ? myBalance.total_used.toFixed(1) : '0.0'} {t("leave.compTime.hrs")}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("leave.compTime.expired")}</CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">
                {myBalance ? myBalance.total_expired.toFixed(1) : '0.0'} {t("leave.compTime.hrs")}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for Earned/Used */}
        <Tabs defaultValue="earned" className="space-y-4">
          <TabsList>
            <TabsTrigger value="earned" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("leave.compTime.earnedRequests")}
              {pendingEarnedCount > 0 && isAdminOrHR && (
                <Badge variant="destructive" className="ml-1">{pendingEarnedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="used" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("leave.compTime.usageRequests")}
              {pendingUsedCount > 0 && isAdminOrHR && (
                <Badge variant="destructive" className="ml-1">{pendingUsedCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned">
            <Card>
              <CardHeader>
                <CardTitle>{t("leave.compTime.compTimeEarned")}</CardTitle>
                <CardDescription>
                  {t("leave.compTime.compTimeEarnedDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEarned ? (
                  <p className="text-muted-foreground text-center py-8">{t("leave.compTime.loading")}</p>
                ) : earnedRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("leave.compTime.noEarnedRequests")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {isAdminOrHR && <TableHead>{t("leave.compTime.employee")}</TableHead>}
                        <TableHead>{t("leave.compTime.workDate")}</TableHead>
                        <TableHead>{t("leave.compTime.type")}</TableHead>
                        <TableHead>{t("leave.compTime.hours")}</TableHead>
                        <TableHead>{t("leave.compTime.reason")}</TableHead>
                        <TableHead>{t("leave.compTime.status")}</TableHead>
                        <TableHead>{t("leave.compTime.expires")}</TableHead>
                        {isAdminOrHR && <TableHead>{t("leave.compTime.actions")}</TableHead>}
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
                          <TableCell>{formatDateForDisplay(request.work_date)}</TableCell>
                          <TableCell>{getWorkTypeBadge(request.work_type)}</TableCell>
                          <TableCell className="font-semibold">{request.hours_earned} hrs</TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.expires_at ? formatDateForDisplay(request.expires_at) : '-'}
                          </TableCell>
                          {isAdminOrHR && (
                            <TableCell>
                              {request.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApprove(request, 'earned')}
                                >
                                  {t("leave.compTime.review")}
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
                <CardTitle>{t("leave.compTime.compTimeUsed")}</CardTitle>
                <CardDescription>
                  {t("leave.compTime.compTimeUsedDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsed ? (
                  <p className="text-muted-foreground text-center py-8">{t("leave.compTime.loading")}</p>
                ) : usedRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("leave.compTime.noUsageRequests")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {isAdminOrHR && <TableHead>{t("leave.compTime.employee")}</TableHead>}
                        <TableHead>{t("leave.compTime.useDate")}</TableHead>
                        <TableHead>{t("leave.compTime.hours")}</TableHead>
                        <TableHead>{t("leave.compTime.reason")}</TableHead>
                        <TableHead>{t("leave.compTime.status")}</TableHead>
                        {isAdminOrHR && <TableHead>{t("leave.compTime.actions")}</TableHead>}
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
                                  {t("leave.compTime.review")}
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
