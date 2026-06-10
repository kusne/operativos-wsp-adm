(function () {
  "use strict";

  window.BMZCN = window.BMZCN || {};
  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};

  const ESTADO_TABLE = "operativos_estado";
  const EVENTOS_TABLE = "operativos_eventos";
  const REPO_VERSION = "paso98-wsp-finalizado-acepta-repo-paso97-20260610";

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

  function limpiarMarkdownTitulo(valor) {
    return limpiarTexto(String(valor || "").replace(/\*/g, "").replace(/_/g, " "));
  }

  function claveTipo(valor) {
    return limpiarTexto(valor).toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "");
  }

  function esTipoGenerico(valor) {
    const clave = claveTipo(valor);
    return !clave || ["control", "operativo", "operativoiniciado", "iniciado", "inicio", "finalizado"].includes(clave);
  }

  function agregarCandidatoTipo(out, valor) {
    const clean = limpiarTexto(valor || "");
    if (!clean) return;
    const key = claveTipo(clean);
    if (!out.some((item) => claveTipo(item) === key)) out.push(clean);
  }

  function extraerTipoDesdeTextoGenerado(texto) {
    const raw = String(texto || "");
    if (!raw.trim()) return "";
    const lineas = raw.split(/\r?\n/).map(limpiarMarkdownTitulo).filter(Boolean);
    for (const linea of lineas) {
      const m = linea.match(/^Inicia\s+(.+)$/i);
      if (m && limpiarTexto(m[1])) return limpiarTexto(m[1]);
    }
    const m = raw.replace(/\*/g, "").match(/(?:^|\n)\s*Inicia\s+([^\n]+)/i);
    return m ? limpiarTexto(m[1]) : "";
  }

  function resolverTipoInicioDesdePayload(payload = {}) {
    const candidatos = [];
    agregarCandidatoTipo(candidatos, payload.tipo_operativo_inicio_texto);
    agregarCandidatoTipo(candidatos, extraerTipoDesdeTextoGenerado(payload.texto_generado));
    agregarCandidatoTipo(candidatos, payload.tipo_operativo_inicio);

    const franja = payload?.payload_completo?.franja || payload?.franja || null;
    if (franja && typeof franja === "object") {
      agregarCandidatoTipo(candidatos, franja.tipo_operativo_inicio_texto);
      agregarCandidatoTipo(candidatos, franja.__tipoPublicado);
      agregarCandidatoTipo(candidatos, franja.tipo_operativo);
      agregarCandidatoTipo(candidatos, franja.tipo);
      agregarCandidatoTipo(candidatos, franja.titulo);
    }

    agregarCandidatoTipo(candidatos, payload.tipo_operativo);
    agregarCandidatoTipo(candidatos, payload.tipo_corto);
    agregarCandidatoTipo(candidatos, payload.titulo);

    return candidatos.find((v) => !esTipoGenerico(v)) || candidatos[0] || "";
  }

  function isoAhora() {
    return new Date().toISOString();
  }

  function fechaLocalISO(date = new Date()) {
    const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function horaLocalHHMM(date = new Date()) {
    const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function normalizarFechaISO(value) {
    const raw = limpiarTexto(value || "");
    if (!raw) return "";
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return raw;
    const ar = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (ar) return `${ar[3]}-${String(Number(ar[2])).padStart(2, "0")}-${String(Number(ar[1])).padStart(2, "0")}`;
    return "";
  }

  function sumarDiasISO(fechaISO, dias = 0) {
    const base = normalizarFechaISO(fechaISO);
    if (!base) return "";
    const d = new Date(`${base}T12:00:00`);
    if (Number.isNaN(d.getTime())) return base;
    d.setDate(d.getDate() + Number(dias || 0));
    return fechaLocalISO(d);
  }

  function normalizarHoraSQL(value) {
    const raw = limpiarTexto(value || "").toUpperCase();
    const m = raw.match(/^(\d{1,2})\s*:\s*(\d{2})$/);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  function minutosHora(value) {
    const h = normalizarHoraSQL(value);
    if (!h) return null;
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm;
  }

  function camposTiempoDesdePayload(payload = {}) {
    const horario = getHorario(payload);
    const partes = partesHorario({ ...payload, horario });
    const horaInicio = normalizarHoraSQL(partes.desde);
    const horaFinalizacion = normalizarHoraSQL(partes.hasta);
    const fechaBase = normalizarFechaISO(payload.fecha_operativo)
      || normalizarFechaISO(payload.fecha_inicio)
      || normalizarFechaISO(payload.guardia_fecha)
      || getGuardiaFecha(payload)
      || fechaLocalISO();

    let fechaFinalizacion = normalizarFechaISO(payload.fecha_finalizacion) || fechaBase;
    const mi = minutosHora(horaInicio);
    const mf = minutosHora(horaFinalizacion);
    if (!payload.fecha_finalizacion && mi !== null && mf !== null && mf < mi) {
      fechaFinalizacion = sumarDiasISO(fechaBase, 1);
    }

    const eventoTs = limpiarTexto(payload.evento_ts || "") || isoAhora();

    return {
      franja_horaria: horario || null,
      hora_inicio: horaInicio,
      hora_finalizacion: horaFinalizacion,
      fecha_inicio: fechaBase || null,
      fecha_finalizacion: fechaFinalizacion || null,
      fecha_evento: normalizarFechaISO(payload.fecha_evento) || fechaLocalISO(),
      hora_evento: normalizarHoraSQL(payload.hora_evento) || horaLocalHHMM(),
      evento_ts: eventoTs,
    };
  }

  function fuentesFinalizaDesdePayload(payload = {}) {
    const fuentes = asObject(payload.finaliza_fuentes_datos)
      || asObject(payload.payload_completo?.finaliza_fuentes_datos)
      || asObject(payload.metadata?.finaliza_fuentes_datos);
    const fuentesPayloadCompleto = asObject(payload.payload_completo?.finaliza_fuentes_datos);
    const fuentesMetadata = asObject(payload.metadata?.finaliza_fuentes_datos);
    const fuente = (campo, legacy) => limpiarTexto(
      payload[`${campo}_fuente`]
      || fuentes?.[campo]
      || fuentesPayloadCompleto?.[campo]
      || fuentesMetadata?.[campo]
      || payload[legacy]
      || ""
    ) || null;

    return {
      personal_fuente: fuente("personal", "personal_finalizado_fuente"),
      movilidad_fuente: fuente("movilidad", "movilidad_finalizado_fuente"),
      elementos_fuente: fuente("elementos", "elementos_finalizado_fuente"),
    };
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

  function normalizarHorarioRango(value = "") {
    const raw = limpiarTexto(value || "").replace(/[–—]/g, "-");
    if (!raw) return "";
    const m = raw.match(/\b(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?\b\s*(?:A|a|-|\/|HASTA|hasta)\s*(FINALIZAR|\d{1,2}\s*:\s*\d{2}(?::\d{2})?)\b/);
    if (!m) return "";
    const hi = Number(m[1]);
    const mi = Number(m[2]);
    if (hi < 0 || hi > 23 || mi < 0 || mi > 59) return "";
    const desde = `${String(hi).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
    let hasta = limpiarTexto(m[3]).toUpperCase();
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
    const raw = limpiarTexto(value || "");
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
    return normalizarHorarioRango(`${d} A ${h}`);
  }

  function getHorario(payload = {}) {
    const pc = asObject(payload?.payload_completo);
    const franja = asObject(payload?.franja || pc?.franja);
    const candidatos = [
      payload?.franja_horaria,
      payload?.horario,
      pc?.franja_horaria,
      pc?.horario,
      franja?.franja_horaria,
      franja?.horario,
      payload?.metadata?.franja_horaria,
      payload?.metadata?.horario_inicio,
      payload?.metadata?.ultimo_horario,
    ];
    for (const candidato of candidatos) {
      const normalizado = normalizarHorarioRango(candidato || "");
      if (normalizado) return normalizado;
    }
    const pares = [
      [payload?.hora_inicio, payload?.hora_finalizacion],
      [payload?.hora_desde, payload?.hora_hasta],
      [pc?.hora_inicio, pc?.hora_finalizacion],
      [pc?.hora_desde, pc?.hora_hasta],
      [franja?.hora_inicio, franja?.hora_finalizacion],
      [franja?.hora_desde, franja?.hora_hasta],
    ];
    for (const [desde, hasta] of pares) {
      const normalizado = horarioDesdePartes(desde, hasta);
      if (normalizado) return normalizado;
    }
    return "";
  }

  function partesHorario(payload = {}) {
    const horario = getHorario(payload);
    const m = horario.match(/^(\d{2}:\d{2})\s+A\s+(FINALIZAR|\d{2}:\d{2})$/i);
    return {
      desde: m ? m[1] : "",
      hasta: m ? m[2].toUpperCase() : "",
    };
  }

  function eventoKey(tipoEvento, payload = {}) {
    return [getGuardiaFecha(payload), getOperativoKey(payload), normalizarTipo(tipoEvento)].map(claveTipo).join("|");
  }

  function esTipoInformeIntermedio(tipoEvento) {
    const tipo = normalizarTipo(tipoEvento);
    return ["ALCOHOLEMIA_POSITIVA", "DECTO_460_22", "DECRETO_460_22", "CONTROL_SUPERIOR"].includes(tipo);
  }

  function extraerInformeKeyPayload(payload = {}) {
    return limpiarTexto(
      payload.informe_key
      || payload.payload_completo?.informe_key
      || payload.metadata?.informe_key
      || payload.payload_completo?.datos_formulario?.informe_key
      || ""
    );
  }

  function extraerActaInformePayload(payload = {}) {
    return limpiarTexto(
      payload.nro_acta
      || payload.acta
      || payload.numero_acta
      || payload.payload_completo?.datos_formulario?.nro_acta
      || payload.payload_completo?.nro_acta
      || ""
    ).replace(/\D+/g, "").slice(0, 16);
  }

  function eventoKeyInforme(tipoEvento, payload = {}) {
    const base = eventoKey(tipoEvento, payload);
    const informeKey = extraerInformeKeyPayload(payload);
    const acta = extraerActaInformePayload(payload);
    const componente = claveTipo(informeKey || acta || payload.evento_ts || isoAhora()) || "sin_acta";
    return [base, componente].filter(Boolean).join("|");
  }


  function arrayDesdeLineaValor(linea) {
    const raw = limpiarTexto(linea || "");
    if (!raw || raw === "/") return [];
    return raw.split("/").map((v) => limpiarTexto(v)).filter(Boolean).filter((v) => v !== "/");
  }

  function arrayDesdeTextoMultilinea(texto) {
    const raw = String(texto || "").trim();
    if (!raw) return [];
    return raw.split(/\r?\n/).map((v) => limpiarTexto(v)).filter(Boolean);
  }

  function primerArrayNoVacio(...valores) {
    for (const valor of valores) {
      const arr = ensureArray(valor);
      if (arr.length) return arr;
    }
    return [];
  }

  function primerObjetoNoVacio(...valores) {
    for (const valor of valores) {
      const obj = asObject(valor);
      if (Object.keys(obj).length) return obj;
    }
    return {};
  }

  function normalizarElementosSalidaDebug(elementos = {}) {
    const e = asObject(elementos);
    return {
      ESCOPETA: arrayDesdeLineaValor(e.escopetasTXT || e.ESCOPETA),
      HT: arrayDesdeLineaValor(e.htTXT || e.HT),
      PDA: arrayDesdeLineaValor(e.pdaTXT || e.PDA),
      IMPRESORA: arrayDesdeLineaValor(e.impTXT || e.IMPRESORA),
      Alometro: arrayDesdeLineaValor(e.alomTXT || e.Alometro),
      Alcoholimetro: arrayDesdeLineaValor(e.alcoTXT || e.Alcoholimetro),
    };
  }

  function arrayNoVacio(value) {
    return Array.isArray(value) && value.some((v) => limpiarTexto(v));
  }

  function objetoNoVacio(value) {
    return !!(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length);
  }

  function validarFinalizadoBodyObligatorio(body, payload = {}) {
    const faltantes = [];
    if (!limpiarTexto(body.texto_generado || "")) faltantes.push("texto_generado");
    if (!limpiarTexto(body.franja_horaria || body.horario || "")) faltantes.push("franja_horaria");
    if (!body.hora_inicio) faltantes.push("hora_inicio");
    if (!body.hora_finalizacion) faltantes.push("hora_finalizacion");
    if (!arrayNoVacio(body.personal)) faltantes.push("personal");
    if (!arrayNoVacio(body.moviles) && !arrayNoVacio(body.motos)) faltantes.push("moviles/motos");
    if (!objetoNoVacio(body.elementos)) faltantes.push("elementos");
    if (faltantes.length) {
      window.WSP = window.WSP || {};
      window.WSP.debug = window.WSP.debug || {};
      window.WSP.debug.operativosRepoFinalizadoRechazado = {
        version: REPO_VERSION,
        motivo: "FINALIZADO_ESTRUCTURA_INCOMPLETA",
        faltantes,
        body,
        payload,
      };
      throw errorValidacion(`El FINALIZADO llegó incompleto al guardado (${faltantes.join(", ")}). No se guarda para evitar filas vacías.`, "VALIDACION_FINALIZADO_ESTRUCTURA_INCOMPLETA");
    }
  }

  function validarFinalizadoGuardadoObligatorio(evento, estado, payload = {}) {
    const faltantes = [];
    if (!limpiarTexto(evento?.texto_generado || estado?.texto_finalizado || "")) faltantes.push("texto_generado/texto_finalizado");
    if (!limpiarTexto(evento?.franja_horaria || evento?.horario || estado?.franja_horaria || "")) faltantes.push("franja_horaria");
    if (!(evento?.hora_inicio || estado?.hora_inicio)) faltantes.push("hora_inicio");
    if (!(evento?.hora_finalizacion || estado?.hora_finalizacion)) faltantes.push("hora_finalizacion");
    if (!arrayNoVacio(evento?.personal || estado?.personal_finalizado)) faltantes.push("personal");
    if (!arrayNoVacio(evento?.moviles || estado?.moviles_finalizado) && !arrayNoVacio(evento?.motos || estado?.motos_finalizado)) faltantes.push("moviles/motos");
    if (!objetoNoVacio(evento?.elementos || estado?.elementos_finalizado)) faltantes.push("elementos");
    if (faltantes.length) {
      window.WSP = window.WSP || {};
      window.WSP.debug = window.WSP.debug || {};
      window.WSP.debug.operativosRepoFinalizadoGuardadoIncompleto = {
        version: REPO_VERSION,
        faltantes,
        evento,
        estado,
        payload,
      };
      throw errorValidacion(`Supabase guardó/devolvió el FINALIZADO incompleto (${faltantes.join(", ")}). No se enviará WhatsApp.`, "VALIDACION_FINALIZADO_GUARDADO_INCOMPLETO");
    }
  }

  function datosSnapshotPayload(payload = {}) {
    const debugFinaliza = asObject(window.WSP?.debug?.finalizaDatosEnvio);
    const salidaDebug = asObject(debugFinaliza.salida);
    const elementosDebug = normalizarElementosSalidaDebug(salidaDebug.elementos);
    const payloadCompleto = asObject(payload.payload_completo);
    const franjaPayload = asObject(payloadCompleto.franja || payload.franja);

    const debugPayloadFinalizado = asObject(window.WSP?.debug?.payloadHistorialFinalizadoAntesGuardar);
    const debugFinalizaEnvio = asObject(window.WSP?.debug?.finalizaDatosEnvio);
    const textoGenerado = String(
      payload.texto_generado
      || payload.textoFinal
      || payloadCompleto.texto_generado
      || payloadCompleto.textoFinal
      || debugPayloadFinalizado.texto_generado
      || debugPayloadFinalizado.textoFinal
      || debugFinalizaEnvio.texto_generado
      || debugFinalizaEnvio.textoFinal
      || ""
    );

    return {
      personal: primerArrayNoVacio(
        payload.personal,
        payloadCompleto.personal,
        arrayDesdeTextoMultilinea(salidaDebug.personalTexto)
      ),
      moviles: primerArrayNoVacio(
        payload.moviles,
        payloadCompleto.moviles,
        arrayDesdeLineaValor(salidaDebug.mov)
      ),
      motos: primerArrayNoVacio(
        payload.motos,
        payloadCompleto.motos,
        arrayDesdeLineaValor(salidaDebug.mot)
      ),
      elementos: primerObjetoNoVacio(
        payload.elementos,
        payloadCompleto.elementos,
        elementosDebug
      ),
      resultados: asObject(payload.resultados || payloadCompleto.resultados),
      medidas_cautelares: asObject(payload.medidas_cautelares || payloadCompleto.medidas_cautelares),
      detalles: Array.isArray(payload.detalles) ? payload.detalles : (Array.isArray(payloadCompleto.detalles) ? payloadCompleto.detalles : []),
      observaciones: payload.observaciones ?? payloadCompleto.observaciones ?? "",
      texto_generado: textoGenerado,
      horario: getHorario(payload) || getHorario(payloadCompleto) || getHorario(franjaPayload),
      lugar: limpiarTexto(payload.lugar || payloadCompleto.lugar || franjaPayload.lugar || ""),
      tipo_operativo: resolverTipoInicioDesdePayload(payload) || limpiarTexto(payload.tipo_operativo || payload.tipo_corto || payload.tipo || franjaPayload.tipo_operativo || franjaPayload.tipo || ""),
    };
  }

  function estadoBaseDesdePayload(payload = {}) {
    const tipoInicio = resolverTipoInicioDesdePayload(payload) || limpiarTexto(payload.tipo_operativo || payload.tipo_corto || payload.tipo || "");
    const metadata = {
      ...(asObject(payload.metadata)),
      texto_ref: limpiarTexto(payload.texto_ref || payload.titulo || ""),
      orden_num: ensureArray(payload.ordenes_origen).join(" / "),
      tipo_operativo: tipoInicio,
      tipo_operativo_inicio_texto: tipoInicio,
      personal_inicio: ensureArray(payload.personal),
      moviles_inicio: ensureArray(payload.moviles),
      motos_inicio: ensureArray(payload.motos),
      elementos_inicio: asObject(payload.elementos),
      ultimo_payload_wsp: payload,
      actualizado_desde: "wsp-operativos-repo.js",
      repo_version: REPO_VERSION,
    };

    const tiempo = camposTiempoDesdePayload(payload);
    const snap = datosSnapshotPayload(payload);
    const partesLegacy = partesHorario({ ...payload, horario: snap.horario });

    return {
      operativo_key: getOperativoKey(payload),
      guardia_fecha: getGuardiaFecha(payload),
      fecha_operativo: limpiarTexto(payload.fecha_operativo || payload.guardia_fecha || getGuardiaFecha(payload)),
      hora_desde: limpiarTexto(payload.hora_desde || partesLegacy.desde || ""),
      hora_hasta: limpiarTexto(payload.hora_hasta || partesLegacy.hasta || ""),
      franja_horaria: tiempo.franja_horaria,
      hora_inicio: tiempo.hora_inicio,
      hora_finalizacion: tiempo.hora_finalizacion,
      fecha_inicio: tiempo.fecha_inicio,
      fecha_finalizacion: tiempo.fecha_finalizacion,
      inicio_ts: limpiarTexto(payload.inicio_ts || "") || tiempo.evento_ts,
      lugar: limpiarTexto(payload.lugar || ""),
      lugar_normalizado: limpiarTexto(payload.lugar_normalizado || payload.lugar || ""),
      tipo_operativo: tipoInicio,
      ordenes_origen: ensureArray(payload.ordenes_origen),
      personal_inicio: snap.personal,
      moviles_inicio: snap.moviles,
      motos_inicio: snap.motos,
      elementos_inicio: snap.elementos,
      lugar_inicio: snap.lugar,
      horario_inicio: snap.horario,
      observaciones_inicio: snap.observaciones || "",
      texto_inicio: snap.texto_generado || "",
      metadata,
      updated_at: isoAhora(),
    };
  }

  function eventoBaseDesdePayload(tipoEvento, payload = {}, estadoId = null) {
    const tipo = normalizarTipo(tipoEvento || payload.tipo_evento || "INFORME");
    // Paso 97: los INFORMES son eventos autónomos. Se guardan con fotos e informe_key,
    // pero NO alimentan ni precargan el FINALIZADO del operativo.
    const alimentaFinalizado = !esTipoInformeIntermedio(tipo) && payload.alimenta_finalizado === true;
    const tipoInicio = resolverTipoInicioDesdePayload(payload) || limpiarTexto(payload.tipo_operativo || payload.tipo_corto || payload.tipo || "");
    const horario = getHorario(payload);
    const partes = partesHorario({ ...payload, horario });
    const tiempo = camposTiempoDesdePayload({ ...payload, horario });
    const fuentes = fuentesFinalizaDesdePayload(payload);
    const snap = datosSnapshotPayload(payload);

    return {
      operativo_estado_id: estadoId || payload.operativo_estado_id || null,
      operativo_key: getOperativoKey(payload),
      evento_key: esTipoInformeIntermedio(tipo) ? eventoKeyInforme(tipo, payload) : limpiarTexto(payload.evento_key || eventoKey(tipo, payload)),
      informe_key: extraerInformeKeyPayload(payload) || null,
      guardia_fecha: getGuardiaFecha(payload),
      fuente: limpiarTexto(payload.fuente || payload.origen || "WSP"),
      tipo_evento: tipo,
      fecha: limpiarTexto(payload.fecha_operativo || payload.fecha || "") || null,
      horario: horario || snap.horario || null,
      hora_desde: partes.desde || null,
      hora_hasta: partes.hasta || null,
      franja_horaria: tiempo.franja_horaria,
      hora_inicio: tiempo.hora_inicio,
      hora_finalizacion: tiempo.hora_finalizacion,
      fecha_inicio: tiempo.fecha_inicio,
      fecha_finalizacion: tiempo.fecha_finalizacion,
      fecha_evento: tiempo.fecha_evento,
      hora_evento: tiempo.hora_evento,
      evento_ts: tiempo.evento_ts,
      lugar: snap.lugar,
      tipo_operativo: tipoInicio,
      ordenes_origen: ensureArray(payload.ordenes_origen),
      personal: snap.personal,
      moviles: snap.moviles,
      motos: snap.motos,
      elementos: snap.elementos,
      personal_fuente: fuentes.personal_fuente,
      movilidad_fuente: fuentes.movilidad_fuente,
      elementos_fuente: fuentes.elementos_fuente,
      resultados: snap.resultados,
      medidas_cautelares: snap.medidas_cautelares,
      detalles: snap.detalles,
      observaciones: snap.observaciones ?? "",
      texto_generado: snap.texto_generado,
      payload_completo: payload,
      metadata: {
        ...(asObject(payload.metadata)),
        ultimo_payload_wsp: payload,
        actualizado_desde: "wsp-operativos-repo.js",
        repo_version: REPO_VERSION,
      },
      alimenta_finalizado: alimentaFinalizado,
      updated_at: isoAhora(),
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


  async function buscarEventoPorEventoKey(eventoKeyValue) {
    const key = limpiarTexto(eventoKeyValue || "");
    if (!key) return null;
    const params = new URLSearchParams({
      select: "*",
      evento_key: `eq.${key}`,
      order: "updated_at.desc,created_at.desc",
      limit: "1",
    });
    const rows = await selectRows(EVENTOS_TABLE, params);
    return rows[0] || null;
  }

  async function upsertEventoPorEventoKey(eventoBody = {}) {
    const key = limpiarTexto(eventoBody.evento_key || "");
    if (!key) return await insertRow(EVENTOS_TABLE, eventoBody);

    const existente = await buscarEventoPorEventoKey(key);
    if (existente?.id) {
      return await patchRows(EVENTOS_TABLE, { id: `eq.${existente.id}` }, {
        ...eventoBody,
        deleted_at: null,
        updated_at: isoAhora(),
      });
    }

    try {
      return await insertRow(EVENTOS_TABLE, eventoBody);
    } catch (error) {
      const msg = String(error?.message || error || "");
      if (!/409|duplicate key|ux_operativos_eventos_evento_key/i.test(msg)) throw error;
      const repetido = await buscarEventoPorEventoKey(key);
      if (!repetido?.id) throw error;
      return await patchRows(EVENTOS_TABLE, { id: `eq.${repetido.id}` }, {
        ...eventoBody,
        deleted_at: null,
        updated_at: isoAhora(),
      });
    }
  }

  async function buscarEstadoPorKey({ operativoKey, guardiaFecha, incluirBorrados = false } = {}) {
    if (!operativoKey || !guardiaFecha) return null;
    const params = new URLSearchParams({
      select: "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,franja_horaria,hora_inicio,hora_finalizacion,lugar,tipo_operativo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at,deleted_at,personal_inicio,moviles_inicio,motos_inicio,elementos_inicio,texto_inicio,personal_finalizado,moviles_finalizado,motos_finalizado,elementos_finalizado,texto_finalizado",
      operativo_key: `eq.${operativoKey}`,
      guardia_fecha: `eq.${guardiaFecha}`,
      order: "updated_at.desc",
      limit: "1",
    });
    if (!incluirBorrados) {
      params.set("deleted_at", "is.null");
    }
    const rows = await selectRows(ESTADO_TABLE, params);
    return rows[0] || null;
  }

  async function crearOActualizarEstadoInicio(payload) {
    const base = estadoBaseDesdePayload(payload);
    if (!base.operativo_key) throw errorValidacion("No se pudo determinar la clave del operativo para guardar el INICIO.");

    // Paso 88O: la fuente activa debe ignorar todo registro eliminado lógicamente.
    // Si existe una fila deleted_at del mismo operativo_key, se puede reciclar para evitar
    // choques de claves únicas, pero no debe bloquear como FINALIZADO.
    const existenteActivo = await buscarEstadoPorKey({ operativoKey: base.operativo_key, guardiaFecha: base.guardia_fecha });
    if (existenteActivo?.finalizado_evento_id || normalizarTipo(existenteActivo?.estado) === "FINALIZADO") {
      throw errorValidacion("El operativo ya figura FINALIZADO. No se puede actualizar el INICIO.", "VALIDACION_OPERATIVO_FINALIZADO");
    }

    if (existenteActivo?.id) {
      return await patchRows(ESTADO_TABLE, { id: `eq.${existenteActivo.id}` }, {
        ...base,
        estado: "EN_CURSO",
        deleted_at: null,
        finalizado_evento_id: null,
        personal_finalizado: [],
        personal_finalizado_fuente: null,
        moviles_finalizado: [],
        motos_finalizado: [],
        movilidad_finalizado_fuente: null,
        elementos_finalizado: {},
        elementos_finalizado_fuente: null,
        resultados_finalizado: {},
        detalles_finalizado: [],
        observaciones_finalizado: null,
        texto_finalizado: null,
        finalizacion_ts: null,
      });
    }

    const existenteBorrado = await buscarEstadoPorKey({ operativoKey: base.operativo_key, guardiaFecha: base.guardia_fecha, incluirBorrados: true });
    if (existenteBorrado?.id) {
      return await patchRows(ESTADO_TABLE, { id: `eq.${existenteBorrado.id}` }, {
        ...base,
        estado: "EN_CURSO",
        deleted_at: null,
        inicio_evento_id: null,
        finalizado_evento_id: null,
        personal_finalizado: [],
        personal_finalizado_fuente: null,
        moviles_finalizado: [],
        motos_finalizado: [],
        movilidad_finalizado_fuente: null,
        elementos_finalizado: {},
        elementos_finalizado_fuente: null,
        resultados_finalizado: {},
        detalles_finalizado: [],
        observaciones_finalizado: null,
        texto_finalizado: null,
        finalizacion_ts: null,
        metadata: {
          ...(asObject(existenteBorrado.metadata)),
          reactivado_desde_deleted_at: true,
          reactivado_at: isoAhora(),
          repo_version: REPO_VERSION,
        },
      });
    }

    return await insertRow(ESTADO_TABLE, { ...base, estado: "EN_CURSO" });
  }

  async function guardarInicio(payload = {}) {
    const estado = await crearOActualizarEstadoInicio(payload);
    const eventoBody = eventoBaseDesdePayload("INICIO", payload, estado.id);
    const evento = await upsertEventoPorEventoKey(eventoBody);
    window.WSP = window.WSP || {};
    window.WSP.debug = window.WSP.debug || {};
    window.WSP.debug.operativosRepoUltimoInicioBody = {
      version: REPO_VERSION,
      modo: "upsert_evento_key",
      eventoBody,
      evento,
      payload,
    };

    const estadoActualizado = await patchRows(ESTADO_TABLE, { id: `eq.${estado.id}` }, {
      estado: "EN_CURSO",
      inicio_evento_id: evento.id,
      finalizado_evento_id: null,
      deleted_at: null,
      personal_inicio: eventoBody.personal,
      moviles_inicio: eventoBody.moviles,
      motos_inicio: eventoBody.motos,
      elementos_inicio: eventoBody.elementos,
      texto_inicio: eventoBody.texto_generado,
      horario_inicio: eventoBody.franja_horaria || eventoBody.horario,
      lugar_inicio: eventoBody.lugar,
      hora_desde: eventoBody.hora_desde || estado.hora_desde || null,
      hora_hasta: eventoBody.hora_hasta || estado.hora_hasta || null,
      franja_horaria: eventoBody.franja_horaria || estado.franja_horaria || null,
      hora_inicio: eventoBody.hora_inicio || estado.hora_inicio || null,
      hora_finalizacion: eventoBody.hora_finalizacion || estado.hora_finalizacion || null,
      updated_at: isoAhora(),
      metadata: {
        ...(asObject(estado.metadata)),
        inicio_evento_id: evento.id,
        ultimo_evento: "INICIO",
        ultimo_payload_wsp: payload,
        personal_inicio: eventoBody.personal,
        moviles_inicio: eventoBody.moviles,
        motos_inicio: eventoBody.motos,
        elementos_inicio: eventoBody.elementos,
        texto_inicio: eventoBody.texto_generado,
        horario_inicio: eventoBody.franja_horaria || eventoBody.horario,
        repo_version: REPO_VERSION,
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

    const eventoBody = eventoBaseDesdePayload("FINALIZADO", payload, estado.id);
    // Paso 88N: compatibilidad con INICIOS legacy y payloads viejos.
    // Antes de llegar al trigger de Supabase, se replica aquí lo que efectivamente
    // se imprimió/seleccionó en FINALIZA, tomando también el debug del envío.
    const debugPayloadFinalizado = asObject(window.WSP?.debug?.payloadHistorialFinalizadoAntesGuardar);
    const debugFinalizaEnvio = asObject(window.WSP?.debug?.finalizaDatosEnvio);
    const salidaDebug = asObject(debugFinalizaEnvio.salida);
    if (!limpiarTexto(eventoBody.texto_generado || "")) {
      eventoBody.texto_generado = limpiarTexto(
        payload.texto_generado
        || payload.textoFinal
        || asObject(payload.payload_completo).texto_generado
        || asObject(payload.payload_completo).textoFinal
        || debugPayloadFinalizado.texto_generado
        || debugPayloadFinalizado.textoFinal
        || ""
      );
    }
    if (!arrayNoVacio(eventoBody.personal)) {
      eventoBody.personal = primerArrayNoVacio(payload.personal, debugPayloadFinalizado.personal, arrayDesdeTextoMultilinea(salidaDebug.personalTexto));
    }
    if (!arrayNoVacio(eventoBody.moviles)) {
      eventoBody.moviles = primerArrayNoVacio(payload.moviles, debugPayloadFinalizado.moviles, arrayDesdeLineaValor(salidaDebug.mov));
    }
    if (!arrayNoVacio(eventoBody.motos)) {
      eventoBody.motos = primerArrayNoVacio(payload.motos, debugPayloadFinalizado.motos, arrayDesdeLineaValor(salidaDebug.mot));
    }
    if (!objetoNoVacio(eventoBody.elementos)) {
      eventoBody.elementos = primerObjetoNoVacio(payload.elementos, debugPayloadFinalizado.elementos, normalizarElementosSalidaDebug(salidaDebug.elementos));
    }
    window.WSP = window.WSP || {};
    window.WSP.debug = window.WSP.debug || {};
    window.WSP.debug.operativosRepoUltimoFinalizadoBody = { version: REPO_VERSION, eventoBody, payload };
    validarFinalizadoBodyObligatorio(eventoBody, payload);
    const evento = estado.finalizado_evento_id
      ? await patchRows(EVENTOS_TABLE, { id: `eq.${estado.finalizado_evento_id}` }, {
          ...eventoBody,
          deleted_at: null,
          updated_at: isoAhora(),
        })
      : await upsertEventoPorEventoKey(eventoBody);

    const snap = datosSnapshotPayload(payload);
    const tiempo = camposTiempoDesdePayload({ ...payload, horario: eventoBody.franja_horaria || eventoBody.horario });
    const partesLegacy = partesHorario({ ...payload, horario: eventoBody.franja_horaria || eventoBody.horario || snap.horario });
    const fuentes = fuentesFinalizaDesdePayload(payload);
    const finalizadoPersonal = arrayNoVacio(eventoBody.personal) ? eventoBody.personal : snap.personal;
    const finalizadoMoviles = arrayNoVacio(eventoBody.moviles) ? eventoBody.moviles : snap.moviles;
    const finalizadoMotos = arrayNoVacio(eventoBody.motos) ? eventoBody.motos : snap.motos;
    const finalizadoElementos = objetoNoVacio(eventoBody.elementos) ? eventoBody.elementos : snap.elementos;
    const finalizadoTexto = limpiarTexto(eventoBody.texto_generado || snap.texto_generado || "");
    window.WSP = window.WSP || {};
    window.WSP.debug = window.WSP.debug || {};
    window.WSP.debug.operativosRepoUltimoFinalizadoBody = { version: REPO_VERSION, eventoBody, payload };

    const estadoActualizado = await patchRows(ESTADO_TABLE, { id: `eq.${estado.id}` }, {
      estado: "FINALIZADO",
      finalizado_evento_id: evento.id,
      hora_desde: limpiarTexto(payload.hora_desde || partesLegacy.desde || estado.hora_desde || ""),
      hora_hasta: limpiarTexto(payload.hora_hasta || partesLegacy.hasta || estado.hora_hasta || ""),
      franja_horaria: tiempo.franja_horaria,
      hora_inicio: tiempo.hora_inicio,
      hora_finalizacion: tiempo.hora_finalizacion,
      fecha_inicio: tiempo.fecha_inicio,
      fecha_finalizacion: tiempo.fecha_finalizacion,
      finalizacion_ts: limpiarTexto(payload.finalizacion_ts || "") || isoAhora(),
      personal_finalizado: finalizadoPersonal,
      personal_finalizado_fuente: fuentes.personal_fuente,
      moviles_finalizado: finalizadoMoviles,
      motos_finalizado: finalizadoMotos,
      movilidad_finalizado_fuente: fuentes.movilidad_fuente,
      elementos_finalizado: finalizadoElementos,
      elementos_finalizado_fuente: fuentes.elementos_fuente,
      resultados_finalizado: snap.resultados,
      detalles_finalizado: snap.detalles,
      observaciones_finalizado: snap.observaciones || "",
      texto_finalizado: finalizadoTexto,
      updated_at: isoAhora(),
      metadata: {
        ...(asObject(estado.metadata)),
        finalizado_evento_id: evento.id,
        ultimo_evento: "FINALIZADO",
        ultimo_payload_wsp: payload,
        ultimo_personal: finalizadoPersonal,
        ultimo_moviles: finalizadoMoviles,
        ultimo_motos: finalizadoMotos,
        ultimo_elementos: finalizadoElementos,
        ultimo_texto_generado: finalizadoTexto,
        ultimo_horario: snap.horario,
        personal_finalizado: finalizadoPersonal,
        personal_finalizado_fuente: fuentes.personal_fuente,
        moviles_finalizado: finalizadoMoviles,
        motos_finalizado: finalizadoMotos,
        movilidad_finalizado_fuente: fuentes.movilidad_fuente,
        elementos_finalizado: finalizadoElementos,
        elementos_finalizado_fuente: fuentes.elementos_fuente,
        texto_generado_finalizado: finalizadoTexto,
        horario_finalizado: snap.horario,
        franja_horaria: tiempo.franja_horaria,
        hora_inicio: tiempo.hora_inicio,
        hora_finalizacion: tiempo.hora_finalizacion,
        lugar_finalizado: snap.lugar,
        tipo_operativo_finalizado: snap.tipo_operativo,
        resultados_finalizado: snap.resultados,
        medidas_finalizado: snap.medidas_cautelares,
        detalles_finalizado: snap.detalles,
      },
    });
    validarFinalizadoGuardadoObligatorio(evento, estadoActualizado || estado, payload);
    return { ok: true, estado: estadoActualizado || estado, evento };
  }

  async function buscarEventoInformeExistente({ eventoKeyActual, eventoKeyLegacy, informeKey, operativoKey, guardiaFecha, tipoEvento } = {}) {
    const baseSelect = "*";
    const filtrosBase = {
      select: baseSelect,
      order: "updated_at.desc,created_at.desc",
      limit: "1",
    };

    async function buscar(paramsExtra) {
      const params = new URLSearchParams({ ...filtrosBase, ...paramsExtra });
      const rows = await selectRows(EVENTOS_TABLE, params);
      return rows[0] || null;
    }

    if (informeKey) {
      const porInforme = await buscar({
        informe_key: `eq.${informeKey}`,
        ...(operativoKey ? { operativo_key: `eq.${operativoKey}` } : {}),
        ...(guardiaFecha ? { guardia_fecha: `eq.${guardiaFecha}` } : {}),
      });
      if (porInforme?.id) return porInforme;
    }

    if (eventoKeyActual) {
      const porKeyActual = await buscar({ evento_key: `eq.${eventoKeyActual}` });
      if (porKeyActual?.id) return porKeyActual;
    }

    // Compatibilidad con informes guardados antes del Paso 96, cuando el evento_key
    // no diferenciaba nro de acta/informe_key y chocaba con ux_operativos_eventos_evento_key.
    if (!informeKey && eventoKeyLegacy && eventoKeyLegacy !== eventoKeyActual) {
      const porKeyLegacy = await buscar({ evento_key: `eq.${eventoKeyLegacy}` });
      if (porKeyLegacy?.id) return porKeyLegacy;
    }

    if (operativoKey && guardiaFecha && tipoEvento) {
      const porTipoLegacy = await buscar({
        operativo_key: `eq.${operativoKey}`,
        guardia_fecha: `eq.${guardiaFecha}`,
        tipo_evento: `eq.${normalizarTipo(tipoEvento)}`,
      });
      if (porTipoLegacy?.id && !informeKey) return porTipoLegacy;
    }

    return null;
  }

  function esErrorConflictoUnico(error) {
    const msg = String(error?.message || error || "");
    return /409|duplicate key|conflict|ux_operativos_eventos_evento_key/i.test(msg);
  }

  async function guardarInforme(tipoEvento, payload = {}) {
    const operativoKey = getOperativoKey(payload);
    const guardiaFecha = getGuardiaFecha(payload);
    const estado = payload.operativo_estado_id
      ? { id: payload.operativo_estado_id }
      : await buscarEstadoPorKey({ operativoKey, guardiaFecha });

    const eventoBody = eventoBaseDesdePayload(tipoEvento, payload, estado?.id || null);
    const eventoKeyActual = eventoBody.evento_key;
    const eventoKeyLegacy = eventoKey(tipoEvento, payload);
    const informeKey = eventoBody.informe_key || extraerInformeKeyPayload(payload);

    window.WSP = window.WSP || {};
    window.WSP.debug = window.WSP.debug || {};
    window.WSP.debug.operativosRepoUltimoInformeBody = {
      version: REPO_VERSION,
      eventoBody,
      eventoKeyActual,
      eventoKeyLegacy,
      informeKey,
      payload,
    };

    const existente = await buscarEventoInformeExistente({
      eventoKeyActual,
      eventoKeyLegacy,
      informeKey,
      operativoKey,
      guardiaFecha,
      tipoEvento,
    });

    if (existente?.id) {
      const evento = await patchRows(EVENTOS_TABLE, { id: `eq.${existente.id}` }, {
        ...eventoBody,
        evento_key: existente.evento_key || eventoBody.evento_key,
        informe_key: informeKey || existente.informe_key || null,
        updated_at: isoAhora(),
        metadata: {
          ...(asObject(existente.metadata)),
          ...(asObject(eventoBody.metadata)),
          actualizado_por_upsert_informe: true,
          repo_version: REPO_VERSION,
        },
      });
      return { ok: true, estado: estado || null, evento };
    }

    try {
      const evento = await insertRow(EVENTOS_TABLE, eventoBody);
      return { ok: true, estado: estado || null, evento };
    } catch (error) {
      if (!esErrorConflictoUnico(error)) throw error;

      const existenteTrasConflicto = await buscarEventoInformeExistente({
        eventoKeyActual,
        eventoKeyLegacy,
        informeKey,
        operativoKey,
        guardiaFecha,
        tipoEvento,
      });
      if (!existenteTrasConflicto?.id) throw error;

      const evento = await patchRows(EVENTOS_TABLE, { id: `eq.${existenteTrasConflicto.id}` }, {
        ...eventoBody,
        evento_key: existenteTrasConflicto.evento_key || eventoBody.evento_key,
        informe_key: informeKey || existenteTrasConflicto.informe_key || null,
        updated_at: isoAhora(),
        metadata: {
          ...(asObject(existenteTrasConflicto.metadata)),
          ...(asObject(eventoBody.metadata)),
          recuperado_de_conflicto_409: true,
          repo_version: REPO_VERSION,
        },
      });
      return { ok: true, estado: estado || null, evento };
    }
  }

  async function leerOperativosGuardia({ guardiaFecha, limit = 500 } = {}) {
    const gf = guardiaFecha || getGuardiaFecha({});
    const debug = {
      version: REPO_VERSION,
      guardiaFecha: gf,
      timestamp: isoAhora(),
      fuente: "sin_lectura",
      vistaFilas: 0,
      tablaFilas: 0,
      errorVista: null,
      errorTabla: null,
    };

    const paramsVista = new URLSearchParams({
      select: "*",
      guardia_fecha: `eq.${gf}`,
      order: "hora_inicio.asc,updated_at.desc",
      limit: String(limit || 500),
    });

    try {
      const vista = await selectRows("v_operativos_guardia_estadisticas", paramsVista);
      debug.vistaFilas = Array.isArray(vista) ? vista.length : 0;
      if (debug.vistaFilas > 0) {
        debug.fuente = "v_operativos_guardia_estadisticas";
        window.WSP = window.WSP || {};
        window.WSP.debug = window.WSP.debug || {};
        window.WSP.debug.operativosRepoLeerGuardia = debug;
        return vista;
      }
      debug.fuente = "vista_vacia_fallback_tabla_base";
    } catch (error) {
      debug.errorVista = error?.message || String(error);
      debug.fuente = "vista_error_fallback_tabla_base";
      console.warn("[WSP OperativosRepo] No se pudo leer la vista v_operativos_guardia_estadisticas, se usa tabla base.", error);
    }

    const params = new URLSearchParams({
      select: "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,franja_horaria,hora_inicio,hora_finalizacion,lugar,tipo_operativo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at,personal_inicio,moviles_inicio,motos_inicio,elementos_inicio,texto_inicio,personal_finalizado,moviles_finalizado,motos_finalizado,elementos_finalizado,texto_finalizado,personal_finalizado_fuente,movilidad_finalizado_fuente,elementos_finalizado_fuente,deleted_at",
      guardia_fecha: `eq.${gf}`,
      order: "hora_inicio.asc,updated_at.desc",
      limit: String(limit || 500),
      deleted_at: "is.null",
    });

    try {
      const tabla = await selectRows(ESTADO_TABLE, params);
      debug.tablaFilas = Array.isArray(tabla) ? tabla.length : 0;
      debug.fuente = debug.fuente || "tabla_base";
      window.WSP = window.WSP || {};
      window.WSP.debug = window.WSP.debug || {};
      window.WSP.debug.operativosRepoLeerGuardia = debug;
      return Array.isArray(tabla) ? tabla : [];
    } catch (error) {
      debug.errorTabla = error?.message || String(error);
      window.WSP = window.WSP || {};
      window.WSP.debug = window.WSP.debug || {};
      window.WSP.debug.operativosRepoLeerGuardia = debug;
      throw error;
    }
  }

  const api = {
    guardarInicio,
    guardarFinalizado,
    guardarInforme,
    leerOperativosGuardia,
    buscarEstadoPorKey,
  };

  api.version = REPO_VERSION;
  window.BMZCN.OperativosRepo = api;
  window.WSP.services.operativosRepo = api;
  window.WSP.modules.operativosRepo = api;
  console.log("[WSP OperativosRepo] cargado", REPO_VERSION);
})();
