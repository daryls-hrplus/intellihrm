import { NavLink } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Sparkles } from 'lucide-react';

export function TrialBanner() {
  const { subscription, getDaysRemaining, isInGracePeriod } = useSubscription();

  // Don't show if no subscription, active subscription, or expired
  if (!subscription) return null;
  if (subscription.status === 'active') return null;
  if (subscription.status === 'expired' || subscription.status === 'cancelled') return null;

  const daysRemaining = getDaysRemaining();
  const isGrace = isInGracePeriod();

  if (subscription.status === 'trial') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          Trial: {daysRemaining} days left
        </span>
        <NavLink to="/subscription">
          <Button size="sm" variant="default" className="h-7 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </NavLink>
      </div>
    );
  }

  if (isGrace) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="text-sm font-medium text-warning-foreground">
          Grace Period: {daysRemaining} days
        </span>
        <NavLink to="/subscription">
          <Button size="sm" variant="destructive" className="h-7 text-xs">
            Subscribe Now
          </Button>
        </NavLink>
      </div>
    );
  }

  return null;
}
