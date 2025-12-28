import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileCheck, Loader2 } from "lucide-react";
import { useResumptionOfDuty, ResumptionOfDuty } from "@/hooks/useResumptionOfDuty";
import { ResumptionOfDutyCard } from "@/components/leave/ResumptionOfDutyCard";
import { ResumptionOfDutyForm } from "@/components/leave/ResumptionOfDutyForm";

export function EmployeeRODWidget() {
  const { pendingForEmployee, myRodsLoading } = useResumptionOfDuty();
  const [selectedRod, setSelectedRod] = useState<ResumptionOfDuty | null>(null);

  if (myRodsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (pendingForEmployee.length === 0) return null;

  return (
    <>
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <FileCheck className="h-5 w-5" />
            Resumption of Duty Required
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {pendingForEmployee.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
            Your leave has ended. Please complete the resumption form to confirm your return to work.
          </p>
          {pendingForEmployee.map((rod) => (
            <ResumptionOfDutyCard
              key={rod.id}
              rod={rod}
              onAction={() => setSelectedRod(rod)}
              actionLabel="Complete Resumption Form"
            />
          ))}
        </CardContent>
      </Card>

      {/* ROD Form Dialog */}
      <Dialog open={!!selectedRod} onOpenChange={(open) => !open && setSelectedRod(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRod && (
            <ResumptionOfDutyForm
              rod={selectedRod}
              onSuccess={() => setSelectedRod(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
