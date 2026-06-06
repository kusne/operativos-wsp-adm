(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function limpiarTextoSimple(valor) {
    return String(valor || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function obtenerKeySeleccionada(sel) {
    return limpiarTextoSimple(sel?.value || "");
  }

  function buscarOperativoSeleccionado(operativos = [], key = "") {
    const lista = Array.isArray(operativos) ? operativos : [];
    const clave = limpiarTextoSimple(key);
    if (!clave) return null;
    return lista.find((item) => item && item.__key === clave) || null;
  }

  function limpiarChecksDeCambio(refs = {}) {
    if (refs.chkMostrarResultadosFinaliza) refs.chkMostrarResultadosFinaliza.checked = false;
    if (refs.chkPresenciaActiva) refs.chkPresenciaActiva.checked = false;
  }

  function resolverCambioSeleccion(config = {}) {
    const key = obtenerKeySeleccionada(config.selHorario);
    limpiarChecksDeCambio(config);

    return {
      key,
      franjaSeleccionada: buscarOperativoSeleccionado(config.operativos, key),
      ordenSeleccionada: null,
    };
  }

  const api = {
    limpiarTextoSimple,
    obtenerKeySeleccionada,
    buscarOperativoSeleccionado,
    limpiarChecksDeCambio,
    resolverCambioSeleccion,
  };

  window.WSP.ui.selectorEstado = api;
  window.WSP.modules.selectorEstadoUi = api;

  console.log("[WSP selector estado UI] cargado");
})();
