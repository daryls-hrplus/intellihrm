import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Users, 
  Settings, 
  ChevronRight, 
  ArrowRight,
  Target,
  TrendingUp,
  GitBranch,
  CheckCircle,
  Info,
  Lightbulb
} from 'lucide-react';

export function TalentPoolOverview() {
  return (
    <section id="sec-5-1" data-manual-anchor="sec-5-1" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.1 Talent Pool Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Strategic value, pool types, lifecycle, and cross-module integration
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Understand the strategic role of talent pools in succession planning',
          'Differentiate between the 5 standard pool types and their purposes',
          'Navigate the talent pools module and understand the user interface',
          'Explain the complete pool lifecycle from creation through graduation'
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
            <Badge variant="secondary">Talent Pools</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Strategic Value of Talent Pools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Talent pools serve as the foundational layer for proactive succession planning, 
            enabling organizations to identify, develop, and track high-potential employees 
            before succession needs arise. This shift from reactive to proactive planning 
            significantly reduces leadership gaps and accelerates readiness timelines.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Pipeline Visibility</h4>
              <p className="text-xs text-muted-foreground">
                Centralized view of future leaders across the organization, segmented by 
                readiness level and development needs.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Development Focus</h4>
              <p className="text-xs text-muted-foreground">
                Target development investments toward employees with the highest 
                potential for advancement and impact.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Risk Mitigation</h4>
              <p className="text-xs text-muted-foreground">
                Reduce key position risk by maintaining a bench of qualified successors 
                ready to step into critical roles.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Retention Strategy</h4>
              <p className="text-xs text-muted-foreground">
                Recognize and engage high-potential employees through visible career 
                development pathways, reducing flight risk.
              </p>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Industry Benchmark:</strong> Organizations with active talent pool management 
                report 2x faster time-to-fill for leadership positions (SHRM 2024 Talent Management Report).
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pool Lifecycle Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5 text-primary" />
            Talent Pool Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Employees progress through a defined lifecycle within talent pools, from initial 
            identification through development to succession readiness.
          </p>
          
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {[
              { stage: 'Create Pool', desc: 'Define criteria & purpose' },
              { stage: 'Populate', desc: 'Nominate & approve members' },
              { stage: 'Develop', desc: 'Track growth & close gaps' },
              { stage: 'Assess', desc: 'Evaluate readiness' },
              { stage: 'Graduate', desc: 'Promote to succession plan' }
            ].map((item, index, arr) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-xs font-medium text-center">{item.stage}</span>
                  <span className="text-[10px] text-muted-foreground text-center mt-1">
                    {item.desc}
                  </span>
                </div>
                {index < arr.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h5 className="text-sm font-medium mb-2">Member Status Transitions</h5>
            <div className="flex flex-wrap gap-2">
              {[
                { status: 'Nominated', color: 'bg-blue-500' },
                { status: 'Active', color: 'bg-green-500' },
                { status: 'Approved', color: 'bg-emerald-500' },
                { status: 'Rejected', color: 'bg-red-500' },
                { status: 'Graduated', color: 'bg-purple-500' },
                { status: 'Removed', color: 'bg-gray-500' }
              ].map((item) => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Module Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Cross-Module Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Talent pools integrate with multiple Intelli HRM modules to provide comprehensive 
            talent intelligence and streamline succession processes.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">Input</Badge>
              <div>
                <h5 className="font-medium text-sm">Nine-Box Assessment</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  High performers and high potentials (boxes 1, 2, 4) are prime candidates 
                  for talent pool nomination. Nine-Box ratings inform pool eligibility criteria.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">Input</Badge>
              <div>
                <h5 className="font-medium text-sm">Performance & Appraisals</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Appraisal scores, goal achievement rates, and competency assessments 
                  contribute to talent signal calculations and pool membership criteria.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="outline" className="mt-0.5">Input</Badge>
              <div>
                <h5 className="font-medium text-sm">360 Feedback</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Multi-rater feedback signals for leadership behaviors, values alignment, 
                  and development potential are aggregated for evidence-based decisions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="secondary" className="mt-0.5">Output</Badge>
              <div>
                <h5 className="font-medium text-sm">Succession Plans</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Graduated pool members become candidates for specific succession plans, 
                  with their talent pool history informing readiness assessment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="secondary" className="mt-0.5">Output</Badge>
              <div>
                <h5 className="font-medium text-sm">Learning & Development</h5>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Development gaps identified during pool membership drive learning 
                  assignments, stretch projects, and mentorship pairings.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Overview */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <Lightbulb className="h-5 w-5" />
            Chapter 5 Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This chapter covers the complete talent pool management lifecycle:
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { section: '5.2', title: 'Pool Types & Classification', desc: 'Five pool types and selection criteria' },
              { section: '5.3', title: 'Pool Creation', desc: 'JSONB criteria configuration' },
              { section: '5.4', title: 'Member Management', desc: 'Add, graduate, remove members' },
              { section: '5.5', title: 'Manager Nomination', desc: 'MSS-driven talent nomination' },
              { section: '5.6', title: 'HR Review & Approval', desc: 'Review packets and confidence indicators' },
              { section: '5.7', title: 'Evidence-Based Decisions', desc: 'Signal summaries and bias detection' },
              { section: '5.8', title: 'Pool Analytics', desc: 'Pipeline metrics and reporting' }
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
