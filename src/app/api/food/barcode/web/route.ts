import type { NextRequest } from 'next/server';
import { lookupBarcodeOnWeb, signedInUser } from '@/lib/food/server';
import { validGtin } from '@/lib/food/off';

/** Searching the web and reading a product page takes a while. */
export const maxDuration = 60;

/**
 * POST /api/food/barcode/web?barcode=8901262010016 → the pack, found on the internet
 * (only asked after /api/food/barcode found nothing). Saved for everyone once found.
 */
export async function POST(request: NextRequest) {
  const user = await signedInUser();
  if (!user) return Response.json({ error: 'sign in' }, { status: 401 });
  const code = (request.nextUrl.searchParams.get('barcode') ?? '').replace(/\D/g, '');
  if (!validGtin(code)) return Response.json({ error: 'bad barcode' }, { status: 400 });
  try {
    return Response.json(await lookupBarcodeOnWeb(code, user), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    console.error('web barcode lookup failed:', (e as Error).message);
    return Response.json({ error: 'lookup failed' }, { status: 502 });
  }
}
