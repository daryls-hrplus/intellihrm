import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Users, Target, BarChart3, MessageSquare, Award, TrendingUp, Calendar, Shield, Lightbulb, AlertTriangle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BestPractice {
  id: string;
  title: string;
  description: string;
  rationale: string;
  benchmark?: string;
  timing?: string;
}

const PRE_CYCLE_PRACTICES: BestPractice[] = [
  {
    id: 'PC-01',
    title: 'Launch cycles 4-6 weeks before evaluation window',
    description: 'Provide adequate preparation time for all stakeholders including HR, managers, and employees',
    rationale: 'Early launch allows time for communication, training, and goal finalization before ratings begin',
    benchmark: 'Industry standard: 30-45 days lead time',
    timing: 'Q4 for annual reviews, Q2 for mid-year'
  },
  {
    id: 'PC-02',
    title: 'Validate org hierarchy and manager relationships',
    description: 'Ensure all manager-employee reporting relationships are current and accurate in the system',
    rationale: 'Incorrect relationships cause visibility issues and routing failures during the cycle',
    benchmark: '100% accuracy target for direct reports',
    timing: '2 weeks before cycle launch'
  },
  {
    id: 'PC-03',
    title: 'Run eligibility preview before participant enrollment',
    description: 'Preview which employees will be included/excluded based on eligibility criteria',
    rationale: 'Catches configuration issues before they affect live cycles and ensures no employees are missed',
    benchmark: '95%+ eligible employee coverage',
    timing: '1 week before cycle launch'
  },
  {
    id: 'PC-04',
    title: 'Complete goal cascade and weight assignment',
    description: 'Ensure all participants have assigned goals with proper weights summing to 100%',
    rationale: 'Missing or improperly weighted goals cause calculation errors and evaluation delays',
    benchmark: '100% goal assignment completion',
    timing: 'Before evaluation window opens'
  },
  {
    id: 'PC-05',
    title: 'Test integration rules with sample data',
    description: 'Verify all downstream integrations (Nine-Box, IDP, Compensation) work correctly',
    rationale: 'Integration failures post-finalization require manual remediation and cause data inconsistencies',
    benchmark: '100% integration test pass rate',
    timing: 'During UAT phase'
  },
  {
    id: 'PC-06',
    title: 'Communicate timeline to all stakeholders in advance',
    description: 'Send detailed schedule including key dates, deadlines, and expectations to all participants',
    rationale: 'Clear communication reduces confusion, improves on-time completion, and sets expectations',
    benchmark: '100% stakeholder notification',
    timing: '2 weeks before cycle launch'
  }
];

const DURING_CYCLE_PRACTICES: BestPractice[] = [
  {
    id: 'DC-01',
    title: 'Monitor completion rates weekly',
    description: 'Track manager and employee completion percentages against targets and intervene early',
    rationale: 'Early identification of lagging areas allows targeted reminders and support',
    benchmark: '50% complete by mid-cycle, 90% by deadline',
    timing: 'Weekly during evaluation window'
  },
  {
    id: 'DC-02',
    title: 'Send targeted reminders based on role and status',
    description: 'Use automated reminders that are specific to what action each person needs to take',
    rationale: 'Generic reminders are ignored; specific action requests drive completion',
    benchmark: '3 reminders maximum per person',
    timing: '1 week before deadline, 3 days, 1 day'
  },
  {
    id: 'DC-03',
    title: 'Provide manager training before each cycle',
    description: 'Offer refresher training on evaluation best practices, rating calibration, and system navigation',
    rationale: 'Trained managers provide higher quality, more consistent evaluations',
    benchmark: '90%+ manager training completion',
    timing: '1 week before evaluation window'
  },
  {
    id: 'DC-04',
    title: 'Enable AI assistance for narrative writing',
    description: 'Encourage managers to use AI-generated suggestions as starting points for comments',
    rationale: 'AI assistance improves comment quality and reduces time spent on narrative sections',
    benchmark: '80%+ comment quality score target',
    timing: 'Throughout evaluation window'
  },
  {
    id: 'DC-05',
    title: 'Review bias detection alerts promptly',
    description: 'HR should review AI-flagged potential bias issues before calibration sessions',
    rationale: 'Early bias detection prevents unfair evaluations and compliance issues',
    benchmark: 'Review all alerts within 48 hours',
    timing: 'Continuous during cycle'
  },
  {
    id: 'DC-06',
    title: 'Maintain calibration session schedule',
    description: 'Keep calibration sessions within 2 weeks of the rating deadline',
    rationale: 'Delayed calibration extends cycle length and delays downstream actions',
    benchmark: 'Complete calibration within 14 days of rating deadline',
    timing: 'Immediately after rating deadline'
  },
  {
    id: 'DC-07',
    title: 'Document all calibration adjustments',
    description: 'Require justification for every score change made during calibration',
    rationale: 'Documented rationale supports legal compliance and employee questions',
    benchmark: '100% justification coverage',
    timing: 'During calibration sessions'
  },
  {
    id: 'DC-08',
    title: 'Process employee responses within SLA',
    description: 'Review and respond to employee acknowledgments and disagreements promptly',
    rationale: 'Delayed response handling extends cycle and impacts employee experience',
    benchmark: 'Process within 5 business days',
    timing: 'During response phase'
  }
];

