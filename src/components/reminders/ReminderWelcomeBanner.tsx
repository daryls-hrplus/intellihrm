import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Bell, Settings, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

interface ReminderWelcomeBannerProps {
  onGetStarted?: () => void;
  onViewAI?: () => void;
}

const STORAGE_KEY = 'reminder-welcome-dismissed';

export function ReminderWelcomeBanner({ onGetStarted, onViewAI }: ReminderWelcomeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardContent className="pt-6 pb-5">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Welcome Text */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Welcome to Reminder Management</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Stay ahead of critical dates with automated reminders. Set up rules to notify employees, 
              managers, and HR about important events like contract renewals, license expirations, 
              probation reviews, and more.
            </p>
          </div>

          {/* Right: Quick Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-auto">
            <div className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
              <Settings className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Automatic Rules</p>
                <p className="text-xs text-muted-foreground">Set once, remind always</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">AI Insights</p>
                <p className="text-xs text-muted-foreground">Smart recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
              <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email Templates</p>
                <p className="text-xs text-muted-foreground">Customizable messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
          <Button size="sm" onClick={onGetStarted} className="gap-1">
            Get Started
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onViewAI} className="gap-1">
            <Sparkles className="h-4 w-4" />
            View AI Insights
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDismiss}
            className="ml-auto text-muted-foreground"
          >
            Don't show again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
