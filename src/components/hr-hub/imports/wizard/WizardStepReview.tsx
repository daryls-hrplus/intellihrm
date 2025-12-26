import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  PartyPopper,
  Download,
  Copy
} from "lucide-react";
import { toast } from "sonner";

interface WizardStepReviewProps {
  importType: string;
  parsedData: any[] | null;
  validationResult: any;
  onDataChange: (data: any[]) => void;
}

// Field validation rules for real-time validation
const FIELD_VALIDATION_RULES: Record<string, Record<string, { 
  required?: boolean; 
  type?: "email" | "date" | "number"; 
  maxLength?: number;
  pattern?: RegExp;
}>> = {
  companies: {
    code: { required: true, maxLength: 50 },
    name: { required: true, maxLength: 255 },
    currency: { maxLength: 3 },
    country: { maxLength: 2 },
  },
  departments: {
    code: { required: true, maxLength: 50 },
    name: { required: true, maxLength: 255 },
    company_code: { required: true },
  },
  jobs: {
    code: { required: true, maxLength: 50 },
    title: { required: true, maxLength: 255 },
    company_code: { required: true },
    job_family_code: { required: true },
  },
  positions: {
    position_number: { required: true, maxLength: 50 },
    title: { required: true, maxLength: 255 },
    company_code: { required: true },
    department_code: { required: true },
    job_code: { required: true },
    headcount: { type: "number" },
  },
  new_hires: {
    email: { required: true, type: "email" },
    first_name: { required: true, maxLength: 100 },
    last_name: { required: true, maxLength: 100 },
    position_number: { required: true },
    department_code: { required: true },
    hire_date: { type: "date" },
  },
};

