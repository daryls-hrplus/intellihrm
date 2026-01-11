import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ValidationResult, ValidationIssue } from "./ImportValidationReport";
import { 
  validateFieldWithSuggestions, 
  clearValidationCache,
  type FieldValidationType 
} from "./utils/validationSuggestions";

interface UseImportValidationProps {
  importType: string;
  companyId?: string;
}

// Field type mapping for enhanced validation
const FIELD_TYPE_MAP: Record<string, { type: FieldValidationType; lookupCategory?: string }> = {
  country: { type: "country" },
  nationality: { type: "country" },
  birth_country: { type: "country" },
  country_of_birth: { type: "country" },
  work_country: { type: "country" },
  currency: { type: "currency" },
  salary_currency: { type: "currency" },
  payment_currency: { type: "currency" },
  gender: { type: "gender" },
  sex: { type: "gender" },
  marital_status: { type: "marital_status" },
  employee_status: { type: "lookup", lookupCategory: "employee_status" },
  employee_type: { type: "lookup", lookupCategory: "employee_type" },
  termination_reason: { type: "lookup", lookupCategory: "termination_reason" },
  contract_type: { type: "lookup", lookupCategory: "contract_type" },
};

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
        // Fallback to enhanced basic validation
        const basicResult = await performEnhancedValidation(data, schema);
        setValidationResult(basicResult);
        return basicResult;
      }

      setValidationResult(result);
      return result;
    } catch (err) {
      console.error("Validation failed:", err);
      // Fallback to enhanced basic validation
      const basicResult = await performEnhancedValidation(data, schema);
      setValidationResult(basicResult);
      return basicResult;
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Enhanced validation with smart suggestions for reference data fields
   */
  const performEnhancedValidation = async (
    data: Record<string, string>[],
    schema: Record<string, { required?: boolean; type?: string; maxLength?: number; pattern?: RegExp; values?: string[] }>
  ): Promise<ValidationResult> => {
    // Update state immediately
    setParsedData(data);
    setIsValidating(true);
    
    // Clear cache to ensure fresh data
    clearValidationCache();
    
    const issues: ValidationIssue[] = [];
    let errorCount = 0;
    let warningCount = 0;

    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      const rowNum = index + 2; // Account for header row and 1-based indexing

      for (const [field, rules] of Object.entries(schema)) {
        const value = row[field] || "";

        // Required field check
        if (rules.required && !value.trim()) {
          issues.push({
            row: rowNum,
            field,
            value,
            issue: `${formatFieldName(field)} is required`,
            severity: "error",
            suggestion: `Please provide a value for ${formatFieldName(field)}`,
          });
          errorCount++;
          continue;
        }

        if (!value.trim()) continue;

        // Enhanced reference data validation
        const fieldTypeInfo = FIELD_TYPE_MAP[field.toLowerCase()];
        if (fieldTypeInfo) {
          const enhancedResult = await validateFieldWithSuggestions(
            field,
            value,
            fieldTypeInfo.type,
            fieldTypeInfo.lookupCategory
          );

          if (!enhancedResult.isValid) {
            issues.push({
              row: rowNum,
              field,
              value,
              issue: enhancedResult.message || `Invalid ${field} value`,
              severity: "error",
              suggestion: enhancedResult.suggestion || `Check valid values in Reference Data Catalog`,
            });
            errorCount++;
            continue;
          } else if (enhancedResult.autoCorrect) {
            issues.push({
              row: rowNum,
              field,
              value,
              issue: `Value will be normalized to '${enhancedResult.autoCorrect}'`,
              severity: "warning",
              suggestion: enhancedResult.suggestion,
            });
            warningCount++;
          }
        }

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
              suggestion: "Provide a valid email address (e.g., john.doe@company.com)",
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
              suggestion: "Provide a valid numeric value (e.g., 50000)",
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
            issue: `Exceeds maximum length of ${rules.maxLength} characters`,
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

        // Allowed values check (for non-reference-data fields)
        if (rules.values && !fieldTypeInfo) {
          const matchedValue = rules.values.find(v => v.toLowerCase() === value.toLowerCase());
          if (!matchedValue) {
            issues.push({
              row: rowNum,
              field,
              value,
              issue: `Value not in allowed list`,
              severity: "error",
              suggestion: `Use one of: ${rules.values.slice(0, 5).join(", ")}${rules.values.length > 5 ? "..." : ""}`,
            });
            errorCount++;
          }
        }
      }
    }

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

  // Keep the old function name for backwards compatibility
  const performBasicValidation = (
    data: Record<string, string>[],
    schema: Record<string, { required?: boolean; type?: string; maxLength?: number; pattern?: RegExp; values?: string[] }>
  ): ValidationResult => {
    // This is now a synchronous wrapper that triggers the async enhanced validation
    performEnhancedValidation(data, schema);
    
    // Return a placeholder result - the actual result will be set asynchronously
    return {
      isValid: false,
      totalRows: data.length,
      validRows: 0,
      errorCount: 0,
      warningCount: 0,
      issues: [],
    };
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
      lines.push("TIP: For valid reference data codes (countries, currencies, etc.),");
      lines.push("     visit HR Hub > Reference Data Catalog");
      lines.push("");

      const errorsByRow = result.issues.reduce((acc, issue) => {
        if (!acc[issue.row]) acc[issue.row] = [];
        acc[issue.row].push(issue);
        return acc;
      }, {} as Record<number, ValidationIssue[]>);

      Object.entries(errorsByRow).forEach(([row, issues]) => {
        lines.push(`Row ${row}:`);
        issues.forEach(issue => {
          lines.push(`  [${issue.severity.toUpperCase()}] ${formatFieldName(issue.field)}: ${issue.issue}`);
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
    lines.push("NEED HELP?");
    lines.push("-".repeat(30));
    lines.push("• View valid codes: HR Hub > Reference Data Catalog");
    lines.push("• Country codes: Use ISO 3166-1 alpha-2 (e.g., US, GB, TT)");
    lines.push("• Currency codes: Use ISO 4217 (e.g., USD, EUR, TTD)");
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
    clearValidationCache();
  };

  return {
    isValidating,
    validationResult,
    parsedData,
    parseCSV,
    validateWithAI,
    performBasicValidation,
    performEnhancedValidation,
    downloadReport,
    reset,
  };
}

/**
 * Format field name for display (convert snake_case to Title Case)
 */
function formatFieldName(field: string): string {
  return field
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
