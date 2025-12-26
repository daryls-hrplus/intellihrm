import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Upload, 
  FileSpreadsheet,
  Building2,
  FolderTree,
  Briefcase,
  Layers
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImportValidationReport } from "./ImportValidationReport";
import { useImportValidation } from "./useImportValidation";

const STRUCTURE_TYPES = [
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "departments", label: "Departments", icon: FolderTree },
  { id: "divisions", label: "Divisions", icon: Layers },
  { id: "sections", label: "Sections", icon: Layers },
  { id: "jobs", label: "Jobs", icon: Briefcase },
];

const TEMPLATES = {
  companies: {
    headers: ["code", "name", "industry", "address", "city", "state", "country", "postal_code", "phone", "email", "website"],
    example: ["COMP001", "Acme Corporation", "Technology", "123 Main St", "Port of Spain", "Trinidad", "Trinidad and Tobago", "00000", "+1-868-555-1234", "info@acme.com", "https://acme.com"],
    schema: {
      code: { required: true, maxLength: 50 },
      name: { required: true, maxLength: 255 },
      industry: { required: false, maxLength: 100 },
      country: { required: true, maxLength: 100 },
      email: { required: false, type: "email" },
    },
  },
  departments: {
    headers: ["company_code", "division_code", "code", "name", "description", "start_date", "end_date"],
    example: ["COMP001", "DIV001", "DEPT001", "Human Resources", "HR Department", "2024-01-01", ""],
    schema: {
      company_code: { required: true },
      code: { required: true, maxLength: 50 },
      name: { required: true, maxLength: 255 },
      start_date: { required: true, type: "date" },
      end_date: { required: false, type: "date" },
    },
  },
  divisions: {
    headers: ["company_code", "code", "name", "description", "start_date", "end_date"],
    example: ["COMP001", "DIV001", "Operations Division", "Main operations", "2024-01-01", ""],
    schema: {
      company_code: { required: true },
      code: { required: true, maxLength: 50 },
      name: { required: true, maxLength: 255 },
      start_date: { required: true, type: "date" },
    },
  },
  sections: {
    headers: ["company_code", "department_code", "code", "name", "description", "start_date", "end_date"],
    example: ["COMP001", "DEPT001", "SEC001", "Recruitment Section", "Handles recruitment", "2024-01-01", ""],
    schema: {
      company_code: { required: true },
      department_code: { required: true },
      code: { required: true, maxLength: 50 },
      name: { required: true, maxLength: 255 },
      start_date: { required: true, type: "date" },
    },
  },
  jobs: {
    headers: ["company_code", "job_family_code", "code", "name", "description", "job_level", "job_grade", "start_date", "end_date"],
    example: ["COMP001", "HR", "HR001", "HR Manager", "Manages HR operations", "Manager", "GR5", "2024-01-01", ""],
    schema: {
      company_code: { required: true },
      job_family_code: { required: true },
      code: { required: true, maxLength: 50 },
      name: { required: true, maxLength: 255 },
      start_date: { required: true, type: "date" },
    },
  },
};

