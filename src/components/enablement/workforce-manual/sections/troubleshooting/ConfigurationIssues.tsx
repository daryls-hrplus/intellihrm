import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, AlertTriangle, CheckCircle, Lightbulb, XCircle } from 'lucide-react';
import { TroubleshootingSection } from '@/components/enablement/manual/components/TroubleshootingSection';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const configurationIssues = [
  {
    issue: 'Organization hierarchy not displaying correctly',
    cause: 'Circular reference in parent-child department relationships or missing root department.',
    solution: 'Run the Validate Hierarchy tool from Settings → Organization → Diagnostics. It will identify circular references and orphaned departments. Fix by reassigning parent departments to break the loop.'
  },
  {
    issue: 'Positions not appearing in department dropdowns',
    cause: 'Position status is set to Inactive, or position is assigned to a different department than expected.',
    solution: 'Navigate to Position Management, filter by "All Statuses", locate the position and verify its status and department assignment. Activate if needed and reassign to correct department.'
  },
  {
    issue: 'Job-to-position mapping errors showing in reports',
    cause: 'Job code was changed after positions were created, or position was created without linking to a valid job.',
    solution: 'Use the Job Architecture → Integrity Check to identify unmapped positions. Bulk update positions to link to correct job codes, or create missing job definitions first.'
  },
  {
    issue: 'Department cost center link appears broken',
    cause: 'Cost center was deactivated in Finance module, or the mapping table has stale data.',
    solution: 'Verify cost center status in Finance → Cost Centers. If active, refresh the mapping by editing the department and re-selecting the cost center. Save to rebuild the link.'
  },
  {
    issue: 'Custom fields not showing on employee forms',
    cause: 'Custom field visibility rules exclude current user role, or field was created but not added to form layout.',
    solution: 'Check Settings → Custom Fields → [Field Name] → Visibility. Ensure your role is included. Then verify the field is added to the appropriate form layout in Form Designer.'
  },
  {
    issue: 'Lookup values missing from selection lists',
    cause: 'Lookup value is inactive, has expired validity dates, or is restricted to specific countries/entities.',
    solution: 'Go to Settings → Lookups → [Lookup Type]. Show all values including inactive. Check the value\'s status, validity period, and country restrictions. Update as needed.'
  },
  {
    issue: 'Branch location geofence not triggering correctly',
    cause: 'GPS coordinates entered with wrong format (lat/long reversed) or radius set too small.',
    solution: 'Edit the branch location and verify coordinates are in decimal degrees format (lat, long). Test with Google Maps. Adjust geofence radius to account for GPS accuracy variance (recommend 50m minimum).'
  },
  {
    issue: 'Employee type dropdown showing outdated values',
    cause: 'Cache issue after lookup values were updated, or browser holding stale data.',
    solution: 'Clear browser cache and refresh the page. If issue persists, navigate to Settings → System → Clear Cache to force a system-wide refresh of lookup values.'
  }
];

export function ConfigurationIssues() {
  return (
    <div className="space-y-6" data-manual-anchor="wf-troubleshooting-config">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Settings className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>10.1 Common Configuration Issues</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Troubleshooting organization hierarchy, position assignments, and data synchronization problems
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">HR Admin</Badge>
            <Badge variant="outline">Est. 15 min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <TroubleshootingSection 
            items={configurationIssues}
            title="Configuration Troubleshooting Guide"
          />

          {/* Diagnostic Checklist */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Configuration Diagnostic Checklist
            </h4>
            <div className="space-y-3">
              {[
                'Verify organization hierarchy has a single root department with no circular references',
                'Confirm all active positions are linked to valid, active job codes',
                'Check that all departments have valid cost center assignments',
                'Validate that lookup values used in employee records are still active',
                'Ensure custom field visibility settings match intended user roles',
                'Test form layouts in preview mode for all user role types',
                'Verify branch locations have valid GPS coordinates and reasonable geofence radius',
                'Check system cache was cleared after recent configuration changes'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes Table */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <XCircle className="h-5 w-5 text-destructive" />
              Common Mistakes & Prevention
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Mistake</th>
                    <th className="text-left p-3 font-medium">Impact</th>
                    <th className="text-left p-3 font-medium">Prevention</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3">Creating departments before defining hierarchy</td>
                    <td className="p-3 text-muted-foreground">Orphaned departments, broken reporting lines</td>
                    <td className="p-3">Always create parent departments first, top-down</td>
                  </tr>
                  <tr>
                    <td className="p-3">Deleting job codes with active positions</td>
                    <td className="p-3 text-muted-foreground">Position errors, broken compensation links</td>
                    <td className="p-3">Deactivate jobs instead; migrate positions first</td>
                  </tr>
                  <tr>
                    <td className="p-3">Changing lookup codes after data entry</td>
                    <td className="p-3 text-muted-foreground">Historical data becomes unreadable</td>
                    <td className="p-3">Never change codes; create new values instead</td>
                  </tr>
                  <tr>
                    <td className="p-3">Setting overlapping validity periods</td>
                    <td className="p-3 text-muted-foreground">Duplicate values appear in dropdowns</td>
                    <td className="p-3">End-date old value before activating new one</td>
                  </tr>
                  <tr>
                    <td className="p-3">Skipping form layout testing</td>
                    <td className="p-3 text-muted-foreground">Users cannot complete required forms</td>
                    <td className="p-3">Test as each role before publishing changes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Schedule monthly configuration audits using the built-in 
              Integrity Check report (Settings → System → Scheduled Reports). This proactively 
              identifies issues before they impact users.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            caption="Figure 10.1: Configuration Audit Trail showing recent changes and validation status"
          />

        </CardContent>
      </Card>
    </div>
  );
}
