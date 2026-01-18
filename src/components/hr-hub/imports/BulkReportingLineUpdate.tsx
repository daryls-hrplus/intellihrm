import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyRelationships } from "@/hooks/useCompanyRelationships";
import { parsePositionCode } from "@/utils/validateReportingRelationship";
import { detectCircularReferencesInBatch, Position } from "@/utils/detectCircularReporting";
import { PositionReferenceDrawer } from "./PositionReferenceDrawer";
import { CompanyReferenceDrawer } from "./CompanyReferenceDrawer";
import { ReportingLineFieldSpecs } from "./ReportingLineFieldSpecs";
import { Link } from "react-router-dom";
import {
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  Loader2,
  Building2,
  GitBranch,
  Search,
  Filter,
  FileDown,
  Edit2,
  Save,
  X,
  Copy,
  ListOrdered,
  ExternalLink
} from "lucide-react";

interface ParsedRow {
  position_code: string;
  reports_to_position_code: string;
  rowIndex: number;
}

interface ValidationResult extends ParsedRow {
  positionId: string | null;
  positionTitle: string | null;
  positionCompanyCode: string | null;
  positionCompanyName: string | null;
  currentSupervisorId: string | null;
  currentSupervisorTitle: string | null;
  currentSupervisorCompanyCode: string | null;
  newSupervisorId: string | null;
  newSupervisorTitle: string | null;
  newSupervisorCompanyCode: string | null;
  newSupervisorCompanyName: string | null;
  isCrossCompany: boolean;
  status: "valid" | "error" | "warning";
  message: string;
  errorType?: string;
}

type ReportingMode = "primary" | "matrix";
type FilterMode = "all" | "errors" | "warnings" | "valid";

