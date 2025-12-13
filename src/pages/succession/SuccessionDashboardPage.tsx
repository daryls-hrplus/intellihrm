import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NineBoxGrid } from "@/components/succession/NineBoxGrid";
import { NineBoxAssessmentDialog } from "@/components/succession/NineBoxAssessmentDialog";
import { TalentPoolsTab } from "@/components/succession/TalentPoolsTab";
import { SuccessionPlansTab } from "@/components/succession/SuccessionPlansTab";
import { KeyPositionsTab } from "@/components/succession/KeyPositionsTab";
import { SuccessionAnalytics } from "@/components/succession/SuccessionAnalytics";
import { CareerDevelopmentTab } from "@/components/succession/CareerDevelopmentTab";
import { CareerPathsTab } from "@/components/succession/CareerPathsTab";
import { useSuccession, NineBoxAssessment } from "@/hooks/useSuccession";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Grid3X3, Users, Target, AlertTriangle, BarChart3, Plus, BookOpen, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function SuccessionDashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<NineBoxAssessment | null>(null);
  const [activeTab, setActiveTab] = useState("nine-box");
  
  // State for data
  const [nineBoxAssessments, setNineBoxAssessments] = useState<NineBoxAssessment[]>([]);
  const [talentPools, setTalentPools] = useState<any[]>([]);
  const [successionPlans, setSuccessionPlans] = useState<any[]>([]);
  const [keyPositionRisks, setKeyPositionRisks] = useState<any[]>([]);

  const { 
    loading,
    fetchNineBoxAssessments,
    createNineBoxAssessment,
    updateNineBoxAssessment,
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

  const handleRefreshAssessments = async () => {
    const assessments = await fetchNineBoxAssessments();
    setNineBoxAssessments(assessments);
  };

  const handleEmployeeClick = (assessment: NineBoxAssessment) => {
    setEditingAssessment(assessment);
    setShowAssessmentDialog(true);
  };

  // Calculate stats
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
    { label: "High Potentials", value: highPotentials, icon: TrendingUp, color: "bg-warning/10 text-warning" },
    { label: "Critical Roles", value: criticalRoles, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { label: "Ready Now", value: readyNow, icon: Target, color: "bg-success/10 text-success" },
    { label: "In Talent Pools", value: inTalentPools, icon: Users, color: "bg-info/10 text-info" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Succession Planning
                </h1>
                <p className="text-muted-foreground">
                  Talent pipeline, nine-box grid, and career development
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModuleBIButton module="succession" />
              <ModuleReportsButton module="succession" />
            </div>
          </div>
        </div>

        {/* Company Filter */}
        <div className="flex items-center gap-4">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select company" />
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

        {/* Stats Cards */}
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

        {/* Main Content Tabs */}
        {selectedCompanyId && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="nine-box" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Nine-Box Grid
              </TabsTrigger>
              <TabsTrigger value="talent-pools" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Talent Pools
              </TabsTrigger>
              <TabsTrigger value="succession-plans" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Succession Plans
              </TabsTrigger>
              <TabsTrigger value="key-positions" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Key Positions
              </TabsTrigger>
              <TabsTrigger value="career-development" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Career Development
              </TabsTrigger>
              <TabsTrigger value="career-paths" className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Career Paths
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nine-box" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => { setEditingAssessment(null); setShowAssessmentDialog(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              </div>
              <NineBoxGrid 
                assessments={nineBoxAssessments} 
                onEmployeeClick={handleEmployeeClick}
              />
            </TabsContent>

            <TabsContent value="talent-pools">
              <TalentPoolsTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="succession-plans">
              <SuccessionPlansTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="key-positions">
              <KeyPositionsTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="career-development">
              <CareerDevelopmentTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="career-paths">
              <CareerPathsTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="analytics">
              <SuccessionAnalytics 
                assessments={nineBoxAssessments}
                plans={successionPlans}
                keyPositions={keyPositionRisks}
                talentPools={talentPools}
              />
            </TabsContent>
          </Tabs>
        )}

        {!selectedCompanyId && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Please select a company to view succession data.</p>
            </CardContent>
          </Card>
        )}

        {/* Assessment Dialog */}
        <NineBoxAssessmentDialog
          open={showAssessmentDialog}
          onOpenChange={setShowAssessmentDialog}
          assessment={editingAssessment}
          companyId={selectedCompanyId}
          onSuccess={() => {
            setShowAssessmentDialog(false);
            setEditingAssessment(null);
            handleRefreshAssessments();
          }}
          onCreate={createNineBoxAssessment}
          onUpdate={updateNineBoxAssessment}
        />
      </div>
    </AppLayout>
  );
}
