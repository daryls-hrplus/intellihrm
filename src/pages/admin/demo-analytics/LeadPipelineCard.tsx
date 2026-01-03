import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, ThermometerSun, Snowflake, Star } from "lucide-react";

interface LeadPipelineProps {
  qualified: number;
  hot: number;
  warm: number;
  cold: number;
}

export function LeadPipelineCard({ qualified, hot, warm, cold }: LeadPipelineProps) {
  const total = qualified + hot + warm + cold;
  
  const segments = [
    {
      label: "Qualified",
      count: qualified,
      icon: Star,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      label: "Hot",
      count: hot,
      icon: Flame,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Warm",
      count: warm,
      icon: ThermometerSun,
      color: "bg-amber-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      label: "Cold",
      count: cold,
      icon: Snowflake,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lead Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {segments.map((segment) => {
          const percentage = total > 0 ? (segment.count / total) * 100 : 0;
          const Icon = segment.icon;
          
          return (
            <div key={segment.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${segment.bgColor} ${segment.textColor} border-0`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {segment.label}
                  </Badge>
                </div>
                <span className="text-sm font-medium">{segment.count}</span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                // @ts-ignore - custom indicator color
                indicatorClassName={segment.color}
              />
            </div>
          );
        })}
        
        {total === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No leads scored yet. Click "Compute Scores" to calculate lead scores.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
