import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, AlertTriangle, CheckCircle, XCircle, RefreshCw, Clock, Search, FileText, ArrowRight, Database, MessageSquare } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StepByStep } from '../../components/StepByStep';

// Note: The system currently uses descriptive error messages rather than formal error codes.
// These are the actual error patterns observed in edge function logs.
const ACTUAL_ERROR_PATTERNS = [
  {
    pattern: 'Participant not found or has no score data',
    context: 'appraisal-integration-orchestrator',
    severity: 'high',
    cause: 'Participant ID is invalid or appraisal scores not yet submitted',
    resolution: [
      'Verify the participant exists in appraisal_participants table',
      'Ensure appraisal has been submitted with scores',
      'Check participant status is not "draft"'
    ],
    prevention: 'Only trigger integrations after appraisal finalization'
  },
  {
    pattern: 'Error fetching rules',
    context: 'appraisal-integration-orchestrator',
    severity: 'medium',
    cause: 'Database connection issue or RLS policy blocking access',
    resolution: [
      'Check database connectivity',
      'Verify integration rules exist for the company',
      'Review RLS policies on appraisal_integration_rules table'
    ],
    prevention: 'Ensure rules are configured before cycle activation'
  },
  {
    pattern: 'Unknown target module',
    context: 'appraisal-integration-orchestrator',
    severity: 'high',
    cause: 'Rule configured with unsupported target_module value',
    resolution: [
      'Review the rule configuration',
      'Use only supported modules: nine_box, succession, idp, pip, compensation, workforce_analytics, notifications, reminders'
    ],
    prevention: 'Validate rule configuration during setup'
  },
  {
    pattern: 'Action execution failed',
    context: 'appraisal-integration-orchestrator',
    severity: 'medium',
    cause: 'Target module action encountered an error (e.g., missing required data)',
    resolution: [
      'Check integration log action_result field for details',
      'Verify target module is enabled and configured',
      'Review error_message for specific cause'
    ],
    prevention: 'Test integration rules with sample data before go-live'
  },
  {
    pattern: 'LOVABLE_API_KEY is not configured',
    context: 'appraisal-feedback-assistant',
    severity: 'critical',
    cause: 'AI features require API key that is not set',
    resolution: [
      'Contact system administrator to configure the API key',
      'Verify environment variables are properly set'
    ],
    prevention: 'Verify AI configuration during initial setup'
  },
  {
    pattern: 'Failed to fetch calibration session',
    context: 'calibration-ai-analyzer',
    severity: 'high',
    cause: 'Session ID invalid or user lacks access',
    resolution: [
      'Verify session exists in calibration_sessions table',
      'Check user has calibrator role for the session'
    ],
    prevention: 'Validate session access before triggering analysis'
  }
];

const LOG_FIELDS_EXPLANATION = [
  {
    field: 'action_result',
    values: ['success', 'failed', 'pending_approval'],
    description: 'Outcome of the integration action'
  },
  {
    field: 'error_message',
    values: ['String or null'],
    description: 'Human-readable error description when action_result is failed'
  },
  {
    field: 'trigger_event',
    values: ['appraisal_finalized', 'score_threshold', 'category_assigned'],
    description: 'Event that triggered the integration rule'
  },
  {
    field: 'target_module',
    values: ['nine_box', 'succession', 'idp', 'pip', 'compensation', 'workforce_analytics', 'notifications', 'reminders'],
    description: 'Downstream module receiving the action'
  },
  {
    field: 'target_record_id',
    values: ['UUID or null'],
    description: 'ID of created/updated record in target module'
  },
  {
    field: 'requires_approval',
    values: ['true', 'false'],
    description: 'Whether the action required manual approval before execution'
  },
  {
    field: 'executed_at',
    values: ['ISO timestamp or null'],
    description: 'When the action was executed (null if pending or failed)'
  }
];

const INTEGRATION_FAILURE_TYPES = [
  {
    module: 'Nine-Box Grid',
    commonFailures: [
      'Missing potential assessment (only performance score provided)',
      'Invalid box coordinates outside 3x3 grid',
      'Conflicting manual placement exists'
    ],
    quickFix: 'Ensure both performance and potential dimensions are evaluated'
  },
  {
    module: 'Succession Planning',
    commonFailures: [
      'Target position not found in succession pool',
      'Employee already nominated for position',
      'Readiness level mapping not configured'
    ],
    quickFix: 'Verify succession pool setup and readiness configuration'
  },
  {
    module: 'IDP/PIP Creation',
    commonFailures: [
      'Template not assigned for development plan type',
      'Maximum active plans limit reached',
      'Manager assignment missing for employee'
    ],
    quickFix: 'Configure IDP/PIP templates and verify plan limits'
  },
  {
    module: 'Compensation',
    commonFailures: [
      'No active compensation cycle for employee',
      'Merit matrix not configured for rating',
      'Budget allocation exceeded'
    ],
    quickFix: 'Align appraisal cycle with compensation planning cycle'
  },
  {
    module: 'Learning (LMS)',
    commonFailures: [
      'Course catalog not synced',
      'Skill-to-course mapping not defined',
      'LMS API authentication expired'
    ],
    quickFix: 'Refresh LMS integration credentials and sync catalog'
  },
  {
    module: 'Notifications',
    commonFailures: [
      'Email template not found',
      'Recipient email address invalid',
      'Notification quota exceeded'
    ],
    quickFix: 'Verify notification templates and recipient data'
  }
];

