(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  const DEFAULTS = Object.freeze({
    INFORMES_TIPO: "INFORMES",
    INFORME_CONTROL_SUPERIOR_TIPO: "CONTROL SUPERIOR",
    INFORME_ALCOHOLEMIA_TIPO: "INFORME ALCOHOLEMIA",
    INFORME_DECRETO_460_TIPO: "INFORME DECTO 460/22",
    CONTROL_MOVILES_TIPO: "CONTROL MOVILES",
    FINALIZA_TIPO: "FINALIZA",
    INICIA_TIPO: "INICIA",
  });

  function cfg(config = {}) {
    return { ...DEFAULTS, ...(config || {}) };
  }

  function valor(el) {
    return String(el?.value || "").trim();
  }

  function upper(value) {
    return String(value || "").trim().toUpperCase();
  }

  function normalizarTipo(value) {
    return upper(value).replace(/\s+/g, " ");
  }

  function estaEnMenuInformes(refs = {}, config = {}) {
    const c = cfg(config);
    return normalizarTipo(valor(refs.selTipo)) === normalizarTipo(c.INFORMES_TIPO);
  }

  function getTipoInformeActivo(refs = {}, config = {}) {
    if (estaEnMenuInformes(refs, config)) return valor(refs.tipoInforme);
    // Compatibilidad con opciones viejas que todavía podían vivir en el selector principal.
    return valor(refs.selTipo);
  }

  function esControlMovilesActivo(refs = {}, config = {}) {
    const c = cfg(config);
    const tipo = normalizarTipo(valor(refs.selTipo));
    return tipo === normalizarTipo(c.CONTROL_MOVILES_TIPO) || tipo === "CONTROL_MOVILES";
  }

  function esFinalizaActivo(refs = {}, config = {}) {
    const c = cfg(config);
    return normalizarTipo(valor(refs.selTipo)) === normalizarTipo(c.FINALIZA_TIPO);
  }

  function esIniciaActivo(refs = {}, config = {}) {
    const c = cfg(config);
    return normalizarTipo(valor(refs.selTipo)) === normalizarTipo(c.INICIA_TIPO);
  }

  function esControlSuperiorActivo(refs = {}, config = {}) {
    const c = cfg(config);
    return normalizarTipo(getTipoInformeActivo(refs, config)) === normalizarTipo(c.INFORME_CONTROL_SUPERIOR_TIPO);
  }

  function esInformeAlcoholemiaActivo(refs = {}, config = {}) {
    const c = cfg(config);
    return normalizarTipo(getTipoInformeActivo(refs, config)) === normalizarTipo(c.INFORME_ALCOHOLEMIA_TIPO);
  }

  function esInformeDecto460Activo(refs = {}, config = {}) {
    const c = cfg(config);
    return normalizarTipo(getTipoInformeActivo(refs, config)) === normalizarTipo(c.INFORME_DECRETO_460_TIPO);
  }

  function getModoPantalla(refs = {}, config = {}) {
    if (esControlMovilesActivo(refs, config)) return "CONTROL_MOVILES";
    if (esFinalizaActivo(refs, config)) return "FINALIZA";
    if (estaEnMenuInformes(refs, config) && !getTipoInformeActivo(refs, config)) return "INFORMES_MENU";
    if (esControlSuperiorActivo(refs, config)) return "CONTROL_SUPERIOR";
    if (esInformeAlcoholemiaActivo(refs, config)) return "ALCOHOLEMIA";
    if (esInformeDecto460Activo(refs, config)) return "DECTO460";
    if (esIniciaActivo(refs, config)) return "INICIA";
    return normalizarTipo(valor(refs.selTipo)) || "INICIA";
  }

  function setSelectorInformesVisible(refs = {}, visible) {
    if (refs.bloqueInformeSelector) refs.bloqueInformeSelector.classList.toggle("hidden", !visible);
    if (!visible && refs.tipoInforme) refs.tipoInforme.value = "";
  }

  const api = {
    DEFAULTS,
    normalizarTipo,
    estaEnMenuInformes,
    getTipoInformeActivo,
    esControlMovilesActivo,
    esFinalizaActivo,
    esIniciaActivo,
    esControlSuperiorActivo,
    esInformeAlcoholemiaActivo,
    esInformeDecto460Activo,
    getModoPantalla,
    setSelectorInformesVisible,
  };

  window.WSP.ui.modo = api;
  window.WSP.modules.modoUi = api;

  console.log("[WSP modo UI] cargado");
})();
