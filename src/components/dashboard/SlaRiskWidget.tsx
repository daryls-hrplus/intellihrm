import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, ExternalLink, Loader2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface TicketAtRisk {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  created_at: string;
  first_response_at: string | null;
  sla_breach_response: boolean | null;
  sla_breach_resolution: boolean | null;
  priority: {
    name: string;
    response_time_hours: number;
    resolution_time_hours: number;
    color: string;
  } | null;
  assignee: {
    full_name: string | null;
    email: string;
  } | null;
  riskType: "response" | "resolution";
  riskLevel: "warning" | "critical" | "breached";
  timeRemaining: number; // in minutes, negative if breached
}

export function SlaRiskWidget() {
  const [tickets, setTickets] = useState<TicketAtRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAtRiskTickets();
  }, []);

  const fetchAtRiskTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          ticket_number,
          subject,
          status,
          created_at,
          first_response_at,
          sla_breach_response,
          sla_breach_resolution,
          priority:ticket_priorities!tickets_priority_id_fkey(name, response_time_hours, resolution_time_hours, color),
          assignee:profiles!tickets_assignee_id_fkey(full_name, email)
        `)
        .in("status", ["open", "in_progress", "pending"])
        .not("priority_id", "is", null)
        .order("created_at", { ascending: true })
        .limit(20);

      if (error) throw error;

      const now = new Date();
      const atRiskTickets: TicketAtRisk[] = [];

      for (const ticketData of data || []) {
        const priority = Array.isArray(ticketData.priority) 
          ? ticketData.priority[0] 
          : ticketData.priority;
        const assignee = Array.isArray(ticketData.assignee) 
          ? ticketData.assignee[0] 
          : ticketData.assignee;

        if (!priority) continue;

        const createdAt = new Date(ticketData.created_at);

        // Check response SLA
        if (!ticketData.first_response_at) {
          const responseDeadline = new Date(
            createdAt.getTime() + priority.response_time_hours * 60 * 60 * 1000
          );
          const timeRemaining = Math.round(
            (responseDeadline.getTime() - now.getTime()) / (60 * 1000)
          );
          const percentUsed = 1 - timeRemaining / (priority.response_time_hours * 60);

          if (percentUsed >= 0.7 || timeRemaining <= 0) {
            atRiskTickets.push({
              ...ticketData,
              priority,
              assignee,
              riskType: "response",
              riskLevel: timeRemaining <= 0 ? "breached" : percentUsed >= 0.9 ? "critical" : "warning",
              timeRemaining,
            });
            continue; // Don't show resolution risk if response is at risk
          }
        }

        // Check resolution SLA
        const resolutionDeadline = new Date(
          createdAt.getTime() + priority.resolution_time_hours * 60 * 60 * 1000
        );
        const resTimeRemaining = Math.round(
          (resolutionDeadline.getTime() - now.getTime()) / (60 * 1000)
        );
        const resPercentUsed = 1 - resTimeRemaining / (priority.resolution_time_hours * 60);

        if (resPercentUsed >= 0.7 || resTimeRemaining <= 0) {
          atRiskTickets.push({
            ...ticketData,
            priority,
            assignee,
            riskType: "resolution",
            riskLevel: resTimeRemaining <= 0 ? "breached" : resPercentUsed >= 0.9 ? "critical" : "warning",
            timeRemaining: resTimeRemaining,
          });
        }
      }

      // Sort by risk level and time remaining
      atRiskTickets.sort((a, b) => {
        const levelOrder = { breached: 0, critical: 1, warning: 2 };
        if (levelOrder[a.riskLevel] !== levelOrder[b.riskLevel]) {
          return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
        }
        return a.timeRemaining - b.timeRemaining;
      });

      setTickets(atRiskTickets.slice(0, 5));
    } catch (error) {
      console.error("Error fetching at-risk tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes <= 0) {
      const overdue = Math.abs(minutes);
      const hours = Math.floor(overdue / 60);
      const mins = overdue % 60;
      return hours > 0 ? `${hours}h ${mins}m overdue` : `${mins}m overdue`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  };

  const getRiskBadge = (level: string, type: string) => {
    const typeLabel = type === "response" ? "Response" : "Resolution";
    switch (level) {
      case "breached":
        return (
          <Badge variant="destructive" className="text-xs">
            {typeLabel} Breached
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
            {typeLabel} Critical
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs">
            {typeLabel} Warning
          </Badge>
        );
    }
  };

  return (
    <Card className="animate-slide-up" style={{ animationDelay: "250ms" }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 text-warning" />
          SLA Risk Monitor
        </CardTitle>
        <NavLink to="/help/tickets">
          <Button variant="ghost" size="sm" className="text-xs">
            View All
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </NavLink>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-success/10 p-3 mb-3">
              <Clock className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">All Clear</p>
            <p className="text-xs text-muted-foreground">No tickets at risk of SLA breach</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <NavLink
                key={ticket.id}
                to={`/help/tickets/${ticket.id}`}
                className="block rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {ticket.ticket_number}
                      </span>
                      {getRiskBadge(ticket.riskLevel, ticket.riskType)}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {ticket.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: ticket.priority?.color,
                          color: ticket.priority?.color,
                        }}
                      >
                        {ticket.priority?.name}
                      </Badge>
                      {ticket.assignee && (
                        <span className="text-xs text-muted-foreground truncate">
                          {ticket.assignee.full_name || ticket.assignee.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-semibold ${
                        ticket.riskLevel === "breached"
                          ? "text-destructive"
                          : ticket.riskLevel === "critical"
                          ? "text-orange-500"
                          : "text-amber-600"
                      }`}
                    >
                      <Clock className="inline h-3 w-3 mr-1" />
                      {formatTime(ticket.timeRemaining)}
                    </div>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
