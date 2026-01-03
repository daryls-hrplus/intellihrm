import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Lock, Unlock, AlertCircle, CheckCircle } from "lucide-react";
import { ResultsReleasePanel } from "./ResultsReleasePanel";
import { ResultsPreviewDialog } from "./ResultsPreviewDialog";
import { VisibilityRules, DEFAULT_VISIBILITY_RULES, AccessLevelConfig } from "./CycleVisibilityRulesEditor";

interface CycleResultsTabProps {
  cycleId: string;
  cycleName: string;
  cycleStatus: string;
  resultsReleasedAt?: string | null;
  resultsReleasedBy?: string | null;
  releaseSettings?: {
    auto_release_on_close: boolean;
    release_delay_days: number;
    require_hr_approval: boolean;
    notify_on_release: boolean;
  };
  visibilityRules?: VisibilityRules;
  companyId?: string;
  participantsCount?: number;
  onUpdate: () => void;
}

export function CycleResultsTab({
  cycleId,
  cycleName,
  cycleStatus,
  resultsReleasedAt,
  resultsReleasedBy,
  releaseSettings,
  visibilityRules,
  companyId,
  participantsCount = 0,
  onUpdate,
}: CycleResultsTabProps) {
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const isReleased = !!resultsReleasedAt;
  const canPreview = participantsCount > 0;

  const rules = visibilityRules || DEFAULT_VISIBILITY_RULES;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isReleased ? (
              <Unlock className="h-4 w-4 text-success" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            Results Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {isReleased ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/10 text-success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Released
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Results are visible to employees based on visibility rules
                  </span>
                </div>
              ) : cycleStatus === "completed" ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-warning/10 text-warning">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pending Release
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Cycle completed. Ready to release results.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    Not Available
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Results will be available after cycle completion
                  </span>
                </div>
              )}
            </div>
            {canPreview && (
              <Button
                variant="outline"
                onClick={() => setPreviewDialogOpen(true)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visibility Rules Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Visibility Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { key: "employee_access", label: "Employee Access", icon: "👤" },
              { key: "manager_access", label: "Manager Access", icon: "👔" },
              { key: "hr_access", label: "HR Access", icon: "🛡️" },
            ].map(({ key, label, icon }) => {
              const accessConfig = rules[key as keyof VisibilityRules] as AccessLevelConfig;
              return (
                <div key={key} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {accessConfig?.enabled ? (
                        <>
                          <Badge variant="outline" className="text-xs bg-success/10 text-success">
                            Enabled
                          </Badge>
                          {accessConfig?.show_scores && (
                            <Badge variant="outline" className="text-xs">
                              Scores
                            </Badge>
                          )}
                          {accessConfig?.show_comments && (
                            <Badge variant="outline" className="text-xs">
                              Comments
                            </Badge>
                          )}
                        </>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Release Panel */}
      {(cycleStatus === "completed" || isReleased) && (
        <ResultsReleasePanel
          cycleId={cycleId}
          cycleName={cycleName}
          cycleStatus={cycleStatus}
          resultsReleasedAt={resultsReleasedAt || null}
          resultsReleasedBy={resultsReleasedBy || null}
          releaseSettings={releaseSettings || {
            auto_release_on_close: false,
            release_delay_days: 0,
            require_hr_approval: true,
            notify_on_release: true,
          }}
          visibilityRules={rules}
          companyId={companyId}
          onReleased={onUpdate}
        />
      )}

      {/* Preview Dialog */}
      <ResultsPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        cycleId={cycleId}
        cycleName={cycleName}
        visibilityRules={rules}
        companyId={companyId}
      />
    </div>
  );
}
