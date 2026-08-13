import express, { type Router } from 'express';

export function createVercelRouterHandler(router: Router) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(router);
  return (req: express.Request, res: express.Response) => {
    const path = typeof req.query.path === 'string' ? req.query.path : '';
    const query = new URLSearchParams(req.query as Record<string, string>);
    query.delete('path');
    req.url = `/${path}${query.size ? `?${query}` : ''}`;
    return app(req, res);
  };
}
