import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ValidationIssue {
  row: number;
  field: string;
  value: string;
  issue: string;
  severity: "error" | "warning" | "info";
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
}

interface ImportValidationReportProps {
  result: ValidationResult | null;
  importType: string;
  isValidating: boolean;
  onDownloadReport: () => void;
}

export function ImportValidationReport({
  result,
  importType,
  isValidating,
  onDownloadReport,
}: ImportValidationReportProps) {
  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">AI is analyzing your import file...</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-sm text-muted-foreground">Total Rows</p>
          <p className="text-2xl font-bold">{result.totalRows}</p>
        </div>
        <div className="p-4 rounded-lg border bg-success/10">
          <p className="text-sm text-muted-foreground">Valid Rows</p>
          <p className="text-2xl font-bold text-success">{result.validRows}</p>
        </div>
        <div className="p-4 rounded-lg border bg-destructive/10">
          <p className="text-sm text-muted-foreground">Errors</p>
          <p className="text-2xl font-bold text-destructive">{result.errorCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-warning/10">
          <p className="text-sm text-muted-foreground">Warnings</p>
          <p className="text-2xl font-bold text-warning">{result.warningCount}</p>
        </div>
      </div>

      {/* Status Banner */}
      {result.isValid ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <p className="font-medium text-success">Ready for Import</p>
            <p className="text-sm text-muted-foreground">
              All rows passed validation. You can proceed with the import.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Issues Found</p>
              <p className="text-sm text-muted-foreground">
                Please resolve the issues below before importing.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      )}

      {/* Issues Table */}
      {result.issues.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Validation Issues</h3>
          <ScrollArea className="h-[300px] rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead className="w-24">Severity</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Suggestion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.issues.map((issue, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{issue.row}</TableCell>
                    <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                    <TableCell className="font-medium">{issue.field}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={issue.value}>
                      {issue.value || <span className="text-muted-foreground italic">empty</span>}
                    </TableCell>
                    <TableCell>{issue.issue}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {issue.suggestion || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