const RETRY_STEPS = [
  {
    title: 'Identify the Failed Integration',
    description: 'Navigate to the Integration Dashboard and filter by status = "failed"',
    substeps: [
      'Go to Performance > Intelligence Hub > Integrations',
      'Apply filter: Status = Failed',
      'Sort by triggered_at descending to see most recent'
    ],
    expectedResult: 'List of failed integrations with error codes visible'
  },
  {
    title: 'Review Error Details',
    description: 'Click on the failed integration to view detailed error information',
    substeps: [
      'Click on the integration row to expand details',
      'Read the error_message field for specific cause',
      'Check action_result JSON for additional context',
      'Note the error code (e.g., INT-003)'
    ],
    expectedResult: 'Understanding of why the integration failed'
  },
  {
    title: 'Resolve Root Cause',
    description: 'Address the underlying issue before retrying',
    substeps: [
      'Refer to Error Code Reference table for resolution steps',
      'Make necessary corrections (enable module, fix data, etc.)',
      'Verify the fix is in place'
    ],
    expectedResult: 'Root cause addressed and ready for retry'
  },
  {
    title: 'Retry the Integration',
    description: 'Use the retry action to re-execute the integration',
    substeps: [
      'Click the "Retry" button on the failed integration',
      'Confirm the retry action in the dialog',
      'Wait for execution (may take 30-60 seconds)',
      'Refresh the page to see updated status'
    ],
    expectedResult: 'Integration status changes to success or shows new error'
  },
  {
    title: 'Verify Success',
    description: 'Confirm the downstream action completed correctly',
    substeps: [
      'Navigate to the target module (Nine-Box, IDP, etc.)',
      'Locate the affected employee record',
      'Verify the expected change was applied',
      'Check integration log status is now "success"'
    ],
    expectedResult: 'Target module reflects the integration action'
  }
];

const ESCALATION_DIAGRAM = `graph TD
    A[Integration Failed] --> B{Error Type?}
    
    B -->|Configuration| C[Check Settings]
    B -->|Data| D[Review Source Data]
    B -->|External System| E[Contact External Team]
    B -->|Unknown| F[Escalate to Support]
    
    C --> G{Resolved?}
    D --> G
    E --> G
    
    G -->|Yes| H[Retry Integration]
    G -->|No - Config| I[Escalate to Admin]
    G -->|No - Data| J[Escalate to HR]
    G -->|No - External| K[Escalate to IT]
    
    H --> L{Success?}
    L -->|Yes| M[Close Issue]
    L -->|No| F
    
    I --> N[Admin Reviews]
    J --> O[HR Corrects Data]
    K --> P[IT Investigates]
    
    N --> H
    O --> H
    P --> H
    F --> Q[Vendor Support Ticket]`;

