(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  const MENSAJES_DEFAULT = Object.freeze({
    sinFranja: "No hay operativos iniciados para vincular el informe.",
    sinInicio: "No hay INICIO guardado para este operativo. Envíe primero el INICIA.",
  });

  function limpiarTextoSimple(valor) {
    return String(valor || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarLugarFallback(valor) {
    return limpiarTextoSimple(valor);
  }

  function arrayDesdeValor(value) {
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

  function lineaDesdeArrayFallback(value, sep = "/") {
    const items = arrayDesdeValor(value);
    return items.length ? items.join(sep) : "/";
  }

  function construirMovilidadInicio(inicio = {}, deps = {}) {
    const linea = typeof deps.lineaDesdeArray === "function" ? deps.lineaDesdeArray : lineaDesdeArrayFallback;
    const moviles = linea(inicio.moviles, "/");
    const motos = linea(inicio.motos, "/");
    return [moviles, motos].filter((v) => v && v !== "/").join(" / ") || "/";
  }

  function construirLugarInicio(inicio = {}, franja = {}, deps = {}) {
    const normalizar = typeof deps.normalizarLugar === "function" ? deps.normalizarLugar : normalizarLugarFallback;
    return normalizar(inicio.lugar || franja.lugar || "");
  }

  function resolverTextoContextoInforme(config = {}) {
    const franja = config.franja || null;
    const inicio = config.inicio || null;
    const mensajes = { ...MENSAJES_DEFAULT, ...(config.mensajes || {}) };
    const deps = config.deps || {};

    if (!franja) return mensajes.sinFranja;
    if (!inicio) return mensajes.sinInicio;

    const lugar = construirLugarInicio(inicio, franja, deps) || "/";
    const movilidad = construirMovilidadInicio(inicio, deps);
    return `Lugar: ${lugar} | Móviles: ${movilidad}`;
  }

  function setTextoContexto(el, texto = "") {
    if (!el) return;
    el.textContent = limpiarTextoSimple(texto);
  }

  const api = {
    MENSAJES_DEFAULT,
    limpiarTextoSimple,
    arrayDesdeValor,
    lineaDesdeArrayFallback,
    construirMovilidadInicio,
    construirLugarInicio,
    resolverTextoContextoInforme,
    setTextoContexto,
  };

  window.WSP.ui.selectorContexto = api;
  window.WSP.modules.selectorContextoUi = api;

  console.log("[WSP selector contexto UI] cargado");
})();
