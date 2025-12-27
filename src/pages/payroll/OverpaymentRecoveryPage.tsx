import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Plus, 
  Search, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  PauseCircle,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOverpaymentRecovery, OverpaymentRecord, OverpaymentStatus } from "@/hooks/useOverpaymentRecovery";
import { CreateOverpaymentDialog } from "@/components/payroll/overpayment/CreateOverpaymentDialog";
import { OverpaymentDetailSheet } from "@/components/payroll/overpayment/OverpaymentDetailSheet";
import { format } from "date-fns";

const statusConfig: Record<OverpaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_approval: { label: "Pending Approval", variant: "outline" },
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
  written_off: { label: "Written Off", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

const priorityConfig = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", className: "bg-primary/10 text-primary" },
  high: { label: "High", className: "bg-warning/10 text-warning" },
  urgent: { label: "Urgent", className: "bg-destructive/10 text-destructive" },
};

export default function OverpaymentRecoveryPage() {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OverpaymentRecord | null>(null);
  
  const { 
    records, 
    isLoading, 
    summary,
    fetchRecords,
    fetchSummary,
    approveRecord,
    suspendRecord,
    resumeRecord,
    modifyRecoveryAmount,
    writeOffRecord,
  } = useOverpaymentRecovery(companyId);

  useEffect(() => {
    const loadCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        if (data?.company_id) {
          setCompanyId(data.company_id);
        }
      }
    };
    loadCompany();
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    fetchRecords();
    fetchSummary();
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Overpayment Recovery</h1>
            <p className="text-muted-foreground">Track and manage employee overpayment recoveries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Overpayment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_outstanding)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Recoveries</p>
                  <p className="text-2xl font-bold">{summary.active_recoveries}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Recovered</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_recovered)}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold">{summary.suspended}</p>
                </div>
                <PauseCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Approval Alert */}
      {summary && summary.pending_approval > 0 && (
        <Alert variant="default" className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertTitle>Pending Approvals</AlertTitle>
          <AlertDescription>
            {summary.pending_approval} overpayment record(s) require approval before recovery can begin.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overpayment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name, ID, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="written_off">Written Off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading records...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No overpayment records found
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Per Cycle</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow 
                      key={record.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.employee?.first_name} {record.employee?.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.employee?.employee_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={record.reason}>
                          {record.reason}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(record.original_amount, record.currency)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(record.remaining_balance, record.currency)}
                      </TableCell>
                      <TableCell>{formatCurrency(record.recovery_amount_per_cycle, record.currency)}</TableCell>
                      <TableCell>
                        <Badge className={priorityConfig[record.priority]?.className}>
                          {priorityConfig[record.priority]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[record.status]?.variant}>
                          {statusConfig[record.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(record.overpayment_date), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateOverpaymentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        companyId={companyId}
        onSuccess={() => {
          setCreateDialogOpen(false);
          handleRefresh();
        }}
      />

      {/* Detail Sheet */}
      <OverpaymentDetailSheet
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onApprove={approveRecord}
        onSuspend={suspendRecord}
        onResume={resumeRecord}
        onModifyAmount={modifyRecoveryAmount}
        onWriteOff={writeOffRecord}
      />
    </div>
  );
}
