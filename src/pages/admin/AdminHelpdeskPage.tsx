import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendTicketNotification } from "@/hooks/useTicketNotifications";
import TicketAnalytics from "@/components/helpdesk/TicketAnalytics";
import { SlaMetricsDashboard } from "@/components/helpdesk/SlaMetricsDashboard";
import { SlaConfigurationPanel } from "@/components/helpdesk/SlaConfigurationPanel";
import { EscalationRulesPanel } from "@/components/helpdesk/EscalationRulesPanel";
import { CategoryAssignmentPanel } from "@/components/helpdesk/CategoryAssignmentPanel";
import { SatisfactionAnalytics } from "@/components/helpdesk/SatisfactionAnalytics";
import { AgentPerformanceDashboard } from "@/components/helpdesk/AgentPerformanceDashboard";
import { CategoryManagementPanel } from "@/components/helpdesk/CategoryManagementPanel";
import { MassTicketDialog } from "@/components/helpdesk/MassTicketDialog";
import { DocumentLinkPicker } from "@/components/helpdesk/DocumentLinkPicker";
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
  Settings,
  UserCog,
  Star,
  Users,
  Plus,
  Building2,
  Archive,
  Eye,
  EyeOff,
  FileText,
  FolderCog,
  UsersRound,
  Link2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, differenceInHours, isPast, addHours } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Company {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  pending: "bg-orange-500/10 text-orange-600 border-orange-200",
  resolved: "bg-green-500/10 text-green-600 border-green-200",
  closed: "bg-gray-500/10 text-gray-600 border-gray-200",
  archived: "bg-slate-500/10 text-slate-600 border-slate-200",
};

