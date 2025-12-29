import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PositionWeight } from "@/hooks/useMultiPositionParticipant";
import { Filter, X, Briefcase } from "lucide-react";

interface PositionFilterTabsProps {
  positions: PositionWeight[];
  selectedPositionId: string | null;
  onPositionChange: (positionId: string | null) => void;
}

export function PositionFilterTabs({
  positions,
  selectedPositionId,
  onPositionChange,
}: PositionFilterTabsProps) {
  if (positions.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap p-2 bg-accent/30 rounded-lg border border-accent/50">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Briefcase className="h-3 w-3" />
        <span>Filter by position:</span>
      </div>
      
      <Button
        variant={selectedPositionId === null ? "default" : "outline"}
        size="sm"
        className="h-7 text-xs"
        onClick={() => onPositionChange(null)}
      >
        All Positions
      </Button>
      
      {positions.map((position) => (
        <Button
          key={position.position_id}
          variant={selectedPositionId === position.position_id ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => onPositionChange(position.position_id)}
        >
          {position.position_title}
          {position.is_primary && (
            <Badge variant="secondary" className="text-[10px] px-1 h-4 bg-primary/20">
              Primary
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1 h-4">
            {position.weight_percentage}%
          </Badge>
        </Button>
      ))}
      
      {selectedPositionId && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => onPositionChange(null)}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
