import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CareerDevMentorshipSection() {
  const mentorshipProgramFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'company_id', type: 'UUID', required: true, description: 'FK to companies table' },
    { field: 'name', type: 'Text', required: true, description: 'Program name (e.g., "Leadership Mentorship 2024")' },
    { field: 'description', type: 'Text', required: false, description: 'Program goals and eligibility criteria' },
    { field: 'program_type', type: 'Text', required: true, description: 'Type: succession, development, onboarding, leadership. Default: development' },
    { field: 'is_active', type: 'Boolean', required: true, description: 'Whether program is active. Default: true' },
    { field: 'start_date', type: 'Date', required: true, description: 'Program launch date' },
    { field: 'end_date', type: 'Date', required: false, description: 'Program conclusion date (optional for ongoing)' },
    { field: 'created_by', type: 'UUID', required: false, description: 'User who created the program' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  const mentorshipPairingFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'program_id', type: 'UUID', required: true, description: 'FK to mentorship_programs table' },
    { field: 'mentor_id', type: 'UUID', required: true, description: 'FK to profiles table (mentor employee)' },
    { field: 'mentee_id', type: 'UUID', required: true, description: 'FK to profiles table (mentee employee)' },
    { field: 'status', type: 'Text', required: true, description: 'Status: active, completed, paused, cancelled. Default: active' },
    { field: 'start_date', type: 'Date', required: true, description: 'Pairing start date' },
    { field: 'end_date', type: 'Date', required: false, description: 'Pairing conclusion date' },
    { field: 'goals', type: 'Text', required: false, description: 'Relationship goals and objectives' },
    { field: 'notes', type: 'Text', required: false, description: 'Admin notes about the pairing' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  const mentorshipSessionFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'pairing_id', type: 'UUID', required: true, description: 'FK to mentorship_pairings table' },
    { field: 'session_date', type: 'Timestamp', required: true, description: 'Scheduled or actual session date/time' },
    { field: 'duration_minutes', type: 'Integer', required: false, description: 'Session length in minutes' },
    { field: 'topics', type: 'Text', required: false, description: 'Discussion topics covered' },
    { field: 'notes', type: 'Text', required: false, description: 'Session notes and key takeaways' },
    { field: 'action_items', type: 'Text', required: false, description: 'Follow-up actions assigned' },
    { field: 'status', type: 'Text', required: true, description: 'Status: scheduled, completed, cancelled. Default: scheduled' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <section id="chapter-3" data-manual-anchor="chapter-3" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">3. Mentorship Programs</h2>
            <p className="text-muted-foreground">
              Create mentorship programs, manage pairings, and track mentoring sessions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~55 min read
          </span>
          <span>Target: Admin, HR Partner</span>
        </div>
      </section>

      {/* Section 3.1: Overview */}
      <section id="sec-3-1" data-manual-anchor="sec-3-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.1 Mentorship Programs Overview</h3>
          <p className="text-muted-foreground">Mentorship value proposition and organizational benefits</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              <strong>Mentorship Programs</strong> formalize knowledge transfer and career guidance relationships 
              within the organization. Effective mentorship increases retention, accelerates development, and 
              strengthens organizational culture.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Program Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 25% higher retention (SHRM research)</li>
                  <li>• Accelerated skill development</li>
                  <li>• Knowledge transfer across generations</li>
                  <li>• Stronger organizational culture</li>
                  <li>• Enhanced leadership pipeline</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Success Factors</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clear program objectives</li>
                  <li>• Thoughtful mentor-mentee matching</li>
                  <li>• Structured session cadence</li>
                  <li>• Regular progress tracking</li>
                  <li>• Program completion recognition</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3.2: Programs Table Reference */}
      <section id="sec-3-2" data-manual-anchor="sec-3-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.2 Programs Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for mentorship_programs table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">mentorship_programs</code>
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
                {mentorshipProgramFields.map((field) => (
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

      {/* Section 3.3: Create Program */}
      <section id="sec-3-3" data-manual-anchor="sec-3-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.3 Create Mentorship Program</h3>
          <p className="text-muted-foreground">Step-by-step procedure to create mentorship programs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Mentorship Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'Navigate to Succession → Mentorship tab' },
                { step: 2, action: 'Select the target company from the company selector' },
                { step: 3, action: 'Click "Create Program" button' },
                { step: 4, action: 'Enter program name (e.g., "Leadership Mentorship 2024")' },
                { step: 5, action: 'Select program type (see Section 3.4 for types)' },
                { step: 6, action: 'Set start_date and optional end_date' },
                { step: 7, action: 'Add description with goals and eligibility criteria' },
                { step: 8, action: 'Click "Save" to create the program' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-purple-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3.4: Program Types */}
      <section id="sec-3-4" data-manual-anchor="sec-3-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.4 Program Types</h3>
          <p className="text-muted-foreground">Configure different mentorship program types for various purposes</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge className="bg-orange-500">succession</Badge>
                Succession Mentorship
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Pairs succession candidates with executives or outgoing position holders. 
              Focus on leadership readiness and organizational knowledge transfer.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge className="bg-emerald-500">development</Badge>
                Development Mentorship
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              General career development mentorship for skill building and career guidance. 
              Available to all employees seeking professional growth.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge className="bg-blue-500">onboarding</Badge>
                Onboarding Mentorship
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Pairs new hires with experienced employees for cultural integration and 
              role-specific guidance during the first 90 days.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge className="bg-purple-500">leadership</Badge>
                Leadership Mentorship
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Executive-level mentorship for emerging leaders. Focus on strategic thinking, 
              decision-making, and executive presence development.
            </CardContent>
          </Card>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Succession Integration:</strong> Programs with type='succession' are automatically 
            surfaced in the Succession module for candidate development planning.
          </AlertDescription>
        </Alert>
      </section>

      {/* Section 3.5: Pairings */}
      <section id="sec-3-5" data-manual-anchor="sec-3-5" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.5 Mentor-Mentee Pairings</h3>
          <p className="text-muted-foreground">Create and manage mentor-mentee relationships</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Pairing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'Open the mentorship program' },
                { step: 2, action: 'Click "Add Pairing" button' },
                { step: 3, action: 'Select mentor from employee picker' },
                { step: 4, action: 'Select mentee from employee picker (must be different from mentor)' },
                { step: 5, action: 'Set pairing start_date' },
                { step: 6, action: 'Define relationship goals' },
                { step: 7, action: 'Click "Save" to create the pairing' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-purple-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Validation:</strong> The system prevents pairing an employee with themselves. 
                Mentor and mentee must be different employees.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 3.6: Pairings Table Reference */}
      <section id="sec-3-6" data-manual-anchor="sec-3-6" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.6 Pairings Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for mentorship_pairings table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">mentorship_pairings</code>
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
                {mentorshipPairingFields.map((field) => (
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

      {/* Section 3.7: Pairing Lifecycle */}
      <section id="sec-3-7" data-manual-anchor="sec-3-7" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.7 Pairing Lifecycle Management</h3>
          <p className="text-muted-foreground">Manage pairing status transitions</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 border rounded-lg text-center">
                <Badge className="bg-emerald-500 mb-2">active</Badge>
                <p className="text-sm text-muted-foreground">Pairing is ongoing with regular sessions</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Badge className="bg-yellow-500 mb-2">paused</Badge>
                <p className="text-sm text-muted-foreground">Temporarily suspended (e.g., leave of absence)</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Badge className="bg-blue-500 mb-2">completed</Badge>
                <p className="text-sm text-muted-foreground">Successfully concluded per program timeline</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Badge className="bg-red-500 mb-2">cancelled</Badge>
                <p className="text-sm text-muted-foreground">Terminated early (mismatch, departure)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3.8: Sessions */}
      <section id="sec-3-8" data-manual-anchor="sec-3-8" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.8 Session Tracking</h3>
          <p className="text-muted-foreground">Schedule and document mentorship sessions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log Mentorship Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'Open the mentorship pairing' },
                { step: 2, action: 'Click "Add Session" button' },
                { step: 3, action: 'Set session_date and duration_minutes' },
                { step: 4, action: 'Enter topics discussed' },
                { step: 5, action: 'Add session notes with key takeaways' },
                { step: 6, action: 'Document action_items for follow-up' },
                { step: 7, action: 'Set status to "completed" when finished' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-purple-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3.9: Sessions Table Reference */}
      <section id="sec-3-9" data-manual-anchor="sec-3-9" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-xl font-semibold">3.9 Sessions Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for mentorship_sessions table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">mentorship_sessions</code>
              <Badge variant="outline">10 columns</Badge>
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
                {mentorshipSessionFields.map((field) => (
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
    </div>
  );
}
