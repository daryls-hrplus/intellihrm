import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalReferenceSearchProps {
  query: string;
  setQuery: (query: string) => void;
  isSearching: boolean;
  totalResults: number;
  onClear: () => void;
  className?: string;
}

export function GlobalReferenceSearch({
  query,
  setQuery,
  isSearching,
  totalResults,
  onClear,
  className,
}: GlobalReferenceSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear and blur
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        if (query) {
          onClear();
        } else {
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [query, onClear]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
          isSearching ? "text-primary animate-pulse" : "text-muted-foreground"
        )} />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search all reference data... (codes, names, descriptions)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-24 h-11 text-base"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>
      {query.length > 0 && query.length < 2 && (
        <p className="absolute left-0 top-full mt-1 text-xs text-muted-foreground">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}
