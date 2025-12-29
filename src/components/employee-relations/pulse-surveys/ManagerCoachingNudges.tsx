import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Lightbulb,
  Heart,
  AlertCircle,
  Award,
  Users,
  X,
  Check,
  RefreshCw,
  Loader2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useCoachingNudges, usePulseSurveyMutations, CoachingNudge } from "@/hooks/usePulseSurveys";
import { useAuth } from "@/contexts/AuthContext";

interface ManagerCoachingNudgesProps {
  companyId: string;
  departmentId?: string;
}

const NUDGE_ICONS: Record<string, React.ReactNode> = {
  recognition: <Award className="h-5 w-5" />,
  concern: <AlertCircle className="h-5 w-5" />,
  coaching: <Lightbulb className="h-5 w-5" />,
  celebration: <Heart className="h-5 w-5" />,
  intervention: <Users className="h-5 w-5" />,
};

const NUDGE_COLORS: Record<string, string> = {
  recognition: "bg-success/10 text-success border-success/20",
  concern: "bg-warning/10 text-warning border-warning/20",
  coaching: "bg-info/10 text-info border-info/20",
  celebration: "bg-primary/10 text-primary border-primary/20",
  intervention: "bg-destructive/10 text-destructive border-destructive/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-muted text-muted-foreground",
};

export function ManagerCoachingNudges({ companyId, departmentId }: ManagerCoachingNudgesProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: nudges = [], isLoading } = useCoachingNudges(user?.id, companyId);
  const { dismissNudge, actOnNudge, analyzeSentiment } = usePulseSurveyMutations();
  const [selectedNudge, setSelectedNudge] = useState<CoachingNudge | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  const handleGenerateNudges = async () => {
    if (!user?.id) return;
    await analyzeSentiment.mutateAsync({
      action: "generate_nudges",
      companyId,
      departmentId,
      managerId: user.id,
    });
  };

  const handleActOnNudge = async () => {
    if (!selectedNudge) return;
    await actOnNudge.mutateAsync({ id: selectedNudge.id, notes: actionNotes });
    setSelectedNudge(null);
    setActionNotes("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Coaching Nudges
          </h3>
          <p className="text-sm text-muted-foreground">
            Personalized suggestions based on your team's sentiment
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleGenerateNudges}
          disabled={analyzeSentiment.isPending}
        >
          {analyzeSentiment.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Generate New Nudges
        </Button>
      </div>

      {nudges.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No coaching nudges yet</p>
              <p className="text-sm mt-1">
                Click "Generate New Nudges" to get AI-powered suggestions based on team sentiment
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {nudges.map((nudge) => (
            <Card
              key={nudge.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${NUDGE_COLORS[nudge.nudge_type]}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{NUDGE_ICONS[nudge.nudge_type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={PRIORITY_COLORS[nudge.priority]}>
                        {nudge.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {nudge.nudge_type}
                      </Badge>
                    </div>
                    <h4 className="font-medium line-clamp-1">{nudge.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{nudge.message}</p>
                    {nudge.related_themes && nudge.related_themes.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {nudge.related_themes.slice(0, 3).map((theme) => (
                          <Badge key={theme} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNudge(nudge);
                        }}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNudge.mutate(nudge.id);
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!selectedNudge} onOpenChange={() => setSelectedNudge(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNudge && NUDGE_ICONS[selectedNudge.nudge_type]}
              {selectedNudge?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedNudge && (
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">{selectedNudge.message}</p>
              </div>

              {selectedNudge.suggested_actions && selectedNudge.suggested_actions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Suggested Actions:</h4>
                  <ul className="space-y-2">
                    {selectedNudge.suggested_actions.map((action: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-medium">{action.action}</span>
                          {action.context && (
                            <p className="text-muted-foreground text-xs mt-0.5">{action.context}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Record what action you took..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedNudge(null)}>
                  Cancel
                </Button>
                <Button onClick={handleActOnNudge} disabled={actOnNudge.isPending}>
                  {actOnNudge.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Mark as Acted Upon
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
