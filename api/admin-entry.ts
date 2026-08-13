import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createAdminAuthRouter } from '../src/api/admin/auth.js';
import { createAdminEbfRouter } from '../src/api/admin/ebf.js';
import { createAdminModulesRouter } from '../src/api/admin/modules.js';
import { createAdminPrayerRouter } from '../src/api/admin/prayer.js';
import { createAdminSeriesRouter } from '../src/api/admin/series.js';
import { createAdminSeriesEmailRouter } from '../src/api/admin/seriesEmail.js';
import { createAdminUsersRouter } from '../src/api/admin/users.js';

const prisma = new PrismaClient();
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/auth', createAdminAuthRouter(prisma));
app.use('/modules', createAdminModulesRouter(prisma));
app.use('/series', createAdminSeriesRouter(prisma));
app.use('/series-email', createAdminSeriesEmailRouter(prisma));
app.use('/prayer', createAdminPrayerRouter(prisma));
app.use('/ebf', createAdminEbfRouter(prisma));
app.use('/users', createAdminUsersRouter(prisma));

export default function handler(req: express.Request, res: express.Response) {
  const path = typeof req.query.path === 'string' ? req.query.path : '';
  const query = new URLSearchParams(req.query as Record<string, string>);
  query.delete('path');
  req.url = `/${path}${query.size ? `?${query}` : ''}`;
  return app(req, res);
}
