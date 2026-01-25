import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { UserPlus, Filter, Upload, Users } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Enroll participants individually or in bulk using various methods',
  'Apply eligibility rules based on tenure, job family, or performance tier',
  'Handle exclusions for probationary employees, LOA, or recent hires',
  'Manage participant lists and resolve enrollment conflicts',
  'Verify enrollment completeness before cycle launch'
];

const ENROLLMENT_DIAGRAM = `
flowchart TD
    subgraph Methods["Enrollment Methods"]
        A[Individual Selection] --> D[Review Eligibility]
        B[Bulk by Department] --> D
        C[Import from File] --> D
    end
    
    subgraph Eligibility["Eligibility Processing"]
        D --> E{Check Rules}
        E -->|Pass| F[Add to Participant List]
        E -->|Fail| G[Show Exclusion Reason]
        G --> H{Override?}
        H -->|Yes| I[Add with Exception Flag]
        H -->|No| J[Exclude from Cycle]
        I --> F
    end
    
    subgraph Validation["Pre-Launch Validation"]
        F --> K[Participant List]
        K --> L{Min Participants Met?}
        L -->|No| M[Warning: Add More]
        L -->|Yes| N{All Have Raters?}
        N -->|No| O[Warning: Missing Raters]
        N -->|Yes| P[Ready for Launch]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#3b82f6,stroke:#2563eb,color:#fff
    style P fill:#10b981,stroke:#059669,color:#fff
    style G fill:#f59e0b,stroke:#d97706
`;

const ELIGIBILITY_RULES = [
  {
    rule: 'Minimum Tenure',
    description: 'Employee must have been with company for a minimum period',
    defaultValue: '90 days',
    override: 'Yes, with HR approval'
  },
  {
    rule: 'Employment Status',
    description: 'Must be active employee (not terminated, resigned, or pending)',
    defaultValue: 'Active only',
    override: 'No'
  },
  {
    rule: 'Not on Probation',
    description: 'Exclude employees currently in probationary period',
    defaultValue: 'Exclude probation',
    override: 'Yes, with manager approval'
  },
  {
    rule: 'Not on Leave',
    description: 'Exclude employees on extended leave (LOA, maternity, etc.)',
    defaultValue: 'Exclude if leave > 30 days',
    override: 'Yes, if returning before cycle end'
  },
  {
    rule: 'Job Family Filter',
    description: 'Only include employees in specific job families',
    defaultValue: 'All job families',
    override: 'N/A - configuration setting'
  },
  {
    rule: 'Job Level Filter',
    description: 'Only include employees at certain levels (e.g., managers only)',
    defaultValue: 'All levels',
    override: 'N/A - configuration setting'
  },
  {
    rule: 'Performance Tier',
    description: 'Only include employees with specific performance ratings',
    defaultValue: 'All tiers',
    override: 'N/A - configuration setting'
  }
];

const FIELDS: FieldDefinition[] = [
  {
    name: 'cycle_id',
    required: true,
    type: 'uuid',
    description: 'Reference to the parent feedback cycle',
    defaultValue: '—',
    validation: 'Must reference valid cycle'
  },
  {
    name: 'employee_id',
    required: true,
    type: 'uuid',
    description: 'The participant receiving feedback',
    defaultValue: '—',
    validation: 'Must be active employee'
  },
  {
    name: 'enrollment_method',
    required: true,
    type: 'enum',
    description: 'How the participant was enrolled',
    defaultValue: 'manual',
    validation: 'manual | bulk | import | auto'
  },
  {
    name: 'enrolled_at',
    required: true,
    type: 'timestamp',
    description: 'When participant was added to cycle',
    defaultValue: 'now()',
    validation: '—'
  },
  {
    name: 'enrolled_by',
    required: true,
    type: 'uuid',
    description: 'User who enrolled the participant',
    defaultValue: 'Current user',
    validation: 'References profiles.id'
  },
  {
    name: 'eligibility_override',
    required: false,
    type: 'boolean',
    description: 'Whether eligibility rules were bypassed',
    defaultValue: 'false',
    validation: '—'
  },
  {
    name: 'override_reason',
    required: false,
    type: 'text',
    description: 'Justification for eligibility override',
    defaultValue: '—',
    validation: 'Required if eligibility_override is true'
  },
  {
    name: 'status',
    required: true,
    type: 'enum',
    description: 'Enrollment status',
    defaultValue: 'pending',
    validation: 'pending | confirmed | excluded | withdrawn'
  },
  {
    name: 'exclusion_reason',
    required: false,
    type: 'text',
    description: 'Why participant was excluded from cycle',
    defaultValue: '—',
    validation: 'Required if status is excluded'
  }
];

