import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Settings, MapPin, Smartphone, Fingerprint } from 'lucide-react';

export function TimeAttendanceManualFoundationSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-2-1" data-manual-anchor="ta-sec-2-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 2</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>55 min read</span>
          </div>
          <CardTitle className="text-2xl">Foundation Setup</CardTitle>
          <CardDescription>Time policies, devices, geofencing, and verification configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <Settings className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Time Policies</h4>
                <p className="text-sm text-muted-foreground">Configure rounding rules, grace periods, and overtime thresholds.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <Fingerprint className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">Timeclock Devices</h4>
                <p className="text-sm text-muted-foreground">Set up biometric readers, card readers, and mobile apps.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <MapPin className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">Geofencing</h4>
                <p className="text-sm text-muted-foreground">Configure GPS-based clock-in validation boundaries.</p>
              </CardContent>
            </Card>
            <Card className="border-purple-500/20">
              <CardContent className="pt-4">
                <Smartphone className="h-5 w-5 text-purple-500 mb-2" />
                <h4 className="font-medium">Face Verification</h4>
                <p className="text-sm text-muted-foreground">AI face recognition enrollment and matching settings.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
