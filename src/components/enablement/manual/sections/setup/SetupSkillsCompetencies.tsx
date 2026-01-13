import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, Info, AlertCircle, Zap, BookOpen } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  ScreenshotPlaceholder
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Type', required: true, type: 'Enum', description: 'SKILL or COMPETENCY - determines nature and usage', defaultValue: 'COMPETENCY', validation: 'From predefined list' },
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier for integrations', defaultValue: 'Auto-generated', validation: 'Max 20 chars, unique' },
  { name: 'Name', required: true, type: 'Text', description: 'Display name for the capability', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Category', required: true, type: 'Enum', description: 'Grouping: technical, functional (Skills) or behavioral, leadership, core (Competencies)', defaultValue: 'behavioral', validation: 'From predefined list' },
  { name: 'Description', required: false, type: 'Text', description: 'Full description of the capability', defaultValue: '—', validation: 'Max 1000 characters' },
  { name: 'Proficiency Indicators', required: true, type: 'JSONB', description: 'Behavioral descriptors for each proficiency level (1-5)', defaultValue: '—', validation: 'All 5 levels required for appraisals' },
  { name: 'ESCO URI', required: false, type: 'Text', description: 'Link to ESCO taxonomy for standardized skills', defaultValue: 'null', validation: 'Valid URI' },
  { name: 'External Source', required: false, type: 'Enum', description: 'Origin of capability: ESCO, O*NET, or Manual', defaultValue: 'Manual', validation: 'From list' },
  { name: 'Is Global', required: true, type: 'Boolean', description: 'Available to all companies (platform-wide)', defaultValue: 'false', validation: '—' },
  { name: 'Effective From', required: true, type: 'Date', description: 'When capability becomes active', defaultValue: 'Today', validation: 'Valid date' },
  { name: 'Effective To', required: false, type: 'Date', description: 'When capability expires (null = no expiry)', defaultValue: 'null', validation: 'After effective_from' },
  { name: 'Status', required: true, type: 'Enum', description: 'draft, active, or deprecated', defaultValue: 'draft', validation: 'From list' },
];

