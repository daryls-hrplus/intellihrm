import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Users } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function MultiPositionEmployees() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Multi-position assignment allows employees to hold concurrent positions across 
          departments or entities. FTE allocation is split according to configured percentages.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">FTE Split Configuration</h3>
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Example: 60/40 Split</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Primary Position (Engineering Manager)</span>
              <span className="font-mono">0.60 FTE</span>
            </div>
            <div className="flex justify-between">
              <span>Secondary Position (Project Lead)</span>
              <span className="font-mono">0.40 FTE</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span className="font-mono">1.00 FTE</span>
            </div>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.5: Multi-Position Assignment configuration with FTE split"
        alt="Position assignment dialog showing primary and secondary positions with FTE percentages"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Payroll Impact</AlertTitle>
        <AlertDescription>
          Compensation is allocated based on FTE percentage per position. 
          Ensure cost center budgets account for split allocations.
        </AlertDescription>
      </Alert>
    </div>
  );
}
