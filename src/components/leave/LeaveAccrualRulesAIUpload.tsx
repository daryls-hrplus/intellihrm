import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, Sparkles, FileText, CheckCircle, AlertCircle, Loader2, Settings, ShieldAlert, Plus, Calculator, TrendingUp, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface ExtractedAccrualRule {
  name: string;
  description: string;
  leave_type_name: string;
  accrual_frequency: "daily" | "monthly" | "annually" | "bi_weekly" | "weekly";
  accrual_amount: number;
  years_of_service_min: number;
  years_of_service_max: number | null;
  employee_status: string | null;
  employee_type: string | null;
  priority: number;
  notes: string;
}

interface SchemaChange {
  fieldName: string;
  fieldType: string;
  description: string;
  reason: string;
  documentExcerpt?: string;
  suggestedValues?: string[];
  impact: "required" | "recommended" | "optional";
  affectedRules?: string[];
}

interface NewLeaveType {
  name: string;
  description?: string;
  reason: string;
}

interface MonthlyBreakdown {
  month: string;
  accrued: number;
  used: number;
  balance: number;
}

interface SpreadsheetSimulation {
  scenario: string;
  employeeName?: string;
  employeeType?: string;
  hireDate?: string;
  yearsOfService: number;
  leaveType: string;
  accrualFrequency?: string;
  baseAccrualRate?: number;
  annualEntitlement?: number;
  monthlyBreakdown?: MonthlyBreakdown[];
  prorationApplied?: boolean;
  prorationReason?: string;
  ruleApplied?: string;
  complexity?: "simple" | "moderate" | "complex";
  edgeCaseType?: string;
  notes?: string;
  accrualAmount?: string; // Legacy field
}

interface LeaveAccrualRulesAIUploadProps {
  companyId: string;
  leaveTypes: Array<{ id: string; name: string }>;
  onRulesImported: () => void;
  isAdmin?: boolean;
}

