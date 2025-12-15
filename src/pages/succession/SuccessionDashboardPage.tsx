import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useLanguage } from "@/hooks/useLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuccession, NineBoxAssessment } from "@/hooks/useSuccession";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Grid3X3, Users, Target, AlertTriangle, BarChart3, BookOpen, Route, UserCheck, TrendingDown, Layers, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function SuccessionDashboardPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  
  const [nineBoxAssessments, setNineBoxAssessments] = useState<NineBoxAssessment[]>([]);
  const [talentPools, setTalentPools] = useState<any[]>([]);
  const [successionPlans, setSuccessionPlans] = useState<any[]>([]);
  const [keyPositionRisks, setKeyPositionRisks] = useState<any[]>([]);

  const { 
    fetchNineBoxAssessments,
    fetchTalentPools,
    fetchSuccessionPlans,
    fetchKeyPositionRisks,
  } = useSuccession(selectedCompanyId);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadAllData();
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name');
    
    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadAllData = async () => {
    const [assessments, pools, plans, positions] = await Promise.all([
      fetchNineBoxAssessments(),
      fetchTalentPools(),
      fetchSuccessionPlans(),
      fetchKeyPositionRisks(),
    ]);
    setNineBoxAssessments(assessments);
    setTalentPools(pools);
    setSuccessionPlans(plans);
    setKeyPositionRisks(positions);
  };

  const highPotentials = nineBoxAssessments.filter(a => 
    (a.performance_rating >= 3 && a.potential_rating >= 3)
  ).length;
  
  const criticalRoles = keyPositionRisks.filter(k => 
    k.criticality_level === 'critical' || k.criticality_level === 'high'
  ).length;
  
  const readyNow = successionPlans.reduce((acc, plan) => {
    const readyCandidates = (plan as any).succession_candidates?.filter(
      (c: any) => c.readiness_level === 'ready_now'
    ).length || 0;
    return acc + readyCandidates;
  }, 0);
  
  const inTalentPools = talentPools.reduce((acc, pool) => {
    return acc + ((pool as any).member_count || 0);
  }, 0);

  const statCards = [
    { label: t("succession.stats.highPotentials"), value: highPotentials, icon: TrendingUp, color: "bg-warning/10 text-warning" },
    { label: t("succession.stats.criticalRoles"), value: criticalRoles, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { label: t("succession.stats.readyNow"), value: readyNow, icon: Target, color: "bg-success/10 text-success" },
    { label: t("succession.stats.inTalentPools"), value: inTalentPools, icon: Users, color: "bg-info/10 text-info" },
  ];

  const successionModules = [
    {
      title: t("succession.tabs.nineBox"),
      description: t("succession.nineBox.description"),
      href: "/succession/nine-box",
      icon: Grid3X3,
      colorClass: "bg-primary/10 text-primary",
    },
    {
      title: t("succession.tabs.talentPools"),
      description: t("succession.talentPools.description"),
      href: "/succession/talent-pools",
      icon: Users,
      colorClass: "bg-info/10 text-info",
    },
    {
      title: t("succession.tabs.successionPlans"),
      description: t("succession.successionPlans.description"),
      href: "/succession/plans",
      icon: Target,
      colorClass: "bg-success/10 text-success",
    },
    {
      title: t("succession.tabs.keyPositions"),
      description: t("succession.keyPositions.description"),
      href: "/succession/key-positions",
      icon: AlertTriangle,
      colorClass: "bg-destructive/10 text-destructive",
    },
    {
      title: t("succession.tabs.careerDevelopment"),
      description: t("succession.careerDevelopment.description"),
      href: "/succession/career-development",
      icon: BookOpen,
      colorClass: "bg-warning/10 text-warning",
    },
    {
      title: t("succession.tabs.careerPaths"),
      description: t("succession.careerPaths.description"),
      href: "/succession/career-paths",
      icon: Route,
      colorClass: "bg-secondary/50 text-secondary-foreground",
    },
    {
      title: t("succession.tabs.mentorship"),
      description: t("succession.mentorship.description"),
      href: "/succession/mentorship",
      icon: UserCheck,
      colorClass: "bg-accent/50 text-accent-foreground",
    },
    {
      title: t("succession.tabs.flightRisk"),
      description: t("succession.flightRisk.description"),
      href: "/succession/flight-risk",
      icon: TrendingDown,
      colorClass: "bg-destructive/10 text-destructive",
    },
    {
      title: t("succession.tabs.benchStrength"),
      description: t("succession.benchStrength.description"),
      href: "/succession/bench-strength",
      icon: Layers,
      colorClass: "bg-primary/10 text-primary",
    },
    {
      title: t("succession.tabs.analytics"),
      description: t("succession.analytics.description"),
      href: "/succession/analytics",
      icon: BarChart3,
      colorClass: "bg-info/10 text-info",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("succession.dashboard.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("succession.dashboard.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModuleBIButton module="succession" />
              <ModuleReportsButton module="succession" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} style={{ animationDelay: `${index * 50}ms` }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {successionModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${(index + 4) * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-3 ${module.colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
                <h3 className="mt-4 font-semibold text-card-foreground">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </NavLink>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
