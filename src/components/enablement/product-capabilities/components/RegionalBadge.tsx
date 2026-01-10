import { Globe, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Region = "Caribbean" | "Africa" | "Global" | "Jamaica" | "Trinidad" | "Ghana" | "Nigeria" | "LatAm" | "Dominican Republic" | "Mexico" | "Colombia" | "Panama";

interface RegionalBadgeProps {
  regions: Region[];
  children?: React.ReactNode;
  compact?: boolean;
}

const REGION_CONFIG: Record<Region, { color: string; bgColor: string }> = {
  Caribbean: { color: "text-cyan-600", bgColor: "bg-cyan-500/10 border-cyan-500/20" },
  Jamaica: { color: "text-cyan-600", bgColor: "bg-cyan-500/10 border-cyan-500/20" },
  Trinidad: { color: "text-cyan-600", bgColor: "bg-cyan-500/10 border-cyan-500/20" },
  Africa: { color: "text-amber-600", bgColor: "bg-amber-500/10 border-amber-500/20" },
  Ghana: { color: "text-amber-600", bgColor: "bg-amber-500/10 border-amber-500/20" },
  Nigeria: { color: "text-amber-600", bgColor: "bg-amber-500/10 border-amber-500/20" },
  Global: { color: "text-emerald-600", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  LatAm: { color: "text-purple-600", bgColor: "bg-purple-500/10 border-purple-500/20" },
  "Dominican Republic": { color: "text-purple-600", bgColor: "bg-purple-500/10 border-purple-500/20" },
  Mexico: { color: "text-purple-600", bgColor: "bg-purple-500/10 border-purple-500/20" },
  Colombia: { color: "text-purple-600", bgColor: "bg-purple-500/10 border-purple-500/20" },
  Panama: { color: "text-purple-600", bgColor: "bg-purple-500/10 border-purple-500/20" },
};

export function RegionalBadge({ regions, children, compact }: RegionalBadgeProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {regions.map((region) => {
          const config = REGION_CONFIG[region];
          return (
            <Badge
              key={region}
              variant="outline"
              className={cn("text-xs", config.bgColor, config.color)}
            >
              <MapPin className="h-3 w-3 mr-1" />
              {region}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-600">Regional Compliance</span>
        <div className="flex gap-1 ml-auto">
          {regions.map((region) => {
            const config = REGION_CONFIG[region];
            return (
              <Badge
                key={region}
                variant="outline"
                className={cn("text-xs", config.bgColor, config.color)}
              >
                {region}
              </Badge>
            );
          })}
        </div>
      </div>
      {children && <p className="text-sm text-muted-foreground">{children}</p>}
    </div>
  );
}
