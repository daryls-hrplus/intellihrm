import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyRelationships } from "@/hooks/useCompanyRelationships";
import { parsePositionCode } from "@/utils/validateReportingRelationship";
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
  GitBranch
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
  currentSupervisorTitle: string | null;
  currentSupervisorCompanyCode: string | null;
  newSupervisorId: string | null;
  newSupervisorTitle: string | null;
  newSupervisorCompanyCode: string | null;
  newSupervisorCompanyName: string | null;
  isCrossCompany: boolean;
  status: "valid" | "error" | "warning";
  message: string;
}

type ReportingMode = "primary" | "matrix";

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
      // Key by company_id|code for explicit lookups
      const positionsByCompanyAndCode = new Map<string, any>();
      // Key by just code for same-company lookups
      const positionsByCode = new Map<string, any>();
      const positionsById = new Map<string, any>();
      
      positions?.forEach(p => {
        const company = p.company as any;
        const key = `${company?.code?.toUpperCase()}:${p.code?.toUpperCase()}`;
        positionsByCompanyAndCode.set(key, { ...p, companyCode: company?.code, companyName: company?.name });
        
        // For same-company positions, also index by just code
        if (p.company_id === profile.company_id) {
          positionsByCode.set(p.code?.toUpperCase() || "", { ...p, companyCode: company?.code, companyName: company?.name });
        }
        
        positionsById.set(p.id, { ...p, companyCode: company?.code, companyName: company?.name });
      });
      
      const results: ValidationResult[] = data.map(row => {
        // Parse the position code (may have COMPANY:CODE format)
        const { companyCode: posCompanyCode, positionCode: posCode } = parsePositionCode(row.position_code);
        
        // Find the position
        let position: any = null;
        if (posCompanyCode) {
          position = positionsByCompanyAndCode.get(`${posCompanyCode}:${posCode.toUpperCase()}`);
        } else {
          // First try same company, then search all
          position = positionsByCode.get(posCode.toUpperCase());
          if (!position) {
            // Search across all positions
            for (const [key, pos] of positionsByCompanyAndCode) {
              if (key.endsWith(`:${posCode.toUpperCase()}`)) {
                position = pos;
                break;
              }
            }
          }
        }
        
        // Parse the supervisor code
        const { companyCode: supCompanyCode, positionCode: supCode } = parsePositionCode(row.reports_to_position_code);
        
        // Find the new supervisor
        let newSupervisor: any = null;
        if (row.reports_to_position_code) {
          if (supCompanyCode) {
            newSupervisor = positionsByCompanyAndCode.get(`${supCompanyCode}:${supCode.toUpperCase()}`);
          } else {
            // First try same company as the position being updated
            if (position) {
              const positionCompanyCode = position.companyCode;
              newSupervisor = positionsByCompanyAndCode.get(`${positionCompanyCode?.toUpperCase()}:${supCode.toUpperCase()}`);
            }
            // Fallback to current user's company
            if (!newSupervisor) {
              newSupervisor = positionsByCode.get(supCode.toUpperCase());
            }
          }
        }
        
        // Get current supervisor
        let currentSupervisorTitle: string | null = null;
        let currentSupervisorCompanyCode: string | null = null;
        if (position?.reports_to_position_id) {
          const currentSup = positionsById.get(position.reports_to_position_id);
          currentSupervisorTitle = currentSup?.title || null;
          currentSupervisorCompanyCode = currentSup?.companyCode || null;
        }
        
        // Determine if this is a cross-company relationship
        const isCrossCompany = position && newSupervisor && position.company_id !== newSupervisor.company_id;
        
        // Validation checks
        if (!position) {
          return {
            ...row,
            positionId: null,
            positionTitle: null,
            positionCompanyCode: null,
            positionCompanyName: null,
            currentSupervisorTitle: null,
            currentSupervisorCompanyCode: null,
            newSupervisorId: null,
            newSupervisorTitle: null,
            newSupervisorCompanyCode: null,
            newSupervisorCompanyName: null,
            isCrossCompany: false,
            status: "error" as const,
            message: "Position code not found"
          };
        }
        
        if (row.reports_to_position_code && !newSupervisor) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            positionCompanyCode: position.companyCode,
            positionCompanyName: position.companyName,
            currentSupervisorTitle,
            currentSupervisorCompanyCode,
            newSupervisorId: null,
            newSupervisorTitle: null,
            newSupervisorCompanyCode: null,
            newSupervisorCompanyName: null,
            isCrossCompany: false,
            status: "error" as const,
            message: "Reports-to position code not found"
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
            currentSupervisorTitle,
            currentSupervisorCompanyCode,
            newSupervisorId: null,
            newSupervisorTitle: null,
            newSupervisorCompanyCode: null,
            newSupervisorCompanyName: null,
            isCrossCompany: false,
            status: "error" as const,
            message: "Position cannot report to itself"
          };
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
              currentSupervisorTitle,
              currentSupervisorCompanyCode,
              newSupervisorId: null,
              newSupervisorTitle: newSupervisor.title,
              newSupervisorCompanyCode: newSupervisor.companyCode,
              newSupervisorCompanyName: newSupervisor.companyName,
              isCrossCompany: true,
              status: "error" as const,
              message: `Cross-company not allowed: ${validation.reason}`
            };
          }
        }
        
        // Warning if clearing supervisor
        if (!row.reports_to_position_code && position.reports_to_position_id) {
          return {
            ...row,
            positionId: position.id,
            positionTitle: position.title,
            positionCompanyCode: position.companyCode,
            positionCompanyName: position.companyName,
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
        // Update primary reporting relationships
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
        // Update matrix supervisors (would need additional logic for add/remove actions)
        for (const row of validRows) {
          // For matrix mode, we insert into position_matrix_supervisors
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
  };

  const validCount = validationResults.filter(r => r.status === "valid").length;
  const warningCount = validationResults.filter(r => r.status === "warning").length;
  const errorCount = validationResults.filter(r => r.status === "error").length;
  const crossCompanyCount = validationResults.filter(r => r.isCrossCompany && r.status !== "error").length;
  const updateableCount = validCount + warningCount;

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
              <div className="flex items-center gap-4 flex-wrap">
                <h4 className="font-medium text-sm">Step 3: Review & Confirm</h4>
                <div className="flex gap-2 flex-wrap">
                  {validCount > 0 && (
                    <Badge variant="default" className="bg-green-600">
                      {validCount} Valid
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                      {warningCount} Warnings
                    </Badge>
                  )}
                  {errorCount > 0 && (
                    <Badge variant="destructive">
                      {errorCount} Errors
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

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Current Supervisor</TableHead>
                      <TableHead>New Supervisor</TableHead>
                      <TableHead>Supervisor Company</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.map((result, idx) => (
                      <TableRow key={idx} className={getRowClass(result.status)}>
                        <TableCell>{getStatusIcon(result.status)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-mono text-sm">{result.position_code}</p>
                            <p className="text-xs text-muted-foreground">{result.positionTitle || "-"}</p>
                          </div>
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
                          <div className="text-sm">
                            {result.newSupervisorTitle || "-"}
                          </div>
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
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {result.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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
    </div>
  );
}
