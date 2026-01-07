import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Sparkles, Users } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function EmployeeInterestsPreferences() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Employee interests and preferences capture personal hobbies, activities, and interests 
          to support team building, engagement initiatives, and workplace culture programs.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Interest Categories</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Sports & Fitness</h4>
            <p className="text-sm text-muted-foreground">
              Athletic activities, team sports, fitness interests
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Arts & Culture</h4>
            <p className="text-sm text-muted-foreground">
              Music, art, theater, cultural activities
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Technology & Learning</h4>
            <p className="text-sm text-muted-foreground">
              Tech hobbies, continuous learning, side projects
            </p>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.8: Employee Interests and Preferences configuration"
        alt="Interests form showing category selection for sports, arts, and technology hobbies"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Employee Engagement</AlertTitle>
        <AlertDescription>
          Interest data supports matching employees with affinity groups, 
          social clubs, and company-sponsored activities.
        </AlertDescription>
      </Alert>
    </div>
  );
}
