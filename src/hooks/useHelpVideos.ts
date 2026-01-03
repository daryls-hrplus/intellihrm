import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HelpVideoCategory {
  id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  display_order: number;
}

interface HelpVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  difficulty_level: string;
  category: { name: string; icon_name: string | null } | null;
  relevanceScore?: number;
}

interface ContextualResponse {
  videos: HelpVideo[];
  method: "search" | "contextual" | "ai" | "none";
}

export function useHelpVideoCategories() {
  return useQuery({
    queryKey: ["help-video-categories"],
    queryFn: async (): Promise<HelpVideoCategory[]> => {
      const { data, error } = await supabase
        .from("help_video_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data || [];
    },
  });
}

export function useHelpVideosByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ["help-videos-by-category", categoryId],
    queryFn: async (): Promise<HelpVideo[]> => {
      let query = supabase
        .from("help_videos")
        .select(`
          id, title, description, video_url, thumbnail_url, duration_seconds, difficulty_level,
          category:help_video_categories(name, icon_name)
        `)
        .eq("is_active", true)
        .order("display_order");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useContextualHelpVideos(userIntent?: string) {
  const location = useLocation();

  return useQuery({
    queryKey: ["contextual-help-videos", location.pathname, userIntent],
    queryFn: async (): Promise<ContextualResponse> => {
      const { data, error } = await supabase.functions.invoke("contextual-help-videos", {
        body: {
          currentRoute: location.pathname,
          userIntent: userIntent || null,
        },
      });

      if (error) throw error;
      return data;
    },
    enabled: true,
    staleTime: 60 * 1000, // Cache for 1 minute
  });
}

export function useSearchHelpVideos() {
  return useMutation({
    mutationFn: async (searchQuery: string): Promise<ContextualResponse> => {
      const { data, error } = await supabase.functions.invoke("contextual-help-videos", {
        body: { searchQuery },
      });

      if (error) throw error;
      return data;
    },
  });
}

export function useRecordVideoWatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const location = useLocation();

  return useMutation({
    mutationFn: async ({
      videoId,
      watchDuration,
      completed,
    }: {
      videoId: string;
      watchDuration: number;
      completed: boolean;
    }) => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("help_video_history")
        .insert({
          user_id: user.id,
          video_id: videoId,
          watch_duration_seconds: watchDuration,
          completed,
          context_route: location.pathname,
        });

      if (error) throw error;
      return data;

      // Increment view count - ignore errors as this is not critical
      await supabase
        .from("help_videos")
        .update({ view_count: 1 }) // This is a simple increment placeholder
        .eq("id", videoId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-video-history"] });
    },
  });
}

export function useRecentlyWatchedVideos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["help-video-history", user?.id],
    queryFn: async (): Promise<HelpVideo[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("help_video_history")
        .select(`
          video:help_videos(
            id, title, description, video_url, thumbnail_url, duration_seconds, difficulty_level,
            category:help_video_categories(name, icon_name)
          )
        `)
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []).map((h: any) => h.video).filter(Boolean);
    },
    enabled: !!user?.id,
  });
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
