import { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

export interface Step {
  title: string;
  description: string;
  substeps?: string[];
  expectedResult?: string;
  screenshot?: ReactNode;
}

interface StepByStepProps {
  steps: Step[];
  title?: string;
}

export function StepByStep({ steps, title = 'Step-by-Step Procedure' }: StepByStepProps) {
  return (
    <div className="my-6">
      {title && <h4 className="font-medium mb-4">{title}</h4>}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="relative pl-8 pb-4">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
            )}
            
            {/* Step number */}
            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            
            <div className="pt-1">
              <h5 className="font-medium text-base">{step.title}</h5>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              
              {step.substeps && step.substeps.length > 0 && (
                <ul className="mt-2 space-y-1 pl-4">
                  {step.substeps.map((substep, subIndex) => (
                    <li key={subIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground/60">•</span>
                      {substep}
                    </li>
                  ))}
                </ul>
              )}
              
              {step.expectedResult && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                        Expected Result
                      </span>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-0.5">
                        {step.expectedResult}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {step.screenshot}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
