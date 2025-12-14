import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wand2, 
  Sparkles, 
  Loader2, 
  Check,
  ArrowRight,
  Lightbulb,
  LayoutDashboard,
  BarChart3,
  PieChart,
  LineChart,
  Hash
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BIDataSource, BIWidget, BIDashboard } from '@/hooks/useBITool';

interface BIAIAssistantProps {
  module: string;
  dataSources: BIDataSource[];
  onApplyDashboard?: (dashboard: Partial<BIDashboard>, widgets: Partial<BIWidget>[]) => void;
  onApplyWidget?: (widget: Partial<BIWidget>) => void;
}

interface WidgetSuggestion {
  name: string;
  description: string;
  widget_type: string;
  chart_type?: string;
  data_source: string;
  reason: string;
}

interface SuggestionsResult {
  suggestions: WidgetSuggestion[];
  dashboard_theme: string;
}

interface GeneratedDashboard {
  name: string;
  code: string;
  description: string;
  widgets: Partial<BIWidget>[];
}

interface GeneratedWidget {
  name: string;
  widget_type: string;
  chart_type?: string;
  data_source: string;
  custom_sql?: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
  explanation?: string;
}

const getWidgetIcon = (type: string, chartType?: string) => {
  if (type === 'kpi') return Hash;
  if (type === 'table') return LayoutDashboard;
  if (chartType === 'pie') return PieChart;
  if (chartType === 'line' || chartType === 'area') return LineChart;
  return BarChart3;
};

