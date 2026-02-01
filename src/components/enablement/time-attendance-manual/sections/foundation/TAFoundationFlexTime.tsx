import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Workflow, Timer, GraduationCap,
  ArrowLeftRight, Calendar, TrendingUp
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  InfoCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationFlexTime() {
  const learningObjectives = [
    'Configure flexible working hours policies',
    'Define core hours vs. flex bands',
    'Set up flex time balance tracking',
    'Understand credit/debit flex time systems',
    'Manage flex time settlement periods'
  ];

  const flexTimeBalanceFields: FieldDefinition[] = [
    { name: 'balance_id', required: true, type: 'uuid', description: 'Unique balance record', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'employee_id', required: true, type: 'uuid', description: 'Employee owning balance', defaultValue: '—', validation: 'Must reference valid employee' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'period_start', required: true, type: 'date', description: 'Settlement period start', defaultValue: '—', validation: 'Usually month start' },
    { name: 'period_end', required: true, type: 'date', description: 'Settlement period end', defaultValue: '—', validation: 'Usually month end' },
    { name: 'expected_hours', required: true, type: 'decimal', description: 'Target hours for period', defaultValue: '160', validation: 'Based on working days' },
    { name: 'actual_hours', required: true, type: 'decimal', description: 'Hours actually worked', defaultValue: '0', validation: 'Running total' },
    { name: 'balance_hours', required: true, type: 'decimal', description: 'Credit/debit balance', defaultValue: '0', validation: 'Positive = credit, Negative = debit' },
    { name: 'carry_forward_hours', required: false, type: 'decimal', description: 'Balance from prior period', defaultValue: '0', validation: 'Subject to limits' },
    { name: 'max_credit_hours', required: false, type: 'decimal', description: 'Maximum positive balance', defaultValue: '20', validation: 'Per policy' },
    { name: 'max_debit_hours', required: false, type: 'decimal', description: 'Maximum negative balance', defaultValue: '10', validation: 'Per policy' },
    { name: 'is_settled', required: false, type: 'boolean', description: 'Period is closed', defaultValue: 'false', validation: 'Auto-set at period end' }
  ];

  const flexTimeTransactionFields: FieldDefinition[] = [
    { name: 'transaction_id', required: true, type: 'uuid', description: 'Unique transaction ID', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'balance_id', required: true, type: 'uuid', description: 'Parent balance record', defaultValue: '—', validation: 'Links to period' },
    { name: 'transaction_date', required: true, type: 'date', description: 'Date of transaction', defaultValue: '—', validation: 'Work date' },
    { name: 'transaction_type', required: true, type: 'enum', description: 'Type of flex transaction', defaultValue: 'worked', validation: 'worked, adjustment, carry_forward, settlement' },
    { name: 'expected_hours', required: true, type: 'decimal', description: 'Expected hours for day', defaultValue: '8', validation: 'Based on schedule' },
    { name: 'actual_hours', required: true, type: 'decimal', description: 'Hours actually worked', defaultValue: '—', validation: 'From time entries' },
    { name: 'delta_hours', required: true, type: 'decimal', description: 'Difference (+ or -)', defaultValue: '—', validation: 'actual - expected' },
    { name: 'notes', required: false, type: 'text', description: 'Reason for adjustment', defaultValue: 'null', validation: 'Manual adjustments' },
    { name: 'created_by', required: false, type: 'uuid', description: 'User who created', defaultValue: 'null', validation: 'For manual entries' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Core Hours Requirement',
      enforcement: 'System',
      description: 'Employees must be present during core hours (e.g., 10:00-15:00). Absences during core hours are flagged as exceptions regardless of total daily hours.'
    },
    {
      rule: 'Daily Balance Calculation',
      enforcement: 'System',
      description: 'Each day calculates delta_hours = actual_hours - expected_hours. Positive = credit (worked extra), Negative = debit (worked less).'
    },
    {
      rule: 'Balance Cap Enforcement',
      enforcement: 'System',
      description: 'Flex balance cannot exceed max_credit_hours or go below -max_debit_hours. Excess hours convert to overtime or are forfeited per policy.'
    },
    {
      rule: 'Period Settlement',
      enforcement: 'System',
      description: 'At period end, flex balance is settled. Carry-forward is subject to limits. Excess negative balance may trigger leave deduction.'
    },
    {
      rule: 'Minimum Daily Hours',
      enforcement: 'Advisory',
      description: 'Even with flex time, most policies require minimum daily hours (e.g., 6 hours) to be considered a working day.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Enable Flex Time for Company',
      description: 'Navigate to time settings and enable flex time tracking.',
      notes: ['Time & Attendance → Setup → Flex Time Configuration']
    },
    {
      title: 'Define Core Hours',
      description: 'Set the hours when employees must be present (e.g., 10:00-15:00).',
      notes: ['Core hours are non-negotiable attendance requirements']
    },
    {
      title: 'Set Flex Bands',
      description: 'Define flexible start/end windows (e.g., start 07:00-10:00, end 15:00-19:00).',
      notes: ['Employees choose within these windows']
    },
    {
      title: 'Configure Balance Limits',
      description: 'Set maximum credit and debit hours per settlement period.',
      notes: ['Typical: +20/-10 hours per month']
    },
    {
      title: 'Set Settlement Period',
      description: 'Choose weekly, bi-weekly, or monthly settlement cycles.',
      notes: ['Monthly is most common for flex time']
    },
    {
      title: 'Assign to Employees',
      description: 'Enable flex time for eligible employees or job positions.',
      notes: ['Exclude shift workers who need fixed schedules']
    }
  ];

  return (
    <Card id="ta-sec-2-12" data-manual-anchor="ta-sec-2-12" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.12</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>9 min read</span>
        </div>
        <CardTitle className="text-2xl">Flex Time Configuration</CardTitle>
        <CardDescription>
          Flexible working hours, core time, flex bands, and balance tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Understanding Flex Time</h3>
              <p className="text-muted-foreground leading-relaxed">
                Flex time allows employees to vary their work hours while maintaining 
                productivity. Instead of rigid 9-5 schedules, employees work during 
                flexible "bands" around mandatory "core hours." Daily hours can vary 
                as long as the monthly total balances out. Extra hours create "credit," 
                while shorter days create "debit." The system tracks this balance 
                and settles it each period.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Flex Time Balance Dashboard"
          caption="Employee flex time balance showing daily transactions and period summary"
        />

        {/* Flex Time Model Diagram */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Flex Time Day Structure
          </h3>
          <div className="p-4 bg-muted/30 border rounded-lg">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
            </div>
            <div className="flex h-10 rounded-lg overflow-hidden border">
              <div className="w-[16.7%] bg-blue-500/20 flex items-center justify-center text-xs font-medium">
                Flex Band
              </div>
              <div className="w-[16.7%] bg-blue-500/40 flex items-center justify-center text-xs font-medium">
                Flex In
              </div>
              <div className="flex-1 bg-primary/40 flex items-center justify-center text-xs font-medium text-primary-foreground">
                Core Hours (10:00-15:00)
              </div>
              <div className="w-[16.7%] bg-blue-500/40 flex items-center justify-center text-xs font-medium">
                Flex Out
              </div>
              <div className="w-[8.3%] bg-blue-500/20 flex items-center justify-center text-xs font-medium">
                Flex
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500/30" />
                <span>Flexible (choose start/end)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary/40" />
                <span>Core (must be present)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Field Reference Tables */}
        <FieldReferenceTable 
          fields={flexTimeBalanceFields}
          title="flex_time_balances Table Fields"
        />

        <FieldReferenceTable 
          fields={flexTimeTransactionFields}
          title="flex_time_transactions Table Fields"
        />

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

        {/* Balance Example */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weekly Flex Balance Example
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Day</th>
                  <th className="text-right p-3 font-medium">Expected</th>
                  <th className="text-right p-3 font-medium">Worked</th>
                  <th className="text-right p-3 font-medium">Delta</th>
                  <th className="text-right p-3 font-medium">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { day: 'Monday', expected: 8, worked: 9, delta: '+1', balance: '+1' },
                  { day: 'Tuesday', expected: 8, worked: 8.5, delta: '+0.5', balance: '+1.5' },
                  { day: 'Wednesday', expected: 8, worked: 7, delta: '-1', balance: '+0.5' },
                  { day: 'Thursday', expected: 8, worked: 9, delta: '+1', balance: '+1.5' },
                  { day: 'Friday', expected: 8, worked: 6.5, delta: '-1.5', balance: '0' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.day}</td>
                    <td className="p-3 text-right text-muted-foreground">{row.expected}h</td>
                    <td className="p-3 text-right text-muted-foreground">{row.worked}h</td>
                    <td className={`p-3 text-right font-medium ${row.delta.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {row.delta}h
                    </td>
                    <td className={`p-3 text-right font-medium ${row.balance.startsWith('+') ? 'text-green-600' : row.balance === '0' ? '' : 'text-red-600'}`}>
                      {row.balance}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Employee varies hours daily but ends the week balanced at 40 hours total.
          </p>
        </div>

        {/* Info */}
        <InfoCallout>
          <strong>ESS Flex Dashboard:</strong> Employees can view their real-time flex balance 
          in the Employee Self-Service portal. The dashboard shows daily breakdown, period 
          target, and warnings when approaching balance limits.
        </InfoCallout>

        {/* Warning */}
        <WarningCallout>
          <strong>Negative Balance at Period End:</strong> If an employee ends a settlement 
          period with a negative flex balance beyond carry-forward limits, the deficit is 
          typically deducted from leave balance or flagged for payroll adjustment. Configure 
          this behavior in policy settings.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Manager Visibility:</strong> Managers can view team flex balances on the 
          MSS dashboard. This helps identify employees who consistently run negative (may 
          need workload adjustment) or positive (may need encouragement to use time off).
        </TipCallout>
      </CardContent>
    </Card>
  );
}
