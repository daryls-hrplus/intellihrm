import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UserCheck, Phone } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function ReferencesVerifications() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Reference management tracks professional references provided by candidates 
          and the verification status of each reference check.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Reference Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Reference Details
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Name and title</li>
              <li>• Relationship to candidate</li>
              <li>• Company/organization</li>
              <li>• Contact information</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" />
              Verification Status
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Pending / Contacted / Completed</li>
              <li>• Verification date</li>
              <li>• Verified by (HR user)</li>
              <li>• Notes and feedback</li>
            </ul>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.6: References management with verification status tracking"
        alt="Reference list showing contact details and verification status badges"
      />

      <Alert className="border-border bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertTitle>Best Practice</AlertTitle>
        <AlertDescription>
          Require minimum 2-3 professional references for management positions. 
          Document all reference check attempts for audit compliance.
        </AlertDescription>
      </Alert>
    </div>
  );
}
