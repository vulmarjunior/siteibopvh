import { PrismaClient } from '@prisma/client';
import { createAdminAuthRouter } from '../src/api/admin/auth.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';
export default createVercelRouterHandler(createAdminAuthRouter(new PrismaClient()));
