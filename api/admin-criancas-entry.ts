import { PrismaClient } from '@prisma/client';
import { createAdminChildrensRouter } from '../src/api/admin/childrens.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';
export default createVercelRouterHandler(createAdminChildrensRouter(new PrismaClient()));
