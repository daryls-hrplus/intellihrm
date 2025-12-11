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

export function useRealtimeTicketNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const previousTicketsRef = useRef<Map<string, TicketPayload>>(new Map());

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
          if (isAssignedToMe && !wasAssignedToMe) {
            toast.info("Ticket assigned to you", {
              description: `#${newTicket.ticket_number}: ${newTicket.subject}`,
              action: {
                label: "View",
                onClick: () => window.location.href = `/help/tickets/${newTicket.id}`,
              },
            });
          }
          
          // Status change notification for requester
          if (isMyTicket && oldTicket.status !== newTicket.status) {
            const statusLabels: Record<string, string> = {
              open: "Open",
              in_progress: "In Progress",
              pending: "Pending",
              resolved: "Resolved",
              closed: "Closed",
            };
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
          if (newTicket.assignee_id === userId) {
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
          
          // Don't notify for own comments or internal comments
          if (comment.author_id === userId || comment.is_internal) return;
          
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
