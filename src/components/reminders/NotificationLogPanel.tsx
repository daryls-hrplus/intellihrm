import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, CheckCircle, XCircle, Clock, Search, RefreshCw, Mail, Filter } from 'lucide-react';
import { format, subDays, isWithinInterval } from 'date-fns';

interface NotificationLogPanelProps {
  companyId?: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
}

interface NotificationWithRecipient extends Notification {
  recipient?: {
    id: string;
    full_name: string | null;
    first_name: string | null;
    first_last_name: string | null;
    avatar_url: string | null;
  };
}

export function NotificationLogPanel({ companyId }: NotificationLogPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7');

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notification-log', companyId, dateFilter],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateFilter));
      
      // Fetch notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (notifError) throw notifError;
      
      // Get unique user IDs to fetch profiles
      const userIds = [...new Set(notifData?.map((n) => n.user_id) || [])];
      
      // Fetch profiles for recipients
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, first_last_name, avatar_url')
        .in('id', userIds);
      
      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
      
      // Combine notifications with recipient data
      return (notifData || []).map((n) => ({
        ...n,
        recipient: profilesMap.get(n.user_id),
      })) as NotificationWithRecipient[];
    },
  });

  const filteredNotifications = notifications?.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const recipientName = n.recipient?.full_name || 
        `${n.recipient?.first_name || ''} ${n.recipient?.first_last_name || ''}`.trim();
      if (
        !n.title.toLowerCase().includes(query) &&
        !recipientName.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  }) || [];

  const notificationTypes = [...new Set(notifications?.map((n) => n.type) || [])];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ess_request_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ess_request_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'ess_request_info_required':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'ess_request_approved':
        return 'default';
      case 'ess_request_rejected':
        return 'destructive';
      case 'ess_request_info_required':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTypeName = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Summary stats
  const today = new Date();
  const todayCount = notifications?.filter((n) => 
    isWithinInterval(new Date(n.created_at), { start: subDays(today, 1), end: today })
  ).length || 0;
  
  const readCount = notifications?.filter((n) => n.is_read).length || 0;
  const unreadCount = (notifications?.length || 0) - readCount;

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{notifications?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total (last {dateFilter} days)</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{todayCount}</p>
              <p className="text-xs text-muted-foreground">Sent Today</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{readCount}</p>
              <p className="text-xs text-muted-foreground">Read ({unreadCount} unread)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {notificationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {formatTypeName(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
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
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No notifications found</p>
          {(searchQuery || typeFilter !== 'all') && (
            <p className="text-sm mt-1">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Notification</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => {
                const recipientName = notification.recipient?.full_name || 
                  `${notification.recipient?.first_name || ''} ${notification.recipient?.first_last_name || ''}`.trim() || 
                  'Unknown';
                const initials = recipientName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

                return (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.recipient?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{recipientName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {getTypeIcon(notification.type)}
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          {notification.message && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {notification.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(notification.type)}>
                        {formatTypeName(notification.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {notification.is_read ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          Read
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          Unread
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
