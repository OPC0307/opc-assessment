/**
 * Cloudflare Worker: OPC Chat API Proxy
 * Deploy: npx wrangler deploy workers/chat-proxy.js
 *
 * This worker sits between fhopc.top and token.sensenova.cn,
 * adding the API key server-side so it's never exposed to browsers.
 */
export default {
  async fetch(request, env) {
    // Only allow requests from fhopc.top
    const origin = request.headers.get('Origin') || '';
    const allowed = ['https://fhopc.top', 'http://localhost:8080', 'http://127.0.0.1:8080'];
    const corsOrigin = allowed.find(a => origin.startsWith(a)) || allowed[0];

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.text();
      const upstream = await fetch('https://token.sensenova.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const data = await upstream.text();
      return new Response(data, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Proxy error', detail: e.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
      });
    }
  }
};
