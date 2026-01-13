import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  priority_until: string | null;
  created_at: string;
}

interface NotificationLifecycleResult {
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markMultipleAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getActiveNotifications: (notifications: Notification[]) => Notification[];
  getPriorityNotifications: (notifications: Notification[]) => Notification[];
  isExpired: (notification: Notification) => boolean;
  isPriority: (notification: Notification) => boolean;
  getRemainingPriorityTime: (notification: Notification) => number | null;
}

export function useNotificationLifecycle(): NotificationLifecycleResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.id]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (notificationIds: string[]) => {
    if (!user?.id || notificationIds.length === 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Mark all user's unread notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Check if a notification is expired
  const isExpired = useCallback((notification: Notification): boolean => {
    if (!notification.expires_at) return false;
    return new Date(notification.expires_at) < new Date();
  }, []);

  // Check if a notification has active priority
  const isPriority = useCallback((notification: Notification): boolean => {
    if (!notification.priority_until) return false;
    return new Date(notification.priority_until) > new Date();
  }, []);

  // Get remaining time in milliseconds for priority badge
  const getRemainingPriorityTime = useCallback((notification: Notification): number | null => {
    if (!notification.priority_until) return null;
    const remaining = new Date(notification.priority_until).getTime() - new Date().getTime();
    return remaining > 0 ? remaining : null;
  }, []);

  // Filter out expired notifications
  const getActiveNotifications = useCallback((notifications: Notification[]): Notification[] => {
    return notifications.filter(n => !isExpired(n));
  }, [isExpired]);

  // Get only priority notifications
  const getPriorityNotifications = useCallback((notifications: Notification[]): Notification[] => {
    return notifications.filter(n => isPriority(n) && !isExpired(n));
  }, [isPriority, isExpired]);

  return {
    isLoading,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    getActiveNotifications,
    getPriorityNotifications,
    isExpired,
    isPriority,
    getRemainingPriorityTime,
  };
}
