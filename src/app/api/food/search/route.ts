import type { NextRequest } from 'next/server';
import { searchServer, signedInUser } from '@/lib/food/server';

/** GET /api/food/search?q=paneer → foods from the shared list + USDA (signed-in users only). */
export async function GET(request: NextRequest) {
  if (!(await signedInUser())) return Response.json({ error: 'sign in' }, { status: 401 });
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim();
  if (q.length < 2 || q.length > 80) return Response.json({ foods: [], usda: 'ok' });
  try {
    return Response.json(await searchServer(q), { headers: { 'Cache-Control': 'private, max-age=600' } });
  } catch (e) {
    console.error('food search failed:', (e as Error).message);
    return Response.json({ foods: [], usda: 'error' }, { status: 502 });
  }
}
