import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Scale, FileText } from 'lucide-react';

export function TimeAttendanceManualComplianceSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-7-1" data-manual-anchor="ta-sec-7-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 7</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>50 min read</span>
          </div>
          <CardTitle className="text-2xl">Overtime and Compliance</CardTitle>
          <CardDescription>Overtime rules, alerts, labor compliance, and CBA configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <Clock className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Overtime Rules</h4>
                <p className="text-sm text-muted-foreground">Daily/weekly thresholds and calculation methods.</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="pt-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 mb-2" />
                <h4 className="font-medium">Overtime Alerts</h4>
                <p className="text-sm text-muted-foreground">Approaching overtime warnings and notifications.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <Scale className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">Labor Compliance</h4>
                <p className="text-sm text-muted-foreground">Multi-country labor law rules (Caribbean, Africa).</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <FileText className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">CBA Rules</h4>
                <p className="text-sm text-muted-foreground">Collective bargaining agreement time policies.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
