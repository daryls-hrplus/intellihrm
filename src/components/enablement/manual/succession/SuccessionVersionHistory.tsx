import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertTriangle, Lightbulb, Clock } from 'lucide-react';

const VERSION_HISTORY = [
  {
    version: '1.2.0',
    date: '2026-01-27',
    status: 'current',
    changes: [
      'Appendix A: Added 5 new Quick Reference Cards (Configuration, Go-Live, Annual Cycle, Integration, Keyboard)',
      'Appendix B: Added 6 new Architecture Diagrams (Signal Mapping, Readiness Lifecycle, Risk Flow, Integration, Pool State Machine, Approval Tree)',
      'Appendix C: Added 16 new glossary terms in Configuration and Troubleshooting categories',
      'Appendix D: Added Planned Features roadmap and Deprecation Notices sections',
      'Section 11.5: Added talent_pool_review_packets field reference (12 fields)',
      'Section 11.5: Added TalentPoolNominationEvidence and HRReviewConfidenceIndicators UI troubleshooting',
      'Section 11.5: Added talent_pool_members.development_notes field documentation',
      'Total glossary terms increased from 55 to 71+',
      'Total architecture diagrams increased from 3 to 9',
      'Total quick reference cards increased from 4 to 9',
    ]
  },
  {
    version: '1.1.0',
    date: '2026-01-27',
    status: 'previous',
    changes: [
      'Chapter 11 expanded from 5 placeholder sections to 10 comprehensive sections',
      'Added 100+ documented issues with Issue ID convention (CFG-XXX, NBX-XXX, etc.)',
      'Added 4-phase diagnostic methodology (Identify → Diagnose → Resolve → Prevent)',
      'Added symptom-to-section quick reference matrix',
      'Added Configuration Issues section (11.2) with 12 detailed resolution guides',
      'Added Nine-Box & Talent Assessment Issues section (11.3) with diagnostic checklist',
      'Added Readiness Assessment Issues section (11.4) with score calculation reference',
      'Added Talent Pool & Succession Plan Issues section (11.5) with status lifecycle',
      'Added Workflow & Approval Issues section (11.6) with transaction type reference',
      'Added Data Quality & Migration Issues section (11.7) with validation checklist',
      'Added Security & Permission Issues section (11.8) with access control matrix',
      'Added AI & Automation Issues section (11.9) with data requirements reference',
      'Added Escalation Procedures section (11.10) with 4-tier support model and 20+ FAQs',
      'Chapter 7 Risk terminology aligned with Oracle HCM/SAP SuccessFactors standards',
      'Added database CHECK constraints for position_criticality and replacement_difficulty enums',
      'Fixed SuccessionAnalytics.tsx impact_level visualization bug',
      'Added assessed_by capture to FlightRiskTab.tsx for audit compliance',
      'Updated glossary with Risk of Loss, Impact of Loss, Attrition Risk terms'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-01-26',
    status: 'archived',
    changes: [
      'Initial release of Succession Planning Administrator Manual',
      '11 comprehensive parts covering all succession planning capabilities',
      'Nine-Box assessment configuration (Part 3)',
      'Readiness assessment framework (Part 4)',
      'Talent pool management (Part 5)',
      'Succession planning workflow (Part 6)',
      'Risk management including flight risk (Part 7)',
      'Career development and mentorship (Part 8)',
      'Cross-module integration patterns (Part 9)',
      '55+ glossary terms across 8 categories',
      'Quick reference cards for 4 personas',
      'Architecture diagrams for data model and workflows'
    ]
  }
];

const PLANNED_FEATURES = [
  { feature: 'AI-Powered Succession Recommendations', timeline: 'Q2 2026', priority: 'High' },
  { feature: 'External Candidate Pool Integration', timeline: 'Q3 2026', priority: 'Medium' },
  { feature: 'Succession Scenario Modeling (What-If)', timeline: 'Q3 2026', priority: 'Medium' },
  { feature: 'Board-Level Succession Dashboard', timeline: 'Q2 2026', priority: 'High' },
  { feature: 'Mobile Readiness Assessment App', timeline: 'Q4 2026', priority: 'Low' },
  { feature: 'Predictive Vacancy Forecasting', timeline: 'Q3 2026', priority: 'High' },
];

const DEPRECATION_NOTICES = [
  { 
    feature: 'Legacy Nine-Box Single-Rater Mode', 
    deprecationDate: '2026-06-01', 
    removalDate: '2026-12-01',
    migration: 'Migrate to multi-assessor configuration using succession_assessor_types table.'
  },
  { 
    feature: 'Manual Signal Score Entry', 
    deprecationDate: '2026-09-01', 
    removalDate: '2027-03-01',
    migration: 'Configure talent signal integrations via nine_box_signal_mappings for automated score capture.'
  },
];

export function SuccessionVersionHistory() {
  return (
    <div className="space-y-8" id="version-history" data-manual-anchor="version-history">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Appendix D: Version History
        </h2>
        <p className="text-muted-foreground mb-6">
          Document revision history, planned features, and deprecation notices
        </p>
      </div>

      {/* Version History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Release History</h3>
        {VERSION_HISTORY.map((version) => (
          <Card key={version.version}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Version {version.version}
                  {version.status === 'current' && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  )}
                  {version.status === 'previous' && (
                    <Badge variant="secondary">Previous</Badge>
                  )}
                  {version.status === 'archived' && (
                    <Badge variant="outline">Archived</Badge>
                  )}
                </CardTitle>
                <span className="text-sm text-muted-foreground">{version.date}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {version.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Planned Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Planned Features (Roadmap)
        </h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {PLANNED_FEATURES.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.feature}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.timeline}</Badge>
                    <Badge 
                      variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deprecation Notices */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Deprecation Notices
        </h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {DEPRECATION_NOTICES.map((notice, index) => (
                <div key={index} className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="font-medium text-sm">{notice.feature}</h4>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Deprecated: {notice.deprecationDate}</span>
                    <span>Removal: {notice.removalDate}</span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    <strong>Migration:</strong> {notice.migration}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
