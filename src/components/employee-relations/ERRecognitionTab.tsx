import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Loader2, Award, Star, Trophy } from 'lucide-react';
import { useEmployeeRelations } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const RECOGNITION_TYPES = ['award', 'appreciation', 'milestone', 'peer_recognition', 'spot_bonus'];
const CATEGORIES = ['performance', 'innovation', 'teamwork', 'customer_service', 'safety', 'leadership', 'other'];

interface ERRecognitionTabProps {
  companyId?: string;
}

export function ERRecognitionTab({ companyId }: ERRecognitionTabProps) {
  const { user } = useAuth();
  const { recognitions, loadingRecognition, createRecognition } = useEmployeeRelations(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    employee_id: '',
    recognition_type: 'appreciation',
    category: '',
    title: '',
    description: '',
    award_date: new Date().toISOString().split('T')[0],
    monetary_value: '',
    is_public: true,
  });

  const filteredRecognitions = recognitions.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !user?.id) return;

    await createRecognition.mutateAsync({
      company_id: companyId,
      ...formData,
      awarded_by: user.id,
      monetary_value: formData.monetary_value ? parseFloat(formData.monetary_value) : null,
      category: formData.category || null,
    });

    setIsDialogOpen(false);
    setFormData({
      employee_id: '',
      recognition_type: 'appreciation',
      category: '',
      title: '',
      description: '',
      award_date: new Date().toISOString().split('T')[0],
      monetary_value: '',
      is_public: true,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'award': return <Trophy className="h-4 w-4" />;
      case 'milestone': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'award': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'appreciation': return 'bg-success/10 text-success border-success/20';
      case 'milestone': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'peer_recognition': return 'bg-info/10 text-info border-info/20';
      case 'spot_bonus': return 'bg-primary/10 text-primary border-primary/20';
      default: return '';
    }
  };

  if (loadingRecognition) {
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
              <Award className="h-5 w-5" />
              Recognition & Awards
            </CardTitle>
            <CardDescription>Celebrate employee achievements and milestones</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Give Recognition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Recognition</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Recognition title"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={formData.recognition_type} onValueChange={(v) => setFormData({ ...formData, recognition_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RECOGNITION_TYPES.map(t => (
                          <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Award Date *</Label>
                    <Input
                      type="date"
                      value={formData.award_date}
                      onChange={(e) => setFormData({ ...formData, award_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monetary Value</Label>
                    <Input
                      type="number"
                      value={formData.monetary_value}
                      onChange={(e) => setFormData({ ...formData, monetary_value: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Why is this employee being recognized..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                  <Label>Make public (visible to all employees)</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createRecognition.isPending}>
                    {createRecognition.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Recognition
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
              placeholder="Search recognitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredRecognitions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recognitions found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecognitions.map(recognition => (
              <Card key={recognition.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className={getTypeColor(recognition.recognition_type)}>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(recognition.recognition_type)}
                        {recognition.recognition_type.replace(/_/g, ' ')}
                      </span>
                    </Badge>
                    {recognition.monetary_value && (
                      <span className="text-sm font-semibold text-success">
                        ${recognition.monetary_value.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold mb-1">{recognition.title}</h4>
                  <div className="mb-2">
                    <p className="text-sm font-medium">{recognition.employee?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{recognition.employee?.email}</p>
                  </div>
                  {recognition.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{recognition.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(recognition.award_date), 'PP')}</span>
                    {recognition.category && (
                      <Badge variant="secondary" className="text-xs">
                        {recognition.category.replace(/_/g, ' ')}
                      </Badge>
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
