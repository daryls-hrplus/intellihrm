import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  Loader2
} from "lucide-react";

interface ParsedRow {
  position_code: string;
  reports_to_position_code: string;
  rowIndex: number;
}

interface ValidationResult extends ParsedRow {
  positionId: string | null;
  positionTitle: string | null;
  currentSupervisorTitle: string | null;
  newSupervisorId: string | null;
  newSupervisorTitle: string | null;
  status: "valid" | "error" | "warning";
  message: string;
}

export function BulkReportingLineUpdate() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);

  const downloadTemplate = () => {
    const template = `position_code,reports_to_position_code
HR-COORD-001,HR-MGR-001
ACCT-CLERK-001,ACCT-MGR-001`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporting_line_update_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.trim().split("\n");
    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    
    const posCodeIdx = headers.indexOf("position_code");
    const reportsToIdx = headers.indexOf("reports_to_position_code");
    
    if (posCodeIdx === -1 || reportsToIdx === -1) {
      throw new Error("CSV must have 'position_code' and 'reports_to_position_code' columns");
    }
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, idx) => {
        const values = line.split(",").map(v => v.trim());
        return {
          position_code: values[posCodeIdx] || "",
          reports_to_position_code: values[reportsToIdx] || "",
          rowIndex: idx + 2
        };
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setValidationResults([]);
    setUpdateComplete(false);
    
    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      
      if (parsed.length === 0) {
        toast({
          title: "Empty File",
          description: "The CSV file contains no data rows.",
          variant: "destructive"
        });
        return;
      }
      
      // Auto-validate after parsing
      await validateData(parsed);
    } catch (error) {
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive"
      });
    }
  };

  const validateData = async (data: ParsedRow[]) => {
    if (!profile?.company_id) {
      toast({
        title: "No Company",
        description: "Please ensure you are associated with a company.",
        variant: "destructive"
      });
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Fetch all positions for this company
      const { data: positions, error } = await supabase
        .from("positions")
        .select("id, code, title, reports_to_position_id")
        .eq("company_id", profile.company_id);
      
      if (error) throw error;
      
      const positionsByCode = new Map(positions?.map(p => [p.code?.toLowerCase(), p]) || []);
      const positionsById = new Map(positions?.map(p => [p.id, p]) || []);
      
      const results: ValidationResult[] = data.map(row => {
        const position = positionsByCode.get(row.position_code.toLowerCase());
        const newSupervisor = row.reports_to_position_code 
          ? positionsByCode.get(row.reports_to_position_code.toLowerCase())
          : null;
        
        // Get current supervisor title
        let currentSupervisorTitle: string | null = null;
        if (position?.reports_to_position_id) {
          const currentSup = positionsById.get(position.reports_to_position_id);
          currentSupervisorTitle = currentSup?.title || null;
        }
        
        // Validation checks
        if (!position) {
          return {
            ...row,
            positionId: null,
            positionTitle: null,
            currentSupervisorTitle: null,
            newSupervisorId: null,
            newSupervisorTitle: null,
            status: "error" as const,
            message: "Position code not found"
          };
        }
        
        if (row.reports_to_position_code && !newSupervisor) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            currentSupervisorTitle,
            newSupervisorId: null,
            newSupervisorTitle: null,
            status: "error" as const,
            message: "Reports-to position code not found"
          };
        }
        
        // Check for self-reference
        if (newSupervisor && position.id === newSupervisor.id) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            currentSupervisorTitle,
            newSupervisorId: null,
            newSupervisorTitle: null,
            status: "error" as const,
            message: "Position cannot report to itself"
          };
        }
        
        // Warning if clearing supervisor
        if (!row.reports_to_position_code && position.reports_to_position_id) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            currentSupervisorTitle,
            newSupervisorId: null,
            newSupervisorTitle: "(None)",
            status: "warning" as const,
            message: "This will clear the existing supervisor"
          };
        }
        
        return {
          ...row,
          positionId: position.id,
          positionTitle: position.title,
          currentSupervisorTitle,
          newSupervisorId: newSupervisor?.id || null,
          newSupervisorTitle: newSupervisor?.title || "(None)",
          status: "valid" as const,
          message: "Ready to update"
        };
      });
      
      setValidationResults(results);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Failed to validate data",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const executeUpdate = async () => {
    const validRows = validationResults.filter(r => r.status !== "error" && r.positionId);
    
    if (validRows.length === 0) {
      toast({
        title: "No Valid Rows",
        description: "There are no valid rows to update.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const row of validRows) {
        const { error } = await supabase
          .from("positions")
          .update({ reports_to_position_id: row.newSupervisorId })
          .eq("id", row.positionId!);
        
        if (error) {
          errorCount++;
          console.error(`Failed to update ${row.position_code}:`, error);
        } else {
          successCount++;
        }
      }
      
      setUpdateComplete(true);
      
      toast({
        title: "Update Complete",
        description: `Successfully updated ${successCount} position(s).${errorCount > 0 ? ` ${errorCount} failed.` : ""}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Update Error",
        description: error instanceof Error ? error.message : "Failed to update positions",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setValidationResults([]);
    setUpdateComplete(false);
  };

  const validCount = validationResults.filter(r => r.status === "valid").length;
  const warningCount = validationResults.filter(r => r.status === "warning").length;
  const errorCount = validationResults.filter(r => r.status === "error").length;
  const updateableCount = validCount + warningCount;

  const getStatusIcon = (status: ValidationResult["status"]) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getRowClass = (status: ValidationResult["status"]) => {
    switch (status) {
      case "valid":
        return "bg-green-50 dark:bg-green-950/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/20";
      case "error":
        return "bg-red-50 dark:bg-red-950/20";
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Use this feature to bulk-update reporting relationships for existing positions. 
          Upload a CSV with position codes and their new supervisor position codes.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Update Reporting Lines
          </CardTitle>
          <CardDescription>
            Bulk update which positions report to which supervisors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Download Template */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Step 1: Download Template</h4>
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download CSV Template
            </Button>
            <p className="text-xs text-muted-foreground">
              The template includes columns for position_code and reports_to_position_code
            </p>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Step 2: Upload Your File</h4>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isValidating || isUpdating}
                className="max-w-md"
              />
              {file && (
                <Badge variant="secondary">{file.name}</Badge>
              )}
            </div>
          </div>

          {/* Validation Progress */}
          {isValidating && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating positions...
            </div>
          )}

          {/* Validation Results */}
          {validationResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h4 className="font-medium text-sm">Step 3: Review & Confirm</h4>
                <div className="flex gap-2">
                  {validCount > 0 && (
                    <Badge variant="default" className="bg-green-600">
                      {validCount} Valid
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                      {warningCount} Warnings
                    </Badge>
                  )}
                  {errorCount > 0 && (
                    <Badge variant="destructive">
                      {errorCount} Errors
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>Position Code</TableHead>
                      <TableHead>Position Title</TableHead>
                      <TableHead>Current Supervisor</TableHead>
                      <TableHead>New Supervisor</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.map((result, idx) => (
                      <TableRow key={idx} className={getRowClass(result.status)}>
                        <TableCell>{getStatusIcon(result.status)}</TableCell>
                        <TableCell className="font-mono text-sm">{result.position_code}</TableCell>
                        <TableCell>{result.positionTitle || "-"}</TableCell>
                        <TableCell>{result.currentSupervisorTitle || "(None)"}</TableCell>
                        <TableCell>{result.newSupervisorTitle || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{result.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {!updateComplete ? (
                  <>
                    <Button
                      onClick={executeUpdate}
                      disabled={updateableCount === 0 || isUpdating}
                      className="gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Update {updateableCount} Position{updateableCount !== 1 ? "s" : ""}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetForm} disabled={isUpdating}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={resetForm} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Start New Update
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
