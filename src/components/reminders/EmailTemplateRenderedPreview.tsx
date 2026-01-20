import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Code, Eye } from 'lucide-react';
import { substitutePreviewPlaceholders, isHtmlContent, type PreviewReplacementOptions } from './templatePreviewReplacements';
import { cn } from '@/lib/utils';

interface EmailTemplateRenderedPreviewProps {
  subject: string;
  body: string;
  replacementOptions?: PreviewReplacementOptions;
  className?: string;
  showSourceToggle?: boolean;
  maxHeight?: string;
}

/**
 * Renders email template content with proper HTML interpretation.
 * Uses a sandboxed iframe for HTML content to prevent XSS and style pollution.
 * Falls back to plain text rendering for non-HTML content.
 */
export function EmailTemplateRenderedPreview({
  subject,
  body,
  replacementOptions = {},
  className,
  showSourceToggle = true,
  maxHeight = '400px',
}: EmailTemplateRenderedPreviewProps) {
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered');
  
  const processedSubject = useMemo(
    () => substitutePreviewPlaceholders(subject, replacementOptions),
    [subject, replacementOptions]
  );
  
  const processedBody = useMemo(
    () => substitutePreviewPlaceholders(body, replacementOptions),
    [body, replacementOptions]
  );
  
  const isHtml = useMemo(() => isHtmlContent(body), [body]);
  
  // Build the HTML document for the iframe
  const iframeSrcDoc = useMemo(() => {
    // Wrap the content in a basic email-like container with safe styles
    const safeBody = processedBody
      // Convert action_url placeholders that might be in href to safe links
      .replace(/href=["']#["']/g, 'href="#" onclick="return false;"');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
              background: transparent;
              margin: 0;
              padding: 16px;
            }
            p {
              margin: 0 0 1em 0;
            }
            ul, ol {
              margin: 0 0 1em 0;
              padding-left: 1.5em;
            }
            li {
              margin-bottom: 0.25em;
            }
            a {
              color: #2563eb;
              text-decoration: underline;
            }
            a:hover {
              color: #1d4ed8;
            }
            strong, b {
              font-weight: 600;
            }
            h1, h2, h3, h4, h5, h6 {
              margin: 0 0 0.5em 0;
              font-weight: 600;
              line-height: 1.3;
            }
            h1 { font-size: 1.5em; }
            h2 { font-size: 1.25em; }
            h3 { font-size: 1.1em; }
            /* Button-like links */
            a[style*="background"], 
            a.button,
            .btn {
              display: inline-block;
              padding: 10px 20px;
              background-color: #2563eb;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            td, th {
              padding: 8px;
              border: 1px solid #e5e7eb;
            }
            hr {
              border: none;
              border-top: 1px solid #e5e7eb;
              margin: 1em 0;
            }
          </style>
        </head>
        <body>${safeBody}</body>
      </html>
    `;
  }, [processedBody]);
  
  // For plain text, convert line breaks to <br> tags
  const plainTextAsHtml = useMemo(() => {
    if (isHtml) return '';
    return processedBody
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }, [processedBody, isHtml]);
  
  const plainTextIframeSrcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
              background: transparent;
              margin: 0;
              padding: 16px;
            }
          </style>
        </head>
        <body>${plainTextAsHtml}</body>
      </html>
    `;
  }, [plainTextAsHtml]);
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Subject */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Subject</p>
        <p className="font-medium">{processedSubject}</p>
      </div>
      
      {/* View Mode Toggle */}
      {showSourceToggle && isHtml && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={viewMode === 'rendered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('rendered')}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </Button>
          <Button
            variant={viewMode === 'source' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('source')}
          >
            <Code className="h-3.5 w-3.5 mr-1" />
            Source
          </Button>
        </div>
      )}
      
      {/* Body Content */}
      {viewMode === 'source' ? (
        <div 
          className="p-4 bg-muted rounded-lg overflow-auto font-mono text-xs whitespace-pre-wrap"
          style={{ maxHeight }}
        >
          {processedBody}
        </div>
      ) : (
        <div 
          className="bg-muted rounded-lg overflow-hidden"
          style={{ maxHeight }}
        >
          <iframe
            srcDoc={isHtml ? iframeSrcDoc : plainTextIframeSrcDoc}
            title="Email preview"
            sandbox=""
            className="w-full border-0"
            style={{ 
              minHeight: '200px',
              height: 'auto',
              maxHeight,
            }}
            onLoad={(e) => {
              // Auto-resize iframe to content
              const iframe = e.target as HTMLIFrameElement;
              if (iframe.contentDocument?.body) {
                const height = iframe.contentDocument.body.scrollHeight;
                iframe.style.height = `${Math.min(height + 32, parseInt(maxHeight))}px`;
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
