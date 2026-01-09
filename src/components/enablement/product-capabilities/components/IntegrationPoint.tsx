import { ArrowRight, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IntegrationPointProps {
  module: string;
  children: React.ReactNode;
  bidirectional?: boolean;
}

export function IntegrationPoint({ module, children, bidirectional }: IntegrationPointProps) {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      {bidirectional ? (
        <Link2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
      ) : (
        <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
      )}
      <span>
        <Badge variant="outline" className="text-xs mr-1 px-1.5 py-0">
          {module}
        </Badge>
        {children}
      </span>
    </div>
  );
}

interface ModuleIntegrationsProps {
  integrations: { module: string; description: string; bidirectional?: boolean }[];
}

export function ModuleIntegrations({ integrations }: ModuleIntegrationsProps) {
  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium text-blue-600">Cross-Module Integration</span>
      </div>
      <div className="space-y-1">
        {integrations.map((integration, index) => (
          <IntegrationPoint
            key={index}
            module={integration.module}
            bidirectional={integration.bidirectional}
          >
            {integration.description}
          </IntegrationPoint>
        ))}
      </div>
    </div>
  );
}
