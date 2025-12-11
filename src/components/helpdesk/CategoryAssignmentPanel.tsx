import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Briefcase, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  code: string;
  description: string | null;
  default_assignee_id: string | null;
  default_priority_id: string | null;
  is_active: boolean;
}

interface Agent {
  id: string;
  full_name: string | null;
  email: string;
  open_tickets: number;
}

export function CategoryAssignmentPanel() {
  const queryClient = useQueryClient();
  const [enableLoadBalancing, setEnableLoadBalancing] = useState(true);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["ticket-categories-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["helpdesk-agents-workload"],
    queryFn: async () => {
      // Get all profiles with admin or hr_manager role
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email");
      if (profilesError) throw profilesError;

      // Get open ticket counts per agent
      const { data: ticketCounts, error: ticketsError } = await supabase
        .from("tickets")
        .select("assignee_id")
        .in("status", ["open", "in_progress", "pending"]);
      if (ticketsError) throw ticketsError;

      // Calculate workload for each agent
      const workloadMap = new Map<string, number>();
      ticketCounts?.forEach((t) => {
        if (t.assignee_id) {
          workloadMap.set(t.assignee_id, (workloadMap.get(t.assignee_id) || 0) + 1);
        }
      });

      return profiles?.map((p) => ({
        ...p,
        open_tickets: workloadMap.get(p.id) || 0,
      })) as Agent[];
    },
  });

  const { data: priorities = [] } = useQuery({
    queryKey: ["ticket-priorities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_priorities")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const { error } = await supabase
        .from("ticket_categories")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-categories-admin"] });
      toast.success("Category updated");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return "Unassigned";
    const agent = agents.find((a) => a.id === agentId);
    return agent?.full_name || agent?.email || "Unknown";
  };

  const getWorkloadBadge = (openTickets: number) => {
    if (openTickets === 0) return <Badge variant="outline" className="bg-green-500/10 text-green-600">Available</Badge>;
    if (openTickets <= 3) return <Badge variant="outline" className="bg-blue-500/10 text-blue-600">{openTickets} tickets</Badge>;
    if (openTickets <= 6) return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">{openTickets} tickets</Badge>;
    return <Badge variant="outline" className="bg-red-500/10 text-red-600">{openTickets} tickets</Badge>;
  };

  if (categoriesLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto-Assignment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Auto-Assignment Settings
          </CardTitle>
          <CardDescription>
            Configure automatic ticket assignment based on category and agent availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="load-balancing" className="font-medium">
                Workload Balancing
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, if no default assignee is set, tickets will be assigned to the agent with the fewest open tickets
              </p>
            </div>
            <Switch
              id="load-balancing"
              checked={enableLoadBalancing}
              onCheckedChange={setEnableLoadBalancing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Agent Workload Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Agent Workload
          </CardTitle>
          <CardDescription>
            Current ticket distribution across support agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {agents
              .sort((a, b) => a.open_tickets - b.open_tickets)
              .slice(0, 6)
              .map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="truncate">
                    <p className="font-medium truncate">{agent.full_name || agent.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                  </div>
                  {getWorkloadBadge(agent.open_tickets)}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Assignment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Category Default Assignments
          </CardTitle>
          <CardDescription>
            Set default assignees and priorities for each ticket category
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Default Assignee</TableHead>
                <TableHead>Default Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={category.default_assignee_id || "none"}
                      onValueChange={(value) =>
                        updateCategoryMutation.mutate({
                          id: category.id,
                          updates: { default_assignee_id: value === "none" ? null : value },
                        })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No default (use load balancing)</span>
                        </SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <span>{agent.full_name || agent.email}</span>
                              <span className="text-xs text-muted-foreground">
                                ({agent.open_tickets} tickets)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={category.default_priority_id || "none"}
                      onValueChange={(value) =>
                        updateCategoryMutation.mutate({
                          id: category.id,
                          updates: { default_priority_id: value === "none" ? null : value },
                        })
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">No default</span>
                        </SelectItem>
                        {priorities.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              {p.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {category.is_active ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-600">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
