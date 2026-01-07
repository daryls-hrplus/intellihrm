import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, TrendingDown, BookOpen } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function SkillGapAnalysis() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Skill gap analysis identifies development needs by comparing current proficiency 
          levels against role requirements and career path targets.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Gap Analysis Components</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              Gap Identification
            </h4>
            <p className="text-sm text-muted-foreground">
              System compares employee's current skill levels against position requirements 
              and flags gaps exceeding configurable thresholds.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Learning Recommendations
            </h4>
            <p className="text-sm text-muted-foreground">
              AI-powered recommendations suggest courses, certifications, and development 
              activities to close identified gaps.
            </p>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.7: Skill Gap Analysis dashboard with development recommendations"
        alt="Gap analysis view showing current vs required skill levels with learning suggestions"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Succession Planning</AlertTitle>
        <AlertDescription>
          Skill gaps feed into succession readiness scoring. High-potential employees 
          with manageable gaps are prioritized for development investment.
        </AlertDescription>
      </Alert>
    </div>
  );
}
