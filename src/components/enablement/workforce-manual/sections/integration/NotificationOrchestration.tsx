import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, Mail, Smartphone, Users, ArrowRight,
  CheckCircle, Clock, AlertCircle, Settings
} from 'lucide-react';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const notificationFlowDiagram = `
graph LR
    subgraph EVENTS["Workforce Events"]
        HIRE[New Hire]
        TRANS[Transfer]
        TERM[Termination]
        PROMO[Promotion]
        CHANGE[Data Change]
    end
    
    subgraph ENGINE["Notification Engine"]
        RULES[Notification Rules]
        ROUTE[Recipient Routing]
        TEMPLATE[Message Templates]
        QUEUE[Delivery Queue]
    end
    
    subgraph DELIVERY["Delivery Channels"]
        EMAIL[Email]
        INAPP[In-App Alert]
        PUSH[Push Notification]
        SMS[SMS]
    end
    
    subgraph RECIPIENTS["Recipient Types"]
        EMP[Employee]
        MGR[Manager]
        HR[HR Partner]
        ADMIN[System Admin]
    end
    
    HIRE --> RULES
    TRANS --> RULES
    TERM --> RULES
    PROMO --> RULES
    CHANGE --> RULES
    
    RULES --> ROUTE
    ROUTE --> TEMPLATE
    TEMPLATE --> QUEUE
    
    QUEUE --> EMAIL
    QUEUE --> INAPP
    QUEUE --> PUSH
    QUEUE --> SMS
    
    EMAIL --> EMP
    EMAIL --> MGR
    EMAIL --> HR
    INAPP --> EMP
    INAPP --> MGR
    
    style EVENTS fill:#e0f2fe,stroke:#0284c7
    style ENGINE fill:#fef3c7,stroke:#d97706
    style DELIVERY fill:#f0fdf4,stroke:#16a34a
    style RECIPIENTS fill:#fce7f3,stroke:#db2777
`;

const notificationTypes = [
  {
    event: 'New Hire',
    recipients: ['Employee', 'Manager', 'HR', 'IT'],
    channels: ['Email', 'In-App'],
    timing: 'Immediate + scheduled'
  },
  {
    event: 'Transfer',
    recipients: ['Employee', 'Old Manager', 'New Manager', 'HR'],
    channels: ['Email', 'In-App'],
    timing: 'On effective date'
  },
  {
    event: 'Promotion',
    recipients: ['Employee', 'Manager', 'HR'],
    channels: ['Email', 'In-App'],
    timing: 'On effective date'
  },
  {
    event: 'Termination',
    recipients: ['Manager', 'HR', 'IT', 'Finance'],
    channels: ['Email'],
    timing: 'Immediate (internal only)'
  },
  {
    event: 'Approval Required',
    recipients: ['Approver'],
    channels: ['Email', 'In-App', 'Push'],
    timing: 'Immediate'
  },
  {
    event: 'Document Expiring',
    recipients: ['Employee', 'HR'],
    channels: ['Email', 'In-App'],
    timing: '30/14/7 days before'
  }
];

const routingRules = [
  { rule: 'Direct Manager', description: 'Route to employee\'s reporting manager from org hierarchy' },
  { rule: 'HR Partner', description: 'Route to HR partner assigned to employee\'s department' },
  { rule: 'Skip-Level Manager', description: 'Route to manager\'s manager for escalations' },
  { rule: 'Role-Based', description: 'Route to users with specific role (e.g., Payroll Admin)' },
  { rule: 'Department Head', description: 'Route to head of employee\'s department' }
];

export function NotificationOrchestration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-10">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.10 Notification Orchestration</h2>
            <p className="text-muted-foreground">
              Automated alerts for organizational changes, approvals, and key events
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Event-Driven Notification System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Workforce events automatically trigger notifications to relevant stakeholders. 
            When an employee is hired, transferred, promoted, or terminated, the notification 
            engine determines who needs to know and delivers messages through appropriate channels.
          </p>
          <p className="text-muted-foreground">
            This orchestration integrates with the HR Hub notification system to provide 
            consistent messaging across all Intelli HRM modules while using workforce org hierarchy 
            data to route notifications to the right recipients.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          variant="primary"
          icon={ArrowRight}
          title="Event-Triggered"
          description="Workforce transactions automatically fire notification events"
        />
        <FeatureCard
          variant="info"
          icon={Users}
          title="Smart Routing"
          description="Recipients determined by org hierarchy and role assignments"
        />
        <FeatureCard
          variant="success"
          icon={Smartphone}
          title="Multi-Channel"
          description="Email, in-app alerts, push notifications, and SMS delivery"
        />
      </div>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Notification Orchestration Flow"
        description="How workforce events trigger notifications to stakeholders"
        diagram={notificationFlowDiagram}
      />

      {/* Notification Types */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Workforce Event Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Event</th>
                  <th className="text-left py-3 px-4 font-medium">Recipients</th>
                  <th className="text-left py-3 px-4 font-medium">Channels</th>
                  <th className="text-left py-3 px-4 font-medium">Timing</th>
                </tr>
              </thead>
              <tbody>
                {notificationTypes.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.event}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.recipients.map((r, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.channels.map((c, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Routing Rules */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Recipient Routing Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Notifications are routed based on the organizational structure and role assignments:
          </p>
          <div className="space-y-3">
            {routingRules.map((rule, index) => (
              <div key={index} className="p-3 border rounded-lg bg-background flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">{rule.rule}</h4>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        caption="Notification Settings - Admin configuration screen for workforce notification rules and templates"
      />

      {/* Approval Notifications */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Approval Workflow Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                Pending Approval Alert
              </h4>
              <p className="text-sm text-muted-foreground">
                When a transaction requires approval, the designated approver receives 
                an immediate notification with a link to review and act on the request.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Escalation Reminders
              </h4>
              <p className="text-sm text-muted-foreground">
                If approvals remain pending beyond configured thresholds, escalation 
                notifications are sent to skip-level managers or HR partners.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Approval Confirmation
              </h4>
              <p className="text-sm text-muted-foreground">
                Upon approval, the requestor and affected employee receive confirmation 
                that the transaction has been approved and will take effect.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Rejection Notice
              </h4>
              <p className="text-sm text-muted-foreground">
                If a transaction is rejected, the requestor is notified with the 
                rejection reason and guidance on next steps.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <TipCallout title="Notification Preferences">
        Employees can configure their notification preferences in ESS to control which 
        notifications they receive and through which channels. Critical notifications 
        (like approval requests) cannot be disabled.
      </TipCallout>

      <WarningCallout title="Email Delivery">
        Ensure employee email addresses are accurate in workforce records. Bounced 
        notification emails are logged and may require manual follow-up for critical communications.
      </WarningCallout>

      <InfoCallout title="HR Hub Integration">
        Workforce notifications integrate with the HR Hub notification center. All 
        notifications appear in the unified notification inbox and follow the same 
        template and branding standards.
      </InfoCallout>
    </div>
  );
}
