import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Route, Clock, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CareerDevCareerPathsSection() {
  const careerPathFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'company_id', type: 'UUID', required: true, description: 'FK to companies table' },
    { field: 'name', type: 'Text', required: true, description: 'Career path name (e.g., "Engineering Track")' },
    { field: 'description', type: 'Text', required: false, description: 'Path purpose and target audience' },
    { field: 'is_active', type: 'Boolean', required: true, description: 'Whether path is available for assignment. Default: true' },
    { field: 'created_by', type: 'UUID', required: false, description: 'User who created the path' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  const careerPathStepFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'career_path_id', type: 'UUID', required: true, description: 'FK to career_paths table' },
    { field: 'job_id', type: 'UUID', required: true, description: 'FK to jobs table (position at this step)' },
    { field: 'step_order', type: 'Integer', required: true, description: 'Sequence within path (1, 2, 3...)' },
    { field: 'typical_duration_months', type: 'Integer', required: false, description: 'Expected time at this step before progression' },
    { field: 'requirements', type: 'Text', required: false, description: 'Prerequisites and requirements for this step' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <section id="chapter-2" data-manual-anchor="chapter-2" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Route className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">2. Career Paths Configuration</h2>
            <p className="text-muted-foreground">
              Create and manage career paths, define progression steps, and link to jobs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~50 min read
          </span>
          <span>Target: Admin, Consultant</span>
        </div>
      </section>

      {/* Section 2.1: Overview */}
      <section id="sec-2-1" data-manual-anchor="sec-2-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">2.1 Career Paths Overview</h3>
          <p className="text-muted-foreground">Career path concepts and relationship to job architecture</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              <strong>Career Paths</strong> define structured progression routes within the organization. Each path 
              represents a potential trajectory from entry-level to senior positions, linked to actual job positions 
              in your job architecture.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Path Examples</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Engineering Track (Junior → Senior → Lead → Principal)</li>
                  <li>• Management Track (IC → Team Lead → Manager → Director)</li>
                  <li>• Sales Track (SDR → AE → Senior AE → Regional Manager)</li>
                  <li>• Finance Track (Analyst → Senior Analyst → Manager → Controller)</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Strategic Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Increased employee engagement through visibility</li>
                  <li>• Reduced turnover with clear advancement opportunities</li>
                  <li>• Better workforce planning with defined pipelines</li>
                  <li>• Aligned development investments with career goals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2.2: Table Reference */}
      <section id="sec-2-2" data-manual-anchor="sec-2-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">2.2 Career Paths Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for career_paths table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">career_paths</code>
              <Badge variant="outline">8 columns</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {careerPathFields.map((field) => (
                  <TableRow key={field.field}>
                    <TableCell className="font-mono text-sm">{field.field}</TableCell>
                    <TableCell><Badge variant="secondary">{field.type}</Badge></TableCell>
                    <TableCell>
                      {field.required ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{field.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Section 2.3: Create Procedure */}
      <section id="sec-2-3" data-manual-anchor="sec-2-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">2.3 Create Career Path Procedure</h3>
          <p className="text-muted-foreground">Step-by-step procedure to create career paths</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Career Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'Navigate to Succession → Career Paths tab' },
                { step: 2, action: 'Select the target company from the company selector' },
                { step: 3, action: 'Click "Create Career Path" button' },
                { step: 4, action: 'Enter path name (e.g., "Engineering Track")' },
                { step: 5, action: 'Add description explaining path purpose and target audience' },
                { step: 6, action: 'Set is_active to true for immediate availability' },
                { step: 7, action: 'Click "Save" to create the path' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-emerald-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Step:</strong> After creating the path, add steps to define the progression sequence 
                (see Section 2.4).
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 2.4: Steps Configuration */}
      <section id="sec-2-4" data-manual-anchor="sec-2-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">2.4 Career Path Steps Configuration</h3>
          <p className="text-muted-foreground">Add steps to career paths with progression sequence</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Steps to Career Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'Open the career path you want to configure' },
                { step: 2, action: 'Click "Add Step" button' },
                { step: 3, action: 'Select a job from the job picker (links to jobs table)' },
                { step: 4, action: 'Set step_order (1 = entry level, increment for each progression)' },
                { step: 5, action: 'Enter typical_duration_months (e.g., 24 for 2 years)' },
                { step: 6, action: 'Add requirements text describing prerequisites' },
                { step: 7, action: 'Click "Save Step" to add to the path' },
                { step: 8, action: 'Repeat for all steps in the progression' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-emerald-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> The job_id must reference an existing job in the jobs table. 
                Ensure your job architecture is configured before creating career path steps.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 2.5: Steps Table Reference */}
      <section id="sec-2-5" data-manual-anchor="sec-2-5" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">2.5 Career Path Steps Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for career_path_steps table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">career_path_steps</code>
              <Badge variant="outline">8 columns</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {careerPathStepFields.map((field) => (
                  <TableRow key={field.field}>
                    <TableCell className="font-mono text-sm">{field.field}</TableCell>
                    <TableCell><Badge variant="secondary">{field.type}</Badge></TableCell>
                    <TableCell>
                      {field.required ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{field.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Section 2.6: Job Linking */}
      <section id="sec-2-6" data-manual-anchor="sec-2-6" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">2.6 Job Linking & Prerequisites</h3>
          <p className="text-muted-foreground">Link career steps to jobs and configure requirements</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              Each career path step links to a job in the <code>jobs</code> table. This connection ensures 
              career paths reflect actual organizational positions and enables skill gap analysis.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Job Linking Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Accurate salary range visibility</li>
                  <li>• Competency requirements from job profiles</li>
                  <li>• Skill gap calculation against target jobs</li>
                  <li>• Integration with succession planning</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Prerequisite Examples</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• "Minimum 2 years in current role"</li>
                  <li>• "Completion of Leadership Development Program"</li>
                  <li>• "Proficiency in required competencies at Level 3+"</li>
                  <li>• "Successful project delivery as technical lead"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2.7: Lifecycle */}
      <section id="sec-2-7" data-manual-anchor="sec-2-7" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-emerald-500 pl-4">
          <h3 className="text-xl font-semibold">2.7 Path Activation & Lifecycle</h3>
          <p className="text-muted-foreground">Manage path versions, activation status, and employee transitions</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 text-emerald-600">Active Path</h4>
                <p className="text-sm text-muted-foreground">
                  Path is visible to employees and available for assignment. New employees can be placed on this path.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 text-yellow-600">Inactive Path</h4>
                <p className="text-sm text-muted-foreground">
                  Path is hidden from employees but retained for historical tracking. Existing assignments remain valid.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 text-red-600">Archived Path</h4>
                <p className="text-sm text-muted-foreground">
                  Path is deprecated. Employees on this path should be transitioned to alternative paths.
                </p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Version Control:</strong> When significantly updating a career path, consider creating a 
                new version rather than modifying the existing path. This preserves historical progression data.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
