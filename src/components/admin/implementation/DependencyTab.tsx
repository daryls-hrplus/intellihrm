import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Network } from "lucide-react";

interface Dependency {
  module: string;
  dependsOn: string;
}

interface DependencyTabProps {
  dependencies: Dependency[];
}

export function DependencyTab({ dependencies }: DependencyTabProps) {
  // Group dependencies by the dependent module
  const groupedByDependent: Record<string, string[]> = {};
  dependencies.forEach(dep => {
    if (!groupedByDependent[dep.module]) {
      groupedByDependent[dep.module] = [];
    }
    groupedByDependent[dep.module].push(dep.dependsOn);
  });

  // Create a simplified dependency chain visualization
  const coreModules = ["Admin", "Workforce", "Compensation", "Payroll"];
  const supportModules = ["Leave", "Benefits", "Training", "Performance", "Succession"];
  const integrationModules = ["AI Assistant", "Billing", "International Payroll", "Mexico Core"];

  return (
    <div className="space-y-6">
      {/* Visual Dependency Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Implementation Flow
          </CardTitle>
          <CardDescription>
            Visual representation of module dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Core Flow */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
              <div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
                Admin & Security
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
                Workforce Core
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
                Compensation
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
                Payroll
              </div>
            </div>

            {/* Parallel Modules */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">After Workforce</p>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-1">Leave</Badge>
                  <Badge variant="secondary" className="w-full justify-center py-1">Benefits</Badge>
                  <Badge variant="secondary" className="w-full justify-center py-1">Training</Badge>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">After Training</p>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-1">Performance</Badge>
                  <Badge variant="secondary" className="w-full justify-center py-1">Succession</Badge>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">After Compensation</p>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-1">International</Badge>
                  <Badge variant="secondary" className="w-full justify-center py-1">Mexico Core</Badge>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Anytime</p>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-1">Recruitment</Badge>
                  <Badge variant="secondary" className="w-full justify-center py-1">H&S</Badge>
                  <Badge variant="secondary" className="w-full justify-center py-1">AI Assistant</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Dependencies Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Dependencies</CardTitle>
          <CardDescription>
            Understanding which modules depend on others helps plan implementation order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dependencies.map((dep, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Badge variant="secondary" className="shrink-0">{dep.module}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">{dep.dependsOn}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-primary">Start with Foundation</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Always complete Phase 1 (Admin & Security) first. All other modules depend on having companies, 
                departments, roles, and users configured.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <h4 className="font-medium text-amber-600">Parallel Implementation</h4>
              <p className="text-sm text-muted-foreground mt-1">
                After Phase 2 (Workforce), you can implement Leave, Benefits, and Training in parallel. 
                They don't depend on each other.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <h4 className="font-medium text-green-600">Auxiliary Modules</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Recruitment, Health & Safety, and Employee Relations can be implemented at any time 
                after Phase 2, based on business priority.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
