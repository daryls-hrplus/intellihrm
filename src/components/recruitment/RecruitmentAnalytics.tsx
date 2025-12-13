import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { Briefcase, Users, Clock, CheckCircle, XCircle, TrendingUp, Calendar, Target, Loader2 } from 'lucide-react';

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
    const rejectedCount = applications.filter(a => a.stage === 'rejected' || a.status === 'rejected').length;
    const activeApplications = applications.filter(a => !['hired', 'rejected'].includes(a.stage)).length;
    
    // Calculate average time to hire (for hired applications with hired_at)
    const hiredApps = applications.filter(a => a.stage === 'hired' && a.hired_at && a.applied_at);
    let avgTimeToHire = 0;
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((sum, app) => {
        return sum + differenceInDays(parseISO(app.hired_at), parseISO(app.applied_at));
      }, 0);
      avgTimeToHire = totalDays / hiredApps.length;
    }

    // Offer acceptance rate
    const offersExtended = applications.filter(a => a.stage === 'offer' || a.stage === 'hired').length;
    const offerAcceptanceRate = offersExtended > 0 ? (hiredCount / offersExtended) * 100 : 0;

    return {
      openPositions,
      totalCandidates: candidates.length,
      totalApplications,
      hiredCount,
      rejectedCount,
      activeApplications,
      avgTimeToHire,
      offerAcceptanceRate,
    };
  }, [requisitions, candidates, applications]);

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

  // Application Stage Distribution (Funnel)
  const applicationFunnelData = useMemo(() => {
    const stages = ['applied', 'screening', 'interview', 'offer', 'hired'];
    return stages.map(stage => ({
      name: stage.charAt(0).toUpperCase() + stage.slice(1),
      value: applications.filter(a => a.stage === stage).length,
      fill: STAGE_COLORS[stage],
    }));
  }, [applications]);

  // Application Stage Pie Chart
  const applicationStageData = useMemo(() => {
    const stageCounts: Record<string, number> = {};
    applications.forEach(a => {
      stageCounts[a.stage] = (stageCounts[a.stage] || 0) + 1;
    });
    return Object.entries(stageCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [applications]);

  // Source Distribution
  const sourceDistribution = useMemo(() => {
    const sourceCounts: Record<string, number> = {};
    candidates.forEach(c => {
      const source = c.source || 'Direct';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    return Object.entries(sourceCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  }, [candidates]);

  // Monthly Application Trends (last 6 months)
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

  // Top Requisitions by Applications
  const topRequisitions = useMemo(() => {
    const reqAppCounts: Record<string, { title: string; count: number }> = {};
    
    applications.forEach(app => {
      const reqId = app.requisition_id;
      const req = requisitions.find(r => r.id === reqId);
      if (req) {
        if (!reqAppCounts[reqId]) {
          reqAppCounts[reqId] = { title: req.title, count: 0 };
        }
        reqAppCounts[reqId].count++;
      }
    });

    return Object.values(reqAppCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [applications, requisitions]);

  // Employment Type Distribution
  const employmentTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    requisitions.forEach(r => {
      const type = r.employment_type || 'full_time';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  }, [requisitions]);

  // Conversion Rates by Stage
  const conversionRates = useMemo(() => {
    const stages = ['applied', 'screening', 'interview', 'offer', 'hired'];
    const counts = stages.map(stage => applications.filter(a => a.stage === stage).length);
    
    return stages.slice(1).map((stage, index) => {
      const previousCount = counts.slice(0, index + 1).reduce((sum, c) => sum + c, 0);
      const currentCount = counts.slice(0, index + 2).reduce((sum, c) => sum + c, 0);
      const rate = previousCount > 0 ? ((counts[index + 1] / previousCount) * 100) : 0;
      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        rate: Math.round(rate * 10) / 10,
      };
    });
  }, [applications]);

  const kpiCards = [
    {
      title: "Open Positions",
      value: kpiData.openPositions,
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Candidates",
      value: kpiData.totalCandidates,
      icon: Users,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Active Applications",
      value: kpiData.activeApplications,
      icon: Target,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Hired",
      value: kpiData.hiredCount,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Avg Time to Hire",
      value: `${Math.round(kpiData.avgTimeToHire)} days`,
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    },
    {
      title: "Offer Acceptance",
      value: `${Math.round(kpiData.offerAcceptanceRate)}%`,
      icon: TrendingUp,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
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

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Requisition Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Requisition Status</CardTitle>
            <CardDescription>Distribution by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requisitionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {requisitionStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Application Stages */}
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
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={70} 
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
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

        {/* Candidate Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Candidate Sources</CardTitle>
            <CardDescription>Where candidates come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sourceDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hiring Trends</CardTitle>
            <CardDescription>Applications vs hires over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="applications" 
                    stackId="1"
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1))" 
                    fillOpacity={0.6}
                    name="Applications"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hired" 
                    stackId="2"
                    stroke="hsl(var(--chart-5))" 
                    fill="hsl(var(--chart-5))" 
                    fillOpacity={0.6}
                    name="Hired"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Requisitions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Requisitions</CardTitle>
            <CardDescription>Most applied positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRequisitions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis 
                    dataKey="title" 
                    type="category" 
                    width={120}
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Employment Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employment Types</CardTitle>
            <CardDescription>Requisitions by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employmentTypeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs fill-muted-foreground" angle={-45} textAnchor="end" height={60} />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stage Conversion</CardTitle>
            <CardDescription>Conversion rates between stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionRates}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="stage" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" unit="%" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
                  />
                  <Bar dataKey="rate" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Application Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Stages</CardTitle>
            <CardDescription>Current stage distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {applicationStageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STAGE_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
