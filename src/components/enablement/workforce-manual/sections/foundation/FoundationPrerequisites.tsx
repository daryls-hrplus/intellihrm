import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  FileText, 
  Building2, 
  Globe, 
  Shield,
  Users,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import { 
  LearningObjectives,
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  ScreenshotPlaceholder,
  type FieldDefinition
} from '../../../manual/components';

const prerequisiteCategories = [
  {
    category: "Legal Entity Information",
    icon: Building2,
    color: "text-blue-600",
    items: [
      "Company registration certificates",
      "Tax identification numbers (TIN/TRN/VAT)",
      "Employer registration with statutory bodies (NIS, NHT, SSNIT)",
      "Business license and permits",
      "Industry classification codes"
    ]
  },
  {
    category: "Organizational Structure",
    icon: Users,
    color: "text-green-600",
    items: [
      "Current organization chart (approved version)",
      "Department and section listings with codes",
      "Reporting relationships (position-to-position)",
      "Cost center assignments from Finance",
      "Position titles aligned to job grading"
    ]
  },
  {
    category: "Geographic & Location Data",
    icon: Globe,
    color: "text-purple-600",
    items: [
      "Complete list of physical locations/branches",
      "Headquarters designation",
      "GPS coordinates for geofencing (if applicable)",
      "Time zones for each location",
      "Country-specific address formats"
    ]
  },
  {
    category: "Compliance & Governance",
    icon: Shield,
    color: "text-amber-600",
    items: [
      "Labor law requirements by country",
      "Union agreements (where applicable)",
      "Board/management team composition",
      "Approval workflow requirements",
      "Data protection considerations"
    ]
  }
];

const documentChecklist: FieldDefinition[] = [
  {
    name: "Company Registration Certificate",
    type: "Document",
    required: true,
    description: "Official registration document from Companies Office or Registrar"
  },
  {
    name: "Tax Compliance Certificate",
    type: "Document",
    required: true,
    description: "Current tax compliance certificate from revenue authority"
  },
  {
    name: "Approved Organization Chart",
    type: "Document/Image",
    required: true,
    description: "Board-approved organizational structure"
  },
  {
    name: "Department List with Cost Centers",
    type: "Spreadsheet",
    required: true,
    description: "All departments with finance cost center codes"
  },
  {
    name: "Position Inventory",
    type: "Spreadsheet",
    required: true,
    description: "Complete position list with grades and reporting lines"
  },
  {
    name: "Branch Locations List",
    type: "Spreadsheet",
    required: true,
    description: "All physical locations with addresses"
  },
  {
    name: "Statutory Body Registrations",
    type: "Document Set",
    required: true,
    description: "NIS, NHT, pension, health fund registrations"
  }
];

const implementationSequence = [
  { step: 1, entity: "Territories", optional: true, dependency: "None", purpose: "Geographic compliance grouping" },
  { step: 2, entity: "Company Groups", optional: true, dependency: "Territory (if used)", purpose: "Holding company structure" },
  { step: 3, entity: "Companies", optional: false, dependency: "Company Group (if used)", purpose: "Legal entity definition" },
  { step: 4, entity: "Divisions", optional: true, dependency: "Company", purpose: "Business unit grouping" },
  { step: 5, entity: "Departments", optional: false, dependency: "Company/Division", purpose: "Functional unit structure" },
  { step: 6, entity: "Sections", optional: true, dependency: "Department", purpose: "Team-level grouping" },
  { step: 7, entity: "Branch Locations", optional: false, dependency: "Company", purpose: "Physical location setup" },
  { step: 8, entity: "Org Chart", optional: false, dependency: "Departments, Positions", purpose: "Visual hierarchy" },
  { step: 9, entity: "Governance Bodies", optional: true, dependency: "Company", purpose: "Board/committee setup" },
];

export function FoundationPrerequisites() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand all prerequisites before starting organization hierarchy setup",
          "Gather required documentation for legal entity configuration",
          "Prepare organizational data in correct formats for import",
          "Plan the implementation sequence based on your org complexity"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Prerequisites Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Before configuring the organization hierarchy in HRplus Workforce, gather 
            comprehensive information about your company structure, geographic presence, 
            and governance requirements. This preparation follows SAP Activate and 
            Workday Deploy methodology principles.
          </p>
          
          <WarningCallout title="Critical Preparation Step">
            Incomplete prerequisite data causes 60% of implementation delays. 
            Allocate 3-5 business days for data gathering before configuration.
            Use the Implementation Wizard's checklist for guided collection.
          </WarningCallout>

          <ScreenshotPlaceholder
            caption="Figure 2.1.1: Implementation prerequisites checklist in HR Hub"
            alt="Implementation checklist showing prerequisite items with completion status"
            aspectRatio="wide"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {prerequisiteCategories.map((cat) => (
          <Card key={cat.category}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                {cat.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {cat.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <FieldReferenceTable
        title="Document Checklist"
        fields={documentChecklist}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Implementation Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Configure entities in this order. Optional entities can be skipped based on 
            organizational complexity.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Step</th>
                  <th className="text-left py-2 px-3 font-medium">Entity</th>
                  <th className="text-left py-2 px-3 font-medium">Required?</th>
                  <th className="text-left py-2 px-3 font-medium">Dependency</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {implementationSequence.map((item) => (
                  <tr key={item.step} className="border-b">
                    <td className="py-2 px-3">
                      <Badge variant="outline">{item.step}</Badge>
                    </td>
                    <td className="py-2 px-3 font-medium">{item.entity}</td>
                    <td className="py-2 px-3">
                      <Badge variant={item.optional ? "secondary" : "default"}>
                        {item.optional ? "Optional" : "Required"}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{item.dependency}</td>
                    <td className="py-2 px-3 text-muted-foreground">{item.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.1.2: Data import wizard in HR Hub for bulk organization data"
        alt="Import wizard showing template download and data validation steps"
        aspectRatio="wide"
      />

      <TipCallout title="Using the Import Wizard">
        The HR Hub → Data Import feature provides Excel templates for each entity type.
        Download templates, populate with your data, and use the validation feature 
        before importing. This significantly speeds up initial configuration.
      </TipCallout>
    </div>
  );
}
