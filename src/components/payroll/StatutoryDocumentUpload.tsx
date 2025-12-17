import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Sparkles, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { markdownToHtml } from "@/lib/utils/markdown";

interface StatutoryDocumentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statutory: {
    id: string;
    statutory_name: string;
    statutory_code: string;
    country: string;
    ai_calculation_rules?: any;
    ai_sample_document?: string;
    ai_dependencies?: any[];
    ai_analyzed_at?: string;
  } | null;
  onAnalysisComplete: () => void;
}

interface AnalysisResult {
  calculationRules: Array<{
    type: string;
    description: string;
    formula: string;
    conditions: string;
    parameters: Record<string, any>;
  }>;
  dependencies: Array<{
    dependsOn: string;
    relationship: string;
    description: string;
  }>;
  exemptions: string[];
  sampleCalculations: Array<{
    scenario: string;
    inputs: Record<string, any>;
    calculation: string;
    result: string;
  }>;
}

export function StatutoryDocumentUpload({
  open,
  onOpenChange,
  statutory,
  onAnalysisComplete,
}: StatutoryDocumentUploadProps) {
  const [documentContent, setDocumentContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [sampleDocument, setSampleDocument] = useState<string>("");
  const [activeTab, setActiveTab] = useState("upload");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Handle text files and CSVs
    if (file.type === "text/plain" || file.type === "text/csv" || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".md")) {
      const text = await file.text();
      setDocumentContent(text);
      toast.success("Document loaded successfully");
    } else if (file.type === "application/pdf" || file.type.includes("spreadsheet") || file.type.includes("excel")) {
      toast.info("PDF and Excel files: Please paste the text content below");
    } else {
      toast.error("Please upload a text file, CSV, or markdown file");
    }
  };

  const handleAnalyze = async () => {
    if (!documentContent.trim()) {
      toast.error("Please provide document content to analyze");
      return;
    }

    if (!statutory) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-statutory-document", {
        body: {
          action: "analyze_document",
          statutoryId: statutory.id,
          documentContent,
        },
      });

      if (error) throw error;

      setAnalysisResult(data.analysis);
      setSampleDocument(data.sampleDocument);
      setActiveTab("results");
      toast.success("Document analyzed successfully");
      onAnalysisComplete();
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze document");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const existingRules = statutory?.ai_calculation_rules;
  const existingDocument = statutory?.ai_sample_document;
  const existingDependencies = statutory?.ai_dependencies;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Analysis - {statutory?.statutory_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="results">Analysis Results</TabsTrigger>
            <TabsTrigger value="sample">Sample Document</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Reference Document</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".txt,.csv,.md,.pdf,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload tax legislation, rate tables, or spreadsheet examples
                </p>
              </div>

              <div className="space-y-2">
                <Label>Or Paste Document Content</Label>
                <Textarea
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  placeholder="Paste the statutory deduction rules, rate tables, or calculation examples here..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !documentContent.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze & Extract Rules
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {(analysisResult || existingRules) ? (
                <div className="space-y-4 pr-4">
                  {/* Calculation Rules */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Calculation Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(analysisResult?.calculationRules || existingRules)?.map((rule: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted rounded-lg space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{rule.type}</Badge>
                            <span className="font-medium text-sm">{rule.description}</span>
                          </div>
                          {rule.formula && (
                            <code className="block text-xs bg-background p-2 rounded">
                              {rule.formula}
                            </code>
                          )}
                          {rule.conditions && (
                            <p className="text-xs text-muted-foreground">
                              Conditions: {rule.conditions}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Dependencies */}
                  {((analysisResult?.dependencies?.length || 0) > 0 || (existingDependencies?.length || 0) > 0) && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          Dependencies on Other Statutories
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(analysisResult?.dependencies || existingDependencies)?.map((dep: any, idx: number) => (
                          <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="font-medium text-sm">
                              Depends on: <Badge>{dep.dependsOn}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dep.relationship}: {dep.description}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Exemptions */}
                  {(analysisResult?.exemptions?.length || 0) > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Exemptions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {analysisResult?.exemptions.map((ex, idx) => (
                            <li key={idx}>{ex}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sample Calculations */}
                  {(analysisResult?.sampleCalculations?.length || 0) > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Sample Calculations</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysisResult?.sampleCalculations.map((calc, idx) => (
                          <div key={idx} className="p-3 bg-muted rounded-lg space-y-2">
                            <div className="font-medium text-sm">{calc.scenario}</div>
                            <div className="text-xs space-y-1">
                              <div>
                                <strong>Inputs:</strong>{" "}
                                {Object.entries(calc.inputs || {}).map(([k, v]) => `${k}: ${v}`).join(", ")}
                              </div>
                              <div>
                                <strong>Calculation:</strong> {calc.calculation}
                              </div>
                              <div className="text-green-600 font-medium">
                                <strong>Result:</strong> {calc.result}
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {statutory?.ai_analyzed_at && (
                    <p className="text-xs text-muted-foreground text-center">
                      Last analyzed: {new Date(statutory.ai_analyzed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>No analysis results yet</p>
                  <p className="text-sm">Upload a document and run analysis</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sample" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {(sampleDocument || existingDocument) ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert pr-4"
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(sampleDocument || existingDocument || ""),
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>No sample document generated yet</p>
                  <p className="text-sm">Run analysis to generate documentation</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
