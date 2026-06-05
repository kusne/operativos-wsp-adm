(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function getEl(id) {
    return document.getElementById(id);
  }

  function defaultRefs() {
    return {
      bloquePersonal: getEl("bloquePersonal"),
      bloqueMovil: getEl("bloqueMovil"),
      labelObs: getEl("labelObs"),
      textareaObs: getEl("obs"),
      divFinaliza: getEl("finaliza"),
      divDetalles: getEl("bloqueDetalles"),
      divMismosElementos: getEl("bloqueMismosElementos"),
      bloquePresenciaActiva: getEl("bloquePresenciaActiva"),
    };
  }

  function withRefs(refs) {
    return Object.assign(defaultRefs(), refs || {});
  }

  function toggleHidden(el, visible) {
    if (!el) return;
    el.classList.toggle("hidden", !visible);
  }

  function setElementosVisibles(visible) {
    const ids = [
      "bloqueEscopeta",
      "bloqueHT",
      "bloquePDA",
      "bloqueImpresora",
      "bloqueAlometro",
      "bloqueAlcoholimetro",
    ];

    ids.forEach((id) => toggleHidden(getEl(id), !!visible));
  }

  function setPersonalVisible(visible, refs = {}) {
    const r = withRefs(refs);
    toggleHidden(r.bloquePersonal, !!visible);
  }

  function setMovilidadVisible(visible, refs = {}) {
    const r = withRefs(refs);
    toggleHidden(r.bloqueMovil, !!visible);
  }

  function setObservacionesVisible(visible, refs = {}) {
    const r = withRefs(refs);
    toggleHidden(r.labelObs, !!visible);
    toggleHidden(r.textareaObs, !!visible);
  }

  function setFinalizaVisible(visible, refs = {}) {
    const r = withRefs(refs);
    toggleHidden(r.divFinaliza, !!visible);
  }

  function setDetallesVisible(visible, refs = {}) {
    const r = withRefs(refs);
    toggleHidden(r.divDetalles, !!visible);
  }

  function setMismosElementosVisible(visible, refs = {}) {
    const r = withRefs(refs);
    toggleHidden(r.divMismosElementos, !!visible);
  }

  function setPresenciaActivaVisible(visible, refs = {}) {
    const r = withRefs(refs);
    toggleHidden(r.bloquePresenciaActiva, !!visible);
  }

  const api = {
    setElementosVisibles,
    setPersonalVisible,
    setMovilidadVisible,
    setObservacionesVisible,
    setFinalizaVisible,
    setDetallesVisible,
    setMismosElementosVisible,
    setPresenciaActivaVisible,
  };

  window.WSP.ui.operativo = api;
  window.WSP.modules.operativoUi = api;

  console.log("[WSP operativo UI] cargado");
})();
