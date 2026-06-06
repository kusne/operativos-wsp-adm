(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};

  const TABLES = Object.freeze({
    estados: "operativos_estado",
    eventos: "operativos_eventos",
    fotos: "operativos_eventos_fotos",
    operativosPublicados: "operativos_publicados",
  });

  const STORAGE = Object.freeze({
    historialFotosBucket: "operativos-historial-fotos",
  });

  function limpiarTextoSimple(valor) {
    return String(valor || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function assertConfig(config = {}) {
    const wspConfig = window.WSP?.config || {};
    const supabaseUrl = limpiarTextoSimple(config.supabaseUrl || config.url || wspConfig.supabaseUrl || window.SUPABASE_URL || "").replace(/\/+$/, "");
    const anonKey = limpiarTextoSimple(config.anonKey || config.supabaseAnonKey || config.key || wspConfig.supabaseAnonKey || window.SUPABASE_ANON_KEY || "");

    if (!supabaseUrl) throw new Error("Falta supabaseUrl para historial operativo.");
    if (!anonKey) throw new Error("Falta anonKey para historial operativo.");

    return { supabaseUrl, anonKey };
  }

  function headersSupabase({ anonKey, extra = {} } = {}) {
    const key = limpiarTextoSimple(anonKey || "");
    if (!key) throw new Error("Falta anonKey para headers Supabase.");

    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...extra,
    };
  }

  function querySupabase(params = {}) {
    const qs = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      qs.set(key, String(value));
    });

    return qs.toString();
  }

  function restUrl(config = {}) {
    const { supabaseUrl } = assertConfig(config);
    const table = limpiarTextoSimple(config.table || "");
    if (!table) throw new Error("Falta tabla Supabase.");

    const qs = querySupabase(config.params || {});
    return `${supabaseUrl}/rest/v1/${table}${qs ? `?${qs}` : ""}`;
  }

  async function fetchSupabaseTabla(config = {}) {
    const { anonKey } = assertConfig(config);
    const method = limpiarTextoSimple(config.method || "GET").toUpperCase() || "GET";
    const body = config.body === undefined ? null : config.body;
    const tieneBody = body !== null;
    const extraHeaders = config.extraHeaders || {};

    const headers = headersSupabase({
      anonKey,
      extra: {
        ...(tieneBody ? { "Content-Type": "application/json" } : {}),
        ...extraHeaders,
      },
    });

    const r = await fetch(restUrl(config), {
      method,
      headers,
      body: tieneBody ? JSON.stringify(body) : null,
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`Supabase ${config.table || "tabla"} ${method} ${r.status}: ${txt}`);
    }

    if (method === "DELETE" || extraHeaders.Prefer === "return=minimal") return null;
    return r.json().catch(() => null);
  }

  async function leerTabla(config = {}) {
    return fetchSupabaseTabla({ ...config, method: "GET" });
  }

  async function insertarTabla(config = {}) {
    return fetchSupabaseTabla({
      ...config,
      method: "POST",
      extraHeaders: {
        Prefer: "return=representation",
        ...(config.extraHeaders || {}),
      },
    });
  }

  async function upsertTabla(config = {}) {
    return fetchSupabaseTabla({
      ...config,
      method: "POST",
      extraHeaders: {
        Prefer: "resolution=merge-duplicates,return=representation",
        ...(config.extraHeaders || {}),
      },
    });
  }

  async function patchTabla(config = {}) {
    return fetchSupabaseTabla({ ...config, method: "PATCH" });
  }

  async function borrarTabla(config = {}) {
    return fetchSupabaseTabla({ ...config, method: "DELETE" });
  }

  function storageObjectUrl(config = {}) {
    const { supabaseUrl } = assertConfig(config);
    const bucket = limpiarTextoSimple(config.bucket || "");
    const path = String(config.path || "").replace(/^\/+/, "");
    if (!bucket) throw new Error("Falta bucket Supabase Storage.");
    if (!path) throw new Error("Falta path Supabase Storage.");
    return `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;
  }

  function storagePublicUrl(config = {}) {
    const { supabaseUrl } = assertConfig(config);
    const bucket = limpiarTextoSimple(config.bucket || "");
    const path = String(config.path || "").replace(/^\/+/, "");
    if (!bucket) throw new Error("Falta bucket Supabase Storage.");
    if (!path) throw new Error("Falta path Supabase Storage.");
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }

  const api = {
    TABLES,
    STORAGE,
    limpiarTextoSimple,
    headersSupabase,
    querySupabase,
    restUrl,
    fetchSupabaseTabla,
    leerTabla,
    insertarTabla,
    upsertTabla,
    patchTabla,
    borrarTabla,
    storageObjectUrl,
    storagePublicUrl,
  };

  window.WSP.services.historialOperativo = api;

  // Paso 41: alias explícitos para que los módulos nuevos no dependan de un único nombre histórico.
  // Mantiene compatibilidad con nombres anteriores y futuros sin tocar el flujo legacy de wsp.js.
  window.WSP.services.historial = api;
  window.WSP.services.supabaseRest = api;
  window.WSP.modules.historialService = api;

  console.log("[WSP historial service] cargado");
})();
