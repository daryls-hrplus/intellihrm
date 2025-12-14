import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Rocket,
  Calendar,
} from 'lucide-react';
import { useOnboarding, OnboardingInstance } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';

export default function MssOnboardingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchInstances, getOnboardingProgress } = useOnboarding();

  const [instances, setInstances] = useState<OnboardingInstance[]>([]);
  const [instanceProgress, setInstanceProgress] = useState<Record<string, { total: number; completed: number; percentage: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const breadcrumbItems = [
    { label: t('mss.title'), path: '/mss' },
    { label: t('mss.modules.onboarding.title') },
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      // Fetch instances where current user is the manager
      const instancesData = await fetchInstances({ managerId: user.id });
      setInstances(instancesData);

      // Load progress for each instance
      const progressData: Record<string, any> = {};
      for (const instance of instancesData) {
        progressData[instance.id] = await getOnboardingProgress(instance.id);
      }
      setInstanceProgress(progressData);
    } catch (error) {
      console.error('Error loading onboarding data:', error);
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const filteredInstances = instances.filter(instance => {
    const matchesSearch = !searchQuery || 
      (instance as any).profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (instance as any).onboarding_templates?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: instances.length,
    inProgress: instances.filter(i => i.status === 'in_progress').length,
    completed: instances.filter(i => i.status === 'completed').length,
    overdue: instances.filter(i => {
      if (i.status !== 'in_progress' || !i.target_completion_date) return false;
      return differenceInDays(new Date(i.target_completion_date), new Date()) < 0;
    }).length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Onboarding</h1>
          <p className="text-muted-foreground">
            Track and manage onboarding progress for your direct reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">team members onboarding</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">actively onboarding</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">successfully onboarded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">past target date</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>View onboarding progress for your direct reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or template..."
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
                <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No onboarding records</h3>
                <p className="text-muted-foreground">
                  {instances.length === 0 
                    ? "You don't have any direct reports currently onboarding"
                    : "No results match your search criteria"
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstances.map((instance) => {
                    const progress = instanceProgress[instance.id] || { total: 0, completed: 0, percentage: 0 };
                    const isOverdue = instance.status === 'in_progress' && 
                      instance.target_completion_date && 
                      differenceInDays(new Date(instance.target_completion_date), new Date()) < 0;

                    return (
                      <TableRow key={instance.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {(instance as any).profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{(instance as any).profiles?.full_name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{(instance as any).onboarding_templates?.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(instance.start_date), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {instance.target_completion_date ? (
                            <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-500' : ''}`}>
                              <Calendar className="h-3 w-3" />
                              {format(new Date(instance.target_completion_date), 'MMM d, yyyy')}
                              {isOverdue && <AlertCircle className="h-3 w-3" />}
                            </div>
                          ) : '-'}
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
                            onClick={() => navigate(`/workforce/onboarding/${instance.id}`)}
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
