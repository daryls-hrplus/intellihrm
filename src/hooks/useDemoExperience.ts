import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DemoExperience {
  id: string;
  experience_code: string;
  experience_name: string;
  description: string | null;
  target_audience: string;
  target_roles: string[];
  featured_modules: string[];
  estimated_duration_minutes: number;
  thumbnail_url: string | null;
  hero_video_url: string | null;
  is_active: boolean;
  display_order: number;
}

interface DemoChapter {
  id: string;
  experience_id: string;
  chapter_order: number;
  title: string;
  description: string | null;
  chapter_type: "video" | "interactive" | "feature_highlight" | "quiz";
  video_url: string | null;
  video_thumbnail_url: string | null;
  duration_seconds: number;
  cta_type: string;
  cta_label: string | null;
  cta_url: string | null;
  feature_preview_route: string | null;
  interactive_elements: unknown[];
  is_gated: boolean;
}

export function useDemoExperiences() {
  return useQuery({
    queryKey: ["demo-experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demo_experiences")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as DemoExperience[];
    },
  });
}

export function useDemoExperience(experienceCode: string | undefined) {
  return useQuery({
    queryKey: ["demo-experience", experienceCode],
    queryFn: async () => {
      if (!experienceCode) return null;

      const { data, error } = await supabase
        .from("demo_experiences")
        .select("*")
        .eq("experience_code", experienceCode)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as DemoExperience;
    },
    enabled: !!experienceCode,
  });
}

export function useDemoChapters(experienceId: string | undefined) {
  return useQuery({
    queryKey: ["demo-chapters", experienceId],
    queryFn: async () => {
      if (!experienceId) return [];

      const { data, error } = await supabase
        .from("demo_experience_chapters")
        .select("*")
        .eq("experience_id", experienceId)
        .eq("is_active", true)
        .order("chapter_order");

      if (error) throw error;
      return data as DemoChapter[];
    },
    enabled: !!experienceId,
  });
}

export function useRecommendedExperience(personalizationAnswers?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["recommended-experience", personalizationAnswers],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demo_experiences")
        .select("*")
        .eq("is_active", true)
        .order("display_order")
        .limit(1);

      if (error) throw error;
      
      // Simple recommendation logic - can be enhanced with AI
      if (personalizationAnswers?.role) {
        const role = personalizationAnswers.role as string;
        const allExperiences = await supabase
          .from("demo_experiences")
          .select("*")
          .eq("is_active", true);
        
        if (allExperiences.data) {
          const matched = allExperiences.data.find((exp) =>
            (exp.target_roles as string[])?.some((r) => 
              r.toLowerCase().includes(role.toLowerCase()) ||
              role.toLowerCase().includes(r.toLowerCase())
            )
          );
          if (matched) return matched as DemoExperience;
        }
      }

      return data?.[0] as DemoExperience | null;
    },
  });
}
