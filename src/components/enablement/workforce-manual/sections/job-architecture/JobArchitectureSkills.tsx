import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Star, BookOpen } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type Step
} from '../../../manual/components';

const createCapabilitySteps: Step[] = [
  {
    title: "Navigate to Skills & Competencies",
    description: "Go to Learning → Skills Library or access via Workforce → Jobs (expanded view)",
    expectedResult: "Skills and Competencies library is displayed"
  },
  {
    title: "Add New Capability",
    description: "Click '+ Add Skill' or '+ Add Competency' button",
    expectedResult: "Capability creation form opens"
  },
  {
    title: "Enter Capability Details",
    description: "Fill in the required information",
    substeps: [
      "Code: Unique identifier (e.g., PYTHON, LEADERSHIP)",
      "Name: Full name of the skill/competency",
      "Type: Skill (technical) or Competency (behavioral)",
      "Category: Grouping for organization",
      "Description: What this capability represents"
    ],
    expectedResult: "Capability is defined with proper classification"
  },
  {
    title: "Define Proficiency Indicators",
    description: "For each proficiency level (1-5), describe observable behaviors",
    substeps: [
      "Level 1 (Foundational): Basic awareness and limited application",
      "Level 2 (Developing): Growing capability with guidance needed",
      "Level 3 (Proficient): Independent and consistent application",
      "Level 4 (Advanced): Expert level, mentors others",
      "Level 5 (Master): Organizational authority, shapes strategy"
    ],
    expectedResult: "Clear indicators enable consistent assessment"
  },
  {
    title: "Save Capability",
    description: "Click Save to add to the library",
    expectedResult: "Capability is available for linking to jobs"
  }
];

const linkToJobSteps: Step[] = [
  {
    title: "Open Job in Expanded View",
    description: "Navigate to Workforce → Jobs and expand the target job",
    expectedResult: "Job details tabs are visible"
  },
  {
    title: "Select Competencies or Skills Tab",
    description: "Click the appropriate tab based on what you're adding",
    expectedResult: "Existing linked capabilities are shown"
  },
  {
    title: "Add Capability Requirement",
    description: "Click '+ Add' to open the capability selector",
    expectedResult: "Searchable list of capabilities appears"
  },
  {
    title: "Select and Configure",
    description: "Choose the capability and set requirements",
    substeps: [
      "Search or browse to find the capability",
      "Set the Required Proficiency Level (1-5)",
      "Mark as Required or Preferred",
      "Set weighting if applicable"
    ],
    expectedResult: "Capability is linked with specific requirements"
  },
  {
    title: "Save Changes",
    description: "Confirm the addition",
    expectedResult: "Capability appears in the job's requirements list"
  }
];

const capabilityTypes = [
  { 
    type: 'Skill', 
    description: 'Technical or hard skills that can be taught and measured', 
    examples: 'Python, Financial Modeling, Project Management, SQL',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30'
  },
  { 
    type: 'Competency', 
    description: 'Behavioral or soft competencies that reflect how work is done', 
    examples: 'Leadership, Communication, Problem Solving, Collaboration',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/30'
  },
];

const proficiencyLevels = [
  { level: 1, name: 'Foundational', description: 'Basic awareness, learning stage' },
  { level: 2, name: 'Developing', description: 'Growing capability, needs guidance' },
  { level: 3, name: 'Proficient', description: 'Independent, consistent performance' },
  { level: 4, name: 'Advanced', description: 'Expert, mentors others' },
  { level: 5, name: 'Master', description: 'Authority, shapes strategy' },
];

export function JobArchitectureSkills() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand the difference between skills and competencies",
          "Build and manage the organizational capability library",
          "Define proficiency levels with observable indicators",
          "Link capabilities to jobs with required proficiency levels"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Skills vs Competencies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Intelli HRM uses a unified capability framework that distinguishes between 
            Skills (what you know) and Competencies (how you work). Both use the 
            same proficiency scale for consistency.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilityTypes.map((item) => (
              <div key={item.type} className={`p-4 rounded-lg border ${item.color}`}>
                <h5 className="font-semibold mb-2">{item.type === 'Competency' ? 'Competencies' : `${item.type}s`}</h5>
                <p className="text-sm mb-2">{item.description}</p>
                <p className="text-xs italic">Examples: {item.examples}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            5-Level Proficiency Scale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {proficiencyLevels.map((item) => (
              <div key={item.level} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i < item.level ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Level {item.level}</Badge>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Skill or Competency"
        steps={createCapabilitySteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.4.1: Skill/Competency creation form with proficiency level indicators"
        alt="Capability form showing code, name, type, category, and proficiency level definitions"
      />

      <StepByStep
        title="Linking Capabilities to Jobs"
        steps={linkToJobSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.4.2: Job Competencies tab showing linked capabilities with proficiency requirements"
        alt="Competencies list with required proficiency levels and Required/Preferred flags"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Proficiency Indicators Best Practice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Well-defined proficiency indicators are essential for consistent assessment:
          </p>
          <div className="p-4 rounded-lg border bg-muted/30">
            <h5 className="font-medium mb-3">Example: Leadership Competency</h5>
            <ul className="text-sm space-y-2">
              <li><Badge variant="outline" className="mr-2">L1</Badge>Understands basic team dynamics</li>
              <li><Badge variant="outline" className="mr-2">L2</Badge>Coordinates small group activities</li>
              <li><Badge variant="outline" className="mr-2">L3</Badge>Leads projects and develops team members</li>
              <li><Badge variant="outline" className="mr-2">L4</Badge>Builds high-performing teams, mentors leaders</li>
              <li><Badge variant="outline" className="mr-2">L5</Badge>Shapes organizational culture and leadership strategy</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="AI Competency Suggestions">
        When adding competencies to a job, use the AI Suggestions feature to get 
        recommendations based on the job profile. The AI analyzes job family, level, 
        and description to suggest relevant competencies.
      </InfoCallout>

      <TipCallout title="Competency-Based Talent Management">
        A well-maintained skills library enables powerful talent analytics: skills gap 
        analysis, succession readiness scoring, learning recommendations, and internal 
        mobility matching.
      </TipCallout>
    </div>
  );
}
