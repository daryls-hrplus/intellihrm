import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateRoomRequest {
  channelId: string;
  channelName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Daily API key from system settings
    const { data: settingData, error: settingError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "daily_api_key")
      .single();

    if (settingError || !settingData?.value) {
      console.error("Daily API key not configured:", settingError);
      return new Response(
        JSON.stringify({ error: "Video chat not configured. Please add Daily.co API key in admin settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dailyApiKey = settingData.value;
    const { channelId, channelName } = await req.json() as CreateRoomRequest;

    // Generate unique room name
    const roomName = `room-${channelId}-${Date.now()}`;

    // Create Daily.co room
    const dailyResponse = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          enable_chat: true,
          enable_screenshare: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!dailyResponse.ok) {
      const errorData = await dailyResponse.text();
      console.error("Daily.co API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to create video room" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roomData = await dailyResponse.json();

    // Get the user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store video call in database
    const { data: callData, error: callError } = await supabase
      .from("video_calls")
      .insert({
        channel_id: channelId,
        initiated_by: user.id,
        room_name: roomData.name,
        room_url: roomData.url,
        status: "active",
      })
      .select()
      .single();

    if (callError) {
      console.error("Error saving video call:", callError);
      return new Response(
        JSON.stringify({ error: "Failed to save video call" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create meeting token for the user
    const tokenResponse = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomData.name,
          user_name: user.email,
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      }),
    });

    const tokenData = await tokenResponse.json();

    return new Response(
      JSON.stringify({
        callId: callData.id,
        roomUrl: roomData.url,
        roomName: roomData.name,
        token: tokenData.token,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating video room:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
