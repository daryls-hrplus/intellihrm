import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
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
  AlertTriangle,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDateForDisplay } from '@/utils/dateUtils';

const REQUEST_TYPES = ['new', 'replacement', 'upgrade', 'repair'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function MyPropertyPage() {
  const { t } = useLanguage();
  const { user, company } = useAuth();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [reportType, setReportType] = useState<'lost' | 'damaged'>('damaged');
  const [reportNotes, setReportNotes] = useState('');

  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    request_type: 'new',
    category_id: '',
    priority: 'medium',
    justification: '',
  });

  const { 
    assignments, 
    categories,
    requests,
    loadingAssignments, 
    loadingRequests,
    createRequest,
    updateItem
  } = usePropertyManagement(company?.id);

  const breadcrumbItems = [
    { label: t('ess.title'), href: '/ess' },
    { label: t('ess.myProperty.breadcrumb') },
  ];

  // Filter to only show current user's assignments
  const myAssignments = assignments.filter(a => 
    a.employee_id === user?.id && a.status === 'active'
  );

  const myRequests = requests.filter(r => r.employee_id === user?.id);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !company?.id) return;

    await createRequest.mutateAsync({
      employee_id: user.id,
      company_id: company.id,
      title: requestForm.title,
      description: requestForm.description || null,
      request_type: requestForm.request_type,
      category_id: requestForm.category_id || null,
      priority: requestForm.priority,
      justification: requestForm.justification || null,
      status: 'pending',
    });

    setIsRequestDialogOpen(false);
    setRequestForm({
      title: '',
      description: '',
      request_type: 'new',
      category_id: '',
      priority: 'medium',
      justification: '',
    });
    toast.success(t('ess.myProperty.toast.requestSubmitted'));
  };

  const handleReportIssue = async () => {
    if (!selectedItemId) return;

    await updateItem.mutateAsync({
      id: selectedItemId,
      status: reportType,
      notes: reportNotes,
    });

    setIsReportDialogOpen(false);
    setSelectedItemId('');
    setReportNotes('');
    toast.success(t('ess.myProperty.toast.itemReported', { type: reportType }));
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
              {t('ess.myProperty.title')}
            </h1>
            <p className="text-muted-foreground">{t('ess.myProperty.subtitle')}</p>
          </div>
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('ess.myProperty.requestProperty')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('ess.myProperty.requestProperty')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={requestForm.title}
                    onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                    placeholder="e.g., Laptop for development work"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Request Type</Label>
                    <Select 
                      value={requestForm.request_type} 
                      onValueChange={(v) => setRequestForm({ ...requestForm, request_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REQUEST_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={requestForm.priority} 
                      onValueChange={(v) => setRequestForm({ ...requestForm, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={requestForm.category_id} 
                    onValueChange={(v) => setRequestForm({ ...requestForm, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    placeholder="Describe what you need..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Justification</Label>
                  <Textarea
                    value={requestForm.justification}
                    onChange={(e) => setRequestForm({ ...requestForm, justification: e.target.value })}
                    placeholder="Why do you need this?"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRequest.isPending}>
                    {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="assigned" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assigned" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Assigned to Me ({myAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Clock className="h-4 w-4" />
              My Requests ({myRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Property</CardTitle>
                <CardDescription>Equipment and assets currently assigned to you</CardDescription>
              </CardHeader>
              <CardContent>
                {myAssignments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No property currently assigned to you</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Assigned Date</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{assignment.property?.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {assignment.property?.asset_tag}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{assignment.property?.category?.name || '-'}</TableCell>
                          <TableCell>{formatDateForDisplay(assignment.assigned_date, 'PP')}</TableCell>
                          <TableCell>{assignment.condition_at_assignment}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setSelectedItemId(assignment.property_id);
                                setIsReportDialogOpen(true);
                              }}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              Report Issue
                            </Button>
                          </TableCell>
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
                <CardTitle>My Property Requests</CardTitle>
                <CardDescription>Track the status of your property requests</CardDescription>
              </CardHeader>
              <CardContent>
                {myRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No property requests yet</p>
                    <p className="text-sm">Click "Request Property" to submit a new request</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRequests.map((request) => (
                        <TableRow key={request.id}>
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
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateForDisplay(request.created_at, 'PP')}
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

        {/* Report Issue Dialog */}
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Property Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select value={reportType} onValueChange={(v: 'lost' | 'damaged') => setReportType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Describe what happened..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReportIssue}
                  disabled={updateItem.isPending}
                >
                  {updateItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Report Issue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
