import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users, Phone, Mail, MessageSquare, ArrowUpCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

interface EscalationTier {
  tier: number;
  name: string;
  description: string;
  owner: string;
  responseSLA: string;
  resolutionSLA: string;
  triggerConditions: string[];
  contactMethod: string;
  examples: string[];
}

const ESCALATION_TIERS: EscalationTier[] = [
  {
    tier: 1,
    name: 'Self-Service Resolution',
    description: 'User attempts to resolve using available documentation and tools',
    owner: 'End User',
    responseSLA: 'Immediate',
    resolutionSLA: '1 hour',
    triggerConditions: [
      'Issue can be diagnosed using this manual',
      'Error code is documented with resolution steps',
      'No system-wide impact'
    ],
    contactMethod: 'Documentation, FAQs, In-app help',
    examples: [
      'Cannot find participant in list (filter issue)',
      'Score calculation question',
      'Navigation or UI questions'
    ]
  },
  {
    tier: 2,
    name: 'HR Operations Support',
    description: 'HR team handles data corrections, configuration issues, and process guidance',
    owner: 'HR Operations Team',
    responseSLA: '4 business hours',
    resolutionSLA: '1 business day',
    triggerConditions: [
      'Data correction required',
      'Configuration change needed',
      'Process exception or override required',
      'Tier 1 resolution unsuccessful'
    ],
    contactMethod: 'Internal ticketing system, HR helpdesk',
    examples: [
      'Employee eligibility override needed',
      'Manager reassignment required',
      'Calibration adjustment approval',
      'Deadline extension request'
    ]
  },
  {
    tier: 3,
    name: 'Technical Support',
    description: 'IT/Admin team handles system issues, integrations, and access problems',
    owner: 'IT Support / System Admin',
    responseSLA: '8 business hours',
    resolutionSLA: '2 business days',
    triggerConditions: [
      'System access or permission issue',
      'Integration failure not resolved by retry',
      'Performance degradation',
      'Suspected bug or defect'
    ],
    contactMethod: 'IT Service Desk, Admin console',
    examples: [
      'User cannot log in',
      'Integration to external system failing',
      'Page not loading or timing out',
      'Data not syncing between modules'
    ]
  },
  {
    tier: 4,
    name: 'Vendor Escalation',
    description: 'Platform vendor support for critical issues requiring engineering intervention',
    owner: 'Vendor Support Team',
    responseSLA: 'Per contract SLA',
    resolutionSLA: 'Per severity level',
    triggerConditions: [
      'System-wide outage',
      'Security incident',
      'Confirmed product defect',
      'Tier 3 cannot resolve'
    ],
    contactMethod: 'Vendor support portal, Emergency hotline',
    examples: [
      'System unavailable for all users',
      'Data breach suspected',
      'Critical functionality broken after update',
      'Compliance-impacting issue'
    ]
  }
];

const SEVERITY_DEFINITIONS = [
  {
    level: 'Critical (P1)',
    definition: 'System unavailable or critical function broken for all users',
    impact: 'Business operations halted',
    response: '1 hour',
    resolution: '4 hours',
    examples: ['System down', 'Data loss', 'Security breach']
  },
  {
    level: 'High (P2)',
    definition: 'Major function impaired affecting many users',
    impact: 'Significant business disruption',
    response: '4 hours',
    resolution: '1 business day',
    examples: ['Cannot submit appraisals', 'Integration failure', 'Performance severely degraded']
  },
  {
    level: 'Medium (P3)',
    definition: 'Feature not working as expected with workaround available',
    impact: 'Some inconvenience',
    response: '1 business day',
    resolution: '3 business days',
    examples: ['Report not generating correctly', 'Minor UI issue', 'Non-critical feature broken']
  },
  {
    level: 'Low (P4)',
    definition: 'Minor issue or enhancement request',
    impact: 'Minimal',
    response: '2 business days',
    resolution: 'Next release',
    examples: ['Cosmetic issue', 'Feature request', 'Documentation update']
  }
];

const ESCALATION_DECISION_TREE = `graph TD
    A[Issue Identified] --> B{Can you resolve it<br/>using documentation?}
    
    B -->|Yes| C[Follow Tier 1 Steps]
    B -->|No| D{Is it a data or<br/>process issue?}
    
    C --> E{Resolved?}
    E -->|Yes| F[Close Issue]
    E -->|No| D
    
    D -->|Data/Process| G[Escalate to HR Ops<br/>Tier 2]
    D -->|Technical| H[Escalate to IT<br/>Tier 3]
    D -->|Not Sure| I{Check Error Type}
    
    I -->|Configuration| G
    I -->|System/Integration| H
    I -->|Unknown| H
    
    G --> J{Resolved within SLA?}
    H --> K{Resolved within SLA?}
    
    J -->|Yes| F
    J -->|No| L{Still data issue?}
    K -->|Yes| F
    K -->|No| M[Escalate to Vendor<br/>Tier 4]
    
    L -->|Yes| N[Escalate to IT for<br/>data investigation]
    L -->|No| M
    
    N --> K
    M --> O[Vendor Resolution]
    O --> F`;

