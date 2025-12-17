import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Target,
  ListChecks,
  ClipboardList,
} from "lucide-react";
import { getTodayString } from "@/utils/dateUtils";

interface BulkJobDataImportProps {
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

type ImportType = "goals" | "competencies" | "responsibilities";

export function BulkJobDataImport({
  open,
  onOpenChange,
  companyId,
  onImportComplete,
}: BulkJobDataImportProps) {
  const [activeTab, setActiveTab] = useState<ImportType>("goals");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const templates = {
    goals: {
      headers: ["job_code", "goal_name", "weighting", "notes", "start_date", "end_date"],
      example: ["ENG001", "Improve code quality", "25", "Focus on unit tests", "2024-01-01", ""],
    },
    competencies: {
      headers: ["job_code", "competency_code", "competency_level_code", "weighting", "is_required", "notes", "start_date", "end_date"],
      example: ["ENG001", "PROG", "ADV", "30", "true", "Programming skills", "2024-01-01", ""],
    },
    responsibilities: {
      headers: ["job_code", "responsibility_code", "weighting", "notes", "start_date", "end_date"],
      example: ["ENG001", "RESP001", "20", "Primary responsibility", "2024-01-01", ""],
    },
  };

  const downloadTemplate = (type: ImportType) => {
    const { headers, example } = templates[type];
    const csv = [headers.join(","), example.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row);
    }

    return rows;
  };

  const validateGoalRow = async (row: Record<string, string>): Promise<string[]> => {
    const errors: string[] = [];

    if (!row.job_code) errors.push("job_code is required");
    if (!row.goal_name) errors.push("goal_name is required");
    if (row.weighting && (isNaN(Number(row.weighting)) || Number(row.weighting) < 0 || Number(row.weighting) > 100)) {
      errors.push("weighting must be 0-100");
    }
    if (row.start_date && isNaN(Date.parse(row.start_date))) errors.push("Invalid start_date");
    if (row.end_date && isNaN(Date.parse(row.end_date))) errors.push("Invalid end_date");

    return errors;
  };

  const validateCompetencyRow = async (row: Record<string, string>): Promise<string[]> => {
    const errors: string[] = [];

    if (!row.job_code) errors.push("job_code is required");
    if (!row.competency_code) errors.push("competency_code is required");
    if (row.weighting && (isNaN(Number(row.weighting)) || Number(row.weighting) < 0 || Number(row.weighting) > 100)) {
      errors.push("weighting must be 0-100");
    }
    if (row.start_date && isNaN(Date.parse(row.start_date))) errors.push("Invalid start_date");
    if (row.end_date && isNaN(Date.parse(row.end_date))) errors.push("Invalid end_date");

    return errors;
  };

  const validateResponsibilityRow = async (row: Record<string, string>): Promise<string[]> => {
    const errors: string[] = [];

    if (!row.job_code) errors.push("job_code is required");
    if (!row.responsibility_code) errors.push("responsibility_code is required");
    if (row.weighting && (isNaN(Number(row.weighting)) || Number(row.weighting) < 0 || Number(row.weighting) > 100)) {
      errors.push("weighting must be 0-100");
    }
    if (row.start_date && isNaN(Date.parse(row.start_date))) errors.push("Invalid start_date");
    if (row.end_date && isNaN(Date.parse(row.end_date))) errors.push("Invalid end_date");

    return errors;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);

      const validators = {
        goals: validateGoalRow,
        competencies: validateCompetencyRow,
        responsibilities: validateResponsibilityRow,
      };

      const validated: ParsedRow[] = await Promise.all(
        rows.map(async (row, index) => {
          const errors = await validators[activeTab](row);
          return {
            rowNumber: index + 2, // +2 because 1-indexed and skip header
            data: row,
            errors,
            isValid: errors.length === 0,
          };
        })
      );

      setParsedData(validated);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    const validRows = parsedData.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setIsImporting(true);
    let success = 0;
    let failed = 0;

