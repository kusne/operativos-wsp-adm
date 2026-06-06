(function () {
  "use strict";

  window.BMZCN = window.BMZCN || {};
  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};

  const ESTADO_TABLE = "operativos_estado";
  const EVENTOS_TABLE = "operativos_eventos";

  function configSupabase() {
    const cfg = window.WSP?.config || {};
    const url = String(cfg.supabaseUrl || "").replace(/\/+$/, "");
    const anonKey = String(cfg.supabaseAnonKey || "");
    if (!url || !anonKey) {
      throw new Error("WSP.config Supabase no está disponible para OperativosRepo.");
    }
    return { url, anonKey };
  }

  function headers(extra = {}) {
    const { anonKey } = configSupabase();
    return {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      ...extra,
    };
  }

  function limpiarTexto(valor) {
    return String(valor ?? "").trim();
  }

  function normalizarTipo(tipo) {
    return limpiarTexto(tipo).toUpperCase().replace(/\s+/g, "_");
  }

  function ensureArray(valor) {
    if (Array.isArray(valor)) return valor.filter((v) => limpiarTexto(v));
    if (valor == null) return [];
    if (typeof valor === "string") {
      const raw = valor.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((v) => limpiarTexto(v));
      } catch {}
      return raw.split(/\n|,/).map((v) => limpiarTexto(v)).filter(Boolean);
    }
    return [valor].filter((v) => limpiarTexto(v));
  }

  function asObject(valor) {
    return valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
  }

  function isoAhora() {
    return new Date().toISOString();
  }

  function errorValidacion(message, code = "VALIDACION_OPERATIVA") {
    const e = new Error(message);
    e.code = code;
    e.esValidacionOperativa = true;
    return e;
  }

  function getOperativoKey(payload) {
    return limpiarTexto(payload?.operativo_key || payload?.payload_completo?.operativo_key || payload?.franja?.__operativoKey || "");
  }

  function getGuardiaFecha(payload) {
    const cfg = window.WSP?.services?.guardia;
    if (payload?.guardia_fecha) return limpiarTexto(payload.guardia_fecha);
    if (typeof cfg?.getGuardiaFechaISO === "function") {
      try { return cfg.getGuardiaFechaISO(); } catch {}
    }
    return new Date().toISOString().slice(0, 10);
  }

  function getHorario(payload) {
    return limpiarTexto(payload?.horario || (payload?.hora_desde && payload?.hora_hasta ? `${payload.hora_desde} A ${payload.hora_hasta}` : ""));
  }

  function estadoBaseDesdePayload(payload = {}) {
    const metadata = {
      ...(asObject(payload.metadata)),
      texto_ref: limpiarTexto(payload.texto_ref || payload.titulo || ""),
      orden_num: ensureArray(payload.ordenes_origen).join(" / "),
      tipo_operativo: limpiarTexto(payload.tipo_operativo || payload.tipo_corto || payload.tipo || ""),
      personal_inicio: ensureArray(payload.personal),
      moviles_inicio: ensureArray(payload.moviles),
      motos_inicio: ensureArray(payload.motos),
      elementos_inicio: asObject(payload.elementos),
      ultimo_payload_wsp: payload,
      actualizado_desde: "wsp-operativos-repo.js",
    };

    return {
      operativo_key: getOperativoKey(payload),
      guardia_fecha: getGuardiaFecha(payload),
      fecha_operativo: limpiarTexto(payload.fecha_operativo || payload.guardia_fecha || getGuardiaFecha(payload)),
      hora_desde: limpiarTexto(payload.hora_desde || ""),
      hora_hasta: limpiarTexto(payload.hora_hasta || ""),
      lugar: limpiarTexto(payload.lugar || ""),
      lugar_normalizado: limpiarTexto(payload.lugar_normalizado || payload.lugar || ""),
      tipo_operativo: limpiarTexto(payload.tipo_operativo || payload.tipo_corto || payload.tipo || ""),
      tipo: limpiarTexto(payload.tipo || payload.tipo_operativo || payload.tipo_corto || ""),
      ordenes_origen: ensureArray(payload.ordenes_origen),
      metadata,
      updated_at: isoAhora(),
    };
  }

  function eventoBaseDesdePayload(tipoEvento, payload = {}, estadoId = null) {
    const tipo = normalizarTipo(tipoEvento || payload.tipo_evento || "INFORME");
    const alimentaFinalizado = ["ALCOHOLEMIA_POSITIVA", "DECTO_460_22", "DECRETO_460_22"].includes(tipo);

    return {
      operativo_estado_id: estadoId || payload.operativo_estado_id || null,
      operativo_key: getOperativoKey(payload),
      guardia_fecha: getGuardiaFecha(payload),
      tipo_evento: tipo,
      resultados: asObject(payload.resultados),
      medidas_cautelares: asObject(payload.medidas_cautelares),
      detalles: Array.isArray(payload.detalles) ? payload.detalles : [],
      payload_completo: payload,
      observaciones: payload.observaciones ?? "",
      horario: getHorario(payload),
      lugar: limpiarTexto(payload.lugar || ""),
      tipo_operativo: limpiarTexto(payload.tipo_operativo || payload.tipo_corto || payload.tipo || ""),
      alimenta_finalizado: !!payload.alimenta_finalizado || alimentaFinalizado,
    };
  }

  function urlTabla(tabla, params = null) {
    const { url } = configSupabase();
    const qs = params ? `?${params.toString()}` : "";
    return `${url}/rest/v1/${tabla}${qs}`;
  }

  async function leerJsonSeguro(response) {
    const text = await response.text().catch(() => "");
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  }

  async function assertOk(response, contexto) {
    if (response.ok) return response;
    const body = await leerJsonSeguro(response);
    const detalle = typeof body === "string" ? body : (body?.message || body?.details || JSON.stringify(body));
    throw new Error(`${contexto}: ${response.status} ${detalle || ""}`.trim());
  }

  async function selectRows(tabla, params) {
    const r = await fetch(urlTabla(tabla, params), {
      method: "GET",
      headers: headers({ Accept: "application/json" }),
    });
    await assertOk(r, `Error leyendo ${tabla}`);
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  }

  async function insertRow(tabla, row) {
    const r = await fetch(urlTabla(tabla), {
      method: "POST",
      headers: headers({ Accept: "application/json", Prefer: "return=representation" }),
      body: JSON.stringify(row),
    });
    await assertOk(r, `Error insertando ${tabla}`);
    const data = await r.json();
    return Array.isArray(data) ? data[0] : data;
  }

  async function patchRows(tabla, filtros, patch) {
    const params = new URLSearchParams(filtros || {});
    const r = await fetch(urlTabla(tabla, params), {
      method: "PATCH",
      headers: headers({ Accept: "application/json", Prefer: "return=representation" }),
      body: JSON.stringify(patch),
    });
    await assertOk(r, `Error actualizando ${tabla}`);
    const data = await r.json();
    return Array.isArray(data) ? data[0] : data;
  }

  async function buscarEstadoPorKey({ operativoKey, guardiaFecha }) {
    if (!operativoKey || !guardiaFecha) return null;
    const params = new URLSearchParams({
      select: "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,lugar,tipo_operativo,tipo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at",
      operativo_key: `eq.${operativoKey}`,
      guardia_fecha: `eq.${guardiaFecha}`,
      order: "updated_at.desc",
      limit: "1",
    });
    const rows = await selectRows(ESTADO_TABLE, params);
    return rows[0] || null;
  }

  async function crearOActualizarEstadoInicio(payload) {
    const base = estadoBaseDesdePayload(payload);
    if (!base.operativo_key) throw errorValidacion("No se pudo determinar la clave del operativo para guardar el INICIO.");

    const existente = await buscarEstadoPorKey({ operativoKey: base.operativo_key, guardiaFecha: base.guardia_fecha });
    if (existente?.finalizado_evento_id || normalizarTipo(existente?.estado) === "FINALIZADO") {
      throw errorValidacion("El operativo ya figura FINALIZADO. No se puede actualizar el INICIO.", "VALIDACION_OPERATIVO_FINALIZADO");
    }

    if (existente?.id) {
      return await patchRows(ESTADO_TABLE, { id: `eq.${existente.id}` }, { ...base, estado: "EN_CURSO" });
    }

    return await insertRow(ESTADO_TABLE, { ...base, estado: "EN_CURSO" });
  }

  async function guardarInicio(payload = {}) {
    const estado = await crearOActualizarEstadoInicio(payload);
    const evento = await insertRow(EVENTOS_TABLE, eventoBaseDesdePayload("INICIO", payload, estado.id));
    const estadoActualizado = await patchRows(ESTADO_TABLE, { id: `eq.${estado.id}` }, {
      estado: "EN_CURSO",
      inicio_evento_id: evento.id,
      updated_at: isoAhora(),
      metadata: {
        ...(asObject(estado.metadata)),
        inicio_evento_id: evento.id,
        ultimo_evento: "INICIO",
        ultimo_payload_wsp: payload,
      },
    });
    return { ok: true, estado: estadoActualizado || estado, evento };
  }

  async function guardarFinalizado(payload = {}) {
    const operativoKey = getOperativoKey(payload);
    const guardiaFecha = getGuardiaFecha(payload);
    if (!operativoKey) throw errorValidacion("No se pudo determinar la clave del operativo para guardar el FINALIZADO.");

    const estado = await buscarEstadoPorKey({ operativoKey, guardiaFecha });
    if (!estado?.id || !estado.inicio_evento_id) {
      throw errorValidacion("Debe iniciar el operativo antes de enviar el FINALIZADO.", "VALIDACION_FINALIZADO_SIN_INICIO");
    }

    const evento = await insertRow(EVENTOS_TABLE, eventoBaseDesdePayload("FINALIZADO", payload, estado.id));
    const estadoActualizado = await patchRows(ESTADO_TABLE, { id: `eq.${estado.id}` }, {
      estado: "FINALIZADO",
      finalizado_evento_id: evento.id,
      updated_at: isoAhora(),
      metadata: {
        ...(asObject(estado.metadata)),
        finalizado_evento_id: evento.id,
        ultimo_evento: "FINALIZADO",
        ultimo_payload_wsp: payload,
      },
    });
    return { ok: true, estado: estadoActualizado || estado, evento };
  }

  async function guardarInforme(tipoEvento, payload = {}) {
    const operativoKey = getOperativoKey(payload);
    const guardiaFecha = getGuardiaFecha(payload);
    const estado = payload.operativo_estado_id
      ? { id: payload.operativo_estado_id }
      : await buscarEstadoPorKey({ operativoKey, guardiaFecha });

    const evento = await insertRow(EVENTOS_TABLE, eventoBaseDesdePayload(tipoEvento, payload, estado?.id || null));
    return { ok: true, estado: estado || null, evento };
  }

  async function leerOperativosGuardia({ guardiaFecha, limit = 500 } = {}) {
    const gf = guardiaFecha || getGuardiaFecha({});
    const params = new URLSearchParams({
      select: "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,lugar,tipo_operativo,tipo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at",
      guardia_fecha: `eq.${gf}`,
      order: "hora_desde.asc,updated_at.desc",
      limit: String(limit || 500),
    });
    return await selectRows(ESTADO_TABLE, params);
  }

  const api = {
    guardarInicio,
    guardarFinalizado,
    guardarInforme,
    leerOperativosGuardia,
    buscarEstadoPorKey,
  };

  window.BMZCN.OperativosRepo = window.BMZCN.OperativosRepo || api;
  window.WSP.services.operativosRepo = window.BMZCN.OperativosRepo;
  window.WSP.modules.operativosRepo = window.BMZCN.OperativosRepo;
})();
