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
  // Service Delivery
  { term: 'Help Desk', definition: 'Centralized support system for handling employee inquiries, issues, and service requests with ticket tracking and SLA management.', category: 'service_delivery', relatedTerms: ['SLA', 'Ticket Category', 'Canned Response'] },
  { term: 'SLA (Service Level Agreement)', definition: 'Defined response and resolution time targets for help desk tickets based on priority level. Triggers escalation when breached.', category: 'service_delivery', relatedTerms: ['Help Desk', 'Escalation'] },
  { term: 'Canned Response', definition: 'Pre-written template responses for common help desk inquiries that agents can quickly insert and customize.', category: 'service_delivery', relatedTerms: ['Help Desk'] },
  { term: 'Ticket Category', definition: 'Classification system for organizing help desk tickets by topic (e.g., Payroll, Benefits, IT) to route to appropriate agents.', category: 'service_delivery' },
  { term: 'Ticket Priority', definition: 'Urgency level assigned to help desk tickets (Critical, High, Medium, Low) that determines SLA targets.', category: 'service_delivery', relatedTerms: ['SLA'] },
  { term: 'Auto-Assignment', definition: 'Automatic routing of tickets to agents based on category, workload, or skills without manual intervention.', category: 'service_delivery' },

  // Knowledge Management
  { term: 'Knowledge Base', definition: 'Centralized repository of articles, FAQs, and documentation accessible to employees for self-service information.', category: 'knowledge', relatedTerms: ['Article Category', 'SOP'] },
  { term: 'Article Category', definition: 'Hierarchical classification for organizing knowledge base content by topic or department.', category: 'knowledge' },
  { term: 'SOP (Standard Operating Procedure)', definition: 'Step-by-step documented instructions for performing routine tasks consistently across the organization.', category: 'knowledge', relatedTerms: ['Knowledge Base', 'Acknowledgment Tracking'] },
  { term: 'Version Control', definition: 'System for tracking changes to documents and SOPs over time, maintaining history and allowing rollback.', category: 'knowledge' },
  { term: 'AI-Generated SOP', definition: 'Standard operating procedures created using AI assistance based on provided context and organizational patterns.', category: 'knowledge' },

  // Compliance
  { term: 'Compliance Tracker', definition: 'Module for monitoring regulatory requirements, deadlines, and organizational policy adherence across jurisdictions.', category: 'compliance', relatedTerms: ['Compliance Item', 'Jurisdiction'] },
  { term: 'Compliance Item', definition: 'Individual regulatory requirement or policy that must be tracked, with associated deadlines and responsible parties.', category: 'compliance' },
  { term: 'Jurisdiction', definition: 'Geographic or legal region (country, state, island) with specific compliance requirements and regulations.', category: 'compliance' },
  { term: 'Acknowledgment Tracking', definition: 'System for recording when employees have read and confirmed understanding of policies, SOPs, or announcements.', category: 'compliance', relatedTerms: ['SOP', 'Announcement'] },
  { term: 'Audit Trail', definition: 'Chronological record of all system activities, changes, and user actions for compliance and security purposes.', category: 'compliance' },
  { term: 'Regulatory Alert', definition: 'Notification triggered when compliance deadlines approach or regulatory changes affect the organization.', category: 'compliance' },

  // Workflow & Approvals
  { term: 'Workflow Template', definition: 'Reusable configuration defining the steps, approvers, and conditions for a specific approval process.', category: 'workflow', relatedTerms: ['Approval Policy', 'Escalation Path'] },
  { term: 'Approval Policy', definition: 'Rules determining who must approve specific types of requests based on criteria like amount, department, or risk level.', category: 'workflow', relatedTerms: ['Workflow Template'] },
  { term: 'Approval Chain', definition: 'Sequential list of approvers that a request must pass through, often hierarchical.', category: 'workflow', relatedTerms: ['Delegation'] },
  { term: 'Delegation', definition: 'Temporary transfer of approval authority from one user to another during absence or for specific request types.', category: 'workflow', relatedTerms: ['Approval Chain'] },
  { term: 'Escalation Path', definition: 'Defined route for automatically advancing requests when approvers fail to respond within timeframes.', category: 'workflow', relatedTerms: ['SLA'] },
  { term: 'Auto-Approve Rule', definition: 'Configuration that automatically approves low-risk requests meeting specific criteria without human intervention.', category: 'workflow' },

  // Communication
  { term: 'Announcement', definition: 'Company-wide or targeted communication published through the HR Hub with optional acknowledgment tracking.', category: 'communication', relatedTerms: ['Acknowledgment Tracking'] },
  { term: 'Notification Channel', definition: 'Delivery method for alerts and reminders: email, in-app notification, SMS, or push notification.', category: 'communication' },
  { term: 'Reminder Rule', definition: 'Configured trigger that sends notifications before deadlines or after periods of inactivity.', category: 'communication' },
  { term: 'Intranet', definition: 'Internal company portal for news, resources, and employee engagement content.', category: 'communication' },
  { term: 'Photo Gallery', definition: 'Shared space for uploading and organizing company event photos accessible to employees.', category: 'communication' },
  { term: 'Company Blog', definition: 'Internal blogging platform for sharing news, updates, and thought leadership within the organization.', category: 'communication' },

  // Operations
  { term: 'HR Task', definition: 'Actionable item assigned to HR team members with due dates, priorities, and status tracking.', category: 'operations', relatedTerms: ['Task Template'] },
  { term: 'Task Template', definition: 'Predefined task configuration that can be quickly applied for recurring HR activities.', category: 'operations' },
  { term: 'Recurring Task', definition: 'Task that automatically regenerates on a schedule (daily, weekly, monthly) for routine activities.', category: 'operations' },
  { term: 'Milestone', definition: 'Significant employee date tracked by the system: birthday, work anniversary, probation end, contract expiry.', category: 'operations', relatedTerms: ['Reminder Rule'] },
  { term: 'ESS (Employee Self-Service)', definition: 'Portal enabling employees to view information, submit requests, and update personal data without HR intervention.', category: 'operations' },
  { term: 'ESS Change Request', definition: 'Employee-submitted request to modify their personal information, requiring approval based on risk level.', category: 'operations', relatedTerms: ['Approval Policy'] },
  { term: 'Change Request Risk Level', definition: 'Classification of ESS changes as low, medium, or high risk determining approval workflow requirements.', category: 'operations' },

  // Analytics
  { term: 'Sentiment Analysis', definition: 'AI-powered analysis of employee feedback and communications to gauge organizational mood and satisfaction.', category: 'analytics', relatedTerms: ['eNPS', 'Pulse Survey'] },
  { term: 'eNPS (Employee Net Promoter Score)', definition: 'Metric measuring employee loyalty based on likelihood to recommend the company as a workplace.', category: 'analytics' },
  { term: 'Pulse Survey', definition: 'Short, frequent survey measuring employee sentiment and engagement on specific topics.', category: 'analytics', relatedTerms: ['Sentiment Analysis'] },
  { term: 'Recognition Points', definition: 'Reward currency earned through peer recognition that can be accumulated and potentially redeemed.', category: 'analytics', relatedTerms: ['Recognition Award'] },
  { term: 'Recognition Award', definition: 'Formal acknowledgment given to employees for achievements, with associated recognition points.', category: 'analytics' },
  { term: 'Recognition Leaderboard', definition: 'Ranking display showing top recognized employees or departments over a period.', category: 'analytics' },

  // Integration
  { term: 'Integration Hub', definition: 'Central dashboard for managing connections between HR Hub and external systems or other Intelli HRM modules.', category: 'integration' },
  { term: 'Data Import', definition: 'Process of loading bulk data into HR Hub from external files or systems with mapping and validation.', category: 'integration' },
  { term: 'Import Mapping', definition: 'Configuration defining how columns in source files correspond to HR Hub fields during data import.', category: 'integration' },
  { term: 'API Webhook', definition: 'HTTP callback that sends real-time data to external systems when specific events occur in HR Hub.', category: 'integration' },
  { term: 'Government ID Type', definition: 'Classification of official identification documents (passport, national ID, driver\'s license) for employee records.', category: 'integration' },
];

const CATEGORY_LABELS: Record<string, string> = {
  service_delivery: 'Service Delivery',
  knowledge: 'Knowledge Management',
  compliance: 'Compliance',
  workflow: 'Workflow & Approvals',
  communication: 'Communication',
  operations: 'Operations',
  analytics: 'Analytics',
  integration: 'Integration',
};

const CATEGORY_COLORS: Record<string, string> = {
  service_delivery: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  knowledge: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  compliance: 'bg-red-500/10 text-red-600 border-red-500/20',
  workflow: 'bg-green-500/10 text-green-600 border-green-500/20',
  communication: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  operations: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  analytics: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  integration: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

export const HRHubManualGlossary = () => {
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
        <h2 className="text-2xl font-bold mb-4">HR Hub Glossary</h2>
        <p className="text-muted-foreground mb-6">
          Comprehensive definitions of HR Hub terminology, features, and concepts.
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
