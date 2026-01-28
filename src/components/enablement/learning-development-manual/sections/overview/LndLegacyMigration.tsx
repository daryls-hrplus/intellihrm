import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRightLeft, 
  Clock, 
  Table,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  FileText,
  Database,
  Settings,
  Target,
  Shield,
  Gamepad2,
  MessageSquare
} from 'lucide-react';
import { InfoCallout, WarningCallout, TipCallout } from '@/components/enablement/manual/components/Callout';

export function LndLegacyMigration() {
  const entityMappings = [
    { legacy: 'Training Types', modern: 'lms_categories', status: 'migrated', notes: 'Renamed; supports hierarchy with parent_id' },
    { legacy: 'Training Courses', modern: 'lms_courses', status: 'migrated', notes: 'Enhanced with thumbnails, prerequisites, modules' },
    { legacy: 'Training Staff', modern: 'training_instructors', status: 'migrated', notes: 'Added internal/external flag, specializations' },
    { legacy: 'Course Costs', modern: 'training_budgets', status: 'partial', notes: 'Budget tracking exists; cost types need lookup table' },
    { legacy: 'Training Requests', modern: 'training_requests + training_request_approvals', status: 'migrated', notes: 'Full multi-step workflow support' },
    { legacy: 'Training History', modern: 'lms_enrollments + external_training_records', status: 'migrated', notes: 'LMS + external training unified view' },
    { legacy: 'Competency Mapping', modern: 'course_competencies', status: 'migrated', notes: 'Bidirectional course-competency linking' },
    { legacy: 'Training Calendar', modern: 'Training Calendar Page', status: 'migrated', notes: 'Full calendar view with filters' },
    { legacy: 'Course Evaluation', modern: 'training_evaluations + training_evaluation_responses', status: 'migrated', notes: 'Question-level response tracking' },
    { legacy: 'Certification', modern: 'lms_certificates + training_certificate_templates', status: 'migrated', notes: 'Template-based generation with expiry' },
    { legacy: 'Training Agencies', modern: 'training_agencies (NEW)', status: 'new', notes: 'External provider management restored' },
    { legacy: 'Agency Course Link', modern: 'training_agency_courses (NEW)', status: 'new', notes: 'Agency-course session scheduling' },
    { legacy: 'Delivery Methods', modern: 'training_delivery_methods (NEW)', status: 'new', notes: 'In-person, Online, VILT, Blended, OJT' },
    { legacy: 'Rating Codes', modern: 'training_rating_codes (NEW)', status: 'new', notes: 'Agency/course quality ratings' },
  ];

  const newFeatures = [
    { feature: 'Course-Module-Lesson Hierarchy', domain: 'Core LMS', icon: Database, desc: 'Industry-standard 3-tier content structure' },
    { feature: 'Quiz/Assessment Engine', domain: 'Core LMS', icon: FileText, desc: 'Multiple question types, scoring, retakes' },
    { feature: 'Learning Paths', domain: 'Learning Paths', icon: Target, desc: 'Curated course sequences with milestones' },
    { feature: 'Gamification', domain: 'Engagement', icon: Gamepad2, desc: 'Badges, points, leaderboards' },
    { feature: 'SCORM/xAPI Tracking', domain: 'eLearning', icon: FileText, desc: 'Industry-standard content tracking' },
    { feature: 'Discussion Forums', domain: 'Social', icon: MessageSquare, desc: 'Course-level discussions and collaboration' },
    { feature: 'Compliance Automation', domain: 'Compliance', icon: Shield, desc: 'Auto-assignment, recertification, alerts' },
    { feature: 'AI Recommendations', domain: 'Intelligence', icon: Zap, desc: 'Gap-based course suggestions' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-1-6" data-manual-anchor="sec-1-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <ArrowRightLeft className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1.6 Legacy Migration Guide</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                10 min read
              </Badge>
              <Badge variant="secondary" className="text-xs">Migration</Badge>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          Organizations migrating from HRplus Training or similar legacy systems will find this mapping guide 
          essential for understanding how existing concepts translate to Intelli HRM L&D. This section covers 
          entity mappings, new capabilities, and migration considerations.
        </p>

        {/* Entity Mapping Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Table className="h-5 w-5 text-emerald-600" />
            Entity Mapping Reference
          </h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Legacy (HRplus)</th>
                      <th className="text-left p-3 font-semibold">Intelli HRM</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entityMappings.map((mapping, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-3 font-medium">{mapping.legacy}</td>
                        <td className="p-3 font-mono text-xs">{mapping.modern}</td>
                        <td className="p-3">
                          <Badge 
                            variant={
                              mapping.status === 'migrated' ? 'default' : 
                              mapping.status === 'new' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {mapping.status === 'migrated' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {mapping.status === 'new' && <Zap className="h-3 w-3 mr-1" />}
                            {mapping.status === 'partial' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {mapping.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{mapping.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Features */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            New Capabilities (Not in Legacy)
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {newFeatures.map((feature, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{feature.feature}</p>
                        <Badge variant="outline" className="text-xs">{feature.domain}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Migration Considerations */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            Migration Considerations
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  Data Migration Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {[
                    'Export Training Types → Import as lms_categories',
                    'Export Training Courses → Import as lms_courses',
                    'Map Training Staff → training_instructors',
                    'Migrate Training History → lms_enrollments + external_training_records',
                    'Transfer Competency Links → course_competencies',
                    'Archive old evaluations → training_evaluations',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Validation Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Verify category hierarchy preserved',
                    'Confirm course-employee enrollment counts match',
                    'Validate completion dates and statuses',
                    'Check certificate serial number uniqueness',
                    'Test competency mappings for gap analysis',
                    'Review training request workflow configurations',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Transformation */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-emerald-600" />
            Field Transformation Reference
          </h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Legacy Field</th>
                      <th className="text-left p-2 font-semibold">New Field</th>
                      <th className="text-left p-2 font-semibold">Transformation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { legacy: 'TrainingType.Name', modern: 'lms_categories.name', transform: 'Direct copy' },
                      { legacy: 'TrainingType.Code', modern: 'lms_categories.code', transform: 'Direct copy' },
                      { legacy: 'Course.DurationHours', modern: 'lms_courses.duration_hours', transform: 'Direct copy' },
                      { legacy: 'Course.Cost', modern: 'training_budgets.spent_amount', transform: 'Aggregate by period' },
                      { legacy: 'TrainingHistory.CompletedDate', modern: 'lms_enrollments.completed_at', transform: 'Date format conversion' },
                      { legacy: 'TrainingHistory.Status', modern: 'lms_enrollments.status', transform: 'Map: Completed→completed, InProgress→in_progress' },
                      { legacy: 'Staff.IsInternal', modern: 'training_instructors.instructor_type', transform: 'Boolean to enum (internal/external)' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-2 font-mono text-xs">{row.legacy}</td>
                        <td className="p-2 font-mono text-xs">{row.modern}</td>
                        <td className="p-2 text-muted-foreground text-xs">{row.transform}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <WarningCallout title="Migration Warning">
          Before migration, ensure all legacy training records are backed up. The migration process 
          should be performed in a staging environment first, with validation before production deployment.
        </WarningCallout>

        <TipCallout title="Migration Support">
          Implementation consultants can use the <strong>External Training Records Import</strong> feature 
          (<code>/training/external</code>) to bulk-import historical training data from CSV exports 
          of legacy systems.
        </TipCallout>

        <InfoCallout title="See Also">
          For detailed field mappings, see <strong>Appendix C: Legacy Migration Mapping</strong> 
          which includes complete table-to-table and field-to-field correspondence.
        </InfoCallout>
      </section>
    </div>
  );
}
