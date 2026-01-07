import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { GraduationCap, Award, FileCheck, Clock } from 'lucide-react';

export const MyQualifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3 className="text-xl font-semibold mb-4">Overview</h3>
        <p>
          Employees can self-manage their qualifications including certifications, educational credentials, 
          professional licenses, and memberships. This creates a dynamic skills inventory that feeds into 
          workforce planning and career pathing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <GraduationCap className="h-6 w-6 text-blue-600 mb-2" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Education</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Degrees and diplomas</li>
            <li>• Institution and graduation date</li>
            <li>• Field of study / major</li>
            <li>• Upload transcripts</li>
          </ul>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <Award className="h-6 w-6 text-green-600 mb-2" />
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Certifications</h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Professional certifications</li>
            <li>• Issuing body and date earned</li>
            <li>• Expiration date tracking</li>
            <li>• Renewal reminders</li>
          </ul>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <FileCheck className="h-6 w-6 text-purple-600 mb-2" />
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Licenses</h4>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li>• Professional licenses</li>
            <li>• License number and jurisdiction</li>
            <li>• Validity period</li>
            <li>• Compliance alerts</li>
          </ul>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
          <Clock className="h-6 w-6 text-orange-600 mb-2" />
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Memberships</h4>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Professional associations</li>
            <li>• Membership ID and level</li>
            <li>• Renewal tracking</li>
            <li>• Sponsorship records</li>
          </ul>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="My Qualifications - Managing certifications with expiry tracking"
        alt="Screenshot showing employee qualifications list with add/edit capabilities and expiration alerts"
      />

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Verification Workflow</h4>
        <p className="text-sm mb-2">
          When employees add new qualifications:
        </p>
        <ol className="text-sm list-decimal list-inside space-y-1">
          <li>Employee uploads credential and supporting documentation</li>
          <li>HR receives notification for verification</li>
          <li>HR validates against accrediting body or institution</li>
          <li>Credential status updated to "Verified" or "Pending Verification"</li>
        </ol>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Skills Integration:</strong> Verified qualifications automatically map to the skills 
          framework, updating the employee's skill profile and competency levels.
        </AlertDescription>
      </Alert>
    </div>
  );
};
