import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useTeamResumptionOfDuty, ResumptionOfDuty } from "@/hooks/useResumptionOfDuty";
import { ResumptionOfDutyCard } from "@/components/leave/ResumptionOfDutyCard";
import { ManagerRODVerification } from "@/components/leave/ManagerRODVerification";
import { RODOverdueAlerts } from "@/components/leave/RODOverdueAlerts";

export function ManagerRODWidget() {
  const { pendingVerification, overdueRods, teamRodsLoading } = useTeamResumptionOfDuty();
  const [selectedRod, setSelectedRod] = useState<ResumptionOfDuty | null>(null);

  const totalAlerts = pendingVerification.length + overdueRods.length;

  if (teamRodsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (totalAlerts === 0) return null;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Resumption of Duty
            {totalAlerts > 0 && (
              <Badge variant={overdueRods.length > 0 ? "destructive" : "secondary"}>
                {totalAlerts} action{totalAlerts > 1 ? 's' : ''} needed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue={pendingVerification.length > 0 ? "pending" : "overdue"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Pending ({pendingVerification.length})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Overdue ({overdueRods.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4 space-y-3">
              {pendingVerification.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending verifications
                </p>
              ) : (
                pendingVerification.map((rod) => (
                  <ResumptionOfDutyCard
                    key={rod.id}
                    rod={rod}
                    showEmployee
                    onAction={() => setSelectedRod(rod)}
                    actionLabel="Review & Verify"
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="overdue" className="mt-4">
              {overdueRods.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No overdue resumptions
                </p>
              ) : (
                <RODOverdueAlerts overdueRods={overdueRods} title="" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={!!selectedRod} onOpenChange={(open) => !open && setSelectedRod(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRod && (
            <ManagerRODVerification
              rod={selectedRod}
              onClose={() => setSelectedRod(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
