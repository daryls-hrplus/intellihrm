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
import { ImportDependencyChecker } from "./ImportDependencyChecker";

const TEMPLATE = {
  headers: [
    "email",
    "first_name",
    "last_name",
    "position_code",
    "department_code",
    "company_code",
    "effective_date",
    "employment_type",
    "contract_type",
    "probation_end_date",
  ],
  example: [
    "john.doe@company.com",
    "John",
    "Doe",
    "POS001",
    "DEPT001",
    "COMP001",
    "2024-01-15",
    "full_time",
    "permanent",
    "2024-04-15",
  ],
  schema: {
    email: { required: true, type: "email" as const },
    first_name: { required: true, maxLength: 100 },
    last_name: { required: true, maxLength: 100 },
    position_code: { required: true },
    department_code: { required: true },
    company_code: { required: true },
    effective_date: { required: true, type: "date" as const },
    employment_type: { required: false, values: ["full_time", "part_time", "contractor", "temporary"] },
    contract_type: { required: false, values: ["permanent", "fixed_term", "probationary"] },
    probation_end_date: { required: false, type: "date" as const },
  },
};

export function NewHiresImport() {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState("");
  const [prerequisitesMet, setPrerequisitesMet] = useState(false);

  const {
    isValidating,
    validationResult,
    parsedData,
    parseCSV,
    validateWithAI,
    downloadReport,
    reset,
  } = useImportValidation({
    importType: "new_hires",
    companyId: profile?.company_id,
  });

  const downloadTemplate = () => {
    // Create required indicators row
    const requiredRow = TEMPLATE.headers.map(header => {
      const fieldSchema = TEMPLATE.schema[header as keyof typeof TEMPLATE.schema];
      return fieldSchema?.required ? "REQUIRED" : "optional";
    });
    
    const csv = [
      TEMPLATE.headers.join(","),
      requiredRow.join(","),
      TEMPLATE.example.join(","),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "new_hires_import_template.csv";
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

      console.log(`Parsed ${data.length} rows from ${selectedFile.name}`);
      toast.info(`Parsing ${data.length} rows from file...`);

      await validateWithAI(data, TEMPLATE.schema);
      toast.success(`Validated ${data.length} rows successfully`);
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

    if (!defaultPassword || defaultPassword.length < 6) {
      toast.error("Please set a default password (minimum 6 characters)");
      return;
    }

    setIsImporting(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("You must be logged in to import new hires");
        return;
      }

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

          // Get position
          const { data: position } = await supabase
            .from("positions")
            .select("id")
            .eq("company_id", companyId)
            .eq("code", row.position_code)
            .maybeSingle();

          if (!position) throw new Error(`Position not found: ${row.position_code}`);

          // First create the user via bulk-import-users
          const { data: importResult, error: importError } = await supabase.functions.invoke(
            "bulk-import-users",
            {
              body: {
                users: [
                  {
                    email: row.email,
                    full_name: `${row.first_name} ${row.last_name}`.trim(),
                    company_id: companyId,
                  },
                ],
                defaultPassword,
              },
            }
          );

          if (importError) throw importError;

          // Check if user was created successfully
          const userResult = (importResult as any)?.results?.[0];
          if (!userResult?.success) {
            throw new Error(userResult?.error || "Failed to create user");
          }

          successCount++;
        } catch (err) {
          console.error("Import error for row:", row, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} new hires`);
      }
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} records`);
      }

      reset();
      setFile(null);
      setDefaultPassword("");
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Import failed. Check console for details.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertDescription>
          Import new hire transactions. This will create employee accounts and their corresponding 
          new hire transaction records. Make sure positions and departments exist first.
        </AlertDescription>
      </Alert>

      {/* Prerequisites Check */}
      <ImportDependencyChecker
        importType="new_hires"
        companyId={profile?.company_id}
        onPrerequisitesChecked={setPrerequisitesMet}
      />

      {/* Template Download */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div>
          <p className="font-medium">Download New Hires Template</p>
          <p className="text-sm text-muted-foreground">
            Use this CSV template to format your new hire data correctly
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Default Password */}
      <div className="space-y-2">
        <Label>Default Password for New Accounts</Label>
        <Input
          type="password"
          value={defaultPassword}
          onChange={(e) => setDefaultPassword(e.target.value)}
          placeholder="Enter a secure default password (min 6 characters)"
        />
        <p className="text-xs text-muted-foreground">
          All new hires will be assigned this password. They should change it on first login.
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>Upload CSV File</Label>
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isValidating || isImporting || !prerequisitesMet}
        />
        {!prerequisitesMet && (
          <p className="text-xs text-muted-foreground">
            Complete the prerequisites above before uploading
          </p>
        )}
      </div>

      {/* Validation Report */}
      <ImportValidationReport
        result={validationResult}
        importType="new_hires"
        isValidating={isValidating}
        onDownloadReport={downloadReport}
      />

      {/* Import Button */}
      {validationResult?.isValid && (
        <div className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={isImporting || !defaultPassword || defaultPassword.length < 6}
            className="min-w-32"
          >
            {isImporting ? (
              <>Importing...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {parsedData.length} New Hires
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
