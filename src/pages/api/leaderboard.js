export const prerender = false

import { db } from "../../db/db.js";

const COMPOSITE_FACTOR = 100000;

// GET /api/leaderboard?testament=ot|nt
export async function GET({ request }) {
  const url = new URL(request.url, 'http://localhost');
  const testament = url.searchParams.get('testament');
  if (testament !== 'ot' && testament !== 'nt') {
    return new Response(
      JSON.stringify({ error: 'testament debe ser "ot" o "nt"' }),
      { status: 400 }
    );
  }
  const key = `leaderboard:${testament}`;
  // Upstash devuelve ['id1','123456','id2','234567',...]
  const raw = await db.zrange(key, 0, 9, { withScores: true });
  const entries = [];
  for (let i = 0; i < raw.length; i += 2) {
    const id = raw[i];
    const composite = Number(raw[i + 1]);
    const mistakes = Math.floor(composite / COMPOSITE_FACTOR);
    const time = composite % COMPOSITE_FACTOR;
    // Obtenemos el nombre del hash global
    const name =
      (await db.hget(`leaderNames`, id)) ||
      'Anónimo';
    entries.push({ id, name, mistakes, time });
  }
  return new Response(JSON.stringify(entries), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST /api/leaderboard?testament=ot|nt
// FormData: { id, name, time, mistakes }
export async function POST({ request }) {
  const url = new URL(request.url, 'http://localhost');
  const testament = url.searchParams.get('testament');
  if (testament !== 'ot' && testament !== 'nt') {
    return new Response(
      JSON.stringify({ message: 'testament debe ser "ot" o "nt"' }),
      { status: 400 }
    );
  }

  const data = await request.formData();
  const id = data.get('id');
  const name = data.get('name');
  const timeStr = data.get('time');
  const mistakesStr = data.get('mistakes');

  if (!id || !name || !timeStr || !mistakesStr) {
    return new Response(
      JSON.stringify({ message: 'Faltan campos: id, name, time, mistakes' }),
      { status: 400 }
    );
  }

  const time = Number(timeStr);
  const mistakes = Number(mistakesStr);
  if (isNaN(time) || isNaN(mistakes)) {
    return new Response(
      JSON.stringify({ message: 'time y mistakes deben ser números' }),
      { status: 400 }
    );
  }

  // Composite score: errores * factor + tiempo
  const composite = mistakes * COMPOSITE_FACTOR + time;
  const zkey = `leaderboard:${testament}`;
  const hkey = `leaderNames`;

  // Guardamos el nombre (global, para ambos testamentos)
  await db.hset(hkey, { [id]: name });

  // 1) Intentamos añadir si no existía
  const added = await db.zadd(zkey, {
    member: id,
    score: composite,
    nx: true,
  });

  // 2) Si ya existía, comprobamos su score actual y actualizamos solo si es mejor
  if (added === 0) {
    const existing = await db.zscore(zkey, id);
    if (existing !== null && composite < Number(existing)) {
      await db.zadd(zkey, { member: id, score: composite });
    }
  }

  // 3) Recortamos a top‑10
  await db.zremrangebyrank(zkey, 10, -1);

  return new Response(
    JSON.stringify({ message: 'Score guardado correctamente' }),
    { status: 200 }
  );
}