import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Target,
  ListChecks,
  ClipboardList,
  FileSpreadsheet,
  Info,
  CheckCircle2,
  ChevronDown,
  FileText,
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

interface TemplateField {
  name: string;
  required: boolean;
  description: string;
  example: string;
  allowedValues?: string[];
}

type ImportType = "goals" | "competencies" | "responsibilities";

// Industry-standard template configurations following WizardStepTemplate pattern
const TEMPLATE_CONFIGS: Record<ImportType, {
  headers: string[];
  fields: TemplateField[];
  examples: string[][];
  tips: string[];
}> = {
  goals: {
    headers: ["job_code", "goal_name", "weighting", "notes", "start_date", "end_date"],
    fields: [
      { name: "job_code", required: true, description: "Job code from Jobs Registry (must exist)", example: "SR-DEV-001" },
      { name: "goal_name", required: true, description: "Name/title of the goal", example: "Improve code quality by 20%" },
      { name: "weighting", required: false, description: "Importance weight (0-100), defaults to 10", example: "25" },
      { name: "notes", required: false, description: "Additional context or details", example: "Focus on unit test coverage" },
      { name: "start_date", required: false, description: "When goal becomes active (YYYY-MM-DD)", example: "2024-01-01" },
      { name: "end_date", required: false, description: "When goal ends (leave empty if ongoing)", example: "" },
    ],
    examples: [
      ["SR-DEV-001", "Improve code quality by 20%", "25", "Focus on unit test coverage", "2024-01-01", ""],
      ["FIN-MGR-001", "Reduce operational costs by 10%", "30", "Target Q2 budget review", "2024-01-01", "2024-12-31"],
      ["HR-BP-001", "Achieve 95% employee satisfaction", "20", "Annual survey target", "2024-01-01", ""],
      ["PM-LEAD-001", "Deliver 3 major projects on time", "35", "Strategic initiative alignment", "2024-01-01", ""],
    ],
    tips: [
      "Job codes must match existing jobs in the Jobs module",
      "Weighting values should typically sum to 100% across all goals for a job",
      "Leave end_date empty for ongoing/permanent goals",
      "Start date defaults to today if not specified",
      "Import jobs BEFORE importing job goals",
    ],
  },
  competencies: {
    headers: ["job_code", "competency_code", "competency_level_code", "weighting", "is_required", "notes", "start_date", "end_date"],
    fields: [
      { name: "job_code", required: true, description: "Job code from Jobs Registry (must exist)", example: "SR-DEV-001" },
      { name: "competency_code", required: true, description: "Competency code from Capability Registry", example: "ACCOUNTABILITY" },
      { name: "competency_level_code", required: false, description: "Proficiency level code (e.g., L1, L2, L3)", example: "L2" },
      { name: "weighting", required: false, description: "Importance weight (0-100), defaults to 10", example: "25" },
      { name: "is_required", required: false, description: "Whether competency is mandatory for the role", example: "true", allowedValues: ["true", "false"] },
      { name: "notes", required: false, description: "Additional context or requirements", example: "Core leadership skill" },
      { name: "start_date", required: false, description: "When requirement starts (YYYY-MM-DD)", example: "2024-01-01" },
      { name: "end_date", required: false, description: "When requirement ends (leave empty if ongoing)", example: "" },
    ],
    examples: [
      ["SR-DEV-001", "ACCOUNTABILITY", "L2", "25", "true", "Core for senior roles", "2024-01-01", ""],
      ["FIN-MGR-001", "COMMERCIAL_AWARENESS", "L3", "40", "true", "Essential for finance leadership", "2024-01-01", ""],
      ["PM-LEAD-001", "SAFETY_LEADERSHIP", "L1", "15", "false", "Recommended but not mandatory", "2024-01-01", "2025-12-31"],
      ["HR-BP-001", "TEAM_LEADERSHIP", "", "30", "true", "", "2024-01-01", ""],
    ],
    tips: [
      "Job codes must match existing jobs in the Jobs module",
      "Competency codes must match entries in the Capability Registry (type = COMPETENCY)",
      "Use 'Download Competencies Reference' to see valid competency codes",
      "Competency level codes are optional - leave blank to skip level assignment",
      "Weighting values should typically sum to 100% across all competencies for a job",
      "Leave end_date empty for ongoing requirements",
      "Import jobs and competencies BEFORE importing job competency requirements",
    ],
  },
  responsibilities: {
    headers: ["job_code", "responsibility_code", "weighting", "notes", "start_date", "end_date"],
    fields: [
      { name: "job_code", required: true, description: "Job code from Jobs Registry (must exist)", example: "SR-DEV-001" },
      { name: "responsibility_code", required: true, description: "Responsibility code from Responsibilities Registry", example: "RESP-DEV-001" },
      { name: "weighting", required: false, description: "Importance weight (0-100), defaults to 10", example: "20" },
      { name: "notes", required: false, description: "Additional context or details", example: "Primary responsibility" },
      { name: "start_date", required: false, description: "When responsibility starts (YYYY-MM-DD)", example: "2024-01-01" },
      { name: "end_date", required: false, description: "When responsibility ends (leave empty if ongoing)", example: "" },
    ],
    examples: [
      ["SR-DEV-001", "RESP-CODE-REVIEW", "25", "Lead code review process", "2024-01-01", ""],
      ["FIN-MGR-001", "RESP-BUDGET-MGT", "40", "Annual budget ownership", "2024-01-01", ""],
      ["PM-LEAD-001", "RESP-STAKEHOLDER", "20", "Key stakeholder management", "2024-01-01", "2024-12-31"],
      ["HR-BP-001", "RESP-TALENT-ACQ", "30", "", "2024-01-01", ""],
    ],
    tips: [
      "Job codes must match existing jobs in the Jobs module",
      "Responsibility codes must match entries in the Responsibilities Registry",
      "Weighting values should typically sum to 100% across all responsibilities for a job",
      "Leave end_date empty for ongoing responsibilities",
      "Start date defaults to today if not specified",
      "Import jobs and responsibilities BEFORE importing job responsibility assignments",
    ],
  },
};

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
  const [isLoadingReference, setIsLoadingReference] = useState(false);
  const [fieldSpecsOpen, setFieldSpecsOpen] = useState(true);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const downloadTemplate = (type: ImportType) => {
    const config = TEMPLATE_CONFIGS[type];
    const csvContent = [
      config.headers.join(","),
      ...config.examples.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully");
  };

  const downloadJobsReference = async () => {
    setIsLoadingReference(true);
    try {
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select("code, name, job_family_id")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("code");

      if (error) throw error;

      if (!jobs || jobs.length === 0) {
        toast.warning("No active jobs found. Please import jobs first.");
        return;
      }

      const csvContent = [
        ["job_code", "name", "job_family_id"].join(","),
        ...jobs.map((job) => 
          [`"${job.code}"`, `"${job.name}"`, `"${job.job_family_id || ""}"`].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jobs_reference.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${jobs.length} job codes`);
    } catch (error) {
      console.error("Error downloading jobs reference:", error);
      toast.error("Failed to download jobs reference");
    } finally {
      setIsLoadingReference(false);
    }
  };

  const downloadCompetenciesReference = async () => {
    setIsLoadingReference(true);
    try {
      const { data: competencies, error } = await supabase
        .from("skills_competencies")
        .select("code, name, category")
        .eq("company_id", companyId)
        .eq("type", "COMPETENCY")
        .eq("status", "active")
        .order("code");

      if (error) throw error;

      if (!competencies || competencies.length === 0) {
        toast.warning("No active competencies found. Please add competencies to the Capability Registry first.");
        return;
      }

      const csvContent = [
        ["competency_code", "name", "category"].join(","),
        ...competencies.map((comp) => 
          [`"${comp.code}"`, `"${comp.name}"`, `"${comp.category || ""}"`].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "competencies_reference.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${competencies.length} competency codes`);
    } catch (error) {
      console.error("Error downloading competencies reference:", error);
      toast.error("Failed to download competencies reference");
    } finally {
      setIsLoadingReference(false);
    }
  };

  const downloadResponsibilitiesReference = async () => {
    setIsLoadingReference(true);
    try {
      const { data: responsibilities, error } = await supabase
        .from("responsibilities")
        .select("code, name, description")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("code");

      if (error) throw error;

      if (!responsibilities || responsibilities.length === 0) {
        toast.warning("No active responsibilities found. Please add responsibilities first.");
        return;
      }

      const csvContent = [
        ["responsibility_code", "name", "description"].join(","),
        ...responsibilities.map((resp) => 
          [`"${resp.code}"`, `"${resp.name}"`, `"${resp.description || ""}"`].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "responsibilities_reference.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${responsibilities.length} responsibility codes`);
    } catch (error) {
      console.error("Error downloading responsibilities reference:", error);
      toast.error("Failed to download responsibilities reference");
    } finally {
      setIsLoadingReference(false);
    }
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
    if (row.is_required && !["true", "false", ""].includes(row.is_required.toLowerCase())) {
      errors.push("is_required must be 'true' or 'false'");
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
            console.error(`Job not found: ${row.data.job_code}`);
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
        // Fetch competencies lookup from skills_competencies (unified capability registry)
        const { data: competencies } = await supabase
          .from("skills_competencies")
          .select("id, code")
          .eq("company_id", companyId)
          .eq("type", "COMPETENCY")
          .eq("status", "active");

        const compLookup = new Map((competencies || []).map(c => [c.code.toUpperCase(), c.id]));

        // Fetch competency levels lookup
        const { data: levels } = await supabase
          .from("competency_levels")
          .select("id, code, competency_id");

        for (const row of validRows) {
          const jobId = jobLookup.get(row.data.job_code.toUpperCase());
          const competencyId = compLookup.get(row.data.competency_code.toUpperCase());

          if (!jobId) {
            console.error(`Job not found: ${row.data.job_code}`);
            failed++;
            continue;
          }
          
          if (!competencyId) {
            console.error(`Competency not found: ${row.data.competency_code}`);
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

          if (!jobId) {
            console.error(`Job not found: ${row.data.job_code}`);
            failed++;
            continue;
          }
          
          if (!responsibilityId) {
            console.error(`Responsibility not found: ${row.data.responsibility_code}`);
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

  const config = TEMPLATE_CONFIGS[activeTab];

  // Separate fields with allowed values for special display
  const systemDefinedFields = config.fields.filter(f => f.allowedValues && f.allowedValues.length > 0);
  const regularFields = config.fields.filter(f => !f.allowedValues || f.allowedValues.length === 0);

  const renderReferenceDownloads = () => {
    switch (activeTab) {
      case "goals":
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadJobsReference}
            disabled={isLoadingReference}
          >
            {isLoadingReference ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Download Jobs Reference
          </Button>
        );
      case "competencies":
        return (
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadJobsReference}
              disabled={isLoadingReference}
            >
              {isLoadingReference ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Download Jobs Reference
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadCompetenciesReference}
              disabled={isLoadingReference}
            >
              {isLoadingReference ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Download Competencies Reference
            </Button>
          </div>
        );
      case "responsibilities":
        return (
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadJobsReference}
              disabled={isLoadingReference}
            >
              {isLoadingReference ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Download Jobs Reference
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadResponsibilitiesReference}
              disabled={isLoadingReference}
            >
              {isLoadingReference ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Download Responsibilities Reference
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
              {/* Download Section */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Step 1: Download Template & Reference Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download the template with examples and reference data to find valid codes
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => downloadTemplate(tab as ImportType)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                  {renderReferenceDownloads()}
                </div>
              </div>

              {/* Field Specifications - Collapsible */}
              <Collapsible open={fieldSpecsOpen} onOpenChange={setFieldSpecsOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5" />
                          Field Specifications
                        </h3>
                        <ChevronDown className={`h-5 w-5 transition-transform ${fieldSpecsOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 px-4 space-y-3">
                      {regularFields.map((field) => (
                        <div
                          key={field.name}
                          className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-background px-2 py-0.5 rounded">
                                {field.name}
                              </code>
                              <Badge variant={field.required ? "default" : "secondary"} className="text-xs">
                                {field.required ? "Required" : "Optional"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Example:</p>
                            <code className="text-sm font-mono">{field.example}</code>
                          </div>
                        </div>
                      ))}

                      {/* System-Defined Fields (with allowed values) */}
                      {systemDefinedFields.length > 0 && (
                        <>
                          <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              Fields with Predefined Values
                            </h4>
                          </div>
                          {systemDefinedFields.map((field) => (
                            <div
                              key={field.name}
                              className="flex items-start gap-4 p-3 rounded-lg bg-blue-500/10"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono bg-background px-2 py-0.5 rounded">
                                    {field.name}
                                  </code>
                                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                                {field.allowedValues && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {field.allowedValues.map(val => (
                                      <Badge key={val} variant="outline" className="text-xs font-mono">
                                        {val}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Default:</p>
                                <code className="text-sm font-mono">{field.example}</code>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Sample Data Preview */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Sample Data Preview</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {config.headers.map((header) => (
                            <th key={header} className="text-left p-2 font-medium whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {config.examples.map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            {row.map((cell, j) => (
                              <td key={j} className="p-2 font-mono text-xs whitespace-nowrap">
                                {cell || <span className="text-muted-foreground">-</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tips for successful imports:</strong>
                  <ul className="mt-2 space-y-1">
                    {config.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>

              {/* File Upload */}
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="font-medium mb-2">Step 2: Upload Your CSV File</p>
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
