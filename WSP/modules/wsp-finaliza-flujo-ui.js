(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function mostrarElemento(el, visible) {
    if (!el?.classList) return;
    el.classList.toggle("hidden", !visible);
  }

  function sincronizarWidgetsAuxiliares(config = {}) {
    if (typeof config.sincronizarUIAlcoholimetro === "function") {
      config.sincronizarUIAlcoholimetro();
    }

    if (typeof config.sincronizarUIQrzDominio === "function") {
      config.sincronizarUIQrzDominio();
    }
  }

  function activarFinaliza(config = {}) {
    if (typeof config.aplicarPantallaExclusiva === "function") {
      config.aplicarPantallaExclusiva("FINALIZA");
    }

    if (typeof config.desactivarPantallasInformes === "function") {
      config.desactivarPantallasInformes();
    }

    if (typeof config.setSelectorInformesVisible === "function") {
      config.setSelectorInformesVisible(false);
    }

    if (typeof config.setTituloOperativosIniciados === "function") {
      config.setTituloOperativosIniciados(true);
    }

    mostrarElemento(config.divFinaliza || null, true);
    mostrarElemento(config.divMismosElementos || null, true);

    if (typeof config.actualizarVisibilidadBloquePresenciaActiva === "function") {
      config.actualizarVisibilidadBloquePresenciaActiva();
    }

    if (typeof config.actualizarVisibilidadResultadosFinaliza === "function") {
      config.actualizarVisibilidadResultadosFinaliza();
    }

    if (typeof config.desactivarControlesMismos === "function") {
      config.desactivarControlesMismos({ limpiar: true });
    }

    sincronizarWidgetsAuxiliares(config);

    const cargarOperativos = typeof config.cargarOperativosIniciados === "function"
      ? config.cargarOperativosIniciados
      : null;

    if (!cargarOperativos) {
      return Promise.resolve({ ok: false, motivo: "sin_cargar_operativos" });
    }

    return Promise.resolve(cargarOperativos(config.valorSeleccionado || "")).then(() => {
      if (typeof config.actualizarDatosFranja === "function") {
        config.actualizarDatosFranja();
      }

      if (typeof config.sincronizarInicioGuardadoSegunContexto === "function") {
        return config.sincronizarInicioGuardadoSegunContexto();
      }

      return { ok: true, modo: "FINALIZA" };
    });
  }

  const api = {
    activarFinaliza,
  };

  window.WSP.ui.finalizaFlujo = api;
  window.WSP.modules.finalizaFlujoUi = api;
})();
