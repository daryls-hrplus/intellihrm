import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BehavioralAnchorEditor } from "@/components/feedback/questions/BehavioralAnchorEditor";
import { useBehavioralAnchors, BehavioralAnchor, QuestionAnchors } from "@/hooks/useBehavioralAnchors";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Search, Edit, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface CompetencyAnchorsManagerProps {
  companyId: string;
}

interface Competency {
  id: string;
  name: string;
  code: string;
  category: string | null;
  proficiency_levels: number | null;
  has_anchors?: boolean;
}

export function CompetencyAnchorsManager({ companyId }: CompetencyAnchorsManagerProps) {
  const { t } = useLanguage();
  const { fetchAnchorsForCompany, loading } = useBehavioralAnchors();
  
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [anchors, setAnchors] = useState<BehavioralAnchor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loadingCompetencies, setLoadingCompetencies] = useState(true);

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoadingCompetencies(true);
    
    // Load competencies
    const { data: compData, error: compError } = await supabase
      .from('competencies')
      .select('id, name, code, category, proficiency_levels')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (!compError && compData) {
      // Load all anchors
      const anchorsData = await fetchAnchorsForCompany(companyId);
      setAnchors(anchorsData);

      // Mark competencies that have anchors
      const anchorCompetencyIds = new Set(anchorsData.map(a => a.competency_id));
      const competenciesWithStatus = compData.map(c => ({
        ...c,
        has_anchors: anchorCompetencyIds.has(c.id),
      }));
      
      setCompetencies(competenciesWithStatus);
    }
    
    setLoadingCompetencies(false);
  };

  const handleEditCompetency = (competency: Competency) => {
    setSelectedCompetency(competency);
    setEditorOpen(true);
  };

  const handleSaveAnchors = async () => {
    setEditorOpen(false);
    await loadData(); // Refresh data
  };

  const getExistingAnchors = (competencyId: string): QuestionAnchors => {
    const competencyAnchors = anchors.filter(a => a.competency_id === competencyId);
    const result: QuestionAnchors = {};
    
    competencyAnchors.forEach(anchor => {
      result[anchor.scale_value.toString()] = {
        label: anchor.scale_label,
        description: anchor.anchor_text,
        examples: anchor.examples || [],
      };
    });
    
    return result;
  };

  const filteredCompetencies = competencies.filter(c => {
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || c.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(competencies.map(c => c.category).filter(Boolean))];
  const completedCount = competencies.filter(c => c.has_anchors).length;

  if (loadingCompetencies) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("competencies.anchors.managerTitle")}</CardTitle>
            <CardDescription>
              {t("competencies.anchors.managerDescription")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {completedCount} / {competencies.length} Configured
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter || ''} onValueChange={(v) => setCategoryFilter(v || null)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {filteredCompetencies.map(competency => (
              <div 
                key={competency.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {competency.has_anchors ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">{competency.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{competency.code}</span>
                      {competency.category && (
                        <>
                          <span>•</span>
                          <span>{competency.category}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{(competency.proficiency_levels as number) || 5} levels</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={competency.has_anchors ? 'default' : 'secondary'}>
                    {competency.has_anchors ? 'Configured' : 'Not Set'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditCompetency(competency)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {filteredCompetencies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No competencies found matching your criteria
          </div>
        )}
      </CardContent>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Behavioral Anchors for: {selectedCompetency?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCompetency && (
            <BehavioralAnchorEditor
              competencyId={selectedCompetency.id}
              companyId={companyId}
              scaleMax={selectedCompetency.proficiency_levels || 5}
              initialAnchors={getExistingAnchors(selectedCompetency.id)}
              onSave={handleSaveAnchors}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
