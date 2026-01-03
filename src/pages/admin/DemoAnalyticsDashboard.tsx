import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useDemoAnalyticsStats,
  useProspectsWithScores,
  useExperienceMetrics,
  useComputeLeadScores,
} from "@/hooks/useDemoAnalytics";
import { LeadPipelineCard } from "./demo-analytics/LeadPipelineCard";
import { ProspectTable } from "./demo-analytics/ProspectTable";
import { ExperienceMetricsCard } from "./demo-analytics/ExperienceMetricsCard";
import { AIInsightsPanel } from "./demo-analytics/AIInsightsPanel";
import {
  Users,
  Mail,
  TrendingUp,
  Target,
  RefreshCw,
  Calculator,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function DemoAnalyticsDashboard() {
  const { toast } = useToast();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDemoAnalyticsStats();
  const { data: prospects, isLoading: prospectsLoading, refetch: refetchProspects } = useProspectsWithScores();
  const { data: experienceMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useExperienceMetrics();
  const computeScores = useComputeLeadScores();

  const handleComputeScores = async () => {
    try {
      const result = await computeScores.mutateAsync(undefined);
      toast({
        title: "Lead scores computed",
        description: `Processed ${result.processed} sessions`,
      });
    } catch (error) {
      toast({
        title: "Error computing scores",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchProspects();
    refetchMetrics();
  };

  const isLoading = statsLoading || prospectsLoading || metricsLoading;

  const statCards = [
    {
      title: "Total Sessions",
      value: stats?.total_sessions || 0,
      subtitle: `${stats?.sessions_this_month || 0} this month`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Identified Leads",
      value: stats?.identified_leads || 0,
      subtitle: "With email captured",
      icon: Mail,
      color: "text-emerald-600",
    },
    {
      title: "Avg Engagement",
      value: stats?.avg_engagement_score || 0,
      subtitle: "Engagement score",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversion_rate || 0}%`,
      subtitle: "Qualified / Identified",
      icon: Target,
      color: "text-orange-600",
    },
  ];

  // Prepare data for AI insights
  const topProspects = (prospects || [])
    .filter(p => p.lead_score)
    .sort((a, b) => (b.lead_score?.engagement_score || 0) - (a.lead_score?.engagement_score || 0))
    .slice(0, 5)
    .map(p => ({
      email: p.email,
      company_name: p.company_name,
      engagement_score: p.lead_score?.engagement_score || 0,
      lead_temperature: p.lead_score?.lead_temperature || "cold",
    }));

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Demo Analytics
            </h1>
            <p className="text-muted-foreground">
              Track prospect engagement and lead scores
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleComputeScores}
            disabled={computeScores.isPending}
          >
            {computeScores.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Compute Scores
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline and Insights */}
        <div className="space-y-6">
          <LeadPipelineCard
            qualified={stats?.qualified_leads || 0}
            hot={stats?.hot_leads || 0}
            warm={stats?.warm_leads || 0}
            cold={stats?.cold_leads || 0}
          />
          <AIInsightsPanel
            stats={stats || {
              total_sessions: 0,
              identified_leads: 0,
              avg_engagement_score: 0,
              qualified_leads: 0,
              hot_leads: 0,
              warm_leads: 0,
              cold_leads: 0,
            }}
            topProspects={topProspects}
            experienceMetrics={(experienceMetrics || []).map(e => ({
              experience_name: e.experience_name,
              avg_completion_rate: e.avg_completion_rate,
              lead_conversion_rate: e.lead_conversion_rate,
            }))}
          />
        </div>

        {/* Prospects and Experiences */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="prospects">
            <TabsList>
              <TabsTrigger value="prospects">Prospects</TabsTrigger>
              <TabsTrigger value="experiences">Experiences</TabsTrigger>
            </TabsList>
            <TabsContent value="prospects" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Prospects</CardTitle>
                </CardHeader>
                <CardContent>
                  {prospectsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ProspectTable prospects={prospects || []} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="experiences" className="mt-4">
              {metricsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ExperienceMetricsCard metrics={experienceMetrics || []} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
