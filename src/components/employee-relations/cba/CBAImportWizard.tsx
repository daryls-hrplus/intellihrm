import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, FileUp, BookOpen, Scale, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CBAImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  companyId: string;
  onImportComplete: () => void;
}

interface ExtractedClause {
  clause_number: string;
  title: string;
  content: string;
  clause_type: string;
  is_enforceable: boolean;
  rule_parameters?: {
    rule_type: string;
    value: number;
    unit: string;
    conditions?: string;
    enforcement_action: string;
  };
}

interface ExtractedArticle {
  article_number: string;
  title: string;
  category: string;
  content?: string;
  clauses?: ExtractedClause[];
}

interface ExtractedData {
  articles: ExtractedArticle[];
  summary: {
    total_articles: number;
    total_clauses: number;
    enforceable_rules_count: number;
    key_provisions: string[];
    effective_date?: string;
    expiry_date?: string;
  };
}

type WizardStep = "upload" | "analyzing" | "review" | "importing" | "complete";

export function CBAImportWizard({ open, onOpenChange, agreementId, companyId, onImportComplete }: CBAImportWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ["text/plain", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith(".txt") && !selectedFile.name.endsWith(".md")) {
        toast.error("Please upload a text, PDF, or Word document");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const analyzeDocument = async () => {
    if (!file) return;

    setStep("analyzing");
    setProgress(10);
    setError(null);

    try {
      // Read file content
      const content = await file.text();
      setProgress(30);

      // Call the edge function
      const { data, error: fnError } = await supabase.functions.invoke("analyze-cba-document", {
        body: { documentContent: content, agreementId }
      });

      setProgress(80);

      if (fnError) {
        throw new Error(fnError.message || "Failed to analyze document");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze document");
      }

      setExtractedData(data.data);
      setProgress(100);
      setStep("review");

    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze document");
      setStep("upload");
      toast.error("Failed to analyze document");
    }
  };

  const importData = async () => {
    if (!extractedData) return;

    setStep("importing");
    setProgress(0);

    try {
      const totalItems = extractedData.articles.length;
      let processed = 0;

      for (const article of extractedData.articles) {
        // Insert article
        const { data: articleData, error: articleError } = await supabase
          .from("cba_articles")
          .insert({
            agreement_id: agreementId,
            article_number: article.article_number,
            title: article.title,
            category: article.category,
            content: article.content || null,
            display_order: processed + 1
          })
          .select()
          .single();

        if (articleError) {
          console.error("Error inserting article:", articleError);
          continue;
        }

        // Insert clauses if any
        if (article.clauses && article.clauses.length > 0) {
          for (let i = 0; i < article.clauses.length; i++) {
            const clause = article.clauses[i];
            
            const { data: clauseData, error: clauseError } = await supabase
              .from("cba_clauses")
              .insert({
                article_id: articleData.id,
                clause_number: clause.clause_number,
                title: clause.title,
                content: clause.content,
                clause_type: clause.clause_type,
                is_enforceable: clause.is_enforceable,
                rule_parameters: clause.rule_parameters || null,
                display_order: i + 1
              })
              .select()
              .single();

            if (clauseError) {
              console.error("Error inserting clause:", clauseError);
              continue;
            }

            // If clause has enforceable rules, create a CBA rule
            if (clause.is_enforceable && clause.rule_parameters) {
              await supabase
                .from("cba_rules")
                .insert({
                  clause_id: clauseData.id,
                  agreement_id: agreementId,
                  company_id: companyId,
                  rule_type: clause.rule_parameters.rule_type,
                  rule_name: clause.title,
                  description: clause.content.substring(0, 500),
                  parameters: clause.rule_parameters,
                  enforcement_action: clause.rule_parameters.enforcement_action || "warn",
                  is_active: true
                });
            }
          }
        }

        processed++;
        setProgress(Math.round((processed / totalItems) * 100));
      }

      setStep("complete");
      toast.success("CBA document imported successfully!");

    } catch (err) {
      console.error("Import error:", err);
      setError(err instanceof Error ? err.message : "Failed to import data");
      toast.error("Failed to import data");
    }
  };

  const handleClose = () => {
    if (step === "complete") {
      onImportComplete();
    }
    setStep("upload");
    setFile(null);
    setExtractedData(null);
    setProgress(0);
    setError(null);
    onOpenChange(false);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      wages: "bg-green-500/10 text-green-600",
      benefits: "bg-blue-500/10 text-blue-600",
      scheduling: "bg-purple-500/10 text-purple-600",
      discipline: "bg-red-500/10 text-red-600",
      seniority: "bg-amber-500/10 text-amber-600",
      leave: "bg-teal-500/10 text-teal-600",
      safety: "bg-orange-500/10 text-orange-600",
      grievance: "bg-rose-500/10 text-rose-600",
      management_rights: "bg-slate-500/10 text-slate-600",
      union_rights: "bg-indigo-500/10 text-indigo-600",
      general: "bg-gray-500/10 text-gray-600"
    };
    return colors[category] || colors.general;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Document Import Wizard
          </DialogTitle>
          <DialogDescription>
            Upload your collective bargaining agreement document and let AI extract the structure automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Step: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-12 w-12 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Drop your CBA document here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports TXT, MD, PDF, DOC, DOCX
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  What AI will extract:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Articles and sections with numbering</li>
                  <li>• Individual clauses and provisions</li>
                  <li>• Enforceable rules (hours, overtime, breaks, etc.)</li>
                  <li>• Categories for easy navigation</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step: Analyzing */}
          {step === "analyzing" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Analyzing Document</h3>
                <p className="text-muted-foreground">AI is extracting the CBA structure...</p>
              </div>
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground mt-2">{progress}%</p>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && extractedData && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{extractedData.summary.total_articles}</p>
                    <p className="text-xs text-muted-foreground">Articles</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{extractedData.summary.total_clauses}</p>
                    <p className="text-xs text-muted-foreground">Clauses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{extractedData.summary.enforceable_rules_count}</p>
                    <p className="text-xs text-muted-foreground">Enforceable Rules</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{extractedData.summary.key_provisions?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Key Provisions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Key Provisions */}
              {extractedData.summary.key_provisions && extractedData.summary.key_provisions.length > 0 && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Key Provisions Identified</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {extractedData.summary.key_provisions.map((provision, idx) => (
                        <Badge key={idx} variant="secondary">{provision}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Articles List */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Extracted Articles & Clauses</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[300px]">
                    <Accordion type="multiple" className="w-full">
                      {extractedData.articles.map((article, idx) => (
                        <AccordionItem key={idx} value={`article-${idx}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <span className="font-mono text-sm">{article.article_number}</span>
                              <span className="font-medium">{article.title}</span>
                              <Badge className={getCategoryBadgeColor(article.category)}>
                                {article.category}
                              </Badge>
                              {article.clauses && (
                                <Badge variant="outline">{article.clauses.length} clauses</Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            {article.clauses && article.clauses.length > 0 ? (
                              <div className="space-y-2 pl-4">
                                {article.clauses.map((clause, cIdx) => (
                                  <div key={cIdx} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                                    <span className="font-mono text-xs text-muted-foreground">{clause.clause_number}</span>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{clause.title}</p>
                                      <p className="text-xs text-muted-foreground line-clamp-2">{clause.content}</p>
                                    </div>
                                    {clause.is_enforceable && (
                                      <Badge variant="default" className="text-xs">
                                        <Scale className="h-3 w-3 mr-1" />
                                        Enforceable
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground pl-4">{article.content || "No clauses extracted"}</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-700 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Review the extracted content before importing. You can edit details after import.</span>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">Importing Data</h3>
                <p className="text-muted-foreground">Saving articles, clauses, and rules...</p>
              </div>
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground mt-2">{progress}%</p>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === "complete" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Import Complete!</h3>
                <p className="text-muted-foreground">
                  Successfully imported {extractedData?.summary.total_articles} articles and {extractedData?.summary.total_clauses} clauses.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={analyzeDocument} disabled={!file}>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Document
              </Button>
            </>
          )}
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
              <Button onClick={importData}>
                <FileUp className="h-4 w-4 mr-2" />
                Import {extractedData?.summary.total_articles} Articles
              </Button>
            </>
          )}
          {step === "complete" && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
