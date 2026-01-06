import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  FileText, 
  Building2, 
  Globe, 
  Shield,
  Users,
  MapPin,
  Banknote
} from 'lucide-react';
import { 
  LearningObjectives,
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '../../../manual/components';

const prerequisiteCategories = [
  {
    category: "Company Registration Details",
    icon: Building2,
    color: "text-blue-600",
    items: [
      "Legal company name(s) and registration numbers",
      "Tax identification numbers (TIN/VAT)",
      "Business registration certificates",
      "Statutory body affiliations (NIS, NHT, etc.)",
      "Industry classification codes"
    ]
  },
  {
    category: "Organizational Chart",
    icon: Users,
    color: "text-green-600",
    items: [
      "Complete hierarchy from CEO to frontline",
      "Department and section structure",
      "Reporting relationships",
      "Cost center assignments",
      "Position titles and grades"
    ]
  },
  {
    category: "Geographic Footprint",
    icon: Globe,
    color: "text-purple-600",
    items: [
      "Countries of operation",
      "Physical office locations",
      "Time zones for each location",
      "Address formats by country",
      "Currency requirements"
    ]
  },
  {
    category: "Regulatory Requirements",
    icon: Shield,
    color: "text-amber-600",
    items: [
      "Labor law compliance requirements",
      "Data protection regulations (GDPR, local laws)",
      "Industry-specific regulations",
      "Union agreements (if applicable)",
      "Statutory reporting obligations"
    ]
  }
];

const documentChecklist: FieldDefinition[] = [
  {
    name: "Company Registration Certificate",
    type: "Document",
    required: true,
    description: "Official registration document from Companies Office"
  },
  {
    name: "Tax Compliance Certificate",
    type: "Document",
    required: true,
    description: "Current tax compliance certificate from revenue authority"
  },
  {
    name: "Organizational Chart",
    type: "Document/Image",
    required: true,
    description: "Visual representation of company structure"
  },
  {
    name: "Position List",
    type: "Spreadsheet",
    required: true,
    description: "Complete list of positions with grades and departments"
  },
  {
    name: "Location List",
    type: "Spreadsheet",
    required: true,
    description: "All physical locations with addresses"
  },
  {
    name: "Department Codes",
    type: "Spreadsheet",
    required: false,
    description: "Existing department codes from legacy systems"
  },
  {
    name: "Cost Center Mapping",
    type: "Spreadsheet",
    required: false,
    description: "Finance cost center codes and ownership"
  }
];

export function FoundationPrerequisites() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand all prerequisites before starting foundation setup",
          "Gather required documentation for company registration",
          "Prepare organizational data in correct formats",
          "Identify regulatory requirements for your jurisdictions"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Prerequisites Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Before configuring the organizational foundation in HRplus, you must gather 
            comprehensive information about your company structure, geographic presence, 
            and regulatory obligations. This preparation ensures a smooth setup process 
            and prevents rework.
          </p>
          
          <WarningCallout title="Critical Preparation Step">
            Incomplete prerequisite data is the #1 cause of implementation delays. 
            Allocate 2-3 days for data gathering before starting configuration.
          </WarningCallout>
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
            <MapPin className="h-5 w-5 text-primary" />
            Regional Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Caribbean</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• NIS/NHT registrations</li>
                <li>• Multi-island payroll setup</li>
                <li>• Currency handling (USD/Local)</li>
                <li>• Island-specific holidays</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Africa</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• SSNIT/Pension registrations</li>
                <li>• Regional tax variations</li>
                <li>• Multiple currency support</li>
                <li>• Local statutory bodies</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20">
              <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Global</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• GDPR compliance data</li>
                <li>• Cross-border considerations</li>
                <li>• Time zone mapping</li>
                <li>• International standards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout title="Implementation Best Practice">
        Create a shared folder with all prerequisite documents before your kickoff meeting. 
        Use the document checklist above to ensure completeness. Missing documents can be 
        flagged but should not block the initial configuration.
      </TipCallout>
    </div>
  );
}
