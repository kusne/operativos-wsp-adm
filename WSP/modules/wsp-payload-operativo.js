(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};
  window.WSP.payloads = window.WSP.payloads || {};

  function textoOperativoWsp() {
    return window.WSP?.modules?.textoOperativo || window.WSP?.textoOperativo || null;
  }

  function limpiarTextoSimple(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.limpiarTextoSimple === "function") return mod.limpiarTextoSimple(txt);
    return String(txt || "")
      .replace(/\s+/g, " ")
      .replace(/[–—]/g, "-")
      .trim();
  }

  function normalizarBasicoSinAcentos(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarBasicoSinAcentos === "function") return mod.normalizarBasicoSinAcentos(txt);
    return limpiarTextoSimple(txt)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function normalizarLugar(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarLugar === "function") return mod.normalizarLugar(txt);
    return limpiarTextoSimple(txt);
  }

  function normalizarHorario(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarHorario === "function") return mod.normalizarHorario(txt);
    return limpiarTextoSimple(txt).replace(/\s*a\s*/i, " A ");
  }

  function normalizarParteClave(txt) {
    return normalizarBasicoSinAcentos(String(txt || ""))
      .replace(/[^a-z0-9/ -]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarArrayTexto(arr) {
    return (Array.isArray(arr) ? arr : []).map((v) => limpiarTextoSimple(v)).filter(Boolean);
  }

  function normalizarPayloadElementos(payload) {
    const fuente = payload?.elementos && typeof payload.elementos === "object" ? payload.elementos : payload || {};

    return {
      ESCOPETA: normalizarArrayTexto(fuente.ESCOPETA),
      HT: normalizarArrayTexto(fuente.HT),
      PDA: normalizarArrayTexto(fuente.PDA),
      IMPRESORA: normalizarArrayTexto(fuente.IMPRESORA),
      Alometro: normalizarArrayTexto(fuente.Alometro),
      Alcoholimetro: normalizarArrayTexto(fuente.Alcoholimetro),
    };
  }

  function construirOperativoKeyEstable(franja, deps = {}) {
    if (!franja) return "";

    const obtenerNumeroOrdenDeFranja = typeof deps.obtenerNumeroOrdenDeFranja === "function" ? deps.obtenerNumeroOrdenDeFranja : () => "";
    const obtenerTextoRefOrdenDeFranja = typeof deps.obtenerTextoRefOrdenDeFranja === "function" ? deps.obtenerTextoRefOrdenDeFranja : () => "";
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function" ? deps.obtenerTipoCortoFranja : () => "";

    const ordenNum = normalizarParteClave(obtenerNumeroOrdenDeFranja(franja) || "sin-orden");
    const textoRef = normalizarParteClave(obtenerTextoRefOrdenDeFranja(franja) || "sin-texto");
    const horario = normalizarParteClave(franja?.horario || "sin-horario");
    const lugar = normalizarParteClave(franja?.lugar || "sin-lugar");
    const tipo = normalizarParteClave(obtenerTipoCortoFranja(franja) || "sin-tipo");

    return [ordenNum, textoRef, horario, lugar, tipo].join("|");
  }

  function construirOperativoKeysPosibles(franja, deps = {}) {
    if (!franja) return [];

    const obtenerNumeroOrdenDeFranja = typeof deps.obtenerNumeroOrdenDeFranja === "function" ? deps.obtenerNumeroOrdenDeFranja : () => "";
    const obtenerTextoRefOrdenDeFranja = typeof deps.obtenerTextoRefOrdenDeFranja === "function" ? deps.obtenerTextoRefOrdenDeFranja : () => "";
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function" ? deps.obtenerTipoCortoFranja : () => "";
    const getDiaGuardiaTexto = typeof deps.getDiaGuardiaTexto === "function" ? deps.getDiaGuardiaTexto : () => "";

    const orden = normalizarParteClave(obtenerNumeroOrdenDeFranja(franja) || "-") || "-";
    const textoRef = normalizarParteClave(obtenerTextoRefOrdenDeFranja(franja) || "-") || "-";
    const horario = normalizarParteClave(String(franja?.horario || "-").replace(/:/g, " ")) || "-";
    const lugar = normalizarParteClave(franja?.lugar || "-") || "-";
    const tipo = normalizarParteClave(obtenerTipoCortoFranja(franja) || "-") || "-";
    const dia = normalizarParteClave(getDiaGuardiaTexto() || "-") || "-";

    const keys = new Set();
    if (franja?.__operativoKey) keys.add(limpiarTextoSimple(franja.__operativoKey));
    keys.add(construirOperativoKeyEstable(franja, deps));
    keys.add([orden, dia, horario, lugar, tipo].join("|"));
    keys.add([orden, dia, horario, lugar, `${tipo} - ${textoRef}`].join("|"));
    keys.add([orden, dia, horario, lugar, `${tipo} - -`].join("|"));
    keys.add([orden, horario, lugar].join("|"));

    return Array.from(keys).map((v) => limpiarTextoSimple(v)).filter(Boolean);
  }

  function pareceHorario(txt) {
    return /(\d{1,2})[ :](\d{2})\s*a\s*(\d{1,2})[ :](\d{2})/i.test(String(txt || ""));
  }


  function normalizarHoraRangoFinalizaWsp(value = "") {
    const raw = limpiarTextoSimple(value || "").replace(/[–—]/g, "-");
    if (!raw) return "";
    const m = raw.match(/\b(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?\b\s*(?:A|a|-|\/|HASTA|hasta)\s*(FINALIZAR|\d{1,2}\s*:\s*\d{2}(?::\d{2})?)\b/);
    if (!m) return "";
    const desdeH = Number(m[1]);
    const desdeM = Number(m[2]);
    if (desdeH < 0 || desdeH > 23 || desdeM < 0 || desdeM > 59) return "";
    let hasta = limpiarTextoSimple(m[3]).toUpperCase();
    const desde = `${String(desdeH).padStart(2, "0")}:${String(desdeM).padStart(2, "0")}`;
    if (hasta !== "FINALIZAR") {
      const mh = hasta.match(/^(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?$/);
      if (!mh) return "";
      const hastaH = Number(mh[1]);
      const hastaM = Number(mh[2]);
      if (hastaH < 0 || hastaH > 23 || hastaM < 0 || hastaM > 59) return "";
      hasta = `${String(hastaH).padStart(2, "0")}:${String(hastaM).padStart(2, "0")}`;
    }
    return `${desde} A ${hasta}`;
  }

  function normalizarHoraCampoFinalizaWsp(value = "") {
    const raw = limpiarTextoSimple(value || "");
    if (!raw || /^FINALIZAR$/i.test(raw)) return /^FINALIZAR$/i.test(raw) ? "FINALIZAR" : "";
    const m = raw.match(/^(\d{1,2})\s*:\s*(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
    if (!m) return "";
    const h = Number(m[1]);
    const mm = Number(m[2]);
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return "";
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  function construirHorarioDesdePartesFinalizaWsp(desde = "", hasta = "") {
    const d = normalizarHoraCampoFinalizaWsp(desde);
    const h = normalizarHoraCampoFinalizaWsp(hasta);
    if (!d || !h) return "";
    return normalizarHoraRangoFinalizaWsp(`${d} A ${h}`) || "";
  }

  function resolverHorarioPayloadWsp(franja = {}) {
    const payload = franja?.payload_completo && typeof franja.payload_completo === "object" ? franja.payload_completo : {};
    const derivadoKey = extraerPartesDeOperativoKey(
      franja?.operativo_key
      || franja?.__operativoKey
      || franja?.__inicioGuardadoPayload?.operativo_key
      || payload?.operativo_key
      || payload?.franja?.operativo_key
      || payload?.franja?.__operativoKey
      || ""
    );
    const candidatos = [
      franja?.franja_horaria,
      franja?.horario_inicio,
      franja?.horario,
      franja?.__inicioGuardadoPayload?.franja_horaria,
      franja?.__inicioGuardadoPayload?.horario_inicio,
      franja?.__inicioGuardadoPayload?.horario,
      franja?.__franjaFinalizaOriginal?.franja_horaria,
      franja?.__franjaFinalizaOriginal?.horario,
      payload?.franja_horaria,
      payload?.horario,
      payload?.franja?.franja_horaria,
      payload?.franja?.horario,
      derivadoKey?.horario,
    ];
    for (const item of candidatos) {
      const normalizado = normalizarHoraRangoFinalizaWsp(item || "");
      if (normalizado) return normalizado;
    }
    const pares = [
      [franja?.hora_inicio, franja?.hora_finalizacion],
      [franja?.hora_desde, franja?.hora_hasta],
      [franja?.__inicioGuardadoPayload?.hora_inicio, franja?.__inicioGuardadoPayload?.hora_finalizacion],
      [franja?.__inicioGuardadoPayload?.hora_desde, franja?.__inicioGuardadoPayload?.hora_hasta],
      [payload?.hora_inicio, payload?.hora_finalizacion],
      [payload?.hora_desde, payload?.hora_hasta],
      [payload?.franja?.hora_inicio, payload?.franja?.hora_finalizacion],
      [payload?.franja?.hora_desde, payload?.franja?.hora_hasta],
    ];
    for (const [desde, hasta] of pares) {
      const normalizado = construirHorarioDesdePartesFinalizaWsp(desde, hasta);
      if (normalizado) return normalizado;
    }
    return "";
  }

  function pareceDiaSemana(txt) {
    return /^(lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo)$/i.test(limpiarTextoSimple(txt));
  }

  function extraerPartesDeOperativoKey(operativoKey) {
    const partes = String(operativoKey || "").split("|").map((v) => limpiarTextoSimple(v));

    if (partes.length >= 5 && pareceDiaSemana(partes[1])) {
      return {
        orden_num: limpiarTextoSimple(partes[0] || ""),
        texto_ref: limpiarTextoSimple(partes[4] || ""),
        horario: limpiarTextoSimple(partes[2] || ""),
        lugar: limpiarTextoSimple(partes[3] || ""),
        tipo_corto: limpiarTextoSimple(partes[4] || ""),
      };
    }

    if (partes.length >= 5 && pareceHorario(partes[2])) {
      return {
        orden_num: limpiarTextoSimple(partes[0] || ""),
        texto_ref: limpiarTextoSimple(partes[1] || ""),
        horario: limpiarTextoSimple(partes[2] || ""),
        lugar: limpiarTextoSimple(partes[3] || ""),
        tipo_corto: limpiarTextoSimple(partes[4] || ""),
      };
    }

    if (partes.length >= 3 && pareceHorario(partes[1])) {
      return {
        orden_num: limpiarTextoSimple(partes[0] || ""),
        texto_ref: limpiarTextoSimple(partes[3] || partes[2] || ""),
        horario: limpiarTextoSimple(partes[1] || ""),
        lugar: limpiarTextoSimple(partes[2] || ""),
        tipo_corto: limpiarTextoSimple(partes[3] || ""),
      };
    }

    return {
      orden_num: limpiarTextoSimple(partes[0] || ""),
      texto_ref: limpiarTextoSimple(partes[1] || ""),
      horario: limpiarTextoSimple(partes[2] || ""),
      lugar: limpiarTextoSimple(partes[3] || ""),
      tipo_corto: limpiarTextoSimple(partes[4] || ""),
    };
  }

  function normalizarValorComparacion(txt) {
    return normalizarBasicoSinAcentos(String(txt || "")).replace(/[^a-z0-9]+/g, "");
  }

  function valoresComparablesCoinciden(a, b) {
    const aa = normalizarValorComparacion(a);
    const bb = normalizarValorComparacion(b);
    if (!aa || !bb) return false;
    return aa === bb || aa.includes(bb) || bb.includes(aa);
  }

  function puntuarCoincidenciaInicio(payload, franja, ctx = {}) {
    if (!payload || !franja) return -1;

    const fechasBusqueda = Array.isArray(ctx.fechasBusqueda) ? ctx.fechasBusqueda : [];
    if (payload.guardia_fecha && fechasBusqueda.length && !fechasBusqueda.includes(payload.guardia_fecha)) {
      return -1;
    }

    const deps = ctx.deps || {};
    const keysEsperadas = construirOperativoKeysPosibles(franja, deps);
    if (payload.operativo_key && keysEsperadas.includes(limpiarTextoSimple(payload.operativo_key))) {
      return 1000;
    }

    const obtenerNumeroOrdenDeFranja = typeof deps.obtenerNumeroOrdenDeFranja === "function" ? deps.obtenerNumeroOrdenDeFranja : () => "";
    const obtenerTextoRefOrdenDeFranja = typeof deps.obtenerTextoRefOrdenDeFranja === "function" ? deps.obtenerTextoRefOrdenDeFranja : () => "";
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function" ? deps.obtenerTipoCortoFranja : () => "";

    let puntos = 0;

    if (valoresComparablesCoinciden(payload.horario, franja?.horario || "")) puntos += 60;
    if (valoresComparablesCoinciden(payload.lugar, franja?.lugar || "")) puntos += 30;
    if (valoresComparablesCoinciden(payload.tipo_corto, obtenerTipoCortoFranja(franja) || "")) puntos += 10;
    if (valoresComparablesCoinciden(payload.orden_num, obtenerNumeroOrdenDeFranja(franja) || "")) puntos += 8;
    if (valoresComparablesCoinciden(payload.texto_ref, obtenerTextoRefOrdenDeFranja(franja) || "")) puntos += 5;

    return puntos;
  }

  function normalizarInicioGuardado(payload) {
    if (!payload) return null;

    const derivado = extraerPartesDeOperativoKey(payload.operativo_key || "");

    return {
      guardia_fecha: String(payload.guardia_fecha || ""),
      operativo_estado_id: String(payload.operativo_estado_id || payload.id || ""),
      operativo_key: String(payload.operativo_key || ""),
      orden_num: limpiarTextoSimple(payload.orden_num || derivado.orden_num || ""),
      texto_ref: limpiarTextoSimple(payload.texto_ref || derivado.texto_ref || ""),
      horario: resolverHorarioPayloadWsp({ ...payload, horario: payload.horario || derivado.horario || "" }),
      hora_desde: normalizarHoraCampoFinalizaWsp(payload.hora_desde || payload.hora_inicio || ""),
      hora_hasta: normalizarHoraCampoFinalizaWsp(payload.hora_hasta || payload.hora_finalizacion || ""),
      lugar: limpiarTextoSimple(payload.lugar || derivado.lugar || ""),
      tipo_corto: limpiarTextoSimple(payload.tipo_corto || derivado.tipo_corto || ""),
      personal: normalizarArrayTexto(payload.personal),
      moviles: normalizarArrayTexto(payload.moviles),
      motos: normalizarArrayTexto(payload.motos),
      elementos: normalizarPayloadElementos(payload),
      ts: payload?.ts || Date.now(),
    };
  }

  function construirInicioGuardadoActual(ctx = {}) {
    const franja = ctx.franja || null;
    if (!franja) return null;

    const deps = ctx.deps || {};
    const leerSeleccionPorClase = typeof deps.leerSeleccionPorClase === "function" ? deps.leerSeleccionPorClase : () => [];
    const construirPayloadElementosActual = typeof deps.construirPayloadElementosActual === "function" ? deps.construirPayloadElementosActual : () => ({});
    const obtenerNumeroOrdenDeFranja = typeof deps.obtenerNumeroOrdenDeFranja === "function" ? deps.obtenerNumeroOrdenDeFranja : () => "";
    const obtenerTextoRefOrdenDeFranja = typeof deps.obtenerTextoRefOrdenDeFranja === "function" ? deps.obtenerTextoRefOrdenDeFranja : () => "";
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function" ? deps.obtenerTipoCortoFranja : () => "";

    return normalizarInicioGuardado({
      guardia_fecha: limpiarTextoSimple(ctx.guardiaFecha || ""),
      operativo_key: construirOperativoKeyEstable(franja, deps),
      orden_num: obtenerNumeroOrdenDeFranja(franja),
      texto_ref: obtenerTextoRefOrdenDeFranja(franja),
      horario: limpiarTextoSimple(franja?.horario || ""),
      lugar: limpiarTextoSimple(franja?.lugar || ""),
      tipo_corto: obtenerTipoCortoFranja(franja),
      personal: leerSeleccionPorClase("personal"),
      moviles: leerSeleccionPorClase("movil"),
      motos: leerSeleccionPorClase("moto"),
      elementos: construirPayloadElementosActual(),
      ts: Date.now(),
    });
  }

  function arrayDesdeLineaHistorialWsp(linea) {
    const raw = limpiarTextoSimple(linea || "");
    if (!raw || raw === "/") return [];
    return raw.split("/").map((v) => limpiarTextoSimple(v)).filter(Boolean).filter((v) => v !== "/");
  }

  function fechaFranjaHistorialWsp(franja) {
    return limpiarTextoSimple(franja?.fecha || franja?.__fechaOperativo || "");
  }

  function extraerMapasResultadosHistorialWsp(lineas = []) {
    const resultados = {};
    const medidas = {};
    let enMedidas = false;

    (Array.isArray(lineas) ? lineas : []).forEach((linea) => {
      const texto = limpiarTextoSimple(linea || "");
      if (!texto) return;
      if (/^medidas cautelares:?$/i.test(texto)) {
        enMedidas = true;
        return;
      }
      const m = texto.match(/^(.+?):\s*\((\d{1,3})\)/);
      if (!m) return;
      const key = limpiarTextoSimple(m[1]);
      const value = parseInt(m[2], 10) || 0;
      if (enMedidas) medidas[key] = value;
      else resultados[key] = value;
    });

    return { resultados, medidas };
  }

  function construirPayloadHistorialOperativoWsp(ctx = {}) {
    const franja = ctx.franja || null;
    const deps = ctx.deps || {};
    const extraerHorarioPartesWsp = typeof deps.extraerHorarioPartesWsp === "function" ? deps.extraerHorarioPartesWsp : () => ({ desde: "", hasta: "" });
    const normalizarArrayJsonWsp = typeof deps.normalizarArrayJsonWsp === "function" ? deps.normalizarArrayJsonWsp : ((value) => Array.isArray(value) ? value : []);
    const getGuardiaFechaISO = typeof deps.getGuardiaFechaISO === "function" ? deps.getGuardiaFechaISO : () => "";
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function" ? deps.obtenerTipoCortoFranja : () => "";

    const horarioPayload = resolverHorarioPayloadWsp(franja) || normalizarHorario(franja?.horario || "");
    const partesHorario = extraerHorarioPartesWsp(horarioPayload || "");
    const mapas = extraerMapasResultadosHistorialWsp(ctx.lineasResultados || []);
    const ordenes = normalizarArrayJsonWsp(franja?.__ordenesOrigen || franja?.__ordenNum || "");

    return {
      fuente: "WSP",
      operativo_key: limpiarTextoSimple(franja?.__operativoKey || construirOperativoKeyEstable(franja, deps)),
      operativo_publicado_id: franja?.__operativoPublicadoId || null,
      guardia_fecha: getGuardiaFechaISO(),
      fecha_operativo: fechaFranjaHistorialWsp(franja),
      fecha: ctx.fecha || new Date().toLocaleDateString("es-AR"),
      horario: horarioPayload,
      hora_desde: partesHorario.desde || "",
      hora_hasta: partesHorario.hasta || "",
      lugar: normalizarLugar(franja?.lugar || ""),
      lugar_normalizado: normalizarLugar(franja?.lugar || ""),
      tipo_operativo: obtenerTipoCortoFranja(franja),
      titulo: limpiarTextoSimple(franja?.titulo || ""),
      ordenes_origen: ordenes,
      personal: String(ctx.personalTexto || "").split("\n").map((v) => limpiarTextoSimple(v)).filter(Boolean),
      moviles: arrayDesdeLineaHistorialWsp(ctx.mov),
      motos: arrayDesdeLineaHistorialWsp(ctx.mot),
      elementos: {
        ESCOPETA: arrayDesdeLineaHistorialWsp(ctx.escopetasTXT),
        HT: arrayDesdeLineaHistorialWsp(ctx.htTXT),
        PDA: arrayDesdeLineaHistorialWsp(ctx.pdaTXT),
        IMPRESORA: arrayDesdeLineaHistorialWsp(ctx.impTXT),
        Alometro: arrayDesdeLineaHistorialWsp(ctx.alomTXT),
        Alcoholimetro: arrayDesdeLineaHistorialWsp(ctx.alcoTXT),
      },
      resultados: mapas.resultados,
      medidas_cautelares: mapas.medidas,
      detalles: Array.isArray(ctx.detallesProcesados?.detalleItems) ? ctx.detallesProcesados.detalleItems : [],
      observaciones: ctx.observacionesFinales,
      texto_generado: ctx.textoFinal,
      textoFinal: ctx.textoFinal,
      payload_completo: {
        tipo_evento: ctx.tipoEvento,
        franja,
        texto_generado: ctx.textoFinal,
        textoFinal: ctx.textoFinal,
        registro_original: franja?.__registroOriginalPublicado || null,
      },
      metadata: {
        tipo_evento: ctx.tipoEvento,
        generado_desde: "wsp.js",
      },
    };
  }

  const api = {
    limpiarTextoSimple,
    normalizarBasicoSinAcentos,
    normalizarParteClave,
    normalizarArrayTexto,
    normalizarPayloadElementos,
    normalizarHoraRangoFinalizaWsp,
    resolverHorarioPayloadWsp,
    construirOperativoKeyEstable,
    construirOperativoKeysPosibles,
    pareceHorario,
    pareceDiaSemana,
    extraerPartesDeOperativoKey,
    normalizarValorComparacion,
    valoresComparablesCoinciden,
    puntuarCoincidenciaInicio,
    normalizarInicioGuardado,
    construirInicioGuardadoActual,
    arrayDesdeLineaHistorialWsp,
    fechaFranjaHistorialWsp,
    extraerMapasResultadosHistorialWsp,
    construirPayloadHistorialOperativoWsp,
  };

  window.WSP.modules.payloadOperativo = api;
  window.WSP.payloads.operativo = api;

  console.log("[WSP payload operativo] cargado");
})();
