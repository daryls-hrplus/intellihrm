import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useResumptionOfDuty } from "@/hooks/useResumptionOfDuty";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ResumptionOfDutyForm } from "@/components/leave/ResumptionOfDutyForm";
import { ResumptionOfDutyCard } from "@/components/leave/ResumptionOfDutyCard";
import { Calendar, CalendarPlus, Clock, CheckCircle, XCircle, AlertCircle, FileCheck } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { NavLink } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MyLeavePage() {
  const { t } = useLanguage();
  const { leaveBalances, leaveRequests, loadingBalances, loadingRequests } = useLeaveManagement();
  const { pendingForEmployee, myRodsLoading } = useResumptionOfDuty();
  const [selectedRod, setSelectedRod] = useState<string | null>(null);

  const selectedRodData = pendingForEmployee.find(r => r.id === selectedRod);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: "default", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { variant: "secondary", icon: <XCircle className="h-3 w-3 mr-1" /> },
      withdrawn: { variant: "secondary", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      draft: { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("leave.title"), href: "/leave" },
            { label: t("leave.myLeave.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("leave.myLeave.title")}</h1>
              <p className="text-muted-foreground">{t("leave.myLeave.subtitle")}</p>
            </div>
          </div>
          <NavLink to="/leave/apply">
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              {t("leave.myLeave.applyForLeave")}
            </Button>
          </NavLink>
        </div>

        {/* Pending Resumption of Duty */}
        {pendingForEmployee.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold">Pending Resumption of Duty</h2>
              <Badge variant="secondary">{pendingForEmployee.length}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingForEmployee.map((rod) => (
                <ResumptionOfDutyCard
                  key={rod.id}
                  rod={rod}
                  onAction={() => setSelectedRod(rod.id)}
                  actionLabel="Complete Form"
                />
              ))}
            </div>
          </div>
        )}

        {/* Leave Balances */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("leave.myLeave.leaveBalances")}</h2>
          {loadingBalances ? (
            <div className="text-center py-8 text-muted-foreground">{t("leave.myLeave.loadingBalances")}</div>
          ) : leaveBalances.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
              {t("leave.myLeave.noBalances")}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {leaveBalances.map((balance) => (
                <div
                  key={balance.id}
                  className="rounded-xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: balance.leave_type?.color || "#3B82F6" }} 
                      />
                      <span className="font-medium text-card-foreground">
                        {balance.leave_type?.name || "Unknown"}
                      </span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {balance.leave_type?.accrual_unit || "days"}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-card-foreground mb-2">
                    {balance.current_balance}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="block text-xs">{t("leave.myLeave.accrued")}</span>
                      <span className="font-medium text-card-foreground">{balance.accrued_amount}</span>
                    </div>
                    <div>
                      <span className="block text-xs">{t("leave.myLeave.used")}</span>
                      <span className="font-medium text-card-foreground">{balance.used_amount}</span>
                    </div>
                    <div>
                      <span className="block text-xs">{t("leave.myLeave.carried")}</span>
                      <span className="font-medium text-card-foreground">{balance.carried_forward}</span>
                    </div>
                    <div>
                      <span className="block text-xs">{t("leave.myLeave.adjustments")}</span>
                      <span className="font-medium text-card-foreground">{balance.adjustment_amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave Requests */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("leave.myLeave.leaveRequests")}</h2>
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("leave.myLeave.requestNumber")}</TableHead>
                  <TableHead>{t("leave.myLeave.type")}</TableHead>
                  <TableHead>{t("leave.myLeave.dates")}</TableHead>
                  <TableHead>{t("leave.myLeave.duration")}</TableHead>
                  <TableHead>{t("leave.common.status")}</TableHead>
                  <TableHead>{t("leave.myLeave.submitted")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRequests ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("leave.myLeave.loading")}
                    </TableCell>
                  </TableRow>
                ) : leaveRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("leave.myLeave.noRequests")}
                    </TableCell>
                  </TableRow>
                ) : (
                  leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">{request.request_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: request.leave_type?.color || "#3B82F6" }} 
                          />
                          {request.leave_type?.name || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDateForDisplay(request.start_date, "MMM d, yyyy")}
                        {request.start_date !== request.end_date && (
                          <> - {formatDateForDisplay(request.end_date, "MMM d, yyyy")}</>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.duration} {request.leave_type?.accrual_unit || "days"}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.submitted_at 
                          ? formatDateForDisplay(request.submitted_at, "MMM d, yyyy")
                          : "-"
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ROD Form Dialog */}
        <Dialog open={!!selectedRod} onOpenChange={(open) => !open && setSelectedRod(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedRodData && (
              <ResumptionOfDutyForm
                rod={selectedRodData}
                onSuccess={() => setSelectedRod(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
