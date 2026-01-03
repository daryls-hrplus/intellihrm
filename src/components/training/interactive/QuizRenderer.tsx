import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Trophy,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion, QuizOption } from "@/hooks/useInteractiveTraining";

interface QuizRendererProps {
  questions: QuizQuestion[];
  onSubmitAnswer: (questionId: string, answer: QuizAnswer) => void;
  onComplete: (results: QuizResults) => void;
  passingScore?: number;
  maxAttempts?: number;
  currentAttempt?: number;
}

interface QuizAnswer {
  selectedOptions?: string[];
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeTakenSeconds?: number;
}

export interface QuizResults {
  totalPoints: number;
  earnedPoints: number;
  score: number;
  passed: boolean;
  answers: Record<string, QuizAnswer>;
  weakTopics: string[];
  timeTakenSeconds: number;
}

export function QuizRenderer({
  questions,
  onSubmitAnswer,
  onComplete,
  passingScore = 80,
  maxAttempts = 3,
  currentAttempt = 1,
}: QuizRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedOptions([]);
    setTextAnswer("");
    setShowFeedback(false);
  }, [currentQuestionIndex]);
  
  const checkAnswer = (): QuizAnswer => {
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    let isCorrect = false;
    let pointsEarned = 0;
    
    switch (currentQuestion.question_type) {
      case "multiple_choice":
      case "true_false": {
        const correctOption = currentQuestion.options?.find(o => o.is_correct);
        isCorrect = selectedOptions.length === 1 && selectedOptions[0] === correctOption?.id;
        break;
      }
      case "multi_select": {
        const correctOptions = currentQuestion.options?.filter(o => o.is_correct).map(o => o.id) || [];
        isCorrect = 
          selectedOptions.length === correctOptions.length &&
          selectedOptions.every(id => correctOptions.includes(id));
        break;
      }
      case "short_answer": {
        // For short answer, we'll mark it for review - basic check for non-empty
        isCorrect = textAnswer.trim().length > 10;
        break;
      }
    }
    
    pointsEarned = isCorrect ? currentQuestion.points : 0;
    
    return {
      selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
      textAnswer: textAnswer || undefined,
      isCorrect,
      pointsEarned,
      timeTakenSeconds: timeTaken,
    };
  };
  
  const handleSubmitAnswer = () => {
    const answer = checkAnswer();
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    onSubmitAnswer(currentQuestion.id, answer);
    setShowFeedback(true);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate results
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const earnedPoints = Object.values(answers).reduce((sum, a) => sum + a.pointsEarned, 0);
      const score = Math.round((earnedPoints / totalPoints) * 100);
      const passed = score >= passingScore;
      
      // Find weak topics
      const topicScores: Record<string, { correct: number; total: number }> = {};
      questions.forEach(q => {
        if (q.topic_id) {
          if (!topicScores[q.topic_id]) {
            topicScores[q.topic_id] = { correct: 0, total: 0 };
          }
          topicScores[q.topic_id].total++;
          if (answers[q.id]?.isCorrect) {
            topicScores[q.topic_id].correct++;
          }
        }
      });
      
      const weakTopics = Object.entries(topicScores)
        .filter(([_, score]) => (score.correct / score.total) < 0.7)
        .map(([topicId]) => topicId);
      
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      
      const finalResults: QuizResults = {
        totalPoints,
        earnedPoints,
        score,
        passed,
        answers,
        weakTopics,
        timeTakenSeconds: timeTaken,
      };
      
      setResults(finalResults);
      setIsComplete(true);
      onComplete(finalResults);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleOptionToggle = (optionId: string) => {
    if (currentQuestion.question_type === "multi_select") {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };
  
  const canSubmit = () => {
    switch (currentQuestion.question_type) {
      case "multiple_choice":
      case "true_false":
        return selectedOptions.length === 1;
      case "multi_select":
        return selectedOptions.length > 0;
      case "short_answer":
        return textAnswer.trim().length > 0;
      default:
        return false;
    }
  };
  
  if (isComplete && results) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6">
          {results.passed ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600">
                <Trophy className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Congratulations!</h2>
              <p className="text-muted-foreground">You passed the quiz</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Not Quite</h2>
              <p className="text-muted-foreground">You didn't reach the passing score</p>
            </>
          )}
          
          <div className="grid grid-cols-3 gap-4 py-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{results.score}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {results.earnedPoints}/{results.totalPoints}
              </div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {Math.floor(results.timeTakenSeconds / 60)}:{(results.timeTakenSeconds % 60).toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
          </div>
          
          {results.weakTopics.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Topics to Review</span>
              </div>
              <p className="text-sm text-yellow-700">
                You may need additional training on {results.weakTopics.length} topic(s).
                Remediation content will be assigned.
              </p>
            </div>
          )}
          
          {!results.passed && currentAttempt < maxAttempts && (
            <div className="text-sm text-muted-foreground">
              You have {maxAttempts - currentAttempt} attempt(s) remaining
            </div>
          )}
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Question card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Question text */}
          <div>
            <Badge variant="secondary" className="mb-2">
              {currentQuestion.question_type.replace("_", " ")}
            </Badge>
            <h3 className="text-lg font-medium text-foreground">
              {currentQuestion.question_text}
            </h3>
          </div>
          
          {/* Answer options */}
          <div className="space-y-3">
            {currentQuestion.question_type === "short_answer" ? (
              <Textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={showFeedback}
                rows={4}
              />
            ) : currentQuestion.question_type === "multi_select" ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Select all that apply</p>
                {currentQuestion.options?.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedOptions.includes(option.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      showFeedback && option.is_correct && "border-green-500 bg-green-50",
                      showFeedback && selectedOptions.includes(option.id) && !option.is_correct && "border-red-500 bg-red-50"
                    )}
                    onClick={() => !showFeedback && handleOptionToggle(option.id)}
                  >
                    <Checkbox
                      checked={selectedOptions.includes(option.id)}
                      disabled={showFeedback}
                    />
                    <Label className="flex-1 cursor-pointer">{option.option_text}</Label>
                    {showFeedback && option.is_correct && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {showFeedback && selectedOptions.includes(option.id) && !option.is_correct && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={selectedOptions[0] || ""}
                onValueChange={(value) => !showFeedback && setSelectedOptions([value])}
              >
                {currentQuestion.options?.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedOptions.includes(option.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      showFeedback && option.is_correct && "border-green-500 bg-green-50",
                      showFeedback && selectedOptions.includes(option.id) && !option.is_correct && "border-red-500 bg-red-50"
                    )}
                    onClick={() => !showFeedback && setSelectedOptions([option.id])}
                  >
                    <RadioGroupItem value={option.id} disabled={showFeedback} />
                    <Label className="flex-1 cursor-pointer">{option.option_text}</Label>
                    {showFeedback && option.is_correct && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {showFeedback && selectedOptions.includes(option.id) && !option.is_correct && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
          
          {/* Feedback */}
          {showFeedback && currentQuestion.explanation && (
            <div className={cn(
              "p-4 rounded-lg",
              answers[currentQuestion.id]?.isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            )}>
              <div className="flex items-start gap-2">
                {answers[currentQuestion.id]?.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {answers[currentQuestion.id]?.isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        {!showFeedback ? (
          <Button onClick={handleSubmitAnswer} disabled={!canSubmit()}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              "Complete Quiz"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
