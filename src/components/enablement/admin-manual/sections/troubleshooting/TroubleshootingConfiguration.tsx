import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { TroubleshootingSection, TroubleshootingItem } from '@/components/enablement/manual/components/TroubleshootingSection';

const configurationIssues: TroubleshootingItem[] = [
  {
    issue: "Organization hierarchy not displaying correctly",
    cause: "Parent-child relationships may be misconfigured, or circular references exist in the hierarchy structure.",
    solution: "Navigate to Admin → Organization Structure and verify each entity has the correct parent assignment. Use the 'Validate Hierarchy' tool to detect circular references. If found, break the cycle by reassigning one entity to the correct parent."
  },
  {
    issue: "Newly created departments not appearing in dropdowns",
    cause: "The department may be marked as inactive, or the cache hasn't refreshed since creation.",
    solution: "Check the department's Active status in Admin → Departments. If active, try refreshing the browser cache (Ctrl+Shift+R). If the issue persists, contact support to manually refresh the lookup cache."
  },
  {
    issue: "Custom fields not showing on employee forms",
    cause: "Custom fields may not be assigned to the correct form section, or the field visibility rules are restricting display.",
    solution: "Go to Admin → Custom Fields, locate the field, and verify: 1) It's assigned to the correct module/form, 2) Visibility conditions are correctly configured, 3) The field is marked as Active."
  },
  {
    issue: "Lookup values missing from selection lists",
    cause: "The lookup value may be inactive, expired, or restricted to specific countries/entities that don't match the current context.",
    solution: "Access Admin → Lookup Values, find the specific lookup, and check: 1) Active status, 2) Effective dates, 3) Country/entity restrictions. Adjust as needed to make the value available."
  },
  {
    issue: "Changes to organization structure not reflecting in reports",
    cause: "Reports may be using cached data or snapshot data from a previous period.",
    solution: "For real-time reports, ensure they're configured to use live data rather than snapshots. For historical reports, this is expected behavior—the report shows data as it was at the snapshot time."
  },
  {
    issue: "Currency conversion rates not applying correctly",
    cause: "Exchange rates may be outdated, or the effective date range doesn't cover the transaction date.",
    solution: "Navigate to Admin → Currencies → Exchange Rates. Verify rates exist for the required date range and that the correct base currency is configured. Update or add rates as needed."
  }
];

const COMMON_MISTAKES = [
  {
    mistake: "Creating duplicate entities instead of editing existing ones",
    impact: "Data fragmentation, reporting inconsistencies, confused users",
    prevention: "Always search for existing entities before creating new ones. Use the duplicate detection feature when available."
  },
  {
    mistake: "Deleting lookup values instead of deactivating them",
    impact: "Historical data loses context, audit trail gaps, potential data corruption",
    prevention: "Never delete lookup values. Always deactivate them to preserve historical references."
  },
  {
    mistake: "Setting incorrect effective dates for configuration changes",
    impact: "Configurations may not apply when expected, or may retroactively affect historical data",
    prevention: "Double-check effective dates before saving. Use the preview feature to see the impact of date changes."
  },
  {
    mistake: "Bypassing approval workflows for urgent changes",
    impact: "Compliance violations, audit findings, potential security breaches",
    prevention: "Use the emergency approval process if available. Document the urgency and get post-hoc approval immediately."
  },
  {
    mistake: "Not testing configuration changes in a sandbox first",
    impact: "Production disruptions, user confusion, data issues",
    prevention: "Always test significant changes in a sandbox environment before applying to production."
  }
];

export function TroubleshootingConfiguration() {
  return (
    <div className="space-y-8">
      <Card id="troubleshooting-8-1" data-manual-anchor="troubleshooting-8-1">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Settings className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>8.1 Configuration Issues</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Troubleshooting organization, hierarchy, and system configuration problems
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Common Configuration Issues */}
          <TroubleshootingSection 
            items={configurationIssues}
            title="Common Configuration Issues & Solutions"
          />

          {/* Diagnostic Steps */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Configuration Diagnostic Checklist
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Verify User Context</p>
                  <p className="text-sm text-muted-foreground">Confirm which company, entity, and location the user is operating in. Many issues are context-specific.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Check Effective Dates</p>
                  <p className="text-sm text-muted-foreground">Configuration may exist but not be effective yet or may have expired.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Review Inheritance Rules</p>
                  <p className="text-sm text-muted-foreground">Settings may be inherited from a parent entity. Check the full hierarchy chain.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium">4</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Examine Audit Trail</p>
                  <p className="text-sm text-muted-foreground">Check when the configuration was last modified and by whom to identify recent changes that may have caused the issue.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium">5</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Test with Different User</p>
                  <p className="text-sm text-muted-foreground">If possible, test the same scenario with a different user to isolate permission vs. configuration issues.</p>
                </div>
              </div>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.1.1: Configuration Audit Trail showing recent changes"
            alt="Audit trail interface displaying recent configuration modifications with timestamps and user details"
          />

          {/* Common Mistakes Table */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Common Configuration Mistakes to Avoid
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Mistake</th>
                    <th className="text-left p-3 font-medium">Impact</th>
                    <th className="text-left p-3 font-medium">Prevention</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMON_MISTAKES.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">
                        <span className="text-destructive">{item.mistake}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.impact}</td>
                      <td className="p-3">
                        <span className="text-green-600">{item.prevention}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ScreenshotPlaceholder
            caption="Figure 8.1.2: Hierarchy Validation Tool detecting configuration issues"
            alt="Validation tool interface showing detected hierarchy issues with suggested fixes"
          />

          {/* Resolution Flowchart */}
          <div>
            <h4 className="font-medium mb-4">Configuration Issue Resolution Flow</h4>
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="bg-background border rounded-lg p-3 text-center min-w-[140px]">
                  <p className="text-sm font-medium">Issue Reported</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-background border rounded-lg p-3 text-center min-w-[140px]">
                  <p className="text-sm font-medium">Gather Context</p>
                  <p className="text-xs text-muted-foreground">User, Entity, Time</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-background border rounded-lg p-3 text-center min-w-[140px]">
                  <p className="text-sm font-medium">Check Audit Trail</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-background border rounded-lg p-3 text-center min-w-[140px]">
                  <p className="text-sm font-medium">Identify Root Cause</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center min-w-[140px]">
                  <p className="text-sm font-medium text-green-700">Apply Fix</p>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Enable configuration change notifications for critical settings. This ensures you're immediately aware when someone modifies important system configurations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
