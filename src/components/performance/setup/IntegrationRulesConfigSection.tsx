import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationRulesConfigPanel } from "@/components/performance/IntegrationRulesConfigPanel";
import { GitBranch } from "lucide-react";

interface IntegrationRulesConfigSectionProps {
  companyId: string;
}

export function IntegrationRulesConfigSection({ companyId }: IntegrationRulesConfigSectionProps) {
  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5" />
            Appraisal Integration Rules
          </CardTitle>
          <CardDescription>
            Configure automated actions triggered by appraisal outcomes. Rules execute in order when an appraisal is finalized.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <IntegrationRulesConfigPanel companyId={companyId} />
    </div>
  );
}
