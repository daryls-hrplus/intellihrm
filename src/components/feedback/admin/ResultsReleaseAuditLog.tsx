import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import { 
  Search, 
  Calendar as CalendarIcon, 
  Download, 
  History, 
  CheckCircle,
  User,
  Bell,
  Eye,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface ResultsReleaseAuditLogProps {
  companyId?: string;
}

interface ReleaseAuditEntry {
  id: string;
  created_at: string;
  entity_id: string;
  entity_name: string | null;
  user_id: string;
  new_values: {
    results_released_at?: string;
    results_released_by?: string;
    notify_on_release?: boolean;
    visibility_rules?: Record<string, boolean>;
  } | null;
  metadata: Record<string, unknown> | null;
  releaser_name?: string;
  releaser_email?: string;
}

export function ResultsReleaseAuditLog({ companyId }: ResultsReleaseAuditLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90),
    to: new Date(),
  });
  const [releaserFilter, setReleaserFilter] = useState<string>("all");

  // Fetch release audit entries
  const { data: auditEntries = [], isLoading } = useQuery({
    queryKey: ['release-audit-log', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'review_cycle_results_release')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch releaser names
      const userIds = [...new Set((data || []).map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (data || []).map(entry => ({
        ...entry,
        releaser_name: profileMap.get(entry.user_id)?.full_name || 'Unknown',
        releaser_email: profileMap.get(entry.user_id)?.email || '',
      })) as ReleaseAuditEntry[];
    },
    enabled: true,
  });

  // Get unique releasers for filter
  const uniqueReleasers = useMemo(() => {
    const releasers = new Map<string, string>();
    auditEntries.forEach(entry => {
      if (entry.user_id && entry.releaser_name) {
        releasers.set(entry.user_id, entry.releaser_name);
      }
    });
    return Array.from(releasers.entries()).map(([id, name]) => ({ id, name }));
  }, [auditEntries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return auditEntries.filter(entry => {
      // Search filter
      const matchesSearch = !searchTerm || 
        entry.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.releaser_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date range filter
      const entryDate = parseISO(entry.created_at);
      const matchesDate = !dateRange?.from || !dateRange?.to || 
        isWithinInterval(entryDate, { start: dateRange.from, end: dateRange.to });

      // Releaser filter
      const matchesReleaser = releaserFilter === "all" || entry.user_id === releaserFilter;

      return matchesSearch && matchesDate && matchesReleaser;
    });
  }, [auditEntries, searchTerm, dateRange, releaserFilter]);

  // Stats
  const stats = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const releasesThisMonth = auditEntries.filter(e => 
      parseISO(e.created_at) >= thisMonth
    ).length;

    const lastRelease = auditEntries[0]?.created_at;

    return {
      totalReleases: auditEntries.length,
      releasesThisMonth,
      lastRelease: lastRelease ? format(parseISO(lastRelease), "MMM d, yyyy") : "N/A",
    };
  }, [auditEntries]);

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ["Cycle Name", "Released Date", "Released By", "Email", "Notifications Sent"].join(","),
      ...filteredEntries.map(entry => [
        `"${entry.entity_name || ''}"`,
        format(parseISO(entry.created_at), "yyyy-MM-dd HH:mm:ss"),
        `"${entry.releaser_name || ''}"`,
        entry.releaser_email || '',
        entry.new_values?.notify_on_release ? "Yes" : "No",
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `release-audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Releases</p>
                <p className="text-2xl font-bold">{stats.totalReleases}</p>
              </div>
              <History className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{stats.releasesThisMonth}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Release</p>
                <p className="text-2xl font-bold">{stats.lastRelease}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Results Release History
              </CardTitle>
              <CardDescription>
                Complete audit trail of all 360 feedback results releases across cycles
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by cycle name or releaser..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={releaserFilter} onValueChange={setReleaserFilter}>
              <SelectTrigger className="w-[180px]">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by releaser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Releasers</SelectItem>
                {uniqueReleasers.map(releaser => (
                  <SelectItem key={releaser.id} value={releaser.id}>
                    {releaser.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading release history...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">No release history found</p>
              <p className="text-sm">Release actions will appear here after cycles are released.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cycle Name</TableHead>
                    <TableHead>Released</TableHead>
                    <TableHead>Released By</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Notifications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.entity_name || 'Unknown Cycle'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{format(parseISO(entry.created_at), "MMM d, yyyy")}</span>
                          <span className="text-muted-foreground">
                            {format(parseISO(entry.created_at), "h:mm a")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{entry.releaser_name}</div>
                            <div className="text-xs text-muted-foreground">{entry.releaser_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.new_values?.visibility_rules?.employee_can_view && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <User className="h-3 w-3" />
                              Employee
                            </Badge>
                          )}
                          {entry.new_values?.visibility_rules?.manager_can_view && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Users className="h-3 w-3" />
                              Manager
                            </Badge>
                          )}
                          {entry.new_values?.visibility_rules?.hr_can_view && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Eye className="h-3 w-3" />
                              HR
                            </Badge>
                          )}
                          {!entry.new_values?.visibility_rules && (
                            <span className="text-xs text-muted-foreground">Default</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.new_values?.notify_on_release ? (
                          <Badge variant="outline" className="gap-1 text-success border-success/30">
                            <Bell className="h-3 w-3" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <Bell className="h-3 w-3" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
