(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};

  const DEFAULT_BUCKET = "operativos-historial-fotos";
  const DEFAULT_TABLE = "operativos_eventos_fotos";
  const MAX_FOTOS_INFORME = 4;

  function limpiarTextoSimple(valor) {
    return String(valor || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarBasicoSinAcentos(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizarComponente(value) {
    return normalizarBasicoSinAcentos(value)
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120);
  }

  function safePathSegment(value, fallback = "item", max = 90) {
    return normalizarComponente(value).slice(0, max) || fallback;
  }

  function getDeps(deps = {}) {
    const historialService = window.WSP?.services?.historial || null;
    const fetchFn = deps.fetch || window.fetch;

    return {
      SUPABASE_URL: deps.SUPABASE_URL || deps.supabaseUrl || "",
      HISTORIAL_FOTOS_BUCKET: deps.HISTORIAL_FOTOS_BUCKET || deps.bucket || DEFAULT_BUCKET,
      HISTORIAL_FOTOS_TABLE: deps.HISTORIAL_FOTOS_TABLE || deps.table || DEFAULT_TABLE,
      headersSupabase: typeof deps.headersSupabase === "function"
        ? deps.headersSupabase
        : (typeof historialService?.headersSupabase === "function" ? historialService.headersSupabase : (() => ({}))),
      getGuardiaFechaISO: typeof deps.getGuardiaFechaISO === "function" ? deps.getGuardiaFechaISO : (() => ""),
      limpiarTextoSimple: typeof deps.limpiarTextoSimple === "function" ? deps.limpiarTextoSimple : limpiarTextoSimple,
      normalizarComponenteInformeKeyWsp: typeof deps.normalizarComponenteInformeKeyWsp === "function"
        ? deps.normalizarComponenteInformeKeyWsp
        : normalizarComponente,
      construirOperativoKeyEstable: typeof deps.construirOperativoKeyEstable === "function"
        ? deps.construirOperativoKeyEstable
        : (() => ""),
      normalizarImagenControlMovil: typeof deps.normalizarImagenControlMovil === "function"
        ? deps.normalizarImagenControlMovil
        : async (file) => file,
      fetch: typeof fetchFn === "function" ? fetchFn.bind(window) : null,
      console: deps.console || window.console || console,
    };
  }

  function limitarFotos(files, max = MAX_FOTOS_INFORME) {
    return (Array.isArray(files) ? files : [])
      .filter(Boolean)
      .slice(0, max);
  }

  function fotosSeleccionadasDesdeInputs(inputs, max = MAX_FOTOS_INFORME) {
    const files = (Array.isArray(inputs) ? inputs : [])
      .map((el) => el?.files?.[0] || null)
      .filter(Boolean);
    return limitarFotos(files, max);
  }

  function eventoDesdeResultado(resultadoHistorial = {}) {
    return resultadoHistorial?.evento || {};
  }

  function estadoDesdeResultado(resultadoHistorial = {}) {
    return resultadoHistorial?.estado || {};
  }

  function obtenerInformeKey(resultadoHistorial = {}, deps = {}) {
    const d = getDeps(deps);
    const evento = eventoDesdeResultado(resultadoHistorial);
    return d.limpiarTextoSimple(
      evento.informe_key ||
      resultadoHistorial?.informe_key ||
      evento?.payload_completo?.informe_key ||
      ""
    );
  }

  function obtenerGuardiaFecha(resultadoHistorial = {}, ctx = {}) {
    const d = getDeps(ctx.deps || {});
    const evento = eventoDesdeResultado(resultadoHistorial);
    return d.limpiarTextoSimple(evento.guardia_fecha || ctx.guardia_fecha || d.getGuardiaFechaISO());
  }

  function obtenerOperativoKey(resultadoHistorial = {}, ctx = {}) {
    const d = getDeps(ctx.deps || {});
    const evento = eventoDesdeResultado(resultadoHistorial);
    const estado = estadoDesdeResultado(resultadoHistorial);
    const franja = ctx.franja || null;

    return d.limpiarTextoSimple(
      evento.operativo_key ||
      estado.operativo_key ||
      ctx.operativo_key ||
      d.construirOperativoKeyEstable(franja)
    );
  }

  function construirPathFotoInforme(resultadoHistorial = {}, numero = 1, ctx = {}) {
    const d = getDeps(ctx.deps || {});
    const evento = eventoDesdeResultado(resultadoHistorial);
    const eventoId = String(evento.id || "");
    const guardiaFecha = obtenerGuardiaFecha(resultadoHistorial, ctx) || "sin_guardia";
    const informeKey = obtenerInformeKey(resultadoHistorial, ctx.deps || {});
    const operativoKey = obtenerOperativoKey(resultadoHistorial, ctx);
    const carpeta = safePathSegment(ctx.carpeta || ctx.tipoEvento || evento.tipo_evento || "informe", "informe", 50);
    const safeKey = safePathSegment(operativoKey, "operativo", 90);
    const safeInforme = d.normalizarComponenteInformeKeyWsp(informeKey || eventoId) || eventoId || "sin_informe";
    const n = Math.max(1, parseInt(numero, 10) || 1);

    return `informes/${carpeta}/${guardiaFecha}/${safeKey}/${safeInforme}/${Date.now()}_${n}.jpg`;
  }

  function construirRowFotoInforme(resultadoHistorial = {}, numero = 1, path = "", ctx = {}) {
    const d = getDeps(ctx.deps || {});
    const evento = eventoDesdeResultado(resultadoHistorial);
    const estado = estadoDesdeResultado(resultadoHistorial);
    const eventoId = String(evento.id || "");
    const estadoId = String(estado.id || "");
    const informeKey = obtenerInformeKey(resultadoHistorial, ctx.deps || {});
    const operativoKey = obtenerOperativoKey(resultadoHistorial, ctx);
    const guardiaFecha = obtenerGuardiaFecha(resultadoHistorial, ctx);
    const tipoEvento = String(ctx.tipoEvento || evento.tipo_evento || "INFORME").toUpperCase();
    const bucket = d.HISTORIAL_FOTOS_BUCKET || DEFAULT_BUCKET;
    const publicUrl = `${d.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

    return {
      evento_id: eventoId,
      operativo_estado_id: estadoId || null,
      operativo_key: operativoKey,
      guardia_fecha: guardiaFecha,
      informe_key: informeKey || null,
      tipo_evento: tipoEvento,
      foto_numero: Math.max(1, parseInt(numero, 10) || 1),
      storage_bucket: bucket,
      storage_path: path,
      public_url: publicUrl,
    };
  }

  async function eliminarFotosPreviasInformeWsp(resultadoHistorial = {}, ctx = {}) {
    const d = getDeps(ctx.deps || {});
    const informeKey = obtenerInformeKey(resultadoHistorial, ctx.deps || {});
    const guardiaFecha = obtenerGuardiaFecha(resultadoHistorial, ctx);
    if (!informeKey) return;
    if (!d.fetch || !d.SUPABASE_URL) throw new Error("Supabase/fetch no disponible para limpiar fotos de informe.");

    const filtros = new URLSearchParams({
      guardia_fecha: `eq.${guardiaFecha}`,
      informe_key: `eq.${informeKey}`,
    });

    const r = await d.fetch(`${d.SUPABASE_URL}/rest/v1/${d.HISTORIAL_FOTOS_TABLE}?${filtros.toString()}`, {
      method: "DELETE",
      headers: d.headersSupabase({ Prefer: "return=minimal" }),
    });

    if (!r.ok) {
      throw new Error(`No se pudieron limpiar fotos previas: ${r.status} ${await r.text().catch(() => "")}`);
    }
  }

  async function subirFotoInformeWsp(file, resultadoHistorial = {}, numero = 1, ctx = {}) {
    const d = getDeps(ctx.deps || {});
    if (!file || !resultadoHistorial?.evento?.id) return null;
    if (!d.fetch || !d.SUPABASE_URL) throw new Error("Supabase/fetch no disponible para subir foto de informe.");

    const archivo = await d.normalizarImagenControlMovil(file);
    const path = construirPathFotoInforme(resultadoHistorial, numero, ctx);
    const bucket = d.HISTORIAL_FOTOS_BUCKET || DEFAULT_BUCKET;
    const url = `${d.SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

    const r = await d.fetch(url, {
      method: "POST",
      headers: d.headersSupabase({
        "Content-Type": archivo.type || "image/jpeg",
        "x-upsert": "false",
      }),
      body: archivo,
    });

    if (!r.ok) {
      throw new Error(`No se pudo subir foto ${numero}: ${r.status} ${await r.text().catch(() => "")}`);
    }

    const row = construirRowFotoInforme(resultadoHistorial, numero, path, ctx);
    const ins = await d.fetch(`${d.SUPABASE_URL}/rest/v1/${d.HISTORIAL_FOTOS_TABLE}`, {
      method: "POST",
      headers: d.headersSupabase({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(row),
    });

    if (!ins.ok) {
      throw new Error(`No se pudo registrar foto ${numero}: ${ins.status} ${await ins.text().catch(() => "")}`);
    }

    return row;
  }

  async function subirFotosInformeWsp(resultadoHistorial = {}, files = [], ctx = {}) {
    const fotos = limitarFotos(files, MAX_FOTOS_INFORME);
    const subidas = [];

    for (let i = 0; i < fotos.length; i += 1) {
      subidas.push(await subirFotoInformeWsp(fotos[i], resultadoHistorial, i + 1, ctx));
    }

    return subidas.filter(Boolean);
  }

  const api = {
    MAX_FOTOS_INFORME,
    limitarFotos,
    fotosSeleccionadasDesdeInputs,
    obtenerInformeKey,
    obtenerGuardiaFecha,
    obtenerOperativoKey,
    construirPathFotoInforme,
    construirRowFotoInforme,
    eliminarFotosPreviasInformeWsp,
    subirFotoInformeWsp,
    subirFotosInformeWsp,
  };

  window.WSP.services.fotosInformes = api;
  window.WSP.modules.fotosInformes = api;

  console.log("[WSP fotos informes] cargado");
})();
