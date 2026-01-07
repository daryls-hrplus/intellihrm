import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Search, Shield, Users } from 'lucide-react';

export function EmployeeDirectory() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          The employee directory provides searchable access to employee contact information 
          with role-based PII visibility controls and organizational filtering.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Directory Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Search Capabilities
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Name and email search</li>
              <li>• Department/team filtering</li>
              <li>• Location-based filtering</li>
              <li>• Skills and competency search</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              Privacy Controls
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• PII masking for non-HR users</li>
              <li>• Role-based field visibility</li>
              <li>• Employee opt-out options</li>
              <li>• GDPR compliance settings</li>
            </ul>
          </div>
        </div>
      </section>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Configuration</AlertTitle>
        <AlertDescription>
          Configure directory visibility and searchable fields in 
          Admin → Security → Data Privacy → Directory Settings.
        </AlertDescription>
      </Alert>
    </div>
  );
}
