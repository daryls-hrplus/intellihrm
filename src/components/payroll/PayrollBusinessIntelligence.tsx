import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  FileDown,
  RefreshCw,
  Building2,
  Clock,
  Percent
} from "lucide-react";
import { 
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart
} from "recharts";

export function PayrollBusinessIntelligence() {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [selectedEntity, setSelectedEntity] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KPI data
  const kpis = [
    { 
      title: "Total Labor Cost", 
      value: "$12.8M", 
      change: 3.2, 
      trend: "up",
      icon: DollarSign,
      color: "bg-green-500/10 text-green-600"
    },
    { 
      title: "Cost per Employee", 
      value: "$4,850", 
      change: -1.5, 
      trend: "down",
      icon: Users,
      color: "bg-blue-500/10 text-blue-600"
    },
    { 
      title: "Overtime Ratio", 
      value: "6.2%", 
      change: 0.8, 
      trend: "up",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600"
    },
    { 
      title: "Payroll Accuracy", 
      value: "99.7%", 
      change: 0.2, 
      trend: "up",
      icon: Target,
      color: "bg-purple-500/10 text-purple-600"
    },
  ];

  // Cost trend data
  const costTrend = [
    { month: "Jul", labor: 11200000, benefits: 2100000, taxes: 1800000 },
    { month: "Aug", labor: 11350000, benefits: 2150000, taxes: 1820000 },
    { month: "Sep", labor: 11500000, benefits: 2180000, taxes: 1850000 },
    { month: "Oct", labor: 11650000, benefits: 2200000, taxes: 1880000 },
    { month: "Nov", labor: 11900000, benefits: 2250000, taxes: 1920000 },
    { month: "Dec", labor: 12100000, benefits: 2300000, taxes: 1950000 },
    { month: "Jan", labor: 12800000, benefits: 2400000, taxes: 2050000 },
  ];

  // Department comparison
  const departmentCosts = [
    { name: "Engineering", budget: 3200000, actual: 3150000, variance: -1.6 },
    { name: "Sales", budget: 2800000, actual: 2920000, variance: 4.3 },
    { name: "Operations", budget: 2400000, actual: 2380000, variance: -0.8 },
    { name: "Finance", budget: 1600000, actual: 1580000, variance: -1.3 },
    { name: "Marketing", budget: 1200000, actual: 1350000, variance: 12.5 },
    { name: "HR", budget: 800000, actual: 780000, variance: -2.5 },
  ];

  // Cost distribution
  const costDistribution = [
    { name: "Base Salary", value: 68, color: "hsl(var(--primary))" },
    { name: "Benefits", value: 15, color: "hsl(var(--chart-2))" },
    { name: "Taxes", value: 12, color: "hsl(var(--chart-3))" },
    { name: "Overtime", value: 3, color: "hsl(var(--chart-4))" },
    { name: "Bonuses", value: 2, color: "hsl(var(--chart-5))" },
  ];

  // AI Insights
  const aiInsights = [
    {
      type: "warning",
      title: "Overtime Spike Detected",
      description: "Engineering department overtime increased 23% this month. Consider additional headcount.",
      impact: "Potential $45K monthly savings",
      action: "Review staffing levels"
    },
    {
      type: "opportunity",
      title: "Benefits Optimization",
      description: "12% of employees haven't enrolled in HSA. Promoting enrollment could reduce taxable payroll.",
      impact: "Up to $28K annual tax savings",
      action: "Launch enrollment campaign"
    },
    {
      type: "trend",
      title: "Compensation Drift",
      description: "Sales team compensation is 8% above market median. Review commission structure.",
      impact: "Alignment with market rates",
      action: "Schedule comp review"
    },
    {
      type: "prediction",
      title: "Q2 Cost Forecast",
      description: "Based on hiring plans and merit increases, expect 5.2% labor cost increase in Q2.",
      impact: "$640K additional budget needed",
      action: "Prepare budget request"
    },
  ];

  // Headcount vs Cost scatter
  const efficiencyData = [
    { entity: "México", headcount: 156, costPerHead: 4200 },
    { entity: "Jamaica", headcount: 89, costPerHead: 5100 },
    { entity: "Ghana", headcount: 124, costPerHead: 3800 },
    { entity: "Nigeria", headcount: 210, costPerHead: 3200 },
    { entity: "Trinidad", headcount: 67, costPerHead: 5400 },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "opportunity": return <Lightbulb className="h-5 w-5 text-green-500" />;
      case "trend": return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "prediction": return <Brain className="h-5 w-5 text-purple-500" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Payroll Business Intelligence</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered insights and analytics for payroll optimization
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="mx">México</SelectItem>
              <SelectItem value="jm">Jamaica</SelectItem>
              <SelectItem value="gh">Ghana</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="q4">Q4 2024</SelectItem>
              <SelectItem value="q1">Q1 2025</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(kpi.change)}%
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Automated analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-background">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        {insight.impact}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-xs">
                        {insight.action} →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Cost Trends</TabsTrigger>
          <TabsTrigger value="departments">Department Analysis</TabsTrigger>
          <TabsTrigger value="distribution">Cost Distribution</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Labor Cost Trends</CardTitle>
              <CardDescription>Monthly breakdown of payroll components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => [`$${(value/1000000).toFixed(2)}M`, '']} />
                    <Legend />
                    <Area type="monotone" dataKey="labor" name="Labor" stackId="1" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" />
                    <Area type="monotone" dataKey="benefits" name="Benefits" stackId="1" fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" />
                    <Area type="monotone" dataKey="taxes" name="Taxes" stackId="1" fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Department Budget vs Actual</CardTitle>
              <CardDescription>Variance analysis by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentCosts.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dept.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          ${(dept.actual / 1000000).toFixed(2)}M / ${(dept.budget / 1000000).toFixed(2)}M
                        </span>
                        <span className={`flex items-center gap-1 text-sm font-medium ${dept.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {dept.variance >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(dept.variance)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={(dept.actual / dept.budget) * 100} className="h-2" />
                      <div 
                        className="absolute top-0 h-2 w-0.5 bg-foreground"
                        style={{ left: '100%', transform: 'translateX(-50%)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {costDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costDistribution.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={cat.value} className="w-24 h-2" />
                        <span className="font-bold w-12 text-right">{cat.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost Efficiency by Entity</CardTitle>
              <CardDescription>Headcount vs Cost per Employee analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="headcount" name="Headcount" unit=" emp" />
                    <YAxis type="number" dataKey="costPerHead" name="Cost/Head" unit="$" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value: number, name: string) => [
                        name === 'Headcount' ? `${value} employees` : `$${value.toLocaleString()}`,
                        name
                      ]}
                    />
                    <Scatter name="Entities" data={efficiencyData} fill="hsl(var(--primary))">
                      {efficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {efficiencyData.map((entity, idx) => (
                  <Badge key={idx} variant="outline">
                    {entity.entity}: ${entity.costPerHead}/head
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
