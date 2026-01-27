import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  FUNCTIONAL_AREAS, 
  type FunctionalArea,
  getFilteredManualCount,
} from "@/constants/manualsStructure";

interface FunctionalAreaFilterProps {
  activeFilter: FunctionalArea | "all";
  onFilterChange: (filter: FunctionalArea | "all") => void;
}

export function FunctionalAreaFilter({ 
  activeFilter, 
  onFilterChange 
}: FunctionalAreaFilterProps) {
  const areas = Object.entries(FUNCTIONAL_AREAS) as [FunctionalArea, typeof FUNCTIONAL_AREAS[FunctionalArea]][];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Filter by:
      </span>
      <Button
        variant={activeFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        className="h-8"
      >
        All
        <Badge 
          variant="secondary" 
          className={cn(
            "ml-2 h-5 px-1.5 text-xs",
            activeFilter === "all" && "bg-primary-foreground/20 text-primary-foreground"
          )}
        >
          10
        </Badge>
      </Button>
      
      {areas.map(([key, config]) => {
        const count = getFilteredManualCount(key);
        const isActive = activeFilter === key;
        
        return (
          <Button
            key={key}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(key)}
            className={cn(
              "h-8",
              !isActive && config.badgeClass.replace("bg-", "hover:bg-").split(" ")[0]
            )}
          >
            {config.label}
            <Badge 
              variant="secondary" 
              className={cn(
                "ml-2 h-5 px-1.5 text-xs",
                isActive 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : config.badgeClass
              )}
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
