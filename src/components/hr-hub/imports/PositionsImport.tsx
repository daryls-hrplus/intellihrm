import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, FileSpreadsheet, GitBranch, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImportValidationReport } from "./ImportValidationReport";
import { useImportValidation } from "./useImportValidation";
import { ImportDependencyChecker } from "./ImportDependencyChecker";
import { useCompanyRelationships } from "@/hooks/useCompanyRelationships";
import { parsePositionCode } from "@/utils/validateReportingRelationship";

interface CompanyStructure {
  hasDivisions: boolean;
  hasSections: boolean;
}

// Build dynamic template based on company structure
function buildTemplate(companyStructure: CompanyStructure | null) {
  // Base headers - order matches manual template standard
  const headers: string[] = ["company_code"];
  
  // Add division_code if company uses divisions
  if (companyStructure?.hasDivisions) {
    headers.push("division_code");
  }
  
  headers.push("department_code");
  
  // Add section_code if company uses sections
  if (companyStructure?.hasSections) {
    headers.push("section_code");
  }
  
  headers.push(
    "job_code",
    "position_code",
    "position_title",
    "reports_to_position_code",
    "salary_grade_code",
    "headcount",
    "start_date",
    "end_date",
    "pay_type",
    "employment_status",
    "employment_type",
    "employment_relation",
    "flsa_status",
    "default_scheduled_hours",
    "description",
    "is_active"
  );

  // Build example row matching headers
  const example: string[] = ["COMP001"];
  
  if (companyStructure?.hasDivisions) {
    example.push("DIV001");
  }
  
  example.push("DEPT001");
  
  if (companyStructure?.hasSections) {
    example.push("SEC001");
  }
  
  example.push(
    "HR001",
    "POS001",
    "HR Manager",
    "",
    "GR5",
    "1",
    "2024-01-01",
    "",
    "salary",
    "active",
    "full_time",
    "employee",
    "exempt",
    "40",
    "HR Manager role",
    "true"
  );

  // Build schema dynamically
  const schema: Record<string, { required?: boolean; maxLength?: number; type?: "number" | "date"; values?: string[] }> = {
    company_code: { required: true },
    department_code: { required: true },
    job_code: { required: true },
    position_code: { required: true, maxLength: 50 },
    position_title: { required: true, maxLength: 255 },
    reports_to_position_code: { required: false },
    salary_grade_code: { required: false },
    headcount: { required: false, type: "number" as const },
    start_date: { required: true, type: "date" as const },
    end_date: { required: false, type: "date" as const },
    pay_type: { required: false, values: ["salary", "hourly", "SALARY", "HOURLY", "salaried", "SALARIED"] },
    employment_status: { required: false, values: ["active", "inactive", "on_hold", "ACTIVE", "INACTIVE", "ON_HOLD"] },
    employment_type: { required: false, values: ["full_time", "part_time", "contract", "temporary", "FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY"] },
    employment_relation: { required: false, values: ["employee", "contractor", "consultant", "EMPLOYEE", "CONTRACTOR", "CONSULTANT"] },
    flsa_status: { required: false, values: ["exempt", "non_exempt", "EXEMPT", "NON_EXEMPT"] },
    default_scheduled_hours: { required: false, type: "number" as const },
    description: { required: false, maxLength: 2000 },
    is_active: { required: false, values: ["true", "false", "TRUE", "FALSE", "1", "0", "yes", "no", "YES", "NO"] },
  };

  // Add dynamic fields to schema
  if (companyStructure?.hasDivisions) {
    schema.division_code = { required: false };
  }
  if (companyStructure?.hasSections) {
    schema.section_code = { required: false };
  }

  return { headers, example, schema };
}

