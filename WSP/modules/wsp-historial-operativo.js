(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};

  function limpiarTextoSimple(valor) {
    return String(valor || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarEstado(valor) {
    return limpiarTextoSimple(valor || "")
      .toUpperCase()
      .replace(/\s+/g, "_");
  }

  function parseJsonObject(value) {
    if (!value) return null;
    if (typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
      } catch {}
    }
    return null;
  }

  function normalizarArrayJson(value) {
    if (Array.isArray(value)) return value.map((v) => limpiarTextoSimple(v)).filter(Boolean);
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((v) => limpiarTextoSimple(v)).filter(Boolean);
      } catch {}
      return [limpiarTextoSimple(raw)].filter(Boolean);
    }
    return [];
  }

  function timestampMs(value) {
    if (!value) return NaN;
    const d = new Date(String(value).trim());
    return !isNaN(d.getTime()) ? d.getTime() : NaN;
  }

  function getDeps(deps = {}) {
    const wspConfig = window.WSP?.config || {};

    return {
      SUPABASE_URL: deps.SUPABASE_URL || deps.supabaseUrl || wspConfig.supabaseUrl || window.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: deps.SUPABASE_ANON_KEY || deps.supabaseAnonKey || wspConfig.supabaseAnonKey || window.SUPABASE_ANON_KEY || "",
      getGuardiaFechaISO: typeof deps.getGuardiaFechaISO === "function" ? deps.getGuardiaFechaISO : (() => ""),
      construirOperativoKeysPosibles: typeof deps.construirOperativoKeysPosibles === "function" ? deps.construirOperativoKeysPosibles : (() => []),
      puntuarCoincidenciaInicio: typeof deps.puntuarCoincidenciaInicio === "function" ? deps.puntuarCoincidenciaInicio : (() => -1),
      normalizarInicioGuardado: typeof deps.normalizarInicioGuardado === "function" ? deps.normalizarInicioGuardado : ((payload) => payload || null),
      deduplicarIniciosInformeWsp: typeof deps.deduplicarIniciosInformeWsp === "function" ? deps.deduplicarIniciosInformeWsp : deduplicarInicios,
      construirOperativoKeyEstable: typeof deps.construirOperativoKeyEstable === "function" ? deps.construirOperativoKeyEstable : (() => ""),
      resultadoGuardadoValidoWsp: typeof deps.resultadoGuardadoValidoWsp === "function" ? deps.resultadoGuardadoValidoWsp : resultadoGuardadoValido,
      esErrorValidacionOperativaWsp: typeof deps.esErrorValidacionOperativaWsp === "function" ? deps.esErrorValidacionOperativaWsp : (() => false),
      mensajeErrorOperativoWsp: typeof deps.mensajeErrorOperativoWsp === "function" ? deps.mensajeErrorOperativoWsp : mensajeError,
      headersSupabase: typeof deps.headersSupabase === "function" ? deps.headersSupabase : null,
      fetchSupabaseTabla: typeof deps.fetchSupabaseTabla === "function" ? deps.fetchSupabaseTabla : null,
      limpiarTextoSimple: typeof deps.limpiarTextoSimple === "function" ? deps.limpiarTextoSimple : limpiarTextoSimple,
      normalizarArrayJsonWsp: typeof deps.normalizarArrayJsonWsp === "function" ? deps.normalizarArrayJsonWsp : normalizarArrayJson,
      parseJsonObjectWsp: typeof deps.parseJsonObjectWsp === "function" ? deps.parseJsonObjectWsp : parseJsonObject,
      timestampOperativoAMs: typeof deps.timestampOperativoAMs === "function" ? deps.timestampOperativoAMs : timestampMs,
    };
  }

  async function leerTabla(table, params, deps = {}, extraHeaders = { Accept: "application/json" }) {
    const d = getDeps(deps);
    if (d.fetchSupabaseTabla) return d.fetchSupabaseTabla(table, { params, extraHeaders });

    const svc = window.WSP?.services?.historialOperativo;
    if (svc && typeof svc.fetchSupabaseTabla === "function") {
      return svc.fetchSupabaseTabla({
        supabaseUrl: d.SUPABASE_URL,
        anonKey: d.SUPABASE_ANON_KEY,
        table,
        params,
        extraHeaders,
      });
    }

    if (!d.SUPABASE_URL || !d.SUPABASE_ANON_KEY) throw new Error("Falta configuración Supabase para historial operativo.");
    const qs = new URLSearchParams(params || {}).toString();
    const headers = d.headersSupabase
      ? d.headersSupabase(extraHeaders)
      : {
          apikey: d.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${d.SUPABASE_ANON_KEY}`,
          ...extraHeaders,
        };
    const r = await fetch(`${String(d.SUPABASE_URL).replace(/\/+$/, "")}/rest/v1/${table}${qs ? `?${qs}` : ""}`, { headers });
    if (!r.ok) throw new Error(`${table} ${r.status}: ${await r.text().catch(() => "")}`);
    return r.json();
  }

  function resultadoGuardadoValido(resultado) {
    return !!(resultado && resultado.estado && resultado.evento && resultado.estado.id && resultado.evento.id);
  }

  function mensajeError(error) {
    return limpiarTextoSimple(error?.message || "Error de validación operativa.") || "Error de validación operativa.";
  }

  function normalizarInicioDesdeVistaGuardiaWsp(row, deps = {}) {
    if (!row) return null;
    const d = getDeps(deps);
    const metadataEstado = d.parseJsonObjectWsp(row?.estado_metadata || row?.metadata) || {};
    const horario = limpiarTextoSimple(row?.hora_desde && row?.hora_hasta ? `${row.hora_desde} A ${row.hora_hasta}` : row?.horario || metadataEstado?.horario || "");
    return d.normalizarInicioGuardado({
      guardia_fecha: row?.guardia_fecha || d.getGuardiaFechaISO(),
      operativo_estado_id: row?.operativo_estado_id || row?.id || "",
      operativo_key: row?.operativo_key || "",
      orden_num: d.normalizarArrayJsonWsp(row?.ordenes_origen).join(" / ") || limpiarTextoSimple(metadataEstado?.orden_num || metadataEstado?.orden || ""),
      texto_ref: limpiarTextoSimple(metadataEstado?.texto_ref || metadataEstado?.titulo || metadataEstado?.archivo || "Operativo en curso"),
      horario,
      lugar: row?.lugar || "",
      tipo_corto: row?.tipo_operativo || metadataEstado?.tipo_operativo || metadataEstado?.titulo || "Operativo iniciado",
      personal: row?.inicio_personal || metadataEstado?.personal_inicio || metadataEstado?.ultimo_personal || metadataEstado?.personal || [],
      moviles: row?.inicio_moviles || metadataEstado?.moviles_inicio || metadataEstado?.ultimo_moviles || metadataEstado?.moviles || [],
      motos: row?.inicio_motos || metadataEstado?.motos_inicio || metadataEstado?.ultimo_motos || metadataEstado?.motos || [],
      elementos: row?.inicio_elementos || metadataEstado?.elementos_inicio || metadataEstado?.ultimo_elementos || metadataEstado?.elementos || {},
      ts: d.timestampOperativoAMs(row?.updated_at || row?.created_at) || Date.now(),
    });
  }

  async function leerInicioDesdeSupabase(franja, deps = {}) {
    if (!franja) return null;
    const d = getDeps(deps);
    const keysPosibles = new Set(d.construirOperativoKeysPosibles(franja).map((v) => limpiarTextoSimple(v)).filter(Boolean));
    const keyDirecta = limpiarTextoSimple(franja?.__operativoKey || franja?.__inicioGuardadoPayload?.operativo_key || "");
    if (keyDirecta) keysPosibles.add(keyDirecta);

    try {
      if (window.BMZCN?.OperativosRepo?.leerOperativosGuardia) {
        const rows = await window.BMZCN.OperativosRepo.leerOperativosGuardia({ guardiaFecha: d.getGuardiaFechaISO(), limit: 500 });
        let mejor = null;
        let mejorPuntaje = -1;
        (Array.isArray(rows) ? rows : []).forEach((row) => {
          const estadoReal = normalizarEstado(row?.estado_real || row?.estado || "");
          if (!["EN_CURSO", "FINALIZADO"].includes(estadoReal)) return;
          const rowKey = limpiarTextoSimple(row?.operativo_key || "");
          const payload = normalizarInicioDesdeVistaGuardiaWsp(row, d);
          if (!payload) return;
          const puntaje = keysPosibles.has(rowKey) ? 100 : d.puntuarCoincidenciaInicio(payload, franja);
          if (puntaje > mejorPuntaje) {
            mejor = payload;
            mejorPuntaje = puntaje;
          }
        });
        if (mejor && mejorPuntaje >= 90) return mejor;
      }
    } catch (e) {
      console.warn("[WSP historial operativo] No se pudo leer INICIO desde OperativosRepo.", e);
    }

    return d.normalizarInicioGuardado(franja?.__inicioGuardadoPayload) || null;
  }

  function estadoOperativoEsEnCursoWsp(row) {
    const estadoTxt = normalizarEstado(row?.estado || "");
    const tieneInicioReal = !!row?.inicio_evento_id;
    const tieneFinalizado = !!row?.finalizado_evento_id || estadoTxt === "FINALIZADO" || estadoTxt === "CERRADO";
    if (tieneFinalizado) return false;
    if (["EN_CURSO", "INICIADO", "ACTIVO"].includes(estadoTxt)) return true;
    if (tieneInicioReal && !estadoTxt) return true;
    return false;
  }

  function normalizarEstadoOperativoEnCurso(row, deps = {}) {
    if (!row || !estadoOperativoEsEnCursoWsp(row)) return null;
    const d = getDeps(deps);
    const horaDesde = limpiarTextoSimple(row?.hora_desde || "");
    const horaHasta = limpiarTextoSimple(row?.hora_hasta || "");
    const horario = limpiarTextoSimple(row?.horario || (horaDesde && horaHasta ? `${horaDesde} A ${horaHasta}` : horaDesde || horaHasta));
    const ordenes = d.normalizarArrayJsonWsp(row?.ordenes_origen);
    const meta = d.parseJsonObjectWsp(row?.metadata) || {};

    return d.normalizarInicioGuardado({
      guardia_fecha: row?.guardia_fecha || d.getGuardiaFechaISO(),
      operativo_estado_id: row?.id || row?.operativo_estado_id || "",
      operativo_key: row?.operativo_key || "",
      orden_num: ordenes.join(" / ") || limpiarTextoSimple(meta?.orden_num || meta?.orden || ""),
      texto_ref: limpiarTextoSimple(meta?.texto_ref || meta?.archivo || "Operativo en curso"),
      horario,
      lugar: row?.lugar || "",
      tipo_corto: row?.tipo_operativo || meta?.tipo_operativo || row?.tipo || "Operativo iniciado",
      personal: row?.personal || meta?.personal_inicio || meta?.ultimo_personal || meta?.personal || [],
      moviles: row?.moviles || meta?.moviles_inicio || meta?.ultimo_moviles || meta?.moviles || [],
      motos: row?.motos || meta?.motos_inicio || meta?.ultimo_motos || meta?.motos || [],
      elementos: row?.elementos || meta?.elementos_inicio || meta?.ultimo_elementos || meta?.elementos || {},
      ts: d.timestampOperativoAMs(row?.updated_at || row?.created_at) || Date.now(),
    });
  }

  async function leerOperativoKeysFinalizadosGuardiaSupabase(deps = {}) {
    const d = getDeps(deps);
    const out = new Set();

    try {
      const data = await leerTabla("operativos_eventos", {
        select: "operativo_key,payload_completo,guardia_fecha,tipo_evento",
        guardia_fecha: `eq.${d.getGuardiaFechaISO()}`,
        tipo_evento: "eq.FINALIZADO",
        limit: "1000",
      }, d);

      (Array.isArray(data) ? data : []).forEach((row) => {
        [
          row?.operativo_key,
          row?.payload_completo?.operativo_key,
          row?.payload_completo?.franja?.__operativoKey,
        ].forEach((key) => {
          const clean = limpiarTextoSimple(key || "");
          if (clean) out.add(clean);
        });
      });
    } catch (e) {
      console.warn("[WSP historial operativo] Error leyendo FINALIZADOS para filtrar operativos iniciados.", e);
    }

    return out;
  }

  function deduplicarInicios(filas) {
    const vistos = new Set();
    const unicos = [];
    (Array.isArray(filas) ? filas : []).forEach((fila) => {
      const key = limpiarTextoSimple(fila?.operativo_key || "");
      if (!key || vistos.has(key)) return;
      vistos.add(key);
      unicos.push(fila);
    });
    return unicos;
  }

  async function leerOperativosEnCursoDesdeEstadoSupabase(deps = {}) {
    const d = getDeps(deps);
    const selectCols = "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,lugar,tipo_operativo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at";

    try {
      const data = await leerTabla("operativos_estado", {
        select: selectCols,
        guardia_fecha: `eq.${d.getGuardiaFechaISO()}`,
        order: "hora_desde.asc,updated_at.desc",
        limit: "300",
      }, d);

      // Fuente de verdad para el selector FINALIZA/INFORMES: operativos_estado EN_CURSO.
      // No excluir por FINALIZADO histórico suelto: al borrar un finalizado desde Estadísticas
      // el estado vuelve a EN_CURSO y puede conservar eventos finalizados antiguos para auditoría.
      return d.deduplicarIniciosInformeWsp((Array.isArray(data) ? data : [])
        .map((row) => normalizarEstadoOperativoEnCurso(row, d))
        .filter((item) => item && item.operativo_key));
    } catch (e) {
      console.warn("[WSP historial operativo] Error leyendo operativos EN CURSO desde operativos_estado.", e);
      return null;
    }
  }

  async function leerIniciosGuardiaDesdeWspIniciosFallback(deps = {}) {
    const d = getDeps(deps);
    const selectCols = "id,guardia_fecha,operativo_key,orden_num,texto_ref,horario,lugar,tipo_corto,personal,moviles,motos,elementos";

    try {
      const data = await leerTabla("wsp_inicios", {
        select: selectCols,
        guardia_fecha: `eq.${d.getGuardiaFechaISO()}`,
        order: "id.desc",
        limit: "300",
      }, d);

      const finalizados = await leerOperativoKeysFinalizadosGuardiaSupabase(d);
      return d.deduplicarIniciosInformeWsp((Array.isArray(data) ? data : [])
        .map((row) => d.normalizarInicioGuardado(row))
        .filter((item) => item && item.operativo_key && !finalizados.has(limpiarTextoSimple(item.operativo_key))));
    } catch (e) {
      console.warn("[WSP historial operativo] Error leyendo fallback wsp_inicios para INFORMES.", e);
      return [];
    }
  }

  async function leerIniciosGuardiaDesdeSupabase(deps = {}) {
    const d = getDeps(deps);

    try {
      if (window.BMZCN?.OperativosRepo?.leerOperativosGuardia) {
        const rows = await window.BMZCN.OperativosRepo.leerOperativosGuardia({ guardiaFecha: d.getGuardiaFechaISO(), limit: 500 });
        const inicios = (Array.isArray(rows) ? rows : [])
          .filter((row) => normalizarEstado(row?.estado_real || row?.estado || "") === "EN_CURSO")
          .map((row) => normalizarInicioDesdeVistaGuardiaWsp(row, d))
          .filter((item) => item && item.operativo_key);
        return d.deduplicarIniciosInformeWsp(inicios);
      }
    } catch (e) {
      console.warn("[WSP historial operativo] Error leyendo operativos EN CURSO desde OperativosRepo.", e);
    }

    const enCurso = await leerOperativosEnCursoDesdeEstadoSupabase(d);
    return d.deduplicarIniciosInformeWsp(Array.isArray(enCurso) ? enCurso : []);
  }

  function esEventoOperativoCriticoWsp(tipoEvento) {
    const tipo = limpiarTextoSimple(tipoEvento).toUpperCase();
    return tipo === "INICIO" || tipo === "FINALIZADO";
  }

  async function guardarHistorialOperativoWsp(tipoEvento, payload, deps = {}) {
    const d = getDeps(deps);
    const tipo = limpiarTextoSimple(tipoEvento).toUpperCase();
    const critico = esEventoOperativoCriticoWsp(tipo);

    try {
      const repo = window.BMZCN?.OperativosRepo;
      if (!repo) {
        return {
          ok: false,
          motivo: "No se pudo guardar en Supabase: BMZCN.OperativosRepo no está cargado. No se enviará el informe porque Estadísticas no podría actualizarse."
        };
      }

      let resultado = null;
      if (tipo === "INICIO" && typeof repo.guardarInicio === "function") {
        resultado = await repo.guardarInicio(payload);
      } else if (tipo === "FINALIZADO" && typeof repo.guardarFinalizado === "function") {
        resultado = await repo.guardarFinalizado(payload);
      } else if (typeof repo.guardarInforme === "function") {
        resultado = await repo.guardarInforme(tipo, payload);
      } else {
        return {
          ok: false,
          motivo: `No se pudo guardar en Supabase: función de guardado no disponible para ${tipo || "EVENTO"}.`
        };
      }

      if (critico && !d.resultadoGuardadoValidoWsp(resultado)) {
        return {
          ok: false,
          motivo: "No se confirmó el guardado en Supabase. No se enviará por WhatsApp porque Estadísticas no podría actualizarse."
        };
      }

      console.log("[WSP historial operativo] Evento guardado en Supabase", tipo, resultado);
      return resultado;
    } catch (e) {
      if (d.esErrorValidacionOperativaWsp(e)) {
        return { ok: false, motivo: d.mensajeErrorOperativoWsp(e), error: e };
      }
      console.error("[WSP historial operativo] Falló el guardado en Supabase.", e);
      return {
        ok: false,
        motivo: critico
          ? `No se pudo guardar ${tipo} en Supabase. No se enviará por WhatsApp porque Estadísticas no podría actualizarse. Detalle: ${d.mensajeErrorOperativoWsp(e)}`
          : `No se pudo guardar el informe en Supabase. Detalle: ${d.mensajeErrorOperativoWsp(e)}`,
        error: e
      };
    }
  }

  const api = {
    normalizarInicioDesdeVistaGuardiaWsp,
    leerInicioDesdeSupabase,
    estadoOperativoEsEnCursoWsp,
    normalizarEstadoOperativoEnCurso,
    leerOperativoKeysFinalizadosGuardiaSupabase,
    leerOperativosEnCursoDesdeEstadoSupabase,
    leerIniciosGuardiaDesdeWspIniciosFallback,
    leerIniciosGuardiaDesdeSupabase,
    esEventoOperativoCriticoWsp,
    guardarHistorialOperativoWsp,
  };

  window.WSP.services.historialOperativoRepo = api;
  window.WSP.modules.historialOperativo = api;

  console.log("[WSP historial operativo] cargado");
})();
