import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ReferenceDataDownloads } from "./ReferenceDataDownloads";
import { getTodayString } from "@/utils/dateUtils";
import {
  Upload,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  FileText,
} from "lucide-react";

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
    "job_code",
    "requirement_type",
    "education_level_code",
    "field_of_study_code",
    "qualification_type_code",
    "accrediting_body_code",
    "specific_qualification_name",
    "is_mandatory",
    "is_preferred",
    "years_experience",
    "notes",
    "start_date",
    "end_date",
  ],
  fields: [
    { name: "job_code", required: true, description: "Job code from Jobs Registry", example: "SR-DEV-001" },
    { name: "requirement_type", required: true, description: "Type: 'academic' or 'professional'", example: "academic", allowedValues: ["academic", "professional"] },
    { name: "education_level_code", required: false, description: "Education level code (for academic)", example: "BACHELORS" },
    { name: "field_of_study_code", required: false, description: "Field of study code (for academic)", example: "COMPUTER_SCIENCE" },
    { name: "qualification_type_code", required: false, description: "Qualification/certification type code", example: "PMP" },
    { name: "accrediting_body_code", required: false, description: "Accrediting body code (for professional)", example: "PMI" },
    { name: "specific_qualification_name", required: false, description: "Specific degree/certification name", example: "Bachelor of Science in Computer Science" },
    { name: "is_mandatory", required: false, description: "Whether requirement is mandatory", example: "true", allowedValues: ["true", "false"] },
    { name: "is_preferred", required: false, description: "Whether it's a preferred qualification", example: "false", allowedValues: ["true", "false"] },
    { name: "years_experience", required: false, description: "Years of experience required", example: "3" },
    { name: "notes", required: false, description: "Additional notes", example: "Equivalent experience considered" },
    { name: "start_date", required: false, description: "Start date (YYYY-MM-DD)", example: "2024-01-01" },
    { name: "end_date", required: false, description: "End date (YYYY-MM-DD)", example: "" },
  ] as TemplateField[],
  examples: [
    ["SR-DEV-001", "academic", "BACHELORS", "COMPUTER_SCIENCE", "", "", "B.Sc. Computer Science", "true", "false", "", "", "2024-01-01", ""],
    ["SR-DEV-001", "professional", "", "", "AWS_CERT", "AWS", "AWS Solutions Architect", "false", "true", "2", "", "2024-01-01", ""],
    ["FIN-MGR-001", "academic", "MASTERS", "BUSINESS_ADMIN", "", "", "MBA or equivalent", "true", "false", "", "CPA preferred", "2024-01-01", ""],
    ["PM-LEAD-001", "professional", "", "", "PMP", "PMI", "Project Management Professional", "true", "false", "5", "", "2024-01-01", ""],
  ],
  tips: [
    "Job codes must match existing jobs in the Jobs module",
    "Use 'academic' for degrees/education, 'professional' for certifications",
    "Download reference data to see valid codes for each field",
    "For academic requirements: use education_level_code and field_of_study_code",
    "For professional certifications: use qualification_type_code and accrediting_body_code",
    "is_mandatory defaults to true if not specified",
    "Import jobs BEFORE importing job qualifications",
  ],
};

