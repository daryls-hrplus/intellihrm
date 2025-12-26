import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useLanguage } from "@/hooks/useLanguage";
import { useLeaveCompanyFilter, LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Wallet,
  Search,
  Download,
  Calculator,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ITEMS_PER_PAGE = 20;

interface BalanceWithEmployee {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  leave_year_id: string | null;
  opening_balance: number;
  accrued_amount: number;
  used_amount: number;
  adjustment_amount: number;
  carried_forward: number;
  current_balance: number;
  last_accrual_date: string | null;
  leave_type?: {
    id: string;
    name: string;
    color: string;
    accrual_unit: string;
  };
  leave_year?: {
    id: string;
    name: string;
    code: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
  };
  employee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function EmployeeLeaveBalancesPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  
  // Leave year filter
  const [selectedLeaveYearId, setSelectedLeaveYearId] = useState<string>("current");
  
  const { allLeaveBalances, loadingAllBalances, leaveTypes, leaveYears, loadingLeaveYears } = useLeaveManagement(
    selectedCompanyId,
    selectedLeaveYearId === "current" ? undefined : selectedLeaveYearId
  );

  // Get current leave year ID for "current" selection
  const currentLeaveYear = leaveYears.find(ly => ly.is_current);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [balanceFilter, setBalanceFilter] = useState<string>("all");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [selectedBalance, setSelectedBalance] = useState<BalanceWithEmployee | null>(null);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter logic
  const filteredBalances = useMemo(() => {
    let result = [...(allLeaveBalances as BalanceWithEmployee[])];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.employee?.full_name?.toLowerCase().includes(term) ||
        b.employee?.email?.toLowerCase().includes(term) ||
        b.leave_type?.name?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(b => b.leave_type_id === typeFilter);
    }

    // Balance filter
    if (balanceFilter === "low") {
      result = result.filter(b => b.current_balance <= 5 && b.current_balance > 0);
    } else if (balanceFilter === "zero") {
      result = result.filter(b => b.current_balance === 0);
    } else if (balanceFilter === "negative") {
      result = result.filter(b => b.current_balance < 0);
    } else if (balanceFilter === "high") {
      result = result.filter(b => b.current_balance >= 20);
    }

    return result;
  }, [allLeaveBalances, searchTerm, typeFilter, balanceFilter]);

  // Group by employee for summary view
  const employeeSummary = useMemo(() => {
    const summary = new Map<string, {
      employee: { id: string; full_name: string; email: string };
      totalBalance: number;
      balanceCount: number;
    }>();

    filteredBalances.forEach(balance => {
      if (!balance.employee) return;
      const existing = summary.get(balance.employee_id);
      if (existing) {
        existing.totalBalance += balance.current_balance;
        existing.balanceCount += 1;
      } else {
        summary.set(balance.employee_id, {
          employee: balance.employee,
          totalBalance: balance.current_balance,
          balanceCount: 1,
        });
      }
    });

    return Array.from(summary.values());
  }, [filteredBalances]);

  // Pagination
  const totalPages = Math.ceil(filteredBalances.length / ITEMS_PER_PAGE);
  const paginatedBalances = filteredBalances.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedBalances.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedBalances.map(b => b.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Action handlers
  const handleAdjustBalance = async () => {
    if (!selectedBalance || !adjustmentAmount) return;

    setIsProcessing(true);
    try {
      // Simulate adjustment
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Balance adjusted successfully for ${selectedBalance.employee?.full_name}`);
      setIsAdjustDialogOpen(false);
      setSelectedBalance(null);
      setAdjustmentAmount("");
      setAdjustmentReason("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRecalculate = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedIds.size} balances recalculated successfully`);
      setSelectedIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    toast.success("Exporting leave balances...");
  };

  const getBalanceIndicator = (balance: number) => {
    if (balance < 0) {
      return <Badge variant="destructive" className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Negative</Badge>;
    }
    if (balance === 0) {
      return <Badge variant="outline">Zero</Badge>;
    }
    if (balance <= 5) {
      return <Badge variant="secondary" className="flex items-center gap-1">Low</Badge>;
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("leave.title"), href: "/leave" },
            { label: t("leave.employeeBalances.title", "Employee Leave Balances") },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("leave.employeeBalances.title", "Employee Leave Balances")}
              </h1>
              <p className="text-muted-foreground">
                {t("leave.employeeBalances.subtitle", "View and manage leave balances for all employees")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LeaveCompanyFilter
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            <Select value={selectedLeaveYearId} onValueChange={setSelectedLeaveYearId}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("leave.employeeBalances.selectLeaveYear", "Select Leave Year")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  <span className="font-medium">{t("leave.employeeBalances.currentYear", "Current Year")}</span>
                </SelectItem>
                {leaveYears.map((ly) => (
                  <SelectItem key={ly.id} value={ly.id}>
                    <div className="flex items-center gap-2">
                      {ly.name}
                      {ly.is_current && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                      {ly.is_closed && (
                        <Badge variant="outline" className="text-xs">Closed</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t("common.export", "Export")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("leave.employeeBalances.totalEmployees", "Total Employees")}
                </p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{employeeSummary.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("leave.employeeBalances.totalBalanceRecords", "Balance Records")}
                </p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{filteredBalances.length}</p>
              </div>
              <div className="rounded-lg bg-info/10 p-3">
                <Calculator className="h-5 w-5 text-info" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("leave.employeeBalances.lowBalances", "Low Balances")}
                </p>
                <p className="mt-1 text-3xl font-bold text-warning">
                  {filteredBalances.filter(b => b.current_balance > 0 && b.current_balance <= 5).length}
                </p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3">
                <TrendingDown className="h-5 w-5 text-warning" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("leave.employeeBalances.negativeBalances", "Negative Balances")}
                </p>
                <p className="mt-1 text-3xl font-bold text-destructive">
                  {filteredBalances.filter(b => b.current_balance < 0).length}
                </p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("leave.employeeBalances.searchPlaceholder", "Search by employee name or email...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("leave.type", "Leave Type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allTypes", "All Types")}</SelectItem>
              {leaveTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={balanceFilter} onValueChange={setBalanceFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("leave.balance", "Balance")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all", "All")}</SelectItem>
              <SelectItem value="high">{t("leave.employeeBalances.high", "High (≥20)")}</SelectItem>
              <SelectItem value="low">{t("leave.employeeBalances.low", "Low (1-5)")}</SelectItem>
              <SelectItem value="zero">{t("leave.employeeBalances.zero", "Zero")}</SelectItem>
              <SelectItem value="negative">{t("leave.employeeBalances.negative", "Negative")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <span className="text-sm font-medium">
              {selectedIds.size} {t("leave.employeeBalances.recordsSelected", "records selected")}
            </span>
            <Button size="sm" onClick={handleBulkRecalculate} disabled={isProcessing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {isProcessing
                ? t("common.processing", "Processing...")
                : t("leave.employeeBalances.recalculateSelected", "Recalculate Selected")
              }
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
              {t("common.clearSelection", "Clear Selection")}
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.size === paginatedBalances.length && paginatedBalances.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>{t("leave.employeeBalances.employee", "Employee")}</TableHead>
                <TableHead>{t("leave.employeeBalances.leaveType", "Leave Type")}</TableHead>
                <TableHead className="text-right">{t("leave.employeeBalances.opening", "Opening")}</TableHead>
                <TableHead className="text-right">{t("leave.employeeBalances.accrued", "Accrued")}</TableHead>
                <TableHead className="text-right">{t("leave.employeeBalances.used", "Used")}</TableHead>
                <TableHead className="text-right">{t("leave.employeeBalances.adjustments", "Adjustments")}</TableHead>
                <TableHead className="text-right">{t("leave.employeeBalances.current", "Current")}</TableHead>
                <TableHead className="w-[100px]">{t("common.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAllBalances ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t("common.loading", "Loading...")}
                  </TableCell>
                </TableRow>
              ) : paginatedBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t("leave.employeeBalances.noRecords", "No balance records found")}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBalances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(balance.id)}
                        onCheckedChange={() => toggleSelect(balance.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{balance.employee?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{balance.employee?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: balance.leave_type?.color || "#3B82F6" }}
                        />
                        {balance.leave_type?.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{balance.opening_balance}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      +{balance.accrued_amount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-destructive">
                      -{balance.used_amount}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {balance.adjustment_amount > 0 ? (
                        <span className="text-green-600">+{balance.adjustment_amount}</span>
                      ) : balance.adjustment_amount < 0 ? (
                        <span className="text-destructive">{balance.adjustment_amount}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-bold font-mono ${balance.current_balance < 0 ? 'text-destructive' : ''}`}>
                          {balance.current_balance}
                        </span>
                        {getBalanceIndicator(balance.current_balance)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedBalance(balance)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("common.viewDetails", "View Details")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedBalance(balance);
                            setIsAdjustDialogOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("leave.employeeBalances.adjustBalance", "Adjust Balance")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t("leave.employeeBalances.recalculate", "Recalculate")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Adjust Balance Dialog */}
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("leave.employeeBalances.adjustBalance", "Adjust Balance")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.employee", "Employee")}</span>
                  <span className="font-medium">{selectedBalance?.employee?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.leaveType", "Leave Type")}</span>
                  <span className="font-medium">{selectedBalance?.leave_type?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.currentBalance", "Current Balance")}</span>
                  <span className="font-bold">{selectedBalance?.current_balance} {selectedBalance?.leave_type?.accrual_unit}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("leave.employeeBalances.adjustmentType", "Adjustment Type")}</Label>
                  <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as "add" | "subtract")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          {t("leave.employeeBalances.add", "Add")}
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-destructive" />
                          {t("leave.employeeBalances.subtract", "Subtract")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("leave.employeeBalances.amount", "Amount")}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("leave.employeeBalances.reason", "Reason")}</Label>
                <Textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder={t("leave.employeeBalances.reasonPlaceholder", "Enter reason for adjustment...")}
                  rows={3}
                />
              </div>
              {adjustmentAmount && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.newBalance", "New Balance")}</span>
                    <span className="font-bold text-lg">
                      {adjustmentType === "add"
                        ? (selectedBalance?.current_balance || 0) + Number(adjustmentAmount)
                        : (selectedBalance?.current_balance || 0) - Number(adjustmentAmount)
                      } {selectedBalance?.leave_type?.accrual_unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleAdjustBalance} disabled={isProcessing || !adjustmentAmount}>
                {isProcessing ? t("common.processing", "Processing...") : t("leave.employeeBalances.applyAdjustment", "Apply Adjustment")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!selectedBalance && !isAdjustDialogOpen} onOpenChange={() => setSelectedBalance(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("leave.employeeBalances.balanceDetails", "Balance Details")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.employee", "Employee")}</span>
                  <span className="font-medium">{selectedBalance?.employee?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.email", "Email")}</span>
                  <span>{selectedBalance?.employee?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.leaveType", "Leave Type")}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedBalance?.leave_type?.color }} />
                    <span className="font-medium">{selectedBalance?.leave_type?.name}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.year", "Year")}</span>
                  <span className="font-medium">{selectedBalance?.year}</span>
                </div>
                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.opening", "Opening Balance")}</span>
                    <span className="font-mono">{selectedBalance?.opening_balance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.carriedForward", "Carried Forward")}</span>
                    <span className="font-mono">{selectedBalance?.carried_forward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.accrued", "Accrued")}</span>
                    <span className="font-mono text-green-600">+{selectedBalance?.accrued_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.used", "Used")}</span>
                    <span className="font-mono text-destructive">-{selectedBalance?.used_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.adjustments", "Adjustments")}</span>
                    <span className={`font-mono ${(selectedBalance?.adjustment_amount || 0) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {(selectedBalance?.adjustment_amount || 0) >= 0 ? '+' : ''}{selectedBalance?.adjustment_amount}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium">{t("leave.employeeBalances.current", "Current Balance")}</span>
                    <span className={`font-bold font-mono ${(selectedBalance?.current_balance || 0) < 0 ? 'text-destructive' : ''}`}>
                      {selectedBalance?.current_balance} {selectedBalance?.leave_type?.accrual_unit}
                    </span>
                  </div>
                </div>
                {selectedBalance?.last_accrual_date && (
                  <div className="flex justify-between border-t pt-3 mt-3">
                    <span className="text-sm text-muted-foreground">{t("leave.employeeBalances.lastAccrual", "Last Accrual Date")}</span>
                    <span>{selectedBalance.last_accrual_date}</span>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
