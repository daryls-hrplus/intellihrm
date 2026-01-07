import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ModuleCoverage, 
  getCoverageBadgeVariant, 
  getCoverageStatusLabel,
  getCoverageColor 
} from "@/utils/auditCoverageUtils";
import { formatDistanceToNow } from "date-fns";
import { 
  Building2, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  GraduationCap,
  Target,
  Heart,
  Shield,
  Briefcase,
  HardHat,
  FileText,
  BarChart,
  UserCog,
  Layers,
  Package
} from "lucide-react";

interface ModuleCoverageGridProps {
  moduleCoverages: ModuleCoverage[];
  isLoading?: boolean;
}

const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Admin': Shield,
  'Workforce': Users,
  'Payroll': DollarSign,
  'Compensation': DollarSign,
  'Benefits': Heart,
  'Leave': Calendar,
  'Time & Attendance': Clock,
  'Performance': Target,
  'Recruitment': Briefcase,
  'Training': GraduationCap,
  'Succession': Layers,
  'HSE': HardHat,
  'Employee Relations': Users,
  'Property': Package,
  'ESS': UserCog,
  'MSS': UserCog,
  'Documents': FileText,
  'Reporting': BarChart,
  'Profile': Users,
  'Security': Shield,
  'System': Building2,
};

export function ModuleCoverageGrid({ moduleCoverages, isLoading }: ModuleCoverageGridProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Module Coverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {moduleCoverages.map((module, index) => {
            const Icon = moduleIcons[module.module] || Layers;
            const coverageColor = getCoverageColor(module.coverage);
            
            return (
              <div
                key={module.module}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      module.coverage >= 90 
                        ? 'bg-success/10' 
                        : module.coverage >= 50 
                          ? 'bg-warning/10' 
                          : module.coverage > 0 
                            ? 'bg-muted' 
                            : 'bg-destructive/10'
                    }`}>
                      <Icon className={`h-4 w-4 ${coverageColor}`} />
                    </div>
                    <span className="font-medium text-sm truncate max-w-[120px]">
                      {module.module}
                    </span>
                  </div>
                  <Badge variant={getCoverageBadgeVariant(module.coverage)} className="text-xs">
                    {getCoverageStatusLabel(module.coverage)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-2xl font-bold ${coverageColor}`}>
                      {module.coverage}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {module.coveredEntityTypes.length}/{module.expectedEntityTypes.length}
                    </span>
                  </div>
                  
                  <Progress value={module.coverage} className="h-1.5" />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{module.totalLogs.toLocaleString()} logs</span>
                    {module.lastActivity && (
                      <span title={new Date(module.lastActivity).toLocaleString()}>
                        {formatDistanceToNow(new Date(module.lastActivity), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
