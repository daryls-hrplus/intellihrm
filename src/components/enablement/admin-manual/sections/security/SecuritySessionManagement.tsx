import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Monitor, Shield, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function SecuritySessionManagement() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Session management controls how long users stay logged in and how concurrent sessions are handled.
        Proper configuration balances security requirements with user productivity.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Best Practice</AlertTitle>
        <AlertDescription>
          For systems containing sensitive HR data, industry standards recommend 15-30 minute idle timeouts
          with absolute session limits of 8-12 hours.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Session Timeout Settings</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setting</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Recommended</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Idle Timeout</TableCell>
              <TableCell>30 minutes</TableCell>
              <TableCell>15-30 minutes</TableCell>
              <TableCell>Time before inactive session expires</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Absolute Timeout</TableCell>
              <TableCell>8 hours</TableCell>
              <TableCell>8-12 hours</TableCell>
              <TableCell>Maximum session duration regardless of activity</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Warning Before Timeout</TableCell>
              <TableCell>5 minutes</TableCell>
              <TableCell>2-5 minutes</TableCell>
              <TableCell>Alert shown before session expires</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Remember Me Duration</TableCell>
              <TableCell>7 days</TableCell>
              <TableCell>7-30 days</TableCell>
              <TableCell>Persistent login on trusted devices</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 4.4.1: Session management and timeout configuration"
        alt="Session settings page showing idle timeout, absolute timeout, and concurrent session policy options"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Concurrent Session Policy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Session Limits
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Unlimited:</strong> No restrictions on concurrent sessions</li>
              <li>• <strong>Single Session:</strong> New login terminates existing sessions</li>
              <li>• <strong>Limited:</strong> Maximum 3-5 concurrent sessions</li>
              <li>• <strong>Device-Based:</strong> One session per device type</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Actions
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View active sessions</li>
              <li>• Terminate specific sessions</li>
              <li>• Terminate all sessions (force logout)</li>
              <li>• Session activity audit log</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Role-Based Timeout Configuration</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Category</TableHead>
              <TableHead>Idle Timeout</TableHead>
              <TableHead>Absolute Timeout</TableHead>
              <TableHead>Rationale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Super Admin</TableCell>
              <TableCell>15 minutes</TableCell>
              <TableCell>4 hours</TableCell>
              <TableCell>High-privilege access requires stricter controls</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">HR Admin</TableCell>
              <TableCell>30 minutes</TableCell>
              <TableCell>8 hours</TableCell>
              <TableCell>Balance security with daily operations</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Manager (MSS)</TableCell>
              <TableCell>30 minutes</TableCell>
              <TableCell>8 hours</TableCell>
              <TableCell>Standard business user</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Employee (ESS)</TableCell>
              <TableCell>60 minutes</TableCell>
              <TableCell>12 hours</TableCell>
              <TableCell>Limited data access, user convenience</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Forced Logout Capability</AlertTitle>
        <AlertDescription>
          Administrators can force logout all users in case of a security incident. This terminates all active
          sessions immediately and requires users to re-authenticate. Use this capability only when necessary.
        </AlertDescription>
      </Alert>
    </div>
  );
}
