import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Scale, Plus, Search, FileText, Clock, AlertTriangle, Upload, Brain, 
  Play, CheckCircle, XCircle, Sparkles, RefreshCw, FileUp, AlertCircle,
  Lightbulb, PuzzleIcon, Send, Info, TriangleAlert, ExternalLink
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
  approximation_warning?: string | null;
  confidence_score?: number | null;
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
  approximation_warning?: string;
}

interface UnsupportedRule {
  original_text: string;
  suggested_type: string;
  reason: string;
  workaround?: string;
  data_loss_warning?: string;
}

interface ExtensionSuggestion {
  feature: string;
  description: string;
  priority: string;
  affected_rules?: string[];
}

interface SchemaGaps {
  missing_rule_types?: string[];
  missing_day_types?: string[];
  missing_conditions?: string[];
  missing_formulas?: string[];
}

interface ComplexityAssessment {
  overall_complexity: string;
  coverage_percentage: number;
  recommendation?: string;
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
    is_approximation?: boolean;
  }[];
  total_pay_multiplier: number;
  violations: string[];
  limitations?: string[];
}

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "CBA Time Rules" },
];

export default function CBATimeRulesPage() {
  const { company, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgreement, setSelectedAgreement] = useState<CBAAgreement | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSimulationDialog, setShowSimulationDialog] = useState(false);
  const [showExtensionRequestDialog, setShowExtensionRequestDialog] = useState(false);
  const [showAddAgreementDialog, setShowAddAgreementDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [documentText, setDocumentText] = useState("");
  
  // Extraction state
  const [extractedRules, setExtractedRules] = useState<ExtractedRule[]>([]);
  const [unsupportedRules, setUnsupportedRules] = useState<UnsupportedRule[]>([]);
  const [extensionSuggestions, setExtensionSuggestions] = useState<ExtensionSuggestion[]>([]);
  const [schemaGaps, setSchemaGaps] = useState<SchemaGaps>({});
  const [complexityAssessment, setComplexityAssessment] = useState<ComplexityAssessment | null>(null);
  const [extractionSummary, setExtractionSummary] = useState("");
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  
  // Simulation state
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [simulationSummary, setSimulationSummary] = useState<Record<string, unknown> | null>(null);
  const [simulationLimitations, setSimulationLimitations] = useState<string[]>([]);
  
  // Extension request form
  const [extensionRequest, setExtensionRequest] = useState({
    request_type: "rule_type",
    suggested_value: "",
    impact_description: "",
    priority: "medium"
  });
  const [selectedUnsupportedRule, setSelectedUnsupportedRule] = useState<UnsupportedRule | null>(null);
  
  const [newRule, setNewRule] = useState({
    rule_name: "",
    rule_type: "overtime",
    day_type: "regular",
    overtime_multiplier: "1.5",
    max_hours_per_day: "8",
    description: "",
  });

  const [newAgreement, setNewAgreement] = useState({
    agreement_name: "",
    agreement_code: "",
    union_name: "",
    effective_from: "",
    effective_to: "",
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

  // Fetch pending extension requests count
  const { data: pendingExtensionsCount = 0 } = useQuery({
    queryKey: ["cba-extension-requests-count", company?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("cba_extension_requests")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company?.id)
        .eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!company?.id,
  });

  // AI Document Extraction with gap detection
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
      setUnsupportedRules(data.unsupported_rules || []);
      setExtensionSuggestions(data.extension_suggestions || []);
      setSchemaGaps(data.schema_gaps || {});
      setComplexityAssessment(data.complexity_assessment || null);
      setExtractionSummary(data.summary || "");
      setExtractionWarnings(data.warnings || []);
      
      const supportedCount = rulesWithSelection.length;
      const unsupportedCount = (data.unsupported_rules || []).length;
      
      if (unsupportedCount > 0) {
        toast.warning(`Extracted ${supportedCount} rules. ${unsupportedCount} rules need review.`);
      } else {
        toast.success(`Extracted ${supportedCount} rules from document`);
      }
      
      // Move to review tab
      if (rulesWithSelection.length > 0 || unsupportedCount > 0) {
        setActiveTab("review");
      }
    },
    onError: (error) => toast.error(`Extraction failed: ${error.message}`),
  });

  // Save extracted rules with approximation tracking
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
        approximation_warning: rule.approximation_warning || null,
        confidence_score: rule.confidence || null,
      }));

      const { error } = await supabase.from("cba_time_rules").insert(rulesToInsert);
      if (error) throw error;
      
      // Save unsupported rules for tracking
      if (unsupportedRules.length > 0) {
        const unsupportedToInsert = unsupportedRules.map(rule => ({
          company_id: company?.id,
          agreement_id: selectedAgreement.id,
          original_text: rule.original_text,
          suggested_type: rule.suggested_type,
          reason: rule.reason,
          workaround: rule.workaround || null,
          data_loss_warning: rule.data_loss_warning || null,
        }));
        
        await supabase.from("cba_unsupported_rules").insert(unsupportedToInsert);
      }
    },
    onSuccess: () => {
      toast.success("Rules saved successfully");
      setShowUploadDialog(false);
      resetExtractionState();
      queryClient.invalidateQueries({ queryKey: ["cba-time-rules"] });
    },
    onError: (error) => toast.error(`Save failed: ${error.message}`),
  });

  // Create extension request
  const createExtensionRequestMutation = useMutation({
    mutationFn: async () => {
      if (!extensionRequest.suggested_value.trim()) throw new Error("Please specify the extension needed");
      
      const { error } = await supabase.from("cba_extension_requests").insert({
        company_id: company?.id,
        agreement_id: selectedAgreement?.id,
        request_type: extensionRequest.request_type,
        suggested_value: extensionRequest.suggested_value,
        original_document_excerpt: selectedUnsupportedRule?.original_text || null,
        ai_analysis: selectedUnsupportedRule?.reason || null,
        impact_description: extensionRequest.impact_description || null,
        priority: extensionRequest.priority,
        created_by: user?.id,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Extension request submitted");
      setShowExtensionRequestDialog(false);
      setSelectedUnsupportedRule(null);
      setExtensionRequest({ request_type: "rule_type", suggested_value: "", impact_description: "", priority: "medium" });
    },
    onError: (error) => toast.error(`Failed to submit request: ${error.message}`),
  });

  // Simulation with gap awareness
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
      setSimulationLimitations(data.simulation_limitations || []);
      setShowSimulationDialog(true);
      
      const accuracy = data.summary?.simulation_accuracy || 100;
      if (accuracy < 100) {
        toast.warning(`Simulation ${accuracy}% complete - some rules could not be tested`);
      } else {
        toast.success("Simulation complete");
      }
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

  // Create new CBA Agreement
  const createAgreementMutation = useMutation({
    mutationFn: async () => {
      if (!newAgreement.agreement_name.trim()) throw new Error("Agreement name is required");
      if (!newAgreement.effective_from) throw new Error("Effective from date is required");
      
      const { data, error } = await supabase.from("cba_agreements").insert({
        company_id: company?.id,
        agreement_name: newAgreement.agreement_name,
        agreement_code: newAgreement.agreement_code || null,
        union_name: newAgreement.union_name || null,
        effective_from: newAgreement.effective_from,
        effective_to: newAgreement.effective_to || null,
        is_active: true,
      }).select().single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("CBA Agreement created");
      setShowAddAgreementDialog(false);
      setNewAgreement({ agreement_name: "", agreement_code: "", union_name: "", effective_from: "", effective_to: "" });
      queryClient.invalidateQueries({ queryKey: ["cba-agreements"] });
      // Auto-select the new agreement
      setSelectedAgreement(data as CBAAgreement);
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

  const resetExtractionState = () => {
    setExtractedRules([]);
    setUnsupportedRules([]);
    setExtensionSuggestions([]);
    setSchemaGaps({});
    setComplexityAssessment(null);
    setDocumentText("");
    setExtractionSummary("");
    setExtractionWarnings([]);
    setActiveTab("upload");
  };

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

  const openExtensionRequest = (unsupported?: UnsupportedRule) => {
    if (unsupported) {
      setSelectedUnsupportedRule(unsupported);
      setExtensionRequest({
        request_type: "rule_type",
        suggested_value: unsupported.suggested_type,
        impact_description: unsupported.data_loss_warning || "",
        priority: "high"
      });
    }
    setShowExtensionRequestDialog(true);
  };

  const hasApproximations = rules.some(r => r.approximation_warning);

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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/time-attendance/cba-extensions")}>
              <PuzzleIcon className="h-4 w-4 mr-2" />
              Extension Requests
              {pendingExtensionsCount > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingExtensionsCount}</Badge>
              )}
            </Button>
            {selectedAgreement && (
              <>
                <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Extract Rules
                </Button>
                <Button variant="outline" onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending || rules.length === 0}>
                  <Play className="h-4 w-4 mr-2" />
                  {simulateMutation.isPending ? "Running..." : "Simulate"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agreements List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    CBA Agreements
                  </CardTitle>
                  <CardDescription>Select an agreement to manage its rules</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowAddAgreementDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
                    {hasApproximations && (
                      <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                        <TriangleAlert className="h-3 w-3 mr-1" />
                        Has Approximations
                      </Badge>
                    )}
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
                        <TableHead className="text-center">Confidence</TableHead>
                        <TableHead>Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{rule.rule_name}</p>
                              {rule.approximation_warning && (
                                <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                  <TriangleAlert className="h-3 w-3 mr-1" />
                                  Approx
                                </Badge>
                              )}
                            </div>
                            {rule.approximation_warning && (
                              <p className="text-xs text-orange-600 mt-1">{rule.approximation_warning}</p>
                            )}
                          </TableCell>
                          <TableCell><Badge variant="outline">{rule.rule_type}</Badge></TableCell>
                          <TableCell>{getConditionDisplay(rule)}</TableCell>
                          <TableCell className="text-center">{rule.value_numeric ? `${rule.value_numeric}x` : "—"}</TableCell>
                          <TableCell className="text-center">
                            {rule.confidence_score ? (
                              <div className="flex items-center justify-center gap-1">
                                <Progress value={(rule.confidence_score) * 100} className="w-12 h-2" />
                                <span className="text-xs">{Math.round((rule.confidence_score) * 100)}%</span>
                              </div>
                            ) : "—"}
                          </TableCell>
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

        {/* AI Upload Dialog with Gap Detection */}
        <Dialog open={showUploadDialog} onOpenChange={(open) => { setShowUploadDialog(open); if (!open) resetExtractionState(); }}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Rule Extraction
              </DialogTitle>
              <DialogDescription>
                Upload CBA document text to automatically extract time rules. The AI will identify both supported and unsupported rules.
              </DialogDescription>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">1. Upload</TabsTrigger>
                <TabsTrigger value="review" disabled={extractedRules.length === 0 && unsupportedRules.length === 0}>2. Review</TabsTrigger>
                <TabsTrigger value="gaps" disabled={unsupportedRules.length === 0}>3. Gaps ({unsupportedRules.length})</TabsTrigger>
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
                    The AI will categorize rules as supported or unsupported based on current system capabilities.
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
                {/* Complexity Assessment */}
                {complexityAssessment && (
                  <div className={`p-3 rounded-lg border ${
                    complexityAssessment.coverage_percentage >= 90 ? 'bg-green-500/10 border-green-500/20' :
                    complexityAssessment.coverage_percentage >= 70 ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Schema Coverage</span>
                      <Badge variant={
                        complexityAssessment.coverage_percentage >= 90 ? "default" :
                        complexityAssessment.coverage_percentage >= 70 ? "secondary" : "destructive"
                      }>
                        {complexityAssessment.coverage_percentage}% Supported
                      </Badge>
                    </div>
                    <Progress value={complexityAssessment.coverage_percentage} className="h-2 mb-2" />
                    {complexityAssessment.recommendation && (
                      <p className="text-xs text-muted-foreground">{complexityAssessment.recommendation}</p>
                    )}
                  </div>
                )}
                
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
                      {extractedRules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No supported rules extracted
                          </TableCell>
                        </TableRow>
                      ) : (
                        extractedRules.map((rule, idx) => (
                          <TableRow key={idx} className={rule.selected ? "" : "opacity-50"}>
                            <TableCell>
                              <Switch checked={rule.selected} onCheckedChange={() => toggleExtractedRule(idx)} />
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{rule.rule_name}</p>
                              {rule.approximation_warning && (
                                <p className="text-xs text-orange-600 mt-1">⚠️ {rule.approximation_warning}</p>
                              )}
                            </TableCell>
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>Back</Button>
                  <div className="flex gap-2">
                    {unsupportedRules.length > 0 && (
                      <Button variant="outline" onClick={() => setActiveTab("gaps")}>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Review Gaps ({unsupportedRules.length})
                      </Button>
                    )}
                    <Button onClick={() => saveExtractedRulesMutation.mutate()} disabled={saveExtractedRulesMutation.isPending || extractedRules.filter(r => r.selected).length === 0}>
                      {saveExtractedRulesMutation.isPending ? "Saving..." : `Save ${extractedRules.filter(r => r.selected).length} Rules`}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gaps" className="space-y-4">
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-600">Unsupported Rules Detected</p>
                      <p className="text-sm text-muted-foreground">
                        These rules from your CBA cannot be fully expressed with the current system. 
                        You can request an extension or apply a workaround.
                      </p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[280px]">
                  <div className="space-y-3 pr-4">
                    {unsupportedRules.map((rule, idx) => (
                      <Card key={idx} className="border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-orange-600">{rule.suggested_type}</Badge>
                            <Button size="sm" variant="outline" onClick={() => openExtensionRequest(rule)}>
                              <Send className="h-3 w-3 mr-1" />
                              Request Extension
                            </Button>
                          </div>
                          <p className="text-sm font-medium mb-1">{rule.original_text}</p>
                          <p className="text-xs text-muted-foreground mb-2"><strong>Why unsupported:</strong> {rule.reason}</p>
                          {rule.workaround && (
                            <div className="p-2 bg-muted rounded text-xs">
                              <strong>Workaround:</strong> {rule.workaround}
                              {rule.data_loss_warning && (
                                <p className="text-orange-600 mt-1">⚠️ {rule.data_loss_warning}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* Schema Gaps Summary */}
                {Object.keys(schemaGaps).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <PuzzleIcon className="h-4 w-4" />
                        Schema Gaps Identified
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {schemaGaps.missing_rule_types && schemaGaps.missing_rule_types.length > 0 && (
                          <div className="p-2 bg-muted rounded text-xs">
                            <strong>Missing Rule Types:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {schemaGaps.missing_rule_types.map((t, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {schemaGaps.missing_day_types && schemaGaps.missing_day_types.length > 0 && (
                          <div className="p-2 bg-muted rounded text-xs">
                            <strong>Missing Day Types:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {schemaGaps.missing_day_types.map((t, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {schemaGaps.missing_conditions && schemaGaps.missing_conditions.length > 0 && (
                          <div className="p-2 bg-muted rounded text-xs">
                            <strong>Missing Conditions:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {schemaGaps.missing_conditions.map((t, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Extension Suggestions */}
                {extensionSuggestions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        AI Extension Suggestions
                      </p>
                      <div className="space-y-2">
                        {extensionSuggestions.map((sug, idx) => (
                          <div key={idx} className="p-2 bg-primary/5 rounded border border-primary/10 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{sug.feature}</span>
                              <Badge variant={sug.priority === 'critical' ? 'destructive' : sug.priority === 'high' ? 'default' : 'secondary'}>
                                {sug.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{sug.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("review")}>Back to Review</Button>
                  <Button onClick={() => saveExtractedRulesMutation.mutate()} disabled={saveExtractedRulesMutation.isPending || extractedRules.filter(r => r.selected).length === 0}>
                    Save Supported Rules ({extractedRules.filter(r => r.selected).length})
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Extension Request Dialog */}
        <Dialog open={showExtensionRequestDialog} onOpenChange={setShowExtensionRequestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Request Module Extension
              </DialogTitle>
              <DialogDescription>
                Submit a request to add support for this rule type
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedUnsupportedRule && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium">Original Rule:</p>
                  <p className="text-muted-foreground">{selectedUnsupportedRule.original_text}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Request Type</Label>
                  <Select value={extensionRequest.request_type} onValueChange={(v) => setExtensionRequest({ ...extensionRequest, request_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rule_type">New Rule Type</SelectItem>
                      <SelectItem value="day_type">New Day Type</SelectItem>
                      <SelectItem value="condition">New Condition</SelectItem>
                      <SelectItem value="formula">Complex Formula</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={extensionRequest.priority} onValueChange={(v) => setExtensionRequest({ ...extensionRequest, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Suggested Value/Name</Label>
                <Input 
                  value={extensionRequest.suggested_value} 
                  onChange={(e) => setExtensionRequest({ ...extensionRequest, suggested_value: e.target.value })} 
                  placeholder="e.g., callback_pay, tiered_overtime"
                />
              </div>
              <div className="space-y-2">
                <Label>Impact Description</Label>
                <Textarea 
                  value={extensionRequest.impact_description} 
                  onChange={(e) => setExtensionRequest({ ...extensionRequest, impact_description: e.target.value })} 
                  placeholder="Describe what functionality is lost without this extension..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExtensionRequestDialog(false)}>Cancel</Button>
              <Button onClick={() => createExtensionRequestMutation.mutate()} disabled={createExtensionRequestMutation.isPending || !extensionRequest.suggested_value.trim()}>
                {createExtensionRequestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Simulation Dialog with Limitations */}
        <Dialog open={showSimulationDialog} onOpenChange={setShowSimulationDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Rule Simulation Results
              </DialogTitle>
            </DialogHeader>
            
            {/* Simulation Limitations Warning */}
            {simulationLimitations.length > 0 && (
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 mb-4">
                <p className="text-sm font-medium text-orange-600 flex items-center gap-1 mb-1">
                  <Info className="h-4 w-4" /> Simulation Limitations
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {simulationLimitations.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </div>
            )}
            
            {simulationSummary && (
              <div className="grid grid-cols-5 gap-4 mb-4">
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
                  <p className="text-xs text-muted-foreground">Violations</p>
                </div>
                <div className={`p-3 rounded-lg text-center ${
                  (simulationSummary as any).simulation_accuracy >= 90 ? 'bg-green-500/10' :
                  (simulationSummary as any).simulation_accuracy >= 70 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                }`}>
                  <p className="text-2xl font-bold">{(simulationSummary as any).simulation_accuracy || 100}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
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
                    <TableHead>Status</TableHead>
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
                              <Badge 
                                key={i} 
                                variant={r.violation ? "destructive" : "outline"} 
                                className={`text-xs ${r.is_approximation ? 'border-orange-300' : ''}`}
                              >
                                {r.rule_name}
                                {r.is_approximation && " ⚠️"}
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
                              {result.violations.length} violation(s)
                            </Badge>
                          ) : result.limitations && result.limitations.length > 0 ? (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              <Info className="h-3 w-3 mr-1" />
                              Limited
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
                      <SelectItem value="holiday_pay">Holiday Pay</SelectItem>
                      <SelectItem value="on_call">On Call</SelectItem>
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

        {/* Add CBA Agreement Dialog */}
        <Dialog open={showAddAgreementDialog} onOpenChange={setShowAddAgreementDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Add CBA Agreement
              </DialogTitle>
              <DialogDescription>
                Create a new Collective Bargaining Agreement. After creating, you can extract time rules from your document.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Agreement Name *</Label>
                <Input 
                  value={newAgreement.agreement_name} 
                  onChange={(e) => setNewAgreement({ ...newAgreement, agreement_name: e.target.value })} 
                  placeholder="e.g., SEIU Local 1000 Master Agreement"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Agreement Code</Label>
                  <Input 
                    value={newAgreement.agreement_code} 
                    onChange={(e) => setNewAgreement({ ...newAgreement, agreement_code: e.target.value })} 
                    placeholder="e.g., CBA-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Union Name</Label>
                  <Input 
                    value={newAgreement.union_name} 
                    onChange={(e) => setNewAgreement({ ...newAgreement, union_name: e.target.value })} 
                    placeholder="e.g., SEIU Local 1000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Effective From *</Label>
                  <Input 
                    type="date"
                    value={newAgreement.effective_from} 
                    onChange={(e) => setNewAgreement({ ...newAgreement, effective_from: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effective To</Label>
                  <Input 
                    type="date"
                    value={newAgreement.effective_to} 
                    onChange={(e) => setNewAgreement({ ...newAgreement, effective_to: e.target.value })} 
                  />
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">Next Steps</p>
                <p className="text-muted-foreground">
                  After creating the agreement, click "AI Extract Rules" to paste your CBA document and automatically extract time and attendance rules.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddAgreementDialog(false)}>Cancel</Button>
              <Button 
                onClick={() => createAgreementMutation.mutate()} 
                disabled={createAgreementMutation.isPending || !newAgreement.agreement_name.trim() || !newAgreement.effective_from}
              >
                {createAgreementMutation.isPending ? "Creating..." : "Create Agreement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