export function BulkReportingLineUpdate() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);
  const [reportingMode, setReportingMode] = useState<ReportingMode>("primary");
  
  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<{ position_code: string; reports_to_position_code: string }>({ position_code: "", reports_to_position_code: "" });
  
  // Reference data drawers state
  const [positionDrawerOpen, setPositionDrawerOpen] = useState(false);
  const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);

  const { 
    groupCompanies, 
    isValidReportingRelationship,
    isLoading: isLoadingRelationships 
  } = useCompanyRelationships(profile?.company_id);

  const downloadTemplate = () => {
    const template = reportingMode === "primary" 
      ? `position_code,reports_to_position_code
HR-COORD-001,HR-MGR-001
ACCT-CLERK-001,ACCT-MGR-001
FIN-ANALYST-001,AUR-CORP:CFO-001`
      : `position_code,matrix_supervisor_code,relationship_type,action
HR-COORD-001,AUR-CORP:HR-DIR-001,functional,add
FIN-ANALYST-001,PROJ:PM-001,project,add
FIN-ANALYST-001,OLD-MGR-001,functional,remove`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = reportingMode === "primary" 
      ? "reporting_line_update_template.csv" 
      : "matrix_supervisor_update_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.trim().split("\n");
    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    
    const posCodeIdx = headers.indexOf("position_code");
    const reportsToIdx = reportingMode === "primary" 
      ? headers.indexOf("reports_to_position_code")
      : headers.indexOf("matrix_supervisor_code");
    
    if (posCodeIdx === -1 || reportsToIdx === -1) {
      const expectedCol = reportingMode === "primary" ? "reports_to_position_code" : "matrix_supervisor_code";
      throw new Error(`CSV must have 'position_code' and '${expectedCol}' columns`);
    }
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, idx) => {
        const values = line.split(",").map(v => v.trim());
        return {
          position_code: values[posCodeIdx] || "",
          reports_to_position_code: values[reportsToIdx] || "",
          rowIndex: idx + 2
        };
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setValidationResults([]);
    setUpdateComplete(false);
    setSearchTerm("");
    setFilterMode("all");
    
    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      
      if (parsed.length === 0) {
        toast({
          title: "Empty File",
          description: "The CSV file contains no data rows.",
          variant: "destructive"
        });
        return;
      }
      
      // Auto-validate after parsing
      await validateData(parsed);
    } catch (error) {
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive"
      });
    }
  };

  const validateData = async (data: ParsedRow[]) => {
    if (!profile?.company_id) {
      toast({
        title: "No Company",
        description: "Please ensure you are associated with a company.",
        variant: "destructive"
      });
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Get all company IDs that we can fetch positions from
      const validCompanyIds = groupCompanies.map(c => c.id);
      
      // Fetch all positions from valid companies
      const { data: positions, error } = await supabase
        .from("positions")
        .select(`
          id, 
          code, 
          title, 
          reports_to_position_id,
          company_id,
          company:companies(id, code, name)
        `)
        .in("company_id", validCompanyIds.length > 0 ? validCompanyIds : [profile.company_id]);
      
      if (error) throw error;
      
      // Build lookup maps
      const positionsByCompanyAndCode = new Map<string, any>();
      const positionsByCode = new Map<string, any>();
      const positionsById = new Map<string, Position & { companyCode: string; companyName: string }>();
      
      positions?.forEach(p => {
        const company = p.company as any;
        const key = `${company?.code?.toUpperCase()}:${p.code?.toUpperCase()}`;
        const posData = { ...p, companyCode: company?.code, companyName: company?.name };
        positionsByCompanyAndCode.set(key, posData);
        
        if (p.company_id === profile.company_id) {
          positionsByCode.set(p.code?.toUpperCase() || "", posData);
        }
        
        positionsById.set(p.id, posData);
      });

      // Phase 1: Detect in-file duplicates
      const seenPositionCodes = new Map<string, number>();
      const duplicateRows = new Set<number>();
      
      data.forEach((row, index) => {
        const posCode = row.position_code.toUpperCase();
        if (seenPositionCodes.has(posCode)) {
          duplicateRows.add(index);
          duplicateRows.add(seenPositionCodes.get(posCode)!);
        } else {
          seenPositionCodes.set(posCode, index);
        }
      });

      // First pass: Resolve all positions and supervisors
      const resolvedData = data.map((row, index) => {
        const { companyCode: posCompanyCode, positionCode: posCode } = parsePositionCode(row.position_code);
        
        let position: any = null;
        if (posCompanyCode) {
          position = positionsByCompanyAndCode.get(`${posCompanyCode}:${posCode.toUpperCase()}`);
        } else {
          position = positionsByCode.get(posCode.toUpperCase());
          if (!position) {
            for (const [key, pos] of positionsByCompanyAndCode) {
              if (key.endsWith(`:${posCode.toUpperCase()}`)) {
                position = pos;
                break;
              }
            }
          }
        }
        
        const { companyCode: supCompanyCode, positionCode: supCode } = parsePositionCode(row.reports_to_position_code);
        
        let newSupervisor: any = null;
        if (row.reports_to_position_code) {
          if (supCompanyCode) {
            newSupervisor = positionsByCompanyAndCode.get(`${supCompanyCode}:${supCode.toUpperCase()}`);
          } else {
            if (position) {
              const positionCompanyCode = position.companyCode;
              newSupervisor = positionsByCompanyAndCode.get(`${positionCompanyCode?.toUpperCase()}:${supCode.toUpperCase()}`);
            }
            if (!newSupervisor) {
              newSupervisor = positionsByCode.get(supCode.toUpperCase());
            }
          }
        }
        
        return { ...row, index, position, newSupervisor };
      });

      // Phase 2: Detect circular references using batch detection
      const proposedChanges = resolvedData
        .filter(r => r.position && r.newSupervisor)
        .map(r => ({
          positionId: r.position.id,
          newSupervisorId: r.newSupervisor?.id || null,
          positionCode: r.position_code
        }));
      
      const circularResults = detectCircularReferencesInBatch(proposedChanges, positionsById);

      // Final validation pass
      const results: ValidationResult[] = resolvedData.map((row, index) => {
        const { position, newSupervisor } = row;
        
        // Get current supervisor
        let currentSupervisorId: string | null = null;
        let currentSupervisorTitle: string | null = null;
        let currentSupervisorCompanyCode: string | null = null;
        if (position?.reports_to_position_id) {
          currentSupervisorId = position.reports_to_position_id;
          const currentSup = positionsById.get(position.reports_to_position_id);
          currentSupervisorTitle = currentSup?.title || null;
          currentSupervisorCompanyCode = currentSup?.companyCode || null;
        }
        
        const isCrossCompany = position && newSupervisor && position.company_id !== newSupervisor.company_id;

        // Check for in-file duplicate
        if (duplicateRows.has(index)) {
          const firstRow = seenPositionCodes.get(row.position_code.toUpperCase());
          return {
            ...row,
            positionId: position?.id || null,
            positionTitle: position?.title || null,
            positionCompanyCode: position?.companyCode || null,
            positionCompanyName: position?.companyName || null,
            currentSupervisorId,
            currentSupervisorTitle,
            currentSupervisorCompanyCode,
            newSupervisorId: null,
            newSupervisorTitle: null,
            newSupervisorCompanyCode: null,
            newSupervisorCompanyName: null,
            isCrossCompany: false,
            status: "error" as const,
            message: `Duplicate: Position also appears in row ${(firstRow || 0) + 2}`,
            errorType: "duplicate"
          };
        }
        
        if (!position) {
          return {
            ...row,
            positionId: null,
            positionTitle: null,
            positionCompanyCode: null,
            positionCompanyName: null,
            currentSupervisorId: null,
            currentSupervisorTitle: null,
            currentSupervisorCompanyCode: null,
            newSupervisorId: null,
            newSupervisorTitle: null,
            newSupervisorCompanyCode: null,
            newSupervisorCompanyName: null,
            isCrossCompany: false,
            status: "error" as const,
            message: "Position code not found",
            errorType: "not_found"
          };
        }
        
        if (row.reports_to_position_code && !newSupervisor) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            positionCompanyCode: position.companyCode,
            positionCompanyName: position.companyName,
            currentSupervisorId,
            currentSupervisorTitle,
            currentSupervisorCompanyCode,
            newSupervisorId: null,
            newSupervisorTitle: null,
            newSupervisorCompanyCode: null,
            newSupervisorCompanyName: null,
            isCrossCompany: false,
            status: "error" as const,
            message: "Reports-to position code not found",
            errorType: "supervisor_not_found"
          };
        }
        
        // Check for self-reference
        if (newSupervisor && position.id === newSupervisor.id) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            positionCompanyCode: position.companyCode,
            positionCompanyName: position.companyName,
            currentSupervisorId,
            currentSupervisorTitle,
            currentSupervisorCompanyCode,
            newSupervisorId: null,
            newSupervisorTitle: null,
            newSupervisorCompanyCode: null,
            newSupervisorCompanyName: null,
            isCrossCompany: false,
            status: "error" as const,
            message: "Position cannot report to itself",
            errorType: "self_reference"
          };
        }

        // Check for circular reference
        if (newSupervisor) {
          const circularCheck = circularResults.get(position.id);
          if (circularCheck?.isCircular) {
            const chainDisplay = circularCheck.chainCodes?.slice(0, 4).join(" → ") || "";
            return {
              ...row,
              positionId: position.id,
              positionTitle: position.title,
              positionCompanyCode: position.companyCode,
              positionCompanyName: position.companyName,
              currentSupervisorId,
              currentSupervisorTitle,
              currentSupervisorCompanyCode,
              newSupervisorId: null,
              newSupervisorTitle: newSupervisor.title,
              newSupervisorCompanyCode: newSupervisor.companyCode,
              newSupervisorCompanyName: newSupervisor.companyName,
              isCrossCompany,
              status: "error" as const,
              message: `Circular reference: ${chainDisplay}...`,
              errorType: "circular"
            };
          }
        }
        
        // Validate cross-company relationship
        if (isCrossCompany) {
          const validation = isValidReportingRelationship(
            position.company_id,
            newSupervisor.company_id,
            reportingMode
          );
          
          if (!validation.isValid) {
            return {
              ...row,
              positionId: position.id,
              positionTitle: position.title,
              positionCompanyCode: position.companyCode,
              positionCompanyName: position.companyName,
              currentSupervisorId,
              currentSupervisorTitle,
              currentSupervisorCompanyCode,
              newSupervisorId: null,
              newSupervisorTitle: newSupervisor.title,
              newSupervisorCompanyCode: newSupervisor.companyCode,
              newSupervisorCompanyName: newSupervisor.companyName,
              isCrossCompany: true,
              status: "error" as const,
              message: `Cross-company not allowed: ${validation.reason}`,
              errorType: "cross_company"
            };
          }
        }

        // Check for no change (already reports to this supervisor)
        if (newSupervisor && position.reports_to_position_id === newSupervisor.id) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            positionCompanyCode: position.companyCode,
            positionCompanyName: position.companyName,
            currentSupervisorId,
            currentSupervisorTitle,
            currentSupervisorCompanyCode,
            newSupervisorId: newSupervisor.id,
            newSupervisorTitle: newSupervisor.title,
            newSupervisorCompanyCode: newSupervisor.companyCode,
            newSupervisorCompanyName: newSupervisor.companyName,
            isCrossCompany,
            status: "warning" as const,
            message: "No change: Already reports to this supervisor"
          };
        }
        
        // Warning if clearing supervisor
        if (!row.reports_to_position_code && position.reports_to_position_id) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            positionCompanyCode: position.companyCode,
            positionCompanyName: position.companyName,
            currentSupervisorId,
            currentSupervisorTitle,
            currentSupervisorCompanyCode,
            newSupervisorId: null,
            newSupervisorTitle: "(None)",
            newSupervisorCompanyCode: null,
            newSupervisorCompanyName: null,
            isCrossCompany: false,
            status: "warning" as const,
            message: "This will clear the existing supervisor"
          };
        }
        
        return {
          ...row,
          positionId: position.id,
          positionTitle: position.title,
          positionCompanyCode: position.companyCode,
          positionCompanyName: position.companyName,
          currentSupervisorId,
          currentSupervisorTitle,
          currentSupervisorCompanyCode,
          newSupervisorId: newSupervisor?.id || null,
          newSupervisorTitle: newSupervisor?.title || "(None)",
          newSupervisorCompanyCode: newSupervisor?.companyCode || null,
          newSupervisorCompanyName: newSupervisor?.companyName || null,
          isCrossCompany,
          status: "valid" as const,
          message: isCrossCompany ? `Cross-company: ${position.companyCode} → ${newSupervisor?.companyCode}` : "Ready to update"
        };
      });
      
      setValidationResults(results);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Failed to validate data",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const executeUpdate = async () => {
    const validRows = validationResults.filter(r => r.status !== "error" && r.positionId);
    
    if (validRows.length === 0) {
      toast({
        title: "No Valid Rows",
        description: "There are no valid rows to update.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      if (reportingMode === "primary") {
        for (const row of validRows) {
          const { error } = await supabase
            .from("positions")
            .update({ reports_to_position_id: row.newSupervisorId })
            .eq("id", row.positionId!);
          
          if (error) {
            errorCount++;
            console.error(`Failed to update ${row.position_code}:`, error);
          } else {
            successCount++;
          }
        }
      } else {
        for (const row of validRows) {
          const { error } = await supabase
            .from("position_matrix_supervisors")
            .upsert({
              position_id: row.positionId,
              matrix_supervisor_position_id: row.newSupervisorId,
              relationship_type: "functional",
              is_active: true,
            }, {
              onConflict: "position_id,matrix_supervisor_position_id"
            });
          
          if (error) {
            errorCount++;
            console.error(`Failed to update matrix for ${row.position_code}:`, error);
          } else {
            successCount++;
          }
        }
      }
      
      setUpdateComplete(true);
      
      toast({
        title: "Update Complete",
        description: `Successfully updated ${successCount} position(s).${errorCount > 0 ? ` ${errorCount} failed.` : ""}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Update Error",
        description: error instanceof Error ? error.message : "Failed to update positions",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParsedData([]);
    setValidationResults([]);
    setUpdateComplete(false);
    setSearchTerm("");
    setFilterMode("all");
    setEditingRowIndex(null);
  };

  // Export errors to CSV
  const exportErrorsToCSV = () => {
    const errorRows = validationResults.filter(r => r.status === "error");
    if (errorRows.length === 0) return;

    const csvHeaders = ["row", "position_code", "reports_to_position_code", "status", "error_type", "message"];
    const csvRows = errorRows.map(row => [
      row.rowIndex,
      row.position_code,
      row.reports_to_position_code,
      row.status,
      row.errorType || "",
      `"${row.message.replace(/"/g, '""')}"`
    ].join(","));

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporting_line_errors.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `${errorRows.length} error(s) exported to CSV`
    });
  };

  // Handle inline edit
  const startEditing = (idx: number) => {
    const row = validationResults[idx];
    setEditingRowIndex(idx);
    setEditedValues({
      position_code: row.position_code,
      reports_to_position_code: row.reports_to_position_code
    });
  };

  const cancelEditing = () => {
    setEditingRowIndex(null);
    setEditedValues({ position_code: "", reports_to_position_code: "" });
  };

  const saveEdit = async () => {
    if (editingRowIndex === null) return;

    // Update the parsed data
    const newParsedData = [...parsedData];
    newParsedData[editingRowIndex] = {
      ...newParsedData[editingRowIndex],
      position_code: editedValues.position_code,
      reports_to_position_code: editedValues.reports_to_position_code
    };
    setParsedData(newParsedData);
    setEditingRowIndex(null);

    // Re-validate
    await validateData(newParsedData);

    toast({
      title: "Row Updated",
      description: "The row has been updated and re-validated."
    });
  };

  // Computed values
  const validCount = validationResults.filter(r => r.status === "valid").length;
  const warningCount = validationResults.filter(r => r.status === "warning").length;
  const errorCount = validationResults.filter(r => r.status === "error").length;
  const duplicateCount = validationResults.filter(r => r.errorType === "duplicate").length;
  const crossCompanyCount = validationResults.filter(r => r.isCrossCompany && r.status !== "error").length;
  const updateableCount = validCount + warningCount;

  // Filtered results
  const filteredResults = useMemo(() => {
    let results = validationResults;

    // Apply status filter
    if (filterMode !== "all") {
      results = results.filter(r => {
        if (filterMode === "errors") return r.status === "error";
        if (filterMode === "warnings") return r.status === "warning";
        if (filterMode === "valid") return r.status === "valid";
        return true;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(r => 
        r.position_code.toLowerCase().includes(term) ||
        r.reports_to_position_code.toLowerCase().includes(term) ||
        r.positionTitle?.toLowerCase().includes(term) ||
        r.newSupervisorTitle?.toLowerCase().includes(term) ||
        r.message.toLowerCase().includes(term)
      );
    }

    return results;
  }, [validationResults, filterMode, searchTerm]);

  const getStatusIcon = (status: ValidationResult["status"]) => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getRowClass = (status: ValidationResult["status"]) => {
    switch (status) {
      case "valid":
        return "bg-green-50 dark:bg-green-950/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/20";
      case "error":
        return "bg-red-50 dark:bg-red-950/20";
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Use this feature to bulk-update reporting relationships for existing positions. 
          Supports cross-company reporting within the same corporate group or with configured relationships.
          Use <code className="text-xs bg-muted px-1 rounded">COMPANY_CODE:POSITION_CODE</code> format for explicit cross-company references.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Update Reporting Lines
          </CardTitle>
          <CardDescription>
            Bulk update which positions report to which supervisors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reporting Mode Selection */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Reporting Type</h4>
            <Tabs value={reportingMode} onValueChange={(v) => { setReportingMode(v as ReportingMode); resetForm(); }}>
              <TabsList>
                <TabsTrigger value="primary" className="gap-2">
                  <div className="w-4 h-0.5 bg-current" />
                  Primary (Solid-Line)
                </TabsTrigger>
                <TabsTrigger value="matrix" className="gap-2">
                  <div className="w-4 h-0.5 border-t-2 border-dashed border-current" />
                  Matrix (Dotted-Line)
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {reportingMode === "primary" 
                ? "Primary reporting is for direct supervisors - used for payroll, performance reviews, and compliance."
                : "Matrix reporting is for functional/project relationships - used for cross-functional oversight and shared services."
              }
            </p>
          </div>

          {/* Reference Data Section */}
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ListOrdered className="h-4 w-4" />
                Reference Data for This Import
              </CardTitle>
              <CardDescription>
                These fields require specific codes. Click to view valid values or download as CSV.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPositionDrawerOpen(true)}
                  className="gap-2"
                >
                  <ListOrdered className="h-4 w-4" />
                  Position Codes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompanyDrawerOpen(true)}
                  className="gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Companies
                </Button>
                <Link to="/hr-hub/reference-data">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Full Reference Catalog
                  </Button>
                </Link>
              </div>
              
              {/* Field Specifications */}
              <ReportingLineFieldSpecs 
                mode={reportingMode} 
                onViewPositions={() => setPositionDrawerOpen(true)} 
              />
            </CardContent>
          </Card>

          {/* Group Companies Info */}
          {groupCompanies.length > 1 && (
            <div className="p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Corporate Group</span>
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
                Cross-company reporting is automatically allowed between these companies.
              </p>
            </div>
          )}

          {/* Step 1: Download Template */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Step 1: Download Template</h4>
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download {reportingMode === "primary" ? "Primary" : "Matrix"} Template
            </Button>
            <p className="text-xs text-muted-foreground">
              {reportingMode === "primary" 
                ? "Template includes position_code and reports_to_position_code columns"
                : "Template includes position_code, matrix_supervisor_code, relationship_type, and action columns"
              }
            </p>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Step 2: Upload Your File</h4>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isValidating || isUpdating || isLoadingRelationships}
                className="max-w-md"
              />
              {file && (
                <Badge variant="secondary">{file.name}</Badge>
              )}
            </div>
          </div>

          {/* Validation Progress */}
          {isValidating && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating positions across {groupCompanies.length} companies...
            </div>
          )}

          {/* Validation Results */}
          {validationResults.length > 0 && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="flex items-center gap-4 flex-wrap">
                <h4 className="font-medium text-sm">Step 3: Review & Confirm</h4>
                <div className="flex gap-2 flex-wrap">
                  {validCount > 0 && (
                    <Badge variant="default" className="bg-green-600 cursor-pointer" onClick={() => setFilterMode(filterMode === "valid" ? "all" : "valid")}>
                      {validCount} Valid
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="secondary" className="bg-yellow-500 text-white cursor-pointer" onClick={() => setFilterMode(filterMode === "warnings" ? "all" : "warnings")}>
                      {warningCount} Warnings
                    </Badge>
                  )}
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="cursor-pointer" onClick={() => setFilterMode(filterMode === "errors" ? "all" : "errors")}>
                      {errorCount} Errors
                    </Badge>
                  )}
                  {duplicateCount > 0 && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      <Copy className="h-3 w-3 mr-1" />
                      {duplicateCount} Duplicates
                    </Badge>
                  )}
                  {crossCompanyCount > 0 && (
                    <Badge variant="outline" className="border-blue-500 text-blue-600">
                      <GitBranch className="h-3 w-3 mr-1" />
                      {crossCompanyCount} Cross-Company
                    </Badge>
                  )}
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by position code, title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant={filterMode === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFilterMode("all")}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filterMode === "errors" ? "destructive" : "outline"} 
                    size="sm"
                    onClick={() => setFilterMode("errors")}
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    Errors
                  </Button>
                  <Button 
                    variant={filterMode === "warnings" ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => setFilterMode("warnings")}
                  >
                    Warnings
                  </Button>
                </div>
                {errorCount > 0 && (
                  <Button variant="outline" size="sm" onClick={exportErrorsToCSV}>
                    <FileDown className="h-4 w-4 mr-1" />
                    Export Errors
                  </Button>
                )}
              </div>

              {/* Results Table */}
              <div className="border rounded-lg">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 sticky top-0 bg-background">Status</TableHead>
                        <TableHead className="sticky top-0 bg-background">Position</TableHead>
                        <TableHead className="sticky top-0 bg-background">Company</TableHead>
                        <TableHead className="sticky top-0 bg-background">Current Supervisor</TableHead>
                        <TableHead className="sticky top-0 bg-background">New Supervisor</TableHead>
                        <TableHead className="sticky top-0 bg-background">Supervisor Company</TableHead>
                        <TableHead className="sticky top-0 bg-background">Message</TableHead>
                        <TableHead className="w-16 sticky top-0 bg-background">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No results match your filter
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredResults.map((result, displayIdx) => {
                          const originalIdx = validationResults.indexOf(result);
                          const isEditing = editingRowIndex === originalIdx;
                          
                          return (
                            <TableRow key={originalIdx} className={getRowClass(result.status)}>
                              <TableCell>{getStatusIcon(result.status)}</TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    value={editedValues.position_code}
                                    onChange={(e) => setEditedValues(prev => ({ ...prev, position_code: e.target.value }))}
                                    className="h-8 font-mono text-sm"
                                  />
                                ) : (
                                  <div>
                                    <p className="font-mono text-sm">{result.position_code}</p>
                                    <p className="text-xs text-muted-foreground">{result.positionTitle || "-"}</p>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {result.positionCompanyCode || "-"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {result.currentSupervisorTitle || "(None)"}
                                  {result.currentSupervisorCompanyCode && result.currentSupervisorCompanyCode !== result.positionCompanyCode && (
                                    <Badge variant="secondary" className="text-xs ml-1">
                                      {result.currentSupervisorCompanyCode}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    value={editedValues.reports_to_position_code}
                                    onChange={(e) => setEditedValues(prev => ({ ...prev, reports_to_position_code: e.target.value }))}
                                    className="h-8 font-mono text-sm"
                                  />
                                ) : (
                                  <div className="text-sm">
                                    {result.newSupervisorTitle || "-"}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {result.newSupervisorCompanyCode ? (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge 
                                        variant={result.isCrossCompany ? "default" : "outline"} 
                                        className={result.isCrossCompany ? "bg-blue-500" : "text-xs"}
                                      >
                                        {result.newSupervisorCompanyCode}
                                        {result.isCrossCompany && <GitBranch className="h-3 w-3 ml-1" />}
                                      </Badge>
                                    </TooltipTrigger>
                                    {result.isCrossCompany && (
                                      <TooltipContent>
                                        Cross-company reporting to {result.newSupervisorCompanyName}
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                ) : "-"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-xs">
                                <span className="truncate block" title={result.message}>
                                  {result.message}
                                </span>
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}>
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEditing}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => startEditing(originalIdx)}
                                    disabled={updateComplete}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Showing count */}
              {searchTerm || filterMode !== "all" ? (
                <p className="text-xs text-muted-foreground">
                  Showing {filteredResults.length} of {validationResults.length} rows
                </p>
              ) : null}

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {!updateComplete ? (
                  <>
                    <Button
                      onClick={executeUpdate}
                      disabled={updateableCount === 0 || isUpdating}
                      className="gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Update {updateableCount} Position{updateableCount !== 1 ? "s" : ""}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetForm} disabled={isUpdating}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={resetForm} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Start New Update
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reference Data Drawers */}
      <PositionReferenceDrawer 
        open={positionDrawerOpen} 
        onOpenChange={setPositionDrawerOpen} 
      />
      <CompanyReferenceDrawer 
        open={companyDrawerOpen} 
        onOpenChange={setCompanyDrawerOpen} 
      />
    </div>
  );
}
