import { PrismaClient } from '@prisma/client';
import { createAdminHomeBannersRouter } from '../src/api/admin/homeBanners.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';

export default createVercelRouterHandler(createAdminHomeBannersRouter(new PrismaClient()));
