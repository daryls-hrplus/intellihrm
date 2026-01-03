import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Users,
  Calendar,
  Settings,
  MessageSquare,
  Eye,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  CheckCircle,
  FileText,
} from "lucide-react";
import { CycleOverviewTab } from "./CycleOverviewTab";
import { CycleParticipantsTab } from "./CycleParticipantsTab";
import { CycleQuestionsTab } from "./CycleQuestionsTab";
import { CycleCompletionTab } from "./CycleCompletionTab";
import { CycleResultsTab } from "./CycleResultsTab";
import { VisibilityRules, DEFAULT_VISIBILITY_RULES } from "./CycleVisibilityRulesEditor";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface ReviewCycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  self_review_deadline: string | null;
  peer_nomination_deadline: string | null;
  feedback_deadline: string | null;
  status: string;
  include_self_review: boolean;
  include_manager_review: boolean;
  include_peer_review: boolean;
  include_direct_report_review: boolean;
  min_peer_reviewers: number;
  max_peer_reviewers: number;
  participants_count?: number;
  completion_rate?: number;
  is_manager_cycle?: boolean;
  created_by?: string;
  creator_name?: string;
  company_id?: string;
  results_released_at?: string | null;
  results_released_by?: string | null;
  release_settings?: {
    auto_release_on_close: boolean;
    release_delay_days: number;
    require_hr_approval: boolean;
    notify_on_release: boolean;
  };
  visibility_rules?: VisibilityRules;
}

interface ExpandableCycleCardProps {
  cycle: ReviewCycle;
  statusColors: Record<string, string>;
  onEdit: (cycle: ReviewCycle) => void;
  onSaveAsTemplate: (cycle: ReviewCycle) => void;
  onManageParticipants: (cycle: ReviewCycle) => void;
  onManageQuestions: (cycle: ReviewCycle) => void;
  onUpdate: () => void;
  showCreator?: boolean;
}

export function ExpandableCycleCard({
  cycle,
  statusColors,
  onEdit,
  onSaveAsTemplate,
  onManageParticipants,
  onManageQuestions,
  onUpdate,
  showCreator = false,
}: ExpandableCycleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Card Header - Always visible */}
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <h3 className="font-semibold">{cycle.name}</h3>
                <Badge className={statusColors[cycle.status]}>
                  {cycle.status.replace("_", " ")}
                </Badge>
                {showCreator && cycle.creator_name && (
                  <Badge variant="outline" className="text-xs">
                    By: {cycle.creator_name}
                  </Badge>
                )}
              </div>
              {cycle.description && (
                <p className="text-sm text-muted-foreground mt-1 ml-11">
                  {cycle.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 ml-11 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateForDisplay(cycle.start_date, "MMM d")} -{" "}
                  {formatDateForDisplay(cycle.end_date, "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {cycle.participants_count} participants
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completion</p>
                <div className="flex items-center gap-2">
                  <Progress value={cycle.completion_rate} className="w-24 h-2" />
                  <span className="text-sm font-medium">{cycle.completion_rate}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageParticipants(cycle)}
                  title="Manage Participants"
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageQuestions(cycle)}
                  title="Configure Questions"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSaveAsTemplate(cycle)}
                  title="Save as Template"
                >
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(cycle)}
                  title="Edit Cycle"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Expandable Content */}
        <CollapsibleContent>
          <div className="border-t px-4 pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="participants" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Participants</span>
                </TabsTrigger>
                <TabsTrigger value="questions" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Questions</span>
                </TabsTrigger>
                <TabsTrigger value="completion" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Completion</span>
                </TabsTrigger>
                <TabsTrigger value="results" className="gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Results</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <CycleOverviewTab cycle={cycle} onUpdate={onUpdate} />
              </TabsContent>

              <TabsContent value="participants" className="mt-4">
                <CycleParticipantsTab
                  cycleId={cycle.id}
                  onOpenFullManager={() => onManageParticipants(cycle)}
                />
              </TabsContent>

              <TabsContent value="questions" className="mt-4">
                <CycleQuestionsTab
                  cycleId={cycle.id}
                  onOpenQuestionsManager={() => onManageQuestions(cycle)}
                />
              </TabsContent>

              <TabsContent value="completion" className="mt-4">
                <CycleCompletionTab
                  cycleId={cycle.id}
                  feedbackDeadline={cycle.feedback_deadline}
                />
              </TabsContent>

              <TabsContent value="results" className="mt-4">
                <CycleResultsTab
                  cycleId={cycle.id}
                  cycleName={cycle.name}
                  cycleStatus={cycle.status}
                  resultsReleasedAt={cycle.results_released_at}
                  resultsReleasedBy={cycle.results_released_by}
                  releaseSettings={cycle.release_settings}
                  visibilityRules={cycle.visibility_rules || DEFAULT_VISIBILITY_RULES}
                  companyId={cycle.company_id}
                  participantsCount={cycle.participants_count}
                  onUpdate={onUpdate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
