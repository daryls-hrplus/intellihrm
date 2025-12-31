import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import {
  Target,
  ClipboardCheck,
  MessageSquare,
  Flag,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  Award,
  Settings,
  Scale,
  Users,
  GitBranch,
  UserCheck,
  Briefcase,
  AlertCircle,
  PieChart,
} from "lucide-react";

export default function PerformanceDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { hasTabAccess } = useGranularPermissions();

  const allModules = {
    // Performance Reviews
    appraisals: { title: t('performance.modules.appraisals'), description: t('performance.modules.appraisalsDesc'), href: "/performance/appraisals", icon: ClipboardCheck, color: "bg-primary/10 text-primary", tabCode: "appraisals" },
    feedback360: { title: t('performance.modules.feedback360'), description: t('performance.modules.feedback360Desc'), href: "/performance/360", icon: MessageSquare, color: "bg-sky-500/10 text-sky-600", tabCode: "360" },
    calibration: { title: t('performance.modules.calibration', 'Calibration'), description: t('performance.modules.calibrationDesc', 'Rating calibration sessions'), href: "/performance/calibration", icon: Scale, color: "bg-indigo-500/10 text-indigo-600", tabCode: "calibration" },
    // Goal Management
    goals: { title: t('performance.modules.goals'), description: t('performance.modules.goalsDesc'), href: "/performance/goals", icon: Flag, color: "bg-emerald-500/10 text-emerald-600", tabCode: "goals" },
    // Continuous Performance
    feedback: { title: t('performance.modules.continuousFeedback'), description: t('performance.modules.continuousFeedbackDesc'), href: "/performance/feedback", icon: MessageCircle, color: "bg-violet-500/10 text-violet-600", tabCode: "feedback" },
    recognition: { title: t('performance.modules.recognitionAwards'), description: t('performance.modules.recognitionAwardsDesc'), href: "/performance/recognition", icon: Award, color: "bg-rose-500/10 text-rose-600", tabCode: "recognition" },
    // Performance Remediation
    pips: { title: t('performance.modules.improvementPlans'), description: t('performance.modules.improvementPlansDesc'), href: "/performance/pips", icon: AlertTriangle, color: "bg-amber-500/10 text-amber-600", tabCode: "pips" },
    // Succession Planning modules
    nineBox: { title: "9-Box Assessment", description: "Talent potential and performance matrix", href: "/succession/nine-box", icon: PieChart, color: "bg-purple-500/10 text-purple-600", tabCode: "nine_box" },
    talentPools: { title: "Talent Pools", description: "Manage high-potential talent groups", href: "/succession/talent-pools", icon: Users, color: "bg-cyan-500/10 text-cyan-600", tabCode: "talent_pools" },
    successionPlans: { title: "Succession Plans", description: "Plan leadership transitions", href: "/succession/plans", icon: GitBranch, color: "bg-orange-500/10 text-orange-600", tabCode: "succession_plans" },
    keyPositions: { title: "Key Positions", description: "Critical roles requiring succession coverage", href: "/succession/key-positions", icon: Briefcase, color: "bg-red-500/10 text-red-600", tabCode: "key_positions" },
    flightRisk: { title: "Flight Risk", description: "Identify and mitigate attrition risks", href: "/succession/flight-risk", icon: AlertCircle, color: "bg-yellow-500/10 text-yellow-600", tabCode: "flight_risk" },
    benchStrength: { title: "Bench Strength", description: "Evaluate succession readiness", href: "/succession/bench-strength", icon: UserCheck, color: "bg-lime-500/10 text-lime-600", tabCode: "bench_strength" },
    successionAnalytics: { title: "Succession Analytics", description: "Insights on talent pipeline health", href: "/succession/analytics", icon: BarChart3, color: "bg-gray-500/10 text-gray-600", tabCode: "succession_analytics" },
    // Analytics & Configuration
    analytics: { title: t('performance.modules.analytics'), description: t('performance.modules.analyticsDesc'), href: "/performance/analytics", icon: BarChart3, color: "bg-muted text-muted-foreground", tabCode: "analytics" },
    setup: { title: t('performance.modules.setup', 'Setup'), description: t('performance.modules.setupDesc', 'Configure performance settings'), href: "/performance/setup", icon: Settings, color: "bg-slate-500/10 text-slate-600", tabCode: "setup" },
  };

  const filterByAccess = (modules: typeof allModules[keyof typeof allModules][]) =>
    modules.filter(m => hasTabAccess("performance", m.tabCode) || hasTabAccess("succession", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "Performance Reviews",
      items: filterByAccess([allModules.appraisals, allModules.feedback360, allModules.calibration]),
    },
    {
      titleKey: "Goal Management",
      items: filterByAccess([allModules.goals]),
    },
    {
      titleKey: "Continuous Performance",
      items: filterByAccess([allModules.feedback, allModules.recognition]),
    },
    {
      titleKey: "Performance Remediation",
      items: filterByAccess([allModules.pips]),
    },
    {
      titleKey: "Succession Planning",
      items: filterByAccess([
        allModules.nineBox,
        allModules.talentPools,
        allModules.successionPlans,
        allModules.keyPositions,
        allModules.flightRisk,
        allModules.benchStrength,
        allModules.successionAnalytics,
      ]),
    },
    {
      titleKey: "Analytics & Configuration",
      items: filterByAccess([allModules.analytics, allModules.setup]),
    },
  ];

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["performance-goals-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_goals")
        .select("id, status, final_score");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: appraisals = [], isLoading: appraisalsLoading } = useQuery({
    queryKey: ["appraisal-participants-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appraisal_participants")
        .select("id, status, overall_score");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const isLoading = goalsLoading || appraisalsLoading;

  const activeGoals = goals.filter(g => g.status === 'active' || g.status === 'draft').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const pendingReviews = appraisals.filter(a => a.status === 'pending' || a.status === 'in_progress').length;
  
  const completedAppraisals = appraisals.filter(a => a.status === 'completed' && a.overall_score != null);
  const avgRating = completedAppraisals.length > 0 
    ? (completedAppraisals.reduce((sum, a) => sum + (a.overall_score || 0), 0) / completedAppraisals.length).toFixed(1)
    : "N/A";

  const statCards = [
    { label: t('performance.stats.activeGoals'), value: activeGoals, icon: Target, color: "bg-primary/10 text-primary" },
    { label: t('performance.stats.pendingReviews'), value: pendingReviews, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { label: t('performance.stats.goalsCompleted'), value: completedGoals, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t('performance.stats.avgRating'), value: avgRating, icon: TrendingUp, color: "bg-sky-500/10 text-sky-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t('performance.dashboard.talentTitle', 'Talent')}
                </h1>
                <p className="text-muted-foreground">
                  {t('performance.dashboard.talentSubtitle', 'Performance, succession planning, and talent development')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/talent'}>
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('performance.dashboard.unifiedView', 'Unified Dashboard')}
              </Button>
              <ModuleBIButton module="performance" />
              <ModuleReportsButton module="performance" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-16 mt-1" />
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <GroupedModuleCards sections={sections} defaultOpen={false} />
      </div>
    </AppLayout>
  );
}
