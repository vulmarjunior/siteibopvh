-- Mantém a trilha Prisma alinhada à migration oficial do Supabase.
ALTER TYPE "CuradoriaPapelUsuario" ADD VALUE IF NOT EXISTS 'EDITOR';
ALTER TYPE "CuradoriaPapelUsuario" ADD VALUE IF NOT EXISTS 'OPERADOR';
