import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Headphones, Clock, AlertTriangle, ArrowUpCircle, HelpCircle, MessageSquare } from 'lucide-react';
import { LearningObjectives, InfoCallout, WarningCallout, TipCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const SUPPORT_TIERS = [
  {
    tier: 1,
    name: 'Self-Service',
    description: 'User resolves independently using documentation',
    scope: 'Configuration questions, how-to guidance, documentation clarification',
    sla: 'Immediate',
    escalation: 'If documentation doesn\'t resolve within 15 minutes'
  },
  {
    tier: 2,
    name: 'HR Operations',
    description: 'Internal HR team provides first-line support',
    scope: 'Workflow issues, data entry errors, user access requests, simple configuration changes',
    sla: '4 hours',
    escalation: 'If HR cannot resolve or issue is technical'
  },
  {
    tier: 3,
    name: 'Technical Support',
    description: 'IT/System admin team handles technical issues',
    scope: 'Integration failures, performance issues, security incidents, complex configuration',
    sla: '24 hours (P2), 4 hours (P1)',
    escalation: 'If system-level change required or vendor bug suspected'
  },
  {
    tier: 4,
    name: 'Vendor Support',
    description: 'Platform vendor provides expert resolution',
    scope: 'Product bugs, feature requests, architecture guidance, compliance support',
    sla: 'Per contract SLA',
    escalation: 'N/A - Final tier'
  },
];

const SEVERITY_DEFINITIONS = [
  {
    level: 'P1',
    name: 'Critical',
    description: 'System down, data breach, or complete module failure',
    examples: ['Cross-company data leakage (SEC-003)', 'All users unable to access succession', 'Data corruption affecting multiple employees'],
    response: '15 minutes',
    resolution: '4 hours',
    escalation: 'Immediate to Tier 3-4'
  },
  {
    level: 'P2',
    name: 'High',
    description: 'Major feature broken affecting multiple users',
    examples: ['Workflow approvals not processing', 'Nine-Box calculations returning errors', 'Integration sync completely failed'],
    response: '1 hour',
    resolution: '24 hours',
    escalation: '2 hours if no progress'
  },
  {
    level: 'P3',
    name: 'Medium',
    description: 'Feature partially broken with workaround available',
    examples: ['Single user access issue', 'Data freshness indicator stale', 'Notification delivery delayed'],
    response: '4 hours',
    resolution: '72 hours',
    escalation: '24 hours if no progress'
  },
  {
    level: 'P4',
    name: 'Low',
    description: 'Minor issue or enhancement request',
    examples: ['Documentation typo', 'UI label improvement', 'Feature enhancement request'],
    response: 'Next business day',
    resolution: 'Backlog (scheduled)',
    escalation: 'Weekly review'
  },
];

const FAQS = [
  {
    category: 'General',
    questions: [
      {
        q: 'How often should succession plans be reviewed?',
        a: 'Industry best practice is quarterly review for key positions, with annual comprehensive calibration. SHRM recommends minimum bi-annual review.'
      },
      {
        q: 'What is the target bench strength ratio?',
        a: 'SHRM recommends 2-3 ready successors per critical position. A coverage score of 150-200% indicates healthy bench strength.'
      },
      {
        q: 'How long should historical assessments be retained?',
        a: 'SOC 2 compliance requires 3-year minimum. Best practice is 5-7 years for trend analysis and legal defensibility.'
      },
    ]
  },
  {
    category: 'Nine-Box',
    questions: [
      {
        q: 'What if an employee has no data for Nine-Box calculation?',
        a: 'Use manual assessment with documented rationale. AI suggestions require minimum data thresholds; without data, manual rating with override_reason is required.'
      },
      {
        q: 'How should we handle disagreement between AI suggestion and manager rating?',
        a: 'Manager rating takes precedence. Document the deviation reason in override_reason. Review systematic deviations quarterly for calibration opportunities.'
      },
    ]
  },
  {
    category: 'Readiness',
    questions: [
      {
        q: 'Can one candidate be in multiple succession plans?',
        a: 'Yes. A high-potential employee may be a successor candidate for multiple positions. Each succession_candidates record tracks the candidate-plan relationship.'
      },
      {
        q: 'What triggers automatic readiness band update on candidates?',
        a: 'The READINESS_COMPLETED integration rule syncs latest_readiness_score and latest_readiness_band from readiness_assessment_responses to succession_candidates.'
      },
    ]
  },
  {
    category: 'Integration',
    questions: [
      {
        q: 'How soon after appraisal completion does Nine-Box update?',
        a: 'Integration rules trigger on APPRAISAL_COMPLETED event. Processing typically completes within 5-15 minutes depending on queue depth.'
      },
      {
        q: 'What happens if an integration rule fails?',
        a: 'Failure is logged in appraisal_integration_log with error details. Automatic retry occurs 3 times with exponential backoff. After 3 failures, manual intervention required.'
      },
    ]
  },
  {
    category: 'Security',
    questions: [
      {
        q: 'Can managers see succession plans for positions outside their team?',
        a: 'No. RLS policies enforce manager hierarchy. Managers can only see succession data for direct reports and positions within their org scope.'
      },
      {
        q: 'How do we audit who viewed sensitive succession data?',
        a: 'Enable query logging in database settings. Succession tables include audit triggers for modifications. View access requires application-level logging.'
      },
    ]
  },
];

const ESCALATION_TEMPLATE = `
Subject: [SEVERITY] Succession Module Issue - [ISSUE_ID]

Priority: [P1/P2/P3/P4]
Module: Succession Planning
Issue ID: [CFG-001, NBX-002, etc.]
Company: [Company Name]
Reported By: [Name, Email]
Date/Time: [Timestamp]

SYMPTOM:
[Brief description of what user observed]

STEPS TO REPRODUCE:
1. [Step 1]
2. [Step 2]
3. [Step 3]

EXPECTED BEHAVIOR:
[What should happen]

ACTUAL BEHAVIOR:
[What actually happens]

IMPACT:
- Users affected: [Number/description]
- Business impact: [Description]
- Workaround available: [Yes/No - describe if yes]

TROUBLESHOOTING ATTEMPTED:
- [Action 1 - Result]
- [Action 2 - Result]
- Documentation reference: Section [X.X]

ATTACHMENTS:
- Screenshots: [Y/N]
- Console logs: [Y/N]
- Network trace: [Y/N]
`;

export function EscalationProcedures() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-10" data-manual-anchor="sec-11-10" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, HR Partner</span>
          </div>
          <h3 className="text-xl font-semibold">11.10 Escalation Procedures & Support Resources</h3>
          <p className="text-muted-foreground mt-1">
            4-tier support model, severity definitions, communication templates, and frequently asked questions
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Navigate the 4-tier support model effectively',
          'Classify issues by severity for appropriate response',
          'Use escalation templates for efficient communication',
          'Find answers to common succession planning questions',
          'Know when to self-service vs. escalate'
        ]}
      />

      {/* 4-Tier Support Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-orange-600" />
            4-Tier Support Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SUPPORT_TIERS.map((tier) => (
              <div key={tier.tier} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                    {tier.tier}
                  </div>
                  <div>
                    <p className="font-medium">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">SLA: {tier.sla}</Badge>
                </div>
                <div className="pl-11 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Scope:</span> {tier.scope}</p>
                  <p><span className="text-muted-foreground">Escalate when:</span> {tier.escalation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Severity Definitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Severity Definitions (P1-P4)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SEVERITY_DEFINITIONS.map((sev) => (
              <div key={sev.level} className={`border-l-4 ${sev.level === 'P1' ? 'border-red-500' : sev.level === 'P2' ? 'border-orange-500' : sev.level === 'P3' ? 'border-amber-500' : 'border-blue-500'} pl-4 py-2`}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={sev.level === 'P1' ? 'destructive' : sev.level === 'P2' ? 'default' : 'secondary'}>
                    {sev.level}
                  </Badge>
                  <span className="font-medium">{sev.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Response: {sev.response} | Resolution: {sev.resolution}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{sev.description}</p>
                <div className="text-xs space-y-1">
                  <p><span className="font-medium">Examples:</span> {sev.examples.join(', ')}</p>
                  <p><span className="font-medium">Escalation:</span> {sev.escalation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-orange-600" />
            Escalation Communication Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
            {ESCALATION_TEMPLATE}
          </pre>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-orange-600" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((category) => (
              <AccordionItem key={category.category} value={category.category} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{category.category}</span>
                    <Badge variant="secondary" className="text-xs">{category.questions.length} questions</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pl-6">
                    {category.questions.map((faq, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="font-medium text-sm">{faq.q}</p>
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <TipCallout title="Effective Escalation">
        Include the Issue ID from this chapter (e.g., CFG-001, NBX-003) in your escalation. 
        This accelerates routing and resolution by 40% as support teams can immediately reference documented resolution steps.
      </TipCallout>

      <WarningCallout title="P1 Critical Issues">
        For P1 Critical severity issues (data breach, system down), escalate immediately to Tier 3-4. 
        Do not attempt self-service troubleshooting for security incidents. Follow incident response protocol.
      </WarningCallout>

      <InfoCallout title="Support Hours">
        Tier 1-2 support follows business hours. Tier 3-4 support for P1/P2 issues available 24/7 per contract. 
        Contact your system administrator for after-hours escalation procedures.
      </InfoCallout>
    </div>
  );
}
