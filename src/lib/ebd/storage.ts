import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const EBD_STORAGE_BUCKET = 'ebd';
export const MAX_EBD_PDF_BYTES = 50 * 1024 * 1024;

const LOCAL_UPLOAD_SECRET = process.env.EBD_LOCAL_UPLOAD_SECRET
  || crypto.randomBytes(32).toString('hex');

const PDF_PATH_PATTERN = /^ebd\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/revista-v\d+\.pdf$/;

export interface LocalUploadPayload {
  editionId: string;
  path: string;
  version: number;
  fileName: string;
  sha256: string;
  sizeBytes: number;
  pageCount: number;
  exp: number;
}

export type EbdStorageTarget =
  | { mode: 'local'; uploadUrl: string; token: string; path: string; version: number }
  | {
      mode: 'supabase';
      bucket: string;
      path: string;
      token: string;
      signedUrl: string;
      version: number;
    };

export type ResolvedPdf =
  | { kind: 'file'; path: string }
  | { kind: 'redirect'; url: string };

export function isLocalEbdStorage(): boolean {
  return process.env.NODE_ENV !== 'production' && Boolean(process.env.EBD_LOCAL_STORAGE_DIR);
}

export function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

export function sha256Buffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function sha256File(filePath: string): Promise<string> {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const hash = crypto.createHash('sha256');
    const buffer = Buffer.alloc(1024 * 1024);
    let position = 0;
    let finished = false;
    while (!finished) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);
      if (bytesRead <= 0) {
        finished = true;
        break;
      }
      hash.update(buffer.subarray(0, bytesRead));
      position += bytesRead;
    }
    return hash.digest('hex');
  } finally {
    await handle.close();
  }
}

export function classSlug(className: string): string {
  return className
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'turma';
}

export function buildPdfStoragePath(
  year: number,
  quarter: number,
  className: string,
  version: number,
): string {
  return `ebd/${year}/${quarter}/${classSlug(className)}/revista-v${version}.pdf`;
}

export function isValidPdfStoragePath(storagePath: string): boolean {
  return PDF_PATH_PATTERN.test(storagePath) && !storagePath.includes('..');
}

export function localPathForStoragePath(storagePath: string): string | null {
  const baseDirectory = process.env.EBD_LOCAL_STORAGE_DIR;
  if (!baseDirectory || !isValidPdfStoragePath(storagePath)) return null;
  const base = path.resolve(baseDirectory);
  const resolved = path.resolve(base, storagePath);
  return resolved.startsWith(base + path.sep) ? resolved : null;
}

export function localSamplePdfPath(fileName: string): string | null {
  const baseDirectory = process.env.EBD_LOCAL_PDF_DIR;
  if (!baseDirectory || !fileName) return null;
  const base = path.resolve(baseDirectory);
  const resolved = path.resolve(base, path.basename(fileName));
  return resolved.startsWith(base + path.sep) ? resolved : null;
}

export async function saveLocalPdf(storagePath: string, buffer: Buffer): Promise<string> {
  const target = localPathForStoragePath(storagePath);
  if (!target) throw new Error('Caminho de armazenamento local inválido.');
  await fs.promises.mkdir(path.dirname(target), { recursive: true });
  await fs.promises.writeFile(target, buffer);
  return target;
}

export async function localPdfExists(storagePath: string): Promise<boolean> {
  const target = localPathForStoragePath(storagePath);
  if (!target) return false;
  try {
    const stats = await fs.promises.stat(target);
    return stats.isFile();
  } catch {
    return false;
  }
}

export async function localPdfSize(storagePath: string): Promise<number | null> {
  const target = localPathForStoragePath(storagePath);
  if (!target) return null;
  try {
    const stats = await fs.promises.stat(target);
    return stats.isFile() ? stats.size : null;
  } catch {
    return null;
  }
}

function signLocalPayload(payload: LocalUploadPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', LOCAL_UPLOAD_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function createLocalUploadToken(payload: Omit<LocalUploadPayload, 'exp'>, ttlMs = 15 * 60 * 1000): string {
  return signLocalPayload({ ...payload, exp: Date.now() + ttlMs });
}

