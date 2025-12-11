import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendTicketNotification } from "@/hooks/useTicketNotifications";
import TicketAnalytics from "@/components/helpdesk/TicketAnalytics";
import {
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  Timer,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";
import { format, formatDistanceToNow, differenceInHours, isPast, addHours } from "date-fns";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  pending: "bg-orange-500/10 text-orange-600 border-orange-200",
  resolved: "bg-green-500/10 text-green-600 border-green-200",
  closed: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export default function AdminHelpdeskPage() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          requester:profiles!tickets_requester_id_fkey(full_name, email),
          assignee:profiles!tickets_assignee_id_fkey(full_name, email),
          category:ticket_categories(name, code),
          priority:ticket_priorities(name, code, color, response_time_hours, resolution_time_hours)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription for ticket updates
  useEffect(() => {
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('Ticket change received:', payload);
          queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
          
          // Show toast notification for new tickets
          if (payload.eventType === 'INSERT') {
            toast.info("New ticket received", {
              description: `A new support ticket has been created`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: agents = [] } = useQuery({
    queryKey: ["helpdesk-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data;
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

  const { data: comments = [] } = useQuery({
    queryKey: ["ticket-comments", selectedTicket?.id],
    enabled: !!selectedTicket,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_comments")
        .select("*, author:profiles(full_name)")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates, ticket }: { id: string; updates: any; ticket?: any }) => {
      const { error } = await supabase.from("tickets").update(updates).eq("id", id);
      if (error) throw error;
      
      // Send assignment notification if assignee changed
      if (updates.assignee_id && ticket) {
        const assignee = agents.find(a => a.id === updates.assignee_id);
        if (assignee?.email) {
          sendTicketNotification({
            ticketId: id,
            notificationType: "assigned",
            recipientEmail: assignee.email,
            recipientName: assignee.full_name || undefined,
            ticketNumber: ticket.ticket_number,
            ticketSubject: ticket.subject,
            message: ticket.description,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket updated");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ ticketId, content, isInternal, ticket }: { ticketId: string; content: string; isInternal: boolean; ticket?: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: authorProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single();
      
      const { error } = await supabase.from("ticket_comments").insert([{
        ticket_id: ticketId,
        author_id: user?.id,
        content,
        is_internal: isInternal,
      }]);
      if (error) throw error;
      
      // Update first_response_at if this is the first response
      const foundTicket = ticket || tickets.find(t => t.id === ticketId);
      if (foundTicket && !foundTicket.first_response_at) {
        await supabase.from("tickets").update({ first_response_at: new Date().toISOString() }).eq("id", ticketId);
      }
      
      // Send reply notification to requester (only for non-internal comments)
      if (!isInternal && foundTicket?.requester?.email) {
        sendTicketNotification({
          ticketId,
          notificationType: "reply",
          recipientEmail: foundTicket.requester.email,
          recipientName: foundTicket.requester.full_name || undefined,
          ticketNumber: foundTicket.ticket_number,
          ticketSubject: foundTicket.subject,
          replyContent: content,
          replyAuthor: authorProfile?.full_name || "Support Team",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      setCommentText("");
      toast.success("Comment added");
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Calculate SLA status
  const getSlaStatus = (ticket: any) => {
    if (!ticket.priority) return { response: "unknown", resolution: "unknown" };
    
    const responseDeadline = addHours(new Date(ticket.created_at), ticket.priority.response_time_hours);
    const resolutionDeadline = addHours(new Date(ticket.created_at), ticket.priority.resolution_time_hours);
    
    const responseBreached = !ticket.first_response_at && isPast(responseDeadline);
    const resolutionBreached = !["resolved", "closed"].includes(ticket.status) && isPast(resolutionDeadline);
    
    return {
      response: ticket.first_response_at ? "met" : responseBreached ? "breached" : "pending",
      resolution: ["resolved", "closed"].includes(ticket.status) ? "met" : resolutionBreached ? "breached" : "pending",
      responseDeadline,
      resolutionDeadline,
    };
  };

  // Stats calculation
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    pending: tickets.filter(t => t.status === "pending").length,
    resolved: tickets.filter(t => ["resolved", "closed"].includes(t.status)).length,
    slaResponseBreached: tickets.filter(t => getSlaStatus(t).response === "breached").length,
    slaResolutionBreached: tickets.filter(t => getSlaStatus(t).resolution === "breached").length,
    unassigned: tickets.filter(t => !t.assignee_id).length,
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === "all") return true;
    if (filter === "unassigned") return !t.assignee_id;
    if (filter === "sla_breach") {
      const sla = getSlaStatus(t);
      return sla.response === "breached" || sla.resolution === "breached";
    }
    return t.status === filter;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Helpdesk Dashboard</h1>
            <p className="text-muted-foreground">Manage support tickets and monitor SLAs</p>
          </div>
        </div>

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Ticket className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.open + stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.slaResponseBreached + stats.slaResolutionBreached}</p>
                  <p className="text-xs text-muted-foreground">SLA Breaches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unassigned}</p>
                  <p className="text-xs text-muted-foreground">Unassigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SLA Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Response SLA
              </CardTitle>
              <CardDescription>First response time compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" /> Met
                  </span>
                  <span>{tickets.filter(t => getSlaStatus(t).response === "met").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" /> Pending
                  </span>
                  <span>{tickets.filter(t => getSlaStatus(t).response === "pending").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" /> Breached
                  </span>
                  <span className="text-red-600 font-medium">{stats.slaResponseBreached}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resolution SLA
              </CardTitle>
              <CardDescription>Ticket resolution time compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" /> Met
                  </span>
                  <span>{tickets.filter(t => getSlaStatus(t).resolution === "met").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" /> Pending
                  </span>
                  <span>{tickets.filter(t => getSlaStatus(t).resolution === "pending").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" /> Breached
                  </span>
                  <span className="text-red-600 font-medium">{stats.slaResolutionBreached}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Support Tickets</CardTitle>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="sla_breach">SLA Breached</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    const sla = getSlaStatus(ticket);
                    return (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <TableCell>
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">{ticket.ticket_number}</span>
                            <p className="font-medium truncate max-w-[200px]">{ticket.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{ticket.requester?.full_name || ticket.requester?.email}</span>
                        </TableCell>
                        <TableCell>
                          {ticket.priority && (
                            <Badge
                              variant="outline"
                              style={{ borderColor: ticket.priority.color, color: ticket.priority.color }}
                            >
                              {ticket.priority.name}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[ticket.status]}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {sla.response === "breached" && (
                              <Badge variant="destructive" className="text-xs">Response</Badge>
                            )}
                            {sla.resolution === "breached" && (
                              <Badge variant="destructive" className="text-xs">Resolution</Badge>
                            )}
                            {sla.response !== "breached" && sla.resolution !== "breached" && (
                              <Badge variant="outline" className="text-xs text-green-600">OK</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ticket.assignee_id || "unassigned"}
                            onValueChange={(value) => {
                              updateTicketMutation.mutate({
                                id: ticket.id,
                                updates: { assignee_id: value === "unassigned" ? null : value },
                                ticket,
                              });
                            }}
                          >
                            <SelectTrigger className="w-[140px] h-8" onClick={(e) => e.stopPropagation()}>
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.full_name || agent.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Ticket Detail Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">{selectedTicket.ticket_number}</span>
                    {selectedTicket.subject}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Ticket Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Requester:</span>
                      <p className="font-medium">{selectedTicket.requester?.full_name || selectedTicket.requester?.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium">{format(new Date(selectedTicket.created_at), "PPp")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(value) => {
                          updateTicketMutation.mutate({
                            id: selectedTicket.id,
                            updates: {
                              status: value,
                              ...(value === "resolved" && { resolved_at: new Date().toISOString() }),
                              ...(value === "closed" && { closed_at: new Date().toISOString() }),
                            },
                          });
                          setSelectedTicket({ ...selectedTicket, status: value });
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-8 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <Select
                        value={selectedTicket.priority_id || "none"}
                        onValueChange={(value) => {
                          updateTicketMutation.mutate({
                            id: selectedTicket.id,
                            updates: { priority_id: value === "none" ? null : value },
                          });
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-8 mt-1">
                          <SelectValue placeholder="Set priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {priorities.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* SLA Status */}
                  {selectedTicket.priority && (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-sm font-medium">SLA Status</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          {getSlaStatus(selectedTicket).response === "met" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : getSlaStatus(selectedTicket).response === "breached" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Response: {selectedTicket.priority.response_time_hours}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSlaStatus(selectedTicket).resolution === "met" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : getSlaStatus(selectedTicket).resolution === "breached" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Resolution: {selectedTicket.priority.resolution_time_hours}h</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <div className="p-3 rounded-lg border bg-background">
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments ({comments.length})
                    </p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {comments.map((comment: any) => (
                        <div
                          key={comment.id}
                          className={`p-3 rounded-lg border ${comment.is_internal ? "bg-yellow-50 border-yellow-200" : "bg-background"}`}
                        >
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span className="font-medium">{comment.author?.full_name}</span>
                            <span>{format(new Date(comment.created_at), "PPp")}</span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          {comment.is_internal && (
                            <Badge variant="outline" className="mt-1 text-xs">Internal Note</Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => addCommentMutation.mutate({
                            ticketId: selectedTicket.id,
                            content: commentText,
                            isInternal: false,
                            ticket: selectedTicket,
                          })}
                          disabled={!commentText.trim() || addCommentMutation.isPending}
                        >
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addCommentMutation.mutate({
                            ticketId: selectedTicket.id,
                            content: commentText,
                            isInternal: true,
                            ticket: selectedTicket,
                          })}
                          disabled={!commentText.trim() || addCommentMutation.isPending}
                        >
                          Internal Note
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
          </TabsContent>

          <TabsContent value="analytics">
            <TicketAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
