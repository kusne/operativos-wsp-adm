(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};
  window.WSP.messages = window.WSP.messages || {};

  function limpiarTextoSimple(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function boldLocal(value) {
    return `*${String(value || "").trim()}*`;
  }

  function compactarSaltos(texto) {
    return String(texto || "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function construirObservacionesFinales(usuarioObservaciones = "", observacionesExtras = []) {
    const usuario = String(usuarioObservaciones || "").trim();
    const extras = Array.isArray(observacionesExtras)
      ? observacionesExtras.map((linea) => limpiarTextoSimple(linea)).filter(Boolean)
      : [];

    if (usuario && extras.length) return `${usuario}\n${extras.join("\n")}`;
    if (usuario) return usuario;
    if (extras.length) return extras.join("\n");
    return "Sin novedad";
  }

  function tituloModoOperativo(tipo) {
    const raw = String(tipo || "").trim();
    if (!raw) return "";
    return raw.charAt(0) + raw.slice(1).toLowerCase();
  }

  function filtrarMoviles(mov, mot) {
    return [mov, mot].filter((v) => v && v !== "/").join(" / ") || "/";
  }

  function crearPartesEncabezado(ctx = {}) {
    const deps = ctx.deps || {};
    const bold = typeof deps.bold === "function" ? deps.bold : boldLocal;
    const normalizarTituloOperativo = typeof deps.normalizarTituloOperativo === "function" ? deps.normalizarTituloOperativo : limpiarTextoSimple;
    const normalizarHorario = typeof deps.normalizarHorario === "function" ? deps.normalizarHorario : limpiarTextoSimple;
    const normalizarLugar = typeof deps.normalizarLugar === "function" ? deps.normalizarLugar : limpiarTextoSimple;

    const franja = ctx.franja || {};
    const tituloPrincipal = limpiarTextoSimple(
      `${tituloModoOperativo(ctx.tipo || "")} ${normalizarTituloOperativo(franja.titulo || "")}`
    );

    const partes = [];
    partes.push(bold("Policia de la Provincia de Santa Fe - Guardia Provincial"));
    partes.push(bold("Brigada Motorizada Centro Norte"));
    partes.push(bold("Tercio Charlie"));
    partes.push("");
    partes.push(bold(tituloPrincipal));
    partes.push("");
    partes.push(`${bold("Fecha:")} ${ctx.fecha || ""}`);
    partes.push(`${bold("Horario:")} ${normalizarHorario(franja.horario || "")}`);
    partes.push(`${bold("Lugar:")} ${normalizarLugar(franja.lugar || "")}`);
    partes.push("");
    return partes;
  }

  function agregarBloquePersonalMoviles(partes, ctx = {}) {
    const deps = ctx.deps || {};
    const bold = typeof deps.bold === "function" ? deps.bold : boldLocal;

    partes.push(bold("Personal Policial:"));
    partes.push(ctx.personalTexto || "/");
    partes.push("");
    partes.push(`${bold("Móviles:")} ${ctx.movilesTexto || filtrarMoviles(ctx.mov, ctx.mot)}`);
    partes.push("");

    if (ctx.extraConjunto) {
      partes.push(ctx.extraConjunto);
      partes.push("");
    }

    return partes;
  }

  function agregarBloqueElementos(partes, ctx = {}) {
    const deps = ctx.deps || {};
    const bold = typeof deps.bold === "function" ? deps.bold : boldLocal;
    const elementos = ctx.elementos || {};

    partes.push(bold("Elementos:"));
    partes.push(`Escopetas: ${elementos.escopetasTXT || "/"}`);
    partes.push(`Ht: ${elementos.htTXT || "/"}`);
    partes.push(`Pda: ${elementos.pdaTXT || "/"}`);
    partes.push(`Impresoras: ${elementos.impTXT || "/"}`);
    partes.push(`Alómetros: ${elementos.alomTXT || "/"}`);
    partes.push(`Alcoholímetros: ${elementos.alcoTXT || "/"}`);

    return partes;
  }

  function agregarBloqueResultados(partes, lineasResultados, deps = {}) {
    const bold = typeof deps.bold === "function" ? deps.bold : boldLocal;
    if (!Array.isArray(lineasResultados) || !lineasResultados.length) return partes;
    partes.push("");
    partes.push(bold("Resultados:"));
    partes.push(...lineasResultados);
    return partes;
  }

  function agregarBloqueDetalles(partes, detallesTexto, deps = {}) {
    const bold = typeof deps.bold === "function" ? deps.bold : boldLocal;
    if (!String(detallesTexto || "").trim()) return partes;
    partes.push("");
    partes.push(bold("Detalles:"));
    partes.push(detallesTexto);
    return partes;
  }

  function agregarBloqueObservaciones(partes, observacionesTexto, deps = {}) {
    const bold = typeof deps.bold === "function" ? deps.bold : boldLocal;
    partes.push("");
    partes.push(bold("Observaciones:"));
    partes.push(observacionesTexto || "Sin novedad");
    return partes;
  }

  function construirBaseMensajeOperativo(ctx = {}) {
    const partes = crearPartesEncabezado(ctx);
    agregarBloquePersonalMoviles(partes, ctx);
    agregarBloqueElementos(partes, ctx);
    return partes;
  }

  function construirTextoDesdePartes(partes) {
    return compactarSaltos((Array.isArray(partes) ? partes : []).join("\n"));
  }

  const api = {
    compactarSaltos,
    construirObservacionesFinales,
    tituloModoOperativo,
    filtrarMoviles,
    crearPartesEncabezado,
    agregarBloquePersonalMoviles,
    agregarBloqueElementos,
    agregarBloqueResultados,
    agregarBloqueDetalles,
    agregarBloqueObservaciones,
    construirBaseMensajeOperativo,
    construirTextoDesdePartes,
  };

  window.WSP.messages.operativo = api;
  window.WSP.modules.mensajesOperativo = api;

  console.log("[WSP mensajes operativo] cargado");
})();
