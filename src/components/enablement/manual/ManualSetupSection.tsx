import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Settings, Target, FileText } from 'lucide-react';
import {
  SetupPrerequisites,
  SetupRatingScales,
  SetupOverallScales,
  SetupCompetencies,
  SetupApprovalWorkflows,
  SetupGoalCycles,
  SetupGoalTemplates,
  SetupGoalLocking,
  SetupCheckInCadence,
  SetupGoalRating,
} from './sections/setup';

export function ManualSetupSection() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          This section covers the complete setup and configuration of the Performance Management module. 
          Follow these sections in order to ensure all prerequisites are met before launching appraisal cycles.
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

      <Accordion type="multiple" defaultValue={["foundation"]} className="space-y-4">
        {/* Foundation Settings */}
        <AccordionItem value="foundation" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Foundation Settings</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Rating scales, competencies, and approval workflows
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">5 sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <SetupPrerequisites />
            <SetupRatingScales />
            <SetupOverallScales />
            <SetupCompetencies />
            <SetupApprovalWorkflows />
          </AccordionContent>
        </AccordionItem>

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

        {/* Appraisal Configuration - Placeholder */}
        <AccordionItem value="appraisals" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Appraisal Configuration</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Cycles, categories, forms, actions, and integrations
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">9 sections</Badge>
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Appraisal Configuration sections will be documented in the next update.</p>
              <p className="text-sm mt-2">Covers: Cycles, Categories, Form Templates, Action Rules, Employee Response, HR Escalations, Integration, Index Settings, Benchmarks</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
