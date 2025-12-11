import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  passing_score: number;
  max_attempts: number | null;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string | string[];
  points: number;
  explanation: string | null;
  display_order: number;
}

interface Attempt {
  id: string;
  attempt_number: number;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  passed: boolean | null;
  submitted_at: string | null;
}

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get("enrollment");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [previousAttempts, setPreviousAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    if (quizId && user) {
      fetchQuizData();
    }
  }, [quizId, user]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && isStarted && !result) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, isStarted, result]);

  const fetchQuizData = async () => {
    setIsLoading(true);
    try {
      const [quizRes, questionsRes, attemptsRes] = await Promise.all([
        supabase.from("lms_quizzes").select("*").eq("id", quizId).single(),
        supabase
          .from("lms_quiz_questions")
          .select("*")
          .eq("quiz_id", quizId)
          .order("display_order"),
        supabase
          .from("lms_quiz_attempts")
          .select("*")
          .eq("quiz_id", quizId)
          .eq("user_id", user!.id)
          .order("attempt_number", { ascending: false }),
      ]);

      if (quizRes.data) setQuiz(quizRes.data);
      if (questionsRes.data) {
        let qs = questionsRes.data as Question[];
        if (quizRes.data?.shuffle_questions) {
          qs = qs.sort(() => Math.random() - 0.5);
        }
        setQuestions(qs);
      }
      if (attemptsRes.data) setPreviousAttempts(attemptsRes.data);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = () => {
    setIsStarted(true);
    setStartTime(new Date());
    if (quiz?.time_limit_minutes) {
      setTimeRemaining(quiz.time_limit_minutes * 60);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelectChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter((o) => o !== option) };
      }
    });
  };

  const handleSubmit = async () => {
    if (!quiz || !enrollmentId) return;

    setIsSubmitting(true);
    try {
      let score = 0;
      let maxScore = 0;

      questions.forEach((q) => {
        maxScore += q.points;
        const userAnswer = answers[q.id];
        const correctAnswer = q.correct_answer;

        if (q.question_type === "multi_select") {
          const userArr = Array.isArray(userAnswer) ? userAnswer.sort() : [];
          const correctArr = Array.isArray(correctAnswer) ? correctAnswer.sort() : [];
          if (JSON.stringify(userArr) === JSON.stringify(correctArr)) {
            score += q.points;
          }
        } else {
          if (userAnswer === correctAnswer) {
            score += q.points;
          }
        }
      });

      const percentage = Math.round((score / maxScore) * 100);
      const passed = percentage >= quiz.passing_score;

      const attemptNumber = previousAttempts.length + 1;
      const timeSpent = startTime
        ? Math.round((new Date().getTime() - startTime.getTime()) / 1000)
        : 0;

      await supabase.from("lms_quiz_attempts").insert({
        quiz_id: quiz.id,
        user_id: user!.id,
        enrollment_id: enrollmentId,
        submitted_at: new Date().toISOString(),
        answers,
        score,
        max_score: maxScore,
        percentage,
        passed,
        time_spent_seconds: timeSpent,
        attempt_number: attemptNumber,
      });

      setResult({ score, maxScore, percentage, passed });

      if (passed) {
        toast({ title: "Congratulations! You passed the quiz!" });
      } else {
        toast({
          title: "Quiz completed",
          description: `Score: ${percentage}%. Passing score is ${quiz.passing_score}%`,
        });
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({ title: "Failed to submit quiz", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canRetake = quiz?.max_attempts
    ? previousAttempts.length < quiz.max_attempts
    : true;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!quiz) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Quiz not found</h2>
        </div>
      </AppLayout>
    );
  }

  // Result Screen
  if (result) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Breadcrumbs
            items={[
              { label: "Training", href: "/training" },
              { label: "Quiz Results" },
            ]}
          />

          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
            {result.passed ? (
              <Trophy className="mx-auto h-16 w-16 text-success" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}

            <h2 className="mt-4 text-2xl font-bold">
              {result.passed ? "Congratulations!" : "Quiz Completed"}
            </h2>

            <p className="mt-2 text-muted-foreground">
              {result.passed
                ? "You passed the quiz!"
                : `You need ${quiz.passing_score}% to pass`}
            </p>

            <div className="mt-6 flex justify-center gap-8">
              <div>
                <p className="text-4xl font-bold text-foreground">{result.percentage}%</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-foreground">
                  {result.score}/{result.maxScore}
                </p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              {!result.passed && canRetake && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setIsStarted(false);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    fetchQuizData();
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry Quiz
                </Button>
              )}
              <Button onClick={() => navigate(`/training/course/${quiz.course_id}`)}>
                Back to Course
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Start Screen
  if (!isStarted) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Breadcrumbs
            items={[
              { label: "Training", href: "/training" },
              { label: quiz.title },
            ]}
          />

          <div className="rounded-xl border border-border bg-card p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-muted-foreground">{quiz.description}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-xl font-bold">{questions.length}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Passing Score</p>
                <p className="text-xl font-bold">{quiz.passing_score}%</p>
              </div>
              {quiz.time_limit_minutes && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Time Limit</p>
                  <p className="text-xl font-bold">{quiz.time_limit_minutes} min</p>
                </div>
              )}
              {quiz.max_attempts && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Attempts</p>
                  <p className="text-xl font-bold">
                    {previousAttempts.length}/{quiz.max_attempts}
                  </p>
                </div>
              )}
            </div>

            {previousAttempts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Previous Attempts</h3>
                <div className="space-y-2">
                  {previousAttempts.slice(0, 3).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <span>Attempt {attempt.attempt_number}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={attempt.passed ? "bg-success" : "bg-destructive"}
                        >
                          {attempt.percentage}%
                        </Badge>
                        {attempt.passed ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canRetake ? (
              <Button onClick={startQuiz} className="w-full" size="lg">
                Start Quiz
              </Button>
            ) : (
              <div className="text-center text-muted-foreground">
                Maximum attempts reached
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Quiz Screen
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{quiz.title}</h1>
          {timeRemaining !== null && (
            <Badge
              variant="outline"
              className={cn(
                "text-lg px-4 py-2",
                timeRemaining < 60 && "bg-destructive/10 text-destructive border-destructive"
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-6">
            <Badge variant="outline" className="mb-2">
              {currentQuestion.points} point{currentQuestion.points > 1 ? "s" : ""}
            </Badge>
            <h2 className="text-lg font-semibold">{currentQuestion.question_text}</h2>
          </div>

          {currentQuestion.question_type === "multi_select" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select all that apply</p>
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Checkbox
                    id={`option-${idx}`}
                    checked={(answers[currentQuestion.id] as string[] || []).includes(option)}
                    onCheckedChange={(checked) =>
                      handleMultiSelectChange(currentQuestion.id, option, !!checked)
                    }
                  />
                  <Label htmlFor={`option-${idx}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={answers[currentQuestion.id] as string || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer transition-colors",
                    answers[currentQuestion.id] === option && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
