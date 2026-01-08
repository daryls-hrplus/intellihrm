import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, Users } from 'lucide-react';
import {
  ESSApprovalPoliciesSetup,
  SOPManagementSetup,
  TransactionWorkflowSettingsSetup,
  WorkflowTemplatesSetup,
  ApprovalDelegationsSetup,
  ComplianceTrackerSetup,
  IntegrationHubSetup
} from './sections/compliance';

export function HRHubManualComplianceSection() {
  return (
    <div className="space-y-8" data-manual-anchor="hh-part-3">
      {/* Chapter Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50/50 to-background dark:from-purple-950/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-purple-600 border-purple-300">Chapter 3</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  65 min read
                </Badge>
              </div>
              <CardTitle className="text-2xl">Compliance & Workflows</CardTitle>
              <p className="text-muted-foreground mt-1">
                Governance policies, approval workflows, and compliance management configuration
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              HR Administrator
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              Compliance Officer
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              System Administrator
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This chapter covers the governance framework that controls how changes are approved and 
            compliance is tracked. Complete these sections after Organization Configuration (Chapter 2) 
            to establish the approval and compliance rules that other modules will reference.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border-l-4 border-purple-500">
            <p className="text-sm font-medium">Configuration Order</p>
            <p className="text-xs text-muted-foreground mt-1">
              For best results, configure in this order: Workflow Templates → Transaction Workflow Settings → Approval Delegations → ESS Approval Policies → Compliance Tracker
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3.1: Workflow Templates */}
      <WorkflowTemplatesSetup />

      {/* Section 3.2: Transaction Workflow Settings */}
      <TransactionWorkflowSettingsSetup />

      {/* Section 3.3: Approval Delegations */}
      <ApprovalDelegationsSetup />

      {/* Section 3.4: SOP Management */}
      <SOPManagementSetup />

      {/* Section 3.5: ESS Approval Policies */}
      <ESSApprovalPoliciesSetup />

      {/* Section 3.6: Compliance Tracker */}
      <ComplianceTrackerSetup />

      {/* Section 3.7: Integration Hub */}
      <IntegrationHubSetup />
    </div>
  );
}
