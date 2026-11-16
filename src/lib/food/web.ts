import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { WEB_PRODUCT_SCHEMA, type WebProduct } from './web-product';

/**
 * Last stop for a barcode that's in neither the shared list nor Open Food Facts:
 * Claude searches the web for it (shop and brand pages) and reports the pack's
 * nutrition label. Only the barcode number is sent, nothing about the person.
 * Needs ANTHROPIC_API_KEY (server only, never NEXT_PUBLIC_).
 */

const MODEL = 'claude-opus-5-5';
/** Searches / page reads per barcode: enough to find a product page, small enough to keep each lookup cheap. */
const MAX_SEARCHES = 4;
const MAX_FETCHES = 3;
/** Server-tool turns can pause; continue a couple of times at most. */
const MAX_CONTINUES = 2;

export const webLookupReady = () => !!process.env.ANTHROPIC_API_KEY;

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic({ timeout: 45_000, maxRetries: 1 }));

const SYSTEM = `You look up packaged food products by barcode for a calorie tracker used mostly in India.

Find the product with this barcode on the web (shopping sites such as BigBasket, Blinkit, Zepto, Amazon, JioMart, Swiggy Instamart, Flipkart; the brand's own site; barcode databases), then read its nutrition facts.

Rules:
- Report found = true only when a page clearly ties this barcode (or the exact same product and pack) to its nutrition facts. If you can name the product but find no nutrition numbers, report found = false with the name and brand.
- If the product isn't a food or drink (soap, shampoo, medicine…), or you can't find it at all, report found = false with name and brand null.
- Copy numbers from the label. Never estimate or fill in from similar products. Leave a nutrient null if it isn't shown.
- Prefer the "per 100 g" (or "per 100 ml") column and set basis to match. Use "serving" only when that's all there is, and then give serving_g.
- Energy in kcal (kJ ÷ 4.184). Sodium in mg (salt in g × 400).
- When you are done, call report_product exactly once. Don't write anything else.`;

const TOOLS: Anthropic.Beta.BetaToolUnion[] = [
  { type: 'web_search_20260209', name: 'web_search', max_uses: MAX_SEARCHES, user_location: { type: 'approximate', country: 'IN' } },
  // A product page is long; the nutrition table is a small part of it.
  { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: MAX_FETCHES, max_content_tokens: 6000 },
  {
    name: 'report_product',
    description: 'Report the product found for the barcode and its nutrition label. Call exactly once, at the end.',
    strict: true,
    input_schema: WEB_PRODUCT_SCHEMA as unknown as Anthropic.Beta.BetaTool.InputSchema,
  },
];

/** What the web says about this barcode, or null if Claude didn't report anything usable. Throws on API errors. */
export async function searchBarcodeOnWeb(code: string): Promise<WebProduct | null> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: `Barcode: ${code}` }];
  const used = { input: 0, output: 0, searches: 0, fetches: 0, ms: Date.now() };
  try {
    for (let turn = 0; turn <= MAX_CONTINUES; turn++) {
      const res = await anthropic().beta.messages.create({
        model: MODEL,
        // If the model declines, the API retries on a fallback model by itself.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        max_tokens: 8000,
        system: SYSTEM,
        output_config: { effort: 'low' },
        tools: TOOLS,
        messages,
      });
      used.input += res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0) + (res.usage.cache_creation_input_tokens ?? 0);
      used.output += res.usage.output_tokens;
      used.searches += res.usage.server_tool_use?.web_search_requests ?? 0;
      used.fetches += res.usage.server_tool_use?.web_fetch_requests ?? 0;
      const report = res.content.find((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use' && b.name === 'report_product');
      if (report) return report.input as WebProduct;
      // The server-side search loop paused: send the turn back as it is and it carries on.
      if (res.stop_reason === 'pause_turn') {
        messages.push({ role: 'assistant', content: res.content });
        continue;
      }
      // Finished in words instead of the tool: ask once for the report.
      if (res.stop_reason === 'end_turn' && turn < MAX_CONTINUES) {
        messages.push({ role: 'assistant', content: res.content }, { role: 'user', content: 'Call report_product now with what you found (found = false if nothing).' });
        continue;
      }
      return null; // declined, or ran out of room
    }
    return null;
  } finally {
    // What each lookup costs (Vercel logs): tokens, searches and time.
    console.info('web barcode', code, JSON.stringify({ ...used, ms: Date.now() - used.ms }));
  }
}
