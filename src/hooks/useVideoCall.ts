import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoRoom {
  callId: string;
  roomUrl: string;
  roomName: string;
  token: string;
}

export const useVideoCall = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeCall, setActiveCall] = useState<VideoRoom | null>(null);

  const createRoom = useCallback(async (channelId: string, channelName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("create-video-room", {
        body: { channelId, channelName },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Video Chat Error",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      setActiveCall(data);
      return data as VideoRoom;
    } catch (error) {
      console.error("Error creating video room:", error);
      toast({
        title: "Error",
        description: "Failed to start video call",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const joinCall = useCallback(async (callId: string) => {
    try {
      setLoading(true);
      
      // Get call details
      const { data: call, error: callError } = await supabase
        .from("video_calls")
        .select("*")
        .eq("id", callId)
        .eq("status", "active")
        .single();

      if (callError || !call) {
        toast({
          title: "Error",
          description: "Call not found or has ended",
          variant: "destructive",
        });
        return null;
      }

      // Get meeting token
      const { data, error } = await supabase.functions.invoke("create-video-room", {
        body: { 
          channelId: call.channel_id, 
          channelName: call.room_name,
          existingRoom: call.room_name,
        },
      });

      if (error) throw error;

      const roomData = {
        callId: call.id,
        roomUrl: call.room_url,
        roomName: call.room_name,
        token: data.token,
      };

      setActiveCall(roomData);
      return roomData;
    } catch (error) {
      console.error("Error joining call:", error);
      toast({
        title: "Error",
        description: "Failed to join video call",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      await supabase
        .from("video_calls")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", activeCall.callId);

      setActiveCall(null);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  }, [activeCall]);

  const leaveCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  return {
    loading,
    activeCall,
    createRoom,
    joinCall,
    endCall,
    leaveCall,
  };
};
