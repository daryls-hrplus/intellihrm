import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Clock, Grid3X3, Layers } from "lucide-react";
import { 
  LearningObjectives,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  InfoCallout,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '../../../manual/components';
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

const categorySetupSteps: Step[] = [
  {
    title: "Navigate to Benefits Categories",
    description: "Access the category management screen.",
    substeps: [
      "Go to Benefits → Configuration → Categories",
      "Review any existing categories"
    ],
    expectedResult: "Categories list screen displayed"
  },
  {
    title: "Add New Category",
    description: "Create a new benefit category.",
    substeps: [
      "Click 'Add Category' button",
      "Enter category name (employee-facing)",
      "Enter category code (internal identifier)",
      "Add description for help text"
    ],
    expectedResult: "Category form opens with blank fields"
  },
  {
    title: "Configure Display Settings",
    description: "Set how the category appears to employees.",
    substeps: [
      "Set display order (1 = first shown)",
      "Choose icon for category",
      "Enable or disable category"
    ],
    expectedResult: "Category configured for employee view"
  },
  {
    title: "Save and Verify",
    description: "Complete the category setup.",
    substeps: [
      "Click Save to create category",
      "Verify category appears in list",
      "Repeat for all required categories"
    ],
    expectedResult: "All categories created and active"
  }
];

const categoryExamples: ExampleConfig[] = [
  {
    title: "Medical Category",
    context: "Primary health insurance category for all medical plans",
    values: [
      { field: "Category Name", value: "Health Insurance" },
      { field: "Category Code", value: "MEDICAL" },
      { field: "Description", value: "Medical coverage for you and your family" },
      { field: "Display Order", value: "1" },
      { field: "Status", value: "Active" }
    ],
    outcome: "Medical plans display first in employee enrollment screens"
  },
  {
    title: "FSA Category",
    context: "Flexible spending account for healthcare expenses",
    values: [
      { field: "Category Name", value: "Flexible Spending" },
      { field: "Category Code", value: "FSA" },
      { field: "Description", value: "Pre-tax accounts for healthcare and dependent care" },
      { field: "Display Order", value: "7" },
      { field: "Status", value: "Active" }
    ],
    outcome: "FSA appears after core insurance plans in enrollment flow"
  },
  {
    title: "Caribbean Group Health",
    context: "Regional group health scheme for Caribbean territories",
    values: [
      { field: "Category Name", value: "Group Health" },
      { field: "Category Code", value: "GRP-HEALTH-CAR" },
      { field: "Description", value: "Regional group health coverage" },
      { field: "Display Order", value: "1" },
      { field: "Status", value: "Active" }
    ],
    outcome: "Caribbean employees see regional plans first"
  }
];

const categoryRules: BusinessRule[] = [
  {
    rule: "Category codes must be unique across the organization",
    enforcement: "System",
    description: "Duplicate codes are rejected at save time. Codes are case-insensitive for matching."
  },
  {
    rule: "Categories cannot be deleted if plans exist",
    enforcement: "System",
    description: "Deactivate categories instead of deleting. Historical data requires category reference."
  },
  {
    rule: "Category names should be employee-friendly",
    enforcement: "Policy",
    description: "Use clear terms like 'Health Insurance' instead of 'Medical Category Type A'."
  },
  {
    rule: "Display order determines enrollment sequence",
    enforcement: "System",
    description: "Lower numbers appear first. Tie-breakers use alphabetical order."
  },
  {
    rule: "Inactive categories hide all child plans",
    enforcement: "System",
    description: "Deactivating a category removes all its plans from enrollment screens."
  }
];

export function FoundationCategories() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div id="ben-sec-2-2" className="border-b border-border pb-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 2</span>
          <span>•</span>
          <span>Section 2.2</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Benefit Categories Configuration</h2>
            <p className="text-muted-foreground mt-1">
              Medical, Dental, Vision, Life, Retirement, HSA, FSA, Wellness categories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            15 min read
          </Badge>
          <Badge variant="outline" className="text-xs">Foundation</Badge>
          <Badge variant="outline" className="text-xs">Configuration</Badge>
        </div>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand the purpose and structure of benefit categories",
          "Configure categories for different benefit types",
          "Set appropriate display order for employee enrollment experience",
          "Apply regional category structures for Caribbean and African operations"
        ]}
      />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5 text-primary" />
            Category Hierarchy Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            Benefit categories are the top-level classification for organizing your benefits offerings. 
            Categories group similar types of benefits together and provide a structure for reporting 
            and employee navigation. Each plan belongs to exactly one category.
          </p>
        </CardContent>
      </Card>

      {/* Standard Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Standard Category Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Common Plans</TableHead>
                <TableHead>Region</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Medical</TableCell>
                <TableCell>Health insurance coverage for medical expenses</TableCell>
                <TableCell>PPO, HMO, HDHP, EPO</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dental</TableCell>
                <TableCell>Coverage for dental care and procedures</TableCell>
                <TableCell>Basic, Premium, Orthodontic</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Vision</TableCell>
                <TableCell>Eye care, glasses, and contact lenses</TableCell>
                <TableCell>Basic Vision, Premium Vision</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Life Insurance</TableCell>
                <TableCell>Death benefit coverage</TableCell>
                <TableCell>Basic Life, Supplemental, AD&D</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Disability</TableCell>
                <TableCell>Income protection during disability</TableCell>
                <TableCell>Short-term, Long-term</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Retirement</TableCell>
                <TableCell>Retirement savings plans</TableCell>
                <TableCell>401(k), Pension, 403(b), SSNIT, PenCom</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSA</TableCell>
                <TableCell>Health Savings Account (tax-advantaged)</TableCell>
                <TableCell>HSA with HDHP</TableCell>
                <TableCell>US/Canada</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">FSA</TableCell>
                <TableCell>Flexible Spending Account</TableCell>
                <TableCell>Healthcare FSA, Dependent Care FSA</TableCell>
                <TableCell>US</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Wellness</TableCell>
                <TableCell>Health and wellness programs</TableCell>
                <TableCell>Gym, EAP, Mental Health</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Group Health</TableCell>
                <TableCell>Regional group schemes</TableCell>
                <TableCell>NIS, NHIS, Private Group</TableCell>
                <TableCell>Caribbean/Africa</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <StepByStep
        steps={categorySetupSteps}
        title="Category Configuration Steps"
      />

      {/* Configuration Examples */}
      <ConfigurationExample
        examples={categoryExamples}
        title="Category Configuration Examples"
      />

      {/* Business Rules */}
      <BusinessRules
        rules={categoryRules}
        title="Category Governance Rules"
      />

      {/* Screenshot */}
      <ScreenshotPlaceholder
        title="Categories Management Screen"
        description="Category list showing all configured benefit categories with status, plan counts, and display order"
        height="h-48"
      />

      {/* Info Callout */}
      <InfoCallout title="Category vs. Plan">
        Categories are the organizational containers; Plans are the actual benefit offerings. 
        For example, the "Medical" category might contain three plans: Gold PPO, Silver PPO, and HDHP. 
        Employees enroll in specific plans, but navigate by category during enrollment.
      </InfoCallout>

      {/* Best Practice */}
      <TipCallout title="Naming Best Practice">
        Keep category names employee-friendly (e.g., "Health Insurance" vs. "Medical Category Type A"). 
        Employees see these names during enrollment. Use codes for internal tracking and reporting. 
        Consider translation requirements for multilingual workforces.
      </TipCallout>
    </div>
  );
}
