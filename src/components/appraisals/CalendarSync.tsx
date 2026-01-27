import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  CalendarCheck, 
  ExternalLink, 
  RefreshCw, 
  Settings, 
  CheckCircle2,
  AlertCircle,
  Link2,
  Link2Off
} from "lucide-react";
import { toast } from "sonner";
import { AppraisalInterview } from "@/hooks/useAppraisalInterviews";
import { format } from "date-fns";

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  email?: string;
}

interface CalendarSyncProps {
  interviews?: AppraisalInterview[];
  onSync?: () => void;
}

export function CalendarSync({ interviews = [], onSync }: CalendarSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [sendInvites, setSendInvites] = useState(true);
  const [providers, setProviders] = useState<CalendarProvider[]>([
    {
      id: "google",
      name: "Google Calendar",
      icon: "🗓️",
      connected: false,
    },
    {
      id: "outlook",
      name: "Microsoft Outlook",
      icon: "📅",
      connected: false,
    },
    {
      id: "apple",
      name: "Apple Calendar",
      icon: "📆",
      connected: false,
    },
  ]);

  const handleConnect = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    // Simulate OAuth flow
    toast.info(`Connecting to ${provider.name}...`, {
      description: "This would open an OAuth popup in production",
    });

    // Simulate connection
    setTimeout(() => {
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { 
              ...p, 
              connected: true, 
              lastSync: new Date().toISOString(),
              email: `user@${providerId}.com`
            } 
          : p
      ));
      toast.success(`Connected to ${provider.name}!`);
    }, 1500);
  };

  const handleDisconnect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, connected: false, lastSync: undefined, email: undefined } 
        : p
    ));
    toast.success(`Disconnected from ${provider.name}`);
  };

  const handleSyncNow = async () => {
    const connectedProviders = providers.filter(p => p.connected);
    if (connectedProviders.length === 0) {
      toast.error("No calendar connected", {
        description: "Please connect a calendar provider first",
      });
      return;
    }

    setSyncing(true);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProviders(prev => prev.map(p => 
      p.connected ? { ...p, lastSync: new Date().toISOString() } : p
    ));
    
    setSyncing(false);
    toast.success("Calendars synced!", {
      description: `${interviews.length} interviews synced to your calendars`,
    });
    
    onSync?.();
  };

  const generateICSFile = () => {
    if (interviews.length === 0) {
      toast.error("No interviews to export");
      return;
    }

    // Generate ICS content
    const icsEvents = interviews.map(interview => {
      const startDate = new Date(interview.scheduled_at);
      const endDate = new Date(startDate.getTime() + (interview.duration_minutes || 60) * 60000);
      
      return `BEGIN:VEVENT
DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}
SUMMARY:Appraisal Interview - ${interview.participant?.employee?.full_name || 'TBD'}
DESCRIPTION:${interview.agenda || 'Performance appraisal interview'}
LOCATION:${interview.location || 'To be determined'}
STATUS:${interview.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}
END:VEVENT`;
    }).join('\n');

const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IntelliHRM//Appraisal Interviews//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${icsEvents}
END:VCALENDAR`;

    // Download file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appraisal-interviews.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Calendar file downloaded!", {
      description: "Import this file into your calendar application",
    });
  };

  const connectedCount = providers.filter(p => p.connected).length;
  const upcomingInterviews = interviews.filter(
    i => new Date(i.scheduled_at) > new Date() && i.status !== 'cancelled'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Calendar Sync
            </CardTitle>
            <CardDescription>
              Sync appraisal interviews with your calendar
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {connectedCount > 0 && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {connectedCount} Connected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{upcomingInterviews.length}</div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-600">
              {interviews.filter(i => i.status === 'confirmed').length}
            </div>
            <div className="text-xs text-muted-foreground">Confirmed</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-blue-600">
              {connectedCount}
            </div>
            <div className="text-xs text-muted-foreground">Calendars</div>
          </div>
        </div>

        <Separator />

        {/* Calendar Providers */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Calendar Providers</Label>
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{provider.icon}</span>
                <div>
                  <div className="font-medium">{provider.name}</div>
                  {provider.connected ? (
                    <div className="text-xs text-muted-foreground">
                      {provider.email} • Last synced: {provider.lastSync ? format(new Date(provider.lastSync), 'MMM d, h:mm a') : 'Never'}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Not connected</div>
                  )}
                </div>
              </div>
              {provider.connected ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">
                    <Link2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(provider.id)}
                  >
                    <Link2Off className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnect(provider.id)}
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Sync Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Sync Settings</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Auto-sync interviews</Label>
              <p className="text-xs text-muted-foreground">
                Automatically sync new interviews to connected calendars
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="send-invites">Send calendar invites</Label>
              <p className="text-xs text-muted-foreground">
                Send calendar invitations to participants
              </p>
            </div>
            <Switch
              id="send-invites"
              checked={sendInvites}
              onCheckedChange={setSendInvites}
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSyncNow}
            disabled={syncing || connectedCount === 0}
            className="w-full"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={generateICSFile}
            disabled={interviews.length === 0}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Download .ICS File
          </Button>
        </div>

        {connectedCount === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect a calendar provider to automatically sync your appraisal interviews.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
