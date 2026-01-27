import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Shield
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';

const compensationFlagFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'employee_id', required: true, type: 'UUID', description: 'Employee for review', defaultValue: '—', validation: 'References profiles.id' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company context', defaultValue: '—', validation: 'References companies.id' },
  { name: 'flag_type', required: true, type: 'text', description: 'Type of compensation flag', defaultValue: '—', validation: 'retention_risk, merit_review, market_adjustment, equity_review' },
  { name: 'source_type', required: true, type: 'text', description: 'What triggered the flag', defaultValue: '—', validation: 'succession, appraisal, flight_risk, market_data' },
  { name: 'source_reference_id', required: false, type: 'UUID', description: 'ID of source record', defaultValue: 'null', validation: 'e.g., succession_candidate.id' },
  { name: 'priority', required: false, type: 'text', description: 'Flag priority level', defaultValue: 'normal', validation: 'low, normal, high, critical' },
  { name: 'status', required: true, type: 'text', description: 'Current flag status', defaultValue: 'pending', validation: 'pending, approved, processed, rejected' },
  { name: 'recommended_action', required: false, type: 'text', description: 'Suggested action', defaultValue: 'null', validation: 'e.g., 5% retention bonus' },
  { name: 'notes', required: false, type: 'text', description: 'Additional context', defaultValue: 'null', validation: '—' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Flag creation time', defaultValue: 'now()', validation: 'Auto-set' }
];

const retentionTriggers = [
  { condition: 'High-potential + High flight risk', action: 'Retention bonus recommendation', priority: 'critical' },
  { condition: 'Ready Now successor + Below-market pay', action: 'Market adjustment flag', priority: 'high' },
  { condition: 'Key position incumbent + Known competitor offer', action: 'Counter-offer consideration', priority: 'critical' },
  { condition: 'High performer + Compa-ratio < 0.85', action: 'Merit increase priority', priority: 'high' },
  { condition: 'Talent pool member + 2+ years no increase', action: 'Equity review', priority: 'normal' }
];

export function IntegrationCompensation() {
  return (
    <section id="sec-9-9" data-manual-anchor="sec-9-9" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <DollarSign className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.9 Compensation Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect succession data to retention strategies and compensation planning
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure retention bonus triggers based on succession data',
        'Set up compensation review flags for high-potential talent',
        'Integrate compa-ratio monitoring for succession candidates',
        'Align compensation cycles with succession planning'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Retention Risk Triggers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The integration automatically creates compensation review flags when succession data indicates retention risk:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Condition</th>
                  <th className="text-left py-2 px-3">Action</th>
                  <th className="text-left py-2 px-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {retentionTriggers.map((trigger, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-3">{trigger.condition}</td>
                    <td className="py-2 px-3">{trigger.action}</td>
                    <td className="py-2 px-3">
                      <Badge variant={
                        trigger.priority === 'critical' ? 'destructive' :
                        trigger.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {trigger.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <InfoCallout>
            Retention triggers are configured in <code>appraisal_integration_rules</code> with 
            <code>target_module='compensation'</code> and <code>action_type='retention_alert'</code> 
            or <code>'create_merit_flag'</code>.
          </InfoCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={compensationFlagFields} 
        title="compensation_review_flags Table (Key Fields)" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Compa-Ratio Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Monitor succession candidate compa-ratios to identify retention risk from pay positioning:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Below Market</h4>
              <p className="text-2xl font-bold">{"< 0.85"}</p>
              <p className="text-sm text-muted-foreground mt-1">High retention risk</p>
              <Badge variant="destructive" className="mt-2">Auto-flag</Badge>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Approaching Range</h4>
              <p className="text-2xl font-bold">0.85 - 0.95</p>
              <p className="text-sm text-muted-foreground mt-1">Monitor closely</p>
              <Badge variant="secondary" className="mt-2">Watch list</Badge>
            </div>

            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">At Market</h4>
              <p className="text-2xl font-bold">0.95 - 1.10</p>
              <p className="text-sm text-muted-foreground mt-1">Competitive positioning</p>
              <Badge variant="outline" className="mt-2">Healthy</Badge>
            </div>
          </div>

          <TipCallout>
            Configure integration rules to automatically flag succession candidates with compa-ratio 
            below 0.85. Use <code>condition_type='compa_threshold'</code> with <code>condition_operator='&lt;'</code>.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Integration Rule Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Ready Now → Merit Review
              </h4>
              <div className="text-xs space-y-1 font-mono">
                <p>trigger_event: 'readiness_assessment_completed'</p>
                <p>condition_type: 'readiness_threshold'</p>
                <p>condition_value: 5 (Ready Now)</p>
                <p>target_module: 'compensation'</p>
                <p>action_type: 'create_merit_flag'</p>
                <p>action_config: {"{ priority: 'high' }"}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                Flight Risk → Retention Alert
              </h4>
              <div className="text-xs space-y-1 font-mono">
                <p>trigger_event: 'flight_risk_detected'</p>
                <p>condition_type: 'risk_level'</p>
                <p>condition_value: 'high'</p>
                <p>target_module: 'compensation'</p>
                <p>action_type: 'retention_alert'</p>
                <p>requires_approval: true</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annual Cycle Alignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Align succession planning outputs with compensation planning cycles:
          </p>

          <div className="p-4 border rounded-lg">
            <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
              <div className="p-3 bg-muted rounded">
                <p className="font-medium">Q1</p>
                <p className="text-xs text-muted-foreground">Succession Review</p>
                <p className="text-xs">Nine-Box calibration</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="font-medium">Q2</p>
                <p className="text-xs text-muted-foreground">Readiness Assessment</p>
                <p className="text-xs">Candidate pipeline</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="font-medium">Q3</p>
                <p className="text-xs text-muted-foreground">Compensation Planning</p>
                <p className="text-xs">Use succession flags</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="font-medium">Q4</p>
                <p className="text-xs text-muted-foreground">Merit Distribution</p>
                <p className="text-xs">Execute adjustments</p>
              </div>
            </div>
          </div>

          <InfoCallout>
            Schedule succession readiness assessments 4-6 weeks before compensation planning begins. 
            This ensures fresh Nine-Box data and flight risk assessments inform merit and retention decisions.
          </InfoCallout>
        </CardContent>
      </Card>
    </section>
  );
}
