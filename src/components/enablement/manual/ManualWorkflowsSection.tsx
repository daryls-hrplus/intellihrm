import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, User, Users, CheckCircle } from 'lucide-react';
import { NavigationPath } from './NavigationPath';
import { NAVIGATION_PATHS } from './navigationPaths';
export function ManualWorkflowsSection() {
  return (
    <div className="space-y-8">
      {/* Cycle Lifecycle */}
      <Card id="sec-3-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 3.1</Badge>
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Per cycle</Badge>
          </div>
          <CardTitle className="text-2xl">Appraisal Cycle Lifecycle</CardTitle>
          <CardDescription>Understanding and managing cycle status progression</CardDescription>
        </CardHeader>
        <CardContent>
          <NavigationPath path={NAVIGATION_PATHS['sec-3-1']} />
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {['Draft', 'Active', 'In Progress', 'Completed', 'Closed'].map((status, i, arr) => (
              <div key={status} className="flex items-center gap-2">
                <Badge variant={i === 2 ? 'default' : 'outline'} className="py-1.5 px-3">
                  {status}
                </Badge>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[
              { status: 'Draft', desc: 'Cycle is being configured. Not visible to participants.' },
              { status: 'Active', desc: 'Cycle launched. Participants enrolled and can begin self-assessments.' },
              { status: 'In Progress', desc: 'Evaluations underway. Managers are rating participants.' },
              { status: 'Completed', desc: 'All evaluations submitted. Calibration can begin.' },
              { status: 'Closed', desc: 'Cycle archived. Scores finalized and downstream actions triggered.' }
            ].map((item) => (
              <div key={item.status} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <span className="font-medium min-w-[120px]">{item.status}</span>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manager Workflow */}
      <Card id="sec-3-2">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 3.3</Badge>
            <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" />Manager</Badge>
          </div>
          <CardTitle className="text-2xl">Manager Evaluation Workflow</CardTitle>
          <CardDescription>Complete guide for managers conducting evaluations (2-4 week window)</CardDescription>
        </CardHeader>
        <CardContent>
          <NavigationPath path={NAVIGATION_PATHS['sec-3-2']} />
          <div className="space-y-4">
            {[
              { step: 1, title: 'Access Pending Evaluations', desc: 'Navigate to MSS → Team Appraisals' },
              { step: 2, title: 'Review Self-Assessment', desc: 'Read employee self-ratings and comments' },
              { step: 3, title: 'Rate Goals', desc: 'Evaluate each goal with evidence and comments' },
              { step: 4, title: 'Rate Competencies', desc: 'Assess behavioral indicators at proficiency levels' },
              { step: 5, title: 'Rate Responsibilities', desc: 'Evaluate KRA achievement' },
              { step: 6, title: 'Use AI Feedback Assistant', desc: 'Generate strength statements and development suggestions' },
              { step: 7, title: 'Review Comment Quality', desc: 'Check AI-powered quality score and improve if needed' },
              { step: 8, title: 'Add Overall Comments', desc: 'Summarize performance and development focus' },
              { step: 9, title: 'Save or Submit', desc: 'Save draft or submit for finalization' },
              { step: 10, title: 'Schedule Interview', desc: 'Book performance discussion meeting' }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-4 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Response */}
      <Card id="sec-3-3">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 3.7</Badge>
            <Badge variant="secondary" className="gap-1"><User className="h-3 w-3" />Employee</Badge>
          </div>
          <CardTitle className="text-2xl">Employee Response Phase</CardTitle>
          <CardDescription>Managing employee acknowledgment (5-10 business days)</CardDescription>
        </CardHeader>
        <CardContent>
          <NavigationPath path={NAVIGATION_PATHS['sec-3-3']} />
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { type: 'Agree', color: 'bg-green-100 border-green-300', desc: 'Accept the evaluation as-is' },
              { type: 'Partially Disagree', color: 'bg-amber-100 border-amber-300', desc: 'Comment on specific areas' },
              { type: 'Disagree', color: 'bg-red-100 border-red-300', desc: 'Request HR escalation' }
            ].map((item) => (
              <Card key={item.type} className={`${item.color} border-2`}>
                <CardContent className="pt-4">
                  <h4 className="font-medium">{item.type}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
