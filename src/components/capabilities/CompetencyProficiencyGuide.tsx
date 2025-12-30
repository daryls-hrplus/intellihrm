import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { DEFAULT_PROFICIENCY_LEVELS } from "./CompetencyBehavioralLevelsEditor";

interface CompetencyProficiencyGuideProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function CompetencyProficiencyGuide({
  trigger,
  className,
}: CompetencyProficiencyGuideProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className={className}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Assessment Guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Competency Assessment Guide
          </DialogTitle>
          <DialogDescription>
            How to accurately assess competency levels using behavioral indicators
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Framework Overview */}
            <section>
              <h3 className="font-semibold text-lg mb-3">Understanding Proficiency Levels</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This framework is based on the Dreyfus Model of skill acquisition, widely used in
                enterprise HR systems like Workday and SAP SuccessFactors. Each level represents
                a distinct stage of competency development.
              </p>

              <div className="space-y-3">
                {DEFAULT_PROFICIENCY_LEVELS.map((level) => (
                  <Card key={level.level} className={`${level.color} border`}>
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="text-lg">{level.icon}</span>
                        Level {level.level}: {level.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <p className="text-sm opacity-90">{level.description}</p>
                      <div className="mt-2 text-xs opacity-75">
                        <strong>Typical characteristics:</strong>
                        <ul className="list-disc ml-4 mt-1 space-y-0.5">
                          {level.level === 1 && (
                            <>
                              <li>Follows explicit rules and procedures</li>
                              <li>Needs close supervision for most tasks</li>
                              <li>Limited ability to adapt to variations</li>
                            </>
                          )}
                          {level.level === 2 && (
                            <>
                              <li>Handles routine situations with some guidance</li>
                              <li>Recognizes when to escalate issues</li>
                              <li>Starting to see patterns and connections</li>
                            </>
                          )}
                          {level.level === 3 && (
                            <>
                              <li>Works independently on standard tasks</li>
                              <li>Applies judgment in familiar contexts</li>
                              <li>Can prioritize and make decisions autonomously</li>
                            </>
                          )}
                          {level.level === 4 && (
                            <>
                              <li>Handles complex and novel situations</li>
                              <li>Mentors and coaches others effectively</li>
                              <li>Sees the big picture and systemic impacts</li>
                            </>
                          )}
                          {level.level === 5 && (
                            <>
                              <li>Innovates and sets standards for others</li>
                              <li>Recognized authority internally and externally</li>
                              <li>Operates intuitively with deep expertise</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* Assessment Best Practices */}
            <section>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Assessment Best Practices
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                    ✓ Do This
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Rate based on <strong>consistent behavior</strong>, not best-case or isolated examples</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Check only the behavioral indicators you have <strong>directly observed</strong> or have documented evidence for</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Consider the <strong>full rating period</strong>, not just recent performance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Provide <strong>specific examples</strong> in the evidence field to support your rating</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Compare against the <strong>job-level expectations</strong>, not against other employees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Common Pitfalls */}
            <section>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Common Rating Pitfalls
              </h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                  ✗ Avoid These Mistakes
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span><strong>Central tendency:</strong> Defaulting to Level 3 for everyone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span><strong>Recency bias:</strong> Over-weighting recent events vs. the full period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span><strong>Halo effect:</strong> Letting one strong area inflate ratings in unrelated competencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span><strong>Leniency bias:</strong> Rating everyone highly to avoid difficult conversations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span><strong>Rating on potential:</strong> Assess current capability, not future potential</span>
                  </li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Using Behavioral Indicators */}
            <section>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Using Behavioral Indicators
              </h3>
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Behavioral indicators are specific, observable actions that demonstrate competency
                  at each level. Here's how to use them effectively:
                </p>

                <div className="space-y-3">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Step 1: Select the Level</h4>
                    <p className="text-muted-foreground">
                      Choose the level that best represents the employee's <strong>consistent</strong> performance.
                      The level should reflect their typical behavior, not their peak or worst moments.
                    </p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Step 2: Review Indicators</h4>
                    <p className="text-muted-foreground">
                      Read through the behavioral indicators for the selected level. These are
                      competency-specific behaviors you should look for.
                    </p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Step 3: Check Observed Behaviors</h4>
                    <p className="text-muted-foreground">
                      Only check the indicators you have <strong>actually observed</strong> or have
                      documented evidence for. You don't need to check all of them—checking 2-3
                      indicators with evidence is more valuable than checking all without support.
                    </p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Step 4: Provide Evidence</h4>
                    <p className="text-muted-foreground">
                      Document specific examples in the evidence field. Good evidence includes dates,
                      project names, stakeholder feedback, or measurable outcomes.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            {/* Calibration Tips */}
            <section>
              <h3 className="font-semibold text-lg mb-3">Calibration Guidance</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                  When assessing competencies, keep these calibration points in mind:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge className="shrink-0">L1-L2</Badge>
                    <span className="text-blue-700 dark:text-blue-400">
                      Expected for new hires and early-career employees
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="shrink-0">L3</Badge>
                    <span className="text-blue-700 dark:text-blue-400">
                      Expected for fully independent contributors
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="shrink-0">L4</Badge>
                    <span className="text-blue-700 dark:text-blue-400">
                      Expected for senior roles and team leads
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="shrink-0">L5</Badge>
                    <span className="text-blue-700 dark:text-blue-400">
                      Reserved for true subject matter experts
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
