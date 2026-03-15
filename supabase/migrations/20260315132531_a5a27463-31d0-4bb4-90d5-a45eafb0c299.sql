
-- Create a function that makes the first user an admin automatically
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- If this is the first user, make them admin
  IF user_count <= 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.user_permissions (user_id, can_upload, can_download, can_delete, can_manage)
    VALUES (NEW.id, true, true, true, true)
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE public.profiles SET status = 'active' WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_check_first_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.make_first_user_admin();
