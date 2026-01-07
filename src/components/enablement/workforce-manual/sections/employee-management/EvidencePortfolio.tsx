import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ClipboardCheck, Award } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function EvidencePortfolio() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Evidence portfolio enables employees to document capability demonstrations, 
          project contributions, and skill validations with manager verification workflows.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Evidence Types</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Work Samples
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Project deliverables</li>
              <li>• Presentations</li>
              <li>• Code samples</li>
              <li>• Design artifacts</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Achievements
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Awards and recognition</li>
              <li>• Performance metrics</li>
              <li>• Customer feedback</li>
              <li>• Peer endorsements</li>
            </ul>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.18: Evidence Portfolio with work samples and achievements"
        alt="Portfolio view showing uploaded evidence with validation status"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Validation Workflow</AlertTitle>
        <AlertDescription>
          Evidence requires manager validation before contributing to capability scores. 
          Configure validation requirements per evidence type.
        </AlertDescription>
      </Alert>
    </div>
  );
}
