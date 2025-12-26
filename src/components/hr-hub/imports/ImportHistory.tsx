import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { 
  History, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  User,
  Calendar
} from "lucide-react";
import { ImportRollback } from "./ImportRollback";

interface ImportBatch {
  id: string;
  import_type: string;
  file_name: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  skipped_records: number;
  status: string;
  validation_result: any;
  errors: any;
  warnings: any;
  imported_by: string;
  imported_record_ids: any;
  created_at: string;
  validated_at: string | null;
  committed_at: string | null;
  rolled_back_at: string | null;
  rollback_reason: string | null;
  rollback_eligible_until: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  validating: { label: "Validating", variant: "secondary", icon: <Clock className="h-3 w-3 animate-spin" /> },
  validated: { label: "Validated", variant: "outline", icon: <CheckCircle2 className="h-3 w-3" /> },
  staging: { label: "Staging", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  committed: { label: "Committed", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  rolled_back: { label: "Rolled Back", variant: "destructive", icon: <RotateCcw className="h-3 w-3" /> },
  failed: { label: "Failed", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", variant: "secondary", icon: <XCircle className="h-3 w-3" /> },
};

const IMPORT_TYPE_LABELS: Record<string, string> = {
  companies: "Companies",
  divisions: "Divisions",
  departments: "Departments",
  sections: "Sections",
  jobs: "Jobs",
  job_families: "Job Families",
  positions: "Positions",
  employees: "Employees",
  new_hires: "New Hires",
};

interface ImportHistoryProps {
  companyId?: string;
}

export function ImportHistory({ companyId }: ImportHistoryProps) {
  const { t } = useLanguage();
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rollbackBatch, setRollbackBatch] = useState<ImportBatch | null>(null);

  useEffect(() => {
    fetchBatches();
  }, [companyId, statusFilter, typeFilter]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("import_batches")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (typeFilter !== "all") {
        query = query.eq("import_type", typeFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching import batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter((batch) =>
    batch.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.import_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canRollback = (batch: ImportBatch) => {
    if (batch.status !== "committed") return false;
    if (batch.rollback_eligible_until) {
      return new Date(batch.rollback_eligible_until) > new Date();
    }
    // Default: rollback eligible within 30 days
    const commitDate = new Date(batch.committed_at || batch.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return commitDate > thirtyDaysAgo;
  };

  const handleRollbackComplete = () => {
    setRollbackBatch(null);
    fetchBatches();
  };

  const downloadValidationReport = (batch: ImportBatch) => {
    const report = {
      batchId: batch.id,
      fileName: batch.file_name,
      importType: batch.import_type,
      status: batch.status,
      summary: {
        total: batch.total_records,
        successful: batch.successful_records,
        failed: batch.failed_records,
        skipped: batch.skipped_records,
      },
      validation: batch.validation_result,
      errors: batch.errors,
      warnings: batch.warnings,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-report-${batch.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t("hrHub.dataImport.history.title") || "Import History"}
          </CardTitle>
          <CardDescription>
            {t("hrHub.dataImport.history.description") || "View and manage all data imports, including rollback capabilities"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(IMPORT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mb-2" />
                <p>No import history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBatches.map((batch, index) => {
                  const statusConfig = STATUS_CONFIG[batch.status] || STATUS_CONFIG.pending;
                  const isRollbackEligible = canRollback(batch);

                  return (
                    <div
                      key={batch.id}
                      className="relative flex gap-4 pb-3"
                    >
                      {/* Timeline connector */}
                      {index < filteredBatches.length - 1 && (
                        <div className="absolute left-[15px] top-[40px] bottom-0 w-0.5 bg-border" />
                      )}

                      {/* Status indicator */}
                      <div className={`
                        relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2
                        ${batch.status === "committed" ? "bg-primary/10 border-primary text-primary" : ""}
                        ${batch.status === "failed" || batch.status === "rolled_back" ? "bg-destructive/10 border-destructive text-destructive" : ""}
                        ${!["committed", "failed", "rolled_back"].includes(batch.status) ? "bg-muted border-muted-foreground/30 text-muted-foreground" : ""}
                      `}>
                        {statusConfig.icon}
                      </div>

                      {/* Content */}
                      <Card className="flex-1 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium">{batch.file_name}</h4>
                                <Badge variant={statusConfig.variant} className="gap-1">
                                  {statusConfig.icon}
                                  {statusConfig.label}
                                </Badge>
                                <Badge variant="outline">
                                  {IMPORT_TYPE_LABELS[batch.import_type] || batch.import_type}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(batch.created_at), "MMM d, yyyy HH:mm")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileSpreadsheet className="h-3 w-3" />
                                  {batch.total_records} records
                                </span>
                                {batch.successful_records > 0 && (
                                  <span className="text-green-600 dark:text-green-400">
                                    ✓ {batch.successful_records} successful
                                  </span>
                                )}
                                {batch.failed_records > 0 && (
                                  <span className="text-destructive">
                                    ✗ {batch.failed_records} failed
                                  </span>
                                )}
                              </div>

                              {batch.rollback_reason && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                                  Rollback reason: {batch.rollback_reason}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadValidationReport(batch)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {isRollbackEligible && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setRollbackBatch(batch)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Rollback
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Import Details</DialogTitle>
            <DialogDescription>
              {selectedBatch?.file_name}
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Import Type</p>
                    <p className="font-medium">{IMPORT_TYPE_LABELS[selectedBatch.import_type]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={STATUS_CONFIG[selectedBatch.status]?.variant}>
                      {STATUS_CONFIG[selectedBatch.status]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {format(new Date(selectedBatch.created_at), "MMM d, yyyy HH:mm:ss")}
                    </p>
                  </div>
                  {selectedBatch.committed_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Committed</p>
                      <p className="font-medium">
                        {format(new Date(selectedBatch.committed_at), "MMM d, yyyy HH:mm:ss")}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold">{selectedBatch.total_records}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedBatch.successful_records}</p>
                        <p className="text-xs text-muted-foreground">Successful</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-destructive">{selectedBatch.failed_records}</p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{selectedBatch.skipped_records}</p>
                        <p className="text-xs text-muted-foreground">Skipped</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {selectedBatch.errors && Array.isArray(selectedBatch.errors) && selectedBatch.errors.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2 text-destructive">Errors</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {selectedBatch.errors.slice(0, 10).map((error: any, i: number) => (
                          <div key={i} className="text-sm p-2 bg-destructive/10 rounded">
                            <span className="text-muted-foreground">Row {error.row}:</span> {error.issue}
                          </div>
                        ))}
                        {selectedBatch.errors.length > 10 && (
                          <p className="text-sm text-muted-foreground">
                            +{selectedBatch.errors.length - 10} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Rollback Dialog */}
      {rollbackBatch && (
        <ImportRollback
          batch={rollbackBatch}
          open={!!rollbackBatch}
          onOpenChange={(open) => !open && setRollbackBatch(null)}
          onRollbackComplete={handleRollbackComplete}
        />
      )}
    </div>
  );
}
