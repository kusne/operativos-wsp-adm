(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  const MODOS = Object.freeze({
    INICIA: "INICIA",
    FINALIZA: "FINALIZA",
    INFORMES_MENU: "INFORMES_MENU",
    CONTROL_MOVILES: "CONTROL_MOVILES",
    CONTROL_SUPERIOR: "CONTROL_SUPERIOR",
    ALCOHOLEMIA: "ALCOHOLEMIA",
    DECTO460: "DECTO460",
  });

  function ejecutar(fn, ...args) {
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function normalizarTexto(valor) {
    return String(valor || "").trim();
  }

  function crearEstadoSeleccionPrincipal(config = {}) {
    return {
      enInformes: !!config.enInformes,
      tipoInformeActivo: normalizarTexto(config.tipoInformeActivo),
      controlMoviles: !!config.controlMoviles,
      fin: !!config.fin,
      controlSuperior: !!config.controlSuperior,
      informeAlcoholemia: !!config.informeAlcoholemia,
      informeDecto460: !!config.informeDecto460,
    };
  }

  function estadoDesdeConfig(config = {}) {
    return config.__estadoSeleccionPrincipal || crearEstadoSeleccionPrincipal(config);
  }

  function resolverModoSeleccionPrincipal(config = {}) {
    const estado = estadoDesdeConfig(config);

    if (estado.controlMoviles) return MODOS.CONTROL_MOVILES;
    if (estado.fin) return MODOS.FINALIZA;
    if (estado.enInformes && !estado.tipoInformeActivo) return MODOS.INFORMES_MENU;
    if (estado.informeDecto460) return MODOS.DECTO460;
    if (estado.informeAlcoholemia) return MODOS.ALCOHOLEMIA;
    if (estado.controlSuperior) return MODOS.CONTROL_SUPERIOR;
    return MODOS.INICIA;
  }

  function prepararCambioSeleccionPrincipal(config = {}) {
    const estado = estadoDesdeConfig(config);
    ejecutar(config.setSelectorInformesVisible, estado.enInformes);
    ejecutar(config.resetPresenciaActiva);
  }

  function ejecutarModoSeleccionPrincipal(modo, config = {}) {
    switch (modo) {
      case MODOS.CONTROL_MOVILES:
        return ejecutar(config.activarControlMoviles) || { ok: true, modo };

      case MODOS.FINALIZA:
        ejecutar(config.desactivarControlMoviles);
        return ejecutar(config.activarFinaliza) || { ok: true, modo };

      case MODOS.INFORMES_MENU:
        ejecutar(config.desactivarControlMoviles);
        return ejecutar(config.prepararMenuInformes) || { ok: true, modo };

      case MODOS.DECTO460:
        ejecutar(config.desactivarControlMoviles);
        return ejecutar(config.activarInformePorTipo, "DECTO460", config.refrescarContextoDecto460) || { ok: true, modo };

      case MODOS.ALCOHOLEMIA:
        ejecutar(config.desactivarControlMoviles);
        return ejecutar(config.activarInformePorTipo, "ALCOHOLEMIA", config.refrescarContextoAlcoholemia, {
          postActivar: config.postActivarAlcoholemia,
        }) || { ok: true, modo };

      case MODOS.CONTROL_SUPERIOR:
        ejecutar(config.desactivarControlMoviles);
        // Compatibilidad con el flujo legacy: antes de entrar a Control Superior
        // se apagaban explícitamente los formularios de Alcoholemia y Decto.
        // La visibilidad modular también lo hace, pero se conserva el gesto para
        // evitar residuos si falta algún módulo.
        ejecutar(config.limpiarInformesAntesControlSuperior);
        return ejecutar(config.activarInformePorTipo, "CONTROL_SUPERIOR", config.refrescarContextoControlSuperior) || { ok: true, modo };

      case MODOS.INICIA:
      default:
        ejecutar(config.desactivarControlMoviles);
        return ejecutar(config.activarInicia) || { ok: true, modo: MODOS.INICIA };
    }
  }

  function actualizarTipoPrincipal(config = {}) {
    const estado = crearEstadoSeleccionPrincipal(config);
    const configNormalizada = { ...config, __estadoSeleccionPrincipal: estado };
    prepararCambioSeleccionPrincipal(configNormalizada);
    const modo = resolverModoSeleccionPrincipal(configNormalizada);
    return ejecutarModoSeleccionPrincipal(modo, configNormalizada);
  }

  const api = {
    MODOS,
    crearEstadoSeleccionPrincipal,
    resolverModoSeleccionPrincipal,
    prepararCambioSeleccionPrincipal,
    ejecutarModoSeleccionPrincipal,
    actualizarTipoPrincipal,
  };

  window.WSP.ui.seleccionPrincipalFlujo = api;
  window.WSP.modules.seleccionPrincipalFlujoUi = api;
})();
