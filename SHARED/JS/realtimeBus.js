// ======================================================
// BMZCN - Realtime Bus
// Tiempo real real por Supabase Realtime. Sin setInterval. Sin localStorage.
// Requiere cargar antes: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
// ======================================================
(function () {
  'use strict';

  const root = window.BMZCN = window.BMZCN || {};

  let client = null;
  const channels = new Map();
  const listeners = new Map();

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
      catch (e) { console.error('[BMZCN Realtime] Error en listener', eventName, e); }
    });
  }

  function subscribeTable({ table, event = '*', schema = 'public', filter = '', channelName = '' }) {
    const sb = ensureClient();
    const key = channelName || `${schema}:${table}:${event}:${filter || 'all'}`;
    if (channels.has(key)) return channels.get(key);

    const channel = sb.channel(`bmzcn:${key}`)
      .on('postgres_changes', { event, schema, table, ...(filter ? { filter } : {}) }, (payload) => {
        emit(table, payload);
        emit(`${table}:${payload.eventType}`, payload);
        emit('db_change', { table, payload });
      })
      .subscribe((status) => {
        emit('subscription_status', { key, table, status });
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[BMZCN Realtime] Estado de canal', key, status);
        }
      });

    channels.set(key, channel);
    return channel;
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
    const channelsList = subscribeOperativos({ guardiaFecha });
    channelsList.push(subscribeTable({ table: 'estadisticas_reportes_generados', channelName: 'estadisticas_reportes_generados:all' }));
    return channelsList;
  }

  async function unsubscribeAll() {
    if (!client) return;
    for (const [key, channel] of channels.entries()) {
      try { await client.removeChannel(channel); }
      catch (e) { console.warn('[BMZCN Realtime] No se pudo remover canal', key, e); }
    }
    channels.clear();
  }

  root.RealtimeBus = {
    on,
    emit,
    subscribeTable,
    subscribeOperativos,
    subscribeEstadisticas,
    unsubscribeAll,
    getClient: ensureClient
  };
})();
