import { AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface TroubleshootingItem {
  issue: string;
  cause: string;
  solution: string;
}

interface TroubleshootingSectionProps {
  items: TroubleshootingItem[];
  title?: string;
}

export function TroubleshootingSection({ items, title = 'Common Issues & Solutions' }: TroubleshootingSectionProps) {
  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-5 w-5 text-amber-500" />
        <h4 className="font-medium">{title}</h4>
      </div>
      <Accordion type="single" collapsible className="border rounded-lg">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`issue-${index}`} className="px-4">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-sm font-medium">{item.issue}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pl-6">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Cause
                  </span>
                  <p className="text-sm mt-1">{item.cause}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Solution
                  </span>
                  <div className="flex items-start gap-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{item.solution}</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
