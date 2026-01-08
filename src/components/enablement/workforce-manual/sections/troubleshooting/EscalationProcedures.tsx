import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, Phone, Clock, AlertTriangle, 
  CheckCircle, Lightbulb, ArrowUp, FileText
} from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';

const supportTiers = [
  {
    tier: 'Tier 1',
    name: 'Self-Service & Help Desk',
    channels: ['In-app help', 'Knowledge base', 'Help desk ticket'],
    responseTime: 'Immediate - 4 hours',
    resolves: ['How-to questions', 'Password resets', 'Basic navigation', 'Standard reports'],
    escalatesTo: 'Tier 2'
  },
  {
    tier: 'Tier 2',
    name: 'HR Administration',
    channels: ['Internal HR team', 'HR service desk'],
    responseTime: '4-8 hours',
    resolves: ['Configuration issues', 'Data corrections', 'Workflow stuck', 'Access requests'],
    escalatesTo: 'Tier 3'
  },
  {
    tier: 'Tier 3',
    name: 'IT / System Admin',
    channels: ['IT ticket', 'Admin support'],
    responseTime: '8-24 hours',
    resolves: ['Integration failures', 'Performance issues', 'Security incidents', 'System errors'],
    escalatesTo: 'Tier 4'
  },
  {
    tier: 'Tier 4',
    name: 'Vendor Support',
    channels: ['Vendor portal', 'Enterprise support line'],
    responseTime: 'Per SLA (4-72 hours)',
    resolves: ['Product bugs', 'Platform outages', 'Feature requests', 'Complex integrations'],
    escalatesTo: 'N/A'
  }
];

const slaExpectations = [
  { severity: 'Critical', definition: 'System down, all users affected', response: '15 min', resolution: '4 hours', example: 'Complete system outage' },
  { severity: 'High', definition: 'Major function unavailable, workaround exists', response: '1 hour', resolution: '8 hours', example: 'Payroll sync failed' },
  { severity: 'Medium', definition: 'Feature degraded, limited user impact', response: '4 hours', resolution: '24 hours', example: 'Report not generating' },
  { severity: 'Low', definition: 'Minor issue, cosmetic or enhancement', response: '24 hours', resolution: '5 days', example: 'UI alignment issue' }
];

const incidentDocumentation = [
  'Date and time issue was first observed',
  'Affected system/module/feature',
  'Number of users impacted',
  'Steps to reproduce the issue',
  'Error messages or codes displayed',
  'Screenshots or screen recordings',
  'Workaround attempted and result',
  'Business impact assessment',
  'Related recent changes or deployments'
];

export function EscalationProcedures() {
  return (
    <div className="space-y-6" data-manual-anchor="wf-troubleshooting-escalation">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <ArrowUp className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle>10.8 Escalation Procedures</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Support tier definitions, SLA expectations, and incident documentation requirements
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">All Roles</Badge>
            <Badge variant="outline">Est. 8 min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Support Tier Matrix */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Support Tier Matrix
            </h4>
            <div className="space-y-4">
              {supportTiers.map((tier, index) => (
                <div 
                  key={tier.tier} 
                  className={`border rounded-lg p-4 ${
                    index === 0 ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30' :
                    index === 1 ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30' :
                    index === 2 ? 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30' :
                    'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tier.tier}</Badge>
                      <h5 className="font-medium">{tier.name}</h5>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {tier.responseTime}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-xs text-muted-foreground uppercase mb-1">Channels</p>
                      <ul className="space-y-1">
                        {tier.channels.map((channel) => (
                          <li key={channel} className="text-muted-foreground">• {channel}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-xs text-muted-foreground uppercase mb-1">Resolves</p>
                      <ul className="space-y-1">
                        {tier.resolves.map((item) => (
                          <li key={item} className="text-muted-foreground">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-xs text-muted-foreground uppercase mb-1">Escalates To</p>
                      <p className="text-muted-foreground">{tier.escalatesTo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Expectations */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-purple-500" />
              SLA Expectations by Severity
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Severity</th>
                    <th className="text-left p-3 font-medium">Definition</th>
                    <th className="text-left p-3 font-medium">Response</th>
                    <th className="text-left p-3 font-medium">Resolution</th>
                    <th className="text-left p-3 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {slaExpectations.map((sla) => (
                    <tr key={sla.severity}>
                      <td className="p-3">
                        <Badge 
                          className={
                            sla.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                            sla.severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                            sla.severity === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                          }
                        >
                          {sla.severity}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{sla.definition}</td>
                      <td className="p-3 font-medium">{sla.response}</td>
                      <td className="p-3 font-medium">{sla.resolution}</td>
                      <td className="p-3 text-muted-foreground text-xs">{sla.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Escalation Workflow */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <ArrowUp className="h-5 w-5 text-amber-500" />
              Escalation Decision Tree
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">User reports issue</Badge>
                <span>→</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/50">Check KB / Help</Badge>
                <span>→</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">Resolved?</Badge>
              </div>
            </div>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800 mb-2">Yes</Badge>
                <p className="text-xs text-muted-foreground">Document & Close</p>
              </div>
              <div className="text-center">
                <Badge className="bg-amber-100 text-amber-800 mb-2">No</Badge>
                <p className="text-xs text-muted-foreground">Escalate to next tier</p>
              </div>
            </div>
          </div>

          {/* Incident Documentation */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-500" />
              Incident Documentation Requirements
            </h4>
            <div className="bg-muted/30 border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-4">
                When escalating an issue, include the following information to expedite resolution:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {incidentDocumentation.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information Template */}
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureCard
              variant="primary"
              icon={Phone}
              title="Emergency Contacts"
            >
              <div className="mt-2 space-y-2 text-sm">
                <p><strong>HR Help Desk:</strong> [Internal Extension]</p>
                <p><strong>IT Service Desk:</strong> [Internal Extension]</p>
                <p><strong>System Admin:</strong> [On-call Number]</p>
                <p className="text-xs text-muted-foreground mt-2">
                  * Update with your organization's actual contacts
                </p>
              </div>
            </FeatureCard>
            <FeatureCard
              variant="warning"
              icon={AlertTriangle}
              title="Critical Issue Protocol"
            >
              <div className="mt-2 space-y-2 text-sm">
                <p>1. Page on-call admin immediately</p>
                <p>2. Create incident ticket with "Critical" tag</p>
                <p>3. Notify HR Director and IT Manager</p>
                <p>4. Activate backup procedures if available</p>
              </div>
            </FeatureCard>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Maintain an "Escalation Contacts" document updated quarterly 
              with current personnel assignments. Include backup contacts for each role to ensure 
              coverage during absences. Store in a location accessible even during system outages.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            caption="Figure 10.8: Support Ticket Portal showing escalation status and SLA countdown"
          />

        </CardContent>
      </Card>
    </div>
  );
}
