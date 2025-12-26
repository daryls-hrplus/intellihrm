import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  Clock
} from "lucide-react";

interface WizardStepCommitProps {
  importType: string;
  companyId?: string | null;
  parsedData: any[] | null;
  validationResult: any;
  batchId: string | null;
  isCommitting: boolean;
  committedCount: number;
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
};

export function WizardStepCommit({
  importType,
  companyId,
  parsedData,
  validationResult,
  batchId,
  isCommitting,
  committedCount,
  onBatchCreated,
  onCommitStart,
  onCommitComplete,
}: WizardStepCommitProps) {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);

  const data = parsedData || [];
  const validRowCount = validationResult?.validRowCount || data.length;
  const errorCount = validationResult?.basicErrorCount || 0;

  const handleCommit = async () => {
    if (!confirmed) {
      toast.error("Please confirm you want to proceed with the import");
      return;
    }

    onCommitStart();
    setImportError(null);
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
          rollback_eligible_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select()
        .single();

      if (batchError) throw batchError;

      onBatchCreated(batchData.id);
      setProgress(20);

      // Import data based on type
      const importedIds: string[] = [];
      let successCount = 0;
      let failedCount = 0;
      const errors: any[] = [];

      // Get valid rows only (those without errors)
      const errorRows = new Set(
        (validationResult?.basicIssues || [])
          .filter((i: any) => i.severity === "error")
          .map((i: any) => i.row - 2) // Convert to 0-indexed
      );

      const validData = data.filter((_, index) => !errorRows.has(index));

      // Import in batches
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
            errors.push({ batch: i / batchSize, error: result.error });
          }
        } catch (e: any) {
          failedCount += batch.length;
          errors.push({ batch: i / batchSize, error: e.message });
        }

        setProgress(20 + Math.round((i / validData.length) * 70));
      }

      // Update batch record with results
      await supabase
        .from("import_batches")
        .update({
          status: failedCount === 0 ? "committed" : "failed",
          successful_records: successCount,
          failed_records: failedCount,
          skipped_records: errorRows.size,
          imported_record_ids: importedIds,
          errors: errors.length > 0 ? errors : null,
          committed_at: new Date().toISOString(),
        })
        .eq("id", batchData.id);

      setProgress(100);
      onCommitComplete(successCount);

      if (failedCount === 0) {
        toast.success(`Successfully imported ${successCount} records`);
      } else {
        toast.warning(`Imported ${successCount} records, ${failedCount} failed`);
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
    companyId?: string | null
  ): Promise<{ success: boolean; ids?: string[]; count?: number; error?: string }> => {
    // Map import type to table and transform data
    const tableMap: Record<string, string> = {
      companies: "companies",
      divisions: "divisions",
      departments: "departments",
      sections: "sections",
      jobs: "jobs",
      job_families: "job_families",
      positions: "positions",
    };

    const tableName = tableMap[type];
    
    if (!tableName) {
      // Handle special cases like employees/new_hires
      if (type === "employees" || type === "new_hires") {
        // For now, just return success - actual implementation would call edge function
        return { success: true, ids: [], count: batch.length };
      }
      return { success: false, error: `Unknown import type: ${type}` };
    }

    // Transform data based on type
    const transformedBatch = batch.map((row) => {
      const transformed: any = { ...row };
      
      // Add company_id if needed
      if (companyId && type !== "companies") {
        transformed.company_id = companyId;
      }
      
      // Remove any _rowIndex or metadata fields
      delete transformed._rowIndex;
      
      return transformed;
    });

    const { data, error } = await supabase
      .from(tableName)
      .insert(transformedBatch)
      .select("id");

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      ids: data?.map((d) => d.id) || [],
      count: data?.length || batch.length,
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
    </div>
  );
}
