import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Eye, Send, FileCheck, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface OfferManagementTabProps {
  companyId: string;
}

export function OfferManagementTab({ companyId }: OfferManagementTabProps) {
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [formData, setFormData] = useState({
    application_id: '',
    position_title: '',
    department: '',
    base_salary: '',
    currency: 'USD',
    bonus_amount: '',
    bonus_type: '',
    benefits_summary: '',
    start_date: '',
    expiry_date: ''
  });

  useEffect(() => {
    if (companyId) {
      fetchOffers();
      fetchApplications();
    }
  }, [companyId]);

  const fetchOffers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('recruitment_offers')
      .select('*, applications(*, candidates(first_name, last_name, email))')
      .order('created_at', { ascending: false });
    setOffers(data || []);
    setLoading(false);
  };

  const fetchApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*, candidates(first_name, last_name), job_requisitions!inner(company_id, title)')
      .eq('job_requisitions.company_id', companyId)
      .in('status', ['active', 'shortlisted']);
    setApplications(data || []);
  };

  const handleSave = async () => {
    if (!formData.application_id || !formData.position_title) {
      toast.error('Application and position title are required');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      application_id: formData.application_id,
      position_title: formData.position_title,
      department: formData.department || null,
      base_salary: formData.base_salary ? parseFloat(formData.base_salary) : null,
      currency: formData.currency,
      bonus_amount: formData.bonus_amount ? parseFloat(formData.bonus_amount) : null,
      bonus_type: formData.bonus_type || null,
      benefits_summary: formData.benefits_summary || null,
      start_date: formData.start_date || null,
      expiry_date: formData.expiry_date || null,
      created_by: user?.id
    };

    if (editingOffer) {
      const { error } = await supabase.from('recruitment_offers').update(payload).eq('id', editingOffer.id);
      if (error) toast.error('Failed to update offer');
      else toast.success('Offer updated');
    } else {
      const { error } = await supabase.from('recruitment_offers').insert(payload);
      if (error) toast.error('Failed to create offer');
      else toast.success('Offer created');
    }
    setDialogOpen(false);
    setEditingOffer(null);
    resetForm();
    fetchOffers();
  };

  const resetForm = () => {
    setFormData({
      application_id: '',
      position_title: '',
      department: '',
      base_salary: '',
      currency: 'USD',
      bonus_amount: '',
      bonus_type: '',
      benefits_summary: '',
      start_date: '',
      expiry_date: ''
    });
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === 'sent') updates.sent_at = new Date().toISOString();
    if (status === 'accepted' || status === 'declined') updates.responded_at = new Date().toISOString();
    
    const { error } = await supabase.from('recruitment_offers').update(updates).eq('id', id);
    if (error) toast.error('Failed to update status');
    else {
      toast.success('Status updated');
      fetchOffers();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'sent': case 'approved': return 'secondary';
      case 'declined': case 'withdrawn': return 'destructive';
      case 'negotiating': return 'outline';
      default: return 'outline';
    }
  };

  const stats = {
    total: offers.length,
    pending: offers.filter(o => ['draft', 'pending_approval'].includes(o.status)).length,
    sent: offers.filter(o => o.status === 'sent').length,
    accepted: offers.filter(o => o.status === 'accepted').length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Offers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.sent}</div>
                <div className="text-sm text-muted-foreground">Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.accepted}</div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Offers</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingOffer(null); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" /> Create Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingOffer ? 'Edit' : 'Create'} Offer</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Application *</Label>
                  <Select value={formData.application_id} onValueChange={(v) => {
                    const app = applications.find(a => a.id === v);
                    setFormData({ 
                      ...formData, 
                      application_id: v,
                      position_title: app?.job_requisitions?.title || ''
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.candidates?.first_name} {app.candidates?.last_name} - {app.job_requisitions?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Position Title *</Label>
                  <Input value={formData.position_title} onChange={(e) => setFormData({ ...formData, position_title: e.target.value })} />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                </div>
                <div>
                  <Label>Base Salary</Label>
                  <Input type="number" value={formData.base_salary} onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })} />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bonus Amount</Label>
                  <Input type="number" value={formData.bonus_amount} onChange={(e) => setFormData({ ...formData, bonus_amount: e.target.value })} />
                </div>
                <div>
                  <Label>Bonus Type</Label>
                  <Select value={formData.bonus_type} onValueChange={(v) => setFormData({ ...formData, bonus_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signing">Signing</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Benefits Summary</Label>
                  <Textarea value={formData.benefits_summary} onChange={(e) => setFormData({ ...formData, benefits_summary: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Button onClick={handleSave} className="w-full">Save Offer</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer #</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-mono">{offer.offer_number}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {offer.applications?.candidates?.first_name} {offer.applications?.candidates?.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{offer.applications?.candidates?.email}</div>
                  </TableCell>
                  <TableCell>{offer.position_title}</TableCell>
                  <TableCell>
                    {offer.base_salary ? `${offer.currency} ${offer.base_salary.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(offer.status)}>{offer.status}</Badge>
                  </TableCell>
                  <TableCell>{offer.start_date ? formatDateForDisplay(offer.start_date, 'MMM d, yyyy') : '-'}</TableCell>
                  <TableCell>
                    <Select value={offer.status} onValueChange={(v) => handleUpdateStatus(offer.id, v)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="negotiating">Negotiating</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
