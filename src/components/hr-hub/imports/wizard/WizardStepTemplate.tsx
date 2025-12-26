import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  FileSpreadsheet, 
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { CompensationModel } from "./WizardStepCompensationModel";

interface WizardStepTemplateProps {
  importType: string;
  compensationModel?: CompensationModel | null;
}

interface TemplateField {
  name: string;
  required: boolean;
  description: string;
  example: string;
  systemDefined?: boolean;
  allowedValues?: string[];
}

const TEMPLATE_CONFIGS: Record<string, { 
  headers: string[]; 
  fields: TemplateField[];
  examples: string[][];
  tips: string[];
}> = {
  companies: {
    headers: ["code", "name", "legal_name", "industry", "country", "currency", "is_active"],
    fields: [
      { name: "code", required: true, description: "Unique company identifier", example: "COMP001" },
      { name: "name", required: true, description: "Company display name", example: "Acme Corp" },
      { name: "legal_name", required: false, description: "Legal registered name", example: "Acme Corporation Ltd" },
      { name: "industry", required: false, description: "Industry sector", example: "Technology" },
      { name: "country", required: false, description: "Country code (ISO)", example: "US" },
      { name: "currency", required: false, description: "Default currency", example: "USD" },
      { name: "is_active", required: false, description: "Active status", example: "true" },
    ],
    examples: [
      ["COMP001", "Acme Corp", "Acme Corporation Ltd", "Technology", "US", "USD", "true"],
      ["COMP002", "Beta Inc", "Beta Industries Inc", "Manufacturing", "GB", "GBP", "true"],
    ],
    tips: [
      "Company codes must be unique across the system",
      "Use consistent country and currency codes",
      "Set is_active to 'true' or 'false'",
    ],
  },
  departments: {
    headers: ["code", "name", "company_code", "division_code", "parent_department_code", "description", "is_active"],
    fields: [
      { name: "code", required: true, description: "Unique department code", example: "HR001" },
      { name: "name", required: true, description: "Department name", example: "Human Resources" },
      { name: "company_code", required: true, description: "Parent company code", example: "COMP001" },
      { name: "division_code", required: false, description: "Parent division code", example: "DIV001" },
      { name: "parent_department_code", required: false, description: "Parent department for hierarchy", example: "" },
      { name: "description", required: false, description: "Department description", example: "HR operations" },
      { name: "is_active", required: false, description: "Active status", example: "true" },
    ],
    examples: [
      ["HR001", "Human Resources", "COMP001", "", "", "HR operations and talent management", "true"],
      ["FIN001", "Finance", "COMP001", "", "", "Financial operations", "true"],
    ],
    tips: [
      "Company code must match an existing company",
      "Use parent_department_code to create hierarchies",
      "Division code is optional but helps with org structure",
    ],
  },
  job_families: {
    headers: ["code", "name", "company_code", "description", "is_active"],
    fields: [
      { name: "code", required: true, description: "Unique job family code", example: "TECH" },
      { name: "name", required: true, description: "Job family name", example: "Technology" },
      { name: "company_code", required: true, description: "Parent company code", example: "COMP001" },
      { name: "description", required: false, description: "Job family description", example: "All technology roles" },
      { name: "is_active", required: false, description: "Active status", example: "true" },
    ],
    examples: [
      ["TECH", "Technology", "COMP001", "All technology and IT roles", "true"],
      ["FIN", "Finance", "COMP001", "All finance and accounting roles", "true"],
    ],
    tips: [
      "Job families group related jobs together",
      "Import job families BEFORE importing jobs",
      "Use clear, descriptive codes like TECH, HR, FIN",
    ],
  },
  jobs: {
    headers: ["code", "title", "company_code", "job_family_code", "grade", "description", "is_active"],
    fields: [
      { name: "code", required: true, description: "Unique job code", example: "DEV001" },
      { name: "title", required: true, description: "Job title", example: "Software Developer" },
      { name: "company_code", required: true, description: "Parent company code", example: "COMP001" },
      { name: "job_family_code", required: true, description: "Job family code (must exist)", example: "TECH" },
      { name: "grade", required: false, description: "Job grade/level", example: "L3" },
      { name: "description", required: false, description: "Job description", example: "Develops software" },
      { name: "is_active", required: false, description: "Active status", example: "true" },
    ],
    examples: [
      ["DEV001", "Junior Developer", "COMP001", "TECH", "L1", "Entry-level developer", "true"],
      ["DEV002", "Senior Developer", "COMP001", "TECH", "L3", "Senior-level developer", "true"],
    ],
    tips: [
      "Job family must exist before importing jobs",
      "Use consistent grade naming conventions",
      "Job codes should reflect the job type",
    ],
  },
  positions: {
    headers: ["position_number", "title", "company_code", "department_code", "job_code", "reports_to_position", "headcount", "salary_grade_code", "employment_status", "employment_type", "pay_type", "flsa_status", "is_active"],
    fields: [
      { name: "position_number", required: true, description: "Unique position ID", example: "POS-001" },
      { name: "title", required: true, description: "Position title", example: "Senior Developer" },
      { name: "company_code", required: true, description: "Company code", example: "COMP001" },
      { name: "department_code", required: true, description: "Department code", example: "IT001" },
      { name: "job_code", required: true, description: "Job code", example: "DEV002" },
      { name: "reports_to_position", required: false, description: "Manager position number", example: "POS-000" },
      { name: "headcount", required: false, description: "Number of positions", example: "1" },
      { name: "salary_grade_code", required: false, description: "Salary grade code (if configured)", example: "G5" },
      { name: "employment_status", required: false, description: "Status (ACTIVE, INACTIVE, ON_HOLD)", example: "ACTIVE", systemDefined: true, allowedValues: ["ACTIVE", "INACTIVE", "ON_HOLD", "TERMINATED"] },
      { name: "employment_type", required: false, description: "Type (FULL_TIME, PART_TIME, etc.)", example: "FULL_TIME", systemDefined: true, allowedValues: ["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY", "INTERN"] },
      { name: "pay_type", required: false, description: "Pay type (SALARIED, HOURLY, etc.)", example: "SALARIED", systemDefined: true, allowedValues: ["SALARIED", "HOURLY", "COMMISSION", "PIECE_RATE"] },
      { name: "flsa_status", required: false, description: "FLSA status (EXEMPT, NON_EXEMPT)", example: "EXEMPT", systemDefined: true, allowedValues: ["EXEMPT", "NON_EXEMPT"] },
      { name: "is_active", required: false, description: "Active status", example: "true" },
    ],
    examples: [
      ["POS-001", "Senior Developer", "COMP001", "IT001", "DEV002", "POS-000", "1", "G5", "ACTIVE", "FULL_TIME", "SALARIED", "EXEMPT", "true"],
      ["POS-002", "Junior Developer", "COMP001", "IT001", "DEV001", "POS-001", "2", "G3", "ACTIVE", "FULL_TIME", "SALARIED", "NON_EXEMPT", "true"],
    ],
    tips: [
      "Company, department, and job must all exist before importing positions",
      "Use reports_to_position to build org hierarchy",
      "Headcount defaults to 1 if not specified",
      "Employment status, type, pay type, and FLSA status use predefined values",
      "Salary grade is optional and must match existing salary grades",
    ],
  },
  new_hires: {
    headers: ["email", "first_name", "last_name", "position_number", "department_code", "company_code", "hire_date", "employee_id"],
    fields: [
      { name: "email", required: true, description: "Employee email (becomes login)", example: "john@company.com" },
      { name: "first_name", required: true, description: "First name", example: "John" },
      { name: "last_name", required: true, description: "Last name", example: "Smith" },
      { name: "position_number", required: true, description: "Position to assign", example: "POS-001" },
      { name: "department_code", required: true, description: "Department code", example: "IT001" },
      { name: "company_code", required: true, description: "Company code", example: "COMP001" },
      { name: "hire_date", required: false, description: "Start date (YYYY-MM-DD)", example: "2024-01-15" },
      { name: "employee_id", required: false, description: "Employee number", example: "EMP001" },
    ],
    examples: [
      ["john.smith@company.com", "John", "Smith", "POS-001", "IT001", "COMP001", "2024-01-15", "EMP001"],
      ["jane.doe@company.com", "Jane", "Doe", "POS-002", "HR001", "COMP001", "2024-02-01", "EMP002"],
    ],
    tips: [
      "Email must be unique and valid",
      "Position must exist and be available",
      "User accounts will be created automatically",
      "Department and company must match the position's assignment",
    ],
  },
};

