import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Sparkles, Loader2, Network, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { markdownToHtml } from "@/lib/utils/markdown";
import { getCountryName } from "@/lib/countries";

interface ComprehensiveStatutoryDocumentationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string;
  stateProvince?: string;
  statutories: Array<{
    id: string;
    statutory_name: string;
    statutory_code: string;
    statutory_type: string;
    description: string | null;
    ai_calculation_rules?: any;
    ai_dependencies?: any[];
  }>;
}

interface ExistingDoc {
  comprehensive_document: string;
  dependency_map: Record<string, string[]>;
  generated_at: string;
}

export function ComprehensiveStatutoryDocumentation({
  open,
  onOpenChange,
  country,
  stateProvince,
  statutories,
}: ComprehensiveStatutoryDocumentationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [document, setDocument] = useState<string>("");
  const [dependencyMap, setDependencyMap] = useState<Record<string, string[]>>({});
  const [existingDoc, setExistingDoc] = useState<ExistingDoc | null>(null);
  const [activeTab, setActiveTab] = useState("document");

  useEffect(() => {
    if (open && country) {
      loadExistingDocumentation();
    }
  }, [open, country, stateProvince]);

  const loadExistingDocumentation = async () => {
    const query = supabase
      .from("statutory_country_documentation")
      .select("*")
      .eq("country", country);

    if (stateProvince) {
      query.eq("state_province", stateProvince);
    } else {
      query.is("state_province", null);
    }

    const { data, error } = await query.single();

    if (!error && data) {
      setExistingDoc(data as unknown as ExistingDoc);
      setDocument(data.comprehensive_document || "");
      setDependencyMap((data.dependency_map as Record<string, string[]>) || {});
    }
  };

  const handleGenerate = async () => {
    if (statutories.length === 0) {
      toast.error("No statutory deductions found for this country");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-statutory-document", {
        body: {
          action: "generate_comprehensive",
          country,
          stateProvince,
          allStatutories: statutories,
        },
      });

      if (error) throw error;

      setDocument(data.document);
      setDependencyMap(data.dependencyMap || {});
      setActiveTab("document");
      toast.success("Comprehensive documentation generated");
      loadExistingDocumentation();
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate documentation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([document], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `statutory-deductions-${country}${stateProvince ? `-${stateProvince}` : ""}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const countryName = getCountryName(country);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Comprehensive Statutory Documentation - {countryName}
            {stateProvince && ` (${stateProvince})`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {statutories.length} statutory deduction type{statutories.length !== 1 ? "s" : ""} configured
          </div>
          <div className="flex items-center gap-2">
            {document && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download MD
              </Button>
            )}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || statutories.length === 0}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : document ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Documentation
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="document">Full Documentation</TabsTrigger>
            <TabsTrigger value="dependencies">Dependency Map</TabsTrigger>
            <TabsTrigger value="summary">Quick Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="document">
            <ScrollArea className="h-[500px] border rounded-lg p-4">
              {document ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(document) }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No documentation generated yet</p>
                  <p className="text-sm">Click "Generate Documentation" to create comprehensive docs</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="dependencies">
            <ScrollArea className="h-[500px] border rounded-lg p-4">
              {Object.keys(dependencyMap).length > 0 ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        Statutory Dependencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(dependencyMap).map(([code, deps]) => (
                          <div key={code} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default">{code}</Badge>
                              <span className="text-sm text-muted-foreground">depends on:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {deps.map((dep) => (
                                <Badge key={dep} variant="outline">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Calculation Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Based on dependencies, statutory deductions should be calculated in this order:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getCalculationOrder(statutories, dependencyMap).map((code, idx) => (
                          <div key={code} className="flex items-center gap-1">
                            <Badge variant="secondary">
                              {idx + 1}. {code}
                            </Badge>
                            {idx < getCalculationOrder(statutories, dependencyMap).length - 1 && (
                              <span className="text-muted-foreground">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Network className="h-16 w-16 mb-4 opacity-50" />
                  <p>No dependency information available</p>
                  <p className="text-sm">Generate documentation to analyze dependencies</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary">
            <ScrollArea className="h-[500px] border rounded-lg p-4">
              <div className="space-y-4">
                {statutories.map((stat) => (
                  <Card key={stat.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{stat.statutory_name}</CardTitle>
                        <Badge variant="outline">{stat.statutory_code}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {stat.description || "No description provided"}
                      </p>
                      {stat.ai_calculation_rules && (
                        <div className="text-xs">
                          <strong>Rules:</strong> {stat.ai_calculation_rules.length} calculation rule(s) defined
                        </div>
                      )}
                      {stat.ai_dependencies && stat.ai_dependencies.length > 0 && (
                        <div className="text-xs text-yellow-600">
                          <strong>Dependencies:</strong>{" "}
                          {stat.ai_dependencies.map((d: any) => d.dependsOn).join(", ")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {existingDoc && (
          <p className="text-xs text-muted-foreground text-center">
            Last generated: {new Date(existingDoc.generated_at).toLocaleString()}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to determine calculation order based on dependencies
function getCalculationOrder(
  statutories: Array<{ statutory_code: string }>,
  dependencyMap: Record<string, string[]>
): string[] {
  const codes = statutories.map((s) => s.statutory_code);
  const result: string[] = [];
  const visited = new Set<string>();

  function visit(code: string) {
    if (visited.has(code)) return;
    visited.add(code);

    const deps = dependencyMap[code] || [];
    deps.forEach((dep) => {
      if (codes.includes(dep)) {
        visit(dep);
      }
    });

    result.push(code);
  }

  codes.forEach(visit);
  return result;
}
