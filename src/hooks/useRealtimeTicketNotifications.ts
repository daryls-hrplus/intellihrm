import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TicketPayload {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  assignee_id: string | null;
  requester_id: string;
}

interface NotificationPreferences {
  ticket_assigned: boolean;
  ticket_status_changed: boolean;
  ticket_comment_added: boolean;
}

// Helper to create a notification in the database
async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type,
    link,
  });
}

// Helper to fetch user preferences
async function getUserPreferences(userId: string): Promise<NotificationPreferences> {
  const { data } = await supabase
    .from('notification_preferences')
    .select('ticket_assigned, ticket_status_changed, ticket_comment_added')
    .eq('user_id', userId)
    .single();

  // Default to all enabled if no preferences set
  return {
    ticket_assigned: data?.ticket_assigned ?? true,
    ticket_status_changed: data?.ticket_status_changed ?? true,
    ticket_comment_added: data?.ticket_comment_added ?? true,
  };
}

export function useRealtimeTicketNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const preferencesRef = useRef<NotificationPreferences>({
    ticket_assigned: true,
    ticket_status_changed: true,
    ticket_comment_added: true,
  });

  // Fetch and cache preferences
  useEffect(() => {
    if (userId) {
      getUserPreferences(userId).then(prefs => {
        preferencesRef.current = prefs;
      });
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to ticket changes
    const ticketChannel = supabase
      .channel('user-ticket-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets'
        },
        async (payload) => {
          const newTicket = payload.new as TicketPayload;
          const oldTicket = payload.old as TicketPayload;
          
          // Check if this ticket is relevant to the current user
          const isAssignedToMe = newTicket.assignee_id === userId;
          const wasAssignedToMe = oldTicket.assignee_id === userId;
          const isMyTicket = newTicket.requester_id === userId;
          
          // Assignment notification
          if (isAssignedToMe && !wasAssignedToMe && preferencesRef.current.ticket_assigned) {
            await createNotification(
              userId,
              "Ticket assigned to you",
              `#${newTicket.ticket_number}: ${newTicket.subject}`,
              "ticket_assigned",
              `/help/tickets/${newTicket.id}`
            );
            
            toast.info("Ticket assigned to you", {
              description: `#${newTicket.ticket_number}: ${newTicket.subject}`,
              action: {
                label: "View",
                onClick: () => window.location.href = `/help/tickets/${newTicket.id}`,
              },
            });
          }
          
          // Status change notification for requester
          if (isMyTicket && oldTicket.status !== newTicket.status && preferencesRef.current.ticket_status_changed) {
            const statusLabels: Record<string, string> = {
              open: "Open",
              in_progress: "In Progress",
              pending: "Pending",
              resolved: "Resolved",
              closed: "Closed",
            };
            
            await createNotification(
              userId,
              "Ticket status updated",
              `#${newTicket.ticket_number} is now ${statusLabels[newTicket.status] || newTicket.status}`,
              "ticket_status",
              `/help/tickets/${newTicket.id}`
            );
            
            toast.info("Ticket status updated", {
              description: `#${newTicket.ticket_number} is now ${statusLabels[newTicket.status] || newTicket.status}`,
              action: {
                label: "View",
                onClick: () => window.location.href = `/help/tickets/${newTicket.id}`,
              },
            });
          }
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
          queryClient.invalidateQueries({ queryKey: ["ticket-detail"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets'
        },
        async (payload) => {
          const newTicket = payload.new as TicketPayload;
          
          // Notify if assigned to current user on creation
          if (newTicket.assignee_id === userId && preferencesRef.current.ticket_assigned) {
            await createNotification(
              userId,
              "New ticket assigned to you",
              `#${newTicket.ticket_number}: ${newTicket.subject}`,
              "ticket_assigned",
              `/help/tickets/${newTicket.id}`
            );
            
            toast.info("New ticket assigned to you", {
              description: `#${newTicket.ticket_number}: ${newTicket.subject}`,
              action: {
                label: "View",
                onClick: () => window.location.href = `/help/tickets/${newTicket.id}`,
              },
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
        }
      )
      .subscribe();

    // Subscribe to comment notifications
    const commentChannel = supabase
      .channel('user-comment-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_comments'
        },
        async (payload) => {
          const comment = payload.new as {
            ticket_id: string;
            author_id: string;
            is_internal: boolean;
          };
          
          // Don't notify for own comments, internal comments, or if preference disabled
          if (comment.author_id === userId || comment.is_internal || !preferencesRef.current.ticket_comment_added) return;
          
          // Fetch ticket details to check if user should be notified
          const { data: ticket } = await supabase
            .from('tickets')
            .select('id, ticket_number, subject, requester_id, assignee_id')
            .eq('id', comment.ticket_id)
            .single();
          
          if (!ticket) return;
          
          const isMyTicket = ticket.requester_id === userId;
          const isAssignedToMe = ticket.assignee_id === userId;
          
          if (isMyTicket || isAssignedToMe) {
            await createNotification(
              userId,
              "New reply on ticket",
              `#${ticket.ticket_number}: ${ticket.subject}`,
              "ticket_reply",
              `/help/tickets/${ticket.id}`
            );
            
            toast.info("New reply on ticket", {
              description: `#${ticket.ticket_number}: ${ticket.subject}`,
              action: {
                label: "View",
                onClick: () => window.location.href = `/help/tickets/${ticket.id}`,
              },
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ["ticket-comments"] });
          queryClient.invalidateQueries({ queryKey: ["ticket-detail"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(commentChannel);
    };
  }, [userId, queryClient]);
}
