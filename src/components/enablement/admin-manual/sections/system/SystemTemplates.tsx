import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Mail, Variable, Copy, Languages, CheckCircle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const LETTER_TEMPLATES = [
  { name: "Offer Letter", module: "Recruitment", variables: 32 },
  { name: "Employment Contract", module: "Onboarding", variables: 45 },
  { name: "Probation Confirmation", module: "Core HR", variables: 18 },
  { name: "Promotion Letter", module: "Core HR", variables: 24 },
  { name: "Salary Revision", module: "Compensation", variables: 28 },
  { name: "Termination Letter", module: "Offboarding", variables: 22 },
  { name: "Experience Certificate", module: "Offboarding", variables: 15 },
];

const EMAIL_TEMPLATES = [
  { name: "Welcome Email", trigger: "New hire created", category: "Onboarding" },
  { name: "Leave Request Notification", trigger: "Leave submitted", category: "Time Off" },
  { name: "Leave Approval", trigger: "Leave approved/rejected", category: "Time Off" },
  { name: "Performance Review Reminder", trigger: "Review cycle started", category: "Performance" },
  { name: "Birthday Wishes", trigger: "Scheduled - birthday", category: "Engagement" },
  { name: "Work Anniversary", trigger: "Scheduled - anniversary", category: "Engagement" },
  { name: "Password Reset", trigger: "Reset requested", category: "Security" },
];

const COMMON_VARIABLES = [
  { variable: "{{employee.full_name}}", description: "Employee's full name" },
  { variable: "{{employee.job_title}}", description: "Current job title" },
  { variable: "{{employee.department}}", description: "Department name" },
  { variable: "{{employee.hire_date}}", description: "Date of joining" },
  { variable: "{{manager.full_name}}", description: "Reporting manager's name" },
  { variable: "{{company.name}}", description: "Organization name" },
  { variable: "{{company.logo_url}}", description: "Company logo for emails" },
  { variable: "{{current_date}}", description: "Today's date formatted" },
];

export function SystemTemplates() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configure letter templates and email templates used throughout the system. 
        Templates support dynamic variables that are automatically populated with relevant data.
      </p>

      {/* Letter Templates */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          Letter Templates
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Template Name</th>
                <th className="text-left p-3 font-medium">Module</th>
                <th className="text-left p-3 font-medium">Variables</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {LETTER_TEMPLATES.map((template, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{template.name}</td>
                  <td className="p-3">
                    <Badge variant="outline">{template.module}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{template.variables} available</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="cursor-pointer">Edit</Badge>
                      <Badge variant="secondary" className="cursor-pointer">
                        <Copy className="h-3 w-3" />
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.9.1: Letter template editor with rich text formatting and variable insertion"
        alt="Template editor showing WYSIWYG interface with variable picker sidebar"
      />

      {/* Email Templates */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-green-500" />
          Email Templates
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Template</th>
                <th className="text-left p-3 font-medium">Trigger</th>
                <th className="text-left p-3 font-medium">Category</th>
              </tr>
            </thead>
            <tbody>
              {EMAIL_TEMPLATES.map((template, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{template.name}</td>
                  <td className="p-3 text-muted-foreground">{template.trigger}</td>
                  <td className="p-3">
                    <Badge variant="outline">{template.category}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.9.2: Email template configuration with subject line and body editor"
        alt="Email template editor showing subject, body, and trigger configuration"
      />

      {/* Variable Reference */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Variable className="h-4 w-4 text-purple-500" />
          Common Template Variables
        </h4>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {COMMON_VARIABLES.map((v, index) => (
              <div key={index} className="flex items-center gap-3">
                <code className="bg-background px-2 py-1 rounded text-xs font-mono">
                  {v.variable}
                </code>
                <span className="text-sm text-muted-foreground">{v.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-language Support */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Languages className="h-4 w-4 text-amber-500" />
          Multi-Language Templates
        </h4>
        <div className="border rounded-lg p-4">
          <p className="text-sm mb-3">
            Templates support multiple language versions. The system automatically selects 
            the appropriate version based on the recipient's language preference.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">English (Default)</Badge>
            <Badge variant="outline">Spanish</Badge>
            <Badge variant="outline">French</Badge>
            <Badge variant="outline">Portuguese</Badge>
            <Badge variant="outline">+ Add Language</Badge>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 5.9.3: Multi-language template management with translation status"
        alt="Template versions showing translation completion status per language"
      />

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Best Practice:</strong> Always test templates with sample data before activating. 
          Use the "Preview with Data" feature to see how variables will be populated.
        </AlertDescription>
      </Alert>
    </div>
  );
}
