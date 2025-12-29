import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Calendar, TrendingUp } from "lucide-react";
import { RoleSegment } from "@/hooks/useAppraisalRoleSegments";
import { format, parseISO } from "date-fns";

interface RoleSegmentTimelineProps {
  segments: RoleSegment[];
  activeSegmentId?: string;
  onSegmentClick?: (segmentId: string) => void;
}

export function RoleSegmentTimeline({ 
  segments, 
  activeSegmentId,
  onSegmentClick 
}: RoleSegmentTimelineProps) {
  if (segments.length <= 1) {
    return null; // Don't show timeline for single role
  }

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Role Changes During Review Period
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
          {segments.map((segment, idx) => (
            <div
              key={segment.id}
              className={`h-full cursor-pointer transition-opacity ${
                activeSegmentId === segment.id ? 'opacity-100' : 'opacity-70'
              }`}
              style={{
                width: `${segment.contribution_percentage}%`,
                backgroundColor: idx === 0 ? 'hsl(var(--primary))' : 
                  idx === 1 ? 'hsl(var(--info))' : 'hsl(var(--warning))'
              }}
              onClick={() => onSegmentClick?.(segment.id)}
              title={`${segment.position_title}: ${segment.contribution_percentage}%`}
            />
          ))}
        </div>

        <div className="grid gap-2">
          {segments.map((segment, idx) => (
            <div
              key={segment.id}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                activeSegmentId === segment.id 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => onSegmentClick?.(segment.id)}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{segment.position_title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(segment.segment_start_date), 'MMM d')} - {format(parseISO(segment.segment_end_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <Badge variant={idx === segments.length - 1 ? "default" : "secondary"}>
                {segment.contribution_percentage}% weight
              </Badge>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Scores will be weighted by time spent in each role
        </p>
      </CardContent>
    </Card>
  );
}
