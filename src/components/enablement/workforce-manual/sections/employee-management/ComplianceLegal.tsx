import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function ComplianceLegal() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Compliance and legal tracking ensures employees meet regulatory requirements, 
          mandatory training, and jurisdiction-specific obligations.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Compliance Areas</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Regulatory Compliance
            </h4>
            <p className="text-sm text-muted-foreground">
              Track mandatory certifications, licenses, and regulatory requirements 
              specific to employee roles and jurisdictions.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Mandatory Training
            </h4>
            <p className="text-sm text-muted-foreground">
              Monitor completion of required training (harassment prevention, 
              safety training, etc.) with due date tracking.
            </p>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.9: Compliance and Legal tracking dashboard"
        alt="Compliance tracker showing regulatory requirements and mandatory training status"
      />

      <Alert variant="destructive" className="border-destructive/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Audit Trail</AlertTitle>
        <AlertDescription>
          All compliance status changes are logged with timestamps and responsible 
          parties for regulatory audit requirements.
        </AlertDescription>
      </Alert>
    </div>
  );
}
