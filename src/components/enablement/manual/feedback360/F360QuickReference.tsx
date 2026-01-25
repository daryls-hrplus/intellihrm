import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FEEDBACK_360_QUICK_REFERENCE } from '@/types/feedback360Manual';
import { User, Users, Briefcase, Shield } from 'lucide-react';

const JOURNEY_ICONS = {
  employeeJourney: User,
  raterJourney: Users,
  managerJourney: Briefcase,
  hrAdminJourney: Shield,
};

export function F360QuickReference() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Reference Cards</h2>
        <p className="text-muted-foreground mb-6">
          Role-based journey maps for the 360 feedback process.
        </p>
      </div>

      {Object.entries(FEEDBACK_360_QUICK_REFERENCE).map(([key, journey]) => {
        const Icon = JOURNEY_ICONS[key as keyof typeof JOURNEY_ICONS];
        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {journey.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{journey.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {journey.steps.map((step) => (
                  <div key={step.step} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    <Badge variant="outline" className="shrink-0">{step.step}</Badge>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
