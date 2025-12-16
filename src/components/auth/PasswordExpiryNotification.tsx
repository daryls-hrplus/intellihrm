import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";

interface PasswordMetadata {
  password_expires_at: string | null;
  expiry_notification_shown_at: string | null;
  is_first_login: boolean;
}

interface PasswordPolicy {
  password_expiry_days: number | null;
  expiry_warning_days: number | null;
  require_change_on_first_login: boolean;
}

export function PasswordExpiryNotification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    checkPasswordExpiry();
  }, [user]);

  const checkPasswordExpiry = async () => {
    if (!user) return;

    try {
      // Fetch password policy
      const { data: policyData } = await supabase
        .from('password_policies')
        .select('password_expiry_days, expiry_warning_days, require_change_on_first_login')
        .is('company_id', null)
        .single();

      if (!policyData) return;
      const policy = policyData as PasswordPolicy;

      // Fetch user's password metadata
      const { data: metadataData } = await supabase
        .from('user_password_metadata')
        .select('password_expires_at, expiry_notification_shown_at, is_first_login')
        .eq('user_id', user.id)
        .single();

      // If no metadata exists, create it
      if (!metadataData) {
        const expiresAt = policy.password_expiry_days 
          ? new Date(Date.now() + policy.password_expiry_days * 24 * 60 * 60 * 1000).toISOString()
          : null;
        
        await supabase
          .from('user_password_metadata')
          .insert({
            user_id: user.id,
            password_expires_at: expiresAt,
            is_first_login: true,
          });
        
        // Check first login requirement
        if (policy.require_change_on_first_login) {
          setIsFirstLogin(true);
          setShowDialog(true);
        }
        return;
      }

      const metadata = metadataData as PasswordMetadata;

      // Check if first login and policy requires password change
      if (metadata.is_first_login && policy.require_change_on_first_login) {
        setIsFirstLogin(true);
        setShowDialog(true);
        return;
      }

      // Check password expiry
      if (!metadata.password_expires_at || !policy.expiry_warning_days) return;

      const expiryDate = new Date(metadata.password_expires_at);
      const now = new Date();
      const days = differenceInDays(expiryDate, now);

      // Only show if within warning period
      if (days <= policy.expiry_warning_days && days > 0) {
        // Check if we already showed the notification today
        const today = new Date().toDateString();
        const lastShown = metadata.expiry_notification_shown_at 
          ? new Date(metadata.expiry_notification_shown_at).toDateString()
          : null;

        if (lastShown !== today) {
          setDaysUntilExpiry(days);
          setShowDialog(true);
          
          // Update notification shown timestamp
          await supabase
            .from('user_password_metadata')
            .update({ expiry_notification_shown_at: new Date().toISOString() })
            .eq('user_id', user.id);
        }
      } else if (days <= 0) {
        // Password has expired
        setDaysUntilExpiry(0);
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Error checking password expiry:', error);
    }
  };

  const handleChangePassword = () => {
    setShowDialog(false);
    navigate('/profile?tab=security');
  };

  const handleRemindLater = () => {
    setShowDialog(false);
  };

  if (!showDialog) return null;

  const isExpired = daysUntilExpiry === 0;
  const isUrgent = daysUntilExpiry !== null && daysUntilExpiry <= 3;

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${isExpired || isUrgent ? 'bg-destructive/10' : 'bg-warning/10'}`}>
              {isFirstLogin ? (
                <KeyRound className={`h-6 w-6 ${isExpired || isUrgent ? 'text-destructive' : 'text-warning'}`} />
              ) : (
                <AlertTriangle className={`h-6 w-6 ${isExpired || isUrgent ? 'text-destructive' : 'text-warning'}`} />
              )}
            </div>
            <AlertDialogTitle>
              {isFirstLogin 
                ? 'Welcome! Please Change Your Password'
                : isExpired 
                  ? 'Your Password Has Expired'
                  : 'Password Expiring Soon'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            {isFirstLogin ? (
              <p>
                For security reasons, you must change your password before continuing. 
                Please create a new password that meets the organization's security requirements.
              </p>
            ) : isExpired ? (
              <p>
                Your password has expired. You must change it now to continue using the system.
              </p>
            ) : (
              <>
                <p>
                  Your password will expire in <strong>{daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</strong>.
                </p>
                <p>
                  Please change your password soon to avoid being locked out of your account.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!isExpired && !isFirstLogin && (
            <AlertDialogCancel onClick={handleRemindLater}>
              Remind Me Later
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleChangePassword} className={isExpired || isUrgent ? 'bg-destructive hover:bg-destructive/90' : ''}>
            <KeyRound className="h-4 w-4 mr-2" />
            Change Password Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
