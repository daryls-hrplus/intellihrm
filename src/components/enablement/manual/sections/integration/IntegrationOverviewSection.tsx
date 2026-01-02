import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';
import { 
  GitBranch, Target, BookOpen, DollarSign, GraduationCap, Bell, 
  ArrowRight, CheckCircle2, Clock, AlertTriangle, Lightbulb, Info,
  Settings, Zap, Shield, Database
} from 'lucide-react';

export function IntegrationOverviewSection() {
  const integrationArchitectureDiagram = `
graph TB
    subgraph Trigger["Appraisal Finalization"]
        A[Appraisal Completed] --> B[Integration Orchestrator]
    end
    
    subgraph Evaluation["Rule Evaluation Engine"]
        B --> C{Evaluate Rules}
        C --> D[Check Conditions]
        D --> E{Approval Required?}
    end
    
    subgraph Execution["Action Execution"]
        E -->|No| F[Execute Immediately]
        E -->|Yes| G[Queue for Approval]
        G --> H[Manager/HR Approves]
        H --> F
    end
    
    subgraph Targets["Target Modules"]
        F --> I[Nine-Box]
        F --> J[Succession]
        F --> K[IDP/PIP]
        F --> L[Compensation]
        F --> M[Learning]
        F --> N[Notifications]
    end
    
    subgraph Logging["Audit & Logging"]
        I & J & K & L & M & N --> O[Integration Logs]
        O --> P[Audit Trail]
    end
  `;

  const fields = [
    { name: 'Rule Name', required: true, type: 'Text', description: 'Descriptive name for the integration rule', validation: 'Max 100 characters' },
    { name: 'Target Module', required: true, type: 'Select', description: 'Destination module for the integration action', defaultValue: 'nine_box' },
    { name: 'Condition Type', required: true, type: 'Select', description: 'How to evaluate if rule should trigger', defaultValue: 'category_match' },
    { name: 'Category Codes', required: false, type: 'Multi-select', description: 'Performance categories that trigger this rule' },
    { name: 'Score Range', required: false, type: 'Number Range', description: 'Min/max score range for score-based conditions' },
    { name: 'Action Type', required: true, type: 'Select', description: 'Specific action to execute in target module' },
    { name: 'Action Parameters', required: false, type: 'JSON', description: 'Additional parameters for the action' },
    { name: 'Requires Approval', required: true, type: 'Boolean', description: 'Whether action needs manager/HR approval', defaultValue: 'false' },
    { name: 'Execution Order', required: true, type: 'Number', description: 'Order in which rules are evaluated', defaultValue: '1' },
    { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether the rule is currently enabled', defaultValue: 'true' },
  ];

  const businessRules = [
    { rule: 'Rules execute in order by execution_order field', enforcement: 'System' as const, description: 'Lower numbers execute first, ensuring predictable behavior' },
    { rule: 'Only active rules are evaluated', enforcement: 'System' as const, description: 'Inactive rules are skipped during orchestration' },
    { rule: 'Approval-required actions are queued, not executed', enforcement: 'System' as const, description: 'Actions wait in pending state until approved' },
    { rule: 'Failed actions do not block subsequent rules', enforcement: 'System' as const, description: 'Each rule executes independently with its own error handling' },
    { rule: 'All actions are logged with full audit trail', enforcement: 'System' as const, description: 'Integration logs capture trigger, result, and any errors' },
    { rule: 'Category codes must match exactly', enforcement: 'System' as const, description: 'Partial matches are not supported for category conditions' },
    { rule: 'Score conditions use inclusive ranges', enforcement: 'System' as const, description: 'Both min and max values are included in the range' },
  ];

  const troubleshootingItems = [
    { issue: 'Integration not triggering', cause: 'Rule may be inactive or conditions not matching', solution: 'Verify rule is active and check that appraisal category/score matches condition criteria' },
    { issue: 'Action stuck in pending', cause: 'Requires approval but no approver assigned', solution: 'Check if requires_approval is true and ensure an approver reviews the pending action' },
    { issue: 'Target module not updated', cause: 'Action executed but target module has validation errors', solution: 'Review integration logs for detailed error messages from target module' },
    { issue: 'Wrong order of execution', cause: 'Execution order values may be identical', solution: 'Assign unique execution_order values to each rule to ensure predictable sequencing' },
    { issue: 'Duplicate actions created', cause: 'Rule triggered multiple times for same appraisal', solution: 'Integration orchestrator includes idempotency checks; review if appraisal was re-finalized' },
  ];

  return (
    <div className="space-y-8">
      {/* Section 7.1 Header */}
      <Card id="sec-7-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 7.1</Badge>
          </div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <GitBranch className="h-6 w-6" />
            Integration Overview
          </CardTitle>
          <CardDescription>
            How appraisal data flows to downstream modules through the Integration Orchestrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-7-1']} />

          {/* Learning Objectives */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand the Integration Orchestrator architecture and data flow</li>
                <li>Learn how integration rules are evaluated and executed</li>
                <li>Identify available target modules and their capabilities</li>
                <li>Configure approval workflows for sensitive actions</li>
                <li>Monitor integration health through logs and audit trails</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Prerequisites */}
          <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Prerequisites</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Active appraisal cycle with finalized participants</li>
                <li>Target modules (Nine-Box, Succession, etc.) configured</li>
                <li>Performance categories defined in cycle settings</li>
                <li>HR Admin or System Admin role for rule configuration</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Integration Architecture */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integration Architecture
            </h3>
            <p className="text-muted-foreground">
              The Integration Orchestrator is the central engine that connects appraisal outcomes to downstream 
              HR modules. When an appraisal is finalized, the orchestrator evaluates configured rules and 
              executes appropriate actions in target modules.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Real-Time Execution</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Actions execute immediately upon appraisal finalization when approval is not required
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Approval Workflow</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sensitive actions can require manager or HR approval before execution
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Full Audit Trail</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Every action is logged with timestamps, results, and error details for compliance
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Target Modules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Target Modules</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: Target, label: 'Nine-Box', desc: 'Update performance/potential grid positions' },
                { icon: Target, label: 'Succession', desc: 'Update candidate readiness levels' },
                { icon: BookOpen, label: 'IDP/PIP', desc: 'Auto-create development plans' },
                { icon: DollarSign, label: 'Compensation', desc: 'Flag for merit review actions' },
                { icon: GraduationCap, label: 'Learning', desc: 'Recommend skill development' },
                { icon: Bell, label: 'Notifications', desc: 'Trigger automated alerts' },
              ].map((mod) => (
                <Card key={mod.label} className="border-dashed">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <mod.icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{mod.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Workflow Diagram */}
          <WorkflowDiagram 
            title="Integration Orchestrator Flow"
            description="Complete data flow from appraisal finalization through target module updates"
            diagram={integrationArchitectureDiagram}
          />

          {/* Field Reference */}
          <FieldReferenceTable 
            fields={fields} 
            title="Integration Rule Configuration Fields"
          />

          {/* Business Rules */}
          <BusinessRules 
            rules={businessRules}
            title="Integration Execution Rules"
          />

          {/* Troubleshooting */}
          <TroubleshootingSection 
            items={troubleshootingItems}
            title="Common Integration Issues"
          />

          {/* Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Best Practices</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Start with approval-required rules to validate behavior before enabling auto-execution</li>
                <li>Use descriptive rule names that indicate the trigger condition and target action</li>
                <li>Monitor integration logs regularly during initial deployment</li>
                <li>Test rules with a small pilot group before organization-wide rollout</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Future Enhancements */}
          <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">Future Enhancements</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <p className="mb-2">Planned enhancements to the integration framework:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Integration Health Dashboard with success/failure metrics</li>
                <li>Rollback capability for erroneous integration actions</li>
                <li>Pre-built integration rule templates for common scenarios</li>
                <li>Batch processing mode for high-volume appraisal cycles</li>
                <li>Integration simulation/dry-run mode for testing</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
