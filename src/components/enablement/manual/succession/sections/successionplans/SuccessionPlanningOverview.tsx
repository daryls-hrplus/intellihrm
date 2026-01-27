import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Target, 
  Settings, 
  ChevronRight, 
  ArrowRight,
  Users,
  TrendingUp,
  GitBranch,
  CheckCircle,
  Info,
  Lightbulb,
  Shield,
  GraduationCap,
  FileText,
  ClipboardCheck,
  Workflow,
  UserCheck
} from 'lucide-react';

export function SuccessionPlanningOverview() {
  const lifecycleStages = [
    { stage: 'Identify', desc: 'Mark key positions', icon: Target },
    { stage: 'Assess Risk', desc: 'Evaluate vacancy risk', icon: Shield },
    { stage: 'Create Plan', desc: 'Define succession plan', icon: FileText },
    { stage: 'Nominate', desc: 'Add candidates', icon: Users },
    { stage: 'Assess', desc: 'Evaluate readiness', icon: ClipboardCheck },
    { stage: 'Develop', desc: 'Close gaps', icon: GraduationCap },
    { stage: 'Evidence', desc: 'Document progress', icon: CheckCircle },
    { stage: 'Promote', desc: 'Execute succession', icon: UserCheck }
  ];

  const personaResponsibilities = [
    {
      persona: 'HR Administrator',
      responsibilities: [
        'Configure succession planning settings and workflows',
        'Mark positions as key/critical in the system',
        'Create and maintain succession plans',
        'Generate bench strength and risk reports'
      ],
      icon: Settings
    },
    {
      persona: 'HR Partner',
      responsibilities: [
        'Facilitate succession planning discussions',
        'Review and validate candidate nominations',
        'Coordinate readiness assessments',
        'Monitor development plan progress'
      ],
      icon: Users
    },
    {
      persona: 'Manager',
      responsibilities: [
        'Nominate successors for key positions',
        'Conduct readiness assessments',
        'Create development plans for candidates',
        'Provide ongoing coaching and feedback'
      ],
      icon: UserCheck
    },
    {
      persona: 'Executive',
      responsibilities: [
        'Review organizational bench strength',
        'Approve high-level succession decisions',
        'Participate in calibration sessions',
        'Champion succession planning culture'
      ],
      icon: TrendingUp
    }
  ];

  const crossModuleIntegrations = [
    { module: 'Talent Pools (Ch 5)', direction: 'Input', description: 'Graduated pool members become succession candidates' },
    { module: 'Readiness Assessment (Ch 4)', direction: 'Input', description: 'Readiness scores and bands feed candidate profiles' },
    { module: 'Nine-Box (Ch 3)', direction: 'Input', description: 'Performance and potential ratings inform readiness' },
    { module: 'Learning & Development', direction: 'Output', description: 'Development gaps drive learning assignments' },
    { module: 'Individual Development Plans', direction: 'Output', description: 'Succession gaps link to IDP goals' },
    { module: 'HR Hub Workflows', direction: 'Both', description: 'Approval workflows for plan changes and assessments' }
  ];

  return (
    <section id="sec-6-1" data-manual-anchor="sec-6-1" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.1 Succession Planning Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Lifecycle, strategic value, persona responsibilities, and cross-module integration
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Understand the 8-stage succession planning lifecycle',
          'Identify persona responsibilities across the succession process',
          'Map cross-module data flows and integration points',
          'Explain the strategic value of proactive succession planning'
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
            <Badge variant="secondary">Succession Plans</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Strategic Value of Succession Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Succession planning ensures business continuity by proactively identifying, developing, 
            and preparing successors for key positions before vacancies occur. This shifts organizations 
            from reactive hiring to strategic talent development.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Business Continuity</h4>
              <p className="text-xs text-muted-foreground">
                Minimize disruption when key leaders depart by having ready successors 
                who can step into critical roles immediately.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Talent Retention</h4>
              <p className="text-xs text-muted-foreground">
                Engage high-potential employees through visible career paths and 
                development investment, reducing attrition risk.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Cost Reduction</h4>
              <p className="text-xs text-muted-foreground">
                Reduce external hiring costs and time-to-productivity by promoting 
                internal candidates who already understand the organization.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Strategic Alignment</h4>
              <p className="text-xs text-muted-foreground">
                Ensure future leaders are developed with skills and competencies 
                aligned to strategic objectives and organizational values.
              </p>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Industry Benchmark:</strong> Organizations with formal succession programs 
                report 40% faster time-to-productivity for promoted leaders and 25% reduction in 
                external executive hiring costs (SHRM Talent Management Report 2024).
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5 text-primary" />
            8-Stage Succession Planning Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The succession planning process follows a structured lifecycle from position 
            identification through successor promotion.
          </p>
          
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {lifecycleStages.map((item, index) => (
              <div key={index} className="flex flex-col items-center p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-center">{item.stage}</span>
                <span className="text-[10px] text-muted-foreground text-center mt-1">
                  {item.desc}
                </span>
                <Badge variant="outline" className="mt-2 text-[10px]">Step {index + 1}</Badge>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h5 className="text-sm font-medium mb-2">Lifecycle Flow</h5>
            <p className="text-xs text-muted-foreground">
              The lifecycle is iterative. Candidates cycle through Assess → Develop → Evidence 
              stages multiple times as they progress toward readiness. The Promote stage occurs 
              when a vacancy arises and a ready successor is available.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Persona Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Persona Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Succession planning requires collaboration across multiple roles. Each persona has 
            distinct responsibilities throughout the lifecycle.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {personaResponsibilities.map((persona) => (
              <div key={persona.persona} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <persona.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h5 className="font-medium text-sm">{persona.persona}</h5>
                </div>
                <ul className="space-y-1">
                  {persona.responsibilities.map((resp, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary/70">•</span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Module Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            Cross-Module Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Succession planning integrates with multiple Intelli HRM modules to leverage existing 
            talent data and drive development actions.
          </p>

          <div className="space-y-3">
            {crossModuleIntegrations.map((integration) => (
              <div key={integration.module} className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge 
                  variant={integration.direction === 'Input' ? 'outline' : integration.direction === 'Output' ? 'secondary' : 'default'}
                  className="mt-0.5"
                >
                  {integration.direction}
                </Badge>
                <div>
                  <h5 className="font-medium text-sm">{integration.module}</h5>
                  <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chapter Overview */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <Lightbulb className="h-5 w-5" />
            Chapter 6 Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This chapter covers the complete succession planning workflow:
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { section: '6.2', title: 'Key Position Identification', desc: 'Mark positions as key/critical' },
              { section: '6.3', title: 'Position Risk Assessment', desc: 'Evaluate vacancy and criticality risk' },
              { section: '6.4', title: 'Succession Plan Creation', desc: 'Create plans with targets and timelines' },
              { section: '6.5', title: 'Candidate Nomination & Ranking', desc: 'Add and prioritize successors' },
              { section: '6.6', title: 'Readiness Assessment Integration', desc: 'Link to Chapter 4 assessments' },
              { section: '6.7', title: 'Development Plan Management', desc: 'Create and track development' },
              { section: '6.8', title: 'Gap-to-Development Linking', desc: 'Connect gaps to IDP/Learning' },
              { section: '6.9', title: 'Candidate Evidence Collection', desc: 'Document accomplishments' },
              { section: '6.10', title: 'Workflow & Approval Configuration', desc: 'HR Hub workflow setup' }
            ].map((item) => (
              <div key={item.section} className="flex items-start gap-2 p-2 bg-white dark:bg-background rounded border">
                <Badge variant="outline" className="text-xs">{item.section}</Badge>
                <div>
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
