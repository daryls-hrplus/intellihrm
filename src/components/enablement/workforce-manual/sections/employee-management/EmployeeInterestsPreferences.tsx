import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout } from '@/components/enablement/manual/components';
import { Dumbbell, Palette, Laptop } from 'lucide-react';

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
        <FeatureCardGrid columns={3}>
          <FeatureCard 
            variant="primary" 
            icon={Dumbbell} 
            title="Sports & Fitness"
            description="Athletic activities, team sports, fitness interests"
          />
          <FeatureCard 
            variant="purple" 
            icon={Palette} 
            title="Arts & Culture"
            description="Music, art, theater, cultural activities"
          />
          <FeatureCard 
            variant="info" 
            icon={Laptop} 
            title="Technology & Learning"
            description="Tech hobbies, continuous learning, side projects"
          />
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.8: Employee Interests and Preferences configuration"
        alt="Interests form showing category selection for sports, arts, and technology hobbies"
      />

      <InfoCallout title="Employee Engagement">
        Interest data supports matching employees with affinity groups, 
        social clubs, and company-sponsored activities.
      </InfoCallout>
    </div>
  );
}
