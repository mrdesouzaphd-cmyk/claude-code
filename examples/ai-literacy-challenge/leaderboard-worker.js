/**
 * Deploy with Wrangler:
 * 1) Create KV: wrangler kv namespace create "LEADERBOARD"
 * 2) Add binding in wrangler.toml:
 * [[kv_namespaces]]
 * binding = "LEADERBOARD"
 * id = "<YOUR_KV_NAMESPACE_ID>"
 * 3) Publish: wrangler deploy
 */

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/score') {
      try {
        const body = await request.json();
        const entry = {
          name: String(body.name || 'Anônimo').slice(0, 30),
          score: Number(body.score || 0),
          level: Number(body.level || 1),
          timestamp: body.timestamp || new Date().toISOString(),
        };
        const id = crypto.randomUUID();
        await env.LEADERBOARD.put(id, JSON.stringify(entry));
        return new Response(JSON.stringify({ ok: true, id }), {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ ok: false, error: 'Invalid payload' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    if (request.method === 'GET' && url.pathname === '/leaderboard') {
      const listed = await env.LEADERBOARD.list({ limit: 1000 });
      const scores = [];
      for (const key of listed.keys) {
        const raw = await env.LEADERBOARD.get(key.name);
        if (!raw) continue;
        try { scores.push(JSON.parse(raw)); } catch {}
      }
      scores.sort((a, b) => (b.score || 0) - (a.score || 0));
      return new Response(JSON.stringify({ scores: scores.slice(0, 10) }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
