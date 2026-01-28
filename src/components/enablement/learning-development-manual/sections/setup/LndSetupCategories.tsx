import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Lightbulb } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function LndSetupCategories() {
  const learningObjectives = [
    'Create logical course groupings for catalog organization',
    'Configure category codes and display ordering',
    'Understand category hierarchy and best practices',
    'Apply industry-standard category taxonomies'
  ];

  const categoryFields: FieldDefinition[] = [
    {
      name: 'code',
      required: true,
      type: 'text',
      description: 'Unique identifier for the category used in reports and integrations',
      validation: '2-20 characters, uppercase letters and underscores only'
    },
    {
      name: 'name',
      required: true,
      type: 'text',
      description: 'Display name shown in course catalog and filters',
      validation: '2-100 characters'
    },
    {
      name: 'description',
      required: false,
      type: 'text',
      description: 'Category description visible to learners in catalog',
      validation: 'Maximum 500 characters'
    },
    {
      name: 'icon',
      required: false,
      type: 'text',
      description: 'Lucide icon name for visual display in catalog cards',
      defaultValue: 'BookOpen',
      validation: 'Valid Lucide icon name'
    },
    {
      name: 'display_order',
      required: true,
      type: 'number',
      description: 'Sort position in category list (lower numbers appear first)',
      defaultValue: '0',
      validation: 'Integer >= 0'
    },
    {
      name: 'is_active',
      required: true,
      type: 'boolean',
      description: 'Controls category visibility in course catalog',
      defaultValue: 'true'
    },
    {
      name: 'company_id',
      required: false,
      type: 'uuid',
      description: 'Company-specific category (null = global/shared)',
      defaultValue: 'null'
    }
  ];

  const createCategorySteps: Step[] = [
    {
      title: 'Navigate to LMS Management',
      description: 'Go to Admin → LMS Management and select the Categories tab.',
      expectedResult: 'Categories list displays with any existing categories'
    },
    {
      title: 'Click Add Category',
      description: 'Click the "Add Category" button in the top-right corner of the categories table.',
      expectedResult: 'Category creation dialog/form opens'
    },
    {
      title: 'Enter Category Code',
      description: 'Enter a unique category code using uppercase letters. This code is used for reporting and integrations.',
      substeps: [
        'Use descriptive codes: COMPLIANCE, TECH, LEADERSHIP, SOFTSKILLS',
        'Keep codes short but meaningful (max 20 characters)',
        'Use underscores for multi-word codes: HEALTH_SAFETY'
      ],
      expectedResult: 'Code field populated with valid value'
    },
    {
      title: 'Enter Display Name',
      description: 'Enter the category name as it will appear in the course catalog.',
      substeps: [
        'Use title case for professional appearance',
        'Keep names concise but descriptive',
        'Consider your audience when naming'
      ]
    },
    {
      title: 'Add Description (Optional)',
      description: 'Write a brief description explaining what types of courses belong in this category.',
      notes: [
        'Description appears on category cards in catalog',
        'Helps learners navigate to relevant content'
      ]
    },
    {
      title: 'Select Icon (Optional)',
      description: 'Choose a Lucide icon to visually represent this category.',
      substeps: [
        'Shield for compliance/security courses',
        'Monitor for technical/IT courses',
        'Users for leadership/management courses',
        'Heart for wellness/soft skills courses'
      ]
    },
    {
      title: 'Set Display Order',
      description: 'Enter a number to control the sort position. Lower numbers appear first in the catalog.',
      notes: [
        'Use increments of 10 (10, 20, 30) to allow future insertions',
        'Most important categories should have lower numbers'
      ]
    },
    {
      title: 'Save Category',
      description: 'Click Save to create the category. It will be immediately available for course assignment.',
      expectedResult: 'Category appears in the categories list and is selectable when creating courses'
    }
  ];

  const categoryExamples: ExampleConfig[] = [
    {
      title: 'Compliance & Regulatory Training',
      context: 'Mandatory training required by law or company policy',
      values: [
        { field: 'Code', value: 'COMPLIANCE' },
        { field: 'Name', value: 'Compliance & Regulatory' },
        { field: 'Description', value: 'Required training for legal compliance and company policies' },
        { field: 'Icon', value: 'Shield' },
        { field: 'Display Order', value: '10' }
      ],
      outcome: 'Compliance courses prominently displayed as first category for easy access'
    },
    {
      title: 'Technical & IT Skills',
      context: 'Software, systems, and technical training for various roles',
      values: [
        { field: 'Code', value: 'TECH' },
        { field: 'Name', value: 'Technical & IT Skills' },
        { field: 'Description', value: 'Software applications, systems training, and technical certifications' },
        { field: 'Icon', value: 'Monitor' },
        { field: 'Display Order', value: '20' }
      ],
      outcome: 'Technical training organized separately from soft skills'
    },
    {
      title: 'Leadership & Management',
      context: 'People management and leadership development courses',
      values: [
        { field: 'Code', value: 'LEADERSHIP' },
        { field: 'Name', value: 'Leadership & Management' },
        { field: 'Description', value: 'Develop management skills and leadership capabilities' },
        { field: 'Icon', value: 'Users' },
        { field: 'Display Order', value: '30' }
      ],
      outcome: 'Clear pathway for employees aspiring to management roles'
    },
    {
      title: 'Professional Development',
      context: 'Soft skills and general professional growth',
      values: [
        { field: 'Code', value: 'SOFTSKILLS' },
        { field: 'Name', value: 'Professional Development' },
        { field: 'Description', value: 'Communication, teamwork, time management, and career development' },
        { field: 'Icon', value: 'Sparkles' },
        { field: 'Display Order', value: '40' }
      ],
      outcome: 'Broad category for personal and professional growth courses'
    }
  ];

  const categoryRules: BusinessRule[] = [
    {
      rule: 'Category codes must be unique',
      enforcement: 'System',
      description: 'The system prevents duplicate category codes across all companies. Global categories (company_id = null) share the same code namespace.'
    },
    {
      rule: 'Inactive categories hide associated courses',
      enforcement: 'System',
      description: 'When a category is deactivated, all courses assigned to it are hidden from the public catalog. Existing enrollments are unaffected.'
    },
    {
      rule: 'Categories with courses cannot be deleted',
      enforcement: 'System',
      description: 'Before deleting a category, all courses must be reassigned to another category or deleted. This prevents orphaned courses.'
    },
    {
      rule: 'Minimum of one active category required',
      enforcement: 'Advisory',
      description: 'At least one category should remain active for the course catalog to function properly.'
    },
    {
      rule: 'Category naming conventions',
      enforcement: 'Policy',
      description: 'Use consistent naming patterns across categories (e.g., all singular or all plural). Recommend title case for display names.'
    }
  ];

  return (
    <section id="sec-2-2" data-manual-anchor="sec-2-2" className="space-y-6">
      <h2 className="text-2xl font-bold">2.2 Course Categories Setup</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Course categories organize your training catalog into logical groupings, making it 
        easier for learners to discover relevant content. Well-designed categories improve 
        navigation, reporting, and course management efficiency.
      </p>

      {/* Industry Standard Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Industry-Standard Category Taxonomy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Most organizations use 4-8 top-level categories. Consider these proven structures:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Corporate Environment</h4>
              <ul className="space-y-1 text-sm">
                <li>• Compliance & Regulatory</li>
                <li>• Health, Safety & Environment</li>
                <li>• Leadership & Management</li>
                <li>• Technical Skills</li>
                <li>• Professional Development</li>
                <li>• Product Knowledge</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Healthcare/Regulated Industry</h4>
              <ul className="space-y-1 text-sm">
                <li>• Regulatory Compliance</li>
                <li>• Clinical Procedures</li>
                <li>• Patient Safety</li>
                <li>• Equipment & Technology</li>
                <li>• Professional Certification</li>
                <li>• Ethics & Governance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={categoryFields} 
        title="lms_categories Table Schema" 
      />

      <StepByStep 
        steps={createCategorySteps} 
        title="Creating a Course Category" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.2.1: Category Management Interface"
        alt="LMS Categories management screen showing list of categories with add/edit controls"
      />

      <ConfigurationExample 
        examples={categoryExamples}
        title="Category Configuration Examples"
      />

      <BusinessRules 
        rules={categoryRules}
        title="Category Business Rules"
      />

      <TipCallout title="Category Design Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Start with 4-6 broad categories; avoid over-categorization</li>
          <li>• Use subcategorization through course naming or tags, not nested categories</li>
          <li>• Review category usage quarterly and merge low-utilization categories</li>
          <li>• Ensure category names are meaningful to learners, not just administrators</li>
          <li>• Consider creating a "New & Featured" category for promotional courses</li>
        </ul>
      </TipCallout>

      {/* Category Icons Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Recommended Category Icons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Shield</Badge>
              <span>Compliance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">HardHat</Badge>
              <span>Safety</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Users</Badge>
              <span>Leadership</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Monitor</Badge>
              <span>Technical</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Sparkles</Badge>
              <span>Development</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Package</Badge>
              <span>Products</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Heart</Badge>
              <span>Wellness</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">GraduationCap</Badge>
              <span>Certification</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