export function IntegrationTroubleshootingSection() {
  return (
    <div className="space-y-8">
      <Card id="sec-8-5">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.5</Badge>
            <Badge variant="secondary">Troubleshooting</Badge>
          </div>
          <CardTitle className="text-2xl">Integration Troubleshooting Guide</CardTitle>
          <CardDescription>
            Comprehensive guide for diagnosing and resolving integration failures between Appraisals and downstream modules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-8-5']} />

          {/* Integration Overview - Actual Implementation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold">8</div>
              <div className="text-xs text-muted-foreground">Target Modules</div>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
              <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <div className="text-lg font-bold">3</div>
              <div className="text-xs text-muted-foreground">Trigger Events</div>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
              <RefreshCw className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold">Manual</div>
              <div className="text-xs text-muted-foreground">Retry Available</div>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <Database className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold">Logged</div>
              <div className="text-xs text-muted-foreground">All Executions</div>
            </div>
          </div>

          <Tabs defaultValue="error-codes" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="error-codes" className="text-xs">Error Codes</TabsTrigger>
              <TabsTrigger value="log-interpretation" className="text-xs">Log Reading</TabsTrigger>
              <TabsTrigger value="by-module" className="text-xs">By Module</TabsTrigger>
              <TabsTrigger value="retry-procedure" className="text-xs">Retry Steps</TabsTrigger>
              <TabsTrigger value="escalation" className="text-xs">Escalation</TabsTrigger>
            </TabsList>

            <TabsContent value="error-codes" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Error Pattern Reference</h3>
              </div>
              
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                <strong>Note:</strong> The system uses descriptive error messages logged to edge function logs. 
                The patterns below are derived from actual implementation.
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Error Pattern</TableHead>
                      <TableHead className="w-48">Context</TableHead>
                      <TableHead className="w-20">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ACTUAL_ERROR_PATTERNS.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{error.pattern}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{error.context}</TableCell>
                        <TableCell>
                          <Badge variant={error.severity === 'critical' ? 'destructive' : error.severity === 'high' ? 'outline' : 'secondary'}>
                            {error.severity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {ACTUAL_ERROR_PATTERNS.map((error, index) => (
                  <AccordionItem key={index} value={`error-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded truncate max-w-xs">{error.pattern}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pl-4">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                          <AlertTriangle className="h-4 w-4" />
                          Cause
                        </div>
                        <p className="text-sm text-muted-foreground">{error.cause}</p>
                      </div>

                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          Resolution Steps
                        </div>
                        <ol className="space-y-1 ml-4">
                          {error.resolution.map((step, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground list-decimal">{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                          <FileText className="h-4 w-4" />
                          Prevention
                        </div>
                        <p className="text-sm text-muted-foreground">{error.prevention}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="log-interpretation" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Log Field Reference</h3>
              </div>

              <p className="text-sm text-muted-foreground">
                Integration logs are stored in the <code className="bg-muted px-1 rounded">appraisal_integration_log</code> table. 
                Understanding these fields helps diagnose issues quickly.
              </p>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Field</TableHead>
                      <TableHead>Possible Values</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LOG_FIELDS_EXPLANATION.map((field) => (
                      <TableRow key={field.field}>
                        <TableCell className="font-mono text-xs">{field.field}</TableCell>
                        <TableCell className="text-xs">
                          {Array.isArray(field.values) ? field.values.join(', ') : field.values}
                        </TableCell>
                        <TableCell className="text-sm">{field.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Example Log Entry (Failed)
                </h4>
                <pre className="text-xs overflow-x-auto bg-background p-3 rounded border">
{`{
  "id": "int-log-123",
  "status": "failed",
  "rule_name": "Low Performer to PIP",
  "target_module": "pip",
  "triggered_at": "2025-12-15T10:30:00Z",
  "executed_at": null,
  "error_message": "Employee not eligible for PIP creation",
  "action_result": {
    "error_code": "INT-002",
    "reason": "Employee tenure < 90 days",
    "employee_hire_date": "2025-10-01"
  },
  "retry_count": 0
}`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="by-module" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Link2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Common Failures by Target Module</h3>
              </div>

              <div className="space-y-4">
                {INTEGRATION_FAILURE_TYPES.map((module, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{module.module}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-destructive" />
                          Common Failures
                        </h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {module.commonFailures.map((failure, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                              {failure}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <h5 className="text-sm font-medium mb-1 text-green-700 dark:text-green-400">
                          Quick Fix
                        </h5>
                        <p className="text-sm text-muted-foreground">{module.quickFix}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="retry-procedure" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Retry Procedure</h3>
              </div>

              <StepByStep 
                steps={RETRY_STEPS}
                title="Integration Retry Procedure"
              />
            </TabsContent>

            <TabsContent value="escalation" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Escalation Procedures</h3>
              </div>

              <WorkflowDiagram
                title="Integration Failure Escalation Path"
                description="Decision tree for escalating integration issues that cannot be self-resolved"
                diagram={ESCALATION_DIAGRAM}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Tier 1: Self-Service</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use this documentation to diagnose</li>
                    <li>• Check error codes and resolution steps</li>
                    <li>• Attempt retry after fixing root cause</li>
                    <li>• SLA: Immediate resolution attempt</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Tier 2: Internal Escalation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Config issues → Admin team</li>
                    <li>• Data issues → HR Operations</li>
                    <li>• External systems → IT Support</li>
                    <li>• SLA: 4 business hours response</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">Tier 3: Technical Support</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Issues not resolved by Tier 1-2</li>
                    <li>• Suspected system bugs</li>
                    <li>• Performance degradation</li>
                    <li>• SLA: 8 business hours response</li>
                  </ul>
                </div>
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">Tier 4: Vendor Escalation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Critical system-wide failures</li>
                    <li>• Security incidents</li>
                    <li>• Unresolved after Tier 3</li>
                    <li>• SLA: Per support agreement</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
