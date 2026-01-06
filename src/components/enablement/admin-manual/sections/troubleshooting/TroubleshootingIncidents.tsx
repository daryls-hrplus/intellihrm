import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Phone, FileText, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const INCIDENT_SEVERITY_LEVELS = [
  {
    level: "Critical (P1)",
    description: "Complete system unavailability, data breach confirmed, or security vulnerability actively exploited",
    responseTime: "Immediate (< 15 min)",
    escalation: "CISO, IT Director, Executive Team",
    color: "destructive"
  },
  {
    level: "High (P2)",
    description: "Major functionality impaired, suspected security incident, or compliance deadline at risk",
    responseTime: "< 1 hour",
    escalation: "Security Team Lead, IT Manager",
    color: "orange"
  },
  {
    level: "Medium (P3)",
    description: "Feature degradation, potential vulnerability identified, or access control anomaly",
    responseTime: "< 4 hours",
    escalation: "Security Analyst, System Admin",
    color: "amber"
  },
  {
    level: "Low (P4)",
    description: "Minor issues, informational security events, or enhancement requests",
    responseTime: "< 24 hours",
    escalation: "Support Team",
    color: "blue"
  }
];

const INCIDENT_RESPONSE_PHASES = [
  {
    phase: "1. Detection & Identification",
    actions: [
      "Acknowledge the alert or report within defined SLA",
      "Gather initial information: Who, What, When, Where",
      "Classify severity level based on impact assessment",
      "Document initial findings in incident ticket"
    ]
  },
  {
    phase: "2. Containment",
    actions: [
      "Isolate affected systems or accounts if needed",
      "Disable compromised credentials immediately",
      "Preserve evidence (logs, screenshots, exports)",
      "Communicate status to stakeholders"
    ]
  },
  {
    phase: "3. Eradication",
    actions: [
      "Identify root cause of the incident",
      "Remove malicious access or fix vulnerability",
      "Verify no residual threats remain",
      "Update security controls if needed"
    ]
  },
  {
    phase: "4. Recovery",
    actions: [
      "Restore affected systems or data from backups",
      "Re-enable accounts with fresh credentials",
      "Verify normal operations resumed",
      "Monitor closely for recurrence"
    ]
  },
  {
    phase: "5. Post-Incident Review",
    actions: [
      "Conduct lessons learned session",
      "Document timeline and actions taken",
      "Identify process improvements",
      "Update runbooks and training materials"
    ]
  }
];

const ACCOUNT_COMPROMISE_CHECKLIST = [
  { step: "Immediately disable/suspend the compromised account", priority: "Critical" },
  { step: "Terminate all active sessions for the account", priority: "Critical" },
  { step: "Reset password and MFA credentials", priority: "Critical" },
  { step: "Review audit logs for unauthorized actions", priority: "High" },
  { step: "Identify scope: what data was accessed?", priority: "High" },
  { step: "Check for privilege escalation attempts", priority: "High" },
  { step: "Review any data exports or downloads", priority: "High" },
  { step: "Notify affected data subjects if required", priority: "Medium" },
  { step: "Document incident for compliance records", priority: "Medium" },
  { step: "Coordinate with user on secure account recovery", priority: "Medium" }
];

const GDPR_BREACH_TIMELINE = [
  { timeframe: "0-24 hours", tasks: "Confirm breach, assess scope, contain incident, begin documentation" },
  { timeframe: "24-48 hours", tasks: "Complete impact assessment, identify affected individuals, prepare notification" },
  { timeframe: "48-72 hours", tasks: "Submit supervisory authority notification, finalize affected party list" },
  { timeframe: "72+ hours", tasks: "Notify affected individuals, continue monitoring, post-incident review" }
];

