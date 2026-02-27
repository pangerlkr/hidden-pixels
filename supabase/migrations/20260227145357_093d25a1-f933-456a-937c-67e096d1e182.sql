
-- Create table to store shared stego images
CREATE TABLE public.shared_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_data TEXT NOT NULL, -- base64 encoded PNG
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.shared_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view shared images (public links)
CREATE POLICY "Anyone can view shared images"
ON public.shared_images FOR SELECT
USING (true);

-- Anyone can insert (no auth required for this tool)
CREATE POLICY "Anyone can create shared images"
ON public.shared_images FOR INSERT
WITH CHECK (true);

-- Create function to clean up expired images
CREATE OR REPLACE FUNCTION public.cleanup_expired_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.shared_images WHERE expires_at < now();
END;
$$;
