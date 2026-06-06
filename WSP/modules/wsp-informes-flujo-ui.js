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


  function normalizarTipoPantallaInforme(value) {
    return String(value || "")
      .replace(/\s+/g, "_")
      .trim()
      .toUpperCase();
  }

  function aplicarVisibilidadPantallaInforme(config = {}) {
    const tipo = normalizarTipoPantallaInforme(config.tipoPantalla || config.tipo || "");
    const esControlSuperior = tipo === "CONTROL_SUPERIOR";
    const esAlcoholemia = tipo === "ALCOHOLEMIA";
    const esDecto460 = tipo === "DECTO460" || tipo === "DECTO_460" || tipo === "DECRETO_460";

    const setControlSuperiorActiva = typeof config.setControlSuperiorActiva === "function"
      ? config.setControlSuperiorActiva
      : null;
    const setAlcoholemiaActiva = typeof config.setAlcoholemiaActiva === "function"
      ? config.setAlcoholemiaActiva
      : null;
    const setDecto460Activa = typeof config.setDecto460Activa === "function"
      ? config.setDecto460Activa
      : null;

    // Primero se apagan las pantallas que no corresponden y después se activa
    // la elegida. Evita formularios superpuestos al cambiar entre informes.
    if (!esControlSuperior && setControlSuperiorActiva) setControlSuperiorActiva(false);
    if (!esAlcoholemia && setAlcoholemiaActiva) setAlcoholemiaActiva(false);
    if (!esDecto460 && setDecto460Activa) setDecto460Activa(false);

    if (esControlSuperior && setControlSuperiorActiva) setControlSuperiorActiva(true);
    if (esAlcoholemia && setAlcoholemiaActiva) setAlcoholemiaActiva(true);
    if (esDecto460 && setDecto460Activa) setDecto460Activa(true);

    return {
      tipo,
      esControlSuperior,
      esAlcoholemia,
      esDecto460,
    };
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

  function activarPantallaInformePorTipo(config = {}) {
    return activarPantallaInforme({
      ...config,
      aplicarVisibilidad: () => aplicarVisibilidadPantallaInforme(config),
    });
  }

  const api = {
    sincronizarWidgetsAuxiliares,
    cargarOperativosYRefrescar,
    aplicarVisibilidadPantallaInforme,
    activarPantallaInforme,
    activarPantallaInformePorTipo,
  };

  window.WSP.ui.informesFlujo = api;
  window.WSP.modules.informesFlujoUi = api;
})();
