import { supabase } from "@/integrations/supabase/client";

type NotificationType = 'approved' | 'rejected' | 'info_required';

interface SendNotificationParams {
  notificationType: NotificationType;
  employeeId: string;
  requestId: string;
  requestType: string;
  changeAction: string;
  reviewerNotes?: string;
  reviewerName?: string;
}

export function useESSNotifications() {
  const sendNotification = async ({
    notificationType,
    employeeId,
    requestId,
    requestType,
    changeAction,
    reviewerNotes,
    reviewerName,
  }: SendNotificationParams): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-ess-notification', {
        body: {
          notification_type: notificationType,
          employee_id: employeeId,
          request_id: requestId,
          request_type: requestType,
          change_action: changeAction,
          reviewer_notes: reviewerNotes,
          reviewer_name: reviewerName,
        },
      });

      if (error) {
        console.error('Failed to send ESS notification:', error);
        return { success: false, error: error.message };
      }

      console.log('ESS notification sent successfully:', data);
      return { success: true };
    } catch (err) {
      console.error('Error sending ESS notification:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { sendNotification };
}