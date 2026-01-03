import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Pause, SkipForward, Volume2, VolumeX, Maximize, 
  ChevronLeft, ChevronRight, CheckCircle2, Lock, Calendar,
  ArrowRight, X
} from "lucide-react";
import { useDemoExperience, useDemoChapters } from "@/hooks/useDemoExperience";
import { useDemoSession } from "@/hooks/useDemoSession";
import { LeadCaptureModal } from "./components/LeadCaptureModal";
import { cn } from "@/lib/utils";

export default function ProductTourPlayerPage() {
  const { experienceCode } = useParams<{ experienceCode: string }>();
  const navigate = useNavigate();
  const { data: experience, isLoading: expLoading } = useDemoExperience(experienceCode);
  const { data: chapters, isLoading: chapLoading } = useDemoChapters(experience?.id);
  const { session, trackEvent, isIdentified } = useDemoSession();

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [chapterStartTime, setChapterStartTime] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentChapter = chapters?.[currentChapterIndex];
  const totalDuration = chapters?.reduce((acc, ch) => acc + (ch.duration_seconds || 0), 0) || 0;
  const watchedDuration = chapters?.slice(0, currentChapterIndex).reduce((acc, ch) => acc + (ch.duration_seconds || 0), 0) || 0;
  const overallProgress = totalDuration > 0 ? ((watchedDuration + (currentChapter?.duration_seconds || 0) * (progress / 100)) / totalDuration) * 100 : 0;

  // Check if we should gate content
  useEffect(() => {
    if (currentChapter?.is_gated && !isIdentified) {
      setShowLeadCapture(true);
      setIsPlaying(false);
    }
  }, [currentChapter, isIdentified]);

  // Track chapter start
  useEffect(() => {
    if (currentChapter && experience && session) {
      setChapterStartTime(Date.now());
      trackEvent(
        "chapter_start",
        { chapter_order: currentChapter.chapter_order },
        experience.id,
        currentChapter.id
      );
    }
  }, [currentChapterIndex, currentChapter?.id]);

  // Simulate video progress (replace with actual video integration)
  useEffect(() => {
    if (isPlaying && currentChapter) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleChapterComplete();
            return 0;
          }
          return prev + (100 / (currentChapter.duration_seconds || 60));
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentChapter?.id]);

  const handleChapterComplete = async () => {
    if (!currentChapter || !experience) return;

    const timeSpent = chapterStartTime ? Math.floor((Date.now() - chapterStartTime) / 1000) : 0;
    
    await trackEvent(
      "chapter_complete",
      { chapter_order: currentChapter.chapter_order },
      experience.id,
      currentChapter.id,
      100,
      timeSpent
    );

    setCompletedChapters((prev) => new Set([...prev, currentChapterIndex]));
    setIsPlaying(false);

    // Auto-advance to next chapter
    if (chapters && currentChapterIndex < chapters.length - 1) {
      setTimeout(() => {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setProgress(0);
        setIsPlaying(true);
      }, 1500);
    }
  };

  const handlePlay = () => {
    if (currentChapter?.is_gated && !isIdentified) {
      setShowLeadCapture(true);
      return;
    }
    setIsPlaying(true);
    trackEvent("video_play", {}, experience?.id, currentChapter?.id);
  };

  const handlePause = () => {
    setIsPlaying(false);
    trackEvent("video_pause", {}, experience?.id, currentChapter?.id, Math.floor(progress));
  };

  const handleChapterSelect = (index: number) => {
    const chapter = chapters?.[index];
    if (chapter?.is_gated && !isIdentified) {
      setShowLeadCapture(true);
      return;
    }
    
    setCurrentChapterIndex(index);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleCTAClick = async (ctaType: string, ctaUrl?: string | null) => {
    await trackEvent("cta_click", { cta_type: ctaType }, experience?.id, currentChapter?.id);
    
    if (ctaType === "schedule_call") {
      navigate("/register-demo");
    } else if (ctaType === "try_feature" && ctaUrl) {
      navigate(ctaUrl);
    } else if (ctaType === "next_chapter" && chapters && currentChapterIndex < chapters.length - 1) {
      handleChapterSelect(currentChapterIndex + 1);
    }
  };

  const handleLeadCaptureComplete = () => {
    setShowLeadCapture(false);
    setIsPlaying(true);
  };

  if (expLoading || chapLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading experience...</div>
      </div>
    );
  }

  if (!experience || !chapters?.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Experience Not Found</h1>
          <Button onClick={() => navigate("/product-tour")}>
            Back to Tours
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{experience.experience_name} | intellihrm Product Tour</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/product-tour")}>
                <X className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold">{experience.experience_name}</h1>
                <p className="text-xs text-muted-foreground">
                  Chapter {currentChapterIndex + 1} of {chapters.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>{Math.round(overallProgress)}% complete</span>
              </div>
              <Progress value={overallProgress} className="w-24 h-2" />
              <Button size="sm" onClick={() => navigate("/register-demo")}>
                <Calendar className="h-4 w-4 mr-2" />
                Talk to Sales
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Video Player */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative bg-black flex items-center justify-center">
              {/* Placeholder for video - replace with actual video player */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">{currentChapter?.title}</h2>
                  <p className="text-lg text-white/80">{currentChapter?.description}</p>
                  {!isPlaying && (
                    <Button
                      size="lg"
                      className="mt-8"
                      onClick={handlePlay}
                    >
                      <Play className="h-6 w-6 mr-2" />
                      {progress > 0 ? "Resume" : "Play"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Video Controls */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handlePause} className="text-white">
                      <Pause className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                      <Progress value={progress} className="h-1" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="text-white">
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    {chapters && currentChapterIndex < chapters.length - 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleChapterSelect(currentChapterIndex + 1)}
                        className="text-white"
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Chapter CTA */}
            {currentChapter && progress >= 80 && (
              <div className="p-4 bg-muted border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {currentChapter.cta_type === "schedule_call" 
                        ? "Ready to see more?" 
                        : "Continue your tour"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentChapter.cta_type === "schedule_call"
                        ? "Schedule a personalized demo with our team"
                        : chapters && currentChapterIndex < chapters.length - 1
                          ? `Next: ${chapters[currentChapterIndex + 1]?.title}`
                          : "You've completed this tour!"}
                    </p>
                  </div>
                  <Button onClick={() => handleCTAClick(currentChapter.cta_type, currentChapter.cta_url)}>
                    {currentChapter.cta_type === "schedule_call" ? (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Demo
                      </>
                    ) : (
                      <>
                        Next Chapter
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Chapter Sidebar */}
          <aside className="hidden lg:block w-80 border-l bg-muted/30 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Chapters</h3>
              <div className="space-y-2">
                {chapters?.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterSelect(index)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors",
                      index === currentChapterIndex
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {completedChapters.has(index) ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : chapter.is_gated && !isIdentified ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <div className={cn(
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                            index === currentChapterIndex 
                              ? "border-primary-foreground text-primary-foreground" 
                              : "border-muted-foreground text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm truncate",
                          index === currentChapterIndex ? "" : "text-foreground"
                        )}>
                          {chapter.title}
                        </p>
                        <p className={cn(
                          "text-xs mt-0.5",
                          index === currentChapterIndex 
                            ? "text-primary-foreground/80" 
                            : "text-muted-foreground"
                        )}>
                          {Math.floor((chapter.duration_seconds || 0) / 60)}:{String((chapter.duration_seconds || 0) % 60).padStart(2, "0")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tour Info */}
            <div className="p-4 border-t">
              <Badge variant="secondary" className="mb-2">
                {experience.target_audience}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {experience.description}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <LeadCaptureModal
        open={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        onComplete={handleLeadCaptureComplete}
      />
    </>
  );
}
