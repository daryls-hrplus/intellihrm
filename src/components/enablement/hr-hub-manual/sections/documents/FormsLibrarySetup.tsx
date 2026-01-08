import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Sparkles, Layout, Send, BarChart3, Workflow } from 'lucide-react';
import { FutureCallout } from '@/components/enablement/manual/components/Callout';

const plannedFeatures = [
  {
    icon: Layout,
    title: 'Digital Form Builder',
    description: 'Drag-and-drop interface for creating custom HR forms with various field types including text, dropdowns, checkboxes, file uploads, and signature fields.',
    color: 'text-blue-500'
  },
  {
    icon: Workflow,
    title: 'Approval Workflow Integration',
    description: 'Connect forms to approval workflows configured in Chapter 3. Submissions automatically route to appropriate approvers based on form type and submitter role.',
    color: 'text-purple-500'
  },
  {
    icon: Send,
    title: 'Automated Distribution',
    description: 'Schedule form distribution to employees based on triggers (onboarding, annual reviews, policy updates) with reminder notifications.',
    color: 'text-green-500'
  },
  {
    icon: BarChart3,
    title: 'Submission Tracking & Analytics',
    description: 'Monitor form completion rates, identify bottlenecks, and export submission data for reporting and compliance audits.',
    color: 'text-amber-500'
  }
];

export function FormsLibrarySetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-4-4">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 4.4</Badge>
            <Badge variant="secondary">5 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Forms Library</h2>
          <p className="text-muted-foreground mt-1">
            Digital forms with approval workflows and submission tracking
          </p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Feature Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FutureCallout title="Coming Soon">
            The Forms Library is currently under development. This feature will enable HR teams 
            to create, distribute, and track digital forms with integrated approval workflows—
            eliminating paper-based processes and improving compliance tracking.
          </FutureCallout>
        </CardContent>
      </Card>

      {/* Planned Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-500" />
            Planned Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plannedFeatures.map((feature, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <feature.icon className={`h-5 w-5 ${feature.color} mt-0.5`} />
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Anticipated Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Onboarding</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• New hire information forms</li>
                <li>• Emergency contact collection</li>
                <li>• Policy acknowledgments</li>
                <li>• Equipment request forms</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">HR Requests</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Benefits enrollment</li>
                <li>• Address change requests</li>
                <li>• Training registration</li>
                <li>• Expense reimbursement</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Compliance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Annual policy acknowledgments</li>
                <li>• Conflict of interest disclosures</li>
                <li>• Safety certifications</li>
                <li>• Exit interviews</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
