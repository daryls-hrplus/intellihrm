import { LearningObjectives } from '../../../components/LearningObjectives';
import { CheckCircle, Clock, Shield, TrendingUp, Lightbulb, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const learningObjectives = [
  'Apply pre-cycle preparation best practices',
  'Implement during-cycle monitoring strategies',
  'Execute post-cycle analysis and improvement',
  'Align with SHRM and industry benchmarks'
];

const preCyclePractices = [
  {
    title: 'Stakeholder Communication',
    description: 'Send advance notice 2-4 weeks before cycle launch',
    details: [
      'Communicate purpose and benefits to all participants',
      'Explain timeline and expected time commitment',
      'Address confidentiality and anonymity questions proactively',
      'Provide manager briefing on their role and responsibilities'
    ]
  },
  {
    title: 'Configuration Validation',
    description: 'Complete thorough testing before activation',
    details: [
      'Test questionnaire with sample users for clarity',
      'Verify rater category configurations and thresholds',
      'Confirm notification templates and timing',
      'Validate report templates with sample data'
    ]
  },
  {
    title: 'Data Quality Check',
    description: 'Ensure participant data is accurate and complete',
    details: [
      'Verify all participants have valid email addresses',
      'Confirm reporting relationships are up-to-date',
      'Check department/team assignments for accurate benchmarking',
      'Validate external rater contacts if applicable'
    ]
  },
  {
    title: 'Timeline Planning',
    description: 'Set realistic deadlines accounting for organizational factors',
    details: [
      'Avoid launching during peak business periods',
      'Account for holidays and regional calendars',
      'Allow 2-4 weeks for feedback collection',
      'Schedule manager debrief sessions in advance'
    ]
  }
];

const duringCyclePractices = [
  {
    title: 'Response Rate Monitoring',
    description: 'Track completion daily and intervene early',
    details: [
      'Set up daily response rate alerts (target: 70%+)',
      'Identify low-responding groups by day 3',
      'Escalate to managers for team-level issues',
      'Use targeted reminders rather than broadcast'
    ]
  },
  {
    title: 'Issue Triage',
    description: 'Address problems quickly to maintain momentum',
    details: [
      'Monitor support tickets for common issues',
      'Provide real-time help via chat or email',
      'Document issues for post-cycle improvement',
      'Escalate technical issues immediately'
    ]
  },
  {
    title: 'Deadline Management',
    description: 'Balance flexibility with accountability',
    details: [
      'Send reminder sequence: Day 1, midpoint, 3 days before, final day',
      'Consider selective extensions for valid reasons',
      'Communicate any changes broadly',
      'Track extension impact on cycle quality'
    ]
  }
];

const postCyclePractices = [
  {
    title: 'Results Analysis',
    description: 'Review aggregate trends before individual release',
    details: [
      'Analyze overall response rates by category',
      'Identify systematic issues in feedback quality',
      'Review AI-generated themes for accuracy',
      'Check for concerning patterns requiring intervention'
    ]
  },
  {
    title: 'Staged Release',
    description: 'Control report distribution for maximum impact',
    details: [
      'Brief managers 24-48 hours before employee release',
      'Provide interpretation guidance with reports',
      'Offer optional group interpretation sessions',
      'Schedule 1:1 debrief conversations'
    ]
  },
  {
    title: 'Development Action',
    description: 'Connect feedback to tangible improvement',
    details: [
      'Ensure themes link to IDP goals',
      'Track development activity post-cycle',
      'Measure improvement in subsequent cycles',
      'Celebrate progress and success stories'
    ]
  },
  {
    title: 'Cycle Retrospective',
    description: 'Capture learnings for continuous improvement',
    details: [
      'Survey participants on cycle experience',
      'Analyze support ticket patterns',
      'Document configuration improvements',
      'Update playbook for next cycle'
    ]
  }
];

const industryBenchmarks = [
  { metric: 'Response Rate', target: '≥70%', source: 'SHRM' },
  { metric: 'Raters per Subject', target: '8-12', source: 'CCL' },
  { metric: 'Anonymous Raters per Category', target: '≥3', source: 'SHRM' },
  { metric: 'Cycle Frequency', target: 'Annual or Bi-annual', source: 'Workday' },
  { metric: 'Self-Assessment Alignment', target: '±0.5 vs raters', source: 'CCL' },
  { metric: 'Development Plan Creation', target: '≥80% within 30 days', source: 'SAP' },
  { metric: 'Manager Debrief Completion', target: '≥90%', source: 'SHRM' },
  { metric: 'Improvement Trend (Repeat)', target: '+5-10%', source: 'CCL' }
];

const successFactors = [
  {
    factor: 'Executive Sponsorship',
    description: 'Visible leadership support drives participation and follow-through',
    icon: Users
  },
  {
    factor: 'Clear Purpose',
    description: 'Participants understand why feedback matters and how it will be used',
    icon: Lightbulb
  },
  {
    factor: 'Trust in Confidentiality',
    description: 'Raters believe their responses are protected and anonymous',
    icon: Shield
  },
  {
    factor: 'Action Orientation',
    description: 'Feedback leads to visible development actions and support',
    icon: TrendingUp
  }
];

export function F360BestPracticesSection() {
  return (
    <section id="sec-8-10" data-manual-anchor="sec-8-10" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          8.10 Best Practices & Success Factors
        </h3>
        <p className="text-muted-foreground mt-2">
          Proven practices for successful 360 feedback cycles based on SHRM, CCL, and industry benchmarks.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Industry Alignment</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          These best practices are aligned with guidelines from SHRM (Society for Human Resource Management),
          CCL (Center for Creative Leadership), and enterprise HRMS platforms (Workday, SAP SuccessFactors).
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {successFactors.map((sf, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <sf.icon className="h-4 w-4 text-primary" />
                {sf.factor}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{sf.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="pre-cycle">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Pre-Cycle Preparation
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2 pt-4">
              {preCyclePractices.map((practice, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{practice.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{practice.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {practice.details.map((detail, dIndex) => (
                        <li key={dIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="during-cycle">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              During-Cycle Monitoring
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-3 pt-4">
              {duringCyclePractices.map((practice, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{practice.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{practice.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {practice.details.map((detail, dIndex) => (
                        <li key={dIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="post-cycle">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Post-Cycle Analysis & Action
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2 pt-4">
              {postCyclePractices.map((practice, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{practice.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{practice.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {practice.details.map((detail, dIndex) => (
                        <li key={dIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          Industry Benchmarks
        </h4>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {industryBenchmarks.map((benchmark, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{benchmark.metric}</p>
                  <p className="text-lg font-bold text-primary mt-1">{benchmark.target}</p>
                  <Badge variant="outline" className="text-xs mt-2">{benchmark.source}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
