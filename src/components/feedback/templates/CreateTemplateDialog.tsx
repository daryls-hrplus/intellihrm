import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { useCreateTemplate } from '@/hooks/feedback/useCycleTemplates';

interface CreateTemplateDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTemplateDialog({ companyId, open, onOpenChange }: CreateTemplateDialogProps) {
  const createTemplate = useCreateTemplate();
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [cycleType, setCycleType] = useState('360_feedback');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Rater configuration
  const [includeSelfReview, setIncludeSelfReview] = useState(true);
  const [includeManagerReview, setIncludeManagerReview] = useState(true);
  const [includePeerReview, setIncludePeerReview] = useState(true);
  const [includeDirectReportReview, setIncludeDirectReportReview] = useState(false);
  const [minPeerReviewers, setMinPeerReviewers] = useState(2);
  const [maxPeerReviewers, setMaxPeerReviewers] = useState(5);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCreate = () => {
    if (!templateName.trim()) return;
    
    createTemplate.mutate({
      companyId,
      templateName: templateName.trim(),
      templateDescription: description.trim() || undefined,
      cycleType,
      includeSelfReview,
      includeManagerReview,
      includePeerReview,
      includeDirectReportReview,
      minPeerReviewers,
      maxPeerReviewers,
      tags: tags.length > 0 ? tags : undefined,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setTemplateName('');
    setDescription('');
    setCycleType('360_feedback');
    setTagInput('');
    setTags([]);
    setIncludeSelfReview(true);
    setIncludeManagerReview(true);
    setIncludePeerReview(true);
    setIncludeDirectReportReview(false);
    setMinPeerReviewers(2);
    setMaxPeerReviewers(5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Cycle Template</DialogTitle>
          <DialogDescription>
            Create a reusable template for 360 feedback cycles. Templates can be used to quickly launch new cycles with pre-configured settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label>Template Name *</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Annual Leadership 360"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Cycle Type</Label>
            <Select value={cycleType} onValueChange={setCycleType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="360_feedback">360° Feedback</SelectItem>
                <SelectItem value="manager_360">Manager 360</SelectItem>
                <SelectItem value="peer_only">Peer Feedback Only</SelectItem>
                <SelectItem value="upward_feedback">Upward Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rater Configuration */}
          <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
            <Label className="text-sm font-medium">Review Types Included</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Self Review</Label>
                <Switch checked={includeSelfReview} onCheckedChange={setIncludeSelfReview} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Manager Review</Label>
                <Switch checked={includeManagerReview} onCheckedChange={setIncludeManagerReview} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Peer Review</Label>
                <Switch checked={includePeerReview} onCheckedChange={setIncludePeerReview} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Direct Reports</Label>
                <Switch checked={includeDirectReportReview} onCheckedChange={setIncludeDirectReportReview} />
              </div>
            </div>

            {includePeerReview && (
              <div className="flex items-center gap-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min Peers</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={minPeerReviewers}
                    onChange={(e) => setMinPeerReviewers(parseInt(e.target.value) || 1)}
                    className="w-20 h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max Peers</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={maxPeerReviewers}
                    onChange={(e) => setMaxPeerReviewers(parseInt(e.target.value) || 5)}
                    className="w-20 h-8"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!templateName.trim() || createTemplate.isPending}
          >
            {createTemplate.isPending ? 'Creating...' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
