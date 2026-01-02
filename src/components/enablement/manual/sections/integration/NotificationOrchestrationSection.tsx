import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { ConfigurationExample } from '../../components/ConfigurationExample';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';
import { 
  Bell, Lightbulb, AlertTriangle, Info, Mail,
  MessageSquare, Users, Send, CheckCircle2
} from 'lucide-react';

export function NotificationOrchestrationSection() {
  const notificationDiagram = `
graph TB
    subgraph Trigger["Integration Trigger"]
        A[Appraisal Finalized] --> B[Rule Conditions Met]
    end
    
    subgraph Config["Notification Configuration"]
        B --> C[Load Action Parameters]
        C --> D[title: Notification Title]
        C --> E[message: Notification Body]
        C --> F[recipient: Target User]
    end
    
    subgraph Creation["Notification Creation"]
        D & E & F --> G[Create Notification Record]
        G --> H[Add Metadata]
        H --> I[participant_id]
        H --> J[cycle_id]
        H --> K[category_code]
    end
    
    subgraph Delivery["Delivery"]
        I & J & K --> L[In-App Notification]
        L --> M[User Sees Bell Icon Badge]
        M --> N[Click to View Details]
        N --> O[Deep Link to Appraisal]
    end
  `;

  const fields = [
    { name: 'user_id', required: true, type: 'UUID', description: 'Recipient of the notification' },
    { name: 'title', required: true, type: 'Text', description: 'Notification headline', validation: 'Max 100 characters' },
    { name: 'message', required: true, type: 'Text', description: 'Notification body content', validation: 'Max 500 characters' },
    { name: 'type', required: true, type: 'Enum', description: 'Notification category', defaultValue: 'appraisal' },
    { name: 'priority', required: false, type: 'Enum', description: 'Display priority (high/medium/low)', defaultValue: 'medium' },
    { name: 'is_read', required: true, type: 'Boolean', description: 'Whether user has viewed notification', defaultValue: 'false' },
    { name: 'metadata', required: false, type: 'JSON', description: 'Additional context for deep linking' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'When notification was created' },
  ];

  const metadataFields = [
    { name: 'participant_id', required: false, type: 'UUID', description: 'Links to appraisal participant for deep linking' },
    { name: 'cycle_id', required: false, type: 'UUID', description: 'Appraisal cycle reference' },
    { name: 'category_code', required: false, type: 'String', description: 'Performance category for context' },
    { name: 'source_rule_id', required: false, type: 'UUID', description: 'Integration rule that triggered notification' },
    { name: 'action_url', required: false, type: 'String', description: 'Deep link URL for navigation' },
  ];

  const businessRules = [
    { rule: 'Notifications created immediately upon rule execution', enforcement: 'System' as const, description: 'No delay between trigger and notification creation' },
    { rule: 'Recipient determined by action parameters', enforcement: 'System' as const, description: 'Configure "employee", "manager", or specific user ID' },
    { rule: 'Metadata enables deep linking to source', enforcement: 'Advisory' as const, description: 'Include participant_id and cycle_id for navigation' },
    { rule: 'Notifications respect user preferences', enforcement: 'System' as const, description: 'Users can control notification visibility in their settings' },
    { rule: 'All notifications logged for audit', enforcement: 'System' as const, description: 'Integration log captures notification creation with full details' },
    { rule: 'Title and message support template variables', enforcement: 'Advisory' as const, description: 'Use placeholders for dynamic content (future enhancement)' },
  ];

  const configExamples = [
    {
      title: 'Manager Notification on Finalization',
      context: 'Alert manager when their direct report\'s appraisal is finalized',
      values: [
        { field: 'Target Module', value: 'notifications' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'All categories' },
        { field: 'Action Parameters', value: '{"title": "Appraisal Completed", "message": "An appraisal has been finalized for your review", "recipient": "manager"}' },
      ],
      outcome: 'Manager receives in-app notification with link to view appraisal'
    },
    {
      title: 'HR Alert for Underperformers',
      context: 'Notify HR when an employee receives needs improvement rating',
      values: [
        { field: 'Target Module', value: 'notifications' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'needs_improvement, unsatisfactory' },
        { field: 'Action Parameters', value: '{"title": "Performance Concern", "message": "An employee has received a below-expectations rating", "priority": "high"}' },
      ],
      outcome: 'HR receives high-priority notification for timely intervention'
    },
    {
      title: 'Employee Recognition Alert',
      context: 'Celebrate exceptional performers with a notification',
      values: [
        { field: 'Target Module', value: 'notifications' },
        { field: 'Condition Type', value: 'category_match' },
        { field: 'Category Codes', value: 'exceptional' },
        { field: 'Action Parameters', value: '{"title": "Outstanding Performance!", "message": "Congratulations on your exceptional appraisal rating!", "recipient": "employee"}' },
      ],
      outcome: 'Employee receives congratulatory notification'
    },
  ];

  const steps: Step[] = [
    {
      title: 'Create Notification Integration Rule',
      description: 'Set up the trigger for automated notifications',
      substeps: [
        'Navigate to Performance → Setup → Integration',
        'Click "Add Rule"',
        'Select "notifications" as the Target Module',
        'Define trigger conditions (category or score-based)'
      ],
      expectedResult: 'Rule form configured for notifications target'
    },
    {
      title: 'Configure Notification Content',
      description: 'Define the message that recipients will see',
      substeps: [
        'In Action Parameters, set the "title" field',
        'Add the "message" content with relevant context',
        'Specify "recipient" (employee, manager, or user ID)',
        'Optionally set "priority" for visibility'
      ],
      expectedResult: 'Notification content configured'
    },
    {
      title: 'Add Metadata for Deep Linking',
      description: 'Enable navigation from notification to source',
      substeps: [
        'Include participant_id in action parameters',
        'Add cycle_id for context',
        'Optionally include category_code',
        'Set action_url for direct navigation (if supported)'
      ],
      expectedResult: 'Metadata configured for deep linking'
    },
    {
      title: 'Test the Notification',
      description: 'Verify notifications are delivered correctly',
      substeps: [
        'Finalize a test appraisal matching the conditions',
        'Check the recipient\'s notification bell',
        'Verify title and message appear correctly',
        'Test deep link navigation if configured'
      ],
      expectedResult: 'Notification received with correct content and links'
    },
    {
      title: 'Monitor Delivery',
      description: 'Track notification creation and engagement',
      substeps: [
        'Review integration logs for notification creation',
        'Check notifications table for delivery status',
        'Monitor is_read status for engagement',
        'Adjust messaging based on user feedback'
      ],
      expectedResult: 'Notifications tracked and optimized'
    },
  ];

  const troubleshootingItems = [
    { issue: 'Notification not appearing', cause: 'Recipient user ID may be incorrect', solution: 'Verify recipient parameter matches expected user or use "employee"/"manager" keywords' },
    { issue: 'Wrong recipient received notification', cause: 'Recipient parameter not configured correctly', solution: 'Check action_parameters.recipient value; use "employee" for the appraised employee, "manager" for their manager' },
    { issue: 'Deep link not working', cause: 'Metadata missing required fields', solution: 'Ensure participant_id and cycle_id are included in action parameters' },
    { issue: 'Notification bell not showing badge', cause: 'User may have read the notification or disabled badges', solution: 'Check is_read status in database; verify user notification preferences' },
    { issue: 'Duplicate notifications', cause: 'Multiple rules triggering for same condition', solution: 'Review rule execution order and consolidate overlapping rules' },
  ];

  return (
    <div className="space-y-8">
      {/* Section 7.6 Header */}
      <Card id="sec-7-6">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 7.6</Badge>
          </div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notification Orchestration
          </CardTitle>
          <CardDescription>
            Trigger automated notifications based on appraisal outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-7-6']} />

          {/* Learning Objectives */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configure automated notifications for appraisal events</li>
                <li>Customize notification content and recipients</li>
                <li>Add metadata for deep linking and context</li>
                <li>Monitor notification delivery and engagement</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notification Use Cases
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Manager Alerts</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Notify managers when team member appraisals are completed for review
                  </p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h4 className="font-medium">HR Escalations</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Alert HR when performance issues require intervention or support
                  </p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">Employee Updates</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inform employees about their appraisal status and outcomes
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Workflow Diagram */}
          <WorkflowDiagram 
            title="Notification Creation Flow"
            description="From integration trigger to user notification"
            diagram={notificationDiagram}
          />

          {/* Recipient Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Send className="h-5 w-5" />
              Recipient Configuration
            </h3>
            <p className="text-muted-foreground">
              The recipient parameter in action_parameters determines who receives the notification:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <Badge className="mb-2">employee</Badge>
                  <p className="text-sm text-muted-foreground">
                    The employee being appraised receives the notification
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <Badge className="mb-2">manager</Badge>
                  <p className="text-sm text-muted-foreground">
                    The employee's direct manager receives the notification
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <Badge className="mb-2">UUID</Badge>
                  <p className="text-sm text-muted-foreground">
                    Specific user ID for custom routing (e.g., HR partner)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Field References */}
          <FieldReferenceTable 
            fields={fields} 
            title="Notification Record Fields"
          />

          <FieldReferenceTable 
            fields={metadataFields} 
            title="Metadata Fields for Deep Linking"
          />

          {/* Step by Step */}
          <StepByStep 
            steps={steps}
            title="Configuring Notification Rules"
          />

          {/* Configuration Examples */}
          <ConfigurationExample 
            examples={configExamples}
            title="Notification Rule Examples"
          />

          {/* Business Rules */}
          <BusinessRules 
            rules={businessRules}
            title="Notification Delivery Rules"
          />

          {/* Troubleshooting */}
          <TroubleshootingSection 
            items={troubleshootingItems}
            title="Common Issues"
          />

          {/* Future Enhancements */}
          <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">Future Enhancements</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <p className="mb-2">Planned enhancements to notification orchestration:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Email delivery channel in addition to in-app notifications</li>
                <li>Template variables for personalized messages (e.g., {`{employee_name}`})</li>
                <li>Scheduled notifications for digest/summary delivery</li>
                <li>Integration with HR Hub Reminders for unified notification management</li>
                <li>Read receipts and engagement analytics</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Best Practices</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Keep notification titles concise and action-oriented</li>
                <li>Include enough context in the message for users to understand priority</li>
                <li>Use high priority sparingly to maintain its effectiveness</li>
                <li>Always include metadata for deep linking when possible</li>
                <li>Test notifications with a pilot group before organization-wide rollout</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
