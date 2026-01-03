import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Users, TrendingUp } from "lucide-react";

interface ExperienceMetrics {
  experience_id: string;
  experience_name: string;
  experience_code: string;
  total_views: number;
  unique_sessions: number;
  avg_completion_rate: number;
  avg_time_spent: number;
  lead_conversion_rate: number;
}

interface ExperienceMetricsCardProps {
  metrics: ExperienceMetrics[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function ExperienceMetricsCard({ metrics }: ExperienceMetricsCardProps) {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Experience Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No experience data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Experience Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((exp) => (
            <Card key={exp.experience_id} className="border-muted">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{exp.experience_name}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {exp.experience_code}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exp.total_views}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exp.unique_sessions}</p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDuration(exp.avg_time_spent)}</p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exp.lead_conversion_rate}%</p>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">{exp.avg_completion_rate}%</span>
                  </div>
                  <Progress value={exp.avg_completion_rate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
