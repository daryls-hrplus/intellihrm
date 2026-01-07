import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Award, Users } from 'lucide-react';

export function CredentialsMemberships() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Credentials and memberships track professional certifications, industry associations, 
          and organizational affiliations that enhance employee qualifications.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Credential Types</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Professional Certifications
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Industry certifications (PMP, CPA, etc.)</li>
              <li>• Vendor certifications (AWS, Microsoft)</li>
              <li>• Professional licenses</li>
              <li>• Expiry date tracking</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Professional Memberships
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Industry associations</li>
              <li>• Professional bodies</li>
              <li>• Alumni networks</li>
              <li>• Membership renewal tracking</li>
            </ul>
          </div>
        </div>
      </section>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Renewal Alerts</AlertTitle>
        <AlertDescription>
          Configure expiry alerts for credentials requiring periodic renewal. 
          System notifies employees and HR of upcoming expirations.
        </AlertDescription>
      </Alert>
    </div>
  );
}
