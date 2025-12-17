import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, Trash2, Eye, Sparkles, Loader2, 
  Database, Calculator, CheckCircle, AlertCircle, FileText,
  Calendar, Upload
} from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface StatutoryReportingDocument {
  id: string;
  statutory_deduction_type_id: string;
  document_name: string;
  reporting_interval: string;
  file_path: string | null;
  file_name: string | null;
  file_type: string | null;
  ai_analysis: Json;
  required_data_structures: Json;
  extraction_status: string;
  extraction_notes: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statutoryTypeId: string;
  statutoryName: string;
  countryCode: string;
}

const REPORTING_INTERVALS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
  { value: "ad_hoc", label: "Ad Hoc" },
];

export function StatutoryReportingDocuments({ 
  open, 
  onOpenChange, 
  statutoryTypeId,
  statutoryName,
  countryCode 
}: Props) {
  const [documents, setDocuments] = useState<StatutoryReportingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StatutoryReportingDocument | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentContent, setDocumentContent] = useState("");

  const [form, setForm] = useState({
    document_name: "",
    reporting_interval: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  useEffect(() => {
    if (open && statutoryTypeId) {
      loadDocuments();
    }
  }, [open, statutoryTypeId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("statutory_reporting_documents")
      .select("*")
      .eq("statutory_deduction_type_id", statutoryTypeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load reporting documents");
    } else {
      setDocuments(data || []);
    }
    setIsLoading(false);
  };

  const handleAddDocument = async () => {
    if (!form.document_name) {
      toast.error("Please enter a document name");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("statutory_reporting_documents")
      .insert({
        statutory_deduction_type_id: statutoryTypeId,
        document_name: form.document_name,
        reporting_interval: form.reporting_interval,
        start_date: form.start_date,
        end_date: form.end_date || null,
        created_by: userData.user?.id,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Document added successfully");
      setAddDialogOpen(false);
      setForm({
        document_name: "",
        reporting_interval: "monthly",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      });
      loadDocuments();
      // Automatically open for content upload
      if (data) {
        setSelectedDocument(data);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const { error } = await supabase
      .from("statutory_reporting_documents")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Document deleted");
      loadDocuments();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocument) return;

    // Read file content
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setDocumentContent(content);
      
      // Update document with file info
      await supabase
        .from("statutory_reporting_documents")
        .update({
          file_name: file.name,
          file_type: file.type,
        })
        .eq("id", selectedDocument.id);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeDocument = async () => {
    if (!selectedDocument || !documentContent) {
      toast.error("Please upload document content first");
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-statutory-report", {
        body: {
          documentId: selectedDocument.id,
          documentContent,
          documentName: selectedDocument.document_name,
          statutoryTypeId,
          countryCode,
        },
      });

      if (error) throw error;

      toast.success("Document analyzed successfully");
      loadDocuments();
      
      // Refresh selected document
      const { data: updatedDoc } = await supabase
        .from("statutory_reporting_documents")
        .select("*")
        .eq("id", selectedDocument.id)
        .single();
      
      if (updatedDoc) {
        setSelectedDocument(updatedDoc);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze document");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Analyzed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getIntervalBadge = (interval: string) => {
    const colors: Record<string, string> = {
      monthly: "bg-blue-100 text-blue-800",
      quarterly: "bg-purple-100 text-purple-800",
      annually: "bg-green-100 text-green-800",
      ad_hoc: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[interval] || ""}>{interval}</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Statutory Reporting Documents - {statutoryName}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 h-[600px]">
            {/* Left Panel - Document List */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Documents</h3>
                <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Document
                </Button>
              </div>

              <ScrollArea className="h-[520px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No reporting documents yet</p>
                    <p className="text-sm">Add documents to enable AI analysis</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <Card 
                        key={doc.id} 
                        className={`cursor-pointer transition-colors ${selectedDocument?.id === doc.id ? "border-primary" : ""}`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{doc.document_name}</p>
                              <div className="flex items-center gap-2">
                                {getIntervalBadge(doc.reporting_interval)}
                                {getStatusBadge(doc.extraction_status)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {doc.start_date} - {doc.end_date || "Present"}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Right Panel - Document Details & Analysis */}
            <div className="border rounded-lg p-4">
              {selectedDocument ? (
                <Tabs defaultValue="upload">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="structures">Data Structures</TabsTrigger>
                    <TabsTrigger value="analysis">Full Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Document Name</Label>
                      <Input value={selectedDocument.document_name} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Document Content</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload the statutory report template (PDF, TXT, or paste content)
                        </p>
                        <Input
                          type="file"
                          accept=".pdf,.txt,.doc,.docx"
                          onChange={handleFileUpload}
                          className="max-w-xs mx-auto"
                        />
                        {selectedDocument.file_name && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Current: {selectedDocument.file_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Or Paste Document Content</Label>
                      <Textarea
                        placeholder="Paste the statutory report template content here..."
                        value={documentContent}
                        onChange={(e) => setDocumentContent(e.target.value)}
                        rows={8}
                      />
                    </div>

                    <Button 
                      onClick={handleAnalyzeDocument}
                      disabled={isAnalyzing || !documentContent}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="structures" className="mt-4">
                    <ScrollArea className="h-[480px]">
                      {Array.isArray(selectedDocument.required_data_structures) && selectedDocument.required_data_structures.length > 0 ? (
                        <Accordion type="single" collapsible className="space-y-2">
                          {(selectedDocument.required_data_structures as any[]).map((structure: any, idx: number) => (
                            <AccordionItem key={idx} value={`structure-${idx}`}>
                              <AccordionTrigger className="text-sm">
                                <div className="flex items-center gap-2">
                                  <Database className="h-4 w-4" />
                                  {structure.tableName || `Structure ${idx + 1}`}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3 pl-6">
                                  <p className="text-sm text-muted-foreground">{structure.description}</p>
                                  
                                  {structure.columns && (
                                    <div>
                                      <p className="text-xs font-medium mb-2">Columns:</p>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="text-xs">Name</TableHead>
                                            <TableHead className="text-xs">Type</TableHead>
                                            <TableHead className="text-xs">Required</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {structure.columns.map((col: any, cIdx: number) => (
                                            <TableRow key={cIdx}>
                                              <TableCell className="text-xs font-mono">{col.name}</TableCell>
                                              <TableCell className="text-xs">{col.type}</TableCell>
                                              <TableCell className="text-xs">
                                                {col.required ? "Yes" : "No"}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}

                                  {structure.relationships && structure.relationships.length > 0 && (
                                    <p className="text-xs">
                                      <span className="font-medium">Related to:</span>{" "}
                                      {structure.relationships.join(", ")}
                                    </p>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No data structures extracted yet</p>
                          <p className="text-sm">Upload and analyze a document to extract structures</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="analysis" className="mt-4">
                    <ScrollArea className="h-[480px]">
                      {(() => {
                        const analysis = selectedDocument.ai_analysis as any;
                        return analysis && typeof analysis === 'object' && Object.keys(analysis).length > 0 ? (
                          <div className="space-y-4">
                            {analysis.documentSummary && (
                              <Card>
                                <CardHeader className="py-3">
                                  <CardTitle className="text-sm">Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="py-2">
                                  <p className="text-sm">{analysis.documentSummary}</p>
                                </CardContent>
                              </Card>
                            )}

                            {analysis.dataFields?.length > 0 && (
                              <Card>
                                <CardHeader className="py-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Data Fields ({analysis.dataFields.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2">
                                  <div className="space-y-2">
                                    {analysis.dataFields.map((field: any, idx: number) => (
                                      <div key={idx} className="text-xs p-2 bg-muted rounded">
                                        <span className="font-medium">{field.fieldName}</span>
                                        <span className="text-muted-foreground"> ({field.dataType})</span>
                                        {field.required && <Badge className="ml-2 text-[10px]">Required</Badge>}
                                        <p className="text-muted-foreground mt-1">Source: {field.source}</p>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {analysis.calculationRules?.length > 0 && (
                              <Card>
                                <CardHeader className="py-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Calculations ({analysis.calculationRules.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2">
                                  <div className="space-y-2">
                                    {analysis.calculationRules.map((calc: any, idx: number) => (
                                      <div key={idx} className="text-xs p-2 bg-muted rounded">
                                        <span className="font-medium">{calc.name}</span>
                                        <p className="text-muted-foreground mt-1">{calc.formula}</p>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {analysis.submissionRequirements && (
                              <Card>
                                <CardHeader className="py-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Submission Requirements
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 text-sm space-y-1">
                                  <p><strong>Deadline:</strong> {analysis.submissionRequirements.deadline}</p>
                                  <p><strong>Format:</strong> {analysis.submissionRequirements.format}</p>
                                  <p><strong>Method:</strong> {analysis.submissionRequirements.submissionMethod}</p>
                                  <p><strong>Authority:</strong> {analysis.submissionRequirements.authorityName}</p>
                                </CardContent>
                              </Card>
                            )}

                            {analysis.implementationNotes && (
                              <Card>
                                <CardHeader className="py-3">
                                  <CardTitle className="text-sm">Implementation Notes</CardTitle>
                                </CardHeader>
                                <CardContent className="py-2">
                                  <p className="text-sm text-muted-foreground">
                                    {analysis.implementationNotes}
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No analysis available</p>
                            <p className="text-sm">Upload and analyze a document to see results</p>
                          </div>
                        );
                      })()}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a document to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reporting Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input
                value={form.document_name}
                onChange={(e) => setForm({ ...form, document_name: e.target.value })}
                placeholder="e.g., Monthly Tax Return Form"
              />
            </div>

            <div className="space-y-2">
              <Label>Reporting Interval *</Label>
              <Select 
                value={form.reporting_interval} 
                onValueChange={(v) => setForm({ ...form, reporting_interval: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORTING_INTERVALS.map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument}>
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}