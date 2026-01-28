import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Star } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  TipCallout,
  type FieldDefinition
} from '@/components/enablement/manual/components';

export function LndSetupGamification() {
  const learningObjectives = [
    'Configure achievement badges for course completion',
    'Set up point systems and leaderboards',
    'Create milestone-based recognition programs'
  ];

  const badgeFields: FieldDefinition[] = [
    { name: 'company_id', required: false, type: 'uuid', description: 'Company-specific badge (null = global)' },
    { name: 'name', required: true, type: 'text', description: 'Badge display name', validation: '3-100 characters' },
    { name: 'description', required: false, type: 'text', description: 'Badge description shown to learners' },
    { name: 'badge_type', required: true, type: 'enum', description: 'course_completion, milestone, or special', defaultValue: 'course_completion' },
    { name: 'icon_url', required: false, type: 'url', description: 'Badge image URL' },
    { name: 'criteria', required: true, type: 'json', description: 'Earning criteria definition' },
    { name: 'points', required: true, type: 'number', description: 'Points awarded when earned', defaultValue: '10' },
    { name: 'is_active', required: true, type: 'boolean', description: 'Badge availability', defaultValue: 'true' }
  ];

  return (
    <section id="sec-2-12" data-manual-anchor="sec-2-12" className="space-y-6">
      <h2 className="text-2xl font-bold">2.12 Badges & Gamification</h2>
      <LearningObjectives objectives={learningObjectives} />
      <p className="text-muted-foreground">
        Gamification elements like badges and points increase learner engagement and motivation. 
        Configure achievement systems that recognize progress and celebrate learning milestones.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Badge Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="font-medium">Course Completion</div>
              <div className="text-sm text-muted-foreground">Earned when specific course completed</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <div className="font-medium">Milestone</div>
              <div className="text-sm text-muted-foreground">Earned at 5, 10, 25, 50 courses</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="font-medium">Special</div>
              <div className="text-sm text-muted-foreground">Manually awarded for achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldReferenceTable fields={badgeFields} title="lms_badges Table Schema" />
      <TipCallout title="Gamification Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Start with simple course completion badges</li>
          <li>• Add milestone badges to encourage continuous learning</li>
          <li>• Use leaderboards sparingly to avoid unhealthy competition</li>
          <li>• Celebrate achievements publicly when appropriate</li>
        </ul>
      </TipCallout>
    </section>
  );
}
