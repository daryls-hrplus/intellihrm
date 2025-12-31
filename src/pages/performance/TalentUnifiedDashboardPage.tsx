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
import { useNavigate } from "react-router-dom";
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

export default function TalentUnifiedDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

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
              <Button onClick={() => navigate("/performance")} variant="outline">
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
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/performance")}>
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
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/succession")}>
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
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/training")}>
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
                      <span>{learningData?.activeEnrollments || 0} in progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span>{learningData?.completedCourses || 0} completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-amber-500" />
                      <span>{learningData?.certifications || 0} certifications</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3 text-cyan-600" />
                      <span>{learningData?.totalCourses || 0} courses</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <CardTitle>AI-Powered Insights</CardTitle>
            </div>
            <CardDescription>
              Cross-module analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : insights.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {insights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        insight.type === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' :
                        insight.type === 'alert' ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' :
                        insight.type === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' :
                        'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          insight.type === 'warning' ? 'text-amber-600' :
                          insight.type === 'alert' ? 'text-red-600' :
                          insight.type === 'success' ? 'text-emerald-600' :
                          'text-blue-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto mt-2 text-xs"
                            onClick={() => navigate(insight.action)}
                          >
                            {insight.actionLabel} <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No actionable insights at this time. Great job!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Navigation Tabs */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="succession">Succession</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Appraisals", href: "/performance/appraisals", icon: Target },
                { label: "Goals", href: "/performance/goals", icon: CheckCircle },
                { label: "Continuous Feedback", href: "/performance/feedback", icon: TrendingUp },
                { label: "Recognition", href: "/performance/recognition", icon: Award },
              ].map(item => (
                <Button
                  key={item.label}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="succession" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "9-Box Assessment", href: "/succession/nine-box", icon: BarChart3 },
                { label: "Talent Pools", href: "/succession/talent-pools", icon: Users },
                { label: "Succession Plans", href: "/succession/plans", icon: GitBranch },
                { label: "Key Positions", href: "/succession/key-positions", icon: UserCheck },
              ].map(item => (
                <Button
                  key={item.label}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="learning" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Course Catalog", href: "/training/catalog", icon: GraduationCap },
                { label: "Learning Paths", href: "/training/learning-paths", icon: TrendingUp },
                { label: "Career Paths", href: "/training/career-paths", icon: GitBranch },
                { label: "Mentorship", href: "/training/mentorship", icon: Users },
              ].map(item => (
                <Button
                  key={item.label}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
