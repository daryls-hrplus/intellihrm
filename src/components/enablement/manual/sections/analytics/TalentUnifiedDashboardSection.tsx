import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, LayoutDashboard, Users, TrendingUp, Award, BookOpen, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  ScreenshotPlaceholder,
  TipCallout,
  InfoCallout,
  RelatedTopics
} from '../../components';

const DASHBOARD_SECTIONS = [
  {
    title: 'Performance Metrics',
    icon: TrendingUp,
    color: 'blue',
    widgets: ['Average Score', 'Completion Rate', 'Distribution Summary', 'Year-over-Year Trend']
  },
  {
    title: 'Succession Readiness',
    icon: Award,
    color: 'purple',
    widgets: ['Pipeline Health', 'Bench Strength', 'Critical Roles Coverage', 'Ready Now Count']
  },
  {
    title: 'Learning Progress',
    icon: BookOpen,
    color: 'green',
    widgets: ['Course Completions', 'Skill Development', 'Certification Status', 'IDP Progress']
  },
  {
    title: 'Upcoming Actions',
    icon: Calendar,
    color: 'amber',
    widgets: ['Due Appraisals', 'Expiring Certifications', 'Pending Approvals', 'Scheduled Reviews']
  },
  {
    title: 'AI Insights',
    icon: Sparkles,
    color: 'pink',
    widgets: ['Risk Alerts', 'High-Potential Flags', 'Coaching Nudges', 'Trend Predictions']
  }
];

export function TalentUnifiedDashboardSection() {
  return (
    <Card id="sec-6-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.6</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge className="gap-1 bg-purple-600 text-white">
            <Users className="h-3 w-3" />
            HR User / Admin
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-purple-500" />
          Talent Unified Dashboard
        </CardTitle>
        <CardDescription>
          Cross-module snapshot of performance, succession, and learning at a glance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Talent', 'Unified Dashboard']} />

        <LearningObjectives
          objectives={[
            'Understand the purpose of the Unified Dashboard',
            'Navigate the five dashboard sections effectively',
            'Use quick actions to jump to detailed views',
            'Leverage AI insights for proactive talent management'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            What is the Talent Unified Dashboard?
          </h4>
          <p className="text-muted-foreground">
            The Talent Unified Dashboard provides a single-page overview of your organization's 
            talent health. Instead of navigating between Performance, Succession, and Learning 
            modules separately, this dashboard consolidates key metrics and surfaces AI-powered 
            insights that span all talent domains. It's designed for HR leaders who need a quick, 
            holistic view before diving into details.
          </p>
        </div>

        {/* Dashboard Layout */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border">
          <h4 className="font-semibold mb-4">Dashboard Sections</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DASHBOARD_SECTIONS.map((section) => (
              <div key={section.title} className="p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded bg-${section.color}-100 dark:bg-${section.color}-900/30`}>
                    <section.icon className={`h-4 w-4 text-${section.color}-600`} />
                  </div>
                  <h5 className="font-medium text-sm">{section.title}</h5>
                </div>
                <div className="space-y-1">
                  {section.widgets.map((widget, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      {widget}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 6.6.1: Talent Unified Dashboard with all sections visible"
          alt="Talent Unified Dashboard"
        />

        {/* Cross-Module Connections */}
        <div>
          <h4 className="font-medium mb-3">Cross-Module Connections</h4>
          <p className="text-sm text-muted-foreground mb-3">
            The Unified Dashboard surfaces connections between modules that might otherwise be missed:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Award className="h-5 w-5 text-purple-500" />
              <span className="text-sm">Performance scores automatically update succession nine-box positions</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <BookOpen className="h-5 w-5 text-green-500" />
              <span className="text-sm">Competency gaps trigger learning recommendations</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Award className="h-5 w-5 text-purple-500" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <BookOpen className="h-5 w-5 text-green-500" />
              <span className="text-sm">Succession readiness drives development plan priorities</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-medium mb-3">Quick Action Navigation</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Each dashboard card includes quick actions to jump directly to relevant detailed views:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 border rounded-lg text-center text-sm">
              <p className="font-medium">View Details</p>
              <p className="text-xs text-muted-foreground">Open full report</p>
            </div>
            <div className="p-3 border rounded-lg text-center text-sm">
              <p className="font-medium">Take Action</p>
              <p className="text-xs text-muted-foreground">Address flagged items</p>
            </div>
            <div className="p-3 border rounded-lg text-center text-sm">
              <p className="font-medium">Export</p>
              <p className="text-xs text-muted-foreground">Download data</p>
            </div>
            <div className="p-3 border rounded-lg text-center text-sm">
              <p className="font-medium">Configure</p>
              <p className="text-xs text-muted-foreground">Customize view</p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 6.6.2: AI Insights section with cross-module recommendations"
          alt="AI Insights panel"
        />

        <TipCallout title="Morning Dashboard Routine">
          Make the Unified Dashboard your daily starting point. A 2-minute review each morning 
          helps you stay ahead of issues and identify quick wins across all talent domains.
        </TipCallout>

        <InfoCallout title="Customization">
          Dashboard layout can be customized per user. Drag and drop widgets to rearrange, 
          or hide sections that aren't relevant to your role. Settings are saved automatically.
        </InfoCallout>

        <RelatedTopics
          topics={[
            { sectionId: 'sec-6-5', title: 'Performance Intelligence Hub' },
            { sectionId: 'sec-7-2', title: 'Nine-Box & Succession Integration' },
            { sectionId: 'sec-7-5', title: 'Learning & Development Links' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
