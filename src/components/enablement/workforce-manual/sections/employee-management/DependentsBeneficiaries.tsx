import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Users, Heart } from 'lucide-react';

export function DependentsBeneficiaries() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Dependents and beneficiaries management captures family member information for 
          benefits enrollment, emergency contacts, and insurance coverage.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Relationship Types</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Dependents
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Spouse/Partner</li>
              <li>• Child (natural/adopted)</li>
              <li>• Stepchild</li>
              <li>• Parent (for tax purposes)</li>
              <li>• Domestic partner</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Beneficiaries
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Primary beneficiary</li>
              <li>• Contingent beneficiary</li>
              <li>• Percentage allocation</li>
              <li>• Trust/Estate designation</li>
            </ul>
          </div>
        </div>
      </section>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Benefits Integration</AlertTitle>
        <AlertDescription>
          Dependents marked as "benefits eligible" appear in open enrollment. 
          Verify eligibility dates and documentation requirements.
        </AlertDescription>
      </Alert>
    </div>
  );
}
