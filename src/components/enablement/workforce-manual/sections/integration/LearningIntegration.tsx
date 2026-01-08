import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, BookOpen, Target, Users, ArrowRight,
  CheckCircle, AlertCircle, Lightbulb
} from 'lucide-react';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, FutureCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const learningFlowDiagram = `
graph LR
    subgraph WORKFORCE["Workforce Data"]
        JOB[Job Profile]
        POS[Position]
        COMP[Required Competencies]
        CERT[Required Certifications]
    end
    
    subgraph GAPS["Gap Analysis"]
        SKILL[Skill Assessment]
        GAP[Identified Gaps]
        REC[Recommendations]
    end
    
    subgraph LEARNING["Learning Module"]
        ASSIGN[Course Assignments]
        PATH[Learning Paths]
        TRACK[Completion Tracking]
        CRED[Credentials Earned]
    end
    
    JOB --> COMP
    JOB --> CERT
    COMP --> SKILL
    SKILL --> GAP
    GAP --> REC
    
    REC --> ASSIGN
    CERT --> ASSIGN
    ASSIGN --> PATH
    PATH --> TRACK
    TRACK --> CRED
    
    CRED -.-> COMP
    
    style WORKFORCE fill:#e0f2fe,stroke:#0284c7
    style GAPS fill:#fef3c7,stroke:#d97706
    style LEARNING fill:#f0fdf4,stroke:#16a34a
`;

const learningTriggers = [
  {
    trigger: 'New Hire',
    source: 'Job Profile',
    action: 'Assign onboarding curriculum and mandatory training',
    timing: 'On hire date'
  },
  {
    trigger: 'Promotion',
    source: 'New Job Profile',
    action: 'Assign role-transition courses and new competency training',
    timing: 'On promotion effective date'
  },
  {
    trigger: 'Skill Gap Identified',
    source: 'Skill Assessment',
    action: 'Recommend courses to close competency gaps',
    timing: 'After assessment completion'
  },
  {
    trigger: 'Certification Expiring',
    source: 'Credential Tracking',
    action: 'Assign renewal courses before expiration',
    timing: '90 days before expiry'
  },
  {
    trigger: 'Compliance Due',
    source: 'Position Requirements',
    action: 'Assign mandatory compliance training',
    timing: 'Per compliance calendar'
  }
];

const competencyMapping = [
  { category: 'Core Competencies', example: 'Communication, Teamwork', learning: 'Soft skills curriculum' },
  { category: 'Functional Competencies', example: 'Financial Analysis, Project Management', learning: 'Role-specific courses' },
  { category: 'Technical Competencies', example: 'Python, AWS, Salesforce', learning: 'Technical certification paths' },
  { category: 'Leadership Competencies', example: 'Strategic Thinking, Change Management', learning: 'Leadership development program' }
];

export function LearningIntegration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-7">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.7 Learning & Development Integration</h2>
            <p className="text-muted-foreground">
              Job-role training requirements and competency gap-driven learning assignments
            </p>
          </div>
        </div>
      </div>

      {/* Future Enhancement Notice */}
      <FutureCallout title="Learning Module Integration">
        Full LMS integration is on the roadmap. Current functionality focuses on job-based 
        training requirements, competency gap analysis, and certification tracking within 
        Workforce. Deep LMS course assignment and completion tracking is planned.
      </FutureCallout>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Competency-Driven Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Workforce module defines what employees need to know (through job competencies and 
            certification requirements). The Learning module delivers how they acquire that knowledge 
            (through courses, learning paths, and assessments).
          </p>
          <p className="text-muted-foreground">
            This integration ensures that learning investments are targeted—employees receive training 
            aligned with their job requirements and identified skill gaps, not generic content.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          variant="primary"
          icon={Target}
          title="Job-Based Training"
          description="Job profiles define mandatory training that auto-assigns on hire or promotion"
        />
        <FeatureCard
          variant="info"
          icon={Lightbulb}
          title="Gap-Driven Recommendations"
          description="Skill gap analysis recommends courses to close competency deficiencies"
        />
        <FeatureCard
          variant="success"
          icon={CheckCircle}
          title="Credential Tracking"
          description="Professional certifications tracked with renewal alerts"
        />
      </div>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Learning Integration Flow"
        description="How workforce data drives learning assignments and completion updates credentials"
        diagram={learningFlowDiagram}
      />

      {/* Learning Triggers */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Learning Assignment Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Trigger Event</th>
                  <th className="text-left py-3 px-4 font-medium">Data Source</th>
                  <th className="text-left py-3 px-4 font-medium">Learning Action</th>
                  <th className="text-left py-3 px-4 font-medium">Timing</th>
                </tr>
              </thead>
              <tbody>
                {learningTriggers.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.trigger}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{item.source}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.action}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Competency to Learning Mapping */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Competency Category → Learning Curriculum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Competency Category</th>
                  <th className="text-left py-3 px-4 font-medium">Examples</th>
                  <th className="text-left py-3 px-4 font-medium">Learning Curriculum</th>
                </tr>
              </thead>
              <tbody>
                {competencyMapping.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.category}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.example}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{item.learning}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        caption="ESS Learning Dashboard - Employee view showing assigned courses, completion status, and skill gap recommendations"
      />

      {/* Current Capabilities */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Current Integration Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Implemented
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Job competency definitions</li>
                <li>• Required certifications tracking</li>
                <li>• Skill gap analysis</li>
                <li>• Credential expiration alerts</li>
                <li>• Learning objectives in lifecycle workflows</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Planned Enhancements
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full LMS course catalog integration</li>
                <li>• Automated course enrollment</li>
                <li>• Completion → competency updates</li>
                <li>• AI-powered learning recommendations</li>
                <li>• Learning path progression tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <TipCallout title="Compliance Training">
        Use job profiles to define mandatory compliance training (e.g., safety, ethics, data protection). 
        These auto-assign to all employees in that job and can track completion for audit purposes.
      </TipCallout>

      <InfoCallout title="Skill Gap → Development Plan">
        Skill gaps identified in Workforce can be incorporated into Individual Development Plans (IDPs), 
        linking learning activities to career development goals.
      </InfoCallout>
    </div>
  );
}
