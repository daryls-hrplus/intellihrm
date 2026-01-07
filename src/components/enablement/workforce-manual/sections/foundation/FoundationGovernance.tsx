import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Gavel, Building, CheckCircle2 } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  FieldReferenceTable,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type Step,
  type FieldDefinition,
  type ExampleConfig,
  type BusinessRule
} from '../../../manual/components';

const governanceBodyFields: FieldDefinition[] = [
  {
    name: "Body Name",
    type: "Text",
    required: true,
    description: "Name of the governance body (e.g., 'Executive Committee')",
    validation: "2-150 characters"
  },
  {
    name: "Body Type",
    type: "Select",
    required: true,
    description: "Classification: Management Team or Committee"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Purpose and mandate of the governance body"
  },
  {
    name: "Can Approve Headcount",
    type: "Toggle",
    required: true,
    description: "Whether this body can approve position requests",
    defaultValue: "False"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Active bodies appear in approval workflows",
    defaultValue: "True"
  }
];

const memberFields: FieldDefinition[] = [
  {
    name: "Employee",
    type: "Employee Lookup",
    required: true,
    description: "Employee serving on the governance body"
  },
  {
    name: "Role in Body",
    type: "Select",
    required: true,
    description: "Position: Chair, Vice Chair, Secretary, or Member"
  },
  {
    name: "Start Date",
    type: "Date",
    required: true,
    description: "When membership begins"
  },
  {
    name: "End Date",
    type: "Date",
    required: false,
    description: "Term expiration (leave blank for indefinite)"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Active members receive governance notifications",
    defaultValue: "True"
  }
];

const bodyCreationSteps: Step[] = [
  {
    title: "Navigate to Company",
    description: "Go to Admin & Security → Companies and select a company",
    expectedResult: "Company detail page displays"
  },
  {
    title: "Access Governance Tab",
    description: "Click on the 'Governance' tab or section",
    expectedResult: "Governance bodies for this company display"
  },
  {
    title: "Click Add Body",
    description: "Click 'Add Body' button",
    expectedResult: "Governance body creation form opens"
  },
  {
    title: "Enter Body Details",
    description: "Fill in governance body information",
    substeps: [
      "Enter body name (e.g., 'Board of Directors')",
      "Select body type (Management Team or Committee)",
      "Add description of mandate and purpose",
      "Set approval permissions if applicable"
    ]
  },
  {
    title: "Save Governance Body",
    description: "Click 'Create' to save",
    expectedResult: "Body appears in list; ready for member assignment"
  }
];

const memberAssignmentSteps: Step[] = [
  {
    title: "Select Governance Body",
    description: "Click on the governance body card to expand",
    expectedResult: "Member list and Add button visible"
  },
  {
    title: "Click Add Member",
    description: "Click 'Add' button in the members section",
    expectedResult: "Member assignment form opens"
  },
  {
    title: "Select Employee",
    description: "Search and select employee from lookup",
    expectedResult: "Employee selected; role options enabled"
  },
  {
    title: "Assign Role",
    description: "Select role: Chair, Vice Chair, Secretary, or Member",
    expectedResult: "Role assigned to member"
  },
  {
    title: "Set Term Dates",
    description: "Enter start date; optionally set term end date",
    expectedResult: "Member term established"
  },
  {
    title: "Save Member",
    description: "Click 'Save' to add member",
    expectedResult: "Member appears in body with role badge"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Executive Management Team",
    context: "C-suite leadership team with approval authority",
    values: [
      { field: "Body Name", value: "Executive Management Team" },
      { field: "Body Type", value: "Management Team" },
      { field: "Can Approve Headcount", value: "Yes" },
      { field: "Members", value: "CEO (Chair), CFO, COO, CHRO, CTO" }
    ],
    outcome: "Position control requests route to this team for approval"
  },
  {
    title: "HR Committee",
    context: "Cross-functional committee for HR policy oversight",
    values: [
      { field: "Body Name", value: "Human Resources Committee" },
      { field: "Body Type", value: "Committee" },
      { field: "Can Approve Headcount", value: "No" },
      { field: "Members", value: "CHRO (Chair), Legal Director, Employee Rep" }
    ],
    outcome: "Advisory body without direct approval authority"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Only one Chair per governance body",
    enforcement: "System",
    description: "Assigning new Chair removes previous Chair designation"
  },
  {
    rule: "Members must be active employees",
    enforcement: "System",
    description: "Only active employees appear in member lookup"
  },
  {
    rule: "Headcount approval requires at least one approving body",
    enforcement: "Advisory",
    description: "Position control workflows need Can Approve Headcount = Yes"
  },
  {
    rule: "Term-expired members become inactive",
    enforcement: "System",
    description: "Members with past end dates auto-deactivate"
  }
];

