import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Bell, 
  RefreshCw, 
  Download, 
  Search,
  Eye,
  Loader2,
  AlertCircle,
  MailOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';
import { REMINDER_CATEGORIES } from '@/types/reminders';

interface DeliveryLog {
  id: string;
  company_id: string;
  employee_id: string | null;
  event_type_id: string | null;
  delivery_channel: 'in_app' | 'email' | 'sms';
  recipient_email: string | null;
  recipient_name: string | null;
  subject: string | null;
  body_preview: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened';
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  message_id: string | null;
  source_record_id: string | null;
  source_table: string | null;
  metadata: Record<string, any>;
  created_at: string;
  event_type?: {
    code: string;
    name: string;
    category: string;
  };
}

interface DeliveryStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
  bounced: number;
}

interface DeliveryTrackingDashboardProps {
  companyId?: string;
}

export function DeliveryTrackingDashboard({ companyId }: DeliveryTrackingDashboardProps) {
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    total: 0,
    pending: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    failed: 0,
    bounced: 0,
  });
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reminder_delivery_log')
        .select(`
          *,
          event_type:reminder_event_types(code, name, category)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (companyId && companyId !== 'all') {
        query = query.eq('company_id', companyId);
      }

      // Apply date filter
      const daysAgo = parseInt(dateRange);
      if (!isNaN(daysAgo)) {
        const startDate = subDays(new Date(), daysAgo).toISOString();
        query = query.gte('created_at', startDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs((data || []) as DeliveryLog[]);

      // Calculate stats
      const newStats: DeliveryStats = {
        total: data?.length || 0,
        pending: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        failed: 0,
        bounced: 0,
      };

      data?.forEach((log: any) => {
        if (log.status in newStats) {
          newStats[log.status as keyof DeliveryStats]++;
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching delivery logs:', error);
      toast.error('Failed to load delivery logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [companyId, dateRange]);

  const handleRetry = async (logId: string) => {
    setRetrying(logId);
    try {
      // Reset status to pending
      await supabase
        .from('reminder_delivery_log')
        .update({ 
          status: 'pending', 
          failure_reason: null,
          failed_at: null 
        })
        .eq('id', logId);

      toast.success('Notification queued for retry');
      await fetchLogs();
    } catch (error) {
      toast.error('Failed to retry notification');
    } finally {
      setRetrying(null);
    }
  };

  const handleExport = () => {
    const filteredLogs = getFilteredLogs();
    const csv = [
      ['Recipient', 'Email', 'Subject', 'Channel', 'Status', 'Sent At', 'Event Type', 'Category'].join(','),
      ...filteredLogs.map(log => [
        `"${log.recipient_name || ''}"`,
        `"${log.recipient_email || ''}"`,
        `"${log.subject || ''}"`,
        log.delivery_channel,
        log.status,
        log.sent_at ? format(new Date(log.sent_at), 'yyyy-MM-dd HH:mm') : '',
        `"${log.event_type?.name || ''}"`,
        `"${log.event_type?.category || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      const matchesSearch = !searchTerm || 
        log.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      const matchesChannel = channelFilter === 'all' || log.delivery_channel === channelFilter;
      const matchesCategory = categoryFilter === 'all' || log.event_type?.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesChannel && matchesCategory;
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      sent: { variant: 'default', icon: <Send className="h-3 w-3" /> },
      delivered: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      opened: { variant: 'default', icon: <MailOpen className="h-3 w-3" /> },
      failed: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
      bounced: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="gap-1 capitalize">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4 text-muted-foreground" />;
      case 'in_app':
        return <Bell className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Send className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.opened}</div>
            <p className="text-xs text-muted-foreground">Opened</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{stats.bounced}</div>
            <p className="text-xs text-muted-foreground">Bounced</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Delivery Log</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by recipient or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {REMINDER_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No delivery logs found</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 100).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.recipient_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{log.recipient_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px] truncate" title={log.subject || ''}>
                          {log.subject || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{log.event_type?.name || '-'}</div>
                          {log.event_type?.category && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {log.event_type.category}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(log.delivery_channel)}
                          <span className="capitalize">{log.delivery_channel.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {log.sent_at ? format(new Date(log.sent_at), 'MMM d, h:mm a') : '-'}
                      </TableCell>
                      <TableCell>
                        {(log.status === 'failed' || log.status === 'bounced') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetry(log.id)}
                            disabled={retrying === log.id}
                          >
                            {retrying === log.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredLogs.length > 100 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 100 of {filteredLogs.length} results
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
