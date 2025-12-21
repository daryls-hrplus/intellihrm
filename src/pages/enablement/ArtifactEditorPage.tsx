import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Send, X, Plus, Trash2 } from 'lucide-react';
import { useEnablementArtifacts, useArtifact } from '@/hooks/useEnablementArtifacts';
import { useApplicationModules, useApplicationFeatures } from '@/hooks/useApplicationFeatures';
import { ArtifactStatusBadge } from '@/components/enablement/artifacts/ArtifactStatusBadge';
import { ArtifactStepEditor } from '@/components/enablement/artifacts/ArtifactStepEditor';
import type { 
  CreateArtifactInput, 
  ContentLevel, 
  RoleScope, 
  ArtifactStep,
  ROLE_SCOPE_OPTIONS,
  CONTENT_LEVEL_OPTIONS 
} from '@/types/artifact';

const ROLES: RoleScope[] = ['Employee', 'Manager', 'HR User', 'Client Module Admin', 'Enablement Admin', 'Consultant'];
const CONTENT_LEVELS: { value: ContentLevel; label: string }[] = [
  { value: 'Overview', label: 'Overview' },
  { value: 'How-To', label: 'How-To' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Scenario', label: 'Scenario' },
  { value: 'FAQ', label: 'FAQ' },
  { value: 'Video', label: 'Video' }
];

export default function ArtifactEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { createArtifact, updateArtifact, submitForReview } = useEnablementArtifacts();
  const { artifact, isLoading, fetchArtifact } = useArtifact(id);
  const { modules } = useApplicationModules();
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const { features } = useApplicationFeatures(selectedModuleId || undefined);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productVersion, setProductVersion] = useState('v1.0');
  const [moduleId, setModuleId] = useState<string>('');
  const [featureId, setFeatureId] = useState<string>('');
  const [roleScope, setRoleScope] = useState<RoleScope[]>(['Employee']);
  const [contentLevel, setContentLevel] = useState<ContentLevel>('How-To');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [preconditions, setPreconditions] = useState<string[]>([]);
  const [steps, setSteps] = useState<ArtifactStep[]>([]);
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);

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
      setModuleId(artifact.module_id || '');
      setSelectedModuleId(artifact.module_id || '');
      setFeatureId(artifact.feature_id || '');
      setRoleScope(artifact.role_scope);
      setContentLevel(artifact.content_level);
      setLearningObjectives(artifact.learning_objective || []);
      setPreconditions(artifact.preconditions || []);
      setSteps(artifact.steps || []);
      setExpectedOutcomes(artifact.expected_outcomes || []);
      setTags(artifact.tags || []);
    }
  }, [artifact]);

  const handleModuleChange = (value: string) => {
    setModuleId(value);
    setSelectedModuleId(value);
    setFeatureId(''); // Reset feature when module changes
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const input: CreateArtifactInput = {
        title,
        description: description || undefined,
        product_version: productVersion,
        module_id: moduleId || undefined,
        feature_id: featureId || undefined,
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

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="steps">Steps ({steps.length})</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about this artifact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label>Module</Label>
                  <Select value={moduleId} onValueChange={handleModuleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((mod) => (
                        <SelectItem key={mod.id} value={mod.id}>{mod.module_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Feature</Label>
                  <Select value={featureId} onValueChange={setFeatureId} disabled={!moduleId}>
                    <SelectTrigger>
                      <SelectValue placeholder={moduleId ? "Select feature" : "Select module first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {features.map((feat) => (
                        <SelectItem key={feat.id} value={feat.id}>{feat.feature_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content Level</Label>
                  <Select value={contentLevel} onValueChange={(v) => setContentLevel(v as ContentLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Product Version</Label>
                  <Input
                    value={productVersion}
                    onChange={(e) => setProductVersion(e.target.value)}
                    placeholder="e.g., v1.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>Who should see this content</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
              <CardDescription>What will users learn from this artifact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {learningObjectives.map((obj, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={obj}
                    onChange={(e) => updateListItem(setLearningObjectives, index, e.target.value)}
                    placeholder="e.g., Understand how to navigate the leave request form"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem(setLearningObjectives, index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setLearningObjectives)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Objective
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preconditions</CardTitle>
              <CardDescription>Requirements before starting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {preconditions.map((pre, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={pre}
                    onChange={(e) => updateListItem(setPreconditions, index, e.target.value)}
                    placeholder="e.g., User must be logged in"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem(setPreconditions, index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setPreconditions)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Precondition
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expected Outcomes</CardTitle>
              <CardDescription>What users will achieve</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {expectedOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => updateListItem(setExpectedOutcomes, index, e.target.value)}
                    placeholder="e.g., Leave request submitted for manager approval"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem(setExpectedOutcomes, index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setExpectedOutcomes)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Outcome
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <CardTitle>Instructional Steps</CardTitle>
              <CardDescription>Step-by-step instructions for completing the task</CardDescription>
            </CardHeader>
            <CardContent>
              <ArtifactStepEditor steps={steps} onChange={setSteps} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Keywords to help with search and categorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {isEditing && artifact && (
            <Card>
              <CardHeader>
                <CardTitle>Version Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
