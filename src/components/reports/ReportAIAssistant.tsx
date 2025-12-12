import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Sparkles, 
  MessageSquare, 
  Loader2, 
  Check,
  ArrowRight,
  Lightbulb,
  Table,
  Calculator,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReportDataSource, ReportTemplate } from '@/hooks/useReportWriter';

interface ReportAIAssistantProps {
  module: string;
  dataSources: ReportDataSource[];
  currentTemplate?: Partial<ReportTemplate>;
  onApplyTemplate: (template: Partial<ReportTemplate>) => void;
  onApplySuggestions: (suggestions: FieldSuggestions) => void;
}

interface FieldSuggestions {
  suggested_fields: string[];
  suggested_grouping: { field: string; reason: string }[];
  suggested_calculations: { type: string; field: string; reason: string }[];
  suggested_parameters: { name: string; type: string; reason: string }[];
  layout_suggestions: string;
}

interface NLQueryResult {
  interpretation: string;
  data_source: string;
  fields_to_display: string[];
  filters: { field: string; operator: string; value: string }[];
  grouping: { field: string }[];
  sorting: { field: string; order: string }[];
  calculations: { type: string; field: string; label: string }[];
  full_template: Partial<ReportTemplate>;
}

export function ReportAIAssistant({
  module,
  dataSources,
  currentTemplate,
  onApplyTemplate,
  onApplySuggestions
}: ReportAIAssistantProps) {
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<FieldSuggestions | null>(null);
  const [nlQueryResult, setNlQueryResult] = useState<NLQueryResult | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<Partial<ReportTemplate> | null>(null);

  const callAI = async (action: string, userPrompt: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('report-ai-assistant', {
        body: {
          action,
          prompt: userPrompt,
          module,
          dataSources: dataSources.map(ds => ({
            code: ds.code,
            name: ds.name,
            available_fields: ds.available_fields
          })),
          currentTemplate
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'AI request failed');
      }

      return data.result;
    } catch (error) {
      console.error('AI assistant error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI assistance');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what report you want to create');
      return;
    }

    const result = await callAI('generate_template', prompt);
    if (result) {
      setGeneratedTemplate(result);
      toast.success('Report template generated!');
    }
  };

  const handleSuggestFields = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want in the report');
      return;
    }

    const result = await callAI('suggest_fields', prompt);
    if (result) {
      setSuggestions(result);
      toast.success('Suggestions ready!');
    }
  };

  const handleNaturalLanguageQuery = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter your query');
      return;
    }

    const result = await callAI('natural_language_query', prompt);
    if (result) {
      setNlQueryResult(result);
      toast.success('Query processed!');
    }
  };

  const applyGeneratedTemplate = () => {
    if (generatedTemplate) {
      onApplyTemplate(generatedTemplate);
      toast.success('Template applied!');
    }
  };

  const applySuggestions = () => {
    if (suggestions) {
      onApplySuggestions(suggestions);
      toast.success('Suggestions applied!');
    }
  };

  const applyNLQueryTemplate = () => {
    if (nlQueryResult?.full_template) {
      onApplyTemplate(nlQueryResult.full_template);
      toast.success('Query converted to template!');
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Report Assistant
        </CardTitle>
        <CardDescription>
          Use AI to help design your report template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="generate" className="gap-1 text-xs">
              <Wand2 className="h-3 w-3" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="suggest" className="gap-1 text-xs">
              <Lightbulb className="h-3 w-3" />
              Suggest
            </TabsTrigger>
            <TabsTrigger value="query" className="gap-1 text-xs">
              <MessageSquare className="h-3 w-3" />
              Query
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <Textarea
              placeholder={
                activeTab === 'generate' 
                  ? "Describe the report you want to create... e.g., 'A monthly employee headcount report grouped by department showing hire date and status'"
                  : activeTab === 'suggest'
                  ? "Describe what data you're interested in... e.g., 'I want to analyze employee turnover trends'"
                  : "Ask in plain English... e.g., 'Show me all employees hired this year by department'"
              }
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />

            <Button 
              onClick={
                activeTab === 'generate' ? handleGenerateTemplate :
                activeTab === 'suggest' ? handleSuggestFields :
                handleNaturalLanguageQuery
              }
              disabled={isLoading || !prompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {activeTab === 'generate' ? 'Generate Template' :
                   activeTab === 'suggest' ? 'Get Suggestions' :
                   'Process Query'}
                </>
              )}
            </Button>

            <TabsContent value="generate" className="mt-0">
              {generatedTemplate && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Generated Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm ml-2">{generatedTemplate.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Data Source:</span>
                      <Badge variant="secondary" className="ml-2">{generatedTemplate.data_source}</Badge>
                    </div>
                    {generatedTemplate.description && (
                      <p className="text-sm text-muted-foreground">{generatedTemplate.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {generatedTemplate.bands?.length || 0} bands
                      </Badge>
                      <Badge variant="outline">
                        {generatedTemplate.parameters?.length || 0} parameters
                      </Badge>
                      <Badge variant="outline">
                        {generatedTemplate.grouping?.length || 0} groups
                      </Badge>
                    </div>
                    <Button onClick={applyGeneratedTemplate} size="sm" className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Apply This Template
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="suggest" className="mt-0">
              {suggestions && (
                <ScrollArea className="h-[300px] mt-4">
                  <div className="space-y-4">
                    {suggestions.suggested_fields.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Table className="h-4 w-4" />
                          Suggested Fields
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {suggestions.suggested_fields.map(field => (
                            <Badge key={field} variant="secondary">{field}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.suggested_grouping.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Filter className="h-4 w-4" />
                          Suggested Grouping
                        </h4>
                        {suggestions.suggested_grouping.map((g, i) => (
                          <div key={i} className="text-sm">
                            <Badge variant="outline">{g.field}</Badge>
                            <span className="text-muted-foreground ml-2">- {g.reason}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {suggestions.suggested_calculations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Calculator className="h-4 w-4" />
                          Suggested Calculations
                        </h4>
                        {suggestions.suggested_calculations.map((c, i) => (
                          <div key={i} className="text-sm">
                            <Badge variant="outline">{c.type}({c.field})</Badge>
                            <span className="text-muted-foreground ml-2">- {c.reason}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {suggestions.layout_suggestions && (
                      <div>
                        <Separator className="my-2" />
                        <p className="text-sm text-muted-foreground">{suggestions.layout_suggestions}</p>
                      </div>
                    )}

                    <Button onClick={applySuggestions} size="sm" className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Apply Suggestions
                    </Button>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="query" className="mt-0">
              {nlQueryResult && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Query Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm bg-muted p-2 rounded">
                      {nlQueryResult.interpretation}
                    </p>
                    
                    <div>
                      <span className="text-sm font-medium">Data Source:</span>
                      <Badge variant="secondary" className="ml-2">{nlQueryResult.data_source}</Badge>
                    </div>

                    {nlQueryResult.fields_to_display.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Fields:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {nlQueryResult.fields_to_display.map(f => (
                            <Badge key={f} variant="outline">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {nlQueryResult.grouping.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Group by:</span>
                        <span className="text-sm ml-2">
                          {nlQueryResult.grouping.map(g => g.field).join(', ')}
                        </span>
                      </div>
                    )}

                    {nlQueryResult.calculations.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Calculations:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {nlQueryResult.calculations.map((c, i) => (
                            <Badge key={i} variant="secondary">
                              {c.label}: {c.type}({c.field})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button onClick={applyNLQueryTemplate} size="sm" className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Create Report from Query
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
