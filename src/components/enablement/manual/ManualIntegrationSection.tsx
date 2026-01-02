import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Target, BookOpen, DollarSign, GraduationCap, Bell } from 'lucide-react';
import { NavigationPath } from './NavigationPath';
import { NAVIGATION_PATHS } from './navigationPaths';
export function ManualIntegrationSection() {
  return (
    <div className="space-y-8">
      {/* Integration Overview */}
      <Card id="sec-7-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 7.1</Badge>
          </div>
          <CardTitle className="text-2xl">Integration Overview</CardTitle>
          <CardDescription>How appraisal data flows to other modules</CardDescription>
        </CardHeader>
        <CardContent>
          <NavigationPath path={NAVIGATION_PATHS['sec-7-1']} />
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-6">
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="font-medium">Appraisals</p>
              <p className="text-xs text-muted-foreground">Finalized Scores</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { icon: Target, label: 'Nine-Box' },
                { icon: Target, label: 'Succession' },
                { icon: BookOpen, label: 'IDP/PIP' },
                { icon: DollarSign, label: 'Compensation' },
                { icon: GraduationCap, label: 'Learning' }
              ].map((mod) => (
                <div key={mod.label} className="p-3 border rounded-lg text-center">
                  <mod.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs">{mod.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downstream Triggers */}
      <Card id="sec-7-2">
        <CardHeader>
          <CardTitle className="text-2xl">Downstream Triggers</CardTitle>
          <CardDescription>Automatic actions based on appraisal outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <NavigationPath path={NAVIGATION_PATHS['sec-7-2']} />
          <div className="space-y-3">
            {[
              { trigger: 'Score < 2.0', action: 'Create PIP automatically', timing: 'Within 14 days' },
              { trigger: 'Score > 4.0', action: 'Add to succession pool', timing: 'Within 30 days' },
              { trigger: 'Skill gap detected', action: 'Generate learning path', timing: 'Within 30 days' },
              { trigger: 'Finalization', action: 'Update Nine-Box position', timing: 'Immediate' },
              { trigger: 'Category assigned', action: 'Trigger compensation rules', timing: 'Merit cycle' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="min-w-[120px]">{item.trigger}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{item.action}</span>
                <span className="text-sm text-muted-foreground">{item.timing}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
