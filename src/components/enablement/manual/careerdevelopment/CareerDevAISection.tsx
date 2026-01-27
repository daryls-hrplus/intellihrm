import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Clock, CheckCircle, Info, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CareerDevAISection() {
  const developmentThemeFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'employee_id', type: 'UUID', required: true, description: 'FK to profiles table' },
    { field: 'company_id', type: 'UUID', required: true, description: 'FK to companies table' },
    { field: 'source_cycle_id', type: 'UUID', required: false, description: 'FK to appraisal/feedback cycle that triggered generation' },
    { field: 'theme_code', type: 'Text', required: true, description: 'System code for theme (e.g., "LEADERSHIP_GROWTH")' },
    { field: 'theme_name', type: 'Text', required: true, description: 'Human-readable theme name' },
    { field: 'theme_description', type: 'Text', required: false, description: 'Detailed theme description and rationale' },
    { field: 'signal_ids', type: 'UUID[]', required: false, description: 'Array of talent signal IDs that contributed' },
    { field: 'confidence_score', type: 'Numeric', required: true, description: 'AI confidence (0.0-1.0). Default: 0.5' },
    { field: 'ai_generated', type: 'Boolean', required: true, description: 'Whether theme was AI-generated. Default: true' },
    { field: 'is_confirmed', type: 'Boolean', required: true, description: 'Manager/HR confirmation status. Default: false' },
    { field: 'confirmed_by', type: 'UUID', required: false, description: 'User who confirmed the theme' },
    { field: 'confirmed_at', type: 'Timestamp', required: false, description: 'When theme was confirmed' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
    { field: 'updated_at', type: 'Timestamp', required: true, description: 'Auto-updated modification timestamp' },
  ];

  const developmentRecommendationFields = [
    { field: 'id', type: 'UUID', required: true, description: 'Primary key (auto-generated)' },
    { field: 'theme_id', type: 'UUID', required: true, description: 'FK to development_themes table' },
    { field: 'recommendation_type', type: 'Text', required: true, description: 'Type: course, learning_path, mentorship, project, book' },
    { field: 'recommendation_text', type: 'Text', required: true, description: 'Recommendation description' },
    { field: 'priority_order', type: 'Integer', required: true, description: 'Priority within theme (1 = highest). Default: 1' },
    { field: 'linked_learning_path_id', type: 'UUID', required: false, description: 'FK to learning paths if applicable' },
    { field: 'linked_course_ids', type: 'UUID[]', required: false, description: 'Array of linked training course IDs' },
    { field: 'is_accepted', type: 'Boolean', required: true, description: 'Employee/manager acceptance. Default: false' },
    { field: 'accepted_at', type: 'Timestamp', required: false, description: 'When recommendation was accepted' },
    { field: 'created_at', type: 'Timestamp', required: true, description: 'Auto-generated creation timestamp' },
  ];

  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <section id="chapter-5" data-manual-anchor="chapter-5" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Brain className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">5. Development Themes & AI Recommendations</h2>
            <p className="text-muted-foreground">
              AI-driven development theme generation and personalized learning recommendations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~45 min read
          </span>
          <span>Target: Admin, HR Partner</span>
        </div>
      </section>

      {/* Section 5.1: Overview */}
      <section id="sec-5-1" data-manual-anchor="sec-5-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">5.1 AI-Driven Development Overview</h3>
          <p className="text-muted-foreground">How AI generates development themes from talent signals</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              The AI-driven development system analyzes multiple talent signals to identify development themes 
              and recommend personalized learning activities. This follows ISO 42001 AI governance principles 
              with human-in-the-loop confirmation.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  Input Signals
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Appraisal ratings and feedback</li>
                  <li>• 360 Feedback responses</li>
                  <li>• Goal completion patterns</li>
                  <li>• Competency assessment gaps</li>
                  <li>• Career path progression</li>
                  <li>• Skill inventory gaps</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-orange-500" />
                  Output Themes
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Leadership development</li>
                  <li>• Technical skill enhancement</li>
                  <li>• Communication improvement</li>
                  <li>• Strategic thinking</li>
                  <li>• People management</li>
                  <li>• Domain expertise</li>
                </ul>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>ISO 42001 Compliance:</strong> AI-generated themes require human confirmation before 
                becoming visible to employees. This ensures appropriate oversight of AI recommendations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 5.2: Themes Table Reference */}
      <section id="sec-5-2" data-manual-anchor="sec-5-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">5.2 Development Themes Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for development_themes table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">development_themes</code>
              <Badge variant="outline">15 columns</Badge>
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
                {developmentThemeFields.map((field) => (
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

      {/* Section 5.3: Theme Generation */}
      <section id="sec-5-3" data-manual-anchor="sec-5-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">5.3 Theme Generation from Talent Signals</h3>
          <p className="text-muted-foreground">How themes are generated from performance and feedback data</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              Development themes are generated automatically after performance cycles complete. The AI analyzes 
              aggregated talent signals to identify patterns and focus areas for each employee.
            </p>

            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-3">Generation Triggers</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trigger Event</TableHead>
                    <TableHead>Signal Source</TableHead>
                    <TableHead>Theme Types</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Appraisal cycle completion</TableCell>
                    <TableCell>Overall ratings, competency scores</TableCell>
                    <TableCell>Skill, leadership, performance</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>360 Feedback completion</TableCell>
                    <TableCell>Multi-rater feedback themes</TableCell>
                    <TableCell>Communication, collaboration</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Goal cycle completion</TableCell>
                    <TableCell>Goal achievement patterns</TableCell>
                    <TableCell>Strategic, execution</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Competency assessment</TableCell>
                    <TableCell>Gap analysis results</TableCell>
                    <TableCell>Technical, functional</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 5.4: Confirmation Workflow */}
      <section id="sec-5-4" data-manual-anchor="sec-5-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">5.4 Theme Confirmation Workflow</h3>
          <p className="text-muted-foreground">Human-in-the-loop review before employee visibility</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Confirm Development Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, action: 'AI generates theme and sets is_confirmed = false' },
                { step: 2, action: 'Manager/HR receives notification of pending themes' },
                { step: 3, action: 'Navigate to Performance → Development Themes' },
                { step: 4, action: 'Review theme_name and theme_description' },
                { step: 5, action: 'Check confidence_score (higher = more reliable)' },
                { step: 6, action: 'View signal_ids to understand source data' },
                { step: 7, action: 'Click "Confirm" to approve or "Reject" to dismiss' },
                { step: 8, action: 'Confirmed themes become visible to employee' },
              ].map(({ step, action }) => (
                <div key={step} className="flex items-start gap-3">
                  <Badge className="bg-orange-500">{step}</Badge>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Confidence Threshold:</strong> Themes with confidence_score below 0.6 should be 
                reviewed carefully. Consider modifying the theme_description or rejecting if not applicable.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 5.5: Recommendations */}
      <section id="sec-5-5" data-manual-anchor="sec-5-5" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">5.5 Development Recommendations</h3>
          <p className="text-muted-foreground">AI-generated learning and development activity recommendations</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              For each confirmed development theme, the AI generates specific recommendations. These can 
              be linked to existing L&D courses, learning paths, or suggest activities like mentorship.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { type: 'course', description: 'Formal training courses from LMS', icon: '📚' },
                { type: 'learning_path', description: 'Curated learning sequences', icon: '🎯' },
                { type: 'mentorship', description: 'Mentoring relationships', icon: '👥' },
                { type: 'project', description: 'Stretch assignments and projects', icon: '💼' },
                { type: 'book', description: 'Reading recommendations', icon: '📖' },
              ].map(({ type, description, icon }) => (
                <div key={type} className="p-4 border rounded-lg text-center">
                  <span className="text-2xl">{icon}</span>
                  <Badge className="mt-2 mb-1">{type}</Badge>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 5.6: Recommendations Table Reference */}
      <section id="sec-5-6" data-manual-anchor="sec-5-6" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">5.6 Recommendations Table Reference</h3>
          <p className="text-muted-foreground">Complete field reference for development_recommendations table</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">development_recommendations</code>
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
                {developmentRecommendationFields.map((field) => (
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

      {/* Section 5.7: Learning Path Integration */}
      <section id="sec-5-7" data-manual-anchor="sec-5-7" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">5.7 Learning Path Integration</h3>
          <p className="text-muted-foreground">Link recommendations to L&D courses and learning paths</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              Recommendations can be directly linked to existing L&D content through the 
              <code className="mx-1 text-sm bg-muted px-1 rounded">linked_learning_path_id</code> and 
              <code className="mx-1 text-sm bg-muted px-1 rounded">linked_course_ids</code> fields.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Automatic Linking</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI matches recommendation text to course catalog</li>
                  <li>• Learning paths suggested based on theme category</li>
                  <li>• Competency-to-course mappings applied</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Manual Linking</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Admin can override linked courses</li>
                  <li>• Add specific learning paths to recommendations</li>
                  <li>• Configure external resources</li>
                </ul>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Acceptance Flow:</strong> When an employee accepts a recommendation with linked courses, 
                those courses can be auto-added to their IDP activities (see Chapter 4) or training requests.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
