import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  FileSpreadsheet,
  Target,
} from "lucide-react";
import { getTodayString } from "@/utils/dateUtils";

interface BulkCompetencyImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onImportComplete: () => void;
}

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
  isValid: boolean;
}

interface TemplateField {
  name: string;
  required: boolean;
  description: string;
  example: string;
  allowedValues?: string[];
}

const TEMPLATE_CONFIG = {
  headers: [
    "code",
    "name", 
    "description",
    "category",
    "status",
    "effective_from",
    "effective_to",
    "owner_role",
    "external_id",
  ],
  fields: [
    { name: "code", required: true, description: "Unique competency code (e.g., CMP_LEADERSHIP)", example: "CMP_LEADERSHIP" },
    { name: "name", required: true, description: "Display name of the competency", example: "Leadership" },
    { name: "description", required: false, description: "Full description of the competency", example: "Ability to lead and motivate teams" },
    { name: "category", required: true, description: "Category classification", example: "leadership", allowedValues: ["technical", "functional", "behavioral", "leadership", "core"] },
    { name: "status", required: false, description: "Status (defaults to draft)", example: "active", allowedValues: ["draft", "pending_approval", "active", "deprecated"] },
    { name: "effective_from", required: false, description: "Start date (YYYY-MM-DD), defaults to today", example: "2024-01-01" },
    { name: "effective_to", required: false, description: "End date (leave empty if ongoing)", example: "" },
    { name: "owner_role", required: false, description: "Owner role (defaults to HR)", example: "HR", allowedValues: ["HR", "COE", "Admin"] },
    { name: "external_id", required: false, description: "External reference (ESCO/O*NET)", example: "ESCO:1234" },
  ] as TemplateField[],
  examples: [
    ["CMP_LEADERSHIP", "Leadership", "Ability to lead and motivate teams towards goals", "leadership", "active", "2024-01-01", "", "HR", ""],
    ["CMP_COMMUNICATION", "Communication", "Clear and effective written and verbal communication", "behavioral", "active", "2024-01-01", "", "HR", "ESCO:1.1"],
    ["CMP_PROBLEM_SOLVING", "Problem Solving", "Analytical thinking and creative problem resolution", "core", "active", "2024-01-01", "", "COE", ""],
    ["CMP_TEAMWORK", "Teamwork", "Collaborative work in diverse team settings", "behavioral", "draft", "2024-01-01", "", "HR", ""],
  ],
  tips: [
    "Codes must be unique - duplicates will be skipped with an error",
    "Category must be one of: technical, functional, behavioral, leadership, core",
    "Status defaults to 'draft' if not specified",
    "Use consistent naming conventions (e.g., CMP_ prefix for competencies)",
    "External IDs can reference ESCO or O*NET taxonomies",
    "Leave effective_to empty for competencies that don't expire",
  ],
};

