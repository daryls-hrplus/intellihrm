import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, DollarSign, GraduationCap, Scale, Calculator,
  AlertTriangle
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

export function TAFoundationOvertimeRates() {
  const learningObjectives = [
    'Configure tiered overtime rate structures (1.5x, 2x, 3x)',
    'Set daily vs. weekly overtime thresholds',
    'Define holiday and weekend premium rates',
    'Understand overtime calculation order and stacking rules',
    'Align overtime configuration with local labor laws'
  ];

  const overtimeRateTierFields: FieldDefinition[] = [
    { name: 'tier_id', required: true, type: 'uuid', description: 'Unique tier identifier', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'tier_name', required: true, type: 'text', description: 'Descriptive name for tier', defaultValue: '—', validation: 'e.g., "Standard OT 1.5x"' },
    { name: 'tier_code', required: true, type: 'text', description: 'Short code for payroll export', defaultValue: '—', validation: 'e.g., "OT1", "OT2", "DT"' },
    { name: 'multiplier', required: true, type: 'decimal', description: 'Pay rate multiplier', defaultValue: '1.5', validation: '1.0-4.0 typical' },
    { name: 'threshold_type', required: true, type: 'enum', description: 'How threshold is measured', defaultValue: 'daily', validation: 'daily, weekly, consecutive_days' },
    { name: 'threshold_hours', required: true, type: 'decimal', description: 'Hours before tier applies', defaultValue: '8', validation: '0-168' },
    { name: 'max_hours', required: false, type: 'decimal', description: 'Maximum hours at this tier', defaultValue: 'null', validation: 'null = unlimited' },
    { name: 'applies_to_weekdays', required: false, type: 'boolean', description: 'Apply to Mon-Fri', defaultValue: 'true', validation: 'true/false' },
    { name: 'applies_to_weekends', required: false, type: 'boolean', description: 'Apply to Sat-Sun', defaultValue: 'true', validation: 'true/false' },
    { name: 'applies_to_holidays', required: false, type: 'boolean', description: 'Apply to public holidays', defaultValue: 'false', validation: 'Use holiday tier instead' },
    { name: 'priority', required: false, type: 'integer', description: 'Tier selection priority', defaultValue: '10', validation: 'Higher = processed first' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Whether tier is in effect', defaultValue: 'true', validation: 'true/false' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Daily Before Weekly Calculation',
      enforcement: 'System',
      description: 'Daily overtime is calculated first. Hours qualifying for daily OT are counted as regular hours toward weekly thresholds.'
    },
    {
      rule: 'Highest Rate Wins',
      enforcement: 'System',
      description: 'When multiple overtime tiers could apply to the same hour, the tier with the highest multiplier is used. Rates do not stack.'
    },
    {
      rule: 'Holiday Tier Priority',
      enforcement: 'System',
      description: 'Holiday overtime tiers have highest priority. Working on a holiday uses the holiday rate, not standard OT rate.'
    },
    {
      rule: 'Threshold Rollover',
      enforcement: 'Policy',
      description: 'Weekly thresholds reset on the first day of the pay week (configurable). Daily thresholds reset at midnight in company timezone.'
    },
    {
      rule: 'Exemption Support',
      enforcement: 'System',
      description: 'Employees marked as "overtime exempt" (salaried) skip overtime calculations entirely. Their hours are tracked but not converted to OT.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Overtime Configuration',
      description: 'Access overtime rate tier setup from the T&A policies menu.',
      notes: ['Time & Attendance → Setup → Overtime Rate Tiers']
    },
    {
      title: 'Create Standard OT Tier (1.5x)',
      description: 'Add the primary overtime tier for hours beyond daily/weekly thresholds.',
      notes: ['Most jurisdictions require 1.5x for first OT tier']
    },
    {
      title: 'Create Double-Time Tier (2x)',
      description: 'Add a second tier for extended overtime (e.g., over 12 hours daily).',
      notes: ['Check local labor law requirements']
    },
    {
      title: 'Configure Holiday Rates',
      description: 'Set up special rates for public holidays (often 2x or 2.5x).',
      notes: ['Link to company holiday calendar']
    },
    {
      title: 'Set Tier Priorities',
      description: 'Assign priority numbers to control which tier applies when multiple match.',
      notes: ['Higher priority = higher precedence']
    },
    {
      title: 'Test Calculations',
      description: 'Use the overtime calculator to verify tier logic with sample scenarios.',
      notes: ['Test daily, weekly, and combined scenarios']
    }
  ];

  return (
    <Card id="ta-sec-2-4" data-manual-anchor="ta-sec-2-4" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.4</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">Overtime Rate Tiers</CardTitle>
        <CardDescription>
          Tiered overtime multipliers, daily/weekly thresholds, and holiday premium pay
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
              <h3 className="font-semibold text-lg mb-2">Understanding Overtime Rate Tiers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Overtime rate tiers define how hours beyond normal thresholds are compensated. 
                Most jurisdictions require premium pay (1.5x or more) for overtime hours. 
                The system supports multiple tiers—for example, 1.5x for the first 4 OT hours, 
                2x thereafter, and 2.5x for holidays. Tiers can be based on daily hours, 
                weekly hours, or consecutive days worked.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Overtime Rate Tier Configuration"
          caption="Overtime tier setup showing multipliers, thresholds, and priority settings"
        />

        {/* Common Rate Structures */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Common Overtime Structures by Region
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Region</th>
                  <th className="text-left p-3 font-medium">Daily OT Threshold</th>
                  <th className="text-left p-3 font-medium">Weekly OT Threshold</th>
                  <th className="text-left p-3 font-medium">Rate Structure</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { region: 'Caribbean (Jamaica)', daily: '8 hours', weekly: '40 hours', rates: '1.5x OT, 2x Sunday' },
                  { region: 'Caribbean (Trinidad)', daily: '8 hours', weekly: '40 hours', rates: '1.5x OT, 2x holidays' },
                  { region: 'Nigeria', daily: 'None', weekly: '40 hours', rates: '1.5x OT' },
                  { region: 'Ghana', daily: '8 hours', weekly: '40 hours', rates: '1.5x first 2hrs, 1.75x after' },
                  { region: 'Dominican Republic', daily: '8 hours', weekly: '44 hours', rates: '1.35x OT, 2x night' },
                  { region: 'US (California)', daily: '8 hours', weekly: '40 hours', rates: '1.5x, 2x over 12hrs daily' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.region}</td>
                    <td className="p-3 text-muted-foreground">{row.daily}</td>
                    <td className="p-3 text-muted-foreground">{row.weekly}</td>
                    <td className="p-3 text-muted-foreground">{row.rates}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={overtimeRateTierFields}
          title="overtime_rate_tiers Table Fields"
        />

        {/* Compliance Callout */}
        <ComplianceCallout>
          <strong>Labor Law Compliance:</strong> Overtime rates are governed by local labor law 
          and collective bargaining agreements. Always verify your tier configuration with legal 
          counsel before deployment. Incorrect overtime calculations can result in back-pay 
          claims, penalties, and legal action.
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

        {/* Calculation Example */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Calculation Example
          </h3>
          <div className="p-4 bg-muted/30 border rounded-lg space-y-4">
            <p className="text-sm font-medium">Scenario: Employee works 14 hours on a regular weekday</p>
            <div className="grid md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="font-medium text-green-700 dark:text-green-400">Regular Hours</div>
                <div className="text-2xl font-bold">8.0</div>
                <div className="text-xs text-muted-foreground">@ 1.0x</div>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="font-medium text-amber-700 dark:text-amber-400">OT Tier 1</div>
                <div className="text-2xl font-bold">4.0</div>
                <div className="text-xs text-muted-foreground">@ 1.5x (hours 9-12)</div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="font-medium text-red-700 dark:text-red-400">OT Tier 2</div>
                <div className="text-2xl font-bold">2.0</div>
                <div className="text-xs text-muted-foreground">@ 2.0x (hours 13-14)</div>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="font-medium text-primary">Paid Hours Equivalent</div>
                <div className="text-2xl font-bold">18.0</div>
                <div className="text-xs text-muted-foreground">8 + (4×1.5) + (2×2)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <WarningCallout>
          <strong>Retroactive Changes:</strong> Modifying overtime tiers does NOT retroactively 
          recalculate historical timesheets. If you need to correct past periods, use the 
          timesheet recalculation tool and regenerate affected pay periods.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Payroll Integration:</strong> Ensure tier codes match your payroll system's 
          earning codes. The T&A system exports hours by tier code, and payroll applies the 
          actual dollar rates. Mismatched codes cause import failures.
        </TipCallout>
      </CardContent>
    </Card>
  );
}
