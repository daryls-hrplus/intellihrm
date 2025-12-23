import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Timer,
  AlertCircle,
  Loader2
} from "lucide-react";

interface ScheduledJob {
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  schedule: string;
  description: string;
  functionName: string;
  nextRun: string;
}

interface JobRun {
  id: string;
  job_name: string;
  job_type: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  companies_processed: number;
  metrics_generated: Record<string, unknown> | null;
  error_message: string | null;
  triggered_by: string;
}

const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    name: 'Daily Risk Aggregation',
    type: 'daily',
    schedule: '0 6 * * *',
    description: 'Aggregates AI risk scores, pending reviews, and bias incidents from the previous day',
    functionName: 'ai-governance-daily',
    nextRun: getNextRunTime('daily')
  },
  {
    name: 'Weekly Bias Analysis',
    type: 'weekly',
    schedule: '0 7 * * 1',
    description: 'Analyzes bias patterns across all companies and generates trend reports',
    functionName: 'ai-governance-weekly',
    nextRun: getNextRunTime('weekly')
  },
  {
    name: 'Monthly Audit Check',
    type: 'monthly',
    schedule: '0 8 1 * *',
    description: 'Reviews model registry for overdue audits and compliance gaps',
    functionName: 'ai-governance-monthly',
    nextRun: getNextRunTime('monthly')
  },
  {
    name: 'Quarterly Governance Report',
    type: 'quarterly',
    schedule: '0 9 1 1,4,7,10 *',
    description: 'Generates comprehensive ISO 42001 compliance reports for management review',
    functionName: 'ai-governance-quarterly',
    nextRun: getNextRunTime('quarterly')
  }
];

function getNextRunTime(type: string): string {
  const now = new Date();
  const next = new Date(now);
  
  switch (type) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(6, 0, 0, 0);
      break;
    case 'weekly':
      const daysUntilMonday = (8 - next.getDay()) % 7 || 7;
      next.setDate(next.getDate() + daysUntilMonday);
      next.setHours(7, 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(8, 0, 0, 0);
      break;
    case 'quarterly':
      const currentQuarter = Math.floor(next.getMonth() / 3);
      const nextQuarterMonth = (currentQuarter + 1) * 3;
      if (nextQuarterMonth >= 12) {
        next.setFullYear(next.getFullYear() + 1);
        next.setMonth(0);
      } else {
        next.setMonth(nextQuarterMonth);
      }
      next.setDate(1);
      next.setHours(9, 0, 0, 0);
      break;
  }
  
  return next.toISOString();
}

export function AIScheduledJobsPanel() {
  const queryClient = useQueryClient();
  const [runningJob, setRunningJob] = useState<string | null>(null);

  // Fetch job run history
  const { data: jobRuns, isLoading } = useQuery({
    queryKey: ['ai-scheduled-job-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_scheduled_job_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as JobRun[];
    }
  });

  // Manual trigger mutation
  const triggerJobMutation = useMutation({
    mutationFn: async (functionName: string) => {
      setRunningJob(functionName);
      const { data, error } = await supabase.functions.invoke(functionName);
      if (error) throw error;
      return data;
    },
    onSuccess: (data, functionName) => {
      toast.success(`Job ${functionName} completed`, {
        description: `Processed ${data?.companies_processed || 0} companies`
      });
      queryClient.invalidateQueries({ queryKey: ['ai-scheduled-job-runs'] });
      setRunningJob(null);
    },
    onError: (error, functionName) => {
      toast.error(`Job ${functionName} failed`, {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setRunningJob(null);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      weekly: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      monthly: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      quarterly: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    };
    return <Badge className={colors[type] || ''}>{type}</Badge>;
  };

  const getLastRun = (jobType: string) => {
    const run = jobRuns?.find(r => r.job_type === jobType);
    return run ? run.started_at : null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          AI Governance Automation
        </CardTitle>
        <CardDescription>
          Scheduled jobs for ISO 42001 compliance monitoring and reporting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Run History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <div className="grid gap-4">
              {SCHEDULED_JOBS.map((job) => {
                const lastRun = getLastRun(job.type);
                const isRunning = runningJob === job.functionName;
                
                return (
                  <div
                    key={job.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{job.name}</h4>
                        {getTypeBadge(job.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Schedule: <code className="bg-muted px-1 rounded">{job.schedule}</code>
                        </span>
                        {lastRun && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Last run: {formatDistanceToNow(new Date(lastRun), { addSuffix: true })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {format(new Date(job.nextRun), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerJobMutation.mutate(job.functionName)}
                      disabled={isRunning || triggerJobMutation.isPending}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run Now
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : jobRuns && jobRuns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Companies</TableHead>
                    <TableHead>Triggered By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.job_name}</TableCell>
                      <TableCell>{getTypeBadge(run.job_type)}</TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(run.started_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {run.completed_at
                          ? `${Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s`
                          : '-'}
                      </TableCell>
                      <TableCell>{run.companies_processed || 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {run.triggered_by}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No job runs recorded yet</p>
                <p className="text-sm">Run a job manually or wait for the next scheduled execution</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}