// Compensation-specific templates
const COMPENSATION_TEMPLATE_CONFIGS: Record<string, { 
  headers: string[]; 
  fields: TemplateField[];
  examples: string[][];
  tips: string[];
}> = {
  salary_grades: {
    headers: ["company_code", "grade_code", "grade_name", "description", "min_salary", "mid_salary", "max_salary", "currency", "start_date", "end_date", "is_active"],
    fields: [
      { name: "company_code", required: true, description: "Company code", example: "COMP001" },
      { name: "grade_code", required: true, description: "Unique grade code", example: "G5" },
      { name: "grade_name", required: true, description: "Grade display name", example: "Senior Level" },
      { name: "description", required: false, description: "Grade description", example: "Senior professional roles" },
      { name: "min_salary", required: false, description: "Minimum salary for grade", example: "50000" },
      { name: "mid_salary", required: false, description: "Midpoint salary", example: "65000" },
      { name: "max_salary", required: false, description: "Maximum salary for grade", example: "80000" },
      { name: "currency", required: false, description: "Currency code (ISO)", example: "USD" },
      { name: "start_date", required: false, description: "Effective start date (YYYY-MM-DD)", example: "2024-01-01" },
      { name: "end_date", required: false, description: "End date (optional)", example: "" },
      { name: "is_active", required: false, description: "Active status", example: "true" },
    ],
    examples: [
      ["COMP001", "G1", "Entry Level", "Entry-level positions", "30000", "35000", "40000", "USD", "2024-01-01", "", "true"],
      ["COMP001", "G5", "Senior Level", "Senior professional roles", "50000", "65000", "80000", "USD", "2024-01-01", "", "true"],
    ],
    tips: [
      "Import salary grades BEFORE positions",
      "Company code must match an existing company",
      "Salary values should be annual amounts",
      "Grade codes should be unique within a company",
    ],
  },
  pay_spines: {
    headers: ["company_code", "spine_code", "spine_name", "description", "effective_date", "end_date", "currency", "is_active"],
    fields: [
      { name: "company_code", required: true, description: "Company code", example: "COMP001" },
      { name: "spine_code", required: true, description: "Unique pay spine code", example: "ADMIN" },
      { name: "spine_name", required: true, description: "Pay spine display name", example: "Administrative Scale" },
      { name: "description", required: false, description: "Spine description", example: "Pay scale for admin staff" },
      { name: "effective_date", required: false, description: "Effective start date (YYYY-MM-DD)", example: "2024-01-01" },
      { name: "end_date", required: false, description: "End date (optional)", example: "" },
      { name: "currency", required: false, description: "Currency code (ISO)", example: "USD" },
      { name: "is_active", required: false, description: "Active status", example: "true" },
    ],
    examples: [
      ["COMP001", "ADMIN", "Administrative Scale", "Pay scale for admin staff", "2024-01-01", "", "USD", "true"],
      ["COMP001", "TECH", "Technical Scale", "Pay scale for technical staff", "2024-01-01", "", "USD", "true"],
    ],
    tips: [
      "Import pay spines BEFORE spinal points",
      "Each pay spine represents a complete pay scale",
      "Spine codes should be unique within a company",
    ],
  },
  spinal_points: {
    headers: ["spine_code", "point_number", "annual_salary", "hourly_rate", "effective_date", "end_date", "notes"],
    fields: [
      { name: "spine_code", required: true, description: "Parent pay spine code", example: "ADMIN" },
      { name: "point_number", required: true, description: "Point number on the spine", example: "1" },
      { name: "annual_salary", required: false, description: "Annual salary at this point", example: "35000" },
      { name: "hourly_rate", required: false, description: "Hourly rate (if applicable)", example: "" },
      { name: "effective_date", required: false, description: "Effective start date (YYYY-MM-DD)", example: "2024-01-01" },
      { name: "end_date", required: false, description: "End date (optional)", example: "" },
      { name: "notes", required: false, description: "Additional notes", example: "" },
    ],
    examples: [
      ["ADMIN", "1", "35000", "", "2024-01-01", "", "Entry point"],
      ["ADMIN", "2", "37000", "", "2024-01-01", "", ""],
      ["ADMIN", "3", "39000", "", "2024-01-01", "", ""],
    ],
    tips: [
      "Pay spine must exist before importing points",
      "Point numbers should be sequential within each spine",
      "Provide either annual_salary or hourly_rate",
    ],
  },
};