const bodyTypes = [
  { 
    type: "Management Team", 
    icon: Building,
    description: "Executive leadership groups (e.g., Executive Committee, Leadership Team)",
    useCases: ["C-suite coordination", "Strategic decisions", "Headcount approval"]
  },
  { 
    type: "Committee", 
    icon: Gavel,
    description: "Cross-functional advisory or decision-making bodies",
    useCases: ["HR Committee", "Safety Committee", "Ethics Committee"]
  }
];

export function FoundationGovernance() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand governance bodies and their role in position control",
          "Create management teams and committees for your company",
          "Assign members with roles and term dates",
          "Configure headcount approval authority"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Understanding Governance Bodies
            <Badge variant="secondary">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Governance bodies represent formal leadership and advisory groups within 
            your organization. They support corporate governance compliance and 
            enable position control through headcount approval workflows.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {bodyTypes.map((bt) => (
              <div key={bt.type} className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <bt.icon className="h-4 w-4 text-primary" />
                  {bt.type}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">{bt.description}</p>
                <div className="flex flex-wrap gap-2">
                  {bt.useCases.map((uc) => (
                    <Badge key={uc} variant="outline" className="text-xs">{uc}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.10.1: Governance Bodies management showing Executive Team and Committees"
        alt="Governance bodies cards with member lists and approval authority badges"
        aspectRatio="wide"
      />

      <FieldReferenceTable
        title="Governance Body Field Reference"
        fields={governanceBodyFields}
      />

      <FieldReferenceTable
        title="Member Assignment Field Reference"
        fields={memberFields}
      />

      <StepByStep
        title="Creating a Governance Body"
        steps={bodyCreationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.10.2: Governance Body creation form with approval settings"
        alt="Governance body form showing name, type, description, and Can Approve Headcount toggle"
        aspectRatio="wide"
      />

      <StepByStep
        title="Assigning Members"
        steps={memberAssignmentSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.10.3: Member assignment dialog with role selection"
        alt="Member assignment form showing employee lookup, role dropdown, and term dates"
        aspectRatio="wide"
      />

      <ConfigurationExample
        title="Governance Body Configuration Examples"
        examples={configExamples}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Member Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="default">Chair</Badge>
              <div>
                <p className="text-sm">Leads the body; primary decision maker</p>
                <p className="text-xs text-muted-foreground">Only one per body</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="secondary">Vice Chair</Badge>
              <div>
                <p className="text-sm">Acts in Chair's absence</p>
                <p className="text-xs text-muted-foreground">Usually one per body</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="outline">Secretary</Badge>
              <div>
                <p className="text-sm">Records minutes; manages documentation</p>
                <p className="text-xs text-muted-foreground">Administrative role</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="outline">Member</Badge>
              <div>
                <p className="text-sm">Voting or advisory participant</p>
                <p className="text-xs text-muted-foreground">Most common role</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BusinessRules
        title="Governance Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="Position Control Integration">
        When 'Can Approve Headcount' is enabled, the governance body becomes part 
        of position control workflows. Headcount requests requiring approval will 
        route to members of this body based on workflow configuration.
      </InfoCallout>

      <TipCallout title="Term Management">
        Set end dates for members with fixed terms (e.g., elected positions). 
        The system will auto-deactivate members when their term expires, removing 
        them from approval workflows while preserving historical records.
      </TipCallout>
    </div>
  );
}
