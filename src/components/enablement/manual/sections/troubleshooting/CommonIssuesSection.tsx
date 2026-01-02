import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, Lightbulb, Search, Users, Calculator, Link2, Brain, Scale } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

interface TroubleshootingIssue {
  id: string;
  category: string;
  symptom: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cause: string;
  solution: string[];
  prevention: string;
}

const ISSUES: TroubleshootingIssue[] = [
  // Cycle Management Issues
  {
    id: 'CM-001',
    category: 'Cycle Management',
    symptom: 'Cannot activate appraisal cycle - button disabled',
    severity: 'high',
    cause: 'Cycle dates are in the past or form template not assigned',
    solution: [
      'Verify cycle start date is today or in the future',
      'Ensure a valid form template is selected',
      'Check that at least one participant is enrolled',
      'Confirm cycle status is "Draft"'
    ],
    prevention: 'Always validate cycle configuration before saving as Draft'
  },
  {
    id: 'CM-002',
    category: 'Cycle Management',
    symptom: 'Cycle stuck in "In Progress" status',
    severity: 'medium',
    cause: 'Not all participants have completed their appraisals or there are pending approvals',
    solution: [
      'Check completion dashboard for outstanding participants',
      'Review pending manager submissions',
      'Check for employees in response phase',
      'Verify no escalations are pending resolution'
    ],
    prevention: 'Set up automated reminders and track completion rates weekly'
  },
  {
    id: 'CM-003',
    category: 'Cycle Management',
    symptom: 'Weight validation error - components do not sum to 100%',
    severity: 'critical',
    cause: 'Goals + Competencies + Responsibilities + Values weights configured incorrectly',
    solution: [
      'Navigate to cycle configuration',
      'Review each component weight',
      'Adjust weights to sum exactly to 100%',
      'Save and revalidate'
    ],
    prevention: 'Use form template defaults and validate before cycle launch'
  },
  // Participant Issues
  {
    id: 'PT-001',
    category: 'Participant Management',
    symptom: 'Employee missing from participant list',
    severity: 'high',
    cause: 'Employee does not meet eligibility criteria (hire date, status, or department)',
    solution: [
      'Verify employee has active employment status',
      'Check hire date meets minimum tenure requirement',
      'Confirm employee is in eligible department/location',
      'Review any exclusion rules that may apply',
      'Manually add if eligibility overrides are allowed'
    ],
    prevention: 'Run eligibility preview before cycle launch'
  },
  {
    id: 'PT-002',
    category: 'Participant Management',
    symptom: 'Manager cannot see team members in evaluation list',
    severity: 'critical',
    cause: 'Manager-employee relationship not set in org hierarchy or manager not enrolled as evaluator',
    solution: [
      'Verify manager is set as direct supervisor in Core HR',
      'Check org hierarchy effective dates',
      'Ensure manager is enrolled as evaluator in cycle',
      'Review RLS policies for data access'
    ],
    prevention: 'Validate org hierarchy before cycle launch'
  },
  {
    id: 'PT-003',
    category: 'Participant Management',
    symptom: 'Duplicate participant entries appear',
    severity: 'medium',
    cause: 'Employee has multiple positions and multi-position mode set to "Separate"',
    solution: [
      'This may be expected behavior for multi-position employees',
      'If unintended, change cycle multi-position mode to "Aggregate"',
      'Review employee position assignments in Core HR'
    ],
    prevention: 'Define multi-position handling strategy before cycle setup'
  },
  // Scoring Issues
  {
    id: 'SC-001',
    category: 'Scoring & Calculations',
    symptom: 'Overall score calculation mismatch - manual calculation differs from system',
    severity: 'high',
    cause: 'Calibration adjustments, weight overrides, or rounding differences',
    solution: [
      'Review calibration history for any adjustments',
      'Check if participant-level weight overrides exist',
      'Verify rating scale conversion factors',
      'Review calculation methodology in form template'
    ],
    prevention: 'Document calibration changes and use consistent rounding rules'
  },
  {
    id: 'SC-002',
    category: 'Scoring & Calculations',
    symptom: 'Goal score shows as 0 despite ratings entered',
    severity: 'high',
    cause: 'Goal weights within section sum to 0% or all goals marked as N/A',
    solution: [
      'Verify individual goal weights sum to 100% within goals section',
      'Check that at least one goal is rated (not N/A)',
      'Review goal status - archived goals may not count'
    ],
    prevention: 'Validate goal setup and weights before evaluation window opens'
  },
  {
    id: 'SC-003',
    category: 'Scoring & Calculations',
    symptom: 'Competency score appears higher/lower than expected',
    severity: 'medium',
    cause: 'Proficiency levels have different max scores or behavioral indicators weighted differently',
    solution: [
      'Review competency rating scale configuration',
      'Check if proficiency-based scoring is enabled',
      'Verify behavioral indicator weights if applicable'
    ],
    prevention: 'Align competency scoring with rating scale before cycle'
  },
  // Integration Issues
  {
    id: 'IN-001',
    category: 'Integration',
    symptom: 'Nine-Box grid not updating after appraisal finalization',
    severity: 'high',
    cause: 'Integration rule disabled, appraisal not fully finalized, or rule conditions not met',
    solution: [
      'Confirm appraisal status is "Finalized"',
      'Check integration rule is enabled and active',
      'Verify rule conditions match employee\'s score',
      'Review integration logs for error messages',
      'Manually trigger integration if retry is available'
    ],
    prevention: 'Test integration rules with sample data before go-live'
  },
  {
    id: 'IN-002',
    category: 'Integration',
    symptom: 'IDP/PIP not auto-created for low performers',
    severity: 'medium',
    cause: 'Score threshold not met or target module not enabled',
    solution: [
      'Verify employee\'s final score meets rule threshold',
      'Check that IDP/PIP module is enabled for company',
      'Confirm rule action type is configured correctly',
      'Review integration logs for specific errors'
    ],
    prevention: 'Configure and test all downstream actions during implementation'
  },
  // AI Feature Issues
  {
    id: 'AI-001',
    category: 'AI Features',
    symptom: 'AI narrative suggestions not appearing',
    severity: 'low',
    cause: 'Insufficient data for AI analysis or AI features disabled for company',
    solution: [
      'Verify AI features are enabled in company settings',
      'Ensure sufficient historical data exists (min 2 cycles)',
      'Check user role has AI feature access',
      'Review AI usage quotas'
    ],
    prevention: 'Enable AI features and validate during implementation testing'
  },
  {
    id: 'AI-002',
    category: 'AI Features',
    symptom: 'Bias detection flagging false positives',
    severity: 'medium',
    cause: 'AI model sensitivity settings too high or small sample sizes',
    solution: [
      'Review AI confidence scores for flagged items',
      'Adjust bias detection sensitivity in settings',
      'Manually review and dismiss false positives',
      'Provide feedback to improve model'
    ],
    prevention: 'Calibrate AI sensitivity based on organization size and context'
  },
  // Calibration Issues
  {
    id: 'CA-001',
    category: 'Calibration',
    symptom: 'Cannot adjust scores in calibration session',
    severity: 'high',
    cause: 'User lacks calibrator role or session is locked/completed',
    solution: [
      'Verify user is assigned as calibrator for the session',
      'Check session status is "In Progress"',
      'Confirm session is not locked by another user',
      'Review calibration permissions in role settings'
    ],
    prevention: 'Assign calibrator roles before session scheduling'
  },
  {
    id: 'CA-002',
    category: 'Calibration',
    symptom: 'Calibration audit trail incomplete',
    severity: 'medium',
    cause: 'Justification not provided for adjustment or browser session timeout',
    solution: [
      'All adjustments require mandatory justification',
      'Check for session timeout issues during adjustment',
      'Review audit log for any gaps',
      'Manually document missing entries if needed'
    ],
    prevention: 'Require justification field validation before saving adjustments'
  }
];

