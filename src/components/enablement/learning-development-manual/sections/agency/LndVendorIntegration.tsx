import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Target, Brain } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorIntegration() {
  return (
    <section className="space-y-6" id="sec-3-12" data-manual-anchor="sec-3-12">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-6 w-6 text-emerald-600" />
          3.12 Integration with Training Needs
        </h2>
        <p className="text-muted-foreground">
          Connect vendor courses to competency gaps for AI-powered recommendations.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Map vendor courses to competency framework</li>
            <li>Enable AI-driven course recommendations</li>
            <li>Automate gap-based training requests</li>
            <li>Track competency development through external training</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Gap-to-Course Mapping</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
COMPETENCY GAP → VENDOR COURSE RECOMMENDATION
═════════════════════════════════════════════

Employee: John Smith
Role: Senior Developer → Target: Technical Lead

Gap Detected:
├── Project Management: Current 2, Required 4 (Gap: 2)
└── Risk Assessment: Current 1, Required 3 (Gap: 2)

AI Recommendation:
┌─────────────────────────────────────────────────────┐
│ Recommended Vendor Course: PMP Certification        │
│ Provider: PMI Authorized Training Partner           │
│ Duration: 5 days | Cost: $2,955                     │
│ Competency Coverage:                                │
│   ✓ Project Management: +2 levels                   │
│   ✓ Risk Assessment: +2 levels                      │
│ Gap Closure: 100%                                   │
└─────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertTitle>AI-Powered Recommendations</AlertTitle>
        <AlertDescription>
          The system uses competency_course_mappings to match employee skill gaps with 
          appropriate vendor courses. AI considers cost, duration, location preferences, 
          and past learner success rates to optimize recommendations.
        </AlertDescription>
      </Alert>
    </section>
  );
}
