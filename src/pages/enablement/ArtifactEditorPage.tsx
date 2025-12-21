import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Send, X, Plus, Trash2, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { useEnablementArtifacts, useArtifact } from '@/hooks/useEnablementArtifacts';
import { useApplicationModules, useApplicationFeatures } from '@/hooks/useApplicationFeatures';
import { ArtifactStatusBadge } from '@/components/enablement/artifacts/ArtifactStatusBadge';
import { ArtifactStepEditor } from '@/components/enablement/artifacts/ArtifactStepEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  CreateArtifactInput, 
  ContentLevel, 
  RoleScope, 
  ArtifactStep 
} from '@/types/artifact';

const ROLES: RoleScope[] = ['Employee', 'Manager', 'HR User', 'Client Module Admin', 'Enablement Admin', 'Consultant'];
const CONTENT_LEVELS: { value: ContentLevel; label: string; description: string }[] = [
  { value: 'Overview', label: 'Overview', description: 'High-level introduction to a feature' },
  { value: 'How-To', label: 'How-To', description: 'Step-by-step task instructions' },
  { value: 'Advanced', label: 'Advanced', description: 'In-depth guidance for power users' },
  { value: 'Scenario', label: 'Scenario', description: 'Real-world use cases' },
  { value: 'FAQ', label: 'FAQ', description: 'Common questions and answers' },
  { value: 'Video', label: 'Video', description: 'Video script outline' }
];