export function PositionsImport() {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [prerequisitesMet, setPrerequisitesMet] = useState(false);
  const [companyStructure, setCompanyStructure] = useState<CompanyStructure | null>(null);
  const [crossCompanyCount, setCrossCompanyCount] = useState(0);

  const { groupCompanies, isValidReportingRelationship } = useCompanyRelationships(profile?.company_id);

  // Fetch company structure to determine if divisions/sections are used
  useEffect(() => {
    async function fetchCompanyStructure() {
      if (!profile?.company_id) return;

      try {
        // Check for divisions
        const { count: divisionCount } = await (supabase
          .from("divisions") as any)
          .select("id", { count: "exact", head: true })
          .eq("company_id", profile.company_id);

        // Check for sections (through departments)
        const { data: departments } = await supabase
          .from("departments")
          .select("id")
          .eq("company_id", profile.company_id);

        let sectionCount = 0;
        if (departments && departments.length > 0) {
          const deptIds = departments.map(d => d.id);
          const { count } = await (supabase.from("sections" as any) as any)
            .select("id", { count: "exact", head: true })
            .in("department_id", deptIds);
          sectionCount = count || 0;
        }

        setCompanyStructure({
          hasDivisions: (divisionCount || 0) > 0,
          hasSections: sectionCount > 0,
        });
      } catch (error) {
        console.error("Error fetching company structure:", error);
        setCompanyStructure({ hasDivisions: false, hasSections: false });
      }
    }

    fetchCompanyStructure();
  }, [profile?.company_id]);

  // Build template based on company structure
  const TEMPLATE = useMemo(() => buildTemplate(companyStructure), [companyStructure]);

  const {
    isValidating,
    validationResult,
    parsedData,
    parseCSV,
    validateWithAI,
    downloadReport,
    reset,
  } = useImportValidation({
    importType: "positions",
    companyId: profile?.company_id,
  });

  const downloadTemplate = () => {
    // Create required indicators row
    const requiredRow = TEMPLATE.headers.map(header => {
      const fieldSchema = TEMPLATE.schema[header as keyof typeof TEMPLATE.schema];
      return fieldSchema?.required ? "REQUIRED" : "optional";
    });
    
    // Add a note about cross-company reporting
    const notes = [
      "# Cross-company reporting: Use COMPANY_CODE:POSITION_CODE format",
      "# Example: AUR-CORP:CEO-001 reports to CEO in AUR-CORP company",
    ];
    
    const csv = [
      ...notes,
      TEMPLATE.headers.join(","),
      requiredRow.join(","),
      TEMPLATE.example.join(","),
    ].join("\n");

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
    setCrossCompanyCount(0);

    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        toast.error("No data found in file");
        return;
      }

      // Count cross-company references
      let crossCount = 0;
      data.forEach(row => {
        if (row.reports_to_position_code?.includes(":")) {
          crossCount++;
        }
      });
      setCrossCompanyCount(crossCount);

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

    setIsImporting(true);

    try {
      // Get lookups
      const { data: companies } = await supabase.from("companies").select("id, code, group_id");
      const companyLookup = new Map((companies || []).map((c) => [c.code?.toUpperCase(), c]));

      // Get group companies for cross-company position lookup
      const validCompanyIds = groupCompanies.map(c => c.id);
      
      // Build position lookup across all group companies
      const { data: allPositions } = await supabase
        .from("positions")
        .select(`
          id, 
          code, 
          company_id,
          company:companies(code)
        `)
        .in("company_id", validCompanyIds.length > 0 ? validCompanyIds : [profile?.company_id || ""]);

      // Build position lookup map: COMPANY_CODE:POSITION_CODE -> position
      const positionLookup = new Map<string, { id: string; companyId: string }>();
      allPositions?.forEach(p => {
        const companyCode = (p.company as any)?.code?.toUpperCase() || "";
        const positionCode = p.code?.toUpperCase() || "";
        positionLookup.set(`${companyCode}:${positionCode}`, { id: p.id, companyId: p.company_id });
        // Also index by just position code for backward compatibility
        if (!positionLookup.has(positionCode)) {
          positionLookup.set(positionCode, { id: p.id, companyId: p.company_id });
        }
      });

      let successCount = 0;
      let failCount = 0;
      let crossCompanySuccessCount = 0;

      for (const row of parsedData) {
        try {
          const company = companyLookup.get(row.company_code?.toUpperCase());
          if (!company) throw new Error(`Company not found: ${row.company_code}`);
          const companyId = company.id;

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

          // Get reports_to position if specified (with cross-company support)
          let reportsToId = null;
          let isCrossCompany = false;
          
          if (row.reports_to_position_code) {
            const { companyCode: supCompanyCode, positionCode: supPosCode } = parsePositionCode(row.reports_to_position_code);
            
            let supervisorPosition: { id: string; companyId: string } | undefined;
            
            if (supCompanyCode) {
              // Explicit cross-company reference
              supervisorPosition = positionLookup.get(`${supCompanyCode}:${supPosCode.toUpperCase()}`);
            } else {
              // Try same company first
              const currentCompanyCode = row.company_code?.toUpperCase();
              supervisorPosition = positionLookup.get(`${currentCompanyCode}:${supPosCode.toUpperCase()}`);
              
              // Fallback to any matching position in the group
              if (!supervisorPosition) {
                supervisorPosition = positionLookup.get(supPosCode.toUpperCase());
              }
            }
            
            if (supervisorPosition) {
              // Validate cross-company relationship
              if (supervisorPosition.companyId !== companyId) {
                isCrossCompany = true;
                const validation = isValidReportingRelationship(companyId, supervisorPosition.companyId, "primary");
                if (!validation.isValid) {
                  throw new Error(`Cross-company reporting not allowed: ${validation.reason}`);
                }
              }
              reportsToId = supervisorPosition.id;
            }
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
            authorized_headcount: row.headcount ? Number(row.headcount) : 1,
            start_date: row.start_date,
            end_date: row.end_date || null,
            is_active: true,
            compensation_model: row.compensation_model || 'salary_grade',
            pay_type: row.pay_type || 'salary',
            employment_status: row.employment_status || 'active',
            employment_type: row.employment_type || 'full_time',
            flsa_status: row.flsa_status || 'exempt',
          });

          if (error) throw error;
          successCount++;
          if (isCrossCompany) crossCompanySuccessCount++;
        } catch (err) {
          console.error("Import error for row:", row, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        const crossCompanyMsg = crossCompanySuccessCount > 0 
          ? ` (${crossCompanySuccessCount} with cross-company reporting)` 
          : "";
        toast.success(`Imported ${successCount} positions successfully${crossCompanyMsg}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} records`);
      }

      reset();
      setFile(null);
      setCrossCompanyCount(0);
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
          reporting hierarchy. Supports cross-company reporting within corporate groups using 
          <code className="text-xs bg-muted px-1 mx-1 rounded">COMPANY_CODE:POSITION_CODE</code> format.
        </AlertDescription>
      </Alert>

      {/* Prerequisites Check */}
      <ImportDependencyChecker
        importType="positions"
        companyId={profile?.company_id}
        onPrerequisitesChecked={setPrerequisitesMet}
      />

      {/* Group Companies Info */}
      {groupCompanies.length > 1 && (
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Corporate Group - Cross-Company Reporting Enabled</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {groupCompanies.map(c => (
              <Badge 
                key={c.id} 
                variant={c.isCurrentCompany ? "default" : "secondary"}
                className="text-xs"
              >
                {c.code}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Positions can report to supervisors in any of these companies. Use 
            <code className="bg-background px-1 mx-1 rounded">COMPANY_CODE:POSITION_CODE</code> 
            in the reports_to_position_code column.
          </p>
        </div>
      )}

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
          disabled={isValidating || isImporting || !prerequisitesMet}
        />
        {!prerequisitesMet && (
          <p className="text-xs text-muted-foreground">
            Complete the prerequisites above before uploading
          </p>
        )}
      </div>

      {/* Cross-company indicator */}
      {crossCompanyCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
          <GitBranch className="h-4 w-4 text-blue-600" />
          <span className="text-sm">
            <strong>{crossCompanyCount}</strong> position(s) have cross-company reporting relationships
          </span>
        </div>
      )}

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
