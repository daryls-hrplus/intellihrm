import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Loader2, ChevronRight, Scale } from 'lucide-react';
import { useCBAClausesByAgreement, useCreateCBAArticle, useCreateCBAClause, type CBAArticle, type CBAClause } from '@/hooks/useCBAData';

interface CBAArticlesTabProps {
  agreementId: string;
}

const ARTICLE_CATEGORIES = [
  { value: 'wages', label: 'Wages & Compensation' },
  { value: 'scheduling', label: 'Scheduling & Hours' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'discipline', label: 'Discipline & Grievance' },
  { value: 'seniority', label: 'Seniority' },
  { value: 'leave', label: 'Leave & Time Off' },
  { value: 'safety', label: 'Health & Safety' },
  { value: 'general', label: 'General Provisions' },
];

export function CBAArticlesTab({ agreementId }: CBAArticlesTabProps) {
  const { t } = useTranslation();
  const { data: articles = [], isLoading } = useCBAClausesByAgreement(agreementId);
  const createArticle = useCreateCBAArticle();
  const createClause = useCreateCBAClause();
  
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [isClauseDialogOpen, setIsClauseDialogOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  
  const [articleForm, setArticleForm] = useState({
    article_number: '',
    title: '',
    content: '',
    category: 'general',
  });
  
  const [clauseForm, setClauseForm] = useState({
    clause_number: '',
    title: '',
    content: '',
    clause_type: 'mandatory',
    is_enforceable: false,
  });

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    createArticle.mutate({
      agreement_id: agreementId,
      ...articleForm,
      display_order: articles.length,
    }, {
      onSuccess: () => {
        setIsArticleDialogOpen(false);
        setArticleForm({ article_number: '', title: '', content: '', category: 'general' });
      }
    });
  };

  const handleCreateClause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleId) return;
    
    const article = articles.find(a => a.id === selectedArticleId);
    createClause.mutate({
      article_id: selectedArticleId,
      ...clauseForm,
      display_order: article?.cba_clauses?.length || 0,
    }, {
      onSuccess: () => {
        setIsClauseDialogOpen(false);
        setClauseForm({ clause_number: '', title: '', content: '', clause_type: 'mandatory', is_enforceable: false });
      }
    });
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      wages: 'bg-emerald-500/20 text-emerald-600',
      scheduling: 'bg-blue-500/20 text-blue-600',
      benefits: 'bg-purple-500/20 text-purple-600',
      discipline: 'bg-red-500/20 text-red-600',
      seniority: 'bg-amber-500/20 text-amber-600',
      leave: 'bg-cyan-500/20 text-cyan-600',
      safety: 'bg-orange-500/20 text-orange-600',
      general: 'bg-gray-500/20 text-gray-600',
    };
    return colors[category || 'general'] || colors.general;
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
          {articles.length} article{articles.length !== 1 ? 's' : ''} in this agreement
        </p>
        <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Article</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Article Number *</Label>
                  <Input
                    value={articleForm.article_number}
                    onChange={(e) => setArticleForm({ ...articleForm, article_number: e.target.value })}
                    placeholder="e.g., I, 1, A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={articleForm.category} onValueChange={(v) => setArticleForm({ ...articleForm, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ARTICLE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="Article title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Article content or summary"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsArticleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createArticle.isPending}>
                  {createArticle.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Article
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No articles yet. Add articles to structure this agreement.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {articles.map((article) => (
            <AccordionItem key={article.id} value={article.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="font-mono text-sm text-muted-foreground">Art. {article.article_number}</span>
                  <span className="font-medium">{article.title}</span>
                  <Badge className={getCategoryColor(article.category)}>
                    {ARTICLE_CATEGORIES.find(c => c.value === article.category)?.label || 'General'}
                  </Badge>
                  {article.cba_clauses && article.cba_clauses.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({article.cba_clauses.length} clause{article.cba_clauses.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {article.content && (
                    <p className="text-sm text-muted-foreground">{article.content}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Clauses</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => {
                          setSelectedArticleId(article.id);
                          setIsClauseDialogOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        Add Clause
                      </Button>
                    </div>
                    
                    {article.cba_clauses && article.cba_clauses.length > 0 ? (
                      <div className="space-y-2 pl-4 border-l-2">
                        {article.cba_clauses.map((clause) => (
                          <div key={clause.id} className="p-3 bg-muted/50 rounded-md">
                            <div className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-muted-foreground">
                                    §{clause.clause_number}
                                  </span>
                                  <span className="font-medium text-sm">{clause.title}</span>
                                  {clause.is_enforceable && (
                                    <Badge variant="outline" className="gap-1 text-xs">
                                      <Scale className="h-3 w-3" />
                                      Enforceable
                                    </Badge>
                                  )}
                                </div>
                                {clause.content && (
                                  <p className="text-sm text-muted-foreground mt-1">{clause.content}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-4">No clauses defined</p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Clause Dialog */}
      <Dialog open={isClauseDialogOpen} onOpenChange={setIsClauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Clause</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClause} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clause Number *</Label>
                <Input
                  value={clauseForm.clause_number}
                  onChange={(e) => setClauseForm({ ...clauseForm, clause_number: e.target.value })}
                  placeholder="e.g., 1.1, a, i"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={clauseForm.clause_type} onValueChange={(v) => setClauseForm({ ...clauseForm, clause_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mandatory">Mandatory</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={clauseForm.title}
                onChange={(e) => setClauseForm({ ...clauseForm, title: e.target.value })}
                placeholder="Clause title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={clauseForm.content}
                onChange={(e) => setClauseForm({ ...clauseForm, content: e.target.value })}
                placeholder="Clause content"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_enforceable"
                checked={clauseForm.is_enforceable}
                onChange={(e) => setClauseForm({ ...clauseForm, is_enforceable: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_enforceable">This clause can be automatically enforced (create rule)</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsClauseDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createClause.isPending}>
                {createClause.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Clause
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
