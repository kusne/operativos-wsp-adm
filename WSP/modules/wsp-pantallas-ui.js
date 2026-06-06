(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  const MODOS = Object.freeze({
    INICIA: "INICIA",
    FINALIZA: "FINALIZA",
    INFORMES_MENU: "INFORMES_MENU",
    CONTROL_SUPERIOR: "CONTROL_SUPERIOR",
    ALCOHOLEMIA: "ALCOHOLEMIA",
    DECTO460: "DECTO460",
    CONTROL_MOVILES: "CONTROL_MOVILES",
  });

  function setHidden(el, hidden) {
    if (!el) return;
    el.classList.toggle("hidden", !!hidden);
  }

  function setDisplay(el, value) {
    if (!el) return;
    el.style.display = value;
  }

  function setChecked(el, value) {
    if (!el) return;
    el.checked = !!value;
  }

  function ocultarResultadoFinalizaRefs(refs = {}) {
    setHidden(refs.bloqueMostrarResultadosFinaliza, true);
    setHidden(refs.tituloResultadosFinaliza, true);
    setHidden(refs.contenidoResultadosFinaliza, true);
    setHidden(refs.bloquePositivosAlcoholimetro, true);
    setHidden(refs.wrapGraduacionesSancionable, true);
    setHidden(refs.wrapGraduacionesNoSancionable, true);
    setHidden(refs.unitGraduacionesSancionable, true);
    setHidden(refs.unitGraduacionesNoSancionable, true);
    setHidden(refs.wrapQrzCasilleros, true);
    setHidden(refs.wrapDominioCasilleros, true);
  }

  function limpiarBodyModes(modo) {
    if (!document?.body) return;

    document.body.classList.toggle("modo-control-moviles", modo === MODOS.CONTROL_MOVILES);
    if (modo !== MODOS.CONTROL_MOVILES) {
      document.body.classList.remove("control-movil-seleccionado-activo");
    }

    document.body.classList.toggle("modo-control-superior", modo === MODOS.CONTROL_SUPERIOR);
    document.body.classList.toggle("modo-informe-alcoholemia", modo === MODOS.ALCOHOLEMIA);
    document.body.classList.toggle("modo-informe-decto460", modo === MODOS.DECTO460);
  }

  function ocultarPantallasNoActivas(modo, refs = {}) {
    setHidden(refs.bloqueControlMoviles, modo !== MODOS.CONTROL_MOVILES);
    setHidden(refs.bloqueControlSuperior, modo !== MODOS.CONTROL_SUPERIOR);
    setHidden(refs.bloqueInformeAlcoholemia, modo !== MODOS.ALCOHOLEMIA);
    setHidden(refs.bloqueInformeDecto460, modo !== MODOS.DECTO460);

    if (modo !== MODOS.FINALIZA) {
      setHidden(refs.divFinaliza, true);
      setHidden(refs.divDetalles, true);
      setHidden(refs.divMismosElementos, true);
      setHidden(refs.bloquePresenciaActiva, true);
      setChecked(refs.chkPresenciaActiva, false);
      setChecked(refs.chkMostrarResultadosFinaliza, false);
      ocultarResultadoFinalizaRefs(refs);
    }
  }

  function ocultarFormularioOperativoBase(refs = {}) {
    setHidden(refs.bloquePersonal, true);
    setHidden(refs.bloqueMovil, true);
    setHidden(refs.labelObs, true);
    setHidden(refs.textareaObs, true);
    [
      refs.bloqueEscopeta,
      refs.bloqueHT,
      refs.bloquePDA,
      refs.bloqueImpresora,
      refs.bloqueAlometro,
      refs.bloqueAlcoholimetro,
    ].forEach((el) => setHidden(el, true));
  }

  function restaurarBotonEnviarBase(refs = {}) {
    if (!refs.btnEnviar) return;
    refs.btnEnviar.classList.remove("hidden");
    refs.btnEnviar.disabled = false;
    setDisplay(refs.btnEnviar, "");
    if (!String(refs.btnEnviar.textContent || "").trim()) {
      refs.btnEnviar.textContent = "Enviar por WhatsApp";
    }
  }

  function aplicarPantallaExclusiva(modo, refs = {}, opts = {}) {
    const modoFinal = String(modo || MODOS.INICIA).toUpperCase();

    limpiarBodyModes(modoFinal);
    ocultarPantallasNoActivas(modoFinal, refs);

    if (modoFinal === MODOS.CONTROL_MOVILES) {
      ocultarFormularioOperativoBase(refs);
      setHidden(refs.bloqueInformeSelector, true);
      setHidden(refs.bloqueControlMoviles, false);
      if (refs.btnEnviar) {
        refs.btnEnviar.classList.remove("hidden");
        setDisplay(refs.btnEnviar, "");
      }
      return;
    }

    if (modoFinal === MODOS.INFORMES_MENU) {
      ocultarFormularioOperativoBase(refs);
      setHidden(refs.bloqueInformeSelector, false);
      restaurarBotonEnviarBase(refs);
      return;
    }

    if ([MODOS.ALCOHOLEMIA, MODOS.DECTO460, MODOS.CONTROL_SUPERIOR].includes(modoFinal)) {
      setHidden(refs.bloqueInformeSelector, false);
      setHidden(refs.divFinaliza, true);
      setHidden(refs.divDetalles, true);
      setHidden(refs.divMismosElementos, true);
      setHidden(refs.bloquePresenciaActiva, true);
      restaurarBotonEnviarBase(refs);
      return;
    }

    if (modoFinal === MODOS.FINALIZA) {
      setHidden(refs.bloqueInformeSelector, true);
      setHidden(refs.divFinaliza, false);
      setHidden(refs.divMismosElementos, false);
      restaurarBotonEnviarBase(refs);
      return;
    }

    // INICIA u otro modo operativo base.
    setHidden(refs.bloqueInformeSelector, true);
    setHidden(refs.divFinaliza, true);
    setHidden(refs.divDetalles, true);
    setHidden(refs.divMismosElementos, true);
    setHidden(refs.bloquePresenciaActiva, true);
    restaurarBotonEnviarBase(refs);

    if (opts.mostrarFormularioBase) {
      setHidden(refs.bloquePersonal, false);
      setHidden(refs.bloqueMovil, false);
      setHidden(refs.labelObs, false);
      setHidden(refs.textareaObs, false);
    }
  }

  const api = {
    MODOS,
    setHidden,
    aplicarPantallaExclusiva,
    ocultarPantallasNoActivas,
    ocultarFormularioOperativoBase,
  };

  window.WSP.ui.pantallas = api;
  window.WSP.modules.pantallasUi = api;

  console.log("[WSP pantallas UI] cargado");
})();