export function TroubleshootingIncidents() {
  return (
    <div className="space-y-8">
      <Card id="troubleshooting-8-4" data-manual-anchor="troubleshooting-8-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>8.4 Security Incident Response</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Procedures for handling security incidents, breaches, and emergency access
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Severity Classification */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              Incident Severity Classification
            </h4>
            <div className="space-y-3">
              {INCIDENT_SEVERITY_LEVELS.map((level, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Badge 
                      variant={level.color === "destructive" ? "destructive" : "outline"}
                      className={
                        level.color === "orange" ? "bg-orange-500/10 text-orange-700 border-orange-500/30" :
                        level.color === "amber" ? "bg-amber-500/10 text-amber-700 border-amber-500/30" :
                        level.color === "blue" ? "bg-blue-500/10 text-blue-700 border-blue-500/30" : ""
                      }
                    >
                      {level.level}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span className="text-muted-foreground">Response: {level.responseTime}</span>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{level.description}</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Escalation:</strong> {level.escalation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.4.1: Security Incident Dashboard showing active and recent incidents"
            alt="Dashboard displaying active security incidents with severity levels, status, and assigned responders"
          />

          {/* Incident Response Phases */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Incident Response Procedure
            </h4>
            <div className="space-y-4">
              {INCIDENT_RESPONSE_PHASES.map((phase, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    {phase.phase}
                  </h5>
                  <ul className="text-sm space-y-2 text-muted-foreground ml-8">
                    {phase.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.4.2: Incident Timeline View showing response actions and timestamps"
            alt="Timeline visualization of incident response with actions, timestamps, and responsible parties"
          />

          {/* Account Compromise Checklist */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" />
              Account Compromise Response Checklist
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium w-12">#</th>
                    <th className="text-left p-3 font-medium">Action</th>
                    <th className="text-left p-3 font-medium w-24">Priority</th>
                    <th className="text-left p-3 font-medium w-24">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {ACCOUNT_COMPROMISE_CHECKLIST.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{item.step}</td>
                      <td className="p-3">
                        <Badge 
                          variant="outline"
                          className={
                            item.priority === "Critical" ? "bg-destructive/10 text-destructive border-destructive/30" :
                            item.priority === "High" ? "bg-amber-500/10 text-amber-700 border-amber-500/30" :
                            "bg-blue-500/10 text-blue-700 border-blue-500/30"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="w-5 h-5 border rounded flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GDPR Breach Notification Timeline */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              GDPR 72-Hour Breach Notification Workflow
            </h4>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Under GDPR Article 33, personal data breaches must be reported to the supervisory authority within 72 hours of becoming aware of the breach, unless unlikely to result in risk to individuals.
              </AlertDescription>
            </Alert>
            <div className="border rounded-lg p-4">
              <div className="space-y-4">
                {GDPR_BREACH_TIMELINE.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Badge variant="outline" className="mt-0.5 min-w-[100px] justify-center">
                      {item.timeframe}
                    </Badge>
                    <p className="text-sm">{item.tasks}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.4.3: Data Breach Notification Template in the system"
            alt="Breach notification form with required fields for supervisory authority submission"
          />

          {/* Emergency Access Protocol */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-red-500" />
              Emergency Access Protocol
            </h4>
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm mb-4">
                For critical situations requiring immediate elevated access (e.g., incident response, system recovery), 
                follow this emergency protocol:
              </p>
              <ol className="text-sm space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-destructive">1</span>
                  </span>
                  <span>Contact the on-call Security Admin via the emergency contact list</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-destructive">2</span>
                  </span>
                  <span>Provide incident ticket number and brief description of access needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-destructive">3</span>
                  </span>
                  <span>Security Admin grants time-limited elevated access (max 4 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-destructive">4</span>
                  </span>
                  <span>All actions during emergency access are fully audited</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-destructive">5</span>
                  </span>
                  <span>Post-incident review required within 24 hours of access revocation</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Post-Incident Review Template */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Post-Incident Review Template
            </h4>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Incident ID</p>
                  <p className="text-sm">INC-YYYY-XXXX</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Severity</p>
                  <p className="text-sm">[P1/P2/P3/P4]</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Detection Time</p>
                  <p className="text-sm">[Timestamp]</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Resolution Time</p>
                  <p className="text-sm">[Timestamp]</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Summary</p>
                <p className="text-sm text-muted-foreground italic">[Brief description of what happened]</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Root Cause</p>
                <p className="text-sm text-muted-foreground italic">[Identified root cause]</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Actions Taken</p>
                <p className="text-sm text-muted-foreground italic">[List of response actions]</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Preventive Measures</p>
                <p className="text-sm text-muted-foreground italic">[Changes to prevent recurrence]</p>
              </div>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.4.4: Post-Incident Review form with required documentation fields"
            alt="Incident review form showing timeline, root cause analysis, and preventive measures sections"
          />

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Remember:</strong> Document everything during incident response. Thorough documentation protects the organization, supports compliance requirements, and enables continuous improvement of security processes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
