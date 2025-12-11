import { supabase } from "@/integrations/supabase/client";

interface SendNotificationParams {
  ticketId: string;
  notificationType: "assigned" | "reply" | "status_change";
  recipientEmail: string;
  recipientName?: string;
  ticketNumber: string;
  ticketSubject: string;
  message?: string;
  assigneeName?: string;
  newStatus?: string;
  replyContent?: string;
  replyAuthor?: string;
}

export const sendTicketNotification = async (params: SendNotificationParams) => {
  try {
    console.log("Sending ticket notification:", params.notificationType);
    const { data, error } = await supabase.functions.invoke("send-ticket-notification", {
      body: params,
    });
    
    if (error) {
      console.error("Error sending notification:", error);
      return { success: false, error };
    }
    
    console.log("Notification result:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception sending notification:", error);
    return { success: false, error };
  }
};
