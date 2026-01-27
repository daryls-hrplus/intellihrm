import { LearningObjectives } from '../../../components/LearningObjectives';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { Network, ArrowRight, Shield, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand how 360 signals feed other Intelli HRM modules',
  'Configure signal routing based on cycle purpose',
  'Manage consent and policy gates for cross-module sharing',
  'Interpret 360 insights in downstream contexts'
];

const integrationPoints = [
  {
    module: 'Performance Appraisals',
    icon: '📊',
    dataFlow: 'Signals → Manager Evaluation Context',
    useCase: 'Managers see 360 insights when completing appraisals',
    consentRequired: 'AI Analysis + Cross-Module Sharing',
    example: 'Leadership signal (0.85) displayed as evidence during competency rating'
  },
  {
    module: 'Succession Planning',
    icon: '📈',
    dataFlow: 'Signals → Nine-Box Readiness Scoring',
    useCase: 'Talent signals inform potential and performance placement',
    consentRequired: 'Signal Generation',
    example: 'Strategic thinking signal contributes to "High Potential" classification'
  },
  {
    module: 'Learning & Development',
    icon: '📚',
    dataFlow: 'Themes → Course Recommendations',
    useCase: 'Development themes trigger targeted learning suggestions',
    consentRequired: 'AI Analysis',
    example: 'Communication development theme → "Executive Presence" course recommendation'
  },
  {
    module: 'Workforce Planning',
    icon: '👥',
    dataFlow: 'Aggregate Signals → Capability Analysis',
    useCase: 'Organization-level signal aggregation for capability gaps',
    consentRequired: 'Signal Aggregation policy',
    example: 'Leadership signal average by department → succession risk analysis'
  }
];

const signalRouting = [
  {
    purpose: 'development',
    appraisal: false,
    talentProfile: true,
    nineBox: false,
    succession: false,
    analytics: true,
    tone: 'development'
  },
  {
    purpose: 'evaluation',
    appraisal: true,
    talentProfile: true,
    nineBox: true,
    succession: true,
    analytics: true,
    tone: 'evaluative'
  },
  {
    purpose: 'assessment',
    appraisal: false,
    talentProfile: true,
    nineBox: true,
    succession: true,
    analytics: true,
    tone: 'neutral'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Cross-module sharing requires policy approval',
    enforcement: 'System',
    description: 'Data policies must explicitly enable cross_module_sharing before signals flow'
  },
  {
    rule: 'Cycle purpose determines default routing',
    enforcement: 'System',
    description: 'Development cycles default to limited sharing; evaluation cycles enable broader access'
  },
  {
    rule: 'Consent gates are enforced',
    enforcement: 'System',
    description: 'Individual consent flags override policy defaults; declined = no sharing'
  },
  {
    rule: 'Aggregation respects anonymity',
    enforcement: 'System',
    description: 'Cross-module aggregations maintain k-anonymity thresholds'
  },
  {
    rule: 'AI tone matches cycle purpose',
    enforcement: 'Policy',
    description: 'AI-generated content uses development vs. evaluative language based on configuration'
  }
];

