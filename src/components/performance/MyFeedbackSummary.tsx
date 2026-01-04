import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Star, TrendingUp, Users, User, UserCircle, ArrowRight, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ReportDownloadButton, type ExportFormat } from "@/components/feedback/reports/ReportDownloadButton";
import { ReportIntroduction } from "@/components/feedback/reports/ReportIntroduction";
import { ScoreInterpretationGuide } from "@/components/feedback/reports/ScoreInterpretationGuide";
import { LimitationsDisclaimer } from "@/components/feedback/reports/LimitationsDisclaimer";
import { generateFeedback360PDF, downloadPDF, type Feedback360ReportData } from "@/utils/feedback360ReportPdf";
import { toast } from "sonner";

interface Participation {
  id: string;
  status: string;
  overall_score: number | null;
  review_cycle: {
    name: string;
    status: string;
  };
}

interface FeedbackItem {
  question_id: string;
  question_text: string;
  competency_name: string | null;
  reviewer_type: string;
  avg_rating: number | null;
  response_count: number;
  text_responses: string[] | null;
  is_suppressed: boolean;
  suppression_reason: string | null;
}

interface MyFeedbackSummaryProps {
  participations: Participation[];
  cycleId?: string;
  companyId?: string;
}

const reviewerTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  self: { label: "Self", icon: <User className="h-4 w-4" /> },
  manager: { label: "Manager", icon: <UserCircle className="h-4 w-4" /> },
  peer: { label: "Peers", icon: <Users className="h-4 w-4" /> },
  direct_report: { label: "Direct Reports", icon: <TrendingUp className="h-4 w-4" /> },
};

