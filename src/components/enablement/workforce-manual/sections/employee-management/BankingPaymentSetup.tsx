import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, CreditCard } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function BankingPaymentSetup() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Banking and payment setup captures employee bank account details for payroll processing. 
          This data integrates with payroll modules for direct deposit and payment distribution.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Required Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Bank Account Details</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Bank name</li>
              <li>• Account number</li>
              <li>• Account type (checking/savings)</li>
              <li>• Routing/transit number</li>
              <li>• SWIFT/BIC code (international)</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Payment Preferences</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Primary payment method</li>
              <li>• Secondary account (split payments)</li>
              <li>• Split percentage allocation</li>
              <li>• Pay group assignment</li>
            </ul>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.10: Banking and Payment Setup form"
        alt="Bank account configuration showing account details and payment split options"
      />

      <Alert variant="destructive" className="border-destructive/20">
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          Bank account information is encrypted at rest and subject to strict access controls. 
          Only authorized payroll administrators can view full account details.
        </AlertDescription>
      </Alert>
    </div>
  );
}