const STEPS: Step[] = [
  {
    title: 'Access Participant Management',
    description: 'Navigate to the cycle participant enrollment interface.',
    substeps: [
      'Go to Performance → 360 Feedback → Cycles',
      'Select the cycle in Draft status',
      'Click "Manage Participants" tab or button',
      'View current enrollment list (empty for new cycles)'
    ],
    expectedResult: 'Participant management interface opens with enrollment options visible'
  },
  {
    title: 'Choose Enrollment Method',
    description: 'Select the appropriate method based on your needs.',
    substeps: [
      'For individual enrollment: Click "Add Participant" and search by name',
      'For department-based: Click "Bulk Add" → "By Department"',
      'For job family-based: Click "Bulk Add" → "By Job Family"',
      'For file import: Click "Import" and upload CSV/Excel file'
    ],
    expectedResult: 'Appropriate enrollment interface or file upload dialog opens'
  },
  {
    title: 'Apply Eligibility Filters',
    description: 'Configure automatic eligibility rules before adding participants.',
    substeps: [
      'Click "Eligibility Settings" to view current rules',
      'Set minimum tenure requirement (default: 90 days)',
      'Enable/disable probation exclusion',
      'Set leave duration threshold for exclusion',
      'Optionally filter by job family, level, or performance tier'
    ],
    expectedResult: 'Eligibility rules configured - will be applied to all enrollments'
  },
  {
    title: 'Process Bulk Enrollment',
    description: 'For bulk methods, review and confirm the participant list.',
    substeps: [
      'Select target department(s) or job family(ies)',
      'Click "Preview" to see eligible employees',
      'Review the list for any unexpected inclusions/exclusions',
      'For exclusions, view the reason (failed eligibility rule)',
      'Click "Confirm Enrollment" to add all eligible employees'
    ],
    expectedResult: 'All eligible employees from selection are added to participant list'
  },
  {
    title: 'Handle Eligibility Overrides',
    description: 'Override eligibility rules for specific cases when justified.',
    substeps: [
      'Locate the excluded employee in the "Ineligible" tab',
      'Click "Override" next to their name',
      'Select the rule(s) being overridden',
      'Enter justification reason (required)',
      'Confirm override - requires appropriate permission level'
    ],
    expectedResult: 'Employee added with exception flag and audit trail'
  },
  {
    title: 'Review and Validate',
    description: 'Verify enrollment completeness before launch.',
    substeps: [
      'Review total participant count against expectations',
      'Check the "Warnings" section for any issues',
      'Verify all participants have reportable rater coverage',
      'Export participant list for stakeholder review if needed',
      'Resolve any conflicts or duplicates'
    ],
    expectedResult: 'Participant list validated with no blocking issues'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Employee not appearing in search results',
    cause: 'Employee may be inactive, terminated, or in another company',
    solution: 'Verify employee status in Workforce → Employees. Check company filter settings.'
  },
  {
    issue: 'Bulk enrollment adding fewer participants than expected',
    cause: 'Eligibility rules are excluding employees automatically',
    solution: 'Review "Ineligible" tab to see excluded employees and reasons. Adjust rules or override as needed.'
  },
  {
    issue: 'Import file errors',
    cause: 'File format issues or invalid employee identifiers',
    solution: 'Download the import template to verify format. Ensure employee IDs or emails match system records exactly.'
  },
  {
    issue: 'Cannot remove participant after cycle launched',
    cause: 'Participants can only be removed in Draft status',
    solution: 'Mark participant as "Withdrawn" instead. Their rater assignments will be cancelled.'
  }
];

export function WorkflowParticipantEnrollment() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.3</Badge>
          <Badge variant="secondary">~12 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
          <Badge variant="secondary">HR Partner</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Participant Enrollment
        </CardTitle>
        <CardDescription>
          Managing target employees, eligibility rules, exclusions, and bulk enrollment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', '[Cycle Name]', 'Participants']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Participant Enrollment Workflow"
          description="From initial selection through eligibility processing to launch readiness"
          diagram={ENROLLMENT_DIAGRAM}
        />

        {/* Eligibility Rules */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Eligibility Rules
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Rule</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Default</th>
                  <th className="text-left p-3 font-medium">Override?</th>
                </tr>
              </thead>
              <tbody>
                {ELIGIBILITY_RULES.map((rule, index) => (
                  <tr key={rule.rule} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 font-medium">{rule.rule}</td>
                    <td className="p-3 text-muted-foreground">{rule.description}</td>
                    <td className="p-3">{rule.defaultValue}</td>
                    <td className="p-3">{rule.override}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Auto-Enrollment for Recurring Cycles">
          For annual cycles, consider setting up auto-enrollment rules based on job family or department.
          This ensures consistent participation and reduces manual effort each cycle.
        </TipCallout>

        <StepByStep steps={STEPS} title="Step-by-Step Procedure" />

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Database Fields (review_participants table)" 
        />

        <WarningCallout title="Enrollment Audit Trail">
          All enrollment actions are logged with user, timestamp, and method. Eligibility overrides
          require documented justification and may be reviewed during compliance audits.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
