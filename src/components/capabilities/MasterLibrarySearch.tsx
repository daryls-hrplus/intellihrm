import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Download, 
  BookOpen, 
  Target, 
  Briefcase,
  Filter,
  CheckCircle2,
  Sparkles,
  Cpu,
  Leaf
} from 'lucide-react';
import { useMasterLibrary, MasterSkill, MasterCompetency, MasterIndustry } from '@/hooks/capabilities/useMasterLibrary';
import { toast } from 'sonner';

interface MasterLibrarySearchProps {
  companyId: string;
  userId: string;
  onImportComplete?: () => void;
}

export function MasterLibrarySearch({ companyId, userId, onImportComplete }: MasterLibrarySearchProps) {
  const {
    loading,
    skills,
    competencies,
    industries,
    totalCount,
    fetchIndustries,
    searchSkills,
    searchCompetencies,
    bulkImportSkills,
    bulkImportCompetencies
  } = useMasterLibrary();

  const [activeTab, setActiveTab] = useState<'skills' | 'competencies'>('skills');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSkillType, setSelectedSkillType] = useState<string>('');
  const [selectedCompetencyType, setSelectedCompetencyType] = useState<string>('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set());
  const [selectedCompetencyIds, setSelectedCompetencyIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (activeTab === 'skills') {
        searchSkills({
          query: searchQuery || undefined,
          skillType: selectedSkillType || undefined,
          industryId: selectedIndustry || undefined,
          limit: 100
        });
      } else {
        searchCompetencies({
          query: searchQuery || undefined,
          competencyType: selectedCompetencyType || undefined,
          limit: 100
        });
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, selectedIndustry, selectedSkillType, selectedCompetencyType, activeTab, searchSkills, searchCompetencies]);

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkillIds(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const handleCompetencyToggle = (competencyId: string) => {
    setSelectedCompetencyIds(prev => {
      const next = new Set(prev);
      if (next.has(competencyId)) {
        next.delete(competencyId);
      } else {
        next.add(competencyId);
      }
      return next;
    });
  };

  const handleSelectAllSkills = () => {
    if (selectedSkillIds.size === skills.length) {
      setSelectedSkillIds(new Set());
    } else {
      setSelectedSkillIds(new Set(skills.map(s => s.id)));
    }
  };

  const handleSelectAllCompetencies = () => {
    if (selectedCompetencyIds.size === competencies.length) {
      setSelectedCompetencyIds(new Set());
    } else {
      setSelectedCompetencyIds(new Set(competencies.map(c => c.id)));
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      if (activeTab === 'skills' && selectedSkillIds.size > 0) {
        await bulkImportSkills(Array.from(selectedSkillIds), companyId, userId);
        setSelectedSkillIds(new Set());
      } else if (activeTab === 'competencies' && selectedCompetencyIds.size > 0) {
        await bulkImportCompetencies(Array.from(selectedCompetencyIds), companyId, userId);
        setSelectedCompetencyIds(new Set());
      }
      onImportComplete?.();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsImporting(false);
    }
  };

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'skill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'knowledge': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'transversal': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'language': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCompetencyTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      case 'leadership': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'core': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'functional': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'technical': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const selectedCount = activeTab === 'skills' ? selectedSkillIds.size : selectedCompetencyIds.size;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Master Library
          </CardTitle>
          {selectedCount > 0 && (
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Import {selectedCount} Selected
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'skills' | 'competencies')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="skills" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="competencies" className="gap-2">
              <Target className="h-4 w-4" />
              Competencies
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {activeTab === 'skills' && (
              <>
                <Select value={selectedSkillType} onValueChange={setSelectedSkillType}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Skill Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="knowledge">Knowledge</SelectItem>
                    <SelectItem value="transversal">Transversal</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    {industries.map(ind => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {activeTab === 'competencies' && (
              <Select value={selectedCompetencyType} onValueChange={setSelectedCompetencyType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Competency Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="functional">Functional</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent value="skills" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {totalCount} skills found
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllSkills}
                className="text-xs"
              >
                {selectedSkillIds.size === skills.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-50" />
                  <p>No skills found. Try a different search.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {skills.map(skill => (
                    <SkillRow
                      key={skill.id}
                      skill={skill}
                      isSelected={selectedSkillIds.has(skill.id)}
                      onToggle={() => handleSkillToggle(skill.id)}
                      getTypeColor={getSkillTypeColor}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="competencies" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {totalCount} competencies found
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllCompetencies}
                className="text-xs"
              >
                {selectedCompetencyIds.size === competencies.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : competencies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-50" />
                  <p>No competencies found. Try a different search.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {competencies.map(comp => (
                    <CompetencyRow
                      key={comp.id}
                      competency={comp}
                      isSelected={selectedCompetencyIds.has(comp.id)}
                      onToggle={() => handleCompetencyToggle(comp.id)}
                      getTypeColor={getCompetencyTypeColor}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SkillRow({ 
  skill, 
  isSelected, 
  onToggle, 
  getTypeColor 
}: { 
  skill: MasterSkill; 
  isSelected: boolean; 
  onToggle: () => void;
  getTypeColor: (type: string) => string;
}) {
  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-primary/5 border-primary/30' 
          : 'bg-card hover:bg-muted/50 border-border/50'
      }`}
      onClick={onToggle}
    >
      <Checkbox 
        checked={isSelected} 
        onCheckedChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{skill.skill_name}</span>
          <Badge variant="outline" className={`text-xs ${getTypeColor(skill.skill_type)}`}>
            {skill.skill_type}
          </Badge>
          {skill.is_digital_skill && (
            <Cpu className="h-3.5 w-3.5 text-blue-500" />
          )}
          {skill.is_green_skill && (
            <Leaf className="h-3.5 w-3.5 text-green-500" />
          )}
        </div>
        {skill.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {skill.description}
          </p>
        )}
        {skill.category && (
          <Badge variant="secondary" className="text-xs mt-1.5">
            {skill.category}
          </Badge>
        )}
      </div>
      {isSelected && (
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      )}
    </div>
  );
}

function CompetencyRow({ 
  competency, 
  isSelected, 
  onToggle,
  getTypeColor
}: { 
  competency: MasterCompetency; 
  isSelected: boolean; 
  onToggle: () => void;
  getTypeColor: (type: string) => string;
}) {
  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-primary/5 border-primary/30' 
          : 'bg-card hover:bg-muted/50 border-border/50'
      }`}
      onClick={onToggle}
    >
      <Checkbox 
        checked={isSelected} 
        onCheckedChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{competency.competency_name}</span>
          <Badge variant="outline" className={`text-xs ${getTypeColor(competency.competency_type)}`}>
            {competency.competency_type}
          </Badge>
        </div>
        {competency.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {competency.description}
          </p>
        )}
        {competency.category && (
          <Badge variant="secondary" className="text-xs mt-1.5">
            {competency.category}
          </Badge>
        )}
      </div>
      {isSelected && (
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      )}
    </div>
  );
}
