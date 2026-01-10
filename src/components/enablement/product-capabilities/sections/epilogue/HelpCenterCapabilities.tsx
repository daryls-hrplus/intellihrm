import { 
  HelpCircle, 
  Book, 
  Ticket, 
  MessageCircle, 
  BarChart3, 
  Search,
  FileText,
  ThumbsUp,
  CheckCircle,
  Star,
  Video,
  Map,
  Info
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ChallengePromise } from "../../components/ChallengePromise";
import { KeyOutcomeMetrics } from "../../components/KeyOutcomeMetrics";

export const HelpCenterCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={HelpCircle}
      title="Help Center"
      tagline="Self-service support that reduces HR burden by 70%"
      overview="Empower employees and managers with instant access to knowledge, guided workflows, and intelligent support. AI-powered chatbot, comprehensive ticketing, video tutorials, and contextual help transform HR from bottleneck to enabler."
      accentColor="bg-indigo-500/10 text-indigo-500"
      badge="85+"
      id="help-center"
    >
      <div className="space-y-6">
        <ChallengePromise
          challenge="HR teams drown in repetitive questions. Employees can't find answers. Tickets pile up. Training materials sit unused. Knowledge lives in people's heads, not systems. Without intelligent self-service, HR becomes a bottleneck—reactive instead of strategic, answering the same questions instead of solving real problems."
          promise="HRplus Help Center transforms support from bottleneck to enabler. Employees find answers instantly through AI-powered search and conversational assistance. Tickets route automatically to the right people with the right priority. Knowledge is captured, organized, and continuously improved. HR finally has time for strategic work—because routine questions answer themselves."
        />

        <KeyOutcomeMetrics
          outcomes={[
            { value: "70%+", label: "Ticket Deflection", description: "Self-service success rate" },
            { value: "85%+", label: "First Contact Resolution", description: "Streamlined routing" },
            { value: "4.5+", label: "Satisfaction Score", description: "Employee experience" },
            { value: "50%+", label: "HR Time Savings", description: "Reduced routine inquiries" }
          ]}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg bg-muted/30">
          <div className="text-center p-3">
            <p className="text-sm font-medium">Employee</p>
            <p className="text-xs text-muted-foreground italic">"I find answers in seconds, not days"</p>
          </div>
          <div className="text-center p-3">
            <p className="text-sm font-medium">Manager</p>
            <p className="text-xs text-muted-foreground italic">"My team gets help without waiting for HR"</p>
          </div>
          <div className="text-center p-3">
            <p className="text-sm font-medium">HR Operations</p>
            <p className="text-xs text-muted-foreground italic">"Tickets route correctly and resolve faster"</p>
          </div>
          <div className="text-center p-3">
            <p className="text-sm font-medium">HR Leadership</p>
            <p className="text-xs text-muted-foreground italic">"Data shows what employees actually need"</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CapabilityCategory title="Knowledge Base Management" icon={Book} accentColor="text-indigo-500">
            <CapabilityItem>Article creation with rich text editor</CapabilityItem>
            <CapabilityItem>Category and tag organization</CapabilityItem>
            <CapabilityItem>Article versioning and change tracking</CapabilityItem>
            <CapabilityItem>Content review and approval workflows</CapabilityItem>
            <CapabilityItem>Article scheduling and publication</CapabilityItem>
            <CapabilityItem>Role-based content visibility</CapabilityItem>
            <CapabilityItem>Search indexing optimization</CapabilityItem>
            <CapabilityItem>Content analytics and insights</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Article Lifecycle" icon={FileText} accentColor="text-indigo-500">
            <CapabilityItem>Version history tracking</CapabilityItem>
            <CapabilityItem>Draft and publish states</CapabilityItem>
            <CapabilityItem>Review assignment and workflow</CapabilityItem>
            <CapabilityItem>Scheduled content updates</CapabilityItem>
            <CapabilityItem>Archive and expiry management</CapabilityItem>
            <CapabilityItem>Content freshness monitoring</CapabilityItem>
            <CapabilityItem>Bulk content operations</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Article Feedback" icon={ThumbsUp} accentColor="text-indigo-500">
            <CapabilityItem>Helpful/not helpful ratings</CapabilityItem>
            <CapabilityItem>Written feedback collection</CapabilityItem>
            <CapabilityItem>Feedback response workflows</CapabilityItem>
            <CapabilityItem>Content improvement suggestions</CapabilityItem>
            <CapabilityItem>Gap identification from feedback</CapabilityItem>
            <CapabilityItem>Author notifications</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Support Ticketing" icon={Ticket} accentColor="text-indigo-500">
            <CapabilityItem>Multi-channel ticket creation (web, email, chat)</CapabilityItem>
            <CapabilityItem>Custom category configuration</CapabilityItem>
            <CapabilityItem>Priority matrix with SLA rules</CapabilityItem>
            <CapabilityItem>Auto-assignment and routing rules</CapabilityItem>
            <CapabilityItem>Ticket status workflow configuration</CapabilityItem>
            <CapabilityItem>Internal notes and collaboration</CapabilityItem>
            <CapabilityItem>Parent-child ticket linking</CapabilityItem>
            <CapabilityItem>Bulk ticket operations</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Ticket Resolution" icon={CheckCircle} accentColor="text-indigo-500">
            <CapabilityItem>Resolution workflow tracking</CapabilityItem>
            <CapabilityItem>Knowledge linking (suggest articles)</CapabilityItem>
            <CapabilityItem>Resolution template library</CapabilityItem>
            <CapabilityItem>First contact resolution tracking</CapabilityItem>
            <CapabilityItem>Escalation tier management</CapabilityItem>
            <CapabilityItem>SLA breach alerts</CapabilityItem>
            <CapabilityItem>Resolution time analytics</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Satisfaction Surveys" icon={Star} accentColor="text-indigo-500">
            <CapabilityItem>Post-resolution survey triggers</CapabilityItem>
            <CapabilityItem>Custom survey questions</CapabilityItem>
            <CapabilityItem>CSAT score tracking</CapabilityItem>
            <CapabilityItem>NPS calculation</CapabilityItem>
            <CapabilityItem>Feedback trend analysis</CapabilityItem>
            <CapabilityItem>Agent performance correlation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Video Tutorial Library" icon={Video} accentColor="text-indigo-500">
            <CapabilityItem>Video content management</CapabilityItem>
            <CapabilityItem>Category organization</CapabilityItem>
            <CapabilityItem>View history tracking</CapabilityItem>
            <CapabilityItem>Video completion tracking</CapabilityItem>
            <CapabilityItem>Related content suggestions</CapabilityItem>
            <CapabilityItem>Role-based access</CapabilityItem>
            <CapabilityItem>Analytics and engagement</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Guided Tours & Walkthroughs" icon={Map} accentColor="text-indigo-500">
            <CapabilityItem>Interactive product tours</CapabilityItem>
            <CapabilityItem>Step-by-step guidance</CapabilityItem>
            <CapabilityItem>Completion tracking</CapabilityItem>
            <CapabilityItem>Tour triggering rules</CapabilityItem>
            <CapabilityItem>Analytics on tour effectiveness</CapabilityItem>
            <CapabilityItem>Role-based tour assignment</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Contextual Help" icon={Info} accentColor="text-indigo-500">
            <CapabilityItem>Field-level tooltips</CapabilityItem>
            <CapabilityItem>Screen-specific guidance</CapabilityItem>
            <CapabilityItem>Just-in-time help triggers</CapabilityItem>
            <CapabilityItem>Help bubble configuration</CapabilityItem>
            <CapabilityItem>Admin content management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="AI Assistant" icon={MessageCircle} accentColor="text-indigo-500">
            <CapabilityItem>Natural language question answering</CapabilityItem>
            <CapabilityItem>Policy-aware responses</CapabilityItem>
            <CapabilityItem>Context from current screen</CapabilityItem>
            <CapabilityItem>Article recommendation engine</CapabilityItem>
            <CapabilityItem>Conversation history</CapabilityItem>
            <CapabilityItem>Human handoff triggers</CapabilityItem>
            <CapabilityItem>Multi-language support</CapabilityItem>
            <CapabilityItem>Feedback learning loop</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Self-Service Tools" icon={Search} accentColor="text-indigo-500">
            <CapabilityItem>Guided workflow wizards</CapabilityItem>
            <CapabilityItem>Interactive troubleshooting trees</CapabilityItem>
            <CapabilityItem>Common task shortcuts</CapabilityItem>
            <CapabilityItem>Personalized quick links</CapabilityItem>
            <CapabilityItem>Recent activity access</CapabilityItem>
            <CapabilityItem>Popular content surfacing</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Help Center Analytics" icon={BarChart3} accentColor="text-indigo-500">
            <CapabilityItem>Search query analysis</CapabilityItem>
            <CapabilityItem>Zero-result query tracking</CapabilityItem>
            <CapabilityItem>Article performance metrics</CapabilityItem>
            <CapabilityItem>Ticket volume trending</CapabilityItem>
            <CapabilityItem>Resolution time analysis</CapabilityItem>
            <CapabilityItem>Agent performance dashboards</CapabilityItem>
            <CapabilityItem>Content gap identification</CapabilityItem>
            <CapabilityItem>AI recommendation accuracy</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Trending inquiry forecasting, ticket volume prediction</AICapability>
          <AICapability type="prescriptive">Article suggestions based on context, knowledge gap identification</AICapability>
          <AICapability type="automated">Ticket auto-categorization, auto-routing, duplicate detection</AICapability>
          <AICapability type="conversational">Natural language Q&A, policy-aware chatbot</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "HR Hub", description: "Policy and document library access" },
            { module: "All Modules", description: "Context-aware help from any screen" },
            { module: "Learning", description: "Training recommendations for knowledge gaps" },
            { module: "Onboarding", description: "Guided tours for new hires" },
            { module: "Employee Relations", description: "Ticket escalation to formal cases" }
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
};
