
-- Fix overly permissive INSERT policy on profiles
-- The trigger runs as SECURITY DEFINER so it bypasses RLS
-- We can restrict the INSERT policy to only allow self-insert
DROP POLICY "System can insert profiles" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
