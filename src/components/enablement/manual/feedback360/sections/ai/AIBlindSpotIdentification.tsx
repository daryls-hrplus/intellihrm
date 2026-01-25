import { LearningObjectives } from '../../../components/LearningObjectives';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { Eye, EyeOff, TrendingUp, TrendingDown, Minus, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand the calculation of self-other perception gaps',
  'Identify blind spots vs. hidden strengths',
  'Interpret gap threshold configuration',
  'Use blind spot insights in coaching conversations'
];

const gapCategories = [
  {
    type: 'Blind Spot',
    icon: EyeOff,
    iconColor: 'text-red-500',
    condition: 'Self > Others',
    description: 'Self-rating significantly higher than others\' average',
    interpretation: 'Individual may overestimate capability in this area',
    coachingApproach: 'Explore with curiosity, not judgment. Ask for specific examples.'
  },
  {
    type: 'Hidden Strength',
    icon: Eye,
    iconColor: 'text-green-500',
    condition: 'Self < Others',
    description: 'Self-rating significantly lower than others\' average',
    interpretation: 'Individual may underestimate capability in this area',
    coachingApproach: 'Build awareness and confidence. Share specific positive feedback.'
  },
  {
    type: 'Shared Perception',
    icon: Minus,
    iconColor: 'text-gray-500',
    condition: 'Self ≈ Others',
    description: 'Self-rating closely matches others\' average',
    interpretation: 'Strong self-awareness in this area',
    coachingApproach: 'Validate alignment and discuss development priorities.'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Gap threshold is configurable',
    enforcement: 'Policy',
    description: 'Default ±0.5 points on 5-point scale; organizations can adjust based on culture'
  },
  {
    rule: 'Minimum raters required for comparison',
    enforcement: 'System',
    description: 'Others average requires minimum 3 raters to avoid individual identification'
  },
  {
    rule: 'Self-rating must exist',
    enforcement: 'System',
    description: 'Blind spot analysis requires completed self-assessment'
  },
  {
    rule: 'Insights are confidential',
    enforcement: 'Policy',
    description: 'Blind spot data visible only to employee, manager (if released), and HR'
  }
];

const exampleGaps = [
  {
    competency: 'Strategic Thinking',
    selfScore: 4.2,
    othersScore: 3.4,
    gap: +0.8,
    type: 'Blind Spot',
    typeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  {
    competency: 'Team Collaboration',
    selfScore: 3.5,
    othersScore: 4.3,
    gap: -0.8,
    type: 'Hidden Strength',
    typeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  {
    competency: 'Communication',
    selfScore: 3.8,
    othersScore: 3.7,
    gap: +0.1,
    type: 'Aligned',
    typeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  },
  {
    competency: 'Technical Expertise',
    selfScore: 4.0,
    othersScore: 4.6,
    gap: -0.6,
    type: 'Hidden Strength',
    typeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
];

export function AIBlindSpotIdentification() {
  return (
    <section id="sec-5-7" data-manual-anchor="sec-5-7" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <EyeOff className="h-5 w-5 text-primary" />
          5.7 Blind Spot Identification
        </h3>
        <p className="text-muted-foreground mt-2">
          AI-powered detection of self-other perception gaps to surface blind spots and hidden strengths.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Gap Calculation Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4" />
            Gap Calculation Logic
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BLIND SPOT CALCULATION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   For each competency/question:                                              │
│                                                                              │
│   ┌──────────────────┐          ┌──────────────────┐                        │
│   │   SELF RATING    │          │  OTHERS AVERAGE  │                        │
│   │   (1 response)   │          │  (3+ responses)  │                        │
│   │                  │          │                  │                        │
│   │    Score: 4.2    │          │    Score: 3.4    │                        │
│   └────────┬─────────┘          └────────┬─────────┘                        │
│            │                             │                                   │
│            └──────────────┬──────────────┘                                   │
│                           │                                                  │
│                           ▼                                                  │
│                   ┌───────────────┐                                         │
│                   │ Gap = Self -  │                                         │
│                   │ Others        │                                         │
│                   │ = 4.2 - 3.4   │                                         │
│                   │ = +0.8        │                                         │
│                   └───────┬───────┘                                         │
│                           │                                                  │
│            ┌──────────────┼──────────────┐                                  │
│            │              │              │                                   │
│     Gap > +0.5      -0.5 ≤ Gap ≤ +0.5    Gap < -0.5                        │
│            │              │              │                                   │
│            ▼              ▼              ▼                                   │
│     ┌────────────┐ ┌────────────┐ ┌────────────┐                           │
│     │ BLIND SPOT │ │  ALIGNED   │ │  HIDDEN    │                           │
│     │            │ │            │ │  STRENGTH  │                           │
│     └────────────┘ └────────────┘ └────────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Gap Categories */}
      <div>
        <h4 className="font-medium mb-4">Perception Gap Categories</h4>
        <div className="space-y-4">
          {gapCategories.map((cat) => (
            <Card key={cat.type}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <cat.icon className={`h-6 w-6 ${cat.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{cat.type}</h5>
                      <Badge variant="outline">{cat.condition}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{cat.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-xs font-medium text-muted-foreground">Interpretation</span>
                        <p className="text-sm mt-1">{cat.interpretation}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-xs font-medium text-muted-foreground">Coaching Approach</span>
                        <p className="text-sm mt-1">{cat.coachingApproach}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Example Gap Analysis */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Example: Perception Gap Analysis</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Competency</th>
                  <th className="text-center p-2 font-medium">Self</th>
                  <th className="text-center p-2 font-medium">Others</th>
                  <th className="text-center p-2 font-medium">Gap</th>
                  <th className="text-center p-2 font-medium">Classification</th>
                </tr>
              </thead>
              <tbody>
                {exampleGaps.map((row) => (
                  <tr key={row.competency} className="border-b">
                    <td className="p-2 font-medium">{row.competency}</td>
                    <td className="p-2 text-center">{row.selfScore.toFixed(1)}</td>
                    <td className="p-2 text-center">{row.othersScore.toFixed(1)}</td>
                    <td className="p-2 text-center">
                      <span className={row.gap > 0 ? 'text-red-600' : row.gap < 0 ? 'text-green-600' : ''}>
                        {row.gap > 0 ? '+' : ''}{row.gap.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <Badge className={row.typeColor}>{row.type}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Gap Representation */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Visual Gap Representation (Report View)</h4>
          <div className="space-y-4">
            {exampleGaps.slice(0, 2).map((row) => (
              <div key={row.competency} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{row.competency}</span>
                  <Badge className={row.typeColor}>{row.type}</Badge>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                    1 — 2 — 3 — 4 — 5
                  </div>
                  <div 
                    className="absolute top-1 bottom-1 w-3 bg-blue-500 rounded"
                    style={{ left: `${((row.selfScore - 1) / 4) * 100}%` }}
                    title={`Self: ${row.selfScore}`}
                  />
                  <div 
                    className="absolute top-1 bottom-1 w-3 bg-green-500 rounded"
                    style={{ left: `${((row.othersScore - 1) / 4) * 100}%` }}
                    title={`Others: ${row.othersScore}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded" /> Self: {row.selfScore}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded" /> Others: {row.othersScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />

      {/* Coaching Tip */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">Coaching Best Practice</h5>
            <p className="text-sm text-muted-foreground mt-1">
              Use blind spots for 1:1 discussion, not judgment. The goal is to build self-awareness, 
              not to "prove someone wrong." Ask open-ended questions like "What might explain this 
              difference in perception?" and "How can we explore this together?"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
