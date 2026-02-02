import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, DollarSign, Calculator, CheckCircle,
  GraduationCap, Calendar, AlertTriangle, Percent
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  ComplianceCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAShiftPaymentRules() {
  const learningObjectives = [
    'Configure shift payment rules for premium pay calculations',
    'Understand payment types: percentage, flat rate, multiplier',
    'Apply rules to specific shifts, days, or time ranges',
    'Set up priority-based rule processing for overlapping conditions',
    'Integrate payment rules with Payroll earning types'
  ];

  const shiftPaymentRulesFields: FieldDefinition[] = [
    { name: 'name', required: true, type: 'varchar(100)', description: 'Rule display name', defaultValue: '—', validation: 'Max 100 characters' },
    { name: 'code', required: true, type: 'varchar(50)', description: 'Unique rule code for payroll integration', defaultValue: '—', validation: 'Alphanumeric, unique per company' },
    { name: 'description', required: false, type: 'text', description: 'Detailed rule description', defaultValue: 'null', validation: '—' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company this rule belongs to', defaultValue: '—', validation: 'FK to companies' },
    { name: 'shift_id', required: false, type: 'uuid', description: 'Apply to specific shift, or null for all shifts', defaultValue: 'null', validation: 'FK to shifts (nullable)' },
    { name: 'payment_type', required: true, type: 'enum', description: 'How premium is calculated', defaultValue: '—', validation: 'percentage, flat_rate, multiplier' },
    { name: 'amount', required: true, type: 'numeric(10,2)', description: 'Amount value (% or $ or X)', defaultValue: '—', validation: 'Positive number' },
    { name: 'applies_to', required: true, type: 'enum', description: 'Which hours this premium applies to', defaultValue: '—', validation: 'all_hours, overtime, night_shift, weekend, holiday' },
    { name: 'day_of_week', required: false, type: 'integer[]', description: 'Restrict to specific days (0=Sun, 6=Sat)', defaultValue: 'null', validation: 'Array of 0-6' },
    { name: 'start_time', required: false, type: 'time', description: 'Time range start for premium', defaultValue: 'null', validation: 'HH:MM:SS' },
    { name: 'end_time', required: false, type: 'time', description: 'Time range end for premium', defaultValue: 'null', validation: 'HH:MM:SS' },
    { name: 'minimum_hours_threshold', required: false, type: 'numeric(4,2)', description: 'Min hours worked before rule applies', defaultValue: 'null', validation: '0-24' },
    { name: 'is_taxable', required: false, type: 'boolean', description: 'Whether this payment is taxable', defaultValue: 'true', validation: 'true/false' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Rule is active and enforced', defaultValue: 'true', validation: 'true/false' },
    { name: 'priority', required: false, type: 'integer', description: 'Processing order (higher = first)', defaultValue: '0', validation: '0-100' },
    { name: 'start_date', required: true, type: 'date', description: 'Rule effective from date', defaultValue: 'CURRENT_DATE', validation: '—' },
    { name: 'end_date', required: false, type: 'date', description: 'Rule expiration date', defaultValue: 'null', validation: 'Must be > start_date' },
    { name: 'earning_type_id', required: false, type: 'uuid', description: 'Link to payroll earning type', defaultValue: 'null', validation: 'FK to earning_types' },
    { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()', validation: 'Auto-generated' },
    { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last modification timestamp', defaultValue: 'now()', validation: 'Auto-updated' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Payment Type Calculation',
      enforcement: 'System',
      description: 'Percentage adds X% to base rate. Flat_rate adds fixed $ amount per hour. Multiplier multiplies base rate (e.g., 1.5 = time-and-a-half).'
    },
    {
      rule: 'Applies-To Scope',
      enforcement: 'System',
      description: 'Rules with applies_to="overtime" only affect hours exceeding OT threshold. "all_hours" affects every worked hour matching other conditions.'
    },
    {
      rule: 'Time Range Spanning Midnight',
      enforcement: 'System',
      description: 'If start_time > end_time (e.g., 22:00 to 06:00), the system treats it as a night shift crossing midnight.'
    },
    {
      rule: 'Priority-Based Stacking',
      enforcement: 'Policy',
      description: 'Multiple rules can apply to the same hours. Higher priority rules are processed first. Set stacking behavior in payroll configuration.'
    },
    {
      rule: 'Payroll Integration',
      enforcement: 'System',
      description: 'Each payment rule should map to an earning_type for proper payroll line items. Unmapped rules appear as "Other Premium" in payroll.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Access Payment Rules',
      description: 'Navigate to Time & Attendance → Shifts → Payment Rules from the main menu.',
      notes: ['UI Path: /time-attendance/shifts/payment-rules']
    },
    {
      title: 'Create New Payment Rule',
      description: 'Click "Add Payment Rule" and enter a descriptive name and unique code (e.g., "Night Shift Premium", "NIGHT_PREM").',
      notes: ['Code is used for payroll integration and reporting']
    },
    {
      title: 'Select Payment Type',
      description: 'Choose percentage (adds X%), flat_rate (adds $X/hour), or multiplier (X times base rate).',
      notes: ['Multiplier of 1.5 = time-and-a-half; 2.0 = double time']
    },
    {
      title: 'Set Amount',
      description: 'Enter the numeric value. For percentage: 10 = 10%. For flat_rate: 5.00 = $5/hr. For multiplier: 1.5 = 1.5x.',
      notes: ['Ensure amount aligns with payment_type selected']
    },
    {
      title: 'Configure Applies-To',
      description: 'Select which hours trigger this premium: all_hours, overtime, night_shift, weekend, or holiday.',
      notes: ['Holiday rules require holiday calendar configuration']
    },
    {
      title: 'Set Day/Time Restrictions (Optional)',
      description: 'Restrict to specific days (e.g., Saturday/Sunday for weekend premium) or time ranges (e.g., 22:00-06:00 for night premium).',
      notes: ['Leave blank to apply to all days/times matching applies_to']
    },
    {
      title: 'Assign to Shift (Optional)',
      description: 'Leave shift blank for company-wide rule, or select a specific shift for targeted premium.',
      notes: ['Shift-specific rules override company-wide rules']
    },
    {
      title: 'Link to Earning Type',
      description: 'Associate with a payroll earning type for proper categorization in pay statements.',
      notes: ['Create earning types in Payroll → Earnings Configuration first']
    }
  ];

  return (
    <Card id="ta-sec-3-8" data-manual-anchor="ta-sec-3-8" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.8</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>14 min read</span>
        </div>
        <CardTitle className="text-2xl">Shift Payment Rules Configuration</CardTitle>
        <CardDescription>
          Premium pay rules for shift differentials, overtime multipliers, and special payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">What Are Payment Rules?</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Payment rules define premium pay calculations for specific work conditions. They 
                automatically add differentials for night shifts, weekends, holidays, or overtime 
                based on configurable conditions. Rules integrate directly with payroll to create 
                accurate earning line items.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Night Shift Premium</Badge>
                <Badge variant="secondary">Weekend Differential</Badge>
                <Badge variant="secondary">Holiday Pay</Badge>
                <Badge variant="secondary">Overtime Multiplier</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Shift Payment Rules Configuration Screen"
          caption="Payment rule setup showing payment type, amount, and applies-to configuration"
        />

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={shiftPaymentRulesFields}
          title="shift_payment_rules Table Fields"
        />

        {/* Payment Types Explained */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Payment Types Explained
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border-green-500/30 border rounded-lg bg-green-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-700 dark:text-green-400">Percentage</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Adds a percentage of base rate as premium.
              </p>
              <div className="text-xs font-mono bg-background p-2 rounded border">
                Base: $20/hr + 10% = $22/hr
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use for: Shift differentials, skill premiums
              </p>
            </div>
            <div className="p-4 border-blue-500/30 border rounded-lg bg-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-700 dark:text-blue-400">Flat Rate</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Adds a fixed dollar amount per hour.
              </p>
              <div className="text-xs font-mono bg-background p-2 rounded border">
                Base: $20/hr + $3.00 = $23/hr
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use for: Union premiums, hazard pay
              </p>
            </div>
            <div className="p-4 border-purple-500/30 border rounded-lg bg-purple-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-700 dark:text-purple-400">Multiplier</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Multiplies base rate by factor.
              </p>
              <div className="text-xs font-mono bg-background p-2 rounded border">
                Base: $20/hr × 1.5 = $30/hr
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use for: Overtime, double-time, holiday pay
              </p>
            </div>
          </div>
        </div>

        {/* Applies-To Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Applies-To Categories
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                category: 'all_hours',
                description: 'Applies to every hour worked matching other conditions',
                example: 'Night shift premium for all hours between 22:00-06:00',
                color: 'green'
              },
              {
                category: 'overtime',
                description: 'Only hours exceeding daily/weekly OT threshold',
                example: '1.5x multiplier for hours over 40/week',
                color: 'blue'
              },
              {
                category: 'night_shift',
                description: 'Hours worked during configured night shift range',
                example: '10% premium for 22:00-06:00',
                color: 'purple'
              },
              {
                category: 'weekend',
                description: 'Hours worked on Saturday or Sunday',
                example: '$2/hr flat rate for weekend work',
                color: 'amber'
              },
              {
                category: 'holiday',
                description: 'Hours worked on company-defined holidays',
                example: '2.0x multiplier for public holidays',
                color: 'red'
              }
            ].map((item, i) => (
              <div key={i} className={`p-4 border rounded-lg bg-${item.color}-500/5 border-${item.color}-500/30`}>
                <h4 className="font-medium font-mono text-sm mb-1">{item.category}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <p className="text-xs italic text-muted-foreground">Example: {item.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Warning */}
        <ComplianceCallout>
          <strong>Labor Law Compliance:</strong> Many jurisdictions mandate minimum overtime rates 
          (typically 1.5x for overtime, 2.0x for holidays). Ensure your payment rules meet or exceed 
          local labor law requirements. Caribbean and African jurisdictions vary significantly—consult 
          local counsel.
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

        {/* Priority and Stacking */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Rule Priority & Stacking
          </h3>
          <div className="p-4 bg-muted/30 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              When multiple payment rules could apply (e.g., night shift + overtime + weekend), 
              the system processes rules in priority order:
            </p>
            <ol className="space-y-2 mb-4">
              {[
                { level: '1st', desc: 'Shift-specific rules with highest priority value' },
                { level: '2nd', desc: 'Company-wide rules with highest priority value' },
                { level: '3rd', desc: 'Rules with matching applies_to category' },
                { level: '4th', desc: 'Default overtime calculations from attendance policy' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0">{item.level}</Badge>
                  <span className="text-muted-foreground">{item.desc}</span>
                </li>
              ))}
            </ol>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Stacking Behavior:</strong> By default, premiums stack (night + weekend = 
                both applied). Configure exclusive rules in Payroll settings if only the highest 
                premium should apply.
              </p>
            </div>
          </div>
        </div>

        {/* Common Configurations */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Common Payment Rule Configurations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Rule Name</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Applies To</th>
                  <th className="text-left p-3 font-medium">Conditions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { name: 'Overtime 1.5x', type: 'multiplier', amount: '1.5', applies: 'overtime', conditions: 'Hours > 40/week' },
                  { name: 'Double Time', type: 'multiplier', amount: '2.0', applies: 'holiday', conditions: 'Public holidays' },
                  { name: 'Night Differential', type: 'percentage', amount: '10%', applies: 'night_shift', conditions: '22:00-06:00' },
                  { name: 'Weekend Premium', type: 'flat_rate', amount: '$2.00', applies: 'weekend', conditions: 'Sat-Sun' },
                  { name: 'Hazard Pay', type: 'flat_rate', amount: '$5.00', applies: 'all_hours', conditions: 'Hazard shift only' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.name}</td>
                    <td className="p-3 text-muted-foreground">{row.type}</td>
                    <td className="p-3 text-muted-foreground">{row.amount}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{row.applies}</Badge></td>
                    <td className="p-3 text-muted-foreground text-xs">{row.conditions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tip */}
        <TipCallout>
          <strong>Payroll Integration:</strong> Create earning types in Payroll → Earnings 
          Configuration before setting up payment rules. Link each payment rule to an earning 
          type so premiums appear as separate line items on pay statements (e.g., "Night 
          Differential: $45.00" instead of lumped into base pay).
        </TipCallout>

        {/* Cross-Reference */}
        <div className="p-4 border-l-4 border-blue-500 bg-blue-500/5 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Cross-Reference: Related Configurations</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• <strong>Section 2.4 (Overtime Rate Tiers):</strong> Base OT threshold configuration</li>
                <li>• <strong>Section 3.6 (Shift Differentials):</strong> Alternative differential setup</li>
                <li>• <strong>Payroll → Earnings:</strong> Earning type creation for integration</li>
                <li>• <strong>Company → Holidays:</strong> Holiday calendar for holiday pay rules</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
