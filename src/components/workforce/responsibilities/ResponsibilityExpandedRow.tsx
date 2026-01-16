import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, ExternalLink, Target, AlertCircle } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { NavLink } from "react-router-dom";

interface JobLink {
  id: string;
  job_id: string;
  job_name: string;
  job_code: string;
  weighting: number;
  start_date: string;
  end_date: string | null;
}

interface ResponsibilityExpandedRowProps {
  linkedJobs: JobLink[];
  kras: string[];
  onManageJobs: () => void;
}

export function ResponsibilityExpandedRow({
  linkedJobs,
  kras,
  onManageJobs,
}: ResponsibilityExpandedRowProps) {
  return (
    <div className="px-4 py-3 bg-muted/30 border-t space-y-4">
      {/* Jobs Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Jobs Using This Responsibility
          </h4>
          <Button variant="ghost" size="sm" onClick={onManageJobs}>
            Manage Jobs
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {linkedJobs.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <AlertCircle className="h-4 w-4" />
            <span>Not assigned to any job yet</span>
            <Button variant="link" size="sm" className="h-auto p-0" onClick={onManageJobs}>
              Click to assign
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {linkedJobs.slice(0, 8).map((job) => (
              <NavLink
                key={job.id}
                to={`/workforce/jobs?highlight=${job.job_id}`}
                className="group"
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <span className="font-medium">{job.job_name}</span>
                  <span className="mx-1 text-muted-foreground">•</span>
                  <span className="text-primary">{job.weighting}%</span>
                </Badge>
              </NavLink>
            ))}
            {linkedJobs.length > 8 && (
              <Badge variant="secondary" className="cursor-pointer" onClick={onManageJobs}>
                +{linkedJobs.length - 8} more
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* KRAs Section */}
      {kras.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Key Result Areas ({kras.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {kras.slice(0, 6).map((kra, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-2 rounded-md"
              >
                <span className="text-primary font-medium shrink-0">
                  {index + 1}.
                </span>
                <span className="line-clamp-2">{kra}</span>
              </div>
            ))}
          </div>
          {kras.length > 6 && (
            <p className="text-xs text-muted-foreground">
              +{kras.length - 6} more KRAs
            </p>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex items-center gap-6 pt-2 border-t text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total Jobs:</span>
          <Badge variant={linkedJobs.length > 0 ? "default" : "secondary"}>
            {linkedJobs.length}
          </Badge>
        </div>
        {linkedJobs.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Avg Weight:</span>
            <Badge variant="outline">
              {Math.round(
                linkedJobs.reduce((sum, j) => sum + j.weighting, 0) /
                  linkedJobs.length
              )}
              %
            </Badge>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">KRAs:</span>
          <Badge variant="outline">{kras.length}</Badge>
        </div>
      </div>
    </div>
  );
}
