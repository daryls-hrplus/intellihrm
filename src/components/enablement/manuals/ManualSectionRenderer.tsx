import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle, Lightbulb, Link2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualSectionRendererProps {
  content: string;
  title?: string;
  readTimeMinutes?: number;
  className?: string;
}

/**
 * Renders markdown content with custom components for callouts, tables, and code
 */
export function ManualSectionRenderer({ 
  content, 
  title, 
  readTimeMinutes,
  className 
}: ManualSectionRendererProps) {
  return (
    <article className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
      {title && (
        <div className="flex items-center justify-between mb-6 not-prose">
          <h2 className="text-2xl font-bold">{title}</h2>
          {readTimeMinutes && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{readTimeMinutes} min read</span>
            </div>
          )}
        </div>
      )}
      
      <ReactMarkdown
        components={{
          // Custom heading with anchor links
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4" {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 pb-2 border-b" {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2" {...props}>{children}</h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-medium mt-3 mb-2" {...props}>{children}</h4>
          ),
          
          // Tables with proper styling
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 not-prose">
              <table className="w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),
          
          // Code blocks with syntax highlighting placeholder
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                <code className="text-sm font-mono" {...props}>{children}</code>
              </pre>
            );
          },
          
          // Blockquotes as callouts (detect type from content)
          blockquote: ({ children }) => {
            const content = String(children);
            
            // Detect callout type from markers
            if (content.includes(':::info') || content.includes('ℹ️')) {
              return (
                <Alert className="my-4 border-primary/50 bg-primary/10">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>{children}</AlertDescription>
                </Alert>
              );
            }
            
            if (content.includes(':::warning') || content.includes('⚠️')) {
              return (
                <Alert className="my-4 border-destructive/50 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>{children}</AlertDescription>
                </Alert>
              );
            }
            
            if (content.includes(':::tip') || content.includes('💡')) {
              return (
                <Alert className="my-4 border-accent/50 bg-accent/10">
                  <Lightbulb className="h-4 w-4 text-accent-foreground" />
                  <AlertTitle>Tip</AlertTitle>
                  <AlertDescription>{children}</AlertDescription>
                </Alert>
              );
            }
            
            if (content.includes(':::integration') || content.includes('🔗')) {
              return (
                <Alert className="my-4 border-secondary/50 bg-secondary/10">
                  <Link2 className="h-4 w-4 text-secondary-foreground" />
                  <AlertTitle>Integration</AlertTitle>
                  <AlertDescription>{children}</AlertDescription>
                </Alert>
              );
            }
            
            return (
              <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-4">
                {children}
              </blockquote>
            );
          },
          
          // Lists with proper spacing
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-1 my-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-1 my-3">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          
          // Links with external indicator
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-primary hover:underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          
          // Paragraphs with proper spacing
          p: ({ children }) => (
            <p className="leading-relaxed my-3">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
