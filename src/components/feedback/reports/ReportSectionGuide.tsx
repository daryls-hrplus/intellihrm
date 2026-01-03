import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Info, 
  AlertTriangle, 
  Lightbulb, 
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ReportSectionGuideProps {
  title: string;
  children: ReactNode;
  whatItMeans: string;
  howToUse: string;
  commonMisinterpretations?: string[];
  tips?: string[];
  variant?: 'inline' | 'collapsible' | 'full';
}

export function ReportSectionGuide({
  title,
  children,
  whatItMeans,
  howToUse,
  commonMisinterpretations = [],
  tips = [],
  variant = 'collapsible',
}: ReportSectionGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'inline') {
    return (
      <div className="space-y-2">
        {children}
        <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <Info className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{whatItMeans}</span>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="space-y-4">
        {children}
        
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">Understanding This Section</h4>
                <p className="text-sm text-muted-foreground">{whatItMeans}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">How to Use This</h4>
                <p className="text-sm text-muted-foreground">{howToUse}</p>
              </div>
            </div>

            {commonMisinterpretations.length > 0 && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">Common Misinterpretations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {commonMisinterpretations.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tips.length > 0 && (
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Collapsible variant (default)
  return (
    <div className="space-y-2">
      {children}
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            {isOpen ? 'Hide' : 'Show'} guide
            {isOpen ? (
              <ChevronUp className="h-3 w-3 ml-1" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-1" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="mt-2 border-primary/20 bg-primary/5">
            <CardContent className="p-3 space-y-3 text-sm">
              <div>
                <span className="font-medium">What it means: </span>
                <span className="text-muted-foreground">{whatItMeans}</span>
              </div>
              
              <div>
                <span className="font-medium">How to use: </span>
                <span className="text-muted-foreground">{howToUse}</span>
              </div>

              {commonMisinterpretations.length > 0 && (
                <div>
                  <span className="font-medium text-red-600">Don't assume: </span>
                  <span className="text-muted-foreground">
                    {commonMisinterpretations[0]}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Pre-defined guides for common report sections
export const SECTION_GUIDES = {
  overallScore: {
    whatItMeans: 'This is the weighted average of all ratings you received across categories and rater groups. It provides a high-level snapshot but should not be used in isolation.',
    howToUse: 'Use as a starting point for conversation, then dive into category-level and rater-group breakdowns for actionable insights.',
    commonMisinterpretations: [
      'A high overall score means no development needed',
      'A low overall score indicates poor performance',
      'This score should be compared directly to others',
    ],
    tips: [
      'Look at trends over time rather than a single score',
      'Compare to your own previous scores, not to others',
    ],
  },
  raterBreakdown: {
    whatItMeans: 'Shows how different groups (manager, peers, direct reports, self) rated you. Differences between groups often reveal valuable insights about perception gaps.',
    howToUse: 'Look for patterns - if one group rates significantly different from others, explore why. Consider context: each group sees different aspects of your work.',
    commonMisinterpretations: [
      'Higher ratings from one group means they like you more',
      'Low ratings from direct reports means you\'re a bad manager',
      'Self-ratings should match others exactly',
    ],
    tips: [
      'Self-awareness gaps (self vs. others) are normal and valuable to understand',
      'Consider the working relationship context for each group',
    ],
  },
  categoryScores: {
    whatItMeans: 'Competency area averages show relative strengths and development areas. These help prioritize where to focus development efforts.',
    howToUse: 'Identify your top 2-3 strengths to leverage and top 2-3 development areas to work on. Don\'t try to improve everything at once.',
    commonMisinterpretations: [
      'The lowest score is automatically your biggest priority',
      'High scores mean you don\'t need to develop that area',
      'Scores represent fixed abilities rather than current perceptions',
    ],
    tips: [
      'Focus development on areas that matter most for your role',
      'Leverage strengths to compensate for development areas',
    ],
  },
  comments: {
    whatItMeans: 'Qualitative feedback provides context and examples that numbers alone cannot capture. Look for themes rather than focusing on individual comments.',
    howToUse: 'Identify recurring themes across multiple comments. Use specific examples to understand what behaviors to continue or change.',
    commonMisinterpretations: [
      'One negative comment represents everyone\'s view',
      'More comments means stronger feedback',
      'Anonymous comments are less valuable',
    ],
    tips: [
      'Look for patterns in 3+ comments before drawing conclusions',
      'Consider the context in which feedback was given',
    ],
  },
};