export function AICrossModuleIntelligence() {
  return (
    <section id="sec-5-11" data-manual-anchor="sec-5-11" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          5.11 Cross-Module AI Intelligence
        </h3>
        <p className="text-muted-foreground mt-2">
          How 360 feedback AI insights integrate with Appraisals, Succession, L&D, and Workforce Planning.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Cross-Module Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Database className="h-4 w-4" />
            360 Intelligence Distribution
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    360 → CROSS-MODULE INTELLIGENCE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                     ┌────────────────────────────────────┐                  │
│                     │        360 FEEDBACK CYCLE          │                  │
│                     │  • Signals extracted               │                  │
│                     │  • Themes generated                │                  │
│                     │  • Consent/policy checked          │                  │
│                     └───────────────┬────────────────────┘                  │
│                                     │                                        │
│                     ┌───────────────┼───────────────┐                       │
│                     │               │               │                       │
│                     ▼               ▼               ▼                       │
│              ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│              │  CONSENT   │ │   POLICY   │ │   CYCLE    │                  │
│              │   GATE     │ │    GATE    │ │  PURPOSE   │                  │
│              │            │ │            │ │   GATE     │                  │
│              └─────┬──────┘ └─────┬──────┘ └─────┬──────┘                  │
│                    │              │              │                          │
│                    └──────────────┼──────────────┘                          │
│                                   │                                          │
│                                   ▼                                          │
│              ┌────────────────────────────────────────────────────┐        │
│              │                SIGNAL ROUTER                        │        │
│              │  Based on: cycle_purpose + consent + policy        │        │
│              └───────────────────┬────────────────────────────────┘        │
│                                  │                                          │
│         ┌────────────────────────┼────────────────────────┐                │
│         │            │           │           │            │                │
│         ▼            ▼           ▼           ▼            ▼                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ APPRAISALS │ │ SUCCESSION │ │  NINE-BOX  │ │   L&D      │ │WORKFORCE ││
│  │            │ │  PLANNING  │ │   GRID     │ │            │ │ PLANNING ││
│  │ Manager    │ │ Readiness  │ │ Potential  │ │ Course     │ │Capability││
│  │ Context    │ │ Scoring    │ │ Assessment │ │ Recommends │ │ Gaps     ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └──────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Integration Points */}
      <div>
        <h4 className="font-medium mb-4">Module Integration Points</h4>
        <div className="space-y-4">
          {integrationPoints.map((ip) => (
            <Card key={ip.module}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{ip.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{ip.module}</h5>
                      <Badge variant="outline" className="text-xs">
                        {ip.dataFlow}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{ip.useCase}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Consent: {ip.consentRequired}</span>
                    </div>
                    <div className="mt-2 p-2 bg-muted rounded text-xs italic">
                      Example: {ip.example}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Signal Routing by Cycle Purpose */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Signal Routing by Cycle Purpose</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Purpose</th>
                  <th className="text-center p-2 font-medium">Appraisal</th>
                  <th className="text-center p-2 font-medium">Talent Profile</th>
                  <th className="text-center p-2 font-medium">Nine-Box</th>
                  <th className="text-center p-2 font-medium">Succession</th>
                  <th className="text-center p-2 font-medium">Analytics</th>
                  <th className="text-center p-2 font-medium">AI Tone</th>
                </tr>
              </thead>
              <tbody>
                {signalRouting.map((row) => (
                  <tr key={row.purpose} className="border-b">
                    <td className="p-2 font-medium capitalize">{row.purpose}</td>
                    <td className="p-2 text-center">{row.appraisal ? '✓' : '—'}</td>
                    <td className="p-2 text-center">{row.talentProfile ? '✓' : '—'}</td>
                    <td className="p-2 text-center">{row.nineBox ? '✓' : '—'}</td>
                    <td className="p-2 text-center">{row.succession ? '✓' : '—'}</td>
                    <td className="p-2 text-center">{row.analytics ? '✓' : '—'}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className="text-xs">{row.tone}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ✓ = Signals routed to this module (if consent/policy allow) | — = Not routed
          </p>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />

      {/* Data Flow Example */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Example: Signal in Appraisal Context</h4>
          <div className="border-2 border-dashed rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Badge>Performance Appraisal</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">Competency: Leadership</Badge>
            </div>
            <div className="p-3 bg-background border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">360 Feedback Context</span>
                <Badge className="bg-blue-100 text-blue-800">From 2024 Q3 Cycle</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Leadership Signal:</span>
                  <span className="ml-2 font-medium">4.2 / 5.0</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="ml-2 font-medium">0.85</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Raters:</span>
                  <span className="ml-2 font-medium">7 (across 4 categories)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Key Theme:</span>
                  <span className="ml-2 font-medium">Strong team motivation</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This context helps the manager make an informed rating decision with multi-rater evidence.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
