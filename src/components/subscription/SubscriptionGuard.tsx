import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { subscription, isLoading, isExpired, isInGracePeriod, getDaysRemaining } = useSubscription();
  const location = useLocation();

  // Allow access to subscription-related pages
  const allowedPaths = ['/subscription', '/auth', '/unauthorized'];
  if (allowedPaths.some(path => location.pathname.startsWith(path))) {
    return <>{children}</>;
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  // Check if expired (past grace period)
  if (isExpired()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Subscription Expired</CardTitle>
            <CardDescription>
              Your trial period and grace period have ended. Please subscribe to continue using the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => window.location.href = '/subscription'}>
              Choose a Plan
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/subscription/contact'}>
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show warning banner for grace period
  if (isInGracePeriod()) {
    const daysLeft = getDaysRemaining();
    return (
      <div className="min-h-screen">
        <div className="bg-warning/10 border-b border-warning px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-warning-foreground">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Your trial has ended. You have {daysLeft} days remaining in your grace period.
            </span>
          </div>
          <Button size="sm" onClick={() => window.location.href = '/subscription'}>
            Subscribe Now
          </Button>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
