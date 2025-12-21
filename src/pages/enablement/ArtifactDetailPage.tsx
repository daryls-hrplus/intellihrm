import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Edit, Send, CheckCircle, Globe, Archive, 
  Clock, User, FileText, Lightbulb, AlertTriangle, History
} from 'lucide-react';
import { useEnablementArtifacts, useArtifact } from '@/hooks/useEnablementArtifacts';
import { ArtifactStatusBadge } from '@/components/enablement/artifacts/ArtifactStatusBadge';
import { format } from 'date-fns';
import type { ArtifactStatus } from '@/types/artifact';

export default function ArtifactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { artifact, approvalHistory, isLoading, fetchArtifact } = useArtifact(id);
  const { submitForReview, approveArtifact, publishArtifact, deprecateArtifact, deleteArtifact } = useEnablementArtifacts();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeprecateDialog, setShowDeprecateDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [deprecationReason, setDeprecationReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchArtifact();
    }
  }, [id, fetchArtifact]);

  const handleAction = async (action: 'submit' | 'approve' | 'publish' | 'deprecate' | 'delete') => {
    if (!id) return;

    let success = false;
    switch (action) {
      case 'submit':
        success = await submitForReview(id);
        break;
      case 'approve':
        success = await approveArtifact(id, approvalNotes);
        setShowApproveDialog(false);
        setApprovalNotes('');
        break;
      case 'publish':
        success = await publishArtifact(id);
        break;
      case 'deprecate':
        success = await deprecateArtifact(id, deprecationReason);
        setShowDeprecateDialog(false);
        setDeprecationReason('');
        break;
      case 'delete':
        success = await deleteArtifact(id);
        if (success) {
          navigate('/enablement/artifacts');
          return;
        }
        break;
    }

    if (success) {
      fetchArtifact();
    }
  };

  const getAvailableActions = (status: ArtifactStatus) => {
    switch (status) {
      case 'draft':
        return [
          { label: 'Submit for Review', icon: Send, action: 'submit' as const, variant: 'default' as const }
        ];
      case 'in_review':
        return [
          { label: 'Approve', icon: CheckCircle, action: 'approve' as const, variant: 'default' as const }
        ];
      case 'approved':
        return [
          { label: 'Publish', icon: Globe, action: 'publish' as const, variant: 'default' as const }
        ];
      case 'published':
        return [
          { label: 'Deprecate', icon: Archive, action: 'deprecate' as const, variant: 'destructive' as const }
        ];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Artifact not found</h3>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/enablement/artifacts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Artifacts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const actions = getAvailableActions(artifact.status);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/enablement/artifacts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ArtifactStatusBadge status={artifact.status} />
              <Badge variant="outline">{artifact.content_level}</Badge>
              <span className="text-sm text-muted-foreground">v{artifact.version_number}</span>
            </div>
            <h1 className="text-2xl font-bold">{artifact.title}</h1>
            <p className="text-muted-foreground">{artifact.artifact_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {artifact.status === 'draft' && (
            <Button variant="outline" onClick={() => navigate(`/enablement/artifacts/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {actions.map((action) => (
            <Button
              key={action.action}
              variant={action.variant}
              onClick={() => {
                if (action.action === 'approve') setShowApproveDialog(true);
                else if (action.action === 'deprecate') setShowDeprecateDialog(true);
                else handleAction(action.action);
              }}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="steps">Steps ({artifact.steps?.length || 0})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {artifact.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{artifact.description}</p>
                  </CardContent>
                </Card>
              )}

              {artifact.learning_objective && artifact.learning_objective.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Objectives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {artifact.learning_objective.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {artifact.preconditions && artifact.preconditions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preconditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {artifact.preconditions.map((pre, i) => (
                        <li key={i}>{pre}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {artifact.expected_outcomes && artifact.expected_outcomes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Expected Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {artifact.expected_outcomes.map((outcome, i) => (
                        <li key={i}>{outcome}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Module</span>
                    <p className="font-medium">{artifact.module?.module_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Feature</span>
                    <p className="font-medium">{artifact.feature?.feature_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Product Version</span>
                    <p className="font-medium">{artifact.product_version}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">Target Roles</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {artifact.role_scope.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                      ))}
                    </div>
                  </div>
                  {artifact.tags && artifact.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground">Tags</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {artifact.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created</span>
                    <span className="ml-auto">{format(new Date(artifact.created_at), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Updated</span>
                    <span className="ml-auto">{format(new Date(artifact.updated_at), 'PPP')}</span>
                  </div>
                  {artifact.submitted_at && (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Submitted</span>
                      <span className="ml-auto">{format(new Date(artifact.submitted_at), 'PPP')}</span>
                    </div>
                  )}
                  {artifact.approved_at && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Approved</span>
                      <span className="ml-auto">{format(new Date(artifact.approved_at), 'PPP')}</span>
                    </div>
                  )}
                  {artifact.published_at && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Published</span>
                      <span className="ml-auto">{format(new Date(artifact.published_at), 'PPP')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <CardTitle>Instructional Steps</CardTitle>
              <CardDescription>
                {artifact.steps?.length || 0} step{artifact.steps?.length !== 1 ? 's' : ''} in this artifact
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!artifact.steps || artifact.steps.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No steps defined</p>
              ) : (
                <div className="space-y-4">
                  {artifact.steps.map((step, index) => (
                    <div key={step.id || index} className="flex gap-4 p-4 rounded-lg border">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                        {step.order}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium">{step.title || `Step ${step.order}`}</h4>
                        <p className="text-muted-foreground">{step.description}</p>
                        
                        {step.ui_route && (
                          <div className="text-xs text-muted-foreground">
                            <code className="bg-muted px-2 py-1 rounded">{step.ui_route}</code>
                          </div>
                        )}

                        {step.tips && step.tips.length > 0 && (
                          <div className="space-y-1">
                            {step.tips.filter(t => t).map((tip, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                                <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {step.warnings && step.warnings.length > 0 && (
                          <div className="space-y-1">
                            {step.warnings.filter(w => w).map((warning, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-2 rounded">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>Track of all status changes and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              {approvalHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No history available</p>
              ) : (
                <div className="space-y-4">
                  {approvalHistory.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <History className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{entry.action}</Badge>
                          {entry.from_status && entry.to_status && (
                            <span className="text-sm text-muted-foreground">
                              {entry.from_status} → {entry.to_status}
                            </span>
                          )}
                        </div>
                        {entry.comments && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.comments}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(entry.created_at), 'PPP p')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Artifact</DialogTitle>
            <DialogDescription>Add optional notes for this approval</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Approval notes (optional)..."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button onClick={() => handleAction('approve')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deprecate Dialog */}
      <Dialog open={showDeprecateDialog} onOpenChange={setShowDeprecateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deprecate Artifact</DialogTitle>
            <DialogDescription>Please provide a reason for deprecating this artifact</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for deprecation..."
            value={deprecationReason}
            onChange={(e) => setDeprecationReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeprecateDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleAction('deprecate')} disabled={!deprecationReason.trim()}>
              <Archive className="h-4 w-4 mr-2" />
              Deprecate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
