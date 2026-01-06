import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Settings, Lock, Gauge, Shield } from 'lucide-react';
import { TroubleshootingConfiguration, TroubleshootingAccess, TroubleshootingPerformance, TroubleshootingIncidents } from './sections/troubleshooting';

export function AdminManualTroubleshootingSection() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <Card id="admin-part-8" data-manual-anchor="admin-part-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">Part 8: Troubleshooting & FAQs</CardTitle>
              <p className="text-muted-foreground mt-1">
                Common issues, diagnostic procedures, and incident response protocols for administrators
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">All Admins</Badge>
            <Badge variant="outline">Security Team</Badge>
            <Badge variant="outline">IT Support</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="border rounded-lg p-4 text-center">
              <Settings className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Configuration Issues</h4>
              <p className="text-xs text-muted-foreground mt-1">Hierarchy, lookups, custom fields</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <Lock className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Access & Authentication</h4>
              <p className="text-xs text-muted-foreground mt-1">Login, MFA, permissions</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <Gauge className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Performance</h4>
              <p className="text-xs text-muted-foreground mt-1">Slow queries, timeouts, optimization</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <Shield className="h-8 w-8 text-destructive mx-auto mb-2" />
              <h4 className="font-medium text-sm">Incident Response</h4>
              <p className="text-xs text-muted-foreground mt-1">Security incidents, breaches</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8.1 Configuration Issues */}
      <Card id="admin-section-8-1" data-manual-anchor="admin-section-8-1">
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
        <CardContent>
          <TroubleshootingConfiguration />
        </CardContent>
      </Card>

      {/* 8.2 Access & Authentication Issues */}
      <Card id="admin-section-8-2" data-manual-anchor="admin-section-8-2">
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
        <CardContent>
          <TroubleshootingAccess />
        </CardContent>
      </Card>

      {/* 8.3 Performance Optimization */}
      <Card id="admin-section-8-3" data-manual-anchor="admin-section-8-3">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Gauge className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>8.3 Performance Optimization</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Diagnosing and resolving slow performance and timeout issues
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TroubleshootingPerformance />
        </CardContent>
      </Card>

      {/* 8.4 Security Incident Response */}
      <Card id="admin-section-8-4" data-manual-anchor="admin-section-8-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>8.4 Security Incident Response</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Procedures for handling security incidents, breaches, and emergency access
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TroubleshootingIncidents />
        </CardContent>
      </Card>
    </div>
  );
}
