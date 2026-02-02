import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Settings, CheckCircle, GraduationCap,
  Timer, Shield, Scale, FileText, AlertTriangle,
  Layers, Globe, MapPin, Camera
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  ComplianceCallout,
  ScreenshotPlaceholder,
  ConfigurationExample,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';
import { SeeAlsoReference, IntegrationReference } from '@/components/enablement/shared';

export function TAFoundationTimePolicies() {
  const learningObjectives = [
    'Configure base attendance policies with accurate attendance_policies schema fields',
    'Understand the dual-layer punch rounding architecture (Base Policy + Shift Override)',
    'Apply FLSA-compliant punch rounding using the 7-Minute Rule pattern',
    'Set up time collection requirements (photo verification, GPS) for workforce validation',
    'Configure late deduction rules for payroll integration',
    'Manage policy lifecycle with effective dating (start_date, end_date)',
    'Understand regional compliance considerations for Caribbean/African jurisdictions'
  ];

  // Group A: Identity & Metadata
  const identityFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'uuid', description: 'Primary key identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
    { name: 'company_id', required: true, type: 'uuid', description: 'FK to companies table', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'name', required: true, type: 'text', description: 'Policy display name (e.g., "Standard Office Policy")', defaultValue: '—', validation: 'Max 100 characters, unique per company' },
    { name: 'code', required: true, type: 'text', description: 'Unique policy code (e.g., "STD-OFFICE-001")', defaultValue: '—', validation: 'Alphanumeric, unique per company' },
    { name: 'description', required: false, type: 'text', description: 'Policy description and notes', defaultValue: 'null', validation: 'Free text' },
  ];

  // Group B: Threshold Configuration
  const thresholdFields: FieldDefinition[] = [
    { name: 'grace_period_minutes', required: false, type: 'integer', description: 'Minutes before punch is considered tardy (UKG: "Grace")', defaultValue: '0', validation: '0-60 minutes' },
    { name: 'late_threshold_minutes', required: false, type: 'integer', description: 'Minutes after grace before exception is flagged', defaultValue: '15', validation: '0-60 minutes' },
    { name: 'early_departure_threshold_minutes', required: false, type: 'integer', description: 'Minutes before shift end considered early departure', defaultValue: '15', validation: '0-60 minutes' },
  ];

  // Group C: Late Deduction (Payroll Integration)
  const lateDeductionFields: FieldDefinition[] = [
    { name: 'auto_deduct_late', required: false, type: 'boolean', description: 'Automatically deduct minutes for late arrivals', defaultValue: 'false', validation: 'true/false' },
    { name: 'late_deduction_minutes', required: false, type: 'integer', description: 'Fixed minutes to deduct when late (if auto_deduct_late=true)', defaultValue: '0', validation: '0-60 minutes' },
  ];

  // Group D: Punch Rounding (Per-Punch)
  const roundingFields: FieldDefinition[] = [
    { name: 'round_clock_in', required: false, type: 'text', description: 'Punch rounding rule for clock-in punches', defaultValue: "'none'", validation: 'none, nearest_5, nearest_6, nearest_10, nearest_15, nearest_30, up, down' },
    { name: 'round_clock_out', required: false, type: 'text', description: 'Punch rounding rule for clock-out punches', defaultValue: "'none'", validation: 'none, nearest_5, nearest_6, nearest_10, nearest_15, nearest_30, up, down' },
  ];

  // Group E: Time Collection Requirements
  const timeCollectionFields: FieldDefinition[] = [
    { name: 'require_photo_clock_in', required: false, type: 'boolean', description: 'Photo capture required on clock-in punch', defaultValue: 'false', validation: 'true/false' },
    { name: 'require_photo_clock_out', required: false, type: 'boolean', description: 'Photo capture required on clock-out punch', defaultValue: 'false', validation: 'true/false' },
    { name: 'require_geolocation', required: false, type: 'boolean', description: 'GPS coordinates required for punches', defaultValue: 'false', validation: 'true/false' },
  ];

  // Group F: Operational Limits
  const operationalFields: FieldDefinition[] = [
    { name: 'max_daily_hours', required: false, type: 'numeric', description: 'Maximum hours per day (safety limit, auto-terminate trigger)', defaultValue: '24', validation: '1-24 hours' },
    { name: 'min_break_duration_minutes', required: false, type: 'integer', description: 'Minimum break duration for compliance', defaultValue: '0', validation: '0-120 minutes' },
    { name: 'auto_clock_out_hours', required: false, type: 'numeric', description: 'Auto-terminate shift after X hours (if set)', defaultValue: 'null', validation: '1-24 hours or null' },
  ];

  // Group G: Status & Lifecycle
  const statusFields: FieldDefinition[] = [
    { name: 'is_default', required: false, type: 'boolean', description: 'Default policy for new employees (one per company)', defaultValue: 'false', validation: 'Only one can be true per company' },
    { name: 'is_active', required: true, type: 'boolean', description: 'Policy is currently active', defaultValue: 'true', validation: 'true/false' },
    { name: 'start_date', required: true, type: 'date', description: 'Policy effective from date', defaultValue: 'CURRENT_DATE', validation: 'Valid date' },
    { name: 'end_date', required: false, type: 'date', description: 'Policy expiration date (effective dating)', defaultValue: 'null', validation: 'Date >= start_date or null' },
  ];

  // Group H: Audit
  const auditFields: FieldDefinition[] = [
    { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()', validation: 'Auto-generated' },
    { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last modification timestamp', defaultValue: 'now()', validation: 'Auto-updated on change' },
  ];

  // Group I: Internationalization
  const i18nFields: FieldDefinition[] = [
    { name: 'name_en', required: false, type: 'text', description: 'English translation of policy name', defaultValue: 'null', validation: 'Max 100 characters' },
    { name: 'description_en', required: false, type: 'text', description: 'English translation of description', defaultValue: 'null', validation: 'Free text' },
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Dual-Layer Punch Rounding Override',
      enforcement: 'System',
      description: 'Shift rounding rules (Layer 2 in shift_rounding_rules) override base attendance policy rounding (Layer 1) when assigned to a shift.'
    },
    {
      rule: 'Per-Punch Rounding',
      enforcement: 'System',
      description: 'round_clock_in and round_clock_out are configured independently. Different rounding can apply to start vs end of shift.'
    },
    {
      rule: '7-Minute Rule (FLSA)',
      enforcement: 'Advisory',
      description: 'When using nearest_15 rounding, punches 1-7 minutes round down, 8-14 minutes round up. This is FLSA-compliant as it averages neutral over time.'
    },
    {
      rule: 'Grace Period + Late Threshold',
      enforcement: 'System',
      description: 'Grace period applies BEFORE tardiness threshold. If grace = 5 min and late_threshold = 10 min, employee is marked late at minute 16.'
    },
    {
      rule: 'Late Deduction Integration',
      enforcement: 'System',
      description: 'When auto_deduct_late=true, the system deducts late_deduction_minutes from worked hours for payroll.'
    },
    {
      rule: 'Effective Dating',
      enforcement: 'System',
      description: 'start_date and end_date control when a policy is active. Historical timecards retain the policy rules that were in effect at punch time.'
    },
    {
      rule: 'Photo/GPS Enforcement',
      enforcement: 'System',
      description: 'If require_photo_clock_in=true, punch is rejected without photo capture. Same for geolocation validation.'
    },
    {
      rule: 'One Default Per Company',
      enforcement: 'System',
      description: 'Only one policy can have is_default=true per company. Setting a new default automatically unsets the previous.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Attendance Policies',
      description: 'Access the policy configuration from the Time & Attendance setup menu.',
      notes: ['Path: Time & Attendance → Setup → Attendance Policies', 'Requires Time Admin or Super Admin role'],
      expectedResult: 'Attendance Policies list view displays with existing policies'
    },
    {
      title: 'Create New Policy',
      description: 'Click "Add Policy" and enter the identity fields.',
      substeps: [
        'Enter name (display name, e.g., "Standard Office Policy")',
        'Enter code (unique identifier, e.g., "STD-OFFICE-001")',
        'Optional: Add description for documentation'
      ],
      expectedResult: 'New policy form opens with identity fields'
    },
    {
      title: 'Configure Threshold Settings',
      description: 'Set the tolerance windows for tardiness and early departure.',
      substeps: [
        'grace_period_minutes: Minutes before punch is considered late',
        'late_threshold_minutes: Minutes after grace before exception flagged',
        'early_departure_threshold_minutes: Early leave tolerance'
      ],
      notes: ['Tip: 5 min grace + 15 min threshold means late at minute 21']
    },
    {
      title: 'Set Per-Punch Rounding',
      description: 'Configure separate punch rounding for clock-in and clock-out.',
      substeps: [
        'round_clock_in: Select rounding method for in-punches',
        'round_clock_out: Select rounding method for out-punches'
      ],
      notes: ['Tip: Use nearest_15 for FLSA/DOL 7-Minute Rule compliance'],
      expectedResult: 'Rounding preview shows example punch times'
    },
    {
      title: 'Configure Time Collection Requirements',
      description: 'Enable photo verification and GPS validation if needed.',
      substeps: [
        'Enable require_photo_clock_in for photo capture',
        'Enable require_photo_clock_out if needed',
        'Enable require_geolocation for GPS validation'
      ],
      notes: ['GPS pairs with Geofencing (Section 2.9) for location boundaries']
    },
    {
      title: 'Set Late Deduction (Optional)',
      description: 'Configure automatic payroll deduction for late arrivals.',
      substeps: [
        'Enable auto_deduct_late if late arrivals should reduce paid hours',
        'Set late_deduction_minutes for fixed deduction amount'
      ],
      notes: ['Deduction flows to Payroll module for pay calculation']
    },
    {
      title: 'Configure Operational Limits',
      description: 'Set safety limits for daily hours and breaks.',
      substeps: [
        'max_daily_hours: Maximum hours per day (safety limit)',
        'min_break_duration_minutes: Minimum break for compliance',
        'auto_clock_out_hours: Auto-terminate after X hours (optional)'
      ]
    },
    {
      title: 'Set Effective Dates',
      description: 'Control when the policy is active.',
      substeps: [
        'start_date: When policy becomes active',
        'end_date: When policy expires (leave null for no expiration)',
        'is_default: Set true if this is the default for new employees'
      ],
      expectedResult: 'Policy saved with effective dating applied'
    },
    {
      title: 'Assign to Employees',
      description: 'Navigate to Policy Assignments (Section 2.3) to link employees.',
      notes: ['Assign by employee, department, location, or job'],
      expectedResult: 'Employees inherit the configured policy rules'
    }
  ];

  const configExamples = [
    {
      title: 'Hospital Nursing Staff',
      context: '12-hour shifts, strict handoff requirements, OSHA compliance, decimal payroll',
      values: [
        { field: 'name', value: 'Healthcare - Nursing 12hr' },
        { field: 'round_clock_in', value: 'nearest_6' },
        { field: 'round_clock_out', value: 'nearest_6' },
        { field: 'grace_period_minutes', value: '3' },
        { field: 'late_threshold_minutes', value: '10' },
        { field: 'require_photo_clock_in', value: 'true' },
        { field: 'require_geolocation', value: 'true' },
        { field: 'max_daily_hours', value: '14' }
      ],
      outcome: 'Precise 1/10th hour tracking for patient care continuity; photo verification prevents buddy punching'
    },
    {
      title: 'Caribbean Resort (Multi-Shift)',
      context: 'Tourism industry, multiple shifts (day/night/graveyard), seasonal workers, Trinidad & Tobago jurisdiction',
      values: [
        { field: 'name', value: 'Resort - Standard' },
        { field: 'round_clock_in', value: 'nearest_15' },
        { field: 'round_clock_out', value: 'nearest_15' },
        { field: 'grace_period_minutes', value: '5' },
        { field: 'late_threshold_minutes', value: '15' },
        { field: 'require_photo_clock_in', value: 'true' },
        { field: 'require_geolocation', value: 'true' }
      ],
      outcome: 'Balanced rounding compliant with T&T Industrial Relations Act; photo + GPS for distributed outdoor staff'
    },
    {
      title: 'Nigerian Oil & Gas Field Operations',
      context: 'Remote sites, 14-day rotation, strict safety compliance, Labour Act CAP L1 jurisdiction',
      values: [
        { field: 'name', value: 'Oil-Gas - Field Ops' },
        { field: 'round_clock_in', value: 'none' },
        { field: 'round_clock_out', value: 'none' },
        { field: 'grace_period_minutes', value: '0' },
        { field: 'late_threshold_minutes', value: '5' },
        { field: 'require_photo_clock_in', value: 'true' },
        { field: 'require_geolocation', value: 'true' },
        { field: 'auto_clock_out_hours', value: '14' }
      ],
      outcome: 'Exact time for safety compliance audits; automatic clock-out prevents excessive hours on remote sites'
    }
  ];

  return (
    <Card id="ta-sec-2-2" data-manual-anchor="ta-sec-2-2" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.2</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>18 min read</span>
        </div>
        <CardTitle className="text-2xl">Attendance Policies Configuration</CardTitle>
        <CardDescription>
          Base attendance policies with punch rounding, grace periods, time collection requirements, and payroll integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">What Are Attendance Policies?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Attendance policies (stored in the <code className="text-xs bg-muted px-1 py-0.5 rounded">attendance_policies</code> table) 
                define company-wide rules for how time punches are processed. This includes punch rounding intervals, 
                grace periods for tardiness, late deduction rules, and time collection requirements (photo, GPS). 
                Each employee is assigned to one policy via Policy Assignments (Section 2.3), which governs all 
                their timecard entries.
              </p>
            </div>
          </div>
        </div>

        {/* Dual-Layer Architecture */}
        <div className="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3">Dual-Layer Punch Rounding Architecture</h3>
              <p className="text-muted-foreground mb-4">
                HRplus uses a two-layer punch rounding system that mirrors enterprise standards (Workday, SAP):
              </p>
              <div className="space-y-4">
                {/* Layer Diagram */}
                <div className="bg-background rounded-lg p-4 border">
                  <div className="text-center text-sm font-medium text-muted-foreground mb-4">
                    Punch Rounding Resolution Flow
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-xs text-muted-foreground">Employee Clocks In/Out</div>
                    <div className="w-0.5 h-4 bg-muted-foreground/30" />
                    
                    {/* Layer 2 */}
                    <div className="w-full max-w-md p-4 border-2 border-blue-400 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600 text-white">Layer 2</Badge>
                        <span className="font-medium text-sm">Shift Rounding Rules</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        • Table: <code>shift_rounding_rules</code><br/>
                        • Granular: rule_type, interval, direction, grace<br/>
                        • <strong>Takes PRECEDENCE when assigned</strong>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-0.5 h-4 bg-muted-foreground/30" />
                      <span>No Shift Rule? Fall back...</span>
                      <div className="w-0.5 h-4 bg-muted-foreground/30" />
                    </div>
                    
                    {/* Layer 1 */}
                    <div className="w-full max-w-md p-4 border-2 border-green-400 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-600 text-white">Layer 1</Badge>
                        <span className="font-medium text-sm">Base Attendance Policy</span>
                        <Badge variant="secondary" className="text-xs">This Section</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        • Table: <code>attendance_policies</code><br/>
                        • Company-wide defaults<br/>
                        • Simpler: round_clock_in, round_clock_out
                      </p>
                    </div>
                    
                    <div className="w-0.5 h-4 bg-muted-foreground/30" />
                    <div className="text-xs font-medium text-green-600 dark:text-green-400">Final Rounded Time Applied</div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <strong>Example:</strong> Employee "John" has policy with <code>round_clock_in: nearest_15</code>. 
                  John works "Night Shift" which has a shift_rounding_rule with <code>interval: 6, direction: nearest</code>. 
                  <strong className="text-foreground"> Result:</strong> The 6-minute nearest rule overrides the 15-minute base policy for John's clock-in.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Attendance Policy Configuration Screen"
          caption="Attendance policy setup showing punch rounding, thresholds, and time collection requirements"
        />

        {/* Field Reference Tables - Grouped */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            attendance_policies Table Schema (26 Columns)
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group A: Identity & Metadata</h4>
              <FieldReferenceTable fields={identityFields} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group B: Threshold Configuration</h4>
              <FieldReferenceTable fields={thresholdFields} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group C: Late Deduction (Payroll Integration)</h4>
              <FieldReferenceTable fields={lateDeductionFields} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group D: Punch Rounding (Per-Punch)</h4>
              <FieldReferenceTable fields={roundingFields} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group E: Time Collection Requirements</h4>
              <FieldReferenceTable fields={timeCollectionFields} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group F: Operational Limits</h4>
              <FieldReferenceTable fields={operationalFields} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group G: Status & Lifecycle</h4>
              <FieldReferenceTable fields={statusFields} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group H: Audit</h4>
              <FieldReferenceTable fields={auditFields} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Group I: Internationalization (i18n)</h4>
              <FieldReferenceTable fields={i18nFields} />
            </div>
          </div>
        </div>

        {/* Rounding Methods Explained */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Punch Rounding Values Explained
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Valid values for <code>round_clock_in</code> and <code>round_clock_out</code>:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { value: 'none', label: 'No Rounding', description: 'Exact punch times recorded', useCase: 'High compliance, audits', color: 'purple' },
              { value: 'nearest_5', label: 'Nearest 5 min', description: '8:07 → 8:05, 8:08 → 8:10', useCase: 'High precision', color: 'blue' },
              { value: 'nearest_6', label: 'Nearest 6 min', description: '1/10th hour, 8:04 → 8:06', useCase: 'Manufacturing, decimal payroll', color: 'blue' },
              { value: 'nearest_10', label: 'Nearest 10 min', description: '8:06 → 8:10', useCase: 'Moderate precision', color: 'blue' },
              { value: 'nearest_15', label: 'Nearest 15 min', description: '8:07 → 8:00, 8:08 → 8:15', useCase: 'Most common, FLSA 7-Minute Rule', color: 'green' },
              { value: 'nearest_30', label: 'Nearest 30 min', description: '8:14 → 8:00, 8:16 → 8:30', useCase: 'Simple scheduling', color: 'blue' },
              { value: 'up', label: 'Always Round Up', description: '8:01 → 8:15', useCase: 'Employee-favorable', color: 'amber' },
              { value: 'down', label: 'Always Round Down', description: '8:14 → 8:00', useCase: 'Caution: may violate labor laws', color: 'red' },
            ].map((item, i) => (
              <div key={i} className="p-3 border rounded-lg bg-muted/30">
                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{item.value}</code>
                <h4 className="font-medium mt-2 text-sm">{item.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                <p className="text-xs text-muted-foreground/80 mt-1 italic">{item.useCase}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FLSA 7-Minute Rule */}
        <div className="p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3">FLSA/DOL 7-Minute Rule Compliance</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The U.S. Department of Labor (DOL) permits punch rounding under the Fair Labor Standards Act (FLSA) when:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mb-4 space-y-1">
                <li>Rounding averages out to be <strong>neutral over time</strong> (not systematically favoring employer or employee)</li>
                <li>Applied <strong>consistently</strong> to all punches (both clock-in and clock-out)</li>
              </ul>
              
              <h4 className="font-medium text-sm mb-2">15-Minute Rounding Example (Most Common):</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 font-medium">Punch Time</th>
                      <th className="text-left p-2 font-medium">Rounds To</th>
                      <th className="text-left p-2 font-medium">Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr><td className="p-2">8:00</td><td className="p-2">8:00</td><td className="p-2 text-muted-foreground">Exact</td></tr>
                    <tr><td className="p-2">8:01 - 8:07</td><td className="p-2">8:00</td><td className="p-2 text-muted-foreground">Within 7 min, rounds DOWN</td></tr>
                    <tr><td className="p-2">8:08 - 8:14</td><td className="p-2">8:15</td><td className="p-2 text-muted-foreground">8+ minutes, rounds UP</td></tr>
                    <tr><td className="p-2">8:15</td><td className="p-2">8:15</td><td className="p-2 text-muted-foreground">Exact</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Warnings */}
        <ComplianceCallout>
          <div className="space-y-2">
            <p>
              <strong>Punch Rounding Compliance:</strong>
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li><strong>AVOID:</strong> Rounding DOWN for both clock-in AND clock-out (systematically reduces hours)</li>
              <li><strong>AVOID:</strong> Rounding UP for both clock-in AND clock-out (systematically increases hours)</li>
              <li><strong>RECOMMENDED:</strong> Use "nearest" direction for both punches, or balance "up" for clock-out with "down" for clock-in</li>
            </ul>
          </div>
        </ComplianceCallout>

        {/* Regional Compliance */}
        <div className="p-6 bg-muted/30 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3">Caribbean/African Regional Compliance</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Labor laws vary by jurisdiction. Key considerations for HRplus target markets:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Caribbean</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>Trinidad & Tobago:</strong> Industrial Relations Act may require documented rounding policies</li>
                    <li>• <strong>Jamaica:</strong> Employment (Termination) Act impacts attendance-based disciplinary actions</li>
                    <li>• <strong>Dominican Republic:</strong> Labour Code has specific overtime thresholds</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Africa</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>Ghana:</strong> Labour Act, 2003 (Act 651) defines maximum working hours</li>
                    <li>• <strong>Nigeria:</strong> Labour Act CAP L1 LFN 2004 specifies overtime compensation rules</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Recommendation: Consult local labor counsel before implementing rounding policies that deviate from exact time recording.
              </p>
            </div>
          </div>
        </div>

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

        {/* Configuration Examples */}
        <ConfigurationExample 
          examples={configExamples}
          title="Industry-Specific Configuration Examples"
        />

        {/* Common Configurations Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Common Policy Configurations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Policy Type</th>
                  <th className="text-left p-3 font-medium">round_clock_in</th>
                  <th className="text-left p-3 font-medium">round_clock_out</th>
                  <th className="text-left p-3 font-medium">grace_period</th>
                  <th className="text-left p-3 font-medium">late_threshold</th>
                  <th className="text-left p-3 font-medium">Photo/GPS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { type: 'Standard Office', roundIn: 'nearest_15', roundOut: 'nearest_15', grace: '5 min', late: '15 min', photo: 'No' },
                  { type: 'Manufacturing', roundIn: 'nearest_6', roundOut: 'nearest_6', grace: '0 min', late: '5 min', photo: 'Photo only' },
                  { type: 'Field Staff', roundIn: 'none', roundOut: 'none', grace: '15 min', late: '30 min', photo: 'Photo + GPS' },
                  { type: 'Retail', roundIn: 'nearest_15', roundOut: 'nearest_15', grace: '5 min', late: '10 min', photo: 'No' },
                  { type: 'Healthcare', roundIn: 'nearest_6', roundOut: 'nearest_6', grace: '3 min', late: '10 min', photo: 'Photo + GPS' },
                  { type: 'Flex Workers', roundIn: 'nearest_15', roundOut: 'none', grace: '30 min', late: '60 min', photo: 'No' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.type}</td>
                    <td className="p-3"><code className="text-xs bg-muted px-1 py-0.5 rounded">{row.roundIn}</code></td>
                    <td className="p-3"><code className="text-xs bg-muted px-1 py-0.5 rounded">{row.roundOut}</code></td>
                    <td className="p-3 text-muted-foreground">{row.grace}</td>
                    <td className="p-3 text-muted-foreground">{row.late}</td>
                    <td className="p-3 text-muted-foreground">{row.photo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tip */}
        <TipCallout>
          <strong>Best Practice:</strong> Create separate policies for distinct work patterns 
          (office vs. field staff, shift vs. flex workers). This makes it easier to maintain 
          compliance and audit time calculations by employee type. Use the <strong>Shift Rounding Rules</strong> (Section 2.16) 
          for shift-specific overrides instead of creating many base policies.
        </TipCallout>

        {/* Cross-References */}
        <div className="border rounded-lg p-4 bg-muted/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Related Sections & Integration Points
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <SeeAlsoReference
              moduleCode="time-attendance"
              moduleName="Time & Attendance"
              sectionId="ta-sec-2-16"
              sectionTitle="Section 2.16: Shift Rounding Rules"
              description="Override mechanism; shift rules take precedence over base policy (Layer 2)"
              manualPath="/enablement/manuals/time-attendance"
            />
            <SeeAlsoReference
              moduleCode="time-attendance"
              moduleName="Time & Attendance"
              sectionId="ta-sec-2-3"
              sectionTitle="Section 2.3: Policy Assignments"
              description="How policies are assigned to employees, departments, locations"
              manualPath="/enablement/manuals/time-attendance"
            />
            <SeeAlsoReference
              moduleCode="time-attendance"
              moduleName="Time & Attendance"
              sectionId="ta-sec-2-9"
              sectionTitle="Section 2.9: Geofencing Configuration"
              description="GPS boundaries that validate require_geolocation flag"
              manualPath="/enablement/manuals/time-attendance"
            />
            <IntegrationReference
              moduleCode="payroll"
              moduleName="Payroll"
              sectionId="payroll-overview"
              sectionTitle="Payroll Integration"
              description="Late deduction and rounding flow to payroll calculations"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
