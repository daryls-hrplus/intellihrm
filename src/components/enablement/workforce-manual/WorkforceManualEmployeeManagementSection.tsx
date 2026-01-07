import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import {
  EmployeeRecordCreation,
  PersonalInformationManagement,
  ProfessionalDetailsWorkHistory,
  EmploymentAssignments,
  AssignmentTypes,
  EmployeeTransactions,
  MultiPositionEmployees,
  BankingPaymentSetup,
  GovernmentIdsManagement,
  DependentsBeneficiaries,
  MedicalInformation,
  ImmigrationWorkPermits,
  EmployeeLanguages,
  EmployeeSkillsCompetencies,
  SkillGapAnalysis,
  CredentialsMemberships,
  BackgroundChecks,
  ReferencesVerifications,
  EmployeeDocuments,
  AgreementsSignatures,
  ComplianceLegal,
  EvidencePortfolio,
  EmployeeBenefitsEnrollment,
  EmployeeInterestsPreferences,
  CountrySpecificDataExtensions,
  EmployeeDirectory
} from './sections/employee-management';

const EMPLOYEE_MANAGEMENT_SECTIONS = [
  { id: 'wf-sec-4-1', num: '4.1', title: 'Employee Record Creation', desc: 'Creating new employee profiles, required fields', time: 10, Component: EmployeeRecordCreation },
  { id: 'wf-sec-4-2', num: '4.2', title: 'Personal Information Management', desc: 'Contact details, emergency contacts, addresses', time: 8, Component: PersonalInformationManagement },
  { id: 'wf-sec-4-3', num: '4.3', title: 'Professional Details & Work History', desc: 'Prior employment, education, career progression', time: 12, Component: ProfessionalDetailsWorkHistory },
  { id: 'wf-sec-4-4', num: '4.4', title: 'Employment Assignments', desc: 'Primary, secondary, acting position assignments', time: 10, Component: EmploymentAssignments },
  { id: 'wf-sec-4-5', num: '4.5', title: 'Assignment Types', desc: 'Permanent, contract, temporary, secondment', time: 8, Component: AssignmentTypes },
  { id: 'wf-sec-4-6', num: '4.6', title: 'Employee Transactions', desc: 'Promotions, transfers, demotions, grade changes', time: 12, Component: EmployeeTransactions },
  { id: 'wf-sec-4-7', num: '4.7', title: 'Multi-Position Employees', desc: 'Concurrent positions, FTE split allocation', time: 8, Component: MultiPositionEmployees },
  { id: 'wf-sec-4-8', num: '4.8', title: 'Banking & Payment Setup', desc: 'Bank accounts, payment methods', time: 8, Component: BankingPaymentSetup },
  { id: 'wf-sec-4-9', num: '4.9', title: 'Government IDs Management', desc: 'ID documents, expiry tracking', time: 8, Component: GovernmentIdsManagement },
  { id: 'wf-sec-4-10', num: '4.10', title: 'Dependents & Beneficiaries', desc: 'Family records for benefits', time: 8, Component: DependentsBeneficiaries },
  { id: 'wf-sec-4-11', num: '4.11', title: 'Medical Information', desc: 'Emergency medical data, allergies', time: 6, Component: MedicalInformation },
  { id: 'wf-sec-4-12', num: '4.12', title: 'Immigration & Work Permits', desc: 'Visa, permit expiry tracking', time: 10, Component: ImmigrationWorkPermits },
  { id: 'wf-sec-4-13', num: '4.13', title: 'Employee Languages', desc: 'Language proficiency levels', time: 6, Component: EmployeeLanguages },
  { id: 'wf-sec-4-14', num: '4.14', title: 'Employee Skills & Competencies', desc: 'Skill inventory, assessments', time: 10, Component: EmployeeSkillsCompetencies },
  { id: 'wf-sec-4-15', num: '4.15', title: 'Skill Gap Analysis', desc: 'Development needs identification', time: 8, Component: SkillGapAnalysis },
  { id: 'wf-sec-4-16', num: '4.16', title: 'Credentials & Memberships', desc: 'Professional certifications', time: 6, Component: CredentialsMemberships },
  { id: 'wf-sec-4-17', num: '4.17', title: 'Background Checks', desc: 'Pre-employment screening', time: 8, Component: BackgroundChecks },
  { id: 'wf-sec-4-18', num: '4.18', title: 'References & Verifications', desc: 'Reference check management', time: 6, Component: ReferencesVerifications },
  { id: 'wf-sec-4-19', num: '4.19', title: 'Employee Documents', desc: 'Document management, expiry tracking', time: 8, Component: EmployeeDocuments },
  { id: 'wf-sec-4-20', num: '4.20', title: 'Agreements & Signatures', desc: 'Contracts, policy acknowledgments', time: 8, Component: AgreementsSignatures },
  { id: 'wf-sec-4-21', num: '4.21', title: 'Compliance & Legal', desc: 'Regulatory compliance tracking', time: 8, Component: ComplianceLegal },
  { id: 'wf-sec-4-22', num: '4.22', title: 'Evidence Portfolio', desc: 'Capability evidence, validation', time: 8, Component: EvidencePortfolio },
  { id: 'wf-sec-4-23', num: '4.23', title: 'Employee Benefits Enrollment', desc: 'Plan assignment, coverage', time: 10, Component: EmployeeBenefitsEnrollment },
  { id: 'wf-sec-4-24', num: '4.24', title: 'Employee Interests & Preferences', desc: 'Personal interests, team building', time: 4, Component: EmployeeInterestsPreferences },
  { id: 'wf-sec-4-25', num: '4.25', title: 'Country-Specific Data Extensions', desc: 'Regional compliance (MX, JM, DO)', time: 10, Component: CountrySpecificDataExtensions },
  { id: 'wf-sec-4-26', num: '4.26', title: 'Employee Directory', desc: 'Searchable directory with PII controls', time: 6, Component: EmployeeDirectory },
];

export function WorkforceManualEmployeeManagementSection() {
  return (
    <div className="space-y-8">
      <Card id="wf-part-4" data-manual-anchor="wf-part-4" className="scroll-mt-32">
        <CardHeader>
          <CardTitle className="text-2xl">Part 4: Employee Management</CardTitle>
          <CardDescription>
            Complete employee record management, professional details, assignments, and documentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This comprehensive section covers all aspects of employee data management from initial
            record creation through professional history, skills, compliance, and country-specific extensions.
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <Badge variant="outline">26 Sections</Badge>
            <Badge variant="outline">~180 min read</Badge>
            <Badge variant="outline">HR Admin, HR Ops</Badge>
          </div>
        </CardContent>
      </Card>

      {EMPLOYEE_MANAGEMENT_SECTIONS.map((section) => (
        <Card key={section.id} id={section.id} data-manual-anchor={section.id} className="scroll-mt-32">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="outline">Section {section.num}</Badge>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{section.time} min read</span>
            </div>
            <CardTitle className="text-2xl">{section.title}</CardTitle>
            <CardDescription>{section.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <section.Component />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
