(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function setHidden(el, hidden) {
    if (!el) return;
    el.classList.toggle("hidden", !!hidden);
  }

  function setChecked(el, value) {
    if (!el) return;
    el.checked = !!value;
  }

  function setValue(el, value = "") {
    if (!el) return;
    el.value = value;
  }

  function limpiarErrorCampoSeguro(el) {
    if (!el) return;
    el.classList.remove("input-error");
    el.removeAttribute("aria-invalid");
  }

  function limpiarChecks(selector = 'input[type="checkbox"]', root = document) {
    Array.from(root?.querySelectorAll?.(selector) || []).forEach((el) => {
      el.checked = false;
      limpiarErrorCampoSeguro(el);
    });
  }

  function limpiarCamposTexto(selector = 'input[type="number"], input[type="text"], textarea', root = document) {
    Array.from(root?.querySelectorAll?.(selector) || []).forEach((el) => {
      el.value = "";
      limpiarErrorCampoSeguro(el);
    });
  }

  function limpiarFormularioDom(refs = {}, opts = {}) {
    const root = opts.root || document;

    if (opts.limpiarChecks !== false) limpiarChecks(opts.selectorChecks, root);
    if (opts.limpiarTextos !== false) limpiarCamposTexto(opts.selectorTextos, root);

    setValue(refs.textareaObs, "");
    limpiarErrorCampoSeguro(refs.textareaObs);
  }

  function ocultarBloquesDinamicosFinaliza(refs = {}) {
    setHidden(refs.divFinaliza, true);
    setHidden(refs.divDetalles, true);
    setHidden(refs.divMismosElementos, true);
    setHidden(refs.bloquePresenciaActiva, true);

    setChecked(refs.chkPresenciaActiva, false);
    setChecked(refs.chkMostrarResultadosFinaliza, false);

    setHidden(refs.bloquePositivosAlcoholimetro, true);
    setHidden(refs.wrapGraduacionesSancionable, true);
    setHidden(refs.wrapGraduacionesNoSancionable, true);
    setHidden(refs.unitGraduacionesSancionable, true);
    setHidden(refs.unitGraduacionesNoSancionable, true);
    setHidden(refs.wrapQrzCasilleros, true);
    setHidden(refs.wrapDominioCasilleros, true);
  }

  function limpiarSelectorOperativo(refs = {}, opts = {}) {
    const sel = refs.selHorario;
    if (!sel) return;

    const placeholder = String(opts.placeholder || "Seleccionar Operativo");
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    sel.value = "";
  }

  function prepararSelectorInformesMenu(refs = {}, opts = {}) {
    limpiarSelectorOperativo(refs, {
      placeholder: opts.placeholder || "Seleccione un informe para ver operativos iniciados",
    });

    if (typeof opts.actualizarContador === "function") {
      opts.actualizarContador(0);
    }
  }

  function resetBotonEnviar(refs = {}) {
    const btn = refs.btnEnviar;
    if (!btn) return;
    btn.classList.remove("hidden");
    btn.disabled = false;
    btn.style.display = "";
    if (!String(btn.textContent || "").trim()) {
      btn.textContent = "Enviar por WhatsApp";
    }
  }

  const api = {
    setHidden,
    setChecked,
    setValue,
    limpiarErrorCampoSeguro,
    limpiarChecks,
    limpiarCamposTexto,
    limpiarFormularioDom,
    ocultarBloquesDinamicosFinaliza,
    limpiarSelectorOperativo,
    prepararSelectorInformesMenu,
    resetBotonEnviar,
  };

  window.WSP.ui.transiciones = api;
  window.WSP.modules.transicionesUi = api;

  console.log("[WSP transiciones UI] cargado");
})();