export default function AdminHelpdeskPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [archiveTicketId, setArchiveTicketId] = useState<string | null>(null);
  const [showInternalNotes, setShowInternalNotes] = useState(true);
  const [massTicketOpen, setMassTicketOpen] = useState(false);
  const [documentPickerOpen, setDocumentPickerOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category_id: "",
    priority_id: "",
    company_id: "",
    requester_id: "",
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Company[];
    },
  });

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
          priority:ticket_priorities(name, code, color, response_time_hours, resolution_time_hours),
          company:companies(id, name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["ticket-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_categories")
        .select("id, name, code, visible_to_employees, visible_to_hr_only, icon")
        .eq("is_active", true)
        .order("display_order");
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

  const archiveTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log the archive action
      await supabase.from("ticket_audit_log").insert({
        ticket_id: ticketId,
        changed_by: user?.id,
        change_type: "archived",
        old_value: "active",
        new_value: "archived",
      });
      
      const { error } = await supabase.from("tickets").update({ status: "archived" }).eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      setSelectedTicket(null);
      setArchiveTicketId(null);
      toast.success("Ticket archived");
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Fetch canned responses
  const { data: cannedResponses = [] } = useQuery({
    queryKey: ["canned-responses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canned_responses")
        .select("*")
        .eq("is_active", true)
        .order("title");
      if (error) throw error;
      return data;
    },
  });

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
    // Company filter
    if (companyFilter !== "all" && t.company_id !== companyFilter) return false;
    
    // Status filter
    if (filter === "all") return true;
    if (filter === "unassigned") return !t.assignee_id;
    if (filter === "sla_breach") {
      const sla = getSlaStatus(t);
      return sla.response === "breached" || sla.resolution === "breached";
    }
    return t.status === filter;
  });

  const generateTicketNumber = () => {
    const prefix = "TKT";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.company_id) {
      toast.error("Please fill in subject, description, and select a company");
      return;
    }

    setIsCreating(true);
    try {
      const ticketNumber = generateTicketNumber();
      
      const { error } = await supabase.from("tickets").insert({
        ticket_number: ticketNumber,
        subject: newTicket.subject,
        description: newTicket.description,
        category_id: newTicket.category_id || null,
        priority_id: newTicket.priority_id || null,
        company_id: newTicket.company_id,
        requester_id: newTicket.requester_id || user?.id,
        status: "open",
      });

      if (error) throw error;

      toast.success("Ticket created successfully");
      setCreateDialogOpen(false);
      setNewTicket({
        subject: "",
        description: "",
        category_id: "",
        priority_id: "",
        company_id: "",
        requester_id: "",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.hrHub"), href: "/hr-hub" },
          { label: t("hrHub.helpDesk") }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("hrHub.helpDesk")}</h1>
            <p className="text-muted-foreground">{t("hrHub.helpDeskDesc")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMassTicketOpen(true)}>
              <UsersRound className="h-4 w-4 mr-2" />
              Mass Ticket
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        </div>

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList className="h-auto flex-wrap items-center">
            {/* Operations */}
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agents
            </TabsTrigger>
            
            <div className="mx-2 h-5 w-px bg-muted-foreground/40 hidden sm:block" />
            
            {/* Monitoring */}
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="sla-metrics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              SLA Metrics
            </TabsTrigger>
            <TabsTrigger value="satisfaction" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Satisfaction
            </TabsTrigger>
            
            <div className="mx-2 h-5 w-px bg-muted-foreground/40 hidden sm:block" />
            
            {/* Configuration */}
            <TabsTrigger value="escalation" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Escalation
            </TabsTrigger>
            <TabsTrigger value="auto-assign" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Auto-Assign
            </TabsTrigger>
            <TabsTrigger value="sla-config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              SLA Config
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderCog className="h-4 w-4" />
              Categories
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
              <div className="flex gap-2">
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Company</TableHead>
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
                    <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{ticket.company?.name || "—"}</span>
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
        <Dialog open={!!selectedTicket} onOpenChange={(open) => { if (!open) { setSelectedTicket(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">{selectedTicket.ticket_number}</span>
                      {selectedTicket.subject}
                    </DialogTitle>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setArchiveTicketId(selectedTicket.id)}
                      title="Archive ticket"
                    >
                      <Archive className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
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
                      <p className="font-medium">{formatDateForDisplay(selectedTicket.created_at, "PPp")}</p>
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
                          <SelectItem value="archived">Archived</SelectItem>
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

                  {/* Description (read-only - original ticket content is immutable) */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Original Request</p>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Original ticket content cannot be modified to maintain data integrity
                    </p>
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
                            <span>{formatDateForDisplay(comment.created_at, "PPp")}</span>
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
                      {/* Canned Response Picker */}
                      {cannedResponses.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Select
                            value=""
                            onValueChange={(responseId) => {
                              const response = cannedResponses.find((r: any) => r.id === responseId);
                              if (response) {
                                // Replace variables in the template
                                let content = response.content;
                                content = content.replace(/\{employee_name\}/g, selectedTicket.requester?.full_name || "");
                                content = content.replace(/\{ticket_number\}/g, selectedTicket.ticket_number || "");
                                setCommentText(content);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[200px] h-8">
                              <SelectValue placeholder="Use template..." />
                            </SelectTrigger>
                            <SelectContent>
                              {cannedResponses.map((response: any) => (
                                <SelectItem key={response.id} value={response.id}>
                                  {response.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-muted-foreground">Insert a canned response</span>
                        </div>
                      )}
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

          <TabsContent value="sla-metrics">
            <SlaMetricsDashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <TicketAnalytics />
          </TabsContent>

          <TabsContent value="sla-config">
            <SlaConfigurationPanel />
          </TabsContent>

          <TabsContent value="escalation">
            <EscalationRulesPanel />
          </TabsContent>

          <TabsContent value="auto-assign">
            <CategoryAssignmentPanel />
          </TabsContent>

          <TabsContent value="agents">
            <AgentPerformanceDashboard />
          </TabsContent>

          <TabsContent value="satisfaction">
            <SatisfactionAnalytics />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagementPanel />
          </TabsContent>
        </Tabs>

        {/* Mass Ticket Dialog */}
        <MassTicketDialog open={massTicketOpen} onOpenChange={setMassTicketOpen} />

        {/* Create Ticket Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Company <span className="text-destructive">*</span></Label>
                <Select value={newTicket.company_id} onValueChange={(v) => setNewTicket({ ...newTicket, company_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject <span className="text-destructive">*</span></Label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief summary of the issue"
                />
              </div>
              <div>
                <Label>Description <span className="text-destructive">*</span></Label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Detailed description of the issue"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={newTicket.category_id} onValueChange={(v) => setNewTicket({ ...newTicket, category_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            {cat.name}
                            {cat.visible_to_hr_only && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">HR Only</span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={newTicket.priority_id} onValueChange={(v) => setNewTicket({ ...newTicket, priority_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Requester</Label>
                <Select value={newTicket.requester_id} onValueChange={(v) => setNewTicket({ ...newTicket, requester_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select requester (defaults to you)" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent: any) => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.full_name || agent.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTicket} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Ticket"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={!!archiveTicketId} onOpenChange={(open) => !open && setArchiveTicketId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Ticket</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive this ticket? Archived tickets are hidden from the main view but can still be accessed for audit purposes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => archiveTicketId && archiveTicketMutation.mutate(archiveTicketId)}
              >
                {archiveTicketMutation.isPending ? "Archiving..." : "Archive"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
