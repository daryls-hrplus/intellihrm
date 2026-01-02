import { Link2 } from 'lucide-react';

interface RelatedTopic {
  sectionId: string;
  title: string;
}

interface RelatedTopicsProps {
  topics: RelatedTopic[];
  onNavigate?: (sectionId: string) => void;
}

export function RelatedTopics({ topics, onNavigate }: RelatedTopicsProps) {
  if (topics.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Related Topics</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic.sectionId}
            onClick={() => onNavigate?.(topic.sectionId)}
            className="text-sm text-primary hover:underline"
          >
            {topic.title}
          </button>
        ))}
      </div>
    </div>
  );
}