const COMMUNICATION_TEMPLATES = [
  {
    scenario: 'Initial Escalation to Tier 2',
    template: `Subject: [Appraisals] Support Request - [Brief Description]

Issue Summary: [One sentence description]
Error Code (if any): [e.g., INT-003]
Affected Users: [Count and roles]
Impact: [Business impact description]
Steps Taken: [What you already tried]
Urgency: [High/Medium/Low]

Attachments: Screenshots, error logs`
  },
  {
    scenario: 'Escalation to Tier 3 (Technical)',
    template: `Subject: [TECH SUPPORT] Appraisals Issue - [Brief Description]

Issue ID: [If assigned by Tier 2]
Environment: [Production/Staging]
Browser/Device: [e.g., Chrome 120, Windows 11]
Error Message: [Exact error text]
Console Errors: [If available]
Reproducible: [Yes/No - Steps to reproduce]
Timeline: [When started, frequency]
Business Impact: [Cycle deadline, user count affected]

Attachments: Screenshots, HAR file, error logs`
  },
  {
    scenario: 'Vendor Escalation',
    template: `Subject: [URGENT] P1/P2 Escalation - [Company Name] - [Brief Description]

Ticket Reference: [Internal ticket ID]
Severity: [P1/P2/P3/P4]
Environment: [Production]
Affected Module: Appraisals
Issue Start Time: [ISO timestamp]
Number of Users Affected: [Count]
Business Impact: [Critical deadline, compliance risk, etc.]

Description: [Detailed description]
Troubleshooting Completed: [All steps taken]
Expected Behavior: [What should happen]
Actual Behavior: [What is happening]

Contact for Updates: [Name, Email, Phone]`
  }
];

export function EscalationProceduresSection() {
  return (
    <div className="space-y-8">
      <Card id="sec-8-8">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.8</Badge>
            <Badge variant="secondary">Troubleshooting</Badge>
          </div>
          <CardTitle className="text-2xl">Escalation Procedures</CardTitle>
          <CardDescription>
            Tiered support model, SLA expectations, and communication templates for issue escalation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-8-8']} />

          {/* SLA Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
              <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
              <div className="text-lg font-bold">1 hour</div>
              <div className="text-xs text-muted-foreground">P1 Response</div>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
              <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <div className="text-lg font-bold">4 hours</div>
              <div className="text-xs text-muted-foreground">P2 Response</div>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold">4 Tiers</div>
              <div className="text-xs text-muted-foreground">Support Levels</div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold">80%</div>
              <div className="text-xs text-muted-foreground">Tier 1 Resolution Target</div>
            </div>
          </div>

          {/* Decision Tree */}
          <WorkflowDiagram
            title="Escalation Decision Tree"
            description="Use this flowchart to determine the appropriate escalation path for your issue"
            diagram={ESCALATION_DECISION_TREE}
          />

          {/* Escalation Tiers */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-primary" />
              Support Tiers
            </h3>

            {ESCALATION_TIERS.map((tier) => (
              <div key={tier.tier} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={
                    tier.tier === 1 ? 'secondary' :
                    tier.tier === 2 ? 'outline' :
                    tier.tier === 3 ? 'default' : 'destructive'
                  } className="text-lg px-3 py-1">
                    Tier {tier.tier}
                  </Badge>
                  <span className="font-semibold">{tier.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    <Clock className="h-3 w-3 mr-1" />
                    Response: {tier.responseSLA}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Owner: {tier.owner}
                    </h5>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Resolution SLA: {tier.resolutionSLA}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Contact: {tier.contactMethod}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Trigger Conditions:</h5>
                    <ul className="text-muted-foreground space-y-1">
                      {tier.triggerConditions.map((condition, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-muted rounded-lg">
                  <h5 className="font-medium text-xs mb-1">Examples:</h5>
                  <div className="flex flex-wrap gap-2">
                    {tier.examples.map((example, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{example}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Severity Definitions */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Severity Levels
            </h3>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Level</TableHead>
                    <TableHead>Definition</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Resolution</TableHead>
                    <TableHead>Examples</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SEVERITY_DEFINITIONS.map((severity, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant={
                          severity.level.includes('P1') ? 'destructive' :
                          severity.level.includes('P2') ? 'outline' :
                          severity.level.includes('P3') ? 'secondary' : 'secondary'
                        }>
                          {severity.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{severity.definition}</TableCell>
                      <TableCell className="text-sm font-medium">{severity.response}</TableCell>
                      <TableCell className="text-sm">{severity.resolution}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{severity.examples.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Communication Templates */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Communication Templates
            </h3>

            <div className="space-y-4">
              {COMMUNICATION_TEMPLATES.map((template, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{template.scenario}</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {template.template}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-destructive">
              <Phone className="h-5 w-5" />
              Emergency Escalation (P1 Only)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">During Business Hours (9 AM - 6 PM)</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• IT Service Desk: Extension XXXX</li>
                  <li>• HR Operations Manager: Direct line</li>
                  <li>• System Administrator: Pager/SMS</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">After Hours</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• On-call IT: Via ticketing system (marked URGENT)</li>
                  <li>• Vendor Emergency Hotline: Per contract</li>
                  <li>• Security Incidents: Security team pager</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Escalation Best Practices
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Always attempt Tier 1 resolution first - 80% of issues can be self-resolved</li>
              <li>• Gather all relevant information before escalating to reduce back-and-forth</li>
              <li>• Include screenshots, error messages, and steps to reproduce</li>
              <li>• Note the business impact and any deadlines affected</li>
              <li>• Follow up if you do not receive response within the SLA</li>
              <li>• Update the ticket with any new information or workarounds discovered</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
