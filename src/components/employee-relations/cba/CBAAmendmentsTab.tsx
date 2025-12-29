import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileEdit, Loader2, Calendar, ExternalLink } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { useCBAAmendments, useCreateCBAAmendment, type CBAAmendment } from '@/hooks/useCBAData';

interface CBAAmendmentsTabProps {
  agreementId: string;
}

export function CBAAmendmentsTab({ agreementId }: CBAAmendmentsTabProps) {
  const { t } = useTranslation();
  const { data: amendments = [], isLoading } = useCBAAmendments(agreementId);
  const createAmendment = useCreateCBAAmendment();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [form, setForm] = useState({
    amendment_number: '',
    title: '',
    description: '',
    effective_date: '',
    expiry_date: '',
    content: '',
    document_url: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAmendment.mutate({
      agreement_id: agreementId,
      ...form,
      expiry_date: form.expiry_date || null,
      document_url: form.document_url || null,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setForm({ amendment_number: '', title: '', description: '', effective_date: '', expiry_date: '', content: '', document_url: '' });
      }
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-600',
      pending_approval: 'bg-yellow-500/20 text-yellow-600',
      active: 'bg-green-500/20 text-green-600',
      expired: 'bg-red-500/20 text-red-600',
      superseded: 'bg-blue-500/20 text-blue-600',
    };
    return colors[status] || colors.draft;
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
          {amendments.length} amendment{amendments.length !== 1 ? 's' : ''} and side letter{amendments.length !== 1 ? 's' : ''}
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Amendment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Amendment / Side Letter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amendment Number *</Label>
                  <Input
                    value={form.amendment_number}
                    onChange={(e) => setForm({ ...form, amendment_number: e.target.value })}
                    placeholder="e.g., A-001, SL-2024-01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effective Date *</Label>
                  <Input
                    type="date"
                    value={form.effective_date}
                    onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Amendment title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of changes"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Full amendment text"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Document URL</Label>
                  <Input
                    value={form.document_url}
                    onChange={(e) => setForm({ ...form, document_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAmendment.isPending}>
                  {createAmendment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Amendment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {amendments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No amendments or side letters yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {amendments.map((amendment) => (
            <Card key={amendment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">{amendment.amendment_number}</span>
                      <Badge className={getStatusColor(amendment.status)}>
                        {amendment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-1">{amendment.title}</CardTitle>
                  </div>
                  {amendment.document_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={amendment.document_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                {amendment.description && (
                  <CardDescription>{amendment.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Effective: {formatDateForDisplay(amendment.effective_date)}
                  </span>
                  {amendment.expiry_date && (
                    <span className="flex items-center gap-1">
                      Expires: {formatDateForDisplay(amendment.expiry_date)}
                    </span>
                  )}
                </div>
                {amendment.content && (
                  <p className="text-sm mt-3 line-clamp-3">{amendment.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
