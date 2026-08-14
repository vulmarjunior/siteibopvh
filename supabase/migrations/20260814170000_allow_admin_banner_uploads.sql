-- Permite uploads de banners usando a sessão do administrador.
-- Nenhuma chave privilegiada é exposta ao navegador ou exigida na Vercel.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_active_banner_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."CuradoriaUsuario" AS usuario
    WHERE usuario."id" = (SELECT auth.uid())::text
      AND usuario."ativo" = true
      AND usuario."papel" IN ('ADMIN', 'EDITOR')
  );
$$;

REVOKE ALL ON FUNCTION private.is_active_banner_manager() FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_active_banner_manager() TO authenticated;

DROP POLICY IF EXISTS "Administradores ativos enviam banners" ON storage.objects;
CREATE POLICY "Administradores ativos enviam banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-assets'
  AND (storage.foldername(name))[1] = 'home-banners'
  AND (SELECT private.is_active_banner_manager())
);

COMMIT;
