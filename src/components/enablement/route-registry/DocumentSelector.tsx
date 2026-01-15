import { BookOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentType, DOCUMENT_REGISTRY } from "@/types/documentValidation";

interface DocumentSelectorProps {
  selected: DocumentType;
  onSelect: (doc: DocumentType) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  FileText
};

export function DocumentSelector({ selected, onSelect }: DocumentSelectorProps) {
  const documents = Object.values(DOCUMENT_REGISTRY);

  return (
    <div className="flex gap-2">
      {documents.map((doc) => {
        const Icon = ICON_MAP[doc.icon] || FileText;
        const isSelected = selected === doc.type;

        return (
          <button
            key={doc.type}
            onClick={() => onSelect(doc.type)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
              "hover:bg-muted/50",
              isSelected 
                ? "border-primary bg-primary/5 text-primary font-medium" 
                : "border-border text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm">{doc.name}</span>
          </button>
        );
      })}
    </div>
  );
}
