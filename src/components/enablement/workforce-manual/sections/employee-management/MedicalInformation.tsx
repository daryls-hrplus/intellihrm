import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Stethoscope } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function MedicalInformation() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Medical information captures emergency health data, blood type, allergies, and 
          health conditions for workplace safety and emergency response.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Medical Profile Components</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Emergency Medical Data</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Blood type (A, B, AB, O ±)</li>
              <li>• Known allergies</li>
              <li>• Current medications</li>
              <li>• Emergency medical conditions</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">H&S Compliance</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Fitness for duty status</li>
              <li>• Medical clearance certificates</li>
              <li>• Occupational health assessments</li>
              <li>• Disability accommodations</li>
            </ul>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.4: Medical Information form with emergency health data"
        alt="Medical profile form showing blood type, allergies, and fitness for duty fields"
      />

      <Alert variant="destructive" className="border-destructive/20">
        <Shield className="h-4 w-4" />
        <AlertTitle>Confidential Data</AlertTitle>
        <AlertDescription>
          Medical information is highly sensitive and subject to strict access controls. 
          Only H&S officers and authorized personnel can access medical profiles.
        </AlertDescription>
      </Alert>
    </div>
  );
}
