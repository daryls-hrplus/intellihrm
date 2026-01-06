import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function AIBudgetManagement() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        AI Budget Management allows you to control AI costs by creating budget tiers, assigning users to tiers,
        and monitoring usage patterns. This ensures predictable costs while enabling AI capabilities.
      </p>

      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertTitle>Cost Optimization</AlertTitle>
        <AlertDescription>
          Properly configured budget tiers can reduce AI costs by 40-60% while maintaining productivity gains.
          Start with conservative limits and adjust based on actual usage patterns.
        </AlertDescription>
      </Alert>

      <ScreenshotPlaceholder
        caption="Figure 6.3.1: AI Budget Management dashboard with tier overview"
        alt="Budget management page showing tier definitions, assignments, and usage graphs"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Budget Tier Structure</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tier</TableHead>
              <TableHead>Monthly Budget</TableHead>
              <TableHead>Daily Limit</TableHead>
              <TableHead>Typical Roles</TableHead>
              <TableHead>Features</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <Badge className="bg-gray-500">Basic</Badge>
              </TableCell>
              <TableCell>$10 / user</TableCell>
              <TableCell>20,000 tokens</TableCell>
              <TableCell>Employees</TableCell>
              <TableCell>Self-service queries</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge className="bg-blue-500">Standard</Badge>
              </TableCell>
              <TableCell>$25 / user</TableCell>
              <TableCell>50,000 tokens</TableCell>
              <TableCell>Managers</TableCell>
              <TableCell>Team analytics, recommendations</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge className="bg-purple-500">Premium</Badge>
              </TableCell>
              <TableCell>$75 / user</TableCell>
              <TableCell>150,000 tokens</TableCell>
              <TableCell>HR Partners</TableCell>
              <TableCell>Advanced analytics, bulk operations</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge className="bg-amber-500">Unlimited</Badge>
              </TableCell>
              <TableCell>Custom</TableCell>
              <TableCell>No limit</TableCell>
              <TableCell>Power users, Executives</TableCell>
              <TableCell>All features, priority processing</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          User Assignment
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Assignment Methods</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Role-based:</strong> Automatic by admin level</li>
              <li>• <strong>Department-based:</strong> By cost center</li>
              <li>• <strong>Individual:</strong> Custom override</li>
              <li>• <strong>Temporary:</strong> Project-based elevation</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Override Policies</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Super Admin can override any tier</li>
              <li>• Overrides require justification</li>
              <li>• Temporary overrides auto-expire</li>
              <li>• All changes are audited</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 6.3.2: User tier assignment interface"
        alt="User management screen showing tier assignments with bulk action options"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Usage Tracking
        </h4>
        <p className="text-sm text-muted-foreground">
          Monitor AI usage across the organization to optimize budgets and identify power users.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Alert Threshold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Token Usage</TableCell>
              <TableCell>Tokens consumed per user/department</TableCell>
              <TableCell>80% of limit</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Cost per Query</TableCell>
              <TableCell>Average cost per AI interaction</TableCell>
              <TableCell>&gt; $0.50 per query</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Active Users</TableCell>
              <TableCell>Users actively using AI features</TableCell>
              <TableCell>N/A</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Feature Usage</TableCell>
              <TableCell>Which AI features are most used</TableCell>
              <TableCell>N/A</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 6.3.3: AI usage analytics dashboard"
        alt="Analytics dashboard showing usage trends, cost breakdown, and user activity"
        aspectRatio="wide"
      />

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Budget Exceeded Behavior</AlertTitle>
        <AlertDescription>
          When users exceed their daily or monthly limits, AI features become read-only. Users can view previous 
          AI-generated content but cannot make new requests until the limit resets or an administrator increases their allocation.
        </AlertDescription>
      </Alert>
    </div>
  );
}
