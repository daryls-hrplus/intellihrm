import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ChevronDown,
  Timer,
  RefreshCw
} from "lucide-react";
import { useScheduledJobs, ScheduledJob } from "@/hooks/useScheduledJobs";
import { cn } from "@/lib/utils";

const INTERVAL_OPTIONS = [
  { value: "5", label: "Every 5 minutes" },
  { value: "10", label: "Every 10 minutes" },
  { value: "15", label: "Every 15 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every hour" },
  { value: "120", label: "Every 2 hours" },
  { value: "360", label: "Every 6 hours" },
  { value: "720", label: "Every 12 hours" },
  { value: "1440", label: "Daily" },
];

interface ScheduledJobCardProps {
  job: ScheduledJob;
  onUpdate: (id: string, updates: Partial<Pick<ScheduledJob, "is_enabled" | "interval_minutes">>) => void;
  onRun: (job: ScheduledJob) => void;
  isUpdating: boolean;
  isRunning: boolean;
}

function ScheduledJobCard({ job, onUpdate, onRun, isUpdating, isRunning }: ScheduledJobCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusBadge = () => {
    if (!job.last_run_status) {
      return <Badge variant="secondary">Never run</Badge>;
    }
    if (job.last_run_status === "success") {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{job.job_name}</CardTitle>
              {getStatusBadge()}
            </div>
            <CardDescription>{job.job_description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={job.is_enabled}
              onCheckedChange={(enabled) => onUpdate(job.id, { is_enabled: enabled })}
              disabled={isUpdating}
            />
            <Label className="text-sm text-muted-foreground">
              {job.is_enabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <Select
              value={job.interval_minutes.toString()}
              onValueChange={(value) => onUpdate(job.id, { interval_minutes: parseInt(value) })}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRun(job)}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Now
          </Button>
        </div>

        {/* Last Run Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.last_run_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Last run: {formatDistanceToNow(new Date(job.last_run_at), { addSuffix: true })}
            </div>
          )}
          {job.next_scheduled_run && job.is_enabled && (
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              Next run: {formatDistanceToNow(new Date(job.next_scheduled_run), { addSuffix: true })}
            </div>
          )}
        </div>

        {/* Expandable Details */}
        {job.last_run_result && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 px-0">
                <ChevronDown className={cn("h-4 w-4 transition-transform", showDetails && "rotate-180")} />
                {showDetails ? "Hide" : "Show"} last run details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="rounded-md bg-muted p-3 text-sm">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(job.last_run_result, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

export function SchedulerManagement() {
  const { jobs, isLoading, error, updateJob, runJob, isUpdating, isRunning } = useScheduledJobs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Failed to load scheduled jobs: {error.message}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No scheduled jobs configured.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Jobs</h3>
          <p className="text-sm text-muted-foreground">
            Configure and manage background processing tasks
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <ScheduledJobCard
            key={job.id}
            job={job}
            onUpdate={(id, updates) => updateJob({ id, updates })}
            onRun={runJob}
            isUpdating={isUpdating}
            isRunning={isRunning}
          />
        ))}
      </div>
    </div>
  );
}
