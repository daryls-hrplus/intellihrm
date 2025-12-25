import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  UserMinus,
  Calendar,
} from 'lucide-react';
import { useOffboarding, OffboardingInstance } from '@/hooks/useOffboarding';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { formatDateForDisplay } from "@/utils/dateUtils";

export default function MssOffboardingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchInstances, getOffboardingProgress } = useOffboarding();

  const [instances, setInstances] = useState<OffboardingInstance[]>([]);
  const [instanceProgress, setInstanceProgress] = useState<Record<string, { total: number; completed: number; percentage: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const breadcrumbItems = [
    { label: t('mss.title'), href: '/mss' },
    { label: t('mss.modules.offboarding.title') },
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const instancesData = await fetchInstances({ managerId: user.id });
      setInstances(instancesData);

      const progressData: Record<string, any> = {};
      for (const instance of instancesData) {
        progressData[instance.id] = await getOffboardingProgress(instance.id);
      }
      setInstanceProgress(progressData);
    } catch (error) {
      console.error('Error loading offboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">In Progress</Badge>;
    }
  };

  const getReasonBadge = (reason: string | null) => {
    if (!reason) return null;
    const colors: Record<string, string> = {
      resignation: 'bg-amber-500/10 text-amber-600',
      retirement: 'bg-purple-500/10 text-purple-600',
      termination: 'bg-red-500/10 text-red-600',
      layoff: 'bg-orange-500/10 text-orange-600',
      contract_end: 'bg-blue-500/10 text-blue-600',
    };
    return (
      <Badge className={colors[reason] || 'bg-muted text-muted-foreground'}>
        {reason.replace('_', ' ').charAt(0).toUpperCase() + reason.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const filteredInstances = instances.filter(instance => {
    const matchesSearch = !searchQuery || 
      (instance as any).profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (instance as any).offboarding_templates?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: instances.length,
    inProgress: instances.filter(i => i.status === 'in_progress').length,
    completed: instances.filter(i => i.status === 'completed').length,
    thisMonth: instances.filter(i => {
      const lastDate = new Date(i.last_working_date);
      const now = new Date();
      return lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserMinus className="h-8 w-8" />
            Team Departures
          </h1>
          <p className="text-muted-foreground">
            Track and manage offboarding progress for departing team members
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departures</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">team members leaving</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">actively offboarding</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">successfully offboarded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">departing this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Departing Team Members</CardTitle>
            <CardDescription>View offboarding progress for your direct reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredInstances.length === 0 ? (
              <div className="text-center py-8">
                <UserMinus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No offboarding records</h3>
                <p className="text-muted-foreground">
                  {instances.length === 0 
                    ? "You don't have any direct reports currently offboarding"
                    : "No results match your search criteria"
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Last Working Day</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstances.map((instance) => {
                    const progress = instanceProgress[instance.id] || { total: 0, completed: 0, percentage: 0 };
                    const daysUntil = differenceInDays(new Date(instance.last_working_date), new Date());
                    const isUrgent = daysUntil <= 7 && daysUntil >= 0 && instance.status === 'in_progress';

                    return (
                      <TableRow key={instance.id} className={isUrgent ? 'bg-orange-500/5' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {(instance as any).profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{(instance as any).profiles?.full_name || 'Unknown'}</span>
                              {isUrgent && (
                                <p className="text-xs text-orange-600 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Leaving in {daysUntil} days
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getReasonBadge(instance.termination_reason)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDateForDisplay(instance.last_working_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={progress.percentage} className="h-2 flex-1" />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {progress.completed}/{progress.total}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(instance.status)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/workforce/offboarding/${instance.id}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
