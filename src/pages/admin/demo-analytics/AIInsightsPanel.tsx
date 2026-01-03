import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RefreshCw, Lightbulb, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIInsightsPanelProps {
  stats: {
    total_sessions: number;
    identified_leads: number;
    avg_engagement_score: number;
    qualified_leads: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
  };
  topProspects: Array<{
    email: string | null;
    company_name: string | null;
    engagement_score: number;
    lead_temperature: string;
  }>;
  experienceMetrics: Array<{
    experience_name: string;
    avg_completion_rate: number;
    lead_conversion_rate: number;
  }>;
}

interface AIInsight {
  type: "action" | "optimization" | "trend" | "alert";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function AIInsightsPanel({ stats, topProspects, experienceMetrics }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const prompt = `Analyze this product demo engagement data and provide 4-5 actionable insights:

**Dashboard Stats:**
- Total Sessions: ${stats.total_sessions}
- Identified Leads: ${stats.identified_leads}
- Average Engagement Score: ${stats.avg_engagement_score}
- Lead Distribution: ${stats.qualified_leads} qualified, ${stats.hot_leads} hot, ${stats.warm_leads} warm, ${stats.cold_leads} cold

**Top Prospects:**
${topProspects.slice(0, 5).map(p => 
  `- ${p.email || 'Anonymous'} (${p.company_name || 'Unknown company'}): Score ${p.engagement_score}, ${p.lead_temperature}`
).join('\n')}

**Experience Performance:**
${experienceMetrics.map(e => 
  `- ${e.experience_name}: ${e.avg_completion_rate}% completion, ${e.lead_conversion_rate}% conversion`
).join('\n')}

Provide insights in this JSON format:
[
  {
    "type": "action|optimization|trend|alert",
    "title": "Brief title",
    "description": "Actionable insight (1-2 sentences)",
    "priority": "high|medium|low"
  }
]

Focus on:
1. Which prospects to prioritize for follow-up
2. Content optimization opportunities
3. Engagement trends and patterns
4. Any concerning metrics that need attention`;

      const { data, error } = await supabase.functions.invoke("generate-ai-insights", {
        body: { prompt, context: "demo_analytics" },
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      // Fallback to rule-based insights
      const fallbackInsights: AIInsight[] = [];

      if (stats.qualified_leads > 0 || stats.hot_leads > 0) {
        fallbackInsights.push({
          type: "action",
          title: `${stats.qualified_leads + stats.hot_leads} high-priority leads to follow up`,
          description: "These prospects show strong buying signals. Prioritize outreach within 24 hours.",
          priority: "high",
        });
      }

      if (stats.identified_leads < stats.total_sessions * 0.3) {
        fallbackInsights.push({
          type: "optimization",
          title: "Lead capture rate is below target",
          description: `Only ${Math.round((stats.identified_leads / stats.total_sessions) * 100)}% of sessions result in email capture. Consider adding earlier lead gates.`,
          priority: "medium",
        });
      }

      const lowCompletionExp = experienceMetrics.find(e => e.avg_completion_rate < 50);
      if (lowCompletionExp) {
        fallbackInsights.push({
          type: "alert",
          title: `"${lowCompletionExp.experience_name}" has low completion`,
          description: `Only ${lowCompletionExp.avg_completion_rate}% completion rate. Consider shortening or restructuring content.`,
          priority: "medium",
        });
      }

      if (stats.avg_engagement_score > 50) {
        fallbackInsights.push({
          type: "trend",
          title: "Strong overall engagement",
          description: `Average score of ${stats.avg_engagement_score} indicates compelling content. Continue current approach.`,
          priority: "low",
        });
      }

      setInsights(fallbackInsights.length > 0 ? fallbackInsights : [
        {
          type: "action",
          title: "Start tracking engagement",
          description: "Add demo experiences and track prospect interactions to generate insights.",
          priority: "medium",
        },
      ]);

      toast({
        title: "Using rule-based insights",
        description: "AI insights temporarily unavailable. Showing automated analysis.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const iconMap = {
    action: Users,
    optimization: Lightbulb,
    trend: TrendingUp,
    alert: AlertTriangle,
  };

  const colorMap = {
    high: "border-l-red-500",
    medium: "border-l-amber-500",
    low: "border-l-blue-500",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Insights
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={generateInsights}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {insights.length > 0 ? "Refresh" : "Generate"}
        </Button>
      </CardHeader>
      <CardContent>
        {insights.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Click "Generate" to get AI-powered insights about your demo performance
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = iconMap[insight.type];
              return (
                <div
                  key={index}
                  className={`border-l-4 ${colorMap[insight.priority]} bg-muted/50 rounded-r-lg p-3`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{insight.title}</p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            insight.priority === "high"
                              ? "border-red-500 text-red-600"
                              : insight.priority === "medium"
                              ? "border-amber-500 text-amber-600"
                              : "border-blue-500 text-blue-600"
                          }`}
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
