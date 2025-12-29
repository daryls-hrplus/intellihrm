import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Recognition {
  id: string;
  recipient_id: string;
  nominator_id: string;
  award_type: string;
  title: string;
  description: string;
  company_value: string | null;
  points_awarded: number;
  status: string;
  is_public: boolean;
  is_team_recognition: boolean;
  department_id: string | null;
  created_at: string;
  recipient?: { id: string; full_name: string; avatar_url?: string };
  nominator?: { id: string; full_name: string; avatar_url?: string };
  reactions?: { reaction_type: string; user_id: string }[];
}

export interface Badge {
  id: string;
  badge_code: string;
  badge_name: string;
  description: string;
  icon_name: string;
  color: string;
  badge_type: string;
}

export interface EmployeeBadge {
  id: string;
  badge_id: string;
  awarded_at: string;
  awarded_reason: string;
  is_featured: boolean;
  badge?: Badge;
}

export interface RecognitionNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  recognition?: Recognition;
  badge?: Badge;
}

export interface LeaderboardEntry {
  employee_id: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  recognition_count: number;
  points_total: number;
  rank: number;
}

export function useRecognition(companyId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch recognition wall (all public recognitions)
  const { data: recognitions = [], isLoading: loadingRecognitions, refetch: refetchRecognitions } = useQuery({
    queryKey: ["recognitions", companyId],
    queryFn: async () => {
      const query = supabase
        .from("recognition_awards")
        .select(`
          *,
          recipient:profiles!recognition_awards_recipient_id_fkey(id, full_name, avatar_url),
          nominator:profiles!recognition_awards_nominator_id_fkey(id, full_name, avatar_url),
          reactions:recognition_reactions(reaction_type, user_id)
        `)
        .eq("status", "approved")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (companyId) {
        query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Recognition[];
    },
    enabled: !!companyId,
  });

  // Fetch user's received recognitions
  const { data: myRecognitions = [], isLoading: loadingMyRecognitions } = useQuery({
    queryKey: ["my-recognitions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recognition_awards")
        .select(`
          *,
          nominator:profiles!recognition_awards_nominator_id_fkey(id, full_name, avatar_url)
        `)
        .eq("recipient_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Recognition[];
    },
    enabled: !!user?.id,
  });

  // Fetch user's badges
  const { data: myBadges = [], isLoading: loadingBadges } = useQuery({
    queryKey: ["my-badges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_badges")
        .select(`
          *,
          badge:recognition_badges(*)
        `)
        .eq("employee_id", user?.id)
        .order("awarded_at", { ascending: false });

      if (error) throw error;
      return data as EmployeeBadge[];
    },
    enabled: !!user?.id,
  });

  // Fetch notifications
  const { data: notifications = [], isLoading: loadingNotifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["recognition-notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recognition_notifications")
        .select(`
          *,
          recognition:recognition_awards(*),
          badge:recognition_badges(*)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as RecognitionNotification[];
    },
    enabled: !!user?.id,
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ["recognition-leaderboard", companyId],
    queryFn: async () => {
      // Get aggregated recognition data
      const { data: recognitionData, error } = await supabase
        .from("recognition_awards")
        .select(`
          recipient_id,
          points_awarded,
          recipient:profiles!recognition_awards_recipient_id_fkey(id, full_name, avatar_url)
        `)
        .eq("company_id", companyId)
        .eq("status", "approved");

      if (error) throw error;

      // Aggregate by recipient
      const aggregated = (recognitionData || []).reduce((acc, item) => {
        const id = item.recipient_id;
        if (!acc[id]) {
          acc[id] = {
            employee_id: id,
            full_name: item.recipient?.full_name || "Unknown",
            avatar_url: item.recipient?.avatar_url,
            recognition_count: 0,
            points_total: 0,
          };
        }
        acc[id].recognition_count += 1;
        acc[id].points_total += item.points_awarded || 0;
        return acc;
      }, {} as Record<string, any>);

      // Convert to array and sort
      const sorted = Object.values(aggregated)
        .sort((a: any, b: any) => b.points_total - a.points_total)
        .slice(0, 10)
        .map((entry: any, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return sorted as LeaderboardEntry[];
    },
    enabled: !!companyId,
  });

  // Create recognition mutation
  const createRecognition = useMutation({
    mutationFn: async (data: {
      recipient_id: string;
      award_type: string;
      title: string;
      description: string;
      company_value?: string;
      is_team_recognition?: boolean;
      department_id?: string;
    }) => {
      const { error } = await supabase.from("recognition_awards").insert({
        ...data,
        company_id: companyId,
        nominator_id: user?.id,
        status: "approved",
        is_public: true,
        points_awarded: data.award_type === "spot_bonus" ? 25 : 10,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recognition sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      queryClient.invalidateQueries({ queryKey: ["recognition-leaderboard"] });
    },
    onError: (error) => {
      console.error("Error creating recognition:", error);
      toast.error("Failed to send recognition");
    },
  });

  // Add reaction mutation
  const addReaction = useMutation({
    mutationFn: async ({ recognitionId, reactionType }: { recognitionId: string; reactionType: string }) => {
      const { error } = await supabase.from("recognition_reactions").upsert({
        recognition_id: recognitionId,
        user_id: user?.id,
        reaction_type: reactionType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
    },
  });

  // Mark notification as read
  const markNotificationRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("recognition_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognition-notifications"] });
    },
  });

  // Mark all notifications as read
  const markAllNotificationsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("recognition_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user?.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognition-notifications"] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    recognitions,
    myRecognitions,
    myBadges,
    notifications,
    leaderboard,
    unreadCount,
    loadingRecognitions,
    loadingMyRecognitions,
    loadingBadges,
    loadingNotifications,
    loadingLeaderboard,
    createRecognition,
    addReaction,
    markNotificationRead,
    markAllNotificationsRead,
    refetchRecognitions,
    refetchNotifications,
  };
}

export function useRecognitionAnalytics(companyId?: string) {
  return useQuery({
    queryKey: ["recognition-analytics", companyId],
    queryFn: async () => {
      // Get recognition stats
      const { data: recognitions, error } = await supabase
        .from("recognition_awards")
        .select("award_type, points_awarded, company_value, nominator_id, recipient_id, created_at")
        .eq("company_id", companyId)
        .eq("status", "approved");

      if (error) throw error;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      const recentRecognitions = (recognitions || []).filter(
        (r) => new Date(r.created_at) >= thirtyDaysAgo
      );

      const uniqueGivers = new Set(recentRecognitions.map((r) => r.nominator_id)).size;
      const uniqueReceivers = new Set(recentRecognitions.map((r) => r.recipient_id)).size;
      const totalPoints = recentRecognitions.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

      // Award type breakdown
      const awardTypeBreakdown = recentRecognitions.reduce((acc, r) => {
        acc[r.award_type] = (acc[r.award_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Value breakdown
      const valueBreakdown = recentRecognitions.reduce((acc, r) => {
        if (r.company_value) {
          acc[r.company_value] = (acc[r.company_value] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRecognitions: recentRecognitions.length,
        uniqueGivers,
        uniqueReceivers,
        totalPoints,
        awardTypeBreakdown,
        valueBreakdown,
        participationRate: uniqueGivers > 0 ? ((uniqueGivers + uniqueReceivers) / 2) : 0,
      };
    },
    enabled: !!companyId,
  });
}
