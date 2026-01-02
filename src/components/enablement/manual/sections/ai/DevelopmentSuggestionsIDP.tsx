import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Clock, Users, CheckCircle, Target, BookOpen, Link, ArrowRight, Lightbulb, AlertCircle, Code } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { StepByStep, Step } from '../../components/StepByStep';
import { BusinessRules } from '../../components/BusinessRules';

const FIELD_REFERENCES = [
  { fieldName: 'Development Areas Button', location: 'AI Feedback Assistant Panel → Quick Actions', required: false, description: 'Generates improvement suggestions based on lower-rated competencies and gaps' },
  { fieldName: 'Link to IDP', location: 'Strength/Gap Card', required: false, description: 'Creates a development goal in the Individual Development Plan from an identified gap' },
  { fieldName: 'Learning Path Suggestion', location: 'Development Suggestion', required: false, description: 'AI-recommended courses or resources to address the development area' },
  { fieldName: 'Priority Level', location: 'Gap Analysis', required: false, description: 'AI-assigned importance (High/Medium/Low) based on role requirements' }
];

const BUSINESS_RULES = [
  { rule: 'Development areas require constructive framing', enforcement: 'System' as const, description: 'AI generates growth-oriented language, never punitive statements.' },
  { rule: 'IDP links preserve audit trail', enforcement: 'System' as const, description: 'When a gap is linked to an IDP goal, the connection is logged for compliance.' },
  { rule: 'Learning recommendations are optional', enforcement: 'Policy' as const, description: 'Managers may choose different development approaches than AI suggests.' }
];

const PROCEDURE_STEPS: Step[] = [
  {
    title: 'Complete Ratings Including Lower Scores',
    description: 'AI needs to see the full picture including areas needing improvement.',
    substeps: [
      'Enter all goal and competency ratings honestly',
      'Include ratings below "Meets Expectations" where applicable',
      'Add context comments about specific gaps observed'
    ]
  },
  {
    title: 'Generate Development Suggestions',
    description: 'Click the Development Areas button to analyze improvement opportunities.',
    substeps: [
      'Locate the AI Feedback Assistant panel',
      'Click "Development Areas" in Quick Actions',
      'Wait for analysis to complete (3-8 seconds)'
    ]
  },
  {
    title: 'Review AI-Identified Gaps',
    description: 'Examine each development area suggestion carefully.',
    substeps: [
      'Read the development statement',
      'Check the priority level assigned',
      'Review suggested learning resources',
      'Verify alignment with your observations'
    ]
  },
  {
    title: 'Link to Individual Development Plan',
    description: 'Convert gaps into actionable IDP goals.',
    substeps: [
      'Click "Link to IDP" on relevant suggestions',
      'Confirm the goal title and description',
      'Set timeline and success criteria',
      'Assign to appropriate learning resources'
    ]
  },
  {
    title: 'Integrate into Evaluation Narrative',
    description: 'Incorporate development feedback into the overall evaluation.',
    substeps: [
      'Accept or edit the suggestion text',
      'Balance development areas with strengths',
      'Ensure constructive, growth-oriented tone'
    ]
  }
];

const DEVELOPMENT_EXAMPLES = `// Example AI-Generated Development Suggestions

// Based on Competency Rating: 2 (Below Expectations)
// Competency: "Strategic Thinking"
Development Area: "Opportunity to strengthen strategic planning skills, 
particularly in connecting daily tasks to broader organizational goals. 
Consider participating in the Strategic Leadership workshop series."

Priority: High
Learning Path: "Strategic Thinking Fundamentals" (4-week course)
Skill Gap: Long-term planning, stakeholder analysis

// Based on Goal Rating: 3 (Partially Met)
// Goal: "Implement new CRM system"
Development Area: "Project management skills show promise but would 
benefit from structured methodology training. The CRM implementation 
faced timeline challenges that better planning techniques could address."

Priority: Medium
Learning Path: "PMP Certification Prep" or "Agile Fundamentals"
Skill Gap: Timeline estimation, risk management

// Based on Pattern Analysis
Development Area: "Communication with senior stakeholders is an area 
for growth. Consider executive communication coaching to enhance 
ability to present complex information concisely."

Priority: Medium
Learning Path: "Executive Presence Workshop"
Skill Gap: Executive communication, presentation skills`;

