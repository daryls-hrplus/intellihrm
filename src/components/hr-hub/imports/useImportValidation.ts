import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ValidationResult, ValidationIssue } from "./ImportValidationReport";

interface UseImportValidationProps {
  importType: string;
  companyId?: string;
}

export function useImportValidation({ importType, companyId }: UseImportValidationProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, "").replace(/ /g, "_"));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Handle CSV with quoted fields containing commas
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/"/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/"/g, ""));

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row);
    }

    return rows;
  };

  const validateWithAI = async (data: Record<string, string>[], schema: Record<string, any>) => {
    setIsValidating(true);
    setValidationResult(null);
    setParsedData(data);

    try {
      const { data: result, error } = await supabase.functions.invoke("validate-import-data", {
        body: {
          importType,
          data,
          schema,
          companyId,
        },
      });

      if (error) {
        console.error("Validation error:", error);
        // Fallback to basic validation
        const basicResult = performBasicValidation(data, schema);
        setValidationResult(basicResult);
        return basicResult;
      }

      setValidationResult(result);
      return result;
    } catch (err) {
      console.error("Validation failed:", err);
      // Fallback to basic validation
      const basicResult = performBasicValidation(data, schema);
      setValidationResult(basicResult);
      return basicResult;
    } finally {
      setIsValidating(false);
    }
  };

  const performBasicValidation = (
    data: Record<string, string>[],
    schema: Record<string, { required?: boolean; type?: string; maxLength?: number; pattern?: RegExp; values?: string[] }>
  ): ValidationResult => {
    // Update state immediately
    setParsedData(data);
    setIsValidating(true);
    
    const issues: ValidationIssue[] = [];
    let errorCount = 0;
    let warningCount = 0;

    data.forEach((row, index) => {
      const rowNum = index + 2; // Account for header row and 1-based indexing

      Object.entries(schema).forEach(([field, rules]) => {
        const value = row[field] || "";

        // Required field check
        if (rules.required && !value.trim()) {
          issues.push({
            row: rowNum,
            field,
            value,
            issue: `${field} is required`,
            severity: "error",
            suggestion: `Please provide a value for ${field}`,
          });
          errorCount++;
          return;
        }

        if (!value.trim()) return;

        // Type validation
        if (rules.type === "date" && value) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value) && isNaN(Date.parse(value))) {
            issues.push({
              row: rowNum,
              field,
              value,
              issue: "Invalid date format",
              severity: "error",
              suggestion: "Use YYYY-MM-DD format (e.g., 2024-01-15)",
            });
            errorCount++;
          }
        }

        if (rules.type === "email" && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            issues.push({
              row: rowNum,
              field,
              value,
              issue: "Invalid email format",
              severity: "error",
              suggestion: "Provide a valid email address",
            });
            errorCount++;
          }
        }

        if (rules.type === "number" && value) {
          if (isNaN(Number(value))) {
            issues.push({
              row: rowNum,
              field,
              value,
              issue: "Must be a number",
              severity: "error",
              suggestion: "Provide a valid numeric value",
            });
            errorCount++;
          }
        }

        // Max length check
        if (rules.maxLength && value.length > rules.maxLength) {
          issues.push({
            row: rowNum,
            field,
            value: value.substring(0, 20) + "...",
            issue: `Exceeds maximum length of ${rules.maxLength}`,
            severity: "warning",
            suggestion: `Shorten to ${rules.maxLength} characters or less`,
          });
          warningCount++;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          issues.push({
            row: rowNum,
            field,
            value,
            issue: "Invalid format",
            severity: "error",
            suggestion: "Check the expected format in the template",
          });
          errorCount++;
        }

        // Allowed values check
        if (rules.values && !rules.values.includes(value.toLowerCase())) {
          issues.push({
            row: rowNum,
            field,
            value,
            issue: `Value not in allowed list`,
            severity: "error",
            suggestion: `Use one of: ${rules.values.join(", ")}`,
          });
          errorCount++;
        }
      });
    });

    const validRows = data.length - new Set(issues.filter(i => i.severity === "error").map(i => i.row)).size;

    const result: ValidationResult = {
      isValid: errorCount === 0,
      totalRows: data.length,
      validRows,
      errorCount,
      warningCount,
      issues,
    };

    // Update state with validation result
    setValidationResult(result);
    setIsValidating(false);

    return result;
  };

  const generateReport = (result: ValidationResult): string => {
    const lines = [
      "=".repeat(60),
      `HR DATA IMPORT VALIDATION REPORT`,
      `Import Type: ${importType}`,
      `Generated: ${new Date().toLocaleString()}`,
      "=".repeat(60),
      "",
      "SUMMARY",
      "-".repeat(30),
      `Total Rows: ${result.totalRows}`,
      `Valid Rows: ${result.validRows}`,
      `Errors: ${result.errorCount}`,
      `Warnings: ${result.warningCount}`,
      `Status: ${result.isValid ? "READY FOR IMPORT" : "ISSUES MUST BE RESOLVED"}`,
      "",
    ];

    if (result.issues.length > 0) {
      lines.push("DETAILED ISSUES");
      lines.push("-".repeat(30));
      lines.push("");

      const errorsByRow = result.issues.reduce((acc, issue) => {
        if (!acc[issue.row]) acc[issue.row] = [];
        acc[issue.row].push(issue);
        return acc;
      }, {} as Record<number, ValidationIssue[]>);

      Object.entries(errorsByRow).forEach(([row, issues]) => {
        lines.push(`Row ${row}:`);
        issues.forEach(issue => {
          lines.push(`  [${issue.severity.toUpperCase()}] ${issue.field}: ${issue.issue}`);
          lines.push(`    Value: "${issue.value}"`);
          if (issue.suggestion) {
            lines.push(`    Suggestion: ${issue.suggestion}`);
          }
        });
        lines.push("");
      });
    }

    lines.push("");
    lines.push("=".repeat(60));
    lines.push("END OF REPORT");
    lines.push("=".repeat(60));

    return lines.join("\n");
  };

  const downloadReport = () => {
    if (!validationResult) return;

    const report = generateReport(validationResult);
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${importType}_validation_report_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Validation report downloaded");
  };

  const reset = () => {
    setValidationResult(null);
    setParsedData([]);
    setIsValidating(false);
  };

  return {
    isValidating,
    validationResult,
    parsedData,
    parseCSV,
    validateWithAI,
    performBasicValidation,
    downloadReport,
    reset,
  };
}
