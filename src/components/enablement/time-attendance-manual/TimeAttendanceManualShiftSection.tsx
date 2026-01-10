import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, RotateCcw, DollarSign } from 'lucide-react';

export function TimeAttendanceManualShiftSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-3-1" data-manual-anchor="ta-sec-3-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Part 3</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>70 min read</span>
          </div>
          <CardTitle className="text-2xl">Shift Management</CardTitle>
          <CardDescription>Shift templates, schedules, rotation patterns, and payment rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <Calendar className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium">Shift Templates</h4>
                <p className="text-sm text-muted-foreground">Create reusable shift patterns with start/end times and breaks.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardContent className="pt-4">
                <RotateCcw className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium">Rotation Patterns</h4>
                <p className="text-sm text-muted-foreground">Configure 4x4, 5x2, Panama, and custom rotation patterns.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="pt-4">
                <DollarSign className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">Shift Differentials</h4>
                <p className="text-sm text-muted-foreground">Night, weekend, and holiday premium pay configuration.</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="pt-4">
                <Clock className="h-5 w-5 text-amber-500 mb-2" />
                <h4 className="font-medium">Rounding Rules</h4>
                <p className="text-sm text-muted-foreground">Clock punch rounding and grace period settings.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