// Default template for types not explicitly configured
const DEFAULT_TEMPLATE = {
  headers: ["code", "name", "description", "is_active"],
  fields: [
    { name: "code", required: true, description: "Unique identifier", example: "CODE001" },
    { name: "name", required: true, description: "Display name", example: "Example Name" },
    { name: "description", required: false, description: "Description", example: "Description text" },
    { name: "is_active", required: false, description: "Active status", example: "true" },
  ],
  examples: [["CODE001", "Example Name", "Description text", "true"]],
  tips: ["Ensure codes are unique", "Use consistent naming conventions"],
};

export function WizardStepTemplate({ importType, compensationModel }: WizardStepTemplateProps) {
  // Handle prefixed import types
  const baseType = importType.replace("company_structure_", "");
  const config = TEMPLATE_CONFIGS[baseType] || COMPENSATION_TEMPLATE_CONFIGS[baseType] || DEFAULT_TEMPLATE;

  const downloadTemplate = () => {
    const csvContent = [
      config.headers.join(","),
      ...config.examples.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${importType}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully");
  };

  // Separate system-defined fields
  const systemDefinedFields = config.fields.filter(f => (f as TemplateField).systemDefined);
  const regularFields = config.fields.filter(f => !(f as TemplateField).systemDefined);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1">Download & Prepare Your Data</h2>
        <p className="text-muted-foreground">
          Download the template and fill it with your data following the field specifications
        </p>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <Button size="lg" onClick={downloadTemplate} className="gap-2">
          <Download className="h-5 w-5" />
          Download {baseType.replace(/_/g, " ")} Template
        </Button>
      </div>

      {/* Field Specifications */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Field Specifications
          </h3>
          <div className="space-y-3">
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
          </div>
        </CardContent>
      </Card>

      {/* System-Defined Fields */}
      {systemDefinedFields.length > 0 && (
        <Card className="border-blue-500/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              System-Defined Fields
              <Badge variant="outline" className="text-xs ml-2">Predefined Values</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              These fields use predefined system values. Use exact values from the allowed list.
            </p>
            <div className="space-y-3">
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
                    {(field as TemplateField).allowedValues && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(field as TemplateField).allowedValues!.map(val => (
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Data Preview */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Sample Data Preview</h3>
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
                        {cell}
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
    </div>
  );
}
