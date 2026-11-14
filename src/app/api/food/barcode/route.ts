import type { NextRequest } from 'next/server';
import { lookupBarcode, signedInUser } from '@/lib/food/server';

/**
 * GET /api/food/barcode?barcode=8901262010016 → the food on that pack, from the shared list or Open Food Facts.
 * (Not "?code=": that name is what sign-in links use, and the proxy sends those to /auth/callback.)
 */
export async function GET(request: NextRequest) {
  if (!(await signedInUser())) return Response.json({ error: 'sign in' }, { status: 401 });
  const code = (request.nextUrl.searchParams.get('barcode') ?? '').replace(/\D/g, '');
  if (code.length < 6 || code.length > 14) return Response.json({ error: 'bad barcode' }, { status: 400 });
  try {
    return Response.json(await lookupBarcode(code), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    console.error('barcode lookup failed:', (e as Error).message);
    return Response.json({ error: 'lookup failed' }, { status: 502 });
  }
}
