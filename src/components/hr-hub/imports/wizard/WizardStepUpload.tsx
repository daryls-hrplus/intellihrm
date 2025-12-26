import { useState, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { ImportDependencyChecker } from "../ImportDependencyChecker";

interface WizardStepUploadProps {
  importType: string;
  companyId?: string | null;
  file: File | null;
  validationResult: any;
  isValidating: boolean;
  onFileChange: (file: File | null) => void;
  onValidationComplete: (result: any, parsedData: any[]) => void;
  onValidationStart: () => void;
}

export function WizardStepUpload({
  importType,
  companyId,
  file,
  validationResult,
  isValidating,
  onFileChange,
  onValidationComplete,
  onValidationStart,
}: WizardStepUploadProps) {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [prerequisitesMet, setPrerequisitesMet] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Normalize CSV header to snake_case for consistent field matching
  const normalizeHeader = (header: string): string => {
    return header
      .trim()
      .replace(/^"|"$/g, "")           // Remove surrounding quotes
      .toLowerCase()                    // Convert to lowercase
      .replace(/\s+/g, "_")            // Spaces to underscores
      .replace(/-+/g, "_")             // Dashes to underscores
      .replace(/[^a-z0-9_]/g, "");     // Remove special chars
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    // Normalize headers to snake_case for consistent field matching
    const headers = lines[0].split(",").map(normalizeHeader);
    
    return lines.slice(1).map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.replace(/^"|"$/g, "") || "";
      });
      return row;
    });
  };

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    onFileChange(selectedFile);
    onValidationStart();
    setUploadProgress(0);

    try {
      // Read and parse file
      const text = await selectedFile.text();
      const parsedData = parseCSV(text);
      setUploadProgress(30);

      if (parsedData.length === 0) {
        toast.error("No data found in the CSV file");
        onValidationComplete({ error: "No data found" }, []);
        return;
      }

      setUploadProgress(50);

      // Call validation endpoint
      const { data, error } = await supabase.functions.invoke("validate-import-data", {
        body: {
          importType,
          data: parsedData,
          companyId,
        },
      });

      setUploadProgress(100);

      if (error) {
        console.error("Validation error:", error);
        toast.error("Validation failed");
        onValidationComplete({ error: error.message }, parsedData);
        return;
      }

      onValidationComplete(data, parsedData);

      if (data.errorCount === 0 && data.warningCount === 0) {
        toast.success("All validations passed!");
      } else if (data.errorCount > 0) {
        toast.warning(`Found ${data.errorCount} issues that need attention`);
      } else if (data.warningCount > 0) {
        toast.info("AI found some suggestions to review");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to process file");
      onValidationComplete({ error: error.message }, []);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [importType, companyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const renderValidationSummary = () => {
    if (!validationResult || validationResult.error) {
      return validationResult?.error ? (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>{validationResult.error}</AlertDescription>
        </Alert>
      ) : null;
    }

    const { totalRows, validRows, errorCount, warningCount, issues, aiInsights } = validationResult;
    
    // Split issues by severity
    const errorIssues = issues?.filter((i: any) => i.severity === 'error') || [];
    const warningIssues = issues?.filter((i: any) => i.severity === 'warning') || [];

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{totalRows || 0}</p>
              <p className="text-xs text-muted-foreground">Total Rows</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{validRows || 0}</p>
              <p className="text-xs text-muted-foreground">Valid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-destructive">{errorCount || 0}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{warningCount || 0}</p>
              <p className="text-xs text-muted-foreground">AI Warnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        {errorCount === 0 && warningCount === 0 ? (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">Validation Passed</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              All {totalRows} rows are valid and ready for import.
            </AlertDescription>
          </Alert>
        ) : errorCount > 0 ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Validation Issues Found</AlertTitle>
            <AlertDescription>
              {errorCount} row(s) have errors that must be fixed before import.
            </AlertDescription>
          </Alert>
        ) : warningCount > 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>AI Suggestions</AlertTitle>
            <AlertDescription>
              {warningCount} potential issues found. Review before importing.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* AI Insights */}
        {aiInsights?.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Insights
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {aiInsights.map((insight: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Issue Details */}
        {(errorIssues.length > 0 || warningIssues.length > 0) && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Issues Detected</h4>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {errorIssues.slice(0, 10).map((issue: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 bg-destructive/10 rounded">
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Row {issue.row}</span>
                        <span className="mx-2">·</span>
                        <code className="text-xs bg-muted px-1">{issue.field}</code>
                        <span className="mx-2">·</span>
                        <span className="text-muted-foreground">{issue.message || issue.issue}</span>
                        {issue.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {warningIssues.slice(0, 5).map((issue: any, i: number) => (
                    <div key={`ai-${i}`} className="flex items-start gap-2 text-sm p-2 bg-yellow-500/10 rounded">
                      <Sparkles className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Row {issue.row}</span>
                        <span className="mx-2">·</span>
                        <span className="text-muted-foreground">{issue.message || issue.issue}</span>
                        {issue.suggestion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1">Upload & Validate</h2>
        <p className="text-muted-foreground">
          Upload your prepared CSV file for validation
        </p>
      </div>

      {/* Dependency Checker */}
      <ImportDependencyChecker
        importType={importType}
        companyId={companyId || undefined}
        onPrerequisitesChecked={setPrerequisitesMet}
      />

      {/* Upload Area */}
      {prerequisitesMet && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${isValidating ? "pointer-events-none opacity-50" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isValidating ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
              <p className="text-muted-foreground">Validating your data...</p>
              <Progress value={uploadProgress} className="max-w-xs mx-auto" />
            </div>
          ) : file ? (
            <div className="space-y-4">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFileChange(null);
                  onValidationComplete(null, []);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Choose Different File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Validation Results */}
      {validationResult && !isValidating && renderValidationSummary()}
    </div>
  );
}
