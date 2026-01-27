import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout, WarningCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const CONFIGURATION_ISSUES = [
  {
    id: 'CFG-001',
    symptom: 'Assessor type weights not summing to 100%',
    severity: 'High',
    cause: 'Manual weight entry error during assessor type configuration. The system requires total weights across all active assessor types to equal 100% for proper score aggregation.',
    resolution: [
      'Navigate to Succession Setup > Assessor Types',
      'Review weight_percentage for each active assessor type',
      'Adjust weights to ensure total = 100%',
      'Save changes and validate in assessment creation'
    ],
    prevention: 'Use the weight normalization preview before saving. Consider using the 50/30/20 default template (Manager 50%, HR 30%, Executive 20%).'
  },
  {
    id: 'CFG-002',
    symptom: 'Readiness band not appearing in dropdown',
    severity: 'Medium',
    cause: 'Band record missing company_id scope or is_active=false. Multi-tenant environments require explicit company assignment.',
    resolution: [
      'Navigate to Succession Setup > Readiness Bands',
      'Filter by company to verify band exists for correct entity',
      'Check is_active flag is set to true',
      'If missing, create band with correct company_id'
    ],
    prevention: 'Always configure bands after company selection. Use the configuration validation checklist from Section 2.1.'
  },
  {
    id: 'CFG-003',
    symptom: 'Rating source showing "No data" for Nine-Box',
    severity: 'High',
    cause: 'Source module not configured or no data exists for the source type. The Nine-Box requires at least one valid rating source with data.',
    resolution: [
      'Verify source module is enabled (Performance, 360, Goals)',
      'Check employees have completed cycles in source module',
      'Review nine_box_rating_sources configuration',
      'Ensure source_type matches available data'
    ],
    prevention: 'Configure rating sources only after verifying source module data availability. Use the module dependencies calendar from Section 1.5.'
  },
  {
    id: 'CFG-004',
    symptom: 'Readiness form template not available for staff type',
    severity: 'Medium',
    cause: 'No form mapped to the specific staff type in readiness_assessment_forms table, or form is inactive.',
    resolution: [
      'Navigate to Succession Setup > Readiness Forms',
      'Create new form or clone existing template',
      'Assign form to correct staff_type values',
      'Set is_active = true and save'
    ],
    prevention: 'Create forms for all staff types before go-live. Document form-to-staff-type mappings in implementation guide.'
  },
  {
    id: 'CFG-005',
    symptom: 'Availability reason missing urgency level indicator',
    severity: 'Low',
    cause: 'Optional fields urgency_level and typical_notice_months not configured. These are used for vacancy risk prioritization.',
    resolution: [
      'Navigate to Succession Setup > Availability Reasons',
      'Edit the availability reason record',
      'Add urgency_level (planned_departure, urgent_departure, immediate_departure)',
      'Set typical_notice_months value (e.g., 3 for retirement)'
    ],
    prevention: 'Complete all optional fields during initial configuration. Urgency levels enable proactive succession alerts.'
  },
  {
    id: 'CFG-006',
    symptom: 'Company settings not inheriting from parent',
    severity: 'Medium',
    cause: 'company_parent_id not set or inheritance rules not configured. Multi-company hierarchies require explicit parent linkage.',
    resolution: [
      'Navigate to Company Management > Company Details',
      'Set company_parent_id to parent company UUID',
      'Enable setting inheritance flags',
      'Refresh succession configuration cache'
    ],
    prevention: 'Configure company hierarchy before succession setup. Test inheritance with a single setting before bulk configuration.'
  },
  {
    id: 'CFG-007',
    symptom: 'Signal mapping not contributing to Nine-Box axis',
    severity: 'High',
    cause: 'Signal mapping missing contributes_to assignment or is_enabled=false. Each signal must explicitly map to an axis.',
    resolution: [
      'Navigate to Succession Setup > Signal Mappings',
      'Verify contributes_to is set (performance or potential)',
      'Check is_enabled flag is true',
      'Validate signal_code exists in talent_signal_definitions'
    ],
    prevention: 'Use the signal mapping validation tool after initial setup. Test with a sample employee before go-live.'
  },
  {
    id: 'CFG-008',
    symptom: 'Nine-Box box labels showing "Undefined"',
    severity: 'Medium',
    cause: 'nine_box_indicator_configs table missing entries for all 9 boxes. Default initialization may not have run.',
    resolution: [
      'Navigate to Succession Setup > Nine-Box Configuration',
      'Click "Initialize Defaults" if available',
      'Manually create missing box_label entries (1-1 through 3-3)',
      'Assign descriptive labels and colors'
    ],
    prevention: 'Run default initialization as part of succession module setup. Verify all 9 boxes have labels before launching Nine-Box tab.'
  },
  {
    id: 'CFG-009',
    symptom: 'Readiness indicator weights not normalizing correctly',
    severity: 'Medium',
    cause: 'Indicators in a category have weights that don\'t sum to 100%, or skip logic conflicts with weight calculation.',
    resolution: [
      'Review indicator weights per category',
      'Use relative weights (system normalizes automatically)',
      'Check skip logic doesn\'t exclude all indicators in a category',
      'Test with sample assessment'
    ],
    prevention: 'Use relative weighting strategy. Document skip logic dependencies in form configuration.'
  },
  {
    id: 'CFG-010',
    symptom: 'Multi-company talent pool not visible across entities',
    severity: 'High',
    cause: 'Pool scope_type set to company instead of multi_company. Cross-company pools require explicit scope configuration.',
    resolution: [
      'Navigate to Talent Pools > Pool Configuration',
      'Edit pool scope_type to multi_company',
      'Specify allowed_company_ids array',
      'Refresh user permissions cache'
    ],
    prevention: 'Define pool scope requirements during planning. Document cross-company visibility rules in governance matrix.'
  },
  {
    id: 'CFG-011',
    symptom: 'Position criticality enum values not matching UI',
    severity: 'Medium',
    cause: 'Database CHECK constraint values don\'t align with UI dropdown options. Enum migration may be incomplete.',
    resolution: [
      'Verify succession_plans.position_criticality uses correct enum',
      'Standard values: most_critical, critical, important',
      'Update any non-standard values in existing records',
      'Refresh browser cache to load updated enum'
    ],
    prevention: 'Use standardized enum values from Section 7.2. Run enum validation script before go-live.'
  },
  {
    id: 'CFG-012',
    symptom: 'Workflow transaction type not triggering succession approval',
    severity: 'High',
    cause: 'SUCCESSION_READINESS_APPROVAL or PERF_SUCCESSION_APPROVAL transaction types not configured in company_transaction_workflow_settings.',
    resolution: [
      'Navigate to HR Hub > Workflow Settings',
      'Add transaction types for succession module',
      'Configure approval levels and approvers',
      'Test with sample transaction'
    ],
    prevention: 'Include workflow configuration in implementation checklist. Test all transaction types before go-live.'
  },
];