export function BIAIAssistant({
  module,
  dataSources,
  onApplyDashboard,
  onApplyWidget
}: BIAIAssistantProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsResult | null>(null);
  const [generatedDashboard, setGeneratedDashboard] = useState<GeneratedDashboard | null>(null);
  const [generatedWidget, setGeneratedWidget] = useState<GeneratedWidget | null>(null);

  const callAI = async (action: string, userPrompt: string, currentConfig?: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bi-ai-assistant', {
        body: {
          action,
          prompt: userPrompt,
          module,
          dataSources: dataSources.map(ds => ({
            code: ds.code,
            name: ds.name,
            base_table: ds.base_table,
            available_fields: ds.available_fields
          })),
          currentConfig
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
      console.error('BI AI assistant error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI assistance');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDashboard = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what dashboard you want to create');
      return;
    }

    const result = await callAI('generate_dashboard', prompt);
    if (result) {
      setGeneratedDashboard(result);
      toast.success('Dashboard generated!');
    }
  };

  const handleGenerateWidget = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what widget you want to create');
      return;
    }

    const result = await callAI('generate_widget', prompt);
    if (result) {
      setGeneratedWidget(result);
      toast.success('Widget generated!');
    }
  };

  const handleSuggestWidgets = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what insights you want');
      return;
    }

    const result = await callAI('suggest_widgets', prompt);
    if (result) {
      setSuggestions(result);
      toast.success('Suggestions ready!');
    }
  };

  const applyGeneratedDashboard = () => {
    if (generatedDashboard && onApplyDashboard) {
      const { widgets, ...dashboardData } = generatedDashboard;
      onApplyDashboard(dashboardData, widgets);
      toast.success('Dashboard applied!');
    }
  };

  const applyGeneratedWidget = () => {
    if (generatedWidget && onApplyWidget) {
      onApplyWidget({
        ...generatedWidget,
        widget_type: generatedWidget.widget_type as BIWidget['widget_type'],
        chart_type: generatedWidget.chart_type as BIWidget['chart_type']
      });
      toast.success('Widget applied!');
    }
  };

  const applySuggestionAsWidget = (suggestion: WidgetSuggestion) => {
    if (onApplyWidget) {
      onApplyWidget({
        name: suggestion.name,
        widget_type: suggestion.widget_type as BIWidget['widget_type'],
        chart_type: suggestion.chart_type as BIWidget['chart_type'],
        data_source: suggestion.data_source,
        config: {},
        position: { x: 0, y: 0, w: 6, h: 4 }
      });
      toast.success('Widget suggestion applied!');
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Dashboard Assistant
        </CardTitle>
        <CardDescription>
          Use AI to design dashboards and widgets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="dashboard" className="gap-1 text-xs">
              <LayoutDashboard className="h-3 w-3" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="widget" className="gap-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              Widget
            </TabsTrigger>
            <TabsTrigger value="suggest" className="gap-1 text-xs">
              <Lightbulb className="h-3 w-3" />
              Suggest
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <Textarea
              placeholder={
                activeTab === 'dashboard' 
                  ? "Describe the dashboard you want... e.g., 'An HR overview dashboard showing headcount by department, leave trends, and recent hires'"
                  : activeTab === 'widget'
                  ? "Describe the widget you want... e.g., 'A pie chart showing employee distribution by department'"
                  : "Describe what insights you need... e.g., 'I want to track employee retention and turnover'"
              }
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />

            <Button 
              onClick={
                activeTab === 'dashboard' ? handleGenerateDashboard :
                activeTab === 'widget' ? handleGenerateWidget :
                handleSuggestWidgets
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
                  <Wand2 className="h-4 w-4 mr-2" />
                  {activeTab === 'dashboard' ? 'Generate Dashboard' :
                   activeTab === 'widget' ? 'Generate Widget' :
                   'Get Suggestions'}
                </>
              )}
            </Button>

            <TabsContent value="dashboard" className="mt-0">
              {generatedDashboard && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Generated Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm ml-2">{generatedDashboard.name}</span>
                    </div>
                    {generatedDashboard.description && (
                      <p className="text-sm text-muted-foreground">{generatedDashboard.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {generatedDashboard.widgets?.length || 0} widgets
                      </Badge>
                    </div>
                    {generatedDashboard.widgets && generatedDashboard.widgets.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Widgets:</span>
                        {generatedDashboard.widgets.map((w, i) => {
                          const Icon = getWidgetIcon(w.widget_type as string, w.chart_type as string);
                          return (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{w.name}</span>
                              <Badge variant="secondary" className="text-xs">{w.widget_type}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {onApplyDashboard && (
                      <Button onClick={applyGeneratedDashboard} size="sm" className="w-full">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Apply Dashboard
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="widget" className="mt-0">
              {generatedWidget && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Generated Widget
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm ml-2">{generatedWidget.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{generatedWidget.widget_type}</Badge>
                      {generatedWidget.chart_type && (
                        <Badge variant="outline">{generatedWidget.chart_type}</Badge>
                      )}
                    </div>
                    {generatedWidget.explanation && (
                      <p className="text-sm text-muted-foreground">{generatedWidget.explanation}</p>
                    )}
                    {generatedWidget.custom_sql && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium">SQL Query:</span>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-24">
                          {generatedWidget.custom_sql}
                        </pre>
                      </div>
                    )}
                    {onApplyWidget && (
                      <Button onClick={applyGeneratedWidget} size="sm" className="w-full">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Apply Widget
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="suggest" className="mt-0">
              {suggestions && (
                <ScrollArea className="h-[300px] mt-4">
                  <div className="space-y-4">
                    {suggestions.dashboard_theme && (
                      <div className="p-2 bg-muted rounded">
                        <span className="text-sm font-medium">Theme: </span>
                        <span className="text-sm text-muted-foreground">{suggestions.dashboard_theme}</span>
                      </div>
                    )}
                    {suggestions.suggestions.map((suggestion, i) => {
                      const Icon = getWidgetIcon(suggestion.widget_type, suggestion.chart_type);
                      return (
                        <Card key={i} className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{suggestion.name}</span>
                                <Badge variant="secondary" className="text-xs">{suggestion.widget_type}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                              <p className="text-xs text-primary">{suggestion.reason}</p>
                              {onApplyWidget && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2 h-7 text-xs"
                                  onClick={() => applySuggestionAsWidget(suggestion)}
                                >
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  Use This
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
