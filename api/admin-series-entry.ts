import { PrismaClient } from '@prisma/client';
import { createAdminSeriesRouter } from '../src/api/admin/series.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';
export default createVercelRouterHandler(createAdminSeriesRouter(new PrismaClient()));
