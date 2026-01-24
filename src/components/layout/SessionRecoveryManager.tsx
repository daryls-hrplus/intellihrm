import { useSessionRecovery } from "@/hooks/useSessionRecovery";

/**
 * Component that manages session recovery detection and notifications.
 * 
 * Should be placed inside TabProvider to access tab context.
 * Handles:
 * - Detection of restored sessions
 * - Display of recovery notifications
 * - Periodic session metadata saves
 */
export function SessionRecoveryManager() {
  // Initialize session recovery tracking
  useSessionRecovery();
  
  // This component doesn't render anything visible
  return null;
}
