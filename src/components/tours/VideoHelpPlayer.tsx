import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Clock, Play } from 'lucide-react';
import { useTourContext } from './TourProvider';

export function VideoHelpPlayer() {
  const { currentVideo, closeVideo } = useTourContext();
  const [isLoading, setIsLoading] = useState(true);

  if (!currentVideo) return null;

  const getEmbedUrl = () => {
    const { video_url, video_provider } = currentVideo;
    
    switch (video_provider) {
      case 'youtube': {
        // Convert youtube.com/watch?v=ID to embed URL
        const videoIdMatch = video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        const videoId = videoIdMatch?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : video_url;
      }
      case 'vimeo': {
        // Convert vimeo.com/ID to embed URL
        const vimeoIdMatch = video_url.match(/vimeo\.com\/(\d+)/);
        const vimeoId = vimeoIdMatch?.[1];
        return vimeoId ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1` : video_url;
      }
      case 'trupeer':
      case 'guidde':
      default:
        // These usually provide embed URLs directly
        return video_url;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProviderLabel = () => {
    const labels: Record<string, string> = {
      trupeer: 'Trupeer',
      guidde: 'Guidde',
      youtube: 'YouTube',
      vimeo: 'Vimeo',
      other: 'Video',
    };
    return labels[currentVideo.video_provider] || 'Video';
  };

  return (
    <Dialog open={!!currentVideo} onOpenChange={() => closeVideo()}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 space-y-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {getProviderLabel()}
                </Badge>
                {currentVideo.duration_seconds && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(currentVideo.duration_seconds)}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-lg font-semibold leading-tight">
                {currentVideo.title}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(currentVideo.video_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => closeVideo()}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative bg-black">
          <AspectRatio ratio={16 / 9}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Play className="h-12 w-12 animate-pulse" />
                  <span className="text-sm">Loading video...</span>
                </div>
              </div>
            )}
            <iframe
              src={getEmbedUrl()}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
            />
          </AspectRatio>
        </div>

        <div className="p-4 pt-2 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => closeVideo()}
          >
            Close and Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
