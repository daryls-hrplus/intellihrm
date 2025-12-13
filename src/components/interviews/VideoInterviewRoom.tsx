import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorUp, 
  Phone, 
  Settings,
  Circle,
  Square,
  Users
} from "lucide-react";
import { toast } from "sonner";

interface VideoInterviewRoomProps {
  interviewId: string;
  interviewType: "appraisal" | "goal" | "recruitment";
  participantName: string;
  onEndCall: () => void;
  screenSharingEnabled?: boolean;
  recordingEnabled?: boolean;
}

export function VideoInterviewRoom({
  interviewId,
  interviewType,
  participantName,
  onEndCall,
  screenSharingEnabled = true,
  recordingEnabled = false,
}: VideoInterviewRoomProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeMedia();
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    
    return () => {
      clearInterval(timer);
      stopAllStreams();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Failed to access camera/microphone");
    }
  };

  const stopAllStreams = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      toast.success("Screen sharing stopped");
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
        toast.error("Failed to share screen");
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.success("Recording stopped");
    } else {
      setIsRecording(true);
      toast.success("Recording started");
    }
  };

  const handleEndCall = () => {
    stopAllStreams();
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Video Interview</CardTitle>
            <Badge variant="secondary">{formatDuration(callDuration)}</Badge>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <Circle className="h-2 w-2 mr-1 fill-current" />
                Recording
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {participantName}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Remote Video (Main) */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden col-span-2 md:col-span-1">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary">{participantName}</Badge>
            </div>
            {!remoteVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Waiting for participant...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (PIP) */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary">You</Badge>
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <VideoOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Screen Share Preview */}
        {isScreenSharing && (
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MonitorUp className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Screen sharing active</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 py-4">
          <Button
            variant={isAudioOn ? "outline" : "destructive"}
            size="icon"
            onClick={toggleAudio}
            className="rounded-full h-12 w-12"
          >
            {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoOn ? "outline" : "destructive"}
            size="icon"
            onClick={toggleVideo}
            className="rounded-full h-12 w-12"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          {screenSharingEnabled && (
            <Button
              variant={isScreenSharing ? "secondary" : "outline"}
              size="icon"
              onClick={toggleScreenShare}
              className="rounded-full h-12 w-12"
            >
              <MonitorUp className="h-5 w-5" />
            </Button>
          )}

          {recordingEnabled && (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={toggleRecording}
              className="rounded-full h-12 w-12"
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </Button>
          )}

          <Button
            variant="destructive"
            size="icon"
            onClick={handleEndCall}
            className="rounded-full h-12 w-12"
          >
            <Phone className="h-5 w-5 rotate-[135deg]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