const DECISION_TREE_DIAGRAM = `graph TD
    A[Issue Reported] --> B{What type?}
    B -->|Access/Visibility| C{Check Permissions}
    B -->|Calculation| D{Review Weights}
    B -->|Integration| E{Check Rules}
    B -->|AI Features| F{Verify Settings}
    
    C -->|Role Missing| G[Assign Role]
    C -->|RLS Issue| H[Review Policies]
    C -->|Org Hierarchy| I[Fix Relationships]
    
    D -->|Sum ≠ 100%| J[Adjust Weights]
    D -->|Wrong Scale| K[Check Config]
    D -->|Calibration| L[Review Adjustments]
    
    E -->|Rule Disabled| M[Enable Rule]
    E -->|Condition Fail| N[Check Thresholds]
    E -->|Module Off| O[Enable Module]
    
    F -->|Quota Exceeded| P[Reset/Increase]
    F -->|Data Missing| Q[Wait for Data]
    F -->|Disabled| R[Enable AI]
    
    G --> S[Resolved]
    H --> S
    I --> S
    J --> S
    K --> S
    L --> S
    M --> S
    N --> S
    O --> S
    P --> S
    Q --> S
    R --> S`;

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Critical</Badge>;
    case 'high':
      return <Badge variant="destructive" className="flex items-center gap-1 bg-orange-500"><AlertTriangle className="h-3 w-3" /> High</Badge>;
    case 'medium':
      return <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-600"><AlertCircle className="h-3 w-3" /> Medium</Badge>;
    default:
      return <Badge variant="secondary" className="flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Low</Badge>;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Cycle Management':
      return <Calculator className="h-4 w-4" />;
    case 'Participant Management':
      return <Users className="h-4 w-4" />;
    case 'Scoring & Calculations':
      return <Calculator className="h-4 w-4" />;
    case 'Integration':
      return <Link2 className="h-4 w-4" />;
    case 'AI Features':
      return <Brain className="h-4 w-4" />;
    case 'Calibration':
      return <Scale className="h-4 w-4" />;
    default:
      return <Search className="h-4 w-4" />;
  }
};

