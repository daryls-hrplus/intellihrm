import { MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengePromiseProps {
  challenge: string;
  promise: string;
  className?: string;
}

export function ChallengePromise({ challenge, promise, className }: ChallengePromiseProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Challenge */}
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-destructive/10">
            <MessageSquare className="h-4 w-4 text-destructive" />
          </div>
          <span className="text-sm font-semibold text-destructive uppercase tracking-wide">
            The Challenge
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          "{challenge}"
        </p>
      </div>

      {/* Promise */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">
            The Promise
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed font-medium">
          {promise}
        </p>
      </div>
    </div>
  );
}
