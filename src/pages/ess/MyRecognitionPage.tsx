import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { useRecognition } from "@/hooks/useRecognition";
import { 
  RecognitionWall, 
  RecognitionLeaderboard, 
  BadgeGrid,
  GiveRecognitionDialog,
  RecognitionNotifications
} from "@/components/recognition";
import { Plus, Gift, Trophy, Send, Award, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function MyRecognitionPage() {
  const { t } = useLanguage();
  const { user, company } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("wall");
  
  const { 
    myRecognitions, 
    myBadges,
    loadingMyRecognitions 
  } = useRecognition(company?.id);

  const totalPoints = myRecognitions.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

  if (loadingMyRecognitions) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('navigation.ess', 'Employee Self Service'), href: "/ess" },
            { label: t('ess.myRecognition.breadcrumb', 'Recognition') },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('ess.myRecognition.title', 'My Recognition')}</h1>
            <p className="text-muted-foreground">
              {t('ess.myRecognition.subtitle', 'Give and receive recognition from your colleagues')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RecognitionNotifications />
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('ess.myRecognition.recognizeSomeone', 'Recognize Someone')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{myRecognitions.length}</p>
              <p className="text-xs text-muted-foreground">recognitions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Points Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalPoints}</p>
              <p className="text-xs text-muted-foreground">total points</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{myBadges.length}</p>
              <p className="text-xs text-muted-foreground">earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-500" />
                Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">leaderboard</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="wall">Recognition Wall</TabsTrigger>
            <TabsTrigger value="my-recognitions">My Recognitions ({myRecognitions.length})</TabsTrigger>
            <TabsTrigger value="badges">My Badges ({myBadges.length})</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="wall" className="mt-4">
            {company?.id && <RecognitionWall companyId={company.id} />}
          </TabsContent>

          <TabsContent value="my-recognitions" className="mt-4">
            {myRecognitions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold">No recognitions received yet</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Keep up the great work and recognitions will come!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myRecognitions.map((recognition) => (
                  <Card key={recognition.id} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-background p-2">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{recognition.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {recognition.nominator?.full_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground">{recognition.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="outline" className="capitalize">
                          {recognition.award_type.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(recognition.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {recognition.points_awarded > 0 && (
                        <Badge className="mt-2 bg-amber-500/10 text-amber-600">
                          +{recognition.points_awarded} points
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <BadgeGrid />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            {company?.id && <RecognitionLeaderboard companyId={company.id} />}
          </TabsContent>
        </Tabs>

        {company?.id && (
          <GiveRecognitionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            companyId={company.id}
          />
        )}
      </div>
    </AppLayout>
  );
}
