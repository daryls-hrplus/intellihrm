import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useEmployeeRelations } from '@/hooks/useEmployeeRelations';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { AlertCircle, Scale, Award, LogOut, Heart, TrendingUp, Loader2 } from 'lucide-react';

export interface ERAnalyticsProps {
  companyId: string;
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

export function ERAnalytics({ companyId }: ERAnalyticsProps) {
  const { t } = useTranslation();
  const { 
    cases, 
    disciplinaryActions, 
    recognitions, 
    exitInterviews,
    surveys,
    wellnessPrograms,
    loadingCases,
    loadingDisciplinary,
    loadingRecognition,
    loadingExitInterviews,
    loadingSurveys,
    loadingWellness
  } = useEmployeeRelations(companyId);

  const isLoading = loadingCases || loadingDisciplinary || loadingRecognition || 
    loadingExitInterviews || loadingSurveys || loadingWellness;
  
  // Case Status Distribution
  const caseStatusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    cases.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: t(`employeeRelationsModule.cases.statuses.${name}`, { defaultValue: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }),
      value,
    }));
  }, [cases, t]);

  // Case Type Distribution
  const caseTypeDistribution = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    cases.forEach(c => {
      typeCounts[c.case_type] = (typeCounts[c.case_type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: t(`employeeRelationsModule.cases.types.${name}`, { defaultValue: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }),
      value,
    }));
  }, [cases, t]);

  // Case Severity Distribution
  const caseSeverityDistribution = useMemo(() => {
    const severityCounts: Record<string, number> = {};
    cases.forEach(c => {
      severityCounts[c.severity] = (severityCounts[c.severity] || 0) + 1;
    });
    return Object.entries(severityCounts).map(([name, value]) => ({
      name: t(`employeeRelationsModule.cases.severities.${name}`, { defaultValue: name.charAt(0).toUpperCase() + name.slice(1) }),
      value,
    }));
  }, [cases, t]);

  // Disciplinary Action Types
  const disciplinaryTypeDistribution = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    disciplinaryActions.forEach(a => {
      typeCounts[a.action_type] = (typeCounts[a.action_type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: t(`employeeRelationsModule.disciplinary.types.${name}`, { defaultValue: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }),
      value,
    }));
  }, [disciplinaryActions, t]);

  // Recognition Types
  const recognitionTypeDistribution = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    recognitions.forEach(r => {
      typeCounts[r.recognition_type] = (typeCounts[r.recognition_type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: t(`employeeRelationsModule.recognition.types.${name}`, { defaultValue: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }),
      value,
    }));
  }, [recognitions, t]);

  // Monthly Case Trends (last 6 months)
  const caseTrends = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const opened = cases.filter(c => {
        try {
          const reportedDate = parseISO(c.reported_date);
          return isWithinInterval(reportedDate, { start, end });
        } catch {
          return false;
        }
      }).length;

      const resolved = cases.filter(c => {
        if (!c.actual_resolution_date) return false;
        try {
          const resolvedDate = parseISO(c.actual_resolution_date);
          return isWithinInterval(resolvedDate, { start, end });
        } catch {
          return false;
        }
      }).length;

      months.push({
        month: format(date, 'MMM'),
        [t('employeeRelationsModule.analytics.opened')]: opened,
        [t('employeeRelationsModule.analytics.resolved')]: resolved,
      });
    }
    return months;
  }, [cases, t]);

  // Exit Interview Satisfaction Averages
  const exitInterviewSatisfaction = useMemo(() => {
    const completedInterviews = exitInterviews.filter(i => i.status === 'completed');
    if (completedInterviews.length === 0) return [];

    const areas = [
      { key: 'overall_satisfaction', label: t('employeeRelationsModule.exitInterviews.satisfaction.overall') },
      { key: 'management_satisfaction', label: t('employeeRelationsModule.exitInterviews.satisfaction.management') },
      { key: 'culture_satisfaction', label: t('employeeRelationsModule.exitInterviews.satisfaction.culture') },
      { key: 'compensation_satisfaction', label: t('employeeRelationsModule.exitInterviews.satisfaction.compensation') },
      { key: 'growth_satisfaction', label: t('employeeRelationsModule.exitInterviews.satisfaction.growth') },
      { key: 'worklife_balance_satisfaction', label: t('employeeRelationsModule.exitInterviews.satisfaction.worklife_balance') },
    ];

    return areas.map(({ key, label }) => {
      const values = completedInterviews
        .map(i => (i as any)[key])
        .filter(v => v !== null && v !== undefined);
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return { name: label, score: Math.round(avg * 10) / 10 };
    });
  }, [exitInterviews, t]);

  // Wellness Program Types
  const wellnessTypeDistribution = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    wellnessPrograms.forEach(p => {
      typeCounts[p.program_type] = (typeCounts[p.program_type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: t(`employeeRelationsModule.wellness.types.${name}`, { defaultValue: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }),
      value,
    }));
  }, [wellnessPrograms, t]);

  // KPI Cards Data
  const kpiData = [
    {
      title: t('employeeRelationsModule.analytics.openCases'),
      value: cases.filter(c => !['resolved', 'closed'].includes(c.status)).length,
      icon: AlertCircle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: t('employeeRelationsModule.analytics.activeDisciplinary'),
      value: disciplinaryActions.filter(a => a.status === 'active').length,
      icon: Scale,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: t('employeeRelationsModule.analytics.recognitionsThisMonth'),
      value: recognitions.filter(r => {
        const date = parseISO(r.award_date);
        return isWithinInterval(date, { start: startOfMonth(new Date()), end: new Date() });
      }).length,
      icon: Award,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: t('employeeRelationsModule.analytics.pendingExitInterviews'),
      value: exitInterviews.filter(i => i.status === 'scheduled').length,
      icon: LogOut,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: t('employeeRelationsModule.analytics.activeSurveys'),
      value: surveys.filter(s => s.status === 'active').length,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t('employeeRelationsModule.analytics.activeWellnessPrograms'),
      value: wellnessPrograms.filter(p => p.status === 'active').length,
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiData.map((kpi, index) => {
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
        {/* Case Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('employeeRelationsModule.analytics.caseStatus')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.analytics.caseStatusDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {caseStatusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Case Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('employeeRelationsModule.analytics.caseTypes')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.analytics.caseTypesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {caseTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Case Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('employeeRelationsModule.analytics.caseSeverity')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.analytics.caseSeverityDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseSeverityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Case Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('employeeRelationsModule.analytics.caseTrends')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.analytics.caseTrendsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={caseTrends}>
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
                    dataKey={t('employeeRelationsModule.analytics.opened')}
                    stackId="1"
                    stroke="hsl(var(--destructive))" 
                    fill="hsl(var(--destructive))" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={t('employeeRelationsModule.analytics.resolved')}
                    stackId="2"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Exit Interview Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('employeeRelationsModule.analytics.exitInterviewSatisfaction')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.analytics.exitInterviewSatisfactionDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exitInterviewSatisfaction} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 5]} className="text-xs fill-muted-foreground" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Disciplinary Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('employeeRelationsModule.analytics.disciplinaryActions')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.analytics.disciplinaryActionsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disciplinaryTypeDistribution}>
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
                  <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recognition Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('employeeRelationsModule.analytics.recognitionTypes')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.analytics.recognitionTypesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recognitionTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {recognitionTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Wellness Program Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('employeeRelationsModule.analytics.wellnessPrograms')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.analytics.wellnessProgramsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wellnessTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {wellnessTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
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
