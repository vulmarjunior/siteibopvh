-- Expande o enum legado sem renomear valores existentes, preservando
-- compatibilidade com ADMIN e CURADOR em produção.
ALTER TYPE "CuradoriaPapelUsuario" ADD VALUE IF NOT EXISTS 'EDITOR';
ALTER TYPE "CuradoriaPapelUsuario" ADD VALUE IF NOT EXISTS 'OPERADOR';
