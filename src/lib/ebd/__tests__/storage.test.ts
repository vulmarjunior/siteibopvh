import { describe, expect, it } from 'vitest';
import {
  buildPdfStoragePath,
  classSlug,
  createLocalUploadToken,
  hasSupabaseStorage,
  isPdfBuffer,
  isValidPdfStoragePath,
  localPathForStoragePath,
  sha256Buffer,
  verifyLocalUploadToken,
} from '../storage';

describe('storage da EBD', () => {
  it('reconhece a assinatura de um PDF', () => {
    expect(isPdfBuffer(Buffer.from('%PDF-1.7\n'))).toBe(true);
    expect(isPdfBuffer(Buffer.from('PNG'))).toBe(false);
  });

  it('calcula SHA-256 do buffer', () => {
    expect(sha256Buffer(Buffer.from('abc'))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('normaliza a turma e monta o caminho versionado', () => {
    expect(classSlug('Jovens e Adultos')).toBe('jovens-e-adultos');
    expect(buildPdfStoragePath(2022, 1, 'Adultos', 3)).toBe('ebd/2022/1/adultos/revista-v3.pdf');
    expect(isValidPdfStoragePath('ebd/2022/1/adultos/revista-v3.pdf')).toBe(true);
    expect(isValidPdfStoragePath('ebd/../../revista.pdf')).toBe(false);
    expect(isValidPdfStoragePath('outro/2022/1/adultos/revista-v1.pdf')).toBe(false);
  });

  it('assina e valida o token do upload local', () => {
    const token = createLocalUploadToken({
      editionId: 'edition-1',
      path: 'ebd/2022/1/adultos/revista-v1.pdf',
      version: 1,
      fileName: 'revista.pdf',
      sha256: 'a'.repeat(64),
      sizeBytes: 100,
      pageCount: 10,
    });
    const payload = verifyLocalUploadToken(token);
    expect(payload?.editionId).toBe('edition-1');
    expect(payload?.path).toBe('ebd/2022/1/adultos/revista-v1.pdf');
    expect(verifyLocalUploadToken(`${token}x`)).toBeNull();
    expect(verifyLocalUploadToken('invalido')).toBeNull();
  });

  it('mantém o caminho local dentro do diretório configurado', () => {
    const previous = process.env.EBD_LOCAL_STORAGE_DIR;
    process.env.EBD_LOCAL_STORAGE_DIR = '.';
    try {
      expect(localPathForStoragePath('ebd/2022/1/adultos/revista-v1.pdf')).toContain('revista-v1.pdf');
      expect(localPathForStoragePath('../fora.pdf')).toBeNull();
      expect(localPathForStoragePath('ebd/../../fora.pdf')).toBeNull();
    } finally {
      if (previous === undefined) delete process.env.EBD_LOCAL_STORAGE_DIR;
      else process.env.EBD_LOCAL_STORAGE_DIR = previous;
    }
  });

  it('exige a service role em produção e não cai para a anon key', () => {
    const keys = [
      'SUPABASE_URL',
      'VITE_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_ANON_KEY',
      'VITE_SUPABASE_ANON_KEY',
      'NODE_ENV',
      'VERCEL',
    ] as const;
    const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
    try {
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.SUPABASE_ANON_KEY = 'anon';
      process.env.VITE_SUPABASE_ANON_KEY = 'anon';
      process.env.NODE_ENV = 'production';
      delete process.env.VERCEL;

      expect(hasSupabaseStorage()).toBe(false);

      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
      expect(hasSupabaseStorage()).toBe(true);

      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.NODE_ENV = 'development';
      expect(hasSupabaseStorage()).toBe(true);
    } finally {
      for (const key of keys) {
        const value = previous[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});
