import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowRight, 
  AlertTriangle,
  Users,
  RefreshCw
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';

const keyPositionFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'job_id', required: true, type: 'UUID', description: 'Job being tracked', defaultValue: '—', validation: 'References jobs.id where is_key_position=true' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company context', defaultValue: '—', validation: 'References companies.id' },
  { name: 'criticality_level', required: true, type: 'text', description: 'Position criticality rating', defaultValue: '—', validation: 'critical, high, medium, low' },
  { name: 'vacancy_risk', required: false, type: 'text', description: 'Current vacancy risk level', defaultValue: 'null', validation: 'high, medium, low' },
  { name: 'expected_vacancy_date', required: false, type: 'date', description: 'Anticipated vacancy date', defaultValue: 'null', validation: 'e.g., retirement date' },
  { name: 'vacancy_reason', required: false, type: 'text', description: 'Reason for expected vacancy', defaultValue: 'null', validation: 'retirement, promotion, resignation, etc.' },
  { name: 'current_incumbent_id', required: false, type: 'UUID', description: 'Current position holder', defaultValue: 'null', validation: 'References profiles.id' },
  { name: 'succession_plan_id', required: false, type: 'UUID', description: 'Linked succession plan', defaultValue: 'null', validation: 'References succession_plans.id' },
  { name: 'last_reviewed_at', required: false, type: 'timestamptz', description: 'Last review date', defaultValue: 'null', validation: '—' }
];

const positionEvents = [
  { event: 'position_created', description: 'New key position marked in jobs', action: 'Create key_position_risks record' },
  { event: 'position_vacancy_created', description: 'Incumbent leaves position', action: 'Alert succession stakeholders' },
  { event: 'position_filled', description: 'New incumbent assigned', action: 'Update succession plan status' },
  { event: 'org_restructure', description: 'Organizational changes', action: 'Review succession plan validity' },
  { event: 'incumbent_transfer', description: 'Incumbent moving to new role', action: 'Trigger succession plan activation' }
];

export function IntegrationWorkforcePosition() {
  return (
    <section id="sec-9-8" data-manual-anchor="sec-9-8" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Building2 className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.8 Workforce & Position Integration</h3>
          <p className="text-sm text-muted-foreground">
            Sync succession planning with org structure and position lifecycle
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand jobs.is_key_position flag synchronization',
        'Configure position criticality assessment integration',
        'Handle org structure changes and succession plan alerts',
        'Manage position lifecycle events and their succession impacts'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Data Flow: Workforce ↔ Succession
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-semibold mb-3">Workforce → Succession</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">jobs</Badge>
                  <span>Key position designation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">departments</Badge>
                  <span>Org structure hierarchy</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">profiles</Badge>
                  <span>Employee job assignments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">job_families</Badge>
                  <span>Career path structure</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold mb-3">Succession → Workforce</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">key_position_risks</Badge>
                  <span>Vacancy risk tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">succession_plans</Badge>
                  <span>Ready successor data</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">alerts</Badge>
                  <span>Coverage gap notifications</span>
                </li>
              </ul>
            </div>
          </div>

          <InfoCallout>
            The integration is bidirectional: Workforce provides position structure, while Succession 
            feeds back risk assessments and coverage metrics that inform headcount planning.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            is_key_position Flag
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <code>jobs.is_key_position</code> boolean flag identifies positions requiring succession plans:
          </p>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Key Position Criteria</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">1</Badge>
                  <span>Strategic impact on business operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">2</Badge>
                  <span>Specialized skills difficult to replace</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">3</Badge>
                  <span>Leadership of critical functions</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">4</Badge>
                  <span>Revenue/client relationship ownership</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">5</Badge>
                  <span>Regulatory/compliance accountability</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">6</Badge>
                  <span>Long time-to-productivity if vacant</span>
                </li>
              </ul>
            </div>
          </div>

          <TipCallout>
            When marking a job as <code>is_key_position = true</code> in Workforce → Jobs, a corresponding 
            <code>key_position_risks</code> record is automatically created with default criticality assessment.
          </TipCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={keyPositionFields} 
        title="key_position_risks Table (Key Fields)" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Position Lifecycle Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Position lifecycle changes trigger succession planning workflows:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Event</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-left py-2 px-3">Succession Action</th>
                </tr>
              </thead>
              <tbody>
                {positionEvents.map(evt => (
                  <tr key={evt.event} className="border-b">
                    <td className="py-2 px-3 font-mono text-xs">{evt.event}</td>
                    <td className="py-2 px-3">{evt.description}</td>
                    <td className="py-2 px-3">{evt.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Org Structure Change Handling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WarningCallout>
            Organizational restructures can invalidate existing succession plans. When departments are 
            merged, jobs are eliminated, or reporting lines change, affected succession plans must be reviewed.
          </WarningCallout>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Restructure Impact Assessment</h4>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <span>System detects job or department changes</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <span>Affected succession plans flagged for review</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <span>HR receives notification with impact summary</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <span>Plans updated: reassigned, merged, or archived</span>
              </li>
            </ol>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Job Eliminated</h4>
              <p className="text-sm text-muted-foreground">
                Succession plan archived; candidates moved to talent pool for reassignment
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Job Merged</h4>
              <p className="text-sm text-muted-foreground">
                Plans consolidated; candidate pools combined with ranking review
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Reporting Change</h4>
              <p className="text-sm text-muted-foreground">
                Plan stakeholders updated; new manager added as assessor
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <InfoCallout>
        For detailed workforce and position management, refer to the <strong>Workforce Administrator Manual, 
        Section 9.9: Succession Integration</strong>, which covers job architecture and position management in depth.
      </InfoCallout>
    </section>
  );
}
