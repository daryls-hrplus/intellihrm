import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Database,
  Shield,
  Clock,
  Download,
  FileWarning
} from "lucide-react";
import { transformPositionsData, generateFailureReport } from "./positionsTransformer";
import { transformSalaryGradesData, generateSalaryGradesFailureReport } from "./salaryGradesTransformer";
import { transformPaySpinesData, generatePaySpinesFailureReport } from "./paySpinesTransformer";
import { transformSpinalPointsData, generateSpinalPointsFailureReport } from "./spinalPointsTransformer";
import { CompensationModel } from "./WizardStepCompensationModel";

interface WizardStepCommitProps {
  importType: string;
  companyId?: string | null;
  parsedData: any[] | null;
  validationResult: any;
  batchId: string | null;
  isCommitting: boolean;
  committedCount: number;
  compensationModel?: CompensationModel | null;
  onBatchCreated: (batchId: string) => void;
  onCommitStart: () => void;
  onCommitComplete: (count: number) => void;
}

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
  salary_grades: "Salary Grades",
  pay_spines: "Pay Spines",
  spinal_points: "Spinal Points",
};

interface ImportFailure {
  rowIndex: number;
  row: any;
  error: string;
}

export function WizardStepCommit({
  importType,
  companyId,
  parsedData,
  validationResult,
  batchId,
  isCommitting,
  committedCount,
  compensationModel,
  onBatchCreated,
  onCommitStart,
  onCommitComplete,
}: WizardStepCommitProps) {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importFailures, setImportFailures] = useState<ImportFailure[]>([]);
  const [importWarnings, setImportWarnings] = useState<Array<{ rowIndex: number; field: string; message: string }>>([]);

  const data = parsedData || [];
  // Fix: Use correct property names from validation result
  const validRowCount = validationResult?.validRows ?? validationResult?.validRowCount ?? data.length;
  const errorCount = validationResult?.errorCount ?? validationResult?.basicErrorCount ?? 0;
  const issues = validationResult?.issues ?? validationResult?.basicIssues ?? [];

  const downloadFailureReport = () => {
    const report = generateFailureReport(importFailures, importWarnings);
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${importType}_import_failures_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Failure report downloaded");
  };

  const handleCommit = async () => {
    if (!confirmed) {
      toast.error("Please confirm you want to proceed with the import");
      return;
    }

    onCommitStart();
    setImportError(null);
    setImportFailures([]);
    setImportWarnings([]);
    setProgress(0);

    try {
      // Create import batch record
      const { data: batchData, error: batchError } = await supabase
        .from("import_batches")
        .insert({
          company_id: companyId,
          import_type: importType,
          file_name: `${importType}_import_${new Date().toISOString().slice(0, 10)}.csv`,
          total_records: data.length,
          status: "staging",
          staging_data: data,
          validation_result: validationResult,
          imported_by: user?.id,
          validated_at: new Date().toISOString(),
          rollback_eligible_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (batchError) throw batchError;

      onBatchCreated(batchData.id);
      setProgress(20);

      // Get valid rows only (those without errors from validation)
      const errorRows = new Set(
        (issues)
          .filter((i: any) => i.severity === "error")
          .map((i: any) => i.row - 2)
      );

      const validData = data.filter((_, index) => !errorRows.has(index));
      
      let successCount = 0;
      let failedCount = 0;
      const allErrors: ImportFailure[] = [];
      const allWarnings: Array<{ rowIndex: number; field: string; message: string }> = [];
      const importedIds: string[] = [];

      // Use specialized transformers based on import type
      if (importType === "positions") {
        setProgress(30);
        const transformResult = await transformPositionsData(validData, companyId);
        
        allErrors.push(...transformResult.errors);
        allWarnings.push(...transformResult.warnings);
        failedCount = transformResult.errors.length;
        
        setProgress(50);

        if (transformResult.transformed.length > 0) {
          const batchSize = 50;
          for (let i = 0; i < transformResult.transformed.length; i += batchSize) {
            const batch = transformResult.transformed.slice(i, i + batchSize);
            
            const { data: insertData, error: insertError } = await supabase
              .from("positions")
              .insert(batch)
              .select("id");

            if (insertError) {
              batch.forEach((_, idx) => {
                allErrors.push({ rowIndex: i + idx, row: validData[i + idx], error: insertError.message });
              });
              failedCount += batch.length;
            } else {
              successCount += batch.length;
              importedIds.push(...(insertData?.map((d) => d.id) || []));
            }
            setProgress(50 + Math.round((i / transformResult.transformed.length) * 40));
          }
        }
      } else if (importType === "salary_grades") {
        setProgress(30);
        const transformResult = await transformSalaryGradesData(validData, companyId);
        allErrors.push(...transformResult.errors);
        allWarnings.push(...transformResult.warnings);
        failedCount = transformResult.errors.length;
        setProgress(50);

        if (transformResult.transformed.length > 0) {
          const { data: insertData, error: insertError } = await supabase
            .from("salary_grades")
            .insert(transformResult.transformed)
            .select("id");

          if (insertError) {
            allErrors.push({ rowIndex: 0, row: {}, error: insertError.message });
            failedCount = transformResult.transformed.length;
          } else {
            successCount = transformResult.transformed.length;
            importedIds.push(...(insertData?.map((d) => d.id) || []));
          }
        }
        setProgress(90);
      } else if (importType === "pay_spines") {
        setProgress(30);
        const transformResult = await transformPaySpinesData(validData, companyId);
        allErrors.push(...transformResult.errors);
        allWarnings.push(...transformResult.warnings);
        failedCount = transformResult.errors.length;
        setProgress(50);

        if (transformResult.transformed.length > 0) {
          const { data: insertData, error: insertError } = await supabase
            .from("pay_spines")
            .insert(transformResult.transformed)
            .select("id");

          if (insertError) {
            allErrors.push({ rowIndex: 0, row: {}, error: insertError.message });
            failedCount = transformResult.transformed.length;
          } else {
            successCount = transformResult.transformed.length;
            importedIds.push(...(insertData?.map((d) => d.id) || []));
          }
        }
        setProgress(90);
      } else if (importType === "spinal_points") {
        setProgress(30);
        const transformResult = await transformSpinalPointsData(validData, companyId);
        allErrors.push(...transformResult.errors);
        allWarnings.push(...transformResult.warnings);
        failedCount = transformResult.errors.length;
        setProgress(50);

        if (transformResult.transformed.length > 0) {
          const { data: insertData, error: insertError } = await supabase
            .from("spinal_points")
            .insert(transformResult.transformed)
            .select("id");

          if (insertError) {
            allErrors.push({ rowIndex: 0, row: {}, error: insertError.message });
            failedCount = transformResult.transformed.length;
          } else {
            successCount = transformResult.transformed.length;
            importedIds.push(...(insertData?.map((d) => d.id) || []));
          }
        }
        setProgress(90);
      } else {
        // Original logic for other import types
        const batchSize = 50;
        for (let i = 0; i < validData.length; i += batchSize) {
          const batch = validData.slice(i, i + batchSize);
          
          try {
            const result = await importBatch(importType, batch, companyId);
            
            if (result.success) {
              importedIds.push(...(result.ids || []));
              successCount += result.count || batch.length;
            } else {
              failedCount += batch.length;
              batch.forEach((row, idx) => {
                allErrors.push({ rowIndex: i + idx, row, error: result.error || "Unknown error" });
              });
            }
          } catch (e: any) {
            failedCount += batch.length;
            batch.forEach((row, idx) => {
              allErrors.push({ rowIndex: i + idx, row, error: e.message });
            });
          }

          setProgress(20 + Math.round((i / validData.length) * 70));
        }
      }

      setImportFailures(allErrors);
      setImportWarnings(allWarnings);

      // Update batch record with results
      await supabase
        .from("import_batches")
        .update({
          status: failedCount === 0 && successCount > 0 ? "committed" : failedCount > 0 && successCount === 0 ? "failed" : "partial",
          successful_records: successCount,
          failed_records: failedCount,
          skipped_records: errorRows.size,
          imported_record_ids: importedIds,
          errors: allErrors.length > 0 ? JSON.parse(JSON.stringify(allErrors)) : null,
          committed_at: new Date().toISOString(),
        })
        .eq("id", batchData.id);

      setProgress(100);
      onCommitComplete(successCount);

      if (failedCount === 0 && successCount > 0) {
        toast.success(`Successfully imported ${successCount} records`);
      } else if (successCount > 0 && failedCount > 0) {
        toast.warning(`Imported ${successCount} records, ${failedCount} failed`);
      } else if (successCount === 0) {
        setImportError(`All ${failedCount} records failed to import. See details below.`);
        toast.error("Import failed - no records were imported");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      setImportError(error.message);
      toast.error(error.message || "Import failed");
      onCommitComplete(0);
    }
  };

  const importBatch = async (
    type: string,
    batch: any[],
    companyIdParam?: string | null
  ): Promise<{ success: boolean; ids?: string[]; count?: number; error?: string }> => {
    const tableMap: Record<string, string> = {
      companies: "companies",
      divisions: "divisions",
      departments: "departments",
      sections: "sections",
      jobs: "jobs",
      job_families: "job_families",
    };

    const tableName = tableMap[type];
    
    if (!tableName) {
      if (type === "employees" || type === "new_hires") {
        return { success: true, ids: [], count: batch.length };
      }
      return { success: false, error: `Unknown import type: ${type}` };
    }

    const transformedBatch = batch.map((row) => {
      const transformed: any = { ...row };
      
      if (companyIdParam && type !== "companies") {
        transformed.company_id = companyIdParam;
      }
      
      delete transformed._rowIndex;
      delete transformed._id;
      
      return transformed;
    });

    const { data: insertData, error } = await (supabase
      .from(tableName as any)
      .insert(transformedBatch)
      .select("id") as any);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      ids: insertData?.map((d: any) => d.id) || [],
      count: batch.length,
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1">Commit Import</h2>
        <p className="text-muted-foreground">
          Review the summary and confirm to import your data
        </p>
      </div>

      {/* Import Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import Summary
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Import Type</p>
              <p className="text-lg font-semibold">{IMPORT_TYPE_LABELS[importType]}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Records to Import</p>
              <p className="text-lg font-semibold text-green-600">{validRowCount}</p>
            </div>
          </div>

          {errorCount > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorCount} row(s) with errors will be skipped
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Data will be validated before insertion</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Rollback available for 30 days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation */}
      {!isCommitting && committedCount === 0 && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="confirm-import"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <label htmlFor="confirm-import" className="text-sm cursor-pointer">
              I understand that this will create {validRowCount} new {IMPORT_TYPE_LABELS[importType]?.toLowerCase()} records in the database.
              This action can be rolled back within 30 days if needed.
            </label>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleCommit}
            disabled={!confirmed}
          >
            <Upload className="h-5 w-5 mr-2" />
            Import {validRowCount} Records
          </Button>
        </div>
      )}

      {/* Progress */}
      {isCommitting && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <p className="font-medium mb-2">Importing data...</p>
            <Progress value={progress} className="max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {committedCount > 0 && !isCommitting && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Import Successful!</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Successfully imported {committedCount} {IMPORT_TYPE_LABELS[importType]?.toLowerCase()} records.
            Click "Complete Import" to finish.
          </AlertDescription>
        </Alert>
      )}

      {/* Error */}
      {importError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      {/* Detailed Failure Report */}
      {importFailures.length > 0 && !isCommitting && (
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2 text-destructive">
                <FileWarning className="h-5 w-5" />
                Import Failures ({importFailures.length} rows)
              </h3>
              <Button variant="outline" size="sm" onClick={downloadFailureReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {importFailures.slice(0, 10).map((failure, idx) => (
                <div key={idx} className="p-3 bg-destructive/10 rounded-lg text-sm">
                  <div className="font-medium">
                    Row {failure.rowIndex + 2}: {failure.row?.position_code || failure.row?.code || "Unknown"}
                  </div>
                  <div className="text-destructive mt-1">{failure.error}</div>
                </div>
              ))}
              {importFailures.length > 10 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  ... and {importFailures.length - 10} more failures. Download the report for full details.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {importWarnings.length > 0 && !isCommitting && (
        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">Warnings ({importWarnings.length})</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            <ul className="list-disc list-inside mt-2 space-y-1">
              {importWarnings.slice(0, 5).map((w, idx) => (
                <li key={idx}>Row {w.rowIndex + 2}: {w.message}</li>
              ))}
              {importWarnings.length > 5 && (
                <li>... and {importWarnings.length - 5} more warnings</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
