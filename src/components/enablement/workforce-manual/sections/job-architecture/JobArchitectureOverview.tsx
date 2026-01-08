import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, FolderTree, Users, Target, ArrowRight } from 'lucide-react';
import { 
  LearningObjectives,
  InfoCallout,
  TipCallout,
  ScreenshotPlaceholder
} from '../../../manual/components';

const architectureLayers = [
  { 
    layer: 'Job Family', 
    description: 'Broad career streams grouping related jobs (e.g., Engineering, Finance, HR)',
    example: 'Technology, Operations, Sales',
    icon: FolderTree
  },
  { 
    layer: 'Job', 
    description: 'Specific role definitions with grades, levels, and requirements',
    example: 'Software Engineer, Financial Analyst',
    icon: Briefcase
  },
  { 
    layer: 'Position', 
    description: 'Individual seats within the organization linked to departments',
    example: 'Software Engineer - Product Team (3 positions)',
    icon: Users
  },
];

const keyBenefits = [
  { benefit: 'Career Pathing', description: 'Clear progression routes within job families' },
  { benefit: 'Compensation Alignment', description: 'Consistent pay structures tied to job grades' },
  { benefit: 'Skills Management', description: 'Competency frameworks linked to job requirements' },
  { benefit: 'Workforce Planning', description: 'Headcount control through position management' },
  { benefit: 'Succession Planning', description: 'Identify critical roles and ready-now candidates' },
];

export function JobArchitectureOverview() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand the three-tier job architecture model: families, jobs, positions",
          "Recognize how job architecture supports career development",
          "Identify the relationship between jobs and organizational design",
          "Understand best practices from industry frameworks"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            What is Job Architecture?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Job Architecture is the foundational framework that defines how work is organized, 
            classified, and valued across your organization. It establishes the relationship 
            between career streams, individual jobs, and the positions that make up your 
            organizational structure.
          </p>
          <p className="text-muted-foreground">
            A well-designed job architecture enables consistent talent management practices 
            including compensation, career development, succession planning, and workforce 
            analytics.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Three-Tier Hierarchy Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {architectureLayers.map((item, index) => (
              <div key={item.layer} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  {index < architectureLayers.length - 1 && (
                    <div className="h-8 w-0.5 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <h4 className="font-semibold">{item.layer}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Example: {item.example}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 3.1.1: Job Architecture hierarchy showing the relationship between families, jobs, and positions"
        alt="Diagram showing job family containing multiple jobs, each job linked to multiple positions"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Key Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {keyBenefits.map((item) => (
              <div key={item.benefit} className="flex items-start gap-3 p-3 rounded-lg border">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{item.benefit}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="Industry Alignment">
        Intelli HRM job architecture follows industry best practices aligned with frameworks 
        from Workday, SAP SuccessFactors, and O*NET. This ensures compatibility with 
        standard job libraries and benchmarking data sources.
      </InfoCallout>

      <TipCallout title="Start with Job Families">
        When setting up job architecture, always start with Job Families. Define your 
        career streams first, then create jobs within each family, and finally establish 
        positions linked to those jobs. This top-down approach ensures consistency.
      </TipCallout>
    </div>
  );
}
