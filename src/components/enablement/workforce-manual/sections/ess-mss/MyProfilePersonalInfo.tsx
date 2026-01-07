import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { CheckCircle } from 'lucide-react';

export const MyProfilePersonalInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          The My Profile section allows employees to view and update their personal information including 
          contact details, emergency contacts, and addresses. Changes to sensitive fields trigger approval 
          workflows to maintain data integrity.
        </p>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Editable Personal Fields</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-sm mb-2">Contact Information</h5>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Personal email address
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Mobile phone number
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Home phone number
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Mailing address
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-sm mb-2">Emergency Contacts</h5>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Primary emergency contact
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Secondary emergency contact
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Relationship & phone numbers
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Fields Requiring Approval</h4>
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
          Changes to the following fields are routed through HR approval:
        </p>
        <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
          <li>Legal name changes (requires documentation)</li>
          <li>Marital status updates</li>
          <li>Bank account changes (routed to Payroll)</li>
          <li>Tax withholding updates</li>
        </ul>
      </div>

      <ScreenshotPlaceholder 
        caption="My Profile - Personal Information editing screen"
        alt="Screenshot of employee personal information form with editable fields and approval indicators"
      />

      <Alert>
        <AlertDescription>
          <strong>Audit Trail:</strong> All profile changes are logged with timestamps and the previous 
          values are retained for historical reference and compliance.
        </AlertDescription>
      </Alert>
    </div>
  );
};
