// ======================================================
// BMZCN - Supabase Client comun
// Fuente de verdad: Supabase. Sin localStorage.
// Cargar antes de operativosRepo.js, nomencladorRepo.js y realtimeBus.js.
// ======================================================
(function () {
  'use strict';

  const root = window.BMZCN = window.BMZCN || {};

  const CONFIG = Object.freeze({
    SUPABASE_URL: 'https://ugeydxozfewzhldjbkat.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX',
    DEFAULT_SCHEMA: 'public'
  });

  function clean(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function headers(extra = {}) {
    return {
      apikey: CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
      ...extra
    };
  }

  function buildQuery(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      qs.set(key, String(value));
    });
    const out = qs.toString();
    return out ? `?${out}` : '';
  }

  async function rest(path, options = {}) {
    const normalizedPath = String(path || '').replace(/^\/+/, '');
    if (!normalizedPath) throw new Error('Supabase REST: path vacío.');

    const resp = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${normalizedPath}`, {
      ...options,
      headers: headers(options.headers || {})
    });

    const text = await resp.text().catch(() => '');
    if (!resp.ok) {
      throw new Error(`Supabase REST ${normalizedPath}: HTTP ${resp.status} ${text}`);
    }

    if (!text) return null;
    try { return JSON.parse(text); }
    catch { return text; }
  }

  async function select(tableOrView, params = {}) {
    return rest(`${tableOrView}${buildQuery(params)}`, { method: 'GET' });
  }

  async function insert(table, body, { returning = true } = {}) {
    const prefer = returning ? 'return=representation' : 'return=minimal';
    return rest(table, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: prefer
      },
      body: JSON.stringify(body)
    });
  }

  async function upsert(table, body, { onConflict, returning = true, merge = true } = {}) {
    const path = onConflict ? `${table}?on_conflict=${encodeURIComponent(onConflict)}` : table;
    const prefer = [
      merge ? 'resolution=merge-duplicates' : 'resolution=ignore-duplicates',
      returning ? 'return=representation' : 'return=minimal'
    ].join(',');

    return rest(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: prefer
      },
      body: JSON.stringify(body)
    });
  }

  async function update(table, filters, patch, { returning = true } = {}) {
    const prefer = returning ? 'return=representation' : 'return=minimal';
    return rest(`${table}${buildQuery(filters)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Prefer: prefer
      },
      body: JSON.stringify(patch)
    });
  }

  async function remove(table, filters, { returning = false } = {}) {
    const prefer = returning ? 'return=representation' : 'return=minimal';
    return rest(`${table}${buildQuery(filters)}`, {
      method: 'DELETE',
      headers: { Prefer: prefer }
    });
  }

  async function rpc(functionName, args = {}) {
    return rest(`rpc/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(args || {})
    });
  }

  async function uploadObject(bucket, path, fileOrBlob, { contentType = '', upsert = true } = {}) {
    const cleanBucket = clean(bucket);
    const cleanPath = String(path || '').replace(/^\/+/, '');
    if (!cleanBucket || !cleanPath) throw new Error('Storage upload: bucket/path vacío.');

    const resp = await fetch(`${CONFIG.SUPABASE_URL}/storage/v1/object/${cleanBucket}/${cleanPath}`, {
      method: 'POST',
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'x-upsert': upsert ? 'true' : 'false',
        ...(contentType ? { 'Content-Type': contentType } : {})
      },
      body: fileOrBlob
    });

    const text = await resp.text().catch(() => '');
    if (!resp.ok) throw new Error(`Supabase Storage ${cleanBucket}/${cleanPath}: HTTP ${resp.status} ${text}`);
    try { return text ? JSON.parse(text) : null; }
    catch { return text; }
  }

  function publicUrl(bucket, path) {
    const cleanBucket = clean(bucket);
    const cleanPath = String(path || '').replace(/^\/+/, '');
    if (!cleanBucket || !cleanPath) return '';
    return `${CONFIG.SUPABASE_URL}/storage/v1/object/public/${cleanBucket}/${cleanPath}`;
  }

  function createRealtimeClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('Supabase Realtime requiere cargar @supabase/supabase-js v2 antes de realtimeBus.js.');
    }
    return window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      realtime: { params: { eventsPerSecond: 10 } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  }

  root.Config = CONFIG;
  root.Supabase = {
    config: CONFIG,
    headers,
    buildQuery,
    rest,
    select,
    insert,
    upsert,
    update,
    remove,
    rpc,
    uploadObject,
    publicUrl,
    createRealtimeClient
  };
})();
