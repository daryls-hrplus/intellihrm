import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, UserX, AlertTriangle, CheckCircle, FileWarning, Key } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { TroubleshootingSection, TroubleshootingItem } from '@/components/enablement/manual/components/TroubleshootingSection';

const accessIssues: TroubleshootingItem[] = [
  {
    issue: "User cannot access specific HR Hub module",
    cause: "Role-based permissions may not include the required module, or the user's company context restricts access.",
    solution: "Navigate to Admin → User Management → find the user → check assigned roles. Verify the role includes the required module permissions. Check if company-level restrictions apply."
  },
  {
    issue: "Manager cannot view their team's data",
    cause: "Manager relationship may not be configured correctly in the organization hierarchy, or the data scope is restricted.",
    solution: "Verify the reporting relationship in Workforce → Organization Chart. Ensure the manager has the 'View Direct Reports' permission. Check if team data visibility is enabled for their role."
  },
  {
    issue: "SSO login redirecting to error page",
    cause: "SSO configuration mismatch, expired SAML certificate, or the user's email domain isn't mapped to the SSO provider.",
    solution: "Check SSO configuration in Admin → Authentication → SSO Settings. Verify the SAML certificate hasn't expired. Ensure the user's email domain is correctly mapped to the IdP."
  },
  {
    issue: "User locked out after failed login attempts",
    cause: "Security policy enforcing account lockout after consecutive failed attempts.",
    solution: "Navigate to Admin → User Management → find the user → Unlock Account. If pattern persists, verify the user has the correct password or reset credentials."
  },
  {
    issue: "Two-factor authentication not working",
    cause: "Time sync issues on the authenticator app, backup codes exhausted, or the 2FA enrollment was corrupted.",
    solution: "Verify the device time is synchronized. If backup codes are used, they're one-time use. Admin can reset 2FA enrollment from User Management → Security Settings."
  }
];

const dataSecurityIssues: TroubleshootingItem[] = [
  {
    issue: "Sensitive data visible to unauthorized users",
    cause: "Field-level security may not be configured, or a role was granted broader permissions than intended.",
    solution: "Immediately restrict access by modifying the role permissions. Audit who accessed the data via Audit Logs. Review and tighten field-level security for sensitive fields."
  },
  {
    issue: "PII data appearing in exports/reports",
    cause: "Export template includes PII fields, or the user has unrestricted export permissions.",
    solution: "Review export templates to exclude PII. Configure role-based export restrictions in Admin → Data Export Settings. Enable PII masking for non-essential use cases."
  },
  {
    issue: "Audit trail showing gaps in record history",
    cause: "Audit logging may have been temporarily disabled, or logs were archived/purged according to retention policy.",
    solution: "Check the audit log retention settings. If gaps exist during a specific period, review system maintenance logs. Ensure audit logging is enabled for all sensitive operations."
  },
  {
    issue: "Data appearing across company boundaries",
    cause: "Multi-tenant data isolation rules may be misconfigured, or a super admin view is inadvertently enabled.",
    solution: "Immediately verify the user's company context. Review multi-tenant isolation settings in Admin → Security → Data Isolation. Audit cross-company data access logs."
  }
];

const SECURITY_CHECKLIST = [
  {
    category: "Access Control",
    items: [
      { check: "Review and audit user roles quarterly", priority: "High" },
      { check: "Remove access for terminated employees same-day", priority: "Critical" },
      { check: "Enforce principle of least privilege for all roles", priority: "High" },
      { check: "Audit shared/service accounts monthly", priority: "Medium" },
      { check: "Review manager relationships for data visibility", priority: "Medium" }
    ]
  },
  {
    category: "Data Protection",
    items: [
      { check: "Enable field-level encryption for PII", priority: "Critical" },
      { check: "Configure PII masking in exports and reports", priority: "High" },
      { check: "Review data export permissions quarterly", priority: "High" },
      { check: "Ensure GDPR/privacy compliance for data handling", priority: "Critical" },
      { check: "Test data isolation in multi-tenant scenarios", priority: "High" }
    ]
  },
  {
    category: "Authentication",
    items: [
      { check: "Enforce MFA for all admin accounts", priority: "Critical" },
      { check: "Review SSO configurations semi-annually", priority: "Medium" },
      { check: "Test account lockout policies", priority: "Medium" },
      { check: "Rotate service account credentials annually", priority: "High" },
      { check: "Monitor failed login attempts daily", priority: "High" }
    ]
  },
  {
    category: "Audit & Compliance",
    items: [
      { check: "Review audit logs weekly for anomalies", priority: "High" },
      { check: "Ensure audit log retention meets compliance requirements", priority: "Critical" },
      { check: "Document security incident response procedures", priority: "High" },
      { check: "Conduct annual security awareness training", priority: "Medium" },
      { check: "Perform penetration testing annually", priority: "High" }
    ]
  }
];

