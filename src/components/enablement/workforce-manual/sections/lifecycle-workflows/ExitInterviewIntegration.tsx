import { 
  TipCallout, 
  LearningObjectives, 
  ScreenshotPlaceholder 
} from '@/components/enablement/manual/components';
import { MessageSquare, BarChart3, TrendingUp } from 'lucide-react';

export function ExitInterviewIntegration() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Exit interviews provide valuable insights into employee departures. HRplus automates the 
        scheduling, collection, and analysis of exit interview data to identify retention opportunities 
        and organizational improvement areas.
      </p>

      <TipCallout title="Best Practice">
        Conduct exit interviews 2-3 days before the last day, not on the final day when 
        employees may be distracted or rushed.
      </TipCallout>

      <div className="space-y-4">
        <h4 className="font-semibold">Exit Interview Process</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Auto-Schedule', desc: 'System schedules interview based on last day' },
            { step: '2', title: 'Questionnaire', desc: 'Employee completes standardized survey' },
            { step: '3', title: 'HR Meeting', desc: 'Optional in-person discussion' },
            { step: '4', title: 'Analysis', desc: 'Data feeds into turnover analytics' }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 font-bold">
                {item.step}
              </div>
              <h5 className="font-medium">{item.title}</h5>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Standard Exit Interview Topics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Departure Reasons</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Primary reason for leaving</li>
              <li>• Contributing factors</li>
              <li>• When decision was made</li>
              <li>• Whether preventable</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Role & Career</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Role clarity and expectations</li>
              <li>• Career growth opportunities</li>
              <li>• Workload and work-life balance</li>
              <li>• Skill utilization</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Management & Culture</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Manager relationship</li>
              <li>• Team dynamics</li>
              <li>• Company culture fit</li>
              <li>• Communication effectiveness</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Compensation & Benefits</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Compensation satisfaction</li>
              <li>• Benefits adequacy</li>
              <li>• Recognition and rewards</li>
              <li>• Market competitiveness</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Exit Interview Configuration</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to <strong>Workforce → Offboarding → Exit Interview Settings</strong></li>
          <li>Configure standard questionnaire with rating scales and open-ended questions</li>
          <li>Set auto-scheduling rules (e.g., 3 business days before last day)</li>
          <li>Define who receives exit interview notifications (HR, HRBP)</li>
          <li>Configure anonymization settings for reporting</li>
          <li>Set up integration with turnover analytics dashboard</li>
        </ol>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.7a: Exit interview questionnaire configuration with topic categories"
        alt="Exit interview setup showing standard questions and scheduling rules"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Exit Interview Analytics</h4>
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-destructive">45%</div>
              <div className="text-sm text-muted-foreground">Compensation Related</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">28%</div>
              <div className="text-sm text-muted-foreground">Career Growth</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">15%</div>
              <div className="text-sm text-muted-foreground">Manager Issues</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">12%</div>
              <div className="text-sm text-muted-foreground">Work-Life Balance</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Sample exit interview reason distribution (last 12 months)
          </p>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.7b: Exit interview analytics dashboard with departure reason trends"
        alt="Analytics view showing departure reasons distribution and trend analysis"
      />

      <LearningObjectives
        objectives={[
          "Configure exit interview questionnaires",
          "Set up automated scheduling and notifications",
          "Analyze exit interview trends for retention insights",
          "Integrate exit data with turnover analytics"
        ]}
      />
    </div>
  );
}
