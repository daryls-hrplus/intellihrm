import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import {
  Target,
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  UserCheck,
  Clock,
  Award,
  GitBranch,
  Lightbulb,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { ISO42001ComplianceCard } from "@/components/ai/ISO42001ComplianceCard";
import { UpcomingRemindersWidget } from "@/components/performance/widgets/UpcomingRemindersWidget";

export default function TalentUnifiedDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { navigateToList } = useWorkspaceNavigation();

  // Fetch Performance Data
  const { data: performanceData, isLoading: perfLoading } = useQuery({
    queryKey: ["unified-performance-stats"],
    queryFn: async () => {
      const [goalsRes, appraisalsRes, pipsRes] = await Promise.all([
        supabase.from("performance_goals").select("id, status, final_score"),
        supabase.from("appraisal_participants").select("id, status, overall_score"),
        supabase.from("performance_improvement_plans").select("id, status"),
      ]);
      
      const goals = goalsRes.data || [];
      const appraisals = appraisalsRes.data || [];
      const pips = pipsRes.data || [];
      
      const completedAppraisals = appraisals.filter(a => a.status === 'completed' && a.overall_score != null);
      const avgScore = completedAppraisals.length > 0
        ? completedAppraisals.reduce((sum, a) => sum + (a.overall_score || 0), 0) / completedAppraisals.length
        : 0;
      
      return {
        activeGoals: goals.filter(g => g.status === 'active' || g.status === 'draft').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        pendingReviews: appraisals.filter(a => a.status === 'pending' || a.status === 'in_progress').length,
        completedReviews: appraisals.filter(a => a.status === 'completed').length,
        avgPerformanceScore: avgScore,
        activePips: pips.filter(p => p.status === 'active' || p.status === 'in_progress').length,
        totalAppraisals: appraisals.length,
      };
    },
    enabled: !!user,
  });

  // Fetch Succession Data using RPC or simple counts
  const { data: successionData, isLoading: succLoading } = useQuery({
    queryKey: ["unified-succession-stats"],
    queryFn: async () => {
      // Use simple count queries to avoid type issues
      const [poolsCount, plansCount] = await Promise.all([
        supabase.from("succession_talent_pools" as any).select("id", { count: "exact", head: true }),
        supabase.from("succession_plans" as any).select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      
      return {
        talentPools: poolsCount.count || 0,
        highPotentialCount: 0,
        activePlans: plansCount.count || 0,
        readyNow: 0,
        readySoon: 0,
        developing: 0,
        totalNominations: 0,
      };
    },
    enabled: !!user,
  });

  // Fetch Learning Data
  const { data: learningData, isLoading: learnLoading } = useQuery({
    queryKey: ["unified-learning-stats"],
    queryFn: async () => {
      const [coursesRes, enrollmentsRes, certsRes] = await Promise.all([
        supabase.from("lms_courses").select("id").eq("is_published", true),
        supabase.from("lms_enrollments").select("id, status, progress_percentage"),
        supabase.from("lms_certificates").select("id"),
      ]);
      
      const enrollments = enrollmentsRes.data || [];
      const avgProgress = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length
        : 0;
      
      return {
        totalCourses: coursesRes.data?.length || 0,
        activeEnrollments: enrollments.filter(e => e.status === 'enrolled' || e.status === 'in_progress').length,
        completedCourses: enrollments.filter(e => e.status === 'completed').length,
        certifications: certsRes.data?.length || 0,
        avgProgress: Math.round(avgProgress),
      };
    },
    enabled: !!user,
  });

  const isLoading = perfLoading || succLoading || learnLoading;

  // Calculate Talent Health Score
  const calculateTalentHealth = () => {
    if (!performanceData || !successionData || !learningData) return 0;
    
    const perfScore = performanceData.avgPerformanceScore ? (performanceData.avgPerformanceScore / 5) * 100 : 50;
    const succScore = successionData.readyNow > 0 ? 
      Math.min(100, (successionData.readyNow / Math.max(1, successionData.totalNominations)) * 100 + 50) : 30;
    const learnScore = learningData.avgProgress || 50;
    
    return Math.round((perfScore * 0.4 + succScore * 0.3 + learnScore * 0.3));
  };

  const talentHealth = calculateTalentHealth();

  // AI-Generated Insights
  const generateInsights = () => {
    const insights = [];
    
    if (performanceData?.activePips && performanceData.activePips > 0) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Performance Improvement Plans Active",
        description: `${performanceData.activePips} employee(s) are currently on improvement plans. Monitor progress and provide support.`,
        action: "/performance/pips",
        actionLabel: "View PIPs",
      });
    }
    
    if (successionData && successionData.readyNow < 3) {
      insights.push({
        type: "alert",
        icon: ShieldAlert,
        title: "Limited Succession Readiness",
        description: "Only a few successors are ready now. Consider accelerating development for high-potential talent.",
        action: "/succession/nine-box",
        actionLabel: "View 9-Box",
      });
    }
    
    if (learningData && learningData.activeEnrollments > learningData.completedCourses) {
      insights.push({
        type: "info",
        icon: GraduationCap,
        title: "Learning in Progress",
        description: `${learningData.activeEnrollments} active enrollments with ${learningData.avgProgress}% average progress. Encourage completion.`,
        action: "/training/employee-learning",
        actionLabel: "View Learning",
      });
    }
    
    if (performanceData && performanceData.pendingReviews > 5) {
      insights.push({
        type: "warning",
        icon: Clock,
        title: "Reviews Pending Completion",
        description: `${performanceData.pendingReviews} performance reviews are awaiting completion. Follow up with managers.`,
        action: "/performance/appraisals",
        actionLabel: "View Reviews",
      });
    }
    
    if (successionData && successionData.highPotentialCount > 0) {
      insights.push({
        type: "success",
        icon: Sparkles,
        title: "High Potential Talent Identified",
        description: `${successionData.highPotentialCount} high-potential talent pools established. Ensure development plans are in place.`,
        action: "/succession/talent-pools",
        actionLabel: "View Pools",
      });
    }
    
    return insights.slice(0, 4);
  };

  const insights = generateInsights();

  const getHealthColor = (score: number) => {
    if (score >= 75) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getHealthBg = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const handleNavigate = (route: string, title: string) => {
    navigateToList({ route, title, moduleCode: route.split('/')[1] || "performance" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Unified Talent Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Cross-module insights connecting Performance, Succession, and Learning
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ISO42001ComplianceCard />
              <Button onClick={() => handleNavigate("/performance", "Performance")} variant="outline">
                Module View <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Talent Health Score */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">AI-Powered Talent Health Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  {isLoading ? (
                    <Skeleton className="h-12 w-24" />
                  ) : (
                    <>
                      <span className={`text-5xl font-bold ${getHealthColor(talentHealth)}`}>
                        {talentHealth}
                      </span>
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground max-w-md">
                  Composite score based on performance outcomes, succession readiness, and learning engagement
                </p>
              </div>
              <div className="hidden sm:block w-48">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Performance (40%)</span>
                    <span>{performanceData?.avgPerformanceScore?.toFixed(1) || "N/A"}</span>
                  </div>
                  <Progress value={performanceData?.avgPerformanceScore ? (performanceData.avgPerformanceScore / 5) * 100 : 0} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span>Succession (30%)</span>
                    <span>{successionData?.readyNow || 0} ready</span>
                  </div>
                  <Progress value={successionData?.readyNow ? Math.min(100, successionData.readyNow * 20) : 0} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span>Learning (30%)</span>
                    <span>{learningData?.avgProgress || 0}%</span>
                  </div>
                  <Progress value={learningData?.avgProgress || 0} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Performance Summary */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleNavigate("/performance", "Performance")}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Performance</CardTitle>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Score</span>
                    <Badge variant="secondary" className="font-bold">
                      {performanceData?.avgPerformanceScore?.toFixed(1) || "N/A"}/5
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span>{performanceData?.completedReviews || 0} reviews done</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>{performanceData?.pendingReviews || 0} pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-primary" />
                      <span>{performanceData?.activeGoals || 0} active goals</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      <span>{performanceData?.activePips || 0} PIPs</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Succession Summary */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleNavigate("/succession", "Succession")}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <GitBranch className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardTitle className="text-base">Succession</CardTitle>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bench Strength</span>
                    <Badge variant="secondary" className="font-bold">
                      {successionData?.totalNominations || 0} nominees
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-emerald-500" />
                      <span>{successionData?.readyNow || 0} ready now</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>{successionData?.readySoon || 0} ready soon</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      <span>{successionData?.talentPools || 0} talent pools</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-purple-600" />
                      <span>{successionData?.activePlans || 0} active plans</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Summary */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleNavigate("/training", "Training")}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <GraduationCap className="h-4 w-4 text-cyan-600" />
                  </div>
                  <CardTitle className="text-base">Learning</CardTitle>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Progress</span>
                    <Badge variant="secondary" className="font-bold">
                      {learningData?.avgProgress || 0}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span>{learningData?.activeEnrollments || 0} enrollments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span>{learningData?.completedCourses || 0} completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3 text-cyan-600" />
                      <span>{learningData?.totalCourses || 0} courses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-amber-500" />
                      <span>{learningData?.certifications || 0} certificates</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
              </div>
              <CardDescription>
                Prioritized recommendations based on your talent data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {insights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            insight.type === 'warning' ? 'bg-amber-500/10' :
                            insight.type === 'alert' ? 'bg-red-500/10' :
                            insight.type === 'success' ? 'bg-emerald-500/10' :
                            'bg-blue-500/10'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              insight.type === 'warning' ? 'text-amber-600' :
                              insight.type === 'alert' ? 'text-red-600' :
                              insight.type === 'success' ? 'text-emerald-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              className="px-0 mt-2"
                              onClick={() => handleNavigate(insight.action, insight.actionLabel)}
                            >
                              {insight.actionLabel} <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Reminders */}
        <UpcomingRemindersWidget />

        {/* Cross-Module Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Cross-Module Activity</CardTitle>
              </div>
            </div>
            <CardDescription>
              How performance, succession, and learning connect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="flow">
              <TabsList className="mb-4">
                <TabsTrigger value="flow">Integration Flow</TabsTrigger>
                <TabsTrigger value="triggers">Active Triggers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="flow">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <Target className="h-8 w-8 mx-auto text-primary mb-2" />
                    <h4 className="font-medium">Performance</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Goals & reviews drive compensation and development
                    </p>
                    <ArrowRight className="h-4 w-4 mx-auto mt-2 text-muted-foreground" />
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <GitBranch className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <h4 className="font-medium">Succession</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      9-Box placement informs talent pipelines
                    </p>
                    <ArrowRight className="h-4 w-4 mx-auto mt-2 text-muted-foreground" />
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <GraduationCap className="h-8 w-8 mx-auto text-cyan-600 mb-2" />
                    <h4 className="font-medium">Learning</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Skill gaps trigger training recommendations
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="triggers">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700">Active</Badge>
                    <span className="text-sm">High performance → Merit increase eligibility</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700">Active</Badge>
                    <span className="text-sm">Competency gap → Training request generation</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700">Active</Badge>
                    <span className="text-sm">Low performance → PIP recommendation</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700">Pending</Badge>
                    <span className="text-sm">9-Box movement → Development plan update</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}