import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface GoalNotification {
  id: string;
  type: "check_in_due" | "check_in_overdue" | "risk_changed" | "review_requested" | "goal_updated";
  title: string;
  message: string;
  goalId: string;
  goalTitle: string;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  read: boolean;
}

interface UseRealtimeGoalNotificationsOptions {
  userId?: string;
  companyId?: string;
  enabled?: boolean;
}

export function useRealtimeGoalNotifications({
  userId,
  companyId,
  enabled = true,
}: UseRealtimeGoalNotificationsOptions) {
  const [notifications, setNotifications] = useState<GoalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  const addNotification = useCallback((notification: Omit<GoalNotification, "id" | "createdAt" | "read">) => {
    const newNotification: GoalNotification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + 1);

    // Show toast for high priority notifications
    if (notification.priority === "high") {
      toast.warning(notification.title, {
        description: notification.message,
        action: {
          label: "View",
          onClick: () => {
            // Could navigate to goal
          },
        },
      });
    } else if (notification.priority === "medium") {
      toast.info(notification.title, {
        description: notification.message,
      });
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!enabled || !userId) return;

    // Subscribe to goal check-in schedule changes
    const checkInChannel = supabase
      .channel("goal-checkin-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goal_check_in_schedules",
        },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            const schedule = payload.new as any;
            if (schedule.next_check_in_date) {
              const nextDate = new Date(schedule.next_check_in_date);
              const now = new Date();
              const diffHours = (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60);

              if (diffHours <= 0) {
                addNotification({
                  type: "check_in_overdue",
                  title: "Check-in Overdue",
                  message: "A goal check-in is overdue and needs your attention.",
                  goalId: schedule.goal_id,
                  goalTitle: "Goal",
                  priority: "high",
                });
              } else if (diffHours <= 24) {
                addNotification({
                  type: "check_in_due",
                  title: "Check-in Due Soon",
                  message: "You have a goal check-in due within 24 hours.",
                  goalId: schedule.goal_id,
                  goalTitle: "Goal",
                  priority: "medium",
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to goal updates
    const goalChannel = supabase
      .channel("goal-update-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "goals",
        },
        (payload) => {
          const goal = payload.new as any;
          const oldGoal = payload.old as any;

          // Check for risk status changes
          if (goal.risk_status !== oldGoal.risk_status && goal.risk_status === "at_risk") {
            addNotification({
              type: "risk_changed",
              title: "Goal At Risk",
              message: `Goal "${goal.title}" is now marked as at risk.`,
              goalId: goal.id,
              goalTitle: goal.title,
              priority: "high",
            });
          }

          // Check for significant progress changes
          if (goal.current_value !== oldGoal.current_value) {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
          }
        }
      )
      .subscribe();

    // Subscribe to coaching nudges
    const coachingChannel = supabase
      .channel("coaching-nudge-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "goal_coaching_nudges",
        },
        (payload) => {
          const nudge = payload.new as any;
          if (nudge.manager_id === userId && !nudge.is_dismissed) {
            addNotification({
              type: "review_requested",
              title: nudge.nudge_title || "Coaching Suggestion",
              message: nudge.nudge_message || "You have a new coaching suggestion.",
              goalId: nudge.goal_id || "",
              goalTitle: "Coaching",
              priority: nudge.priority || "medium",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(checkInChannel);
      supabase.removeChannel(goalChannel);
      supabase.removeChannel(coachingChannel);
    };
  }, [enabled, userId, addNotification, queryClient]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification,
  };
}
