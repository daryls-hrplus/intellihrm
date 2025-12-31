import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  TrendingDown,
  Eye,
  EyeOff,
  CheckCircle,
  FileText,
  Shield,
  User
} from 'lucide-react';
import { useManagerHRFlags, ManagerHRFlag } from '@/hooks/performance/useManagerHRFlags';
import { useAuth } from '@/contexts/AuthContext';

interface ManagerHRFlagsPanelProps {
  companyId: string;
  managerId?: string;
}

const FLAG_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  poor_timeliness: { icon: <Clock className="h-4 w-4" />, label: 'Timeliness', color: 'bg-orange-100 text-orange-800' },
  chronic_lateness: { icon: <Clock className="h-4 w-4" />, label: 'Chronic Lateness', color: 'bg-red-100 text-red-800' },
  low_comment_quality: { icon: <MessageSquare className="h-4 w-4" />, label: 'Comment Quality', color: 'bg-yellow-100 text-yellow-800' },
  superficial_comments: { icon: <MessageSquare className="h-4 w-4" />, label: 'Superficial Comments', color: 'bg-orange-100 text-orange-800' },
  extreme_leniency: { icon: <TrendingDown className="h-4 w-4" />, label: 'Leniency Bias', color: 'bg-blue-100 text-blue-800' },
  extreme_severity: { icon: <TrendingDown className="h-4 w-4" />, label: 'Severity Bias', color: 'bg-purple-100 text-purple-800' },
  calibration_drift: { icon: <AlertTriangle className="h-4 w-4" />, label: 'Calibration Drift', color: 'bg-amber-100 text-amber-800' },
  consistent_inflation: { icon: <TrendingDown className="h-4 w-4" />, label: 'Score Inflation', color: 'bg-red-100 text-red-800' },
  training_needed: { icon: <User className="h-4 w-4" />, label: 'Training Needed', color: 'bg-indigo-100 text-indigo-800' },
};

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
};

export function ManagerHRFlagsPanel({ companyId, managerId }: ManagerHRFlagsPanelProps) {
  const { user } = useAuth();
  const { loading, flags, fetchFlags, acknowledgeFlag, resolveFlag, toggleManagerVisibility } = useManagerHRFlags();
  const [selectedFlag, setSelectedFlag] = useState<ManagerHRFlag | null>(null);
  const [actionPlan, setActionPlan] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showAcknowledgeDialog, setShowAcknowledgeDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    fetchFlags(companyId, managerId, showResolved);
  }, [companyId, managerId, showResolved]);

  const handleAcknowledge = async () => {
    if (!selectedFlag || !user?.id) return;
    await acknowledgeFlag(selectedFlag.id, actionPlan, user.id);
    setShowAcknowledgeDialog(false);
    setActionPlan('');
    setSelectedFlag(null);
  };

  const handleResolve = async () => {
    if (!selectedFlag || !user?.id) return;
    await resolveFlag(selectedFlag.id, resolutionNotes, user.id);
    setShowResolveDialog(false);
    setResolutionNotes('');
    setSelectedFlag(null);
  };

  const handleToggleVisibility = async (flag: ManagerHRFlag) => {
    if (!user?.id) return;
    await toggleManagerVisibility(flag.id, !flag.isVisibleToManager, user.id);
  };

  const groupedFlags = flags.reduce((acc, flag) => {
    const severity = flag.flagSeverity;
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(flag);
    return acc;
  }, {} as Record<string, ManagerHRFlag[]>);

  const severityOrder = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">HR-Only Manager Flags</h3>
          <p className="text-sm text-muted-foreground">
            Private flags for HR visibility only. Toggle visibility to share with managers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-resolved"
            checked={showResolved}
            onCheckedChange={setShowResolved}
          />
          <Label htmlFor="show-resolved" className="text-sm">Show resolved</Label>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : flags.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="text-muted-foreground">No active flags</p>
            <p className="text-sm text-muted-foreground">All managers are within acceptable thresholds</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {severityOrder.map(severity => {
            const severityFlags = groupedFlags[severity];
            if (!severityFlags?.length) return null;

            return (
              <div key={severity} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={SEVERITY_CONFIG[severity].color}>
                    {SEVERITY_CONFIG[severity].label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {severityFlags.length} flag{severityFlags.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {severityFlags.map(flag => {
                  const typeConfig = FLAG_TYPE_CONFIG[flag.flagType] || {
                    icon: <AlertTriangle className="h-4 w-4" />,
                    label: flag.flagType,
                    color: 'bg-gray-100 text-gray-800',
                  };

                  return (
                    <Card key={flag.id} className={flag.isResolved ? 'opacity-60' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={typeConfig.color}>
                              {typeConfig.icon}
                              <span className="ml-1">{typeConfig.label}</span>
                            </Badge>
                            {flag.humanReviewRequired && !flag.humanReviewedBy && (
                              <Badge variant="outline" className="text-xs">
                                Pending Review
                              </Badge>
                            )}
                            {flag.isResolved && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleVisibility(flag)}
                              title={flag.isVisibleToManager ? 'Hide from manager' : 'Show to manager'}
                            >
                              {flag.isVisibleToManager ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-base">{flag.flagTitle}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {flag.managerName || 'Unknown Manager'}
                          <span>•</span>
                          {flag.affectedEmployeesCount} employee{flag.affectedEmployeesCount !== 1 ? 's' : ''} affected
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{flag.flagDescription}</p>
                        
                        {flag.isAcknowledged && flag.actionPlan && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-xs font-medium mb-1">Action Plan:</p>
                            <p className="text-sm">{flag.actionPlan}</p>
                          </div>
                        )}

                        {!flag.isResolved && (
                          <div className="flex gap-2 pt-2">
                            {!flag.isAcknowledged && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedFlag(flag);
                                  setShowAcknowledgeDialog(true);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedFlag(flag);
                                setShowResolveDialog(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Acknowledge Dialog */}
      <Dialog open={showAcknowledgeDialog} onOpenChange={setShowAcknowledgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Flag</DialogTitle>
            <DialogDescription>
              Document the action plan to address this flag. This will be recorded for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Action Plan</Label>
              <Textarea
                placeholder="Describe the steps that will be taken to address this issue..."
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcknowledgeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcknowledge} disabled={!actionPlan.trim()}>
              Acknowledge & Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Flag</DialogTitle>
            <DialogDescription>
              Document the resolution of this flag. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Describe how this issue was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolutionNotes.trim()}>
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