export function BulkCompetencyImport({
  open,
  onOpenChange,
  companyId,
  onImportComplete,
}: BulkCompetencyImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fieldSpecsOpen, setFieldSpecsOpen] = useState(true);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const downloadTemplate = () => {
    const csvContent = [
      TEMPLATE_CONFIG.headers.join(","),
      ...TEMPLATE_CONFIG.examples.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "competency_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully");
  };

  const downloadExistingCompetencies = async () => {
    try {
      const { data, error } = await supabase
        .from("skills_competencies")
        .select("code, name, category, status")
        .eq("type", "COMPETENCY")
        .order("code");

      if (error) throw error;

      const csvContent = [
        "code,name,category,status",
        ...(data || []).map((c) =>
          `"${c.code}","${c.name}","${c.category}","${c.status}"`
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "existing_competencies_reference.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Existing competencies downloaded");
    } catch (error) {
      toast.error("Failed to download reference data");
    }
  };

  const parseCSV = (content: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !inQuotes) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
        if (char === "\r") i++;
      } else {
        currentCell += char;
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell)) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  const validateRow = async (
    data: Record<string, string>,
    existingCodes: Set<string>
  ): Promise<string[]> => {
    const errors: string[] = [];

    // Required fields
    if (!data.code?.trim()) errors.push("Code is required");
    if (!data.name?.trim()) errors.push("Name is required");
    if (!data.category?.trim()) errors.push("Category is required");

    // Check for duplicate code
    if (data.code && existingCodes.has(data.code.toUpperCase())) {
      errors.push(`Code "${data.code}" already exists`);
    }

    // Validate category
    const validCategories = ["technical", "functional", "behavioral", "leadership", "core"];
    if (data.category && !validCategories.includes(data.category.toLowerCase())) {
      errors.push(`Invalid category: ${data.category}. Must be one of: ${validCategories.join(", ")}`);
    }

    // Validate status
    const validStatuses = ["draft", "pending_approval", "active", "deprecated"];
    if (data.status && !validStatuses.includes(data.status.toLowerCase())) {
      errors.push(`Invalid status: ${data.status}. Must be one of: ${validStatuses.join(", ")}`);
    }

    // Validate owner_role
    const validRoles = ["HR", "COE", "Admin"];
    if (data.owner_role && !validRoles.includes(data.owner_role)) {
      errors.push(`Invalid owner_role: ${data.owner_role}. Must be one of: ${validRoles.join(", ")}`);
    }

    // Validate dates
    if (data.effective_from && isNaN(Date.parse(data.effective_from))) {
      errors.push("Invalid effective_from date format (use YYYY-MM-DD)");
    }
    if (data.effective_to && isNaN(Date.parse(data.effective_to))) {
      errors.push("Invalid effective_to date format (use YYYY-MM-DD)");
    }

    return errors;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);
    setIsParsing(true);

    try {
      const content = await selectedFile.text();
      const rows = parseCSV(content);

      if (rows.length < 2) {
        toast.error("File must contain headers and at least one data row");
        setParsedData([]);
        return;
      }

      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      // Fetch existing codes
      const { data: existingData } = await supabase
        .from("skills_competencies")
        .select("code")
        .eq("type", "COMPETENCY");
      
      const existingCodes = new Set(
        (existingData || []).map((d) => d.code.toUpperCase())
      );

      // Track codes being imported to catch duplicates in the file
      const importingCodes = new Set<string>();

      const parsed: ParsedRow[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const data: Record<string, string> = {};

        headers.forEach((header, index) => {
          data[header] = row[index] || "";
        });

        // Check for duplicate within file
        const code = data.code?.toUpperCase();
        if (code && importingCodes.has(code)) {
          parsed.push({
            rowNumber: i + 2,
            data,
            errors: [`Duplicate code in file: ${data.code}`],
            isValid: false,
          });
          continue;
        }
        if (code) importingCodes.add(code);

        const errors = await validateRow(data, existingCodes);

        parsed.push({
          rowNumber: i + 2,
          data,
          errors,
          isValid: errors.length === 0,
        });
      }

      setParsedData(parsed);
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to parse file");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    const validRows = parsedData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setIsImporting(true);
    let success = 0;
    let failed = 0;

    try {
      for (const row of validRows) {
        const { data: rowData } = row;

        const insertData = {
          company_id: companyId,
          type: "COMPETENCY" as const,
          code: rowData.code.trim(),
          name: rowData.name.trim(),
          description: rowData.description?.trim() || null,
          category: (rowData.category?.toLowerCase() || "behavioral") as any,
          status: (rowData.status?.toLowerCase() || "draft") as any,
          effective_from: rowData.effective_from || getTodayString(),
          effective_to: rowData.effective_to || null,
          owner_role: rowData.owner_role || "HR",
          external_id: rowData.external_id?.trim() || null,
          competency_attributes: {
            behavioral_indicators: [],
            role_applicability: [],
            can_be_inferred: false,
          },
        };

        const { error } = await supabase
          .from("skills_competencies")
          .insert(insertData);

        if (error) {
          console.error("Insert error:", error);
          failed++;
        } else {
          success++;
        }
      }

      setImportResult({ success, failed });

      if (success > 0) {
        toast.success(`Imported ${success} competencies successfully`);
        onImportComplete();
      }
      if (failed > 0) {
        toast.error(`${failed} competencies failed to import`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setImportResult(null);
  };

  const validCount = parsedData.filter((r) => r.isValid).length;
  const errorCount = parsedData.filter((r) => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Bulk Import Competencies
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Import multiple competencies at once using a CSV file. Download the template to see the required format.
            </AlertDescription>
          </Alert>

          {/* Downloads */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button variant="outline" size="sm" onClick={downloadExistingCompetencies}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Existing Competencies
            </Button>
          </div>

          {/* Field Specifications */}
          <Collapsible open={fieldSpecsOpen} onOpenChange={setFieldSpecsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <span className="font-medium">Field Specifications</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${fieldSpecsOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border rounded-md p-3 mt-2 space-y-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead className="w-20">Required</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TEMPLATE_CONFIG.fields.map((field) => (
                      <TableRow key={field.name}>
                        <TableCell className="font-mono text-sm">{field.name}</TableCell>
                        <TableCell>
                          {field.required ? (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {field.description}
                          {field.allowedValues && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Allowed: {field.allowedValues.join(", ")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{field.example}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Sample Preview */}
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Sample Data Preview</p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {TEMPLATE_CONFIG.headers.slice(0, 5).map((h) => (
                            <TableHead key={h} className="text-xs">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {TEMPLATE_CONFIG.examples.slice(0, 2).map((row, idx) => (
                          <TableRow key={idx}>
                            {row.slice(0, 5).map((cell, cellIdx) => (
                              <TableCell key={cellIdx} className="text-xs">{cell || "-"}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-sm font-medium mb-2">Tips</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {TEMPLATE_CONFIG.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload CSV File</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isParsing || isImporting}
            />
          </div>

          {/* Parsing Status */}
          {isParsing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Parsing file...
            </div>
          )}

          {/* Validation Results */}
          {parsedData.length > 0 && !isParsing && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{validCount} valid rows</span>
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">{errorCount} rows with errors</span>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <ScrollArea className="h-[200px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Row</TableHead>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row) => (
                      <TableRow key={row.rowNumber} className={!row.isValid ? "bg-destructive/10" : ""}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{row.data.code}</TableCell>
                        <TableCell>{row.data.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.data.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-destructive">
                          {row.errors.join("; ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert className={importResult.failed > 0 ? "border-amber-500" : "border-green-500"}>
              {importResult.failed > 0 ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <AlertDescription>
                Import complete: {importResult.success} succeeded, {importResult.failed} failed
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || isImporting || isParsing}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {validCount} Competencies
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
