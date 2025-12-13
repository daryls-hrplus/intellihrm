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
  Area
} from 'recharts';
import { 
  PropertyItem, 
  PropertyAssignment, 
  PropertyRequest, 
  PropertyMaintenance,
  PropertyCategory 
} from '@/hooks/usePropertyManagement';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

interface PropertyAnalyticsProps {
  items: PropertyItem[];
  assignments: PropertyAssignment[];
  requests: PropertyRequest[];
  maintenance: PropertyMaintenance[];
  categories: PropertyCategory[];
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

export function PropertyAnalytics({ 
  items, 
  assignments, 
  requests, 
  maintenance,
  categories 
}: PropertyAnalyticsProps) {
  
  // Asset Status Distribution
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    items.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [items]);

  // Condition Distribution
  const conditionDistribution = useMemo(() => {
    const conditionCounts: Record<string, number> = {};
    items.forEach(item => {
      conditionCounts[item.condition] = (conditionCounts[item.condition] || 0) + 1;
    });
    return Object.entries(conditionCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [items]);

  // Assets by Category
  const categoryDistribution = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    items.forEach(item => {
      const catName = item.category?.name || 'Uncategorized';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });
    return Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [items]);

  // Request Status Distribution
  const requestStatusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    requests.forEach(req => {
      statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [requests]);

  // Requests by Priority
  const requestPriorityDistribution = useMemo(() => {
    const priorityCounts: Record<string, number> = {};
    requests.forEach(req => {
      priorityCounts[req.priority] = (priorityCounts[req.priority] || 0) + 1;
    });
    return Object.entries(priorityCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [requests]);

  // Monthly Assignment Trends (last 6 months)
  const assignmentTrends = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const assigned = assignments.filter(a => {
        try {
          const assignedDate = parseISO(a.assigned_date);
          return isWithinInterval(assignedDate, { start, end });
        } catch {
          return false;
        }
      }).length;

      const returned = assignments.filter(a => {
        if (!a.actual_return_date) return false;
        try {
          const returnDate = parseISO(a.actual_return_date);
          return isWithinInterval(returnDate, { start, end });
        } catch {
          return false;
        }
      }).length;

      months.push({
        month: format(date, 'MMM'),
        assigned,
        returned,
      });
    }
    return months;
  }, [assignments]);

  // Maintenance by Type
  const maintenanceByType = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    maintenance.forEach(m => {
      typeCounts[m.maintenance_type] = (typeCounts[m.maintenance_type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
    }));
  }, [maintenance]);

  // Maintenance Cost by Month
  const maintenanceCostTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const totalCost = maintenance
        .filter(m => {
          if (!m.completed_date) return false;
          try {
            const completedDate = parseISO(m.completed_date);
            return isWithinInterval(completedDate, { start, end });
          } catch {
            return false;
          }
        })
        .reduce((sum, m) => sum + (m.cost || 0), 0);

      months.push({
        month: format(date, 'MMM'),
        cost: totalCost,
      });
    }
    return months;
  }, [maintenance]);

  // Total Asset Value
  const totalAssetValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.purchase_cost || 0), 0);
  }, [items]);

  // Assets needing attention
  const assetsNeedingAttention = useMemo(() => {
    const damagedOrPoor = items.filter(i => 
      i.condition === 'damaged' || i.condition === 'poor'
    ).length;
    
    const warrantyExpiring = items.filter(i => {
      if (!i.warranty_expiry) return false;
      const expiry = parseISO(i.warranty_expiry);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiry <= thirtyDaysFromNow && expiry >= new Date();
    }).length;

    return { damagedOrPoor, warrantyExpiring };
  }, [items]);

  // KPI Cards Data
  const kpiData = [
    {
      title: "Total Asset Value",
      value: `$${totalAssetValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Utilization Rate",
      value: `${items.length > 0 ? Math.round((items.filter(i => i.status === 'assigned').length / items.length) * 100) : 0}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Requests",
      value: requests.filter(r => r.status === 'pending').length,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Assets Needing Attention",
      value: assetsNeedingAttention.damagedOrPoor + assetsNeedingAttention.warrantyExpiring,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Asset Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset Status</CardTitle>
            <CardDescription>Distribution by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Condition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset Condition</CardTitle>
            <CardDescription>Physical condition of assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {conditionDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Request Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Status</CardTitle>
            <CardDescription>Property requests by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {requestStatusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Assets by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assets by Category</CardTitle>
            <CardDescription>Distribution across asset categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
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
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assignment Trends</CardTitle>
            <CardDescription>Assigned vs returned over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={assignmentTrends}>
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
                    dataKey="assigned" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.6}
                    name="Assigned"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="returned" 
                    stackId="2"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))" 
                    fillOpacity={0.6}
                    name="Returned"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Request Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Requests by Priority</CardTitle>
            <CardDescription>Property requests urgency distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestPriorityDistribution}>
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
                  <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maintenance Costs</CardTitle>
            <CardDescription>Monthly maintenance spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceCostTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--destructive))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Maintenance by Type</CardTitle>
          <CardDescription>Distribution of maintenance activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceByType}>
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
                <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
