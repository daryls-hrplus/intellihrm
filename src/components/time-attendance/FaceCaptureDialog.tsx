import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FaceCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (photoDataUrl: string) => void;
  title?: string;
  description?: string;
}

export function FaceCaptureDialog({
  open,
  onOpenChange,
  onCapture,
  title = "Face Capture",
  description = "Position your face within the frame and click capture"
}: FaceCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError("Unable to access camera. Please ensure camera permissions are granted.");
      toast.error("Camera access denied");
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
    
    return () => {
      stopCamera();
    };
  }, [open]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Flip horizontally for mirror effect
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{cameraError}</p>
                <Button variant="outline" className="mt-4" onClick={startCamera}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}

            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}

            {/* Face guide overlay */}
            {!capturedImage && !cameraError && !loading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-56 border-2 border-primary border-dashed rounded-full opacity-50" />
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center gap-3">
            {!capturedImage ? (
              <Button
                onClick={capturePhoto}
                disabled={loading || !!cameraError}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Capture
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={retakePhoto} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={confirmCapture} className="gap-2">
                  <Check className="h-4 w-4" />
                  Confirm
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
