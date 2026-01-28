import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Compass, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  User,
  BookOpen,
  GraduationCap,
  Award,
  Smartphone
} from 'lucide-react';

export function LndWorkflowLearnerJourney() {
  return (
    <section className="space-y-6" id="sec-4-1" data-manual-anchor="sec-4-1">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Compass className="h-6 w-6 text-emerald-600" />
          4.1 Learner Journey Overview
        </h2>
        <p className="text-muted-foreground">
          Complete end-to-end learner experience from course discovery through certification,
          aligned with Workday Learning and SAP SuccessFactors patterns.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Understand the 6-stage learner journey from discovery to certification</li>
            <li>Navigate the ESS "My Training" portal and catalog</li>
            <li>Track personal progress and upcoming deadlines</li>
            <li>Access mobile learning options and offline capabilities</li>
            <li>Manage personal learning paths and development goals</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Learner Journey Stages (ADDIE-Aligned)</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE LEARNER JOURNEY                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│   │ DISCOVER │───▶│  ENROLL  │───▶│  LEARN   │───▶│  ASSESS  │───▶│ COMPLETE │  │
│   │  Stage 1 │    │  Stage 2 │    │  Stage 3 │    │  Stage 4 │    │  Stage 5 │  │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────┬─────┘  │
│        │                                                               │        │
│        │         ┌─────────────────────────────────────────────────────┘        │
│        │         │                                                              │
│        │         ▼                                                              │
│        │    ┌──────────┐                                                        │
│        │    │ CERTIFY  │                                                        │
│        │    │  Stage 6 │                                                        │
│        │    └──────────┘                                                        │
│        │                                                                        │
│        └──────────────────────────────────────────────────────────────────────▶ │
│                     (Self-directed learning loop)                               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

Stage Details:
━━━━━━━━━━━━━━
Stage 1 - DISCOVER:  Browse catalog, search courses, view recommendations
Stage 2 - ENROLL:    Self-enroll, accept assignment, join learning path
Stage 3 - LEARN:     Complete lessons, watch videos, access materials
Stage 4 - ASSESS:    Take quizzes, submit assignments, practice skills
Stage 5 - COMPLETE:  Finish course, submit evaluation, close enrollment
Stage 6 - CERTIFY:   Receive certificate, add to profile, track expiry
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>ESS "My Training" Portal Navigation</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>ESS</span>
              <ArrowRight className="h-4 w-4" />
              <span>My Training</span>
              <ArrowRight className="h-4 w-4" />
              <span>[Tab Selection]</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">My Courses</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Active enrollments, in-progress courses, resume learning
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold">Catalog</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Browse all available courses, filter by category, search
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">Learning Paths</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Structured journeys, career development tracks
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold">Certificates</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earned credentials, download PDFs, verification codes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Enrollment Sources by Journey Stage</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Source Type</th>
                  <th className="text-left py-2 font-semibold">Initiated By</th>
                  <th className="text-left py-2 font-semibold">Approval Required</th>
                  <th className="text-left py-2 font-semibold">Section Reference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Self-Service</td>
                  <td className="py-2">Employee</td>
                  <td className="py-2">Depends on course settings</td>
                  <td className="py-2"><Badge variant="outline">4.7</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Manager Assignment</td>
                  <td className="py-2">Direct Manager</td>
                  <td className="py-2">No (pre-approved)</td>
                  <td className="py-2"><Badge variant="outline">4.2</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Gap Analysis</td>
                  <td className="py-2">System (AI)</td>
                  <td className="py-2">Manager approval</td>
                  <td className="py-2"><Badge variant="outline">4.8</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Appraisal Outcome</td>
                  <td className="py-2">Performance System</td>
                  <td className="py-2">Auto-approved</td>
                  <td className="py-2"><Badge variant="outline">4.9</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Onboarding Task</td>
                  <td className="py-2">Onboarding System</td>
                  <td className="py-2">Auto-approved</td>
                  <td className="py-2"><Badge variant="outline">4.10</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">HR Bulk Assignment</td>
                  <td className="py-2">HR Admin</td>
                  <td className="py-2">Pre-approved</td>
                  <td className="py-2"><Badge variant="outline">4.11</Badge></td>
                </tr>
                <tr>
                  <td className="py-2">Training Invitation</td>
                  <td className="py-2">Manager (RSVP)</td>
                  <td className="py-2">Employee acceptance</td>
                  <td className="py-2"><Badge variant="outline">4.12</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Learning & Offline Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Mobile Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Responsive web app works on all devices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Video streaming optimized for mobile networks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Push notifications for deadlines and reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Resume learning from any device</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Offline Considerations</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>PDF materials downloadable for offline reading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Progress syncs when connectivity restored</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Quiz attempts require online connection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>SCORM content may have offline limitations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Industry Benchmark</AlertTitle>
        <AlertDescription>
          Organizations with structured learner journeys see 40% higher course completion rates 
          compared to those with ad-hoc training access (Brandon Hall Group, 2024). The 6-stage 
          model aligns with Workday Learning's "Discover-Learn-Apply" framework.
        </AlertDescription>
      </Alert>
    </section>
  );
}
