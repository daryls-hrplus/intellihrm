import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Building2, Users, FileText, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTodayString, formatDateForDisplay } from '@/utils/dateUtils';

interface ERUnionsTabProps {
  companyId: string;
}

export function ERUnionsTab({ companyId }: ERUnionsTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnionId, setSelectedUnionId] = useState<string | null>(null);

  const [unionForm, setUnionForm] = useState({
    name: '',
    code: '',
    registration_number: '',
    description: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    start_date: getTodayString(),
  });

  const [agreementForm, setAgreementForm] = useState({
    union_id: '',
    title: '',
    agreement_number: '',
    description: '',
    effective_date: getTodayString(),
    expiry_date: '',
    wage_provisions: '',
    benefits_provisions: '',
    working_conditions: '',
    dispute_resolution_clause: '',
  });

  // Fetch unions
  const { data: unions = [], isLoading: loadingUnions } = useQuery({
    queryKey: ['unions', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unions')
        .select('*')
        .eq('company_id', companyId)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch collective agreements
  const { data: agreements = [], isLoading: loadingAgreements } = useQuery({
    queryKey: ['collective_agreements', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collective_agreements')
        .select('*, unions(name)')
        .eq('company_id', companyId)
        .order('effective_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ['union_memberships', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('union_memberships')
        .select('*, unions(name), profiles(full_name)')
        .eq('unions.company_id', companyId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  // Create union mutation
  const createUnion = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('unions').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unions'] });
      toast.success(t('employeeRelationsModule.unions.unionCreated'));
      setIsDialogOpen(false);
      resetUnionForm();
    },
    onError: () => toast.error(t('common.error')),
  });

  // Create agreement mutation
  const createAgreement = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('collective_agreements').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collective_agreements'] });
      toast.success(t('employeeRelationsModule.unions.agreementCreated'));
      setIsAgreementDialogOpen(false);
      resetAgreementForm();
    },
    onError: () => toast.error(t('common.error')),
  });

  const resetUnionForm = () => {
    setUnionForm({
      name: '',
      code: '',
      registration_number: '',
      description: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      website: '',
      start_date: new Date().toISOString().split('T')[0],
    });
  };

  const resetAgreementForm = () => {
    setAgreementForm({
      union_id: '',
      title: '',
      agreement_number: '',
      description: '',
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      wage_provisions: '',
      benefits_provisions: '',
      working_conditions: '',
      dispute_resolution_clause: '',
    });
  };

  const handleUnionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUnion.mutate({
      ...unionForm,
      company_id: companyId,
    });
  };

  const handleAgreementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAgreement.mutate({
      ...agreementForm,
      company_id: companyId,
      expiry_date: agreementForm.expiry_date || null,
    });
  };

  const filteredUnions = unions.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = loadingUnions || loadingAgreements;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('employeeRelationsModule.unions.title')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.unions.description')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('employeeRelationsModule.unions.newUnion')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('employeeRelationsModule.unions.registerUnion')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUnionSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('common.name')} *</Label>
                      <Input
                        value={unionForm.name}
                        onChange={(e) => setUnionForm({ ...unionForm, name: e.target.value })}
                        placeholder={t('employeeRelationsModule.unions.unionName')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.code')} *</Label>
                      <Input
                        value={unionForm.code}
                        onChange={(e) => setUnionForm({ ...unionForm, code: e.target.value })}
                        placeholder={t('employeeRelationsModule.unions.unionCode')}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.unions.registrationNumber')}</Label>
                      <Input
                        value={unionForm.registration_number}
                        onChange={(e) => setUnionForm({ ...unionForm, registration_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.startDate')} *</Label>
                      <Input
                        type="date"
                        value={unionForm.start_date}
                        onChange={(e) => setUnionForm({ ...unionForm, start_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.description')}</Label>
                    <Textarea
                      value={unionForm.description}
                      onChange={(e) => setUnionForm({ ...unionForm, description: e.target.value })}
                      placeholder={t('employeeRelationsModule.unions.descriptionPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.unions.contactPerson')}</Label>
                      <Input
                        value={unionForm.contact_person}
                        onChange={(e) => setUnionForm({ ...unionForm, contact_person: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.email')}</Label>
                      <Input
                        type="email"
                        value={unionForm.contact_email}
                        onChange={(e) => setUnionForm({ ...unionForm, contact_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.phone')}</Label>
                      <Input
                        value={unionForm.contact_phone}
                        onChange={(e) => setUnionForm({ ...unionForm, contact_phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createUnion.isPending}>
                      {createUnion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('common.create')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAgreementDialogOpen} onOpenChange={setIsAgreementDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  {t('employeeRelationsModule.unions.newAgreement')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('employeeRelationsModule.unions.createAgreement')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAgreementSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.unions.union')} *</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={agreementForm.union_id}
                        onChange={(e) => setAgreementForm({ ...agreementForm, union_id: e.target.value })}
                        required
                      >
                        <option value="">{t('employeeRelationsModule.unions.selectUnion')}</option>
                        {unions.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.unions.agreementNumber')}</Label>
                      <Input
                        value={agreementForm.agreement_number}
                        onChange={(e) => setAgreementForm({ ...agreementForm, agreement_number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.unions.agreementTitle')} *</Label>
                    <Input
                      value={agreementForm.title}
                      onChange={(e) => setAgreementForm({ ...agreementForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.unions.effectiveDate')} *</Label>
                      <Input
                        type="date"
                        value={agreementForm.effective_date}
                        onChange={(e) => setAgreementForm({ ...agreementForm, effective_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.unions.expiryDate')}</Label>
                      <Input
                        type="date"
                        value={agreementForm.expiry_date}
                        onChange={(e) => setAgreementForm({ ...agreementForm, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.unions.wageProvisions')}</Label>
                    <Textarea
                      value={agreementForm.wage_provisions}
                      onChange={(e) => setAgreementForm({ ...agreementForm, wage_provisions: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.unions.benefitsProvisions')}</Label>
                    <Textarea
                      value={agreementForm.benefits_provisions}
                      onChange={(e) => setAgreementForm({ ...agreementForm, benefits_provisions: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.unions.disputeResolution')}</Label>
                    <Textarea
                      value={agreementForm.dispute_resolution_clause}
                      onChange={(e) => setAgreementForm({ ...agreementForm, dispute_resolution_clause: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAgreementDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createAgreement.isPending}>
                      {createAgreement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('common.create')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unions" className="gap-2">
              <Building2 className="h-4 w-4" />
              {t('employeeRelationsModule.unions.unions')} ({unions.length})
            </TabsTrigger>
            <TabsTrigger value="agreements" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('employeeRelationsModule.unions.agreements')} ({agreements.length})
            </TabsTrigger>
            <TabsTrigger value="memberships" className="gap-2">
              <Users className="h-4 w-4" />
              {t('employeeRelationsModule.unions.memberships')} ({memberships.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unions">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('employeeRelationsModule.unions.searchUnions')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUnions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('employeeRelationsModule.unions.noUnions')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.code')}</TableHead>
                      <TableHead>{t('common.name')}</TableHead>
                      <TableHead>{t('employeeRelationsModule.unions.registrationNumber')}</TableHead>
                      <TableHead>{t('employeeRelationsModule.unions.contactPerson')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnions.map((union) => (
                      <TableRow key={union.id}>
                        <TableCell className="font-mono">{union.code}</TableCell>
                        <TableCell className="font-medium">{union.name}</TableCell>
                        <TableCell>{union.registration_number || '-'}</TableCell>
                        <TableCell>{union.contact_person || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={union.is_active ? 'default' : 'secondary'}>
                            {union.is_active ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="agreements">
            {agreements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('employeeRelationsModule.unions.noAgreements')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('employeeRelationsModule.unions.agreementNumber')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.unions.union')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.unions.agreementTitle')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.unions.effectiveDate')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.unions.expiryDate')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((agreement: any) => (
                    <TableRow key={agreement.id}>
                      <TableCell className="font-mono">{agreement.agreement_number || '-'}</TableCell>
                      <TableCell>{agreement.unions?.name}</TableCell>
                      <TableCell>{agreement.title}</TableCell>
                      <TableCell>{formatDateForDisplay(agreement.effective_date, 'PP')}</TableCell>
                      <TableCell>{agreement.expiry_date ? formatDateForDisplay(agreement.expiry_date, 'PP') : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={agreement.status === 'active' ? 'default' : 'secondary'}>
                          {agreement.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="memberships">
            {memberships.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('employeeRelationsModule.unions.noMemberships')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.employee')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.unions.union')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.unions.membershipNumber')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.unions.joinDate')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.map((membership: any) => (
                    <TableRow key={membership.id}>
                      <TableCell>{membership.profiles?.full_name}</TableCell>
                      <TableCell>{membership.unions?.name}</TableCell>
                      <TableCell className="font-mono">{membership.membership_number || '-'}</TableCell>
                      <TableCell>{formatDateForDisplay(membership.join_date, 'PP')}</TableCell>
                      <TableCell>
                        <Badge variant={membership.status === 'active' ? 'default' : 'secondary'}>
                          {membership.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
