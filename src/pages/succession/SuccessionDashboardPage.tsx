import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useLanguage } from "@/hooks/useLanguage";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuccession, NineBoxAssessment } from "@/hooks/useSuccession";
import { supabase } from "@/integrations/supabase/client";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import { TrendingUp, Grid3X3, Users, Target, AlertTriangle, BarChart3, BookOpen, Route, UserCheck, TrendingDown, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function SuccessionDashboardPage() {
  const { t } = useLanguage();
  const { hasTabAccess } = useGranularPermissions();
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

  const allModules = {
    nineBox: { title: t("succession.tabs.nineBox"), description: t("succession.nineBox.description"), href: "/succession/nine-box", icon: Grid3X3, color: "bg-primary/10 text-primary", tabCode: "nine-box" },
    talentPools: { title: t("succession.tabs.talentPools"), description: t("succession.talentPools.description"), href: "/succession/talent-pools", icon: Users, color: "bg-info/10 text-info", tabCode: "talent-pools" },
    plans: { title: t("succession.tabs.successionPlans"), description: t("succession.successionPlans.description"), href: "/succession/plans", icon: Target, color: "bg-success/10 text-success", tabCode: "plans" },
    keyPositions: { title: t("succession.tabs.keyPositions"), description: t("succession.keyPositions.description"), href: "/succession/key-positions", icon: AlertTriangle, color: "bg-destructive/10 text-destructive", tabCode: "key-positions" },
    careerDevelopment: { title: t("succession.tabs.careerDevelopment"), description: t("succession.careerDevelopment.description"), href: "/succession/career-development", icon: BookOpen, color: "bg-warning/10 text-warning", tabCode: "career-development" },
    careerPaths: { title: t("succession.tabs.careerPaths"), description: t("succession.careerPaths.description"), href: "/succession/career-paths", icon: Route, color: "bg-secondary/50 text-secondary-foreground", tabCode: "career-paths" },
    mentorship: { title: t("succession.tabs.mentorship"), description: t("succession.mentorship.description"), href: "/succession/mentorship", icon: UserCheck, color: "bg-accent/50 text-accent-foreground", tabCode: "mentorship" },
    flightRisk: { title: t("succession.tabs.flightRisk"), description: t("succession.flightRisk.description"), href: "/succession/flight-risk", icon: TrendingDown, color: "bg-destructive/10 text-destructive", tabCode: "flight-risk" },
    benchStrength: { title: t("succession.tabs.benchStrength"), description: t("succession.benchStrength.description"), href: "/succession/bench-strength", icon: Layers, color: "bg-primary/10 text-primary", tabCode: "bench-strength" },
    analytics: { title: t("succession.tabs.analytics"), description: t("succession.analytics.description"), href: "/succession/analytics", icon: BarChart3, color: "bg-info/10 text-info", tabCode: "analytics" },
  };

  const filterByAccess = (modules: typeof allModules[keyof typeof allModules][]) =>
    modules.filter(m => hasTabAccess("succession", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "Talent Assessment",
      items: filterByAccess([allModules.nineBox, allModules.talentPools]),
    },
    {
      titleKey: "Succession Planning",
      items: filterByAccess([allModules.plans, allModules.keyPositions]),
    },
    {
      titleKey: "Career Development",
      items: filterByAccess([allModules.careerDevelopment, allModules.careerPaths, allModules.mentorship]),
    },
    {
      titleKey: "Risk & Analytics",
      items: filterByAccess([allModules.flightRisk, allModules.benchStrength, allModules.analytics]),
    },
  ];

  const statCards = [
    { label: t("succession.stats.highPotentials"), value: highPotentials, icon: TrendingUp, color: "bg-warning/10 text-warning" },
    { label: t("succession.stats.criticalRoles"), value: criticalRoles, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { label: t("succession.stats.readyNow"), value: readyNow, icon: Target, color: "bg-success/10 text-success" },
    { label: t("succession.stats.inTalentPools"), value: inTalentPools, icon: Users, color: "bg-info/10 text-info" },
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

        <GroupedModuleCards sections={sections} showToggleButton />
      </div>
    </AppLayout>
  );
}