export function MyFeedbackSummary({ participations, cycleId, companyId }: MyFeedbackSummaryProps) {
  const { user, company } = useAuth();
  const [selectedParticipation, setSelectedParticipation] = useState<string>("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);

  const completedParticipations = participations.filter((p) => p.status === "completed");
  
  const selectedParticipationData = completedParticipations.find(p => p.id === selectedParticipation);

  useEffect(() => {
    if (completedParticipations.length > 0 && !selectedParticipation) {
      setSelectedParticipation(completedParticipations[0].id);
    }
  }, [completedParticipations]);

  useEffect(() => {
    if (selectedParticipation) {
      fetchFeedback();
    }
  }, [selectedParticipation]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_360_feedback_summary", {
        p_participant_id: selectedParticipation,
      });

      if (error) throw error;
      setFeedback((data as FeedbackItem[]) || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group feedback by competency
  const groupedByCompetency = feedback.reduce((acc, item) => {
    const key = item.competency_name || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, FeedbackItem[]>);

  // Calculate averages by reviewer type (excluding suppressed data)
  const averagesByType = feedback.reduce((acc, item) => {
    if (item.avg_rating && !item.is_suppressed) {
      if (!acc[item.reviewer_type]) {
        acc[item.reviewer_type] = { total: 0, count: 0, responseCount: 0 };
      }
      acc[item.reviewer_type].total += item.avg_rating;
      acc[item.reviewer_type].count += 1;
      acc[item.reviewer_type].responseCount += item.response_count;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number; responseCount: number }>);

  // Check for suppressed categories
  const suppressedCategories = feedback.filter(f => f.is_suppressed);

  const overallAverages = Object.entries(averagesByType).map(([type, data]) => ({
    type,
    average: data.total / data.count,
    responseCount: data.responseCount,
  }));

  // Calculate overall score
  const overallScore = overallAverages.length > 0 
    ? overallAverages.reduce((sum, item) => sum + item.average, 0) / overallAverages.length 
    : 0;

  // Calculate category scores for PDF
  const categoryScores = Object.entries(groupedByCompetency).map(([name, items]) => {
    const scores = items.filter(i => i.avg_rating).map(i => i.avg_rating!);
    return {
      name,
      score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    };
  });

  // Collect all comments
  const allComments: { category: string; text: string }[] = [];
  feedback.forEach(item => {
    if (item.text_responses) {
      item.text_responses.forEach(text => {
        allComments.push({
          category: item.competency_name || 'General',
          text,
        });
      });
    }
  });

  // AI-derived strengths and development areas (simplified for now)
  const strengths = categoryScores
    .filter(c => c.score >= 3.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(c => `Strong performance in ${c.name}`);

  const developmentAreas = categoryScores
    .filter(c => c.score < 3.5)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(c => `Opportunity to develop ${c.name}`);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportFormat(format);
    
    try {
      if (format === 'print') {
        window.print();
        toast.success('Print dialog opened');
      } else if (format === 'pdf') {
        const reportData: Feedback360ReportData = {
          employeeName: user?.user_metadata?.full_name || 'Employee',
          employeeTitle: user?.user_metadata?.title,
          cycleName: selectedParticipationData?.review_cycle.name || 'Review Cycle',
          cycleEndDate: new Date().toISOString(),
          overallScore,
          responseRate: 100,
          totalRaters: overallAverages.reduce((sum, a) => sum + a.responseCount, 0),
          categoryScores,
          raterGroupScores: overallAverages.map(a => ({
            group: reviewerTypeLabels[a.type]?.label || a.type,
            score: a.average,
            count: a.responseCount,
          })),
          strengths,
          developmentAreas,
          comments: allComments.slice(0, 15),
          companyName: company?.name,
        };
        
        const blob = await generateFeedback360PDF(reportData);
        downloadPDF(blob, `360_Feedback_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF report downloaded');
      } else if (format === 'docx') {
        toast.info('Word document export coming soon');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  if (completedParticipations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No Completed Reviews</h3>
          <p className="text-sm">
            Your feedback summary will appear here once a review cycle is completed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Introduction */}
      <ReportIntroduction />
      
      {/* Cycle Selector & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Review Cycle:</label>
          <Select value={selectedParticipation} onValueChange={setSelectedParticipation}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a review cycle" />
            </SelectTrigger>
            <SelectContent>
              {completedParticipations.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.review_cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <ReportDownloadButton 
            onExport={handleExport}
            isExporting={isExporting}
            currentFormat={exportFormat}
            supportedFormats={['pdf', 'print']}
          />
          <Link to="/ess/my-development-themes">
            <Button variant="ghost" size="sm">
              View My Themes
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : feedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No feedback data available for this review cycle.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Score Interpretation Guide */}
          <ScoreInterpretationGuide />

          {/* Anonymity Protection Notice */}
          {suppressedCategories.length > 0 && (
            <Card className="bg-muted/30 border-muted">
              <CardContent className="py-3 px-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <strong>Category-Specific Anonymity:</strong> Some categories have fewer responses than 
                  their configured threshold. Manager feedback is typically shown (identity known), 
                  while peer and direct report categories require minimum responses to protect anonymity.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Scores by Source */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(reviewerTypeLabels).map(([type, config]) => {
              const typeData = overallAverages.find(a => a.type === type);
              const hasSuppressed = feedback.some(f => f.reviewer_type === type && f.is_suppressed);
              
              return (
                <Card key={type}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          {config.icon}
                          {config.label}
                        </p>
                        {typeData ? (
                          <p className="text-2xl font-bold">{typeData.average.toFixed(1)}</p>
                        ) : hasSuppressed ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Shield className="h-4 w-4" />
                                  <span className="text-sm">Protected</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Insufficient responses for anonymity threshold</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <p className="text-sm text-muted-foreground">No data</p>
                        )}
                      </div>
                      {typeData && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.round(typeData.average) }, (_, i) => (
                            <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed Feedback by Competency */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(groupedByCompetency)[0]} className="w-full">
                <TabsList className="flex-wrap">
                  {Object.keys(groupedByCompetency).map((competency) => (
                    <TabsTrigger key={competency} value={competency}>
                      {competency}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(groupedByCompetency).map(([competency, items]) => (
                  <TabsContent key={competency} value={competency} className="mt-4 space-y-4">
                    {/* Group items by question */}
                    {Object.values(
                      items.reduce((acc, item) => {
                        if (!acc[item.question_id]) {
                          acc[item.question_id] = {
                            question_text: item.question_text,
                            ratings: {},
                            comments: [],
                          };
                        }
                        if (item.avg_rating) {
                          acc[item.question_id].ratings[item.reviewer_type] = item.avg_rating;
                        }
                        if (item.text_responses) {
                          acc[item.question_id].comments.push(...item.text_responses);
                        }
                        return acc;
                      }, {} as Record<string, { question_text: string; ratings: Record<string, number>; comments: string[] }>)
                    ).map((question, idx) => (
                      <div key={idx} className="rounded-lg border p-4 space-y-3">
                        <h4 className="font-medium">{question.question_text}</h4>

                        {/* Ratings by source */}
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {Object.entries(question.ratings).map(([type, rating]) => (
                            <div key={type} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                {reviewerTypeLabels[type]?.icon}
                                {reviewerTypeLabels[type]?.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress value={(rating / 5) * 100} className="w-16 h-2" />
                                <span className="text-sm font-medium w-8">{rating.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Anonymous comments */}
                        {question.comments.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Anonymous Comments:</p>
                            <div className="space-y-2">
                              {question.comments.map((comment, i) => (
                                <div key={i} className="text-sm p-2 bg-muted/30 rounded italic">
                                  "{comment}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Limitations Disclaimer */}
          <LimitationsDisclaimer />
        </>
      )}
    </div>
  );
}