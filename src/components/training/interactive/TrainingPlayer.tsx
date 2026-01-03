import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Lock,
  Play,
  FileText,
  AlertTriangle,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainingVideoPlayer } from "./TrainingVideoPlayer";
import { QuizRenderer, type QuizResults } from "./QuizRenderer";
import {
  useTrainingProgram,
  useTrainingContent,
  useEnrollmentProgress,
  useUpdateVideoProgress,
  useStartQuizAttempt,
  useSubmitQuizAnswer,
  useCompleteQuizAttempt,
  useTrackTrainingEvent,
  useStartEnrollment,
  useCompleteEnrollment,
  type TrainingModule,
  type TrainingContent,
  type ContentProgress,
} from "@/hooks/useInteractiveTraining";

interface TrainingPlayerProps {
  enrollmentId: string;
  programId: string;
  onComplete?: () => void;
}

export function TrainingPlayer({
  enrollmentId,
  programId,
  onComplete,
}: TrainingPlayerProps) {
  const navigate = useNavigate();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  
  const { data: program, isLoading: programLoading } = useTrainingProgram(programId);
  const { data: progress, refetch: refetchProgress } = useEnrollmentProgress(enrollmentId);
  
  const modules = (program?.modules as TrainingModule[])?.sort((a, b) => a.sequence_order - b.sequence_order) || [];
  const currentModule = modules[currentModuleIndex];
  const moduleContent = (currentModule?.content as TrainingContent[])?.sort((a, b) => a.sequence_order - b.sequence_order) || [];
  const currentContent = moduleContent[currentContentIndex];
  
  const { data: contentWithQuiz, isLoading: contentLoading } = useTrainingContent(currentContent?.id);
  
  const updateProgress = useUpdateVideoProgress();
  const startQuizAttempt = useStartQuizAttempt();
  const submitAnswer = useSubmitQuizAnswer();
  const completeQuiz = useCompleteQuizAttempt();
  const trackEvent = useTrackTrainingEvent();
  const startEnrollment = useStartEnrollment();
  const completeEnrollment = useCompleteEnrollment();
  
  const getContentProgress = useCallback((contentId: string): ContentProgress | undefined => {
    return progress?.content?.find((p: ContentProgress) => p.content_id === contentId);
  }, [progress]);
  
  const isContentComplete = useCallback((contentId: string): boolean => {
    const contentProgress = getContentProgress(contentId);
    return contentProgress?.status === "completed";
  }, [getContentProgress]);
  
  const isContentLocked = useCallback((moduleIdx: number, contentIdx: number): boolean => {
    // First module, first content is never locked
    if (moduleIdx === 0 && contentIdx === 0) return false;
    
    // Check previous content in same module
    if (contentIdx > 0) {
      const prevContent = moduleContent[contentIdx - 1];
      return !isContentComplete(prevContent.id);
    }
    
    // Check last content of previous module
    if (moduleIdx > 0) {
      const prevModule = modules[moduleIdx - 1];
      const prevModuleContent = (prevModule?.content as TrainingContent[])?.sort((a, b) => a.sequence_order - b.sequence_order) || [];
      if (prevModuleContent.length > 0) {
        const lastContent = prevModuleContent[prevModuleContent.length - 1];
        return !isContentComplete(lastContent.id);
      }
    }
    
    return false;
  }, [modules, moduleContent, isContentComplete]);
  
  // Start enrollment if not started
  useEffect(() => {
    startEnrollment.mutate(enrollmentId);
  }, [enrollmentId]);
  
  const handleVideoProgress = useCallback(async (percentage: number, currentTime: number, duration: number) => {
    if (!currentContent) return;
    
    await updateProgress.mutateAsync({
      enrollmentId,
      contentId: currentContent.id,
      watchPercentage: Math.round(percentage),
      watchTimeSeconds: Math.round(currentTime),
      lastPositionSeconds: Math.round(currentTime),
    });
  }, [enrollmentId, currentContent, updateProgress]);
  
  const handleVideoComplete = useCallback(() => {
    trackEvent.mutate({
      programId,
      contentId: currentContent?.id,
      eventType: "video_complete",
    });
    
    // If content has quiz, prompt to take it
    if (currentContent?.has_quiz) {
      toast.info("Video complete! You can now take the quiz.");
    }
  }, [currentContent, enrollmentId, programId, trackEvent]);
  
  const handleStartQuiz = async () => {
    if (!currentContent) return;
    
    try {
      const attempt = await startQuizAttempt.mutateAsync({
        enrollmentId,
        contentId: currentContent.id,
      });
      setCurrentAttemptId(attempt.id);
      setShowQuiz(true);
      
      trackEvent.mutate({
        programId,
        contentId: currentContent.id,
        eventType: "quiz_start",
      });
    } catch (error) {
      toast.error("Failed to start quiz");
    }
  };
  
  const handleQuizSubmitAnswer = async (questionId: string, answer: {
    selectedOptions?: string[];
    textAnswer?: string;
    isCorrect: boolean;
    pointsEarned: number;
    timeTakenSeconds?: number;
  }) => {
    if (!currentAttemptId) return;
    
    await submitAnswer.mutateAsync({
      attemptId: currentAttemptId,
      questionId,
      ...answer,
    });
  };
  
  const handleQuizComplete = async (results: QuizResults) => {
    if (!currentAttemptId || !currentContent) return;
    
    try {
      await completeQuiz.mutateAsync({
        attemptId: currentAttemptId,
        enrollmentId,
        contentId: currentContent.id,
        score: results.score,
        totalPoints: results.totalPoints,
        earnedPoints: results.earnedPoints,
        timeTakenSeconds: results.timeTakenSeconds,
        passed: results.passed,
        weakTopics: results.weakTopics,
      });
      
      trackEvent.mutate({
        programId,
        contentId: currentContent.id,
        eventType: "quiz_complete",
        eventData: {
          score: results.score,
          passed: results.passed,
          weakTopics: results.weakTopics,
        },
      });
      
      await refetchProgress();
      
      if (results.passed) {
        toast.success("Quiz passed! Moving to next content.");
        setTimeout(() => {
          handleNext();
        }, 2000);
      } else if (results.weakTopics.length > 0) {
        toast.warning("Remediation content will be assigned for weak topics.");
      }
    } catch (error) {
      toast.error("Failed to save quiz results");
    }
  };
  
  const handleNext = () => {
    setShowQuiz(false);
    setCurrentAttemptId(null);
    
    if (currentContentIndex < moduleContent.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentContentIndex(0);
    } else {
      // Program complete
      handleProgramComplete();
    }
  };
  
  const handlePrevious = () => {
    setShowQuiz(false);
    setCurrentAttemptId(null);
    
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      const prevContent = (prevModule?.content as TrainingContent[]) || [];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentContentIndex(Math.max(0, prevContent.length - 1));
    }
  };
  
  const handleProgramComplete = async () => {
    // Calculate final score from all quiz attempts
    const completedContent = progress?.content?.filter((p: ContentProgress) => p.status === "completed") || [];
    const avgScore = completedContent.reduce((sum: number, c: ContentProgress) => sum + (c.quiz_score || 0), 0) / 
      Math.max(1, completedContent.length);
    
    await completeEnrollment.mutateAsync({
      enrollmentId,
      finalScore: Math.round(avgScore),
    });
    
    trackEvent.mutate({
      programId,
      eventType: "program_complete",
      eventData: { finalScore: avgScore },
    });
    
    toast.success("Congratulations! You've completed the training program.");
    onComplete?.();
  };
  
  const handleContentClick = (moduleIdx: number, contentIdx: number) => {
    if (isContentLocked(moduleIdx, contentIdx)) {
      toast.warning("Complete previous content first");
      return;
    }
    setCurrentModuleIndex(moduleIdx);
    setCurrentContentIndex(contentIdx);
    setShowQuiz(false);
    setCurrentAttemptId(null);
  };
  
  // Calculate overall progress
  const totalContent = modules.reduce((sum, m) => sum + ((m.content as TrainingContent[])?.length || 0), 0);
  const completedContent = progress?.content?.filter((p: ContentProgress) => p.status === "completed").length || 0;
  const overallProgress = totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
  
  const currentContentProgress = currentContent ? getContentProgress(currentContent.id) : undefined;
  const canTakeQuiz = currentContent?.has_quiz && 
    (currentContentProgress?.watch_percentage || 0) >= (currentContent?.min_watch_percentage || 90);
  
  if (programLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (!program) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Program Not Found</h2>
        <p className="text-muted-foreground mt-2">This training program could not be loaded.</p>
        <Button className="mt-4" onClick={() => navigate("/training")}>
          Back to Training
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Sidebar - Module/Content Navigation */}
      <Card className="lg:col-span-1 h-fit lg:sticky lg:top-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{program.title}</CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {modules.map((module, moduleIdx) => (
              <div key={module.id}>
                <div className="px-4 py-2 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Module {moduleIdx + 1}: {module.title}
                    </span>
                    {module.is_gateway && (
                      <Badge variant="outline" className="text-xs">Gateway</Badge>
                    )}
                  </div>
                </div>
                <div className="px-2 py-1">
                  {((module.content as TrainingContent[]) || [])
                    .sort((a, b) => a.sequence_order - b.sequence_order)
                    .map((content, contentIdx) => {
                      const isLocked = isContentLocked(moduleIdx, contentIdx);
                      const isComplete = isContentComplete(content.id);
                      const isCurrent = moduleIdx === currentModuleIndex && contentIdx === currentContentIndex;
                      
                      return (
                        <button
                          key={content.id}
                          onClick={() => handleContentClick(moduleIdx, contentIdx)}
                          disabled={isLocked}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors",
                            isCurrent && "bg-primary/10 text-primary",
                            !isCurrent && !isLocked && "hover:bg-muted",
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : isComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="flex-1 truncate">{content.title}</span>
                          {content.content_type === "video" && (
                            <Play className="h-3 w-3 text-muted-foreground" />
                          )}
                          {content.content_type === "document" && (
                            <FileText className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      );
                    })}
                </div>
                {moduleIdx < modules.length - 1 && <Separator />}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-4">
        {currentContent && (
          <>
            {/* Video or Quiz View */}
            {showQuiz && contentWithQuiz?.questions ? (
              <QuizRenderer
                questions={contentWithQuiz.questions}
                onSubmitAnswer={handleQuizSubmitAnswer}
                onComplete={handleQuizComplete}
                passingScore={program.passing_score}
                maxAttempts={program.max_attempts}
                currentAttempt={currentContentProgress?.quiz_attempts || 1}
              />
            ) : currentContent.content_type === "video" && currentContent.video_url ? (
              <div className="space-y-4">
                <TrainingVideoPlayer
                  videoUrl={currentContent.video_url}
                  title={currentContent.title}
                  onProgress={handleVideoProgress}
                  onComplete={handleVideoComplete}
                  minWatchPercentage={currentContent.min_watch_percentage}
                  initialPosition={currentContentProgress?.last_position_seconds || 0}
                  className="aspect-video"
                />
                
                {/* Content info */}
                <Card>
                  <CardContent className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{currentContent.title}</h2>
                    {currentContent.description && (
                      <p className="text-muted-foreground">{currentContent.description}</p>
                    )}
                    
                    {currentContent.has_quiz && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Quiz Available</h3>
                            <p className="text-sm text-muted-foreground">
                              {canTakeQuiz 
                                ? "You've watched enough to take the quiz!"
                                : `Watch at least ${currentContent.min_watch_percentage}% to unlock the quiz`}
                            </p>
                          </div>
                          <Button
                            disabled={!canTakeQuiz}
                            onClick={handleStartQuiz}
                          >
                            <Award className="h-4 w-4 mr-2" />
                            Take Quiz
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold">{currentContent.title}</h2>
                  <p className="text-muted-foreground mt-2">{currentContent.description}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Navigation */}
            {!showQuiz && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentModuleIndex === 0 && currentContentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!isContentComplete(currentContent.id)}
                >
                  {currentModuleIndex === modules.length - 1 && 
                   currentContentIndex === moduleContent.length - 1 ? (
                    <>
                      Complete Program
                      <Award className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
