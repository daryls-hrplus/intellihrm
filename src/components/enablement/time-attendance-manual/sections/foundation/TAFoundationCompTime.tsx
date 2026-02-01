import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Timer, Wallet, GraduationCap, Scale,
  Calendar, RefreshCw
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  ComplianceCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationCompTime() {
  const learningObjectives = [
    'Configure compensatory time (comp time) policies',
    'Set accrual rates and maximum balance limits',
    'Define comp time expiration and carry-over rules',
    'Understand comp time vs. overtime pay decisions',
    'Track comp time balances and usage'
  ];

  const compTimePolicyFields: FieldDefinition[] = [
    { name: 'policy_id', required: true, type: 'uuid', description: 'Unique policy identifier', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'policy_name', required: true, type: 'text', description: 'Descriptive policy name', defaultValue: '—', validation: 'e.g., "Standard Comp Time"' },
    { name: 'accrual_rate', required: true, type: 'decimal', description: 'Hours earned per OT hour', defaultValue: '1.0', validation: '1.0 = hour for hour, 1.5 = time and a half' },
    { name: 'max_balance_hours', required: false, type: 'decimal', description: 'Maximum accrued balance', defaultValue: '80', validation: 'Typical: 40-160 hours' },
    { name: 'use_by_days', required: false, type: 'integer', description: 'Days to use after earning', defaultValue: '180', validation: 'null = never expires' },
    { name: 'carry_over_limit_hours', required: false, type: 'decimal', description: 'Hours carried to next year', defaultValue: '40', validation: 'null = full carry-over' },
    { name: 'allow_cash_out', required: false, type: 'boolean', description: 'Can exchange for pay', defaultValue: 'false', validation: 'Payout at termination' },
    { name: 'min_usage_hours', required: false, type: 'decimal', description: 'Minimum hours per request', defaultValue: '1', validation: 'Prevents micro-usage' },
    { name: 'advance_notice_days', required: false, type: 'integer', description: 'Days before to request', defaultValue: '3', validation: 'Manager approval lead time' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Policy is in effect', defaultValue: 'true', validation: 'Deactivate to disable' }
  ];

  const compTimeBalanceFields: FieldDefinition[] = [
    { name: 'balance_id', required: true, type: 'uuid', description: 'Unique balance record', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'employee_id', required: true, type: 'uuid', description: 'Employee owning balance', defaultValue: '—', validation: 'Must reference valid employee' },
    { name: 'policy_id', required: true, type: 'uuid', description: 'Comp time policy applied', defaultValue: '—', validation: 'Must reference valid policy' },
    { name: 'current_balance_hours', required: true, type: 'decimal', description: 'Current available balance', defaultValue: '0', validation: 'Real-time calculated' },
    { name: 'total_accrued_hours', required: true, type: 'decimal', description: 'All-time earned total', defaultValue: '0', validation: 'Running total' },
    { name: 'total_used_hours', required: true, type: 'decimal', description: 'All-time usage total', defaultValue: '0', validation: 'Running total' },
    { name: 'total_expired_hours', required: false, type: 'decimal', description: 'Hours lost to expiry', defaultValue: '0', validation: 'Audit trail' },
    { name: 'last_accrual_date', required: false, type: 'date', description: 'Last earnings date', defaultValue: 'null', validation: 'Auto-updated' },
    { name: 'last_usage_date', required: false, type: 'date', description: 'Last usage date', defaultValue: 'null', validation: 'Auto-updated' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Comp Time Election',
      enforcement: 'Policy',
      description: 'Employees may choose comp time instead of overtime pay when policy allows. Election must be made before OT is worked in some jurisdictions.'
    },
    {
      rule: 'Balance Cap Enforcement',
      enforcement: 'System',
      description: 'Once max_balance_hours is reached, additional overtime is paid as wages, not accrued as comp time.'
    },
    {
      rule: 'FIFO Expiration',
      enforcement: 'System',
      description: 'Comp time is used in first-in-first-out order. Oldest accrued hours are used first and expire first.'
    },
    {
      rule: 'Year-End Carry-Over',
      enforcement: 'System',
      description: 'At fiscal year end, hours exceeding carry_over_limit are either paid out or forfeited based on policy configuration.'
    },
    {
      rule: 'Termination Payout',
      enforcement: 'System',
      description: 'Upon termination, unused comp time balance is paid out at the higher of: current rate or rate when earned.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Create Comp Time Policy',
      description: 'Navigate to comp time settings and create a new policy.',
      notes: ['Time & Attendance → Setup → Comp Time Policies → Add']
    },
    {
      title: 'Set Accrual Rate',
      description: 'Define how many comp hours are earned per overtime hour worked.',
      notes: ['1.5 = earns 1.5 comp hours per OT hour (matches OT rate)']
    },
    {
      title: 'Configure Balance Limits',
      description: 'Set maximum balance and annual carry-over limits.',
      notes: ['Federal limit: 240 hours for non-exempt employees']
    },
    {
      title: 'Set Expiration Rules',
      description: 'Define how long employees have to use accrued comp time.',
      notes: ['180 days common; check collective bargaining agreements']
    },
    {
      title: 'Assign Policy to Employees',
      description: 'Link the policy to eligible employees or job positions.',
      notes: ['Only non-exempt employees typically qualify']
    },
    {
      title: 'Communicate to Employees',
      description: 'Notify eligible employees of comp time option and ESS usage.',
      notes: ['Include expiration warnings in communications']
    }
  ];

  return (
    <Card id="ta-sec-2-11" data-manual-anchor="ta-sec-2-11" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.11</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>9 min read</span>
        </div>
        <CardTitle className="text-2xl">Comp Time Policies</CardTitle>
        <CardDescription>
          Compensatory time accrual, balances, expiration, and usage rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">What Is Compensatory Time?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compensatory time (comp time) allows employees to earn paid time off instead 
                of overtime wages for extra hours worked. For example, working 2 hours of 
                overtime might earn 3 hours of comp time (at 1.5x rate). The employee can 
                later use this banked time for paid time off. Comp time policies define 
                accrual rates, maximum balances, and expiration rules.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Comp Time Policy Configuration"
          caption="Comp time policy setup showing accrual rates, limits, and expiration settings"
        />

        {/* Comp Time vs OT Pay */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Comp Time vs. Overtime Pay
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-500/5 border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-700 dark:text-green-400">Comp Time</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Earn time off instead of money</li>
                <li>• Accrues at policy-defined rate</li>
                <li>• Subject to balance limits</li>
                <li>• May expire if unused</li>
                <li>• Good for work-life balance</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-700 dark:text-blue-400">Overtime Pay</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Receive extra wages in paycheck</li>
                <li>• Paid at OT rate (1.5x, 2x)</li>
                <li>• No balance tracking needed</li>
                <li>• Never expires</li>
                <li>• Good for immediate income</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Field Reference Tables */}
        <FieldReferenceTable 
          fields={compTimePolicyFields}
          title="comp_time_policies Table Fields"
        />

        <FieldReferenceTable 
          fields={compTimeBalanceFields}
          title="comp_time_balances Table Fields"
        />

        {/* Compliance Callout */}
        <ComplianceCallout>
          <strong>Legal Restrictions:</strong> Comp time is heavily regulated. In the US, 
          private sector employers generally cannot offer comp time in lieu of OT pay (FLSA). 
          Public sector and some jurisdictions allow it with restrictions. Always verify 
          local labor law compliance before enabling comp time policies.
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

        {/* Balance Calculation Example */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Balance Calculation Example
          </h3>
          <div className="p-4 bg-muted/30 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Employee works 10 hours overtime in a week with 1.5x comp time accrual:
            </p>
            <div className="grid md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="font-medium text-blue-700 dark:text-blue-400">OT Worked</div>
                <div className="text-2xl font-bold">10 hrs</div>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="font-medium text-green-700 dark:text-green-400">Accrual Rate</div>
                <div className="text-2xl font-bold">1.5x</div>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="font-medium text-amber-700 dark:text-amber-400">Comp Earned</div>
                <div className="text-2xl font-bold">15 hrs</div>
                <div className="text-xs text-muted-foreground">10 × 1.5</div>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="font-medium text-primary">New Balance</div>
                <div className="text-2xl font-bold">35 hrs</div>
                <div className="text-xs text-muted-foreground">20 prior + 15 new</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <InfoCallout>
          <strong>ESS Balance View:</strong> Employees can view their comp time balance, 
          upcoming expirations, and request time off using comp time through the Employee 
          Self-Service portal. Balance is updated in real-time after each pay period.
        </InfoCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Expiration Notifications:</strong> Configure automated email notifications 
          to warn employees 30 days before comp time expires. This reduces forfeiture and 
          improves employee satisfaction with the program.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
