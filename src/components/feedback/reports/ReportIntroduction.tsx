import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ReportIntroductionProps {
  employeeName?: string;
  cycleName?: string;
  raterCount?: number;
  responseRate?: number;
}

export function ReportIntroduction({
  employeeName = 'the employee',
  cycleName,
  raterCount = 0,
  responseRate = 0,
}: ReportIntroductionProps) {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          How to Read This Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This 360° feedback report provides insights from multiple perspectives to support 
          {employeeName}'s professional development. Take time to review and reflect before 
          discussing with your manager.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <Users className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{raterCount}</div>
            <div className="text-xs text-muted-foreground">Raters</div>
          </div>
          <div className="text-center">
            <BarChart3 className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{responseRate}%</div>
            <div className="text-xs text-muted-foreground">Response Rate</div>
          </div>
          <div className="text-center">
            <MessageSquare className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{cycleName ? '1' : '0'}</div>
            <div className="text-xs text-muted-foreground">Cycle</div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="understanding-scores">
            <AccordionTrigger className="text-sm font-medium">
              Understanding Your Scores
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <p>Scores are typically on a 1-5 scale where:</p>
              <ul className="space-y-1 ml-4">
                <li><span className="font-medium">5.0:</span> Exceptional / Role model</li>
                <li><span className="font-medium">4.0:</span> Exceeds expectations</li>
                <li><span className="font-medium">3.0:</span> Meets expectations</li>
                <li><span className="font-medium">2.0:</span> Needs improvement</li>
                <li><span className="font-medium">1.0:</span> Significant gap</li>
              </ul>
              <p className="text-muted-foreground">
                Most scores cluster between 3.0-4.0. A score of 3.5 is solid performance.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rater-groups">
            <AccordionTrigger className="text-sm font-medium">
              Rater Groups Explained
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-3">
              <ul className="space-y-2">
                <li><span className="font-medium">Self:</span> Your own rating - compare to others' views</li>
                <li><span className="font-medium">Manager:</span> Your direct supervisor's perspective</li>
                <li><span className="font-medium">Peers:</span> Colleagues at similar levels</li>
                <li><span className="font-medium">Direct Reports:</span> Team members you manage</li>
                <li><span className="font-medium">Others:</span> Cross-functional partners, stakeholders</li>
              </ul>
              <p className="text-muted-foreground">
                Differences between groups are normal and informative - they show how your 
                behavior varies by context or audience.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="what-to-do">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                What TO Do With This Feedback
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  Look for patterns across multiple raters, not single outliers
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  Compare self-ratings to others - gaps reveal blind spots
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  Focus on 2-3 development areas, not every score below 4
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  Celebrate strengths - these are your brand and differentiators
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  Ask clarifying questions in your development conversation
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="what-not-to-do">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                What NOT To Conclude
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  Don't obsess over identifying who said what - it undermines trust
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  Don't dismiss feedback that surprises you - explore it
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  Don't compare your scores to colleagues - contexts differ
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  Don't treat low sample sizes as statistically significant
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  Don't try to fix everything at once - prioritize
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="limitations">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Understanding Limitations
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                360° feedback is a valuable data point, but it's not the complete picture:
              </p>
              <ul className="space-y-2 text-muted-foreground mt-2">
                <li>• Ratings reflect perceptions, which may differ from intent or reality</li>
                <li>• Recency bias means recent events may be weighted heavily</li>
                <li>• Cultural differences can affect how people rate</li>
                <li>• Some raters may not have observed all behaviors</li>
                <li>• Anonymity limits context for specific comments</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Use this feedback as one input for development, not as a definitive judgment.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
