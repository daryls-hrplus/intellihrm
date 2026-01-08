import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, Settings, Users, UserPlus, Star,
  Shield, ClipboardCheck, Gauge, ArrowUp
} from 'lucide-react';
import {
  ConfigurationIssues,
  EmployeeDataProblems,
  LifecycleWorkflowIssues,
  BestPracticesGuide,
  SecurityAccessControl,
  ComplianceAuditChecklist,
  PerformanceOptimization,
  EscalationProcedures
} from './sections/troubleshooting';

export function WorkforceManualTroubleshootingSection() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-part-10">
      {/* Part Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">Part 10: Troubleshooting & Best Practices</CardTitle>
              <p className="text-muted-foreground mt-1">
                Comprehensive troubleshooting guides, industry best practices, and escalation procedures 
                for workforce module administration
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">HR Admin</Badge>
            <Badge variant="secondary">HR Ops</Badge>
            <Badge variant="secondary">Compliance</Badge>
            <Badge variant="outline">Est. 95 min total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Configuration</h4>
                <p className="text-xs text-muted-foreground">Hierarchy, positions, lookups</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Data Quality</h4>
                <p className="text-xs text-muted-foreground">Duplicates, missing data, sync</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Security</h4>
                <p className="text-xs text-muted-foreground">Access control, PII, compliance</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <ArrowUp className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Escalation</h4>
                <p className="text-xs text-muted-foreground">Support tiers, SLAs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 10.1: Configuration Issues */}
      <div data-manual-anchor="wf-sec-10-1">
        <ConfigurationIssues />
      </div>

      {/* Section 10.2: Employee Data Problems */}
      <div data-manual-anchor="wf-sec-10-2">
        <EmployeeDataProblems />
      </div>

      {/* Section 10.3: Lifecycle Workflow Issues */}
      <div data-manual-anchor="wf-sec-10-3">
        <LifecycleWorkflowIssues />
      </div>

      {/* Section 10.4: Best Practices Guide */}
      <div data-manual-anchor="wf-sec-10-4">
        <BestPracticesGuide />
      </div>

      {/* Section 10.5: Security & Access Control */}
      <div data-manual-anchor="wf-sec-10-5">
        <SecurityAccessControl />
      </div>

      {/* Section 10.6: Compliance & Audit Checklist */}
      <div data-manual-anchor="wf-sec-10-6">
        <ComplianceAuditChecklist />
      </div>

      {/* Section 10.7: Performance Optimization */}
      <div data-manual-anchor="wf-sec-10-7">
        <PerformanceOptimization />
      </div>

      {/* Section 10.8: Escalation Procedures */}
      <div data-manual-anchor="wf-sec-10-8">
        <EscalationProcedures />
      </div>
    </div>
  );
}
