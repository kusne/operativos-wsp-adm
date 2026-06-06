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

  function listaModosSeleccionPrincipal() {
    return Object.values(MODOS);
  }

  function modoEsValidoSeleccionPrincipal(modo) {
    return listaModosSeleccionPrincipal().includes(modo);
  }

  function normalizarModoSeleccionPrincipal(modo) {
    return modoEsValidoSeleccionPrincipal(modo) ? modo : MODOS.INICIA;
  }

  function crearResultadoSeleccionPrincipal(modo, extra = {}) {
    return { ok: true, modo: normalizarModoSeleccionPrincipal(modo), ...extra };
  }

  function serializarErrorSeleccionPrincipal(error) {
    if (!error) return "";
    return error?.message ? String(error.message) : String(error);
  }

  function crearResultadoErrorSeleccionPrincipal(modo, error, extra = {}) {
    return {
      ok: false,
      modo: normalizarModoSeleccionPrincipal(modo),
      motivo: "error_ejecucion_seleccion_principal",
      error: serializarErrorSeleccionPrincipal(error),
      ...extra,
    };
  }

  function resultadoSeleccionPrincipalEsValido(resultado) {
    return !!(resultado && typeof resultado === "object");
  }

  function resultadoSeleccionPrincipalEsOk(resultado) {
    if (!resultadoSeleccionPrincipalEsValido(resultado)) return false;
    return resultado.ok !== false;
  }

  function resultadoSeleccionPrincipalDebeFallback(resultado) {
    return !resultadoSeleccionPrincipalEsOk(resultado);
  }

  function crearResultadoFallbackSeleccionPrincipal(modo, motivo = "fallback_legacy", extra = {}) {
    return {
      ok: false,
      modo: normalizarModoSeleccionPrincipal(modo),
      motivo,
      ...extra,
    };
  }

  function resultadoSeleccionPrincipalTieneModoValido(resultado) {
    return resultadoSeleccionPrincipalEsValido(resultado) &&
      modoEsValidoSeleccionPrincipal(resultado.modo);
  }

  function normalizarResultadoSeleccionPrincipal(resultado, modoFallback = MODOS.INICIA) {
    const modoSeguro = normalizarModoSeleccionPrincipal(modoFallback);

    if (!resultadoSeleccionPrincipalEsValido(resultado)) {
      return crearResultadoFallbackSeleccionPrincipal(modoSeguro, "resultado_modular_invalido");
    }

    return {
      ...resultado,
      modo: resultadoSeleccionPrincipalTieneModoValido(resultado)
        ? resultado.modo
        : modoSeguro,
    };
  }

  function marcarOrigenResultadoSeleccionPrincipal(resultado, origen = "modular", extra = {}) {
    if (!resultadoSeleccionPrincipalEsValido(resultado)) return resultado;
    return {
      ...resultado,
      origen: normalizarTexto(resultado.origen || origen),
      ...extra,
    };
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

    return ejecutar(config.activarInformePorTipo, tipoPantalla, refrescarContexto, opciones) || crearResultadoSeleccionPrincipal(modo);
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
    return ejecutar(ejecutarModo) || crearResultadoSeleccionPrincipal(modoSeguro);
  }

  function ejecutarModoSeleccionPrincipal(modo, config = {}) {
    const modoSeguro = normalizarModoSeleccionPrincipal(modo);
    prepararEjecucionModoSeleccionPrincipal(modoSeguro, config);

    if (modoEsInformeSeleccionPrincipal(modoSeguro)) {
      return ejecutarInformeSeleccionPrincipal(modoSeguro, config);
    }

    return ejecutarModoBasicoSeleccionPrincipal(modoSeguro, config);
  }

  function crearConfigNormalizadaSeleccionPrincipal(config = {}) {
    const estado = crearEstadoSeleccionPrincipal(config);
    return { ...config, __estadoSeleccionPrincipal: estado };
  }

  function crearResumenSeleccionPrincipal(config = {}) {
    const configNormalizada = crearConfigNormalizadaSeleccionPrincipal(config);
    const modo = resolverModoSeleccionPrincipal(configNormalizada);
    return {
      modo,
      estado: configNormalizada.__estadoSeleccionPrincipal,
      configNormalizada,
    };
  }

  function ejecutarSeleccionPrincipalDesdeConfig(config = {}) {
    const resumen = crearResumenSeleccionPrincipal(config);
    prepararCambioSeleccionPrincipal(resumen.configNormalizada);
    const resultado = ejecutarModoSeleccionPrincipal(resumen.modo, resumen.configNormalizada);
    return marcarOrigenResultadoSeleccionPrincipal(
      normalizarResultadoSeleccionPrincipal(resultado, resumen.modo),
      "modular"
    );
  }

  function ejecutarSeleccionPrincipalSeguro(config = {}) {
    let modo = MODOS.INICIA;
    try {
      const resumen = crearResumenSeleccionPrincipal(config);
      modo = resumen.modo;
      prepararCambioSeleccionPrincipal(resumen.configNormalizada);
      const resultado = ejecutarModoSeleccionPrincipal(modo, resumen.configNormalizada);
      return marcarOrigenResultadoSeleccionPrincipal(
        normalizarResultadoSeleccionPrincipal(resultado, modo),
        "modular"
      );
    } catch (error) {
      console.error("[WSP] Error en selección principal modular.", error);
      return marcarOrigenResultadoSeleccionPrincipal(
        crearResultadoErrorSeleccionPrincipal(modo, error),
        "modular"
      );
    }
  }

  function actualizarTipoPrincipal(config = {}) {
    return ejecutarSeleccionPrincipalSeguro(config);
  }

  const api = {
    MODOS,
    listaModosSeleccionPrincipal,
    modoEsValidoSeleccionPrincipal,
    normalizarModoSeleccionPrincipal,
    crearResultadoSeleccionPrincipal,
    serializarErrorSeleccionPrincipal,
    crearResultadoErrorSeleccionPrincipal,
    resultadoSeleccionPrincipalEsValido,
    resultadoSeleccionPrincipalEsOk,
    resultadoSeleccionPrincipalDebeFallback,
    crearResultadoFallbackSeleccionPrincipal,
    resultadoSeleccionPrincipalTieneModoValido,
    normalizarResultadoSeleccionPrincipal,
    marcarOrigenResultadoSeleccionPrincipal,
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
    crearConfigNormalizadaSeleccionPrincipal,
    crearResumenSeleccionPrincipal,
    ejecutarSeleccionPrincipalDesdeConfig,
    ejecutarSeleccionPrincipalSeguro,
    actualizarTipoPrincipal,
  };

  window.WSP.ui.seleccionPrincipalFlujo = api;
  window.WSP.modules.seleccionPrincipalFlujoUi = api;
})();