const QUICK_REFERENCE = [
  { id: 'CFG-001', symptom: 'Weights not summing to 100%', severity: 'High' },
  { id: 'CFG-002', symptom: 'Band missing from dropdown', severity: 'Medium' },
  { id: 'CFG-003', symptom: 'Rating source "No data"', severity: 'High' },
  { id: 'CFG-004', symptom: 'Form unavailable for staff type', severity: 'Medium' },
  { id: 'CFG-007', symptom: 'Signal not contributing to axis', severity: 'High' },
  { id: 'CFG-010', symptom: 'Multi-company pool not visible', severity: 'High' },
  { id: 'CFG-012', symptom: 'Workflow not triggering', severity: 'High' },
];

export function ConfigurationIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-2" data-manual-anchor="sec-11-2" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">11.2 Configuration Issues</h3>
          <p className="text-muted-foreground mt-1">
            Assessor types, readiness bands, rating sources, forms, signal mappings, and company settings troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose and resolve assessor type weight configuration errors',
          'Troubleshoot readiness band and form availability issues',
          'Fix Nine-Box rating source and signal mapping problems',
          'Configure multi-company succession settings correctly',
          'Validate workflow transaction type configuration'
        ]}
      />

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-600" />
            Configuration Issues Quick Reference
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
                      <Badge variant={item.severity === 'High' ? 'destructive' : item.severity === 'Medium' ? 'default' : 'secondary'}>
                        {item.severity}
                      </Badge>
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
          <CardTitle>Detailed Issue Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {CONFIGURATION_ISSUES.map((issue) => (
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

      <TipCallout title="Configuration Validation">
        Run the pre-go-live configuration validation checklist from Section 2.1 before launching succession planning. 
        This catches 80% of configuration issues before they impact users.
      </TipCallout>
    </div>
  );
}