export function SetupSkillsCompetencies() {
  return (
    <Card id="sec-2-4a">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.4a</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge className="bg-blue-600 text-white dark:bg-blue-700">
            Foundational Concept
          </Badge>
        </div>
        <CardTitle className="text-2xl">Skills vs Competencies Explained</CardTitle>
        <CardDescription>
          Understanding the unified capability framework that powers performance assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Workforce', 'Skills & Competencies']} />

        <LearningObjectives
          objectives={[
            'Understand the difference between Skills and Competencies',
            'Learn how the unified capability framework stores both types',
            'Know when to use Skills vs Competencies in appraisals',
            'Understand the 5-level proficiency scale for both types'
          ]}
        />

        {/* Overview Alert */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Unified Capability Framework</h4>
              <p className="text-sm text-foreground mt-1">
                Intelli HRM uses a single table (<code className="bg-muted px-1 rounded">skills_competencies</code>) 
                with a <code className="bg-muted px-1 rounded">type</code> discriminator to store both Skills and 
                Competencies. This enables consistent management while preserving their distinct purposes.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Skills Definition */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-amber-500" />
            <h4 className="font-semibold text-lg">Skills</h4>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              Type: SKILL
            </Badge>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Skills are <strong>technical or functional abilities</strong> that can be taught, measured, and certified. 
            They represent <em>what</em> an employee knows or can do.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h5 className="font-medium mb-2">Characteristics</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Can be learned through training or practice</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Often measurable through tests or certifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Transferable across roles and organizations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Can become obsolete as technology evolves</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/30">
              <h5 className="font-medium mb-2">Example Skills</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-amber-600 dark:text-amber-400">Technical</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Python Programming</li>
                    <li>• SQL Database Management</li>
                    <li>• AWS Cloud Services</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-amber-600 dark:text-amber-400">Functional</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Financial Modeling</li>
                    <li>• Contract Negotiation</li>
                    <li>• Regulatory Compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <h5 className="font-medium text-sm mb-1">Usage in Appraisals</h5>
            <p className="text-sm text-muted-foreground">
              Skills typically appear in an <strong>optional Skills Assessment section</strong> of the appraisal form. 
              They are used for gap analysis, learning recommendations, and recruitment matching rather than 
              primary performance scoring.
            </p>
          </div>
        </div>

        <Separator />

        {/* Competencies Definition */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-purple-500" />
            <h4 className="font-semibold text-lg">Competencies</h4>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Type: COMPETENCY
            </Badge>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Competencies are <strong>behavioral attributes and soft skills</strong> that reflect <em>how</em> 
            work is done. They are developed over time through experience and mindset shifts.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h5 className="font-medium mb-2">Characteristics</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Developed over time through experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Assessed through behavioral observation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Harder to measure objectively</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Remain relevant across career changes</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/30">
              <h5 className="font-medium mb-2">Example Competencies</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-purple-600 dark:text-purple-400">Core</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Communication</li>
                    <li>• Problem Solving</li>
                    <li>• Teamwork</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-purple-600 dark:text-purple-400">Leadership</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Strategic Thinking</li>
                    <li>• People Development</li>
                    <li>• Change Management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <h5 className="font-medium text-sm mb-1">Usage in Appraisals</h5>
            <p className="text-sm text-muted-foreground">
              Competencies form the <strong>core "C" component of the CRGV model</strong> in appraisals. 
              They are linked to jobs with weights (must total 100% per job) and contribute directly to 
              the overall performance score.
            </p>
          </div>
        </div>

        <Separator />

        {/* Comparison Table */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Key Differences</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Aspect</th>
                  <th className="text-left p-3 font-medium text-amber-600 dark:text-amber-400">Skills</th>
                  <th className="text-left p-3 font-medium text-purple-600 dark:text-purple-400">Competencies</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { aspect: 'Nature', skill: 'What you know/can do', competency: 'How you work' },
                  { aspect: 'Categories', skill: 'technical, functional', competency: 'behavioral, leadership, core' },
                  { aspect: 'Teaching', skill: 'Easily taught via training', competency: 'Developed over time' },
                  { aspect: 'Assessment', skill: 'Certifications, tests, demos', competency: 'Behavioral observation' },
                  { aspect: 'In Appraisals', skill: 'Optional skills section', competency: 'Core competency section (weighted)' },
                  { aspect: 'AI Generation', skill: 'Proficiency indicators', competency: 'Behavioral indicators' },
                  { aspect: 'Job Linking', skill: 'Optional for requirements', competency: 'Required with weights (100%)' },
                  { aspect: 'ESCO/O*NET', skill: 'Common for standardization', competency: 'Less common' },
                ].map((row) => (
                  <tr key={row.aspect} className="border-t">
                    <td className="p-3 font-medium">{row.aspect}</td>
                    <td className="p-3 text-muted-foreground">{row.skill}</td>
                    <td className="p-3 text-muted-foreground">{row.competency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Shared Features */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Shared Features</h4>
          <p className="text-muted-foreground mb-4">
            Despite their differences, Skills and Competencies share these common features in the unified framework:
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</span>
                5-Level Proficiency Scale
              </h5>
              <p className="text-sm text-muted-foreground">
                Both use Foundational → Developing → Competent → Advanced → Mastery progression
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</span>
                AI-Generated Indicators
              </h5>
              <p className="text-sm text-muted-foreground">
                System can generate proficiency level descriptors using AI for both types
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</span>
                Job Linking
              </h5>
              <p className="text-sm text-muted-foreground">
                Both can be linked to jobs via job_capability_requirements with weight and level
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">4</span>
                Evidence Tracking
              </h5>
              <p className="text-sm text-muted-foreground">
                Both support skills_evidence records for documenting demonstrated proficiency
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">5</span>
                Version History
              </h5>
              <p className="text-sm text-muted-foreground">
                Effective dating (effective_from, effective_to) enables historical tracking
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">6</span>
                Import from Standards
              </h5>
              <p className="text-sm text-muted-foreground">
                Both can be imported from ESCO or O*NET taxonomies for standardization
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.4a.1: Skills & Competencies Registry showing both types in unified view"
          alt="Unified capability registry with type filter"
        />

        <Separator />

        {/* When to Use Each */}
        <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">When to Use Each Type</h4>
              <div className="mt-2 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">Use Skills When:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Tracking certifications or technical qualifications</li>
                    <li>• Building skills inventories for workforce planning</li>
                    <li>• Matching candidates to job requirements</li>
                    <li>• Identifying training and upskilling needs</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-purple-600 dark:text-purple-400 mb-1">Use Competencies When:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Evaluating performance in appraisals</li>
                    <li>• Assessing leadership readiness</li>
                    <li>• Building succession plans</li>
                    <li>• Defining role expectations and culture fit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Unified Field Reference (skills_competencies Table)" />
      </CardContent>
    </Card>
  );
}
