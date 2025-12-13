import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { Briefcase, Users, Clock, CheckCircle, TrendingUp, Target, Loader2, Award, UserPlus, FlaskConical, UsersRound, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface RecruitmentAnalyticsProps {
  requisitions: any[];
  candidates: any[];
  applications: any[];
  isLoading: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
];

const STAGE_COLORS: Record<string, string> = {
  applied: 'hsl(var(--chart-1))',
  screening: 'hsl(var(--chart-2))',
  interview: 'hsl(var(--chart-3))',
  offer: 'hsl(var(--chart-4))',
  hired: 'hsl(var(--chart-5))',
  rejected: 'hsl(var(--destructive))',
};

export function RecruitmentAnalytics({ requisitions, candidates, applications, isLoading }: RecruitmentAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [additionalData, setAdditionalData] = useState<{
    offers: any[];
    referrals: any[];
    assessments: any[];
    panels: any[];
    scorecards: any[];
    emailTemplates: any[];
  }>({
    offers: [],
    referrals: [],
    assessments: [],
    panels: [],
    scorecards: [],
    emailTemplates: [],
  });

  useEffect(() => {
    const fetchAdditionalData = async () => {
      const [offersRes, referralsRes, assessmentsRes, panelsRes, scorecardsRes, emailsRes] = await Promise.all([
        supabase.from('recruitment_offers').select('*'),
        supabase.from('employee_referrals').select('*'),
        supabase.from('assessment_results').select('*'),
        supabase.from('interview_panels').select('*'),
        supabase.from('interview_scorecards').select('*'),
        supabase.from('recruitment_email_templates').select('*'),
      ]);

      setAdditionalData({
        offers: offersRes.data || [],
        referrals: referralsRes.data || [],
        assessments: assessmentsRes.data || [],
        panels: panelsRes.data || [],
        scorecards: scorecardsRes.data || [],
        emailTemplates: emailsRes.data || [],
      });
    };

    fetchAdditionalData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // KPI Calculations
  const kpiData = useMemo(() => {
    const openPositions = requisitions.filter(r => r.status === 'open').length;
    const totalApplications = applications.length;
    const hiredCount = applications.filter(a => a.stage === 'hired').length;
    const activeApplications = applications.filter(a => !['hired', 'rejected'].includes(a.stage)).length;
    
    const hiredApps = applications.filter(a => a.stage === 'hired' && a.hired_at && a.applied_at);
    let avgTimeToHire = 0;
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((sum, app) => {
        return sum + differenceInDays(parseISO(app.hired_at), parseISO(app.applied_at));
      }, 0);
      avgTimeToHire = totalDays / hiredApps.length;
    }

    const offersExtended = applications.filter(a => a.stage === 'offer' || a.stage === 'hired').length;
    const offerAcceptanceRate = offersExtended > 0 ? (hiredCount / offersExtended) * 100 : 0;

    return {
      openPositions,
      totalCandidates: candidates.length,
      totalApplications,
      hiredCount,
      activeApplications,
      avgTimeToHire,
      offerAcceptanceRate,
    };
  }, [requisitions, candidates, applications]);

  // Offer Analytics
  const offerAnalytics = useMemo(() => {
    const { offers } = additionalData;
    const statusCounts: Record<string, number> = {};
    let totalSalary = 0;
    let salaryCount = 0;

    offers.forEach(offer => {
      statusCounts[offer.status] = (statusCounts[offer.status] || 0) + 1;
      if (offer.salary_offered) {
        totalSalary += offer.salary_offered;
        salaryCount++;
      }
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));

    const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
    const declinedOffers = offers.filter(o => o.status === 'declined').length;
    const pendingOffers = offers.filter(o => o.status === 'pending').length;
    const avgSalary = salaryCount > 0 ? totalSalary / salaryCount : 0;

    return { statusData, acceptedOffers, declinedOffers, pendingOffers, avgSalary, total: offers.length };
  }, [additionalData.offers]);

  // Referral Analytics
  const referralAnalytics = useMemo(() => {
    const { referrals } = additionalData;
    const statusCounts: Record<string, number> = {};
    
    referrals.forEach(referral => {
      statusCounts[referral.status] = (statusCounts[referral.status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));

    const hiredReferrals = referrals.filter(r => r.status === 'hired').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'submitted').length;
    const conversionRate = referrals.length > 0 ? (hiredReferrals / referrals.length) * 100 : 0;

    return { statusData, hiredReferrals, pendingReferrals, conversionRate, total: referrals.length };
  }, [additionalData.referrals]);

  // Assessment Analytics
  const assessmentAnalytics = useMemo(() => {
    const { assessments } = additionalData;
    let totalScore = 0;
    let passedCount = 0;
    let completedCount = 0;

    assessments.forEach(result => {
      if (result.score !== null) {
        totalScore += result.score;
        completedCount++;
      }
      if (result.passed) passedCount++;
    });

    const avgScore = completedCount > 0 ? totalScore / completedCount : 0;
    const passRate = completedCount > 0 ? (passedCount / completedCount) * 100 : 0;

    // Score distribution
    const scoreRanges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 },
    ];

    const scoreDistribution = scoreRanges.map(({ range, min, max }) => ({
      range,
      count: assessments.filter(a => a.score !== null && a.score >= min && a.score <= max).length,
    }));

    return { avgScore, passRate, completedCount, total: assessments.length, scoreDistribution };
  }, [additionalData.assessments]);

  // Interview Panel Analytics
  const panelAnalytics = useMemo(() => {
    const { panels, scorecards } = additionalData;
    const activePanels = panels.filter(p => p.is_active).length;
    const totalScorecards = scorecards.length;

    // Scorecards by status
    const scorecardStatusCounts: Record<string, number> = {};
    scorecards.forEach(sc => {
      scorecardStatusCounts[sc.status] = (scorecardStatusCounts[sc.status] || 0) + 1;
    });

    const scorecardStatusData = Object.entries(scorecardStatusCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));

    // Average interview ratings
    let totalRating = 0;
    let ratingCount = 0;
    scorecards.forEach(sc => {
      if (sc.overall_rating) {
        totalRating += sc.overall_rating;
        ratingCount++;
      }
    });
    const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    return { activePanels, totalScorecards, scorecardStatusData, avgRating, totalPanels: panels.length };
  }, [additionalData.panels, additionalData.scorecards]);

  // Source Effectiveness Analytics
  const sourceAnalytics = useMemo(() => {
    const sourceCounts: Record<string, { applied: number; hired: number }> = {};
    
    candidates.forEach(c => {
      const source = c.source || 'Direct';
      if (!sourceCounts[source]) {
        sourceCounts[source] = { applied: 0, hired: 0 };
      }
      sourceCounts[source].applied++;
    });

    applications.filter(a => a.stage === 'hired').forEach(app => {
      const candidate = candidates.find(c => c.id === app.candidate_id);
      const source = candidate?.source || 'Direct';
      if (sourceCounts[source]) {
        sourceCounts[source].hired++;
      }
    });

    const sourceData = Object.entries(sourceCounts).map(([name, data]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      applications: data.applied,
      hired: data.hired,
      conversionRate: data.applied > 0 ? Math.round((data.hired / data.applied) * 100) : 0,
    }));

    return sourceData.sort((a, b) => b.applications - a.applications);
  }, [candidates, applications]);

  // Requisition Status Distribution
  const requisitionStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    requisitions.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  }, [requisitions]);

  // Application Stage Distribution
  const applicationFunnelData = useMemo(() => {
    const stages = ['applied', 'screening', 'interview', 'offer', 'hired'];
    return stages.map(stage => ({
      name: stage.charAt(0).toUpperCase() + stage.slice(1),
      value: applications.filter(a => a.stage === stage).length,
      fill: STAGE_COLORS[stage],
    }));
  }, [applications]);

  // Monthly Trends
  const monthlyTrends = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const applied = applications.filter(a => {
        try {
          const appliedDate = parseISO(a.applied_at);
          return isWithinInterval(appliedDate, { start, end });
        } catch {
          return false;
        }
      }).length;

      const hired = applications.filter(a => {
        if (!a.hired_at || a.stage !== 'hired') return false;
        try {
          const hiredDate = parseISO(a.hired_at);
          return isWithinInterval(hiredDate, { start, end });
        } catch {
          return false;
        }
      }).length;

      months.push({
        month: format(date, 'MMM'),
        applications: applied,
        hired,
      });
    }
    return months;
  }, [applications]);

  const kpiCards = [
    { title: "Open Positions", value: kpiData.openPositions, icon: Briefcase, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Total Candidates", value: kpiData.totalCandidates, icon: Users, color: "text-info", bgColor: "bg-info/10" },
    { title: "Active Applications", value: kpiData.activeApplications, icon: Target, color: "text-warning", bgColor: "bg-warning/10" },
    { title: "Hired", value: kpiData.hiredCount, icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
    { title: "Avg Time to Hire", value: `${Math.round(kpiData.avgTimeToHire)} days`, icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted/50" },
    { title: "Offer Acceptance", value: `${Math.round(kpiData.offerAcceptanceRate)}%`, icon: TrendingUp, color: "text-chart-3", bgColor: "bg-chart-3/10" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requisition Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={requisitionStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {requisitionStatusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Pipeline</CardTitle>
                <CardDescription>Candidates by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={applicationFunnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs fill-muted-foreground" />
                      <YAxis dataKey="name" type="category" width={70} className="text-xs fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {applicationFunnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hiring Trends</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="applications" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Applications" />
                      <Area type="monotone" dataKey="hired" stackId="2" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.6} name="Hired" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Award className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Offers</p><p className="text-2xl font-bold">{offerAnalytics.total}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Accepted</p><p className="text-2xl font-bold">{offerAnalytics.acceptedOffers}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-warning" /><div><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold">{offerAnalytics.pendingOffers}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-info" /><div><p className="text-xs text-muted-foreground">Avg Salary</p><p className="text-2xl font-bold">${Math.round(offerAnalytics.avgSalary).toLocaleString()}</p></div></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Offer Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={offerAnalytics.statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label>
                      {offerAnalytics.statusData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><UserPlus className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Referrals</p><p className="text-2xl font-bold">{referralAnalytics.total}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Hired</p><p className="text-2xl font-bold">{referralAnalytics.hiredReferrals}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-warning" /><div><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold">{referralAnalytics.pendingReferrals}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-info" /><div><p className="text-xs text-muted-foreground">Conversion Rate</p><p className="text-2xl font-bold">{Math.round(referralAnalytics.conversionRate)}%</p></div></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Referral Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={referralAnalytics.statusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><FlaskConical className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Assessments</p><p className="text-2xl font-bold">{assessmentAnalytics.total}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold">{assessmentAnalytics.completedCount}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Target className="h-8 w-8 text-info" /><div><p className="text-xs text-muted-foreground">Avg Score</p><p className="text-2xl font-bold">{Math.round(assessmentAnalytics.avgScore)}%</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Pass Rate</p><p className="text-2xl font-bold">{Math.round(assessmentAnalytics.passRate)}%</p></div></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Score Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assessmentAnalytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><UsersRound className="h-8 w-8 text-primary" /><div><p className="text-xs text-muted-foreground">Total Panels</p><p className="text-2xl font-bold">{panelAnalytics.totalPanels}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-success" /><div><p className="text-xs text-muted-foreground">Active Panels</p><p className="text-2xl font-bold">{panelAnalytics.activePanels}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Target className="h-8 w-8 text-info" /><div><p className="text-xs text-muted-foreground">Scorecards</p><p className="text-2xl font-bold">{panelAnalytics.totalScorecards}</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-warning" /><div><p className="text-xs text-muted-foreground">Avg Rating</p><p className="text-2xl font-bold">{panelAnalytics.avgRating.toFixed(1)}</p></div></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Scorecard Status</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={panelAnalytics.scorecardStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label>
                      {panelAnalytics.scorecardStatusData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Source Effectiveness</CardTitle><CardDescription>Applications vs hires by source</CardDescription></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceAnalytics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs fill-muted-foreground" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs fill-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="applications" fill="hsl(var(--chart-1))" name="Applications" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="hired" fill="hsl(var(--chart-5))" name="Hired" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Conversion by Source</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [`${value}%`, 'Conversion Rate']} />
                    <Bar dataKey="conversionRate" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Conversion Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