const POST_CYCLE_PRACTICES: BestPractice[] = [
  {
    id: 'AC-01',
    title: 'Complete downstream actions within 30 days',
    description: 'Execute all triggered actions (IDP creation, compensation flags, succession updates) promptly',
    rationale: 'Delayed follow-through reduces the business value of the appraisal process',
    benchmark: '100% action completion within 30 days',
    timing: 'Immediately after finalization'
  },
  {
    id: 'AC-02',
    title: 'Review integration logs for failures',
    description: 'Check integration dashboard for any failed downstream updates and remediate',
    rationale: 'Unresolved integration failures cause data inconsistencies across modules',
    benchmark: '95%+ integration success rate',
    timing: 'Within 1 week of finalization'
  },
  {
    id: 'AC-03',
    title: 'Archive cycle data per retention policy',
    description: 'Export and archive appraisal data according to company data retention requirements',
    rationale: 'Proper archival ensures compliance and enables historical analysis',
    benchmark: 'Archive within 90 days of cycle close',
    timing: 'After all actions complete'
  },
  {
    id: 'AC-04',
    title: 'Conduct cycle retrospective',
    description: 'Gather feedback from stakeholders on what worked well and areas for improvement',
    rationale: 'Continuous improvement prevents recurring issues and improves future cycles',
    benchmark: 'Complete retrospective within 30 days',
    timing: 'After cycle close'
  },
  {
    id: 'AC-05',
    title: 'Analyze rating distribution trends',
    description: 'Compare current cycle distribution to benchmarks and prior years',
    rationale: 'Trend analysis identifies calibration drift and organizational performance shifts',
    benchmark: 'Variance <10% from target distribution',
    timing: 'Within 2 weeks of finalization'
  },
  {
    id: 'AC-06',
    title: 'Update configuration based on lessons learned',
    description: 'Apply improvements to templates, rules, and processes for the next cycle',
    rationale: 'Iterative improvement reduces issues and improves efficiency over time',
    benchmark: 'Complete updates 4 weeks before next cycle',
    timing: 'Post-retrospective'
  }
];

const MANAGER_PRACTICES: BestPractice[] = [
  {
    id: 'MG-01',
    title: 'Gather evidence throughout the year',
    description: 'Maintain ongoing notes on employee performance, achievements, and development areas',
    rationale: 'Year-round documentation prevents recency bias and supports accurate ratings',
    benchmark: 'Monthly check-in notes minimum',
    timing: 'Continuous'
  },
  {
    id: 'MG-02',
    title: 'Schedule dedicated evaluation time',
    description: 'Block 45-60 minutes per direct report for thoughtful evaluation completion',
    rationale: 'Rushed evaluations result in lower quality ratings and comments',
    benchmark: '45-60 minutes per evaluation',
    timing: 'During evaluation window'
  },
  {
    id: 'MG-03',
    title: 'Review historical performance data',
    description: 'Consider previous cycle ratings, goals achieved, and development progress',
    rationale: 'Historical context ensures fair year-over-year progression assessment',
    benchmark: 'Review last 2-3 cycles',
    timing: 'Before completing evaluation'
  },
  {
    id: 'MG-04',
    title: 'Use behavioral examples in comments',
    description: 'Cite specific situations, behaviors, and outcomes in narrative feedback',
    rationale: 'Specific examples are more actionable and defensible than general statements',
    benchmark: '2+ examples per rating category',
    timing: 'During evaluation'
  },
  {
    id: 'MG-05',
    title: 'Prepare for performance conversations',
    description: 'Plan the delivery discussion including key messages and development focus areas',
    rationale: 'Prepared conversations are more effective and less likely to derail',
    benchmark: 'Complete preparation before scheduling meeting',
    timing: 'Before interview phase'
  }
];

const CONTINUOUS_IMPROVEMENT: BestPractice[] = [
  {
    id: 'CI-01',
    title: 'Benchmark against industry standards',
    description: 'Compare your processes and metrics to industry best practices and peer organizations',
    rationale: 'External benchmarking identifies improvement opportunities and validates practices',
    benchmark: 'Annual benchmarking review',
    timing: 'Annually during planning'
  },
  {
    id: 'CI-02',
    title: 'Collect stakeholder feedback systematically',
    description: 'Survey employees, managers, and HR on their appraisal experience',
    rationale: 'Stakeholder input identifies pain points invisible to administrators',
    benchmark: '30%+ survey response rate',
    timing: 'Post-cycle survey'
  },
  {
    id: 'CI-03',
    title: 'Review and update competency frameworks',
    description: 'Ensure competencies remain relevant to evolving job requirements and company strategy',
    rationale: 'Outdated competencies lead to irrelevant evaluations and development planning',
    benchmark: 'Annual competency review',
    timing: 'Q4 planning cycle'
  },
  {
    id: 'CI-04',
    title: 'Optimize form templates based on usage patterns',
    description: 'Analyze which sections take longest, have lowest completion, or generate most questions',
    rationale: 'Template optimization improves completion rates and data quality',
    benchmark: 'Review templates after each cycle',
    timing: 'Post-cycle analysis'
  }
];

