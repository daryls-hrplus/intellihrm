import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BulkQualificationUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  company_id: string;
}

interface QualificationType {
  id: string;
  name: string;
  code: string;
  record_type: string;
}

interface EducationLevel {
  id: string;
  name: string;
  code: string;
}

interface AccreditingBody {
  id: string;
  name: string;
  code: string;
}

interface ParsedRow {
  rowNumber: number;
  employeeEmail: string;
  employeeId?: string;
  companyId?: string;
  recordType: string;
  qualificationName: string;
  qualificationTypeId?: string;
  educationLevelId?: string;
  institutionName: string;
  accreditingBodyId?: string;
  accreditingBodyName?: string;
  dateAwarded: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
  grade: string;
  credentialNumber: string;
  isValid: boolean;
  errors: string[];
}

export function BulkQualificationUpload({ open, onOpenChange, onSuccess }: BulkQualificationUploadProps) {
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [qualificationTypes, setQualificationTypes] = useState<QualificationType[]>([]);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [accreditingBodies, setAccreditingBodies] = useState<AccreditingBody[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (open) {
      fetchReferenceData();
    }
  }, [open]);

  const fetchReferenceData = async () => {
    setIsLoadingData(true);
    try {
      const [employeesRes, typesRes, levelsRes, bodiesRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, company_id").eq("is_active", true),
        (supabase as any).from("qualification_types").select("id, name, code, record_type").eq("is_active", true),
        (supabase as any).from("education_levels").select("id, name, code").eq("is_active", true),
        supabase.from("accrediting_bodies").select("id, name, code").eq("is_active", true),
      ]);

      if (employeesRes.data) setEmployees(employeesRes.data);
      if (typesRes.data) setQualificationTypes(typesRes.data);
      if (levelsRes.data) setEducationLevels(levelsRes.data);
      if (bodiesRes.data) setAccreditingBodies(bodiesRes.data);
    } catch (error) {
      console.error("Error fetching reference data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const downloadTemplate = () => {
    // Create clean CSV template with headers as columns
    const headers = [
      "employee_email",
      "record_type",
      "qualification_name",
      "qualification_type_code",
      "education_level_code",
      "institution_name",
      "accrediting_body_code",
      "date_awarded",
      "issued_date",
      "expiry_date",
      "status",
      "grade",
      "credential_number"
    ];

    // Add sample row for reference
    const sampleEmployee = employees[0];
    const sampleType = qualificationTypes.find(t => t.record_type === "academic");
    const sampleLevel = educationLevels[0];
    
    const sampleRow = sampleEmployee ? [
      sampleEmployee.email,
      "academic",
      "Bachelor of Science in Computer Science",
      sampleType?.code || "",
      sampleLevel?.code || "",
      "Sample University",
      "",
      "2024-06-15",
      "",
      "",
      "completed",
      "3.5",
      ""
    ] : [];

    const csvLines = [headers.join(",")];
    if (sampleRow.length > 0) {
      csvLines.push(sampleRow.join(","));
    }
    // Add empty rows for data entry
    csvLines.push(""); // Empty row for user to fill

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "qualifications_template.csv";
    link.click();
  };

  const downloadReference = () => {
    // Create reference document with all lookup data
    const lines = [
      "QUALIFICATIONS BULK UPLOAD - REFERENCE GUIDE",
      "============================================",
      "",
      "HOW TO USE THE TEMPLATE:",
      "1. Open the qualifications_template.csv file",
      "2. Fill in one qualification per row using the reference data below",
      "3. Save the file and upload it",
      "",
      "FIELD DESCRIPTIONS:",
      "-----------------------------------------",
      "employee_email (REQUIRED): Must match exactly as registered in system",
      "record_type (REQUIRED): academic | certification | license | membership | participation",
      "qualification_name (REQUIRED): Full name of the qualification",
      "qualification_type_code: Code from QUALIFICATION TYPES below",
      "education_level_code: Code from EDUCATION LEVELS below (for academic)",
      "institution_name: Name of awarding institution",
      "accrediting_body_code: Code from ACCREDITING BODIES below",
      "date_awarded: YYYY-MM-DD format (e.g., 2024-06-15)",
      "issued_date: YYYY-MM-DD format - for certifications/licenses",
      "expiry_date: YYYY-MM-DD format - leave blank if no expiry",
      "status: active | completed | ongoing | in_progress | expired | revoked",
      "grade: Grade or GPA (optional)",
      "credential_number: Certificate/license number (optional)",
      "",
      "============================================",
      "EMPLOYEES (email | full_name)",
      "============================================",
    ];

    employees.forEach(emp => {
      lines.push(`${emp.email} | ${emp.full_name}`);
    });

    lines.push("");
    lines.push("============================================");
    lines.push("QUALIFICATION TYPES (code | name | record_type)");
    lines.push("============================================");
    qualificationTypes.forEach(qt => {
      lines.push(`${qt.code} | ${qt.name} | ${qt.record_type}`);
    });

    lines.push("");
    lines.push("============================================");
    lines.push("EDUCATION LEVELS (code | name)");
    lines.push("============================================");
    educationLevels.forEach(el => {
      lines.push(`${el.code} | ${el.name}`);
    });

    lines.push("");
    lines.push("============================================");
    lines.push("ACCREDITING BODIES (code | name)");
    lines.push("============================================");
    accreditingBodies.forEach(ab => {
      lines.push(`${ab.code} | ${ab.name}`);
    });

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "qualifications_reference_guide.txt";
    link.click();
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/);
    return lines.map(line => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const validateRow = (row: string[], rowNumber: number): ParsedRow => {
    const errors: string[] = [];
    const [
      employeeEmail, recordType, qualificationName, qualificationTypeCode,
      educationLevelCode, institutionName, accreditingBodyCode, dateAwarded,
      issuedDate, expiryDate, status, grade, credentialNumber
    ] = row;

    // Find employee
    const employee = employees.find(e => e.email?.toLowerCase() === employeeEmail?.toLowerCase());
    if (!employeeEmail) {
      errors.push("Employee email is required");
    } else if (!employee) {
      errors.push(`Employee not found: ${employeeEmail}`);
    }

    // Validate record type
    const validRecordTypes = ["academic", "certification", "license", "membership", "participation"];
    if (!recordType) {
      errors.push("Record type is required");
    } else if (!validRecordTypes.includes(recordType.toLowerCase())) {
      errors.push(`Invalid record type: ${recordType}`);
    }

    // Validate qualification name
    if (!qualificationName) {
      errors.push("Qualification name is required");
    }

    // Find qualification type
    const qualificationType = qualificationTypes.find(qt => qt.code?.toLowerCase() === qualificationTypeCode?.toLowerCase());

    // Find education level
    const educationLevel = educationLevels.find(el => el.code?.toLowerCase() === educationLevelCode?.toLowerCase());

    // Find accrediting body
    const accreditingBody = accreditingBodies.find(ab => ab.code?.toLowerCase() === accreditingBodyCode?.toLowerCase());

    // Validate dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateAwarded && !dateRegex.test(dateAwarded)) {
      errors.push("Invalid date_awarded format (use YYYY-MM-DD)");
    }
    if (issuedDate && !dateRegex.test(issuedDate)) {
      errors.push("Invalid issued_date format (use YYYY-MM-DD)");
    }
    if (expiryDate && !dateRegex.test(expiryDate)) {
      errors.push("Invalid expiry_date format (use YYYY-MM-DD)");
    }

    // Validate status
    const validStatuses = ["active", "completed", "ongoing", "in_progress", "expired", "revoked"];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      errors.push(`Invalid status: ${status}`);
    }

    return {
      rowNumber,
      employeeEmail: employeeEmail || "",
      employeeId: employee?.id,
      companyId: employee?.company_id,
      recordType: (recordType || "").toLowerCase(),
      qualificationName: qualificationName || "",
      qualificationTypeId: qualificationType?.id,
      educationLevelId: educationLevel?.id,
      institutionName: institutionName || "",
      accreditingBodyId: accreditingBody?.id,
      accreditingBodyName: accreditingBody?.name,
      dateAwarded: dateAwarded || "",
      issuedDate: issuedDate || "",
      expiryDate: expiryDate || "",
      status: (status || "active").toLowerCase(),
      grade: grade || "",
      credentialNumber: credentialNumber || "",
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = parseCSV(text);

    // Find the header row
    const headerIndex = rows.findIndex(row => 
      row[0]?.toLowerCase().includes("employee_email") || 
      row[0]?.toLowerCase() === "employee_email"
    );

    if (headerIndex === -1) {
      toast.error("Could not find header row. Make sure your CSV has 'employee_email' as the first column.");
      return;
    }

    // Parse data rows (skip header)
    const dataRows = rows.slice(headerIndex + 1).filter(row => row.some(cell => cell.trim()));
    const parsed = dataRows.map((row, index) => validateRow(row, index + 1));

    setParsedData(parsed);
    event.target.value = "";
  };

  const handleUpload = async () => {
    const validRows = parsedData.filter(row => row.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to upload");
      return;
    }

    setIsUploading(true);
    try {
      const records = validRows.map(row => ({
        employee_id: row.employeeId,
        company_id: row.companyId,
        record_type: row.recordType,
        name: row.qualificationName,
        qualification_type_id: row.qualificationTypeId || null,
        education_level_id: row.educationLevelId || null,
        institution_name: row.institutionName || null,
        accrediting_body_id: row.accreditingBodyId || null,
        accrediting_body_name: row.accreditingBodyName || null,
        date_awarded: row.dateAwarded || null,
        issued_date: row.issuedDate || null,
        expiry_date: row.expiryDate || null,
        status: row.status,
        grade: row.grade || null,
        credential_number: row.credentialNumber || null,
        verification_status: "pending",
      }));

      const { error } = await (supabase as any)
        .from("employee_qualifications")
        .insert(records);

      if (error) throw error;

      toast.success(`Successfully uploaded ${validRows.length} qualifications`);
      setParsedData([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading qualifications:", error);
      toast.error("Failed to upload qualifications");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setParsedData([]);
    onOpenChange(false);
  };

  const validCount = parsedData.filter(row => row.isValid).length;
  const invalidCount = parsedData.filter(row => !row.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload Qualifications
          </DialogTitle>
          <DialogDescription>
            Upload multiple employee qualifications using a CSV file
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground mt-1">
                    <li>Download the CSV template (column headers in first row)</li>
                    <li>Download the Reference Guide for valid codes and employee emails</li>
                    <li>Fill in one qualification per row using reference data</li>
                    <li>Save as CSV and upload</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template (CSV)
              </Button>
              <Button variant="outline" onClick={downloadReference}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Reference Guide
              </Button>
              <div className="relative">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="secondary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </div>
            </div>

            {/* Preview */}
            {parsedData.length > 0 && (
              <>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="bg-success/10 text-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {validCount} Valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      {invalidCount} Invalid
                    </Badge>
                  )}
                </div>

                <ScrollArea className="h-[300px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-20">Status</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Qualification</TableHead>
                        <TableHead>Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((row) => (
                        <TableRow key={row.rowNumber} className={!row.isValid ? "bg-destructive/5" : ""}>
                          <TableCell>{row.rowNumber}</TableCell>
                          <TableCell>
                            {row.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{row.employeeEmail}</TableCell>
                          <TableCell className="capitalize">{row.recordType}</TableCell>
                          <TableCell>{row.qualificationName}</TableCell>
                          <TableCell>
                            {row.errors.length > 0 && (
                              <span className="text-xs text-destructive">
                                {row.errors.join("; ")}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={validCount === 0 || isUploading}
          >
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Import {validCount > 0 ? `${validCount} Qualifications` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
