// Knowledge Base shared types

export interface ManualSection {
  id: string;
  title: string;
  parentId: string | null;
  order: number;
  content?: string;
  status?: 'new' | 'changed' | 'unchanged' | 'published';
  lastPublishedAt?: string;
  children?: ManualSection[];
}

export interface TransformedArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  sourceManualId: string;
  sourceManualVersion: string;
  sourceSectionId: string;
  order: number;
  parentId: string | null;
  metadata: {
    prerequisites?: string[];
    relatedTopics?: string[];
    estimatedReadTime?: number;
    lastUpdated?: string;
  };
}

export interface ManualDefinition {
  id: string;
  name: string;
  version: string;
  sections: ManualSectionDefinition[];
}

export interface ManualSectionDefinition {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  order: number;
  subsections?: ManualSectionDefinition[];
}
