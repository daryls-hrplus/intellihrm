import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImportValidationReport } from "./ImportValidationReport";
import { useImportValidation } from "./useImportValidation";

const TEMPLATE = {
  headers: [
    "email",
    "first_name",
    "last_name",
    "phone",
    "date_of_birth",
    "gender",
    "marital_status",
    "nationality",
    "address",
    "city",
    "country",
  ],
  example: [
    "john.doe@company.com",
    "John",
    "Doe",
    "+1-868-555-1234",
    "1990-05-15",
    "male",
    "single",
    "Trinidad and Tobago",
    "123 Main Street",
    "Port of Spain",
    "Trinidad and Tobago",
  ],
  schema: {
    email: { required: true, type: "email" as const },
    first_name: { required: true, maxLength: 100 },
    last_name: { required: true, maxLength: 100 },
    phone: { required: false, maxLength: 50 },
    date_of_birth: { required: false, type: "date" as const },
    gender: { required: false, values: ["male", "female", "other"] },
    marital_status: { required: false, values: ["single", "married", "divorced", "widowed", "separated"] },
    nationality: { required: false, maxLength: 100 },
  },
};

export function EmployeesImport() {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState("");

  const {
    isValidating,
    validationResult,
    parsedData,
    parseCSV,
    validateWithAI,
    downloadReport,
    reset,
  } = useImportValidation({
    importType: "employees",
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
    a.download = "employees_import_template.csv";
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
        toast.error("You must be logged in to import employees");
        return;
      }

      const users = parsedData.map((row) => ({
        email: row.email,
        full_name: `${row.first_name} ${row.last_name}`.trim(),
        company_id: profile?.company_id,
        // Additional profile data will be updated after user creation
        phone: row.phone || null,
        date_of_birth: row.date_of_birth || null,
        gender: row.gender || null,
        marital_status: row.marital_status || null,
        nationality: row.nationality || null,
        address: row.address || null,
        city: row.city || null,
        country: row.country || null,
      }));

      const { data: result, error } = await supabase.functions.invoke("bulk-import-users", {
        body: {
          users,
          defaultPassword,
        },
      });

      if (error) throw error;

      if (result.summary) {
        if (result.summary.successful > 0) {
          toast.success(`Successfully imported ${result.summary.successful} employees`);
        }
        if (result.summary.failed > 0) {
          toast.error(`Failed to import ${result.summary.failed} employees`);
        }
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
          Import employee basic information. This will create user accounts for each employee.
          They will be sent login credentials or can use the password you specify.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive" className="bg-warning/10 border-warning text-warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This import creates user accounts. Make sure email addresses are correct
          as employees will receive account notifications.
        </AlertDescription>
      </Alert>

      {/* Template Download */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div>
          <p className="font-medium">Download Employees Template</p>
          <p className="text-sm text-muted-foreground">
            Use this CSV template to format your employee data correctly
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
          All imported employees will be assigned this password. They should change it on first login.
        </p>
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
        importType="employees"
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
                Import {parsedData.length} Employees
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
