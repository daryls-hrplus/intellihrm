import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { Megaphone, AlertTriangle, Clock, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const learningObjectives = [
  'Understand the 4-tier support escalation model',
  'Apply severity classification correctly',
  'Use escalation communication templates',
  'Track and resolve escalated issues efficiently'
];

const severityDefinitions = [
  {
    level: 'Critical (P1)',
    description: 'System-wide outage, data breach risk, or complete module failure',
    responseTime: '15 minutes',
    resolution: '4 hours',
    escalateTo: 'Engineering Lead + Security',
    examples: 'Module completely inaccessible, anonymity breach detected, data corruption'
  },
  {
    level: 'High (P2)',
    description: 'Major functionality broken affecting multiple users or cycles',
    responseTime: '1 hour',
    resolution: '8 hours',
    escalateTo: 'Senior Support + Engineering',
    examples: 'Report generation failing for all users, integration sync completely broken'
  },
  {
    level: 'Medium (P3)',
    description: 'Significant issue affecting workflow but workaround exists',
    responseTime: '4 hours',
    resolution: '24 hours',
    escalateTo: 'Senior Support',
    examples: 'Specific report template broken, reminder emails delayed, single cycle issue'
  },
  {
    level: 'Low (P4)',
    description: 'Minor issue, cosmetic problem, or enhancement request',
    responseTime: '24 hours',
    resolution: '72 hours',
    escalateTo: 'Standard Support Queue',
    examples: 'UI alignment issue, documentation clarification, feature enhancement'
  }
];

const escalationTiers = [
  {
    tier: 'Tier 1 - Self-Service',
    owner: 'End User / HR Admin',
    scope: 'Documentation, FAQ, in-app help',
    actions: 'Search knowledge base, review troubleshooting guides, check status page'
  },
  {
    tier: 'Tier 2 - Standard Support',
    owner: 'Support Team',
    scope: 'Configuration issues, user guidance, data validation',
    actions: 'Review logs, verify configuration, apply known fixes, escalate if unresolved'
  },
  {
    tier: 'Tier 3 - Senior Support',
    owner: 'Senior Support / Product Specialist',
    scope: 'Complex issues, integration problems, edge cases',
    actions: 'Deep diagnostic, database queries, coordination with engineering'
  },
  {
    tier: 'Tier 4 - Engineering',
    owner: 'Engineering Team',
    scope: 'Code fixes, infrastructure issues, security incidents',
    actions: 'Root cause analysis, code changes, deployment, post-incident review'
  }
];

const escalationSteps: Step[] = [
  {
    title: 'Initial Triage',
    description: 'Classify issue severity and gather context.',
    substeps: [
      'Identify affected users, cycles, and scope',
      'Determine severity level (P1-P4)',
      'Document reproduction steps',
      'Check for existing known issues'
    ],
    expectedResult: 'Issue classified with severity and initial context documented'
  },
  {
    title: 'Tier 1 Resolution Attempt',
    description: 'Apply self-service solutions.',
    substeps: [
      'Search troubleshooting documentation',
      'Apply documented fix if available',
      'Verify resolution with user',
      'Escalate to Tier 2 if unresolved after 30 minutes'
    ],
    expectedResult: 'Issue resolved or escalation initiated'
  },
  {
    title: 'Tier 2 Escalation',
    description: 'Engage support team for deeper investigation.',
    substeps: [
      'Create support ticket with full context',
      'Attach relevant logs and screenshots',
      'Specify severity and business impact',
      'Await acknowledgment within SLA'
    ],
    expectedResult: 'Support ticket acknowledged and investigation started'
  },
  {
    title: 'Tier 3/4 Escalation',
    description: 'Engage senior support or engineering for complex issues.',
    substeps: [
      'Provide diagnostic findings from Tier 2',
      'Include database queries and log analysis',
      'Specify workaround status and timeline pressure',
      'Coordinate cross-team response for P1/P2'
    ],
    expectedResult: 'Expert team engaged and resolution in progress'
  },
  {
    title: 'Resolution & Closure',
    description: 'Confirm fix and document learnings.',
    substeps: [
      'Verify fix resolves original issue',
      'Confirm with all affected users',
      'Document root cause and solution',
      'Update knowledge base if new pattern'
    ],
    expectedResult: 'Issue resolved, documented, and ticket closed'
  }
];

export function F360EscalationProcedures() {
  return (
    <section id="sec-8-9" data-manual-anchor="sec-8-9" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          8.9 Escalation Procedures
        </h3>
        <p className="text-muted-foreground mt-2">
          Structured escalation model with severity definitions, tier responsibilities, and communication templates.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">SLA Commitment</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Response and resolution times are based on severity level. P1 (Critical) issues trigger immediate
          notification to on-call engineering. Track all escalations for SLA compliance reporting.
        </AlertDescription>
      </Alert>

      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Severity Definitions
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Severity</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">Response</TableHead>
                <TableHead className="font-medium">Resolution</TableHead>
                <TableHead className="font-medium">Escalate To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {severityDefinitions.map((def, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge
                      variant={
                        def.level.includes('P1') ? 'destructive' :
                        def.level.includes('P2') ? 'destructive' :
                        def.level.includes('P3') ? 'secondary' : 'outline'
                      }
                    >
                      {def.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{def.description}</TableCell>
                  <TableCell className="text-sm font-mono">{def.responseTime}</TableCell>
                  <TableCell className="text-sm font-mono">{def.resolution}</TableCell>
                  <TableCell className="text-sm">{def.escalateTo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          Support Tier Model
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          {escalationTiers.map((tier, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{tier.tier}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Owner: </span>
                  <span className="text-sm">{tier.owner}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Scope: </span>
                  <span className="text-sm">{tier.scope}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Actions: </span>
                  <span className="text-sm text-muted-foreground">{tier.actions}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <StepByStep
        steps={escalationSteps}
        title="Escalation Workflow"
      />

      <div>
        <h4 className="font-medium mb-4">Escalation Communication Template</h4>
        <Card>
          <CardContent className="pt-4">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
{`Subject: [P{SEVERITY}] 360 Feedback Issue - {BRIEF DESCRIPTION}

ISSUE SUMMARY
-------------
Severity: P{SEVERITY} - {SEVERITY_NAME}
Affected: {NUMBER} users / {NUMBER} cycles
Started: {TIMESTAMP}
Current Status: {STATUS}

DESCRIPTION
-----------
{Detailed description of the issue}

BUSINESS IMPACT
---------------
{Description of impact on business operations}

REPRODUCTION STEPS
------------------
1. {Step 1}
2. {Step 2}
3. {Step 3}

DIAGNOSTIC FINDINGS
-------------------
- Logs reviewed: {YES/NO}
- Error messages: {ERROR_TEXT}
- Database checked: {YES/NO}

WORKAROUND
----------
{Available/None - description if available}

REQUESTED ACTION
----------------
{Specific action requested from escalation target}

CONTACT
-------
Reported by: {NAME}
Email: {EMAIL}
Available: {HOURS}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
