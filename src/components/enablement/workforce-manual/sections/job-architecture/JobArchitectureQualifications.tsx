import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Award, AlertTriangle, Upload } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  WarningCallout,
  type Step
} from '../../../manual/components';

const addQualificationSteps: Step[] = [
  {
    title: "Access Qualification Types",
    description: "Navigate to Administration → Lookup Values → Qualification Types",
    expectedResult: "Qualification types configuration page displays"
  },
  {
    title: "Create Qualification Type",
    description: "Add types like: Degree, Diploma, Certificate, Professional License",
    expectedResult: "Qualification types are available for selection"
  },
  {
    title: "Set Up Accrediting Bodies",
    description: "Navigate to Administration → Accrediting Bodies",
    expectedResult: "You can add bodies like: CPA Board, Engineering Council, Universities"
  },
  {
    title: "Configure Qualification Fields",
    description: "Define what information to capture for each qualification",
    substeps: [
      "Qualification Name: Name of the degree/certification",
      "Type: Degree, Diploma, Certificate, License",
      "Accrediting Body: Institution that issued/validates",
      "Issue Date: When the qualification was obtained",
      "Expiry Date: For time-limited certifications",
      "Verification Status: Pending, Verified, Expired"
    ],
    expectedResult: "Qualification framework is ready for employee records"
  }
];

const employeeQualificationSteps: Step[] = [
  {
    title: "Access Employee Profile",
    description: "Navigate to the employee's profile via People → Employee Directory",
    expectedResult: "Employee profile page opens"
  },
  {
    title: "Open Qualifications Tab",
    description: "Click on the Qualifications tab in the employee profile",
    expectedResult: "Existing qualifications are listed; Add button is available"
  },
  {
    title: "Add Qualification",
    description: "Click '+ Add Qualification' and fill in details",
    substeps: [
      "Select Qualification Type",
      "Enter Qualification Name",
      "Select or add Accrediting Body",
      "Enter Issue and Expiry dates",
      "Upload supporting document (optional)"
    ],
    expectedResult: "Qualification is added to employee record"
  },
  {
    title: "Request Verification",
    description: "Set verification status or trigger verification workflow",
    expectedResult: "Qualification awaits HR verification if required"
  }
];

const qualificationTypes = [
  { type: 'Academic Degree', description: 'Bachelor, Master, Doctorate degrees', expiry: 'No expiry' },
  { type: 'Diploma', description: 'Vocational and technical diplomas', expiry: 'No expiry' },
  { type: 'Professional Certification', description: 'Industry certifications (PMP, SHRM, AWS)', expiry: 'Typically expires' },
  { type: 'Professional License', description: 'Licensed professions (CPA, Medical, Legal)', expiry: 'Annual/periodic renewal' },
  { type: 'Trade Certificate', description: 'Skilled trades (Electrician, Plumber)', expiry: 'May expire' },
  { type: 'Compliance Training', description: 'Mandatory training certifications', expiry: 'Annual refresh' },
];

export function JobArchitectureQualifications() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Set up qualification types and accrediting bodies",
          "Track employee credentials with issue and expiry dates",
          "Implement verification workflows for qualification validation",
          "Configure expiry alerts for renewable certifications"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Qualification Management Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Qualification Management enables tracking of academic credentials, professional 
            certifications, and licenses across your workforce. This supports compliance 
            requirements, job fit assessment, and succession planning.
          </p>
          
          <div className="grid gap-2">
            {qualificationTypes.map((item) => (
              <div key={item.type} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">{item.expiry}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Setting Up Qualification Types"
        steps={addQualificationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.5.1: Qualification Types configuration in Administration"
        alt="Lookup values configuration showing qualification type options"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Accrediting Bodies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Accrediting Bodies are institutions that issue or validate qualifications. 
            Setting these up enables consistent tracking and potential automated verification.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Academic Institutions</h5>
              <p className="text-sm text-muted-foreground">
                Universities, colleges, and technical schools that grant degrees and diplomas.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Professional Boards</h5>
              <p className="text-sm text-muted-foreground">
                Licensing boards and certification bodies (CPA Board, Bar Association, etc.)
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Industry Associations</h5>
              <p className="text-sm text-muted-foreground">
                Professional associations offering certifications (PMI, SHRM, AWS, etc.)
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h5 className="font-medium mb-2">Government Agencies</h5>
              <p className="text-sm text-muted-foreground">
                Government bodies issuing licenses and trade certifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Adding Employee Qualifications"
        steps={employeeQualificationSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 3.5.2: Employee Qualifications tab with credential tracking"
        alt="Employee profile showing qualifications list with status and expiry dates"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Expiry Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HRplus automatically monitors qualification expiry dates and generates alerts:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• 90 days before expiry: Initial notification to employee and manager</li>
            <li>• 30 days before expiry: Escalation to HR with action required</li>
            <li>• On expiry: Status changes to Expired; compliance reports flagged</li>
            <li>• Configurable alert thresholds per qualification type</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk Qualification Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            For initial data migration or batch updates, use the Bulk Upload feature:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Download the qualification import template</li>
            <li>• Fill in employee IDs, qualification details, and dates</li>
            <li>• Upload and preview before confirming</li>
            <li>• Review validation errors and correct as needed</li>
          </ul>
        </CardContent>
      </Card>

      <WarningCallout title="Compliance-Critical Qualifications">
        For roles where specific qualifications are legally required (e.g., licensed 
        professionals), configure job-level qualification requirements and enable 
        blocking alerts that prevent assignment without valid credentials.
      </WarningCallout>

      <InfoCallout title="Document Storage">
        Uploaded qualification documents (diplomas, certificates, licenses) are stored 
        securely in the employee's document repository with appropriate access controls.
      </InfoCallout>

      <TipCallout title="Verification Workflow">
        Set up a verification workflow where HR can mark qualifications as "Verified" 
        after reviewing supporting documents. This adds credibility to your talent data 
        and supports audit requirements.
      </TipCallout>
    </div>
  );
}
