import { ReactNode } from 'react';
import { HelpCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReportExplainerTooltipProps {
  children?: ReactNode;
  title?: string;
  explanation: string;
  variant?: 'help' | 'info' | 'warning' | 'tip';
  side?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: string;
}

const variantConfig = {
  help: {
    icon: HelpCircle,
    iconClass: 'text-muted-foreground hover:text-foreground',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500 hover:text-blue-600',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500 hover:text-amber-600',
  },
  tip: {
    icon: Lightbulb,
    iconClass: 'text-green-500 hover:text-green-600',
  },
};

export function ReportExplainerTooltip({
  children,
  title,
  explanation,
  variant = 'help',
  side = 'top',
  maxWidth = '280px',
}: ReportExplainerTooltipProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {children || (
            <button 
              type="button"
              className={`inline-flex items-center justify-center transition-colors ${config.iconClass}`}
              aria-label={title || 'More information'}
            >
              <Icon className="h-4 w-4" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="p-0 overflow-hidden"
          style={{ maxWidth }}
        >
          <div className="p-3">
            {title && (
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`h-4 w-4 ${config.iconClass}`} />
                <span className="font-medium text-sm">{title}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Commonly used explanations for 360 reports
export const REPORT_EXPLANATIONS = {
  overallScore: {
    title: 'Overall Score',
    explanation: 'The weighted average of all ratings across categories and rater groups. Use this as a general indicator, but dive into category-level details for actionable insights.',
  },
  selfVsOthers: {
    title: 'Self vs. Others Gap',
    explanation: 'The difference between your self-rating and how others rated you. A positive gap (self higher) may indicate a blind spot. A negative gap (others higher) may indicate hidden strengths or modesty.',
  },
  raterAgreement: {
    title: 'Rater Agreement',
    explanation: 'How consistently different raters scored you. High agreement means perceptions are consistent. Low agreement may indicate context-dependent behavior or limited visibility.',
  },
  responseCount: {
    title: 'Response Count',
    explanation: 'The number of raters who provided feedback. Higher counts provide more reliable data. Below 3 responses, results should be interpreted cautiously.',
  },
  categoryScore: {
    title: 'Category Score',
    explanation: 'Average rating for all questions in this competency area. Compare across categories to identify relative strengths and development areas.',
  },
  trendIndicator: {
    title: 'Trend',
    explanation: 'Compares this score to the previous feedback cycle. Upward trends show improvement; downward trends may need attention. No trend means this is the first measurement.',
  },
  benchmarkComparison: {
    title: 'Benchmark',
    explanation: 'How your score compares to others at similar levels or in similar roles. Use this for context, not comparison - your development journey is unique.',
  },
  standardDeviation: {
    title: 'Score Spread',
    explanation: 'How much ratings varied among raters. High spread means opinions differ significantly - explore why in your development conversation.',
  },
  anonymityProtection: {
    title: 'Anonymity Protection',
    explanation: 'When fewer than 3 people in a group responded, their feedback is combined with another group to protect their identity. This is why some categories may be grouped.',
  },
  qualitativeThemes: {
    title: 'Comment Themes',
    explanation: 'AI-identified patterns in written comments. These represent recurring topics, not direct quotes. Use them to understand what\'s top-of-mind for raters.',
  },
};
