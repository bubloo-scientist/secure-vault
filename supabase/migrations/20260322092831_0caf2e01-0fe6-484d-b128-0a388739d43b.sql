
-- Add SELECT policy on storage.objects so authenticated users can download files
CREATE POLICY "Authenticated users can download vault files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'vault-files');