export function verifyLocalUploadToken(token: string): LocalUploadPayload | null {
  const [body, signature] = String(token || '').split('.');
  if (!body || !signature) return null;
  const expected = crypto.createHmac('sha256', LOCAL_UPLOAD_SECRET).update(body).digest('base64url');
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (provided.length !== expectedBuffer.length || !crypto.timingSafeEqual(provided, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as LocalUploadPayload;
    if (!payload || typeof payload !== 'object') return null;
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (!isValidPdfStoragePath(payload.path)) return null;
    return payload;
  } catch {
    return null;
  }
}

function supabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
}

export function hasSupabaseStorage(): boolean {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || '';
  return Boolean(url && key);
}

export function getEbdStorageClient(adminToken?: string): SupabaseClient | null {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || '';
  if (!url || !key) return null;

  const useAdminToken = !process.env.SUPABASE_SERVICE_ROLE_KEY && Boolean(adminToken);
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(useAdminToken ? { global: { headers: { Authorization: `Bearer ${adminToken}` } } } : {}),
  });
}

export async function createUploadTarget(input: {
  editionId: string;
  year: number;
  quarter: number;
  className: string;
  version: number;
  fileName: string;
  sizeBytes: number;
  sha256: string;
  pageCount: number;
  adminToken?: string;
}): Promise<EbdStorageTarget> {
  const storagePath = buildPdfStoragePath(input.year, input.quarter, input.className, input.version);

  if (isLocalEbdStorage()) {
    return {
      mode: 'local',
      uploadUrl: '/api/ebd/admin/local-upload',
      token: createLocalUploadToken({
        editionId: input.editionId,
        path: storagePath,
        version: input.version,
        fileName: input.fileName,
        sha256: input.sha256,
        sizeBytes: input.sizeBytes,
        pageCount: input.pageCount,
      }),
      path: storagePath,
      version: input.version,
    };
  }

  const client = getEbdStorageClient(input.adminToken);
  if (!client) throw new Error('Supabase Storage não configurado para upload do PDF.');

  const { data, error } = await client.storage.from(EBD_STORAGE_BUCKET).createSignedUploadUrl(storagePath);
  if (error || !data) {
    throw new Error(error?.message || 'Não foi possível gerar a URL de upload do PDF.');
  }

  return {
    mode: 'supabase',
    bucket: EBD_STORAGE_BUCKET,
    path: storagePath,
    token: data.token,
    signedUrl: data.signedUrl,
    version: input.version,
  };
}

export async function verifySupabaseObject(storagePath: string, expectedSize: number): Promise<boolean> {
  const client = getEbdStorageClient();
  if (!client) return false;
  const directory = storagePath.split('/').slice(0, -1).join('/');
  const name = storagePath.split('/').pop() || '';
  const { data, error } = await client.storage.from(EBD_STORAGE_BUCKET).list(directory, {
    search: name,
    limit: 1,
  });
  if (error || !data) return false;
  const item = data.find((entry) => entry.name === name);
  if (!item) return false;
  const size = typeof item.metadata?.size === 'number' ? item.metadata.size : null;
  return size === null || size === expectedSize;
}

export async function resolveStoredPdf(asset: {
  storagePath?: string | null;
  url?: string | null;
  fileName?: string | null;
}): Promise<ResolvedPdf | null> {
  if (asset.url) {
    try {
      const target = new URL(asset.url);
      if (target.protocol === 'https:' || target.protocol === 'http:') {
        return { kind: 'redirect', url: target.toString() };
      }
    } catch {
      // URL inválida: tenta o storagePath abaixo.
    }
  }

  if (asset.storagePath) {
    const localPath = localPathForStoragePath(asset.storagePath);
    if (localPath && await localPdfExists(asset.storagePath)) {
      return { kind: 'file', path: localPath };
    }

    const client = getEbdStorageClient();
    const url = supabaseUrl();
    if (client && url) {
      const { data } = await client.storage.from(EBD_STORAGE_BUCKET).createSignedUrl(asset.storagePath, 3600);
      if (data?.signedUrl) return { kind: 'redirect', url: data.signedUrl };
      const encoded = asset.storagePath.split('/').map(encodeURIComponent).join('/');
      return { kind: 'redirect', url: `${url}/storage/v1/object/public/${EBD_STORAGE_BUCKET}/${encoded}` };
    }
  }

  const samplePath = !asset.storagePath && asset.fileName ? localSamplePdfPath(asset.fileName) : null;
  if (samplePath) {
    try {
      const stats = await fs.promises.stat(samplePath);
      if (stats.isFile()) return { kind: 'file', path: samplePath };
    } catch {
      // Sem PDF local de amostra.
    }
  }

  return null;
}
