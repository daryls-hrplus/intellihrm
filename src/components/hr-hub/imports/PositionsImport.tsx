import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImportValidationReport } from "./ImportValidationReport";
import { useImportValidation } from "./useImportValidation";

const TEMPLATE = {
  headers: [
    "company_code",
    "department_code",
    "job_code",
    "position_code",
    "position_title",
    "reports_to_position_code",
    "salary_grade_code",
    "location",
    "headcount",
    "start_date",
    "end_date",
  ],
  example: [
    "COMP001",
    "DEPT001",
    "HR001",
    "POS001",
    "HR Manager",
    "",
    "GR5",
    "Head Office",
    "1",
    "2024-01-01",
    "",
  ],
  schema: {
    company_code: { required: true },
    department_code: { required: true },
    job_code: { required: true },
    position_code: { required: true, maxLength: 50 },
    position_title: { required: true, maxLength: 255 },
    headcount: { required: false, type: "number" as const },
    start_date: { required: true, type: "date" as const },
    end_date: { required: false, type: "date" as const },
  },
};

export function PositionsImport() {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const {
    isValidating,
    validationResult,
    parsedData,
    parseCSV,
    performBasicValidation,
    downloadReport,
    reset,
  } = useImportValidation({
    importType: "positions",
    companyId: profile?.company_id,
  });

  const downloadTemplate = () => {
    const csv = [TEMPLATE.headers.join(","), TEMPLATE.example.join(",")].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "positions_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    reset();

    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        toast.error("No data found in file");
        return;
      }

      performBasicValidation(data, TEMPLATE.schema);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse file");
    }
  };

  const handleImport = async () => {
    if (!validationResult?.isValid || !parsedData.length) {
      toast.error("Please resolve validation issues before importing");
      return;
    }

    setIsImporting(true);

    try {
      // Get lookups
      const { data: companies } = await supabase.from("companies").select("id, code");
      const companyLookup = new Map((companies || []).map((c) => [c.code?.toUpperCase(), c.id]));

      let successCount = 0;
      let failCount = 0;

      for (const row of parsedData) {
        try {
          const companyId = companyLookup.get(row.company_code?.toUpperCase());
          if (!companyId) throw new Error(`Company not found: ${row.company_code}`);

          // Get department
          const { data: dept } = await supabase
            .from("departments")
            .select("id")
            .eq("company_id", companyId)
            .eq("code", row.department_code)
            .maybeSingle();

          if (!dept) throw new Error(`Department not found: ${row.department_code}`);

          // Get job
          const { data: job } = await supabase
            .from("jobs")
            .select("id")
            .eq("company_id", companyId)
            .eq("code", row.job_code)
            .maybeSingle();

          if (!job) throw new Error(`Job not found: ${row.job_code}`);

          // Get reports_to position if specified
          let reportsToId = null;
          if (row.reports_to_position_code) {
            const { data: reportsTo } = await supabase
              .from("positions")
              .select("id")
              .eq("company_id", companyId)
              .eq("code", row.reports_to_position_code)
              .maybeSingle();
            reportsToId = reportsTo?.id;
          }

          // Get salary grade if specified
          let salaryGradeId = null;
          if (row.salary_grade_code) {
            const { data: grade } = await supabase
              .from("salary_grades")
              .select("id")
              .eq("company_id", companyId)
              .eq("code", row.salary_grade_code)
              .maybeSingle();
            salaryGradeId = grade?.id;
          }

          const { error } = await supabase.from("positions").insert({
            company_id: companyId,
            department_id: dept.id,
            job_id: job.id,
            code: row.position_code,
            title: row.position_title,
            reports_to_position_id: reportsToId,
            salary_grade_id: salaryGradeId,
            location: row.location || null,
            headcount: row.headcount ? Number(row.headcount) : 1,
            start_date: row.start_date,
            end_date: row.end_date || null,
            is_active: true,
          });

          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error("Import error for row:", row, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Imported ${successCount} positions successfully`);
      }
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} records`);
      }

      reset();
      setFile(null);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertDescription>
          Import positions for your organization. Positions link jobs to departments and define the 
          reporting hierarchy. Make sure companies, departments, and jobs are imported first.
        </AlertDescription>
      </Alert>

      {/* Template Download */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div>
          <p className="font-medium">Download Positions Template</p>
          <p className="text-sm text-muted-foreground">
            Use this CSV template to format your position data correctly
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>Upload CSV File</Label>
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isValidating || isImporting}
        />
      </div>

      {/* Validation Report */}
      <ImportValidationReport
        result={validationResult}
        importType="positions"
        isValidating={isValidating}
        onDownloadReport={downloadReport}
      />

      {/* Import Button */}
      {validationResult?.isValid && (
        <div className="flex justify-end">
          <Button onClick={handleImport} disabled={isImporting} className="min-w-32">
            {isImporting ? (
              <>Importing...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {parsedData.length} Positions
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
