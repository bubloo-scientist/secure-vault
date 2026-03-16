-- Add proper foreign keys for relationship-based profile lookups
ALTER TABLE public.files_metadata
  DROP CONSTRAINT IF EXISTS files_metadata_uploaded_by_fkey;

ALTER TABLE public.files_metadata
  ADD CONSTRAINT files_metadata_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.activity_log
  DROP CONSTRAINT IF EXISTS activity_log_user_id_fkey;

ALTER TABLE public.activity_log
  ADD CONSTRAINT activity_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Allow authenticated users to create folder placeholders in storage only if they can upload
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vault-files'
  AND (
    EXISTS (
      SELECT 1
      FROM public.user_permissions
      WHERE user_id = auth.uid() AND can_upload = true
    )
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- Ensure folder/file activity appears in realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.files_metadata;