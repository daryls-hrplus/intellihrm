import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Database, Shield, Zap } from 'lucide-react';

export function TimeAttendanceManualTroubleshootingSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-10-1" data-manual-anchor="ta-sec-10-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 10</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>55 min read</span>
          </div>
          <CardTitle className="text-2xl">Troubleshooting and Best Practices</CardTitle>
          <CardDescription>Common issues, data quality, integration problems, and escalation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-red-500/20">
              <CardContent className="pt-4">
                <AlertTriangle className="h-5 w-5 text-red-500 mb-2" />
                <h4 className="font-medium">Configuration Issues</h4>
                <p className="text-sm text-muted-foreground">Troubleshoot policy, shift, and device problems.</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="pt-4">
                <Database className="h-5 w-5 text-amber-500 mb-2" />
                <h4 className="font-medium">Data Quality</h4>
                <p className="text-sm text-muted-foreground">Missing punches, duplicates, validation errors.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <Shield className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">Security & Access</h4>
                <p className="text-sm text-muted-foreground">Device security and role permissions.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <Zap className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">Performance</h4>
                <p className="text-sm text-muted-foreground">System tuning and large dataset handling.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
