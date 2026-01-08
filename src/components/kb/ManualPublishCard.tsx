// Card component for displaying manual publish status

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  RefreshCw, 
  Eye, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  History,
  Shield,
  Users,
  HelpCircle,
  BookOpen,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, typeof Shield> = {
  Shield,
  Users,
  HelpCircle,
  BookOpen,
  Target,
};

interface ManualPublishCardProps {
  manual: {
    id: string;
    name: string;
    version: string;
    sectionsCount: number;
    icon: string;
    color: string;
  };
  status: {
    isPublished: boolean;
    publishedVersion: string | null;
    sourceVersion: string;
    needsSync: boolean;
    sectionsPublished: number;
    sectionsTotal: number;
    publishedAt?: string;
  };
  onPublish: () => void;
  onSync: () => void;
  onViewHistory: () => void;
  onPreview: () => void;
}

export function ManualPublishCard({
  manual,
  status,
  onPublish,
  onSync,
  onViewHistory,
  onPreview,
}: ManualPublishCardProps) {
  const Icon = ICON_MAP[manual.icon] || BookOpen;
  const progressPercent = status.sectionsTotal > 0 
    ? (status.sectionsPublished / status.sectionsTotal) * 100 
    : 0;

  return (
    <Card className={cn(
      "transition-all",
      status.needsSync && "border-amber-500/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", manual.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{manual.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Source: {manual.version}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!status.isPublished && (
              <Badge variant="outline" className="bg-slate-50 text-slate-600">
                <Clock className="h-3 w-3 mr-1" />
                Not Published
              </Badge>
            )}
            {status.isPublished && !status.needsSync && (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Published {status.publishedVersion}
              </Badge>
            )}
            {status.isPublished && status.needsSync && (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                Update Available
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {status.sectionsPublished} of {status.sectionsTotal} sections published
            </span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Publication info */}
        {status.isPublished && status.publishedAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last published: {format(new Date(status.publishedAt), 'MMM d, yyyy h:mm a')}
          </div>
        )}

        {/* Sync info */}
        {status.needsSync && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Manual has been updated
                </p>
                <p className="text-amber-600 dark:text-amber-500 mt-0.5">
                  Source version ({status.sourceVersion}) differs from published version ({status.publishedVersion})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          {status.isPublished && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewHistory}
            >
              <History className="h-4 w-4 mr-1" />
              History
            </Button>
          )}
          
          <div className="flex-1" />
          
          {!status.isPublished ? (
            <Button onClick={onPublish}>
              <Upload className="h-4 w-4 mr-2" />
              Publish to Help Center
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : status.needsSync ? (
            <Button onClick={onSync} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Updates
            </Button>
          ) : (
            <Button onClick={onPublish} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Republish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