export function LeaveAccrualRulesAIUpload({ 
  companyId,
  leaveTypes,
  onRulesImported,
  isAdmin = false 
}: LeaveAccrualRulesAIUploadProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>("");
  const [extractedRules, setExtractedRules] = useState<ExtractedAccrualRule[]>([]);
  const [selectedRules, setSelectedRules] = useState<Set<number>>(new Set());
  const [analysisNotes, setAnalysisNotes] = useState("");
  const [rawExtraction, setRawExtraction] = useState<any>(null);
  const [schemaChanges, setSchemaChanges] = useState<SchemaChange[]>([]);
  const [newLeaveTypesNeeded, setNewLeaveTypesNeeded] = useState<NewLeaveType[]>([]);
  const [selectedSchemaChanges, setSelectedSchemaChanges] = useState<Set<number>>(new Set());
  const [selectedNewLeaveTypes, setSelectedNewLeaveTypes] = useState<Set<number>>(new Set());
  const [simulations, setSimulations] = useState<SpreadsheetSimulation[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<SpreadsheetSimulation | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedRules([]);
      setSelectedRules(new Set());
      setAnalysisNotes("");
      setRawExtraction(null);
      setSchemaChanges([]);
      setNewLeaveTypesNeeded([]);
      setSelectedSchemaChanges(new Set());
      setSelectedNewLeaveTypes(new Set());
      setSimulations([]);
      setSelectedSimulation(null);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const { data, error } = await supabase.functions.invoke('analyze-statutory-document', {
        body: {
          documentContent: fileContent,
          documentName: selectedFile.name,
          analysisType: 'extract_leave_accrual_rules',
          leaveTypes: leaveTypes.map(lt => lt.name),
          effectiveDate: effectiveDate,
        }
      });

      if (error) throw error;

      if (data.rules && Array.isArray(data.rules)) {
        setExtractedRules(data.rules);
        setSelectedRules(new Set(data.rules.map((_: any, i: number) => i)));
      }
      
      if (data.notes) {
        setAnalysisNotes(data.notes);
      }

      if (data.schemaChangesSuggested && Array.isArray(data.schemaChangesSuggested)) {
        setSchemaChanges(data.schemaChangesSuggested);
      }

      if (data.newLeaveTypesNeeded && Array.isArray(data.newLeaveTypesNeeded)) {
        setNewLeaveTypesNeeded(data.newLeaveTypesNeeded);
      }

      if (data.spreadsheetExamples && Array.isArray(data.spreadsheetExamples)) {
        setSimulations(data.spreadsheetExamples);
      }
      
      setRawExtraction(data);
      toast.success("Document analyzed successfully");
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast.error("Failed to analyze document");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRuleSelection = (index: number) => {
    const newSelected = new Set(selectedRules);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRules(newSelected);
  };

  const selectAll = () => {
    setSelectedRules(new Set(extractedRules.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelectedRules(new Set());
  };

  const findLeaveTypeId = (leaveTypeName: string): string | null => {
    const match = leaveTypes.find(lt => 
      lt.name.toLowerCase() === leaveTypeName.toLowerCase() ||
      lt.name.toLowerCase().includes(leaveTypeName.toLowerCase()) ||
      leaveTypeName.toLowerCase().includes(lt.name.toLowerCase())
    );
    return match?.id || null;
  };

  const createNewLeaveTypes = async () => {
    if (selectedNewLeaveTypes.size === 0) return;

    const typesToCreate = newLeaveTypesNeeded.filter((_, i) => selectedNewLeaveTypes.has(i));
    
    for (const newType of typesToCreate) {
      const code = newType.name.toUpperCase().replace(/\s+/g, '_').substring(0, 20);
      const { error } = await supabase
        .from('leave_types')
        .insert({
          company_id: companyId,
          code: code,
          name: newType.name,
          description: newType.description || newType.reason,
          is_active: true,
        });

      if (error) {
        console.error('Error creating leave type:', error);
        toast.error(`Failed to create leave type: ${newType.name}`);
      }
    }

    toast.success(`Created ${typesToCreate.length} new leave types`);
  };

  const importSelectedRules = async () => {
    if (selectedRules.size === 0) {
      toast.error("Please select at least one rule to import");
      return;
    }

    setIsImporting(true);
    try {
      // Create new leave types first if selected
      if (selectedNewLeaveTypes.size > 0) {
        await createNewLeaveTypes();
      }

      const rulesToImport = extractedRules
        .filter((_, i) => selectedRules.has(i))
        .map((rule) => {
          const leaveTypeId = findLeaveTypeId(rule.leave_type_name);
          if (!leaveTypeId) {
            throw new Error(`Leave type "${rule.leave_type_name}" not found. Please create it first.`);
          }
          return {
            company_id: companyId,
            leave_type_id: leaveTypeId,
            name: rule.name,
            description: rule.description || null,
            accrual_frequency: rule.accrual_frequency,
            accrual_amount: rule.accrual_amount,
            years_of_service_min: rule.years_of_service_min || 0,
            years_of_service_max: rule.years_of_service_max,
            employee_status: rule.employee_status,
            employee_type: rule.employee_type,
            priority: rule.priority || 0,
            is_active: true,
            start_date: effectiveDate,
            end_date: endDate || null,
          };
        });

      const { error } = await supabase
        .from('leave_accrual_rules')
        .insert(rulesToImport);

      if (error) throw error;

      toast.success(`Successfully imported ${rulesToImport.length} accrual rules`);
      onRulesImported();
      setIsOpen(false);
      resetState();
    } catch (error: any) {
      console.error('Error importing rules:', error);
      toast.error(error.message || "Failed to import accrual rules");
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setExtractedRules([]);
    setSelectedRules(new Set());
    setAnalysisNotes("");
    setRawExtraction(null);
    setSchemaChanges([]);
    setNewLeaveTypesNeeded([]);
    setSelectedSchemaChanges(new Set());
    setSelectedNewLeaveTypes(new Set());
    setSimulations([]);
    setSelectedSimulation(null);
  };

  const frequencyLabels: Record<string, string> = {
    daily: t("leave.accrualRules.daily"),
    monthly: t("leave.accrualRules.monthly"),
    annually: t("leave.accrualRules.annually"),
    bi_weekly: t("leave.accrualRules.biWeekly"),
    weekly: t("leave.accrualRules.weekly"),
  };

  const impactColors: Record<string, string> = {
    required: "destructive",
    recommended: "default",
    optional: "secondary",
  };

  const hasSchemaIssues = schemaChanges.length > 0 || newLeaveTypesNeeded.length > 0;

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Sparkles className="h-4 w-4 mr-2" />
        AI Import Rules
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Leave Accrual Rules Import
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="upload">1. Upload</TabsTrigger>
              <TabsTrigger value="schema" disabled={!hasSchemaIssues}>
                2. Schema {hasSchemaIssues && <Badge variant="destructive" className="ml-1 h-5 px-1">{schemaChanges.length + newLeaveTypesNeeded.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="review" disabled={extractedRules.length === 0}>
                3. Review
              </TabsTrigger>
              <TabsTrigger value="simulation" disabled={simulations.length === 0}>
                4. Simulation {simulations.length > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1">{simulations.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="notes" disabled={!rawExtraction}>
                5. Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="flex-1 overflow-auto space-y-4 p-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upload Leave Policy Document</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload a PDF, spreadsheet (CSV/Excel), or document containing leave accrual policies.
                    The AI will extract accrual rules and detect if schema changes are needed.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Document File</Label>
                      <Input
                        type="file"
                        accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.docx,.doc"
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {selectedFile.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Effective Date *</Label>
                        <Input
                          type="date"
                          value={effectiveDate}
                          onChange={(e) => setEffectiveDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date (Optional)</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Label className="text-sm font-medium">Available Leave Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {leaveTypes.map(lt => (
                        <Badge key={lt.id} variant="secondary">{lt.name}</Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={analyzeDocument} 
                    disabled={!selectedFile || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Document...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze & Extract Rules
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schema Changes Tab - Admin Only */}
            <TabsContent value="schema" className="flex-1 overflow-auto space-y-4 p-1">
              {hasSchemaIssues && (
                <div className="space-y-4">
                  {!isAdmin && (
                    <Alert variant="destructive">
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle>Admin Access Required</AlertTitle>
                      <AlertDescription>
                        The uploaded document contains rules that require system configuration changes. 
                        Please contact a System Admin or HR Admin to review and approve these changes.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* New Leave Types Needed */}
                  {newLeaveTypesNeeded.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          New Leave Types Required ({newLeaveTypesNeeded.length})
                        </CardTitle>
                        <CardDescription>
                          The document references leave types that don't exist in the system.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">Create</TableHead>
                              <TableHead>Leave Type Name</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {newLeaveTypesNeeded.map((lt, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Switch
                                    checked={selectedNewLeaveTypes.has(index)}
                                    onCheckedChange={() => {
                                      const newSelected = new Set(selectedNewLeaveTypes);
                                      if (newSelected.has(index)) {
                                        newSelected.delete(index);
                                      } else {
                                        newSelected.add(index);
                                      }
                                      setSelectedNewLeaveTypes(newSelected);
                                    }}
                                    disabled={!isAdmin}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{lt.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{lt.reason}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Schema Changes Suggested */}
                  {schemaChanges.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Interface Changes Suggested ({schemaChanges.length})
                        </CardTitle>
                        <CardDescription>
                          The document contains rules that cannot be fully captured by the current system fields.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="multiple" className="w-full">
                          {schemaChanges.map((change, index) => (
                            <AccordionItem key={index} value={`change-${index}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-2 text-left">
                                  <Switch
                                    checked={selectedSchemaChanges.has(index)}
                                    onCheckedChange={(checked) => {
                                      const newSelected = new Set(selectedSchemaChanges);
                                      if (checked) {
                                        newSelected.add(index);
                                      } else {
                                        newSelected.delete(index);
                                      }
                                      setSelectedSchemaChanges(newSelected);
                                    }}
                                    disabled={!isAdmin}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Badge variant={impactColors[change.impact] as any}>
                                    {change.impact}
                                  </Badge>
                                  <span className="font-medium">{change.fieldName}</span>
                                  <span className="text-sm text-muted-foreground">({change.fieldType})</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3 pl-12">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Description</Label>
                                  <p className="text-sm">{change.description}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Reason</Label>
                                  <p className="text-sm">{change.reason}</p>
                                </div>
                                {change.documentExcerpt && (
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Document Reference</Label>
                                    <p className="text-sm italic bg-muted/50 p-2 rounded">"{change.documentExcerpt}"</p>
                                  </div>
                                )}
                                {change.suggestedValues && change.suggestedValues.length > 0 && (
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Suggested Values</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {change.suggestedValues.map((v, i) => (
                                        <Badge key={i} variant="outline">{v}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {change.affectedRules && change.affectedRules.length > 0 && (
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Affected Rules</Label>
                                    <ul className="text-sm list-disc list-inside">
                                      {change.affectedRules.map((r, i) => (
                                        <li key={i}>{r}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>

                        {isAdmin && selectedSchemaChanges.size > 0 && (
                          <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Schema Changes Selected</AlertTitle>
                            <AlertDescription>
                              You have selected {selectedSchemaChanges.size} schema change(s). 
                              These changes would require database migration. Please contact the development team 
                              to implement these changes before importing rules that depend on them.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="review" className="flex-1 overflow-hidden flex flex-col p-1">
              {extractedRules.length > 0 && (
                <Card className="flex-1 overflow-hidden flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Extracted Accrual Rules ({extractedRules.length})
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAll}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Review and select the rules you want to import. Selected: {selectedRules.size}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-[350px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Rule Name</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Years of Service</TableHead>
                            <TableHead>Employee Type</TableHead>
                            <TableHead>Priority</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {extractedRules.map((rule, index) => {
                            const matchedType = findLeaveTypeId(rule.leave_type_name);
                            return (
                              <TableRow 
                                key={index}
                                className={selectedRules.has(index) ? "bg-primary/5" : ""}
                              >
                                <TableCell>
                                  <Switch
                                    checked={selectedRules.has(index)}
                                    onCheckedChange={() => toggleRuleSelection(index)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{rule.name}</TableCell>
                                <TableCell>
                                  <Badge variant={matchedType ? "default" : "destructive"}>
                                    {rule.leave_type_name}
                                    {!matchedType && " (Not Found)"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{frequencyLabels[rule.accrual_frequency] || rule.accrual_frequency}</TableCell>
                                <TableCell className="text-right">{rule.accrual_amount}</TableCell>
                                <TableCell>
                                  {rule.years_of_service_min} - {rule.years_of_service_max || '∞'} yrs
                                </TableCell>
                                <TableCell>{rule.employee_type || '-'}</TableCell>
                                <TableCell>{rule.priority}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Simulation Tab - Spreadsheet Simulation */}
            <TabsContent value="simulation" className="flex-1 overflow-hidden flex flex-col p-1">
              {simulations.length > 0 && (
                <div className="flex flex-col h-full gap-4">
                  <Card className="flex-1 overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Accrual Simulation Examples
                      </CardTitle>
                      <CardDescription>
                        AI-generated scenarios demonstrating how accrual rules apply to different employee situations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                      <div className="flex h-full">
                        {/* Scenario List */}
                        <ScrollArea className="w-1/3 border-r">
                          <div className="p-2 space-y-2">
                            {simulations.map((sim, index) => (
                              <div
                                key={index}
                                onClick={() => setSelectedSimulation(sim)}
                                className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                                  selectedSimulation === sim 
                                    ? "bg-primary/10 border-primary" 
                                    : "hover:bg-muted border-transparent"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{sim.scenario}</span>
                                  {sim.complexity && (
                                    <Badge 
                                      variant={sim.complexity === "complex" ? "destructive" : sim.complexity === "moderate" ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {sim.complexity}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {sim.employeeName && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {sim.employeeName}
                                    </span>
                                  )}
                                  <Badge variant="outline" className="text-xs">{sim.leaveType}</Badge>
                                </div>
                                {sim.edgeCaseType && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {sim.edgeCaseType}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                        {/* Simulation Detail */}
                        <div className="flex-1 overflow-auto p-4">
                          {selectedSimulation ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <Label className="text-xs text-muted-foreground">Employee Type</Label>
                                  <p className="font-medium">{selectedSimulation.employeeType || "Standard"}</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <Label className="text-xs text-muted-foreground">Years of Service</Label>
                                  <p className="font-medium">{selectedSimulation.yearsOfService} years</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <Label className="text-xs text-muted-foreground">Annual Entitlement</Label>
                                  <p className="font-medium">{selectedSimulation.annualEntitlement || selectedSimulation.accrualAmount || "N/A"} days</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <Label className="text-xs text-muted-foreground">Accrual Frequency</Label>
                                  <p className="font-medium">{selectedSimulation.accrualFrequency || "Monthly"}</p>
                                </div>
                              </div>

                              {selectedSimulation.ruleApplied && (
                                <Alert>
                                  <TrendingUp className="h-4 w-4" />
                                  <AlertTitle>Rule Applied</AlertTitle>
                                  <AlertDescription>{selectedSimulation.ruleApplied}</AlertDescription>
                                </Alert>
                              )}

                              {selectedSimulation.prorationApplied && (
                                <Alert variant="default">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Proration Applied</AlertTitle>
                                  <AlertDescription>{selectedSimulation.prorationReason || "Pro-rated based on hire date"}</AlertDescription>
                                </Alert>
                              )}

                              {/* Monthly Breakdown Table */}
                              {selectedSimulation.monthlyBreakdown && selectedSimulation.monthlyBreakdown.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Monthly Accrual Projection
                                  </Label>
                                  <ScrollArea className="h-[200px] border rounded-lg">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Month</TableHead>
                                          <TableHead className="text-right">Accrued</TableHead>
                                          <TableHead className="text-right">Used</TableHead>
                                          <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedSimulation.monthlyBreakdown.map((month, i) => (
                                          <TableRow key={i}>
                                            <TableCell className="font-medium">{month.month}</TableCell>
                                            <TableCell className="text-right text-green-600">+{month.accrued}</TableCell>
                                            <TableCell className="text-right text-red-600">{month.used > 0 ? `-${month.used}` : "-"}</TableCell>
                                            <TableCell className="text-right font-semibold">{month.balance}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </ScrollArea>
                                </div>
                              )}

                              {selectedSimulation.notes && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Notes</Label>
                                  <p className="text-sm bg-muted/50 p-2 rounded">{selectedSimulation.notes}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                              <div className="text-center">
                                <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Select a scenario to view simulation details</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary Stats */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{simulations.filter(s => s.complexity === "simple").length}</p>
                          <p className="text-xs text-muted-foreground">Simple Cases</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{simulations.filter(s => s.complexity === "moderate").length}</p>
                          <p className="text-xs text-muted-foreground">Moderate Cases</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{simulations.filter(s => s.complexity === "complex").length}</p>
                          <p className="text-xs text-muted-foreground">Complex Cases</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="flex-1 overflow-auto p-1">
              {rawExtraction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Analysis Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisNotes && (
                      <div className="space-y-2">
                        <Label>Extraction Notes</Label>
                        <Textarea 
                          value={analysisNotes} 
                          readOnly 
                          className="min-h-[100px]"
                        />
                      </div>
                    )}

                    {rawExtraction.warnings && rawExtraction.warnings.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          Warnings
                        </Label>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {rawExtraction.warnings.map((w: string, i: number) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rawExtraction.assumptions && rawExtraction.assumptions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Assumptions Made</Label>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {rawExtraction.assumptions.map((a: string, i: number) => (
                            <li key={i}>• {a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={importSelectedRules}
              disabled={selectedRules.size === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Import {selectedRules.size} Rules
                  {selectedNewLeaveTypes.size > 0 && ` + ${selectedNewLeaveTypes.size} Types`}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
