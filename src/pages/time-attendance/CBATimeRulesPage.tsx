import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Scale, Plus, Search, FileText, Clock, AlertTriangle, Upload, Brain, 
  Play, CheckCircle, XCircle, Sparkles, RefreshCw, FileUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CBAAgreement {
  id: string;
  agreement_name: string;
  agreement_code: string;
  union_name: string | null;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  document_url: string | null;
  created_at: string;
}

interface CBATimeRule {
  id: string;
  agreement_id: string;
  rule_name: string;
  rule_type: string;
  condition_json: Record<string, unknown> | null;
  value_numeric: number | null;
  value_text: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
}

interface ExtractedRule {
  rule_name: string;
  rule_type: string;
  day_type: string;
  value_numeric?: number;
  value_text?: string;
  priority: number;
  confidence: number;
  selected?: boolean;
}

interface SimulationResult {
  employee_id: string;
  employee_name: string;
  date: string;
  hours_worked: number;
  rules_applied: {
    rule_name: string;
    rule_type: string;
    effect: string;
    violation?: boolean;
  }[];
  total_pay_multiplier: number;
  violations: string[];
}

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "CBA Time Rules" },
];

export default function CBATimeRulesPage() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgreement, setSelectedAgreement] = useState<CBAAgreement | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSimulationDialog, setShowSimulationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("rules");
  const [documentText, setDocumentText] = useState("");
  const [extractedRules, setExtractedRules] = useState<ExtractedRule[]>([]);
  const [extractionSummary, setExtractionSummary] = useState("");
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [simulationSummary, setSimulationSummary] = useState<Record<string, unknown> | null>(null);
  const [newRule, setNewRule] = useState({
    rule_name: "",
    rule_type: "overtime",
    day_type: "regular",
    overtime_multiplier: "1.5",
    max_hours_per_day: "8",
    description: "",
  });

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["cba-agreements", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cba_agreements")
        .select("*")
        .eq("company_id", company?.id)
        .order("effective_from", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CBAAgreement[];
    },
    enabled: !!company?.id,
  });

  const { data: rules = [] } = useQuery({
    queryKey: ["cba-time-rules", selectedAgreement?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cba_time_rules")
        .select("*")
        .eq("agreement_id", selectedAgreement?.id)
        .order("priority");
      if (error) throw error;
      return (data || []) as unknown as CBATimeRule[];
    },
    enabled: !!selectedAgreement?.id,
  });

  // AI Document Extraction
  const extractMutation = useMutation({
    mutationFn: async () => {
      if (!documentText.trim()) throw new Error("Please paste document content");
      
      const { data, error } = await supabase.functions.invoke("parse-cba-document", {
        body: { 
          documentContent: documentText, 
          agreementId: selectedAgreement?.id,
          companyId: company?.id 
        },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      const rulesWithSelection = (data.rules || []).map((r: ExtractedRule) => ({ ...r, selected: true }));
      setExtractedRules(rulesWithSelection);
      setExtractionSummary(data.summary || "");
      setExtractionWarnings(data.warnings || []);
      toast.success(`Extracted ${rulesWithSelection.length} rules from document`);
    },
    onError: (error) => toast.error(`Extraction failed: ${error.message}`),
  });

  // Save extracted rules
  const saveExtractedRulesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAgreement) throw new Error("No agreement selected");
      const selectedRules = extractedRules.filter(r => r.selected);
      if (selectedRules.length === 0) throw new Error("No rules selected");

      const rulesToInsert = selectedRules.map(rule => ({
        agreement_id: selectedAgreement.id,
        rule_name: rule.rule_name,
        rule_type: rule.rule_type,
        condition_json: { day_type: rule.day_type },
        value_numeric: rule.value_numeric || null,
        value_text: rule.value_text || null,
        priority: rule.priority,
        is_active: true,
      }));

      const { error } = await supabase.from("cba_time_rules").insert(rulesToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rules saved successfully");
      setShowUploadDialog(false);
      setExtractedRules([]);
      setDocumentText("");
      queryClient.invalidateQueries({ queryKey: ["cba-time-rules"] });
    },
    onError: (error) => toast.error(`Save failed: ${error.message}`),
  });

  // Simulation
  const simulateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("simulate-cba-rules", {
        body: { 
          agreementId: selectedAgreement?.id,
          companyId: company?.id,
          sampleSize: 100,
        },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      setSimulationResults(data.results || []);
      setSimulationSummary(data.summary || null);
      setShowSimulationDialog(true);
      toast.success("Simulation complete");
    },
    onError: (error) => toast.error(`Simulation failed: ${error.message}`),
  });

  const addRuleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAgreement) throw new Error("No agreement selected");
      const { error } = await supabase.from("cba_time_rules").insert({
        agreement_id: selectedAgreement.id,
        rule_name: newRule.rule_name,
        rule_type: newRule.rule_type,
        condition_json: { day_type: newRule.day_type },
        value_numeric: parseFloat(newRule.overtime_multiplier),
        value_text: `max_hours:${newRule.max_hours_per_day}`,
        priority: 1,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Time rule added");
      setShowRuleDialog(false);
      setNewRule({ rule_name: "", rule_type: "overtime", day_type: "regular", overtime_multiplier: "1.5", max_hours_per_day: "8", description: "" });
      queryClient.invalidateQueries({ queryKey: ["cba-time-rules"] });
    },
    onError: (error) => toast.error(`Failed: ${error.message}`),
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const { error } = await supabase.from("cba_time_rules").update({ is_active: isActive }).eq("id", ruleId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cba-time-rules"] }),
  });

  const filteredAgreements = agreements.filter(a =>
    a.agreement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.union_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  };

  const getConditionDisplay = (rule: CBATimeRule) => {
    if (rule.condition_json && typeof rule.condition_json === 'object') {
      return (rule.condition_json as Record<string, unknown>).day_type as string || "—";
    }
    return "—";
  };

  const toggleExtractedRule = (index: number) => {
    setExtractedRules(prev => prev.map((r, i) => i === index ? { ...r, selected: !r.selected } : r));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CBA Time Rules</h1>
            <p className="text-muted-foreground">
              Collective Bargaining Agreement time and attendance rules
            </p>
          </div>
          {selectedAgreement && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Extract Rules
              </Button>
              <Button variant="outline" onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending || rules.length === 0}>
                <Play className="h-4 w-4 mr-2" />
                {simulateMutation.isPending ? "Running..." : "Simulate"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agreements List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                CBA Agreements
              </CardTitle>
              <CardDescription>Select an agreement to manage its rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search agreements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                  {isLoading ? (
                    <p className="text-center py-4 text-muted-foreground">Loading...</p>
                  ) : filteredAgreements.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No CBA agreements found</p>
                  ) : (
                    filteredAgreements.map((agreement) => (
                      <div
                        key={agreement.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedAgreement?.id === agreement.id ? "bg-primary/10 border-primary" : "hover:bg-muted"}`}
                        onClick={() => setSelectedAgreement(agreement)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{agreement.agreement_name}</p>
                            <p className="text-sm text-muted-foreground">{agreement.union_name}</p>
                          </div>
                          <Badge variant={agreement.is_active ? "default" : "secondary"}>
                            {agreement.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {isExpiringSoon(agreement.effective_to) && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            Expiring soon
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Rules Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Rules
                  </CardTitle>
                  <CardDescription>
                    {selectedAgreement ? `Rules for ${selectedAgreement.agreement_name}` : "Select an agreement"}
                  </CardDescription>
                </div>
                {selectedAgreement && (
                  <Button onClick={() => setShowRuleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedAgreement ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a CBA agreement from the left panel</p>
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No time rules defined</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Extract from Document
                    </Button>
                    <Button variant="outline" onClick={() => setShowRuleDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manually
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Day Type</TableHead>
                        <TableHead className="text-center">Multiplier</TableHead>
                        <TableHead className="text-center">Value</TableHead>
                        <TableHead>Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell><p className="font-medium">{rule.rule_name}</p></TableCell>
                          <TableCell><Badge variant="outline">{rule.rule_type}</Badge></TableCell>
                          <TableCell>{getConditionDisplay(rule)}</TableCell>
                          <TableCell className="text-center">{rule.value_numeric ? `${rule.value_numeric}x` : "—"}</TableCell>
                          <TableCell className="text-center">{rule.value_text || "—"}</TableCell>
                          <TableCell>
                            <Switch checked={rule.is_active} onCheckedChange={(checked) => toggleRuleMutation.mutate({ ruleId: rule.id, isActive: checked })} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Rule Extraction
              </DialogTitle>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">1. Upload Document</TabsTrigger>
                <TabsTrigger value="review" disabled={extractedRules.length === 0}>2. Review Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label>Paste CBA Document Content</Label>
                  <Textarea
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Paste the text content of your CBA agreement here. Include sections related to overtime, shifts, breaks, and working hours..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Copy and paste from PDF or Word documents. The AI will identify all time-related rules.
                  </p>
                </div>
                <Button onClick={() => extractMutation.mutate()} disabled={extractMutation.isPending || !documentText.trim()} className="w-full">
                  {extractMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Extract Rules with AI
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                {extractionSummary && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Summary</p>
                    <p className="text-sm text-muted-foreground">{extractionSummary}</p>
                  </div>
                )}
                {extractionWarnings.length > 0 && (
                  <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-sm font-medium mb-1 text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Warnings
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {extractionWarnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
                <ScrollArea className="h-[300px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Use</TableHead>
                        <TableHead>Rule</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedRules.map((rule, idx) => (
                        <TableRow key={idx} className={rule.selected ? "" : "opacity-50"}>
                          <TableCell>
                            <Switch checked={rule.selected} onCheckedChange={() => toggleExtractedRule(idx)} />
                          </TableCell>
                          <TableCell className="font-medium">{rule.rule_name}</TableCell>
                          <TableCell><Badge variant="outline">{rule.rule_type}</Badge></TableCell>
                          <TableCell>{rule.day_type}</TableCell>
                          <TableCell>{rule.value_numeric || rule.value_text || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={(rule.confidence || 0) * 100} className="w-16 h-2" />
                              <span className="text-xs">{Math.round((rule.confidence || 0) * 100)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>Back</Button>
                  <Button onClick={() => saveExtractedRulesMutation.mutate()} disabled={saveExtractedRulesMutation.isPending || extractedRules.filter(r => r.selected).length === 0}>
                    {saveExtractedRulesMutation.isPending ? "Saving..." : `Save ${extractedRules.filter(r => r.selected).length} Rules`}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Simulation Dialog */}
        <Dialog open={showSimulationDialog} onOpenChange={setShowSimulationDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Rule Simulation Results
              </DialogTitle>
            </DialogHeader>
            {simulationSummary && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{(simulationSummary as any).total_entries}</p>
                  <p className="text-xs text-muted-foreground">Entries Analyzed</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{(simulationSummary as any).entries_with_rules}</p>
                  <p className="text-xs text-muted-foreground">Rules Applied</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{(simulationSummary as any).rules_tested}</p>
                  <p className="text-xs text-muted-foreground">Rules Tested</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{(simulationSummary as any).violations}</p>
                  <p className="text-xs text-muted-foreground">Violations Found</p>
                </div>
              </div>
            )}
            <ScrollArea className="h-[400px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rules Applied</TableHead>
                    <TableHead>Multiplier</TableHead>
                    <TableHead>Violations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulationResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No results to display
                      </TableCell>
                    </TableRow>
                  ) : (
                    simulationResults.map((result, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{result.employee_name}</TableCell>
                        <TableCell>{result.date}</TableCell>
                        <TableCell>{result.hours_worked.toFixed(1)}h</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {result.rules_applied.map((r, i) => (
                              <Badge key={i} variant={r.violation ? "destructive" : "outline"} className="text-xs">
                                {r.rule_name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.total_pay_multiplier > 1 ? (
                            <Badge className="bg-green-500/10 text-green-600">{result.total_pay_multiplier}x</Badge>
                          ) : "1x"}
                        </TableCell>
                        <TableCell>
                          {result.violations.length > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              {result.violations.length}
                            </Badge>
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSimulationDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Add Rule Dialog */}
        <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input value={newRule.rule_name} onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })} placeholder="e.g., Sunday Overtime Rate" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Type</Label>
                  <Select value={newRule.rule_type} onValueChange={(v) => setNewRule({ ...newRule, rule_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overtime">Overtime</SelectItem>
                      <SelectItem value="shift_differential">Shift Differential</SelectItem>
                      <SelectItem value="rest_period">Rest Period</SelectItem>
                      <SelectItem value="break_time">Break Time</SelectItem>
                      <SelectItem value="max_hours">Max Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Day Type</Label>
                  <Select value={newRule.day_type} onValueChange={(v) => setNewRule({ ...newRule, day_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Days</SelectItem>
                      <SelectItem value="regular">Regular Day</SelectItem>
                      <SelectItem value="weekend">Weekend</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="night">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Multiplier</Label>
                  <Input type="number" step="0.1" value={newRule.overtime_multiplier} onChange={(e) => setNewRule({ ...newRule, overtime_multiplier: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Max Hours/Day</Label>
                  <Input type="number" value={newRule.max_hours_per_day} onChange={(e) => setNewRule({ ...newRule, max_hours_per_day: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={newRule.description} onChange={(e) => setNewRule({ ...newRule, description: e.target.value })} placeholder="Describe this rule..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRuleDialog(false)}>Cancel</Button>
              <Button onClick={() => addRuleMutation.mutate()} disabled={addRuleMutation.isPending || !newRule.rule_name}>Add Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
