import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Key,
  Link2,
  Shield,
  Database
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';
import { ScreenshotPlaceholder } from '@/components/enablement/shared/ScreenshotPlaceholder';

// Corrected schema based on actual external_training_records table
const externalTrainingFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique record identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'employee_id', required: true, type: 'UUID', description: 'Employee who completed training', defaultValue: '—', validation: 'References profiles.id' },
  { name: 'training_name', required: true, type: 'text', description: 'Name of external training', defaultValue: '—', validation: 'Required' },
  { name: 'provider_name', required: true, type: 'text', description: 'Training provider/vendor', defaultValue: '—', validation: 'Required' },
  { name: 'training_type', required: true, type: 'text', description: 'Type of training', defaultValue: 'course', validation: 'course, certification, conference, workshop' },
  { name: 'completion_date', required: true, type: 'date', description: 'When training was completed', defaultValue: '—', validation: 'Past or today' },
  { name: 'duration_hours', required: false, type: 'decimal', description: 'Training duration in hours', defaultValue: 'null', validation: 'Positive number' },
  { name: 'cost_amount', required: false, type: 'decimal', description: 'Training cost', defaultValue: 'null', validation: 'Positive number' },
  { name: 'cost_currency', required: false, type: 'text', description: 'Currency code', defaultValue: 'USD', validation: 'ISO currency code' },
  { name: 'certificate_url', required: false, type: 'text', description: 'Link to certificate/credential', defaultValue: 'null', validation: 'Valid URL' },
  { name: 'certificate_received', required: false, type: 'boolean', description: 'Certificate documentation received', defaultValue: 'false', validation: 'true/false' },
  { name: 'skills_acquired', required: false, type: 'text[]', description: 'Skills gained from training', defaultValue: '[]', validation: 'Array of skill names' },
  { name: 'training_request_id', required: false, type: 'UUID', description: 'Linked training request', defaultValue: 'null', validation: 'References training_requests.id' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company context', defaultValue: '—', validation: 'References companies.id' }
];

export function LndIntegrationExternalLMS() {
  return (
    <section id="sec-8-8" data-manual-anchor="sec-8-8" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.8 External LMS & Content Providers</h3>
          <p className="text-sm text-muted-foreground">
            Third-party LMS federation, SCORM/xAPI exchange, and SSO configuration
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Record external training completed outside the LMS',
        'Configure SSO/SAML for federated LMS access',
        'Understand SCORM/xAPI data exchange patterns',
        'Track external training costs against budgets'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            External Training Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Employees can submit training completed outside the LMS for inclusion in their 
            learning record. Records can be linked to training requests for cost tracking.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Supported Training Types</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">course</Badge>
                  <span>External online/classroom courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">certification</Badge>
                  <span>Professional certifications (PMP, AWS, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">conference</Badge>
                  <span>Industry conferences and summits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">workshop</Badge>
                  <span>Hands-on workshops and bootcamps</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Record Submission Workflow</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Employee submits external training record</li>
                <li>2. Uploads certificate via <code>certificate_url</code></li>
                <li>3. HR reviews documentation</li>
                <li>4. Sets <code>certificate_received = true</code></li>
                <li>5. Training appears in employee learning history</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={externalTrainingFields} 
        title="external_training_records Table" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            SSO/SAML Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Enable single sign-on for federated access to external learning platforms.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Field</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-left py-2 px-3">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">provider_name</td>
                  <td className="py-2 px-3">Display name of SSO provider</td>
                  <td className="py-2 px-3">LinkedIn Learning</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">provider_type</td>
                  <td className="py-2 px-3">Protocol type</td>
                  <td className="py-2 px-3">SAML, OIDC, OAuth2</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">metadata_url</td>
                  <td className="py-2 px-3">SAML metadata endpoint</td>
                  <td className="py-2 px-3">https://...</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">entity_id</td>
                  <td className="py-2 px-3">SAML entity identifier</td>
                  <td className="py-2 px-3">urn:linkedin:learning</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">attribute_mapping</td>
                  <td className="py-2 px-3">User attribute mappings</td>
                  <td className="py-2 px-3">{"{ email, firstName, lastName }"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium mb-2">LinkedIn Learning</h4>
              <Badge variant="outline">SAML 2.0</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium mb-2">Coursera</h4>
              <Badge variant="outline">SAML 2.0</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium mb-2">Udemy Business</h4>
              <Badge variant="outline">SAML 2.0</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            SCORM/xAPI Data Exchange
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            External content can report completion data back via SCORM or xAPI protocols.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">SCORM 1.2/2004</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Traditional eLearning standard for content packaging and completion tracking.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code>cmi.core.lesson_status</code></li>
                <li>• <code>cmi.core.score.raw</code></li>
                <li>• <code>cmi.core.session_time</code></li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">xAPI (TinCan)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Modern learning analytics standard with rich statement tracking.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Actor-Verb-Object statements</li>
                <li>• Context and result data</li>
                <li>• Activity streams</li>
              </ul>
            </div>
          </div>

          <InfoCallout>
            For detailed SCORM/xAPI tracking configuration, refer to <strong>Chapter 7.19: 
            SCORM/xAPI Analytics</strong>, which documents the complete data model and 
            tracking tables.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Budget Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            External training costs can be tracked against departmental training budgets:
          </p>

          <div className="p-4 border rounded-lg bg-muted/50">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <span>Employee submits external training with cost_amount and cost_currency</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <span>Link to original training_request via training_request_id</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <span>Cost reconciled against training_requests.estimated_cost</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <span>Budget utilization reports reflect actual external training spend</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder 
        title="External Training Submission Form"
        description="Shows the employee form for submitting external training with provider, cost, and certificate upload"
      />

      <WarningCallout>
        External training records should include certificate documentation for compliance tracking. 
        Use the <code>certificate_received</code> flag to track verification status.
      </WarningCallout>

      <TipCallout>
        <strong>Best Practice:</strong> Create approved vendor lists for common external providers 
        (LinkedIn Learning, Coursera, etc.) to streamline reporting and standardize provider names.
      </TipCallout>

      <InfoCallout>
        For detailed vendor management including performance tracking and contract management, 
        refer to <strong>Chapter 3: External Training & Vendor Management</strong>.
      </InfoCallout>
    </section>
  );
}
