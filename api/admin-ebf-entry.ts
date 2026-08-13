import { PrismaClient } from '@prisma/client';
import { createAdminEbfRouter } from '../src/api/admin/ebf.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';
export default createVercelRouterHandler(createAdminEbfRouter(new PrismaClient()));