export function DevelopmentSuggestionsIDP() {
  return (
    <Card id="sec-5-3">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.3</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~12 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />Manager / HR Partner</Badge>
        </div>
        <CardTitle className="text-2xl">Development Suggestions & IDP Linking</CardTitle>
        <CardDescription>AI-powered gap analysis with seamless Individual Development Plan integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-3']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Generate constructive development suggestions from gap analysis</li>
            <li>Link identified gaps to Individual Development Plans</li>
            <li>Leverage AI-recommended learning paths</li>
            <li>Frame development feedback positively and actionably</li>
          </ul>
        </div>

        {/* The Development Feedback Challenge */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">The Development Feedback Challenge</h3>
          <p className="text-muted-foreground">
            Many managers struggle to communicate development needs constructively. AI assistance 
            helps by framing gaps as growth opportunities rather than criticisms, while connecting 
            feedback directly to actionable development resources.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">✗ Poor Approach</h4>
              <p className="text-sm text-red-700 dark:text-red-300 italic">
                "John lacks strategic thinking skills and needs to improve immediately."
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✓ AI-Assisted Approach</h4>
              <p className="text-sm text-green-700 dark:text-green-300 italic">
                "John shows potential for strategic thinking and would benefit from the Strategic 
                Leadership workshop to enhance his ability to connect tactical work to organizational goals."
              </p>
            </div>
          </div>
        </div>

        {/* IDP Integration Flow */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            IDP Integration Flow
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              { step: 'Gap Identified', color: 'bg-amber-100 text-amber-800' },
              { step: 'AI Suggests Development', color: 'bg-blue-100 text-blue-800' },
              { step: 'Link to IDP', color: 'bg-purple-100 text-purple-800' },
              { step: 'Learning Assigned', color: 'bg-green-100 text-green-800' },
              { step: 'Progress Tracked', color: 'bg-teal-100 text-teal-800' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center gap-2">
                <Badge className={item.color}>{item.step}</Badge>
                {index < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            This seamless flow ensures that performance gaps don't just get documented—they become 
            tracked development initiatives with measurable outcomes.
          </p>
        </div>

        {/* Field References */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Key Interface Elements</h3>
          <div className="space-y-2">
            {FIELD_REFERENCES.map((field, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{field.fieldName}</span>
                  <Badge variant="outline" className="text-xs">{field.location}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
              </div>
            ))}
          </div>
        </div>

        <StepByStep title="Generating Development Suggestions & IDP Links" steps={PROCEDURE_STEPS} />

        {/* Priority Levels Explained */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Understanding Priority Levels</h3>
          <div className="space-y-3">
            {[
              { level: 'High', color: 'bg-red-100 text-red-800', criteria: 'Critical for current role success; blocking career progression; significant performance impact', action: 'Address within 30-60 days with structured plan' },
              { level: 'Medium', color: 'bg-amber-100 text-amber-800', criteria: 'Important for role optimization; affects team or stakeholders; limits advancement potential', action: 'Include in quarterly development plan' },
              { level: 'Low', color: 'bg-green-100 text-green-800', criteria: 'Nice-to-have improvements; long-term career enhancement; minor efficiency gains', action: 'Consider for annual development goals' }
            ].map((item) => (
              <div key={item.level} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={item.color}>{item.level} Priority</Badge>
                </div>
                <p className="text-sm text-muted-foreground"><strong>Criteria:</strong> {item.criteria}</p>
                <p className="text-sm text-muted-foreground mt-1"><strong>Recommended Action:</strong> {item.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Example AI Development Suggestions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Example AI Development Suggestions
          </h3>
          <div className="bg-muted/50 p-4 rounded-lg border">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{DEVELOPMENT_EXAMPLES}</pre>
          </div>
        </div>

        {/* Learning Path Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Learning Path Integration
          </h3>
          <p className="text-muted-foreground text-sm">
            When AI identifies a development area, it automatically searches the LMS catalog for 
            relevant learning resources. These suggestions include:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: 'Online Courses', desc: 'Self-paced e-learning modules from the corporate catalog' },
              { type: 'Workshops', desc: 'Instructor-led sessions on specific competencies' },
              { type: 'Certifications', desc: 'Industry-recognized credentials for skill validation' },
              { type: 'Mentorship', desc: 'Suggested mentor matches based on skill expertise' }
            ].map((item) => (
              <div key={item.type} className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm">{item.type}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Framing Development Constructively */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Framing Development Constructively
          </h3>
          <div className="space-y-3">
            {[
              { original: 'Lacks attention to detail', reframe: 'Would benefit from structured quality review processes to enhance accuracy' },
              { original: 'Poor communication skills', reframe: 'Has opportunity to strengthen stakeholder communication through targeted coaching' },
              { original: 'Misses deadlines', reframe: 'Can improve project outcomes with enhanced timeline management techniques' },
              { original: 'Resistant to feedback', reframe: 'Would benefit from coaching on receiving and applying developmental feedback' }
            ].map((item, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm line-through text-red-600">"{item.original}"</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-700 dark:text-green-400">"{item.reframe}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Best Practice">
          When linking gaps to IDP goals, involve the employee in setting the success criteria. 
          This increases ownership and the likelihood of successful development.
        </TipCallout>

        <WarningCallout title="Important">
          Don't use AI-generated development suggestions as the sole basis for performance 
          improvement plans (PIPs). Formal PIPs require HR partnership and documented evidence.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />

        {/* Troubleshooting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Troubleshooting
          </h3>
          <div className="space-y-2">
            {[
              { issue: 'No development suggestions generated', cause: 'All ratings are high or AI cannot identify patterns', solution: 'Manually add development context in comments, then regenerate.' },
              { issue: '"Link to IDP" button disabled', cause: 'Employee does not have an active IDP or you lack permission', solution: 'Create an IDP for the employee first, or contact HR for access.' },
              { issue: 'Learning paths not showing', cause: 'LMS integration not configured or no matching courses', solution: 'Contact L&D to verify course catalog integration.' }
            ].map((item) => (
              <div key={item.issue} className="p-3 border rounded-lg text-sm">
                <div className="font-medium">{item.issue}</div>
                <div className="text-muted-foreground mt-1"><strong>Cause:</strong> {item.cause}</div>
                <div className="text-muted-foreground"><strong>Solution:</strong> {item.solution}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
