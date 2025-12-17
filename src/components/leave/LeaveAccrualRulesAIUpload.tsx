import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Upload, Sparkles, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

interface LeaveAccrualRulesAIUploadProps {
  companyId: string;
  leaveTypes: Array<{ id: string; name: string }>;
  onRulesImported: () => void;
}

export function LeaveAccrualRulesAIUpload({ 
  companyId,
  leaveTypes,
  onRulesImported 
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedRules([]);
      setSelectedRules(new Set());
      setAnalysisNotes("");
      setRawExtraction(null);
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

  const importSelectedRules = async () => {
    if (selectedRules.size === 0) {
      toast.error("Please select at least one rule to import");
      return;
    }

    setIsImporting(true);
    try {
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
  };

  const frequencyLabels: Record<string, string> = {
    daily: t("leave.accrualRules.daily"),
    monthly: t("leave.accrualRules.monthly"),
    annually: t("leave.accrualRules.annually"),
    bi_weekly: t("leave.accrualRules.biWeekly"),
    weekly: t("leave.accrualRules.weekly"),
  };

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">1. Upload Document</TabsTrigger>
              <TabsTrigger value="review" disabled={extractedRules.length === 0}>
                2. Review Rules
              </TabsTrigger>
              <TabsTrigger value="notes" disabled={!rawExtraction}>
                3. Analysis Notes
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
                    The AI will extract accrual rules including frequency, amounts, and eligibility criteria.
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
                    <p className="text-xs text-muted-foreground mt-2">
                      The AI will match extracted rules to these leave types. Create missing types before importing.
                    </p>
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

                    {rawExtraction.spreadsheetExamples && rawExtraction.spreadsheetExamples.length > 0 && (
                      <div className="space-y-2">
                        <Label>Example Calculations</Label>
                        <ScrollArea className="h-[200px] border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Scenario</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Years</TableHead>
                                <TableHead className="text-right">Accrual</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rawExtraction.spreadsheetExamples.map((ex: any, i: number) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{ex.scenario}</TableCell>
                                  <TableCell>{ex.employeeType || '-'}</TableCell>
                                  <TableCell>{ex.yearsOfService}</TableCell>
                                  <TableCell className="text-right">{ex.accrualAmount}</TableCell>
                                  <TableCell className="text-xs text-muted-foreground">{ex.notes}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
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
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
