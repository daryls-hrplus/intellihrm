import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Organization Structure
  { term: 'Territory', definition: 'Top-level organizational unit representing a geographic region or business segment. Contains one or more companies and defines regional settings like currency and timezone.', category: 'organization', relatedTerms: ['Company', 'Company Group'] },
  { term: 'Company', definition: 'Legal entity within a territory. Each company has its own tax ID, payroll configuration, and compliance requirements.', category: 'organization', relatedTerms: ['Territory', 'Division'] },
  { term: 'Company Group', definition: 'Collection of related companies for consolidated reporting and shared policies across legal entities.', category: 'organization', relatedTerms: ['Company', 'Territory'] },
  { term: 'Division', definition: 'Major business unit within a company, often representing a product line or geographic sub-region.', category: 'organization', relatedTerms: ['Department', 'Company'] },
  { term: 'Department', definition: 'Functional unit within a division or company where employees are organized by function (e.g., HR, Finance, Operations).', category: 'organization', relatedTerms: ['Section', 'Division', 'Cost Center'] },
  { term: 'Section', definition: 'Sub-unit within a department for granular organizational structure. Optional level in the hierarchy.', category: 'organization', relatedTerms: ['Department'] },
  { term: 'Branch', definition: 'Physical location or office within a company. Used for geographic assignment and location-based policies.', category: 'organization', relatedTerms: ['Company', 'Work Location'] },
  { term: 'Cost Center', definition: 'Accounting unit for tracking expenses. Linked to departments and positions for financial reporting and budget management.', category: 'organization', relatedTerms: ['Department', 'Position'] },
  { term: 'Work Location', definition: 'Physical or virtual location where an employee performs work. Can be linked to branches or configured for remote workers.', category: 'organization', relatedTerms: ['Branch'] },

  // Job Architecture
  { term: 'Job Family', definition: 'Grouping of related jobs that share common characteristics, skills, and career paths (e.g., Engineering, Sales, HR).', category: 'job_architecture', relatedTerms: ['Job', 'Career Path'] },
  { term: 'Job', definition: 'Template defining a role\'s responsibilities, required skills, and grade range. Multiple positions can be created from one job definition.', category: 'job_architecture', relatedTerms: ['Position', 'Job Family'] },
  { term: 'Grade', definition: 'Level within the compensation structure defining salary bands and organizational hierarchy placement.', category: 'job_architecture', relatedTerms: ['Level', 'Salary Band'] },
  { term: 'Level', definition: 'Career progression stage within a job family (e.g., Junior, Mid, Senior, Lead, Principal).', category: 'job_architecture', relatedTerms: ['Grade', 'Career Path'] },
  { term: 'Salary Band', definition: 'Range of compensation (minimum, midpoint, maximum) associated with a grade or level.', category: 'job_architecture', relatedTerms: ['Grade', 'Compa-Ratio'] },
  { term: 'Competency', definition: 'Measurable skill, knowledge, or behavior required for job performance. Linked to jobs and used in performance evaluations.', category: 'job_architecture', relatedTerms: ['Skill', 'Job'] },
  { term: 'Skill', definition: 'Specific technical or functional capability that can be assessed and developed. Part of the broader competency framework.', category: 'job_architecture', relatedTerms: ['Competency'] },
  { term: 'Career Path', definition: 'Defined progression of jobs and roles showing potential growth trajectories within job families.', category: 'job_architecture', relatedTerms: ['Job Family', 'Level'] },

  // Employee Data
  { term: 'Employee Record', definition: 'Core data entity containing personal information, employment details, and organizational assignments for an individual.', category: 'employee_data', relatedTerms: ['Profile', 'Assignment'] },
  { term: 'Profile', definition: 'Complete view of employee information including demographics, contact details, emergency contacts, and personal preferences.', category: 'employee_data', relatedTerms: ['Employee Record'] },
  { term: 'Assignment', definition: 'Linkage between an employee and a position, defining their role within the organization.', category: 'employee_data', relatedTerms: ['Position', 'Primary Position'] },
  { term: 'FTE (Full-Time Equivalent)', definition: 'Measure of employee workload. 1.0 FTE = full-time. Employees can split FTE across multiple positions.', category: 'employee_data', relatedTerms: ['Position', 'Assignment'] },
  { term: 'Primary Position', definition: 'The main position assignment for an employee when they hold multiple positions. Used for reporting relationships.', category: 'employee_data', relatedTerms: ['Assignment', 'FTE'] },
  { term: 'Employment Status', definition: 'Current state of the employment relationship: Active, On Leave, Suspended, Separated, Pre-Hire.', category: 'employee_data', relatedTerms: ['Employee Lifecycle'] },
  { term: 'Employment Type', definition: 'Classification of the employment arrangement: Full-Time, Part-Time, Contract, Temporary, Intern.', category: 'employee_data', relatedTerms: ['Employment Status'] },

  // Transactions
  { term: 'Hire', definition: 'Transaction that creates a new employment relationship and employee record in the system.', category: 'transactions', relatedTerms: ['Onboarding', 'Pre-Hire'] },
  { term: 'Promotion', definition: 'Transaction that moves an employee to a higher grade, level, or position with typically increased responsibilities and compensation.', category: 'transactions', relatedTerms: ['Transfer', 'Grade'] },
  { term: 'Transfer', definition: 'Transaction that moves an employee to a different position, department, or location without changing grade level.', category: 'transactions', relatedTerms: ['Promotion', 'Lateral Move'] },
  { term: 'Demotion', definition: 'Transaction that moves an employee to a lower grade or level, typically with reduced responsibilities.', category: 'transactions', relatedTerms: ['Promotion'] },
  { term: 'Separation', definition: 'Transaction that ends the employment relationship. Types include resignation, termination, retirement, and end of contract.', category: 'transactions', relatedTerms: ['Offboarding', 'Rehire'] },
  { term: 'Rehire', definition: 'Transaction that creates a new employment record for a previously separated employee, linking to their historical data.', category: 'transactions', relatedTerms: ['Hire', 'Separation'] },
  { term: 'Contract Extension', definition: 'Transaction that extends a fixed-term employment contract beyond its original end date.', category: 'transactions', relatedTerms: ['Employment Type'] },
  { term: 'Lateral Move', definition: 'Transfer to a different position at the same grade level, often for development or organizational needs.', category: 'transactions', relatedTerms: ['Transfer'] },

  // Position Control
  { term: 'Position', definition: 'Specific instance of a job within the organization, linked to a department and reporting structure. Has a defined FTE and budget.', category: 'position_control', relatedTerms: ['Job', 'Vacancy'] },
  { term: 'Headcount', definition: 'Number of employees in a department, company, or position. Can be measured as count or FTE.', category: 'position_control', relatedTerms: ['FTE', 'Position'] },
  { term: 'Vacancy', definition: 'Open position without an incumbent. Triggers requisition creation when filling is needed.', category: 'position_control', relatedTerms: ['Position', 'Requisition'] },
  { term: 'Position Budget', definition: 'Financial allocation for a position including salary, benefits, and overhead costs.', category: 'position_control', relatedTerms: ['Position', 'Cost Center'] },
  { term: 'Requisition', definition: 'Formal request to fill a vacant position, triggering the recruitment process.', category: 'position_control', relatedTerms: ['Vacancy', 'Position'] },
  { term: 'Incumbent', definition: 'Employee currently assigned to a position. A position can have multiple incumbents if sharing or transition.', category: 'position_control', relatedTerms: ['Position', 'Assignment'] },
  { term: 'Reporting Relationship', definition: 'Hierarchical link between positions defining manager-subordinate structure.', category: 'position_control', relatedTerms: ['Position', 'Reports To'] },
  { term: 'Reports To', definition: 'The position or person to whom an employee reports in the organizational hierarchy.', category: 'position_control', relatedTerms: ['Reporting Relationship'] },

  // ESS/MSS
  { term: 'Self-Service', definition: 'Functionality allowing employees to view information and initiate requests without HR intervention.', category: 'ess_mss', relatedTerms: ['ESS', 'MSS'] },
  { term: 'ESS (Employee Self-Service)', definition: 'Portal for employees to view their information, update personal data, and submit requests.', category: 'ess_mss', relatedTerms: ['Self-Service', 'Change Request'] },
  { term: 'MSS (Manager Self-Service)', definition: 'Portal for managers to view team information, approve requests, and initiate transactions for their reports.', category: 'ess_mss', relatedTerms: ['Self-Service', 'Approval'] },
  { term: 'Change Request', definition: 'Employee-initiated request to modify personal information, requiring approval based on risk level.', category: 'ess_mss', relatedTerms: ['ESS', 'Approval Policy'] },
  { term: 'Delegation', definition: 'Temporary transfer of approval authority from one person to another during absence.', category: 'ess_mss', relatedTerms: ['Approval', 'MSS'] },
  { term: 'Approval Policy', definition: 'Rules defining who approves specific transaction types based on criteria like amount, department, or risk.', category: 'ess_mss', relatedTerms: ['Change Request', 'Workflow'] },

  // Compliance
  { term: 'Data Retention', definition: 'Rules governing how long employee data must be kept and when it can be purged.', category: 'compliance', relatedTerms: ['GDPR', 'Audit Trail'] },
  { term: 'Audit Trail', definition: 'Chronological record of all changes to employee records with who, when, and what details.', category: 'compliance', relatedTerms: ['Data Retention'] },
  { term: 'PII (Personally Identifiable Information)', definition: 'Sensitive personal data requiring protection under privacy regulations.', category: 'compliance', relatedTerms: ['GDPR', 'Data Retention'] },
  { term: 'GDPR', definition: 'General Data Protection Regulation - EU privacy law affecting how personal data is collected, stored, and processed.', category: 'compliance', relatedTerms: ['PII', 'Data Retention'] },
  { term: 'Labor Law Compliance', definition: 'Adherence to country-specific employment regulations including working hours, leave entitlements, and termination rules.', category: 'compliance', relatedTerms: ['Jurisdiction'] },
  { term: 'Jurisdiction', definition: 'Legal region (country, state, territory) with specific labor laws and compliance requirements.', category: 'compliance', relatedTerms: ['Labor Law Compliance'] },

  // Integration
  { term: 'Payroll Sync', definition: 'Automatic transfer of employee, position, and transaction data to payroll systems for salary processing.', category: 'integration', relatedTerms: ['Transaction', 'Position'] },
  { term: 'Benefits Eligibility', definition: 'Rules determining which benefits an employee qualifies for based on employment type, tenure, and position.', category: 'integration', relatedTerms: ['Benefits', 'Employment Type'] },
  { term: 'Performance Link', definition: 'Integration connecting workforce data to performance management for goal-setting and reviews.', category: 'integration', relatedTerms: ['Performance', 'Job'] },
  { term: 'Succession Pipeline', definition: 'Integration feeding position and employee data to succession planning for talent readiness assessment.', category: 'integration', relatedTerms: ['Succession', 'Position'] },
];

