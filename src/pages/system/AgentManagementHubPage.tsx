import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Clock, 
  DollarSign,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  History,
  Settings2,
  Shield
} from "lucide-react";
import { useAgentRegistry } from "@/hooks/useAgentRegistry";
import { AgentRegistryTable } from "@/components/agents/AgentRegistryTable";
import { AgentExecutionHistory } from "@/components/agents/AgentExecutionHistory";
import { AgentMonitoringDashboard } from "@/components/agents/AgentMonitoringDashboard";
import { AgentAlertsPanel } from "@/components/agents/AgentAlertsPanel";
import { AgentDetailsPanel } from "@/components/agents/AgentDetailsPanel";
import { Skeleton } from "@/components/ui/skeleton";

const breadcrumbs = [
  { label: "System", href: "/system" },
  { label: "Agent Management Hub", href: "/system/agents" }
];

export default function AgentManagementHubPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    agents,
    executions,
    metrics,
    alerts,
    stats,
    isLoading,
    selectedAgent,
    setSelectedAgent,
    refreshAll,
    fetchExecutions,
    updateAgentStatus,
    resolveAlert
  } = useAgentRegistry();

  const statCards = [
    {
      title: "Total Agents",
      value: stats?.totalAgents || 0,
      subtitle: `${stats?.activeAgents || 0} active`,
      icon: Bot,
      color: "text-primary"
    },
    {
      title: "Executions (24h)",
      value: stats?.totalExecutions || 0,
      subtitle: "Last 24 hours",
      icon: Zap,
      color: "text-blue-500"
    },
    {
      title: "Success Rate",
      value: `${(stats?.successRate || 100).toFixed(1)}%`,
      subtitle: "Overall",
      icon: CheckCircle2,
      color: "text-green-500"
    },
    {
      title: "Avg Latency",
      value: `${(stats?.avgLatency || 0).toFixed(0)}ms`,
      subtitle: "Response time",
      icon: Clock,
      color: "text-amber-500"
    },
    {
      title: "Total Cost",
      value: `$${(stats?.totalCost || 0).toFixed(4)}`,
      subtitle: "This period",
      icon: DollarSign,
      color: "text-emerald-500"
    },
    {
      title: "Active Alerts",
      value: stats?.alertsCount || 0,
      subtitle: "Unresolved",
      icon: AlertTriangle,
      color: stats?.alertsCount ? "text-destructive" : "text-muted-foreground"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              Agent Management Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor, manage, and orchestrate all AI agents across the platform
            </p>
          </div>
          <Button onClick={refreshAll} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            statCards.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.subtitle}
                      </p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="registry" className="gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Registry</span>
            </TabsTrigger>
            <TabsTrigger value="executions" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Executions</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 relative">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
              {(stats?.alertsCount || 0) > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {stats?.alertsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AgentMonitoringDashboard 
                  agents={agents}
                  executions={executions}
                  metrics={metrics}
                  isLoading={isLoading}
                />
              </div>
              <div className="space-y-4">
                <AgentAlertsPanel 
                  alerts={alerts.slice(0, 5)}
                  onResolve={resolveAlert}
                  compact
                />
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Agent Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(
                        agents.reduce((acc, agent) => {
                          acc[agent.category] = (acc[agent.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{category}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="registry">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className={selectedAgent ? "lg:col-span-2" : "lg:col-span-3"}>
                <AgentRegistryTable 
                  agents={agents}
                  isLoading={isLoading}
                  onSelectAgent={setSelectedAgent}
                  selectedAgentId={selectedAgent?.id}
                  onToggleEnabled={updateAgentStatus}
                />
              </div>
              {selectedAgent && (
                <AgentDetailsPanel 
                  agent={selectedAgent}
                  onClose={() => setSelectedAgent(null)}
                  onRefreshExecutions={() => fetchExecutions(selectedAgent.id)}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="executions">
            <AgentExecutionHistory 
              executions={executions}
              agents={agents}
              isLoading={isLoading}
              onRefresh={() => fetchExecutions()}
            />
          </TabsContent>

          <TabsContent value="monitoring">
            <AgentMonitoringDashboard 
              agents={agents}
              executions={executions}
              metrics={metrics}
              isLoading={isLoading}
              fullView
            />
          </TabsContent>

          <TabsContent value="alerts">
            <AgentAlertsPanel 
              alerts={alerts}
              onResolve={resolveAlert}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