export default function ArtifactEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const { createArtifact, updateArtifact, submitForReview } = useEnablementArtifacts();
  const { artifact, isLoading, fetchArtifact } = useArtifact(id);
  const { modules } = useApplicationModules();

  // Selection state
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('');
  const { features } = useApplicationFeatures(selectedModuleId || undefined);

  // Filter to only show actual modules (exclude parent categories)
  const availableModules = useMemo(() => 
    modules.filter(m => m.parent_module_code),
    [modules]
  );

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productVersion, setProductVersion] = useState('v1.0');
  const [roleScope, setRoleScope] = useState<RoleScope[]>(['Employee']);
  const [contentLevel, setContentLevel] = useState<ContentLevel>('How-To');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [preconditions, setPreconditions] = useState<string[]>([]);
  const [steps, setSteps] = useState<ArtifactStep[]>([]);
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Check if ready to generate
  const canGenerate = selectedModuleId && selectedFeatureId && roleScope.length > 0;

  useEffect(() => {
    if (id) {
      fetchArtifact();
    }
  }, [id, fetchArtifact]);

  useEffect(() => {
    if (artifact) {
      setTitle(artifact.title);
      setDescription(artifact.description || '');
      setProductVersion(artifact.product_version);
      setSelectedModuleId(artifact.module_id || '');
      setSelectedFeatureId(artifact.feature_id || '');
      setRoleScope(artifact.role_scope);
      setContentLevel(artifact.content_level);
      setLearningObjectives(artifact.learning_objective || []);
      setPreconditions(artifact.preconditions || []);
      setSteps(artifact.steps || []);
      setExpectedOutcomes(artifact.expected_outcomes || []);
      setTags(artifact.tags || []);
      setHasGenerated(true);
    }
  }, [artifact, modules]);

  const handleModuleChange = (value: string) => {
    setSelectedModuleId(value);
    setSelectedFeatureId('');
    setHasGenerated(false);
  };

  const handleFeatureChange = (value: string) => {
    setSelectedFeatureId(value);
    setHasGenerated(false);
  };

  const handleGenerateContent = async () => {
    if (!canGenerate) return;

    const module = availableModules.find(m => m.id === selectedModuleId);
    const feature = features.find(f => f.id === selectedFeatureId);
    const parentCategory = module ? modules.find(m => m.module_code === module.parent_module_code) : null;

    if (!module || !feature) {
      toast({ title: 'Error', description: 'Please complete all selections', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-artifact-content', {
        body: {
          categoryName: parentCategory?.module_name || '',
          moduleName: module.module_name,
          featureName: feature.feature_name,
          featureDescription: feature.description,
          contentLevel,
          targetRoles: roleScope,
          uiElements: feature.ui_elements,
          workflowSteps: feature.workflow_steps
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const { artifact: generatedContent } = data;

      // Populate form with generated content
      setTitle(generatedContent.title);
      setDescription(generatedContent.description || '');
      setLearningObjectives(generatedContent.learning_objectives || []);
      setPreconditions(generatedContent.preconditions || []);
      setSteps(generatedContent.steps || []);
      setExpectedOutcomes(generatedContent.expected_outcomes || []);
      setTags(generatedContent.tags || []);
      setHasGenerated(true);

      toast({ title: 'Content Generated', description: 'AI has generated your artifact content. Review and customize as needed.' });
    } catch (error) {
      console.error('Generation error:', error);
      toast({ 
        title: 'Generation Failed', 
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const input: CreateArtifactInput = {
        title,
        description: description || undefined,
        product_version: productVersion,
        module_id: selectedModuleId || undefined,
        feature_id: selectedFeatureId || undefined,
        role_scope: roleScope,
        content_level: contentLevel,
        learning_objective: learningObjectives,
        preconditions,
        steps,
        expected_outcomes: expectedOutcomes,
        tags
      };

      if (isEditing && id) {
        const updated = await updateArtifact(id, input);
        if (updated) {
          navigate(`/enablement/artifacts/${id}`);
        }
      } else {
        const created = await createArtifact(input);
        if (created) {
          navigate(`/enablement/artifacts/${created.id}`);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!id) return;
    const success = await submitForReview(id);
    if (success) {
      fetchArtifact();
    }
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const toggleRole = (role: RoleScope) => {
    if (roleScope.includes(role)) {
      if (roleScope.length > 1) {
        setRoleScope(roleScope.filter(r => r !== role));
      }
    } else {
      setRoleScope([...roleScope, role]);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Get selected names for breadcrumb display
  const selectedModule = availableModules.find(m => m.id === selectedModuleId);
  const selectedModuleName = selectedModule?.module_name;
  const selectedFeatureName = features.find(f => f.id === selectedFeatureId)?.feature_name;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/enablement/artifacts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Artifact' : 'Create Artifact'}
            </h1>
            {artifact && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{artifact.artifact_id}</span>
                <ArtifactStatusBadge status={artifact.status} size="sm" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && artifact?.status === 'draft' && (
            <Button variant="outline" onClick={handleSubmitForReview}>
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          )}
          <Button onClick={handleSave} disabled={!title.trim() || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Step 1: Selection Panel */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
            Select Content Scope
          </CardTitle>
          <CardDescription>
            Choose the module, feature, content level, and target audience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Module and Feature Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Module *</Label>
              <Select value={selectedModuleId} onValueChange={handleModuleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {availableModules.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>{mod.module_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Feature *</Label>
              <Select 
                value={selectedFeatureId} 
                onValueChange={handleFeatureChange}
                disabled={!selectedModuleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedModuleId ? "Select feature" : "Select module first"} />
                </SelectTrigger>
                <SelectContent>
                  {features.map((feat) => (
                    <SelectItem key={feat.id} value={feat.id}>{feat.feature_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selection breadcrumb */}
          {(selectedModuleName || selectedFeatureName) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
              {selectedModuleName && <span>{selectedModuleName}</span>}
              {selectedFeatureName && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium text-foreground">{selectedFeatureName}</span>
                </>
              )}
            </div>
          )}

          {/* Content Level and Roles */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Content Level *</Label>
              <Select value={contentLevel} onValueChange={(v) => setContentLevel(v as ContentLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex flex-col">
                        <span>{level.label}</span>
                        <span className="text-xs text-muted-foreground">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience *</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <Badge
                    key={role}
                    variant={roleScope.includes(role) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleRole(role)}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleGenerateContent}
              disabled={!canGenerate || isGenerating}
              size="lg"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {hasGenerated ? 'Regenerate Content' : 'Generate Content with AI'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Content Editor (shown after generation or when editing) */}
      {(hasGenerated || isEditing) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Review & Customize Content
            </CardTitle>
            <CardDescription>
              Review the AI-generated content and make any necessary adjustments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="steps">Steps ({steps.length})</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., How to Submit a Leave Request"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of what this artifact covers..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product Version</Label>
                      <Input
                        value={productVersion}
                        onChange={(e) => setProductVersion(e.target.value)}
                        placeholder="e.g., v1.0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Learning Objectives</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setLearningObjectives)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {learningObjectives.map((obj, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={obj}
                          onChange={(e) => updateListItem(setLearningObjectives, index, e.target.value)}
                          placeholder="Learning objective..."
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setLearningObjectives, index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Preconditions</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setPreconditions)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {preconditions.map((pre, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={pre}
                          onChange={(e) => updateListItem(setPreconditions, index, e.target.value)}
                          placeholder="Precondition..."
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setPreconditions, index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Expected Outcomes</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setExpectedOutcomes)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {expectedOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={outcome}
                          onChange={(e) => updateListItem(setExpectedOutcomes, index, e.target.value)}
                          placeholder="Expected outcome..."
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setExpectedOutcomes, index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Steps Tab */}
              <TabsContent value="steps">
                <ArtifactStepEditor steps={steps} onChange={setSteps} />
              </TabsContent>

              {/* Metadata Tab */}
              <TabsContent value="metadata" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Tags</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {isEditing && artifact && (
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Artifact ID</span>
                      <span className="font-mono">{artifact.artifact_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span>{artifact.version_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(artifact.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{new Date(artifact.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
