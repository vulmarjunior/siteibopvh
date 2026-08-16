import { spawnSync } from 'node:child_process';

if (process.env.VERCEL_ENV !== 'production') {
  console.log('[veredas-price-migration] Ignorada fora de produção.');
  process.exit(0);
}

const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(executable, [
  'prisma',
  'db',
  'execute',
  '--file',
  'prisma/migrations/20260816120000_add_veredas_access_price_cache/migration.sql',
  '--schema',
  'prisma/schema.prisma',
], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error('[veredas-price-migration] Falha ao iniciar a migração:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
