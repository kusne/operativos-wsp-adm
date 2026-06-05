(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.ui.helpers = window.WSP.ui.helpers || {};

  function limpiarErrorCampo(el) {
    if (!el) return;
    el.classList.remove("input-error");
  }

  function marcarErrorCampo(el, mensaje) {
    if (el) {
      el.classList.add("input-error");
      try {
        el.focus({ preventScroll: false });
      } catch {
        try { el.focus(); } catch {}
      }
    }
    alert(mensaje);
    return false;
  }

  function leerEnteroNoNegativo(valor) {
    const n = parseInt(String(valor ?? "").trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function leerEnteroInput(el) {
    return leerEnteroNoNegativo(el?.value);
  }

  function formatearCantidad(n) {
    const v = Math.max(0, parseInt(n, 10) || 0);
    return String(v).padStart(2, "0");
  }

  function normalizarInputNoNegativo(el) {
    if (!el) return;

    const crudo = String(el.value || "").trim();
    if (!crudo) {
      limpiarErrorCampo(el);
      return;
    }

    const n = parseInt(crudo, 10);
    el.value = Number.isFinite(n) && n > 0 ? String(n) : "0";
    limpiarErrorCampo(el);
  }

  window.WSP.ui.helpers.limpiarErrorCampo = limpiarErrorCampo;
  window.WSP.ui.helpers.marcarErrorCampo = marcarErrorCampo;
  window.WSP.ui.helpers.leerEnteroNoNegativo = leerEnteroNoNegativo;
  window.WSP.ui.helpers.leerEnteroInput = leerEnteroInput;
  window.WSP.ui.helpers.formatearCantidad = formatearCantidad;
  window.WSP.ui.helpers.normalizarInputNoNegativo = normalizarInputNoNegativo;

  console.log("[WSP ui] cargado");
})();
