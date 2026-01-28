import { Settings } from 'lucide-react';
import { 
  LearningObjectives, 
  TipCallout
} from '@/components/enablement/manual/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LndSetupCompanySettings() {
  const learningObjectives = [
    'Configure company-wide L&D defaults',
    'Set notification preferences and reminders',
    'Enable or disable module features'
  ];

  return (
    <section id="sec-2-16" data-manual-anchor="sec-2-16" className="space-y-6">
      <h2 className="text-2xl font-bold">2.16 Company L&D Settings</h2>
      <LearningObjectives objectives={learningObjectives} />
      <p className="text-muted-foreground">
        Company settings control default behaviors and feature availability across the 
        L&D module. Configure these settings to align with organizational policies.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Key Configuration Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Default Passing Score</div>
              <div className="text-sm text-muted-foreground">Set company-wide default (typically 70-80%)</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Self-Enrollment</div>
              <div className="text-sm text-muted-foreground">Allow employees to self-enroll in courses</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Manager Enrollment</div>
              <div className="text-sm text-muted-foreground">Allow managers to enroll team members</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Gamification</div>
              <div className="text-sm text-muted-foreground">Enable/disable badges and leaderboards</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Compliance Notifications</div>
              <div className="text-sm text-muted-foreground">Configure reminder frequency and escalation</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <TipCallout title="Configuration Recommendations">
        <ul className="space-y-1 mt-2">
          <li>• Enable self-enrollment to reduce administrative burden</li>
          <li>• Set passing scores appropriate for your industry</li>
          <li>• Review settings quarterly as organizational needs change</li>
        </ul>
      </TipCallout>
    </section>
  );
}
