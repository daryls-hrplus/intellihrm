import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  FileText, 
  Download, 
  ChevronDown, 
  Search, 
  Calendar,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { markdownToHtml } from "@/lib/utils/markdown";
import { toast } from "sonner";

interface PublishedManual {
  id: string;
  manual_id: string;
  manual_name: string;
  published_version: string;
  changelog: string[] | null;
  published_at: string;
}

interface VersionRelease {
  version: string;
  publishedAt: string;
  manuals: Array<{
    manualId: string;
    manualName: string;
    changelog: string[];
  }>;
}

export function AggregatedReleaseNotes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualFilter, setManualFilter] = useState<string>('all');
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all published manuals
  const { data: publishedManuals = [], isLoading } = useQuery({
    queryKey: ['aggregated-release-notes'],
    queryFn: async (): Promise<PublishedManual[]> => {
      const { data, error } = await supabase
        .from('kb_published_manuals')
        .select('id, manual_id, manual_name, published_version, changelog, published_at')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        changelog: item.changelog as string[] | null,
      }));
    },
  });

  // Get unique manual names for filter
  const manualNames = [...new Set(publishedManuals.map(m => m.manual_name))];

  // Group by version
  const versionReleases: VersionRelease[] = publishedManuals.reduce((acc, manual) => {
    const version = manual.published_version;
    let release = acc.find(r => r.version === version);
    
    if (!release) {
      release = {
        version,
        publishedAt: manual.published_at,
        manuals: [],
      };
      acc.push(release);
    }
    
    release.manuals.push({
      manualId: manual.manual_id,
      manualName: manual.manual_name,
      changelog: manual.changelog || [],
    });
    
    return acc;
  }, [] as VersionRelease[]);

  // Filter releases
  const filteredReleases = versionReleases.filter(release => {
    // Manual filter
    if (manualFilter !== 'all') {
      const hasManual = release.manuals.some(m => m.manualName === manualFilter);
      if (!hasManual) return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesVersion = release.version.toLowerCase().includes(searchLower);
      const matchesChangelog = release.manuals.some(m => 
        m.changelog.some(c => c.toLowerCase().includes(searchLower))
      );
      if (!matchesVersion && !matchesChangelog) return false;
    }
    
    return true;
  });

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => 
      prev.includes(version) 
        ? prev.filter(v => v !== version)
        : [...prev, version]
    );
  };

  const handleExportMarkdown = () => {
    let markdown = '# Release Notes\n\n';
    
    filteredReleases.forEach(release => {
      markdown += `## Version ${release.version}\n`;
      markdown += `*Released: ${formatDateForDisplay(release.publishedAt, 'MMMM d, yyyy')}*\n\n`;
      
      release.manuals.forEach(manual => {
        markdown += `### ${manual.manualName}\n\n`;
        if (manual.changelog.length > 0) {
          manual.changelog.forEach(change => {
            markdown += `- ${change}\n`;
          });
        } else {
          markdown += `*No changelog entries*\n`;
        }
        markdown += '\n';
      });
      
      markdown += '---\n\n';
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'release-notes.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Release notes exported');
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('release-manager-agent', {
        body: { 
          action: 'generate_changelog',
          context: { manuals: manualFilter !== 'all' ? [manualFilter] : undefined }
        },
      });

      if (error) throw error;
      
      if (data?.changelog) {
        // Could display in a modal or copy to clipboard
        navigator.clipboard.writeText(data.changelog);
        toast.success('AI-generated changelog copied to clipboard');
      }
    } catch (error) {
      console.error('Generate error:', error);
      toast.error('Failed to generate changelog');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aggregated Release Notes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate with AI
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportMarkdown}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Markdown
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search changelog entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={manualFilter} onValueChange={setManualFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by manual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manuals</SelectItem>
              {manualNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReleases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No release notes found.</p>
            <p className="text-sm">Publish manuals to see their changelogs here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReleases.map((release) => (
              <Collapsible 
                key={release.version}
                open={expandedVersions.includes(release.version)}
                onOpenChange={() => toggleVersion(release.version)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        v{release.version}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDateForDisplay(release.publishedAt, 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {release.manuals.length} manual{release.manuals.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      expandedVersions.includes(release.version) ? 'rotate-180' : ''
                    }`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-3 pl-4 border-l-2 border-primary/20 ml-4">
                    {release.manuals.map((manual) => (
                      <div key={manual.manualId} className="p-3 rounded-lg bg-muted/30">
                        <div className="font-medium mb-2">{manual.manualName}</div>
                        {manual.changelog.length > 0 ? (
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {manual.changelog.map((change, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span 
                                  dangerouslySetInnerHTML={{ 
                                    __html: markdownToHtml(change) 
                                  }} 
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No changelog entries for this version
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
