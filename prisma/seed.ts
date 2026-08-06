import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Automatically load .env.local or .env if process.env.DATABASE_URL is not set
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

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma seeding...');

  // Default Prayer Themes
  const defaultThemes = [
    { id: 1, label: 'Missões e Evangelismo', order: 1 },
    { id: 2, label: 'Famílias da Congregação', order: 2 },
    { id: 3, label: 'Autoridades e Governo', order: 3 },
    { id: 4, label: 'Jovens e Crianças', order: 4 },
    { id: 5, label: 'Liderança da Igreja', order: 5 },
    { id: 6, label: 'Enfermos e Necessitados', order: 6 },
    { id: 7, label: 'Edificação e Discipulado', order: 7 },
  ];

  for (const theme of defaultThemes) {
    await prisma.prayerTheme.upsert({
      where: { id: theme.id },
      update: { label: theme.label, order: theme.order },
      create: { id: theme.id, label: theme.label, order: theme.order, active: true },
    });
  }

  // Default Veredas IBO Categories (Curadoria)
  const defaultCategories = [
    { nome: 'Bíblia e Interpretação', slug: 'biblia-e-interpretacao', descricao: 'Estudos bíblicos, hermenêutica e exegese pastoral', ordem: 1 },
    { nome: 'Teologia Sistemática', slug: 'teologia-sistematica', descricao: 'Doutrinas fundamentais da fé cristã', ordem: 2 },
    { nome: 'História da Igreja', slug: 'historia-da-igreja', descricao: 'História do cristianismo, reforma e teologia histórica', ordem: 3 },
    { nome: 'Tradição Batista', slug: 'tradicao-batista', descricao: 'Princípios, história e identidade batista', ordem: 4 },
    { nome: 'Vida Cristã', slug: 'vida-crista', descricao: 'Espiritualidade, santificação e prática cristã diária', ordem: 5 },
    { nome: 'Igreja e Ministério', slug: 'igreja-e-ministerio', descricao: 'Eclesiologia, liderança, missões e pastoreio', ordem: 6 },
    { nome: 'Família e Aconselhamento', slug: 'familia-e-aconselhamento', descricao: 'Casamento, criação de filhos e vida familiar', ordem: 7 },
    { nome: 'Apologética e Cosmovisão', slug: 'apologetica-e-cosmovisao', descricao: 'Defesa da fé e engajamento cultural', ordem: 8 },
  ];

  for (const cat of defaultCategories) {
    await prisma.curadoriaCategoria.upsert({
      where: { slug: cat.slug },
      update: { nome: cat.nome, descricao: cat.descricao, ordem: cat.ordem, ativa: true },
      create: { nome: cat.nome, slug: cat.slug, descricao: cat.descricao, ordem: cat.ordem, ativa: true },
    });
  }

  console.log('✅ Prisma seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
