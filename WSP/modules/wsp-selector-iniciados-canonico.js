
(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};

  const VERSION = "paso87-selector-finaliza-canonico-20260607";
  const TABLA_ESTADOS = "operativos_estado";
  const TABLA_EVENTOS = "operativos_eventos";

  function limpiarTextoSimple(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
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

  function tieneMarcaEliminado(value) {
    const obj = parseJsonObject(value);
    return !!(
      obj.eliminado_desde_acumulador ||
      obj.eliminado_acumulador ||
      obj.eliminado_completo_desde_acumulador ||
      obj.borrado_logico_desde_acumulador ||
      obj.eliminado === true ||
      obj.estado_logico === "BORRADO"
    );
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
    return {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      ...extra,
    };
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
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`${table} ${r.status}: ${txt}`);
    }
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

  function pareceHora(value) {
    return /^\d{1,2}\s*[:.]\s*\d{2}$/.test(limpiarTextoSimple(value));
  }

  function pareceHorarioRango(value) {
    const t = limpiarTextoSimple(value);
    return /^\d{1,2}\s*[:.]\s*\d{2}\s*(?:a|A|-|–|—)\s*\d{1,2}\s*[:.]\s*\d{2}$/.test(t);
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
        const valor = limpiarTextoSimple(linea.replace(/^horario\s*:\s*/i, ""));
        const rango = normalizarHorarioRango(valor);
        if (rango) return rango;
      }
    }
    const m = raw.match(/(\d{1,2})\s*[:.]\s*(\d{2})\s*a\s*(\d{1,2})\s*[:.]\s*(\d{2})/i);
    if (m) return normalizarHorarioRango(`${m[1]}:${m[2]} A ${m[3]}:${m[4]}`);
    return "";
  }

  function resolverHorarioEstado(row, inicioEv) {
    const meta = parseJsonObject(row?.metadata);
    const payloadInicio = parseJsonObject(meta?.payload_inicio || meta?.ultimo_payload_wsp || meta?.inicio_payload || {});
    const payloadEvento = parseJsonObject(inicioEv?.payload_completo || {});

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

    return "";
  }

  function resolverLugarEstado(row, inicioEv) {
    const meta = parseJsonObject(row?.metadata);
    const payloadInicio = parseJsonObject(meta?.payload_inicio || meta?.ultimo_payload_wsp || {});
    const payloadEvento = parseJsonObject(inicioEv?.payload_completo || {});
    return limpiarTextoSimple(
      inicioEv?.lugar ||
      payloadEvento?.lugar ||
      payloadEvento?.franja?.lugar ||
      meta?.lugar_inicio ||
      payloadInicio?.lugar ||
      payloadInicio?.franja?.lugar ||
      row?.lugar ||
      ""
    );
  }

  function resolverTipoEstado(row, inicioEv) {
    const meta = parseJsonObject(row?.metadata);
    const payloadInicio = parseJsonObject(meta?.payload_inicio || meta?.ultimo_payload_wsp || {});
    const payloadEvento = parseJsonObject(inicioEv?.payload_completo || {});
    return limpiarTextoSimple(
      inicioEv?.tipo_operativo ||
      payloadEvento?.tipo_corto ||
      payloadEvento?.tipo_operativo ||
      payloadEvento?.franja?.__tipoPublicado ||
      meta?.tipo_operativo_inicio ||
      meta?.tipo_operativo ||
      payloadInicio?.tipo_corto ||
      payloadInicio?.tipo_operativo ||
      row?.tipo_operativo ||
      row?.tipo ||
      "Operativo iniciado"
    );
  }

  function resolverOrdenes(row, inicioEv) {
    const meta = parseJsonObject(row?.metadata);
    const payloadEvento = parseJsonObject(inicioEv?.payload_completo || {});
    const arr = normalizarArray(row?.ordenes_origen);
    if (arr.length) return arr.join(" / ");
    const payloadOrdenes = normalizarArray(payloadEvento?.ordenes_origen || payloadEvento?.ordenesOrigen);
    if (payloadOrdenes.length) return payloadOrdenes.join(" / ");
    return limpiarTextoSimple(meta?.orden_num || meta?.orden || "");
  }

  function resolverArrayCampo(row, inicioEv, key, metaKeys = []) {
    const meta = parseJsonObject(row?.metadata);
    const payloadEvento = parseJsonObject(inicioEv?.payload_completo || {});
    const directos = [
      row?.[key],
      inicioEv?.[key],
      payloadEvento?.[key],
    ];
    for (const k of metaKeys) directos.push(meta?.[k]);
    for (const val of directos) {
      const arr = normalizarArray(val);
      if (arr.length) return arr;
    }
    return [];
  }

  function resolverElementos(row, inicioEv) {
    const meta = parseJsonObject(row?.metadata);
    const payloadEvento = parseJsonObject(inicioEv?.payload_completo || {});
    const candidatos = [
      row?.elementos,
      inicioEv?.elementos,
      payloadEvento?.elementos,
      meta?.elementos_inicio,
      meta?.ultimo_elementos,
      meta?.elementos,
    ];
    for (const c of candidatos) {
      const obj = parseJsonObject(c);
      if (obj && Object.keys(obj).length) return obj;
    }
    return {};
  }

  function estadoEsEnCursoCanonico(row) {
    const estadoTxt = normalizarEstado(row?.estado || "");
    if (!row || estadoEliminado(row)) return false;
    if (!row?.inicio_evento_id) return false;
    if (row?.finalizado_evento_id) return false;
    if (["FINALIZADO", "CERRADO", "BORRADO"].includes(estadoTxt)) return false;
    if (["EN_CURSO", "INICIADO", "ACTIVO"].includes(estadoTxt)) return true;
    return false;
  }

  function eventoFinalizadoActivo(row) {
    const tipo = normalizarEstado(row?.tipo_evento || "");
    return tipo === "FINALIZADO" && !eventoEliminado(row);
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

      (Array.isArray(data) ? data : [])
        .filter(eventoFinalizadoActivo)
        .forEach((row) => {
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
      console.warn("[WSP Selector Canonico] Error leyendo FINALIZADOS activos.", e);
    }

    return out;
  }

  function deduplicarCanonico(items = []) {
    const porKey = new Map();

    (Array.isArray(items) ? items : []).forEach((item) => {
      const key = limpiarTextoSimple(item?.operativo_key || "");
      if (!key) return;
      const anterior = porKey.get(key);
      const tsItem = Number(item?.ts || 0);
      const tsAnterior = Number(anterior?.ts || 0);
      if (!anterior || tsItem >= tsAnterior) porKey.set(key, item);
    });

    return Array.from(porKey.values()).sort((a, b) => {
      const ah = limpiarTextoSimple(a?.horario || "");
      const bh = limpiarTextoSimple(b?.horario || "");
      return ah.localeCompare(bh) || limpiarTextoSimple(a?.lugar || "").localeCompare(limpiarTextoSimple(b?.lugar || ""));
    });
  }

  function normalizarItemCanonico(row, inicioEv, deps = {}) {
    const horario = resolverHorarioEstado(row, inicioEv);
    const lugar = resolverLugarEstado(row, inicioEv);
    const tipo = resolverTipoEstado(row, inicioEv);
    const key = limpiarTextoSimple(row?.operativo_key || inicioEv?.operativo_key || "");

    if (!key || !horario || !lugar || !tipo) return null;

    const base = {
      guardia_fecha: row?.guardia_fecha || getGuardiaFechaISO(deps),
      operativo_estado_id: row?.id || row?.operativo_estado_id || "",
      operativo_key: key,
      orden_num: resolverOrdenes(row, inicioEv),
      texto_ref: "Operativo en curso",
      horario,
      lugar,
      tipo_corto: tipo,
      personal: resolverArrayCampo(row, inicioEv, "personal", ["personal_inicio", "ultimo_personal", "personal"]),
      moviles: resolverArrayCampo(row, inicioEv, "moviles", ["moviles_inicio", "ultimo_moviles", "moviles"]),
      motos: resolverArrayCampo(row, inicioEv, "motos", ["motos_inicio", "ultimo_motos", "motos"]),
      elementos: resolverElementos(row, inicioEv),
      ts: Date.parse(row?.updated_at || row?.created_at || "") || Date.now(),
    };

    if (typeof deps.normalizarInicioGuardado === "function") return deps.normalizarInicioGuardado(base);
    return base;
  }

  async function leerOperativosEnCursoDesdeEstadoSupabase(deps = {}) {
    const guardiaFecha = getGuardiaFechaISO(deps);

    try {
      const rows = await leerTabla(TABLA_ESTADOS, {
        select: "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,lugar,tipo_operativo,tipo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at,deleted_at",
        guardia_fecha: `eq.${guardiaFecha}`,
        order: "hora_desde.asc,updated_at.desc",
        limit: "300",
      });

      const estados = (Array.isArray(rows) ? rows : []).filter(estadoEsEnCursoCanonico);
      const eventosInicio = await leerEventosPorIds(estados.map((row) => row.inicio_evento_id));
      const finalizados = await leerOperativoKeysFinalizadosGuardiaSupabase(deps);

      const items = estados
        .filter((row) => !finalizados.has(limpiarTextoSimple(row?.operativo_key || "")))
        .map((row) => normalizarItemCanonico(row, eventosInicio.get(String(row.inicio_evento_id)) || null, deps))
        .filter(Boolean);

      const unicos = deduplicarCanonico(items);
      window.WSP.debug = window.WSP.debug || {};
      window.WSP.debug.selectorIniciadosCanonico = {
        version: VERSION,
        guardiaFecha,
        estadosLeidos: Array.isArray(rows) ? rows.length : 0,
        estadosEnCursoCanonicos: estados.length,
        finalizadosActivos: finalizados.size,
        items: unicos.map((item) => ({
          operativo_key: item.operativo_key,
          horario: item.horario,
          lugar: item.lugar,
          tipo_corto: item.tipo_corto,
          operativo_estado_id: item.operativo_estado_id,
        })),
        timestamp: new Date().toISOString(),
      };

      return unicos;
    } catch (e) {
      console.warn("[WSP Selector Canonico] Error leyendo operativos EN CURSO canonicos.", e);
      return [];
    }
  }

  async function leerIniciosGuardiaDesdeSupabase(deps = {}) {
    // Fuente canónica para FINALIZA/Informes: sólo operativos_estado EN_CURSO
    // con inicio_evento_id real. No usa operativos_publicados, no usa wsp_inicios,
    // y no usa OperativosRepo si puede mezclar vistas o estados viejos.
    return leerOperativosEnCursoDesdeEstadoSupabase(deps);
  }

  async function leerIniciosGuardiaDesdeWspIniciosFallback() {
    // Fallback desactivado para el selector FINALIZA/Informes: era la fuente
    // que podía dejar operativos viejos o no iniciados en el selector.
    return [];
  }

  const api = {
    version: VERSION,
    leerOperativoKeysFinalizadosGuardiaSupabase,
    leerOperativosEnCursoDesdeEstadoSupabase,
    leerIniciosGuardiaDesdeSupabase,
    leerIniciosGuardiaDesdeWspIniciosFallback,
  };

  // Conservar el repo existente y reemplazar únicamente la lectura del selector.
  const repoAnterior = window.WSP.services.historialOperativoRepo || window.WSP.modules.historialOperativo || {};
  const repoCanonico = {
    ...repoAnterior,
    ...api,
  };

  window.WSP.services.historialOperativoRepo = repoCanonico;
  window.WSP.modules.historialOperativo = repoCanonico;
  window.WSP.modules.selectorIniciadosCanonico = api;

  console.log("[WSP Selector Canonico] cargado", VERSION);
})();