    try {
      // Fetch jobs lookup
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, code")
        .eq("company_id", companyId);

      const jobLookup = new Map((jobs || []).map(j => [j.code.toUpperCase(), j.id]));

      if (activeTab === "goals") {
        for (const row of validRows) {
          const jobId = jobLookup.get(row.data.job_code.toUpperCase());
          if (!jobId) {
            failed++;
            continue;
          }

          const { error } = await supabase.from("job_goals").insert({
            job_id: jobId,
            goal_name: row.data.goal_name,
            weighting: row.data.weighting ? Number(row.data.weighting) : 10,
            notes: row.data.notes || null,
            start_date: row.data.start_date || getTodayString(),
            end_date: row.data.end_date || null,
          });

          if (error) {
            console.error("Error inserting goal:", error);
            failed++;
          } else {
            success++;
          }
        }
      } else if (activeTab === "competencies") {
        // Fetch competencies lookup
        const { data: competencies } = await supabase
          .from("competencies")
          .select("id, code")
          .eq("company_id", companyId);

        const compLookup = new Map((competencies || []).map(c => [c.code.toUpperCase(), c.id]));

        // Fetch competency levels lookup
        const { data: levels } = await supabase
          .from("competency_levels")
          .select("id, code, competency_id");

        for (const row of validRows) {
          const jobId = jobLookup.get(row.data.job_code.toUpperCase());
          const competencyId = compLookup.get(row.data.competency_code.toUpperCase());

          if (!jobId || !competencyId) {
            failed++;
            continue;
          }

          let levelId = null;
          if (row.data.competency_level_code) {
            const level = (levels || []).find(
              l => l.competency_id === competencyId && l.code.toUpperCase() === row.data.competency_level_code.toUpperCase()
            );
            levelId = level?.id || null;
          }

          const { error } = await supabase.from("job_competencies").insert({
            job_id: jobId,
            competency_id: competencyId,
            competency_level_id: levelId,
            weighting: row.data.weighting ? Number(row.data.weighting) : 10,
            is_required: row.data.is_required?.toLowerCase() === "true",
            notes: row.data.notes || null,
            start_date: row.data.start_date || getTodayString(),
            end_date: row.data.end_date || null,
          });

          if (error) {
            console.error("Error inserting competency:", error);
            failed++;
          } else {
            success++;
          }
        }
      } else if (activeTab === "responsibilities") {
        // Fetch responsibilities lookup
        const { data: responsibilities } = await supabase
          .from("responsibilities")
          .select("id, code")
          .eq("company_id", companyId);

        const respLookup = new Map((responsibilities || []).map(r => [r.code.toUpperCase(), r.id]));

        for (const row of validRows) {
          const jobId = jobLookup.get(row.data.job_code.toUpperCase());
          const responsibilityId = respLookup.get(row.data.responsibility_code.toUpperCase());

          if (!jobId || !responsibilityId) {
            failed++;
            continue;
          }

          const { error } = await supabase.from("job_responsibilities").insert({
            job_id: jobId,
            responsibility_id: responsibilityId,
            weighting: row.data.weighting ? Number(row.data.weighting) : 10,
            notes: row.data.notes || null,
            start_date: row.data.start_date || getTodayString(),
            end_date: row.data.end_date || null,
          });

          if (error) {
            console.error("Error inserting responsibility:", error);
            failed++;
          } else {
            success++;
          }
        }
      }

      setImportResult({ success, failed });

      if (success > 0) {
        toast.success(`Imported ${success} record(s) successfully`);
        onImportComplete();
      }
      if (failed > 0) {
        toast.error(`${failed} record(s) failed to import`);
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ImportType);
    resetForm();
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.filter(r => !r.isValid).length;

  const getColumnHeaders = () => {
    switch (activeTab) {
      case "goals":
        return ["Row", "Job Code", "Goal Name", "Weight", "Status"];
      case "competencies":
        return ["Row", "Job Code", "Competency", "Level", "Weight", "Status"];
      case "responsibilities":
        return ["Row", "Job Code", "Responsibility", "Weight", "Status"];
    }
  };

  const renderRowData = (row: ParsedRow) => {
    switch (activeTab) {
      case "goals":
        return (
          <>
            <TableCell>{row.data.job_code}</TableCell>
            <TableCell>{row.data.goal_name}</TableCell>
            <TableCell>{row.data.weighting || "10"}</TableCell>
          </>
        );
      case "competencies":
        return (
          <>
            <TableCell>{row.data.job_code}</TableCell>
            <TableCell>{row.data.competency_code}</TableCell>
            <TableCell>{row.data.competency_level_code || "-"}</TableCell>
            <TableCell>{row.data.weighting || "10"}</TableCell>
          </>
        );
      case "responsibilities":
        return (
          <>
            <TableCell>{row.data.job_code}</TableCell>
            <TableCell>{row.data.responsibility_code}</TableCell>
            <TableCell>{row.data.weighting || "10"}</TableCell>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Job Data
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="competencies" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Competencies
            </TabsTrigger>
            <TabsTrigger value="responsibilities" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Responsibilities
            </TabsTrigger>
          </TabsList>

          {["goals", "competencies", "responsibilities"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
              {/* Template Download */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Download Template</p>
                  <p className="text-sm text-muted-foreground">
                    Use this template to format your CSV file correctly
                  </p>
                </div>
                <Button variant="outline" onClick={() => downloadTemplate(tab as ImportType)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV Template
                </Button>
              </div>

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
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Parsing CSV...</span>
                </div>
              )}

              {/* Preview Table */}
              {parsedData.length > 0 && !isParsing && (
                <>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-success/10 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {validCount} Valid
                    </Badge>
                    {invalidCount > 0 && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {invalidCount} Invalid
                      </Badge>
                    )}
                  </div>

                  <ScrollArea className="h-[300px] rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {getColumnHeaders().map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.map((row) => (
                          <TableRow
                            key={row.rowNumber}
                            className={row.isValid ? "" : "bg-destructive/5"}
                          >
                            <TableCell>{row.rowNumber}</TableCell>
                            {renderRowData(row)}
                            <TableCell>
                              {row.isValid ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4 text-destructive" />
                                  <span className="text-xs text-destructive">
                                    {row.errors.join(", ")}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {/* Import Result */}
                  {importResult && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span>{importResult.success} imported</span>
                      </div>
                      {importResult.failed > 0 && (
                        <div className="flex items-center gap-2 text-destructive">
                          <XCircle className="h-5 w-5" />
                          <span>{importResult.failed} failed</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {parsedData.length > 0 && validCount > 0 && !importResult && (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {validCount} Record(s)
            </Button>
          )}
          {importResult && (
            <Button onClick={resetForm}>Import Another File</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
