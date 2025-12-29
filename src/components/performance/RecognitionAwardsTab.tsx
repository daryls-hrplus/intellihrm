import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { 
  RecognitionWall, 
  RecognitionLeaderboard,
  GiveRecognitionDialog,
  RecognitionAnalyticsDashboard
} from "@/components/recognition";

interface RecognitionAwardsTabProps {
  companyId: string;
}

export function RecognitionAwardsTab({ companyId }: RecognitionAwardsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("wall");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recognition & Awards</h3>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Recognize Someone
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="wall">Recognition Wall</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="wall" className="mt-4">
          <RecognitionWall companyId={companyId} />
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <RecognitionLeaderboard companyId={companyId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <RecognitionAnalyticsDashboard companyId={companyId} />
        </TabsContent>
      </Tabs>

      <GiveRecognitionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companyId={companyId}
      />
    </div>
  );
}
