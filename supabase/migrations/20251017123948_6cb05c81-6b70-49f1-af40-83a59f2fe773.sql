-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  parsed_data JSONB,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents table
CREATE POLICY "Anyone can view documents"
  ON public.documents
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upload documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update documents"
  ON public.documents
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete documents"
  ON public.documents
  FOR DELETE
  USING (true);

-- Storage policies for documents bucket
CREATE POLICY "Anyone can view documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Anyone can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can update documents"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'documents');

CREATE POLICY "Anyone can delete documents"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'documents');

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();