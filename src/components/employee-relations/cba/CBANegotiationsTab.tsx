import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, MapPin, Users, Loader2, MessageSquare, DollarSign } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { useCBANegotiations, useCBAProposals, useCreateCBANegotiation, useCreateCBAProposal, type CBANegotiation, type CBAProposal } from '@/hooks/useCBAData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CBANegotiationsTabProps {
  agreementId: string;
  companyId: string;
}

export function CBANegotiationsTab({ agreementId, companyId }: CBANegotiationsTabProps) {
  const { t } = useTranslation();
  const { data: negotiations = [], isLoading } = useCBANegotiations(companyId, agreementId);
  const createNegotiation = useCreateCBANegotiation();
  const createProposal = useCreateCBAProposal();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [selectedNegotiationId, setSelectedNegotiationId] = useState<string | null>(null);
  const [expandedNegotiation, setExpandedNegotiation] = useState<string | null>(null);
  
  const { data: unions = [] } = useQuery({
    queryKey: ['unions', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unions')
        .select('id, name')
        .eq('company_id', companyId);
      if (error) throw error;
      return data;
    },
  });

  const { data: proposals = [] } = useCBAProposals(expandedNegotiation || '');
  
  const [form, setForm] = useState({
    title: '',
    union_id: '',
    session_date: '',
    session_time: '',
    location: '',
    meeting_type: 'in_person',
    agenda: '',
  });

  const [proposalForm, setProposalForm] = useState({
    proposed_by: 'management',
    proposal_type: 'initial',
    title: '',
    content: '',
    estimated_cost_impact: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNegotiation.mutate({
      agreement_id: agreementId,
      company_id: companyId,
      ...form,
      session_date: form.session_date || null,
      session_time: form.session_time || null,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setForm({ title: '', union_id: '', session_date: '', session_time: '', location: '', meeting_type: 'in_person', agenda: '' });
      }
    });
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNegotiationId) return;
    
    createProposal.mutate({
      negotiation_id: selectedNegotiationId,
      ...proposalForm,
      estimated_cost_impact: proposalForm.estimated_cost_impact ? parseFloat(proposalForm.estimated_cost_impact) : null,
    }, {
      onSuccess: () => {
        setIsProposalDialogOpen(false);
        setProposalForm({ proposed_by: 'management', proposal_type: 'initial', title: '', content: '', estimated_cost_impact: '' });
      }
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-500/20 text-blue-600',
      in_progress: 'bg-yellow-500/20 text-yellow-600',
      completed: 'bg-green-500/20 text-green-600',
      cancelled: 'bg-red-500/20 text-red-600',
      adjourned: 'bg-gray-500/20 text-gray-600',
    };
    return colors[status] || colors.scheduled;
  };

  const getProposalStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-600',
      accepted: 'bg-green-500/20 text-green-600',
      rejected: 'bg-red-500/20 text-red-600',
      withdrawn: 'bg-gray-500/20 text-gray-600',
      modified: 'bg-blue-500/20 text-blue-600',
    };
    return colors[status] || colors.pending;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {negotiations.length} negotiation session{negotiations.length !== 1 ? 's' : ''}
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Negotiation Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Session Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Wage Discussion - Round 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Union *</Label>
                <Select value={form.union_id} onValueChange={(v) => setForm({ ...form, union_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select union" />
                  </SelectTrigger>
                  <SelectContent>
                    {unions.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.session_date}
                    onChange={(e) => setForm({ ...form, session_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={form.session_time}
                    onChange={(e) => setForm({ ...form, session_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Meeting room or address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meeting Type</Label>
                  <Select value={form.meeting_type} onValueChange={(v) => setForm({ ...form, meeting_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Agenda</Label>
                <Textarea
                  value={form.agenda}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                  placeholder="Meeting agenda items"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createNegotiation.isPending}>
                  {createNegotiation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {negotiations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No negotiation sessions scheduled yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {negotiations.map((negotiation) => (
            <Card key={negotiation.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedNegotiation(expandedNegotiation === negotiation.id ? null : negotiation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{negotiation.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {negotiation.session_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateForDisplay(negotiation.session_date)}
                          {negotiation.session_time && ` at ${negotiation.session_time}`}
                        </span>
                      )}
                      {negotiation.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {negotiation.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {negotiation.unions?.name}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(negotiation.status)}>
                    {negotiation.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              {expandedNegotiation === negotiation.id && (
                <CardContent className="border-t">
                  <div className="space-y-4 pt-4">
                    {negotiation.agenda && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Agenda</h4>
                        <p className="text-sm text-muted-foreground">{negotiation.agenda}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Proposals</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNegotiationId(negotiation.id);
                          setIsProposalDialogOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        Add Proposal
                      </Button>
                    </div>
                    
                    {proposals.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Proposed By</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Cost Impact</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {proposals.map((proposal) => (
                            <TableRow key={proposal.id}>
                              <TableCell>
                                <Badge variant="outline">
                                  {proposal.proposed_by === 'union' ? 'Union' : 'Management'}
                                </Badge>
                              </TableCell>
                              <TableCell className="capitalize">{proposal.proposal_type}</TableCell>
                              <TableCell>{proposal.title}</TableCell>
                              <TableCell>
                                {proposal.estimated_cost_impact ? (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {proposal.estimated_cost_impact.toLocaleString()}
                                  </span>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge className={getProposalStatusColor(proposal.status)}>
                                  {proposal.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">No proposals recorded</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Proposal Dialog */}
      <Dialog open={isProposalDialogOpen} onOpenChange={setIsProposalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Proposal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proposed By *</Label>
                <Select value={proposalForm.proposed_by} onValueChange={(v) => setProposalForm({ ...proposalForm, proposed_by: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="union">Union</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proposal Type *</Label>
                <Select value={proposalForm.proposal_type} onValueChange={(v) => setProposalForm({ ...proposalForm, proposal_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial</SelectItem>
                    <SelectItem value="counter">Counter</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={proposalForm.title}
                onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                placeholder="Proposal title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={proposalForm.content}
                onChange={(e) => setProposalForm({ ...proposalForm, content: e.target.value })}
                placeholder="Proposal details"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost Impact</Label>
              <Input
                type="number"
                value={proposalForm.estimated_cost_impact}
                onChange={(e) => setProposalForm({ ...proposalForm, estimated_cost_impact: e.target.value })}
                placeholder="Annual cost impact"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsProposalDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProposal.isPending}>
                {createProposal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Proposal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
