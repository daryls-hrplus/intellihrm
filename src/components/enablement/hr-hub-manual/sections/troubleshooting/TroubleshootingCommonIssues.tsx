import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpCircle, AlertTriangle, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { TroubleshootingSection, TroubleshootingItem } from '@/components/enablement/manual/components/TroubleshootingSection';

const helpDeskIssues: TroubleshootingItem[] = [
  {
    issue: "Help desk tickets not appearing in queue",
    cause: "Ticket may be assigned to a different agent, filtered by status, or the user doesn't have permission to view all tickets.",
    solution: "Check the status filter (ensure 'All' or relevant statuses are selected). Verify queue assignment settings in Settings → Help Desk. Confirm the user has the 'View All Tickets' permission."
  },
  {
    issue: "SLA timer showing incorrect countdown",
    cause: "Business hours may not be configured correctly, or the SLA policy effective date doesn't cover the ticket creation date.",
    solution: "Navigate to Settings → SLA Policies and verify business hours, holidays, and timezone configuration. Check that the SLA policy is active and the effective date covers current tickets."
  },
  {
    issue: "Canned responses not populating correctly",
    cause: "Variable placeholders in the canned response may not match available data fields, or the response is marked inactive.",
    solution: "Edit the canned response in Settings → Canned Responses. Verify all {{placeholder}} variables are correctly named. Check the response is marked as Active."
  },
  {
    issue: "Ticket assignments not triggering notifications",
    cause: "Notification rules may be disabled, or the assigned user's email preferences are blocking notifications.",
    solution: "Check Settings → Notifications → Help Desk Events to ensure assignment notifications are enabled. Verify the user's email notification preferences in their profile settings."
  }
];

const knowledgeBaseIssues: TroubleshootingItem[] = [
  {
    issue: "Knowledge base articles not appearing in search",
    cause: "Articles may be in draft status, restricted to specific roles, or the search index hasn't been updated.",
    solution: "Verify the article status is 'Published'. Check role-based access restrictions. If recently published, wait 5-10 minutes for search index to update or manually trigger a reindex from Settings."
  },
  {
    issue: "Article categories showing incorrect hierarchy",
    cause: "Parent-child category relationships may have been misconfigured or circular references exist.",
    solution: "Navigate to Knowledge Base → Categories. Review the parent category assignments for each category. Use the 'Flatten View' to identify circular references."
  },
  {
    issue: "Images not loading in articles",
    cause: "Images may have been uploaded to a storage bucket without public access, or the CDN cache is stale.",
    solution: "Check that images were uploaded through the article editor (not directly to storage). If using external URLs, ensure they're HTTPS and publicly accessible. Clear browser cache."
  }
];

const sopIssues: TroubleshootingItem[] = [
  {
    issue: "SOP document versions not displaying correctly",
    cause: "Multiple versions may exist with overlapping effective dates, or version history was corrupted during migration.",
    solution: "Go to SOP Management → select the document → Version History. Ensure only one version is 'Current'. Archive old versions that shouldn't be active."
  },
  {
    issue: "AI-generated SOP content is incomplete",
    cause: "The input context provided was insufficient, or the AI model encountered a timeout for long documents.",
    solution: "Retry with more detailed input context. For complex SOPs, generate in sections rather than all at once. Check AI usage limits haven't been exceeded."
  },
  {
    issue: "SOP acknowledgment tracking not updating",
    cause: "The acknowledgment workflow may have stalled, or the user's acknowledgment didn't save properly due to network issues.",
    solution: "Check the Acknowledgments tab for the specific SOP. If a user's acknowledgment is missing, they can re-acknowledge. Review workflow status in Compliance → Acknowledgment Tracking."
  }
];

