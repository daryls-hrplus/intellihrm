import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, RotateCcw, Loader2, FileSpreadsheet, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ImportBatch {
  id: string;
  import_type: string;
  file_name: string;
  total_records: number;
  successful_records: number;
  status: string;
  imported_record_ids: any;
  created_at: string;
  committed_at: string | null;
}

interface ImportRollbackProps {
  batch: ImportBatch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRollbackComplete: () => void;
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

const IMPORT_TYPE_TABLES: Record<string, string> = {
  companies: "companies",
  divisions: "divisions",
  departments: "departments",
  sections: "sections",
  jobs: "jobs",
  job_families: "job_families",
  positions: "positions",
  employees: "profiles",
  new_hires: "profiles",
};

export function ImportRollback({ batch, open, onOpenChange, onRollbackComplete }: ImportRollbackProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const recordIds = Array.isArray(batch.imported_record_ids) 
    ? batch.imported_record_ids 
    : [];
  const recordCount = recordIds.length || batch.successful_records;
  const tableName = IMPORT_TYPE_TABLES[batch.import_type];

  const handleRollback = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the rollback");
      return;
    }

    if (!confirmed) {
      toast.error("Please confirm you understand the rollback action");
      return;
    }

    setIsRollingBack(true);

    try {
      // Call the rollback edge function
      const { data, error } = await supabase.functions.invoke("rollback-import", {
        body: {
          batchId: batch.id,
          reason: reason.trim(),
          userId: user?.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Successfully rolled back ${data.deletedCount || recordCount} records`);
        onRollbackComplete();
      } else {
        throw new Error(data?.error || "Rollback failed");
      }
    } catch (error: any) {
      console.error("Rollback error:", error);
      toast.error(error.message || "Failed to rollback import");
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <RotateCcw className="h-5 w-5" />
            Rollback Import
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the records created by this import.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Import Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{batch.file_name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {IMPORT_TYPE_LABELS[batch.import_type] || batch.import_type}
                </Badge>
                <Badge variant="secondary">
                  {recordCount} records
                </Badge>
                {batch.committed_at && (
                  <Badge variant="secondary">
                    Imported: {format(new Date(batch.committed_at), "MMM d, yyyy")}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: Irreversible Action</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Rolling back this import will permanently delete <strong>{recordCount} {IMPORT_TYPE_LABELS[batch.import_type]?.toLowerCase()}</strong> from the database.
              </p>
              {batch.import_type === "departments" && (
                <p className="text-sm">
                  Note: Deleting departments may affect linked sections, positions, and employees.
                </p>
              )}
              {batch.import_type === "positions" && (
                <p className="text-sm">
                  Note: Deleting positions may affect employee assignments.
                </p>
              )}
            </AlertDescription>
          </Alert>

          {/* Rollback Reason */}
          <div className="space-y-2">
            <Label htmlFor="rollback-reason" className="text-sm font-medium">
              Reason for Rollback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rollback-reason"
              placeholder="Please explain why you're rolling back this import..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="confirm-rollback"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <label
              htmlFor="confirm-rollback"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              I understand that this action cannot be undone and will permanently delete the imported records.
            </label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRollingBack}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRollback}
            disabled={!reason.trim() || !confirmed || isRollingBack}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRollingBack ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rolling Back...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Rollback {recordCount} Records
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
