import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createVeredasRouter } from '../src/api/veredas/router.js';

const prisma = new PrismaClient();
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(createVeredasRouter(prisma));

export default function handler(req: express.Request, res: express.Response) {
  const path = typeof req.query.path === 'string' ? req.query.path : '';
  const query = new URLSearchParams(req.query as Record<string, string>);
  query.delete('path');
  req.url = `/${path}${query.size ? `?${query}` : ''}`;
  return app(req, res);
}
