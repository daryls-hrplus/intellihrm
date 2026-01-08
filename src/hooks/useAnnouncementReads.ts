import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AnnouncementRead {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
  acknowledged_at: string | null;
}

interface AnnouncementStats {
  announcement_id: string;
  total_employees: number;
  read_count: number;
  acknowledged_count: number;
}

export function useAnnouncementReads() {
  const { user } = useAuth();
  const [userReads, setUserReads] = useState<Record<string, AnnouncementRead>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserReads();
    }
  }, [user?.id]);

  const fetchUserReads = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("announcement_reads")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const readsMap: Record<string, AnnouncementRead> = {};
      (data || []).forEach((read: AnnouncementRead) => {
        readsMap[read.announcement_id] = read;
      });
      setUserReads(readsMap);
    } catch (error) {
      console.error("Error fetching announcement reads:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = useCallback(async (announcementId: string) => {
    if (!user?.id) return;
    
    // Already read
    if (userReads[announcementId]) return;

    try {
      const { data, error } = await supabase
        .from("announcement_reads")
        .insert({
          announcement_id: announcementId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        // Ignore duplicate errors
        if (!error.message.includes("duplicate")) {
          throw error;
        }
      } else if (data) {
        setUserReads(prev => ({
          ...prev,
          [announcementId]: data,
        }));
      }
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  }, [user?.id, userReads]);

  const acknowledgeAnnouncement = useCallback(async (announcementId: string) => {
    if (!user?.id) return;

    try {
      // First ensure it's marked as read
      if (!userReads[announcementId]) {
        await markAsRead(announcementId);
      }

      const { data, error } = await supabase
        .from("announcement_reads")
        .update({ acknowledged_at: new Date().toISOString() })
        .eq("announcement_id", announcementId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUserReads(prev => ({
          ...prev,
          [announcementId]: data,
        }));
      }
    } catch (error) {
      console.error("Error acknowledging announcement:", error);
    }
  }, [user?.id, userReads, markAsRead]);

  const isRead = useCallback((announcementId: string) => {
    return !!userReads[announcementId];
  }, [userReads]);

  const isAcknowledged = useCallback((announcementId: string) => {
    return !!userReads[announcementId]?.acknowledged_at;
  }, [userReads]);

  const getUnreadCount = useCallback((announcementIds: string[]) => {
    return announcementIds.filter(id => !userReads[id]).length;
  }, [userReads]);

  return {
    userReads,
    loading,
    markAsRead,
    acknowledgeAnnouncement,
    isRead,
    isAcknowledged,
    getUnreadCount,
    refetch: fetchUserReads,
  };
}

// Hook for HR to get announcement stats
export function useAnnouncementStats(announcementIds: string[]) {
  const [stats, setStats] = useState<Record<string, AnnouncementStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (announcementIds.length > 0) {
      fetchStats();
    }
  }, [announcementIds.join(",")]);

  const fetchStats = async () => {
    try {
      // Get read counts per announcement
      const { data: reads, error } = await supabase
        .from("announcement_reads")
        .select("announcement_id, acknowledged_at")
        .in("announcement_id", announcementIds);

      if (error) throw error;

      // Get company employee counts for each announcement
      const { data: announcements, error: annError } = await supabase
        .from("company_announcements")
        .select("id, company_id")
        .in("id", announcementIds);

      if (annError) throw annError;

      // Get employee counts per company
      const companyIds = [...new Set((announcements || []).map(a => a.company_id).filter(Boolean))];
      const { data: profileCounts, error: countError } = await supabase
        .from("profiles")
        .select("company_id")
        .in("company_id", companyIds)
        .eq("is_active", true);

      if (countError) throw countError;

      // Calculate counts per company
      const employeeCountByCompany: Record<string, number> = {};
      (profileCounts || []).forEach(p => {
        if (p.company_id) {
          employeeCountByCompany[p.company_id] = (employeeCountByCompany[p.company_id] || 0) + 1;
        }
      });

      // Build stats
      const statsMap: Record<string, AnnouncementStats> = {};
      announcementIds.forEach(annId => {
        const ann = (announcements || []).find(a => a.id === annId);
        const annReads = (reads || []).filter(r => r.announcement_id === annId);
        
        statsMap[annId] = {
          announcement_id: annId,
          total_employees: ann?.company_id ? (employeeCountByCompany[ann.company_id] || 0) : 0,
          read_count: annReads.length,
          acknowledged_count: annReads.filter(r => r.acknowledged_at).length,
        };
      });

      setStats(statsMap);
    } catch (error) {
      console.error("Error fetching announcement stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}
