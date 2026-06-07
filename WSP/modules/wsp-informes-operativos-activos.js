(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};
  window.WSP.debug = window.WSP.debug || {};

  const VERSION = "paso87g-informes-contador-envio-alcoholemia-robusto-20260607";

  function limpiarTextoSimple(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function deduplicarIniciados(items = []) {
    const out = new Map();
    (Array.isArray(items) ? items : []).forEach((item) => {
      const key = limpiarTextoSimple(item?.operativo_key || item?.__operativoKey || item?.operativo_estado_id || item?.__key || "");
      if (!key) return;
      const ts = Date.parse(item?.updated_at || item?.created_at || "") || Number(item?.ts || 0) || 0;
      const prev = out.get(key);
      const prevTs = prev ? (Date.parse(prev.updated_at || prev.created_at || "") || Number(prev.ts || 0) || 0) : -1;
      if (!prev || ts >= prevTs) out.set(key, item);
    });
    return Array.from(out.values());
  }

  async function leerIniciados(config = {}) {
    const debug = { version: VERSION, timestamp: new Date().toISOString(), origen: "leer_iniciados_informes" };
    try {
      let rows = [];
      if (typeof config.leerIniciosGuardiaDesdeSupabase === "function") {
        rows = await config.leerIniciosGuardiaDesdeSupabase(config.deps || undefined);
      } else {
        const repo = window.WSP?.services?.historialOperativoRepo || window.WSP?.modules?.historialOperativo || null;
        if (repo && typeof repo.leerIniciosGuardiaDesdeSupabase === "function") {
          rows = await repo.leerIniciosGuardiaDesdeSupabase(config.deps || {});
        }
      }
      const unicos = deduplicarIniciados(rows);
      window.WSP.debug.informesOperativosActivos = {
        ...debug,
        cantidad: unicos.length,
        items: unicos.map((item) => ({
          operativo_key: limpiarTextoSimple(item?.operativo_key || item?.__operativoKey || ""),
          horario: limpiarTextoSimple(item?.horario || ""),
          lugar: limpiarTextoSimple(item?.lugar || ""),
          tipo: limpiarTextoSimple(item?.tipo_corto || item?.titulo || ""),
        })),
      };
      return unicos;
    } catch (e) {
      window.WSP.debug.informesOperativosActivos = { ...debug, error: e?.message || String(e), cantidad: 0 };
      console.warn("[WSP Informes Operativos Activos] No se pudieron leer iniciados.", e);
      return [];
    }
  }

  const api = { version: VERSION, leerIniciados, deduplicarIniciados };
  window.WSP.services.informesOperativosActivos = api;
  window.WSP.modules.informesOperativosActivos = api;
  console.log("[WSP Informes Operativos Activos] cargado", VERSION);
})();
