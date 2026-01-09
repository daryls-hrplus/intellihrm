import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCapabilityCardProps {
  icon: LucideIcon;
  title: string;
  tagline: string;
  overview: string;
  accentColor?: string;
  badge?: string;
  children?: React.ReactNode;
  id?: string;
}

export function ModuleCapabilityCard({
  icon: Icon,
  title,
  tagline,
  overview,
  accentColor = "bg-primary/10 text-primary",
  badge,
  children,
  id,
}: ModuleCapabilityCardProps) {
  return (
    <Card className="border-border/50 hover:border-border transition-colors" id={id}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl", accentColor)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-xl font-semibold">{title}</CardTitle>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-primary">{tagline}</p>
            <p className="text-sm text-muted-foreground mt-1">{overview}</p>
          </div>
        </div>
      </CardHeader>
      {children && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
