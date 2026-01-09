import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface ScreenshotPlaceholderProps {
  title: string;
  description: string;
  height?: string;
}

export function ScreenshotPlaceholder({ title, description, height = "h-32" }: ScreenshotPlaceholderProps) {
  return (
    <Card className={`${height} bg-muted/30 border-dashed`}>
      <CardContent className="h-full flex flex-col items-center justify-center text-center p-4">
        <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