const PracticeCard = ({ practice, icon }: { practice: BestPractice; icon: React.ReactNode }) => (
  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{practice.id}</span>
          <h4 className="font-medium text-sm">{practice.title}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{practice.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          <div className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 p-2 rounded">
            <strong>Why:</strong> {practice.rationale}
          </div>
          {practice.benchmark && (
            <div className="text-xs bg-green-500/10 text-green-700 dark:text-green-300 p-2 rounded">
              <strong>Benchmark:</strong> {practice.benchmark}
            </div>
          )}
        </div>
        
        {practice.timing && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Timing: {practice.timing}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export function BestPracticesSection() {
  return (
    <div className="space-y-8">
      <Card id="sec-8-2">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.2</Badge>
            <Badge variant="secondary">Reference</Badge>
          </div>
          <CardTitle className="text-2xl">Best Practices Guide</CardTitle>
          <CardDescription>
            Industry-validated recommendations for optimal appraisal management organized by cycle phase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-8-2']} />

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">95%+</div>
              <div className="text-xs text-muted-foreground">Target Completion Rate</div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">90%+</div>
              <div className="text-xs text-muted-foreground">On-Time Submission</div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">80%+</div>
              <div className="text-xs text-muted-foreground">Comment Quality Score</div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">30 days</div>
              <div className="text-xs text-muted-foreground">Max Action Completion</div>
            </div>
          </div>

          {/* Critical Success Factors */}
          <div className="p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-primary" />
              Critical Success Factors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Executive sponsorship and visible support</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Clear communication of timelines and expectations</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Manager training and enablement resources</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Technology that simplifies the process</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Meaningful linkage to development and rewards</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Continuous improvement based on feedback</span>
              </div>
            </div>
          </div>

          {/* Tabbed Content by Phase */}
          <Tabs defaultValue="pre-cycle" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pre-cycle" className="text-xs">Pre-Cycle</TabsTrigger>
              <TabsTrigger value="during-cycle" className="text-xs">During Cycle</TabsTrigger>
              <TabsTrigger value="post-cycle" className="text-xs">Post-Cycle</TabsTrigger>
              <TabsTrigger value="managers" className="text-xs">For Managers</TabsTrigger>
              <TabsTrigger value="improvement" className="text-xs">Continuous</TabsTrigger>
            </TabsList>

            <TabsContent value="pre-cycle" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Pre-Cycle Planning</h3>
                <Badge variant="outline">{PRE_CYCLE_PRACTICES.length} practices</Badge>
              </div>
              <div className="space-y-4">
                {PRE_CYCLE_PRACTICES.map((practice) => (
                  <PracticeCard key={practice.id} practice={practice} icon={<Target className="h-4 w-4" />} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="during-cycle" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">During Cycle Execution</h3>
                <Badge variant="outline">{DURING_CYCLE_PRACTICES.length} practices</Badge>
              </div>
              <div className="space-y-4">
                {DURING_CYCLE_PRACTICES.map((practice) => (
                  <PracticeCard key={practice.id} practice={practice} icon={<Clock className="h-4 w-4" />} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="post-cycle" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Post-Cycle Actions</h3>
                <Badge variant="outline">{POST_CYCLE_PRACTICES.length} practices</Badge>
              </div>
              <div className="space-y-4">
                {POST_CYCLE_PRACTICES.map((practice) => (
                  <PracticeCard key={practice.id} practice={practice} icon={<CheckCircle className="h-4 w-4" />} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="managers" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Manager Enablement</h3>
                <Badge variant="outline">{MANAGER_PRACTICES.length} practices</Badge>
              </div>
              <div className="space-y-4">
                {MANAGER_PRACTICES.map((practice) => (
                  <PracticeCard key={practice.id} practice={practice} icon={<MessageSquare className="h-4 w-4" />} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="improvement" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Continuous Improvement</h3>
                <Badge variant="outline">{CONTINUOUS_IMPROVEMENT.length} practices</Badge>
              </div>
              <div className="space-y-4">
                {CONTINUOUS_IMPROVEMENT.map((practice) => (
                  <PracticeCard key={practice.id} practice={practice} icon={<Lightbulb className="h-4 w-4" />} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Common Pitfalls Warning */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Common Pitfalls to Avoid
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Launching cycles without adequate manager training',
                'Setting evaluation windows that are too short',
                'Skipping calibration sessions due to time pressure',
                'Not following up on triggered development actions',
                'Ignoring bias detection alerts',
                'Failing to communicate the "why" behind ratings'
              ].map((pitfall, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Shield className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{pitfall}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
