import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch, Users, Briefcase, Calendar, Eye, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface RoleSegment {
  id: string;
  position_title: string;
  segment_start_date: string;
  segment_end_date: string;
  contribution_percentage: number;
}

interface PositionWeight {
  id: string;
  position_title: string;
  weight_percentage: number;
  is_primary: boolean;
}

interface ParticipantRoleQuickViewProps {
  participantId: string;
  hasRoleChange: boolean;
  hasMultiPosition: boolean;
  children: React.ReactNode;
}

export function ParticipantRoleQuickView({
  participantId,
  hasRoleChange,
  hasMultiPosition,
  children,
}: ParticipantRoleQuickViewProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleSegments, setRoleSegments] = useState<RoleSegment[]>([]);
  const [positionWeights, setPositionWeights] = useState<PositionWeight[]>([]);

  useEffect(() => {
    if (open && (hasRoleChange || hasMultiPosition)) {
      fetchData();
    }
  }, [open, participantId, hasRoleChange, hasMultiPosition]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (hasRoleChange) {
        const { data: segments } = await supabase
          .from("appraisal_role_segments")
          .select(`
            id,
            segment_start_date,
            segment_end_date,
            contribution_percentage,
            positions (title)
          `)
          .eq("participant_id", participantId)
          .order("segment_start_date", { ascending: true });

        setRoleSegments(
          (segments || []).map((s: any) => ({
            id: s.id,
            position_title: s.positions?.title || "Unknown",
            segment_start_date: s.segment_start_date,
            segment_end_date: s.segment_end_date,
            contribution_percentage: s.contribution_percentage,
          }))
        );
      }

      if (hasMultiPosition) {
        const { data: weights } = await supabase
          .from("appraisal_position_weights")
          .select(`
            id,
            weight_percentage,
            is_primary,
            positions (title)
          `)
          .eq("participant_id", participantId);

        setPositionWeights(
          (weights || []).map((w: any) => ({
            id: w.id,
            position_title: w.positions?.title || "Unknown",
            weight_percentage: w.weight_percentage,
            is_primary: w.is_primary,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching role data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRoleChange && !hasMultiPosition) {
    return <>{children}</>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              {hasRoleChange && <GitBranch className="h-4 w-4 text-info" />}
              {hasMultiPosition && <Users className="h-4 w-4 text-primary" />}
              {hasRoleChange ? "Role Changes" : "Multiple Positions"}
            </h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {hasRoleChange && roleSegments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                    {roleSegments.map((segment, idx) => (
                      <div
                        key={segment.id}
                        className="h-full"
                        style={{
                          width: `${segment.contribution_percentage}%`,
                          backgroundColor:
                            idx === 0
                              ? "hsl(var(--primary))"
                              : idx === 1
                              ? "hsl(var(--info))"
                              : "hsl(var(--warning))",
                        }}
                        title={`${segment.position_title}: ${segment.contribution_percentage}%`}
                      />
                    ))}
                  </div>

                  {roleSegments.map((segment, idx) => (
                    <div key={segment.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{segment.position_title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(segment.segment_start_date), "MMM d")} -{" "}
                          {format(parseISO(segment.segment_end_date), "MMM d")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {segment.contribution_percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasMultiPosition && positionWeights.length > 0 && (
                <div className="space-y-3">
                  {positionWeights.map((position) => (
                    <div key={position.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{position.position_title}</span>
                          {position.is_primary && (
                            <Badge variant="default" className="text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm font-medium">{position.weight_percentage}%</span>
                      </div>
                      <Progress value={position.weight_percentage} className="h-1.5" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <Separator />
          <p className="text-xs text-muted-foreground">
            {hasRoleChange
              ? "Scores are weighted by time spent in each role."
              : "Scores are weighted by position allocation."}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
