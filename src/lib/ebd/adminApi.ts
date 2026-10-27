import { getAdminAccessToken } from '../admin/session';

export class EbdAdminApiError extends Error {
  status: number;
  details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = 'EbdAdminApiError';
    this.status = status;
    this.details = details;
  }
}

export async function ebdAdminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAdminAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api/ebd/admin${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string; details?: string[] } | null;
    throw new EbdAdminApiError(
      body?.error || 'Não foi possível concluir a operação.',
      response.status,
      Array.isArray(body?.details) ? body.details : [],
    );
  }
  return response.json() as Promise<T>;
}

export async function ebdAdminUploadLocal(
  uploadUrl: string,
  token: string,
  file: File,
): Promise<void> {
  const accessToken = await getAdminAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/pdf' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const separator = uploadUrl.includes('?') ? '&' : '?';
  const response = await fetch(`${uploadUrl}${separator}token=${encodeURIComponent(token)}`, {
    method: 'PUT',
    headers,
    body: file,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new EbdAdminApiError(body?.error || 'Falha no upload do PDF.', response.status);
  }
}

export async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
