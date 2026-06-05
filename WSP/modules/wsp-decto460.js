(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};

  function getEl(id) {
    return document.getElementById(id);
  }

  function defaultRefs() {
    return {
      bloqueInformeDecto460: getEl("bloqueInformeDecto460"),
      informeDecto460Contexto: getEl("informeDecto460Contexto"),
      inf460Marca: getEl("inf460Marca"),
      inf460Modelo: getEl("inf460Modelo"),
      inf460Dominio: getEl("inf460Dominio"),
      inf460Acta: getEl("inf460Acta"),
      inf460OtrosCodigos: getEl("inf460OtrosCodigos"),
      inf460Corralon: getEl("inf460Corralon"),
      inf460Inventario: getEl("inf460Inventario"),
      inf460ResultadoAuto: getEl("inf460ResultadoAuto"),
      inf460Fotos: [1, 2, 3, 4].map((n) => getEl(`inf460Foto${n}`)).filter(Boolean),
    };
  }

  function withRefs(refs) {
    return Object.assign(defaultRefs(), refs || {});
  }

  function limpiarTextoSimple(txt) {
    return String(txt || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarBasicoSinAcentosLocal(txt) {
    return String(txt || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizarMayus(value) {
    return limpiarTextoSimple(value || "").toUpperCase();
  }

  function normalizarMayusInput(value) {
    return String(value || "")
      .replace(/[–—]/g, "-")
      .toUpperCase();
  }

  function normalizarDominio(value) {
    return normalizarMayus(value || "").replace(/[^A-Z0-9]/g, "");
  }

  function normalizarNumeroActa(value) {
    return String(value || "").replace(/\D+/g, "").slice(0, 12);
  }

  function parseCodigosInput(value) {
    return String(value || "")
      .split(/[\s,;/]+/)
      .map((v) => v.replace(/\D+/g, ""))
      .filter(Boolean)
      .filter((codigo, idx, arr) => arr.indexOf(codigo) === idx);
  }

  function normalizarClaveCorralonInforme(value) {
    const raw = normalizarMayus(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!raw) return "";
    if (/RINCON|SAN JOSE/.test(raw)) return "RINCON";
    if (/SANTA FE|SANTAFE|CIUDAD/.test(raw)) return "SANTA FE";
    if (/RECREO/.test(raw)) return "RECREO";
    if (/SAUCE/.test(raw)) return "SAUCE VIEJO";
    return raw;
  }

  function textoCorralonInforme(value) {
    const key = normalizarClaveCorralonInforme(value);
    const map = {
      "RINCON": "San Jose del Rincon",
      "SANTA FE": "Ciudad de Santa Fe",
      "RECREO": "Ciudad de Recreo",
      "SAUCE VIEJO": "Localidad de Sauce Viejo",
    };
    return map[key] || normalizarMayus(value || "");
  }

  function esFranjaPatrullajeInformeDecto460(franja, deps = {}) {
    const normalizarBasico = typeof deps.normalizarBasicoSinAcentos === "function"
      ? deps.normalizarBasicoSinAcentos
      : normalizarBasicoSinAcentosLocal;
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function"
      ? deps.obtenerTipoCortoFranja
      : () => "";

    const t = normalizarBasico([
      franja?.titulo,
      franja?.__tipoPublicado,
      obtenerTipoCortoFranja(franja),
    ].filter(Boolean).join(" "));

    return /\bpatrullaje\b|\bpatrullajes\b|\bpatrulla\b/.test(t);
  }

  function ordenarCandidatosInformeDecto460(candidatos = [], deps = {}) {
    return (Array.isArray(candidatos) ? candidatos : []).slice().sort((a, b) => {
      const ap = esFranjaPatrullajeInformeDecto460(a, deps) ? 0 : 1;
      const bp = esFranjaPatrullajeInformeDecto460(b, deps) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      const at = Number.isFinite(a?.__inicioTs) ? a.__inicioTs : Number.MAX_SAFE_INTEGER;
      const bt = Number.isFinite(b?.__inicioTs) ? b.__inicioTs : Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
  }

  function completarDestinoDecto460SiVacio(refs = {}, deps = {}) {
    const r = withRefs(refs);
    const normalizarMayusInforme = typeof deps.normalizarMayusInforme === "function"
      ? deps.normalizarMayusInforme
      : normalizarMayus;

    if (!r.inf460Corralon) return;
    if (normalizarMayusInforme(r.inf460Corralon.value)) return;

    const destino = typeof deps.inferirDestinoRemisionAlcoholemia === "function"
      ? deps.inferirDestinoRemisionAlcoholemia()
      : "";

    if (destino) r.inf460Corralon.value = destino;
  }

  function aplicarMayusculasInputsDecto460(refs = {}, deps = {}) {
    const r = withRefs(refs);
    const normalizarMayusInforme = typeof deps.normalizarMayusInforme === "function"
      ? deps.normalizarMayusInforme
      : normalizarMayusInput;
    const normalizarNumeroActaInforme = typeof deps.normalizarNumeroActaInforme === "function"
      ? deps.normalizarNumeroActaInforme
      : normalizarNumeroActa;
    const normalizarDominioInforme = typeof deps.normalizarDominioInforme === "function"
      ? deps.normalizarDominioInforme
      : normalizarDominio;

    document.querySelectorAll("#bloqueInformeDecto460 .upper-input").forEach((el) => {
      const pos = el.selectionStart;
      const end = el.selectionEnd;
      el.value = normalizarMayusInforme(el.value);
      try {
        if (pos != null && end != null) el.setSelectionRange(pos, end);
      } catch {}
    });

    if (r.inf460Acta) r.inf460Acta.value = normalizarNumeroActaInforme(r.inf460Acta.value);
    if (r.inf460Dominio) r.inf460Dominio.value = normalizarDominioInforme(r.inf460Dominio.value);
  }

  function codigosInformeDecto460(refs = {}) {
    const r = withRefs(refs);
    return parseCodigosInput(r.inf460OtrosCodigos?.value || "");
  }

  function fotosSeleccionadasInformeDecto460(refs = {}) {
    const r = withRefs(refs);
    return (Array.isArray(r.inf460Fotos) ? r.inf460Fotos : [])
      .map((el) => el?.files?.[0] || null)
      .filter(Boolean)
      .slice(0, 4);
  }

  function limpiarInformeDecto460(refs = {}, deps = {}) {
    const r = withRefs(refs);
    const limpiarErrorCampo = typeof deps.limpiarErrorCampo === "function" ? deps.limpiarErrorCampo : () => {};

    [r.inf460Marca, r.inf460Modelo, r.inf460Dominio, r.inf460Acta, r.inf460OtrosCodigos, r.inf460Corralon].forEach((el) => {
      if (!el) return;
      el.value = "";
      limpiarErrorCampo(el);
    });

    if (r.inf460Inventario) r.inf460Inventario.checked = false;
    (Array.isArray(r.inf460Fotos) ? r.inf460Fotos : []).forEach((el) => {
      if (el) el.value = "";
    });

    completarDestinoDecto460SiVacio(r, deps);
  }

  function validarInformeDecto460(refs = {}, deps = {}) {
    const r = withRefs(refs);
    const normalizarMayusInforme = typeof deps.normalizarMayusInforme === "function"
      ? deps.normalizarMayusInforme
      : normalizarMayus;
    const normalizarDominioInforme = typeof deps.normalizarDominioInforme === "function"
      ? deps.normalizarDominioInforme
      : normalizarDominio;
    const normalizarNumeroActaInforme = typeof deps.normalizarNumeroActaInforme === "function"
      ? deps.normalizarNumeroActaInforme
      : normalizarNumeroActa;
    const marcarErrorCampo = typeof deps.marcarErrorCampo === "function"
      ? deps.marcarErrorCampo
      : ((el, mensaje) => { alert(mensaje); if (el?.focus) el.focus(); return false; });
    const codigosInvalidosNomenclador = typeof deps.codigosInvalidosNomenclador === "function"
      ? deps.codigosInvalidosNomenclador
      : (() => []);

    aplicarMayusculasInputsDecto460(r, deps);

    if (!normalizarMayusInforme(r.inf460Marca?.value)) return marcarErrorCampo(r.inf460Marca, "Debe completar marca.");
    if (!normalizarDominioInforme(r.inf460Dominio?.value)) return marcarErrorCampo(r.inf460Dominio, "Debe completar dominio.");
    if (!normalizarNumeroActaInforme(r.inf460Acta?.value)) return marcarErrorCampo(r.inf460Acta, "Debe completar N° de acta. Solo números.");
    if (!normalizarMayusInforme(r.inf460Corralon?.value)) return marcarErrorCampo(r.inf460Corralon, "Debe completar corralón.");

    const codigos = codigosInformeDecto460(r);
    if (!codigos.length) return marcarErrorCampo(r.inf460OtrosCodigos, "Debe cargar al menos un código de infracción.");

    const invalidos = codigosInvalidosNomenclador(codigos);
    if (invalidos.length) return marcarErrorCampo(r.inf460OtrosCodigos, `Código/s fuera del nomenclador o no permitidos: ${invalidos.join(" / ")}.`);

    return true;
  }

  function construirTextoInformeDecto460(ctx = {}) {
    const {
      refs = {},
      inicio = null,
      franjaSeleccionada = null,
      fecha = "",
      hora = "",
      codigos = [],
      deps = {},
    } = ctx;
    const r = withRefs(refs);

    const normalizarLugar = typeof deps.normalizarLugar === "function" ? deps.normalizarLugar : limpiarTextoSimple;
    const lineaDesdeArray = typeof deps.lineaDesdeArray === "function" ? deps.lineaDesdeArray : ((arr) => (Array.isArray(arr) && arr.length ? arr.join(" / ") : "/"));
    const normalizarArrayTexto = typeof deps.normalizarArrayTexto === "function" ? deps.normalizarArrayTexto : ((arr) => Array.isArray(arr) ? arr.map(limpiarTextoSimple).filter(Boolean) : []);
    const normalizarMayusInforme = typeof deps.normalizarMayusInforme === "function" ? deps.normalizarMayusInforme : normalizarMayus;
    const normalizarDominioInforme = typeof deps.normalizarDominioInforme === "function" ? deps.normalizarDominioInforme : normalizarDominio;
    const normalizarNumeroActaInforme = typeof deps.normalizarNumeroActaInforme === "function" ? deps.normalizarNumeroActaInforme : normalizarNumeroActa;
    const obtenerNumeroOrdenDeFranja = typeof deps.obtenerNumeroOrdenDeFranja === "function" ? deps.obtenerNumeroOrdenDeFranja : (() => "");
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function" ? deps.obtenerTipoCortoFranja : (() => "");
    const compactarSaltos = typeof deps.compactarSaltos === "function" ? deps.compactarSaltos : ((txt) => String(txt || "").replace(/\n{3,}/g, "\n\n").trim());
    const bold = typeof deps.bold === "function" ? deps.bold : ((txt) => `*${String(txt || "").trim()}*`);

    const lugar = normalizarLugar(inicio?.lugar || franjaSeleccionada?.lugar || "");
    const moviles = [lineaDesdeArray(inicio?.moviles, "/"), lineaDesdeArray(inicio?.motos, "/")].filter((v) => v && v !== "/").join("/") || "/";
    const personal = normalizarArrayTexto(inicio?.personal).join("\n") || "/";
    const orden = normalizarMayusInforme(obtenerNumeroOrdenDeFranja(franjaSeleccionada) || inicio?.orden_num || "");
    const tipoOp = normalizarMayusInforme(inicio?.tipo_corto || obtenerTipoCortoFranja(franjaSeleccionada) || "OPERATIVO");
    const marca = normalizarMayusInforme(r.inf460Marca?.value);
    const modelo = normalizarMayusInforme(r.inf460Modelo?.value);
    const dominio = normalizarDominioInforme(r.inf460Dominio?.value);
    const nroActa = normalizarNumeroActaInforme(r.inf460Acta?.value);
    const corralon = normalizarMayusInforme(r.inf460Corralon?.value);
    const corralonTexto = textoCorralonInforme(corralon);
    const codigosTxt = (Array.isArray(codigos) ? codigos : []).join("/");
    const inventarioFrase = r.inf460Inventario?.checked ? " Labrando acta de inventario." : "";
    const obs = `Realizando ${tipoOp}${orden ? ` ${orden}` : ""} procedemos a la detención de un motovehículo marca ${marca}${modelo ? ` modelo ${modelo}` : ""}, dominio ${dominio}, labrándose acta de infracción N° ${nroActa} por el/los código/s ${codigosTxt}, remitiendo el birrodado al corralón de ${corralonTexto}.${inventarioFrase}`;

    return compactarSaltos([
      bold("POLICÍA DE LA PROVINCIA DE SANTA FE - GUARDIA PROVINCIAL"),
      bold("BRIGADA MOTORIZADA ZONA CENTRO NORTE SANTA FE"),
      bold("TERCIO CHARLIE"),
      "",
      bold("MOTIVO: REMISIÓN DE MOTOCICLETA POR DECTO 460/22"),
      "",
      `${bold("LUGAR:")} ${lugar}`,
      "",
      `${bold("HORA:")} ${hora}HS`,
      "",
      `${bold("FECHA:")} ${fecha}`,
      "",
      `${bold("MÓVIL:")} ${moviles}`,
      "",
      bold("PERSONAL"),
      personal,
      "",
      `${bold("OBSERVACIÓN:")} ${obs}`,
      fotosSeleccionadasInformeDecto460(r).length ? bold("Se adjunta vista fotográfica") : "",
    ].filter((v) => v !== null && v !== undefined).join("\n"));
  }

  function construirPayloadInformeDecto460(ctx = {}) {
    const {
      refs = {},
      inicio = null,
      franjaSeleccionada = null,
      textoFinal = "",
      codigos = [],
      fecha = "",
      hora = "",
      deps = {},
    } = ctx;
    const r = withRefs(refs);

    const normalizarArrayJsonWsp = typeof deps.normalizarArrayJsonWsp === "function" ? deps.normalizarArrayJsonWsp : ((v) => Array.isArray(v) ? v : (v ? [String(v)] : []));
    const obtenerNumeroOrdenDeFranja = typeof deps.obtenerNumeroOrdenDeFranja === "function" ? deps.obtenerNumeroOrdenDeFranja : (() => "");
    const detalleLineaInforme = typeof deps.detalleLineaInforme === "function" ? deps.detalleLineaInforme : ((codigo) => String(codigo || ""));
    const normalizarMayusInforme = typeof deps.normalizarMayusInforme === "function" ? deps.normalizarMayusInforme : normalizarMayus;
    const normalizarDominioInforme = typeof deps.normalizarDominioInforme === "function" ? deps.normalizarDominioInforme : normalizarDominio;
    const normalizarNumeroActaInforme = typeof deps.normalizarNumeroActaInforme === "function" ? deps.normalizarNumeroActaInforme : normalizarNumeroActa;
    const limpiarTextoSimpleDep = typeof deps.limpiarTextoSimple === "function" ? deps.limpiarTextoSimple : limpiarTextoSimple;
    const construirOperativoKeyEstable = typeof deps.construirOperativoKeyEstable === "function" ? deps.construirOperativoKeyEstable : (() => "");
    const getGuardiaFechaISO = typeof deps.getGuardiaFechaISO === "function" ? deps.getGuardiaFechaISO : (() => "");
    const fechaFranjaHistorialWsp = typeof deps.fechaFranjaHistorialWsp === "function" ? deps.fechaFranjaHistorialWsp : (() => fecha);
    const normalizarLugar = typeof deps.normalizarLugar === "function" ? deps.normalizarLugar : limpiarTextoSimple;
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function" ? deps.obtenerTipoCortoFranja : (() => "");
    const normalizarArrayTexto = typeof deps.normalizarArrayTexto === "function" ? deps.normalizarArrayTexto : ((arr) => Array.isArray(arr) ? arr.map(limpiarTextoSimple).filter(Boolean) : []);
    const normalizarPayloadElementos = typeof deps.normalizarPayloadElementos === "function" ? deps.normalizarPayloadElementos : (() => ({}));

    const ordenes = normalizarArrayJsonWsp(franjaSeleccionada?.__ordenesOrigen || franjaSeleccionada?.__ordenNum || obtenerNumeroOrdenDeFranja(franjaSeleccionada) || "");
    const detalles = (Array.isArray(codigos) ? codigos : []).map(detalleLineaInforme);
    const corralonClave = normalizarClaveCorralonInforme(r.inf460Corralon?.value);
    const corralonTexto = textoCorralonInforme(r.inf460Corralon?.value);
    const tieneInventario = !!r.inf460Inventario?.checked;

    const resultados = {
      "Vehículos Fiscalizados": 1,
      "Personas Identificadas": 1,
      "Actas Labradas": 1,
      "Decreto 460/22": 1,
    };
    const medidasPayload = {
      "Remisión": 1,
    };

    return {
      fuente: "WSP",
      operativo_key: limpiarTextoSimpleDep(franjaSeleccionada?.__operativoKey || inicio?.operativo_key || construirOperativoKeyEstable(franjaSeleccionada)),
      operativo_publicado_id: franjaSeleccionada?.__operativoPublicadoId || null,
      guardia_fecha: getGuardiaFechaISO(),
      fecha_operativo: fechaFranjaHistorialWsp(franjaSeleccionada),
      fecha,
      horario: hora,
      hora_desde: hora,
      hora_hasta: hora,
      lugar: normalizarLugar(inicio?.lugar || franjaSeleccionada?.lugar || ""),
      lugar_normalizado: normalizarLugar(inicio?.lugar || franjaSeleccionada?.lugar || ""),
      tipo_operativo: obtenerTipoCortoFranja(franjaSeleccionada),
      titulo: "DECTO 460/22",
      ordenes_origen: ordenes,
      personal: normalizarArrayTexto(inicio?.personal),
      moviles: normalizarArrayTexto(inicio?.moviles),
      motos: normalizarArrayTexto(inicio?.motos),
      elementos: normalizarPayloadElementos(inicio),
      resultados,
      medidas_cautelares: medidasPayload,
      detalles,
      observaciones: "",
      texto_generado: textoFinal,
      payload_completo: {
        tipo_evento: "DECTO_460_22",
        tipo_informe: "DECTO_460_22",
        franja: franjaSeleccionada,
        datos_formulario: {
          marca: normalizarMayusInforme(r.inf460Marca?.value),
          modelo: normalizarMayusInforme(r.inf460Modelo?.value),
          dominio: normalizarDominioInforme(r.inf460Dominio?.value),
          nro_acta: normalizarNumeroActaInforme(r.inf460Acta?.value),
          codigos,
          corralon: corralonClave || normalizarMayusInforme(r.inf460Corralon?.value),
          corralon_texto: corralonTexto,
          acta_inventario: tieneInventario,
          inventarios_460: tieneInventario ? 1 : 0,
        },
        remisiones_460: 1,
        inventarios_460: tieneInventario ? 1 : 0,
        corralon_460: corralonClave || normalizarMayusInforme(r.inf460Corralon?.value),
        corralon_460_texto: corralonTexto,
        detalle_origen_visual: "460/22",
        detalles_readonly: detalles.map((texto) => ({ texto, origen: "460/22", readonly: true })),
      },
      metadata: {
        tipo_evento: "DECTO_460_22",
        generado_desde: "wsp.js",
        alimenta_finalizado: false,
      },
    };
  }

  window.WSP.modules.decto460 = {
    withRefs,
    defaultRefs,
    normalizarClaveCorralonInforme,
    textoCorralonInforme,
    esFranjaPatrullajeInformeDecto460,
    ordenarCandidatosInformeDecto460,
    completarDestinoDecto460SiVacio,
    aplicarMayusculasInputsDecto460,
    codigosInformeDecto460,
    fotosSeleccionadasInformeDecto460,
    limpiarInformeDecto460,
    validarInformeDecto460,
    construirTextoInformeDecto460,
    construirPayloadInformeDecto460,
  };

  console.log("[WSP decto460] cargado");
})();
