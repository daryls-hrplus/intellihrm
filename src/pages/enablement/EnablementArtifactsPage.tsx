import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Filter } from 'lucide-react';
import { useEnablementArtifacts } from '@/hooks/useEnablementArtifacts';
import { useApplicationModules } from '@/hooks/useApplicationFeatures';
import { ArtifactStatusBadge } from '@/components/enablement/artifacts/ArtifactStatusBadge';
import { format } from 'date-fns';
import type { ArtifactStatus } from '@/types/artifact';

export default function EnablementArtifactsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArtifactStatus | 'all'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  
  const { artifacts, isLoading, fetchArtifacts } = useEnablementArtifacts({
    status: statusFilter === 'all' ? undefined : statusFilter,
    moduleId: moduleFilter === 'all' ? undefined : moduleFilter,
    search: search || undefined
  });
  
  const { modules } = useApplicationModules();

  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enablement Artifacts</h1>
          <p className="text-muted-foreground mt-1">
            Single source of truth for all enablement content
          </p>
        </div>
        <Button onClick={() => navigate('/enablement/artifacts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Artifact
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artifacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ArtifactStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((mod) => (
                  <SelectItem key={mod.id} value={mod.id}>{mod.module_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Artifacts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : artifacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No artifacts found</h3>
            <p className="text-muted-foreground mb-4">Create your first enablement artifact to get started</p>
            <Button onClick={() => navigate('/enablement/artifacts/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Artifact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {artifacts.map((artifact) => (
            <Card 
              key={artifact.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(`/enablement/artifacts/${artifact.id}`)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ArtifactStatusBadge status={artifact.status} size="sm" />
                      <Badge variant="outline" className="text-xs">{artifact.content_level}</Badge>
                      <span className="text-xs text-muted-foreground">v{artifact.version_number}</span>
                    </div>
                    <h3 className="font-semibold truncate">{artifact.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{artifact.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{artifact.artifact_id}</span>
                      {artifact.module && <span>{artifact.module.module_name}</span>}
                      <span>{artifact.steps?.length || 0} steps</span>
                      <span>Updated {format(new Date(artifact.updated_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {artifact.role_scope.slice(0, 2).map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                    ))}
                    {artifact.role_scope.length > 2 && (
                      <Badge variant="secondary" className="text-xs">+{artifact.role_scope.length - 2}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
