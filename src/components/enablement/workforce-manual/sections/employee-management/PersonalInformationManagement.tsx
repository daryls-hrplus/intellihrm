import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Info, Phone, MapPin, Users, Shield } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function PersonalInformationManagement() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Personal information management covers contact details, emergency contacts, addresses, 
          and demographic data. This section follows PII handling best practices and GDPR compliance standards.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Contact Information Categories</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Personal Contact</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li>Personal email</li>
              <li>Mobile phone</li>
              <li>Home phone</li>
              <li>Preferred contact method</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">Addresses</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li>Permanent address</li>
              <li>Current/mailing address</li>
              <li>Work location address</li>
              <li>Country-specific formats</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-amber-500" />
              <h4 className="font-medium">Emergency Contacts</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li>Primary emergency contact</li>
              <li>Secondary contact</li>
              <li>Relationship type</li>
              <li>Priority ordering</li>
            </ul>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.2: Personal Information tab with contact details and emergency contacts"
        alt="Employee personal information form showing contact fields and emergency contacts section"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertTitle>PII Protection</AlertTitle>
        <AlertDescription>
          Personal contact information is subject to role-based visibility controls. 
          Configure PII visibility in Admin → Security → Data Privacy settings.
        </AlertDescription>
      </Alert>
    </div>
  );
}
