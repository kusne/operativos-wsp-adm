(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function mostrarElemento(el, visible) {
    if (!el?.classList) return;
    el.classList.toggle("hidden", !visible);
  }

  function activarInicia(config = {}) {
    if (typeof config.desactivarPantallasInformes === "function") {
      config.desactivarPantallasInformes();
    }

    if (typeof config.aplicarPantallaExclusiva === "function") {
      config.aplicarPantallaExclusiva("INICIA", { mostrarFormularioBase: true });
    }

    if (typeof config.setTituloOperativosIniciados === "function") {
      config.setTituloOperativosIniciados(false);
    }

    if (typeof config.cargarOperativosDisponibles === "function") {
      config.cargarOperativosDisponibles(config.valorSeleccionado || "");
    }

    if (typeof config.actualizarDatosFranja === "function") {
      config.actualizarDatosFranja();
    }

    mostrarElemento(config.divFinaliza || null, false);
    mostrarElemento(config.divMismosElementos || null, false);

    if (config.chkMostrarResultadosFinaliza) {
      config.chkMostrarResultadosFinaliza.checked = false;
    }

    if (typeof config.actualizarVisibilidadBloquePresenciaActiva === "function") {
      config.actualizarVisibilidadBloquePresenciaActiva();
    }

    if (typeof config.actualizarVisibilidadResultadosFinaliza === "function") {
      config.actualizarVisibilidadResultadosFinaliza();
    }

    if (typeof config.desactivarControlesMismos === "function") {
      config.desactivarControlesMismos();
    }

    if (typeof config.ocultarResumenInformesIntermediosFinalizado === "function") {
      config.ocultarResumenInformesIntermediosFinalizado();
    }

    if (typeof config.sincronizarUIAlcoholimetro === "function") {
      config.sincronizarUIAlcoholimetro();
    }

    return { ok: true, modo: "INICIA" };
  }

  const api = {
    activarInicia,
  };

  window.WSP.ui.iniciaFlujo = api;
  window.WSP.modules.iniciaFlujoUi = api;
})();
