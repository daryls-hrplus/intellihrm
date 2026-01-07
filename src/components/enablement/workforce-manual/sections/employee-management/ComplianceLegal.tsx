import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, CriticalCallout } from '@/components/enablement/manual/components';
import { Shield, CheckCircle2 } from 'lucide-react';

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
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={Shield} title="Regulatory Compliance">
            <p className="mt-2">
              Track mandatory certifications, licenses, and regulatory requirements 
              specific to employee roles and jurisdictions.
            </p>
          </FeatureCard>
          <FeatureCard variant="success" icon={CheckCircle2} title="Mandatory Training">
            <p className="mt-2">
              Monitor completion of required training (harassment prevention, 
              safety training, etc.) with due date tracking.
            </p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.9: Compliance and Legal tracking dashboard"
        alt="Compliance tracker showing regulatory requirements and mandatory training status"
      />

      <CriticalCallout title="Audit Trail">
        All compliance status changes are logged with timestamps and responsible 
        parties for regulatory audit requirements.
      </CriticalCallout>
    </div>
  );
}
