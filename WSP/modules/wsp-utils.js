(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.helpers = window.WSP.helpers || {};

  function normalizarTextoMayuscula(valor) {
    return String(valor || "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  function obtenerElemento(id) {
    return document.getElementById(id);
  }

  function mostrarElemento(elemento) {
    if (!elemento) return;
    elemento.classList.remove("hidden");
  }

  function ocultarElemento(elemento) {
    if (!elemento) return;
    elemento.classList.add("hidden");
  }

  function estaMarcado(elemento) {
    return !!(elemento && elemento.checked);
  }

  function valorInput(id) {
    const el = obtenerElemento(id);
    return el ? el.value : "";
  }

  function setValorInput(id, valor) {
    const el = obtenerElemento(id);
    if (!el) return;
    el.value = valor == null ? "" : String(valor);
  }

  window.WSP.helpers.normalizarTextoMayuscula = normalizarTextoMayuscula;
  window.WSP.helpers.obtenerElemento = obtenerElemento;
  window.WSP.helpers.mostrarElemento = mostrarElemento;
  window.WSP.helpers.ocultarElemento = ocultarElemento;
  window.WSP.helpers.estaMarcado = estaMarcado;
  window.WSP.helpers.valorInput = valorInput;
  window.WSP.helpers.setValorInput = setValorInput;

  console.log("[WSP utils] cargado");
})();
