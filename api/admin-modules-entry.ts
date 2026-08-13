import { PrismaClient } from '@prisma/client';
import { createAdminModulesRouter } from '../src/api/admin/modules.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';
export default createVercelRouterHandler(createAdminModulesRouter(new PrismaClient()));