const CATEGORY_LABELS: Record<string, string> = {
  organization: 'Organization Structure',
  job_architecture: 'Job Architecture',
  employee_data: 'Employee Data',
  transactions: 'Transactions',
  position_control: 'Position Control',
  ess_mss: 'ESS/MSS',
  compliance: 'Compliance',
  integration: 'Integration',
};

const CATEGORY_COLORS: Record<string, string> = {
  organization: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  job_architecture: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  employee_data: 'bg-green-500/10 text-green-600 border-green-500/20',
  transactions: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  position_control: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  ess_mss: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  compliance: 'bg-red-500/10 text-red-600 border-red-500/20',
  integration: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

export const WorkforceManualGlossary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Object.keys(CATEGORY_LABELS);
  }, []);

  const filteredTerms = useMemo(() => {
    let terms = GLOSSARY_TERMS;

    if (selectedCategory) {
      terms = terms.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(query) ||
        t.definition.toLowerCase().includes(query) ||
        t.relatedTerms?.some(rt => rt.toLowerCase().includes(query))
      );
    }

    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  const termsByLetter = useMemo(() => {
    const grouped: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach(term => {
      const letter = term.term[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(term);
    });
    return grouped;
  }, [filteredTerms]);

  return (
    <div className="space-y-6">
      <div data-manual-anchor="glossary" id="glossary">
        <h2 className="text-2xl font-bold mb-4">Workforce Glossary</h2>
        <p className="text-muted-foreground mb-6">
          Comprehensive definitions of Workforce module terminology, entities, and concepts.
          Use the search and filters to find specific terms.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms, definitions, or related concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All ({GLOSSARY_TERMS.length})
              </Badge>
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant="outline"
                  className={`cursor-pointer ${selectedCategory === cat ? CATEGORY_COLORS[cat] : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                >
                  {CATEGORY_LABELS[cat]} ({GLOSSARY_TERMS.filter(t => t.category === cat).length})
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} terms
        </p>
        {(searchQuery || selectedCategory) && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Terms by Letter */}
      <div className="space-y-6">
        {Object.keys(termsByLetter).sort().map(letter => (
          <div key={letter}>
            <h3 className="text-lg font-bold text-primary mb-3 border-b pb-2">{letter}</h3>
            <div className="grid gap-4">
              {termsByLetter[letter].map(term => (
                <Card key={term.term} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">{term.term}</h4>
                          <Badge variant="outline" className={CATEGORY_COLORS[term.category]}>
                            {CATEGORY_LABELS[term.category]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {term.definition}
                        </p>
                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">Related:</span>
                            {term.relatedTerms.map(rt => (
                              <Badge
                                key={rt}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-secondary/80"
                                onClick={() => setSearchQuery(rt)}
                              >
                                {rt}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No terms found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query or category filter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
