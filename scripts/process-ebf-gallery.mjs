#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir, stat, access } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('  sharp not available — using original images (no WebP optimization)');
  sharp = null;
}

const ROOT = process.cwd();
const EBFIMG_DIR = join(ROOT, 'EBFIMG');
const OUTPUT_DIR = join(ROOT, 'public', 'images', 'ebf-gallery');
const MANIFEST_PATH = join(ROOT, 'src', 'data', 'ebf-gallery.generated.json');
const CONFIG_PATH = join(EBFIMG_DIR, 'gallery.config.json');
const CACHE_PATH = join(ROOT, '.ebf-gallery-cache.json');

const VALID_EXTENSIONS = new Set(['.jpeg', '.jpg']);
const THUMB_WIDTH = 400;
const OPTIMIZED_WIDTH = 1200;
const PLACEHOLDER_SIZE = 20;
const THUMB_QUALITY = 80;
const OPT_QUALITY = 85;

const WHATSAPP_TS = /(\d{4})-(\d{2})-(\d{2})\s+at\s+(\d{2})\.(\d{2})\.(\d+)$/;

function parseTimestamp(filename) {
  const match = filename.match(WHATSAPP_TS);
  if (!match) return null;
  const [, year, month, day, hour, min, rawSec] = match;
  const secParts = rawSec.split('');
  const seconds = parseInt(secParts[0] || '0', 10);
  const subMs = secParts.length > 1
    ? parseInt(secParts.slice(1).join(''), 10) * Math.pow(10, 3 - secParts.length + 1)
    : 0;
  return new Date(Date.UTC(
    Number(year), Number(month) - 1, Number(day),
    Number(hour), Number(min), seconds, subMs
  ));
}

