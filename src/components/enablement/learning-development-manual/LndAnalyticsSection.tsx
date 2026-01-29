import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart3 } from 'lucide-react';
import {
  LndAnalyticsDashboard, LndAnalyticsKPICards, LndAnalyticsExecutiveViews,
  LndAnalyticsLearnerProgress, LndAnalyticsCertificationTracking, LndAnalyticsQuizPerformance,
  LndAnalyticsCourseEffectiveness, LndAnalyticsKirkpatrick, LndAnalyticsROI,
  LndAnalyticsBudgetUtilization, LndAnalyticsCostPerLearner,
  LndAnalyticsComplianceReporting, LndAnalyticsAuditExports,
  LndAnalyticsManagerTeamView, LndAnalyticsDepartmentRollup,
  LndAnalyticsAIPoweredBI, LndAnalyticsScheduledReports, LndAnalyticsCustomReportBuilder,
  LndAnalyticsScormXapi, LndAnalyticsGamification, LndAnalyticsLearningPaths, LndAnalyticsExternalTraining
} from './sections/analytics';

const ANALYTICS_SECTIONS = [
  // Section A: Executive Dashboards
  { id: 'sec-7-1', num: '7.1', title: 'Training Analytics Dashboard', time: 12, Component: LndAnalyticsDashboard, group: 'A' },
  { id: 'sec-7-2', num: '7.2', title: 'KPI Card Configuration', time: 8, Component: LndAnalyticsKPICards, group: 'A' },
  { id: 'sec-7-3', num: '7.3', title: 'Executive Summary Views', time: 8, Component: LndAnalyticsExecutiveViews, group: 'A' },
  // Section B: Learner Analytics
  { id: 'sec-7-4', num: '7.4', title: 'Learner Progress Reports', time: 10, Component: LndAnalyticsLearnerProgress, group: 'B' },
  { id: 'sec-7-5', num: '7.5', title: 'Certification Tracking', time: 8, Component: LndAnalyticsCertificationTracking, group: 'B' },
  { id: 'sec-7-6', num: '7.6', title: 'Quiz Performance Analytics', time: 8, Component: LndAnalyticsQuizPerformance, group: 'B' },
  // Section C: Course Effectiveness
  { id: 'sec-7-7', num: '7.7', title: 'Course Effectiveness Metrics', time: 10, Component: LndAnalyticsCourseEffectiveness, group: 'C' },
  { id: 'sec-7-8', num: '7.8', title: 'Kirkpatrick Model Reporting', time: 12, Component: LndAnalyticsKirkpatrick, group: 'C' },
  { id: 'sec-7-9', num: '7.9', title: 'Training ROI Analysis', time: 10, Component: LndAnalyticsROI, group: 'C' },
  // Section D: Financial Analytics
  { id: 'sec-7-10', num: '7.10', title: 'Budget Utilization Reports', time: 10, Component: LndAnalyticsBudgetUtilization, group: 'D' },
  { id: 'sec-7-11', num: '7.11', title: 'Cost-Per-Learner Analysis', time: 8, Component: LndAnalyticsCostPerLearner, group: 'D' },
  // Section E: Compliance Analytics
  { id: 'sec-7-12', num: '7.12', title: 'Compliance Reporting', time: 10, Component: LndAnalyticsComplianceReporting, group: 'E' },
  { id: 'sec-7-13', num: '7.13', title: 'Regulatory Audit Exports', time: 8, Component: LndAnalyticsAuditExports, group: 'E' },
  // Section F: Manager & Team Views
  { id: 'sec-7-14', num: '7.14', title: 'Manager Team Training View', time: 8, Component: LndAnalyticsManagerTeamView, group: 'F' },
  { id: 'sec-7-15', num: '7.15', title: 'Department Rollup Reports', time: 8, Component: LndAnalyticsDepartmentRollup, group: 'F' },
  // Section G: Advanced Analytics & AI
  { id: 'sec-7-16', num: '7.16', title: 'AI-Powered BI Reports', time: 8, Component: LndAnalyticsAIPoweredBI, group: 'G' },
  { id: 'sec-7-17', num: '7.17', title: 'Scheduled Reports Configuration', time: 6, Component: LndAnalyticsScheduledReports, group: 'G' },
  { id: 'sec-7-18', num: '7.18', title: 'Custom Report Builder', time: 8, Component: LndAnalyticsCustomReportBuilder, group: 'G' },
  // Section H: Technical Analytics (NEW)
  { id: 'sec-7-19', num: '7.19', title: 'SCORM/xAPI Analytics', time: 12, Component: LndAnalyticsScormXapi, group: 'H' },
  { id: 'sec-7-20', num: '7.20', title: 'Gamification Analytics', time: 10, Component: LndAnalyticsGamification, group: 'H' },
  { id: 'sec-7-21', num: '7.21', title: 'Learning Path Analytics', time: 10, Component: LndAnalyticsLearningPaths, group: 'H' },
  { id: 'sec-7-22', num: '7.22', title: 'External Training Analytics', time: 10, Component: LndAnalyticsExternalTraining, group: 'H' },
];

export function LndAnalyticsSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Chapter 7: Analytics & Reporting</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />150 minutes</span>
                <span>22 sections</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Enterprise training analytics covering dashboards, Kirkpatrick evaluation, ROI analysis,
            compliance reporting, SCORM/xAPI tracking, gamification metrics, learning paths, external training, 
            and AI-powered insights. Industry-aligned with Workday, SAP SuccessFactors, Docebo, and Cornerstone patterns.
          </p>
        </CardContent>
      </Card>

      {ANALYTICS_SECTIONS.map((section) => (
        <Card key={section.id} id={section.id} data-manual-anchor={section.id} className="scroll-mt-32">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Section {section.num}</Badge>
                <Badge variant="secondary">Group {section.group}</Badge>
              </div>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />{section.time} min
              </span>
            </div>
            <CardTitle className="text-lg mt-2">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <section.Component />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
