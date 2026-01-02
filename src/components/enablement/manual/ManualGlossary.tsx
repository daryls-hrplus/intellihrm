import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search } from 'lucide-react';

const GLOSSARY_TERMS = [
  {
    term: 'Appraisal Cycle',
    definition: 'A time-bound evaluation period during which employee performance is assessed. Can be annual, semi-annual, quarterly, or probationary.',
    category: 'Core',
  },
  {
    term: 'Calibration',
    definition: 'A collaborative process where managers review and adjust ratings to ensure consistency, fairness, and alignment with organizational standards across teams.',
    category: 'Process',
  },
  {
    term: 'Competency',
    definition: 'A measurable skill, behavior, or attribute that contributes to effective job performance. Assessed using behavioral indicators at defined proficiency levels.',
    category: 'Assessment',
  },
  {
    term: 'CRGV Model',
    definition: 'The weighted scoring methodology used in HRplus: Competencies (C), Responsibilities (R), Goals (G), and Values (V).',
    category: 'Core',
  },
  {
    term: 'Evaluator',
    definition: 'The manager or designated reviewer responsible for conducting the performance assessment of an employee.',
    category: 'Roles',
  },
  {
    term: 'Forced Distribution',
    definition: 'A calibration guideline that suggests target percentages for each rating category to prevent rating inflation.',
    category: 'Process',
  },
  {
    term: 'IDP (Individual Development Plan)',
    definition: 'A personalized plan created for an employee to develop specific skills, competencies, or career objectives.',
    category: 'Development',
  },
  {
    term: 'Nine-Box Grid',
    definition: 'A talent management matrix that plots employees based on performance (x-axis) and potential (y-axis) to identify talent segments.',
    category: 'Talent',
  },
  {
    term: 'Overall Rating Scale',
    definition: 'The final performance category (e.g., Exceptional, Meets Expectations) derived from weighted component scores.',
    category: 'Assessment',
  },
  {
    term: 'Participant',
    definition: 'An employee who is enrolled in and being evaluated during an active appraisal cycle.',
    category: 'Roles',
  },
  {
    term: 'PIP (Performance Improvement Plan)',
    definition: 'A formal document outlining specific performance deficiencies and required improvements within a defined timeline.',
    category: 'Development',
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
    term: 'RLS (Row-Level Security)',
    definition: 'Database security mechanism ensuring users can only access data they are authorized to view.',
    category: 'Technical',
  },
  {
    term: 'Self-Assessment',
    definition: 'The process where employees rate their own performance before the manager evaluation, providing their perspective on achievements.',
    category: 'Process',
  },
  {
    term: 'Succession Planning',
    definition: 'The process of identifying and developing employees to fill key leadership positions when they become vacant.',
    category: 'Talent',
  },
  {
    term: 'Weight',
    definition: 'The percentage assigned to each evaluation component (goals, competencies, responsibilities, values) that determines its contribution to the overall score.',
    category: 'Assessment',
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
            Key terminology used in the Appraisals module
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
              <p className="text-sm text-muted-foreground text-center py-8">
                No terms found matching your search.
              </p>
            ) : (
              filteredTerms.map((item) => (
                <div key={item.term} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{item.term}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.definition}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
