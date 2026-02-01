import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Scale, Users, GraduationCap, FileText,
  Shield, Gavel, AlertTriangle
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  ComplianceCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationCBARules() {
  const learningObjectives = [
    'Configure collective bargaining agreement (CBA) time rules',
    'Set union-specific overtime and scheduling requirements',
    'Define seniority-based shift bidding rules',
    'Track union hours for compliance reporting',
    'Handle multiple CBAs within one organization'
  ];

  const cbaTimeRuleFields: FieldDefinition[] = [
    { name: 'rule_id', required: true, type: 'uuid', description: 'Unique rule identifier', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'cba_name', required: true, type: 'text', description: 'Name of the CBA/union agreement', defaultValue: '—', validation: 'e.g., "BITU Local 123"' },
    { name: 'cba_code', required: true, type: 'text', description: 'Short code for reporting', defaultValue: '—', validation: 'Unique per company' },
    { name: 'effective_date', required: true, type: 'date', description: 'When agreement takes effect', defaultValue: '—', validation: 'Contract start date' },
    { name: 'expiration_date', required: false, type: 'date', description: 'When agreement expires', defaultValue: 'null', validation: 'Contract end date' },
    { name: 'daily_ot_threshold', required: false, type: 'decimal', description: 'CBA daily overtime hours', defaultValue: '8', validation: 'Overrides company policy' },
    { name: 'weekly_ot_threshold', required: false, type: 'decimal', description: 'CBA weekly overtime hours', defaultValue: '40', validation: 'Overrides company policy' },
    { name: 'ot_rate_tier_1', required: false, type: 'decimal', description: 'First OT tier multiplier', defaultValue: '1.5', validation: 'Typically 1.5x' },
    { name: 'ot_rate_tier_2', required: false, type: 'decimal', description: 'Second OT tier multiplier', defaultValue: '2.0', validation: 'For extended OT' },
    { name: 'sunday_rate', required: false, type: 'decimal', description: 'Sunday work multiplier', defaultValue: 'null', validation: 'Union-specific' },
    { name: 'holiday_rate', required: false, type: 'decimal', description: 'Holiday work multiplier', defaultValue: '2.0', validation: 'Union-specific' },
    { name: 'shift_bid_seniority', required: false, type: 'boolean', description: 'Shift bids by seniority', defaultValue: 'true', validation: 'CBA requirement' },
    { name: 'minimum_rest_hours', required: false, type: 'integer', description: 'Hours between shifts', defaultValue: '8', validation: 'Union rest rules' },
    { name: 'call_in_pay_hours', required: false, type: 'decimal', description: 'Minimum call-in hours', defaultValue: '4', validation: 'Minimum guaranteed' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Agreement is in effect', defaultValue: 'true', validation: 'Deactivate when expired' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'CBA Overrides Company Policy',
      enforcement: 'System',
      description: 'For employees covered by a CBA, the CBA time rules override company-wide attendance policies. CBA rules take precedence.'
    },
    {
      rule: 'Multiple CBA Support',
      enforcement: 'System',
      description: 'Different employee groups can be assigned to different CBAs. The system tracks and applies the correct rules per employee.'
    },
    {
      rule: 'Seniority Enforcement',
      enforcement: 'System',
      description: 'When shift_bid_seniority is enabled, shift bidding and overtime offers prioritize by employee seniority (hire date or union date).'
    },
    {
      rule: 'Rest Period Validation',
      enforcement: 'System',
      description: 'System warns when scheduling would violate minimum_rest_hours between shifts. Can be configured to block or warn only.'
    },
    {
      rule: 'Guaranteed Minimums',
      enforcement: 'System',
      description: 'Call-in pay and minimum shift hours are automatically calculated per CBA rules when employee is called in.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Create CBA Configuration',
      description: 'Navigate to CBA rules and create a new collective bargaining agreement entry.',
      notes: ['Time & Attendance → Setup → CBA/Union Rules → Add']
    },
    {
      title: 'Enter Agreement Details',
      description: 'Provide CBA name, code, effective dates, and union identifier.',
      notes: ['Use official agreement name and dates']
    },
    {
      title: 'Configure Overtime Rules',
      description: 'Set CBA-specific daily/weekly thresholds and rate multipliers.',
      notes: ['These override company default policies']
    },
    {
      title: 'Set Premium Rates',
      description: 'Configure Sunday, holiday, and night shift premium rates per the agreement.',
      notes: ['Verify rates match signed CBA document']
    },
    {
      title: 'Configure Scheduling Rules',
      description: 'Enable seniority-based bidding, minimum rest hours, and call-in minimums.',
      notes: ['Critical for union compliance']
    },
    {
      title: 'Assign Employees to CBA',
      description: 'Link union member employees to this CBA configuration.',
      notes: ['Can assign by department, job, or individual']
    }
  ];

  return (
    <Card id="ta-sec-2-15" data-manual-anchor="ta-sec-2-15" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.15</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">CBA/Union Time Rules</CardTitle>
        <CardDescription>
          Collective bargaining agreement overtime, scheduling, and seniority rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">What Are CBA Time Rules?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Collective Bargaining Agreements (CBAs) are contracts between employers and 
                unions that define work rules, including overtime calculation, scheduling 
                rights, premium pay, and rest periods. These rules often differ from 
                standard company policies and take legal precedence for covered employees. 
                The system supports multiple CBAs and ensures correct rules are applied 
                automatically based on employee union membership.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="CBA Configuration Screen"
          caption="CBA rule setup showing overtime thresholds, premium rates, and scheduling rules"
        />

        {/* CBA vs Company Policy */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            CBA vs. Company Policy Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Rule</th>
                  <th className="text-left p-3 font-medium">Company Policy</th>
                  <th className="text-left p-3 font-medium">Example CBA</th>
                  <th className="text-left p-3 font-medium">Which Applies?</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { rule: 'Daily OT threshold', company: '8 hours', cba: '7.5 hours', applies: 'CBA (7.5)' },
                  { rule: 'OT rate', company: '1.5x', cba: '1.75x', applies: 'CBA (1.75x)' },
                  { rule: 'Sunday premium', company: 'None', cba: '2x', applies: 'CBA (2x)' },
                  { rule: 'Shift bidding', company: 'Manager assigns', cba: 'Seniority-based', applies: 'CBA (Seniority)' },
                  { rule: 'Minimum rest', company: '8 hours', cba: '11 hours', applies: 'CBA (11 hours)' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.rule}</td>
                    <td className="p-3 text-muted-foreground">{row.company}</td>
                    <td className="p-3 text-muted-foreground">{row.cba}</td>
                    <td className="p-3 font-medium text-primary">{row.applies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={cbaTimeRuleFields}
          title="cba_time_rules Table Fields"
        />

        {/* Compliance Callout */}
        <ComplianceCallout>
          <strong>Legal Obligation:</strong> CBA violations can result in union grievances, 
          arbitration, back-pay awards, and damaged labor relations. The time system must 
          enforce CBA rules exactly as written. Have your labor relations team verify all 
          CBA configurations before go-live.
        </ComplianceCallout>

        {/* Business Rules */}
        <BusinessRules rules={businessRules} />

        {/* Configuration Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Step-by-Step Configuration
          </h3>
          <StepByStep steps={configurationSteps} />
        </div>

        {/* Union Reporting */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Union Reporting Capabilities
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { report: 'Union Hours Report', desc: 'Total hours worked by CBA-covered employees' },
              { report: 'OT Distribution Report', desc: 'Overtime hours by seniority for fairness review' },
              { report: 'Shift Bid Audit', desc: 'Verify bids were awarded by seniority' },
              { report: 'Rest Violation Report', desc: 'Instances where minimum rest was not met' },
              { report: 'Premium Pay Summary', desc: 'Sunday, holiday, and shift premiums paid' },
              { report: 'CBA Expiration Alert', desc: 'Upcoming CBA expirations for renegotiation' }
            ].map((item, i) => (
              <div key={i} className="p-3 border rounded-lg bg-muted/30">
                <div className="font-medium text-sm">{item.report}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <WarningCallout>
          <strong>CBA Expiration:</strong> When a CBA expires, the system continues applying 
          the last active rules until a new agreement is configured or the CBA is deactivated. 
          Set up expiration alerts to ensure timely updates when contracts are renewed.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Documentation:</strong> Upload a copy of the signed CBA document to the 
          system and link it to the configuration. This provides a reference for auditors 
          and helps resolve disputes about intended rule interpretation.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
