/**
 * Deploy with Wrangler:
 * 1) Create KV: wrangler kv namespace create "LEADERBOARD"
 * 2) Add binding in wrangler.toml:
 * [[kv_namespaces]]
 * binding = "LEADERBOARD"
 * id = "<YOUR_KV_NAMESPACE_ID>"
 * 3) Publish: wrangler deploy
 */

const TOP_SCORES_KEY = 'TOP_SCORES';
const MAX_SCORE = 14;
const MAX_LEVEL = 3;

function normalizeEntry(body = {}) {
  const parsedScore = Number(body.score);
  const parsedLevel = Number(body.level);

  return {
    name: String(body.name || 'Anônimo').slice(0, 30),
    score: Number.isFinite(parsedScore) ? Math.min(Math.max(0, parsedScore), MAX_SCORE) : 0,
    level: Number.isFinite(parsedLevel) ? Math.min(Math.max(1, parsedLevel), MAX_LEVEL) : 1,
    timestamp: body.timestamp || new Date().toISOString(),
  };
}

async function getTopScores(env) {
  const raw = await env.LEADERBOARD.get(TOP_SCORES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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
        const entry = normalizeEntry(body);
        const topScores = await getTopScores(env);
        topScores.push(entry);
        topScores.sort((a, b) => (b.score || 0) - (a.score || 0));
        const trimmed = topScores.slice(0, 10);

        await env.LEADERBOARD.put(TOP_SCORES_KEY, JSON.stringify(trimmed));

        return new Response(JSON.stringify({ ok: true }), {
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
      const scores = await getTopScores(env);
      return new Response(JSON.stringify({ scores }), {
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
