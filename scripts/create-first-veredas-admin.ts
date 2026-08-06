import fs from 'fs';
import path from 'path';

// MUST LOAD ENV VARS BEFORE PRISMA CLIENT INITIALIZATION
if (!process.env.DATABASE_URL) {
  const rootDir = process.cwd();
  for (const envFile of ['.env.local', '.env']) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (key && !process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
      break;
    }
  }
}

async function createAdmin() {
  const { PrismaClient, CuradoriaPapelUsuario } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const args = process.argv.slice(2);
  const userId = args[0];
  const email = args[1];
  const nome = args[2] || 'Administrador Veredas';

  if (!userId || !email) {
    console.error('❌ Usage: npx tsx scripts/create-first-veredas-admin.ts <SUPABASE_USER_UUID> <USER_EMAIL> [USER_NAME]');
    console.error('Example: npx tsx scripts/create-first-veredas-admin.ts 12345678-1234-1234-1234-123456789abc admin@ibopvh.com.br "Pr. Vulmar"');
    process.exit(1);
  }

  console.log(`⏳ Provisioning Veredas ADMIN for user ${email} (${userId})...`);

  try {
    const usuario = await prisma.curadoriaUsuario.upsert({
      where: { id: userId },
      update: {
        email,
        nome,
        papel: CuradoriaPapelUsuario.ADMIN,
        ativo: true,
      },
      create: {
        id: userId,
        email,
        nome,
        papel: CuradoriaPapelUsuario.ADMIN,
        ativo: true,
      },
    });

    console.log(`✅ Admin user successfully registered/updated in Prisma:`);
    console.log(JSON.stringify(usuario, null, 2));
  } catch (error) {
    console.error('❌ Error provisioning admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
