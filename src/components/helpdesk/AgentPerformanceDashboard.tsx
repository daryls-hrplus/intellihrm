import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Clock, CheckCircle, TrendingUp, Users, AlertTriangle, Loader2 } from "lucide-react";
import { differenceInHours } from "date-fns";

interface AgentMetrics {
  id: string;
  name: string;
  email: string;
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  avgResponseTimeHours: number;
  avgResolutionTimeHours: number;
  resolutionRate: number;
  slaComplianceRate: number;
  avgSatisfactionRating: number;
  satisfactionCount: number;
}

export function AgentPerformanceDashboard() {
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["agent-performance-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          assignee_id,
          status,
          created_at,
          first_response_at,
          resolved_at,
          sla_breach_response,
          sla_breach_resolution,
          assignee:profiles!tickets_assignee_id_fkey(id, full_name, email)
        `)
        .not("assignee_id", "is", null);
      if (error) throw error;
      return data;
    },
  });

  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: ["agent-satisfaction-surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_satisfaction_surveys")
        .select(`
          rating,
          agent_rating,
          ticket:tickets(assignee_id)
        `);
      if (error) throw error;
      return data;
    },
  });

  const isLoading = ticketsLoading || surveysLoading;

  // Calculate metrics per agent
  const agentMetrics: AgentMetrics[] = (() => {
    const agentMap = new Map<string, AgentMetrics>();

    tickets.forEach((ticket: any) => {
      if (!ticket.assignee_id || !ticket.assignee) return;

      if (!agentMap.has(ticket.assignee_id)) {
        agentMap.set(ticket.assignee_id, {
          id: ticket.assignee_id,
          name: ticket.assignee.full_name || ticket.assignee.email,
          email: ticket.assignee.email,
          totalTickets: 0,
          resolvedTickets: 0,
          openTickets: 0,
          avgResponseTimeHours: 0,
          avgResolutionTimeHours: 0,
          resolutionRate: 0,
          slaComplianceRate: 0,
          avgSatisfactionRating: 0,
          satisfactionCount: 0,
        });
      }

      const agent = agentMap.get(ticket.assignee_id)!;
      agent.totalTickets++;

      if (["resolved", "closed"].includes(ticket.status)) {
        agent.resolvedTickets++;
      } else {
        agent.openTickets++;
      }
    });

    // Calculate response and resolution times
    agentMap.forEach((agent, agentId) => {
      const agentTickets = tickets.filter((t: any) => t.assignee_id === agentId);
      
      // Response times
      const ticketsWithResponse = agentTickets.filter((t: any) => t.first_response_at);
      if (ticketsWithResponse.length > 0) {
        const totalResponseHours = ticketsWithResponse.reduce((sum: number, t: any) => {
          return sum + differenceInHours(new Date(t.first_response_at), new Date(t.created_at));
        }, 0);
        agent.avgResponseTimeHours = totalResponseHours / ticketsWithResponse.length;
      }

      // Resolution times
      const resolvedTickets = agentTickets.filter((t: any) => t.resolved_at);
      if (resolvedTickets.length > 0) {
        const totalResolutionHours = resolvedTickets.reduce((sum: number, t: any) => {
          return sum + differenceInHours(new Date(t.resolved_at), new Date(t.created_at));
        }, 0);
        agent.avgResolutionTimeHours = totalResolutionHours / resolvedTickets.length;
      }

      // Resolution rate
      agent.resolutionRate = agent.totalTickets > 0 
        ? (agent.resolvedTickets / agent.totalTickets) * 100 
        : 0;

      // SLA compliance
      const ticketsWithSlaData = agentTickets.filter((t: any) => 
        t.sla_breach_response !== null || t.sla_breach_resolution !== null
      );
      const compliantTickets = agentTickets.filter((t: any) => 
        !t.sla_breach_response && !t.sla_breach_resolution
      );
      agent.slaComplianceRate = ticketsWithSlaData.length > 0
        ? (compliantTickets.length / ticketsWithSlaData.length) * 100
        : 100;

      // Satisfaction ratings
      const agentSurveys = surveys.filter((s: any) => s.ticket?.assignee_id === agentId);
      if (agentSurveys.length > 0) {
        const totalRating = agentSurveys.reduce((sum: number, s: any) => {
          return sum + (s.agent_rating || s.rating);
        }, 0);
        agent.avgSatisfactionRating = totalRating / agentSurveys.length;
        agent.satisfactionCount = agentSurveys.length;
      }
    });

    return Array.from(agentMap.values()).sort((a, b) => b.totalTickets - a.totalTickets);
  })();

  // Team averages
  const teamAverages = {
    avgResponseTime: agentMetrics.length > 0
      ? agentMetrics.reduce((sum, a) => sum + a.avgResponseTimeHours, 0) / agentMetrics.filter(a => a.avgResponseTimeHours > 0).length || 0
      : 0,
    avgResolutionTime: agentMetrics.length > 0
      ? agentMetrics.reduce((sum, a) => sum + a.avgResolutionTimeHours, 0) / agentMetrics.filter(a => a.avgResolutionTimeHours > 0).length || 0
      : 0,
    avgResolutionRate: agentMetrics.length > 0
      ? agentMetrics.reduce((sum, a) => sum + a.resolutionRate, 0) / agentMetrics.length
      : 0,
    avgSatisfaction: agentMetrics.filter(a => a.satisfactionCount > 0).length > 0
      ? agentMetrics.filter(a => a.satisfactionCount > 0).reduce((sum, a) => sum + a.avgSatisfactionRating, 0) / agentMetrics.filter(a => a.satisfactionCount > 0).length
      : 0,
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const getPerformanceColor = (value: number, threshold: { good: number; ok: number }, inverse = false) => {
    if (inverse) {
      if (value <= threshold.good) return "text-green-600";
      if (value <= threshold.ok) return "text-yellow-600";
      return "text-red-600";
    }
    if (value >= threshold.good) return "text-green-600";
    if (value >= threshold.ok) return "text-yellow-600";
    return "text-red-600";
  };

  const getStarDisplay = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agentMetrics.length}</p>
                <p className="text-xs text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatHours(teamAverages.avgResponseTime)}</p>
                <p className="text-xs text-muted-foreground">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamAverages.avgResolutionRate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Avg Resolution Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamAverages.avgSatisfaction.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Agent Performance Metrics
          </CardTitle>
          <CardDescription>
            Individual performance breakdown for each support agent
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-center">Tickets</TableHead>
                <TableHead className="text-center">Avg Response</TableHead>
                <TableHead className="text-center">Avg Resolution</TableHead>
                <TableHead className="text-center">Resolution Rate</TableHead>
                <TableHead className="text-center">SLA Compliance</TableHead>
                <TableHead className="text-center">Satisfaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No agent data available
                  </TableCell>
                </TableRow>
              ) : (
                agentMetrics.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(agent.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium">{agent.totalTickets}</span>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                            {agent.resolvedTickets} done
                          </Badge>
                          {agent.openTickets > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                              {agent.openTickets} open
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={getPerformanceColor(agent.avgResponseTimeHours, { good: 2, ok: 8 }, true)}>
                        {agent.avgResponseTimeHours > 0 ? formatHours(agent.avgResponseTimeHours) : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={getPerformanceColor(agent.avgResolutionTimeHours, { good: 24, ok: 72 }, true)}>
                        {agent.avgResolutionTimeHours > 0 ? formatHours(agent.avgResolutionTimeHours) : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-medium ${getPerformanceColor(agent.resolutionRate, { good: 80, ok: 60 })}`}>
                          {agent.resolutionRate.toFixed(0)}%
                        </span>
                        <Progress value={agent.resolutionRate} className="h-1.5 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-medium ${getPerformanceColor(agent.slaComplianceRate, { good: 90, ok: 75 })}`}>
                          {agent.slaComplianceRate.toFixed(0)}%
                        </span>
                        {agent.slaComplianceRate < 90 && (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {agent.satisfactionCount > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          {getStarDisplay(agent.avgSatisfactionRating)}
                          <span className="text-xs text-muted-foreground">
                            ({agent.satisfactionCount} reviews)
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No reviews</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {agentMetrics.length >= 3 && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Fastest Response */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Fastest Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const fastest = [...agentMetrics]
                  .filter(a => a.avgResponseTimeHours > 0)
                  .sort((a, b) => a.avgResponseTimeHours - b.avgResponseTimeHours)[0];
                if (!fastest) return <p className="text-muted-foreground text-sm">No data</p>;
                return (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(fastest.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{fastest.name}</p>
                      <p className="text-sm text-green-600">{formatHours(fastest.avgResponseTimeHours)} avg</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Highest Resolution Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                Best Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const best = [...agentMetrics]
                  .filter(a => a.totalTickets >= 5)
                  .sort((a, b) => b.resolutionRate - a.resolutionRate)[0];
                if (!best) return <p className="text-muted-foreground text-sm">No data</p>;
                return (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(best.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{best.name}</p>
                      <p className="text-sm text-purple-600">{best.resolutionRate.toFixed(0)}% resolved</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Highest Satisfaction */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Highest Rated
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const topRated = [...agentMetrics]
                  .filter(a => a.satisfactionCount >= 3)
                  .sort((a, b) => b.avgSatisfactionRating - a.avgSatisfactionRating)[0];
                if (!topRated) return <p className="text-muted-foreground text-sm">No data</p>;
                return (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(topRated.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{topRated.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-yellow-600">{topRated.avgSatisfactionRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
