import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2, Heart, Users, Calendar, DollarSign } from 'lucide-react';
import { useEmployeeRelations } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayString, formatDateForDisplay } from '@/utils/dateUtils';

const PROGRAM_TYPES = ['mental_health', 'physical_fitness', 'nutrition', 'stress_management', 'work_life_balance', 'financial_wellness'];
const STATUSES = ['active', 'inactive', 'upcoming'];

interface ERWellnessTabProps {
  companyId?: string;
}

export function ERWellnessTab({ companyId }: ERWellnessTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { wellnessPrograms, loadingWellness, createWellnessProgram } = useEmployeeRelations(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    program_type: 'mental_health',
    start_date: getTodayString(),
    end_date: '',
    max_participants: '',
    budget: '',
  });

  const filteredPrograms = wellnessPrograms.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !user?.id) return;

    await createWellnessProgram.mutateAsync({
      company_id: companyId,
      ...formData,
      coordinator_id: user.id,
      end_date: formData.end_date || null,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
    });

    setIsDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      program_type: 'mental_health',
      start_date: getTodayString(),
      end_date: '',
      max_participants: '',
      budget: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'upcoming': return 'bg-info/10 text-info border-info/20';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mental_health': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'physical_fitness': return 'bg-success/10 text-success border-success/20';
      case 'nutrition': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'stress_management': return 'bg-info/10 text-info border-info/20';
      case 'work_life_balance': return 'bg-primary/10 text-primary border-primary/20';
      case 'financial_wellness': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default: return '';
    }
  };

  if (loadingWellness) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {t('employeeRelationsModule.wellness.title')}
            </CardTitle>
            <CardDescription>{t('employeeRelationsModule.wellness.description')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('employeeRelationsModule.wellness.newProgram')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('employeeRelationsModule.wellness.createProgram')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('employeeRelationsModule.wellness.programName')} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('employeeRelationsModule.wellness.programNamePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('employeeRelationsModule.wellness.programType')} *</Label>
                  <Select value={formData.program_type} onValueChange={(v) => setFormData({ ...formData, program_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROGRAM_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {t(`employeeRelationsModule.wellness.types.${type}`, { defaultValue: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('common.startDate')} *</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.endDate')}</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.wellness.maxParticipants')}</Label>
                    <Input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                      placeholder={t('employeeRelationsModule.wellness.unlimited')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.wellness.budget')}</Label>
                    <Input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.description')}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('employeeRelationsModule.wellness.programDescription')}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" disabled={createWellnessProgram.isPending}>
                    {createWellnessProgram.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('common.create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('employeeRelationsModule.wellness.searchPrograms')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('employeeRelationsModule.wellness.noPrograms')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map(program => (
              <Card key={program.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className={getTypeColor(program.program_type)}>
                      {t(`employeeRelationsModule.wellness.types.${program.program_type}`, { defaultValue: program.program_type.replace(/_/g, ' ') })}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(program.status)}>
                      {t(`employeeRelationsModule.wellness.statuses.${program.status}`, { defaultValue: program.status })}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{program.name}</h4>
                  {program.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{program.description}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateForDisplay(program.start_date, 'PP')}</span>
                      {program.end_date && <span>- {formatDateForDisplay(program.end_date, 'PP')}</span>}
                    </div>
                    {program.max_participants && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{t('employeeRelationsModule.wellness.maxParticipants')}: {program.max_participants}</span>
                      </div>
                    )}
                    {program.budget && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{t('employeeRelationsModule.wellness.budget')}: ${program.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
