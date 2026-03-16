
-- Storage RLS policies for vault-files bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vault-files');

CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'vault-files');

CREATE POLICY "Users with delete perm can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vault-files' AND (
    EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = auth.uid() AND can_delete = true)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Enable realtime for activity_log
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- Create trigger to log user registrations
CREATE OR REPLACE FUNCTION public.log_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.activity_log (user_id, action, details)
  VALUES (NEW.id, 'USER_REGISTERED', 'New user registered: ' || COALESCE(NEW.email, ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_registration();
