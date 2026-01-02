import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RelatedTopic {
  sectionId: string;
  title: string;
}

interface RelatedTopicsProps {
  topics: RelatedTopic[];
  onNavigate?: (sectionId: string) => void;
}

export function RelatedTopics({ topics, onNavigate }: RelatedTopicsProps) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t">
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Related Topics</h4>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Badge
            key={topic.sectionId}
            variant="outline"
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => {
              if (onNavigate) {
                onNavigate(topic.sectionId);
              } else {
                const element = document.getElementById(topic.sectionId);
                element?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            {topic.title}
          </Badge>
        ))}
      </div>
    </div>
  );
}
