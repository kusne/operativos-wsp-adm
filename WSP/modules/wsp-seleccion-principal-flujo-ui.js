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

  function modoDebeCerrarControlMoviles(modo) {
    return modo !== MODOS.CONTROL_MOVILES;
  }

  function prepararEjecucionModoSeleccionPrincipal(modo, config = {}) {
    if (modoDebeCerrarControlMoviles(modo)) ejecutar(config.desactivarControlMoviles);
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


  function modoEsInformeSeleccionPrincipal(modo) {
    return modo === MODOS.DECTO460 ||
      modo === MODOS.ALCOHOLEMIA ||
      modo === MODOS.CONTROL_SUPERIOR;
  }

  function tipoPantallaInformeDesdeModo(modo) {
    switch (modo) {
      case MODOS.DECTO460:
        return "DECTO460";
      case MODOS.ALCOHOLEMIA:
        return "ALCOHOLEMIA";
      case MODOS.CONTROL_SUPERIOR:
        return "CONTROL_SUPERIOR";
      default:
        return "";
    }
  }

  function refrescarContextoInformeDesdeModo(modo, config = {}) {
    switch (modo) {
      case MODOS.DECTO460:
        return config.refrescarContextoDecto460;
      case MODOS.ALCOHOLEMIA:
        return config.refrescarContextoAlcoholemia;
      case MODOS.CONTROL_SUPERIOR:
        return config.refrescarContextoControlSuperior;
      default:
        return null;
    }
  }

  function opcionesInformeDesdeModo(modo, config = {}) {
    if (modo === MODOS.ALCOHOLEMIA) {
      return { postActivar: config.postActivarAlcoholemia };
    }
    return undefined;
  }

  function prepararInformeAntesDeActivar(modo, config = {}) {
    if (modo === MODOS.CONTROL_SUPERIOR) {
      // Compatibilidad con el flujo legacy: antes de entrar a Control Superior
      // se apagaban explícitamente los formularios de Alcoholemia y Decto.
      // La visibilidad modular también lo hace, pero se conserva el gesto para
      // evitar residuos si falta algún módulo.
      ejecutar(config.limpiarInformesAntesControlSuperior);
    }
  }

  function ejecutarInformeSeleccionPrincipal(modo, config = {}) {
    if (!modoEsInformeSeleccionPrincipal(modo)) return { ok: false, modo, motivo: "modo_no_informe" };

    prepararInformeAntesDeActivar(modo, config);

    const tipoPantalla = tipoPantallaInformeDesdeModo(modo);
    const refrescarContexto = refrescarContextoInformeDesdeModo(modo, config);
    const opciones = opcionesInformeDesdeModo(modo, config);

    return ejecutar(config.activarInformePorTipo, tipoPantalla, refrescarContexto, opciones) || { ok: true, modo };
  }

  function modoEsBasicoSeleccionPrincipal(modo) {
    return modo === MODOS.CONTROL_MOVILES ||
      modo === MODOS.FINALIZA ||
      modo === MODOS.INFORMES_MENU ||
      modo === MODOS.INICIA;
  }

  function ejecutorModoBasicoDesdeModo(modo, config = {}) {
    switch (modo) {
      case MODOS.CONTROL_MOVILES:
        return config.activarControlMoviles;
      case MODOS.FINALIZA:
        return config.activarFinaliza;
      case MODOS.INFORMES_MENU:
        return config.prepararMenuInformes;
      case MODOS.INICIA:
      default:
        return config.activarInicia;
    }
  }

  function ejecutarModoBasicoSeleccionPrincipal(modo, config = {}) {
    const modoSeguro = modoEsBasicoSeleccionPrincipal(modo) ? modo : MODOS.INICIA;
    const ejecutarModo = ejecutorModoBasicoDesdeModo(modoSeguro, config);
    return ejecutar(ejecutarModo) || { ok: true, modo: modoSeguro };
  }

  function ejecutarModoSeleccionPrincipal(modo, config = {}) {
    prepararEjecucionModoSeleccionPrincipal(modo, config);

    if (modoEsInformeSeleccionPrincipal(modo)) {
      return ejecutarInformeSeleccionPrincipal(modo, config);
    }

    return ejecutarModoBasicoSeleccionPrincipal(modo, config);
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
    modoDebeCerrarControlMoviles,
    prepararEjecucionModoSeleccionPrincipal,
    modoEsInformeSeleccionPrincipal,
    tipoPantallaInformeDesdeModo,
    refrescarContextoInformeDesdeModo,
    opcionesInformeDesdeModo,
    prepararInformeAntesDeActivar,
    ejecutarInformeSeleccionPrincipal,
    modoEsBasicoSeleccionPrincipal,
    ejecutorModoBasicoDesdeModo,
    ejecutarModoBasicoSeleccionPrincipal,
    resolverModoSeleccionPrincipal,
    prepararCambioSeleccionPrincipal,
    ejecutarModoSeleccionPrincipal,
    actualizarTipoPrincipal,
  };

  window.WSP.ui.seleccionPrincipalFlujo = api;
  window.WSP.modules.seleccionPrincipalFlujoUi = api;
})();
