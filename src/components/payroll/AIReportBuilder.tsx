import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, Upload, Sparkles, RefreshCw, Database, Save, Play, 
  FileSpreadsheet, Download, Printer, Trash2, MessageSquare,
  Check, Clock, AlertCircle, Loader2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface AIReport {
  id: string;
  report_name: string;
  report_type: 'banded' | 'bi';
  status: 'draft' | 'designing' | 'simulated' | 'connected' | 'saved';
  layout_document_name: string | null;
  layout_document_content: string | null;
  filter_configuration: Record<string, unknown>;
  report_structure: Record<string, unknown>;
  ai_analysis: Record<string, unknown>;
  iteration_history: Array<{ timestamp: string; feedback: string; changes: unknown }>;
  last_generated_at: string | null;
  created_at: string;
}

interface AIReportBuilderProps {
  reportType: 'banded' | 'bi';
  companyId: string;
}

export function AIReportBuilder({ reportType, companyId }: AIReportBuilderProps) {
  const { t } = useTranslation();
  const [reports, setReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showIterateDialog, setShowIterateDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // Form states
  const [newReportName, setNewReportName] = useState("");
  const [layoutContent, setLayoutContent] = useState("");
  const [layoutFileName, setLayoutFileName] = useState("");
  const [iterationFeedback, setIterationFeedback] = useState("");
  
  // Filter states
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterPayGroup, setFilterPayGroup] = useState("");
  
  // Preview data
  const [previewData, setPreviewData] = useState<unknown>(null);

  useEffect(() => {
    loadReports();
  }, [companyId, reportType]);

  const loadReports = async () => {
    const { data, error } = await supabase
      .from('ai_payroll_reports')
      .select('*')
      .eq('company_id', companyId)
      .eq('report_type', reportType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading reports:", error);
      return;
    }

    setReports((data || []) as unknown as AIReport[]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLayoutFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLayoutContent(content);
    };
    
    if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      // For Excel files, we'll send the base64
      reader.readAsDataURL(file);
    }
  };

  const createReport = async () => {
    if (!newReportName || !layoutContent) {
      toast.error("Please provide a report name and upload a layout document");
      return;
    }

    setIsCreating(true);
    try {
      // First analyze the layout
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('design-payroll-report', {
        body: {
          action: 'analyze_layout',
          layoutContent,
          reportName: newReportName,
          reportType,
          companyId
        }
      });

      if (analysisError) throw analysisError;

      // Create the report record
      const { data: newReport, error: createError } = await supabase
        .from('ai_payroll_reports')
        .insert({
          company_id: companyId,
          report_name: newReportName,
          report_type: reportType,
          status: 'designing',
          layout_document_name: layoutFileName,
          layout_document_content: layoutContent,
          ai_analysis: analysisData.analysis,
          report_structure: analysisData.analysis,
          filter_configuration: analysisData.analysis?.filters || {}
        })
        .select()
        .single();

      if (createError) throw createError;

      toast.success("Report created and layout analyzed");
      setShowCreateDialog(false);
      setNewReportName("");
      setLayoutContent("");
      setLayoutFileName("");
      loadReports();
      setSelectedReport(newReport as unknown as AIReport);
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("Failed to create report");
    } finally {
      setIsCreating(false);
    }
  };

  const iterateDesign = async () => {
    if (!selectedReport || !iterationFeedback) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('design-payroll-report', {
        body: {
          action: 'iterate_design',
          reportId: selectedReport.id,
          userFeedback: iterationFeedback,
          companyId
        }
      });

      if (error) throw error;

      toast.success("Design updated based on your feedback");
      setShowIterateDialog(false);
      setIterationFeedback("");
      loadReports();
    } catch (error) {
      console.error("Error iterating design:", error);
      toast.error("Failed to update design");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateReport = async (report: AIReport) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('design-payroll-report', {
        body: {
          action: 'simulate_report',
          reportId: report.id,
          filters: {
            startDate: filterStartDate,
            endDate: filterEndDate,
            payGroupId: filterPayGroup
          },
          companyId
        }
      });

      if (error) throw error;

      setPreviewData(data.simulationData);
      setShowPreviewDialog(true);
      toast.success("Simulated report generated");
      loadReports();
    } catch (error) {
      console.error("Error simulating report:", error);
      toast.error("Failed to simulate report");
    } finally {
      setIsLoading(false);
    }
  };

  const connectRealData = async (report: AIReport) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('design-payroll-report', {
        body: {
          action: 'connect_real_data',
          reportId: report.id,
          filters: {
            startDate: filterStartDate,
            endDate: filterEndDate,
            payGroupId: filterPayGroup
          },
          companyId
        }
      });

      if (error) throw error;

      setPreviewData(data.reportData);
      setShowPreviewDialog(true);
      toast.success(`Report generated with ${data.recordCount} records`);
      loadReports();
    } catch (error) {
      console.error("Error connecting real data:", error);
      toast.error("Failed to connect to real data");
    } finally {
      setIsLoading(false);
    }
  };

  const saveReport = async (report: AIReport) => {
    try {
      await supabase
        .from('ai_payroll_reports')
        .update({ status: 'saved' })
        .eq('id', report.id);

      toast.success("Report saved for future use");
      loadReports();
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report");
    }
  };

  const runSavedReport = async (report: AIReport) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('design-payroll-report', {
        body: {
          action: 'run_saved_report',
          reportId: report.id,
          filters: {
            startDate: filterStartDate,
            endDate: filterEndDate,
            payGroupId: filterPayGroup
          },
          companyId
        }
      });

      if (error) throw error;

      setPreviewData(data.reportData);
      setShowPreviewDialog(true);
      toast.success(`Report generated with ${data.recordCount} records`);
    } catch (error) {
      console.error("Error running report:", error);
      toast.error("Failed to run report");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (report: AIReport) => {
    try {
      await supabase
        .from('ai_payroll_reports')
        .delete()
        .eq('id', report.id);

      toast.success("Report deleted");
      loadReports();
      if (selectedReport?.id === report.id) {
        setSelectedReport(null);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const exportToExcel = () => {
    if (!previewData) return;
    
    // Create CSV content
    const data = (previewData as any)?.reportData || (previewData as any)?.sampleData || [];
    if (!Array.isArray(data) || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row: any) => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport?.report_name || 'report'}_${getTodayString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported to Excel");
  };

  const printReport = () => {
    window.print();
  };

  const getStatusBadge = (status: AIReport['status']) => {
    const configs = {
      draft: { color: 'bg-muted text-muted-foreground', icon: Clock },
      designing: { color: 'bg-warning/20 text-warning', icon: Sparkles },
      simulated: { color: 'bg-primary/20 text-primary', icon: RefreshCw },
      connected: { color: 'bg-success/20 text-success', icon: Database },
      saved: { color: 'bg-success/20 text-success', icon: Check }
    };
    const config = configs[status];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {reportType === 'banded' ? 'AI Banded Reports' : 'AI BI Reports'}
        </h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create AI {reportType === 'banded' ? 'Banded' : 'BI'} Report</DialogTitle>
              <DialogDescription>
                Upload a layout document to design your report with AI assistance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Report Name</Label>
                <Input
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <Label>Layout Document</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload Excel, CSV, or text file with report layout
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="layout-upload"
                  />
                  <label htmlFor="layout-upload">
                    <Button variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                  {layoutFileName && (
                    <p className="mt-2 text-sm text-success">{layoutFileName}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Include column headers, groupings, and any filter requirements in the document
                </p>
              </div>
              <Button onClick={createReport} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Layout...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create & Analyze
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Reports Table */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Your Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No reports yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedReport?.id === report.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{report.report_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateForDisplay(report.created_at, 'MMM d, yyyy')}
                          </p>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Selected Report Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReport ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedReport.report_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Layout: {selectedReport.layout_document_name || 'None'}
                  </p>
                </div>

                <Separator />

                {/* AI Analysis Preview */}
                {selectedReport.ai_analysis && Object.keys(selectedReport.ai_analysis).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">AI Analysis</h5>
                    <ScrollArea className="h-32 border rounded p-2">
                      <pre className="text-xs">
                        {JSON.stringify(selectedReport.ai_analysis, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {/* Iteration History */}
                {selectedReport.iteration_history.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Iterations ({selectedReport.iteration_history.length})
                    </h5>
                    <ScrollArea className="h-20">
                      {selectedReport.iteration_history.map((iter, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          {formatDateForDisplay(iter.timestamp, 'MMM d, HH:mm')}: {iter.feedback.substring(0, 50)}...
                        </p>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                <Separator />

                {/* Actions based on status */}
                <div className="flex flex-wrap gap-2">
                  {selectedReport.status !== 'saved' && (
                    <>
                      <Dialog open={showIterateDialog} onOpenChange={setShowIterateDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Iterate
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Iterate Design</DialogTitle>
                            <DialogDescription>
                              Provide feedback to modify the report design
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              value={iterationFeedback}
                              onChange={(e) => setIterationFeedback(e.target.value)}
                              placeholder="Describe the changes you want..."
                              rows={4}
                            />
                            <Button onClick={iterateDesign} disabled={isLoading}>
                              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                              Apply Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => simulateReport(selectedReport)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Simulate
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => connectRealData(selectedReport)}
                        disabled={isLoading}
                      >
                        <Database className="h-4 w-4 mr-1" />
                        Connect Data
                      </Button>

                      {selectedReport.status === 'connected' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => saveReport(selectedReport)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      )}
                    </>
                  )}

                  {selectedReport.status === 'saved' && (
                    <>
                      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                        <DialogTrigger asChild>
                          <Button variant="default" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Run Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Run Report</DialogTitle>
                            <DialogDescription>
                              Set filters and generate the report
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Start Date</Label>
                                <Input
                                  type="date"
                                  value={filterStartDate}
                                  onChange={(e) => setFilterStartDate(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>End Date</Label>
                                <Input
                                  type="date"
                                  value={filterEndDate}
                                  onChange={(e) => setFilterEndDate(e.target.value)}
                                />
                              </div>
                            </div>
                            <Button 
                              onClick={() => {
                                runSavedReport(selectedReport);
                                setShowFilterDialog(false);
                              }}
                              disabled={isLoading}
                              className="w-full"
                            >
                              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                              Generate Report
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteReport(selectedReport)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a report to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedReport?.report_name} - Preview
            </DialogTitle>
            <DialogDescription>
              Review the generated report
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-1" />
              Export to Excel
            </Button>
            <Button variant="outline" size="sm" onClick={printReport}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
          <ScrollArea className="h-[500px] border rounded-lg p-4">
            {previewData ? (
              <div className="space-y-4">
                {/* Render preview HTML if available */}
                {(previewData as any)?.previewHtml && (
                  <div 
                    dangerouslySetInnerHTML={{ __html: (previewData as any).previewHtml }}
                    className="prose max-w-none"
                  />
                )}
                
                {/* Render sample data table */}
                {((previewData as any)?.sampleData || (previewData as any)?.reportData) && (
                  <div>
                    <h4 className="font-medium mb-2">Data</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(((previewData as any)?.sampleData || (previewData as any)?.reportData)?.[0] || {}).map((key) => (
                            <TableHead key={key}>{key}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(((previewData as any)?.sampleData || (previewData as any)?.reportData) || []).slice(0, 20).map((row: any, idx: number) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((val: any, vidx: number) => (
                              <TableCell key={vidx}>{String(val)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Totals */}
                {(previewData as any)?.totals && (
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <pre className="text-sm">
                      {JSON.stringify((previewData as any).totals, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No preview data</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
