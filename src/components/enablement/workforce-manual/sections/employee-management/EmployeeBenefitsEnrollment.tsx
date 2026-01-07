import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Heart, Calendar } from 'lucide-react';

export function EmployeeBenefitsEnrollment() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Benefits enrollment management tracks employee plan selections, coverage details, 
          and enrollment period participation.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Enrollment Components</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Plan Selection
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Health insurance plans</li>
              <li>• Dental and vision</li>
              <li>• Life insurance</li>
              <li>• Retirement plans</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Enrollment Periods
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Annual open enrollment</li>
              <li>• New hire enrollment</li>
              <li>• Qualifying life events</li>
              <li>• Special enrollment periods</li>
            </ul>
          </div>
        </div>
      </section>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Dependent Coverage</AlertTitle>
        <AlertDescription>
          Dependents configured in the Dependents tab become available for benefits 
          enrollment when marked as benefits-eligible.
        </AlertDescription>
      </Alert>
    </div>
  );
}
