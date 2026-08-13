import { PrismaClient } from '@prisma/client';
import { createAdminSeriesEmailRouter } from '../src/api/admin/seriesEmail.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';
export default createVercelRouterHandler(createAdminSeriesEmailRouter(new PrismaClient()));
