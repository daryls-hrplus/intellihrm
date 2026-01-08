// Transform manual content to Knowledge Base articles

import type { 
  ManualSection, 
  TransformedArticle, 
  ManualDefinition, 
  ManualSectionDefinition 
} from "@/types/kb.types";

export type { TransformedArticle, ManualDefinition, ManualSectionDefinition };

export class ManualToKBTransformer {
  /**
   * Transform manual sections to KB articles
   */
  static transformSections(
    manual: ManualDefinition,
    selectedSectionIds: string[]
  ): TransformedArticle[] {
    const articles: TransformedArticle[] = [];
    
    const processSection = (
      section: ManualSectionDefinition,
      parentId: string | null = null
    ) => {
      // Only include selected sections
      if (!selectedSectionIds.includes(section.id)) {
        // Still process children in case they're selected
        section.subsections?.forEach(sub => processSection(sub, section.id));
        return;
      }

      const article = this.transformSection(section, manual, parentId);
      articles.push(article);

      // Process subsections
      section.subsections?.forEach(sub => processSection(sub, section.id));
    };

    manual.sections.forEach(section => processSection(section));

    return articles;
  }

  /**
   * Transform a single section to an article
   */
  static transformSection(
    section: ManualSectionDefinition,
    manual: ManualDefinition,
    parentId: string | null
  ): TransformedArticle {
    const content = this.cleanContent(section.content);
    const excerpt = this.generateExcerpt(content);
    const readTime = this.estimateReadTime(content);

    return {
      id: `${manual.id}-${section.id}`,
      title: section.title,
      content,
      excerpt,
      sourceManualId: manual.id,
      sourceManualVersion: manual.version,
      sourceSectionId: section.id,
      order: section.order,
      parentId,
      metadata: {
        estimatedReadTime: readTime,
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Clean and normalize content
   */
  static cleanContent(content: string): string {
    if (!content) return '';

    // Remove excessive whitespace
    let cleaned = content.replace(/\n{3,}/g, '\n\n');
    
    // Ensure proper heading hierarchy
    cleaned = this.normalizeHeadings(cleaned);
    
    // Convert any HTML to markdown
    cleaned = this.htmlToMarkdown(cleaned);
    
    return cleaned.trim();
  }

  /**
   * Normalize heading hierarchy
   */
  static normalizeHeadings(content: string): string {
    // Ensure content starts with proper heading level
    const lines = content.split('\n');
    const headingLevels: number[] = [];
    
    lines.forEach(line => {
      const match = line.match(/^(#{1,6})\s/);
      if (match) {
        headingLevels.push(match[1].length);
      }
    });

    // If first heading is h1, shift all down
    if (headingLevels.length > 0 && headingLevels[0] === 1) {
      return content.replace(/^(#{1,5})(\s)/gm, (_, hashes, space) => {
        return '#' + hashes + space;
      });
    }

    return content;
  }

  /**
   * Convert basic HTML to markdown
   */
  static htmlToMarkdown(content: string): string {
    let converted = content;

    // Convert headers
    converted = converted.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
    converted = converted.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
    converted = converted.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
    converted = converted.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1');
    
    // Convert bold and italic
    converted = converted.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    converted = converted.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    converted = converted.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    converted = converted.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    
    // Convert links
    converted = converted.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Convert lists
    converted = converted.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1');
    converted = converted.replace(/<\/?[uo]l[^>]*>/gi, '');
    
    // Convert code
    converted = converted.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    converted = converted.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```');
    
    // Remove remaining HTML tags
    converted = converted.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    converted = this.decodeHTMLEntities(converted);

    return converted;
  }

  /**
   * Decode HTML entities
   */
  static decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
      '&mdash;': '—',
      '&ndash;': '–',
      '&hellip;': '…',
    };

    let decoded = text;
    Object.entries(entities).forEach(([entity, char]) => {
      decoded = decoded.replace(new RegExp(entity, 'g'), char);
    });

    return decoded;
  }

  /**
   * Generate excerpt from content
   */
  static generateExcerpt(content: string, maxLength: number = 200): string {
    if (!content) return '';

    // Remove markdown formatting
    let plain = content
      .replace(/^#{1,6}\s+/gm, '') // Remove headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    // Truncate
    if (plain.length <= maxLength) return plain;

    // Find last complete sentence or word
    const truncated = plain.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastPeriod > maxLength * 0.5) {
      return truncated.substring(0, lastPeriod + 1);
    } else if (lastSpace > maxLength * 0.5) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Estimate read time in minutes
   */
  static estimateReadTime(content: string): number {
    if (!content) return 1;

    // Average reading speed: 200 words per minute
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);

    return Math.max(1, minutes);
  }

  /**
   * Generate mock sections for a manual (for development)
   */
  static generateMockSections(manualId: string, count: number = 20): ManualSection[] {
    const sections: ManualSection[] = [];
    const partsCount = Math.ceil(count / 5);

    for (let part = 1; part <= partsCount; part++) {
      const partId = `${manualId}-part-${part}`;
      sections.push({
        id: partId,
        title: `Part ${part}: ${this.getPartTitle(manualId, part)}`,
        parentId: null,
        order: part,
        status: 'new',
      });

      // Add subsections
      const subCount = Math.min(5, count - (part - 1) * 5);
      for (let sub = 1; sub <= subCount; sub++) {
        const sectionNumber = (part - 1) * 5 + sub;
        sections.push({
          id: `${manualId}-sec-${sectionNumber}`,
          title: `${part}.${sub} ${this.getSectionTitle(manualId, sectionNumber)}`,
          parentId: partId,
          order: sub,
          status: sectionNumber % 3 === 0 ? 'changed' : sectionNumber % 4 === 0 ? 'published' : 'new',
          content: `Content for section ${part}.${sub}`,
        });
      }
    }

    return sections;
  }

  /**
   * Get part title based on manual type
   */
  private static getPartTitle(manualId: string, part: number): string {
    const titles: Record<string, string[]> = {
      'workforce': [
        'Employee Management',
        'Position Configuration',
        'Organizational Structure',
        'Job Architecture',
        'Reporting & Analytics',
      ],
      'hr-hub': [
        'Getting Started',
        'Request Management',
        'Case Handling',
        'Knowledge Base',
        'Analytics',
      ],
      'appraisals': [
        'System Setup',
        'Appraisal Templates',
        'Review Cycles',
        'Ratings & Calibration',
        'Reports',
      ],
      'admin-security': [
        'User Management',
        'Role Configuration',
        'Security Policies',
        'Audit & Compliance',
        'System Settings',
      ],
      'goals': [
        'Goal Framework',
        'Cascading Goals',
        'Progress Tracking',
        'Review Integration',
        'Analytics',
      ],
    };

    const manualTitles = titles[manualId] || titles['workforce'];
    return manualTitles[(part - 1) % manualTitles.length];
  }

  /**
   * Get section title
   */
  private static getSectionTitle(manualId: string, section: number): string {
    const baseTitles = [
      'Overview',
      'Configuration',
      'Setup Wizard',
      'Field Mapping',
      'Validation Rules',
      'Workflow Settings',
      'Notifications',
      'Access Control',
      'Data Import',
      'Reporting',
      'Best Practices',
      'Troubleshooting',
      'Advanced Settings',
      'Integration Points',
      'API Reference',
      'Migration Guide',
      'Performance Tips',
      'Security Guidelines',
      'Audit Trail',
      'Archive & Retention',
    ];

    return baseTitles[(section - 1) % baseTitles.length];
  }
}
