import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import {
  SetupGoalCycles,
  SetupGoalTemplates,
  SetupGoalLocking,
  SetupCheckInCadence,
  SetupGoalRating,
} from './sections/setup';

export function GoalsManualSetupSection() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          This section covers the complete setup and configuration of the Goals Management module. 
          Follow these sections in order to ensure all prerequisites are met before launching goal cycles.
        </p>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Required</Badge>
            <span className="text-muted-foreground">Must complete before go-live</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Recommended</Badge>
            <span className="text-muted-foreground">Best practice configurations</span>
          </div>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["goals"]} className="space-y-4">
        {/* Goal Configuration */}
        <AccordionItem value="goals" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Goal Configuration</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Goal cycles, templates, locking rules, and check-ins
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">5 sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <SetupGoalCycles />
            <SetupGoalTemplates />
            <SetupGoalLocking />
            <SetupCheckInCadence />
            <SetupGoalRating />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
