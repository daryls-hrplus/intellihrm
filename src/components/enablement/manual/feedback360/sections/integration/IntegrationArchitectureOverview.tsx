import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  ArrowRight, 
  Shield, 
  Database, 
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition 
} from '@/components/enablement/manual/components';

const integrationFields: FieldDefinition[] = [
  {
    name: 'appraisal_cycle_id',
    required: false,
    type: 'UUID',
    description: 'Links 360 cycle to a parent appraisal cycle for CRGV+360 scoring',
    defaultValue: 'null',
    validation: 'Must reference valid appraisal_cycles.id'
  },
  {
    name: 'feed_to_appraisal',
    required: false,
    type: 'boolean',
    description: 'Enables automatic score contribution to linked appraisal',
    defaultValue: 'false',
    validation: 'Requires appraisal_cycle_id when true'
  },
  {
    name: 'is_standalone',
    required: false,
    type: 'boolean',
    description: 'Indicates cycle operates independently of appraisals',
    defaultValue: 'true',
    validation: 'Mutually exclusive with feed_to_appraisal'
  },
  {
    name: 'signal_generation_enabled',
    required: false,
    type: 'boolean',
    description: 'Enables talent signal snapshot creation',
    defaultValue: 'true',
    validation: 'Respects employee consent settings'
  },
  {
    name: 'nine_box_integration_enabled',
    required: false,
    type: 'boolean',
    description: 'Enables automatic Nine-Box performance axis updates',
    defaultValue: 'false',
    validation: 'Requires succession module configuration'
  }
];

export function IntegrationArchitectureOverview() {
  return (
    <section id="sec-7-1" data-manual-anchor="sec-7-1" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Network className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">7.1 Integration Architecture Overview</h3>
          <p className="text-sm text-muted-foreground">
            System architecture and data flow patterns for cross-module integration
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand how 360 Feedback connects to other HRplus modules',
        'Identify data flow directions and synchronization patterns',
        'Configure consent gates and policy enforcement points',
        'Plan integration implementation sequence'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Integration Topology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            360 Feedback serves as a <strong>signal source</strong> that feeds data to multiple consuming modules. 
            The integration follows an event-driven architecture where cycle completion triggers downstream updates.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                Outbound Data Flows (360 → Other Modules)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Appraisals</Badge>
                  <span>Weighted score contribution</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Talent</Badge>
                  <span>Signal snapshots</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Nine-Box</Badge>
                  <span>Performance axis rating</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Succession</Badge>
                  <span>Readiness indicators</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">IDP</Badge>
                  <span>Development themes → goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Learning</Badge>
                  <span>Skill gaps → course recommendations</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-green-600 rotate-180" />
                Inbound Data Flows (Other Modules → 360)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Workforce</Badge>
                  <span>Employee profiles, org structure</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Competencies</Badge>
                  <span>Competency frameworks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Appraisals</Badge>
                  <span>Cycle timing, weight configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Continuous</Badge>
                  <span>Ongoing feedback context</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consent Gates & Policy Enforcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WarningCallout>
            All cross-module data flows are governed by consent gates. Data only propagates when 
            explicit consent is granted and policy conditions are met. This ensures GDPR/data protection 
            compliance across all integrations.
          </WarningCallout>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Signal Generation Consent</p>
                <p className="text-sm text-muted-foreground">
                  Employee must consent to talent signal creation before 360 data feeds Talent Profile or Succession modules.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Appraisal Linkage Consent</p>
                <p className="text-sm text-muted-foreground">
                  Cycle configuration must explicitly enable <code>feed_to_appraisal</code> for score contribution.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">K-Anonymity Threshold</p>
                <p className="text-sm text-muted-foreground">
                  Aggregated data for talent/succession requires minimum 5 responses to protect rater anonymity.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={integrationFields} 
        title="feedback_360_cycles Integration Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integration Tables Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Source Tables (360 Module)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>feedback_360_cycles</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>feedback_360_responses</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>development_themes</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>feedback_coaching_prompts</code>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Target Tables (Other Modules)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>appraisal_scores</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>talent_signal_snapshots</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>nine_box_assessments</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>idp_items</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>employee_skill_gaps</code>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout>
        <strong>Implementation Sequence:</strong> Configure integrations in this order: (1) Appraisal linkage, 
        (2) Talent Profile signals, (3) Nine-Box/Succession, (4) IDP themes, (5) Learning recommendations. 
        This ensures data dependencies are satisfied at each step.
      </TipCallout>

      <InfoCallout>
        The integration architecture follows SAP SuccessFactors and Workday patterns for multi-source 
        performance management, ensuring enterprise-grade interoperability and data governance.
      </InfoCallout>
    </section>
  );
}