const workflowIssues: TroubleshootingItem[] = [
  {
    issue: "Workflow stuck in pending state",
    cause: "Approver may be inactive/terminated, delegation rules aren't configured for absences, or escalation timeout hasn't triggered.",
    solution: "Check the approver's employment status. If inactive, manually reassign or use Admin → Workflow Override. Configure delegation rules for future absences."
  },
  {
    issue: "Approval notifications not reaching approvers",
    cause: "Email delivery issues, incorrect notification preferences, or the approver's email is bouncing.",
    solution: "Verify the approver's email in their profile. Check Settings → Notification Logs for delivery failures. Test with a manual notification from Admin → System Health."
  },
  {
    issue: "Parallel approvals completing in wrong order",
    cause: "Race conditions in approval completion, or the workflow template has incorrect step configuration.",
    solution: "Review the workflow template design. For order-dependent approvals, use sequential steps instead of parallel. Check the workflow execution log for timing details."
  },
  {
    issue: "ESS approval policy not applying to requests",
    cause: "Policy may not be active, effective dates don't cover the request date, or the request type isn't mapped to the policy.",
    solution: "Navigate to ESS Approval Policies. Verify the policy is Active with current effective dates. Check that the transaction type is included in the policy scope."
  }
];

const DIAGNOSTIC_STEPS = [
  {
    step: 1,
    title: "Identify the Module",
    description: "Determine which HR Hub component is affected: Help Desk, Knowledge Base, SOPs, Workflows, or Communications."
  },
  {
    step: 2,
    title: "Check User Context",
    description: "Verify the user's company, role, and permissions. Many issues are context-specific."
  },
  {
    step: 3,
    title: "Review Recent Changes",
    description: "Check the audit trail for any recent configuration changes that coincide with the issue."
  },
  {
    step: 4,
    title: "Reproduce the Issue",
    description: "Attempt to reproduce the issue with the same user context and steps to confirm the problem."
  },
  {
    step: 5,
    title: "Check System Health",
    description: "Review System Health dashboard for any active incidents, degraded services, or scheduled maintenance."
  },
  {
    step: 6,
    title: "Escalate if Needed",
    description: "If unresolved after basic troubleshooting, escalate with full reproduction steps and audit trail data."
  }
];

export function TroubleshootingCommonIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <Card id="hh-sec-8-1" data-manual-anchor="hh-sec-8-1">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <HelpCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>8.1 Common Issues & Solutions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Frequently encountered problems across HR Hub modules and step-by-step resolution guidance
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">HR Admin</Badge>
            <Badge variant="outline">Support</Badge>
            <Badge variant="outline">IT</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Diagnostic Steps */}
          <div id="hh-sec-8-1-diagnostic" data-manual-anchor="hh-sec-8-1-diagnostic">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              General Diagnostic Checklist
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              {DIAGNOSTIC_STEPS.map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium">{item.step}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Desk Issues */}
          <div id="hh-sec-8-1-helpdesk" data-manual-anchor="hh-sec-8-1-helpdesk">
            <TroubleshootingSection 
              items={helpDeskIssues}
              title="Help Desk Issues"
            />
          </div>

          {/* Knowledge Base Issues */}
          <div id="hh-sec-8-1-kb" data-manual-anchor="hh-sec-8-1-kb">
            <TroubleshootingSection 
              items={knowledgeBaseIssues}
              title="Knowledge Base Issues"
            />
          </div>

          {/* SOP Issues */}
          <div id="hh-sec-8-1-sop" data-manual-anchor="hh-sec-8-1-sop">
            <TroubleshootingSection 
              items={sopIssues}
              title="SOP Management Issues"
            />
          </div>

          {/* Workflow Issues */}
          <div id="hh-sec-8-1-workflow" data-manual-anchor="hh-sec-8-1-workflow">
            <TroubleshootingSection 
              items={workflowIssues}
              title="Workflow & Approval Issues"
            />
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.1.1: System Health Dashboard showing active incidents and service status"
            alt="System health interface displaying service status, active incidents, and scheduled maintenance"
          />

          {/* Resolution Flow */}
          <div>
            <h4 className="font-medium mb-4">Issue Resolution Workflow</h4>
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <div className="bg-background border rounded-lg p-3 text-center min-w-[100px]">
                  <p className="text-sm font-medium">Issue Reported</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-background border rounded-lg p-3 text-center min-w-[100px]">
                  <p className="text-sm font-medium">Categorize</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-background border rounded-lg p-3 text-center min-w-[100px]">
                  <p className="text-sm font-medium">Diagnose</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-background border rounded-lg p-3 text-center min-w-[100px]">
                  <p className="text-sm font-medium">Apply Fix</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center min-w-[100px]">
                  <p className="text-sm font-medium text-green-700">Verify & Close</p>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Document common issues and solutions in your Knowledge Base. This creates a self-service resource for users and reduces repetitive support tickets.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
