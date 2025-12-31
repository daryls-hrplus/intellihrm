import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Grid3x3,
  Users,
  Target,
  DollarSign,
  BarChart3,
  Bell
} from 'lucide-react';
import { useIntegrationLogs, IntegrationLog } from '@/hooks/useAppraisalIntegration';
import { format } from 'date-fns';

interface AppraisalIntegrationStatusProps {
  participantId?: string;
  employeeId?: string;
  compact?: boolean;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  nine_box: <Grid3x3 className="h-4 w-4" />,
  succession: <Users className="h-4 w-4" />,
  idp: <Target className="h-4 w-4" />,
  pip: <AlertTriangle className="h-4 w-4" />,
  compensation: <DollarSign className="h-4 w-4" />,
  workforce_analytics: <BarChart3 className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />
};

const MODULE_NAMES: Record<string, string> = {
  nine_box: '9-Box Assessment',
  succession: 'Succession Planning',
  idp: 'Development Plan',
  pip: 'Performance Improvement',
  compensation: 'Compensation Review',
  workforce_analytics: 'Analytics',
  notifications: 'Notifications'
};

function getStatusBadge(result: string) {
  switch (result) {
    case 'success':
      return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Executed</Badge>;
    case 'failed':
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    case 'pending_approval':
      return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>;
    case 'pending':
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'skipped':
      return <Badge variant="outline">Skipped</Badge>;
    case 'cancelled':
      return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
    default:
      return <Badge variant="outline">{result}</Badge>;
  }
}

export function AppraisalIntegrationStatus({ 
  participantId, 
  employeeId,
  compact = false 
}: AppraisalIntegrationStatusProps) {
  const { logs, loading, fetchLogs } = useIntegrationLogs(participantId, employeeId);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs.length) {
    return null; // Don't show if no integrations
  }

  // Group by module
  const byModule = logs.reduce((acc, log) => {
    if (!acc[log.target_module]) acc[log.target_module] = [];
    acc[log.target_module].push(log);
    return acc;
  }, {} as Record<string, IntegrationLog[]>);

  const successCount = logs.filter(l => l.action_result === 'success').length;
  const pendingCount = logs.filter(l => l.action_result === 'pending_approval').length;
  const failedCount = logs.filter(l => l.action_result === 'failed').length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Integration Status
          </CardTitle>
          <div className="flex gap-1 text-xs">
            {successCount > 0 && <Badge className="bg-green-100 text-green-800">{successCount} done</Badge>}
            {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-800">{pendingCount} pending</Badge>}
            {failedCount > 0 && <Badge variant="destructive">{failedCount} failed</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(byModule).map(([module, moduleLogs]) => {
            const latestLog = moduleLogs[0];
            return (
              <div 
                key={module} 
                className="flex items-center justify-between p-2 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2">
                  {MODULE_ICONS[module] || <RefreshCw className="h-4 w-4" />}
                  <div>
                    <p className="text-sm font-medium">{MODULE_NAMES[module] || module}</p>
                    {!compact && latestLog.executed_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(latestLog.executed_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(latestLog.action_result)}
                  {latestLog.target_record_id && (
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {failedCount > 0 && !compact && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Failed Actions:</p>
            {logs.filter(l => l.action_result === 'failed').map(log => (
              <div key={log.id} className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-1">
                {MODULE_NAMES[log.target_module]}: {log.error_message || 'Unknown error'}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
