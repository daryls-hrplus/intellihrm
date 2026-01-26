import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TrendingUp, MessageCircle, BarChart3, AlertTriangle, Database, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const learningObjectives = [
  'Understand how sentiment is detected and classified',
  'Interpret sentiment aggregation across rater categories',
  'Use sentiment trends to identify patterns',
  'Recognize the limitations of sentiment analysis'
];

const sentimentCategories = [
  {
    category: 'Positive',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    description: 'Feedback expresses satisfaction, praise, or constructive encouragement',
    examples: ['Excellent leadership', 'Consistently delivers', 'Valuable team member']
  },
  {
    category: 'Neutral',
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    description: 'Feedback is factual, descriptive, or balanced without strong emotion',
    examples: ['Meets expectations', 'Completes assigned tasks', 'Follows processes']
  },
  {
    category: 'Negative',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    description: 'Feedback expresses concerns, criticism, or areas needing improvement',
    examples: ['Needs improvement', 'Missed deadlines', 'Communication gaps']
  },
  {
    category: 'Mixed',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    description: 'Feedback contains both positive and negative elements',
    examples: ['Strong technically but needs to collaborate more', 'Great ideas, poor follow-through']
  }
];

const sentimentFields: FieldDefinition[] = [
  {
    name: 'sentiment_category',
    required: false,
    type: 'enum',
    description: 'Primary sentiment classification: positive, neutral, negative, mixed',
    defaultValue: 'null',
    validation: 'Valid category'
  },
  {
    name: 'sentiment_score',
    required: false,
    type: 'decimal',
    description: 'Sentiment polarity score (-1 to +1)',
    defaultValue: 'null',
    validation: '-1.0 to +1.0'
  },
  {
    name: 'sentiment_confidence',
    required: false,
    type: 'decimal',
    description: 'AI confidence in sentiment classification (0-1)',
    defaultValue: 'null',
    validation: '0.0 - 1.0'
  },
  {
    name: 'emotional_tone',
    required: false,
    type: 'text[]',
    description: 'Detected emotional tones: encouraging, critical, supportive, frustrated, etc.',
    defaultValue: '[]',
    validation: 'Array of strings'
  }
];

export function AISentimentAnalysis() {
  return (
    <section id="sec-5-6" data-manual-anchor="sec-5-6" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          5.6 Sentiment Analysis
        </h3>
        <p className="text-muted-foreground mt-2">
          NLP-powered detection of emotional tone and sentiment patterns across feedback responses.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Sentiment Processing Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4" />
            Sentiment Processing Pipeline
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SENTIMENT ANALYSIS FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐          │
│  │ Open-Text      │────▶│ NLP            │────▶│ Sentiment      │          │
│  │ Response       │     │ Processing     │     │ Classification │          │
│  └────────────────┘     └────────────────┘     └───────┬────────┘          │
│                                                         │                   │
│                              ┌──────────────────────────┘                   │
│                              │                                               │
│          ┌───────────────────┼───────────────────┬─────────────────┐        │
│          ▼                   ▼                   ▼                 ▼        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  ┌──────────────┐│
│  │  POSITIVE    │    │  NEUTRAL     │    │  NEGATIVE    │  │   MIXED      ││
│  │  (+0.5 to +1)│    │  (-0.2 to    │    │  (-1 to -0.5)│  │  (varies)    ││
│  │              │    │    +0.2)     │    │              │  │              ││
│  └──────────────┘    └──────────────┘    └──────────────┘  └──────────────┘│
│                                                                              │
│                              │                                               │
│                              ▼                                               │
│                     ┌────────────────────────────────────┐                  │
│                     │     AGGREGATION BY CATEGORY        │                  │
│                     │  ┌────────┐ ┌────────┐ ┌────────┐ │                  │
│                     │  │Manager │ │ Peer   │ │ DR     │ │                  │
│                     │  │Avg: +.7│ │Avg: +.4│ │Avg: +.2│ │                  │
│                     │  └────────┘ └────────┘ └────────┘ │                  │
│                     └───────────────┬────────────────────┘                  │
│                                     │                                        │
│                                     ▼                                        │
│                     ┌────────────────────────────────────┐                  │
│                     │      TREND & PATTERN ANALYSIS      │                  │
│                     │  • Category sentiment comparison   │                  │
│                     │  • Theme sentiment clusters        │                  │
│                     │  • Historical trend detection      │                  │
│                     └────────────────────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Categories */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4" />
          Sentiment Categories
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {sentimentCategories.map((cat) => (
            <Card key={cat.category}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full ${cat.color}`} />
                  <h5 className={`font-medium ${cat.textColor}`}>{cat.category}</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.examples.map((ex, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ex}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rater Category Comparison */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Sentiment by Rater Category (Example)</h4>
          <div className="space-y-4">
            {[
              { category: 'Self', positive: 75, neutral: 20, negative: 5 },
              { category: 'Manager', positive: 60, neutral: 30, negative: 10 },
              { category: 'Peer', positive: 55, neutral: 35, negative: 10 },
              { category: 'Direct Report', positive: 45, neutral: 35, negative: 20 }
            ].map((row) => (
              <div key={row.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{row.category}</span>
                  <span className="text-muted-foreground">
                    <span className="text-green-600">{row.positive}%</span> / 
                    <span className="text-gray-600"> {row.neutral}%</span> / 
                    <span className="text-red-600"> {row.negative}%</span>
                  </span>
                </div>
                <div className="h-3 flex rounded-full overflow-hidden">
                  <div className="bg-green-500" style={{ width: `${row.positive}%` }} />
                  <div className="bg-gray-400" style={{ width: `${row.neutral}%` }} />
                  <div className="bg-red-500" style={{ width: `${row.negative}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Note: Differences in sentiment across categories can reveal perception gaps 
            (e.g., self-rating more positive than direct report feedback).
          </p>
        </CardContent>
      </Card>

      {/* Database Architecture Note */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertTitle>Data Architecture</AlertTitle>
        <AlertDescription>
          Sentiment analysis results are stored as metadata within the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">feedback_360_responses</code> table 
          using JSONB fields (<code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">ai_analysis_metadata</code>). 
          For pulse surveys and continuous feedback, sentiment is stored in <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">pulse_sentiment_analysis</code>.
          This design minimizes table proliferation while maintaining query performance through JSONB indexing.
        </AlertDescription>
      </Alert>

      <FieldReferenceTable 
        fields={sentimentFields} 
        title="Sentiment Analysis Fields (stored in ai_analysis_metadata JSONB)" 
      />

      {/* Important Warning */}
      <div className="p-4 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">Important: Sentiment ≠ Performance</h5>
            <p className="text-sm text-muted-foreground mt-1">
              Sentiment analysis detects emotional tone, not performance quality. Negative sentiment 
              may indicate constructive developmental feedback, not poor performance. Positive sentiment 
              may reflect politeness rather than genuine praise. Always interpret sentiment in context 
              with behavioral ratings and specific examples.
            </p>
          </div>
        </div>
      </div>

      {/* How Sentiment Informs Theme Generation */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">How Sentiment Informs Theme Generation</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium text-sm text-green-600 mb-2">Positive Sentiment Patterns</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Identify confirmed strengths</li>
                <li>• Surface "hidden strengths" (high from others, not self)</li>
                <li>• Guide recognition and career opportunities</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium text-sm text-red-600 mb-2">Negative Sentiment Patterns</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Identify development needs</li>
                <li>• Surface "blind spots" (low from others, not self)</li>
                <li>• Prioritize coaching and training</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
