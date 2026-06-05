(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};

  const TIPO_INFORMES = "INFORMES";
  const TIPO_CONTROL_SUPERIOR = "CONTROL SUPERIOR";

  function normalizar(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function getSelectTipo() {
    return document.getElementById("tipo");
  }

  function getSelectTipoInforme() {
    return document.getElementById("tipoInforme");
  }

  function optionCoincide(option, valorNormalizado) {
    return normalizar(option?.value) === valorNormalizado ||
      normalizar(option?.textContent) === valorNormalizado;
  }

  function asegurarOpcion(select, value, text) {
    if (!select) return null;

    const valorBuscado = normalizar(value);
    let existente = Array.from(select.options || []).find((opt) => optionCoincide(opt, valorBuscado));

    if (existente) {
      existente.value = value;
      existente.textContent = text;
      return existente;
    }

    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;

    // Insertar después del placeholder inicial si existe.
    if (select.options && select.options.length > 0) {
      select.insertBefore(option, select.options[1] || null);
    } else {
      select.appendChild(option);
    }

    return option;
  }

  function asegurarInformesEnSelectorPrincipal() {
    const selTipo = getSelectTipo();
    if (!selTipo) return null;
    return asegurarOpcion(selTipo, TIPO_INFORMES, "INFORMES");
  }

  function asegurarControlSuperiorDentroDeInformes() {
    const tipoInforme = getSelectTipoInforme();
    if (!tipoInforme) return null;
    return asegurarOpcion(tipoInforme, TIPO_CONTROL_SUPERIOR, TIPO_CONTROL_SUPERIOR);
  }

  function quitarControlSuperiorDelSelectorPrincipal() {
    const selTipo = getSelectTipo();
    if (!selTipo) return 0;

    const opciones = Array.from(selTipo.options || []);
    let removidas = 0;

    opciones.forEach((option) => {
      if (!optionCoincide(option, TIPO_CONTROL_SUPERIOR)) return;
      option.remove();
      removidas += 1;
    });

    return removidas;
  }

  function redirigirControlSuperiorLegacySiCorresponde() {
    const selTipo = getSelectTipo();
    const tipoInforme = getSelectTipoInforme();
    if (!selTipo || !tipoInforme) return false;

    if (normalizar(selTipo.value) !== TIPO_CONTROL_SUPERIOR) return false;

    asegurarInformesEnSelectorPrincipal();
    asegurarControlSuperiorDentroDeInformes();

    selTipo.value = TIPO_INFORMES;
    tipoInforme.value = TIPO_CONTROL_SUPERIOR;

    return true;
  }

  function normalizarSelectorInformes() {
    asegurarInformesEnSelectorPrincipal();
    asegurarControlSuperiorDentroDeInformes();

    // Si algún HTML viejo trae CONTROL SUPERIOR como opción principal, se elimina.
    // CONTROL SUPERIOR debe vivir dentro de INFORMES.
    redirigirControlSuperiorLegacySiCorresponde();
    const removidas = quitarControlSuperiorDelSelectorPrincipal();

    return {
      ok: true,
      controlSuperiorPrincipalRemovido: removidas,
      controlSuperiorEnInformes: !!Array.from(getSelectTipoInforme()?.options || [])
        .find((opt) => optionCoincide(opt, TIPO_CONTROL_SUPERIOR)),
    };
  }

  function instalarInterceptorSelectorPrincipal() {
    const selTipo = getSelectTipo();
    if (!selTipo || selTipo.__wspSelectorPrincipalNormalizado) return;

    selTipo.__wspSelectorPrincipalNormalizado = true;

    selTipo.addEventListener("change", () => {
      // Blindaje: si por HTML viejo, autocompletado del navegador o edición futura
      // vuelve a aparecer CONTROL SUPERIOR en el selector principal, lo mandamos a INFORMES.
      if (redirigirControlSuperiorLegacySiCorresponde()) {
        quitarControlSuperiorDelSelectorPrincipal();
      }
    }, true);
  }

  const diagnostico = normalizarSelectorInformes();
  instalarInterceptorSelectorPrincipal();

  window.WSP.ui.selector = {
    TIPO_INFORMES,
    TIPO_CONTROL_SUPERIOR,
    normalizarSelectorInformes,
    asegurarControlSuperiorDentroDeInformes,
    quitarControlSuperiorDelSelectorPrincipal,
    redirigirControlSuperiorLegacySiCorresponde,
    diagnosticar: normalizarSelectorInformes,
  };

  console.log("[WSP selector] cargado", diagnostico);
})();
