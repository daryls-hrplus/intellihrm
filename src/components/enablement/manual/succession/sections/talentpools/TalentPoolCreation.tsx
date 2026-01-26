import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  PlusCircle, 
  Settings, 
  ChevronRight, 
  Code,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export function TalentPoolCreation() {
  const poolFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to parent company', validation: 'Must be valid company' },
    { name: 'name', required: true, type: 'Text', description: 'Display name of the talent pool', defaultValue: '—', validation: 'Max 100 characters' },
    { name: 'code', required: true, type: 'Text', description: 'Unique identifier code within company', validation: 'Uppercase, no spaces, unique per company' },
    { name: 'description', required: false, type: 'Text', description: 'Detailed description of pool purpose and scope', defaultValue: 'null' },
    { name: 'pool_type', required: true, type: 'Text (Enum)', description: 'Classification type', defaultValue: 'high_potential', validation: 'Must be valid pool_type' },
    { name: 'criteria', required: false, type: 'JSONB', description: 'Eligibility criteria for membership', defaultValue: '{}' },
    { name: 'is_active', required: true, type: 'Boolean', description: 'Whether the pool is active', defaultValue: 'true' },
    { name: 'start_date', required: true, type: 'Date', description: 'Pool effective date (auto-set on creation)', defaultValue: 'CURRENT_DATE' },
    { name: 'end_date', required: false, type: 'Date', description: 'Pool expiration date (null = no expiration)', defaultValue: 'null' },
    { name: 'created_by', required: false, type: 'UUID', description: 'User who created the pool (nullable)', defaultValue: 'null' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Record last update timestamp', defaultValue: 'now()' }
  ];

  const createPoolSteps: Step[] = [
    {
      title: 'Navigate to Talent Pools',
      description: 'Open the Talent Pools tab within the Succession Planning module.',
      substeps: [
        'Go to Performance → Succession Planning',
        'Select the Talent Pools tab',
        'Ensure you have selected the correct company from the company selector'
      ],
      expectedResult: 'You see the talent pools list with any existing pools displayed'
    },
    {
      title: 'Click Create Pool',
      description: 'Initiate the pool creation dialog.',
      substeps: [
        'Click the "+ Create Pool" button in the top right corner',
        'The create pool dialog opens'
      ],
      expectedResult: 'Pool creation form is displayed with empty fields'
    },
    {
      title: 'Enter Pool Details',
      description: 'Complete the required and optional fields for the new pool.',
      substeps: [
        'Enter a descriptive Name (e.g., "2024 Leadership Pipeline - Finance")',
        'Enter a unique Code (e.g., "LP-FIN-2024")',
        'Select the appropriate Pool Type from the dropdown',
        'Add a Description explaining the pool purpose and criteria'
      ],
      notes: [
        'Code must be unique within the company',
        'Use consistent naming conventions for easy identification'
      ],
      expectedResult: 'Form fields are populated with your entries'
    },
    {
      title: 'Configure Eligibility Criteria (Optional)',
      description: 'Set up JSONB criteria for automatic eligibility validation.',
      substeps: [
        'Expand the Advanced Criteria section',
        'Set minimum score threshold if applicable',
        'Set minimum confidence threshold if applicable',
        'Add required signals (e.g., leadership, strategic_thinking)',
        'Add excluded roles if needed'
      ],
      notes: [
        'Criteria are validated during HR review',
        'Leave empty for fully manual qualification'
      ],
      expectedResult: 'Criteria configuration is displayed'
    },
    {
      title: 'Set Pool Dates (Optional)',
      description: 'Define the pool effective period.',
      substeps: [
        'Set Start Date if different from today',
        'Set End Date if the pool should expire automatically',
        'Leave End Date empty for permanent pools'
      ],
      expectedResult: 'Dates are set or left empty for immediate and permanent activation'
    },
    {
      title: 'Save the Pool',
      description: 'Create the talent pool record.',
      substeps: [
        'Review all entered information',
        'Click the "Create" button',
        'Confirm creation if prompted'
      ],
      expectedResult: 'Pool is created and appears in the talent pools list with 0 members'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Code uniqueness', enforcement: 'System', description: 'Pool codes must be unique within each company. Duplicate codes will be rejected.' },
    { rule: 'Pool type immutable', enforcement: 'System', description: 'Pool type cannot be changed after creation. To change type, create a new pool and migrate members.' },
    { rule: 'Active pool protection', enforcement: 'System', description: 'Pools with active members cannot be deleted, only deactivated.' },
    { rule: 'End date validation', enforcement: 'System', description: 'End date must be after start date if both are specified.' },
    { rule: 'Maximum pools per company', enforcement: 'Advisory', description: 'Recommended maximum of 20 active pools per company to maintain manageability.' },
    { rule: 'Criteria schema validation', enforcement: 'System', description: 'JSONB criteria must conform to expected schema structure.' }
  ];

  return (
    <section id="sec-5-3" data-manual-anchor="sec-5-3" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.3 Pool Creation & Configuration</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create talent pools with eligibility criteria and configuration options
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Create a new talent pool with required and optional fields',
          'Configure JSONB eligibility criteria for automatic member validation',
          'Understand pool lifecycle management including activation and expiration',
          'Apply business rules for pool code naming and type assignment'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Talent Pools</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">+ Create Pool</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlusCircle className="h-5 w-5 text-primary" />
            talent_pools Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={poolFields} />
        </CardContent>
      </Card>

      {/* JSONB Criteria Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Code className="h-5 w-5 text-primary" />
            JSONB Criteria Schema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The <code className="bg-muted px-1.5 py-0.5 rounded text-xs">criteria</code> field 
            stores eligibility rules in JSONB format. These criteria are evaluated during 
            HR review to validate candidate qualifications.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h5 className="text-sm font-medium mb-2">Example Criteria Structure</h5>
            <pre className="text-xs overflow-x-auto">
{`{
  "minimumScore": 3.5,
  "minimumConfidence": 0.7,
  "requiredSignals": ["leadership", "strategic_thinking", "learning_agility"],
  "excludeRoles": ["contractor", "intern", "temporary"],
  "minimumTenure": 12,
  "nineBoxQuadrants": [1, 2, 4]
}`}
            </pre>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">minimumScore</h5>
              <p className="text-xs text-muted-foreground">Numeric (0.0-5.0). Minimum overall talent signal score required.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">minimumConfidence</h5>
              <p className="text-xs text-muted-foreground">Numeric (0.0-1.0). Minimum confidence level for talent data.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">requiredSignals</h5>
              <p className="text-xs text-muted-foreground">String array. Signal types that must be present and above threshold.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">excludeRoles</h5>
              <p className="text-xs text-muted-foreground">String array. Employment types or roles ineligible for the pool.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">minimumTenure</h5>
              <p className="text-xs text-muted-foreground">Integer (months). Minimum company tenure required.</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm">nineBoxQuadrants</h5>
              <p className="text-xs text-muted-foreground">Integer array (1-9). Required Nine-Box positions for eligibility.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create New Talent Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={createPoolSteps} title="" />
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Edit & Archive Procedures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Edit & Deactivate Procedures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Pool Configuration
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click the pool row to open the detail view</li>
              <li>Click the "Edit" button in the pool header</li>
              <li>Modify name, description, criteria, or dates as needed</li>
              <li>Note: Pool type and code cannot be changed</li>
              <li>Click "Save Changes" to update the pool</li>
            </ol>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Deactivate Pool
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open the pool detail view</li>
              <li>Click "Deactivate Pool" from the actions menu</li>
              <li>Confirm deactivation when prompted</li>
              <li>Existing members remain but no new nominations can be made</li>
              <li>Pool can be reactivated later if needed</li>
            </ol>
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-xs">
              <strong>Note:</strong> Pools cannot be deleted if they have members. Deactivate instead.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Pool Naming Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Use consistent naming convention: [Type]-[Department/Region]-[Year]',
              'Include purpose in description: eligibility criteria, review cycle, development track',
              'Set realistic criteria to avoid empty pools or over-qualification',
              'Review and refresh criteria annually to align with business strategy',
              'Use end dates for time-bound initiatives (e.g., leadership programs)',
              'Document any special handling or exceptions in the description field'
            ].map((practice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
