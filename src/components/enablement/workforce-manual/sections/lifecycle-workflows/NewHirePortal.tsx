import { IntegrationReference } from '@/components/enablement/shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, CheckCircle, FileText, GraduationCap, UserCircle } from 'lucide-react';

export function NewHirePortal() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        The New Hire Portal (Employee Self-Service) provides a dedicated experience for new employees 
        to complete their onboarding tasks, access company information, and track their integration progress.
      </p>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Day-1 Readiness:</strong> Employees can access the portal before their official 
          start date to complete pre-boarding tasks, reducing day-1 administrative burden.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Portal Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: CheckCircle, title: 'My Tasks', desc: 'View and complete assigned onboarding tasks' },
            { icon: FileText, title: 'Documents', desc: 'Upload required documents, sign agreements' },
            { icon: GraduationCap, title: 'Training', desc: 'Access mandatory and recommended courses' },
            { icon: UserCircle, title: 'My Profile', desc: 'Complete personal information, preferences' }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 text-center">
              <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <h5 className="font-medium">{item.title}</h5>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Employee Task View</h4>
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background rounded border">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Complete Personal Profile</span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded border">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 rounded-full" />
                <span>Review Employee Handbook</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Due Today</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded border">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 rounded-full" />
                <span>Complete Safety Training</span>
              </div>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Due in 5 days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Self-Service Capabilities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">Pre-Boarding (Before Day 1)</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Complete personal information forms</li>
              <li>• Upload ID documents and photos</li>
              <li>• Provide emergency contact details</li>
              <li>• Set banking information for payroll</li>
              <li>• Review and sign offer documents</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium mb-2">Active Onboarding (Day 1+)</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Complete compliance acknowledgments</li>
              <li>• Access training courses</li>
              <li>• View team org chart and contacts</li>
              <li>• Submit benefits enrollment</li>
              <li>• Track milestone progress</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Mobile Experience</h4>
        <p className="text-sm text-muted-foreground">
          The portal is fully responsive, allowing new employees to complete tasks on any device. 
          Key mobile features include:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Push notifications for new task assignments</li>
          <li>Camera integration for document uploads</li>
          <li>E-signature on touch devices</li>
          <li>Offline access for reference materials</li>
        </ul>
      </div>

      <IntegrationReference
        title="Learning Objectives"
        items={[
          "Guide new employees through the self-service portal",
          "Configure pre-boarding vs. post-start task visibility",
          "Troubleshoot common employee portal issues",
          "Customize welcome content and branding"
        ]}
      />
    </div>
  );
}
