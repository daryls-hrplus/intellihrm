import { LearningObjectives } from '../../components/LearningObjectives';
import { StepByStep, Step } from '../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { ConfigurationExample, ExampleConfig } from '../../components/ConfigurationExample';
import { BusinessRules, BusinessRule } from '../../components/BusinessRules';
import { Database, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const learningObjectives = [
  'Configure 6 data policy types for 360 feedback governance',
  'Understand policy versioning and approval workflows',
  'Apply organization-specific data handling rules',
  'Manage policy lifecycle from draft to active status'
];

const policyTypes = [
  {
    type: 'retention',
    label: 'Retention Policy',
    description: 'Defines how long feedback data is retained before archival/deletion',
    scope: 'Cycle-level or Company-wide',
    example: 'Retain for 5 years, then anonymize'
  },
  {
    type: 'anonymization',
    label: 'Anonymization Policy',
    description: 'Rules for anonymizing data when retention period expires',
    scope: 'Company-wide',
    example: 'Remove names, hash IDs, aggregate responses'
  },
  {
    type: 'ai_usage',
    label: 'AI Usage Policy',
    description: 'Governs how AI can process and analyze feedback data',
    scope: 'Company-wide',
    example: 'AI analysis allowed with consent; no external models'
  },
  {
    type: 'external_access',
    label: 'External Access Policy',
    description: 'Controls sharing of data with external parties (consultants, auditors)',
    scope: 'Cycle-level',
    example: 'Aggregated data only; no individual responses'
  },
  {
    type: 'signal_aggregation',
    label: 'Signal Aggregation Policy',
    description: 'Rules for extracting talent signals from feedback data',
    scope: 'Company-wide',
    example: 'Min 3 cycles before trend signal; 5 raters minimum'
  },
  {
    type: 'cross_module_sharing',
    label: 'Cross-Module Sharing Policy',
    description: 'Governs data flow between 360, Appraisals, Succession, and L&D',
    scope: 'Company-wide',
    example: 'Share aggregates with Succession; no raw comments'
  }
];

const policyFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the policy',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Company this policy applies to',
    validation: 'Must exist in companies'
  },
  {
    name: 'policy_type',
    required: true,
    type: 'text',
    description: 'Type of data policy',
    validation: 'One of: retention, anonymization, ai_usage, external_access, signal_aggregation, cross_module_sharing'
  },
  {
    name: 'policy_name',
    required: true,
    type: 'text',
    description: 'Human-readable policy name',
    validation: 'Max 255 characters'
  },
  {
    name: 'policy_version',
    required: true,
    type: 'text',
    description: 'Semantic version of the policy',
    defaultValue: '1.0.0',
    validation: 'Format: X.Y.Z'
  },
  {
    name: 'policy_content',
    required: true,
    type: 'JSONB',
    description: 'Policy configuration and rules',
    validation: 'Valid JSON matching policy type schema'
  },
  {
    name: 'is_active',
    required: true,
    type: 'boolean',
    description: 'Whether this policy is currently active',
    defaultValue: 'false',
    validation: 'Only one active policy per type per company'
  },
  {
    name: 'approved_by',
    required: false,
    type: 'UUID',
    description: 'User who approved the policy',
    validation: 'Must have policy approval permission'
  },
  {
    name: 'approved_at',
    required: false,
    type: 'timestamp',
    description: 'When the policy was approved',
    validation: 'Set when approved_by is set'
  },
  {
    name: 'effective_from',
    required: false,
    type: 'timestamp',
    description: 'When the policy becomes effective',
    validation: 'Must be after approved_at'
  }
];

const configurationSteps: Step[] = [
  {
    title: 'Access Data Policy Configuration',
    description: 'Navigate to the governance configuration panel.',
    substeps: [
      'Go to Performance → 360 Feedback → Setup → Data Policies',
      'Or navigate to Admin → Governance → Data Policies',
      'Select "360 Feedback" as the module filter'
    ],
    expectedResult: 'Data policy management interface displayed'
  },
  {
    title: 'Create New Policy',
    description: 'Initiate creation of a new data policy.',
    substeps: [
      'Click "Create Policy" button',
      'Select policy type from dropdown',
      'Enter policy name and description',
      'Policy created in Draft status'
    ],
    expectedResult: 'New policy record created with draft status'
  },
  {
    title: 'Configure Policy Content',
    description: 'Define the policy rules and parameters.',
    substeps: [
      'Edit the policy content JSON or use form builder',
      'Set specific parameters (retention days, thresholds, etc.)',
      'Add any exceptions or special conditions',
      'Save draft changes'
    ],
    expectedResult: 'Policy content configured and saved'
  },
  {
    title: 'Submit for Approval',
    description: 'Route the policy for management approval.',
    substeps: [
      'Click "Submit for Approval"',
      'Select approver or approval group',
      'Add justification/notes if required',
      'Policy status changes to "Pending Approval"'
    ],
    expectedResult: 'Policy submitted to approval workflow'
  },
  {
    title: 'Approve and Activate',
    description: 'Approver reviews and activates the policy.',
    substeps: [
      'Approver receives notification',
      'Review policy content and implications',
      'Click "Approve" and set effective date',
      'System deactivates previous version, activates new'
    ],
    expectedResult: 'Policy active; previous version archived for audit'
  }
];

