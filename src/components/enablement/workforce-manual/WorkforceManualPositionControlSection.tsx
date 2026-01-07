import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, TrendingUp, Users, BarChart3, Brain, GitBranch, DollarSign, Lock } from 'lucide-react';
import {
  PositionControlOverview,
  VacancyManagement,
  HeadcountRequests,
  HeadcountAnalyticsDashboard,
  AIHeadcountForecast,
  ScenarioPlanning,
  BudgetIntegration,
  FreezeThawControls
} from './sections/position-control';

const POSITION_CONTROL_SECTIONS = [
  {
    id: 'wf-sec-6-1',
    num: '6.1',
    title: 'Position Control Overview',
    desc: 'Position-based vs headcount-based planning fundamentals',
    time: 10,
    Component: PositionControlOverview
  },
  {
    id: 'wf-sec-6-2',
    num: '6.2',
    title: 'Vacancy Management',
    desc: 'Tracking open positions and time-to-fill metrics',
    time: 8,
    Component: VacancyManagement
  },
  {
    id: 'wf-sec-6-3',
    num: '6.3',
    title: 'Headcount Requests',
    desc: 'Request workflow for new positions or backfills',
    time: 10,
    Component: HeadcountRequests
  },
  {
    id: 'wf-sec-6-4',
    num: '6.4',
    title: 'Headcount Analytics Dashboard',
    desc: 'Current vs budgeted headcount with variance analysis',
    time: 8,
    Component: HeadcountAnalyticsDashboard
  },
  {
    id: 'wf-sec-6-5',
    num: '6.5',
    title: 'AI-Powered Headcount Forecast',
    desc: 'Predictive headcount modeling with ML-based scenarios',
    time: 10,
    Component: AIHeadcountForecast
  },
  {
    id: 'wf-sec-6-6',
    num: '6.6',
    title: 'Scenario Planning',
    desc: 'What-if analysis for restructuring and cost simulation',
    time: 8,
    Component: ScenarioPlanning
  },
  {
    id: 'wf-sec-6-7',
    num: '6.7',
    title: 'Budget Integration',
    desc: 'Linking headcount to financial budgets and systems',
    time: 8,
    Component: BudgetIntegration
  },
  {
    id: 'wf-sec-6-8',
    num: '6.8',
    title: 'Freeze & Thaw Controls',
    desc: 'Implementing hiring freezes with exception handling',
    time: 8,
    Component: FreezeThawControls
  }
];

export function WorkforceManualPositionControlSection() {
  return (
    <div className="space-y-8">
      {/* Part Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Part 6: Position Control & Headcount Management</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  70 minutes
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  HR Admin, Finance, Workforce Planner
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Master position control and headcount management to maintain workforce alignment with 
            organizational strategy. Learn to track positions, manage vacancies, forecast headcount 
            needs with AI, and integrate with financial planning systems.
          </p>
        </CardContent>
      </Card>

      {/* Section Cards */}
      {POSITION_CONTROL_SECTIONS.map((section) => (
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
