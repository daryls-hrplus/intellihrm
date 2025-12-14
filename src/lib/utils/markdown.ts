import { marked } from 'marked';

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Convert markdown content to HTML
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  try {
    return marked.parse(markdown) as string;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Fallback to basic line break conversion
    return markdown.replace(/\n/g, '<br />');
  }
}
