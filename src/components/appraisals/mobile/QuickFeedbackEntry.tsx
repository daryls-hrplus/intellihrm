import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles,
  X,
  ChevronDown,
  User
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuickFeedbackEntryProps {
  employeeId?: string;
  employeeName?: string;
  participantId?: string;
  onSubmit?: (feedback: FeedbackData) => void;
  onClose?: () => void;
}

interface FeedbackData {
  content: string;
  rating?: number;
  sentiment?: "positive" | "constructive" | "neutral";
  isPrivate: boolean;
  tags: string[];
}

const feedbackTags = [
  "Leadership",
  "Teamwork",
  "Communication",
  "Technical Skills",
  "Problem Solving",
  "Initiative",
  "Reliability",
  "Growth Mindset",
];

export function QuickFeedbackEntry({
  employeeId,
  employeeName = "Team Member",
  participantId,
  onSubmit,
  onClose,
}: QuickFeedbackEntryProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number | undefined>();
  const [sentiment, setSentiment] = useState<"positive" | "constructive" | "neutral">("positive");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      toast.info("Voice recording stopped");
      return;
    }

    setIsRecording(true);
    toast.info("Listening... Speak your feedback");

    // Simulate voice transcription (in production, use Web Speech API)
    setTimeout(() => {
      setContent(prev => prev + " Great job on the recent project delivery!");
      setIsRecording(false);
      toast.success("Voice transcribed successfully");
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please enter some feedback");
      return;
    }

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      content: content.trim(),
      rating,
      sentiment,
      isPrivate,
      tags: selectedTags,
    };

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSubmit?.(feedbackData);
    toast.success("Feedback submitted successfully!");
    
    // Reset form
    setContent("");
    setRating(undefined);
    setSentiment("positive");
    setSelectedTags([]);
    setIsSubmitting(false);
    onClose?.();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Quick Feedback
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <CardDescription>
          Share feedback quickly on mobile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(employeeName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{employeeName}</div>
            <div className="text-xs text-muted-foreground">Feedback recipient</div>
          </div>
        </div>

        {/* Sentiment Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Feedback Type</Label>
          <div className="flex gap-2">
            <Button
              variant={sentiment === "positive" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setSentiment("positive")}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Positive
            </Button>
            <Button
              variant={sentiment === "neutral" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setSentiment("neutral")}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Neutral
            </Button>
            <Button
              variant={sentiment === "constructive" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setSentiment("constructive")}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Constructive
            </Button>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Rating (Optional)</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-2 touch-manipulation"
                onClick={() => setRating(rating === star ? undefined : star)}
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    rating && star <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Feedback</Label>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={handleVoiceInput}
              className="h-8"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-1" />
                  Voice
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your feedback here..."
            rows={4}
            className="resize-none text-base"
          />
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
              <Mic className="h-4 w-4" />
              Listening...
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags (Optional)</Label>
          <div className="flex flex-wrap gap-2">
            {feedbackTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors text-xs py-1.5",
                  selectedTags.includes(tag) && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <Label className="text-sm font-medium">Private Feedback</Label>
            <p className="text-xs text-muted-foreground">
              Only visible to HR and leadership
            </p>
          </div>
          <Switch
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
