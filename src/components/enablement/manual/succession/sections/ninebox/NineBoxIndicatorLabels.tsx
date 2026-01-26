// Section 3.4: Box Labels & Descriptions Configuration
// Customize 9 quadrant labels, colors, and suggested actions

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  FieldReferenceTable,
  StepByStep,
  TroubleshootingSection,
  type FieldDefinition,
  type Step,
  type TroubleshootingItem,
} from '../../../components';
import { Grid3X3, Palette, MessageSquare, RefreshCw } from 'lucide-react';

const INDICATOR_CONFIGS_FIELDS: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Primary key, auto-generated',
    defaultValue: 'gen_random_uuid()',
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to companies table',
    validation: 'Must reference valid company',
  },
  {
    name: 'performance_level',
    required: true,
    type: 'Integer (1-3)',
    description: 'Performance axis level (1=Low, 2=Moderate, 3=High)',
    validation: 'Must be 1, 2, or 3',
  },
  {
    name: 'potential_level',
    required: true,
    type: 'Integer (1-3)',
    description: 'Potential axis level (1=Low, 2=Moderate, 3=High)',
    validation: 'Must be 1, 2, or 3',
  },
  {
    name: 'default_label',
    required: true,
    type: 'Text',
    description: 'System-default label for this quadrant (e.g., "Star Performer")',
  },
  {
    name: 'custom_label',
    required: false,
    type: 'Text',
    description: 'Company-specific override label',
  },
  {
    name: 'use_custom_label',
    required: true,
    type: 'Boolean',
    description: 'Whether to display custom_label instead of default_label',
    defaultValue: 'false',
  },
  {
    name: 'description',
    required: false,
    type: 'Text',
    description: 'Detailed description of this quadrant for managers',
  },
  {
    name: 'suggested_actions',
    required: false,
    type: 'Text',
    description: 'Recommended development actions for employees in this quadrant',
  },
  {
    name: 'color_code',
    required: false,
    type: 'Text',
    description: 'Hex color code for visual representation (e.g., "#22c55e")',
  },
  {
    name: 'created_at',
    required: true,
    type: 'Timestamp',
    description: 'Record creation timestamp',
    defaultValue: 'now()',
  },
  {
    name: 'updated_at',
    required: false,
    type: 'Timestamp',
    description: 'Last modification timestamp',
  },
];

const INITIALIZE_LABELS_STEPS: Step[] = [
  {
    title: 'Navigate to Nine-Box Configuration',
    description: 'Access the Nine-Box setup from the Succession module.',
    substeps: [
      'Go to Performance → Succession → Setup',
      'Select the "Nine-Box Config" tab',
      'Choose the target company from the dropdown',
    ],
  },
  {
    title: 'Open Quadrant Labels Panel',
    description: 'Locate the 9-Box Quadrant Labels configuration section.',
    substeps: [
      'Click the "Quadrant Labels" tab in the configuration panel',
      'View the 3x3 grid displaying all 9 quadrants',
    ],
  },
  {
    title: 'Initialize Defaults (First-Time Setup)',
    description: 'Create industry-standard labels for all 9 quadrants.',
    substeps: [
      'If no labels exist, click "Initialize Defaults" button',
      'System creates all 9 quadrant configurations with standard labels and colors',
    ],
    expectedResult: 'Grid displays all 9 quadrants with default labels and color coding.',
  },
  {
    title: 'Customize a Quadrant',
    description: 'Edit label, description, and actions for a specific quadrant.',
    substeps: [
      'Click any quadrant cell in the grid',
      'Edit dialog opens with current configuration',
      'Modify default_label or enable use_custom_label for override',
      'Add description text explaining the quadrant',
      'Enter suggested_actions for development guidance',
      'Select color using the color picker',
      'Click "Save" to apply changes',
    ],
    expectedResult: 'Quadrant displays updated label and color in the grid.',
  },
];

const TROUBLESHOOTING_ITEMS: TroubleshootingItem[] = [
  {
    issue: 'Quadrant showing "Unassigned" label',
    cause: 'No configuration exists for this performance_level + potential_level combination',
    solution: 'Click "Initialize Defaults" to create all 9 configurations, or manually add the missing quadrant',
  },
  {
    issue: 'Custom label not displaying despite being set',
    cause: 'use_custom_label is set to false',
    solution: 'Edit the quadrant and enable the "Use custom label" checkbox',
  },
  {
    issue: 'Color not appearing correctly in grid',
    cause: 'Invalid hex color code format',
    solution: 'Ensure color_code follows hex format (e.g., "#22c55e" including the #)',
  },
  {
    issue: 'Upsert conflict error when saving',
    cause: 'Constraint violation on company_id + performance_level + potential_level',
    solution: 'This quadrant already exists—update rather than insert; reload and try again',
  },
];

