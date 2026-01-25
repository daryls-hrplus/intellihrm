import { LearningObjectives } from '../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../components/BusinessRules';
import { Shield, Lock, Eye, EyeOff, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand the multi-layer anonymity model and k-anonymity principles',
  'Identify which rater categories are protected vs. always identified',
  'Explain how threshold enforcement protects individual responses',
  'Describe bypass conditions and when anonymity may be lifted'
];

const visibilityFields: FieldDefinition[] = [
  {
    name: 'anonymity_threshold',
    required: true,
    type: 'integer',
    description: 'Minimum number of raters in a category before breakdown is shown',
    defaultValue: '3',
    validation: 'Range: 2-10'
  },
  {
    name: 'results_visibility_rules',
    required: false,
    type: 'JSONB',
    description: 'Category-specific visibility overrides for reports',
    defaultValue: 'null',
    validation: 'Valid JSON object'
  },
  {
    name: 'show_category_breakdown',
    required: true,
    type: 'boolean',
    description: 'Whether to display scores by rater category',
    defaultValue: 'true',
    validation: 'Boolean'
  },
  {
    name: 'show_individual_comments',
    required: true,
    type: 'boolean',
    description: 'Whether to show individual text responses (anonymized)',
    defaultValue: 'true',
    validation: 'Boolean'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Self-assessment is always identified',
    enforcement: 'System',
    description: 'Self-ratings are inherently identified and displayed separately in reports'
  },
  {
    rule: 'Manager feedback is always identified',
    enforcement: 'System',
    description: 'Direct manager ratings are displayed with manager attribution for accountability'
  },
  {
    rule: 'Peer/Direct Report categories require threshold',
    enforcement: 'System',
    description: 'Responses are aggregated only when minimum rater count is met'
  },
  {
    rule: 'Below-threshold categories show aggregate only',
    enforcement: 'System',
    description: 'If a category has fewer raters than threshold, only combined average is displayed'
  },
  {
    rule: 'External raters follow peer anonymity rules',
    enforcement: 'Policy',
    description: 'Customer/vendor feedback uses same protection as peer category'
  }
];

const raterCategories = [
  { category: 'Self', protection: 'Identified', icon: Eye, description: 'Always attributed to the participant' },
  { category: 'Manager', protection: 'Identified', icon: Eye, description: 'Direct manager feedback is attributed' },
  { category: 'Peer', protection: 'Anonymous', icon: EyeOff, description: 'Protected by k-anonymity threshold' },
  { category: 'Direct Report', protection: 'Anonymous', icon: EyeOff, description: 'Protected by k-anonymity threshold' },
  { category: 'Skip-Level', protection: 'Anonymous', icon: EyeOff, description: 'Protected by k-anonymity threshold' },
  { category: 'External/Customer', protection: 'Anonymous', icon: EyeOff, description: 'Protected by k-anonymity threshold' }
];

export function GovernanceAnonymityArchitecture() {
  return (
    <section id="sec-4-1" data-manual-anchor="sec-4-1" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          4.1 Anonymity Architecture
        </h3>
        <p className="text-muted-foreground mt-2">
          Understanding the multi-layer anonymity model that protects rater identity while enabling meaningful feedback aggregation.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* K-Anonymity Concept */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4" />
            K-Anonymity Principle
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            The 360 feedback system implements <strong>k-anonymity</strong>, a privacy protection model that ensures 
            individual responses cannot be identified within a group. The "k" value (anonymity threshold) defines 
            the minimum group size required before category-level data is displayed.
          </p>
          
          {/* Mermaid-style diagram as text representation */}
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                    ANONYMITY DECISION FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Feedback Response                                              │
│        │                                                        │
│        ▼                                                        │
│  ┌─────────────────┐                                           │
│  │ Check Category  │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│     ┌─────┴─────┐                                              │
│     ▼           ▼                                              │
│ ┌───────┐  ┌────────────┐                                      │
│ │ Self/ │  │ Peer/DR/   │                                      │
│ │Manager│  │ External   │                                      │
│ └───┬───┘  └─────┬──────┘                                      │
│     │            │                                              │
│     ▼            ▼                                              │
│ ┌────────┐  ┌─────────────────┐                                │
│ │Identified│  │Count >= Threshold?│                             │
│ │in Report │  └────────┬────────┘                              │
│ └────────┘       ┌─────┴─────┐                                 │
│                  ▼           ▼                                  │
│           ┌─────────┐  ┌──────────────┐                        │
│           │   YES   │  │     NO       │                        │
│           └────┬────┘  └──────┬───────┘                        │
│                │              │                                 │
│                ▼              ▼                                 │
│        ┌────────────┐  ┌────────────────┐                      │
│        │Show Category│  │Aggregate with  │                      │
│        │Breakdown   │  │Other Categories│                      │
│        └────────────┘  └────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Rater Category Protection Levels */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Users className="h-4 w-4" />
          Rater Category Protection Levels
        </h4>
        <div className="grid gap-3">
          {raterCategories.map((rater) => (
            <div 
              key={rater.category}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <rater.icon className={`h-4 w-4 ${rater.protection === 'Identified' ? 'text-amber-500' : 'text-green-500'}`} />
                <div>
                  <span className="font-medium">{rater.category}</span>
                  <p className="text-xs text-muted-foreground">{rater.description}</p>
                </div>
              </div>
              <Badge 
                variant={rater.protection === 'Identified' ? 'secondary' : 'default'}
                className={rater.protection === 'Anonymous' ? 'bg-green-600 text-white' : ''}
              >
                {rater.protection}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Threshold Scenarios */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Threshold Enforcement Scenarios</h4>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Threshold Met (k=3)
                </Badge>
              </div>
              <p className="text-sm">
                <strong>Scenario:</strong> 4 peers provided feedback → Category breakdown shown with average score
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Individual peer responses remain anonymous; only aggregate metrics displayed
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Threshold Not Met (k=3)
                </Badge>
              </div>
              <p className="text-sm">
                <strong>Scenario:</strong> 2 direct reports provided feedback → Category aggregated into "Others"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Responses combined with other anonymous categories to prevent identification
              </p>
            </div>
            
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Investigation Override
                </Badge>
              </div>
              <p className="text-sm">
                <strong>Scenario:</strong> HR investigation approved → Rater identity disclosed with full audit logging
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Requires HR Director approval; legal justification documented; access logged
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={visibilityFields} 
        title="Anonymity Configuration Fields (feedback_360_cycles)" 
      />

      <BusinessRules rules={businessRules} />
    </section>
  );
}
