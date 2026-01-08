import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Database, AlertTriangle, CheckCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { TroubleshootingSection } from '@/components/enablement/manual/components/TroubleshootingSection';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';

const employeeDataIssues = [
  {
    issue: 'Duplicate employee records found in the system',
    cause: 'Multiple data sources creating records (e.g., recruitment and manual entry), or failed merge operation.',
    solution: 'Use the Duplicate Detection tool (Employees → Utilities → Find Duplicates). Review matches by name, ID, and email. Select the primary record and merge, which preserves history from both records.'
  },
  {
    issue: 'Employee missing from organization chart',
    cause: 'Employee has no active position assignment, or their primary position manager link is broken.',
    solution: 'Check the employee\'s Position Assignments tab. Ensure they have at least one assignment with "Primary" flag set. Verify the position has a valid reporting-to position defined.'
  },
  {
    issue: 'Position assignment not saving when submitted',
    cause: 'Required fields missing (effective date, FTE), or the position is already at capacity.',
    solution: 'Check all required fields are populated. Verify the position has available headcount. If at capacity, either increase position headcount or remove an existing assignment first.'
  },
  {
    issue: 'Employee data not syncing to Payroll module',
    cause: 'Integration sync job failed, employee is missing payroll-required fields, or sync is paused.',
    solution: 'Check Integration Hub → Payroll Sync status. Review the sync error log for specific field issues. Ensure employee has required data: bank details, tax info, and active contract.'
  },
  {
    issue: 'FTE allocation totals exceed or fall below 100%',
    cause: 'Multiple position assignments with incorrect FTE percentages, or rounding errors in calculations.',
    solution: 'Open the employee\'s Position Assignments tab and review all active assignments. Adjust FTE values to total exactly 100%. The system will warn if totals are invalid on save.'
  },
  {
    issue: 'Historical transactions not appearing in employee timeline',
    cause: 'Transactions exist but effective dates are in the future, or audit trail filter is hiding older records.',
    solution: 'Adjust the timeline date filter to show "All History". Check if transactions are pending approval (not yet effective). Pending items appear in a separate queue.'
  },
  {
    issue: 'Employee photo not displaying correctly',
    cause: 'Image file too large (>5MB), unsupported format, or storage quota exceeded.',
    solution: 'Upload images in JPG or PNG format under 5MB. Recommended size: 400x400 pixels. Check storage quota in Settings → Storage → Usage to ensure space is available.'
  },
  {
    issue: 'Contact information showing old address after update',
    cause: 'Browser cache showing stale data, or address update is pending approval workflow.',
    solution: 'Refresh the browser and check again. If still old, navigate to the employee\'s pending transactions to see if an address change is awaiting approval.'
  }
];

export function EmployeeDataProblems() {
  return (
    <div className="space-y-6" data-manual-anchor="wf-troubleshooting-data">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>10.2 Employee Data Problems</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Resolving duplicate records, missing assignments, and data synchronization failures
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">HR Ops</Badge>
            <Badge variant="outline">Est. 12 min</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <TroubleshootingSection 
            items={employeeDataIssues}
            title="Employee Data Troubleshooting Guide"
          />

          {/* Data Quality Checklist */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Data Quality Validation Checklist
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-sm mb-2">Required Employee Fields</h5>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>☑️ Legal first and last name</li>
                  <li>☑️ Date of birth</li>
                  <li>☑️ Primary email address</li>
                  <li>☑️ National ID / Tax ID</li>
                  <li>☑️ Employment start date</li>
                  <li>☑️ At least one position assignment</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm mb-2">Position Assignment Requirements</h5>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>☑️ Effective start date</li>
                  <li>☑️ Valid position link</li>
                  <li>☑️ FTE percentage (1-100%)</li>
                  <li>☑️ Primary flag set for one assignment</li>
                  <li>☑️ Reporting manager defined on position</li>
                  <li>☑️ Total FTE across assignments = 100%</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Duplicate Detection Guide */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-blue-500" />
              Duplicate Detection & Merge Process
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <FeatureCard
                variant="primary"
                title="Step 1: Detect"
                description="Run Duplicate Detection tool matching on name, email, and national ID. Review confidence scores (>80% = likely duplicate)."
              />
              <FeatureCard
                variant="info"
                title="Step 2: Compare"
                description="Open side-by-side comparison. Identify which record has more complete data and transaction history."
              />
              <FeatureCard
                variant="success"
                title="Step 3: Merge"
                description="Select primary record. System merges all history, documents, and relationships. Original records become read-only."
              />
            </div>
          </div>

          {/* Data Sync Status */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              Integration Sync Status Reference
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Meaning</th>
                    <th className="text-left p-3 font-medium">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3">
                      <Badge className="bg-green-100 text-green-800">Synced</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">Data successfully transmitted to target system</td>
                    <td className="p-3">None - record is current</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">Queued for next sync cycle (runs every 15 min)</td>
                    <td className="p-3">Wait for next cycle or trigger manual sync</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <Badge className="bg-red-100 text-red-800">Failed</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">Sync attempted but rejected by target system</td>
                    <td className="p-3">Review error log, fix data issue, retry</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <Badge className="bg-gray-100 text-gray-800">Excluded</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">Record type not configured for sync</td>
                    <td className="p-3">Update integration mapping if sync is needed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Enable the weekly Data Quality Report (Settings → Reports → Scheduled) 
              to automatically detect records missing required fields, broken relationships, or sync failures 
              before they impact operations.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            caption="Figure 10.2: Data Quality Dashboard showing record completeness and sync status"
          />

        </CardContent>
      </Card>
    </div>
  );
}