export function NineBoxIndicatorLabels() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Configure custom labels for each of the 9 quadrants in the Nine-Box grid",
          "Apply company-specific terminology while preserving system defaults",
          "Set quadrant descriptions and suggested development actions for managers",
          "Apply consistent color coding across the organization",
          "Initialize default configurations for new company setup"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Succession → Setup → Nine-Box Config → Quadrant Labels
        </code>
      </InfoCallout>

      {/* Field Reference Table */}
      <FieldReferenceTable
        title="nine_box_indicator_configs Table Schema"
        fields={INDICATOR_CONFIGS_FIELDS}
      />

      {/* Default Labels Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Default Quadrant Labels & Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            These default labels follow McKinsey 9-Box naming conventions. Customize as needed 
            for your organization's terminology while maintaining clarity.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Position</th>
                  <th className="text-left py-3 px-4 font-medium">Default Label</th>
                  <th className="text-left py-3 px-4 font-medium">Color</th>
                  <th className="text-left py-3 px-4 font-medium">Default Suggested Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(3,3)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Star Performer</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
                      <span className="font-mono text-xs">#22c55e</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Accelerate development, consider for key roles, high visibility projects</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(2,3)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">High Potential</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }} />
                      <span className="font-mono text-xs">#3b82f6</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Develop performance skills, stretch assignments, mentoring</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(1,3)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-600">Inconsistent Performer</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
                      <span className="font-mono text-xs">#f59e0b</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Address performance gaps, leverage potential through coaching</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(3,2)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-cyan-600">Core Player</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#06b6d4' }} />
                      <span className="font-mono text-xs">#06b6d4</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Maintain engagement, develop for future potential</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(2,2)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-purple-600">Solid Contributor</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }} />
                      <span className="font-mono text-xs">#8b5cf6</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Continue development, explore growth opportunities</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(1,2)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-orange-600">Underperformer</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
                      <span className="font-mono text-xs">#f97316</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Performance improvement plan, identify root causes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(3,1)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-teal-600">Technical Expert</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#14b8a6' }} />
                      <span className="font-mono text-xs">#14b8a6</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Leverage expertise, consider technical leadership track</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(2,1)</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-slate-600">Average Performer</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#94a3b8' }} />
                      <span className="font-mono text-xs">#94a3b8</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Set clear expectations, provide development support</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">(1,1)</td>
                  <td className="py-3 px-4">
                    <Badge variant="destructive">Low Performer</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
                      <span className="font-mono text-xs">#ef4444</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">Immediate intervention required, assess fit for role</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Custom Label Override */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Custom Label Override
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Organizations can override default labels with company-specific terminology 
            while preserving the system defaults for reference.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Field</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">default_label</td>
                  <td className="py-3 px-4">System-provided label (always preserved)</td>
                  <td className="py-3 px-4">"Star Performer"</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">custom_label</td>
                  <td className="py-3 px-4">Company-specific override</td>
                  <td className="py-3 px-4">"A+ Talent"</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">use_custom_label</td>
                  <td className="py-3 px-4">Toggle to display custom instead of default</td>
                  <td className="py-3 px-4">true / false</td>
                </tr>
              </tbody>
            </table>
          </div>

          <WarningCallout title="Label Consistency">
            When using custom labels, ensure consistency across training materials, 
            manager communications, and calibration sessions. Inconsistent terminology 
            leads to confusion during talent reviews.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Color Coding Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Color Coding Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Default colors follow a heat-map pattern: green for top performers, 
            blue/purple for high potential, amber/orange for development needs, 
            and red for critical intervention.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">Performance Gradient (X-axis)</h4>
              <div className="flex gap-2">
                <div className="flex-1 h-8 rounded bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground">Low → Moderate → High Performance</p>
            </div>
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">Potential Gradient (Y-axis)</h4>
              <div className="flex gap-2">
                <div className="flex-1 h-8 rounded bg-gradient-to-r from-slate-500 via-purple-500 to-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">Low → Moderate → High Potential</p>
            </div>
          </div>

          <TipCallout title="Accessibility Consideration">
            Ensure color choices have sufficient contrast for accessibility compliance. 
            Labels and descriptions should not rely solely on color to convey meaning.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Step-by-Step Procedure */}
      <StepByStep
        title="Initialize and Customize Quadrant Labels"
        steps={INITIALIZE_LABELS_STEPS}
      />

      {/* Troubleshooting */}
      <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />

      {/* Best Practices */}
      <TipCallout title="Quadrant Label Best Practices">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Keep labels short (2-3 words) for grid display clarity</li>
          <li>Write suggested_actions as actionable items, not vague guidance</li>
          <li>Use descriptions to explain what behaviors/outcomes define the quadrant</li>
          <li>Maintain color consistency with other talent visualizations</li>
          <li>Review labels with stakeholders before rolling out to managers</li>
          <li>Document any custom labels in manager training materials</li>
        </ul>
      </TipCallout>
    </div>
  );
}
