import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
}

interface Position {
  id: string;
  title: string;
  code: string;
}

interface ParsedRow {
  rowNumber: number;
  employeeEmail: string;
  positionCode: string;
  startDate: string;
  endDate: string;
  isPrimary: string;
  compensationAmount: string;
  compensationCurrency: string;
  compensationFrequency: string;
  isActive: string;
  employeeId?: string;
  positionId?: string;
  errors: string[];
  isValid: boolean;
}

interface BulkAssignmentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  positions: Position[];
  onSuccess: () => void;
}

export function BulkAssignmentUpload({
  open,
  onOpenChange,
  employees,
  positions,
  onSuccess,
}: BulkAssignmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    const headers = [
      "employee_email",
      "position_code",
      "start_date",
      "end_date",
      "is_primary",
      "compensation_amount",
      "compensation_currency",
      "compensation_frequency",
      "is_active",
    ];
    const exampleRows = [
      [
        "john.doe@example.com",
        "POS-001",
        format(new Date(), "yyyy-MM-dd"),
        "",
        "true",
        "5000",
        "USD",
        "monthly",
        "true",
      ],
      [
        "jane.smith@example.com",
        "POS-002",
        format(new Date(), "yyyy-MM-dd"),
        "",
        "false",
        "6000",
        "USD",
        "monthly",
        "true",
      ],
    ];

    const csvContent = [headers, ...exampleRows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employee-assignments-template.csv";
    link.click();
    toast.success("Template downloaded");
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    return lines.map((line) => {
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
    const [
      employeeEmail,
      positionCode,
      startDate,
      endDate,
      isPrimary,
      compensationAmount,
      compensationCurrency,
      compensationFrequency,
      isActive,
    ] = row;

    const errors: string[] = [];

    // Validate employee email
    const employee = employees.find(
      (e) => e.email.toLowerCase() === employeeEmail?.toLowerCase()
    );
    if (!employeeEmail) {
      errors.push("Employee email is required");
    } else if (!employee) {
      errors.push(`Employee not found: ${employeeEmail}`);
    }

    // Validate position code
    const position = positions.find(
      (p) => p.code.toLowerCase() === positionCode?.toLowerCase()
    );
    if (!positionCode) {
      errors.push("Position code is required");
    } else if (!position) {
      errors.push(`Position not found: ${positionCode}`);
    }

    // Validate start date
    if (!startDate) {
      errors.push("Start date is required");
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      errors.push("Start date must be YYYY-MM-DD format");
    }

    // Validate end date if provided
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      errors.push("End date must be YYYY-MM-DD format");
    }

    // Validate compensation amount
    if (compensationAmount && isNaN(parseFloat(compensationAmount))) {
      errors.push("Compensation amount must be a number");
    }

    return {
      rowNumber,
      employeeEmail: employeeEmail || "",
      positionCode: positionCode || "",
      startDate: startDate || "",
      endDate: endDate || "",
      isPrimary: isPrimary || "false",
      compensationAmount: compensationAmount || "",
      compensationCurrency: compensationCurrency || "USD",
      compensationFrequency: compensationFrequency || "monthly",
      isActive: isActive || "true",
      employeeId: employee?.id,
      positionId: position?.id,
      errors,
      isValid: errors.length === 0,
    };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);

      // Skip header row
      const dataRows = rows.slice(1);

      if (dataRows.length === 0) {
        toast.error("No data rows found in CSV");
        return;
      }

      const parsed = dataRows.map((row, index) => validateRow(row, index + 2));
      setParsedData(parsed);

      const validCount = parsed.filter((r) => r.isValid).length;
      const invalidCount = parsed.length - validCount;

      if (invalidCount > 0) {
        toast.warning(`${validCount} valid, ${invalidCount} with errors`);
      } else {
        toast.success(`${validCount} rows ready to import`);
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpload = async () => {
    const validRows = parsedData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const row of validRows) {
        const { error } = await supabase.from("employee_positions").insert({
          employee_id: row.employeeId,
          position_id: row.positionId,
          start_date: row.startDate,
          end_date: row.endDate || null,
          is_primary: row.isPrimary.toLowerCase() === "true",
          compensation_amount: row.compensationAmount
            ? parseFloat(row.compensationAmount)
            : null,
          compensation_currency: row.compensationCurrency || "USD",
          compensation_frequency: row.compensationFrequency || "monthly",
          is_active: row.isActive.toLowerCase() !== "false",
        });

        if (error) {
          console.error("Error inserting row:", error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} assignments`);
        onSuccess();
        handleClose();
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} assignments`);
      }
    } catch (error) {
      console.error("Error during bulk upload:", error);
      toast.error("Failed to complete bulk upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setParsedData([]);
    onOpenChange(false);
  };

  const validCount = parsedData.filter((r) => r.isValid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Assignment Upload
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple employee-position assignments at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Instructions & Template */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
            <div className="space-y-1">
              <p className="text-sm font-medium">CSV Format Requirements</p>
              <p className="text-xs text-muted-foreground">
                Columns: employee_email, position_code, start_date (YYYY-MM-DD), end_date, is_primary, compensation_amount, compensation_currency, compensation_frequency, is_active
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Input */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Select CSV File
            </Button>

            {parsedData.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {validCount} valid
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {invalidCount} errors
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <ScrollArea className="h-[300px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Primary</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row) => (
                    <TableRow key={row.rowNumber} className={row.isValid ? "" : "bg-destructive/5"}>
                      <TableCell className="font-mono text-xs">{row.rowNumber}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Error</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.employeeEmail}</TableCell>
                      <TableCell className="font-mono text-xs">{row.positionCode}</TableCell>
                      <TableCell>{row.startDate}</TableCell>
                      <TableCell>{row.isPrimary === "true" ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-xs text-destructive max-w-[200px]">
                        {row.errors.join("; ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={validCount === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {validCount} Assignment{validCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
