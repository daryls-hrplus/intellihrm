import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Brain, 
  AlertCircle, 
  CheckCircle,
  BookOpen,
  Lightbulb,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface ExplainabilityLog {
  id: string;
  interaction_log_id: string | null;
  confidence_score: number | null;
  decision_factors: any;
  citations: any;
  uncertainty_areas: string[] | null;
  explanation_generated: string | null;
  model_used: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  context_sources_used: any;
  created_at: string | null;
  company_id: string | null;
}

export function AIExplainabilityPanel() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["ai-explainability-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_explainability_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ExplainabilityLog[];
    },
  });

  const getConfidenceColor = (score: number | null) => {
    if (!score) return "bg-muted";
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-amber-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (score: number | null) => {
    if (!score) return "Unknown";
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading explainability logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Explainability Logs
        </CardTitle>
        <CardDescription>
          Decision transparency and reasoning for AI responses (ISO 42001 compliance)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No explainability logs recorded yet</p>
            <p className="text-sm">Logs are generated for high-risk or complex AI interactions</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <Accordion type="single" collapsible className="space-y-2">
              {logs.map((log, index) => (
                <AccordionItem 
                  key={log.id} 
                  value={log.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getConfidenceColor(log.confidence_score)}`} />
                        <span className="font-medium">
                          Interaction #{logs.length - index}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {getConfidenceLabel(log.confidence_score)} Confidence
                      </Badge>
                      <span className="text-sm text-muted-foreground ml-auto mr-4">
                        {log.created_at && format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {/* Confidence Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Confidence Score</span>
                        <span>{((log.confidence_score || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(log.confidence_score || 0) * 100} className="h-2" />
                    </div>

                    {/* Decision Factors */}
                    {log.decision_factors && Array.isArray(log.decision_factors) && log.decision_factors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Decision Factors
                        </h4>
                        <div className="grid gap-2">
                          {log.decision_factors.map((factor: any, i: number) => (
                            <div 
                              key={i}
                              className="p-2 bg-muted rounded-md text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{factor.name}</span>
                                {factor.weight && (
                                  <Badge variant="secondary">
                                    Weight: {(factor.weight * 100).toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                              {factor.description && (
                                <p className="text-muted-foreground mt-1">{factor.description}</p>
                              )}
                              {factor.source && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Source: {factor.source}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Citations */}
                    {log.citations && Array.isArray(log.citations) && log.citations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Sources & Citations
                        </h4>
                        <div className="space-y-2">
                          {log.citations.map((citation: any, i: number) => (
                            <div 
                              key={i}
                              className="flex items-start gap-2 p-2 bg-muted rounded-md text-sm"
                            >
                              <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-medium">{citation.source}</span>
                                {citation.excerpt && (
                                  <p className="text-muted-foreground mt-1 italic">
                                    "{citation.excerpt}"
                                  </p>
                                )}
                                {citation.relevance && (
                                  <Badge variant="outline" className="mt-1">
                                    Relevance: {(citation.relevance * 100).toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uncertainty Areas */}
                    {log.uncertainty_areas && log.uncertainty_areas.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          Uncertainty Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {log.uncertainty_areas.map((area, i) => (
                            <Badge key={i} variant="outline" className="bg-amber-500/10">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Context Sources */}
                    {log.context_sources_used && (
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Context Sources Used
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(log.context_sources_used) 
                            ? log.context_sources_used.map((source: string, i: number) => (
                                <Badge key={i} variant="secondary">{source}</Badge>
                              ))
                            : Object.entries(log.context_sources_used).map(([key, value]) => (
                                value && <Badge key={key} variant="secondary">{key}</Badge>
                              ))
                          }
                        </div>
                      </div>
                    )}

                    {/* Generated Explanation */}
                    {log.explanation_generated && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Generated Explanation</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {log.explanation_generated}
                        </p>
                      </div>
                    )}

                    {/* Model Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <span>Model: {log.model_used || "Unknown"}</span>
                      {log.prompt_tokens && <span>Prompt: {log.prompt_tokens} tokens</span>}
                      {log.completion_tokens && <span>Completion: {log.completion_tokens} tokens</span>}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}