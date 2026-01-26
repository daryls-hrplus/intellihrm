import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Link2, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  User,
  ClipboardCheck
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  BusinessRules,
  StepByStep,
  type FieldDefinition,
  type BusinessRule,
  type Step 
} from '@/components/enablement/manual/components';

const themeToIdpFields: FieldDefinition[] = [
  {
    name: 'idp_id',
    required: false,
    type: 'UUID',
    description: 'Reference to the IDP this theme is linked to',
    defaultValue: 'null',
    validation: 'Set when theme is linked to an IDP'
  },
  {
    name: 'idp_item_id',
    required: false,
    type: 'UUID',
    description: 'Specific IDP goal/item created from this theme',
    defaultValue: 'null',
    validation: 'Set when goal is auto-created'
  },
  {
    name: 'link_type',
    required: false,
    type: 'text',
    description: 'Type of linkage between theme and IDP',
    defaultValue: 'null',
    validation: 'Enum: derived, informed, validated'
  },
  {
    name: 'linked_at',
    required: false,
    type: 'timestamp',
    description: 'When the theme was linked to IDP',
    defaultValue: 'null',
    validation: 'Auto-set on linkage'
  },
  {
    name: 'linked_by',
    required: false,
    type: 'UUID',
    description: 'User who created the linkage (manager or employee)',
    defaultValue: 'null',
    validation: 'References profiles.id'
  }
];

const idpItemFields: FieldDefinition[] = [
  {
    name: 'source_theme_id',
    required: false,
    type: 'UUID',
    description: 'Development theme that originated this IDP goal',
    defaultValue: 'null',
    validation: 'For traceability back to 360 feedback'
  },
  {
    name: 'source_type',
    required: false,
    type: 'text',
    description: 'Origin of the IDP item',
    defaultValue: 'null',
    validation: 'Enum: manual, feedback_360, appraisal, skill_gap'
  },
  {
    name: 'status',
    required: true,
    type: 'text',
    description: 'Current status of the IDP goal',
    defaultValue: 'draft',
    validation: 'Enum: draft, in_progress, completed, cancelled'
  }
];

const linkingSteps: Step[] = [
  {
    title: 'Review Development Themes',
    description: 'Employee and manager review AI-generated themes from 360 feedback.',
    notes: ['Themes available after 360 cycle processing', 'Found in employee profile → Development tab']
  },
  {
    title: 'Confirm Theme Relevance',
    description: 'Manager validates which themes should translate to development goals.',
    notes: ['Unconfirmed themes remain as insights only', 'Confirmation required for IDP linking']
  },
  {
    title: 'Select Link Type',
    description: 'Choose how the theme relates to the IDP goal.',
    notes: ['Derived: Direct conversion to goal', 'Informed: Theme context for existing goal', 'Validated: Confirms existing IDP priority']
  },
  {
    title: 'Create IDP Goal',
    description: 'System auto-generates IDP goal with theme context or links to existing.',
    notes: ['Goal title and description pre-populated from theme', 'Target completion date suggested based on theme complexity']
  },
  {
    title: 'Track Progress',
    description: 'Progress on IDP goal reflects back to development theme status.',
    notes: ['Theme marked "addressed" when linked goal completes', 'Next 360 cycle can measure improvement']
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Theme must be confirmed before linking',
    enforcement: 'System',
    description: 'Only manager-confirmed development themes can be linked to IDP goals'
  },
  {
    rule: 'Employee can view but not modify links',
    enforcement: 'System',
    description: 'Link creation is manager action; employee sees links in read-only view'
  },
  {
    rule: 'One theme can link to multiple IDP items',
    enforcement: 'Advisory',
    description: 'Complex themes may require multiple development activities'
  },
  {
    rule: 'Derived links auto-create goals',
    enforcement: 'System',
    description: 'Selecting "derived" automatically generates a new IDP item'
  },
  {
    rule: 'IDP completion updates theme status',
    enforcement: 'System',
    description: 'Completing linked IDP goal marks theme as "addressed"'
  }
];

export function IntegrationIDPDevelopment() {
  return (
    <section id="sec-7-5" data-manual-anchor="sec-7-5" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">7.5 IDP & Development Planning</h3>
          <p className="text-sm text-muted-foreground">
            Development theme to IDP goal linking and manager approval workflows
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand the three types of theme-to-IDP linkages',
        'Link development themes to IDP goals as a manager',
        'Track IDP progress that originated from 360 feedback',
        'Configure auto-generation of IDP items from confirmed themes'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Theme-to-IDP Link Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When linking development themes from 360 feedback to Individual Development Plans, 
            three relationship types are available:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <Badge className="mb-3 bg-purple-600">Derived</Badge>
              <h4 className="font-semibold mb-2">Direct Conversion</h4>
              <p className="text-sm text-muted-foreground">
                Theme becomes a new IDP goal. System auto-creates the goal with theme 
                details pre-populated. Strongest linkage type.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <ArrowRight className="h-3 w-3" />
                <span>Theme → New IDP Goal</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Badge className="mb-3 bg-blue-600">Informed</Badge>
              <h4 className="font-semibold mb-2">Context Provider</h4>
              <p className="text-sm text-muted-foreground">
                Theme adds context to an existing IDP goal. Used when an IDP goal 
                already covers the development area but needs 360 evidence.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <ArrowRight className="h-3 w-3" />
                <span>Theme → Existing IDP (context)</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <Badge className="mb-3 bg-green-600">Validated</Badge>
              <h4 className="font-semibold mb-2">Priority Confirmation</h4>
              <p className="text-sm text-muted-foreground">
                Theme confirms an existing IDP goal is correctly prioritized. 
                360 feedback validates the development focus.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <ArrowRight className="h-3 w-3" />
                <span>Theme → Existing IDP (validation)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={linkingSteps} title="Manager Workflow: Linking Themes to IDP" />

      <FieldReferenceTable 
        fields={themeToIdpFields} 
        title="development_themes Integration Fields" 
      />

      <FieldReferenceTable 
        fields={idpItemFields} 
        title="idp_items Source Tracking Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Auto-Generated IDP Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When using the "Derived" link type, the system auto-generates an IDP goal with the following structure:
          </p>

          <div className="p-4 border rounded-lg bg-muted">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Goal Title</p>
                <p className="font-medium">Develop [Theme Focus Area] Skills</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm">Based on 360 feedback from [Cycle Name], focus on improving [Theme Description]. Key development areas include [Theme Details].</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="outline">Development</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Date</p>
                  <p className="text-sm">+90 days</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <Badge variant="outline">360 Feedback</Badge>
                </div>
              </div>
            </div>
          </div>

          <TipCallout>
            Managers can customize the auto-generated content before saving. The template provides 
            a starting point that maintains traceability to the original 360 feedback.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Progress Tracking & Closure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The bidirectional link between themes and IDP goals enables progress tracking:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">IDP Goal Completed</p>
                <p className="text-sm text-muted-foreground">
                  Linked development theme status updates to "Addressed". Theme remains visible 
                  with completion indicator for next 360 cycle reference.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Remeasurement</p>
                <p className="text-sm text-muted-foreground">
                  Next 360 cycle can include questions to measure improvement in 
                  previously identified development areas.
                </p>
              </div>
            </div>
          </div>

          <InfoCallout>
            The remeasurement feature in Section 5.10 allows comparing current cycle 
            scores against baseline themes to quantify development progress.
          </InfoCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />
    </section>
  );
}
