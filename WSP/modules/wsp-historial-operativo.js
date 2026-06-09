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

  function normalizarHoraRango(value = "") {
    const raw = limpiarTextoSimple(value || "").replace(/[–—]/g, "-");
    if (!raw) return "";
    const m = raw.match(/\b(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?\b\s*(?:A|a|-|\/|HASTA|hasta)\s*(FINALIZAR|\d{1,2}\s*:\s*\d{2}(?::\d{2})?)\b/);
    if (!m) return "";
    const hi = Number(m[1]);
    const mi = Number(m[2]);
    if (hi < 0 || hi > 23 || mi < 0 || mi > 59) return "";
    let hasta = limpiarTextoSimple(m[3]).toUpperCase();
    const desde = `${String(hi).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
    if (hasta !== "FINALIZAR") {
      const mh = hasta.match(/^(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?$/);
      if (!mh) return "";
      const hf = Number(mh[1]);
      const mf = Number(mh[2]);
      if (hf < 0 || hf > 23 || mf < 0 || mf > 59) return "";
      hasta = `${String(hf).padStart(2, "0")}:${String(mf).padStart(2, "0")}`;
    }
    return `${desde} A ${hasta}`;
  }

  function normalizarHoraCampo(value = "") {
    const raw = limpiarTextoSimple(value || "");
    if (!raw || /^FINALIZAR$/i.test(raw)) return /^FINALIZAR$/i.test(raw) ? "FINALIZAR" : "";
    const m = raw.match(/^(\d{1,2})\s*:\s*(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
    if (!m) return "";
    const h = Number(m[1]);
    const mm = Number(m[2]);
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return "";
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  function horarioDesdePartes(desde = "", hasta = "") {
    const d = normalizarHoraCampo(desde);
    const h = normalizarHoraCampo(hasta);
    if (!d || !h) return "";
    return normalizarHoraRango(`${d} A ${h}`);
  }

  function resolverHorarioRow(row = {}, metadata = {}) {
    const candidatos = [
      row?.franja_horaria,
      row?.inicio_franja_horaria,
      row?.horario_inicio,
      row?.horario,
      metadata?.franja_horaria,
      metadata?.horario_inicio,
      metadata?.horario,
      metadata?.ultimo_horario,
    ];
    for (const item of candidatos) {
      const normalizado = normalizarHoraRango(item || "");
      if (normalizado) return normalizado;
    }
    const pares = [
      [row?.hora_inicio, row?.hora_finalizacion],
      [row?.inicio_hora_inicio, row?.inicio_hora_finalizacion],
      [row?.hora_desde, row?.hora_hasta],
      [metadata?.hora_inicio, metadata?.hora_finalizacion],
      [metadata?.hora_desde, metadata?.hora_hasta],
    ];
    for (const [desde, hasta] of pares) {
      const normalizado = horarioDesdePartes(desde, hasta);
      if (normalizado) return normalizado;
    }
    return "";
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
    const ultimoEventoMeta = limpiarTextoSimple(metadataEstado?.ultimo_evento || metadataEstado?.tipo_evento || "").toUpperCase().replace(/\s+/g, "_");
    const ultimoPayloadInicio = ultimoEventoMeta === "INICIO" ? (d.parseJsonObjectWsp(metadataEstado?.ultimo_payload_wsp) || {}) : {};
    const payloadInicioMeta = d.parseJsonObjectWsp(metadataEstado?.payload_inicio) || {};
    const horario = resolverHorarioRow(row, metadataEstado);
    return d.normalizarInicioGuardado({
      guardia_fecha: row?.guardia_fecha || d.getGuardiaFechaISO(),
      operativo_estado_id: row?.operativo_estado_id || row?.id || "",
      operativo_key: row?.operativo_key || "",
      orden_num: d.normalizarArrayJsonWsp(row?.ordenes_origen).join(" / ") || limpiarTextoSimple(metadataEstado?.orden_num || metadataEstado?.orden || ""),
      texto_ref: limpiarTextoSimple(metadataEstado?.texto_ref || metadataEstado?.titulo || metadataEstado?.archivo || "Operativo en curso"),
      horario,
      lugar: row?.lugar || "",
      tipo_corto: row?.tipo_operativo || metadataEstado?.tipo_operativo || metadataEstado?.titulo || "Operativo iniciado",
      // Paso 91B: para FINALIZA/Mismo..., estos datos deben ser del INICIO vigente.
      // No usar metadata.ultimo_* cuando el estado ya fue FINALIZADO, porque ahí
      // suele contener el último FINALIZADO y puede cruzar personal/móvil/elementos.
      personal: row?.inicio_personal || row?.personal_inicio || metadataEstado?.personal_inicio || payloadInicioMeta?.personal || ultimoPayloadInicio?.personal || [],
      moviles: row?.inicio_moviles || row?.moviles_inicio || metadataEstado?.moviles_inicio || payloadInicioMeta?.moviles || ultimoPayloadInicio?.moviles || [],
      motos: row?.inicio_motos || row?.motos_inicio || metadataEstado?.motos_inicio || payloadInicioMeta?.motos || ultimoPayloadInicio?.motos || [],
      elementos: row?.inicio_elementos || row?.elementos_inicio || metadataEstado?.elementos_inicio || payloadInicioMeta?.elementos || ultimoPayloadInicio?.elementos || {},
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
      const repo = window.BMZCN?.OperativosRepo;
      const guardiaFecha = d.getGuardiaFechaISO();

      // Paso 91B: primero buscar por operativo_key exacto. Si no existe, recién
      // se mantiene el fallback flexible histórico. Esto evita tomar datos de
      // otro operativo parecido, pero no deja WSP sin cargar si la clave vieja
      // no coincide por alguna variante.
      if (repo && typeof repo.buscarEstadoPorKey === "function") {
        const clavesExactas = Array.from(keysPosibles).filter(Boolean);
        for (const key of clavesExactas) {
          try {
            const rowExacta = await repo.buscarEstadoPorKey({ operativoKey: key, guardiaFecha });
            if (!rowExacta || rowExacta.deleted_at || !rowExacta.inicio_evento_id) continue;
            const payloadExacto = normalizarInicioDesdeVistaGuardiaWsp(rowExacta, d);
            if (payloadExacto) {
              window.WSP = window.WSP || {};
              window.WSP.debug = window.WSP.debug || {};
              window.WSP.debug.ultimoInicioFinalizaExacto = {
                version: "paso91b-wsp-repara-inicio-upsert-finaliza-inicio-vigente-20260609",
                fuente: "buscarEstadoPorKey_exact_first",
                operativo_key: key,
                guardia_fecha: guardiaFecha,
                estado_id: rowExacta.id || "",
                inicio_evento_id: rowExacta.inicio_evento_id || "",
                finalizado_evento_id: rowExacta.finalizado_evento_id || "",
              };
              return payloadExacto;
            }
          } catch (eExacta) {
            console.warn("[WSP historial operativo] No se pudo leer INICIO por key exacta. Se continúa con fallback.", key, eExacta);
          }
        }
      }

      if (repo?.leerOperativosGuardia) {
        const rows = await repo.leerOperativosGuardia({ guardiaFecha, limit: 500 });
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
    const meta = d.parseJsonObjectWsp(row?.metadata) || {};
    const horario = resolverHorarioRow(row, meta);
    const ordenes = d.normalizarArrayJsonWsp(row?.ordenes_origen);

    return d.normalizarInicioGuardado({
      guardia_fecha: row?.guardia_fecha || d.getGuardiaFechaISO(),
      operativo_estado_id: row?.id || row?.operativo_estado_id || "",
      operativo_key: row?.operativo_key || "",
      orden_num: ordenes.join(" / ") || limpiarTextoSimple(meta?.orden_num || meta?.orden || ""),
      texto_ref: limpiarTextoSimple(meta?.texto_ref || meta?.archivo || "Operativo en curso"),
      horario,
      lugar: row?.lugar || "",
      tipo_corto: row?.tipo_operativo || meta?.tipo_operativo || row?.tipo || "Operativo iniciado",
      personal: row?.inicio_personal || row?.personal_inicio || row?.personal || meta?.personal_inicio || meta?.ultimo_personal || meta?.personal || [],
      moviles: row?.inicio_moviles || row?.moviles_inicio || row?.moviles || meta?.moviles_inicio || meta?.ultimo_moviles || meta?.moviles || [],
      motos: row?.inicio_motos || row?.motos_inicio || row?.motos || meta?.motos_inicio || meta?.ultimo_motos || meta?.motos || [],
      elementos: row?.inicio_elementos || row?.elementos_inicio || row?.elementos || meta?.elementos_inicio || meta?.ultimo_elementos || meta?.elementos || {},
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
        deleted_at: "is.null",
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
    const selectCols = "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,franja_horaria,hora_inicio,hora_finalizacion,lugar,tipo_operativo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at,personal_inicio,moviles_inicio,motos_inicio,elementos_inicio,texto_inicio,horario_inicio,lugar_inicio";

    try {
      const data = await leerTabla("operativos_estado", {
        select: selectCols,
        guardia_fecha: `eq.${d.getGuardiaFechaISO()}`,
        deleted_at: "is.null",
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
    const debug = {
      version: "paso88r-finaliza-lee-en-curso-tabla-base-20260608",
      guardiaFecha: d.getGuardiaFechaISO(),
      fuentes: [],
      timestamp: new Date().toISOString(),
    };

    try {
      if (window.BMZCN?.OperativosRepo?.leerOperativosGuardia) {
        const rows = await window.BMZCN.OperativosRepo.leerOperativosGuardia({ guardiaFecha: d.getGuardiaFechaISO(), limit: 500 });
        const inicios = (Array.isArray(rows) ? rows : [])
          .filter((row) => normalizarEstado(row?.estado_real || row?.estado || "") === "EN_CURSO")
          .map((row) => normalizarInicioDesdeVistaGuardiaWsp(row, d))
          .filter((item) => item && item.operativo_key);
        const unicos = d.deduplicarIniciosInformeWsp(inicios);
        debug.fuentes.push({ fuente: "OperativosRepo.leerOperativosGuardia", filas: Array.isArray(rows) ? rows.length : 0, enCurso: unicos.length });
        if (unicos.length) {
          window.WSP = window.WSP || {};
          window.WSP.debug = window.WSP.debug || {};
          window.WSP.debug.historialLeerIniciosGuardia = debug;
          return unicos;
        }
      }
    } catch (e) {
      debug.fuentes.push({ fuente: "OperativosRepo.leerOperativosGuardia", error: e?.message || String(e) });
      console.warn("[WSP historial operativo] Error leyendo operativos EN CURSO desde OperativosRepo.", e);
    }

    const enCurso = await leerOperativosEnCursoDesdeEstadoSupabase(d);
    const unicos = d.deduplicarIniciosInformeWsp(Array.isArray(enCurso) ? enCurso : []);
    debug.fuentes.push({ fuente: "operativos_estado_directo", enCurso: unicos.length });
    window.WSP = window.WSP || {};
    window.WSP.debug = window.WSP.debug || {};
    window.WSP.debug.historialLeerIniciosGuardia = debug;
    return unicos;
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

  console.log("[WSP historial operativo] cargado paso91b-wsp-repara-inicio-upsert-finaliza-inicio-vigente-20260609");
})();