const INCIDENT_RESPONSE_STEPS = [
  { step: 1, title: "Identify & Contain", description: "Immediately isolate affected accounts/systems. Disable compromised credentials.", icon: AlertTriangle },
  { step: 2, title: "Assess Impact", description: "Determine what data was accessed, by whom, and for how long.", icon: Eye },
  { step: 3, title: "Document", description: "Record all findings, timestamps, and actions taken in the incident log.", icon: FileWarning },
  { step: 4, title: "Remediate", description: "Fix the vulnerability, reset credentials, update permissions as needed.", icon: Key },
  { step: 5, title: "Notify", description: "Inform stakeholders, compliance, and affected parties per policy.", icon: UserX },
  { step: 6, title: "Review", description: "Conduct post-incident review. Update policies to prevent recurrence.", icon: CheckCircle }
];

export function TroubleshootingSecurity() {
  return (
    <div className="space-y-8">
      <Card id="hh-sec-8-3" data-manual-anchor="hh-sec-8-3">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>8.3 Security Considerations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Data access controls, audit procedures, PII handling, and security incident response
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">HR Admin</Badge>
            <Badge variant="outline">IT Security</Badge>
            <Badge variant="outline">Compliance</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Access Issues */}
          <div id="hh-sec-8-3-access" data-manual-anchor="hh-sec-8-3-access">
            <TroubleshootingSection 
              items={accessIssues}
              title="Access & Authentication Issues"
            />
          </div>

          {/* Data Security Issues */}
          <div id="hh-sec-8-3-data" data-manual-anchor="hh-sec-8-3-data">
            <TroubleshootingSection 
              items={dataSecurityIssues}
              title="Data Security Issues"
            />
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.3.1: Security Audit Dashboard showing access patterns and anomalies"
            alt="Dashboard displaying login patterns, failed attempts, and security alerts"
          />

          {/* Security Checklist */}
          <div id="hh-sec-8-3-checklist" data-manual-anchor="hh-sec-8-3-checklist">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Security Best Practices Checklist
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {SECURITY_CHECKLIST.map((category) => (
                <div key={category.category} className="border rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-3">{category.category}</h5>
                  <ul className="space-y-2">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs flex-shrink-0 ${
                            item.priority === 'Critical' ? 'border-destructive text-destructive' :
                            item.priority === 'High' ? 'border-amber-500 text-amber-600' :
                            'border-muted-foreground'
                          }`}
                        >
                          {item.priority}
                        </Badge>
                        <span className="text-muted-foreground">{item.check}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Response */}
          <div id="hh-sec-8-3-incident" data-manual-anchor="hh-sec-8-3-incident">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Security Incident Response Procedure
            </h4>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="grid md:grid-cols-3 gap-4">
                {INCIDENT_RESPONSE_STEPS.map((step) => (
                  <div key={step.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-destructive">{step.step}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-1">
                        <step.icon className="h-3 w-3" />
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.3.2: User Permission Audit showing role assignments and access levels"
            alt="Detailed permission audit interface displaying user roles and data access rights"
          />

          {/* GDPR/Compliance Considerations */}
          <div id="hh-sec-8-3-compliance" data-manual-anchor="hh-sec-8-3-compliance">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              Data Protection & Compliance
            </h4>
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Data Subject Rights</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Right to access personal data</li>
                    <li>• Right to rectification of inaccurate data</li>
                    <li>• Right to erasure ("right to be forgotten")</li>
                    <li>• Right to data portability</li>
                    <li>• Right to object to processing</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">HR Hub Compliance Features</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Data export functionality for access requests</li>
                    <li>• Audit trail for all data modifications</li>
                    <li>• Configurable data retention policies</li>
                    <li>• PII masking and encryption options</li>
                    <li>• Consent tracking for data processing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Critical:</strong> Any suspected security breach or unauthorized data access must be reported immediately to IT Security and documented in the incident management system within 1 hour of discovery.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
