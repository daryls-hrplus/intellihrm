import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2, Activity, BarChart3, Lightbulb, Play, Square, Target } from "lucide-react";
import { usePulseSurveys, usePulseSurveyMutations } from "@/hooks/usePulseSurveys";
import { CreatePulseSurveyDialog } from "./CreatePulseSurveyDialog";
import { SentimentDashboard } from "./SentimentDashboard";
import { ManagerCoachingNudges } from "./ManagerCoachingNudges";
import { ENPSDashboard } from "./ENPSDashboard";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface PulseSurveysTabProps {
  companyId: string;
}

export function PulseSurveysTab({ companyId }: PulseSurveysTabProps) {
  const { t } = useTranslation();
  const { data: surveys = [], isLoading } = usePulseSurveys(companyId);
  const { updateSurvey } = usePulseSurveyMutations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSurveys = surveys.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground";
      case "active": return "bg-success/10 text-success border-success/20";
      case "closed": return "bg-warning/10 text-warning border-warning/20";
      default: return "";
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateSurvey.mutateAsync({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="surveys" className="space-y-6">
      <TabsList>
        <TabsTrigger value="surveys" className="gap-2">
          <Activity className="h-4 w-4" />
          Pulse Surveys
        </TabsTrigger>
        <TabsTrigger value="dashboard" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Sentiment Dashboard
        </TabsTrigger>
        <TabsTrigger value="enps" className="gap-2">
          <Target className="h-4 w-4" />
          eNPS Analytics
        </TabsTrigger>
        <TabsTrigger value="nudges" className="gap-2">
          <Lightbulb className="h-4 w-4" />
          Coaching Nudges
        </TabsTrigger>
      </TabsList>

      <TabsContent value="surveys">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pulse Surveys</CardTitle>
                <CardDescription>Quick surveys to measure employee sentiment</CardDescription>
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Pulse Survey
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredSurveys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pulse surveys yet</p>
                <p className="text-sm">Create your first pulse survey to start collecting feedback</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSurveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{survey.title}</p>
                          {survey.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{survey.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {survey.frequency.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDateForDisplay(survey.start_date, "PP")}</p>
                          <p className="text-muted-foreground">to {formatDateForDisplay(survey.end_date, "PP")}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{survey.response_count}</span>
                          <span className="text-muted-foreground ml-1">({survey.completion_rate}%)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(survey.status)}>
                          {survey.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {survey.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(survey.id, "active")}
                            >
                              <Play className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          {survey.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(survey.id, "closed")}
                            >
                              <Square className="h-4 w-4 text-warning" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="dashboard">
        <SentimentDashboard companyId={companyId} />
      </TabsContent>

      <TabsContent value="enps">
        <ENPSDashboard companyId={companyId} />
      </TabsContent>

      <TabsContent value="nudges">
        <ManagerCoachingNudges companyId={companyId} />
      </TabsContent>

      <CreatePulseSurveyDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        companyId={companyId}
      />
    </Tabs>
  );
}
