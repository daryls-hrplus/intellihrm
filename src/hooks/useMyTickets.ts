import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MyTicketCounts {
  open: number;
  inProgress: number;
  pending: number;
  total: number;
}

export function useMyTickets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-tickets", user?.id],
    queryFn: async (): Promise<MyTicketCounts> => {
      if (!user?.id) {
        return { open: 0, inProgress: 0, pending: 0, total: 0 };
      }

      const { data, error } = await supabase
        .from("tickets")
        .select("status")
        .eq("requester_id", user.id)
        .in("status", ["open", "in_progress", "pending"]);

      if (error) throw error;

      const counts = {
        open: 0,
        inProgress: 0,
        pending: 0,
        total: 0,
      };

      data?.forEach((ticket) => {
        counts.total++;
        if (ticket.status === "open") counts.open++;
        else if (ticket.status === "in_progress") counts.inProgress++;
        else if (ticket.status === "pending") counts.pending++;
      });

      return counts;
    },
    enabled: !!user?.id,
  });
}
