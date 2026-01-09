import { Globe, MapPin, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Region = "Caribbean" | "Africa" | "Global" | "LatAm";

interface RegionalAdvantageProps {
  regions: Region[];
  advantages: string[];
  className?: string;
}

const REGION_CONFIG: Record<Region, { color: string; bgColor: string }> = {
  Caribbean: { color: "text-cyan-600", bgColor: "bg-cyan-500/10 border-cyan-500/20" },
  Africa: { color: "text-amber-600", bgColor: "bg-amber-500/10 border-amber-500/20" },
  LatAm: { color: "text-violet-600", bgColor: "bg-violet-500/10 border-violet-500/20" },
  Global: { color: "text-emerald-600", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
};

export function RegionalAdvantage({ regions, advantages, className }: RegionalAdvantageProps) {
  return (
    <div className={cn("rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10">
            <Globe className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
            Regional Advantage
          </span>
        </div>
        <div className="flex gap-1.5">
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
      </div>
      
      <div className="grid md:grid-cols-2 gap-2">
        {advantages.map((advantage, index) => (
          <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>{advantage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
