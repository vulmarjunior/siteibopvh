import { PrismaClient } from '@prisma/client';
import { createAdminPrayerRouter } from '../src/api/admin/prayer.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';
export default createVercelRouterHandler(createAdminPrayerRouter(new PrismaClient()));
