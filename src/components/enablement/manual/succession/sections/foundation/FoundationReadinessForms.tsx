import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  Database,
  Settings,
  FileText,
  Info
} from 'lucide-react';

export function FoundationReadinessForms() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.5 Readiness Forms Configuration</h3>
        <p className="text-muted-foreground">
          Build readiness assessment forms using the form builder, organize indicators, and configure staff-type-specific forms
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Build readiness assessment forms using the form builder</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Organize indicators into categories</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Configure staff-type-specific forms</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Preview and activate forms</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-700 dark:text-blue-300">System Path:</span>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span>Succession</span>
              <ArrowRight className="h-3 w-3" />
              <span>Setup</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium">Forms</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 font-mono">
            Direct URL: /succession/setup?tab=readiness-forms
          </div>
        </CardContent>
      </Card>

      {/* Database Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Table: readiness_assessment_forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Required</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">id</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3 text-muted-foreground">Primary key (auto-generated)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">company_id</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3 text-muted-foreground">Organization scope</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">name</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Form title (max 100 chars)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">description</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Form purpose and usage</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">staff_type</td>
                  <td className="py-2 px-3"><Badge variant="secondary" className="text-xs">No</Badge></td>
                  <td className="py-2 px-3">Text</td>
                  <td className="py-2 px-3 text-muted-foreground">Restrict to staff type (null = all)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">is_active</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Boolean</td>
                  <td className="py-2 px-3 text-muted-foreground">Available for use</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">created_at</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Timestamp</td>
                  <td className="py-2 px-3 text-muted-foreground">Record creation time</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">updated_at</td>
                  <td className="py-2 px-3"><Badge variant="outline" className="text-xs">Yes</Badge></td>
                  <td className="py-2 px-3">Timestamp</td>
                  <td className="py-2 px-3 text-muted-foreground">Last modification time</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Default Forms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Default Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Form</th>
                  <th className="text-left py-3 px-4 font-medium">Code</th>
                  <th className="text-left py-3 px-4 font-medium">Staff Type</th>
                  <th className="text-left py-3 px-4 font-medium">Categories</th>
                  <th className="text-left py-3 px-4 font-medium">Indicators</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Executive Readiness</td>
                  <td className="py-3 px-4 font-mono">exec_readiness</td>
                  <td className="py-3 px-4"><Badge variant="outline">Executive</Badge></td>
                  <td className="py-3 px-4">8</td>
                  <td className="py-3 px-4">32</td>
                  <td className="py-3 px-4 text-muted-foreground">Full leadership assessment for C-suite and VP roles</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Manager Readiness</td>
                  <td className="py-3 px-4 font-mono">mgr_readiness</td>
                  <td className="py-3 px-4"><Badge variant="outline">Manager</Badge></td>
                  <td className="py-3 px-4">6</td>
                  <td className="py-3 px-4">24</td>
                  <td className="py-3 px-4 text-muted-foreground">Leadership and functional assessment for people managers</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Professional Readiness</td>
                  <td className="py-3 px-4 font-mono">prof_readiness</td>
                  <td className="py-3 px-4"><Badge variant="outline">Professional</Badge></td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4">20</td>
                  <td className="py-3 px-4 text-muted-foreground">Technical and growth assessment for ICs</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Generic Readiness</td>
                  <td className="py-3 px-4 font-mono">gen_readiness</td>
                  <td className="py-3 px-4"><Badge variant="secondary">All</Badge></td>
                  <td className="py-3 px-4">4</td>
                  <td className="py-3 px-4">16</td>
                  <td className="py-3 px-4 text-muted-foreground">Simplified assessment for any role</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form Builder Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Form Builder Workflow (10 steps)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium w-12">Step</th>
                  <th className="text-left py-2 px-3 font-medium">Action</th>
                  <th className="text-left py-2 px-3 font-medium">Details</th>
                  <th className="text-left py-2 px-3 font-medium">Validation</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">1</td>
                  <td className="py-2 px-3">Create form</td>
                  <td className="py-2 px-3 text-muted-foreground">Click "New Form", enter name and code</td>
                  <td className="py-2 px-3 text-muted-foreground">Unique code required</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">2</td>
                  <td className="py-2 px-3">Set staff type</td>
                  <td className="py-2 px-3 text-muted-foreground">Select target staff type or leave blank for all</td>
                  <td className="py-2 px-3 text-muted-foreground">Optional</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">3</td>
                  <td className="py-2 px-3">Add description</td>
                  <td className="py-2 px-3 text-muted-foreground">Explain form purpose</td>
                  <td className="py-2 px-3 text-muted-foreground">Optional</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">4</td>
                  <td className="py-2 px-3">Add categories</td>
                  <td className="py-2 px-3 text-muted-foreground">Create or link existing categories</td>
                  <td className="py-2 px-3 text-muted-foreground">At least 1 category</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">5</td>
                  <td className="py-2 px-3">Add indicators</td>
                  <td className="py-2 px-3 text-muted-foreground">Assign indicators to categories</td>
                  <td className="py-2 px-3 text-muted-foreground">At least 1 indicator</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">6</td>
                  <td className="py-2 px-3">Configure weights</td>
                  <td className="py-2 px-3 text-muted-foreground">Set indicator weights totaling 100%</td>
                  <td className="py-2 px-3 text-muted-foreground">Weight validation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">7</td>
                  <td className="py-2 px-3">Add BARS guides</td>
                  <td className="py-2 px-3 text-muted-foreground">Enter scoring guides for each indicator</td>
                  <td className="py-2 px-3 text-muted-foreground">Recommended</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">8</td>
                  <td className="py-2 px-3">Preview form</td>
                  <td className="py-2 px-3 text-muted-foreground">Review as assessor would see</td>
                  <td className="py-2 px-3 text-muted-foreground">Visual check</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">9</td>
                  <td className="py-2 px-3">Validate form</td>
                  <td className="py-2 px-3 text-muted-foreground">Run validation check</td>
                  <td className="py-2 px-3 text-muted-foreground">All rules pass</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">10</td>
                  <td className="py-2 px-3">Activate form</td>
                  <td className="py-2 px-3 text-muted-foreground">Toggle is_active = true</td>
                  <td className="py-2 px-3 text-muted-foreground">Form available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form Versioning */}
      <Card>
        <CardHeader>
          <CardTitle>Form Versioning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Version Control Rules</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Editing active form creates new draft version</li>
              <li>• Previous version remains active until new version published</li>
              <li>• Historical assessments reference their form version</li>
              <li>• Version history maintained for audit</li>
            </ul>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre">{`Form: Executive Readiness
Version History:
  v1 (2024-01-15) - Initial release, 28 indicators
  v2 (2024-06-01) - Added Learning Agility category, 32 indicators ← Active
  v3 (Draft) - Adding AI/Digital indicators`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
