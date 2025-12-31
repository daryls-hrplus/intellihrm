import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CompensationCompanyFilter, useCompensationCompanyFilter } from "@/components/compensation/CompensationCompanyFilter";
import { useMinimumWageCompliance, MinimumWageViolation } from "@/hooks/useMinimumWageCompliance";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Search,
  Settings,
  RefreshCw,
  TrendingDown,
  Shield,
  Eye,
  FileCheck,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function MinimumWageCompliancePage() {
  const { selectedCompanyId, setSelectedCompanyId } = useCompensationCompanyFilter();
  const { violations, stats, isLoading, updateViolationStatus, refreshData } = useMinimumWageCompliance(selectedCompanyId);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedViolation, setSelectedViolation] = useState<MinimumWageViolation | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [dialogAction, setDialogAction] = useState<"resolve" | "exempt" | "false_positive" | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredViolations = violations.filter(v => {
    const matchesSearch = 
      v.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.position?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleStatusChange = async (action: "resolve" | "exempt" | "false_positive") => {
    if (!selectedViolation) return;
    
    const statusMap = {
      resolve: "resolved" as const,
      exempt: "exempted" as const,
      false_positive: "false_positive" as const,
    };
    
    await updateViolationStatus(selectedViolation.id, statusMap[action], resolutionNotes);
    setSelectedViolation(null);
    setResolutionNotes("");
    setDialogAction(null);
  };

  const openDialog = (violation: MinimumWageViolation, action: "resolve" | "exempt" | "false_positive") => {
    setSelectedViolation(violation);
    setDialogAction(action);
    setResolutionNotes("");
  };

  const getStatusBadge = (status: MinimumWageViolation["status"]) => {
    const statusStyles = {
      detected: "bg-destructive/10 text-destructive border-destructive/20",
      under_review: "bg-warning/10 text-warning border-warning/20",
      resolved: "bg-success/10 text-success border-success/20",
      exempted: "bg-muted text-muted-foreground border-muted",
      false_positive: "bg-muted text-muted-foreground border-muted",
    };
    
    const statusLabels = {
      detected: "Detected",
      under_review: "Under Review",
      resolved: "Resolved",
      exempted: "Exempted",
      false_positive: "False Positive",
    };
    
    return (
      <Badge variant="outline" className={statusStyles[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Minimum Wage Compliance
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage minimum wage compliance across your workforce
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/compensation/minimum-wage-config">
                <Settings className="h-4 w-4 mr-2" />
                Configure Rates
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-border bg-card">
          <CompensationCompanyFilter
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
            showAllOption={true}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Employees Monitored
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalMonitored}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compliant
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-success">{stats.compliantCount}</div>
              )}
            </CardContent>
          </Card>

          <Card className={stats.violationCount > 0 ? "border-destructive/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Violations
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-destructive">{stats.violationCount}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-warning">{stats.pendingReviewCount}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Shortfall
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(stats.totalShortfall)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Monthly</p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Rate Gauge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Compliance Rate</CardTitle>
            <CardDescription>Percentage of workforce meeting minimum wage requirements</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{stats.complianceRate}%</span>
                  <span className="text-sm text-muted-foreground">Target: 100%</span>
                </div>
                <Progress 
                  value={stats.complianceRate} 
                  className={`h-3 ${stats.complianceRate < 100 ? "[&>div]:bg-destructive" : "[&>div]:bg-success"}`}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Violations Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Compliance Violations</CardTitle>
                <CardDescription>Employees currently below minimum wage thresholds</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="detected">Detected</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="exempted">Exempted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredViolations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-success mb-4" />
                <h3 className="text-lg font-semibold">All Clear!</h3>
                <p className="text-muted-foreground">
                  No minimum wage violations found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Current Rate</TableHead>
                      <TableHead className="text-right">Required Rate</TableHead>
                      <TableHead className="text-right">Shortfall</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViolations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{violation.employee?.full_name || "Unknown"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{violation.position?.title || "-"}</TableCell>
                        <TableCell>{violation.employee?.company?.country || "-"}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(violation.current_monthly_rate)}
                          <span className="text-xs text-muted-foreground block">/month</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(violation.required_monthly_rate)}
                          <span className="text-xs text-muted-foreground block">/month</span>
                        </TableCell>
                        <TableCell className="text-right text-destructive font-medium">
                          {formatCurrency(violation.shortfall_amount)}
                          {violation.shortfall_percentage && (
                            <span className="text-xs block">
                              ({violation.shortfall_percentage.toFixed(1)}%)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(violation.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateForDisplay(violation.detected_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {violation.status === "detected" && (
                                <DropdownMenuItem
                                  onClick={() => updateViolationStatus(violation.id, "under_review")}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark for Review
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => openDialog(violation, "resolve")}>
                                <FileCheck className="h-4 w-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog(violation, "exempt")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Mark Exempted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog(violation, "false_positive")}>
                                <XCircle className="h-4 w-4 mr-2" />
                                False Positive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolution Dialog */}
      <Dialog open={dialogAction !== null} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "resolve" && "Resolve Violation"}
              {dialogAction === "exempt" && "Mark as Exempted"}
              {dialogAction === "false_positive" && "Mark as False Positive"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "resolve" && "Confirm that this minimum wage violation has been addressed."}
              {dialogAction === "exempt" && "Provide a reason for exempting this employee from minimum wage requirements."}
              {dialogAction === "false_positive" && "Explain why this was incorrectly flagged as a violation."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Enter resolution notes..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Cancel
            </Button>
            <Button onClick={() => dialogAction && handleStatusChange(dialogAction)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
