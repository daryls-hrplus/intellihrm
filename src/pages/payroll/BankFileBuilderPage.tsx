import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPermissionContext } from "@/hooks/useUserPermissionContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileUp, 
  Download, 
  Bot, 
  Settings, 
  FileText,
  Building2,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BankFileConfig {
  id: string;
  company_id: string;
  bank_name: string;
  file_format: string;
  is_active: boolean;
  is_primary: boolean;
  file_header_template: any;
  record_template: any;
  file_footer_template: any;
  company_bank_name: string | null;
  company_bank_account: string | null;
  company_bank_routing: string | null;
  originator_id: string | null;
  company_id_number: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface PayGroup {
  id: string;
  name: string;
  company_id: string;
}

interface PayrollRun {
  id: string;
  pay_period_id: string;
  pay_group_id: string;
  status: string;
  total_net_pay: number;
  employee_count: number;
  created_at: string;
  pay_groups?: { name: string } | null;
  pay_periods?: { start_date: string; end_date: string } | null;
}

export default function BankFileBuilderPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const permissions = useUserPermissionContext();
  const queryClient = useQueryClient();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedPayGroupId, setSelectedPayGroupId] = useState<string>("");
  const [selectedPayrollRunId, setSelectedPayrollRunId] = useState<string>("");
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [specDocument, setSpecDocument] = useState<File | null>(null);
  const [specText, setSpecText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");

  // Fetch accessible companies
  const { data: companies = [] } = useQuery({
    queryKey: ['bank-file-companies', permissions.accessibleCompanyIds],
    queryFn: async () => {
      if (permissions.isLoading) return [];
      
      let query = supabase.from('companies').select('id, name').eq('is_active', true);
      
      if (!permissions.isAdmin && permissions.accessibleCompanyIds.length > 0) {
        query = query.in('id', permissions.accessibleCompanyIds);
      }
      
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data as Company[];
    },
    enabled: !permissions.isLoading
  });

  // Fetch pay groups for selected company
  const { data: payGroups = [] } = useQuery({
    queryKey: ['bank-file-pay-groups', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('pay_groups')
        .select('id, name, company_id')
        .eq('company_id', selectedCompanyId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as PayGroup[];
    },
    enabled: !!selectedCompanyId
  });

  // Fetch bank file configs for selected company
  const { data: bankConfigs = [], refetch: refetchConfigs } = useQuery({
    queryKey: ['bank-file-configs', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('bank_file_config')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('bank_name');
      
      if (error) throw error;
      return data as BankFileConfig[];
    },
    enabled: !!selectedCompanyId
  });

  // Fetch paid payroll runs for selected pay group
  const { data: payrollRuns = [] } = useQuery({
    queryKey: ['bank-file-payroll-runs', selectedPayGroupId],
    queryFn: async () => {
      if (!selectedPayGroupId) return [];
      
      const { data, error } = await supabase
        .from('payroll_runs')
        .select(`
          id, pay_period_id, pay_group_id, status, total_net_pay, employee_count, created_at,
          pay_groups!inner(name)
        `)
        .eq('pay_group_id', selectedPayGroupId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Fetch pay periods separately
      const periodIds = data?.map(r => r.pay_period_id).filter(Boolean) || [];
      let periodsMap: Record<string, { period_start: string; period_end: string }> = {};
      
      if (periodIds.length > 0) {
        const { data: periods } = await supabase
          .from('pay_periods')
          .select('id, period_start, period_end')
          .in('id', periodIds);
        
        periodsMap = Object.fromEntries((periods || []).map(p => [p.id, { period_start: p.period_start, period_end: p.period_end }]));
      }
      
      return (data || []).map(run => ({
        ...run,
        pay_periods: periodsMap[run.pay_period_id] ? {
          start_date: periodsMap[run.pay_period_id].period_start,
          end_date: periodsMap[run.pay_period_id].period_end
        } : null
      })) as PayrollRun[];
    },
    enabled: !!selectedPayGroupId
  });

  // Analyze bank file specification
  const handleAnalyzeSpec = async () => {
    if (!specDocument && !specText.trim()) {
      toast.error("Please upload a document or paste specification text");
      return;
    }

    if (!selectedCompanyId) {
      toast.error("Please select a company first");
      return;
    }

    setIsAnalyzing(true);
    try {
      let documentContent = specText;
      
      if (specDocument) {
        // Read file content
        documentContent = await specDocument.text();
      }

      const response = await supabase.functions.invoke('analyze-bank-file-spec', {
        body: {
          documentContent,
          companyId: selectedCompanyId,
          userId: user?.id,
          permissionContext: {
            isAdmin: permissions.isAdmin,
            accessibleCompanyIds: permissions.accessibleCompanyIds
          }
        }
      });

      if (response.error) throw response.error;

      setAnalysisResult(response.data);
      toast.success("Bank file specification analyzed successfully");
    } catch (error: any) {
      console.error('Error analyzing spec:', error);
      toast.error(error.message || "Failed to analyze specification");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save analyzed config
  const saveConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const { data, error } = await supabase
        .from('bank_file_config')
        .insert({
          company_id: selectedCompanyId,
          bank_name: config.bankName,
          file_format: config.fileFormat,
          file_header_template: config.headerTemplate,
          record_template: config.recordTemplate,
          file_footer_template: config.footerTemplate,
          is_active: true,
          is_primary: bankConfigs.length === 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Bank file configuration saved");
      setAnalysisResult(null);
      refetchConfigs();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save configuration");
    }
  });

  // Generate bank file
  const handleGenerateBankFile = async () => {
    if (!selectedPayrollRunId || !selectedConfigId) {
      toast.error("Please select a payroll run and bank configuration");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-bank-file', {
        body: {
          payrollRunId: selectedPayrollRunId,
          bankConfigId: selectedConfigId,
          companyId: selectedCompanyId,
          payGroupId: selectedPayGroupId,
          userId: user?.id,
          permissionContext: {
            isAdmin: permissions.isAdmin,
            accessibleCompanyIds: permissions.accessibleCompanyIds,
            canViewPii: permissions.canViewPii
          }
        }
      });

      if (response.error) throw response.error;

      const { fileContent, fileName, recordCount, totalAmount } = response.data;

      // Create download
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Bank file generated: ${recordCount} records, $${totalAmount.toLocaleString()}`);
    } catch (error: any) {
      console.error('Error generating bank file:', error);
      toast.error(error.message || "Failed to generate bank file");
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview bank file
  const handlePreviewBankFile = async () => {
    if (!selectedPayrollRunId || !selectedConfigId) {
      toast.error("Please select a payroll run and bank configuration");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-bank-file', {
        body: {
          payrollRunId: selectedPayrollRunId,
          bankConfigId: selectedConfigId,
          companyId: selectedCompanyId,
          payGroupId: selectedPayGroupId,
          userId: user?.id,
          permissionContext: {
            isAdmin: permissions.isAdmin,
            accessibleCompanyIds: permissions.accessibleCompanyIds,
            canViewPii: permissions.canViewPii
          },
          previewOnly: true
        }
      });

      if (response.error) throw response.error;

      setPreviewContent(response.data.fileContent);
      setPreviewDialogOpen(true);
    } catch (error: any) {
      console.error('Error previewing bank file:', error);
      toast.error(error.message || "Failed to preview bank file");
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete config
  const deleteConfigMutation = useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from('bank_file_config')
        .delete()
        .eq('id', configId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configuration deleted");
      refetchConfigs();
      if (selectedConfigId) setSelectedConfigId("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete configuration");
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll"), href: "/payroll" },
            { label: "Bank File Builder" }
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AI Bank File Builder
            </h1>
            <p className="text-muted-foreground">
              Build and generate bank payment files from specifications
            </p>
          </div>
        </div>

        {/* Company & Pay Group Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Company & Pay Group
            </CardTitle>
            <CardDescription>
              Filter by company and pay group based on your permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={selectedCompanyId} onValueChange={(v) => {
                  setSelectedCompanyId(v);
                  setSelectedPayGroupId("");
                  setSelectedPayrollRunId("");
                  setSelectedConfigId("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pay Group</Label>
                <Select value={selectedPayGroupId} onValueChange={(v) => {
                  setSelectedPayGroupId(v);
                  setSelectedPayrollRunId("");
                }}>
                  <SelectTrigger disabled={!selectedCompanyId}>
                    <SelectValue placeholder="Select pay group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {payGroups.map((pg) => (
                      <SelectItem key={pg.id} value={pg.id}>
                        {pg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="configure" className="space-y-4">
          <TabsList>
            <TabsTrigger value="configure" className="gap-2">
              <Bot className="h-4 w-4" />
              Configure from Spec
            </TabsTrigger>
            <TabsTrigger value="generate" className="gap-2">
              <Download className="h-4 w-4" />
              Generate File
            </TabsTrigger>
            <TabsTrigger value="configs" className="gap-2">
              <Settings className="h-4 w-4" />
              Saved Configs
            </TabsTrigger>
          </TabsList>

          {/* Configure from Spec Tab */}
          <TabsContent value="configure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Upload Bank File Specification
                </CardTitle>
                <CardDescription>
                  Upload or paste the bank's file format specification document. AI will analyze and create a configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Upload Specification Document</Label>
                    <Input
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={(e) => setSpecDocument(e.target.files?.[0] || null)}
                      disabled={!selectedCompanyId}
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports TXT, PDF, DOC, DOCX files
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-muted-foreground">
                    OR
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Paste Specification Text</Label>
                  <Textarea
                    placeholder="Paste the bank file format specification here..."
                    value={specText}
                    onChange={(e) => setSpecText(e.target.value)}
                    rows={8}
                    disabled={!selectedCompanyId}
                  />
                </div>

                <Button
                  onClick={handleAnalyzeSpec}
                  disabled={isAnalyzing || (!specDocument && !specText.trim()) || !selectedCompanyId}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Specification...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Result */}
            {analysisResult && (
              <Card className="border-success/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    Analysis Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Bank Name</Label>
                      <p className="font-medium">{analysisResult.bankName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">File Format</Label>
                      <p className="font-medium">{analysisResult.fileFormat}</p>
                    </div>
                  </div>

                  {analysisResult.description && (
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="text-sm">{analysisResult.description}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-muted-foreground">Detected Fields</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {analysisResult.detectedFields?.map((field: string) => (
                        <Badge key={field} variant="secondary">{field}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => saveConfigMutation.mutate(analysisResult)}
                      disabled={saveConfigMutation.isPending}
                    >
                      {saveConfigMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Save Configuration
                    </Button>
                    <Button variant="outline" onClick={() => setAnalysisResult(null)}>
                      Discard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Generate File Tab */}
          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Generate Bank File
                </CardTitle>
                <CardDescription>
                  Select a paid payroll run and bank configuration to generate the payment file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Bank Configuration</Label>
                    <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
                      <SelectTrigger disabled={!selectedCompanyId}>
                        <SelectValue placeholder="Select configuration..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bankConfigs.filter(c => c.is_active).map((config) => (
                          <SelectItem key={config.id} value={config.id}>
                            {config.bank_name} ({config.file_format})
                            {config.is_primary && " ⭐"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Payroll Run</Label>
                    <Select value={selectedPayrollRunId} onValueChange={setSelectedPayrollRunId}>
                      <SelectTrigger disabled={!selectedPayGroupId}>
                        <SelectValue placeholder="Select payroll run..." />
                      </SelectTrigger>
                      <SelectContent>
                        {payrollRuns.map((run) => (
                          <SelectItem key={run.id} value={run.id}>
                            {run.pay_periods?.start_date && run.pay_periods?.end_date
                              ? `${formatDate(run.pay_periods.start_date)} - ${formatDate(run.pay_periods.end_date)}`
                              : formatDate(run.created_at)} | {run.employee_count} employees | {formatCurrency(run.total_net_pay || 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {payrollRuns.length === 0 && selectedPayGroupId && (
                  <div className="flex items-center gap-2 text-warning">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">No paid payroll runs found for this pay group</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handlePreviewBankFile}
                    variant="outline"
                    disabled={isGenerating || !selectedPayrollRunId || !selectedConfigId}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleGenerateBankFile}
                    disabled={isGenerating || !selectedPayrollRunId || !selectedConfigId}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Bank File
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Configs Tab */}
          <TabsContent value="configs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Saved Configurations
                </CardTitle>
                <CardDescription>
                  Manage bank file configurations for the selected company
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedCompanyId ? (
                  <p className="text-center text-muted-foreground py-4">
                    Select a company to view configurations
                  </p>
                ) : bankConfigs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No configurations found. Upload a specification to create one.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bank Name</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Primary</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankConfigs.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">{config.bank_name}</TableCell>
                          <TableCell>{config.file_format}</TableCell>
                          <TableCell>
                            <Badge variant={config.is_active ? "default" : "secondary"}>
                              {config.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {config.is_primary && <Badge variant="outline">Primary</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteConfigMutation.mutate(config.id)}
                              disabled={deleteConfigMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Bank File Preview</DialogTitle>
            <DialogDescription>
              Preview of the generated bank file content
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre">
              {previewContent}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
