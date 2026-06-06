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


  async function refrescarContextoInforme(config = {}) {
    const elemento = config.elemento || config.el || null;
    if (!elemento) return { ok: false, skipped: true, motivo: "sin_elemento" };

    const estaActivo = typeof config.activo === "function" ? !!config.activo() : config.activo !== false;
    if (!estaActivo) return { ok: false, skipped: true, motivo: "inactivo" };

    const getFranja = typeof config.getFranja === "function" ? config.getFranja : (() => config.franja || null);
    let franja = getFranja();

    if (!franja && typeof config.seleccionarDefault === "function") {
      await config.seleccionarDefault();
      franja = getFranja();
    }

    const mensajes = { ...MENSAJES_DEFAULT, ...(config.mensajes || {}) };
    const deps = config.deps || {};
    const setTexto = typeof config.setTexto === "function" ? config.setTexto : setTextoContexto;
    const resolverTexto = typeof config.resolverTexto === "function"
      ? config.resolverTexto
      : (inicio, franjaActual) => resolverTextoContextoInforme({ inicio, franja: franjaActual, mensajes, deps });

    if (!franja) {
      const texto = resolverTexto(null, null);
      setTexto(elemento, texto);
      return { ok: false, skipped: false, motivo: "sin_franja", texto };
    }

    const inicio = typeof config.getInicio === "function" ? await config.getInicio(franja) : (config.inicio || null);
    const texto = resolverTexto(inicio, franja);
    setTexto(elemento, texto);

    return { ok: !!inicio, skipped: false, motivo: inicio ? "ok" : "sin_inicio", inicio, franja, texto };
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
    refrescarContextoInforme,
  };

  window.WSP.ui.selectorContexto = api;
  window.WSP.modules.selectorContextoUi = api;

  console.log("[WSP selector contexto UI] cargado");
})();
