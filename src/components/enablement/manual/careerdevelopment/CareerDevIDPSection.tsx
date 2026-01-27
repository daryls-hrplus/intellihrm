import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, Clock, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CareerDevIDPSection() {
  const idpFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'company_id', type: 'UUID', required: true, description: 'FK to companies table' },
    { field: 'employee_id', type: 'UUID', required: true, description: 'FK to profiles table (plan owner)' },
    { field: 'title', type: 'Text', required: true, description: 'Plan title (e.g., "2024 Development Plan")' },
    { field: 'description', type: 'Text', required: false, description: 'Plan overview and objectives' },
    { field: 'status', type: 'Text', required: true, description: 'Status: draft, active, completed, cancelled. Default: draft' },
    { field: 'start_date', type: 'Date', required: true, description: 'Plan effective start date' },
    { field: 'target_completion_date', type: 'Date', required: false, description: 'Target completion date' },
    { field: 'actual_completion_date', type: 'Date', required: false, description: 'Actual completion date (set on completion)' },
    { field: 'manager_id', type: 'UUID', required: false, description: 'FK to profiles (supervising manager)' },
    { field: 'created_by', type: 'UUID', required: false, description: 'User who created the plan' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  const idpGoalFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'idp_id', type: 'UUID', required: true, description: 'FK to individual_development_plans table' },
    { field: 'title', type: 'Text', required: true, description: 'Goal title (e.g., "Improve presentation skills")' },
    { field: 'description', type: 'Text', required: false, description: 'Detailed goal description' },
    { field: 'category', type: 'Text', required: true, description: 'Category: skill, knowledge, experience, certification, education. Default: skill' },
    { field: 'priority', type: 'Text', required: true, description: 'Priority: low, medium, high. Default: medium' },
    { field: 'status', type: 'Text', required: true, description: 'Status: not_started, in_progress, completed, cancelled. Default: not_started' },
    { field: 'target_date', type: 'Date', required: false, description: 'Goal deadline' },
    { field: 'progress_percentage', type: 'Integer', required: true, description: 'Completion percentage (0-100). Default: 0' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  const idpActivityFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'goal_id', type: 'UUID', required: true, description: 'FK to idp_goals table' },
    { field: 'title', type: 'Text', required: true, description: 'Activity title (e.g., "Complete leadership course")' },
    { field: 'description', type: 'Text', required: false, description: 'Detailed activity description' },
    { field: 'activity_type', type: 'Text', required: true, description: 'Type: training, mentoring, project, reading, course, certification, other. Default: training' },
    { field: 'status', type: 'Text', required: true, description: 'Status: pending, in_progress, completed. Default: pending' },
    { field: 'due_date', type: 'Date', required: false, description: 'Activity deadline' },
    { field: 'completion_date', type: 'Date', required: false, description: 'Actual completion date' },
    { field: 'notes', type: 'Text', required: false, description: 'Activity notes and outcomes' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <section id="chapter-4" data-manual-anchor="chapter-4" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">4. Individual Development Plans (IDP)</h2>
            <p className="text-muted-foreground">
              Create and manage IDPs with goals, activities, and progress tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~65 min read
          </span>
          <span>Target: Admin, HR Partner, Manager</span>
        </div>
      </section>

      {/* Section 4.1: Overview */}
      <section id="sec-4-1" data-manual-anchor="sec-4-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.1 IDP Architecture Overview</h3>
          <p className="text-muted-foreground">IDP structure, goal-activity hierarchy, and performance integration</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              <strong>Individual Development Plans (IDPs)</strong> are personalized roadmaps for employee growth. 
              Each IDP contains goals organized by category, with activities defining specific actions to achieve 
              those goals.
            </p>

            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-3">IDP Hierarchy</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500">IDP</Badge>
                  <span>→</span>
                  <span>Container with title, dates, and status</span>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <Badge className="bg-emerald-500">Goal</Badge>
                  <span>→</span>
                  <span>Development objective with category and priority</span>
                </div>
                <div className="flex items-center gap-2 ml-12">
                  <Badge className="bg-purple-500">Activity</Badge>
                  <span>→</span>
                  <span>Specific action with type and due date</span>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>70-20-10 Model:</strong> Activities should be balanced across experiential (70%), 
                social (20%), and formal learning (10%) types for optimal development outcomes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 4.2: IDP Table Reference */}
      <section id="sec-4-2" data-manual-anchor="sec-4-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.2 IDP Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for individual_development_plans table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">individual_development_plans</code>
              <Badge variant="outline">13 columns</Badge>
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
                {idpFields.map((field) => (
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

      {/* Section 4.3: Create IDPs */}
      <section id="sec-4-3" data-manual-anchor="sec-4-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.3 Create & Manage IDPs</h3>
          <p className="text-muted-foreground">Step-by-step procedure to create IDPs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Individual Development Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'Navigate to Succession → Career Development tab' },
                { step: 2, action: 'Select the target company from the company selector' },
                { step: 3, action: 'Click "Create IDP" button' },
                { step: 4, action: 'Select employee from employee picker' },
                { step: 5, action: 'Enter plan title (e.g., "2024 Development Plan")' },
                { step: 6, action: 'Set start_date and target_completion_date' },
                { step: 7, action: 'Assign manager_id for oversight' },
                { step: 8, action: 'Add description with plan objectives' },
                { step: 9, action: 'Set status to "draft" for initial creation' },
                { step: 10, action: 'Click "Save" to create the IDP' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-blue-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4.4: Goals Configuration */}
      <section id="sec-4-4" data-manual-anchor="sec-4-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.4 IDP Goals Configuration</h3>
          <p className="text-muted-foreground">Add development goals with categories, priorities, and target dates</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Goal to IDP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'Open the IDP you want to configure' },
                { step: 2, action: 'Click "Add Goal" button' },
                { step: 3, action: 'Enter goal title (SMART goal format recommended)' },
                { step: 4, action: 'Select category (skill, knowledge, experience, certification, education)' },
                { step: 5, action: 'Set priority (low, medium, high)' },
                { step: 6, action: 'Set target_date for goal completion' },
                { step: 7, action: 'Add description with success criteria' },
                { step: 8, action: 'Click "Save Goal"' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-blue-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4.5: Goals Table Reference */}
      <section id="sec-4-5" data-manual-anchor="sec-4-5" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.5 Goals Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for idp_goals table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">idp_goals</code>
              <Badge variant="outline">13 columns</Badge>
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
                {idpGoalFields.map((field) => (
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

      {/* Section 4.6: Goal Categories */}
      <section id="sec-4-6" data-manual-anchor="sec-4-6" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.6 Goal Categories</h3>
          <p className="text-muted-foreground">Configure goal categories aligned with 70-20-10 model</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { category: 'skill', description: 'Technical or soft skill development', example: 'Improve Python proficiency', color: 'bg-emerald-500' },
            { category: 'knowledge', description: 'Domain knowledge acquisition', example: 'Learn industry regulations', color: 'bg-blue-500' },
            { category: 'experience', description: 'Hands-on experiential learning', example: 'Lead cross-functional project', color: 'bg-purple-500' },
            { category: 'certification', description: 'Professional certifications', example: 'Obtain PMP certification', color: 'bg-orange-500' },
            { category: 'education', description: 'Formal education programs', example: 'Complete MBA program', color: 'bg-red-500' },
          ].map(({ category, description, example, color }) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className={color}>{category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{description}</p>
                <p className="text-xs italic">Example: "{example}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 4.7: Activities */}
      <section id="sec-4-7" data-manual-anchor="sec-4-7" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.7 IDP Activities</h3>
          <p className="text-muted-foreground">Add activities to goals with types and progress tracking</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Activity to Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'Open the goal you want to add activities to' },
                { step: 2, action: 'Click "Add Activity" button' },
                { step: 3, action: 'Enter activity title' },
                { step: 4, action: 'Select activity_type (training, mentoring, project, reading, course, certification, other)' },
                { step: 5, action: 'Set due_date for activity completion' },
                { step: 6, action: 'Add description with expected outcomes' },
                { step: 7, action: 'Click "Save Activity"' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-blue-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4.8: Activities Table Reference */}
      <section id="sec-4-8" data-manual-anchor="sec-4-8" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.8 Activities Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for idp_activities table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">idp_activities</code>
              <Badge variant="outline">11 columns</Badge>
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
                {idpActivityFields.map((field) => (
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

      {/* Section 4.9: Activity Types */}
      <section id="sec-4-9" data-manual-anchor="sec-4-9" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.9 Activity Types & Progress Tracking</h3>
          <p className="text-muted-foreground">Configure activity types aligned with 70-20-10 learning model</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>70-20-10</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Example</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge>project</Badge></TableCell>
                  <TableCell><Badge variant="outline">70% Experiential</Badge></TableCell>
                  <TableCell>Hands-on project work</TableCell>
                  <TableCell>Lead product launch initiative</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge>mentoring</Badge></TableCell>
                  <TableCell><Badge variant="outline">20% Social</Badge></TableCell>
                  <TableCell>Mentorship sessions</TableCell>
                  <TableCell>Weekly meetings with executive mentor</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge>training</Badge></TableCell>
                  <TableCell><Badge variant="outline">10% Formal</Badge></TableCell>
                  <TableCell>Instructor-led training</TableCell>
                  <TableCell>Attend leadership workshop</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge>course</Badge></TableCell>
                  <TableCell><Badge variant="outline">10% Formal</Badge></TableCell>
                  <TableCell>E-learning courses</TableCell>
                  <TableCell>Complete data analytics course</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge>certification</Badge></TableCell>
                  <TableCell><Badge variant="outline">10% Formal</Badge></TableCell>
                  <TableCell>Certification exams</TableCell>
                  <TableCell>Pass AWS Solutions Architect exam</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge>reading</Badge></TableCell>
                  <TableCell><Badge variant="outline">10% Formal</Badge></TableCell>
                  <TableCell>Self-directed reading</TableCell>
                  <TableCell>Read "Good to Great" book</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Section 4.10: IDP Lifecycle */}
      <section id="sec-4-10" data-manual-anchor="sec-4-10" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl font-semibold">4.10 IDP Lifecycle</h3>
          <p className="text-muted-foreground">Manage IDP status transitions from draft to completion</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 border rounded-lg text-center">
                <Badge className="bg-gray-500 mb-2">draft</Badge>
                <p className="text-sm text-muted-foreground">Initial creation, not visible to employee</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Badge className="bg-emerald-500 mb-2">active</Badge>
                <p className="text-sm text-muted-foreground">Published and visible to employee for execution</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Badge className="bg-blue-500 mb-2">completed</Badge>
                <p className="text-sm text-muted-foreground">All goals achieved, plan closed</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Badge className="bg-red-500 mb-2">cancelled</Badge>
                <p className="text-sm text-muted-foreground">Terminated early (e.g., role change)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
