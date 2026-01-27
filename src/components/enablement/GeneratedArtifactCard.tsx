import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  BookOpen,
  Rocket,
  ClipboardList,
  GraduationCap,
  Copy,
  Download,
  Save,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneratedArtifact } from "@/hooks/useContentCreationAgent";
import { formatDistanceToNow } from "date-fns";

interface GeneratedArtifactCardProps {
  artifact: GeneratedArtifact;
  onSave: (artifact: GeneratedArtifact) => void;
  onCopy: (artifact: GeneratedArtifact) => void;
  onRemove: (artifactId: string) => void;
  onPreview: (artifact: GeneratedArtifact) => void;
  isSelected?: boolean;
}

const ARTIFACT_ICONS = {
  manual_section: BookOpen,
  kb_article: FileText,
  quickstart: Rocket,
  sop: ClipboardList,
  training: GraduationCap,
};

const ARTIFACT_COLORS = {
  manual_section: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  kb_article: "bg-green-500/10 text-green-500 border-green-500/20",
  quickstart: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  sop: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  training: "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

const ARTIFACT_LABELS = {
  manual_section: "Manual Section",
  kb_article: "KB Article",
  quickstart: "Quick Start",
  sop: "SOP",
  training: "Training Guide",
};

export function GeneratedArtifactCard({
  artifact,
  onSave,
  onCopy,
  onRemove,
  onPreview,
  isSelected,
}: GeneratedArtifactCardProps) {
  const Icon = ARTIFACT_ICONS[artifact.type] || FileText;
  const colorClass = ARTIFACT_COLORS[artifact.type] || ARTIFACT_COLORS.kb_article;
  const label = ARTIFACT_LABELS[artifact.type] || artifact.type;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(artifact.content);
    onCopy(artifact);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(artifact);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(artifact.id);
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-primary/50",
        isSelected && "border-primary ring-1 ring-primary"
      )}
      onClick={() => onPreview(artifact)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn("p-2 rounded-lg border", colorClass)}>
            <Icon className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-xs", colorClass)}>
                {label}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(artifact.generatedAt, { addSuffix: true })}
              </span>
            </div>
            <h4 className="text-sm font-medium truncate">{artifact.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {artifact.content.slice(0, 100)}...
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleSave}
              title="Save to artifacts"
            >
              <Save className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={handleRemove}
              title="Remove"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface GeneratedArtifactListProps {
  artifacts: GeneratedArtifact[];
  onSave: (artifact: GeneratedArtifact) => void;
  onCopy: (artifact: GeneratedArtifact) => void;
  onRemove: (artifactId: string) => void;
  onPreview: (artifact: GeneratedArtifact) => void;
  selectedArtifactId?: string;
}

export function GeneratedArtifactList({
  artifacts,
  onSave,
  onCopy,
  onRemove,
  onPreview,
  selectedArtifactId,
}: GeneratedArtifactListProps) {
  if (artifacts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Generated Content ({artifacts.length})</h3>
      </div>
      <div className="space-y-2">
        {artifacts.map((artifact) => (
          <GeneratedArtifactCard
            key={artifact.id}
            artifact={artifact}
            onSave={onSave}
            onCopy={onCopy}
            onRemove={onRemove}
            onPreview={onPreview}
            isSelected={artifact.id === selectedArtifactId}
          />
        ))}
      </div>
    </div>
  );
}
