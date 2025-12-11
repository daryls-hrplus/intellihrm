import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { differenceInHours, format, subDays, startOfDay, endOfDay, isWithinInterval, differenceInDays } from "date-fns";
import { Clock, TrendingUp, Users, Target, CheckCircle, Download, FileText, FileSpreadsheet, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

type DateRange = {
  from: Date;
  to: Date;
};

export default function TicketAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [presetRange, setPresetRange] = useState("30");

  const { data: tickets = [] } = useQuery({
    queryKey: ["analytics-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          assignee:profiles!tickets_assignee_id_fkey(id, full_name, email),
          category:ticket_categories(name, code),
          priority:ticket_priorities(name, code, color, response_time_hours, resolution_time_hours)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["analytics-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_categories")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const handlePresetChange = (value: string) => {
    setPresetRange(value);
    if (value === "custom") return;
    
    const days = parseInt(value);
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  // Filter tickets by date range
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const ticketDate = new Date(t.created_at);
      return isWithinInterval(ticketDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      });
    });
  }, [tickets, dateRange]);

  // Calculate metrics using filtered tickets
  const resolvedTickets = filteredTickets.filter(t => ["resolved", "closed"].includes(t.status));
  
  const avgResolutionTime = resolvedTickets.length > 0
    ? resolvedTickets.reduce((acc, t) => {
        const resolved = t.resolved_at || t.closed_at || t.updated_at;
        return acc + differenceInHours(new Date(resolved), new Date(t.created_at));
      }, 0) / resolvedTickets.length
    : 0;

  const avgFirstResponseTime = filteredTickets.filter(t => t.first_response_at).length > 0
    ? filteredTickets.filter(t => t.first_response_at).reduce((acc, t) => {
        return acc + differenceInHours(new Date(t.first_response_at), new Date(t.created_at));
      }, 0) / filteredTickets.filter(t => t.first_response_at).length
    : 0;

  // Category distribution
  const categoryDistribution = categories.map(cat => ({
    name: cat.name,
    value: filteredTickets.filter(t => t.category?.code === cat.code).length,
  })).filter(c => c.value > 0);

  // Status distribution
  const statusDistribution = [
    { name: "Open", value: filteredTickets.filter(t => t.status === "open").length, color: "#3b82f6" },
    { name: "In Progress", value: filteredTickets.filter(t => t.status === "in_progress").length, color: "#f59e0b" },
    { name: "Pending", value: filteredTickets.filter(t => t.status === "pending").length, color: "#f97316" },
    { name: "Resolved", value: filteredTickets.filter(t => t.status === "resolved").length, color: "#22c55e" },
    { name: "Closed", value: filteredTickets.filter(t => t.status === "closed").length, color: "#6b7280" },
  ].filter(s => s.value > 0);

  // Priority distribution
  const priorityDistribution = [
    { name: "Low", value: filteredTickets.filter(t => t.priority?.code === "low").length, color: "#22c55e" },
    { name: "Medium", value: filteredTickets.filter(t => t.priority?.code === "medium").length, color: "#f59e0b" },
    { name: "High", value: filteredTickets.filter(t => t.priority?.code === "high").length, color: "#f97316" },
    { name: "Urgent", value: filteredTickets.filter(t => t.priority?.code === "urgent").length, color: "#ef4444" },
  ].filter(p => p.value > 0);

  // Agent performance
  const agentPerformance = filteredTickets
    .filter(t => t.assignee)
    .reduce((acc: any[], t) => {
      const existing = acc.find(a => a.id === t.assignee.id);
      if (existing) {
        existing.total++;
        if (["resolved", "closed"].includes(t.status)) {
          existing.resolved++;
          const resolved = t.resolved_at || t.closed_at || t.updated_at;
          existing.totalResolutionHours += differenceInHours(new Date(resolved), new Date(t.created_at));
        }
      } else {
        const isResolved = ["resolved", "closed"].includes(t.status);
        const resolved = t.resolved_at || t.closed_at || t.updated_at;
        acc.push({
          id: t.assignee.id,
          name: t.assignee.full_name || t.assignee.email,
          total: 1,
          resolved: isResolved ? 1 : 0,
          totalResolutionHours: isResolved ? differenceInHours(new Date(resolved), new Date(t.created_at)) : 0,
        });
      }
      return acc;
    }, [])
    .map(a => ({
      ...a,
      avgResolutionTime: a.resolved > 0 ? Math.round(a.totalResolutionHours / a.resolved) : 0,
      resolutionRate: Math.round((a.resolved / a.total) * 100),
    }))
    .sort((a, b) => b.total - a.total);

  // Tickets over time (based on date range)
  const daysDiff = Math.min(differenceInDays(dateRange.to, dateRange.from) + 1, 90);
  const trendData = Array.from({ length: daysDiff }, (_, i) => {
    const date = startOfDay(subDays(dateRange.to, daysDiff - 1 - i));
    return {
      date: format(date, daysDiff > 14 ? "MMM d" : "EEE d"),
      created: filteredTickets.filter(t => 
        format(startOfDay(new Date(t.created_at)), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      ).length,
      resolved: filteredTickets.filter(t => 
        t.resolved_at && format(startOfDay(new Date(t.resolved_at)), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      ).length,
    };
  });

  // SLA compliance
  const slaMetrics = {
    responseCompliance: filteredTickets.filter(t => t.first_response_at && t.priority).length > 0
      ? Math.round((filteredTickets.filter(t => {
          if (!t.first_response_at || !t.priority) return false;
          const responseHours = differenceInHours(new Date(t.first_response_at), new Date(t.created_at));
          return responseHours <= t.priority.response_time_hours;
        }).length / filteredTickets.filter(t => t.first_response_at && t.priority).length) * 100)
      : 100,
    resolutionCompliance: resolvedTickets.filter(t => t.priority).length > 0
      ? Math.round((resolvedTickets.filter(t => {
          if (!t.priority) return false;
          const resolved = t.resolved_at || t.closed_at || t.updated_at;
          const resolutionHours = differenceInHours(new Date(resolved), new Date(t.created_at));
          return resolutionHours <= t.priority.resolution_time_hours;
        }).length / resolvedTickets.filter(t => t.priority).length) * 100)
      : 100,
  };

  const exportToCSV = () => {
    const reportDate = format(new Date(), "yyyy-MM-dd");
    
    // Summary metrics
    let csvContent = "Ticket Analytics Report\n";
    csvContent += `Generated: ${format(new Date(), "PPP p")}\n\n`;
    
    csvContent += "KEY METRICS\n";
    csvContent += "Metric,Value\n";
    csvContent += `Average First Response Time,${avgFirstResponseTime.toFixed(1)} hours\n`;
    csvContent += `Average Resolution Time,${avgResolutionTime.toFixed(1)} hours\n`;
    csvContent += `Response SLA Compliance,${slaMetrics.responseCompliance}%\n`;
    csvContent += `Resolution SLA Compliance,${slaMetrics.resolutionCompliance}%\n\n`;
    
    csvContent += "STATUS DISTRIBUTION\n";
    csvContent += "Status,Count\n";
    statusDistribution.forEach(s => {
      csvContent += `${s.name},${s.value}\n`;
    });
    csvContent += "\n";
    
    csvContent += "PRIORITY DISTRIBUTION\n";
    csvContent += "Priority,Count\n";
    priorityDistribution.forEach(p => {
      csvContent += `${p.name},${p.value}\n`;
    });
    csvContent += "\n";
    
    csvContent += "CATEGORY DISTRIBUTION\n";
    csvContent += "Category,Count\n";
    categoryDistribution.forEach(c => {
      csvContent += `${c.name},${c.value}\n`;
    });
    csvContent += "\n";
    
    csvContent += "AGENT PERFORMANCE\n";
    csvContent += "Agent,Total Tickets,Resolved,Resolution Rate,Avg Resolution Time (hours)\n";
    agentPerformance.forEach(a => {
      csvContent += `${a.name},${a.total},${a.resolved},${a.resolutionRate}%,${a.avgResolutionTime}\n`;
    });
    csvContent += "\n";
    
    csvContent += "TREND DATA\n";
    csvContent += "Date,Created,Resolved\n";
    trendData.forEach(d => {
      csvContent += `${d.date},${d.created},${d.resolved}\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ticket-analytics-${reportDate}.csv`;
    link.click();
    
    toast.success("CSV report downloaded successfully");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const reportDate = format(new Date(), "PPP p");
    let yPos = 20;
    
    // Title
    doc.setFontSize(18);
    doc.text("Ticket Analytics Report", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${reportDate}`, 20, yPos);
    yPos += 15;
    
    // Key Metrics
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Key Metrics", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`• Average First Response Time: ${avgFirstResponseTime.toFixed(1)} hours`, 25, yPos);
    yPos += 6;
    doc.text(`• Average Resolution Time: ${avgResolutionTime.toFixed(1)} hours`, 25, yPos);
    yPos += 6;
    doc.text(`• Response SLA Compliance: ${slaMetrics.responseCompliance}%`, 25, yPos);
    yPos += 6;
    doc.text(`• Resolution SLA Compliance: ${slaMetrics.resolutionCompliance}%`, 25, yPos);
    yPos += 15;
    
    // Status Distribution
    doc.setFontSize(14);
    doc.text("Status Distribution", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    statusDistribution.forEach(s => {
      doc.text(`• ${s.name}: ${s.value} tickets`, 25, yPos);
      yPos += 6;
    });
    yPos += 10;
    
    // Priority Distribution
    doc.setFontSize(14);
    doc.text("Priority Distribution", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    priorityDistribution.forEach(p => {
      doc.text(`• ${p.name}: ${p.value} tickets`, 25, yPos);
      yPos += 6;
    });
    yPos += 10;
    
    // Category Distribution
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text("Category Distribution", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    categoryDistribution.forEach(c => {
      doc.text(`• ${c.name}: ${c.value} tickets`, 25, yPos);
      yPos += 6;
    });
    yPos += 10;
    
    // Agent Performance
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text("Agent Performance", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    agentPerformance.slice(0, 10).forEach(a => {
      doc.text(`• ${a.name}: ${a.total} tickets, ${a.resolutionRate}% resolved, ${a.avgResolutionTime}h avg`, 25, yPos);
      yPos += 6;
    });
    
    doc.save(`ticket-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF report downloaded successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Filter and Export */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={presetRange} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => {
                    if (date) {
                      setPresetRange("custom");
                      setDateRange(prev => ({ ...prev, from: date }));
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <span className="text-muted-foreground">to</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.to, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => {
                    if (date) {
                      setPresetRange("custom");
                      setDateRange(prev => ({ ...prev, to: date }));
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Badge variant="secondary" className="ml-2">
            {filteredTickets.length} tickets
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgFirstResponseTime.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">Avg First Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">Avg Resolution Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{slaMetrics.responseCompliance}%</p>
                <p className="text-xs text-muted-foreground">Response SLA Met</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{slaMetrics.resolutionCompliance}%</p>
                <p className="text-xs text-muted-foreground">Resolution SLA Met</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Status Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Status Distribution</CardTitle>
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
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Performance
              </CardTitle>
              <CardDescription>Tickets handled and resolution metrics by agent</CardDescription>
            </CardHeader>
            <CardContent>
              {agentPerformance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No agent data available</p>
              ) : (
                <div className="space-y-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={agentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" name="Total Tickets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {agentPerformance.slice(0, 6).map((agent) => (
                      <Card key={agent.id} className="border-muted">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium truncate">{agent.name}</span>
                            <Badge variant="secondary">{agent.total} tickets</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Resolution Rate</p>
                              <p className="font-semibold text-green-600">{agent.resolutionRate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Resolution</p>
                              <p className="font-semibold">{agent.avgResolutionTime}h</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Trends</CardTitle>
              <CardDescription>
                Daily ticket creation and resolution ({format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(daysDiff / 10))} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="created" 
                      name="Created" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      name="Resolved" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resolution Time by Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time by Priority</CardTitle>
              <CardDescription>Average hours to resolve tickets by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { priority: "Low", hours: calculateAvgByPriority("low"), target: 72 },
                      { priority: "Medium", hours: calculateAvgByPriority("medium"), target: 48 },
                      { priority: "High", hours: calculateAvgByPriority("high"), target: 24 },
                      { priority: "Urgent", hours: calculateAvgByPriority("urgent"), target: 4 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="priority" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" name="Actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target SLA" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  function calculateAvgByPriority(priorityCode: string) {
    const priorityTickets = resolvedTickets.filter(t => t.priority?.code === priorityCode);
    if (priorityTickets.length === 0) return 0;
    return Math.round(
      priorityTickets.reduce((acc, t) => {
        const resolved = t.resolved_at || t.closed_at || t.updated_at;
        return acc + differenceInHours(new Date(resolved), new Date(t.created_at));
      }, 0) / priorityTickets.length
    );
  }
}
