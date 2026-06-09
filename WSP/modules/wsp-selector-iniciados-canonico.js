(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};
  window.WSP.debug = window.WSP.debug || {};

  const VERSION = "paso88r-selector-canonico-en-curso-tabla-base-20260608";
  const TABLA_ESTADOS = "operativos_estado";
  const TABLA_EVENTOS = "operativos_eventos";

  function limpiarTextoSimple(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizarEstado(value) {
    return limpiarTextoSimple(value)
      .toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");
  }

  function parseJsonObject(value) {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return {};
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
      } catch {}
    }
    return {};
  }

  function normalizarArray(value) {
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

  function marcaEliminadoEnObjeto(obj = {}) {
    return !!(
      obj.eliminado_desde_acumulador ||
      obj.eliminado_acumulador ||
      obj.eliminado_completo_desde_acumulador ||
      obj.borrado_logico_desde_acumulador ||
      obj.eliminado === true ||
      normalizarEstado(obj.estado_logico || "") === "BORRADO"
    );
  }

  function tieneMarcaEliminado(value) {
    return marcaEliminadoEnObjeto(parseJsonObject(value));
  }

  function estadoEliminado(row) {
    return !!(
      row?.deleted_at ||
      row?.eliminado_desde_acumulador ||
      tieneMarcaEliminado(row?.metadata)
    );
  }

  function eventoEliminado(row) {
    return !!(
      row?.deleted_at ||
      row?.eliminado_desde_acumulador ||
      tieneMarcaEliminado(row?.payload_completo) ||
      tieneMarcaEliminado(row?.metadata)
    );
  }

  function getConfig() {
    const cfg = window.WSP?.config || {};
    const supabaseUrl = limpiarTextoSimple(cfg.supabaseUrl || window.SUPABASE_URL || "").replace(/\/+$/, "");
    const anonKey = limpiarTextoSimple(cfg.supabaseAnonKey || window.SUPABASE_ANON_KEY || "");
    return { supabaseUrl, anonKey };
  }

  function headers(extra = {}) {
    const { anonKey } = getConfig();
    return { apikey: anonKey, Authorization: `Bearer ${anonKey}`, ...extra };
  }

  async function leerTabla(table, params = {}) {
    const { supabaseUrl, anonKey } = getConfig();
    if (!supabaseUrl || !anonKey) throw new Error("[WSP Selector Canonico] Falta config Supabase.");
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      qs.set(k, String(v));
    });
    const url = `${supabaseUrl}/rest/v1/${table}${qs.toString() ? "?" + qs.toString() : ""}`;
    const r = await fetch(url, { headers: headers({ Accept: "application/json" }) });
    if (!r.ok) throw new Error(`${table} ${r.status}: ${await r.text().catch(() => "")}`);
    return r.json();
  }

  function getGuardiaFechaISO(deps = {}) {
    if (typeof deps.getGuardiaFechaISO === "function") return deps.getGuardiaFechaISO();
    if (typeof window.getGuardiaFechaISO === "function") return window.getGuardiaFechaISO();
    const now = new Date();
    const inicio = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0);
    if (now < inicio) inicio.setDate(inicio.getDate() - 1);
    return `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, "0")}-${String(inicio.getDate()).padStart(2, "0")}`;
  }

  function fechaISOValida(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(limpiarTextoSimple(value));
  }

  function normalizarHora(value) {
    const m = limpiarTextoSimple(value).match(/^(\d{1,2})\s*[:.]\s*(\d{2})$/);
    if (!m) return "";
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return "";
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  function normalizarHorarioRango(value) {
    const t = limpiarTextoSimple(value);
    const m = t.match(/^(\d{1,2})\s*[:.]\s*(\d{2})\s*(?:a|A|-|–|—)\s*(\d{1,2})\s*[:.]\s*(\d{2})$/);
    if (!m) return "";
    const desde = normalizarHora(`${m[1]}:${m[2]}`);
    const hasta = normalizarHora(`${m[3]}:${m[4]}`);
    return desde && hasta ? `${desde} A ${hasta}` : "";
  }

  function horarioDesdeTextoGenerado(texto) {
    const raw = String(texto || "");
    if (!raw.trim()) return "";
    const lineas = raw.split(/\r?\n/).map((linea) => limpiarTextoSimple(linea.replace(/[\*_`~]+/g, ""))).filter(Boolean);
    for (const linea of lineas) {
      if (/^horario\s*:/i.test(linea)) {
        const rango = normalizarHorarioRango(linea.replace(/^horario\s*:\s*/i, ""));
        if (rango) return rango;
      }
    }
    const m = raw.match(/(\d{1,2})\s*[:.]\s*(\d{2})\s*a\s*(\d{1,2})\s*[:.]\s*(\d{2})/i);
    return m ? normalizarHorarioRango(`${m[1]}:${m[2]} A ${m[3]}:${m[4]}`) : "";
  }

  function resolverMetadataPayload(row, inicioEv) {
    const meta = parseJsonObject(row?.metadata);
    const payloadInicio = parseJsonObject(meta?.payload_inicio || meta?.ultimo_payload_wsp || meta?.inicio_payload || {});
    const payloadEvento = parseJsonObject(inicioEv?.payload_completo || {});
    return { meta, payloadInicio, payloadEvento };
  }

  function resolverHorarioEstado(row, inicioEv) {
    const { meta, payloadInicio, payloadEvento } = resolverMetadataPayload(row, inicioEv);
    const candidatos = [
      row?.hora_desde && row?.hora_hasta ? `${row.hora_desde} A ${row.hora_hasta}` : "",
      row?.horario,
      meta?.horario_inicio,
      meta?.inicio_horario,
      meta?.horario,
      payloadInicio?.horario,
      payloadInicio?.franja?.horario,
      inicioEv?.hora_desde && inicioEv?.hora_hasta ? `${inicioEv.hora_desde} A ${inicioEv.hora_hasta}` : "",
      inicioEv?.horario,
      payloadEvento?.horario,
      payloadEvento?.franja?.horario,
      horarioDesdeTextoGenerado(inicioEv?.texto_generado || payloadEvento?.texto_generado || meta?.inicio_texto_generado || meta?.ultimo_texto_generado || ""),
    ];
    for (const candidato of candidatos) {
      const rango = normalizarHorarioRango(candidato);
      if (rango) return rango;
    }
    // Blindaje: no devolver números de orden como 0028. Si no hay rango real, mostrar vacío.
    return "";
  }

  function resolverLugarEstado(row, inicioEv) {
    const { meta, payloadInicio, payloadEvento } = resolverMetadataPayload(row, inicioEv);
    return limpiarTextoSimple(
      inicioEv?.lugar || payloadEvento?.lugar || payloadEvento?.franja?.lugar ||
      meta?.lugar_inicio || payloadInicio?.lugar || payloadInicio?.franja?.lugar || row?.lugar || ""
    );
  }

  function resolverTipoEstado(row, inicioEv) {
    const { meta, payloadInicio, payloadEvento } = resolverMetadataPayload(row, inicioEv);
    return limpiarTextoSimple(
      inicioEv?.tipo_operativo || payloadEvento?.tipo_corto || payloadEvento?.tipo_operativo || payloadEvento?.franja?.__tipoPublicado ||
      meta?.tipo_operativo_inicio || meta?.tipo_operativo || payloadInicio?.tipo_corto || payloadInicio?.tipo_operativo ||
      row?.tipo_operativo || "Operativo iniciado"
    );
  }

  function resolverTextoRefEstado(row, inicioEv) {
    const { meta, payloadInicio, payloadEvento } = resolverMetadataPayload(row, inicioEv);
    const candidatos = [
      inicioEv?.texto_ref,
      inicioEv?.archivo,
      payloadEvento?.texto_ref,
      payloadEvento?.archivo,
      payloadEvento?.franja?.__ordenTextoRef,
      payloadEvento?.franja?.texto_ref,
      meta?.texto_ref,
      meta?.archivo,
      meta?.titulo,
      payloadInicio?.texto_ref,
      payloadInicio?.archivo,
      payloadInicio?.franja?.__ordenTextoRef,
      payloadInicio?.franja?.texto_ref,
    ];

    for (const candidato of candidatos) {
      const clean = limpiarTextoSimple(candidato || "");
      if (clean && clean !== "Operativo en curso") return clean;
    }

    return "Operativo en curso";
  }

  function resolverOrdenes(row, inicioEv) {
    const { meta, payloadEvento } = resolverMetadataPayload(row, inicioEv);
    const arr = normalizarArray(row?.ordenes_origen);
    if (arr.length) return arr.join(" / ");
    const payloadOrdenes = normalizarArray(payloadEvento?.ordenes_origen || payloadEvento?.ordenesOrigen);
    if (payloadOrdenes.length) return payloadOrdenes.join(" / ");
    return limpiarTextoSimple(meta?.orden_num || meta?.orden || "");
  }

  function resolverArrayCampo(row, inicioEv, key, metaKeys = []) {
    const { meta, payloadEvento } = resolverMetadataPayload(row, inicioEv);
    const directos = [row?.[key], inicioEv?.[key], payloadEvento?.[key]];
    metaKeys.forEach((k) => directos.push(meta?.[k]));
    for (const val of directos) {
      const arr = normalizarArray(val);
      if (arr.length) return arr;
    }
    return [];
  }

  function resolverElementos(row, inicioEv) {
    const { meta, payloadEvento } = resolverMetadataPayload(row, inicioEv);
    const candidatos = [row?.elementos, inicioEv?.elementos, payloadEvento?.elementos, meta?.elementos_inicio, meta?.ultimo_elementos, meta?.elementos];
    for (const c of candidatos) {
      const obj = parseJsonObject(c);
      if (obj && Object.keys(obj).length) return obj;
    }
    return {};
  }

  function estadoEsEnCursoCanonico(row) {
    if (!row || estadoEliminado(row)) return false;
    const estadoTxt = normalizarEstado(row?.estado || row?.estado_real || "");
    if (row?.finalizado_evento_id) return false;
    if (["FINALIZADO", "CERRADO", "BORRADO"].includes(estadoTxt)) return false;
    // Paso 87C: EN_CURSO manda. No exigir inicio_evento_id ni snapshot.
    if (["EN_CURSO", "INICIADO", "ACTIVO"].includes(estadoTxt)) return true;
    // Respaldo: si no hay estado textual pero hay inicio_evento_id y no hay finalizado, también cuenta.
    return !estadoTxt && !!row?.inicio_evento_id;
  }

  function eventoFinalizadoActivo(row) {
    return normalizarEstado(row?.tipo_evento || "") === "FINALIZADO" && !eventoEliminado(row);
  }

  async function leerEventosPorIds(ids = []) {
    const limpios = Array.from(new Set((Array.isArray(ids) ? ids : []).map((id) => limpiarTextoSimple(id)).filter(Boolean)));
    if (!limpios.length) return new Map();
    try {
      const data = await leerTabla(TABLA_EVENTOS, {
        select: "id,operativo_estado_id,operativo_key,tipo_evento,fecha,horario,hora_desde,hora_hasta,lugar,tipo_operativo,personal,moviles,motos,elementos,payload_completo,metadata,texto_generado,created_at,updated_at,deleted_at",
        id: `in.(${limpios.join(",")})`,
        limit: String(Math.max(50, limpios.length + 5)),
      });
      const map = new Map();
      (Array.isArray(data) ? data : []).forEach((row) => {
        if (row?.id && !eventoEliminado(row)) map.set(String(row.id), row);
      });
      return map;
    } catch (e) {
      console.warn("[WSP Selector Canonico] No se pudieron leer eventos INICIO por id.", e);
      return new Map();
    }
  }

  async function leerOperativoKeysFinalizadosGuardiaSupabase(deps = {}) {
    const guardiaFecha = getGuardiaFechaISO(deps);
    const out = new Set();
    try {
      const data = await leerTabla(TABLA_EVENTOS, {
        select: "id,operativo_key,guardia_fecha,tipo_evento,payload_completo,metadata,deleted_at",
        guardia_fecha: `eq.${guardiaFecha}`,
        tipo_evento: "eq.FINALIZADO",
        limit: "1000",
      });
      (Array.isArray(data) ? data : []).filter(eventoFinalizadoActivo).forEach((row) => {
        [row?.operativo_key, row?.payload_completo?.operativo_key, row?.payload_completo?.franja?.__operativoKey].forEach((key) => {
          const clean = limpiarTextoSimple(key || "");
          if (clean) out.add(clean);
        });
      });
    } catch (e) {
      console.warn("[WSP Selector Canonico] Error leyendo FINALIZADOS activos.", e);
    }
    return out;
  }

  function deduplicarCanonico(items = []) {
    const porKey = new Map();
    (Array.isArray(items) ? items : []).forEach((item) => {
      const key = limpiarTextoSimple(item?.operativo_key || item?.operativo_estado_id || "");
      if (!key) return;
      const anterior = porKey.get(key);
      const tsItem = Number(item?.ts || 0);
      const tsAnterior = Number(anterior?.ts || 0);
      if (!anterior || tsItem >= tsAnterior) porKey.set(key, item);
    });
    return Array.from(porKey.values()).sort((a, b) => limpiarTextoSimple(a?.horario || "").localeCompare(limpiarTextoSimple(b?.horario || "")) || limpiarTextoSimple(a?.lugar || "").localeCompare(limpiarTextoSimple(b?.lugar || "")));
  }

  function normalizarItemCanonico(row, inicioEv, deps = {}) {
    const key = limpiarTextoSimple(row?.operativo_key || inicioEv?.operativo_key || row?.id || "");
    if (!key) return null;

    const horario = resolverHorarioEstado(row, inicioEv);
    const lugar = resolverLugarEstado(row, inicioEv) || limpiarTextoSimple(row?.lugar || "Sin lugar");
    const tipo = resolverTipoEstado(row, inicioEv) || "Operativo iniciado";
    const base = {
      guardia_fecha: row?.guardia_fecha || getGuardiaFechaISO(deps),
      operativo_estado_id: row?.id || row?.operativo_estado_id || "",
      operativo_key: key,
      orden_num: resolverOrdenes(row, inicioEv),
      texto_ref: resolverTextoRefEstado(row, inicioEv),
      horario: horario || "Sin horario",
      lugar,
      tipo_corto: tipo,
      personal: resolverArrayCampo(row, inicioEv, "personal", ["personal_inicio", "ultimo_personal", "personal"]),
      moviles: resolverArrayCampo(row, inicioEv, "moviles", ["moviles_inicio", "ultimo_moviles", "moviles"]),
      motos: resolverArrayCampo(row, inicioEv, "motos", ["motos_inicio", "ultimo_motos", "motos"]),
      elementos: resolverElementos(row, inicioEv),
      ts: Date.parse(row?.updated_at || row?.created_at || "") || Date.now(),
    };
    return typeof deps.normalizarInicioGuardado === "function" ? deps.normalizarInicioGuardado(base) : base;
  }

  function filaPerteneceAGuardia(row, guardiaFecha) {
    const meta = parseJsonObject(row?.metadata);
    const posibles = [row?.guardia_fecha, row?.fecha_operativo, meta?.guardia_fecha, meta?.fecha_operativo].map(limpiarTextoSimple).filter(Boolean);
    return posibles.some((v) => v === guardiaFecha) || !posibles.length;
  }

  async function leerEstadosEnCurso(guardiaFecha) {
    const select = "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,lugar,tipo_operativo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at,deleted_at";
    let rows = [];
    try {
      rows = await leerTabla(TABLA_ESTADOS, {
        select,
        guardia_fecha: `eq.${guardiaFecha}`,
        order: "hora_desde.asc,updated_at.desc",
        limit: "300",
      });
    } catch (e) {
      console.warn("[WSP Selector Canonico] Error leyendo estados por guardia.", e);
    }

    // Respaldo: si por diferencias de guardia_fecha no aparece nada, buscar EN_CURSO recientes.
    if (!Array.isArray(rows) || !rows.length) {
      try {
        const recientes = await leerTabla(TABLA_ESTADOS, {
          select,
          estado: "eq.EN_CURSO",
          order: "updated_at.desc",
          limit: "80",
        });
        rows = (Array.isArray(recientes) ? recientes : []).filter((row) => filaPerteneceAGuardia(row, guardiaFecha));
      } catch (e) {
        console.warn("[WSP Selector Canonico] Error leyendo respaldo de estados EN_CURSO recientes.", e);
      }
    }

    return Array.isArray(rows) ? rows : [];
  }

  async function leerOperativosEnCursoDesdeEstadoSupabase(deps = {}) {
    const guardiaFecha = getGuardiaFechaISO(deps);
    const debug = { version: VERSION, guardiaFecha, timestamp: new Date().toISOString() };

    try {
      const rows = await leerEstadosEnCurso(guardiaFecha);
      const estados = rows.filter(estadoEsEnCursoCanonico);
      const rechazados = rows.filter((row) => !estadoEsEnCursoCanonico(row)).map((row) => ({
        id: row?.id || "",
        operativo_key: row?.operativo_key || "",
        estado: row?.estado || "",
        deleted_at: row?.deleted_at || "",
        finalizado_evento_id: row?.finalizado_evento_id || "",
        metadata_eliminado: tieneMarcaEliminado(row?.metadata),
      }));

      const eventosInicio = await leerEventosPorIds(estados.map((row) => row.inicio_evento_id));
      const finalizados = await leerOperativoKeysFinalizadosGuardiaSupabase(deps);

      // EN_CURSO es la fuente de verdad. No excluir por FINALIZADO histórico suelto.
      const items = estados
        .map((row) => normalizarItemCanonico(row, eventosInicio.get(String(row.inicio_evento_id)) || null, deps))
        .filter(Boolean);
      const unicos = deduplicarCanonico(items);

      window.WSP.debug.selectorIniciadosCanonico = {
        ...debug,
        estadosLeidos: rows.length,
        estadosEnCursoCanonicos: estados.length,
        estadosRechazados: rechazados,
        finalizadosActivosIgnoradosParaSelector: finalizados.size,
        regla: "estado_EN_CURSO_manda_sin_exigir_inicio_evento_id_ni_operativo_key",
        items: unicos.map((item) => ({
          operativo_key: item.operativo_key,
          horario: item.horario,
          lugar: item.lugar,
          tipo_corto: item.tipo_corto,
          operativo_estado_id: item.operativo_estado_id,
        })),
      };
      return unicos;
    } catch (e) {
      window.WSP.debug.selectorIniciadosCanonico = { ...debug, error: e?.message || String(e) };
      console.warn("[WSP Selector Canonico] Error leyendo operativos EN CURSO canonicos.", e);
      return [];
    }
  }

  async function leerIniciosGuardiaDesdeSupabase(deps = {}) {
    return leerOperativosEnCursoDesdeEstadoSupabase(deps);
  }

  async function leerIniciosGuardiaDesdeWspIniciosFallback() {
    return [];
  }

  const api = {
    version: VERSION,
    leerOperativoKeysFinalizadosGuardiaSupabase,
    leerOperativosEnCursoDesdeEstadoSupabase,
    leerIniciosGuardiaDesdeSupabase,
    leerIniciosGuardiaDesdeWspIniciosFallback,
  };

  const repoAnterior = window.WSP.services.historialOperativoRepo || window.WSP.modules.historialOperativo || {};
  const repoCanonico = { ...repoAnterior, ...api };
  window.WSP.services.historialOperativoRepo = repoCanonico;
  window.WSP.modules.historialOperativo = repoCanonico;
  window.WSP.modules.selectorIniciadosCanonico = api;

  console.log("[WSP Selector Canonico] cargado", VERSION);
})();
