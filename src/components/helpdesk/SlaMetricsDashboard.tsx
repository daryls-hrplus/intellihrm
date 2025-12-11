import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, startOfDay, differenceInHours, parseISO } from 'date-fns';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Target, Timer, XCircle, Download, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface TicketWithSla {
  id: string;
  ticket_number: string;
  status: string;
  created_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
  sla_breach_response: boolean | null;
  sla_breach_resolution: boolean | null;
  priority: {
    id: string;
    name: string;
    code: string;
    response_time_hours: number;
    resolution_time_hours: number;
    color: string;
  } | null;
  category: {
    id: string;
    name: string;
  } | null;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function SlaMetricsDashboard() {
  const [dateRange, setDateRange] = useState('30');

  const startDate = useMemo(() => {
    return startOfDay(subDays(new Date(), parseInt(dateRange)));
  }, [dateRange]);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['sla-metrics', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          status,
          created_at,
          first_response_at,
          resolved_at,
          sla_breach_response,
          sla_breach_resolution,
          priority:ticket_priorities(id, name, code, response_time_hours, resolution_time_hours, color),
          category:ticket_categories(id, name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TicketWithSla[];
    },
  });

  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        totalTickets: 0,
        responseCompliance: 0,
        resolutionCompliance: 0,
        responseBreaches: 0,
        resolutionBreaches: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        byPriority: [],
        byCategory: [],
        trendData: [],
        complianceTrend: [],
      };
    }

    // Calculate response SLA compliance
    const ticketsWithResponse = tickets.filter(t => t.first_response_at);
    const responseBreaches = tickets.filter(t => t.sla_breach_response === true).length;
    const responseCompliance = ticketsWithResponse.length > 0
      ? ((ticketsWithResponse.length - responseBreaches) / ticketsWithResponse.length) * 100
      : 100;

    // Calculate resolution SLA compliance
    const resolvedTickets = tickets.filter(t => t.resolved_at || t.status === 'closed');
    const resolutionBreaches = tickets.filter(t => t.sla_breach_resolution === true).length;
    const resolutionCompliance = resolvedTickets.length > 0
      ? ((resolvedTickets.length - resolutionBreaches) / resolvedTickets.length) * 100
      : 100;

    // Calculate average response time
    const responseTimes = ticketsWithResponse.map(t => {
      const created = parseISO(t.created_at);
      const responded = parseISO(t.first_response_at!);
      return differenceInHours(responded, created);
    });
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Calculate average resolution time
    const resolutionTimes = resolvedTickets
      .filter(t => t.resolved_at)
      .map(t => {
        const created = parseISO(t.created_at);
        const resolved = parseISO(t.resolved_at!);
        return differenceInHours(resolved, created);
      });
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // Group by priority
    const priorityMap = new Map<string, { name: string; total: number; responseBreaches: number; resolutionBreaches: number; color: string }>();
    tickets.forEach(t => {
      const priorityName = t.priority?.name || 'No Priority';
      const color = t.priority?.color || '#gray';
      if (!priorityMap.has(priorityName)) {
        priorityMap.set(priorityName, { name: priorityName, total: 0, responseBreaches: 0, resolutionBreaches: 0, color });
      }
      const entry = priorityMap.get(priorityName)!;
      entry.total++;
      if (t.sla_breach_response) entry.responseBreaches++;
      if (t.sla_breach_resolution) entry.resolutionBreaches++;
    });
    const byPriority = Array.from(priorityMap.values());

    // Group by category
    const categoryMap = new Map<string, { name: string; total: number; breaches: number }>();
    tickets.forEach(t => {
      const categoryName = t.category?.name || 'Uncategorized';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { name: categoryName, total: 0, breaches: 0 });
      }
      const entry = categoryMap.get(categoryName)!;
      entry.total++;
      if (t.sla_breach_response || t.sla_breach_resolution) entry.breaches++;
    });
    const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);

    // Daily trend data
    const dailyMap = new Map<string, { date: string; tickets: number; responseBreaches: number; resolutionBreaches: number; responded: number; resolved: number }>();
    tickets.forEach(t => {
      const date = format(parseISO(t.created_at), 'MMM dd');
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, tickets: 0, responseBreaches: 0, resolutionBreaches: 0, responded: 0, resolved: 0 });
      }
      const entry = dailyMap.get(date)!;
      entry.tickets++;
      if (t.sla_breach_response) entry.responseBreaches++;
      if (t.sla_breach_resolution) entry.resolutionBreaches++;
      if (t.first_response_at) entry.responded++;
      if (t.resolved_at) entry.resolved++;
    });
    const trendData = Array.from(dailyMap.values()).reverse();

    // Compliance trend
    const complianceTrend = trendData.map(d => ({
      date: d.date,
      responseCompliance: d.responded > 0 ? ((d.responded - d.responseBreaches) / d.responded) * 100 : 100,
      resolutionCompliance: d.resolved > 0 ? ((d.resolved - d.resolutionBreaches) / d.resolved) * 100 : 100,
    }));

    return {
      totalTickets: tickets.length,
      responseCompliance,
      resolutionCompliance,
      responseBreaches,
      resolutionBreaches,
      avgResponseTime,
      avgResolutionTime,
      byPriority,
      byCategory,
      trendData,
      complianceTrend,
    };
  }, [tickets]);

  const getComplianceColor = (value: number) => {
    if (value >= 95) return 'text-green-600';
    if (value >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (value: number) => {
    if (value >= 95) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (value >= 80) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (value >= 60) return <Badge className="bg-orange-100 text-orange-800">Needs Improvement</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  const exportToCSV = () => {
    if (!tickets || tickets.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Ticket Number',
      'Status',
      'Priority',
      'Category',
      'Created At',
      'First Response At',
      'Resolved At',
      'Response SLA Breached',
      'Resolution SLA Breached',
      'Response Time (hours)',
      'Resolution Time (hours)',
    ];

    const rows = tickets.map(t => {
      const responseTime = t.first_response_at
        ? differenceInHours(parseISO(t.first_response_at), parseISO(t.created_at))
        : '';
      const resolutionTime = t.resolved_at
        ? differenceInHours(parseISO(t.resolved_at), parseISO(t.created_at))
        : '';
      
      return [
        t.ticket_number,
        t.status,
        t.priority?.name || 'N/A',
        t.category?.name || 'N/A',
        format(parseISO(t.created_at), 'yyyy-MM-dd HH:mm'),
        t.first_response_at ? format(parseISO(t.first_response_at), 'yyyy-MM-dd HH:mm') : '',
        t.resolved_at ? format(parseISO(t.resolved_at), 'yyyy-MM-dd HH:mm') : '',
        t.sla_breach_response ? 'Yes' : 'No',
        t.sla_breach_resolution ? 'Yes' : 'No',
        responseTime,
        resolutionTime,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sla-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('CSV report downloaded');
  };

  const exportToPDF = () => {
    if (!tickets || tickets.length === 0) {
      toast.error('No data to export');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SLA Performance Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Report period
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: Last ${dateRange} days`, pageWidth / 2, yPos, { align: 'center' });
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, pageWidth / 2, yPos + 5, { align: 'center' });
    yPos += 20;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryData = [
      `Total Tickets: ${metrics.totalTickets}`,
      `Response SLA Compliance: ${metrics.responseCompliance.toFixed(1)}%`,
      `Resolution SLA Compliance: ${metrics.resolutionCompliance.toFixed(1)}%`,
      `Response SLA Breaches: ${metrics.responseBreaches}`,
      `Resolution SLA Breaches: ${metrics.resolutionBreaches}`,
      `Average Response Time: ${metrics.avgResponseTime.toFixed(1)} hours`,
      `Average Resolution Time: ${metrics.avgResolutionTime.toFixed(1)} hours`,
    ];
    summaryData.forEach(line => {
      doc.text(line, 14, yPos);
      yPos += 6;
    });
    yPos += 10;

    // Priority Breakdown
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SLA Performance by Priority', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    metrics.byPriority.forEach(p => {
      const compliance = p.total > 0 ? (((p.total - p.responseBreaches - p.resolutionBreaches) / (p.total * 2)) * 100).toFixed(1) : '100';
      doc.text(`${p.name}: ${p.total} tickets, ${p.responseBreaches} response breaches, ${p.resolutionBreaches} resolution breaches`, 14, yPos);
      yPos += 6;
    });
    yPos += 10;

    // Category Breakdown
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SLA Performance by Category', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    metrics.byCategory.forEach(c => {
      doc.text(`${c.name}: ${c.total} tickets, ${c.breaches} breaches`, 14, yPos);
      yPos += 6;
    });
    yPos += 10;

    // Ticket Details (first 20)
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Tickets with SLA Breaches', 14, yPos);
    yPos += 10;

    const breachedTickets = tickets.filter(t => t.sla_breach_response || t.sla_breach_resolution).slice(0, 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    if (breachedTickets.length > 0) {
      breachedTickets.forEach(t => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const breachType = [];
        if (t.sla_breach_response) breachType.push('Response');
        if (t.sla_breach_resolution) breachType.push('Resolution');
        doc.text(`${t.ticket_number} | ${t.priority?.name || 'N/A'} | ${t.status} | Breach: ${breachType.join(', ')}`, 14, yPos);
        yPos += 5;
      });
    } else {
      doc.text('No SLA breaches in the selected period.', 14, yPos);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save(`sla-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF report downloaded');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">SLA Performance Metrics</h2>
          <p className="text-muted-foreground">Track and analyze service level agreement compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response SLA Compliance</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(metrics.responseCompliance)}`}>
              {metrics.responseCompliance.toFixed(1)}%
            </div>
            <Progress value={metrics.responseCompliance} className="mt-2" />
            <div className="flex items-center justify-between mt-2">
              {getComplianceBadge(metrics.responseCompliance)}
              <span className="text-xs text-muted-foreground">{metrics.responseBreaches} breaches</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolution SLA Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(metrics.resolutionCompliance)}`}>
              {metrics.resolutionCompliance.toFixed(1)}%
            </div>
            <Progress value={metrics.resolutionCompliance} className="mt-2" />
            <div className="flex items-center justify-between mt-2">
              {getComplianceBadge(metrics.resolutionCompliance)}
              <span className="text-xs text-muted-foreground">{metrics.resolutionBreaches} breaches</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgResponseTime.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Time to first response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgResolutionTime.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Time to close ticket
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Compliance Trends</TabsTrigger>
          <TabsTrigger value="breaches">Breach Analysis</TabsTrigger>
          <TabsTrigger value="priority">By Priority</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance Over Time</CardTitle>
              <CardDescription>Daily response and resolution SLA compliance rates</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.complianceTrend.length > 0 ? (
                <ChartContainer config={{
                  responseCompliance: { label: 'Response SLA', color: 'hsl(var(--chart-1))' },
                  resolutionCompliance: { label: 'Resolution SLA', color: 'hsl(var(--chart-2))' },
                }} className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.complianceTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" tickFormatter={(v) => `${v}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="responseCompliance" name="Response SLA" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="resolutionCompliance" name="Resolution SLA" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  No data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaches">
          <Card>
            <CardHeader>
              <CardTitle>SLA Breaches Over Time</CardTitle>
              <CardDescription>Daily count of response and resolution SLA breaches</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.trendData.length > 0 ? (
                <ChartContainer config={{
                  responseBreaches: { label: 'Response Breaches', color: 'hsl(var(--destructive))' },
                  resolutionBreaches: { label: 'Resolution Breaches', color: 'hsl(var(--chart-4))' },
                }} className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="responseBreaches" name="Response Breaches" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolutionBreaches" name="Resolution Breaches" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  No data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Breaches by Priority</CardTitle>
                <CardDescription>SLA breach distribution across priority levels</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.byPriority.length > 0 ? (
                  <ChartContainer config={{
                    responseBreaches: { label: 'Response Breaches', color: 'hsl(var(--destructive))' },
                    resolutionBreaches: { label: 'Resolution Breaches', color: 'hsl(var(--chart-4))' },
                  }} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.byPriority} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="responseBreaches" name="Response Breaches" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="resolutionBreaches" name="Resolution Breaches" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Performance</CardTitle>
                <CardDescription>Compliance rate by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.byPriority.map((priority, index) => {
                    const compliance = priority.total > 0
                      ? ((priority.total - priority.responseBreaches - priority.resolutionBreaches) / (priority.total * 2)) * 100
                      : 100;
                    return (
                      <div key={priority.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priority.color }} />
                            <span className="font-medium">{priority.name}</span>
                          </div>
                          <span className={`text-sm font-medium ${getComplianceColor(compliance)}`}>
                            {compliance.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={compliance} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{priority.total} tickets</span>
                          <span>{priority.responseBreaches + priority.resolutionBreaches} total breaches</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="category">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
                <CardDescription>Distribution of tickets across categories</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.byCategory.length > 0 ? (
                  <ChartContainer config={{
                    total: { label: 'Tickets', color: 'hsl(var(--chart-1))' },
                  }} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.byCategory}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {metrics.byCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breach Rate</CardTitle>
                <CardDescription>SLA breach percentage by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.byCategory.map((category, index) => {
                    const breachRate = category.total > 0
                      ? (category.breaches / category.total) * 100
                      : 0;
                    const compliance = 100 - breachRate;
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {breachRate > 20 ? (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : breachRate > 10 ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className={`text-sm font-medium ${getComplianceColor(compliance)}`}>
                              {compliance.toFixed(0)}% compliant
                            </span>
                          </div>
                        </div>
                        <Progress value={compliance} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{category.total} tickets</span>
                          <span>{category.breaches} breaches</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Key performance indicators for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold">{metrics.totalTickets}</div>
              <div className="text-sm text-muted-foreground">Total Tickets</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-destructive">
                {metrics.responseBreaches + metrics.resolutionBreaches}
              </div>
              <div className="text-sm text-muted-foreground">Total Breaches</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {((metrics.responseCompliance + metrics.resolutionCompliance) / 2).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Compliance</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold">
                {((metrics.avgResponseTime + metrics.avgResolutionTime) / 2).toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Avg Handling Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
