import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneOff, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";

interface VideoCallModalProps {
  isOpen: boolean;
  roomUrl: string;
  token: string;
  onClose: () => void;
  onEndCall: () => void;
}

export const VideoCallModal = ({
  isOpen,
  roomUrl,
  token,
  onClose,
  onEndCall,
}: VideoCallModalProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleEndCall = () => {
    onEndCall();
    onClose();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const callUrl = token ? `${roomUrl}?t=${token}` : roomUrl;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-5xl w-full h-[80vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle>Video Call</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndCall}
              className="gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End Call
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 relative bg-black">
          <iframe
            ref={iframeRef}
            src={callUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            className="w-full h-full border-0"
            title="Video Call"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
