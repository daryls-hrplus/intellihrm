import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Target,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  FileText,
  Users,
  Shield,
  Zap,
  RefreshCw
} from 'lucide-react';
import { InfoCallout, TipCallout } from '@/components/enablement/manual/components/Callout';

export function LndCalendar() {
  const quarterActivities = [
    {
      quarter: 'Q1',
      title: 'Planning & Analysis',
      color: 'blue',
      activities: [
        { activity: 'Training Needs Analysis', owner: 'L&D Admin', deadline: 'Jan 31' },
        { activity: 'Annual Budget Allocation', owner: 'HR Partner', deadline: 'Feb 15' },
        { activity: 'Compliance Calendar Review', owner: 'L&D Admin', deadline: 'Feb 28' },
        { activity: 'Learning Path Updates', owner: 'L&D Admin', deadline: 'Mar 15' },
      ],
    },
    {
      quarter: 'Q2',
      title: 'Delivery & Execution',
      color: 'emerald',
      activities: [
        { activity: 'New Hire Training Launch', owner: 'L&D Admin', deadline: 'Apr 15' },
        { activity: 'Compliance Training Wave 1', owner: 'L&D Admin', deadline: 'May 31' },
        { activity: 'Mid-Year Budget Review', owner: 'HR Partner', deadline: 'Jun 15' },
        { activity: 'Instructor Certifications', owner: 'L&D Admin', deadline: 'Jun 30' },
      ],
    },
    {
      quarter: 'Q3',
      title: 'Assessment & Adjustment',
      color: 'amber',
      activities: [
        { activity: 'Skills Gap Analysis', owner: 'L&D Admin', deadline: 'Jul 31' },
        { activity: 'Compliance Training Wave 2', owner: 'L&D Admin', deadline: 'Aug 31' },
        { activity: 'Course Effectiveness Review', owner: 'L&D Admin', deadline: 'Sep 15' },
        { activity: 'Q3 Analytics Report', owner: 'HR Partner', deadline: 'Sep 30' },
      ],
    },
    {
      quarter: 'Q4',
      title: 'Evaluation & Planning',
      color: 'purple',
      activities: [
        { activity: 'Annual Training ROI Analysis', owner: 'L&D Admin', deadline: 'Oct 31' },
        { activity: 'Year-End Compliance Audit', owner: 'HR Partner', deadline: 'Nov 15' },
        { activity: 'Next Year Planning', owner: 'L&D Admin', deadline: 'Dec 1' },
        { activity: 'Budget Proposal Submission', owner: 'HR Partner', deadline: 'Dec 15' },
      ],
    },
  ];

  const monthlyCalendar = [
    { month: 'January', activities: ['Annual compliance kickoff', 'New year training goals', 'Budget finalization'] },
    { month: 'February', activities: ['Leadership development programs', 'Q1 evaluations prep', 'Course catalog update'] },
    { month: 'March', activities: ['Mid-quarter compliance check', 'New hire orientation batch', 'Q1 budget review'] },
    { month: 'April', activities: ['Performance review training', 'Spring compliance wave', 'Learning path launches'] },
    { month: 'May', activities: ['Professional development month', 'Mid-year planning', 'Instructor training'] },
    { month: 'June', activities: ['Half-year compliance audit', 'Summer training schedule', 'Budget reconciliation'] },
    { month: 'July', activities: ['Skills assessment period', 'Q3 planning', 'External training coordination'] },
    { month: 'August', activities: ['Back-to-work programs', 'Compliance wave 2', 'Course effectiveness review'] },
    { month: 'September', activities: ['Q3 wrap-up', 'Annual review prep training', 'Leadership pipeline programs'] },
    { month: 'October', activities: ['ROI analysis', 'Year-end planning begins', 'Compliance final push'] },
    { month: 'November', activities: ['Year-end compliance audit', 'Budget proposal prep', 'Recognition events'] },
    { month: 'December', activities: ['Holiday training schedule', 'Next year finalization', 'Archive and cleanup'] },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-1-5" data-manual-anchor="sec-1-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Calendar className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1.5 L&D Calendar & Planning Cycle</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                8 min read
              </Badge>
              <Badge variant="secondary" className="text-xs">Planning</Badge>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          Effective L&D management follows an annual planning cycle aligned with organizational goals, 
          compliance requirements, and budget periods. This section outlines the recommended quarterly 
          and monthly activities for L&D administrators and HR partners.
        </p>

        {/* Annual Planning Cycle */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
            Annual Planning Cycle
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quarterActivities.map((q, idx) => (
              <Card key={idx} className={`border-${q.color}-200 dark:border-${q.color}-800`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-${q.color}-500 text-white flex items-center justify-center font-bold text-sm`}>
                      {q.quarter}
                    </div>
                    <span>{q.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {q.activities.map((act, i) => (
                      <li key={i} className="text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className={`h-3 w-3 text-${q.color}-600 mt-1 flex-shrink-0`} />
                          <div>
                            <p className="font-medium">{act.activity}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{act.owner}</span>
                              <span>•</span>
                              <span>{act.deadline}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Monthly Calendar */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Monthly Activity Reference
          </h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                {monthlyCalendar.map((m, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-semibold text-sm mb-2">{m.month}</p>
                    <ul className="space-y-1">
                      {m.activities.map((act, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span>•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Calendar Integration */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Compliance Calendar Integration
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Recertification Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>30 days before expiry: First notification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>14 days before expiry: Escalation to manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>7 days before expiry: Final warning</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Grace Period Management
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>Configurable per compliance rule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>Typical range: 7-30 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>Status changes to "Grace Period" during window</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Regulatory Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>OSHA training: Annual renewal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>Data privacy: Varies by jurisdiction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1" />
                    <span>Industry-specific: Per regulatory body</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Milestones */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Key Annual Milestones
          </h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-200 dark:bg-emerald-800" />
                <div className="space-y-4">
                  {[
                    { date: 'January', milestone: 'Annual Training Plan Approval', icon: FileText },
                    { date: 'March', milestone: 'Q1 Compliance Completion Target', icon: Shield },
                    { date: 'June', milestone: 'Mid-Year Progress Review', icon: BarChart3 },
                    { date: 'September', milestone: 'Skills Gap Analysis Complete', icon: Target },
                    { date: 'November', milestone: 'Year-End Audit Preparation', icon: CheckCircle2 },
                    { date: 'December', milestone: 'Next Year Budget & Plan Finalized', icon: Zap },
                  ].map((item, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className="absolute left-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="min-w-[80px] justify-center">{item.date}</Badge>
                        <item.icon className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">{item.milestone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <TipCallout title="Calendar Integration">
          The L&D module integrates with the <strong>Training Calendar</strong> page (<code>/training/calendar</code>) 
          for visual scheduling. Compliance deadlines and recertification dates are automatically displayed 
          for enrolled employees.
        </TipCallout>

        <InfoCallout title="Regional Variations">
          Compliance deadlines vary by jurisdiction. Caribbean organizations should align with local labor 
          ministry requirements, while multinational deployments should configure country-specific compliance 
          rules in the Compliance Training Setup (Chapter 5).
        </InfoCallout>
      </section>
    </div>
  );
}
