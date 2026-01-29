import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, Download, FileSpreadsheet, CheckCircle, XCircle, 
  AlertTriangle, Loader2, FileText, Users 
} from "lucide-react";
import { toast } from "sonner";

interface ComplianceBulkOperationsProps {
  companyId: string;
  onComplete?: () => void;
}

interface PreviewRow {
  employee_email: string;
  training_name: string;
  due_date: string;
  priority: string;
  status: "valid" | "error" | "warning";
  message?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function ComplianceBulkOperations({ companyId, onComplete }: ComplianceBulkOperationsProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    
    if (lines.length < 2) {
      toast.error("CSV file must have a header row and at least one data row");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["employee_email", "training_name", "due_date"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(", ")}`);
      return;
    }

    const emailIdx = headers.indexOf("employee_email");
    const trainingIdx = headers.indexOf("training_name");
    const dueDateIdx = headers.indexOf("due_date");
    const priorityIdx = headers.indexOf("priority");

    // Validate and preview rows
    const previewRows: PreviewRow[] = [];
    
    for (let i = 1; i < Math.min(lines.length, 101); i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      
      const row: PreviewRow = {
        employee_email: values[emailIdx] || "",
        training_name: values[trainingIdx] || "",
        due_date: values[dueDateIdx] || "",
        priority: priorityIdx >= 0 ? values[priorityIdx] || "normal" : "normal",
        status: "valid",
      };

      // Validate email
      if (!row.employee_email || !row.employee_email.includes("@")) {
        row.status = "error";
        row.message = "Invalid email format";
      }

      // Validate due date
      if (!row.due_date || isNaN(Date.parse(row.due_date))) {
        row.status = "error";
        row.message = "Invalid date format";
      }

      // Validate training name
      if (!row.training_name) {
        row.status = "error";
        row.message = "Training name required";
      }

      previewRows.push(row);
    }

    setPreview(previewRows);
    setImportDialogOpen(true);
    setImportResult(null);
  };

  const processImport = async () => {
    const validRows = preview.filter((r) => r.status === "valid");
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setImporting(true);
    setImportProgress(0);

    const results: ImportResult = { success: 0, failed: 0, errors: [] };

    // Fetch all employees and trainings for lookup
    const { data: employees } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("company_id", companyId);

    const { data: trainings } = await supabase
      .from("compliance_training")
      .select("id, name")
      .eq("company_id", companyId);

    const employeeMap = new Map(employees?.map((e) => [e.email?.toLowerCase(), e.id]) || []);
    const trainingMap = new Map(trainings?.map((t) => [t.name.toLowerCase(), t.id]) || []);

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      
      const employeeId = employeeMap.get(row.employee_email.toLowerCase());
      const trainingId = trainingMap.get(row.training_name.toLowerCase());

      if (!employeeId) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Employee not found: ${row.employee_email}`);
        continue;
      }

      if (!trainingId) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Training not found: ${row.training_name}`);
        continue;
      }

      // @ts-ignore - Supabase type instantiation issue
      const { error } = await supabase.from("compliance_training_assignments").insert({
        employee_id: employeeId,
        compliance_training_id: trainingId,
        due_date: row.due_date,
        priority: row.priority,
        status: "assigned",
      });

      if (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      } else {
        results.success++;
      }

      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImporting(false);
    setImportResult(results);

    if (results.success > 0) {
      toast.success(`Imported ${results.success} assignments`);
      onComplete?.();
    }

    if (results.failed > 0) {
      toast.error(`${results.failed} rows failed to import`);
    }
  };

  const exportAssignments = async () => {
    setExporting(true);

    try {
      // @ts-ignore - Supabase type instantiation issue
      const { data: assignments } = await supabase
        .from("compliance_training_assignments")
        .select(`
          id, due_date, status, priority, completed_at, escalation_level,
          exemption_status, exemption_type,
          compliance:compliance_training(name),
          employee:profiles!compliance_training_assignments_employee_id_fkey(full_name, email)
        `)
        .order("due_date");

      if (!assignments || assignments.length === 0) {
        toast.error("No assignments to export");
        setExporting(false);
        return;
      }

      // Create CSV content
      const headers = [
        "Employee Name",
        "Employee Email",
        "Training Name",
        "Due Date",
        "Status",
        "Priority",
        "Completed At",
        "Escalation Level",
        "Exemption Status",
        "Exemption Type",
      ];

      const rows = assignments.map((a: any) => [
        a.employee?.full_name || "",
        a.employee?.email || "",
        a.compliance?.name || "",
        a.due_date,
        a.status,
        a.priority || "normal",
        a.completed_at || "",
        a.escalation_level || 0,
        a.exemption_status || "",
        a.exemption_type || "",
      ]);

      const csv = [headers.join(","), ...rows.map((r: any[]) => r.map((v) => `"${v}"`).join(","))].join("\n");

      // Download file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compliance-assignments-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${assignments.length} assignments`);
    } catch (error) {
      toast.error("Failed to export assignments");
    }

    setExporting(false);
  };

  const downloadTemplate = () => {
    const template = `employee_email,training_name,due_date,priority
john.doe@example.com,Safety Training,2024-03-01,high
jane.smith@example.com,Compliance 101,2024-03-15,normal`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "compliance-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Template downloaded");
  };

  const validCount = preview.filter((r) => r.status === "valid").length;
  const errorCount = preview.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Operations
          </CardTitle>
          <CardDescription>
            Import or export compliance training assignments in bulk using CSV files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Import Card */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Import Assignments</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV file to bulk create assignments
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Select CSV File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Card */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Download className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Export Assignments</h3>
                    <p className="text-sm text-muted-foreground">
                      Download all assignments as a CSV file
                    </p>
                  </div>
                  <Button onClick={exportAssignments} disabled={exporting}>
                    {exporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Card */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Download Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Get a sample CSV template for imports
                    </p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <FileText className="h-4 w-4 mr-2" />
                    Get Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Import Preview Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Import Preview
            </DialogTitle>
          </DialogHeader>

          {!importResult ? (
            <>
              <div className="flex gap-4 mb-4">
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validCount} Valid
                </Badge>
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  {errorCount} Errors
                </Badge>
                <Badge variant="secondary">
                  {preview.length} Total Rows
                </Badge>
              </div>

              {importing && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Importing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              <div className="border rounded-lg overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Employee Email</TableHead>
                      <TableHead>Training Name</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx} className={row.status === "error" ? "bg-red-50" : ""}>
                        <TableCell>
                          {row.status === "valid" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>{row.employee_email}</TableCell>
                        <TableCell>{row.training_name}</TableCell>
                        <TableCell>{row.due_date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-red-600">{row.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              {importResult.success > 0 && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-8 w-8" />
                  <span className="text-xl font-medium">{importResult.success} assignments imported</span>
                </div>
              )}
              {importResult.failed > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                    <span>{importResult.failed} rows failed</span>
                  </div>
                  <div className="max-h-40 overflow-auto text-left text-sm bg-red-50 p-4 rounded">
                    {importResult.errors.slice(0, 10).map((err, idx) => (
                      <p key={idx} className="text-red-600">{err}</p>
                    ))}
                    {importResult.errors.length > 10 && (
                      <p className="text-muted-foreground mt-2">
                        ... and {importResult.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {importResult ? "Close" : "Cancel"}
            </Button>
            {!importResult && (
              <Button onClick={processImport} disabled={importing || validCount === 0}>
                {importing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import {validCount} Assignments
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
