import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Info, Shield } from 'lucide-react';

interface LimitationsDisclaimerProps {
  sampleSize?: number;
  anonymityThreshold?: number;
  variant?: 'full' | 'compact' | 'inline';
}

export function LimitationsDisclaimer({ 
  sampleSize,
  anonymityThreshold = 3,
  variant = 'full' 
}: LimitationsDisclaimerProps) {
  const limitations = [
    {
      title: 'Perceptions, Not Facts',
      description: 'Ratings reflect how others perceive your behavior, which may differ from your intentions or actual impact.',
    },
    {
      title: 'Point-in-Time Snapshot',
      description: 'This feedback captures perceptions at a specific moment. Recent events may be weighted more heavily.',
    },
    {
      title: 'Rater Differences',
      description: 'People rate differently - some are generous, others strict. Compare patterns, not absolute numbers.',
    },
    {
      title: 'Limited Observations',
      description: 'Not all raters observe all behaviors. Some may rate based on limited or indirect information.',
    },
    {
      title: 'Cultural Context',
      description: 'Rating norms vary across cultures. What\'s "high" in one culture may be "moderate" in another.',
    },
  ];

  if (variant === 'inline') {
    return (
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <span className="font-medium">Interpretation note:</span> This feedback represents perceptions 
          at a point in time. Use it as one data point for development, not as definitive judgment.
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-sm mb-1">Important Context</h4>
              <p className="text-xs text-muted-foreground">
                360° feedback captures perceptions, not absolute truths. Raters have different 
                scales and limited visibility. Use this report to identify themes and spark 
                development conversations - not as performance scores.
              </p>
              {sampleSize !== undefined && sampleSize < anonymityThreshold && (
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 font-medium">
                  ⚠️ Low response count ({sampleSize}) - interpret with extra caution.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className="print:shadow-none print:border-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Understanding the Limitations</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          To get the most value from this report, understand what 360° feedback can and cannot tell you:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {limitations.map((limitation, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">{limitation.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {limitation.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {sampleSize !== undefined && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              {sampleSize < anonymityThreshold ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm">
                    <span className="font-medium text-amber-700 dark:text-amber-300">
                      Low sample size ({sampleSize} responses)
                    </span>
                    <span className="text-muted-foreground">
                      {' '}— Results may not be representative. Individual opinions can skew averages significantly.
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {sampleSize} responses collected — sufficient sample for meaningful patterns.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-primary/5 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">The Bottom Line:</span> Approach this feedback with curiosity, 
            not defensiveness. Look for themes across multiple data points. Use it to start conversations 
            and inform development priorities - not to pass judgment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
