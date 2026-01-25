import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Library, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Database, Copy, Lock, Pencil } from 'lucide-react';

export function F360FrameworkLibrary() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.8 Framework Library Configuration</h3>
        <p className="text-muted-foreground">
          The Framework Library contains pre-built and custom competency frameworks that can be 
          linked to 360 feedback questions for structured assessments.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Navigate and search the framework library</li>
            <li>• Clone system frameworks to create custom versions</li>
            <li>• Link frameworks to 360 feedback cycles</li>
            <li>• Understand framework versioning and lifecycle</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Navigation:</span>
            <span className="text-muted-foreground">
              Performance → Setup → 360 Feedback → Framework Library
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Database Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Database Table: feedback_frameworks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Field</TableHead>
                  <TableHead className="w-[80px]">Required</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { field: 'name', required: true, type: 'Text', desc: 'Framework display name' },
                  { field: 'code', required: true, type: 'Text', desc: 'Unique identifier code' },
                  { field: 'description', required: false, type: 'Text', desc: 'Purpose and usage notes' },
                  { field: 'framework_type', required: true, type: 'Enum', desc: 'system, industry, custom' },
                  { field: 'industry', required: false, type: 'Text', desc: 'Target industry (for industry type)' },
                  { field: 'competencies', required: true, type: 'JSON', desc: 'Array of competency definitions' },
                  { field: 'version', required: true, type: 'Text', desc: 'Version number (semver)' },
                  { field: 'is_locked', required: true, type: 'Boolean', desc: 'Prevents editing (system frameworks)' },
                  { field: 'cloned_from', required: false, type: 'UUID', desc: 'Source framework if cloned' },
                  { field: 'is_active', required: true, type: 'Boolean', desc: 'Available for use' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{row.field}</TableCell>
                    <TableCell>
                      <Badge variant={row.required ? 'default' : 'secondary'} className="text-xs">
                        {row.required ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.type}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Framework Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Library className="h-5 w-5" />
            Framework Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                type: 'System',
                icon: Lock,
                color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
                desc: 'Pre-built frameworks provided by HRplus. Read-only; must clone to customize.',
                examples: ['Universal Leadership', 'Core Values', 'Manager Effectiveness']
              },
              {
                type: 'Industry',
                icon: Library,
                color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
                desc: 'Sector-specific frameworks (healthcare, finance, technology). Clone to adapt.',
                examples: ['Healthcare Leadership', 'Financial Services', 'Technology Innovation']
              },
              {
                type: 'Custom',
                icon: Pencil,
                color: 'bg-green-100 dark:bg-green-900/30 border-green-300',
                desc: 'Organization-specific frameworks created from scratch or cloned from system/industry.',
                examples: ['[Your Company] Leadership', 'Engineering Excellence', 'Sales Competency Model']
              }
            ].map((item) => (
              <div key={item.type} className={`p-4 rounded-lg border ${item.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="h-5 w-5" />
                  <span className="font-semibold">{item.type}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                <div className="text-xs">
                  <span className="font-medium">Examples:</span>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {item.examples.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Frameworks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available System Frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { name: 'Universal Leadership', competencies: 8, focus: 'Leadership behaviors across all levels' },
              { name: 'Core Values Alignment', competencies: 5, focus: 'Cultural and values-based behaviors' },
              { name: 'Manager Effectiveness', competencies: 10, focus: 'People management and coaching' },
              { name: 'Executive Presence', competencies: 6, focus: 'Senior leadership and strategic thinking' },
              { name: 'Team Collaboration', competencies: 7, focus: 'Teamwork and cross-functional effectiveness' },
              { name: 'Customer Excellence', competencies: 6, focus: 'Customer-facing roles and service' },
              { name: 'Innovation & Agility', competencies: 5, focus: 'Change management and creativity' },
              { name: 'Technical Leadership', competencies: 8, focus: 'Technical roles with leadership responsibilities' },
            ].map((fw) => (
              <div key={fw.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium text-sm">{fw.name}</div>
                  <div className="text-xs text-muted-foreground">{fw.focus}</div>
                </div>
                <Badge variant="secondary">{fw.competencies} competencies</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Copy className="h-5 w-5" />
            Step-by-Step: Clone and Customize a Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to Framework Library', result: 'Displays all available frameworks' },
              { step: 2, action: 'Search or filter for desired framework', result: 'Use type, industry, or keyword filters' },
              { step: 3, action: 'Click on a system or industry framework', result: 'Opens framework detail view' },
              { step: 4, action: 'Click "Clone Framework" button', result: 'Opens clone dialog' },
              { step: 5, action: 'Enter new name and code for your custom version', result: 'e.g., "Acme Corp Leadership"' },
              { step: 6, action: 'Save the cloned framework', result: 'Creates editable copy in Custom type' },
              { step: 7, action: 'Edit competencies: add, remove, or modify', result: 'Customize to your organization' },
              { step: 8, action: 'Link questions to framework competencies', result: 'In Question Bank, select competency links' },
              { step: 9, action: 'Activate the framework', result: 'Available for use in cycles' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground">{item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Framework Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Framework Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border bg-muted/50">
            <pre className="text-xs overflow-x-auto">
{`{
  "name": "Universal Leadership",
  "competencies": [
    {
      "code": "VISION",
      "name": "Strategic Vision",
      "description": "Sets clear direction and inspires others",
      "behaviors": [
        "Communicates compelling vision",
        "Aligns team goals with strategy",
        "Anticipates future trends"
      ],
      "signal_category": "leadership"
    },
    {
      "code": "DECISION",
      "name": "Decision Making",
      "description": "Makes timely, sound decisions",
      "behaviors": [
        "Gathers relevant information",
        "Considers multiple perspectives",
        "Takes calculated risks"
      ],
      "signal_category": "leadership"
    }
    // ... more competencies
  ]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Versioning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Framework Versioning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Frameworks use semantic versioning (major.minor.patch) to track changes over time.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border">
              <Badge className="mb-2">Major (X.0.0)</Badge>
              <p className="text-xs text-muted-foreground">Breaking changes: competencies removed or significantly restructured</p>
            </div>
            <div className="p-3 rounded-lg border">
              <Badge variant="secondary" className="mb-2">Minor (0.X.0)</Badge>
              <p className="text-xs text-muted-foreground">New competencies or behaviors added</p>
            </div>
            <div className="p-3 rounded-lg border">
              <Badge variant="outline" className="mb-2">Patch (0.0.X)</Badge>
              <p className="text-xs text-muted-foreground">Text updates, typo fixes, clarifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-green-600" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Start with a system framework and customize—don't build from scratch</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Limit custom frameworks to 5-8 competencies for focus</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Define 3-5 observable behaviors per competency</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Version your frameworks—don't overwrite; create new versions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Align signal_category assignments with talent signal definitions</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                issue: 'Cannot edit system framework',
                cause: 'System frameworks are locked (is_locked = true)',
                solution: 'Clone the framework to create an editable custom copy'
              },
              {
                issue: 'Framework not appearing in cycle configuration',
                cause: 'Framework is_active = false or no linked questions',
                solution: 'Activate framework and ensure questions are linked'
              },
              {
                issue: 'Competency not appearing in reports',
                cause: 'No questions linked to that competency',
                solution: 'Link at least one question to each competency'
              },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-amber-300 bg-white dark:bg-background">
                <div className="font-medium text-sm">{item.issue}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Cause:</span> {item.cause}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <span className="font-medium">Solution:</span> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
