import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Users,
  Loader2,
  CheckCircle,
  Clock,
  Check,
  X
} from 'lucide-react';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'damaged'];

export default function MssPropertyPage() {
  const { t } = useLanguage();
  const { user, company } = useAuth();
  const [directReports, setDirectReports] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');

  const [assignForm, setAssignForm] = useState({
    property_id: '',
    employee_id: '',
    assigned_date: new Date().toISOString().split('T')[0],
    condition_at_assignment: 'good',
    notes: '',
  });

  const { 
    items,
    assignments, 
    requests,
    loadingAssignments, 
    loadingRequests,
    createAssignment,
    updateRequest
  } = usePropertyManagement(company?.id);

  const breadcrumbItems = [
    { label: t('navigation.mss'), path: '/mss' },
    { label: t('mss.teamProperty.title') },
  ];

  // Fetch direct reports
  useEffect(() => {
    if (user?.id) {
      supabase.rpc('get_manager_direct_reports', { p_manager_id: user.id })
        .then(({ data, error }) => {
          if (!error && data) {
            setDirectReports(data.map((d: any) => ({
              id: d.employee_id,
              full_name: d.employee_name,
              email: d.employee_email,
            })));
          }
        });
    }
  }, [user?.id]);

  const directReportIds = directReports.map(d => d.id);

  // Filter assignments and requests to direct reports only
  const teamAssignments = assignments.filter(a => 
    directReportIds.includes(a.employee_id) && a.status === 'active'
  );

  const teamRequests = requests.filter(r => 
    directReportIds.includes(r.employee_id)
  );

  const pendingRequests = teamRequests.filter(r => r.status === 'pending');
  const availableItems = items.filter(i => i.status === 'available');

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    await createAssignment.mutateAsync({
      property_id: assignForm.property_id,
      employee_id: assignForm.employee_id,
      assigned_by: user.id,
      assigned_date: assignForm.assigned_date,
      condition_at_assignment: assignForm.condition_at_assignment,
      notes: assignForm.notes || null,
      status: 'active',
    });

    setIsAssignDialogOpen(false);
    setAssignForm({
      property_id: '',
      employee_id: '',
      assigned_date: new Date().toISOString().split('T')[0],
      condition_at_assignment: 'good',
      notes: '',
    });
    toast.success('Property assigned successfully');
  };

  const handleReview = async () => {
    if (!selectedRequest || !user?.id) return;
    
    await updateRequest.mutateAsync({
      id: selectedRequest,
      status: reviewAction,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes || null,
    });

    setIsReviewDialogOpen(false);
    setSelectedRequest(null);
    setReviewNotes('');
    toast.success(`Request ${reviewAction}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'fulfilled': return 'bg-info/10 text-info border-info/20';
      default: return '';
    }
  };

  if (loadingAssignments || loadingRequests) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              {t('mss.teamProperty.title')}
            </h1>
            <p className="text-muted-foreground">{t('mss.teamProperty.subtitle')}</p>
          </div>
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={availableItems.length === 0 || directReports.length === 0}>
                <Plus className="h-4 w-4" />
                {t('mss.teamProperty.assignProperty')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('mss.teamProperty.assignPropertyTitle')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('mss.teamProperty.teamMember')} *</Label>
                  <Select 
                    value={assignForm.employee_id} 
                    onValueChange={(v) => setAssignForm({ ...assignForm, employee_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('mss.teamProperty.selectTeamMember')} />
                    </SelectTrigger>
                    <SelectContent>
                      {directReports.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('mss.teamProperty.asset')} *</Label>
                  <Select 
                    value={assignForm.property_id} 
                    onValueChange={(v) => setAssignForm({ ...assignForm, property_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('mss.teamProperty.selectAsset')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.asset_tag} - {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('mss.teamProperty.assignedDate')}</Label>
                    <Input
                      type="date"
                      value={assignForm.assigned_date}
                      onChange={(e) => setAssignForm({ ...assignForm, assigned_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('mss.teamProperty.condition')}</Label>
                    <Select 
                      value={assignForm.condition_at_assignment} 
                      onValueChange={(v) => setAssignForm({ ...assignForm, condition_at_assignment: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('mss.teamProperty.notes')}</Label>
                  <Textarea
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createAssignment.isPending}>
                    {createAssignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('mss.teamProperty.assign')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mss.teamProperty.directReports')}</p>
                  <p className="text-2xl font-bold">{directReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mss.teamProperty.teamAssignments')}</p>
                  <p className="text-2xl font-bold">{teamAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mss.teamProperty.pendingRequests')}</p>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments" className="gap-2">
              <Package className="h-4 w-4" />
              {t('mss.teamProperty.teamAssignments')}
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Clock className="h-4 w-4" />
              {t('mss.teamProperty.pendingRequests')} ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>{t('mss.teamProperty.teamPropertyAssignments')}</CardTitle>
                <CardDescription>{t('mss.teamProperty.propertyAssignedDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {teamAssignments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('mss.teamProperty.noPropertyAssigned')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.employee')}</TableHead>
                        <TableHead>{t('mss.teamProperty.asset')}</TableHead>
                        <TableHead>{t('mss.teamProperty.category')}</TableHead>
                        <TableHead>{t('mss.teamProperty.assignedDate')}</TableHead>
                        <TableHead>{t('mss.teamProperty.condition')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{assignment.employee?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{assignment.employee?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{assignment.property?.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {assignment.property?.asset_tag}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{assignment.property?.category?.name || '-'}</TableCell>
                          <TableCell>{format(new Date(assignment.assigned_date), 'PP')}</TableCell>
                          <TableCell className="capitalize">{assignment.condition_at_assignment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>{t('mss.teamProperty.pendingPropertyRequests')}</CardTitle>
                <CardDescription>{t('mss.teamProperty.reviewPropertyRequests')}</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('mss.teamProperty.noPendingRequests')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.employee')}</TableHead>
                        <TableHead>{t('common.name')}</TableHead>
                        <TableHead>{t('mss.teamProperty.type')}</TableHead>
                        <TableHead>{t('mss.teamProperty.priority')}</TableHead>
                        <TableHead>{t('mss.teamProperty.submitted')}</TableHead>
                        <TableHead>{t('mss.teamProperty.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.employee?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{request.employee?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.title}</p>
                              {request.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {request.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{request.request_type}</TableCell>
                          <TableCell className="capitalize">{request.priority}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(request.created_at), 'PP')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-success hover:text-success"
                                onClick={() => {
                                  setSelectedRequest(request.id);
                                  setReviewAction('approved');
                                  setIsReviewDialogOpen(true);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedRequest(request.id);
                                  setReviewAction('rejected');
                                  setIsReviewDialogOpen(true);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approved' ? t('mss.teamProperty.approve') : t('mss.teamProperty.reject')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('mss.teamProperty.reviewNotes')}</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={handleReview} 
                  disabled={updateRequest.isPending}
                  variant={reviewAction === 'rejected' ? 'destructive' : 'default'}
                >
                  {updateRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {reviewAction === 'approved' ? t('mss.teamProperty.approve') : t('mss.teamProperty.reject')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
