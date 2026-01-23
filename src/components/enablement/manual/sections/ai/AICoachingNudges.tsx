import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, Bell, CheckCircle, Users, TrendingDown, MessageSquare, Calendar, Settings, Zap } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  BusinessRules,
  ScreenshotPlaceholder,
  TipCallout,
  InfoCallout,
  RelatedTopics
} from '../../components';

// Section 5.10 - AI Coaching Nudges (renumbered from 5.7)
const NUDGE_TYPES = [
  { 
    type: 'Goal Progress Alert', 
    icon: TrendingDown,
    priority: 'High',
    description: 'Employee goal progress below threshold mid-cycle',
    action: 'Schedule check-in to discuss blockers and support needed'
  },
  { 
    type: 'Skill Gap Opportunity', 
    icon: Lightbulb,
    priority: 'Medium',
    description: 'Training available for identified competency gap',
    action: 'Recommend specific learning course or assignment'
  },
  { 
    type: 'Recognition Reminder', 
    icon: MessageSquare,
    priority: 'Low',
    description: 'Employee completed milestone without recognition',
    action: 'Send recognition or add to next team meeting agenda'
  },
  { 
    type: 'Check-In Overdue', 
    icon: Calendar,
    priority: 'High',
    description: 'No check-in recorded for 30+ days',
    action: 'Schedule 1:1 meeting with employee'
  },
  { 
    type: 'Performance Risk Signal', 
    icon: Zap,
    priority: 'Critical',
    description: 'AI detected performance decline pattern',
    action: 'Review risk analysis and initiate intervention'
  }
];

const BUSINESS_RULES = [
  { rule: 'Nudges generated from multiple data sources', enforcement: 'System' as const, description: 'AI analyzes goals, check-ins, appraisals, pulse surveys, and skill assessments.' },
  { rule: 'Managers control nudge frequency', enforcement: 'System' as const, description: 'Configure daily, weekly, or as-needed nudge delivery in preferences.' },
  { rule: 'Dismissing nudges is logged', enforcement: 'System' as const, description: 'All nudge interactions tracked for AI learning and governance.' },
  { rule: 'Critical nudges cannot be bulk-dismissed', enforcement: 'System' as const, description: 'High-priority coaching nudges require individual acknowledgment.' }
];

export function AICoachingNudges() {
  return (
    <Card id="sec-5-10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.10</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge className="gap-1 bg-purple-600 text-white">
            <Users className="h-3 w-3" />
            Manager / HR User
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          AI Coaching Nudges
        </CardTitle>
        <CardDescription>
          Intelligent prompts that help managers take timely action on employee development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Appraisals', 'AI Assistant', 'Coaching Nudges']} />

        <LearningObjectives
          objectives={[
            'Understand what coaching nudges are and their sources',
            'Learn the different nudge types and priority levels',
            'Take action on nudges effectively',
            'Configure nudge preferences and frequency'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            What Are Coaching Nudges?
          </h4>
          <p className="text-muted-foreground">
            Coaching nudges are AI-generated prompts that alert managers to coaching opportunities 
            they might otherwise miss. By analyzing patterns across goal progress, check-in frequency, 
            pulse survey sentiment, and performance risk signals, the AI identifies when an employee 
            may need attention—and prompts the manager with specific, actionable suggestions.
          </p>
        </div>

        {/* Data Sources */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-3">Nudge Data Sources</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-2 bg-background rounded text-center">
              <p className="font-medium">Goal Progress</p>
              <p className="text-xs text-muted-foreground">Completion %</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <p className="font-medium">Check-Ins</p>
              <p className="text-xs text-muted-foreground">Frequency & quality</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <p className="font-medium">Pulse Surveys</p>
              <p className="text-xs text-muted-foreground">Sentiment trends</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <p className="font-medium">Risk Signals</p>
              <p className="text-xs text-muted-foreground">AI risk analysis</p>
            </div>
          </div>
        </div>

        {/* Nudge Types */}
        <div>
          <h4 className="font-medium mb-4">Nudge Types & Actions</h4>
          <div className="space-y-3">
            {NUDGE_TYPES.map((nudge) => (
              <div key={nudge.type} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-lg ${
                  nudge.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900/30' :
                  nudge.priority === 'High' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  nudge.priority === 'Medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-muted'
                }`}>
                  <nudge.icon className={`h-5 w-5 ${
                    nudge.priority === 'Critical' ? 'text-red-600' :
                    nudge.priority === 'High' ? 'text-amber-600' :
                    nudge.priority === 'Medium' ? 'text-blue-600' :
                    'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium">{nudge.type}</h5>
                    <Badge variant={
                      nudge.priority === 'Critical' ? 'destructive' :
                      nudge.priority === 'High' ? 'default' :
                      'secondary'
                    } className="text-xs">
                      {nudge.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{nudge.description}</p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Suggested Action:</span> {nudge.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 5.7.1: Enhanced Coaching Nudges widget on manager dashboard"
          alt="Coaching Nudges interface"
        />

        {/* Taking Action */}
        <div>
          <h4 className="font-medium mb-3">Taking Action on Nudges</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h5 className="font-medium mb-1">Act</h5>
              <p className="text-xs text-muted-foreground">
                Take the suggested action and mark complete
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h5 className="font-medium mb-1">Schedule</h5>
              <p className="text-xs text-muted-foreground">
                Defer to a specific date for follow-up
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h5 className="font-medium mb-1">Dismiss</h5>
              <p className="text-xs text-muted-foreground">
                Not relevant—dismiss with reason
              </p>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Configuring Nudge Preferences</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Managers can customize their nudge experience in User Settings → Notifications:
          </p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>Frequency:</strong> Real-time, Daily digest, or Weekly summary</li>
            <li>• <strong>Channels:</strong> In-app, Email, or Both</li>
            <li>• <strong>Priority filter:</strong> All, High and above, or Critical only</li>
            <li>• <strong>Source filter:</strong> Select which data sources generate nudges</li>
          </ul>
        </div>

        <TipCallout title="Maximize Nudge Value">
          Don't dismiss nudges without taking action. Even if the specific suggestion isn't 
          right, the underlying signal often indicates something worth investigating. Use nudges 
          as conversation starters in your next 1:1.
        </TipCallout>

        <InfoCallout title="Privacy & Governance">
          Nudges are generated from data already accessible to the manager. No new data is exposed. 
          All nudge interactions are logged for AI governance and continuous improvement of the 
          recommendation algorithm.
        </InfoCallout>

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-5-8', title: 'Performance Risk Detection' },
            { sectionId: 'sec-5-1', title: 'AI Feedback Assistant Overview' },
            { sectionId: 'sec-7-3', title: 'IDP/PIP Auto-Creation' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
