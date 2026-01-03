import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TrainingVideoPlayerProps {
  videoUrl: string;
  title: string;
  onProgress: (percentage: number, currentTime: number, duration: number) => void;
  onComplete: () => void;
  minWatchPercentage?: number;
  initialPosition?: number;
  className?: string;
}

export function TrainingVideoPlayer({
  videoUrl,
  title,
  onProgress,
  onComplete,
  minWatchPercentage = 90,
  initialPosition = 0,
  className,
}: TrainingVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setCurrentTime(video.currentTime);
    const percentage = (video.currentTime / video.duration) * 100;
    setWatchedPercentage(Math.max(watchedPercentage, percentage));
    
    onProgress(percentage, video.currentTime, video.duration);
    
    if (percentage >= minWatchPercentage && !hasCompleted) {
      setHasCompleted(true);
      onComplete();
    }
  }, [minWatchPercentage, onProgress, onComplete, hasCompleted, watchedPercentage]);
  
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    if (initialPosition > 0) {
      video.currentTime = initialPosition;
    }
  };
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };
  
  const handleSkipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, duration);
  };
  
  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
  };
  
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isComplete = watchedPercentage >= minWatchPercentage;
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group bg-black rounded-lg overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />
      
      {/* Progress indicator overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="bg-black/70 rounded-full px-3 py-1 text-xs text-white flex items-center gap-2">
          <span>{Math.round(watchedPercentage)}% watched</span>
          {isComplete && (
            <span className="text-green-400">✓ Complete</span>
          )}
        </div>
      </div>
      
      {/* Play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            size="lg"
            variant="ghost"
            className="h-20 w-20 rounded-full bg-white/20 hover:bg-white/30 text-white"
            onClick={togglePlay}
          >
            <Play className="h-10 w-10 ml-1" />
          </Button>
        </div>
      )}
      
      {/* Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <Slider
            value={[progressPercentage]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="cursor-pointer"
          />
          {/* Watch requirement indicator */}
          <div className="relative h-1 mt-1">
            <div
              className="absolute h-full bg-yellow-500/30 rounded"
              style={{ width: `${minWatchPercentage}%` }}
            />
            <div
              className="absolute h-1 w-1 rounded-full bg-yellow-500"
              style={{ left: `${minWatchPercentage}%`, top: "50%", transform: "translate(-50%, -50%)" }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleRestart}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleSkipForward}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 w-32">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-20"
              />
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <h3 className="text-white font-medium">{title}</h3>
      </div>
    </div>
  );
}
