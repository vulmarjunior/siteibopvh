import { Request, Response, NextFunction } from 'express';
import { PrismaClient, CuradoriaPapelUsuario, CuradoriaUsuario } from '@prisma/client';
import { getSupabaseServer } from '../../lib/veredas/supabaseServer';

export interface VeredasAuthenticatedRequest extends Request {
  veredasUser?: CuradoriaUsuario;
}

/**
 * Validates Supabase Bearer Token via official SDK, extracts user UUID ('sub'),
 * and verifies active status in `CuradoriaUsuario` database table.
 */
export function createAuthMiddleware(prisma: PrismaClient) {
  return async (req: VeredasAuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.substring(7).trim();

    try {
      // Official SDK validation against Supabase Auth API
      const supabase = getSupabaseServer();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada. Efetue login novamente.' });
      }

      // Check user authorization record in Prisma
      const usuario = await prisma.curadoriaUsuario.findUnique({
        where: { id: user.id },
      });

      if (!usuario) {
        return res.status(403).json({ error: 'Usuário autenticado não cadastrado como curador ou administrador' });
      }

      if (!usuario.ativo) {
        return res.status(403).json({ error: 'Acesso suspenso ou inativo' });
      }

      // Update last access timestamp asynchronously
      prisma.curadoriaUsuario.update({
        where: { id: usuario.id },
        data: { ultimoAcessoEm: new Date() },
      }).catch((err) => console.error('Error updating last access:', err));

      req.veredasUser = usuario;
      next();
    } catch (err) {
      console.error('Veredas Auth Middleware error:', err);
      return res.status(500).json({ error: 'Falha ao processar autenticação' });
    }
  };
}

export function requireRole(role: CuradoriaPapelUsuario) {
  return (req: VeredasAuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.veredasUser) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (req.veredasUser.papel !== role && req.veredasUser.papel !== CuradoriaPapelUsuario.ADMIN) {
      return res.status(403).json({ error: 'Permissão insuficiente para esta operação' });
    }

    next();
  };
}
