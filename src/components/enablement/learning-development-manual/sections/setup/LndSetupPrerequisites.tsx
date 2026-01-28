import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Building2, 
  Target, 
  GitBranch,
  ArrowRight,
  Clock
} from 'lucide-react';
import { 
  LearningObjectives, 
  WarningCallout, 
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndSetupPrerequisites() {
  const learningObjectives = [
    'Understand all prerequisites before configuring the L&D module',
    'Verify cross-module dependencies are properly established',
    'Plan configuration sequence based on organizational complexity',
    'Identify required vs. optional setup components'
  ];

  const crossModuleDependencies = [
    {
      dependency: 'Employee Records',
      sourceModule: 'Workforce',
      requiredFor: 'Enrollments, Assignments, Progress Tracking',
      statusCheck: 'Profiles table populated with active employees'
    },
    {
      dependency: 'Manager Hierarchy',
      sourceModule: 'Workforce',
      requiredFor: 'Request Approvals, Team Training Views',
      statusCheck: 'Reporting structure established'
    },
    {
      dependency: 'Departments',
      sourceModule: 'Workforce',
      requiredFor: 'Budget Allocation, Compliance Targeting',
      statusCheck: 'Department codes exist and are assigned'
    },
    {
      dependency: 'Competency Framework',
      sourceModule: 'Performance',
      requiredFor: 'Course-Competency Mapping, Gap Analysis',
      statusCheck: 'Competencies defined (optional but recommended)'
    },
    {
      dependency: 'Approval Workflows',
      sourceModule: 'HR Hub',
      requiredFor: 'Training Request Processing',
      statusCheck: 'Workflow templates configured'
    }
  ];

  const preConfigChecklist = [
    { item: 'Employee data imported with active status', required: true, module: 'Workforce' },
    { item: 'Department structure finalized', required: true, module: 'Workforce' },
    { item: 'Manager reporting relationships established', required: true, module: 'Workforce' },
    { item: 'Competency framework populated', required: false, module: 'Performance' },
    { item: 'Company fiscal year configured', required: false, module: 'Admin' },
    { item: 'Approval workflow templates created', required: false, module: 'HR Hub' },
    { item: 'Email notification settings configured', required: false, module: 'Admin' }
  ];

  const implementationSequence = [
    { step: 1, entity: 'Course Categories', required: true, dependency: 'None', route: 'Admin → LMS Management → Categories', duration: '15 min' },
    { step: 2, entity: 'Courses', required: true, dependency: 'Categories', route: 'Admin → LMS Management → Courses', duration: '30 min per course' },
    { step: 3, entity: 'Modules', required: true, dependency: 'Courses', route: 'Course drill-down → Modules', duration: '15 min per module' },
    { step: 4, entity: 'Lessons', required: true, dependency: 'Modules', route: 'Module drill-down → Lessons', duration: '10 min per lesson' },
    { step: 5, entity: 'Quizzes', required: false, dependency: 'Courses', route: 'Admin → LMS Management → Quizzes', duration: '20 min per quiz' },
    { step: 6, entity: 'Learning Paths', required: false, dependency: 'Courses', route: 'Training → Learning Paths', duration: '15 min per path' },
    { step: 7, entity: 'Competency Mapping', required: false, dependency: 'Courses + Competencies', route: 'Training → Course Competencies', duration: '30 min' },
    { step: 8, entity: 'Compliance Rules', required: false, dependency: 'Courses', route: 'Training → Compliance', duration: '10 min per rule' },
    { step: 9, entity: 'Instructors', required: false, dependency: 'None', route: 'Training → Instructors', duration: '5 min per instructor' },
    { step: 10, entity: 'Training Budgets', required: false, dependency: 'Departments', route: 'Training → Budgets', duration: '15 min' },
    { step: 11, entity: 'Evaluations', required: false, dependency: 'None', route: 'Training → Evaluations', duration: '20 min per form' },
    { step: 12, entity: 'Badges', required: false, dependency: 'Courses', route: 'Admin → Gamification → Badges', duration: '5 min per badge' },
    { step: 13, entity: 'SCORM Packages', required: false, dependency: 'Courses', route: 'Course settings → SCORM', duration: '10 min per package' },
    { step: 14, entity: 'Certificate Templates', required: false, dependency: 'Courses', route: 'Admin → Certificates', duration: '30 min per template' }
  ];

  return (
    <section id="sec-2-1" data-manual-anchor="sec-2-1" className="space-y-6">
      <h2 className="text-2xl font-bold">2.1 Prerequisites & Implementation Sequence</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Before configuring the Learning & Development module, ensure all prerequisite modules 
        are properly set up. The L&D module integrates deeply with Workforce, Performance, and 
        HR Hub modules to provide seamless training management.
      </p>

      {/* Cross-Module Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Cross-Module Dependencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Dependency</TableHead>
                  <TableHead className="font-medium">Source Module</TableHead>
                  <TableHead className="font-medium">Required For</TableHead>
                  <TableHead className="font-medium">Status Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crossModuleDependencies.map((dep, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{dep.dependency}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{dep.sourceModule}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dep.requiredFor}</TableCell>
                    <TableCell className="text-sm">{dep.statusCheck}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <WarningCallout title="Critical Dependency">
        Complete Workforce module setup before L&D configuration. Missing employee records 
        will prevent enrollment operations, and undefined departments will block budget 
        allocation and compliance targeting features.
      </WarningCallout>

      {/* Pre-Configuration Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Pre-Configuration Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {preConfigChecklist.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${item.required ? 'text-green-600' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.item}</span>
                    {item.required ? (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Source: {item.module}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Sequence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Recommended Implementation Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Follow this sequence to ensure dependencies are satisfied. Required items must be 
            completed first; optional items can be configured based on organizational needs.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-16">Step</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="w-24">Required</TableHead>
                  <TableHead>Dependency</TableHead>
                  <TableHead>Admin Route</TableHead>
                  <TableHead className="w-28">Est. Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {implementationSequence.map((item) => (
                  <TableRow key={item.step}>
                    <TableCell>
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {item.step}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{item.entity}</TableCell>
                    <TableCell>
                      {item.required ? (
                        <Badge variant="destructive" className="text-xs">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.dependency}</TableCell>
                    <TableCell className="text-sm font-mono">{item.route}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.duration}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TipCallout title="Implementation Strategy">
        For initial deployment, focus on Steps 1-4 (Categories, Courses, Modules, Lessons) 
        to establish core catalog functionality. Add Quizzes and Learning Paths in Phase 2, 
        then Compliance Rules and Budgets in Phase 3. Gamification and advanced features 
        can be enabled after the core system is stable.
      </TipCallout>

      {/* Minimum Viable Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Minimum Viable Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Phase 1: Core Catalog</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>At least 3 course categories</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>5-10 initial courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>2-4 modules per course</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>1-3 lessons per module</span>
                </li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Phase 2: Assessment</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Quiz for each mandatory course</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>1-2 learning paths</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Compliance rules for mandatory training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Basic certificate template</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