export function BulkJobQualificationsImport() {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fieldSpecsOpen, setFieldSpecsOpen] = useState(true);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const downloadTemplate = () => {
    const csvContent = [
      TEMPLATE_CONFIG.headers.join(","),
      ...TEMPLATE_CONFIG.examples.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job_qualifications_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
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

  const validateRow = (row: Record<string, string>): string[] => {
    const errors: string[] = [];

    if (!row.job_code) errors.push("job_code is required");
    if (!row.requirement_type) errors.push("requirement_type is required");
    if (row.requirement_type && !["academic", "professional"].includes(row.requirement_type.toLowerCase())) {
      errors.push("requirement_type must be 'academic' or 'professional'");
    }
    if (row.is_mandatory && !["true", "false", ""].includes(row.is_mandatory.toLowerCase())) {
      errors.push("is_mandatory must be 'true' or 'false'");
    }
    if (row.is_preferred && !["true", "false", ""].includes(row.is_preferred.toLowerCase())) {
      errors.push("is_preferred must be 'true' or 'false'");
    }
    if (row.years_experience && isNaN(Number(row.years_experience))) {
      errors.push("years_experience must be a number");
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

      const validated: ParsedRow[] = rows.map((row, index) => {
        const errors = validateRow(row);
        return {
          rowNumber: index + 2,
          data: row,
          errors,
          isValid: errors.length === 0,
        };
      });

      setParsedData(validated);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!companyId || parsedData.length === 0) return;

    const validRows = parsedData.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setIsImporting(true);
    let success = 0;
    let failed = 0;

    try {
      // Fetch lookups
      const [jobsRes, eduLevelsRes, fieldsRes, qualTypesRes, accBodyRes] = await Promise.all([
        supabase.from("jobs").select("id, code").eq("company_id", companyId),
        supabase.from("education_levels").select("id, code").eq("is_active", true),
        supabase.from("fields_of_study").select("id, code").eq("is_active", true),
        supabase.from("qualification_types").select("id, code").eq("is_active", true),
        supabase.from("accrediting_bodies").select("id, code").eq("is_active", true),
      ]);

      const jobLookup = new Map((jobsRes.data || []).map(j => [j.code.toUpperCase(), j.id]));
      const eduLevelLookup = new Map((eduLevelsRes.data || []).map(e => [e.code.toUpperCase(), e.id]));
      const fieldLookup = new Map((fieldsRes.data || []).map(f => [f.code.toUpperCase(), f.id]));
      const qualTypeLookup = new Map((qualTypesRes.data || []).map(q => [q.code.toUpperCase(), q.id]));
      const accBodyLookup = new Map((accBodyRes.data || []).map(a => [(a.code || "").toUpperCase(), a.id]));

      for (const row of validRows) {
        const jobId = jobLookup.get(row.data.job_code.toUpperCase());
        if (!jobId) {
          console.error(`Job not found: ${row.data.job_code}`);
          failed++;
          continue;
        }

        const requirementType = row.data.requirement_type.toLowerCase();
        const educationLevelId = row.data.education_level_code 
          ? eduLevelLookup.get(row.data.education_level_code.toUpperCase()) 
          : null;
        const fieldOfStudyId = row.data.field_of_study_code 
          ? fieldLookup.get(row.data.field_of_study_code.toUpperCase()) 
          : null;
        const qualificationTypeId = row.data.qualification_type_code 
          ? qualTypeLookup.get(row.data.qualification_type_code.toUpperCase()) 
          : null;
        const accreditingBodyId = row.data.accrediting_body_code 
          ? accBodyLookup.get(row.data.accrediting_body_code.toUpperCase()) 
          : null;

        const { error } = await supabase.from("job_qualification_requirements").insert({
          job_id: jobId,
          company_id: companyId,
          requirement_type: requirementType,
          education_level_id: educationLevelId,
          field_of_study_id: fieldOfStudyId,
          qualification_type_id: qualificationTypeId,
          accrediting_body_id: accreditingBodyId,
          specific_qualification_name: row.data.specific_qualification_name || null,
          is_mandatory: row.data.is_mandatory?.toLowerCase() !== "false",
          is_preferred: row.data.is_preferred?.toLowerCase() === "true",
          notes: row.data.notes || null,
          start_date: row.data.start_date || getTodayString(),
          end_date: row.data.end_date || null,
        });

        if (error) {
          console.error("Error inserting qualification:", error);
          failed++;
        } else {
          success++;
        }
      }

      setImportResult({ success, failed });

      if (success > 0) {
        toast.success(`Imported ${success} qualification requirement(s)`);
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

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.filter(r => !r.isValid).length;

  if (!companyId) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Please log in to access this feature.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <ReferenceDataDownloads
          companyId={companyId}
          availableDownloads={[
            "jobs",
            "education_levels",
            "fields_of_study",
            "qualification_types",
            "accrediting_bodies",
          ]}
        />
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Template
        </Button>
      </div>
        {/* Field Specifications */}
        <Collapsible open={fieldSpecsOpen} onOpenChange={setFieldSpecsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
              <span className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Field Specifications & Tips
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${fieldSpecsOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TEMPLATE_CONFIG.fields.map(field => (
                <div key={field.name} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                  <Badge variant={field.required ? "default" : "secondary"} className="shrink-0 text-[10px]">
                    {field.required ? "REQ" : "OPT"}
                  </Badge>
                  <div>
                    <span className="font-mono font-medium">{field.name}</span>
                    <p className="text-muted-foreground">{field.description}</p>
                    {field.allowedValues && (
                      <p className="text-muted-foreground">Values: {field.allowedValues.join(", ")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {TEMPLATE_CONFIG.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        {/* File Upload */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isParsing || isImporting}
            />
          </div>
          {file && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Clear
            </Button>
          )}
        </div>

        {/* Parsing Indicator */}
        {isParsing && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing file...
          </div>
        )}

        {/* Validation Summary */}
        {parsedData.length > 0 && !isParsing && (
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {validCount} valid
            </Badge>
            {invalidCount > 0 && (
              <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3 text-destructive" />
                {invalidCount} invalid
              </Badge>
            )}
          </div>
        )}

        {/* Preview Table */}
        {parsedData.length > 0 && (
          <ScrollArea className="h-[300px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead>Job Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Education/Cert</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.map(row => (
                  <TableRow key={row.rowNumber} className={!row.isValid ? "bg-destructive/5" : ""}>
                    <TableCell>{row.rowNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{row.data.job_code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {row.data.requirement_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.data.education_level_code || row.data.qualification_type_code || row.data.specific_qualification_name || "-"}
                    </TableCell>
                    <TableCell>
                      {row.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="text-xs text-destructive truncate max-w-[150px]">
                            {row.errors[0]}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {/* Import Result */}
        {importResult && (
          <Alert className={importResult.failed > 0 ? "border-amber-500" : "border-green-500"}>
            <AlertDescription>
              <span className="font-medium">
                Import complete: {importResult.success} succeeded, {importResult.failed} failed
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Import Button */}
        {parsedData.length > 0 && validCount > 0 && !importResult && (
          <Button onClick={handleImport} disabled={isImporting} className="w-full">
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {validCount} Qualification{validCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        )}
    </div>
  );
}
