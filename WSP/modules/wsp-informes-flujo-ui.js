(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function sincronizarWidgetsAuxiliares(deps = {}) {
    if (typeof deps.sincronizarUIAlcoholimetro === "function") {
      deps.sincronizarUIAlcoholimetro();
    }

    if (typeof deps.sincronizarUIQrzDominio === "function") {
      deps.sincronizarUIQrzDominio();
    }
  }

  function cargarOperativosYRefrescar(config = {}) {
    const cargarOperativos = typeof config.cargarOperativos === "function"
      ? config.cargarOperativos
      : null;
    const actualizarDatosFranja = typeof config.actualizarDatosFranja === "function"
      ? config.actualizarDatosFranja
      : null;
    const refrescarContexto = typeof config.refrescarContexto === "function"
      ? config.refrescarContexto
      : null;

    if (!cargarOperativos) return Promise.resolve(null);

    return Promise.resolve(cargarOperativos(config.valorSeleccionado || "")).then(() => {
      if (actualizarDatosFranja) actualizarDatosFranja();
      if (refrescarContexto) return refrescarContexto();
      return null;
    });
  }

  function activarPantallaInforme(config = {}) {
    if (typeof config.aplicarVisibilidad === "function") {
      config.aplicarVisibilidad();
    }

    const tarea = cargarOperativosYRefrescar(config);

    if (typeof config.postActivar === "function") {
      config.postActivar();
    }

    sincronizarWidgetsAuxiliares(config);
    return tarea;
  }

  const api = {
    sincronizarWidgetsAuxiliares,
    cargarOperativosYRefrescar,
    activarPantallaInforme,
  };

  window.WSP.ui.informesFlujo = api;
  window.WSP.modules.informesFlujoUi = api;
})();
