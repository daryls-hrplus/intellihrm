import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, GitBranch, Users, Link2 } from 'lucide-react';

export function ManualDiagrams() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Architecture Diagrams</h2>
        <p className="text-muted-foreground">Visual representations of system architecture and flows</p>
      </div>

      {/* Data Architecture */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle>Data Architecture</CardTitle>
          </div>
          <CardDescription>Core appraisal tables and relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`┌─────────────────────┐
│  appraisal_cycles   │◄──────┐
└─────────┬───────────┘       │
          │                   │
          ▼                   │
┌─────────────────────┐       │
│appraisal_participants│──────┤
└─────────┬───────────┘       │
          │                   │
          ▼                   │
┌─────────────────────┐       │
│  appraisal_scores   │       │
└─────────────────────┘       │
                              │
┌─────────────────────┐       │
│appraisal_form_templates│────┘
└─────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐
│appraisal_integration│───▶│ Nine-Box, Succession│
│      _rules         │    │ IDP, Compensation   │
└─────────────────────┘    └─────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Cycle Lifecycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle>Cycle Lifecycle Flow</CardTitle>
          </div>
          <CardDescription>Status progression through the appraisal cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center items-center gap-2 p-4">
            {[
              { status: 'Draft', color: 'bg-gray-200' },
              { status: 'Active', color: 'bg-blue-200' },
              { status: 'In Progress', color: 'bg-amber-200' },
              { status: 'Completed', color: 'bg-green-200' },
              { status: 'Closed', color: 'bg-purple-200' }
            ].map((item, i, arr) => (
              <div key={item.status} className="flex items-center gap-2">
                <div className={`px-4 py-2 rounded-lg ${item.color} font-medium text-sm`}>
                  {item.status}
                </div>
                {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Journey */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>User Journey Map</CardTitle>
          </div>
          <CardDescription>Role-based workflow through the appraisal process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { role: 'Employee', steps: ['Complete Self-Assessment', 'Review Manager Rating', 'Respond/Acknowledge', 'Attend Interview'] },
              { role: 'Manager', steps: ['Review Self-Assessment', 'Rate Performance', 'Use AI Assistant', 'Submit & Discuss'] },
              { role: 'HR', steps: ['Configure Cycle', 'Monitor Progress', 'Facilitate Calibration', 'Process Actions'] }
            ].map((journey) => (
              <div key={journey.role} className="flex items-start gap-4">
                <Badge variant="outline" className="min-w-[80px] justify-center">{journey.role}</Badge>
                <div className="flex flex-wrap gap-2">
                  {journey.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm px-3 py-1 bg-muted rounded">{step}</span>
                      {i < journey.steps.length - 1 && <span className="text-muted-foreground">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle>Integration Map</CardTitle>
          </div>
          <CardDescription>Upstream and downstream data connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">UPSTREAM</h4>
              <div className="space-y-2">
                {['Goals', 'Competencies', 'Job Profiles', '360 Feedback'].map((item) => (
                  <div key={item} className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-sm">{item}</div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="p-4 bg-primary text-primary-foreground rounded-lg font-medium">
                Appraisals Module
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">DOWNSTREAM</h4>
              <div className="space-y-2">
                {['Nine-Box', 'Succession', 'Compensation', 'Learning'].map((item) => (
                  <div key={item} className="p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
