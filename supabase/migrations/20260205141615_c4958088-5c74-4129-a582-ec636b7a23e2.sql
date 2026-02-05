-- Create manual_content table for streamed documentation
-- This replaces 600+ React components with runtime-loaded markdown

CREATE TABLE public.manual_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  read_time_minutes INTEGER DEFAULT 5,
  target_roles JSONB DEFAULT '["all"]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  chapter_order INTEGER NOT NULL DEFAULT 0,
  parent_section_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint on manual_id + section_id
ALTER TABLE public.manual_content 
ADD CONSTRAINT manual_content_unique_section UNIQUE (manual_id, section_id);

-- Create indexes for common queries
CREATE INDEX idx_manual_content_manual_id ON public.manual_content(manual_id);
CREATE INDEX idx_manual_content_chapter_id ON public.manual_content(manual_id, chapter_id);
CREATE INDEX idx_manual_content_order ON public.manual_content(manual_id, chapter_order, order_index);

-- Enable full-text search
ALTER TABLE public.manual_content ADD COLUMN search_vector tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content_markdown, '')), 'B')
  ) STORED;

CREATE INDEX idx_manual_content_search ON public.manual_content USING GIN(search_vector);

-- Enable Row Level Security
ALTER TABLE public.manual_content ENABLE ROW LEVEL SECURITY;

-- Public read access (manuals are public documentation)
CREATE POLICY "Manual content is publicly readable" 
ON public.manual_content 
FOR SELECT 
USING (true);

-- Only authenticated users with admin role can modify
CREATE POLICY "Admins can manage manual content" 
ON public.manual_content 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('system_admin', 'admin', 'enablement_admin')
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_manual_content_updated_at
BEFORE UPDATE ON public.manual_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();