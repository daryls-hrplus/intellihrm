import { LearningObjectives } from './LearningObjectives';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, UserPlus, History } from 'lucide-react';

export function RehireHandling() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Rehiring former employees requires special handling to maintain historical data integrity, 
        calculate seniority correctly, and apply appropriate onboarding processes. HRplus provides 
        configurable rehire workflows.
      </p>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Rehire eligibility and seniority calculation rules vary by 
          company policy and local labor law. Configure these settings before processing rehires.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Rehire Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              type: 'Boomerang Employee', 
              desc: 'Former employee returning after voluntary departure',
              considerations: 'Prior performance, reason for leaving, time gap'
            },
            { 
              type: 'Seasonal Rehire', 
              desc: 'Employee returning for recurring seasonal work',
              considerations: 'Seniority continuity, benefits bridging'
            },
            { 
              type: 'Contract Renewal', 
              desc: 'Contract employee with new engagement',
              considerations: 'Gap in service, contractor status'
            }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <h5 className="font-medium">{item.type}</h5>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Considerations:</strong> {item.considerations}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Rehire Eligibility</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <h5 className="font-medium text-green-800 mb-2">✓ Eligible for Rehire</h5>
            <ul className="text-sm space-y-1 text-green-700">
              <li>• Voluntary resignation with proper notice</li>
              <li>• Good performance standing at departure</li>
              <li>• No policy violations on record</li>
              <li>• Passed required waiting period (if any)</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 bg-red-50 border-red-200">
            <h5 className="font-medium text-red-800 mb-2">✗ Not Eligible for Rehire</h5>
            <ul className="text-sm space-y-1 text-red-700">
              <li>• Termination for cause</li>
              <li>• Serious policy violations</li>
              <li>• Abandonment of position</li>
              <li>• Legal/compliance issues</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Seniority Calculation Options</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">Option</th>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Typical Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">Full Continuity</td>
                <td className="border p-2">Original hire date preserved</td>
                <td className="border p-2">Short breaks, company policy, collective agreement</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Bridge Service</td>
                <td className="border p-2">Gap excluded but prior service counts</td>
                <td className="border p-2">Seasonal employees, approved leaves</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Fresh Start</td>
                <td className="border p-2">New hire date, no prior credit</td>
                <td className="border p-2">Long gaps, significant role changes</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Partial Credit</td>
                <td className="border p-2">Percentage of prior service counts</td>
                <td className="border p-2">Company-specific policies</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Rehire Process Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Search for existing employee record by name/ID</li>
          <li>System displays former employee with departure details</li>
          <li>Review eligibility status and any flags</li>
          <li>If eligible, click <strong>Initiate Rehire</strong></li>
          <li>Select seniority calculation method per policy</li>
          <li>Update position, compensation, and assignment details</li>
          <li>Choose onboarding template (full or abbreviated)</li>
          <li>System creates new employment record linked to historical data</li>
          <li>Historical performance, training, and documents remain accessible</li>
        </ol>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Data Continuity</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Preserved Data</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Employee master record</li>
              <li>• Historical employment periods</li>
              <li>• Performance reviews</li>
              <li>• Training records</li>
              <li>• Disciplinary history</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <h5 className="font-medium">Refreshed Data</h5>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Contact information</li>
              <li>• Emergency contacts</li>
              <li>• Banking details</li>
              <li>• Benefits enrollment</li>
              <li>• Position assignment</li>
            </ul>
          </div>
        </div>
      </div>

      <LearningObjectives
        items={[
          "Configure rehire eligibility rules",
          "Process rehires with appropriate seniority calculation",
          "Understand data continuity for returning employees",
          "Apply abbreviated onboarding for rehires"
        ]}
      />
    </div>
  );
}
