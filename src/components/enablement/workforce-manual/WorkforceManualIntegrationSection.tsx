import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Clock } from 'lucide-react';
import {
  IntegrationOverview,
  RecruitmentIntegration,
  PayrollIntegration,
  BenefitsIntegration,
  LeaveTimeIntegration,
  PerformanceIntegration,
  LearningIntegration,
  CompensationIntegration,
  SuccessionIntegration,
  NotificationOrchestration
} from './sections/integration';

export function WorkforceManualIntegrationSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <Card className="border-border bg-muted/50" data-manual-anchor="wf-part-9">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Part 9: Integration & Cross-Module Impacts</CardTitle>
                <p className="text-muted-foreground mt-1">
                  How workforce data flows to and from other HRplus modules
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                55 min read
              </Badge>
              <Badge variant="secondary">Admin • Consultant</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">What You'll Learn</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• How workforce data flows to Payroll, Benefits, and Leave modules</li>
                <li>• Bidirectional integration with Performance and Succession</li>
                <li>• Position-based policy assignments across modules</li>
                <li>• Event-driven notification orchestration</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Key Integration Points</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Recruitment: Vacancy → Requisition → Hire flow</li>
                <li>• Payroll: Employee master and transaction sync</li>
                <li>• Performance: Competencies and rating feedback</li>
                <li>• Compensation: Grade-based salary bands and merit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 9.1 - Integration Overview */}
      <IntegrationOverview />

      {/* Section 9.2 - Recruitment Integration */}
      <RecruitmentIntegration />

      {/* Section 9.3 - Payroll Integration */}
      <PayrollIntegration />

      {/* Section 9.4 - Benefits Integration */}
      <BenefitsIntegration />

      {/* Section 9.5 - Leave & Time Integration */}
      <LeaveTimeIntegration />

      {/* Section 9.6 - Performance Integration */}
      <PerformanceIntegration />

      {/* Section 9.7 - Learning Integration */}
      <LearningIntegration />

      {/* Section 9.8 - Compensation Integration */}
      <CompensationIntegration />

      {/* Section 9.9 - Succession Integration */}
      <SuccessionIntegration />

      {/* Section 9.10 - Notification Orchestration */}
      <NotificationOrchestration />
    </div>
  );
}
