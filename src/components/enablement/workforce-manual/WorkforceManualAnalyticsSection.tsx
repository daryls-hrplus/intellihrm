import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BarChart3, Users, GitBranch, Brain, Calendar, Wrench, Link2 } from 'lucide-react';
import {
  AnalyticsDashboard,
  OrgChangesReporting,
  WorkforceForecasting,
  ScheduledReportsConfig,
  CustomReportBuilder,
  BIIntegration
} from './sections/analytics';

const ANALYTICS_SECTIONS = [
  {
    id: 'wf-sec-7-1',
    num: '7.1',
    title: 'Workforce Analytics Dashboard',
    desc: 'Key metrics: headcount, turnover, diversity - executive-level insights',
    time: 10,
    Component: AnalyticsDashboard
  },
  {
    id: 'wf-sec-7-2',
    num: '7.2',
    title: 'Org Changes Reporting',
    desc: 'Historical org structure changes, audit trail for compliance',
    time: 8,
    Component: OrgChangesReporting
  },
  {
    id: 'wf-sec-7-3',
    num: '7.3',
    title: 'Workforce Forecasting',
    desc: 'AI-powered attrition prediction and growth modeling',
    time: 10,
    Component: WorkforceForecasting
  },
  {
    id: 'wf-sec-7-4',
    num: '7.4',
    title: 'Scheduled Reports Configuration',
    desc: 'Setting up automated report delivery to stakeholders',
    time: 8,
    Component: ScheduledReportsConfig
  },
  {
    id: 'wf-sec-7-5',
    num: '7.5',
    title: 'Custom Report Builder',
    desc: 'Building ad-hoc workforce reports with self-service tools',
    time: 8,
    Component: CustomReportBuilder
  },
  {
    id: 'wf-sec-7-6',
    num: '7.6',
    title: 'BI Integration',
    desc: 'Connecting to Power BI, Tableau, and other BI tools',
    time: 6,
    Component: BIIntegration
  }
];

export function WorkforceManualAnalyticsSection() {
  return (
    <div className="space-y-8">
      {/* Part Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Part 7: Workforce Analytics & Reporting</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  50 minutes
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  HR Admin, HRBP, Executive
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Master workforce analytics to drive data-informed decisions. Learn to use dashboards 
            for executive insights, track organizational changes for compliance, leverage AI for 
            workforce forecasting, and integrate with enterprise BI tools.
          </p>
        </CardContent>
      </Card>

      {/* Section Cards */}
      {ANALYTICS_SECTIONS.map((section) => (
        <Card key={section.id} id={section.id} data-manual-anchor={section.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {section.num} {section.title}
              </CardTitle>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {section.time} min
              </span>
            </div>
            <CardDescription>{section.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <section.Component />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
