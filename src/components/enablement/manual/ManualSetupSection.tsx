import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Settings, FileText } from 'lucide-react';
import {
  SetupPrerequisites,
  SetupRatingScales,
  SetupOverallScales,
  SetupCompetencies,
  SetupApprovalWorkflows,
  SetupFormTemplates,
  SetupAppraisalCycles,
  SetupPerformanceCategories,
  SetupActionRules,
  SetupIntegrationRules,
  SetupEmployeeResponse,
  SetupHREscalations,
  SetupMultiPositionAppraisals,
  SetupIndexSettings,
  SetupBenchmarks,
} from './sections/setup';

export function ManualSetupSection() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          This section covers the complete setup and configuration of the Performance Appraisals module. 
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

        {/* Appraisal Configuration */}
        <AccordionItem value="appraisals" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Appraisal Configuration</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Forms, cycles, categories, actions, and integrations
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">10 sections</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <SetupFormTemplates />
            <SetupAppraisalCycles />
            <SetupPerformanceCategories />
            <SetupActionRules />
            <SetupIntegrationRules />
            <SetupEmployeeResponse />
            <SetupHREscalations />
            <SetupMultiPositionAppraisals />
            <SetupIndexSettings />
            <SetupBenchmarks />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
