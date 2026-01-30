import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const VENDOR_ISSUES = [
  {
    id: 'VND-001',
    symptom: 'Vendor course not appearing in training catalog',
    severity: 'Medium',
    cause: 'Vendor course is_active is false, or vendor is inactive, or catalog visibility not enabled.',
    resolution: [
      'Navigate to Training > Vendors and verify vendor is_active = true',
      'Check vendor course is_active = true in vendor course catalog',
      'Verify catalog_visibility setting allows display',
      'Check if course is restricted to specific departments/roles',
      'Refresh catalog cache and retry'
    ],
    prevention: 'Set catalog visibility during course creation. Test visibility before announcement.'
  },
  {
    id: 'VND-002',
    symptom: 'Session enrollment not reflecting in training request',
    severity: 'High',
    cause: 'Training request not linked to session, or request created before session, or linking logic failed.',
    resolution: [
      'Verify training request exists for the employee/course',
      'Check if session_id is populated in training request',
      'Link session to existing request manually if needed',
      'Create new request linked to session if missing',
      'Review request-session linking workflow'
    ],
    prevention: 'Create training requests from session enrollment flow. Validate request linkage.'
  },
  {
    id: 'VND-003',
    symptom: 'Cost calculation showing incorrect amount for multi-currency',
    severity: 'High',
    cause: 'Exchange rate not configured or outdated, or wrong currency code used, or calculation formula error.',
    resolution: [
      'Verify exchange rate is configured for vendor currency',
      'Check if exchange rate is current (may need update)',
      'Confirm base_cost and currency_code are correct on course/session',
      'Review cost calculation: converted_cost = base_cost * exchange_rate',
      'Update exchange rates and recalculate'
    ],
    prevention: 'Configure exchange rates during vendor setup. Schedule regular rate updates.'
  },
  {
    id: 'VND-004',
    symptom: 'Training request approval workflow stuck in pending',
    severity: 'High',
    cause: 'Approver not defined, approver unavailable, or workflow configuration error.',
    resolution: [
      'Check workflow settings for training request approval',
      'Verify approver is assigned and active',
      'Check if request is waiting for specific approver action',
      'Escalate or reassign request if approver unavailable',
      'Review workflow execution logs for errors'
    ],
    prevention: 'Configure backup approvers. Set SLA alerts for pending approvals.'
  },
  {
    id: 'VND-005',
    symptom: 'External training record not crediting course completion',
    severity: 'High',
    cause: 'Record not linked to LMS course, or status not "completed", or credit mapping missing.',
    resolution: [
      'Verify external training record has completion_date and status = completed',
      'Check if record is linked to equivalent LMS course',
      'Map external training to LMS course if equivalency exists',
      'Manually update enrollment status if justified',
      'Review credit mapping configuration'
    ],
    prevention: 'Configure external-to-LMS course mapping. Document credit equivalencies.'
  },
  {
    id: 'VND-006',
    symptom: 'Vendor performance score not calculating or showing null',
    severity: 'Medium',
    cause: 'Insufficient reviews, calculation job not running, or scoring formula error.',
    resolution: [
      'Check if vendor has minimum reviews required for scoring (default 5)',
      'Verify performance calculation job is running',
      'Review individual dimension scores (quality, delivery, value)',
      'Manually trigger score recalculation',
      'Check for null values in contributing metrics'
    ],
    prevention: 'Set minimum review thresholds. Schedule regular score recalculation.'
  },
  {
    id: 'VND-007',
    symptom: 'Session waitlist priority not ordering correctly',
    severity: 'Low',
    cause: 'Waitlist priority field not set, or sort order incorrect, or timestamp ties not handled.',
    resolution: [
      'Verify waitlist_priority is populated for all waitlist entries',
      'Check sort order: priority first, then created_at timestamp',
      'Manually adjust priority if business rules require',
      'Review waitlist processing logic for edge cases'
    ],
    prevention: 'Set priority during waitlist addition. Document priority rules to users.'
  },
  {
    id: 'VND-008',
    symptom: 'Vendor contact notification email failing to send',
    severity: 'Medium',
    cause: 'Contact email invalid, notification template missing, or email delivery failure.',
    resolution: [
      'Verify vendor contact email address is valid',
      'Check notification template exists and is active',
      'Review email delivery logs for bounce/failure',
      'Test with different email address',
      'Manually send notification as workaround'
    ],
    prevention: 'Validate contact emails during vendor setup. Monitor email delivery health.'
  },
  {
    id: 'VND-009',
    symptom: 'External certification expiry not being tracked or alerting',
    severity: 'High',
    cause: 'Expiry date not entered, reminder job not running, or certification type not tracked.',
    resolution: [
      'Verify expiry_date is populated on external certification record',
      'Check if certification type is configured for expiry tracking',
      'Verify expiry reminder job is running',
      'Check reminder notification settings',
      'Manually set up reminder for critical certifications'
    ],
    prevention: 'Require expiry date during certification entry. Configure tracking for all cert types.'
  },
  {
    id: 'VND-010',
    symptom: 'Budget deduction not posting after training request approval',
    severity: 'High',
    cause: 'Budget not linked to request, or deduction trigger failed, or budget period mismatch.',
    resolution: [
      'Verify budget_id is assigned to the training request',
      'Check if budget period covers request date',
      'Review budget balance and available funds',
      'Manually post deduction if trigger failed',
      'Check budget transaction log for errors'
    ],
    prevention: 'Link budgets during request creation. Validate budget availability before approval.'
  },
];