function fileHash(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

function slugify(filename) {
  return filename
    .replace(/WhatsApp\s+(Image|Video)\s+/gi, '')
    .replace(/\s+at\s+/gi, '-')
    .replace(/[:\s]/g, '-')
    .replace(/[^a-zA-Z0-9\-_.]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function fileExists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function loadCache() {
  try {
    let raw = await readFile(CACHE_PATH, 'utf-8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function loadConfig() {
  try {
    let raw = await readFile(CONFIG_PATH, 'utf-8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const config = JSON.parse(raw);
    console.log('  Config loaded from gallery.config.json');
    return config;
  } catch {
    console.log('  No gallery.config.json found, using defaults');
    return {};
  }
}

async function discoverImages() {
  const entries = await readdir(EBFIMG_DIR);
  const images = [];

  for (const entry of entries) {
    const ext = extname(entry).toLowerCase();
    if (!VALID_EXTENSIONS.has(ext)) continue;

    const filePath = join(EBFIMG_DIR, entry);
    const stats = await stat(filePath);
    const buffer = await readFile(filePath);
    const hash = fileHash(buffer);
    const ts = parseTimestamp(entry);
    const id = `ebf-${slugify(entry).replace(/\.(jpeg|jpg)$/, '')}`;

    images.push({
      id,
      original: entry,
      filePath,
      size: stats.size,
      mtime: stats.mtime,
      hash,
      timestamp: ts ? ts.toISOString() : stats.mtime.toISOString(),
      sortKey: ts ? ts.getTime() : 0,
    });
  }

  images.sort((a, b) => a.sortKey - b.sortKey);

  // Assign sequential IDs for stable references
  images.forEach((img, idx) => {
    img.id = `ebf-${String(idx + 1).padStart(3, '0')}`;
  });

  return images;
}

async function processImage(image, cache, force) {
  const cached = cache[image.id];
  
  // Check cache
  if (!force && cached && cached.hash === image.hash) {
    if (sharp) {
      // With sharp: check if WebP files exist
      const thumbPath = join(OUTPUT_DIR, `thumb_${image.id}.webp`);
      const optPath = join(OUTPUT_DIR, `optimized_${image.id}.webp`);
      const phPath = join(OUTPUT_DIR, `placeholder_${image.id}.webp`);
      if (await fileExists(thumbPath) && await fileExists(optPath) && await fileExists(phPath)) {
        return { ...cached, cached: true };
      }
    } else {
      // Without sharp: just reuse cached metadata
      return { ...cached, cached: true };
    }
  }

  console.log(`  Processing: ${image.original}`);

  if (sharp) {
    // Generate WebP variants with sharp
    const baseImg = sharp(image.filePath).rotate();
    const metadata = await sharp(image.filePath).metadata();

    const thumbPath = join(OUTPUT_DIR, `thumb_${image.id}.webp`);
    const optPath = join(OUTPUT_DIR, `optimized_${image.id}.webp`);
    const phPath = join(OUTPUT_DIR, `placeholder_${image.id}.webp`);

    await Promise.all([
      baseImg.clone().resize(THUMB_WIDTH).webp({ quality: THUMB_QUALITY }).toFile(thumbPath),
      baseImg.clone().resize(OPTIMIZED_WIDTH).webp({ quality: OPT_QUALITY }).toFile(optPath),
      baseImg.clone().resize(PLACEHOLDER_SIZE).blur(10).webp({ quality: 20 }).toFile(phPath),
    ]);

    return {
      id: image.id,
      src: `/images/ebf-gallery/optimized_${image.id}.webp`,
      thumb: `/images/ebf-gallery/thumb_${image.id}.webp`,
      placeholder: `/images/ebf-gallery/placeholder_${image.id}.webp`,
      width: metadata.width || 0,
      height: metadata.height || 0,
      original: image.original,
      timestamp: image.timestamp,
      hash: image.hash,
      cached: false,
    };
  }

  // Fallback without sharp: use original JPEG directly
  const ext = extname(image.original).toLowerCase();
  const outName = `${image.id}${ext}`;
  const outPath = join(OUTPUT_DIR, outName);
  if (!await fileExists(outPath)) {
    const { copyFile } = await import('node:fs/promises');
    await copyFile(image.filePath, outPath);
  }

  return {
    id: image.id,
    src: `/images/ebf-gallery/${outName}`,
    thumb: `/images/ebf-gallery/${outName}`,
    placeholder: `/images/ebf-gallery/${outName}`,
    width: 0,
    height: 0,
    original: image.original,
    timestamp: image.timestamp,
    hash: image.hash,
    cached: false,
  };
}

function distributeToStages(images, stageCount, config) {
  const total = images.length;
  const perStage = Math.ceil(total / stageCount);
  const stages = [];

  const defaultStageNames = [
    'Início da Jornada', 'Primeiras Pistas', 'Pelo Caminho',
    'Grandes Descobertas', 'O Tesouro Encontrado',
  ];
  const defaultClues = [
    'Uma chave antiga brilha no início do caminho...',
    'A bússola aponta para a próxima descoberta...',
    'Moedas douradas marcam o caminho percorrido...',
    'Uma pedra preciosa aguarda ser encontrada...',
    'O maior tesouro estava no coração de cada criança!',
  ];
  const defaultIcons = ['Map', 'Binoculars', 'Footprints', 'Gem', 'Trophy'];

  for (let i = 0; i < stageCount; i++) {
    const start = i * perStage;
    const end = Math.min(start + perStage, total);
    if (start >= total) break;

    const stageImages = images.slice(start, end);
    const stageConfig = config.stages?.[String(i + 1)] || {};

    stages.push({
      id: i + 1,
      name: stageConfig.name || defaultStageNames[i] || `Etapa ${i + 1}`,
      clue: stageConfig.clue || defaultClues[i] || '',
      icon: defaultIcons[i] || 'Map',
      images: stageImages.map(img => ({
        id: img.id,
        src: img.src,
        thumb: img.thumb,
        placeholder: img.placeholder,
        width: img.width,
        height: img.height,
        original: img.original,
        timestamp: img.timestamp,
      })),
    });
  }

  return stages;
}

function selectHighlights(stages, config) {
  // From config
  if (config.photos) {
    const featured = Object.entries(config.photos)
      .filter(([, p]) => p.featured)
      .map(([filename]) => {
        // Find matching image by original filename
        for (const stage of stages) {
          const img = stage.images.find(i => i.original.includes(filename.replace(/\.[^.]+$/, '')));
          if (img) return img.id;
        }
        return null;
      })
      .filter(Boolean);
    if (featured.length > 0) return featured;
  }

  // Auto-select: first and middle image from each stage
  const highlights = [];
  for (const stage of stages) {
    if (stage.images.length > 0) highlights.push(stage.images[0].id);
    if (stage.images.length > 2) highlights.push(stage.images[Math.floor(stage.images.length / 2)].id);
  }
  return highlights.slice(0, 8);
}

async function main() {
  const force = process.argv.includes('--force');
  const watch = process.argv.includes('--watch');

  console.log('EBF Gallery Processor');
  console.log('=====================\n');

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(join(ROOT, 'src', 'data'), { recursive: true });

  const config = await loadConfig();
  const cache = await loadCache();
  const stageCount = config.settings?.journeyStages || 5;

  console.log('\nDiscovering images...');
  const images = await discoverImages();
  console.log(`  Found ${images.length} images`);

  if (images.length === 0) {
    console.log('  No images to process. Generating empty manifest.');
    const manifest = {
      generated: new Date().toISOString(),
      totalImages: 0,
      stages: [],
      highlights: [],
    };
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    return;
  }

  console.log('\nProcessing images...');
  const processed = [];
  let newCount = 0;
  let cachedCount = 0;

  for (const image of images) {
    const result = await processImage(image, cache, force);
    processed.push(result);
    if (result.cached) cachedCount++;
    else newCount++;
    cache[image.id] = { hash: image.hash, width: result.width, height: result.height };
  }

  console.log(`\n  New: ${newCount}, Cached: ${cachedCount}, Total: ${processed.length}`);

  console.log('\nBuilding manifest...');
  const stages = distributeToStages(processed, stageCount, config);
  const highlights = selectHighlights(stages, config);

  // Apply per-photo config overrides
  if (config.photos) {
    for (const stage of stages) {
      for (const img of stage.images) {
        const photoConfig = config.photos[img.original];
        if (photoConfig) {
          if (photoConfig.hidden) {
            img.hidden = true;
          }
          if (photoConfig.caption) {
            img.caption = photoConfig.caption;
          }
          if (photoConfig.downloadEnabled === false) {
            img.downloadEnabled = false;
          }
        }
      }
    }
  }

  // Filter out hidden images from stages
  for (const stage of stages) {
    stage.images = stage.images.filter(img => !img.hidden);
  }

  // Remove empty stages
  const validStages = stages.filter(s => s.images.length > 0);
  // Re-number stages
  validStages.forEach((s, i) => { s.id = i + 1; });

  const manifest = {
    generated: new Date().toISOString(),
    totalImages: processed.filter(i => !i.hidden).length,
    stages: validStages,
    highlights,
  };

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`  Manifest written to ${MANIFEST_PATH}`);

  await saveCache(cache);
  console.log('  Cache updated');

  console.log(`\nDone! ${manifest.totalImages} images in ${validStages.length} stages.`);
  if (watch) {
    console.log('\nWatch mode not yet implemented. Run again after adding images.');
  }
}

main().catch(err => {
  console.error('Gallery processor failed:', err);
  process.exit(1);
});
