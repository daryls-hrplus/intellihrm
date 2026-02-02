import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Timer, Settings, ArrowUpDown, CheckCircle,
  GraduationCap, Layers, AlertTriangle
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

export function TAFoundationShiftRoundingRules() {
  const learningObjectives = [
    'Understand the dual-layer rounding architecture (Base Policy + Shift Override)',
    'Configure shift-specific rounding rules with interval and direction',
    'Apply grace periods before rounding takes effect',
    'Manage rounding rule priority when multiple rules apply',
    'Configure overtime rounding behavior'
  ];

  const shiftRoundingRulesFields: FieldDefinition[] = [
    { name: 'name', required: true, type: 'varchar(100)', description: 'Rule display name', defaultValue: '—', validation: 'Max 100 characters' },
    { name: 'description', required: false, type: 'text', description: 'Detailed rule description', defaultValue: 'null', validation: '—' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company this rule belongs to', defaultValue: '—', validation: 'FK to companies' },
    { name: 'shift_id', required: false, type: 'uuid', description: 'Apply to specific shift, or null for all shifts', defaultValue: 'null', validation: 'FK to shifts (nullable)' },
    { name: 'rule_type', required: true, type: 'enum', description: 'Which punches this rule applies to', defaultValue: '—', validation: 'clock_in, clock_out, both' },
    { name: 'rounding_interval', required: true, type: 'integer', description: 'Rounding increment in minutes', defaultValue: '15', validation: '5, 6, 10, 15, 30' },
    { name: 'rounding_direction', required: true, type: 'enum', description: 'Direction of rounding', defaultValue: '—', validation: 'up, down, nearest' },
    { name: 'grace_period_minutes', required: false, type: 'integer', description: 'Minutes before rounding applies', defaultValue: '0', validation: '0-60' },
    { name: 'grace_period_direction', required: false, type: 'enum', description: 'Direction grace applies (in/out)', defaultValue: 'null', validation: 'in, out, both, null' },
    { name: 'apply_to_overtime', required: false, type: 'boolean', description: 'Apply this rule to overtime punches', defaultValue: 'true', validation: 'true/false' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Rule is active and enforced', defaultValue: 'true', validation: 'true/false' },
    { name: 'start_date', required: true, type: 'date', description: 'Rule effective from date', defaultValue: 'CURRENT_DATE', validation: '—' },
    { name: 'end_date', required: false, type: 'date', description: 'Rule expiration date', defaultValue: 'null', validation: 'Must be > start_date' },
    { name: 'priority', required: false, type: 'integer', description: 'Processing order (higher = first)', defaultValue: '0', validation: '0-100' },
    { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()', validation: 'Auto-generated' },
    { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last modification timestamp', defaultValue: 'now()', validation: 'Auto-updated' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Dual-Layer Override Logic',
      enforcement: 'System',
      description: 'Shift rounding rules override base attendance policy rounding. If a shift has an assigned rounding rule, that rule takes precedence over the employee\'s attendance policy.'
    },
    {
      rule: 'Rule Type Specificity',
      enforcement: 'System',
      description: 'A rule_type of "clock_in" only affects clock-in punches. Use "both" to apply the same rounding to both in and out punches.'
    },
    {
      rule: 'Grace Period Behavior',
      enforcement: 'System',
      description: 'Grace period delays rounding application. If grace = 5 min and employee clocks in at 8:03, no rounding occurs. At 8:06, rounding applies.'
    },
    {
      rule: 'Shift Assignment Scope',
      enforcement: 'Policy',
      description: 'When shift_id is null, the rule applies to all shifts in the company. Assign to specific shifts for targeted overrides.'
    },
    {
      rule: 'Priority Resolution',
      enforcement: 'System',
      description: 'When multiple rules could apply, the highest priority wins. If priorities are equal, the most specific rule (shift-specific) wins.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Access Shift Rounding Rules',
      description: 'Navigate to Time & Attendance → Shifts → Rounding Rules from the main menu.',
      notes: ['UI Path: /time-attendance/shifts/rounding-rules']
    },
    {
      title: 'Create New Rounding Rule',
      description: 'Click "Add Rounding Rule" and enter a descriptive name (e.g., "Night Shift 15-Min Nearest", "Manufacturing 6-Min Round").',
      notes: ['Use clear naming indicating shift type and interval']
    },
    {
      title: 'Select Rule Type',
      description: 'Choose whether this rule applies to clock_in, clock_out, or both punch types.',
      notes: ['Many organizations use different rounding for in vs out punches']
    },
    {
      title: 'Configure Rounding Interval',
      description: 'Select the rounding interval: 5, 6, 10, 15, or 30 minutes. 6-minute rounding is common in manufacturing (1/10th hour).',
      notes: ['6-min = 1/10 hour, common for payroll systems using decimal hours']
    },
    {
      title: 'Set Rounding Direction',
      description: 'Choose "nearest" for balanced rounding, "up" to favor employees, or "down" for strict employer-favorable rounding.',
      notes: ['"Nearest" is recommended for labor law compliance']
    },
    {
      title: 'Configure Grace Period (Optional)',
      description: 'Set grace period minutes to delay rounding. Useful for allowing minor early/late punches without adjustment.',
      notes: ['Grace of 5 min means punches within 5 min of exact time aren\'t rounded']
    },
    {
      title: 'Assign to Shift (Optional)',
      description: 'Leave shift blank for company-wide default, or select a specific shift for targeted override.',
      notes: ['Company-wide rules are inherited; shift-specific rules override']
    },
    {
      title: 'Set Overtime Behavior',
      description: 'Enable "Apply to Overtime" if this rounding should also apply to overtime punch calculations.',
      notes: ['Some jurisdictions require exact time for OT calculation']
    }
  ];

  return (
    <Card id="ta-sec-2-16" data-manual-anchor="ta-sec-2-16" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.16</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>12 min read</span>
        </div>
        <CardTitle className="text-2xl">Shift Rounding Rules Configuration</CardTitle>
        <CardDescription>
          Granular shift-level rounding overrides for punch-specific intervals and directions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Architecture Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Dual-Layer Rounding Architecture</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                IntelliHRM uses a two-layer rounding system similar to enterprise standards (Workday, SAP):
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-background">
                  <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <Badge variant="outline">Layer 1</Badge>
                    Base Attendance Policy
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Company-wide defaults</li>
                    <li>• Simpler options: nearest_5, nearest_15, nearest_30, up, down</li>
                    <li>• Per-punch-type: <code>round_clock_in</code>, <code>round_clock_out</code></li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-background">
                  <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Layer 2</Badge>
                    Shift Rounding Rules (Override)
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Shift-specific or company-wide</li>
                    <li>• Granular: rule_type, interval, direction, grace</li>
                    <li>• Overrides base policy when assigned</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Shift Rounding Rules Configuration Screen"
          caption="Rounding rule setup showing interval, direction, and shift assignment options"
        />

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={shiftRoundingRulesFields}
          title="shift_rounding_rules Table Fields"
        />

        {/* Rounding Interval Options */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Rounding Interval Options
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                interval: '5 minutes',
                example: '8:07 → 8:05 (nearest)',
                useCase: 'Precision tracking, professional services',
                industry: 'Consulting, Legal'
              },
              {
                interval: '6 minutes',
                example: '8:07 → 8:06 (nearest)',
                useCase: '1/10th hour increments for decimal payroll',
                industry: 'Manufacturing, Industrial'
              },
              {
                interval: '10 minutes',
                example: '8:07 → 8:10 (nearest)',
                useCase: 'Balanced precision vs simplicity',
                industry: 'Retail, Hospitality'
              },
              {
                interval: '15 minutes',
                example: '8:07 → 8:00 (nearest)',
                useCase: 'Most common, labor law compliant',
                industry: 'General Office, Default'
              },
              {
                interval: '30 minutes',
                example: '8:14 → 8:00 (nearest)',
                useCase: 'Simplified time tracking',
                industry: 'Part-time, Seasonal'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-1">{item.interval}</h4>
                <p className="text-sm font-mono text-muted-foreground mb-2">{item.example}</p>
                <p className="text-xs text-muted-foreground">{item.useCase}</p>
                <Badge variant="outline" className="mt-2 text-xs">{item.industry}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Rounding Direction */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Rounding Direction Options
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border-green-500/30 border rounded-lg bg-green-500/5">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Nearest (Recommended)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Rounds to the closest interval. 8:07 → 8:00, 8:08 → 8:15 (for 15-min).
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Labor law compliant (neutral over time)</li>
                <li>✓ Fair to both employer and employee</li>
                <li>✓ Recommended for most use cases</li>
              </ul>
            </div>
            <div className="p-4 border-blue-500/30 border rounded-lg bg-blue-500/5">
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Up (Employee-Favorable)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Always rounds up. 8:01 → 8:15 for clock-out.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Generous to employees</li>
                <li>• May increase labor costs</li>
                <li>• Use for clock-out if offering benefit</li>
              </ul>
            </div>
            <div className="p-4 border-amber-500/30 border rounded-lg bg-amber-500/5">
              <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Down (Employer-Favorable)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Always rounds down. 8:14 → 8:00 for clock-in.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>⚠️ May violate labor laws if overused</li>
                <li>• Use with caution</li>
                <li>• Consult legal before implementing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Compliance Warning */}
        <ComplianceCallout>
          <strong>Labor Law Compliance:</strong> The combination of "Round Down" for clock-in and 
          "Round Up" for clock-out is generally NOT compliant as it systematically reduces paid 
          time. Use "Nearest" for both punches, or consult local labor law counsel before 
          implementing asymmetric rounding.
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

        {/* Rule Priority Matrix */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Rule Priority Matrix
          </h3>
          <div className="p-4 bg-muted/30 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              When multiple rounding rules could apply, the system resolves using this priority:
            </p>
            <ol className="space-y-2">
              {[
                { level: '1st', source: 'Shift-specific rule (highest priority value)', desc: 'Rule with shift_id matching the punch\'s shift' },
                { level: '2nd', source: 'Company-wide rule (highest priority)', desc: 'Rule with shift_id = null and higher priority' },
                { level: '3rd', source: 'Company-wide rule (default)', desc: 'Rule with shift_id = null and priority = 0' },
                { level: '4th', source: 'Attendance Policy fallback', desc: 'round_clock_in / round_clock_out from attendance_policies' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0">{item.level}</Badge>
                  <div>
                    <span className="font-medium">{item.source}</span>
                    <span className="text-muted-foreground ml-1">– {item.desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Common Configurations */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Common Rounding Configurations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Scenario</th>
                  <th className="text-left p-3 font-medium">Rule Type</th>
                  <th className="text-left p-3 font-medium">Interval</th>
                  <th className="text-left p-3 font-medium">Direction</th>
                  <th className="text-left p-3 font-medium">Grace</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { scenario: 'Standard Office', type: 'both', interval: '15 min', direction: 'nearest', grace: '0 min' },
                  { scenario: 'Manufacturing', type: 'both', interval: '6 min', direction: 'nearest', grace: '0 min' },
                  { scenario: 'Night Shift Premium', type: 'clock_in', interval: '15 min', direction: 'up', grace: '5 min' },
                  { scenario: 'Strict Clock-Out', type: 'clock_out', interval: '15 min', direction: 'down', grace: '0 min' },
                  { scenario: 'Generous Policy', type: 'both', interval: '15 min', direction: 'up', grace: '10 min' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.scenario}</td>
                    <td className="p-3 text-muted-foreground">{row.type}</td>
                    <td className="p-3 text-muted-foreground">{row.interval}</td>
                    <td className="p-3 text-muted-foreground">{row.direction}</td>
                    <td className="p-3 text-muted-foreground">{row.grace}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tip */}
        <TipCallout>
          <strong>Best Practice:</strong> Start with a company-wide "Nearest 15" rule, then create 
          shift-specific overrides only where needed (e.g., manufacturing using 6-min for 1/10th 
          hour payroll). This minimizes configuration while allowing targeted exceptions.
        </TipCallout>

        {/* Cross-Reference */}
        <div className="p-4 border-l-4 border-blue-500 bg-blue-500/5 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Cross-Reference: Attendance Policies</p>
              <p className="text-sm text-muted-foreground mt-1">
                Shift rounding rules work in conjunction with Section 2.2 (Attendance Policies). 
                The base policy provides fallback rounding; shift rules provide overrides. Review 
                both configurations to understand the complete rounding behavior.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
