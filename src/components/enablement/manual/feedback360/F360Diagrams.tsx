import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Database, RefreshCw, Shield, FileText, Brain, Link2, Bell, Users, Lock, BarChart3, CheckCircle } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DiagramProps {
  title: string;
  description: string;
  icon: React.ElementType;
  diagram: string;
  tables?: string[];
}

function DiagramCard({ title, description, icon: Icon, diagram, tables }: DiagramProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
            {diagram}
          </pre>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {tables && tables.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Tables:</span>
            {tables.map((table) => (
              <Badge key={table} variant="outline" className="text-xs font-mono">
                {table}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const COMPLETE_DATA_ARCHITECTURE = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    360 FEEDBACK DATA ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────────┐  │
│  │      CYCLE MANAGEMENT       │    │    FEEDBACK COLLECTION      │    │    GOVERNANCE & AI      │  │
│  ├─────────────────────────────┤    ├─────────────────────────────┤    ├─────────────────────────┤  │
│  │ • review_cycles             │    │ • feedback_360_requests     │    │ • feedback_consent      │  │
│  │ • feedback_360_cycles       │───▶│ • feedback_360_responses    │───▶│ • talent_signal_        │  │
│  │ • feedback_360_participants │    │ • feedback_360_comments     │    │   snapshots             │  │
│  │ • feedback_360_rater_       │    │ • feedback_submissions      │    │ • development_themes    │  │
│  │   categories                │    │ • external_rater_tokens     │    │ • feedback_coaching_    │  │
│  │ • feedback_360_nominations  │    │ • response_drafts           │    │   prompts               │  │
│  └─────────────────────────────┘    └─────────────────────────────┘    │ • ai_explainability_    │  │
│              │                                    │                     │   logs                  │  │
│              ▼                                    ▼                     └─────────────────────────┘  │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐              │                   │
│  │     CONTENT & SETUP         │    │      REPORTS & RESULTS      │              ▼                   │
│  ├─────────────────────────────┤    ├─────────────────────────────┤    ┌─────────────────────────┐  │
│  │ • feedback_360_frameworks   │    │ • feedback_360_report_      │    │     INTEGRATION         │  │
│  │ • feedback_360_questions    │    │   templates                 │    ├─────────────────────────┤  │
│  │ • competency_frameworks     │    │ • feedback_360_aggregated_  │    │ • appraisal_integration │  │
│  │ • competencies              │    │   scores                    │    │   _rules                │  │
│  │ • rating_scales             │    │ • feedback_360_release_     │───▶│ • nine_box_signal_      │  │
│  │ • rating_scale_labels       │    │   schedules                 │    │   mappings              │  │
│  └─────────────────────────────┘    │ • feedback_360_reports      │    │ • succession_candidates │  │
│                                      │ • benchmark_data            │    │ • idp_items             │  │
│  ┌─────────────────────────────┐    └─────────────────────────────┘    │ • employee_skill_gaps   │  │
│  │       NOTIFICATIONS         │                                       └─────────────────────────┘  │
│  ├─────────────────────────────┤    ┌─────────────────────────────┐                                  │
│  │ • notification_templates    │    │        AUDIT & LOGS         │                                  │
│  │ • notifications             │    ├─────────────────────────────┤                                  │
│  │ • notification_preferences  │    │ • feedback_360_audit_logs   │                                  │
│  │ • reminder_schedules        │    │ • feedback_ai_action_logs   │                                  │
│  └─────────────────────────────┘    │ • investigation_access_logs │                                  │
│                                      └─────────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const CYCLE_LIFECYCLE_DIAGRAM = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CYCLE LIFECYCLE STATE MACHINE                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│    ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐     │
│    │          │        │          │        │          │        │          │        │          │     │
│    │  DRAFT   │───────▶│  ACTIVE  │───────▶│COLLECTION│───────▶│PROCESSING│───────▶│  REVIEW  │     │
│    │          │        │          │        │          │        │          │        │          │     │
│    └──────────┘        └──────────┘        └──────────┘        └──────────┘        └──────────┘     │
│         │                   │                   │                   │                   │           │
│         │                   │                   │                   │                   ▼           │
│         │                   │                   │                   │            ┌──────────┐       │
│         │                   │                   │                   │            │ RELEASED │       │
│         │                   │                   │                   │            └──────────┘       │
│         │                   │                   │                   │                   │           │
│         │                   │                   │                   │                   ▼           │
│         │                   │                   │                   │            ┌──────────┐       │
│         ▼                   ▼                   ▼                   ▼            │  CLOSED  │       │
│    [Configure]        [Nominations]       [Responses]         [AI Signals]       └──────────┘       │
│    Questions          Peer Selection      Ratings Input       Theme Gen                             │
│    Framework          Manager Approval    Comments            Aggregation                           │
│    Thresholds         Self-Assessment     Reminders           Reports                               │
│                                                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  TRANSITION REQUIREMENTS:                                                                            │
│  • Draft → Active:      Questions configured, dates set, participants enrolled                      │
│  • Active → Collection: All nominations approved, minimum raters assigned                           │
│  • Collection → Processing: Deadline reached OR minimum response rate met                           │
│  • Processing → Review: Aggregation complete, reports generated                                     │
│  • Review → Released:   HR approval, release schedule configured                                    │
│  • Released → Closed:   All audiences notified, integrations synced                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const ANONYMITY_ARCHITECTURE = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ANONYMITY PROTECTION ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  RATER CATEGORY                THRESHOLD CHECK                    REPORT OUTPUT                      │
│  ─────────────                 ───────────────                    ─────────────                      │
│                                                                                                      │
│  ┌─────────────┐                                                  ┌──────────────────────┐          │
│  │    SELF     │──────────────────────────────────────────────────▶│ Identified (always) │          │
│  │ is_anon=F   │                                                  └──────────────────────┘          │
│  └─────────────┘                                                                                     │
│                                                                                                      │
│  ┌─────────────┐                                                  ┌──────────────────────┐          │
│  │   MANAGER   │──────────────────────────────────────────────────▶│ Identified (always) │          │
│  │ is_anon=F   │                                                  └──────────────────────┘          │
│  └─────────────┘                                                                                     │
│                                                                                                      │
│  ┌─────────────┐         ┌──────────────────────┐                 ┌──────────────────────┐          │
│  │    PEER     │────────▶│ Count ≥ threshold?   │─── YES ────────▶│ Category Breakdown   │          │
│  │ is_anon=T   │         │ (default: 3)         │                 └──────────────────────┘          │
│  │ threshold=3 │         └──────────────────────┘                                                    │
│  └─────────────┘                    │                                                                │
│                                    NO                                                                │
│                                     │                                                                │
│                                     ▼                                                                │
│                          ┌──────────────────────┐                 ┌──────────────────────┐          │
│                          │ Aggregate into       │────────────────▶│ "Combined Anonymous" │          │
│                          │ "Others" category    │                 │ (no category shown)  │          │
│                          └──────────────────────┘                 └──────────────────────┘          │
│                                                                                                      │
│  ┌─────────────┐         ┌──────────────────────┐                 ┌──────────────────────┐          │
│  │DIRECT REPORT│────────▶│ Count ≥ threshold?   │─── YES ────────▶│ Category Breakdown   │          │
│  │ is_anon=T   │         │ (default: 3)         │                 └──────────────────────┘          │
│  │ threshold=3 │         └──────────────────────┘                                                    │
│  └─────────────┘                    │                                                                │
│                                    NO ───────────▶ [Aggregate to "Others"]                           │
│                                                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  MANAGER BYPASS (Investigation Mode):                                                                │
│  • Requires: HR approval + documented justification + time-limited access                            │
│  • All bypass access logged to audit trail                                                          │
│  • Subject can be notified of investigation (configurable)                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const SIGNAL_PROCESSING_FLOW = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AI SIGNAL PROCESSING PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │ FEEDBACK DATA   │     │ SIGNAL ENGINE   │     │ THEME GENERATOR │     │ OUTPUT MODULES  │        │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘        │
│           │                       │                       │                       │                  │
│           ▼                       ▼                       ▼                       ▼                  │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │ Numeric Ratings │────▶│ Score Aggregate │────▶│ Competency Gaps │────▶│ Development     │        │
│  │ (1-5 scale)     │     │ by Competency   │     │ Analysis        │     │ Themes          │        │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘        │
│           │                       │                       │                       │                  │
│           ▼                       ▼                       ▼                       ▼                  │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │ Text Comments   │────▶│ NLP Extraction  │────▶│ Sentiment +     │────▶│ Coaching        │        │
│  │ (qualitative)   │     │ Themes + Entities│    │ Strength/Gap    │     │ Prompts         │        │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘        │
│           │                       │                       │                       │                  │
│           ▼                       ▼                       ▼                       ▼                  │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │ Blind Spots     │────▶│ Self vs Raters  │────▶│ Perception Gap  │────▶│ Talent Signal   │        │
│  │ (self-assessment)│    │ Comparison      │     │ Identification  │     │ Snapshot        │        │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘        │
│                                                                                   │                  │
│                                                                                   ▼                  │
│                                                  ┌────────────────────────────────────────┐         │
│                                                  │            INTEGRATION                  │         │
│                                                  ├────────────────────────────────────────┤         │
│                                                  │ • IDP Goals (development_themes → idp) │         │
│                                                  │ • Nine-Box (signal → performance axis) │         │
│                                                  │ • Learning (skill_gap → training)      │         │
│                                                  │ • Appraisal (score → contribution)     │         │
│                                                  └────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const INTEGRATION_ARCHITECTURE = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CROSS-MODULE INTEGRATION ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│                              ┌────────────────────────────────┐                                      │
│                              │       360 FEEDBACK CYCLE       │                                      │
│                              │    feedback_360_cycles         │                                      │
│                              └───────────────┬────────────────┘                                      │
│                                              │                                                       │
│           ┌──────────────────────────────────┼──────────────────────────────────┐                   │
│           │                                  │                                  │                   │
│           ▼                                  ▼                                  ▼                   │
│  ┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐              │
│  │     APPRAISALS     │         │      NINE-BOX      │         │        IDP         │              │
│  ├────────────────────┤         ├────────────────────┤         ├────────────────────┤              │
│  │ appraisal_cycle_id │         │ feed_to_nine_box   │         │ development_themes │              │
│  │ feed_to_appraisal  │         │ nine_box_signal_   │         │ → idp_items        │              │
│  │ feedback_360_weight│         │ mappings           │         │ link_type:         │              │
│  └────────────────────┘         └────────────────────┘         │ derived/informed/  │              │
│           │                              │                     │ validated          │              │
│           ▼                              ▼                     └────────────────────┘              │
│  ┌────────────────────┐         ┌────────────────────┐                  │                          │
│  │ CRGV+360 Score     │         │ Performance Axis   │                  ▼                          │
│  │ Contribution       │         │ Update             │         ┌────────────────────┐              │
│  │ (weighted average) │         │ (score mapping)    │         │     LEARNING       │              │
│  └────────────────────┘         └────────────────────┘         ├────────────────────┤              │
│                                                                │ employee_skill_gaps│              │
│  ┌────────────────────┐         ┌────────────────────┐         │ → training_        │              │
│  │     SUCCESSION     │         │    TALENT CARD     │         │   recommendations  │              │
│  ├────────────────────┤         ├────────────────────┤         └────────────────────┘              │
│  │ succession_        │         │ talent_signal_     │                                              │
│  │ candidates         │◀────────│ snapshots          │                                              │
│  │ readiness_level    │         │ source='feedback_  │                                              │
│  └────────────────────┘         │ 360'               │                                              │
│                                 └────────────────────┘                                              │
│                                                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  INTEGRATION RULES (appraisal_integration_rules):                                                    │
│  • trigger_event: '360_cycle_completed', '360_results_released'                                     │
│  • target_module: 'nine_box', 'succession', 'idp', 'learning', 'appraisal'                          │
│  • action_config: Score thresholds, approval requirements, timing                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const REPORT_GENERATION_PIPELINE = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    REPORT GENERATION PIPELINE                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ COLLECTION  │───▶│ AGGREGATION │───▶│  TEMPLATE   │───▶│  GENERATE   │───▶│   RELEASE   │        │
│  │  COMPLETE   │    │  ENGINE     │    │  SELECTION  │    │   REPORTS   │    │  SCHEDULE   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘        │
│        │                  │                  │                  │                  │                 │
│        ▼                  ▼                  ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ All rater   │    │ Score by    │    │ Subject     │    │ PDF + Web   │    │ Managers    │        │
│  │ responses   │    │ competency  │    │ template    │    │ formats     │    │ first       │        │
│  │ submitted   │    │ + category  │    ├─────────────┤    ├─────────────┤    ├─────────────┤        │
│  └─────────────┘    │ + overall   │    │ Manager     │    │ Charts +    │    │ Employees   │        │
│                     ├─────────────┤    │ template    │    │ comments    │    │ 24-48h later│        │
│                     │ Threshold   │    ├─────────────┤    ├─────────────┤    ├─────────────┤        │
│                     │ checks      │    │ HR/Admin    │    │ Anonymity   │    │ HR admin    │        │
│                     │ (anonymity) │    │ template    │    │ preserved   │    │ full access │        │
│                     └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                                                      │
│  TEMPLATE COMPONENTS:                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐         │
│  │ Header │ Overall │ Competency │ Radar  │ Blind Spot │ Comments │ Development │ Trends │         │
│  │ Info   │ Scores  │ Breakdown  │ Chart  │ Analysis   │ Section  │ Themes      │ (opt)  │         │
│  └────────────────────────────────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const EXTERNAL_RATER_FLOW = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      EXTERNAL RATER WORKFLOW                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   NOMINATE   │───▶│    INVITE    │───▶│   ACCESS     │───▶│   COMPLETE   │───▶│    SUBMIT    │   │
│  │   External   │    │   External   │    │   Secure     │    │   Feedback   │    │   Response   │   │
│  │   Rater      │    │   Rater      │    │   Form       │    │   Form       │    │              │   │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘   │
│        │                   │                   │                   │                   │            │
│        ▼                   ▼                   ▼                   ▼                   ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ Participant  │    │ System sends │    │ Token-based  │    │ No login     │    │ Token        │   │
│  │ adds email   │    │ email with   │    │ access (no   │    │ required     │    │ invalidated  │   │
│  │ + org name   │    │ unique token │    │ account req) │    │ Session-     │    │ after submit │   │
│  └──────────────┘    └──────────────┘    │ 14-day       │    │ based save   │    └──────────────┘   │
│                                          │ validity     │    └──────────────┘                       │
│                                          └──────────────┘                                            │
│                                                                                                      │
│  SECURITY CONTROLS:                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐         │
│  │ • Domain whitelist: Only approved email domains can receive invitations                │         │
│  │ • Token expiration: 14 days default, configurable per cycle                            │         │
│  │ • Rate limiting: Max 5 access attempts per hour                                        │         │
│  │ • IP logging: All access attempts logged for security audit                            │         │
│  │ • One-time use: Token invalid after successful submission                              │         │
│  └────────────────────────────────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const NOTIFICATION_WORKFLOW = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      NOTIFICATION WORKFLOW                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  EVENT TRIGGERS                     NOTIFICATION TYPES                    DELIVERY                   │
│  ──────────────                     ──────────────────                    ────────                   │
│                                                                                                      │
│  ┌─────────────────┐                ┌─────────────────┐                ┌─────────────────┐          │
│  │ Cycle Activated │───────────────▶│ CYCLE_LAUNCHED  │───────────────▶│ Email to all    │          │
│  └─────────────────┘                │ - Timeline      │                │ participants    │          │
│                                      │ - Instructions  │                └─────────────────┘          │
│  ┌─────────────────┐                └─────────────────┘                                              │
│  │ Rater Nominated │───────────────▶│ FEEDBACK_REQUEST│───────────────▶│ Email to rater  │          │
│  └─────────────────┘                │ - Subject name  │                │ + portal notif  │          │
│                                      │ - Deadline      │                └─────────────────┘          │
│  ┌─────────────────┐                └─────────────────┘                                              │
│  │ Deadline Near   │───────────────▶│ REMINDER        │───────────────▶│ Email + push    │          │
│  │ (-3d, -1d, 0d)  │                │ - Days remain   │                │ notification    │          │
│  └─────────────────┘                │ - Direct link   │                └─────────────────┘          │
│                                      └─────────────────┘                                              │
│  ┌─────────────────┐                ┌─────────────────┐                ┌─────────────────┐          │
│  │ Results Ready   │───────────────▶│ REPORT_RELEASED │───────────────▶│ Email to subject│          │
│  └─────────────────┘                │ - Report link   │                │ per schedule    │          │
│                                      │ - Debrief info  │                └─────────────────┘          │
│                                      └─────────────────┘                                              │
│                                                                                                      │
│  TEMPLATE VARIABLES:                                                                                 │
│  {{employee_name}}, {{cycle_name}}, {{deadline_date}}, {{report_url}}, {{manager_name}}             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

const CONSENT_GOVERNANCE_FLOW = `
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CONSENT & GOVERNANCE ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│                              ┌────────────────────────┐                                              │
│                              │    CONSENT TYPES       │                                              │
│                              ├────────────────────────┤                                              │
│                              │ • participation        │                                              │
│                              │ • data_processing      │                                              │
│                              │ • signal_generation    │                                              │
│                              │ • ai_analysis          │                                              │
│                              │ • cross_module_sharing │                                              │
│                              └───────────┬────────────┘                                              │
│                                          │                                                           │
│           ┌──────────────────────────────┼──────────────────────────────┐                           │
│           │                              │                              │                           │
│           ▼                              ▼                              ▼                           │
│  ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐                       │
│  │  GRANTED           │     │  DECLINED          │     │  PENDING           │                       │
│  ├────────────────────┤     ├────────────────────┤     ├────────────────────┤                       │
│  │ Full access to     │     │ Limited to basic   │     │ Prompt on first    │                       │
│  │ feature based on   │     │ participation      │     │ access to feature  │                       │
│  │ consent type       │     │ (no AI features)   │     │                    │                       │
│  └────────────────────┘     └────────────────────┘     └────────────────────┘                       │
│                                                                                                      │
│  POLICY GATES:                                                                                       │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐         │
│  │ Feature                │ Required Consent        │ Fallback if Declined               │         │
│  ├────────────────────────────────────────────────────────────────────────────────────────┤         │
│  │ Signal Processing      │ signal_generation       │ Basic aggregation only             │         │
│  │ Development Themes     │ ai_analysis             │ Manual theme creation              │         │
│  │ Talent Card Update     │ cross_module_sharing    │ No talent signal snapshot          │         │
│  │ IDP Auto-Link          │ ai_analysis + sharing   │ Manual IDP goal creation           │         │
│  └────────────────────────────────────────────────────────────────────────────────────────┘         │
│                                                                                                      │
│  AUDIT REQUIREMENTS:                                                                                 │
│  • All consent decisions logged with timestamp and method                                           │
│  • Consent changes audited (withdrawal, renewal)                                                    │
│  • GDPR: 72-hour breach notification requirement                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
`;

export function F360Diagrams() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          Architecture Diagrams
        </h2>
        <p className="text-muted-foreground mb-6">
          Visual representations of the 360 Feedback system architecture, data flows, and workflows.
          These diagrams provide technical reference for administrators and implementation consultants.
        </p>
      </div>

      <DiagramCard
        title="Complete Data Architecture"
        description="All database tables organized by domain showing relationships between cycle management, feedback collection, governance, and integration"
        icon={Database}
        diagram={COMPLETE_DATA_ARCHITECTURE}
        tables={['feedback_360_cycles', 'feedback_360_responses', 'talent_signal_snapshots', 'development_themes']}
      />

      <DiagramCard
        title="Cycle Lifecycle State Machine"
        description="Status transitions from Draft through Closed with transition requirements and activities at each stage"
        icon={RefreshCw}
        diagram={CYCLE_LIFECYCLE_DIAGRAM}
        tables={['feedback_360_cycles', 'feedback_360_participants']}
      />

      <DiagramCard
        title="Anonymity Protection Architecture"
        description="Decision tree for anonymity threshold enforcement and category aggregation with bypass procedures"
        icon={Shield}
        diagram={ANONYMITY_ARCHITECTURE}
        tables={['feedback_360_rater_categories', 'feedback_360_visibility_rules']}
      />

      <DiagramCard
        title="AI Signal Processing Pipeline"
        description="Data flow from raw feedback through NLP extraction, theme generation, and cross-module integration"
        icon={Brain}
        diagram={SIGNAL_PROCESSING_FLOW}
        tables={['talent_signal_snapshots', 'development_themes', 'feedback_coaching_prompts']}
      />

      <DiagramCard
        title="Cross-Module Integration Architecture"
        description="Integration points with Appraisals, Nine-Box, Succession, IDP, and Learning modules"
        icon={Link2}
        diagram={INTEGRATION_ARCHITECTURE}
        tables={['appraisal_integration_rules', 'nine_box_signal_mappings', 'idp_items']}
      />

      <DiagramCard
        title="Report Generation Pipeline"
        description="End-to-end flow from collection completion through template selection and staged release"
        icon={FileText}
        diagram={REPORT_GENERATION_PIPELINE}
        tables={['feedback_360_report_templates', 'feedback_360_release_schedules', 'feedback_360_aggregated_scores']}
      />

      <DiagramCard
        title="External Rater Workflow"
        description="Secure token-based access flow for non-employee raters including security controls"
        icon={Users}
        diagram={EXTERNAL_RATER_FLOW}
        tables={['feedback_360_external_raters', 'external_rater_tokens']}
      />

      <DiagramCard
        title="Notification Workflow"
        description="Event triggers, notification types, and delivery channels throughout the cycle"
        icon={Bell}
        diagram={NOTIFICATION_WORKFLOW}
        tables={['notification_templates', 'notifications', 'reminder_schedules']}
      />

      <DiagramCard
        title="Consent & Governance Architecture"
        description="GDPR-compliant consent gates controlling feature access and data processing"
        icon={Lock}
        diagram={CONSENT_GOVERNANCE_FLOW}
        tables={['feedback_consent_records', 'feedback_360_audit_logs']}
      />
    </div>
  );
}