export function WizardStepReview({ 
  importType, 
  parsedData, 
  validationResult,
  onDataChange 
}: WizardStepReviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [editValidationErrors, setEditValidationErrors] = useState<Record<string, string>>({});

  // Add a unique _id to each row for stable identification
  const dataWithIds = useMemo(() => {
    if (!parsedData) return [];
    return parsedData.map((row, index) => ({
      ...row,
      _id: `row_${index}`,
      _rowIndex: index + 2, // +2 because row 1 is header
    }));
  }, [parsedData]);

  const allIssues = validationResult?.issues || [];
  const errorCount = validationResult?.errorCount || 0;
  const warningCount = validationResult?.warningCount || 0;
  const hasIssues = errorCount > 0 || warningCount > 0;

  // Get validation rules for current import type
  const validationRules = useMemo(() => {
    const baseType = importType.replace("company_structure_", "");
    return FIELD_VALIDATION_RULES[baseType] || {};
  }, [importType]);

  // Get all unique headers from data (excluding internal fields)
  const headers = useMemo(() => {
    if (dataWithIds.length === 0) return [];
    return Object.keys(dataWithIds[0]).filter(h => !h.startsWith("_"));
  }, [dataWithIds]);

  // Create a map of row -> field -> issue for quick lookup
  const issueMap = useMemo(() => {
    const map: Record<number, Record<string, any>> = {};
    allIssues.forEach((issue: any) => {
      if (!map[issue.row]) map[issue.row] = {};
      map[issue.row][issue.field] = { ...issue, issue: issue.message || issue.issue };
    });
    return map;
  }, [allIssues]);

  // Filter data based on search and error filter
  const filteredData = useMemo(() => {
    let result = dataWithIds;

    if (searchTerm) {
      result = result.filter((row) =>
        Object.entries(row)
          .filter(([key]) => !key.startsWith("_"))
          .some(([, val]) =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (showErrorsOnly) {
      result = result.filter((row) => issueMap[row._rowIndex]);
    }

    return result;
  }, [dataWithIds, searchTerm, showErrorsOnly, issueMap]);

  // Real-time field validation
  const validateField = useCallback((field: string, value: string): string | null => {
    const rules = validationRules[field];
    if (!rules) return null;

    if (rules.required && !value.trim()) {
      return `${field} is required`;
    }

    if (value.trim()) {
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Max ${rules.maxLength} characters`;
      }

      if (rules.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Invalid email format";
        }
      }

      if (rules.type === "date") {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value) && isNaN(Date.parse(value))) {
          return "Use YYYY-MM-DD format";
        }
      }

      if (rules.type === "number") {
        if (isNaN(Number(value))) {
          return "Must be a number";
        }
      }
    }

    return null;
  }, [validationRules]);

  const handleEdit = useCallback((row: any) => {
    setEditingRowId(row._id);
    // Copy all non-internal fields
    const values: Record<string, any> = {};
    Object.entries(row).forEach(([key, val]) => {
      if (!key.startsWith("_")) {
        values[key] = val;
      }
    });
    setEditedValues(values);
    setEditValidationErrors({});
  }, []);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Real-time validation
    const error = validateField(field, value);
    setEditValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, [validateField]);

  const handleSave = useCallback(() => {
    if (!parsedData || !editingRowId) return;

    // Find the original index by matching _id
    const originalIndex = dataWithIds.findIndex(d => d._id === editingRowId);
    if (originalIndex === -1) return;

    // Check for validation errors
    if (Object.keys(editValidationErrors).length > 0) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    const newData = [...parsedData];
    newData[originalIndex] = { ...editedValues };
    onDataChange(newData);
    
    setEditingRowId(null);
    setEditedValues({});
    setEditValidationErrors({});
    toast.success("Row updated successfully");
  }, [parsedData, editingRowId, dataWithIds, editedValues, editValidationErrors, onDataChange]);

  const handleCancel = useCallback(() => {
    setEditingRowId(null);
    setEditedValues({});
    setEditValidationErrors({});
  }, []);

  const getCellStatus = (rowNum: number, field: string) => {
    const issue = issueMap[rowNum]?.[field];
    if (!issue) return null;
    return issue.severity === "error" ? "error" : "warning";
  };

  // Export functionality
  const exportToCSV = useCallback((errorsOnly: boolean = false) => {
    const dataToExport = errorsOnly 
      ? dataWithIds.filter(row => issueMap[row._rowIndex])
      : dataWithIds;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Add validation status column
    const exportHeaders = [...headers, "validation_status", "validation_issues"];
    
    const csvRows = [
      exportHeaders.join(","),
      ...dataToExport.map(row => {
        const rowIssues = issueMap[row._rowIndex];
        const hasError = rowIssues && Object.values(rowIssues).some((i: any) => i.severity === "error");
        const hasWarning = rowIssues && Object.values(rowIssues).some((i: any) => i.severity === "warning");
        
        const status = hasError ? "ERROR" : hasWarning ? "WARNING" : "VALID";
        const issues = rowIssues 
          ? Object.values(rowIssues).map((i: any) => `${i.field}: ${i.issue}`).join("; ")
          : "";

        return [...headers.map(h => `"${String(row[h] || "").replace(/"/g, '""')}"`), `"${status}"`, `"${issues}"`].join(",");
      })
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${importType}_review_${errorsOnly ? "errors" : "all"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${dataToExport.length} rows`);
  }, [dataWithIds, headers, issueMap, importType]);

  if (dataWithIds.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No data to review. Please upload a file first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1">Review Data</h2>
        <p className="text-muted-foreground">
          Review your data before importing. Click the edit button to fix issues.
        </p>
      </div>

      {/* Success Message when no issues */}
      {!hasIssues && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <PartyPopper className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            All {validationResult?.validRows || dataWithIds.length} rows passed validation. Your data is ready to import!
          </AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {validationResult?.validRows || 0} valid
          </Badge>
          {errorCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              {errorCount} errors
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="gap-1 text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              {warningCount} warnings
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          {hasIssues && (
            <Button
              variant={showErrorsOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowErrorsOnly(!showErrorsOnly)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Errors Only
            </Button>
          )}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => exportToCSV(false)} className="gap-1">
          <Download className="h-4 w-4" />
          Export All
        </Button>
        {hasIssues && (
          <Button variant="outline" size="sm" onClick={() => exportToCSV(true)} className="gap-1">
            <Download className="h-4 w-4" />
            Export Errors Only
          </Button>
        )}
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="min-w-max">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="w-[60px] min-w-[60px] bg-muted font-semibold text-center sticky left-0 z-20">Row</TableHead>
                    {headers.map((header) => (
                      <TableHead 
                        key={header} 
                        className="min-w-[120px] whitespace-nowrap bg-muted font-semibold"
                      >
                        {header}
                      </TableHead>
                    ))}
                    <TableHead className="w-[80px] min-w-[80px] bg-muted font-semibold sticky right-0 z-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, displayIndex) => {
                    const rowNum = row._rowIndex;
                    const hasRowIssue = !!issueMap[rowNum];
                    const isEditing = editingRowId === row._id;

                    return (
                      <TableRow
                        key={row._id}
                        className={`
                          ${hasRowIssue ? "bg-destructive/5" : ""}
                          ${displayIndex % 2 === 0 && !hasRowIssue ? "bg-muted/20" : ""}
                        `}
                      >
                        <TableCell className="w-[60px] min-w-[60px] font-mono text-xs text-muted-foreground border-r sticky left-0 bg-background z-10">
                          {rowNum}
                        </TableCell>
                        {headers.map((header) => {
                          const cellStatus = getCellStatus(rowNum, header);
                          const issue = issueMap[rowNum]?.[header];
                          const editError = editValidationErrors[header];

                          return (
                            <TableCell
                              key={header}
                              className={`
                                min-w-[120px] border-r
                                ${cellStatus === "error" ? "bg-destructive/20" : ""}
                                ${cellStatus === "warning" ? "bg-yellow-500/20" : ""}
                              `}
                            >
                              {isEditing ? (
                                <div className="space-y-1">
                                  <Input
                                    value={editedValues[header] || ""}
                                    onChange={(e) => handleFieldChange(header, e.target.value)}
                                    className={`h-8 text-sm min-w-[100px] ${editError ? "border-destructive" : ""}`}
                                  />
                                  {editError && (
                                    <p className="text-xs text-destructive">{editError}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="relative group">
                                  <span className="font-mono text-sm whitespace-nowrap">{row[header]}</span>
                                  {issue && (
                                    <div className="hidden group-hover:block absolute z-20 bg-popover border rounded-md shadow-lg p-2 text-xs max-w-[200px] top-full left-0 mt-1">
                                      <p className="font-medium">{issue.issue}</p>
                                      {issue.suggestion && (
                                        <p className="text-muted-foreground mt-1">
                                          💡 {issue.suggestion}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="w-[80px] min-w-[80px] sticky right-0 bg-background z-10">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSave}
                                className="h-7 w-7 p-0"
                                disabled={Object.keys(editValidationErrors).length > 0}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancel}
                                className="h-7 w-7 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(row)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend - Only show when there are issues */}
      {hasIssues && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {errorCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive/20 rounded border border-destructive/30" />
              <span>Error (must fix)</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/20 rounded border border-yellow-500/30" />
              <span>Warning (review)</span>
            </div>
          )}
        </div>
      )}

      {errorCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {errorCount} error(s) that should be fixed before importing. 
            Only valid rows will be imported.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
