/**
 * /api/generate.js
 * Vercel Edge Function — proxies Anthropic API so your key
 * never appears in the browser.
 *
 * HOW TO USE:
 * 1. Deploy this repo to Vercel
 * 2. In Vercel dashboard → Settings → Environment Variables
 *    add:  ANTHROPIC_API_KEY = sk-ant-...
 * 3. In index.html set  CONFIG.useApi = true
 *    The fetch URL is already pointed at '/api/generate'
 */

export const config = { runtime: 'edge' };

export default async function handler(req) {
  // ── CORS — restrict to your domain in production ──
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers,
    });
  }

  const { name, qty, unit, taxPct, total, currency = '$' } = body;

  if (!name || !unit) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), {
      status: 400, headers,
    });
  }

  const prompt =
    `Write a single short, dry, feel-good joke for a receipt on a website called "Pay for Nothing."\n\n` +
    `Person: "${name}". Bought ${qty} unit${qty > 1 ? 's' : ''} of nothing ` +
    `at ${currency}${parseFloat(unit).toFixed(2)} each` +
    (taxPct > 0 ? `, plus ${taxPct}% Tax for Nothing, totalling ${currency}${parseFloat(total).toFixed(2)}` : '') + `.\n\n` +
    `Rules:\n` +
    `- Warm clever compliment — they're a good sport\n` +
    `- 1–2 sentences max, punchy\n` +
    `- Use their name once\n` +
    `- If qty > 1, acknowledge the ambition of buying multiple nothings\n` +
    `- If tax > 0, optionally note the absurdity of paying tax on nothing\n` +
    `- Deadpan, no exclamation marks\n` +
    `- Unexpected, quiet ending\n\n` +
    `Reply with ONLY the joke. No quotes, no labels.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 120,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const joke = data.content?.[0]?.text?.trim();

    if (!joke) throw new Error('Empty response');

    return new Response(JSON.stringify({ joke }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Generation failed' }), {
      status: 500, headers,
    });
  }
}