const QUICK_REFERENCE = [
  { id: 'VND-002', symptom: 'Session not in request', severity: 'High' },
  { id: 'VND-003', symptom: 'Multi-currency cost error', severity: 'High' },
  { id: 'VND-004', symptom: 'Approval workflow stuck', severity: 'High' },
  { id: 'VND-005', symptom: 'Completion not credited', severity: 'High' },
  { id: 'VND-010', symptom: 'Budget not deducting', severity: 'High' },
];

export function LndExternalVendorIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-8" data-manual-anchor="sec-9-8" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, L&D Admin, HR Partner</span>
          </div>
          <h3 className="text-xl font-semibold">9.8 External Training & Vendor Issues</h3>
          <p className="text-muted-foreground mt-1">
            Vendor courses, sessions, training requests, costs, approvals, and budget integration troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose vendor course catalog visibility issues',
          'Troubleshoot training request and session enrollment linking',
          'Resolve multi-currency cost calculation problems',
          'Fix approval workflow and budget deduction failures',
          'Address external certification tracking and expiry issues'
        ]}
      />

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Vendor Issues Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Issue ID</th>
                  <th className="text-left py-2 font-medium">Symptom</th>
                  <th className="text-left py-2 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2">
                      <Badge variant="outline" className="font-mono">{item.id}</Badge>
                    </td>
                    <td className="py-2">{item.symptom}</td>
                    <td className="py-2">
                      <Badge variant="destructive">{item.severity}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Issue Resolution (10 Issues)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {VENDOR_ISSUES.map((issue) => (
              <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-4 w-4 flex-shrink-0 ${issue.severity === 'High' ? 'text-destructive' : issue.severity === 'Medium' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <Badge variant="outline" className="font-mono">{issue.id}</Badge>
                    <span className="text-sm font-medium">{issue.symptom}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pl-6">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Root Cause</span>
                      <p className="text-sm mt-1">{issue.cause}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolution Steps</span>
                      <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                        {issue.resolution.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Prevention</span>
                        <p className="text-sm mt-1">{issue.prevention}</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <TipCallout title="Vendor Management Best Practice">
        Review vendor performance scores quarterly. Use the vendor scorecard dashboard to identify 
        underperforming vendors and address issues proactively.
      </TipCallout>
    </div>
  );
}
