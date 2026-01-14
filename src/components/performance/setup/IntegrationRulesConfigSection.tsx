import { UnifiedAppraisalRulesManager } from "./UnifiedAppraisalRulesManager";

interface IntegrationRulesConfigSectionProps {
  companyId: string;
}

export function IntegrationRulesConfigSection({ companyId }: IntegrationRulesConfigSectionProps) {
  return <UnifiedAppraisalRulesManager companyId={companyId} />;
}
