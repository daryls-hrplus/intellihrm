import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search } from 'lucide-react';

const GLOSSARY_TERMS = [
  // Core
  {
    term: 'Appraisal Cycle',
    definition: 'A time-bound evaluation period during which employee performance is assessed. Can be annual, semi-annual, quarterly, or probationary.',
    category: 'Core',
  },
  {
    term: 'CRGV Model',
    definition: 'The weighted scoring methodology used in HRplus: Competencies (C), Responsibilities (R), Goals (G), and Values (V).',
    category: 'Core',
  },
  {
    term: 'Form Template',
    definition: 'Reusable configuration defining the structure, sections, and questions for appraisal forms. Links to cycles via template_id.',
    category: 'Core',
  },
  // Assessment
  {
    term: 'Competency',
    definition: 'A measurable skill, behavior, or attribute that contributes to effective job performance. Assessed using behavioral indicators at defined proficiency levels.',
    category: 'Assessment',
  },
  {
    term: 'Overall Rating Scale',
    definition: 'The final performance category (e.g., Exceptional, Meets Expectations) derived from weighted component scores.',
    category: 'Assessment',
  },
  {
    term: 'Proficiency Level',
    definition: 'The expected degree of competency mastery for a specific job level or role (e.g., Basic, Intermediate, Advanced, Expert).',
    category: 'Assessment',
  },
  {
    term: 'Rating Scale',
    definition: 'A numeric scoring system (typically 1-5) used to evaluate individual goals, competencies, and responsibilities.',
    category: 'Assessment',
  },
  {
    term: 'Weight',
    definition: 'The percentage assigned to each evaluation component (goals, competencies, responsibilities, values) that determines its contribution to the overall score.',
    category: 'Assessment',
  },
  {
    term: 'Role Segment',
    definition: 'A time-bounded portion of an appraisal period where an employee held a specific position, used when employees change roles mid-cycle. Stored in appraisal_role_segments.',
    category: 'Assessment',
  },
  {
    term: 'Multi-Position Evaluation',
    definition: 'Evaluation mode for employees holding concurrent positions, with weighted scoring across multiple roles. Configured via multi_position_mode (aggregate or separate).',
    category: 'Assessment',
  },
  {
    term: 'Position Weight',
    definition: 'The percentage contribution of each position to the overall score when evaluating multi-position employees. Must sum to 100%. Stored in appraisal_position_weights.',
    category: 'Assessment',
  },
  {
    term: 'Score Breakdown',
    definition: 'Detailed decomposition of the final appraisal score showing raw scores, weights, and contributions for each component (CRGV). Stored in appraisal_score_breakdown.',
    category: 'Assessment',
  },
  {
    term: 'Values Assessment',
    definition: 'Evaluation of employee alignment with organizational core values, scored alongside competencies and goals. Enabled via include_values_assessment.',
    category: 'Assessment',
  },
  {
    term: '360 Feedback',
    definition: 'Multi-rater feedback collected from peers, subordinates, and other stakeholders integrated into appraisals. Weight controlled by feedback_360_weight.',
    category: 'Assessment',
  },
  {
    term: 'Pre-Calibration Score',
    definition: 'The calculated overall score before any adjustments made during calibration sessions. Stored as pre_calibration_score on participants.',
    category: 'Assessment',
  },
  {
    term: 'Post-Calibration Score',
    definition: 'The final overall score after calibration adjustments have been applied. Stored as post_calibration_score on participants.',
    category: 'Assessment',
  },
  // Process
  {
    term: 'Calibration',
    definition: 'A collaborative process where managers review and adjust ratings to ensure consistency, fairness, and alignment with organizational standards across teams.',
    category: 'Process',
  },
  {
    term: 'Forced Distribution',
    definition: 'A calibration guideline that suggests target percentages for each rating category to prevent rating inflation.',
    category: 'Process',
  },
  {
    term: 'Self-Assessment',
    definition: 'The process where employees rate their own performance before the manager evaluation, providing their perspective on achievements.',
    category: 'Process',
  },
  {
    term: 'Outcome Action Rule',
    definition: 'Configurable automation rule that triggers specific actions (IDP, PIP, succession nomination) based on appraisal score conditions. Stored in appraisal_outcome_action_rules.',
    category: 'Process',
  },
  {
    term: 'Action Execution',
    definition: 'Record of an automated action triggered by outcome rules, including IDP/PIP creation or succession nominations. Tracked in appraisal_action_executions.',
    category: 'Process',
  },
  {
    term: 'Appraisal Interview',
    definition: 'Scheduled meeting between manager and employee to discuss performance evaluation results. Supports in_person, video_call, and phone_call types.',
    category: 'Process',
  },
  {
    term: 'Workflow Status',
    definition: 'The current state of an appraisal in its lifecycle: draft, pending, in_progress, approved, rejected, cancelled, escalated, returned, or auto_terminated.',
    category: 'Process',
  },
  {
    term: 'Employee Response',
    definition: 'The employee\'s formal acknowledgment of their appraisal, indicating agreement (agree, disagree, partial_agree, or pending). Tracked via employee_response_status.',
    category: 'Process',
  },
  // Development
  {
    term: 'IDP (Individual Development Plan)',
    definition: 'A personalized plan created for an employee to develop specific skills, competencies, or career objectives.',
    category: 'Development',
  },
  {
    term: 'PIP (Performance Improvement Plan)',
    definition: 'A formal document outlining specific performance deficiencies and required improvements within a defined timeline.',
    category: 'Development',
  },
  {
    term: 'Strengths & Gaps',
    definition: 'AI-identified areas of strong performance and development needs based on appraisal scores and evidence. Stored in appraisal_strengths_gaps with suggested IDP goals.',
    category: 'Development',
  },
  // Talent
  {
    term: 'Nine-Box Grid',
    definition: 'A talent management matrix that plots employees based on performance (x-axis) and potential (y-axis) to identify talent segments.',
    category: 'Talent',
  },
  {
    term: 'Succession Planning',
    definition: 'The process of identifying and developing employees to fill key leadership positions when they become vacant.',
    category: 'Talent',
  },
  // Roles
  {
    term: 'Evaluator',
    definition: 'The manager or designated reviewer responsible for conducting the performance assessment of an employee.',
    category: 'Roles',
  },
  {
    term: 'Participant',
    definition: 'An employee who is enrolled in and being evaluated during an active appraisal cycle.',
    category: 'Roles',
  },
  // Technical
  {
    term: 'RLS (Row-Level Security)',
    definition: 'Database security mechanism ensuring users can only access data they are authorized to view.',
    category: 'Technical',
  },
  {
    term: 'AI Confidence',
    definition: 'A percentage score (0-100) indicating how certain the AI system is about its analysis, recommendations, or identified patterns. Stored as ai_confidence on strengths_gaps.',
    category: 'Technical',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(GLOSSARY_TERMS.map(t => t.category)))];

export function ManualGlossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTerms = GLOSSARY_TERMS.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Glossary of Terms</CardTitle>
          </div>
          <CardDescription>
            Key terminology used in the Appraisals module ({GLOSSARY_TERMS.length} terms)
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTerms.length === 0 ? (
              <div className="p-6 border-2 border-amber-500 bg-amber-500/20 rounded-lg text-center">
                <p className="text-sm font-semibold">
                  No terms found matching your search.
                </p>
              </div>
            ) : (
              filteredTerms.map((item) => (
                <div key={item.term} className="p-4 border-2 border-primary bg-primary/15 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold">{item.term}</h4>
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-sm">{item.definition}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
