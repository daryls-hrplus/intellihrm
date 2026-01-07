import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Award, Target } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function EmployeeSkillsCompetencies() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Skills and competencies management tracks employee capabilities against role requirements. 
          This data feeds into performance management, succession planning, and learning recommendations.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Competency Framework</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Technical Skills
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Role-specific technical abilities</li>
              <li>• Software/tool proficiency</li>
              <li>• Industry certifications</li>
              <li>• Specialized knowledge areas</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Behavioral Competencies
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Leadership capabilities</li>
              <li>• Communication skills</li>
              <li>• Problem-solving ability</li>
              <li>• Collaboration and teamwork</li>
            </ul>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.15: Skills and Competencies assessment view"
        alt="Competency matrix showing technical and behavioral skill ratings"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Performance Integration</AlertTitle>
        <AlertDescription>
          Competency assessments flow into performance appraisals. Configure competency 
          weights in the Appraisals module for evaluation cycles.
        </AlertDescription>
      </Alert>
    </div>
  );
}
