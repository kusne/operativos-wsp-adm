// ======================================================
// BMZCN - Realtime Bus robusto
// Supabase Realtime como disparador principal. Sin polling.
// Requiere: @supabase/supabase-js v2 y SHARED/JS/supabaseClient.js
// ======================================================
(function () {
  'use strict';

  const root = window.BMZCN = window.BMZCN || {};

  let client = null;
  const channels = new Map();      // key -> channel
  const definitions = new Map();   // key -> config
  const listeners = new Map();     // eventName -> Set(fn)

  function log(...args) { console.log('[BMZCN RealtimeBus]', ...args); }
  function warn(...args) { console.warn('[BMZCN RealtimeBus]', ...args); }

  function ensureClient() {
    if (client) return client;
    if (!root.Supabase) throw new Error('BMZCN.Supabase no está cargado.');
    client = root.Supabase.createRealtimeClient();
    return client;
  }

  function on(eventName, handler) {
    if (typeof handler !== 'function') return () => {};
    const key = String(eventName || '*');
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(handler);
    return () => listeners.get(key)?.delete(handler);
  }

  function emit(eventName, payload) {
    const specific = listeners.get(String(eventName || '')) || new Set();
    const all = listeners.get('*') || new Set();
    [...specific, ...all].forEach((fn) => {
      try { fn(payload, eventName); }
      catch (e) { console.error('[BMZCN RealtimeBus] Error en listener', eventName, e); }
    });
  }

  function makeKey({ table, event = '*', schema = 'public', filter = '', channelName = '' }) {
    return channelName || `${schema}:${table}:${event}:${filter || 'all'}`;
  }

  async function removeChannelByKey(key) {
    if (!channels.has(key)) return;
    const sb = ensureClient();
    const channel = channels.get(key);
    channels.delete(key);
    try { await sb.removeChannel(channel); }
    catch (e) { warn('No se pudo remover canal', key, e); }
  }

  function subscribeTable(config = {}) {
    const sb = ensureClient();
    const table = String(config.table || '').trim();
    if (!table) throw new Error('subscribeTable requiere table.');

    const schema = config.schema || 'public';
    const event = config.event || '*';
    const filter = config.filter || '';
    const key = makeKey({ table, event, schema, filter, channelName: config.channelName || '' });

    definitions.set(key, { table, event, schema, filter, channelName: key });
    if (channels.has(key)) return channels.get(key);

    emit('subscription_status', { key, table, status: 'CREATING' });

    const channel = sb.channel(`bmzcn:${key}`)
      .on('postgres_changes', { event, schema, table, ...(filter ? { filter } : {}) }, (payload) => {
        emit(table, payload);
        emit(`${table}:${payload.eventType}`, payload);
        emit('db_change', { table, payload });
      })
      .subscribe((status, err) => {
        emit('subscription_status', { key, table, status, error: err || null });
        if (status === 'SUBSCRIBED') log('SUBSCRIBED', key);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          warn('Estado de canal', key, status, err || '');
        }
      });

    channels.set(key, channel);
    return channel;
  }

  async function resubscribeAll() {
    const defs = Array.from(definitions.entries());
    for (const [key] of defs) await removeChannelByKey(key);
    defs.forEach(([, cfg]) => subscribeTable(cfg));
    emit('resubscribed', { count: defs.length });
  }

  function subscribeOperativos({ guardiaFecha = '' } = {}) {
    const filterEstado = guardiaFecha ? `guardia_fecha=eq.${guardiaFecha}` : '';
    const filterEventos = guardiaFecha ? `guardia_fecha=eq.${guardiaFecha}` : '';
    return [
      subscribeTable({ table: 'operativos_estado', filter: filterEstado, channelName: `operativos_estado:${guardiaFecha || 'all'}` }),
      subscribeTable({ table: 'operativos_eventos', filter: filterEventos, channelName: `operativos_eventos:${guardiaFecha || 'all'}` }),
      subscribeTable({ table: 'operativos_eventos_fotos', channelName: 'operativos_eventos_fotos:all' })
    ];
  }

  function subscribeEstadisticas({ guardiaFecha = '' } = {}) {
    const list = subscribeOperativos({ guardiaFecha });
    list.push(subscribeTable({ table: 'estadisticas_reportes_generados', channelName: 'estadisticas_reportes_generados:all' }));
    return list;
  }

  async function unsubscribeAll() {
    const keys = Array.from(channels.keys());
    for (const key of keys) await removeChannelByKey(key);
  }

  // No es polling. Solo reengancha si el navegador recupera conexión/foco.
  window.addEventListener('online', () => resubscribeAll().catch(e => warn('resubscribe online', e)));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resubscribeAll().catch(e => warn('resubscribe visible', e));
  });

  root.RealtimeBus = {
    on,
    emit,
    subscribeTable,
    subscribeOperativos,
    subscribeEstadisticas,
    resubscribeAll,
    unsubscribeAll,
    getClient: ensureClient,
    getChannels: () => Array.from(channels.keys())
  };
})();
