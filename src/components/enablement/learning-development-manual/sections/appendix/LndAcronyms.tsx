import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookText } from 'lucide-react';

const ACRONYMS = [
  // Core LMS
  { acronym: 'LMS', fullForm: 'Learning Management System', category: 'Core' },
  { acronym: 'SCORM', fullForm: 'Sharable Content Object Reference Model', category: 'Core' },
  { acronym: 'xAPI', fullForm: 'Experience API (Tin Can API)', category: 'Core' },
  { acronym: 'LTI', fullForm: 'Learning Tools Interoperability', category: 'Core' },
  { acronym: 'AICC', fullForm: 'Aviation Industry Computer-Based Training Committee', category: 'Core' },
  { acronym: 'CMI', fullForm: 'Computer Managed Instruction', category: 'Core' },
  
  // Training Operations
  { acronym: 'ILT', fullForm: 'Instructor-Led Training', category: 'Operations' },
  { acronym: 'vILT', fullForm: 'Virtual Instructor-Led Training', category: 'Operations' },
  { acronym: 'CBT', fullForm: 'Computer-Based Training', category: 'Operations' },
  { acronym: 'WBT', fullForm: 'Web-Based Training', category: 'Operations' },
  { acronym: 'OJT', fullForm: 'On-the-Job Training', category: 'Operations' },
  { acronym: 'TNA', fullForm: 'Training Needs Analysis', category: 'Operations' },
  { acronym: 'IDP', fullForm: 'Individual Development Plan', category: 'Operations' },
  { acronym: 'SME', fullForm: 'Subject Matter Expert', category: 'Operations' },
  
  // Compliance & Certification
  { acronym: 'CPE', fullForm: 'Continuing Professional Education', category: 'Compliance' },
  { acronym: 'CEU', fullForm: 'Continuing Education Unit', category: 'Compliance' },
  { acronym: 'PDU', fullForm: 'Professional Development Unit', category: 'Compliance' },
  { acronym: 'HSE', fullForm: 'Health, Safety & Environment', category: 'Compliance' },
  { acronym: 'OSHA', fullForm: 'Occupational Safety and Health Administration', category: 'Compliance' },
  { acronym: 'GDPR', fullForm: 'General Data Protection Regulation', category: 'Compliance' },
  { acronym: 'SOC', fullForm: 'System and Organization Controls', category: 'Compliance' },
  { acronym: 'ISO', fullForm: 'International Organization for Standardization', category: 'Compliance' },
  
  // Analytics & Evaluation
  { acronym: 'ROI', fullForm: 'Return on Investment', category: 'Analytics' },
  { acronym: 'KPI', fullForm: 'Key Performance Indicator', category: 'Analytics' },
  { acronym: 'NPS', fullForm: 'Net Promoter Score', category: 'Analytics' },
  { acronym: 'CSAT', fullForm: 'Customer Satisfaction Score', category: 'Analytics' },
  { acronym: 'L1-L4', fullForm: 'Kirkpatrick Levels 1-4 (Reaction, Learning, Behavior, Results)', category: 'Analytics' },
  { acronym: 'ADDIE', fullForm: 'Analysis, Design, Development, Implementation, Evaluation', category: 'Analytics' },
  { acronym: 'SAM', fullForm: 'Successive Approximation Model', category: 'Analytics' },
  
  // Technology & Integration
  { acronym: 'API', fullForm: 'Application Programming Interface', category: 'Technology' },
  { acronym: 'REST', fullForm: 'Representational State Transfer', category: 'Technology' },
  { acronym: 'SSO', fullForm: 'Single Sign-On', category: 'Technology' },
  { acronym: 'SAML', fullForm: 'Security Assertion Markup Language', category: 'Technology' },
  { acronym: 'OAuth', fullForm: 'Open Authorization', category: 'Technology' },
  { acronym: 'JWT', fullForm: 'JSON Web Token', category: 'Technology' },
  { acronym: 'SLA', fullForm: 'Service Level Agreement', category: 'Technology' },
  { acronym: 'ETL', fullForm: 'Extract, Transform, Load', category: 'Technology' },
  
  // AI & Machine Learning
  { acronym: 'AI', fullForm: 'Artificial Intelligence', category: 'AI' },
  { acronym: 'ML', fullForm: 'Machine Learning', category: 'AI' },
  { acronym: 'NLP', fullForm: 'Natural Language Processing', category: 'AI' },
  { acronym: 'LLM', fullForm: 'Large Language Model', category: 'AI' },
  { acronym: 'RAG', fullForm: 'Retrieval-Augmented Generation', category: 'AI' },
  
  // HR & Workforce
  { acronym: 'HRMS', fullForm: 'Human Resource Management System', category: 'HR' },
  { acronym: 'HRIS', fullForm: 'Human Resource Information System', category: 'HR' },
  { acronym: 'HCM', fullForm: 'Human Capital Management', category: 'HR' },
  { acronym: 'L&D', fullForm: 'Learning & Development', category: 'HR' },
  { acronym: 'T&D', fullForm: 'Training & Development', category: 'HR' },
  { acronym: 'CLO', fullForm: 'Chief Learning Officer', category: 'HR' },
  { acronym: 'ESS', fullForm: 'Employee Self-Service', category: 'HR' },
  { acronym: 'MSS', fullForm: 'Manager Self-Service', category: 'HR' },
  { acronym: 'RBAC', fullForm: 'Role-Based Access Control', category: 'HR' },
  { acronym: 'RLS', fullForm: 'Row-Level Security', category: 'HR' },
];

const CATEGORIES = ['Core', 'Operations', 'Compliance', 'Analytics', 'Technology', 'AI', 'HR'] as const;

export function LndAcronyms() {
  return (
    <section id="app-c" data-manual-anchor="app-c" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <BookText className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Appendix C: Acronyms</h2>
          <p className="text-muted-foreground">50+ L&D, LMS, and HR acronyms used throughout this manual</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {CATEGORIES.map(category => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {category}
                <Badge variant="secondary" className="ml-auto">
                  {ACRONYMS.filter(a => a.category === category).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Acronym</TableHead>
                    <TableHead>Full Form</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ACRONYMS.filter(a => a.category === category).map(item => (
                    <TableRow key={item.acronym}>
                      <TableCell className="font-mono font-semibold text-primary">{item.acronym}</TableCell>
                      <TableCell className="text-sm">{item.fullForm}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