export function CompanyStructureImport() {
  const { profile } = useAuth();
  const [selectedType, setSelectedType] = useState<keyof typeof TEMPLATES>("companies");
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
    importType: `company_structure_${selectedType}`,
    companyId: profile?.company_id 
  });

  const downloadTemplate = (type: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[type];
    
    // Create required indicators row
    const requiredRow = template.headers.map(header => {
      const fieldSchema = template.schema[header as keyof typeof template.schema];
      return fieldSchema?.required ? "REQUIRED" : "optional";
    });
    
    const csv = [
      template.headers.join(","),
      requiredRow.join(","),
      template.example.join(","),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${type} template downloaded`);
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

      const template = TEMPLATES[selectedType];
      performBasicValidation(data, template.schema);
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
      // Get company lookup
      const { data: companies } = await supabase
        .from("companies")
        .select("id, code");
      const companyLookup = new Map((companies || []).map(c => [c.code?.toUpperCase(), c.id]));

      let successCount = 0;
      let failCount = 0;

      for (const row of parsedData) {
        try {
          if (selectedType === "companies") {
            const { error } = await supabase.from("companies").insert({
              code: row.code,
              name: row.name,
              industry: row.industry || null,
              address: row.address || null,
              city: row.city || null,
              state: row.state || null,
              country: row.country || null,
              postal_code: row.postal_code || null,
              phone: row.phone || null,
              email: row.email || null,
              website: row.website || null,
              is_active: true,
            });
            if (error) throw error;
          } else if (selectedType === "departments") {
            const companyId = companyLookup.get(row.company_code?.toUpperCase());
            if (!companyId) throw new Error(`Company not found: ${row.company_code}`);

            // Get division if specified
            let divisionId = null;
            if (row.division_code) {
              const { data: div } = await supabase
                .from("company_divisions")
                .select("id")
                .eq("company_id", companyId)
                .eq("code", row.division_code)
                .maybeSingle();
              divisionId = div?.id;
            }

            const { error } = await supabase.from("departments").insert({
              company_id: companyId,
              company_division_id: divisionId,
              code: row.code,
              name: row.name,
              description: row.description || null,
              start_date: row.start_date,
              end_date: row.end_date || null,
              is_active: true,
            });
            if (error) throw error;
          } else if (selectedType === "divisions") {
            const companyId = companyLookup.get(row.company_code?.toUpperCase());
            if (!companyId) throw new Error(`Company not found: ${row.company_code}`);

            const { error } = await supabase.from("company_divisions").insert({
              company_id: companyId,
              code: row.code,
              name: row.name,
              description: row.description || null,
              start_date: row.start_date,
              end_date: row.end_date || null,
              is_active: true,
            });
            if (error) throw error;
          } else if (selectedType === "sections") {
            const companyId = companyLookup.get(row.company_code?.toUpperCase());
            if (!companyId) throw new Error(`Company not found: ${row.company_code}`);

            const { data: dept } = await supabase
              .from("departments")
              .select("id")
              .eq("company_id", companyId)
              .eq("code", row.department_code)
              .maybeSingle();

            if (!dept) throw new Error(`Department not found: ${row.department_code}`);

            const { error } = await supabase.from("sections").insert({
              company_id: companyId,
              department_id: dept.id,
              code: row.code,
              name: row.name,
              description: row.description || null,
              start_date: row.start_date,
              end_date: row.end_date || null,
              is_active: true,
            });
            if (error) throw error;
          } else if (selectedType === "jobs") {
            const companyId = companyLookup.get(row.company_code?.toUpperCase());
            if (!companyId) throw new Error(`Company not found: ${row.company_code}`);

            // Get job family - required
            const { data: jf } = await supabase
              .from("job_families")
              .select("id")
              .eq("company_id", companyId)
              .eq("code", row.job_family_code)
              .maybeSingle();
            
            if (!jf) throw new Error(`Job family not found: ${row.job_family_code}`);

            const { error } = await supabase.from("jobs").insert({
              company_id: companyId,
              job_family_id: jf.id,
              code: row.code,
              name: row.name,
              description: row.description || null,
              job_level: row.job_level || null,
              job_grade: row.job_grade || null,
              start_date: row.start_date,
              end_date: row.end_date || null,
              is_active: true,
            });
            if (error) throw error;
          }

          successCount++;
        } catch (err) {
          console.error("Import error for row:", row, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Imported ${successCount} ${selectedType} successfully`);
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
          Import your company organizational structure including companies, departments, divisions, sections, and jobs.
          Download the template, fill in your data, and upload for AI validation.
        </AlertDescription>
      </Alert>

      {/* Structure Type Selection */}
      <div className="space-y-2">
        <Label>Select Structure Type</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {STRUCTURE_TYPES.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              className="flex items-center gap-2 h-auto py-3"
              onClick={() => {
                setSelectedType(type.id as keyof typeof TEMPLATES);
                reset();
                setFile(null);
              }}
            >
              <type.icon className="h-4 w-4" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Download */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div>
          <p className="font-medium">Download {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Template</p>
          <p className="text-sm text-muted-foreground">
            Use this CSV template to format your data correctly
          </p>
        </div>
        <Button variant="outline" onClick={() => downloadTemplate(selectedType)}>
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
        importType={selectedType}
        isValidating={isValidating}
        onDownloadReport={downloadReport}
      />

      {/* Import Button */}
      {validationResult?.isValid && (
        <div className="flex justify-end">
          <Button 
            onClick={handleImport} 
            disabled={isImporting}
            className="min-w-32"
          >
            {isImporting ? (
              <>Importing...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {parsedData.length} Records
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
