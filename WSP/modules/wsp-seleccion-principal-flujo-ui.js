(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function ejecutar(fn, ...args) {
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function actualizarTipoPrincipal(config = {}) {
    const enInformes = !!config.enInformes;
    const tipoInformeActivo = String(config.tipoInformeActivo || "").trim();
    const controlMoviles = !!config.controlMoviles;
    const controlSuperior = !!config.controlSuperior;
    const informeAlcoholemia = !!config.informeAlcoholemia;
    const informeDecto460 = !!config.informeDecto460;
    const fin = !!config.fin;

    ejecutar(config.setSelectorInformesVisible, enInformes);
    ejecutar(config.resetPresenciaActiva);

    if (controlMoviles) {
      return ejecutar(config.activarControlMoviles) || { ok: true, modo: "CONTROL_MOVILES" };
    }

    ejecutar(config.desactivarControlMoviles);

    if (fin) {
      return ejecutar(config.activarFinaliza) || { ok: true, modo: "FINALIZA" };
    }

    if (enInformes && !tipoInformeActivo) {
      return ejecutar(config.prepararMenuInformes) || { ok: true, modo: "INFORMES_MENU" };
    }

    if (informeDecto460) {
      return ejecutar(config.activarInformePorTipo, "DECTO460", config.refrescarContextoDecto460) || { ok: true, modo: "DECTO460" };
    }

    if (informeAlcoholemia) {
      return ejecutar(config.activarInformePorTipo, "ALCOHOLEMIA", config.refrescarContextoAlcoholemia, {
        postActivar: config.postActivarAlcoholemia,
      }) || { ok: true, modo: "ALCOHOLEMIA" };
    }

    // Compatibilidad con el flujo legacy: antes de entrar a Control Superior
    // se apagaban explícitamente los formularios de Alcoholemia y Decto.
    // La visibilidad modular también lo hace, pero se conserva el gesto para
    // evitar residuos si falta algún módulo.
    ejecutar(config.limpiarInformesAntesControlSuperior);

    if (controlSuperior) {
      return ejecutar(config.activarInformePorTipo, "CONTROL_SUPERIOR", config.refrescarContextoControlSuperior) || { ok: true, modo: "CONTROL_SUPERIOR" };
    }

    return ejecutar(config.activarInicia) || { ok: true, modo: "INICIA" };
  }

  const api = {
    actualizarTipoPrincipal,
  };

  window.WSP.ui.seleccionPrincipalFlujo = api;
  window.WSP.modules.seleccionPrincipalFlujoUi = api;
})();
