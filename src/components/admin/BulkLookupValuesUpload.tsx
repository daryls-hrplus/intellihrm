import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { Download, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

interface BulkLookupValuesUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  categoryLabel: string;
  onSuccess: () => void;
}

interface ParsedRow {
  rowNumber: number;
  code: string;
  name: string;
  description: string;
  display_order: number;
  is_default: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string;
  isValid: boolean;
  errors: string[];
}

const TEMPLATE_COLUMNS = [
  "code",
  "name",
  "description",
  "display_order",
  "is_default",
  "is_active",
  "start_date",
  "end_date",
];

export function BulkLookupValuesUpload({
  open,
  onOpenChange,
  category,
  categoryLabel,
  onSuccess,
}: BulkLookupValuesUploadProps) {
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { logAction } = useAuditLog();

  const downloadTemplate = () => {
    const instructions = [
      `# Bulk Import Template for ${categoryLabel}`,
      "#",
      "# Instructions:",
      "# 1. Fill in the data rows below the header row",
      "# 2. code: Unique identifier (will be uppercased, spaces become underscores)",
      "# 3. name: Display name (required)",
      "# 4. description: Optional description",
      "# 5. display_order: Numeric order for display (1, 2, 3...)",
      "# 6. is_default: yes/no - Only one value should be default",
      "# 7. is_active: yes/no - Whether the value is active",
      "# 8. start_date: YYYY-MM-DD format (required)",
      "# 9. end_date: YYYY-MM-DD format (optional, leave empty for no end date)",
      "#",
      "# Example row:",
      "# FULL_TIME,Full Time Employee,Regular full-time employment,1,no,yes,2024-01-01,",
      "#",
    ];

    const headerRow = TEMPLATE_COLUMNS.join(",");
    const exampleRow = "EXAMPLE_CODE,Example Name,Optional description,1,no,yes,2024-01-01,";

    const csvContent = [...instructions, headerRow, exampleRow].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lookup_values_${category}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith("#"));
    return lines.map(line => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const validateRow = (row: string[], rowIndex: number): ParsedRow => {
    const errors: string[] = [];
    
    const code = row[0]?.trim() || "";
    const name = row[1]?.trim() || "";
    const description = row[2]?.trim() || "";
    const displayOrderStr = row[3]?.trim() || "0";
    const isDefaultStr = row[4]?.trim().toLowerCase() || "no";
    const isActiveStr = row[5]?.trim().toLowerCase() || "yes";
    const startDate = row[6]?.trim() || "";
    const endDate = row[7]?.trim() || "";

    if (!code) errors.push("Code is required");
    if (!name) errors.push("Name is required");
    if (!startDate) errors.push("Start date is required");
    
    const displayOrder = parseInt(displayOrderStr);
    if (isNaN(displayOrder)) errors.push("Display order must be a number");

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      errors.push("Start date must be YYYY-MM-DD format");
    }
    if (endDate && !dateRegex.test(endDate)) {
      errors.push("End date must be YYYY-MM-DD format");
    }

    const isDefault = ["yes", "true", "1"].includes(isDefaultStr);
    const isActive = ["yes", "true", "1"].includes(isActiveStr);

    return {
      rowNumber: rowIndex + 1,
      code: code.toUpperCase().replace(/\s+/g, "_"),
      name,
      description,
      display_order: isNaN(displayOrder) ? 0 : displayOrder,
      is_default: isDefault,
      is_active: isActive,
      start_date: startDate,
      end_date: endDate,
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      
      // Skip header row if it matches template columns
      const startIndex = rows[0]?.[0]?.toLowerCase() === "code" ? 1 : 0;
      
      const parsed = rows.slice(startIndex).map((row, index) => validateRow(row, index));
      setParsedData(parsed);
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = "";
  };

  const uploadMutation = useMutation({
    mutationFn: async (rows: ParsedRow[]) => {
      const validRows = rows.filter(r => r.isValid);
      
      const insertData = validRows.map(row => ({
        category: category as any,
        code: row.code,
        name: row.name,
        description: row.description || null,
        display_order: row.display_order,
        is_default: row.is_default,
        is_active: row.is_active,
        start_date: row.start_date,
        end_date: row.end_date || null,
      }));

      const { data, error } = await supabase
        .from("lookup_values")
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lookup-values", category] });
      data?.forEach(item => {
        logAction({
          action: "CREATE",
          entityType: "lookup_value",
          entityId: item.id,
          entityName: item.name,
          newValues: item,
          metadata: { source: "bulk_import" },
        });
      });
      toast.success(`Successfully imported ${data?.length} lookup values`);
      handleClose();
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });

  const handleUpload = async () => {
    const validRows = parsedData.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(parsedData);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setParsedData([]);
    onOpenChange(false);
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.filter(r => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import {categoryLabel}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple lookup values at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Download the template CSV file for {categoryLabel}</li>
              <li>Fill in your data in the rows below the header (one value per row)</li>
              <li>Required fields: code, name, start_date</li>
              <li>is_default and is_active accept: yes/no, true/false, or 1/0</li>
              <li>Dates must be in YYYY-MM-DD format</li>
              <li>Upload your completed file and review before importing</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <div className="flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="flex-1 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead className="w-20">Default</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row) => (
                    <TableRow key={row.rowNumber} className={!row.isValid ? "bg-destructive/10" : ""}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{row.description || "-"}</TableCell>
                      <TableCell>{row.display_order}</TableCell>
                      <TableCell>{row.is_default ? "Yes" : "No"}</TableCell>
                      <TableCell>{row.is_active ? "Yes" : "No"}</TableCell>
                      <TableCell>{row.start_date}</TableCell>
                      <TableCell>{row.end_date || "-"}</TableCell>
                      <TableCell className="text-xs text-destructive max-w-[200px]">
                        {row.errors.join(", ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {parsedData.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary">{parsedData.length} total rows</Badge>
              <Badge variant="default" className="bg-green-500">{validCount} valid</Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive">{invalidCount} invalid</Badge>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || validCount === 0}
          >
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Upload className="h-4 w-4 mr-2" />
            Import {validCount} Values
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