export function CommonIssuesSection() {
  const categories = [...new Set(ISSUES.map(i => i.category))];

  return (
    <div className="space-y-8">
      <Card id="sec-8-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.1</Badge>
            <Badge variant="secondary">Troubleshooting</Badge>
          </div>
          <CardTitle className="text-2xl">Common Issues & Solutions</CardTitle>
          <CardDescription>
            Comprehensive troubleshooting guide for frequently encountered problems with step-by-step resolution procedures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-8-1']} />

          {/* Quick Reference Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead className="w-32">Category</TableHead>
                  <TableHead>Symptom</TableHead>
                  <TableHead className="w-24">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ISSUES.slice(0, 8).map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-mono text-xs">{issue.id}</TableCell>
                    <TableCell className="text-sm">{issue.category}</TableCell>
                    <TableCell className="text-sm">{issue.symptom}</TableCell>
                    <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Decision Tree */}
          <WorkflowDiagram
            title="Issue Diagnosis Decision Tree"
            description="Use this flowchart to quickly identify the root cause category and navigate to the appropriate solution"
            diagram={DECISION_TREE_DIAGRAM}
          />

          {/* Detailed Issues by Category */}
          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                {getCategoryIcon(category)}
                <h3 className="text-lg font-semibold">{category}</h3>
                <Badge variant="outline" className="ml-auto">
                  {ISSUES.filter(i => i.category === category).length} issues
                </Badge>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {ISSUES.filter(i => i.category === category).map((issue) => (
                  <AccordionItem key={issue.id} value={issue.id}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-mono text-xs text-muted-foreground">{issue.id}</span>
                        {getSeverityBadge(issue.severity)}
                        <span className="text-sm font-medium">{issue.symptom}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pl-4 pt-2">
                      {/* Cause */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                          <AlertTriangle className="h-4 w-4" />
                          Root Cause
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.cause}</p>
                      </div>

                      {/* Solution Steps */}
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          Resolution Steps
                        </div>
                        <ol className="space-y-2 ml-4">
                          {issue.solution.map((step, index) => (
                            <li key={index} className="text-sm text-muted-foreground list-decimal">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Prevention */}
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                          <Lightbulb className="h-4 w-4" />
                          Prevention Tip
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.prevention}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
