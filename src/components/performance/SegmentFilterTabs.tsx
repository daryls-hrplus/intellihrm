import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleSegment } from "@/hooks/useAppraisalRoleSegments";
import { Filter, X } from "lucide-react";

interface SegmentFilterTabsProps {
  segments: RoleSegment[];
  selectedSegmentId: string | null;
  onSegmentChange: (segmentId: string | null) => void;
}

export function SegmentFilterTabs({
  segments,
  selectedSegmentId,
  onSegmentChange,
}: SegmentFilterTabsProps) {
  if (segments.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap p-2 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Filter className="h-3 w-3" />
        <span>Filter by role:</span>
      </div>
      
      <Button
        variant={selectedSegmentId === null ? "default" : "outline"}
        size="sm"
        className="h-7 text-xs"
        onClick={() => onSegmentChange(null)}
      >
        All Roles
      </Button>
      
      {segments.map((segment) => (
        <Button
          key={segment.id}
          variant={selectedSegmentId === segment.id ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => onSegmentChange(segment.id)}
        >
          {segment.position_title}
          <Badge variant="secondary" className="text-[10px] px-1 h-4">
            {segment.contribution_percentage}%
          </Badge>
        </Button>
      ))}
      
      {selectedSegmentId && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => onSegmentChange(null)}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
