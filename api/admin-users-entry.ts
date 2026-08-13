import { PrismaClient } from '@prisma/client';
import { createAdminUsersRouter } from '../src/api/admin/users.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';
export default createVercelRouterHandler(createAdminUsersRouter(new PrismaClient()));