const configurationExamples: ExampleConfig[] = [
  {
    title: 'Conservative Data Policy Set',
    context: 'Financial services company with strict data governance requirements',
    values: [
      { field: 'retention_policy', value: '{"retention_months": 84, "auto_anonymize": true}' },
      { field: 'ai_usage_policy', value: '{"ai_enabled": false}' },
      { field: 'external_access_policy', value: '{"allow_external": false}' }
    ],
    outcome: '7-year retention with auto-anonymization; AI and external sharing disabled'
  },
  {
    title: 'Progressive Data Policy Set',
    context: 'Technology company embracing AI-driven talent insights',
    values: [
      { field: 'retention_policy', value: '{"retention_months": 36, "auto_anonymize": true}' },
      { field: 'ai_usage_policy', value: '{"ai_enabled": true, "consent_required": true}' },
      { field: 'cross_module_sharing', value: '{"succession": true, "learning": true}' }
    ],
    outcome: '3-year retention; AI analysis with consent; cross-module intelligence enabled'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Only one active policy per type per company',
    enforcement: 'System',
    description: 'Activating a new policy automatically deactivates the previous version'
  },
  {
    rule: 'Policy changes require approval',
    enforcement: 'Policy',
    description: 'HR Director or designated approver must approve before activation'
  },
  {
    rule: 'Version history preserved for audit',
    enforcement: 'System',
    description: 'All policy versions retained; only is_active flag changes'
  },
  {
    rule: 'Policies cannot be backdated',
    enforcement: 'System',
    description: 'effective_from must be in the future or current timestamp'
  }
];

export function GovernanceDataPolicies() {
  return (
    <section id="sec-4-5" data-manual-anchor="sec-4-5" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          4.5 Data Policy Configuration
        </h3>
        <p className="text-muted-foreground mt-2">
          Configure 6 policy types governing retention, anonymization, AI usage, external access, signal aggregation, and cross-module sharing.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Navigation Path</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Performance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">360 Feedback</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Governance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Data Policies</span>
          </div>
        </CardContent>
      </Card>

      {/* Policy Types Table */}
      <div>
        <h4 className="font-medium mb-4">Six Data Policy Types</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Policy Type</TableHead>
                <TableHead className="font-medium">Purpose</TableHead>
                <TableHead className="font-medium">Scope</TableHead>
                <TableHead className="font-medium">Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policyTypes.map((policy) => (
                <TableRow key={policy.type}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {policy.type}
                    </code>
                    <p className="text-xs text-muted-foreground mt-1">{policy.label}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{policy.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{policy.scope}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{policy.example}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Policy Lifecycle Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Policy Lifecycle</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                    POLICY LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐  │
│  │ DRAFT  │ ──▶ │ PENDING  │ ──▶ │ APPROVED │ ──▶ │ ACTIVE  │  │
│  │        │     │ APPROVAL │     │          │     │         │  │
│  └────────┘     └──────────┘     └──────────┘     └────┬────┘  │
│       │               │                                 │       │
│       ▼               ▼                                 ▼       │
│  ┌────────┐     ┌──────────┐                     ┌──────────┐  │
│  │DELETED │     │ REJECTED │                     │ ARCHIVED │  │
│  │(Draft) │     │          │                     │(Superseded)│ │
│  └────────┘     └──────────┘                     └──────────┘  │
│                                                                 │
│  Version Control:                                               │
│  ───────────────                                                │
│  v1.0.0 (archived) ──▶ v1.1.0 (archived) ──▶ v2.0.0 (active)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={configurationSteps} 
        title="Step-by-Step: Configure Data Policy" 
      />

      <FieldReferenceTable 
        fields={policyFields} 
        title="Policy Schema (feedback_data_policies)" 
      />

      <ConfigurationExample 
        examples={configurationExamples} 
        title="Organization Policy Examples" 
      />

      <BusinessRules rules={businessRules} />
    </section>
  );
}
