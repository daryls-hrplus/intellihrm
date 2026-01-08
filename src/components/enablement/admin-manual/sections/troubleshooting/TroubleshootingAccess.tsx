import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Key, Shield, AlertTriangle, CheckCircle, UserX, Smartphone } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { TroubleshootingSection, TroubleshootingItem } from '@/components/enablement/manual/components/TroubleshootingSection';

const accessIssues: TroubleshootingItem[] = [
  {
    issue: "User cannot log in - 'Invalid credentials' error",
    cause: "Password may be incorrect, expired, or the account may be locked due to multiple failed attempts.",
    solution: "1) Verify the username/email is correct. 2) Check if the account is locked in Admin → Users. 3) Reset the password if needed. 4) Confirm the user's account status is Active."
  },
  {
    issue: "User logged in but sees blank dashboard",
    cause: "User may not have any roles assigned, or all assigned roles have no dashboard access permissions.",
    solution: "Navigate to Admin → Users → [User] → Roles. Ensure at least one role is assigned that grants dashboard access. Check role permissions include 'View Dashboard' capability."
  },
  {
    issue: "User gets 'Access Denied' for specific module",
    cause: "The user's role(s) don't include permission for that module, or a permission override is restricting access.",
    solution: "Review user's effective permissions in Admin → Users → [User] → Effective Permissions. Check both role-based and individual permission overrides. Grant necessary module access if appropriate."
  },
  {
    issue: "Manager cannot see their team members",
    cause: "The reporting relationship may not be configured, or the manager's role lacks 'View Direct Reports' permission.",
    solution: "Verify the reporting structure in Admin → Organization → Reporting Lines. Ensure each team member has this manager set as their supervisor. Check the manager's role has team visibility permissions."
  },
  {
    issue: "SSO login fails with 'Identity not found' error",
    cause: "The user's SSO identity hasn't been linked to their Intelli HRM account, or the email/identifier doesn't match.",
    solution: "Ensure the user exists in Intelli HRM with the exact email used in the SSO provider. Check Admin → Users → [User] → SSO Settings to verify the identity mapping."
  },
  {
    issue: "User's permissions don't update after role change",
    cause: "Permission cache may not have refreshed, or the role change hasn't been approved in the workflow.",
    solution: "First, verify the role change request is approved in Admin → Pending Approvals. If approved, ask the user to log out and back in, or wait up to 15 minutes for cache refresh."
  }
];

const mfaIssues: TroubleshootingItem[] = [
  {
    issue: "User lost access to their MFA device",
    cause: "Phone lost, stolen, or authenticator app reinstalled without backup codes.",
    solution: "As an admin with MFA management permissions: 1) Go to Admin → Users → [User] → Security. 2) Click 'Reset MFA'. 3) The user will need to re-enroll MFA on next login. Document this action in the security log."
  },
  {
    issue: "MFA codes not working - always invalid",
    cause: "Time synchronization issue between user's device and server, or incorrect authenticator setup.",
    solution: "1) Ask user to verify their device time is set to automatic. 2) If using TOTP, ensure no more than 30 seconds have passed since code generation. 3) If issues persist, reset MFA and have user re-enroll."
  },
  {
    issue: "User cannot receive SMS MFA codes",
    cause: "Phone number may be incorrect, carrier may be blocking short codes, or SMS service may be experiencing delays.",
    solution: "Verify the phone number in the user's profile. If correct, try resending the code. Consider switching to authenticator app-based MFA which is more reliable."
  },
  {
    issue: "Backup codes not working",
    cause: "Backup codes may have already been used (each code is single-use) or were regenerated without user's knowledge.",
    solution: "Generate new backup codes for the user via Admin → Users → [User] → Security → Generate Backup Codes. Remind user that each code can only be used once."
  }
];

const ACCOUNT_LOCKOUT_CHECKLIST = [
  "Verify account status in Admin → Users (should show 'Locked')",
  "Check lockout reason in the Security Audit Log",
  "Review failed login attempts to identify if legitimate or suspicious",
  "If legitimate user, unlock the account and reset password",
  "If suspicious, keep locked and investigate further",
  "Document the unlock action with justification",
  "Consider notifying the user about the lockout and resolution"
];

export function TroubleshootingAccess() {
  return (
    <div className="space-y-8">
      <Card id="troubleshooting-8-2" data-manual-anchor="troubleshooting-8-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Lock className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle>8.2 Access & Authentication Issues</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Resolving login failures, permission problems, and MFA issues
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Login & Permission Issues */}
          <TroubleshootingSection 
            items={accessIssues}
            title="Login & Permission Issues"
          />

          <ScreenshotPlaceholder
            caption="Figure 8.2.1: User Security Settings panel showing account status and MFA configuration"
            alt="Admin interface showing user security settings with account status, MFA enrollment, and session management"
          />

          {/* MFA-Specific Issues */}
          <TroubleshootingSection 
            items={mfaIssues}
            title="Multi-Factor Authentication (MFA) Issues"
          />

          <ScreenshotPlaceholder
            caption="Figure 8.2.2: MFA Reset confirmation dialog with security audit logging"
            alt="Dialog confirming MFA reset with reason field and audit trail notification"
          />

          {/* Account Lockout Procedures */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <UserX className="h-4 w-4 text-destructive" />
              Account Lockout Resolution Procedure
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              {ACCOUNT_LOCKOUT_CHECKLIST.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Login Diagnostic Flowchart */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500" />
              Login Failure Diagnostic Flowchart
            </h4>
            <div className="border rounded-lg p-6 bg-muted/20">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">1</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Is the username/email correct?</p>
                    <p className="text-xs text-muted-foreground">Check for typos, verify against Admin → Users list</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600">Yes → Step 2</span> | <span className="text-amber-600">No → Correct and retry</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">2</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Is the account active?</p>
                    <p className="text-xs text-muted-foreground">Check account status in user management</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600">Yes → Step 3</span> | <span className="text-amber-600">No → Activate account</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">3</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Is the account locked?</p>
                    <p className="text-xs text-muted-foreground">Check for lockout status after failed attempts</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600">No → Step 4</span> | <span className="text-amber-600">Yes → Follow unlock procedure</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">4</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Is the password correct/not expired?</p>
                    <p className="text-xs text-muted-foreground">Check password expiry date, initiate reset if needed</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600">Yes → Step 5</span> | <span className="text-amber-600">No → Reset password</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">5</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Is MFA configured correctly?</p>
                    <p className="text-xs text-muted-foreground">Verify MFA enrollment and device access</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600">Yes → Escalate</span> | <span className="text-amber-600">No → Reset MFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.2.3: Security Audit Log showing login attempts and account actions"
            alt="Audit log interface displaying failed login attempts, successful logins, and admin actions"
          />

          {/* SSO Troubleshooting */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              SSO Troubleshooting Checklist
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Verify in Intelli HRM
                </h5>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• User account exists and is active</li>
                  <li>• Email matches SSO provider exactly</li>
                  <li>• SSO identity mapping is configured</li>
                  <li>• User's company has SSO enabled</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Verify in Identity Provider
                </h5>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• User is assigned to Intelli HRM application</li>
                  <li>• User's account is active in IdP</li>
                  <li>• Required attributes are being sent</li>
                  <li>• SAML assertion is properly signed</li>
                </ul>
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Always verify the identity of users requesting password resets or account unlocks through a secondary channel (phone call, in-person verification) before proceeding, especially for privileged accounts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
