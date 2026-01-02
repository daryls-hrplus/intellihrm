import { Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ExampleConfig {
  title: string;
  context: string;
  values: { field: string; value: string }[];
  outcome?: string;
}

interface ConfigurationExampleProps {
  examples: ExampleConfig[];
  title?: string;
}

export function ConfigurationExample({ examples, title = 'Configuration Examples' }: ConfigurationExampleProps) {
  return (
    <div className="my-6">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h4 className="font-medium">{title}</h4>
        </div>
      )}
      <div className="space-y-4">
        {examples.map((example, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 flex items-center justify-between">
              <h5 className="font-medium text-sm">{example.title}</h5>
              <Badge variant="outline" className="text-xs">Example {index + 1}</Badge>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">{example.context}</p>
              <div className="grid gap-2">
                {example.values.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-medium min-w-[120px]">{item.field}:</span>
                    <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                      {item.value}
                    </code>
                  </div>
                ))}
              </div>
              {example.outcome && (
                <div className="pt-2 border-t mt-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Business Outcome
                  </span>
                  <p className="text-sm mt-1">{example.outcome}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
