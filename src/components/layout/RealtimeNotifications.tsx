import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeTicketNotifications } from "@/hooks/useRealtimeTicketNotifications";

export function RealtimeNotifications() {
  const { user } = useAuth();
  
  // Initialize real-time ticket notifications
  useRealtimeTicketNotifications(user?.id);
  
  // This component doesn't render anything visible
  return null;
}
